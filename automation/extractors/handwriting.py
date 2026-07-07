"""Handwriting OCR extractor.

Production impl: pytesseract.image_to_string(crop, config='--psm 7')
                (single-line mode) or PaddleOCR for non-Latin scripts.

Demo impl: a tiny pre-baked answer book keyed by question_id, so the
end-to-end pipeline is runnable without a real OCR engine.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


# Demo answer book — in production this comes from OCR.
_DEMO = {
    "Q1":  "10",
    "Q2":  "30",
    "Q3":  "74",
    "Q4":  "17",
    "Q5":  "41",
    "Q6":  "38",
    "Q7":  "16",
    "Q8":  "B",
    "Q9":  "book",
    "Q10": "15",
    "Q11": "100",
    "Q12": "15",
    "Q13": "B",
    "Q14": "4",
    "Q15": "drawing_present",
}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    if q.question_id in _DEMO:
        text = _DEMO[q.question_id]
        return make_answer(
            question_id=q.question_id,
            answer=text,
            confidence=0.92,
            extractor="handwriting-ocr-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="pytesseract (demo: hardcoded)",
            crop_shape=list(crop.shape),
        )
    return make_answer(
        question_id=q.question_id,
        answer="",
        confidence=0.0,
        extractor="handwriting-ocr-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )