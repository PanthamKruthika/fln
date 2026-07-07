"""End-to-end CLI demo: run the pipeline on bundled sample data.

Usage (from repo root):
  automation/.venv/bin/python automation/test_pipeline.py

Prints each student's score, concept mastery, and the AI narrative.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from schemas import ExtractedSheet, WorksheetTemplate
from pipeline import evaluate_class
from scoring.aggregator import level_flag_from_reports


def hr(char: str = "─", n: int = 60) -> str:
    return char * n


def render(report) -> None:
    print(hr("═"))
    print(f"  Student:        {report.student_id}")
    print(f"  Worksheet:      {report.worksheet_id}  ({report.cycle})")
    print(f"  Score:          {report.overall_score}/{report.total_questions}  ({report.score_pct}%)")
    lp = report.level_progression
    arrow = "→" if lp.level_changed else "·"
    print(f"  Level:          {lp.previous_level} {arrow} {lp.recommended_level}  ({lp.reason})")
    print(hr())
    print("  Per-concept mastery")
    for m in report.concept_mastery:
        print(f"    - {m.topic:<22} {m.mastery_pct:>5.1f}%  [{m.band}]")
    print(hr())
    print("  Per-question results")
    for r in report.per_question:
        marker = "✓" if r.is_correct else ("~" if r.is_partial else "✗")
        print(f"    {marker} {r.question_id}  {r.topic:<22}  expected={r.expected!s:<10}  actual={r.actual!s:<12}  {r.comment}")
    print(hr())
    print("  Strengths:    " + ", ".join(report.strengths) or "—")
    print("  Weaknesses:   " + ", ".join(report.weaknesses) or "—")
    print("  Patterns:     " + " | ".join(report.mistake_patterns))
    print(hr())
    print("  Narrative:")
    print("    " + report.narrative)
    print()


def main() -> int:
    key = json.loads((ROOT / "sample" / "answer_key.json").read_text())
    sheets_raw = json.loads((ROOT / "sample" / "scanned_sheets.json").read_text())

    worksheet = WorksheetTemplate(**key)
    sheets = [ExtractedSheet(**s) for s in sheets_raw]
    previous_levels = {"STU-001": "L3", "STU-002": "L3", "STU-003": "L2"}

    reports = evaluate_class(sheets, worksheet, previous_levels)
    flagged = level_flag_from_reports(reports)

    print(hr("═"))
    print("  FLN Evaluation Pipeline · Demo Run")
    print(hr("═"))
    print(f"  {len(sheets)} student sheets evaluated against {worksheet.total_questions}-question paper")
    print(f"  Level-Flag (R-15) flagged questions: {flagged or '—'}")
    print()

    for r in reports:
        render(r)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())