"""Base interface for per-type extractors.

Each extractor is intentionally a thin function with one job:
  take a cropped image of a question + the question metadata,
  return an ExtractedAnswer.

Real implementations would call:
  - pytesseract.image_to_string   for handwriting
  - OpenCV HoughCircles          for circle detection
  - OpenCV HoughLinesP            for matching lines
  - OpenCV contour compare       for trace
  - a small CNN                   for drawing classification
"""
from __future__ import annotations

from schemas import ExtractedAnswer

Extractor = callable  # (question, crop, student_id, worksheet_id) -> ExtractedAnswer


def make_answer(question_id: str, answer: str, confidence: float, extractor: str,
               student_id: str, worksheet_id: str, **debug) -> ExtractedAnswer:
    return ExtractedAnswer(
        student_id=student_id,
        worksheet_id=worksheet_id,
        question_id=question_id,
        answer=answer,
        confidence=confidence,
        extractor=extractor,
        debug=debug,
    )