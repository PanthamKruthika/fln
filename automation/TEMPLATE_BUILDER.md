# FLN Template Builder (Python · FastAPI · Gemini)

AI-powered extraction of questions from uploaded question-paper PDFs.

## Pipeline

```
Scanned PDF
   │
   ▼
PyMuPDF renders every page as a PNG image
   │
   ▼
Google Gemini (gemini-2.0-flash) reads each image and returns
questions as structured JSON:
   { questionNo, questionText, questionType, correctAnswer,
     answerOptions }
   │
   ▼
Heuristic enrichment → concept / difficulty / level / marks
   │
   ▼
Return to Node → /api/assessments/template/upload persists as
AssessmentTemplate (draft)
```

If `GEMINI_API_KEY` is not set, the pipeline falls back to:
1. PyMuPDF text extraction + regex parsing (no LLM)
2. (Last resort) Deterministic mock question set

## Setup

### 1. Get a free Gemini API key

- Go to **https://aistudio.google.com/app/apikey**
- Click **Create API key**
- Copy the key (starts with `AIza...`)
- **No credit card required.** Free tier: 15 RPM, 1M tokens/min, 1500 RPD.

### 2. Set the key

```bash
# backend-node/.env
GEMINI_API_KEY=AIzaSyD...
```

### 3. Run the service

```bash
cd automation
.venv/bin/python -m uvicorn template_builder:app --port 5051
```

### 4. Verify

```bash
curl http://127.0.0.1:5051/health | python3 -m json.tool
# {
#   "gemini_configured": true,
#   "gemini_model": "gemini-2.0-flash",
#   ...
# }
```

## API

| Method | Path | Body |
|---|---|---|
| `GET`  | `/health` | — |
| `POST` | `/assessment-template/extract` | multipart: `pdf` + `grade` + `subject` + `academicYear` + `template_id` |

Response:
```json
{
  "templateId": "TEMP-20260707161151",
  "questions": [
    {
      "questionNo": 1,
      "questionText": "Count the stars and write the number",
      "questionType": "handwriting",
      "concept": "Number Sense",
      "difficulty": "easy",
      "level": "L1",
      "marks": 1,
      "correctAnswer": "",
      "answerOptions": null,
      "provenance": "gemini-ai"
    }
  ],
  "totalQuestions": 10,
  "totalMarks": 10,
  "source": "gemini (gemini-2.0-flash)",
  "notes": "Questions extracted by Google Gemini vision model."
}
```

## Question-type taxonomy (what Gemini picks from)

| `questionType` | What it means |
|---|---|
| `number` | Fill-in-the-blank with a single number answer |
| `handwriting` | Student writes a word/short phrase |
| `multiple_choice` | Has options A) B) C) D) |
| `circle` | Student circles an object |
| `matching` | Student draws lines connecting two columns |
| `tick` | Student ticks one or more boxes |
| `trace` | Student traces a dotted path |
| `drawing` | Student draws a picture (clock, shape, etc.) |

## Production hardening

- **Rate limiting** — wrap Gemini calls in a token-bucket if traffic spikes.
- **Caching** — hash the PDF + cache the extracted questions to avoid repeat LLM calls.
- **OCR fallback** — for image-only PDFs that even Gemini misreads, install `paddleocr` and the pipeline will use it automatically.
- **Confidence score** — add a `confidence` field per question by asking Gemini to self-rate.