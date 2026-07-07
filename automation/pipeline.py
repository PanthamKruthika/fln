"""End-to-end pipeline orchestrator.

Wires together: ICR extraction → comparison → aggregation → narrative.
"""
from __future__ import annotations

from datetime import datetime, timezone

from schemas import (
    ConceptMastery,
    EvaluationReport,
    ExtractedSheet,
    PerQuestionResult,
    StudentAnswer,
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


def evaluate_student(
    sheet: ExtractedSheet,
    worksheet: WorksheetTemplate,
    previous_level: str = "L3",
    *,
    flagged_questions: set[str] | None = None,
) -> EvaluationReport:
    by_qid = {a.question_id: a for a in sheet.answers}

    per_question: list[PerQuestionResult] = []
    for q in worksheet.questions:
        student = by_qid.get(q.question_id)
        per_question.append(compare(q, student))

    overall_score = int(round(sum(r.points_earned for r in per_question)))
    total = len(per_question)
    score_pct = round((overall_score / total) * 100, 1) if total else 0.0

    mastery = aggregate_concept_mastery(per_question)
    strengths, weaknesses = derive_strengths_weaknesses(mastery)
    mistake_patterns = detect_mistake_patterns(per_question)

    progression = determine_level_progression(score_pct, mastery, previous_level)

    flagged = bool(flagged_questions and any(
        r.question_id in flagged_questions and r.difficulty == "easy" and not r.is_correct
        for r in per_question
    ))

    report = EvaluationReport(
        student_id=sheet.student_id,
        worksheet_id=worksheet.exam_id,
        cycle=worksheet.cycle,
        overall_score=overall_score,
        total_questions=total,
        score_pct=score_pct,
        per_question=per_question,
        concept_mastery=mastery,
        strengths=strengths,
        weaknesses=weaknesses,
        mistake_patterns=mistake_patterns,
        level_progression=progression,
        narrative="",                                  # filled below
        flagged_for_review=flagged,
        generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )
    report.narrative = generate_narrative(report)
    return report


def evaluate_class(
    sheets: list[ExtractedSheet],
    worksheet: WorksheetTemplate,
    previous_levels: dict[str, str] | None = None,
) -> list[EvaluationReport]:
    previous_levels = previous_levels or {}
    return [evaluate_student(s, worksheet, previous_levels.get(s.student_id, "L3"))
            for s in sheets]