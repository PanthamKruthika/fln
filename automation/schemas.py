"""Pydantic schemas for the FLN evaluation pipeline.

Question types are modeled on what a real Class 2–4 Math paper can
contain, with separate processing rules per type:

  handwriting        OCR  → text answer
  number             OCR  → numeric answer (tolerance-checked)
  multiple_choice    OCR + bubble-detect  → letter
  circle             OpenCV circle detect  → enclosed shape name
  matching           OpenCV line detect    → "A-D, B-E, C-F" pairs
  tick               OpenCV tick detect    → ticked option label
  trace              OpenCV path compare   → match / partial / miss
  drawing            image classifier      → label of what was drawn
"""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


QuestionType = Literal[
    "handwriting",
    "number",
    "multiple_choice",
    "circle",
    "matching",
    "tick",
    "trace",
    "drawing",
]
Difficulty = Literal["easy", "medium", "hard"]


# --------------------------------------------------------------------------- #
# Geometry primitives
# --------------------------------------------------------------------------- #

class BBox(BaseModel):
    """Bounding box: x, y are top-left, in PDF coordinate space (points)."""
    x: float
    y: float
    width: float
    height: float

    def clamp_to(self, page_w: float, page_h: float) -> "BBox":
        return BBox(
            x=max(0, self.x),
            y=max(0, self.y),
            width=min(self.width, page_w - self.x),
            height=min(self.height, page_h - self.y),
        )


class Region(BaseModel):
    """A labelled region inside a question (e.g. a single MCQ bubble,
    one option in a matching list, one tickbox). Used by circle/matching/
    tick extractors to map a detected mark back to its option label."""
    label: str
    bbox: BBox


# --------------------------------------------------------------------------- #
# Question
# --------------------------------------------------------------------------- #

class Question(BaseModel):
    question_id: str
    question: str
    answer: str                            # expected answer string
    qtype: QuestionType = "number"
    topic: str
    subtopic: str = ""
    difficulty: Difficulty = "easy"
    source_level: str = "Class 2"
    class_level: int = 2
    reasoning: str = ""

    # Where the question sits on the page (in PDF coordinates)
    bbox: BBox
    page: int = 1

    # Numeric only
    tolerance: float = 0.0

    # MCQ — letters the student can choose from
    choices: list[str] = Field(default_factory=list)

    # Matching / circle / tick — labelled sub-regions the extractor maps
    regions: list[Region] = Field(default_factory=list)

    # Trace — expected path signature
    expected_signature: str | None = None


class WorksheetTemplate(BaseModel):
    """A complete worksheet layout. `page_w` / `page_h` are PDF dimensions
    in points so bbox coordinates are unambiguous."""
    worksheet_id: str
    exam_id: str
    class_level: int
    cycle: Literal["Baseline", "Mid-Year", "End-Year"] = "Mid-Year"
    page_w: float = 595.0      # A4 width in points
    page_h: float = 842.0      # A4 height in points
    questions: list[Question]


# --------------------------------------------------------------------------- #
# Extraction results (output of the per-type extractor)
# --------------------------------------------------------------------------- #

class ExtractedAnswer(BaseModel):
    student_id: str
    worksheet_id: str
    question_id: str
    answer: str                            # raw extracted value
    confidence: float = 1.0
    extractor: str = ""                    # which extractor produced this
    debug: dict = Field(default_factory=dict)


class ExtractedSheet(BaseModel):
    student_id: str
    worksheet_id: str
    page: int
    answers: list[ExtractedAnswer]


# --------------------------------------------------------------------------- #
# Marking + report (unchanged from before)
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
    mastery_pct: float
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
    overall_score: int
    total_questions: int
    score_pct: float
    per_question: list[PerQuestionResult]
    concept_mastery: list[ConceptMastery]
    strengths: list[str]
    weaknesses: list[str]
    mistake_patterns: list[str]
    level_progression: LevelProgression
    narrative: str
    flagged_for_review: bool = False
    generated_at: str