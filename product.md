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

---

## Open follow-ups (not yet implemented)

- [ ] Backend (`backend-node/`): Express + MongoDB + JWT + role middleware (§3, §13).
- [ ] Login page (§3) wired to `/api/auth/login` (replace mock validation).
- [ ] Per-student detail drawer (level history + last report).
- [ ] Generation-Lock Service + Delayed-Attempt/Defaulter Engine on backend (§13.2 R-11, R-12).
- [ ] ICR scan interface (§8) in frontend.
- [ ] Python automation services (`/automation`) for generation/evaluation.
- [ ] Curriculum Markdown files under `/curriculum/levels/`.
- [ ] Pre-built SVG asset library under `/assets/svg/`.
- [ ] Re-attach the login-page design photo so UI matches the intended mock-up.
