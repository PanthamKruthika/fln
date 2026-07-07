# FLN Automation Service (Python · FastAPI)

End-to-end evaluation pipeline for scanned answer sheets. Per **SRS §5** and **§9** Stage 1-3:

```
Scanned PDF  →  ICR/OCR  →  Compare with answer key  →  Per-question marks
                                                          ↓
                            Concept mastery  →  Level progression  →  Narrative report
```

## Stack

| Concern | Tool |
|---|---|
| HTTP | `fastapi` + `uvicorn` |
| Validation | `pydantic` |
| Python | 3.14 |

## Folder layout

```
automation/
├── main.py                 # FastAPI app (POST /evaluate, /evaluate/synthetic)
├── schemas.py              # Pydantic models (Question, Worksheet, Answer, Report…)
├── pipeline.py             # end-to-end orchestrator
├── scoring/
│   ├── comparator.py       # per-question comparison (number/text/MCQ/drawing)
│   └── aggregator.py       # concept mastery + level progression + mistake patterns
├── reports/
│   └── narrative.py        # AI-style narrative generator
├── icr/
│   └── extract.py          # OCR loader + tiny simulator
├── sample/
│   ├── answer_key.json     # 15-question Class 2 Mid-Year paper
│   └── scanned_sheets.json # 3 student OCR outputs (topper / average / struggling)
├── test_pipeline.py        # CLI demo runner
└── .venv/                  # python venv (gitignored)
```

## How marking works

The `compare()` function in `scoring/comparator.py` handles all four answer types:

| `answer_type` | Rule | Partial credit? |
|---|---|---|
| `multiple_choice` | Letter match (case-insensitive) | ❌ |
| `number` | Numeric match within `±tolerance` (default 0) | ✅ within `2 × tolerance` |
| `text` | NFKD-normalized + punctuation-stripped lowercase match | ❌ |
| `drawing` | Flagged for manual review (CV pipeline placeholder) | ❌ |

After per-question comparison, `aggregator.py` produces:

- **Concept mastery** — groups results by `topic`, bands into `Strong / Developing / Needs Practice`.
- **Strengths / weaknesses** — top-3 and bottom-3 topics by mastery %.
- **Mistake patterns** — heuristic detection (e.g. "Borrowing errors in subtraction", "Carry errors in addition", "Money / currency conversion errors").
- **Level progression** — promote if ≥80% + no weak topics, demote if <50% + ≤1 strong topic, else stay.
- **Level-Flag rule (R-15)** — aggregated across students; flags any easy question that <50% of attempting students got right.

## Quick start

```bash
cd automation

# 1. Run the bundled demo (3 students × 15-question paper)
.venv/bin/python test_pipeline.py

# 2. Or run the HTTP service
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 5050

# 3. Hit it
curl http://127.0.0.1:5050/health
curl -X POST http://127.0.0.1:5050/evaluate/synthetic
```

## HTTP API

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/health` | Liveness probe |
| `POST` | `/evaluate` | Production endpoint — pass scanned sheets + worksheet JSON |
| `POST` | `/evaluate/synthetic` | Demo — runs the bundled sample |

`POST /evaluate` body:

```json
{
  "worksheet": { "exam_id": "...", "class_level": 2, "cycle": "Mid-Year", "questions": [ ... ] },
  "sheets":    [ { "student_id": "STU-001", "page": 1, "answers": [ ... ] } ],
  "previous_levels": { "STU-001": "L3" }
}
```

Response: `{ reports: [EvaluationReport…], flagged_questions: ["Q3","Q9"] }`

## Wiring with the Node backend

`backend-node` should call this service from its `/api/evaluation/submit` route. Sketch:

```js
// backend-node/src/controllers/evaluationController.js
import axios from "axios";

export async function evaluate(req, res) {
  const { sheets, worksheet } = req.body;
  const { data } = await axios.post("http://127.0.0.1:5050/evaluate", {
    sheets, worksheet, previous_levels: req.body.previous_levels,
  });
  res.json(data);  // persist reports + flagged_questions into MongoDB
}
```

(Add `axios` to backend deps and add a `AUTOMATION_URL=http://127.0.0.1:5050` to `.env`.)

## What's still TODO

- Replace the mock ICR loader with a real PDF → Tesseract OCR pipeline (`pdfplumber` + `pytesseract`).
- Drawing evaluation — hook up a small image classifier (TF/Keras) to score clock drawings etc.
- Persist `EvaluationReport` and `AnswerSubmission` into MongoDB (Node side, see `docs/db-schema.md`).
- Confidence-aware scoring: down-weight low-confidence OCR answers.