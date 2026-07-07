# FLN Automation Service (Python · FastAPI)

End-to-end evaluation pipeline for scanned answer sheets. Per **SRS §5** and **§9** Stages 1-3:

```
                          Stage 1 (per-type extraction)
                          ─────────────────────────────

  Scanned PDF  →  pdf2image  →  per-page images
                                    │
                                    ▼
                       For each Question on its page:
                         crop bbox  →  dispatch by qtype
                                    │
              ┌─────────┬──────────┼──────────┬──────────┐
              ▼         ▼          ▼          ▼          ▼
         handwriting  number      mcq      circle   matching  tick  trace  drawing
         (OCR)       (OCR)      (bubble)  (Hough)  (HoughP)  (ink) (path)  (CNN)
              │         │          │          │          │       │     │       │
              └─────────┴──────────┴──────────┴──────────┴───────┴─────┴───────┘
                                              │
                                              ▼
                              answer dictionary per student
                                              │
                                              ▼
                          Stage 2 (marking + report)
                          ──────────────────────────

                Compare with answer key
                          │
                          ▼
            Per-question results  →  concept mastery
                          │              │
                          ▼              ▼
                  overall score     strengths / weaknesses
                          │              │
                          ▼              ▼
                   level progression  narrative report
                          │
                          ▼
                   EvaluationReport
```

## Stack

| Concern | Tool |
|---|---|
| HTTP | `fastapi` + `uvicorn` + `python-multipart` |
| PDF → image | `pdf2image` (poppler) |
| Image I/O | `Pillow` |
| Computer vision | `opencv-python-headless` |
| Numerics | `numpy` |
| Validation | `pydantic` |
| Python | 3.14 |

## Folder layout

```
automation/
├── main.py                 # FastAPI app
├── schemas.py              # Pydantic models — Question, WorksheetTemplate, BBox, ExtractedAnswer…
├── pipeline.py             # extract_sheet_from_pdf + evaluate_student + evaluate_class
├── icr/
│   ├── pdf_converter.py     # PDF → per-page PIL images
│   └── cropper.py           # PDF-coordinate bbox → pixel crop
├── extractors/              # ONE MODULE PER QUESTION TYPE
│   ├── _base.py
│   ├── handwriting.py       # OCR → text
│   ├── number_writer.py     # OCR → numeric
│   ├── multiple_choice.py   # bubble fill density
│   ├── circle.py            # HoughCircles + region overlap
│   ├── matching.py          # HoughLinesP + region overlap
│   ├── tick.py              # inner-stroke ink density
│   ├── trace.py             # Hausdorff distance to expected path
│   └── drawing.py           # small CNN / CLIP classifier
├── scoring/
│   ├── comparator.py        # per-question compare() (handles all 8 qtypes)
│   └── aggregator.py        # mastery / strengths / weakness / mistake patterns / level / level-flag
├── reports/
│   └── narrative.py         # AI-style narrative paragraph
├── sample/
│   ├── worksheet_template.json  # 6-question paper with bboxes + regions per qtype
│   ├── answer_key.json          # same questions, expected answers only
│   └── scanned_sheets.json      # 3 student OCR outputs
├── test_pipeline.py         # CLI demo
└── .venv/                   # python venv (gitignored)
```

## How extraction actually works (per question type)

| `qtype` | What Python does |
|---|---|
| `handwriting` | crops bbox → **Tesseract / PaddleOCR** on the crop → text |
| `number` | same as handwriting, then parses to float, validated in `compare()` |
| `multiple_choice` | for each labelled `region` (one bubble per choice), crops that bubble, computes **fill density** = dark px / total px. The chosen option is the region with the highest density above a threshold. |
| `circle` | crops bbox → **HoughCircles** to find drawn circle(s) → for each circle, find which `region` (Triangle/Square/Circle label) it overlaps → return that label |
| `matching` | crops bbox → **HoughLinesP** to find lines → for each line, find which `region` the leftmost endpoint is in and which `region` the rightmost endpoint is in → return pairs like `Rectangle-Door,Circle-Button` |
| `tick` | for each labelled `region` (one checkbox), crops it, looks for **dark blob in the centre** (the ✓ shape) → ticked region wins |
| `trace` | skeletonize the crop, compare to `expected_signature` via **Hausdorff distance** → match / partial / miss |
| `drawing` | **CNN / CLIP zero-shot** classifier → label like `clock_4oclock`. Empty crop → `drawing_missing`. |

## Quick start

```bash
cd automation

# CLI demo
.venv/bin/python test_pipeline.py

# HTTP service
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 5050
```

## HTTP API

| Method | Path | Body | Purpose |
|---|---|---|---|
| `GET`  | `/health` | — | Liveness probe |
| `POST` | `/evaluate` | `EvaluateRequest` JSON | Stage 2 only — pass pre-extracted sheets |
| `POST` | `/extract-and-evaluate` | `multipart` form | Stage 1 + 2 — upload PDF + template JSON |
| `POST` | `/evaluate/synthetic` | — | Demo: runs on bundled sample data |

### `/extract-and-evaluate` form fields

| Field | Type | |
|---|---|---|
| `pdf` | file | Scanned answer sheets PDF |
| `student_id` | string | `STU-001` etc. |
| `template` | string | JSON-serialised `WorksheetTemplate` |
| `previous_level` | string | (optional) default `L3` |

## Wiring with backend-node

`backend-node` should call this service from `/api/evaluation/submit` and persist the report into MongoDB (see `docs/db-schema.md`).

```js
// backend-node/src/controllers/evaluationController.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function evaluate(req, res) {
  const pdf = fs.readFileSync(req.file.path);
  const form = new FormData();
  form.append("pdf", pdf, req.file.originalname);
  form.append("student_id", req.body.student_id);
  form.append("template", JSON.stringify(req.worksheet));
  form.append("previous_level", req.body.previous_level ?? "L3");

  const { data } = await axios.post("http://127.0.0.1:5050/extract-and-evaluate", form, {
    headers: form.getHeaders(),
  });
  // persist data.reports[0] into MongoDB
  res.json(data);
}
```

## TODO / production hardening

- Replace `_DEMO` dicts in each extractor with real implementations.
- `handwriting.py` → `pytesseract.image_to_string(crop, config='--psm 7')` (single line) or PaddleOCR.
- `multiple_choice.py` → binarize each bubble region, fill_density = dark / total.
- `circle.py` → `cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, …)` then test circle-region overlap.
- `matching.py` → `cv2.HoughLinesP` + endpoint-region mapping.
- `tick.py` → inner-stroke ink density.
- `trace.py` → skeletonize + Hausdorff.
- `drawing.py` → small CNN (MobileNet fine-tune) or CLIP zero-shot.
- Persist `EvaluationReport` and `AnswerSubmission` into MongoDB.
- Add review-queue UI for any report with `confidence < 0.6` (manual teacher review).