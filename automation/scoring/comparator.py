"""Per-question answer comparison + scoring.

Handles the four answer types:
  - multiple_choice : exact letter match
  - number          : numeric match within ±tolerance
  - text            : case-insensitive, whitespace- and punctuation-tolerant
  - drawing         : placeholder; would compare CV-extracted signature

Also produces a partial-credit flag for number answers that are within
2× the tolerance but not exact.
"""
from __future__ import annotations

import re
import unicodedata

from schemas import ExtractedAnswer, PerQuestionResult, Question


def compare(question: Question, student: ExtractedAnswer | None) -> PerQuestionResult:
    if student is None or student.answer.strip() == "":
        return PerQuestionResult(
            question_id=question.question_id,
            topic=question.topic,
            subtopic=question.subtopic,
            difficulty=question.difficulty,
            expected=question.answer,
            actual="(blank)",
            is_correct=False,
            is_partial=False,
            points_earned=0.0,
            points_possible=1.0,
            confidence=student.confidence if student else 0.0,
            comment="No answer recorded",
        )

    actual = student.answer.strip()
    expected = question.answer.strip()

    if question.qtype == "multiple_choice":
        correct = actual.upper() == expected.upper()
        return PerQuestionResult(
            question_id=question.question_id,
            topic=question.topic,
            subtopic=question.subtopic,
            difficulty=question.difficulty,
            expected=expected,
            actual=actual,
            is_correct=correct,
            is_partial=False,
            points_earned=1.0 if correct else 0.0,
            points_possible=1.0,
            confidence=student.confidence,
            comment="" if correct else "Selected the wrong option",
        )

    if question.qtype == "number":
        actual_n = _to_number(actual)
        expected_n = _to_number(expected)
        if actual_n is None or expected_n is None:
            return PerQuestionResult(
                question_id=question.question_id,
                topic=question.topic,
                subtopic=question.subtopic,
                difficulty=question.difficulty,
                expected=expected,
                actual=actual,
                is_correct=False,
                is_partial=False,
                points_earned=0.0,
                points_possible=1.0,
                confidence=student.confidence,
                comment="Could not parse a number from the answer",
            )
        diff = abs(actual_n - expected_n)
        tol = max(question.tolerance, 1e-9)
        if diff <= tol:
            return PerQuestionResult(
                question_id=question.question_id,
                topic=question.topic, subtopic=question.subtopic,
                difficulty=question.difficulty,
                expected=expected, actual=actual,
                is_correct=True, is_partial=False,
                points_earned=1.0, points_possible=1.0,
                confidence=student.confidence,
                comment="Correct",
            )
        if diff <= 2 * tol:
            # Partial credit
            return PerQuestionResult(
                question_id=question.question_id,
                topic=question.topic, subtopic=question.subtopic,
                difficulty=question.difficulty,
                expected=expected, actual=actual,
                is_correct=False, is_partial=True,
                points_earned=0.5, points_possible=1.0,
                confidence=student.confidence,
                comment=f"Close — off by {diff:g}",
            )
        return PerQuestionResult(
            question_id=question.question_id,
            topic=question.topic, subtopic=question.subtopic,
            difficulty=question.difficulty,
            expected=expected, actual=actual,
            is_correct=False, is_partial=False,
            points_earned=0.0, points_possible=1.0,
            confidence=student.confidence,
            comment=f"Off by {diff:g}",
        )

    if question.qtype == "drawing":
        # Real impl would compare CV-extracted signature strings.
        # For the demo we accept any non-blank drawing as "Reviewed"
        # and treat drawing_missing as wrong.
        if actual == "drawing_missing":
            return PerQuestionResult(
                question_id=question.question_id,
                topic=question.topic, subtopic=question.subtopic,
                difficulty=question.difficulty,
                expected=expected, actual=actual,
                is_correct=False, is_partial=False,
                points_earned=0.0, points_possible=1.0,
                confidence=student.confidence,
                comment="No drawing detected",
            )
        return PerQuestionResult(
            question_id=question.question_id,
            topic=question.topic, subtopic=question.subtopic,
            difficulty=question.difficulty,
            expected=expected, actual=actual,
            is_correct=False, is_partial=False,
            points_earned=0.0, points_possible=1.0,
            confidence=student.confidence,
            comment="Drawing submitted — manual review recommended",
        )

    # text fallback
    norm_a = _normalize_text(actual)
    norm_e = _normalize_text(expected)
    correct = norm_a == norm_e
    return PerQuestionResult(
        question_id=question.question_id,
        topic=question.topic, subtopic=question.subtopic,
        difficulty=question.difficulty,
        expected=expected, actual=actual,
        is_correct=correct, is_partial=False,
        points_earned=1.0 if correct else 0.0, points_possible=1.0,
        confidence=student.confidence,
        comment="" if correct else "Spelling / wording differs",
    )


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _to_number(s: str) -> float | None:
    s = s.strip().replace(",", "")
    try:
        return float(s)
    except ValueError:
        return None


def _normalize_text(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", " ", s.lower())
    return s.strip()