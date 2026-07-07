# MongoDB Schema — FLN Platform

Production-ready Mongoose models for all 15 collections.

```
backend-node/src/models/
├── index.js                      # barrel export
├── enums.js                      # shared enum constants + regex patterns
├── State.js
├── District.js
├── School.js                     # embedded address
├── User.js                       # bcrypt + firstName/lastName; backward-compat hook
├── Class.js
├── Student.js                    # embedded parentDetails + address
├── Assessment.js
├── Worksheet.js                  # embedded Question[] with boundingBox
├── WorksheetAssignment.js        # junction (worksheet ↔ student)
├── StudentSubmission.js          # embedded ExtractedAnswer[]
├── Evaluation.js                 # embedded levelMastery + conceptMastery maps
├── AIReport.js
├── StudentProgress.js
├── Notification.js
└── AuditLog.js
```

## ER overview

```
                              State (1)
                                │
                                ▼
                            District (N)
                                │
                                ▼
                             School (N)
                          ┌─────┼─────┐
                          ▼     ▼     ▼
                       User   Class  Student
                       (N)    (N)    (N)
                               │       │
                               ▼       │
                            Student ──┘
                       (1:N per class)

            Assessment (1)
                │
                ├───► Worksheet (1)
                │         │
                │         └──► embedded Question[] (with boundingBox)
                │
                ├───► WorksheetAssignment (N) ─► Student (N)
                │     (junction — many students per worksheet)
                │
                └───► StudentSubmission (N per student)
                          │
                          ├──► embedded ExtractedAnswer[]
                          │
                          ▼
                       Evaluation (1 per submission)
                          ├── embedded levelMastery
                          ├── embedded conceptMastery
                          │
                          ├──► AIReport (1)
                          └──► StudentProgress (1)

              Notification ──► User (teacher)
              AuditLog     ──► User (any)
```

## Design decisions

### Embedded vs referenced

| Embedded in parent | Why |
|---|---|
| `School.address` | Single row, always read with the school, no separate lifecycle |
| `Student.parentDetails` | Single row, always printed on reports |
| `Student.address` | Same as parentDetails |
| `Worksheet.questions[]` | Immutable per `templateVersion`, loaded together with the worksheet, ICR pipeline needs `correctAnswer` + `bbox` side-by-side |
| `StudentSubmission.extractedAnswers[]` | Small (~20 items), produced and discarded with the submission |
| `Evaluation.levelMastery` / `conceptMastery` | Always queried as one block |
| `User.firstName/lastName` | Always used together; fullName virtual derives |

| ObjectId-referenced | Why |
|---|---|
| State → District → School → Class → Student | Standard hierarchy join, each level has its own lifecycle |
| User → School / District / State | User profile, scoped lookups |
| Assessment → Worksheet → WorksheetAssignment → StudentSubmission → Evaluation → AIReport | Linear flow, each step has separate queries |
| WorksheetAssignment.worksheetId + .studentId | Many-to-many needs a junction, not embedding |

### Indexes

| Collection | Key compound indexes |
|---|---|
| State | `{ stateCode: 1 }` unique, `{ status: 1, stateName: 1 }` |
| District | `{ stateId: 1, districtCode: 1 }` unique |
| School | `{ udiseCode: 1 }` unique, `{ districtId: 1, academicYear: 1, status: 1 }` |
| User | `{ email: 1 }` unique, `{ schoolId: 1, role: 1, isActive: 1 }`, `{ districtId: 1, role: 1 }`, `{ stateId: 1, role: 1 }` |
| Class | `{ schoolId: 1, grade: 1, section: 1, academicYear: 1 }` unique |
| Student | `{ studentId: 1 }` unique, `{ classId: 1, rollNumber: 1 }` unique, `{ classId: 1, academicYear: 1, status: 1 }` |
| Assessment | `{ classId: 1, assessmentDate: 1 }`, `{ teacherId: 1, status: 1 }` |
| Worksheet | `{ worksheetId: 1 }` unique, `{ assessmentId: 1, templateVersion: 1 }` |
| WorksheetAssignment | `{ worksheetId: 1, studentId: 1 }` unique |
| StudentSubmission | `{ worksheetId: 1, studentId: 1 }` unique |
| Evaluation | `{ submissionId: 1 }` unique, `{ studentId: 1, evaluationDate: -1 }` |
| AIReport | `{ evaluationId: 1 }` unique |
| StudentProgress | `{ studentId: 1, assessmentDate: -1 }` |
| Notification | `{ teacherId: 1, isRead: 1, createdAt: -1 }` (+ optional TTL on `expiresAt`) |
| AuditLog | `{ module: 1, at: -1 }`, `{ userId: 1, at: -1 }`, `{ action: 1, at: -1 }` |

### Security

- **User.password** — `select: false` (never returned by default queries), pre-save bcrypt hash, regex validator enforces SRS §3.2 A-3 policy.
- **AuditLog** — append-only by convention; no `update`/`delete` routes should be exposed.
- **Password policy** — 8+ chars, 1 uppercase, 1 digit, 1 special (enforced at the schema + controller).

### Backward compatibility

The old `User.name` field is auto-split into `firstName` / `lastName` by a pre-validate hook, so existing seeded accounts continue to work.

### ER Diagram (text)

```
State ──┬──> District ──┬──> School ──┬──> Class ──┬──> Student
        │               │             │             │
        │               │             └─> User (Principal)
        │               │                   
        │               └──> User (School Admin)
        │
        └──> User (State Admin)
                               
        User (District Admin, Block Admin) ──┐
                                               │
User (Teacher, Volunteer) ──> Class          │
User (Teacher) ──> WorksheetAssignment ──> Student
                          │
                          ▼
                       Worksheet ──> Question[]
                          │
                          ▼
                  StudentSubmission ──> ExtractedAnswer[]
                          │
                          ▼
                      Evaluation ──> levelMastery + conceptMastery
                          │
                          ├──> AIReport
                          └──> StudentProgress
```

## How to use

```js
import mongoose from "mongoose";
import { State, School, User, Worksheet } from "./src/models/index.js";

// seed
await State.create({ stateCode: "PB", stateName: "Punjab" });
await School.create({ schoolName: "...", udiseCode: "03010100101", ... });
await User.create({ firstName: "...", lastName: "...", email: "...", password: "...", role: "teacher", schoolId: ... });
await Worksheet.create({ worksheetId: "WS-001", assessmentId, questions: [...] });

// query
const states = await State.find({ status: "active" });
const teachers = await User.find({ role: "teacher", schoolId: school._id, isActive: true });
```

## Verified

- All 15 models load (Node syntax check + dynamic import).
- All 7 role logins still work with the extended User schema (backward-compat hook preserves old `name`-only accounts).