"""'Circle the picture' extractor.

Production impl:
  1. Detect circles in the cropped image
     (cv2.HoughCircles, or simple contour-based ellipse detection).
  2. For each detected circle, find which `region` it overlaps and
     return that region's label.
  3. If multiple circles are detected, pick the largest / most confident.
  4. If none detected → blank.

Demo impl: keyed lookup.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


_DEMO = {
    "Q2-circle-1": "Triangle",
    "Q2-circle-2": "Square",
}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    key = f"{q.question_id}-circle-1"
    if key in _DEMO:
        return make_answer(
            question_id=q.question_id,
            answer=_DEMO[key],
            confidence=0.88,
            extractor="circle-detector-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="OpenCV HoughCircles + region-overlap (demo: hardcoded)",
            region_labels=[r.label for r in q.regions],
        )
    return make_answer(
        question_id=q.question_id,
        answer="(no circle detected)",
        confidence=0.0,
        extractor="circle-detector-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )