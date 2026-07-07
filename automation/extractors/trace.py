"""'Trace the path' extractor.

Production impl:
  1. Skeletonize the cropped image to a 1-px-wide stroke.
  2. Compare to the expected `expected_signature` (a serialized path
     or a small template image).
  3. Score with Hausdorff distance or stroke-coverage metric.
  4. Return match / partial / miss.

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
            confidence=0.80,
            extractor="trace-compare-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="Hausdorff distance vs expected signature (demo: hardcoded)",
        )
    return make_answer(
        question_id=q.question_id,
        answer="(trace not analysed)",
        confidence=0.0,
        extractor="trace-compare-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
        reason="no demo answer for this question id",
    )