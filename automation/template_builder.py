"""AI Assessment-template builder.

Flow
----
1. Node POSTs the uploaded PDF to /assessment-template/extract
   (multipart: pdf + grade + subject + academicYear).
2. Python renders each PDF page as an image (PyMuPDF).
3. Image(s) are sent to Google Gemini (gemini-2.0-flash) which
   returns structured JSON of the questions it can read.
4. The heuristic post-processor enriches each question with
   concept / difficulty / level / marks / answerOptions.
5. Returns the structured template to Node.

If no GEMINI_API_KEY is set, falls back to:
   - PyMuPDF text extraction + heuristic parsing, or
   - the deterministic mock for image-only PDFs.
"""
from __future__ import annotations

import base64
import io
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel


sys.path.insert(0, str(Path(__file__).parent))


app = FastAPI(
    title="FLN Template Builder",
    version="0.3.0",
    description="PDF → image → Gemini vision → AI question analysis",
)


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash").strip()


# --------------------------------------------------------------------------- #
# Stage 1 — render PDF pages as PNG images (PyMuPDF)
# --------------------------------------------------------------------------- #

def render_pdf_pages_as_images(pdf_path: Path, dpi: int = 200) -> list[bytes]:
    """Return one PNG per page."""
    import fitz
    doc = fitz.open(str(pdf_path))
    images: list[bytes] = []
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    for page in doc:
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        images.append(pix.tobytes("png"))
    doc.close()
    return images


def extract_pdf_text(pdf_path: Path) -> tuple[str, str]:
    try:
        import fitz
    except Exception:
        return "", "pymupdf-missing"
    try:
        doc = fitz.open(str(pdf_path))
        chunks = [p.get_text("text") for p in doc]
        doc.close()
        return "\n".join(chunks).strip(), "pymupdf"
    except Exception as e:
        print(f"[template_builder] PyMuPDF text failed: {e}")
        return "", "pymupdf-error"


# --------------------------------------------------------------------------- #
# Stage 2 — Gemini vision call
# --------------------------------------------------------------------------- #

GEMINI_PROMPT = """You are an expert at reading student worksheets.

The attached image is a scanned page from an Indian primary-school
mathematics worksheet (Class {grade}, {subject}). Read every question
on the page carefully and return them as JSON.

Return ONLY this JSON shape, no prose, no markdown fences:

{{
  "questions": [
    {{
      "questionNo": 1,
      "questionText": "the full question text exactly as printed",
      "questionType": "number | handwriting | multiple_choice | circle | matching | tick | trace | drawing",
      "correctAnswer": "the answer, if visible on the page (number, letter, or short string). Empty string if not shown.",
      "answerOptions": [{{"label": "A", "text": "..."}}]   // only for multiple_choice / matching / circle / tick, else null
    }}
  ]
}}

Rules:
- questionNo counts from 1 within THIS page; the server merges pages
  and re-numbers consecutively.
- questionType guidance:
    number            — fill-in-the-blank with a single number answer
    handwriting       — student writes a word/short phrase
    multiple_choice   — has options A) B) C) D)
    circle            — student circles an object
    matching          — student draws lines connecting two columns
    tick              — student ticks one or more boxes
    trace             — student traces a dotted path
    drawing           — student draws a picture (clock, shape, etc.)
- answerOptions is required ONLY for multiple_choice / matching /
  circle / tick (give the choices / items the student sees).
- correctAnswer: best-effort. If a sample answer is printed next to
  the question (like "Ans: 5"), use that. Otherwise "".
- Do not invent questions. Only return what is actually on the page.
- If the page has no questions, return {{"questions": []}}.
"""


def call_gemini_on_pages(page_images: list[bytes], grade: int, subject: str) -> list[dict]:
    """Send all pages to Gemini as inline images; return merged
    list of {questionNo, questionText, questionType, correctAnswer,
    answerOptions} dicts across all pages."""
    if not GEMINI_API_KEY:
        return []
    try:
        from google import genai
        from google.genai import types
    except Exception as e:
        print(f"[template_builder] google-genai import failed: {e}")
        return []

    client = genai.Client(api_key=GEMINI_API_KEY)

    parts: list[types.Part] = [
        types.Part.from_text(
            text=GEMINI_PROMPT.format(grade=grade, subject=subject)
        )
    ]
    for img_bytes in page_images:
        parts.append(types.Part.from_bytes(data=img_bytes, mime_type="image/png"))

    try:
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=parts,
            config=types.GenerateContentConfig(
                temperature=0.0,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        print(f"[template_builder] Gemini call failed: {e}")
        return []

    raw = (resp.text or "").strip()
    # Strip any stray code fences just in case
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw)
        raw = re.sub(r"\s*```\s*$", "", raw)
    try:
        data = json.loads(raw)
    except Exception as e:
        print(f"[template_builder] Gemini JSON parse failed: {e}; raw={raw[:200]}")
        return []
    questions = data.get("questions", [])
    if not isinstance(questions, list):
        return []
    return questions


# --------------------------------------------------------------------------- #
# Stage 3 — heuristic enrichment (concept / difficulty / level / marks)
# --------------------------------------------------------------------------- #

CONCEPT_KEYWORDS = {
    "Counting":         ["count", "how many", "dots", "objects", "fingers", "tally", "stars"],
    "Number Sense":     ["write the number", "what comes after", "before", "between",
                         "compare", "bigger", "smaller", "number", "place value"],
    "Addition":         ["+", " plus ", " add ", "sum", "total", "more"],
    "Subtraction":      ["- ", " minus ", " subtract ", "left", "away", "difference",
                         "remaining", "give away", "left with"],
    "Patterns":         ["next", "pattern", "skip", "skip counting", "comes next",
                         "missing number"],
    "Shapes":           ["circle", "square", "triangle", "rectangle", "shape",
                         "round", "side"],
    "Measurement":      ["long", "short", "tall", "big", "small", "heaviest",
                         "lightest", "compare", "largest", "smallest", "heavier"],
    "Money":            ["rupee", "paise", "money", "coin", "note", "₹", "rs.", "inr"],
    "Calendar and Time":["clock", "time", "o'clock", "today", "yesterday",
                         "tomorrow", "day", "month", "year"],
    "Fractions":        ["fraction", "half", "quarter", "one-fourth", "/2", "numerator"],
    "Data Handling":    ["graph", "chart", "table", "tally", "data"],
}

NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def _classify_concept(text: str) -> str:
    text_l = text.lower()
    best, best_score = "Number Sense", 0
    for concept, kws in CONCEPT_KEYWORDS.items():
        score = sum(1 for k in kws if k in text_l)
        if score > best_score:
            best, best_score = concept, score
    return best


def _infer_difficulty(question_no: int, total: int) -> str:
    if total <= 1:
        return "easy"
    ratio = question_no / total
    if ratio < 0.4:
        return "easy"
    if ratio < 0.75:
        return "medium"
    return "hard"


def _infer_level(grade: int) -> str:
    grade = max(1, min(5, grade))
    return f"L{grade}"


def enrich(raw: dict, idx: int, total: int, grade: int) -> dict:
    text = (raw.get("questionText") or "").strip()
    qtype = (raw.get("questionType") or "number").strip()
    answer = (raw.get("correctAnswer") or "").strip()
    options = raw.get("answerOptions")  # may be None / list / dict
    return {
        "questionNo":     idx + 1,
        "questionText":    text,
        "questionType":    qtype,
        "concept":         _classify_concept(text),
        "difficulty":      _infer_difficulty(idx, total),
        "level":           _infer_level(grade),
        "marks":           1,
        "correctAnswer":   answer,
        "answerOptions":   options,
        "provenance":      "gemini-ai" if GEMINI_API_KEY else "ai",
    }


# --------------------------------------------------------------------------- #
# Heuristic fallback (text-only path, no LLM)
# --------------------------------------------------------------------------- #

QUESTION_HEADER_RE = re.compile(
    r"^\s*(?:Q\s*)?(\d+)[\.\)]\s*(.+?)(?=^\s*(?:Q\s*)?\d+[\.\)]|\Z)",
    re.IGNORECASE | re.MULTILINE | re.DOTALL,
)


def parse_questions_from_text(text: str) -> list[tuple[int, str]]:
    matches = QUESTION_HEADER_RE.findall(text)
    parsed: list[tuple[int, str]] = []
    seen: set[int] = set()
    for raw_no, body in matches:
        try:
            no = int(raw_no)
        except ValueError:
            continue
        body = " ".join(body.split()).strip()
        if len(body) < 4 or no in seen:
            continue
        seen.add(no)
        parsed.append((no, body))
    parsed.sort(key=lambda t: t[0])
    return parsed


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #

class ExtractResponse(BaseModel):
    templateId: str
    questions: list[dict]
    totalQuestions: int
    totalMarks: int
    generatedAt: str
    source: str
    notes: str = ""


@app.post("/assessment-template/extract", response_model=ExtractResponse)
async def extract_template(
    pdf: UploadFile = File(...),
    grade: int = Form(2),
    subject: str = Form("Numeracy"),
    academic_year: str = Form("2025-26"),
    template_id: str = Form(""),
) -> ExtractResponse:
    """Receive PDF + grade; return AI-extracted template JSON."""
    tmp_path = Path(f"/tmp/_uploaded_template.pdf")
    tmp_path.write_bytes(await pdf.read())
    try:
        return _build_response(
            tmp_path,
            grade=grade,
            subject=subject,
            academic_year=academic_year,
            template_id=template_id or None,
        )
    finally:
        try:
            tmp_path.unlink()
        except FileNotFoundError:
            pass


def _build_response(
    pdf_path: Path,
    *,
    grade: int,
    subject: str,
    academic_year: str,
    template_id: str | None,
) -> ExtractResponse:
    notes_parts: list[str] = []

    # 1. Render PDF pages as images
    try:
        page_images = render_pdf_pages_as_images(pdf_path, dpi=200)
    except Exception as e:
        print(f"[template_builder] PDF render failed: {e}")
        page_images = []

    raw_questions: list[dict] = []
    source = ""

    # 2. Prefer Gemini vision if API key + pages
    if GEMINI_API_KEY and page_images:
        raw_questions = call_gemini_on_pages(page_images, grade, subject)
        if raw_questions:
            source = f"gemini ({GEMINI_MODEL})"
            notes_parts.append(
                f"Questions extracted by Google Gemini ({GEMINI_MODEL}) vision model."
            )

    # 3. Fallback — PyMuPDF text + heuristic parsing
    if not raw_questions:
        text, src = extract_pdf_text(pdf_path)
        if text:
            parsed = parse_questions_from_text(text)
            if parsed:
                raw_questions = [
                    {"questionNo": n, "questionText": t,
                     "questionType": "number", "correctAnswer": "", "answerOptions": None}
                    for n, t in parsed
                ]
                source = f"{src} + heuristic"
                notes_parts.append(
                    "GEMINI_API_KEY not set; fell back to PyMuPDF text extraction + heuristic parsing."
                )
            else:
                notes_parts.append("Could not parse questions from the PDF text.")
        else:
            notes_parts.append("PDF text could not be extracted.")

    # 4. Enrich + renumber consecutively
    total = len(raw_questions)
    enriched = [enrich(q, i, total, grade) for i, q in enumerate(raw_questions)]

    if total == 0:
        notes_parts.append(
            "No questions detected. Make sure GEMINI_API_KEY is set or that the PDF has extractable text."
        )

    return ExtractResponse(
        templateId=template_id or f"TEMP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        questions=enriched,
        totalQuestions=total,
        totalMarks=sum(q["marks"] for q in enriched),
        generatedAt=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        source=source or "none",
        notes=" ".join(notes_parts),
    )


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "fln-template-builder",
        "version": app.version,
        "gemini_configured": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL,
    }