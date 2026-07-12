# FLN — National Super Admin Dashboard (MERN)

A production-ready, nationwide **Super Admin Dashboard** for the AI-Powered FLN (Foundational Literacy & Numeracy) Assessment Platform. Built with a pure MERN stack.

![Status](https://img.shields.io/badge/status-live-blue)
![Stack](https://img.shields.io/badge/stack-MERN-blue)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## 🌟 Overview

The **National Super Admin** has access to the entire India database — every state, union territory, district, school, teacher, student, and assessment. This dashboard delivers nationwide analytics with drill-down, AI-powered assessment template generation, and full administrative control.

### Highlights

- **28 States/UTs** · **700+ Districts** · **1.2M+ Students** · **4,000+ Assessments**
- **13 stat cards** + **9 chart types** + **interactive India map**
- **AI Assessment Template Generator** with 4-phase pipeline (upload → process → review → approve)
- **13 module pages**: States, Districts, Schools, Teachers, Students, Assessments, AI Templates, Reports, Users, Audit Logs, Settings, Profile, Login
- **Reusable UI library**: 15 components · dark-mode ready · fully responsive
- **Production build**: 928 KB JS / 49 KB CSS gzipped

---

## 🚀 Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.6 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **Tailwind CSS** | 4.0 | Styling |
| **React Router** | 6.26 | Routing |
| **TanStack Query** | 5.59 | Data fetching & caching |
| **Axios** | 1.7 | HTTP client |
| **Framer Motion** | 11.11 | Animations |
| **Recharts** | 2.15 | Charts |
| **Lucide Icons** | 0.441 | Icon system |
| **React Hot Toast** | 2.4 | Notifications |

### Backend
| Tech | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.19 | Web framework |
| **MongoDB** | 8.x | Database (via Mongoose 8.5) |
| **JWT** | 9.0 | Authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **Morgan** | 1.10 | Request logging |
| **CORS** | 2.8 | Cross-origin support |

---

## 📂 Folder Layout

```
FLN-Project/fln/
├── frontend/                           ← React + TS + Tailwind v4  (port 5173)
│   ├── src/
│   │   ├── main.tsx                    ← App bootstrap (QueryClient, Toaster, Theme, Auth providers)
│   │   ├── App.tsx                     ← Router (13 routes)
│   │   ├── index.css                   ← Tailwind + custom design system
│   │   ├── vite-env.d.ts
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx     ← Sidebar + Topbar + Breadcrumb shell
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx         ← JWT auth state
│   │   │   └── ThemeContext.tsx        ← Light/dark mode
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                  ← Axios instance with JWT interceptor
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                ← TypeScript interfaces (User, State, District, ...)
│   │   │
│   │   ├── mocks/
│   │   │   └── data.ts                 ← Realistic India mock data
│   │   │
│   │   ├── data/
│   │   │   └── indiaMap.ts             ← State coordinates + score color scale
│   │   │
│   │   ├── components/
│   │   │   ├── auth/RequireAuth.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx         ← 13-item nav + collapsible User Management
│   │   │   │   ├── Topbar.tsx          ← Search, notifications, profile, theme
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── tables/
│   │   │   │   └── DataTable.tsx       ← Generic sortable/filterable/paginated table
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Drawer.tsx
│   │   │       ├── Skeleton.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── StatusChip.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── ConfirmDialog.tsx
│   │   │       ├── PageHeader.tsx
│   │   │       └── Toolbar.tsx
│   │   │
│   │   └── pages/
│   │       ├── Login/LoginPage.tsx                              ← Branded two-panel
│   │       ├── Dashboard/DashboardOverview.tsx                  ← 13 cards + 9 charts + India map
│   │       ├── States/StatesPage.tsx
│   │       ├── Districts/DistrictsPage.tsx
│   │       ├── Schools/SchoolsPage.tsx
│   │       ├── Teachers/TeachersPage.tsx
│   │       ├── Students/StudentsPage.tsx
│   │       ├── Assessments/AssessmentsPage.tsx                  ← + Create modal
│   │       ├── AssessmentTemplateGenerator/AssessmentTemplateGeneratorPage.tsx  ← 4-phase AI workflow
│   │       ├── Reports/ReportsPage.tsx                          ← 7 report levels + exports
│   │       ├── Users/UsersPage.tsx                              ← 5 role segments
│   │       ├── AuditLogs/AuditLogsPage.tsx
│   │       ├── Settings/SettingsPage.tsx                        ← 5 sections
│   │       └── Profile/ProfilePage.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                            ← Express + MongoDB API  (port 5000)
│   ├── src/
│   │   ├── server.js                   ← Express bootstrap (CORS, JSON, routes)
│   │   ├── config/db.js                ← Mongoose connect
│   │   ├── controllers/authController.js
│   │   ├── middleware/auth.js          ← requireAuth + requireRole
│   │   ├── models/
│   │   │   ├── User.js                 ← Mongoose schema (bcrypt hash)
│   │   │   └── enums.js                ← ROLES constant
│   │   ├── routes/authRoutes.js        ← POST /login, GET /me
│   │   └── scripts/seedSuperadmin.js   ← Provisions default superadmin
│   ├── package.json
│   └── .env.example
│
├── SRS.md                              ← Upstream Software Requirements Specification
├── .gitignore
└── README.md                           ← This file
```

---

## 🗄️ Database

This branch uses an **isolated** MongoDB database: **`fln_answerkey`**

```
mongodb://127.0.0.1:27017/fln_answerkey
```

The previous branch's `fln` database is **not touched**. Collections in `fln_answerkey`:
- `users` — seeded with one superadmin

---

## ⚙️ Setup & Run

### Prerequisites

- **Node.js** 18 or later
- **MongoDB** running locally (or via Docker: `docker run -p 27017:27017 mongo`)
- **npm** 9+

### Backend

```bash
cd backend
cp .env.example .env              # then edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed:superadmin           # creates superadmin@fln.org / Welcome1!
npm run dev                       # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env              # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                       # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@fln.org` | `Welcome1!` |

---

## ✨ Features

### 🏠 Dashboard (`/dashboard`)
- **13 stat cards**: States, UTs, Districts, Blocks, Schools, Teachers, Students, Assessments, Answer Scripts, AI Templates, Avg Score, Completion Rate, Active Sessions
- **9 chart types**: bar, line, area, pie, radar, horizontal bar — built with Recharts
- **Interactive India map** (SVG) with color-coded state circles, click-to-drill-down panel
- Top 5 performing states + Lowest 5 with progress bars
- Year-over-year trend cards

### 🗺️ Module Pages (13 total)
- **States** — list with score-colored progress bars
- **Districts** — list with filters
- **Schools** — UDISE, type, principal, status
- **Teachers** — subjects, classes, assessments conducted
- **Students** — attendance progress, latest assessment
- **Assessments** — type, subject, grade, status, **Create modal**
- **AI Template Generator** — 4-phase pipeline (Upload → Process → Review → Approve) with animated progress and editable question fields
- **Reports & Analytics** — 7 report levels (National/State/District/School/Teacher/Student/Assessment) + PDF/Excel exports
- **User Management** — 5 role segments with actions (edit, email, reset pwd, activate)
- **Audit Logs** — user, module, action, IP, status
- **System Settings** — 5 sections (Academic / AI / Email / Storage / Security)
- **Profile** — gradient header, contact info, permissions, activity timeline
- **Login** — branded two-panel layout

### 🎨 Design System
- **Light theme** default · **dark mode** ready (toggle in topbar)
- **Material-inspired** rounded cards (12px radius)
- **Blue + White** palette (`#2563EB` primary)
- **Soft shadows** + smooth transitions
- **Toast notifications** (react-hot-toast)
- **Modal + Drawer** for forms
- **Skeleton loaders** + empty states + error states
- **Fully responsive** desktop / tablet / mobile

---

## 🧩 Reusable UI Library

| Component | Description |
|---|---|
| `Button` | 5 variants × 4 sizes, loading state, icon slots |
| `Card` | Title/subtitle/action header, optional no-padding |
| `Badge` | 6 tones with optional dot |
| `StatCard` | Icon, value, change indicator with tone |
| `StatusChip` | Auto-mapped status → tone + label |
| `ProgressBar` | Auto-colored based on value |
| `Modal` | Framer-Motion animated, escape-to-close |
| `Drawer` | Right-side slide-in, customizable width |
| `ConfirmDialog` | Pre-built confirmation wrapper |
| `Input` | Label, error, hint, left/right icon slots |
| `Select` | Custom chevron, label, error |
| `Skeleton` + helpers (`SkeletonText`, `SkeletonCard`, `SkeletonTable`) |
| `EmptyState` + `ErrorState` |
| `DataTable` | Generic `<T>`, sortable, searchable, paginated, clickable rows |
| `Toolbar` | Filters + Refresh + Export CSV/Excel/PDF + Add New |
| `PageHeader` | Title + subtitle + actions |

---

## 📊 Mock Data

Realistic India-scale data is generated in `frontend/src/mocks/data.ts`:

| Entity | Count |
|---|---|
| States + Union Territories | 24 |
| Districts | 100+ |
| Schools | 400+ |
| Teachers | 200+ |
| Students | 600+ |
| Assessments | 7 |
| Users | 24 |
| Audit logs | 40 |

---

## ✅ Build Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ passes (TypeScript strict mode) |
| `npx vite build` | ✅ 928 KB JS / 49 KB CSS gzipped |
| `GET /api/health` | ✅ 200 OK |
| `POST /api/auth/login` | ✅ JWT returned |

---

## 🔧 Development Scripts

### Frontend
```bash
npm run dev         # Vite dev server with HMR
npm run build       # tsc -b && vite build
npm run preview     # Preview production build
npm run typecheck   # tsc -b --noEmit
```

### Backend
```bash
npm start           # node src/server.js
npm run dev         # nodemon src/server.js
npm run seed:superadmin
```

---

## 🛣️ Roadmap

- [ ] Real backend endpoints for dashboard modules (currently using mock data)
- [ ] Live Gemini API integration for AI Template Generator
- [ ] PDF/Excel export handlers
- [ ] State admin / district admin / school admin dashboards
- [ ] Teacher dashboard (already designed in the older branch)
- [ ] Student/parent portal
- [ ] Real-time notifications via WebSocket
- [ ] Mobile app (React Native)

---

## 📜 License

ISC

---

## 🙏 Acknowledgements

- Upstream SRS: `vicharanashala/fln` · [SRS.md](./SRS.md)
- Icons: [Lucide](https://lucide.dev)
- Charts: [Recharts](https://recharts.org)
- Animations: [Framer Motion](https://www.framer.com/motion/)