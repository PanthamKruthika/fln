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

---

## Open follow-ups (not yet implemented)

- [ ] Wire frontend `LoginPage` to real `POST /api/auth/login` (replace mock validation).
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
