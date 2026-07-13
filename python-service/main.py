import os
import time
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from services.pdf_processor import pdf_to_images_and_pictures, pdf_to_text
import services.groq_service as groq_svc
import services.gemini_service as gemini_svc
from services.question_parser import parse_pages, SUBJECTIVE_TYPES
from utils.logger import get_logger

app = FastAPI(title="FLN Template Builder", version="2.0.0")
logger = get_logger("main")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "extracted_images")
os.makedirs(IMAGES_DIR, exist_ok=True)
app.mount("/extracted-images", StaticFiles(directory=IMAGES_DIR), name="images")


class GenerateTemplateRequest(BaseModel):
    assessmentId: str
    pdfPath: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class QuestionImageOut(BaseModel):
    imageUrl: str
    position: str = "inline"


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
    visualDescription: str = ""
    hasImage: bool = False
    boundingBox: Dict[str, float]
    images: List[QuestionImageOut] = []


class GenerateTemplateResponse(BaseModel):
    assessmentId: str
    provider: str
    model: str
    totalQuestions: int
    totalMarks: int
    questions: List[QuestionOut]


def active_provider():
    """Provider chain: Groq → Gemini → None."""
    if groq_svc.is_configured():
        return ("groq", groq_svc.get_model(), groq_svc.analyze_page)
    if gemini_svc.is_configured():
        return ("gemini", os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"), gemini_svc.analyze_page)
    return (None, "mock", None)


MOCK_QUESTIONS = [
    {"questionNo": 1, "pageNumber": 1, "questionText": "Count the objects and write the number.", "questionType": "Counting", "concept": "Counting 1-10", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "5", "alternateAnswers": ["five"], "evaluationRule": "exact", "visualDescription": "Picture of 5 objects", "hasImage": True, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 2, "pageNumber": 1, "questionText": "8 + 3 = ?", "questionType": "Addition", "concept": "Simple Addition", "difficulty": "Easy", "marks": 2, "answerType": "number", "correctAnswer": "11", "alternateAnswers": ["eleven"], "evaluationRule": "exact", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 3, "pageNumber": 1, "questionText": "Which letter comes after A?", "questionType": "MCQ", "concept": "Alphabet Sequence", "difficulty": "Easy", "marks": 1, "answerType": "multiple", "correctAnswer": "B", "alternateAnswers": ["b"], "evaluationRule": "contains", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 4, "pageNumber": 2, "questionText": "Fill in the blanks: The sun rises in the ____.", "questionType": "Fill in the Blanks", "concept": "Environmental Science", "difficulty": "Easy", "marks": 2, "answerType": "text", "correctAnswer": "east", "alternateAnswers": ["East"], "evaluationRule": "contains", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 5, "pageNumber": 2, "questionText": "15 - 6 = ?", "questionType": "Subtraction", "concept": "Simple Subtraction", "difficulty": "Medium", "marks": 2, "answerType": "number", "correctAnswer": "9", "alternateAnswers": ["nine"], "evaluationRule": "exact", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 6, "pageNumber": 2, "questionText": "Match the following: Cat — ?", "questionType": "Match the Following", "concept": "Animal Knowledge", "difficulty": "Medium", "marks": 3, "answerType": "text", "correctAnswer": "Meow", "alternateAnswers": ["meow"], "evaluationRule": "contains", "visualDescription": "Picture of a cat", "hasImage": True, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 7, "pageNumber": 3, "questionText": "True or False: Birds can swim.", "questionType": "True/False", "concept": "General Knowledge", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "True", "alternateAnswers": ["true"], "evaluationRule": "exact", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 8, "pageNumber": 3, "questionText": "Draw a circle around the biggest object.", "questionType": "Drawing", "concept": "Spatial Awareness", "difficulty": "Medium", "marks": 3, "answerType": "drawing", "correctAnswer": "", "alternateAnswers": [], "evaluationRule": "manual", "visualDescription": "3 objects of different sizes", "hasImage": True, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 9, "pageNumber": 3, "questionText": "Trace the letter 'A' along the dotted line.", "questionType": "Trace", "concept": "Motor Skills", "difficulty": "Easy", "marks": 2, "answerType": "trace", "correctAnswer": "", "alternateAnswers": [], "evaluationRule": "manual", "visualDescription": "Dotted letter A to trace", "hasImage": True, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
    {"questionNo": 10, "pageNumber": 3, "questionText": "What comes after Tuesday?", "questionType": "Short Answer", "concept": "Days of the Week", "difficulty": "Easy", "marks": 1, "answerType": "text", "correctAnswer": "Wednesday", "alternateAnswers": ["wednesday"], "evaluationRule": "contains", "visualDescription": "", "hasImage": False, "boundingBox": {"x": 0, "y": 0, "width": 0, "height": 0}, "images": []},
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


def _attach_images(questions: List[Dict[str, Any]], pictures_by_page: Dict[int, List[str]]) -> List[Dict[str, Any]]:
    """Attach image URLs to questions that reference images.

    Strategy: if the AI flagged hasImage for a question, attach images from that page.
    Fallback: if no images flagged, attach page images to any question that mentions
    'picture' or 'image' in its text or visualDescription.
    """
    for q in questions:
        page = q.get("pageNumber", 1)
        page_images = pictures_by_page.get(page, [])
        if not page_images:
            continue
        wants_image = (
            q.get("hasImage", False)
            or any(kw in (q.get("visualDescription") or "").lower() for kw in ["picture", "image", "diagram", "figure", "illustration"])
            or any(kw in (q.get("questionText") or "").lower() for kw in ["picture", "image", "diagram", "in the figure"])
        )
        if wants_image:
            # Attach all images from that page (max 4)
            urls = []
            for path in page_images[:4]:
                fname = os.path.basename(path)
                # Use absolute backend URL so the proxy works
                backend = os.environ.get("BACKEND_PUBLIC_URL", "http://localhost:5000")
                urls.append({"imageUrl": f"{backend}/extracted-images/{fname}", "position": "inline"})
            q["images"] = urls
    return questions


@app.post("/generate-template", response_model=GenerateTemplateResponse)
def generate_template(req: GenerateTemplateRequest):
    t0 = time.time()
    provider_name, model_name, analyze_fn = active_provider()
    logger.info(f"generate-template {req.assessmentId} | provider={provider_name} model={model_name} pdf={'yes' if req.pdfPath else 'no'}")

    if not provider_name or not req.pdfPath:
        if not provider_name:
            logger.info("No AI provider configured — returning mock questions")
        else:
            logger.info("No pdfPath — returning mock questions")
        return _mock_response(req.assessmentId)

    # Real AI pipeline
    try:
        pages, pictures_by_page = pdf_to_images_and_pictures(req.pdfPath, IMAGES_DIR)
        if not pages:
            logger.warning("Could not render PDF — falling back to mock")
            return _mock_with_label(req.assessmentId, "mock (pdf-render-failed)")

        all_results: List[List[Dict[str, Any]]] = []
        for i, img in enumerate(pages, start=1):
            qs = analyze_fn(img, i, req.metadata or {})
            all_results.append(qs)

        questions_raw = [q for page in all_results for q in page]
        elapsed = time.time() - t0
        logger.info(f"Done in {elapsed:.1f}s — {len(questions_raw)} questions from {provider_name}")

        if not questions_raw:
            logger.warning(f"{provider_name} extracted 0 questions — falling back to mock")
            return _mock_with_label(req.assessmentId, f"mock ({provider_name}-empty)")

        # Parse, fill missing answers, attach images
        deduped = parse_pages(all_results)
        deduped = _attach_images(deduped, pictures_by_page)
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
        return _mock_with_label(req.assessmentId, "mock (error)")


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