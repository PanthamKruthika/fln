"""Drawing classifier extractor (e.g. 'Draw a clock showing 4:00').

Production impl: a small CNN (MobileNet / EfficientNet fine-tune) or
a CLIP zero-shot classifier, returning a label like 'clock_4oclock'.
Empty / missing drawings should return 'drawing_missing'.

Demo impl: keyed lookup.
"""
from __future__ import annotations

import numpy as np

from schemas import ExtractedAnswer, Question
from extractors._base import make_answer


_DEMO = {"Q15": "drawing_present"}


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    if q.question_id in _DEMO:
        return make_answer(
            question_id=q.question_id,
            answer=_DEMO[q.question_id],
            confidence=0.78,
            extractor="drawing-classifier-demo",
            student_id=student_id,
            worksheet_id=worksheet_id,
            method="CNN / CLIP (demo: hardcoded)",
        )
    return make_answer(
        question_id=q.question_id,
        answer="drawing_missing",
        confidence=0.0,
        extractor="drawing-classifier-demo",
        student_id=student_id,
        worksheet_id=worksheet_id,
    )