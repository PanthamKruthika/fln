"""FastAPI app exposing the FLN evaluation pipeline.

Endpoints
---------
GET  /health
POST /extract            — PDF + worksheet template → ExtractedSheet JSON
POST /evaluate           — ExtractedSheet(s) + template → EvaluationReports
POST /extract-and-evaluate — PDF + template → both stages in one call
POST /evaluate/synthetic  — demo on bundled sample data (no PDF needed)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from schemas import (
    EvaluationReport,
    ExtractedSheet,
    WorksheetTemplate,
)
from pipeline import (
    evaluate_class,
    extract_sheet_from_pdf,
)
from scoring.aggregator import level_flag_from_reports

app = FastAPI(
    title="FLN Evaluation Service",
    version="0.2.0",
    description=(
        "AI worksheet extraction + evaluation pipeline. "
        "Stage 1: bbox-aware per-type extraction from scanned PDFs. "
        "Stage 2: per-question marking, concept mastery, level progression, "
        "narrative report. (SRS §5, §9, §12.1, §13.2 R-15)"
    ),
)

SAMPLE_DIR = Path(__file__).parent / "sample"


# --------------------------------------------------------------------------- #
# Request / response shapes
# --------------------------------------------------------------------------- #

class EvaluateRequest(BaseModel):
    template: WorksheetTemplate
    sheets: list[ExtractedSheet]
    previous_levels: dict[str, str] | None = None


class EvaluateResponse(BaseModel):
    reports: list[EvaluationReport]
    flagged_questions: list[str]


class ExtractEvaluateResponse(BaseModel):
    sheets: list[ExtractedSheet]
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
    if not req.template.questions:
        raise HTTPException(status_code=400, detail="template must contain questions")

    reports = evaluate_class(req.sheets, req.template, req.previous_levels or {})
    flagged = level_flag_from_reports(reports)
    return EvaluateResponse(reports=reports, flagged_questions=flagged)


@app.post("/extract-and-evaluate", response_model=ExtractEvaluateResponse)
async def extract_and_evaluate(
    template: str = Form(...),
    student_id: str = Form(...),
    pdf: UploadFile = File(...),
    previous_level: str = Form("L3"),
) -> ExtractEvaluateResponse:
    """End-to-end: PDF + template → Stage 1 extraction → Stage 2 marking.

    Multipart form:
      - template: JSON string (WorksheetTemplate)
      - student_id: string
      - pdf: scanned PDF file
      - previous_level: optional (default "L3")
    """
    try:
        ws = WorksheetTemplate(**json.loads(template))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid template JSON: {e}") from e

    # Save uploaded PDF to a temp file (pdf2image needs a path)
    tmp_pdf = SAMPLE_DIR / f"_uploaded_{student_id}.pdf"
    tmp_pdf.write_bytes(await pdf.read())

    try:
        sheet = extract_sheet_from_pdf(tmp_pdf, student_id, ws)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"extraction failed: {e}") from e
    finally:
        try:
            tmp_pdf.unlink()
        except FileNotFoundError:
            pass

    report = evaluate_class([sheet], ws, {student_id: previous_level})[0]
    flagged = level_flag_from_reports([report])
    return ExtractEvaluateResponse(
        sheets=[sheet],
        reports=[report],
        flagged_questions=flagged,
    )


@app.post("/evaluate/synthetic", response_model=EvaluateResponse)
def evaluate_synthetic() -> EvaluateResponse:
    """Demo: load bundled worksheet template + sample scanned sheets."""
    template = WorksheetTemplate(**json.loads((SAMPLE_DIR / "worksheet_template.json").read_text()))
    sheets = [ExtractedSheet(**s) for s in json.loads((SAMPLE_DIR / "scanned_sheets.json").read_text())]

    reports = evaluate_class(sheets, template, {
        "STU-001": "L3",
        "STU-002": "L3",
        "STU-003": "L2",
    })
    flagged = level_flag_from_reports(reports)
    return EvaluateResponse(reports=reports, flagged_questions=flagged)