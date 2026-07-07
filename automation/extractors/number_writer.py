"""Numeric handwriting extractor.

Production impl: same as handwriting, then parse the OCR text to a
float and validate that it's a number (reject alphabetic noise).
"""
from extractors.handwriting import extract as handwriting_extract


def extract(q: Question, crop: np.ndarray, *, student_id: str, worksheet_id: str) -> ExtractedAnswer:
    answer = handwriting_extract(q, crop, student_id=student_id, worksheet_id=worksheet_id)
    answer.extractor = "number-ocr-demo"
    answer.debug["note"] = "inherits handwriting, validated as float in compare()"
    return answer