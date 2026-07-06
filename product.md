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
