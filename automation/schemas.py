"""Pydantic schemas for the FLN evaluation pipeline.

Mirrors the SRS §12.1 Worksheet JSON schema and the
EvaluationReport / AnswerSubmission shapes in docs/db-schema.md.
"""
from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# Question  (mirrors SRS §12.1)
# --------------------------------------------------------------------------- #

AnswerType = Literal["number", "text", "multiple_choice", "drawing"]
Difficulty = Literal["easy", "medium", "hard"]


class Question(BaseModel):
    question_id: str
    question: str
    answer: str                            # expected answer
    answer_type: AnswerType = "number"
    topic: str                             # "Number Sense", "Fractions", ...
    subtopic: str = ""
    difficulty: Difficulty = "easy"
    source_level: str = "Class 2"
    class_level: int = 2
    reasoning: str = ""

    # Numeric only — ±tolerance (e.g. 0 for exact, 0.5 for money)
    tolerance: float = 0.0

    # MCQ only — letters the student can choose from
    choices: list[str] = Field(default_factory=list)

    # Drawing only — expected asset / shape signature (compared by CV)
    expected_signature: str | None = None


class WorksheetTemplate(BaseModel):
    exam_id: str
    class_level: int
    total_questions: int
    cycle: Literal["Baseline", "Mid-Year", "End-Year"] = "Mid-Year"
    questions: list[Question]


# --------------------------------------------------------------------------- #
# Student answer  (output of ICR/OCR)
# --------------------------------------------------------------------------- #

class StudentAnswer(BaseModel):
    student_id: str
    question_id: str
    answer: str                            # raw extracted text
    confidence: float = 1.0               # OCR confidence 0–1
    page: int | None = None


class ExtractedSheet(BaseModel):
    student_id: str
    page: int
    answers: list[StudentAnswer]


# --------------------------------------------------------------------------- #
# Per-question result + final report
# --------------------------------------------------------------------------- #

class PerQuestionResult(BaseModel):
    question_id: str
    topic: str
    subtopic: str
    difficulty: Difficulty
    expected: str
    actual: str
    is_correct: bool
    is_partial: bool
    points_earned: float
    points_possible: float
    confidence: float
    comment: str = ""


class ConceptMastery(BaseModel):
    topic: str
    total: int
    correct: int
    mastery_pct: float            # 0–100
    band: Literal["Strong", "Developing", "Needs Practice"]
    subtopics: list[str] = Field(default_factory=list)


class LevelProgression(BaseModel):
    previous_level: str
    recommended_level: str
    level_changed: bool
    reason: str


class EvaluationReport(BaseModel):
    student_id: str
    worksheet_id: str
    cycle: str

    overall_score: int                       # raw correct count
    total_questions: int
    score_pct: float                        # 0–100

    per_question: list[PerQuestionResult]
    concept_mastery: list[ConceptMastery]
    strengths: list[str]
    weaknesses: list[str]
    mistake_patterns: list[str]

    level_progression: LevelProgression
    narrative: str
    flagged_for_review: bool = False        # 50%+ easy-failure rule

    generated_at: str                       # ISO timestamp