"""Mock ICR/OCR + answer-extraction pipeline.

In production this would:
  1. Open the scanned PDF (PyMuPDF / pdfplumber)
  2. Split pages by student ID printed on each answer sheet header
  3. Run Tesseract OCR on each page
  4. Use a small CV classifier for drawing questions

For the demo we accept a JSON file already shaped like the OCR output.
The shape mirrors what `tesseract --psm 6` + a small layout-parser would
produce per student.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from schemas import ExtractedSheet, StudentAnswer


def load_extracted_sheets(path: str | Path) -> list[ExtractedSheet]:
    """Load OCR output (already produced by a real scanner in production)."""
    raw = json.loads(Path(path).read_text())
    return [ExtractedSheet(**s) for s in raw]


# --------------------------------------------------------------------------- #
# Tiny "OCR" simulator — useful when running the CLI without a real scan
# --------------------------------------------------------------------------- #

def simulate_ocr_sheet(student_id: str, worksheet, *, accuracy: float = 0.85) -> ExtractedSheet:
    """Generate a synthetic student sheet where some answers are correct,
    some wrong, some blank — roughly matching `accuracy`.

    Helpful for end-to-end demos without a real PDF.
    """
    import random
    rng = random.Random(hash(student_id) & 0xFFFF)
    answers: list[StudentAnswer] = []
    for q in worksheet.questions:
        if rng.random() > accuracy:
            # Wrong answer — choose something near or unrelated
            wrong = _plausible_wrong(q.answer, q.answer_type, rng)
            answers.append(StudentAnswer(student_id=student_id, question_id=q.question_id,
                                        answer=wrong, confidence=round(rng.uniform(0.55, 0.85), 2)))
        else:
            answers.append(StudentAnswer(student_id=student_id, question_id=q.question_id,
                                        answer=q.answer, confidence=round(rng.uniform(0.85, 0.99), 2)))
    return ExtractedSheet(student_id=student_id, page=1, answers=answers)


def _plausible_wrong(expected: str, answer_type: str, rng) -> str:
    if answer_type == "multiple_choice":
        return rng.choice([c for c in "ABCD" if c != expected] or ["B"])
    if answer_type == "number":
        try:
            n = float(expected)
            delta = rng.choice([-3, -2, -1, 1, 2, 3])
            return str(int(n + delta))
        except ValueError:
            return expected[::-1] or "0"
    if answer_type == "drawing":
        return "drawing_missing"
    # text fallback — minor typo
    if len(expected) > 3 and rng.random() < 0.5:
        idx = rng.randrange(len(expected))
        return expected[:idx] + expected[idx + 1:]
    return expected + "X"


# --------------------------------------------------------------------------- #
# Helpers (could be replaced by a real PDF splitter)
# --------------------------------------------------------------------------- #

NUMERIC_RE = re.compile(r"^-?\d+(?:\.\d+)?$")


def looks_numeric(s: str) -> bool:
    return bool(NUMERIC_RE.match(s.strip()))