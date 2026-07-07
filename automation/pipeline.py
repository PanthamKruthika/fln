"""End-to-end extraction + marking pipeline.

Stage 1 — per-student extraction:
  PDF → images (pdf2image)
  For each question on each page:
    crop bbox  →  dispatch by qtype  →  ExtractedAnswer

Stage 2 — marking (delegates to scoring/aggregator + scoring/comparator).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from schemas import (
    EvaluationReport,
    ExtractedAnswer,
    ExtractedSheet,
    WorksheetTemplate,
)
from scoring.comparator import compare
from scoring.aggregator import (
    aggregate_concept_mastery,
    derive_strengths_weaknesses,
    detect_mistake_patterns,
    determine_level_progression,
)
from reports.narrative import generate_narrative

from extractors import run_extractor
from icr.pdf_converter import pdf_to_images
from icr.cropper import crop_bbox


DPI = 200


# --------------------------------------------------------------------------- #
# Stage 1: extract answers from a PDF
# --------------------------------------------------------------------------- #

def extract_sheet_from_pdf(
    pdf_path: str | Path,
    student_id: str,
    template: WorksheetTemplate,
) -> ExtractedSheet:
    """Convert the student's scanned PDF to per-page images, then for
    each question on each page: crop the bbox, dispatch to the right
    extractor, and bundle the results into an ExtractedSheet."""
    images = pdf_to_images(pdf_path, dpi=DPI)
    answers: list[ExtractedAnswer] = []

    for page_idx, image in enumerate(images, start=1):
        for q in template.questions:
            if q.page != page_idx:
                continue
            crop = crop_bbox(image, q.bbox, template.page_w, template.page_h, DPI)
            ans = run_extractor(q, crop, student_id=student_id, worksheet_id=template.worksheet_id)
            answers.append(ans)

    return ExtractedSheet(
        student_id=student_id,
        worksheet_id=template.worksheet_id,
        page=1,
        answers=answers,
    )


# --------------------------------------------------------------------------- #
# Stage 1 (testing): load answers from JSON (no PDF needed)
# --------------------------------------------------------------------------- #

def load_extracted_sheet(path: str | Path) -> ExtractedSheet:
    raw = json.loads(Path(path).read_text())
    return ExtractedSheet(**raw)


# --------------------------------------------------------------------------- #
# Stage 2: mark an extracted sheet against the answer key
# --------------------------------------------------------------------------- #

def evaluate_student(
    sheet: ExtractedSheet,
    template: WorksheetTemplate,
    previous_level: str = "L3",
) -> EvaluationReport:
    by_qid = {a.question_id: a for a in sheet.answers}

    per_question = []
    for q in template.questions:
        student_ans = by_qid.get(q.question_id)
        per_question.append(compare(q, student_ans))

    overall_score = int(round(sum(r.points_earned for r in per_question)))
    total = len(per_question)
    score_pct = round((overall_score / total) * 100, 1) if total else 0.0

    mastery = aggregate_concept_mastery(per_question)
    strengths, weaknesses = derive_strengths_weaknesses(mastery)
    mistake_patterns = detect_mistake_patterns(per_question)
    progression = determine_level_progression(score_pct, mastery, previous_level)

    report = EvaluationReport(
        student_id=sheet.student_id,
        worksheet_id=sheet.worksheet_id,
        cycle=template.cycle,
        overall_score=overall_score,
        total_questions=total,
        score_pct=score_pct,
        per_question=per_question,
        concept_mastery=mastery,
        strengths=strengths,
        weaknesses=weaknesses,
        mistake_patterns=mistake_patterns,
        level_progression=progression,
        narrative="",
        generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )
    report.narrative = generate_narrative(report)
    return report


def evaluate_class(
    sheets: list[ExtractedSheet],
    template: WorksheetTemplate,
    previous_levels: dict[str, str] | None = None,
) -> list[EvaluationReport]:
    previous_levels = previous_levels or {}
    return [evaluate_student(s, template, previous_levels.get(s.student_id, "L3"))
            for s in sheets]