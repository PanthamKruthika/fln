"""FastAPI app exposing the FLN evaluation pipeline.

Endpoints:
  GET  /health
  POST /evaluate          — accepts scanned sheets JSON + worksheet template
  POST /evaluate/synthetic — runs the demo on bundled sample data
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from schemas import (
    EvaluationReport,
    ExtractedSheet,
    WorksheetTemplate,
)
from pipeline import evaluate_class, evaluate_student
from scoring.aggregator import level_flag_from_reports

app = FastAPI(
    title="FLN Evaluation Service",
    version="0.1.0",
    description="AI worksheet generation + evaluation pipeline (SRS §5, §9)",
)

SAMPLE_DIR = Path(__file__).parent / "sample"


# --------------------------------------------------------------------------- #
# Schemas for HTTP
# --------------------------------------------------------------------------- #

class EvaluateRequest(BaseModel):
    sheets: list[ExtractedSheet]
    worksheet: WorksheetTemplate
    previous_levels: dict[str, str] | None = None


class EvaluateResponse(BaseModel):
    reports: list[EvaluationReport]
    flagged_questions: list[str]


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #

@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "fln-automation", "version": app.version}


@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    if not req.sheets:
        raise HTTPException(status_code=400, detail="sheets must not be empty")
    if not req.worksheet.questions:
        raise HTTPException(status_code=400, detail="worksheet must contain questions")

    reports = evaluate_class(req.sheets, req.worksheet, req.previous_levels or {})
    flagged = level_flag_from_reports(reports)
    return EvaluateResponse(reports=reports, flagged_questions=flagged)


@app.post("/evaluate/synthetic", response_model=EvaluateResponse)
def evaluate_synthetic() -> EvaluateResponse:
    """Convenience: load bundled answer key + sample scanned sheets."""
    if not (SAMPLE_DIR / "answer_key.json").exists() or not (SAMPLE_DIR / "scanned_sheets.json").exists():
        raise HTTPException(status_code=500, detail="Sample data missing")

    worksheet = WorksheetTemplate(**json.loads((SAMPLE_DIR / "answer_key.json").read_text()))
    sheets = [ExtractedSheet(**s) for s in json.loads((SAMPLE_DIR / "scanned_sheets.json").read_text())]

    reports = evaluate_class(sheets, worksheet, {
        "STU-001": "L3",
        "STU-002": "L3",
        "STU-003": "L2",
    })
    flagged = level_flag_from_reports(reports)
    return EvaluateResponse(reports=reports, flagged_questions=flagged)