# Backend — FLN Platform (Node + Express + MongoDB)

Express orchestration layer for the FLN Assessment & Personalized Worksheet Platform. Mirrors the layers described in **SRS §5 (System Architecture)**.

## Stack

| Concern | Library |
|---|---|
| HTTP server | `express` |
| ODM | `mongoose` |
| Auth | `jsonwebtoken` + `bcryptjs` |
| CORS | `cors` |
| Logging | `morgan` |
| Config | `dotenv` |

## Folder layout

```
backend-node/
├── src/
│   ├── config/db.js           — Mongo connection (mongoose)
│   ├── models/User.js         — User schema (all 7 roles)
│   ├── controllers/           — request handlers (authController, ...)
│   ├── routes/                — authRoutes, systemRoutes
│   ├── middleware/auth.js     — requireAuth / requireRole
│   └── server.js              — entry point
├── .env.example               — sample env vars
├── .gitignore
└── package.json
```

## Prerequisites

1. **Node.js 18+** (`node -v`).
2. **MongoDB 6+** running locally (or change `MONGO_URI` to a remote cluster).

## Quick start

```bash
cd backend-node
cp .env.example .env          # tweak JWT_SECRET / MONGO_URI as needed
npm install
npm run dev                   # node --watch src/server.js
```

Server boots on `http://localhost:5000`.

## MongoDB Compass connection

This backend uses the database name **`fln`** on port **`27017`** by default.

1. Open **MongoDB Compass**.
2. Use this connection string in the **New Connection** dialog:

   ```
   mongodb://127.0.0.1:27017/fln
   ```

3. Click **Connect**. You should now see the `fln` database. After the first user registers, the `users` collection will appear.
4. To inspect a single document, double-click the collection.

If MongoDB was started in the background (no auth), the default URI above is sufficient. To use a remote cluster, set `MONGO_URI` in `.env`, e.g.:

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fln
```

## REST endpoints

| Method | Path                | Auth   | Purpose |
|--------|---------------------|--------|---------|
| GET    | `/`                 | —      | Health/info |
| GET    | `/api/health`       | —      | Health probe (`{"ok": true}`) |
| GET    | `/api/me`           | JWT    | Echo back current user payload |
| POST   | `/api/auth/login`   | —      | `{ email, password, role? }` → `{ token, user }` |
| POST   | `/api/auth/register`| —      | Provisioning only (Superadmin/Admin) — `{ name, email, password, role }` |

### Example: login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gps-mt-001.t01@fln.org","password":"Welcome1!","role":"teacher"}'
```

### Example: create the first Superadmin

The first Superadmin is bootstrapped via a CLI seed script (no public registration endpoint exists by design — per SRS §1.3 / R-1).

```bash
npm run seed:superadmin                      # uses defaults: superadmin@fln.org / Welcome1!
# or pass overrides:
node src/scripts/seedSuperadmin.js admin@fln.org Welcome1! "Root Admin"
```

After the first Superadmin exists, that Superadmin (or any Admin) can provision further accounts by calling `POST /api/auth/register` with their JWT in the `Authorization: Bearer <token>` header — the endpoint is locked to `superadmin` / `admin` roles via middleware.

## Roles (SRS §4)

`superadmin`, `admin`, `district_admin`, `block_admin`, `school`, `teacher`, `volunteer`.

## What this gives you now

- Express app that boots, connects to MongoDB, exposes `/api/auth/*` and `/api/me`.
- Mongoose `User` model with all 7 roles, soft `isActive`, defaulter tracking fields (`delayedAttempts`, `isDefaulter`).
- JWT auth middleware (`requireAuth`, `requireRole`) ready for future role-restricted routes (e.g. `POST /api/assessments/generate`).
- Error handler at the bottom of the stack.

## What is still TODO

- Schools / Students / Worksheets / AnswerSubmissions / EvaluationReports / Worksheets / Tickets models.
- Generation-Lock Service (§13.2 R-11).
- Delayed-Attempt/Defaulter Engine (§6.5, R-12).
- ICR scan ingestion route.
- CORS tightening per env.
- Bcrypt rounds / rate-limit on `/auth/login`.
