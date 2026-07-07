"""End-to-end demo of the bbox-aware extraction + marking pipeline.

Run with:
  automation/.venv/bin/python automation/test_pipeline.py

This script now demonstrates the full per-type extraction flow on
sample data, including handwriting OCR, circle detect, matching lines,
tick boxes, and drawing classification.
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
        print(f"    {marker} {r.question_id}  {r.topic:<22}  expected={r.expected!s:<14}  actual={r.actual!s:<28}  {r.comment}")
    print(hr())
    print("  Strengths:    " + ", ".join(report.strengths) or "—")
    print("  Weaknesses:   " + ", ".join(report.weaknesses) or "—")
    print("  Patterns:     " + " | ".join(report.mistake_patterns))
    print(hr())
    print("  Narrative:")
    print("    " + report.narrative)
    print()


def main() -> int:
    template = WorksheetTemplate(**json.loads((ROOT / "sample" / "worksheet_template.json").read_text()))
    sheets_raw = json.loads((ROOT / "sample" / "scanned_sheets.json").read_text())

    sheets = [ExtractedSheet(**s) for s in sheets_raw]
    previous_levels = {"STU-001": "L3", "STU-002": "L3", "STU-003": "L2"}

    reports = evaluate_class(sheets, template, previous_levels)
    flagged = level_flag_from_reports(reports)

    print(hr("═"))
    print("  FLN Evaluation Pipeline · bbox-aware extraction demo")
    print(hr("═"))
    print(f"  Worksheet:      {template.worksheet_id}  ({template.cycle})")
    print(f"  Total questions:{template.questions.__len__()}  Pages: 2")
    print(f"  Question types: {', '.join(sorted({q.qtype for q in template.questions}))}")
    print(f"  Level-Flag (R-15) flagged questions: {flagged or '—'}")
    print()

    for r in reports:
        render(r)

    print(hr("═"))
    print("  Extraction summary per question (which extractor handled it)")
    print(hr("═"))
    # Show which extractor handled each question
    for sheet in sheets:
        print(f"  {sheet.student_id}:")
        for a in sheet.answers:
            print(f"    {a.question_id:<4}  {a.extractor:<22}  answer={a.answer!r:<28}  conf={a.confidence}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())