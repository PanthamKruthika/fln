"""Narrative report generator.

Produces the AI-style narrative paragraph the Teacher/Volunteer/School
sees on the dashboard, mirroring the SRS §9 Stage 3 output.
"""
from __future__ import annotations

from schemas import EvaluationReport


def generate_narrative(report: EvaluationReport) -> str:
    pct = report.score_pct
    lp = report.level_progression
    s = []

    # Overall
    if pct >= 90:
        s.append(f"Excellent performance — {report.overall_score}/{report.total_questions} "
                 f"({pct:.0f}%). The student has a strong grasp of Class "
                 f"{report.cycle} material.")
    elif pct >= 75:
        s.append(f"Good performance — {report.overall_score}/{report.total_questions} "
                 f"({pct:.0f}%). Most concepts are within reach.")
    elif pct >= 50:
        s.append(f"Developing performance — {report.overall_score}/{report.total_questions} "
                 f"({pct:.0f}%). Some areas need focused practice.")
    else:
        s.append(f"Needs support — {report.overall_score}/{report.total_questions} "
                 f"({pct:.0f}%). Several foundational skills need reinforcement.")

    # Strengths
    if report.strengths:
        s.append(f"Strong areas: {', '.join(report.strengths)}.")

    # Weaknesses
    if report.weaknesses:
        s.append(f"Areas needing practice: {', '.join(report.weaknesses)}.")

    # Mistake patterns
    if report.mistake_patterns:
        s.append("Patterns observed: " + " ".join(report.mistake_patterns))

    # Level recommendation
    if lp.level_changed:
        s.append(f"Recommendation: move to {lp.recommended_level} ({lp.reason})")
    else:
        s.append(f"Recommendation: continue at {lp.recommended_level} ({lp.reason})")

    if report.flagged_for_review:
        s.append("Note: this student triggered a review flag (multiple easy items wrong).")

    return " ".join(s)