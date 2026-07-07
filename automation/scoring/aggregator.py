"""Aggregator helpers: concept mastery + level progression + mistake patterns.

Mirrors SRS §9 Stage 3.
"""
from __future__ import annotations

from collections import defaultdict

from schemas import (
    ConceptMastery,
    EvaluationReport,
    LevelProgression,
    PerQuestionResult,
)


# --------------------------------------------------------------------------- #
# Concept mastery
# --------------------------------------------------------------------------- #

def aggregate_concept_mastery(per_question: list[PerQuestionResult]) -> list[ConceptMastery]:
    grouped: dict[str, list[PerQuestionResult]] = defaultdict(list)
    for r in per_question:
        grouped[r.topic].append(r)

    out: list[ConceptMastery] = []
    for topic, rows in sorted(grouped.items()):
        total = len(rows)
        correct = sum(1 for r in rows if r.is_correct) + 0.5 * sum(1 for r in rows if r.is_partial)
        pct = round((correct / total) * 100, 1) if total else 0.0
        out.append(ConceptMastery(
            topic=topic,
            total=total,
            correct=int(correct),
            mastery_pct=pct,
            band=_band(pct),
            subtopics=sorted({r.subtopic for r in rows if r.subtopic}),
        ))
    return out


def _band(pct: float) -> str:
    if pct >= 80:
        return "Strong"
    if pct >= 50:
        return "Developing"
    return "Needs Practice"


# --------------------------------------------------------------------------- #
# Strengths / weaknesses (top + bottom 3 topics)
# --------------------------------------------------------------------------- #

def derive_strengths_weaknesses(mastery: list[ConceptMastery]) -> tuple[list[str], list[str]]:
    if not mastery:
        return [], []
    ordered = sorted(mastery, key=lambda m: m.mastery_pct, reverse=True)
    strengths = [m.topic for m in ordered if m.mastery_pct >= 80][:3]
    weaknesses = [m.topic for m in ordered if m.mastery_pct < 50][:3]
    return strengths, weaknesses


# --------------------------------------------------------------------------- #
# Mistake patterns
# --------------------------------------------------------------------------- #

def detect_mistake_patterns(per_question: list[PerQuestionResult]) -> list[str]:
    patterns: list[str] = []
    wrong = [r for r in per_question if not r.is_correct and not r.is_partial]
    if not wrong:
        return ["No significant mistake patterns detected."]

    # Borrowing-style errors (subtraction that are exactly +10 or -10)
    borrows = sum(
        1 for r in wrong
        if r.topic.lower().startswith("subtraction")
        and r.expected.isdigit() and r.actual.isdigit()
        and abs(int(r.expected) - int(r.actual)) in {10, 20}
    )
    if borrows >= 2:
        patterns.append("Borrowing errors in subtraction (off by 10/20).")

    carry = sum(
        1 for r in wrong
        if r.topic.lower().startswith("addition")
        and r.expected.isdigit() and r.actual.isdigit()
        and abs(int(r.expected) - int(r.actual)) in {10, 20}
    )
    if carry >= 2:
        patterns.append("Carry errors in addition (off by 10/20).")

    fraction_wrong = [r for r in wrong if "fraction" in r.topic.lower()]
    if len(fraction_wrong) >= 2:
        patterns.append("Confusion with fraction representations.")

    money_wrong = [r for r in wrong if "money" in r.topic.lower()]
    if len(money_wrong) >= 2:
        patterns.append("Money / currency conversion errors.")

    if not patterns:
        patterns.append("Isolated errors across topics.")
    return patterns


# --------------------------------------------------------------------------- #
# Level progression
# --------------------------------------------------------------------------- #

# Crude mapping used by the demo (a real impl would load curriculum levels)
LEVEL_SCALE = ["L1", "L2", "L3", "L4", "L5"]


def next_level(level: str, delta: int) -> str:
    if level not in LEVEL_SCALE:
        return level
    idx = max(0, min(len(LEVEL_SCALE) - 1, LEVEL_SCALE.index(level) + delta))
    return LEVEL_SCALE[idx]


def determine_level_progression(
    score_pct: float,
    mastery: list[ConceptMastery],
    previous_level: str,
) -> LevelProgression:
    weak_topics = sum(1 for m in mastery if m.band == "Needs Practice")
    strong_topics = sum(1 for m in mastery if m.band == "Strong")

    if score_pct >= 80 and weak_topics == 0:
        return LevelProgression(
            previous_level=previous_level,
            recommended_level=next_level(previous_level, +1),
            level_changed=True,
            reason=f"Strong overall score ({score_pct}%) and no topic below 50% mastery.",
        )
    if score_pct < 50 and strong_topics <= 1:
        return LevelProgression(
            previous_level=previous_level,
            recommended_level=next_level(previous_level, -1),
            level_changed=previous_level != "L1",
            reason=f"Score {score_pct}% with weak concept mastery ({weak_topics} topics below 50%).",
        )
    return LevelProgression(
        previous_level=previous_level,
        recommended_level=previous_level,
        level_changed=False,
        reason=f"Score {score_pct}% — stay at current level and target weak topics.",
    )


# --------------------------------------------------------------------------- #
# Level-Flag rule (R-15): 50%+ students failed an easy question
# --------------------------------------------------------------------------- #

def level_flag_triggered(per_question: list[PerQuestionResult]) -> tuple[bool, list[str]]:
    flagged: list[str] = []
    for r in per_question:
        if r.difficulty != "easy":
            continue
        # Caller is expected to pass aggregated multi-student results
        # in real usage; this per-student check just returns false.
        continue
    return False, flagged


def level_flag_from_reports(reports: list[EvaluationReport], threshold: float = 0.5) -> list[str]:
    """Aggregate across many EvaluationReports; return question_ids flagged."""
    if not reports:
        return []
    per_q: dict[str, list[bool]] = defaultdict(list)
    for rep in reports:
        for r in rep.per_question:
            if r.difficulty == "easy":
                per_q[r.question_id].append(r.is_correct or r.is_partial)
    flagged: list[str] = []
    for qid, results in per_q.items():
        success_rate = sum(1 for x in results if x) / len(results)
        if success_rate < (1 - threshold):
            flagged.append(qid)
    return flagged