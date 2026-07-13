import os
import time
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from services.pdf_processor import pdf_to_images, pdf_to_text
import services.groq_service as groq_svc
import services.gemini_service as gemini_svc
from services.template_builder import build_template
from utils.logger import get_logger

app = FastAPI(title="FLN Template Builder", version="1.1.0")
logger = get_logger("main")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateTemplateRequest(BaseModel):
    assessmentId: str
    pdfPath: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class QuestionOut(BaseModel):
    questionNo: int
    pageNumber: int
    questionText: str
    questionType: str
    concept: str
    difficulty: str
    marks: int
    answerType: str
    correctAnswer: str
    alternateAnswers: List[str]
    evaluationRule: str
    boundingBox: Dict[str, float]


class GenerateTemplateResponse(BaseModel):
    assessmentId: str
    provider: str
    model: str
    totalQuestions: int
    totalMarks: int
    questions: List[QuestionOut]


def active_provider():
    """Pick the first configured provider in order: Groq → Gemini → None."""
    if groq_svc.is_configured():
        return ("groq", groq_svc.get_model(), groq_svc.analyze_page)
    if gemini_svc.is_configured():
        return ("gemini", os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"), gemini_svc.analyze_page)
    return (None, "mock", None)


MOCK_QUESTIONS = [
    {"questionNo": 1, "pageNumber": 1, "questionText": "Count the objects and write the number.", "questionType": "Counting", "concept": "Counting 1-10", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "5", "alternateAnswers": ["five", "V"], "evaluationRule": "contains", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 2, "pageNumber": 1, "questionText": "8 + 3 = ?", "questionType": "Addition", "concept": "Simple Addition", "difficulty": "Easy", "marks": 2, "answerType": "number", "correctAnswer": "11", "alternateAnswers": ["eleven", "XI"], "evaluationRule": "exact", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 3, "pageNumber": 1, "questionText": "Which letter comes after A?", "questionType": "MCQ", "concept": "Alphabet Sequence", "difficulty": "Easy", "marks": 1, "answerType": "multiple", "correctAnswer": "B", "alternateAnswers": ["b"], "evaluationRule": "contains", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 4, "pageNumber": 2, "questionText": "Fill in the blanks: The sun rises in the ____.", "questionType": "Fill in the Blanks", "concept": "Environmental Science", "difficulty": "Easy", "marks": 2, "answerType": "text", "correctAnswer": "east", "alternateAnswers": ["East", "EAST"], "evaluationRule": "contains", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 5, "pageNumber": 2, "questionText": "15 - 6 = ?", "questionType": "Subtraction", "concept": "Simple Subtraction", "difficulty": "Medium", "marks": 2, "answerType": "number", "correctAnswer": "9", "alternateAnswers": ["nine"], "evaluationRule": "exact", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 6, "pageNumber": 2, "questionText": "Match the following: Cat — ?", "questionType": "Match the Following", "concept": "Animal Knowledge", "difficulty": "Medium", "marks": 3, "answerType": "text", "correctAnswer": "Meow", "alternateAnswers": ["meow", "MEOW"], "evaluationRule": "contains", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 7, "pageNumber": 3, "questionText": "True or False: Birds can swim.", "questionType": "True/False", "concept": "General Knowledge", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "True", "alternateAnswers": ["true", "TRUE"], "evaluationRule": "exact", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 8, "pageNumber": 3, "questionText": "Draw a circle around the biggest object.", "questionType": "Drawing", "concept": "Spatial Awareness", "difficulty": "Medium", "marks": 3, "answerType": "drawing", "correctAnswer": "", "alternateAnswers": [], "evaluationRule": "manual", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 9, "pageNumber": 3, "questionText": "Trace the letter 'A' along the dotted line.", "questionType": "Trace", "concept": "Motor Skills", "difficulty": "Easy", "marks": 2, "answerType": "trace", "correctAnswer": "", "alternateAnswers": [], "evaluationRule": "manual", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
    {"questionNo": 10, "pageNumber": 3, "questionText": "What comes after Tuesday?", "questionType": "Short Answer", "concept": "Days of the Week", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "Wednesday", "alternateAnswers": ["wednesday", "Wed"], "evaluationRule": "contains", "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}},
]


@app.get("/health")
def health():
    provider, model, _ = active_provider()
    return {
        "ok": True,
        "service": "fln-template-builder",
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "provider": provider,
        "model": model,
        "providers": {
            "groq": {"configured": groq_svc.is_configured(), "model": groq_svc.get_model() if groq_svc.is_configured() else None},
            "gemini": {"configured": gemini_svc.is_configured(), "model": os.environ.get("GEMINI_MODEL", "gemini-2.0-flash") if gemini_svc.is_configured() else None},
        },
    }


@app.post("/generate-template", response_model=GenerateTemplateResponse)
def generate_template(req: GenerateTemplateRequest):
    t0 = time.time()
    provider_name, model_name, analyze_fn = active_provider()
    logger.info(f"generate-template {req.assessmentId} | provider={provider_name} model={model_name} pdf={'yes' if req.pdfPath else 'no'}")

    if not provider_name or not req.pdfPath:
        # No provider or no PDF → mock
        if not provider_name:
            logger.info("No AI provider configured — returning mock questions")
        else:
            logger.info("No pdfPath — returning mock questions")
        return _mock_response(req.assessmentId)

    # Real AI pipeline
    try:
        images = pdf_to_images(req.pdfPath)
        if not images:
            logger.warning(f"Could not render PDF — falling back to mock")
            return _mock_with_label(req.assessmentId, "mock (pdf-render-failed)")

        all_results: List[List[Dict[str, Any]]] = []
        for i, img in enumerate(images, start=1):
            qs = analyze_fn(img, i, req.metadata or {})
            all_results.append(qs)

        questions = [q for page in all_results for q in page]
        elapsed = time.time() - t0
        logger.info(f"Done in {elapsed:.1f}s — {len(questions)} questions from {provider_name}")

        if not questions:
            logger.warning(f"{provider_name} extracted 0 questions — falling back to mock")
            return _mock_with_label(req.assessmentId, f"mock ({provider_name}-empty)")

        # Dedup + renumber by question_parser via template_builder
        from services.question_parser import parse_pages
        deduped = parse_pages(all_results)
        total_marks = sum(q.get("marks", 1) for q in deduped)

        return GenerateTemplateResponse(
            assessmentId=req.assessmentId,
            provider=provider_name,
            model=model_name,
            totalQuestions=len(deduped),
            totalMarks=total_marks,
            questions=[QuestionOut(**q) for q in deduped],
        )

    except Exception as e:
        logger.exception(f"Template generation failed: {e}")
        return _mock_with_label(req.assessmentId, f"mock (error)")


def _mock_response(assessment_id: str) -> GenerateTemplateResponse:
    return GenerateTemplateResponse(
        assessmentId=assessment_id,
        provider="mock",
        model="mock",
        totalQuestions=len(MOCK_QUESTIONS),
        totalMarks=sum(q["marks"] for q in MOCK_QUESTIONS),
        questions=[QuestionOut(**q) for q in MOCK_QUESTIONS],
    )


def _mock_with_label(assessment_id: str, label: str) -> GenerateTemplateResponse:
    return GenerateTemplateResponse(
        assessmentId=assessment_id,
        provider="mock",
        model=label,
        totalQuestions=len(MOCK_QUESTIONS),
        totalMarks=sum(q["marks"] for q in MOCK_QUESTIONS),
        questions=[QuestionOut(**q) for q in MOCK_QUESTIONS],
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5051))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)