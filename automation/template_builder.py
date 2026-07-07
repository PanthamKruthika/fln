"""AI Assessment-template builder.

Flow
----
1. Node POSTs the uploaded PDF to /assessment-template/extract
   (multipart: pdf + grade + subject + academicYear).
2. Python converts PDF → images (pdf2image).
3. OCR pass — runs PaddleOCR if installed, otherwise a deterministic
   mock that produces realistic questions for a Class 1/2 paper.
4. Rule-based "AI analysis" step classifies each question into
   qtype/concept/difficulty/level/marks/correctAnswer.
5. Returns the structured template to Node.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from icr.pdf_converter import pdf_to_images


app = FastAPI(
    title="FLN Template Builder",
    version="0.1.0",
    description="PDF → OCR → AI question analysis",
)


# --------------------------------------------------------------------------- #
# OCR layer — try PaddleOCR, fall back to deterministic mock
# --------------------------------------------------------------------------- #

def _try_real_ocr(image):
    """Return list[str] of detected text lines. None if OCR engine
    isn't installed (the caller will fall back to mock)."""
    try:
        from paddleocr import PaddleOCR  # type: ignore
    except Exception:
        return None
    try:
        ocr = PaddleOCR(use_angle_cls=False, lang="en", show_log=False)
        result = ocr.ocr(image, cls=False)
        lines = []
        for page in result or []:
            for line in page or []:
                if len(line) >= 2 and line[1]:
                    lines.append(line[1][0])
        return lines
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# Rule-based AI analysis
# --------------------------------------------------------------------------- #

CONCEPT_KEYWORDS = {
    "Counting":      ["count", "how many", "dots", "objects", "fingers"],
    "Number Sense":  ["write the number", "what comes after", "before", "between", "compare", "bigger", "smaller", "number"],
    "Addition":      ["+", "plus", "add", "sum", "total", "more"],
    "Subtraction":   ["-", "minus", "subtract", "left", "away", "difference", "remaining"],
    "Patterns":      ["next", "pattern", "skip", "skip counting", "comes next"],
    "Shapes":        ["circle", "square", "triangle", "rectangle", "shape"],
    "Measurement":   ["long", "short", "tall", "big", "small", "heaviest", "lightest", "compare"],
    "Money":         ["rupee", "paise", "money", "coin", "note", "₹"],
    "Calendar and Time": ["clock", "time", "o'clock", "today", "yesterday", "tomorrow", "day", "month"],
    "Fractions":     ["fraction", "half", "quarter", "one-fourth", "/2"],
}

TYPE_PATTERNS = [
    ("multiple_choice", [r"\b[A-D]\b", r"\(A\)", r"\(B\)", r"\(C\)", r"\(D\)"]),
    ("matching",        [r"match", r"-----"]),
    ("circle",          [r"circle", r"ring around"]),
    ("tick",            [r"tick", r"check", r"put a ✓", r"mark"]),
    ("trace",           [r"trace", r"follow the dotted"]),
    ("drawing",         [r"draw a clock", r"draw", r"sketch"]),
    ("handwriting",     [r"write", r"fill in", r"answer is"]),
]

NUMBER_RE = re.compile(r"\b(\d+(?:\.\d+)?)\b")
ANSWER_HINT_RE = re.compile(
    r"(?:answer\s*(?:is)?\s*[:\-]?\s*|=\s*)(\d+(?:\.\d+)?|[A-D])\b",
    re.IGNORECASE,
)


def _classify_concept(text: str) -> str:
    text_l = text.lower()
    best, best_score = "Number Sense", 0
    for concept, kws in CONCEPT_KEYWORDS.items():
        score = sum(1 for k in kws if k in text_l)
        if score > best_score:
            best, best_score = concept, score
    return best


def _classify_type(text: str) -> str:
    for qtype, patterns in TYPE_PATTERNS:
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                return qtype
    return "number"


def _infer_difficulty(question_no: int, total: int) -> str:
    ratio = (question_no / max(total, 1))
    if ratio < 0.4:
        return "easy"
    if ratio < 0.75:
        return "medium"
    return "hard"


def _infer_level(grade: int) -> str:
    # 1-to-1 mapping for grades 1..5 → L1..L5
    grade = max(1, min(5, grade))
    return f"L{grade}"


def _suggest_correct_answer(text: str, qtype: str) -> str:
    """Best-effort guess. Real impl would call an LLM."""
    m = ANSWER_HINT_RE.search(text)
    if m:
        return m.group(1)
    nums = NUMBER_RE.findall(text)
    if nums and qtype in ("number", "handwriting"):
        return nums[-1]
    if qtype == "multiple_choice":
        m = re.search(r"\b([A-D])\b", text)
        if m:
            return m.group(1)
    return ""


def _suggest_options(text: str, qtype: str):
    if qtype == "multiple_choice":
        m = re.search(r"\(([A-D])\)\s*([A-Za-z0-9]+)", text)
        if m:
            return [{"label": m.group(1), "text": m.group(2)}]
        return [{"label": c, "text": ""} for c in "ABCD"]
    if qtype == "matching":
        pairs = re.findall(r"([A-Za-z]+)\s*-+\s*([A-Za-z]+)", text)
        if pairs:
            return [{"left": l, "right": r} for l, r in pairs]
    return None


def _analyze_question(text: str, question_no: int, total: int, grade: int) -> dict:
    return {
        "questionNo":     question_no,
        "questionText":    text.strip(),
        "questionType":    _classify_type(text),
        "concept":         _classify_concept(text),
        "difficulty":      _infer_difficulty(question_no, total),
        "level":           _infer_level(grade),
        "marks":           1,
        "correctAnswer":   _suggest_correct_answer(text, _classify_type(text)),
        "answerOptions":   _suggest_options(text, _classify_type(text)),
        "provenance":      "ai",
    }


# --------------------------------------------------------------------------- #
# Mock OCR (used when real OCR engine is unavailable)
# --------------------------------------------------------------------------- #

MOCK_QUESTIONS = [
    "Q1. Count the apples. ○○○○○ (write the answer)",
    "Q2. What comes after 29? ___",
    "Q3. Circle the bigger number: 47 or 74",
    "Q4. 12 + 5 = ___",
    "Q5. 23 + 18 = ___",
    "Q6. 45 - 7 = ___",
    "Q7. Raju has 25 mangoes. He gives 9 away. How many are left?",
    "Q8. Which shape has 3 sides? (A) Square (B) Triangle (C) Circle",
    "Q9. Tick the largest object: book  pencil  eraser",
    "Q10. How many rupees is 3 notes of 5 rupees?",
    "Q11. 1 rupee = ___ paise",
    "Q12. What is the missing number? 5, 10, ___, 20, 25",
    "Q13. What time is shown? Clock shows 3:00. (A) 1 o'clock (B) 3 o'clock (C) 5 o'clock",
    "Q14. How many sides does a rectangle have?",
    "Q15. Draw a clock showing 4 o'clock",
]


def _extract_lines(pdf_path: Path, *, grade: int) -> list[str]:
    """Try real OCR; fall back to the mock set if no engine or
    pdf2image can't read the file (e.g. poppler not installed)."""
    try:
        images = pdf_to_images(pdf_path, dpi=200)
    except Exception as e:
        print(f"[template_builder] pdf2image failed ({e}); using mock questions")
        return list(MOCK_QUESTIONS)
    lines: list[str] = []
    for img in images:
        real = _try_real_ocr(img)
        if real is not None:
            lines.extend(real)
        else:
            lines.extend(MOCK_QUESTIONS)
    if not lines:
        lines = list(MOCK_QUESTIONS)
    return lines


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #

class ExtractResponse(BaseModel):
    templateId: str
    questions: list[dict]
    totalQuestions: int
    totalMarks: int
    generatedAt: str
    source: str                     # "ocr" or "mock"
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
    raw_lines = _extract_lines(pdf_path, grade=grade)
    source = "ocr" if (raw_lines and raw_lines != MOCK_QUESTIONS) else "mock"

    # Group lines that look like questions (start with "Q" + number)
    question_re = re.compile(r"^\s*Q?\s*(\d+)[\.\)]\s*(.+)$", re.IGNORECASE)
    parsed = []
    for line in raw_lines:
        line = line.strip()
        m = question_re.match(line)
        if not m:
            continue
        parsed.append((int(m.group(1)), m.group(2)))

    # Fall back to mock if nothing parsed
    if not parsed:
        parsed = [(i + 1, q.split(".", 1)[1].strip())
                  for i, q in enumerate(MOCK_QUESTIONS)]
        source = "mock"

    parsed.sort(key=lambda t: t[0])
    total = len(parsed)
    questions = [_analyze_question(text, qno, total, grade)
                 for qno, text in parsed]

    return ExtractResponse(
        templateId=template_id or f"TEMP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        questions=questions,
        totalQuestions=total,
        totalMarks=sum(q["marks"] for q in questions),
        generatedAt=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        source=source,
        notes=(
            "Demo mode: deterministic mock OCR was used because no OCR engine is installed. "
            "Install paddleocr or pytesseract for real extraction."
            if source == "mock"
            else "Extracted with the available OCR engine."
        ),
    )


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "fln-template-builder", "version": app.version}