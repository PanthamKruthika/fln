# Frontend — Assessment Answer Key & Template Generator

React + Vite + Tailwind UI for uploading a question paper PDF, reviewing AI-extracted questions, editing them, approving the template, and (later) generating the answer key.

## Planned structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── superadmin/
│   │       └── AssessmentTemplateBuilder.jsx   # upload → review → approve
│   ├── components/
│   ├── contexts/AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```