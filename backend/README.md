# Backend — Assessment Answer Key & Template Generator

Two services:

- **`backend-node/`** — Express + MongoDB API (auth, assessment CRUD, template routes)
- **`automation/`**   — Python FastAPI service: PDF → AI vision → editable questions → answer key

## Planned structure

```
backend-node/
├── src/
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/
│   ├── models/AssessmentTemplate.js
│   └── routes/assessmentRoutes.js
└── package.json

automation/
├── template_builder.py     # PDF → Gemini → JSON questions
├── main.py                 # answer-key generator
├── schemas.py
└── requirements.txt
```