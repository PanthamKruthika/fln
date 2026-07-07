"""Multiple-choice (bubble) extractor.

Production impl:
  1. For each `region` in q.regions (one bubble per choice):
     - crop that region, binarize, compute fill density = dark px / total px
  2. The chosen bubble is whichever region has the highest density above
     a threshold (typically 0.25–0.35). Optionally apply a margin rule
     so we don't return a choice when no bubble is clearly filled.

Demo impl: keyed lookup like the handwriting one.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


_DEMO = {"Q8": "B", "Q13": "B"}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    if q.question_id in _DEMO:
        return make_answer(
            question_id=q.question_id,
            answer=_DEMO[q.question_id],
            confidence=0.94,
            extractor="mcq-bubble-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="OpenCV fill-density per bubble (demo: hardcoded)",
            choices=q.choices,
        )
    return make_answer(
        question_id=q.question_id,
        answer="",
        confidence=0.0,
        extractor="mcq-bubble-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )