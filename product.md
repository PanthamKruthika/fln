# Product Log — FLN Platform

A step-by-step changelog of work done on the FLN Assessment & Personalized Worksheet Platform.

**Repository:** `fln`
**Branch:** `scanning_verifying_answerpaper`
**Stack:** MERN (MongoDB, Express, React, Node) + Python (AI services) — per SRS §1.0

---

## Step 1 — Clone the repository
- Cloned `fln` into `Documents/sample/FLN-Project/fln`.
- Verified remote: `https://github.com/PanthamKruthika/fln.git`.

## Step 2 — Create feature branch
- Branch: `scanning_verifying_answerpaper`
- Reason: isolate work on the scanning / verifying answer-paper workflow (Teacher-side scanning & ingestion per SRS §4.7, §8).

## Step 3 — Set up the monorepo folder structure
Per SRS §16 (Repository / Folder Structure), created two top-level scaffolds:

| Folder | Purpose | Status |
|---|---|---|
| `frontend-react/` | React client (per-role dashboards, login, home) | Initialized |
| `backend-node/` | Node + Express orchestration layer (auth, CRUD, generation-lock, defaulter engine) | Placeholder only |

## Step 4 — Scaffold React app with Vite
- Ran `npm create vite@latest . -- --template react` inside `frontend-react/`.
- React 19 + Vite 8.
- Installed dependencies (`npm install`, 24 packages, 0 vulnerabilities).
- Verified dev server runs at `http://localhost:5173/`.

## Step 5 — Run the app
- Started `npm run dev -- --host` in background (`PID 7417`).
- Network URLs:
  - Local: `http://localhost:5173/`
  - Network: `http://192.168.1.102:5173/`

## Step 6 — Read & internalize the SRS
- Read `fln/SRS.md` (v0.1, 983 lines).
- Distilled the project:
  - 3 annual cycles (Baseline → Mid-Year → End-Year) for Classes 2–4 Math.
  - 7 roles in the national hierarchy (Superadmin → Admin → District Admin → Block Admin → School → Teacher / Volunteer).
  - Single AI-personalized worksheet-generation flow gated by 2 pairwise locks `{Teacher ↔ School}` and `{Volunteer ↔ Block Admin}` (§13.2 R-11).
  - ICR ingestion of structured answer JSON, then Python evaluation engine.
  - Pre-built SVG asset library with same-category substitution.
  - HTML → A4 PDF rendering of worksheets.

## Step 7 — Design the Teacher Dashboard
Drafted a layout aligned with SRS §14.1 (cross-role dashboard shell) and §14.3 (Teacher-specific highlights):

```
┌──────────────────┬────────────────────────────────────────────┐
│  Sidebar (nav)   │  Announcement banner                       │
│                  │  Header (title + search + bell)            │
│                  │  Exam-window banner (1h print / 45m / 1h)  │
│                  │  Summary cards (5)                         │
│                  │  Class Roster table (search + filter)     │
│                  │  Generate Worksheets CTA                   │
└──────────────────┴────────────────────────────────────────────┘
```

Sidebar nav: Dashboard · Class Roster · Assessments · Generate Papers · Scan & Upload · Reports · Tickets · Settings.

## Step 8 — Build the Teacher Dashboard UI

**Dependencies added**
- `tailwindcss` + `@tailwindcss/vite` (Tailwind CSS v4).
- `react-router-dom` (downgraded `7 → 6` to fix a React-19 / Vite-pre-bundle hook error).
- `lucide-react` (icons).

**Configuration**
- `vite.config.js` — registered `@tailwindcss/vite`.
- `src/index.css` — `@import "tailwindcss";` + base resets.
- `src/App.jsx` — `<BrowserRouter>` with `/` and `/teacher` routes pointing at `TeacherDashboard`.
- `index.html` — title set to `"FLN Platform — Teacher Dashboard"`.

**New files**
```
src/
├── components/
│   ├── Sidebar.jsx            — brand header, role nav, user card, logout
│   ├── Header.jsx             — title, search bar, bell, announcement strip
│   ├── SummaryCards.jsx       — 5 metric cards (icon + value + trend)
│   ├── ClassRoster.jsx        — student table with search + class filter
│   └── ExamWindowBanner.jsx   — current exam-phase indicator
├── pages/
│   └── TeacherDashboard.jsx   — composes all of the above; "Add Student" demo action
├── data/
│   └── mockData.js            — teacher profile, summary cards, 10 students,
│                                sidebar nav, urgent announcement, exam window
```

**Mock persona**
- Teacher: Priya Sharma · `gps-mt-001.t01@fln.org`
- School: GPS Model Town 001 · Class 3-A · Mid-Year cycle

**Verification**
- Vite ready in ~8s, server up at `:5173`, HTTP 200.
- No console errors in the dev-server log.
- Visit `/` or `/teacher` to see the dashboard.

## Step 9 — Explain the Sidebar (design walkthrough)
- Documented two-section vertical panel (brand header / nav / user card).
- 8 role-specific routes mapped to SRS §4.7 + §14.3.
- Active-state styling (`bg-indigo-50 text-indigo-700`), `iconMap` for data/UI decoupling.

## Step 10 — Commit & push to GitHub
- Added `.gitignore` at repo root (node_modules, dist, env, OS junk).
- Added `backend-node/README.md` placeholder so Git tracks the empty folder.
- `node_modules/119MB` correctly excluded by Vite's default `.gitignore`.
- Commit:
  ```
  feat: scaffold teacher dashboard with Tailwind + Vite
  ```
- 26 files committed.
- Branch `scanning_verifying_answerpaper` pushed — upstream tracking set.
- PR: https://github.com/PanthamKruthika/fln/pull/new/scanning_verifying_answerpaper

## Step 11 — Create multi-role Login page
- Added `src/pages/LoginPage.jsx`: centered white card on an indigo→violet→fuchsia gradient, role-selector grid replacing the usual login / sign-up / reset-password links.
- Added `src/data/loginRoles.js`: role metadata (id, label, description, example email) for all 7 roles from SRS §4 — Superadmin, Admin, District Admin, Block Admin, School Principal, Teacher, Volunteer.
- Updated `src/App.jsx` so `/` now resolves to `LoginPage`; `/teacher` still leads to the Teacher dashboard.
- Email + password form with eye-toggle, mock validation (≥8 chars, 1 uppercase, 1 digit, 1 special per §A-3).
- On valid submit, navigates to the role-specific dashboard route (`/superadmin`, `/admin`, `/district`, `/block`, `/school`, `/teacher`, `/volunteer`).
- Dev-server verified — no console errors, only React Router v7 future-flag warnings.
- Commit:
  ```
  feat: add login page with role selector for all 7 roles
  ```
- 3 files changed, 229 insertions.
- Pushed to `scanning_verifying_answerpaper`.

## Step 12 — Switch login role selector to horizontal tabs
- Replaced the 2-column role **boxes** with a single horizontal **tab strip** styled like the usual login / sign-up / reset-password tab row.
- Each tab uses `border-b-2` for the underline indicator; active tab = `border-indigo-600 text-indigo-700`, inactive = `border-transparent text-slate-500 hover:border-slate-300`.
- Added `overflow-x-auto` so all 7 role tabs remain reachable on narrow viewports.
- Commit:
  ```
  style: switch login role selector from boxes to horizontal tabs
  ```
- 1 file changed, 8 insertions, 20 deletions.
- Pushed to `scanning_verifying_answerpaper`.

## Step 13 — Scaffold the backend (Node + Express + MongoDB)
- Started local `mongod` daemon (8.3.2) on `127.0.0.1:27017` with dbpath `~/fln-mongo-data`, logfile `/tmp/mongod.log`.
- Initialized `backend-node/` with `npm init -y`, set `type: module`, scripts: `start`, `dev` (node --watch).
- Installed: `express`, `mongoose`, `dotenv`, `cors`, `morgan`, `bcryptjs`, `jsonwebtoken`. Dev: `nodemon` (legacy).
- Folder layout:
  ```
  backend-node/
  ├── src/
  │   ├── config/db.js            — mongoose connection + listeners
  │   ├── models/User.js          — User schema for all 7 roles + scope + defaulter fields
  │   ├── controllers/authController.js — login + register
  │   ├── routes/authRoutes.js    — /api/auth/login, /api/auth/register
  │   ├── routes/systemRoutes.js  — /api/health, /api/me
  │   ├── middleware/auth.js      — requireAuth (JWT) + requireRole(...)
  │   └── server.js               — entry point (cors, json, morgan, error handler)
  ├── .env / .env.example         — PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN
  ├── .gitignore
  └── README.md                   — Compass connection + curl examples
  ```
- **MongoDB Compass connection:** `mongodb://127.0.0.1:27017/fln` (database name: `fln`).
- **REST endpoints now live:**
  - `GET  /` — info
  - `GET  /api/health` — `{"ok":true}`
  - `POST /api/auth/register` — provisioning (Superadmin / Admin)
  - `POST /api/auth/login` — returns JWT (7-day expiry)
  - `GET  /api/me` — JWT-protected echo of the user payload
- **Local verification:**
  - `register` Superadmin → `201`
  - `login` with correct creds → `200` + JWT
  - `login` wrong password → `401`
  - `GET /api/me` without token → `401`
  - `GET /api/me` with token → `200` (decoded role/email/sub)
- Commit:
  ```
  feat(backend): scaffold Node + Express + MongoDB API
  ```
- 11 files added, 1 changed.
- Pushed to `scanning_verifying_answerpaper`.

## Step 14 — Remove public registration (per SRS §1.3 / R-1)
- Verified the frontend `LoginPage` has **no register / sign-up** link or route (only horizontal role tabs + Sign In).
- Locked `POST /api/auth/register` behind `requireAuth + requireRole('superadmin', 'admin')` — public calls now return `401 missing bearer token`.
- Added `src/scripts/seedSuperadmin.js` + `npm run seed:superadmin` so the **first** Superadmin can be bootstrapped without a public endpoint (idempotent — skips if the email already exists).
- Updated `backend-node/README.md` to replace the curl register example with the seed-script docs.
- **Verified:**
  - Public `POST /api/auth/register` → `401`
  - `POST /api/auth/register` with Superadmin JWT → `201` (Teacher provisioned)
  - Login as that Teacher → `200`
  - `npm run seed:superadmin` first run → creates; second run → reports `"user already exists"`
- Commit:
  ```
  fix(backend): remove public registration, lock to admin roles
  ```
- 4 files changed, 58 insertions, 5 deletions.
- Pushed to `scanning_verifying_answerpaper`.

## Step 15 — Build dashboards for all 7 roles
- Extracted shared scaffolding so dashboards don't duplicate chrome:
  - `src/layouts/AppLayout.jsx` — Sidebar + Header + scrollable main slot.
  - `src/data/roles.js` — per-role profile (label/title/email) + `roleNav` maps for all 7 sidebar lists.
- Refactored `TeacherDashboard` to use `AppLayout` (no behavior change).
- Built 6 new dashboards, each wired to its SRS §4 / §14.3 responsibilities:
  | Route | Role | Highlights |
  |---|---|---|
  | `/superadmin` | Superadmin | State-wise table, announcement composer (urgent-toggle triggers email), ticket review queue with Approve/Reject |
  | `/admin` | Admin (State) | District ranking by FLN cert %, learning-gap mastery bars per topic, lagging-district flags |
  | `/district` | District Admin | 4-stage pipeline (Conducted → Scanned → Evaluated → Certified) with bottleneck indicators, Block Admin tracking |
  | `/block` | Block Admin | Volunteer tracking, low-strength schools table with paired-lock Generate Papers CTA |
  | `/school` | School Principal | Class-wise mastery overview (8 classes), concept-focus suggestions, Add Student + Generate Papers |
  | `/volunteer` | Volunteer | Assigned low-strength schools, scan logbook with batch Upload/Re-process actions |
- Updated `src/App.jsx` with all 7 dashboard routes alongside `/login`.
- **Verified:** all 7 routes return HTTP 200; no console errors beyond React Router v7 future-flag warnings.
- Commit:
  ```
  feat(ui): build dashboards for the remaining 6 roles
  ```
- 9 files changed, ~1100 insertions.
- Pushed to `scanning_verifying_answerpaper`.

## Step 16 — End-to-end login for all 7 roles
- **Backend** — `src/scripts/seedRoles.js` + `npm run seed:roles` provisions sample accounts for every role; idempotent (5 created, 2 already existed from earlier testing).
- **Frontend** — `src/contexts/AuthContext.jsx` exposes `useAuth`, `useLogout`, `routeForRole`; persists `{token, user}` in `localStorage` under `fln.auth`.
- `LoginPage` now calls real `POST /api/auth/login` (fetch), stores the JWT via the context, then navigates to the dashboard that matches the **server-resolved role** (auth source of truth is the backend).
- `AppLayout` now reads user from `useAuth()` and derives avatar initials from `user.name`. Static `roles.X` mocks removed from dashboard pages.
- `Sidebar` logout button calls `useLogout()` → clears auth and routes to `/`.
- New `RequireAuth` guard wraps every dashboard route — unauthenticated visitors bounce to login.
- **Verified:** login for each of the 7 roles returns `200` with the correct `user.role`; protected `GET /api/me` works with the issued JWT.
- Commit:
  ```
  feat(auth): wire frontend login to backend with JWT + role routing
  ```
- 8 files changed, +221/-42.
- Pushed to `scanning_verifying_answerpaper`.

## Step 17 — Visible Logout button on every dashboard
- The Sidebar had a tiny LogOut icon that was easy to miss.
- `src/components/Header.jsx` now reads `user` from `useAuth()` and renders:
  - the user's **name + email** in the top-right header,
  - a prominent **rose-tinted "Logout" pill** (icon + label) next to the bell icon.
- Both the new header Logout button and the existing Sidebar icon call the same `useLogout()` from `AuthContext`, which clears `localStorage.fln.auth` and routes to `/`.
- The `RequireAuth` guard ensures visiting a dashboard URL while logged out bounces back to the login page automatically.
- Commit:
  ```
  feat(ui): add visible Logout button in dashboard Header
  ```
- 1 file changed, +29/-2.
- Pushed to `scanning_verifying_answerpaper`.

## Step 18 — Remove Generate Papers button from Teacher & School
- Per project policy, paper generation is centralized on Superadmin.
- `src/components/ClassRoster.jsx` (used by Teacher dashboard): dropped the indigo "Generate Worksheets" button; toolbar now shows only **Add Student**. Removed unused `FileText` import.
- `src/pages/SchoolPrincipalDashboard.jsx`: dropped the indigo "Generate Papers" button; replaced with a disabled, tooltip-explained "Papers (Superadmin)" chip so the intent is visible.
- `src/data/roles.js`: renamed the sidebar nav item from "Generate Papers" → **"Papers"** for both `school` and `teacher` roles (read-only view).
- **Note:** Block Admin and Volunteer dashboards still have their "Generate Papers" buttons. The SRS §4 / §13.2 R-11 originally allowed `{Teacher↔School}` and `{Volunteer↔Block Admin}` generation pairs, but project policy centralizes on Superadmin — let me know if you want those stripped too.
- Commit:
  ```
  feat(ui): remove Generate Papers button from Teacher & School
  ```
- 3 files changed, +11/-13.
- Pushed to `scanning_verifying_answerpaper`.

## Step 19 — Public Home / Landing page (SRS §2)
- **Backend:** `GET /api/public/stats` (no auth) returns `states`, `districts`, `blocks`, `schools`, `students`, `assessmentsConducted`, `flnCertificationPct`, `lastUpdated`.
- **Frontend:** `src/pages/HomePage.jsx` — public landing page:
  - Top bar with FLN logo + nav (Mission · Reach · Why FLN · Contact) + **Login CTA** in the upper-right.
  - Hero (indigo→violet→fuchsia gradient) with the title *"Foundational Literacy & Numeracy — Assessment for Every Child, at Their Level"* and primary "Sign In to Dashboard" button.
  - **6 statistical cards** (States · Districts · Schools · Students · Assessments · FLN Score) — fetched live from `/api/public/stats`, with a graceful fallback to the mock dataset if the backend is unreachable.
  - **Vision & Mission** split section.
  - **Why FLN matters** knowledge cards (ASER 2023 reading levels, NAS 2021 numeracy, NEP 2020 foundational priority).
  - Dark footer with About / Contact / Legal columns.
- `src/App.jsx`: `/` now resolves to `<HomePage />`; `/login` keeps the existing LoginPage. All 7 dashboards remain wrapped in `RequireAuth`.
- **Verified:** all 9 routes return HTTP 200; only the harmless React Router v7 future-flag warnings remain.
- Commit:
  ```
  feat: add public Home page (SRS §2) with live stats + Login CTA
  ```
- 3 files changed, +292/-1.
- Pushed to `scanning_verifying_answerpaper`.

## Step 20 — Clean up "Reach at a glance" stat cards
- The first Home-page version used a double-nested `<div>` with conflicting `bg-gradient-*` + inline `style.backgroundImage` that produced messy rendering.
- Rewrote to match the existing `SummaryCards` pattern: white card with thin border, small colored icon chip (light bg + matching dark fg), large number, plain label. No gradients, no nested wrappers.
- Same data, much cleaner output.
- Commit:
  ```
  style(home): clean up 'Reach at a glance' stat cards
  ```
- 1 file changed, +18/-12.
- Pushed to `scanning_verifying_answerpaper`.

## Step 21 — Database schema design (docs/db-schema.md)
- New file `docs/db-schema.md` with a full schema layout for the FLN platform.
- Covers all 18 collections from SRS §10:
  - `users` (built) + `states`, `districts`, `blocks`, `schools`, `classes`, `students`
  - `curriculum`, `worksheets`, `answerSubmissions`, `evaluationReports`
  - `certifications`, `svgAssets`, `assetSubstitutionLog`, `promptTemplates`
  - `logbook`, `announcements`, `tickets`
- Each collection entry has fields/types, sample shape, indexes, and the SRS section it implements.
- Includes an ASCII ER overview, relationships summary, and field conventions (human-readable IDs, dual Aadhar pattern, soft-delete via flags, cycle+year everywhere).
- Includes a build-priority order for the Mongoose models.
- Commit:
  ```
  docs: add comprehensive database schema design (db-schema.md)
  ```
- 1 file added, 536 insertions.
- Pushed to `scanning_verifying_answerpaper`.

## Step 22 — Complete Teacher Dashboard redesign (Material-UI inspired)
- New `recharts` dependency for charts.
- New shared layout `src/layouts/TeacherLayout.jsx` (sidebar + topbar) plus `src/components/teacher/TeacherSidebar.jsx` (collapsible, 10 menu items, school context locked at top) and `TeacherTopbar.jsx` (search, current date, notifications, profile avatar).
- All data scoped to **one school** (ABC Public School) and **one teacher** (Anjali Sharma) — no district/state visibility, no admin controls.
- 11 pages built under `src/pages/teacher/`:
  | Page | Highlights |
  |---|---|
  | `TeacherHome` | Welcome banner · 8 summary cards · 4 class cards with CTAs |
  | `MyClasses` | Class cards with stats, progress, Open Class |
  | `ClassDetail` | Info card + Students / Worksheets / Assessments / Reports / Analytics tabs |
  | `Students` | Searchable + filterable + paginated table (id, photo, level, score, progress, status) |
  | `StudentProfile` | Photo, tags, current/target, 8 competency progress bars, AI insights (strengths/weaknesses/recommendations), assessment + worksheet history tables |
  | `PracticeWorksheets` | Generator card + history table with Preview / Download / Regenerate |
  | `Assessments` | Create / Schedule CTAs + table (status, expected vs completed, View / Upload / Results) |
  | `UploadScripts` | Assessment picker · drag-and-drop PDF · animated 5-stage processing timeline · results table with confidence + Review / Reprocess |
  | `Analytics` | Recharts: bar + pie + line charts (Avg Score by Class, FLN Distribution, Concept Mastery, Weekly Worksheets, Monthly Progress) |
  | `Reports` | 5 report types with PDF + Excel export |
  | `Settings` | Profile / Password / Notifications / Theme / Language |
- `src/App.jsx`: `/teacher` now hosts a nested layout with 10 child routes; other role dashboards unchanged.
- **Theme:** white bg, blue `#2563EB` primary, 12px radius, soft shadows, accessible focus states.
- **Verified:** all 11 teacher routes return HTTP 200; only the harmless React Router v7 future-flag warnings.
- Commit:
  ```
  feat(teacher): complete Material-style Teacher Dashboard redesign
  ```
- 17 files added, 1 changed.
- Pushed to `scanning_verifying_answerpaper`.

## Step 32 — Production-ready MongoDB schema (15 collections)
- Implemented all 15 collections per the supplied spec, in `backend-node/src/models/`.
- **Shared** — `enums.js` centralises all role/status/board/medium/question-type/level/assessment-status enums + regex patterns (UDISE+ 11-digit, PINCODE, Indian mobile).
- **Geography** — `State`, `District`, `School` with UDISE+ as unique school key, embedded address, scoped indexes.
- **People** — `User` (bcrypt + firstName/lastName + scope fields + select:false on password + backward-compat hook for the legacy `name` field), `Class`, `Student` (embedded parentDetails + address).
- **Assessment pipeline** — `Assessment` (lifecycle status), `Worksheet` (embedded `Question[]` with `boundingBox` + `regions[]`), `WorksheetAssignment` (junction), `StudentSubmission` (embedded `ExtractedAnswer[]`), `Evaluation` (embedded `levelMastery` + `conceptMastery`), `AIReport`.
- **Auxiliary** — `StudentProgress`, `Notification` (per-teacher, optional TTL), `AuditLog` (append-only by convention).
- **Cross-cutting** — `timestamps: true`, `toJSON` transform strips `__v` + remaps `_id → id`, embedded sub-schemas use `_id: false`, password hashing on User save, indexing optimised for the most common dashboard queries.
- Barrel export (`models/index.js`) and `models/README.md` with embedded-vs-referenced design decisions + index list.
- **Verified** — All 15 models load; all 7 role logins + `/api/me` still work after extending User (backward-compat hook preserves old `name`-only accounts).
- Commit:
  ```
  feat(backend): production-ready MongoDB schema (15 collections)
  ```
- 19 files added, 3 changed.
- Pushed to `scanning_verifying_answerpaper`.

## Step 31 — bbox-aware per-type extraction pipeline
- The previous pipeline pretended Python "magically" knew answers. Rewrote around the correct flow: **crop bbox → dispatch by `qtype` → per-type extractor**.
- **Schema extensions** (`schemas.py`)
  - `BBox` (x, y, w, h in PDF points) + `Region` (labelled sub-region)
  - `Question.qtype` ∈ `handwriting | number | multiple_choice | circle | matching | tick | trace | drawing`
  - `WorksheetTemplate` carries `page_w`/`page_h` so coords are unambiguous
  - `Question.regions[]` for circle/matching/tick questions
- **Stage 1 — extraction**
  - `icr/pdf_converter.py` — `pdf2image` at 200 DPI
  - `icr/cropper.py` — converts PDF points → pixel crop with bounds-clamping
  - `extractors/` — one module per qtype:
    | qtype | Production algorithm |
    |---|---|
    | handwriting | Tesseract / PaddleOCR → text |
    | number | OCR → numeric (validated in `compare()`) |
    | multiple_choice | per-bubble **fill density** |
    | circle | **HoughCircles** + region-overlap |
    | matching | **HoughLinesP** + endpoint-region mapping |
    | tick | per-checkbox **inner-stroke ink density** |
    | trace | skeletonize + **Hausdorff** distance to expected_signature |
    | drawing | small CNN / CLIP zero-shot classifier |
- **Stage 2 — marking** (`scoring/comparator.py`) updated to switch on `qtype` for all 8 types.
- **Sample data** — `worksheet_template.json` with bboxes + regions for all 5 new types; `scanned_sheets.json` updated with per-student per-extractor answers.
- **New HTTP endpoint** — `POST /extract-and-evaluate` (multipart: `pdf` + `template` JSON) runs Stage 1 + Stage 2 in one call.
- **Verified end-to-end**
  | Student | Score | Level |
  |---|---|---|
  | STU-001 (topper) | 5/6 (83%) | L3 · L3 |
  | STU-002 (average) | 2/6 (33%) | L3 · L3 |
  | STU-003 (struggling) | 1/6 (17%) | L2 → L1 |
  - Level-Flag (R-15) flagged `Q2, Q3, Q5`.
  - Each report shows which extractor handled which question (`handwriting-ocr-demo`, `circle-detector-demo`, `matching-line-demo`, `tick-detector-demo`, `drawing-classifier-demo`).
- README rewritten with the bbox-crop-then-dispatch flow.
- Commit:
  ```
  feat(automation): bbox-aware per-type extraction pipeline
  ```
- 21 files changed.
- Pushed to `scanning_verifying_answerpaper`.

## Step 30 — Python Evaluation Pipeline (FastAPI)
- Scaffolded the `/automation` Python service per **SRS §5 / §9 Stage 1–3**: scanned PDF → ICR/OCR → compare with answer key → per-question marks → concept mastery → level progression → narrative report.
- **Modules**
  - `schemas.py` — Pydantic models matching SRS §12.1 (Question, WorksheetTemplate, ExtractedSheet, EvaluationReport, PerQuestionResult, ConceptMastery, LevelProgression).
  - `icr/extract.py` — OCR loader + `simulate_ocr_sheet()` for demos.
  - `scoring/comparator.py` — `compare()` handling all 4 answer types:
    - `multiple_choice` — exact letter match
    - `number` — ±tolerance with **partial credit** within 2× tolerance
    - `text` — NFKD-normalized + punctuation-stripped lowercase
    - `drawing` — flagged for manual review (CV pipeline placeholder)
  - `scoring/aggregator.py` — concept mastery banding, strengths/weaknesses, mistake patterns (carry/borrowing/money), level progression, **Level-Flag rule (R-15)**.
  - `reports/narrative.py` — AI-style narrative paragraph.
  - `pipeline.py` — `evaluate_student()` / `evaluate_class()` orchestrator.
  - `main.py` — FastAPI app (`GET /health`, `POST /evaluate`, `POST /evaluate/synthetic`).
- **Sample data**
  - `sample/answer_key.json` — 15-question Class-2 Mid-Year paper (Number Sense, Addition, Subtraction, Shapes, Money, Time, Patterns, Drawing).
  - `sample/scanned_sheets.json` — 3 student OCR outputs (topper / average / struggling).
- **Verified end-to-end**:
  | Student | Score | Level |
  |---|---|---|
  | STU-001 (topper) | 14/15 (93%) | L3 → **L4** |
  | STU-002 (average) | 10/15 (67%) | L3 · L3 |
  | STU-003 (struggling) | 6/15 (40%) | L2 → **L1** |
  - Level-Flag (R-15) flagged `Q3, Q9` (>50% failed despite "easy" tag).
- CLI runner `test_pipeline.py` and `README.md` with HTTP examples + Node wiring sketch.
- venv + .gitignore keep Python out of git.
- Commit:
  ```
  feat(automation): Python evaluation pipeline (FastAPI + sample paper)
  ```
- 12 files added, 1 changed.
- Pushed to `scanning_verifying_answerpaper`.

## Step 29 — Replace My Classes card grid with a clean row list
- The dashboard "My Classes" section was 4 small cards with status pills, mastery bars, and 4 buttons each — too busy.
- Replaced with a **single clean row list** (Google-Classroom / Notion-style) inside one rounded card:
  ```
  CLASS              STUDENTS  AVG SCORE  LEVEL   STATUS      →
  Class 2 · A          32       82%      L3.2    On Track
  Class 2 · B          30       76%      L2.9    Steady
  …
  ```
- Each row: colored tone-dot · class name · section · values · status pill · hover-revealed arrow link.
- Tone colors auto-derived from the class's avg score (emerald / blue / amber / rose).
- Hover: row tints + the arrow icon turns dark-slate.
- Mobile fallback row line shows everything in one place.
- Welcome banner simplified to one heading + one sentence.
- Summary cards trimmed (smaller icon, no trend line) so the My Classes list becomes the focal point.
- Commit:
  ```
  style(teacher): replace My Classes card grid with a clean row list
  ```
- 1 file changed, +106/-145.
- Pushed to `scanning_verifying_answerpaper`.

## Step 28 — Clean up "My Classes" section on the main Dashboard
- Rewrote the class cards in `src/pages/teacher/TeacherHome.jsx` to match the cleaner visual language used elsewhere:
  - Left accent strip (1px gradient) tone-derived from avg score (emerald / blue / amber / rose).
  - Hover: shadow lift + 0.5px translate + border darkening.
  - Tight header: `CLASS · SECTION B` eyebrow + class title, tone-colored status pill on the right (On Track / Steady / Watch / Needs Attention).
  - Inline metric strip (Students · Avg · Level) separated by vertical dividers — no boxed pills.
  - Gradient mastery bar.
  - Footer: tiny "Generate" link on the left, dark "Open →" pill on the right.
- Dropped the four action buttons from each card (View Class / Generate Worksheets / Create Assessment / Upload Scripts) — the class card is a glance card, not a launcher grid.
- "Create Assessment" entirely removed (project policy — assessments are announced).
- Welcome banner now shows a "Needs attention" chip on the right that auto-picks the lowest-scoring class.
- Commit:
  ```
  style(teacher): clean up My Classes section on the main dashboard
  ```
- 1 file changed, +132/-87.
- Pushed to `scanning_verifying_answerpaper`.

## Step 27 — Revert My Classes page to the previous version
- Per user request, the redesigned My Classes page (Step 25) is rolled back to the original Step 22 layout.
- `frontend-react/src/pages/teacher/MyClasses.jsx` reverted to commit `7fcc1ea` — straight 2-col grid of class cards with the original boxed stat tiles (Students / Avg Score / Assessments / Worksheets), mastery bar, and a single "Open Class →" button.
- Commit:
  ```
  revert(teacher): revert My Classes page to the previous version
  ```
- 1 file changed, +56/-149.
- Pushed to `scanning_verifying_answerpaper`.

## Step 26 — Extend submission window to 24 hours
- Per project policy, the submission window is now **24 hours** after the exam ends (vs SRS §6.4's 1-hour default).
- `src/utils/examPhase.js` — `submission_window` condition widened from `-1h 45min` to `-24h`; remaining-time label now shows hours+minutes (e.g. *"Submission window · 18h 24m remaining"*).
- `src/pages/teacher/Assessments.jsx` — header copy + timing-rules legend updated.
- `src/pages/teacher/UploadScripts.jsx` — locked-guard copy updated.
- Commit:
  ```
  fix(teacher): extend submission window from 1 hour to 24 hours
  ```
- 3 files changed, +13/-10.
- Pushed to `scanning_verifying_answerpaper`.

## Step 25 — Redesign My Classes page (cleaner, premium look)
- Rewrote `src/pages/teacher/MyClasses.jsx` with a more breathable, Notion/Linear-style layout.
- **Page summary strip** above the grid: `"4 classes · 132 students"` + class-average score (tone-colored) + secondary actions (View as list, All Students).
- **2-column responsive grid** of class cards.
- **Card improvements**
  - Left accent strip (1px gradient) whose color is tone-derived from avg score (emerald / blue / amber / rose).
  - Soft hover: shadow lift + 0.5px translate-up + border darkening.
  - Clean header: small "Class · Section B" eyebrow, bold title "Class 3 · Section B", teacher underneath; status pill (On Track / Steady / Watch / Needs Attention) on the right with ring styling.
  - Three metrics (Students / Avg Score / FLN Level) in a `divide-x` strip — no boxed pills, just typographic hierarchy. Values tone-colored for Avg Score + FLN Level.
  - Gradient mastery bar with smooth width transition.
  - Footer: secondary text links (Roster · Reports) on the left, dark "Open Class →" button on the right that turns blue on hover.
- Commit:
  ```
  style(teacher): redesign My Classes page — cleaner, premium look
  ```
- 1 file changed, +149/-56.
- Pushed to `scanning_verifying_answerpaper`.

## Step 24 — Time-gate Download / Upload + remove Create Assessment
- Per project policy + SRS §6.4: teachers no longer create assessments, they're announced.
- **Download Question Paper** now enabled only during the **1-day-before → exam-start** print window.
- **Upload Answer Scripts** now enabled only during the **post-exam-end + 1 hour** submission window.
- New `src/utils/examPhase.js` with `getExamPhase(date)` returning one of `too_early | print_window | exam_window | submission_window | closed` plus `canDownload` / `canUpload` flags.
- `assessments` mock data now generated as a function so demo rows land in each phase (12h away, 15 min away, 1h ago, 2h ago, 65 days away) regardless of when opened.
- **Assessments page** — removed Create/Schedule CTAs; each row shows a phase badge + Lock-styled disabled button when action isn't currently allowed.
- **ClassDetail → Assessments tab** — same gating applied.
- **UploadScripts page** — reads `?assessment=…` from the query; shows an amber "Upload locked" guard when the chosen assessment isn't in the submission window.
- Timing-rules legend added at the bottom of the Assessments page.
- Commit:
  ```
  feat(teacher): time-gate download/upload per SRS §6.4 + remove Create
  ```
- 5 files changed, +382/-97.
- Pushed to `scanning_verifying_answerpaper`.

## Step 23 — Add "Download Question Paper" button (4 places)
- Teachers need to print question papers before the exam (SRS §6.4 — 1-hour print window).
- Added a prominent **Download Question Paper** button in:
  - **`/teacher/assessments`** — primary action on every assessment row (blue button + icon).
  - **`/teacher/worksheets`** — clearer "Download" label on each history row.
  - **`/teacher/classes/:classId` → Question Papers tab** — real worksheet history per class with per-row Download.
  - **`/teacher/classes/:classId` → Assessments tab** — per-assessment Download Question Paper button.
- Renamed the ClassDetail "Worksheets" tab to **"Question Papers"** to match the user's mental model and SRS terminology.
- Replaced empty `SimpleTab` placeholders with real data tables.
- Handler is currently `console.log + alert` — ready to wire to `POST /api/assessments/:id/paper.pdf` once the backend route exists.
- Commit:
  ```
  feat(teacher): add Download Question Paper button in 4 places
  ```
- 3 files changed, +145/-27.
- Pushed to `scanning_verifying_answerpaper`.

### Sample credentials (password: `Welcome1!`)
| Role | Email |
|---|---|
| Superadmin | `superadmin@fln.org` |
| Admin (State) | `admin.pb@fln.org` |
| District Admin | `district.ldh@fln.org` |
| Block Admin | `block.ldh-01@fln.org` |
| School Principal | `gps-mt-001@fln.org` |
| Teacher | `gps-mt-001.t01@fln.org` |
| Volunteer | `vol.rahul@fln.org` |

---

## Open follow-ups (not yet implemented)

- [ ] Remove the role selector on login (SRS §3.2 A-1 forbids it).
- [ ] Add email-domain validation `@fln.org` (SRS §3.2 A-2).
- [ ] Per-student detail drawer (level history + last report).
- [ ] Schools / Students / Worksheets / AnswerSubmissions / EvaluationReports / Tickets models.
- [ ] Generation-Lock Service + Delayed-Attempt/Defaulter Engine on backend (§13.2 R-11, R-12).
- [ ] ICR scan interface (§8) in frontend + `/api/evaluation/submit`.
- [ ] Python automation services (`/automation`) for generation/evaluation.
- [ ] Curriculum Markdown files under `/curriculum/levels/`.
- [ ] Pre-built SVG asset library under `/assets/svg/`.
- [ ] Re-attach the login-page design photo so UI matches the intended mock-up.
