"""Extracted-answer dispatch table.

Each extractor takes the cropped image of one question plus the
question metadata and returns an ExtractedAnswer.

This module's job is to pick the right extractor based on `qtype`.
The extractors themselves live in their own files so they can be
swapped independently (real OCR vs mock, Tesseract vs PaddleOCR, etc.).
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors.handwriting import extract as extract_handwriting
from extractors.number_writer import extract as extract_number
from extractors.multiple_choice import extract as extract_mcq
from extractors.circle import extract as extract_circle
from extractors.matching import extract as extract_matching
from extractors.tick import extract as extract_tick
from extractors.trace import extract as extract_trace
from extractors.drawing import extract as extract_drawing


def run_extractor(
    q: Question,
    crop: np.ndarray,
    student_id: str,
    worksheet_id: str,
) -> ExtractedAnswer:
    """Dispatch to the right per-type extractor."""
    common = dict(student_id=student_id, worksheet_id=worksheet_id)

    match q.qtype:
        case "handwriting":     return extract_handwriting(q, crop, **common)
        case "number":          return extract_number(q, crop, **common)
        case "multiple_choice": return extract_mcq(q, crop, **common)
        case "circle":          return extract_circle(q, crop, **common)
        case "matching":         return extract_matching(q, crop, **common)
        case "tick":            return extract_tick(q, crop, **common)
        case "trace":           return extract_trace(q, crop, **common)
        case "drawing":         return extract_drawing(q, crop, **common)
        case _:
            return ExtractedAnswer(
                question_id=q.question_id,
                answer="(unsupported type)",
                confidence=0.0,
                extractor="none",
                debug={"reason": f"unknown qtype {q.qtype!r}"},
                **common,
            )