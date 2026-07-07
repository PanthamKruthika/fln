"""'Tick the correct answer' extractor (checkboxes).

Production impl:
  1. For each `region` in q.regions (one box per option):
     - crop it, binarize, look for a dark blob in the centre.
     - A filled box has a high ink-density stroke in the middle
       (the ✓ shape). Empty box has only the surrounding square outline.
  2. The ticked box is the region whose inner-stroke density exceeds
     a threshold.

Demo impl: keyed lookup.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


_DEMO = {}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    if q.question_id in _DEMO:
        return make_answer(
            question_id=q.question_id,
            answer=_DEMO[q.question_id],
            confidence=0.90,
            extractor="tick-detector-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="OpenCV inner-stroke density per box (demo: hardcoded)",
            region_labels=[r.label for r in q.regions],
        )
    return make_answer(
        question_id=q.question_id,
        answer="(no tick detected)",
        confidence=0.0,
        extractor="tick-detector-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )