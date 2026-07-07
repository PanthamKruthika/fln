"""'Match the following' extractor.

Production impl:
  1. Detect straight lines in the cropped image
     (cv2.HoughLinesP, with minLineLength and maxLineGap tuned to
     classroom hand-drawn lines).
  2. For each detected line:
     - Find the leftmost endpoint → which `region` does it fall in?
     - Find the rightmost endpoint → which `region`?
     - Yield the pair (left_label, right_label).
  3. Group by left_label, dedupe.
  4. Return answer like "Rectangle-Door,Circle-Button" (sorted).

Demo impl: keyed lookup.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


_DEMO = {
    "Q3": "Rectangle-Door,Circle-Button",
}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    if q.question_id in _DEMO:
        return make_answer(
            question_id=q.question_id,
            answer=_DEMO[q.question_id],
            confidence=0.86,
            extractor="matching-line-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="OpenCV HoughLinesP + region-overlap (demo: hardcoded)",
            region_labels=[r.label for r in q.regions],
        )
    return make_answer(
        question_id=q.question_id,
        answer="(no lines detected)",
        confidence=0.0,
        extractor="matching-line-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )