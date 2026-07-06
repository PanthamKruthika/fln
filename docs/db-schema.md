# Database Schema Design — FLN Platform

MongoDB schema for the FLN Assessment & Personalized Worksheet Platform.
Derived from **SRS §10 (Database Collections)** and §4 (User Roles & Hierarchy).

**Database name:** `fln`
**Connection:** `mongodb://127.0.0.1:27017/fln` (see `backend-node/README.md`)

---

## ER overview

```
                    ┌─────────────┐
                    │   States    │
                    └──────┬──────┘
                           │ 1
                           │
                    ┌──────▼──────┐
                    │  Districts  │
                    └──────┬──────┘
                           │ 1
                           │
                    ┌──────▼──────┐
                    │   Blocks    │
                    └──────┬──────┘
                           │ 1
                           │
                    ┌──────▼──────┐
        ┌──────────►│   Schools   │◄──────────┐
        │           └──┬───────┬──┘           │
        │            1 │       │ 1             │
        │              │       │               │
        │       ┌──────▼──┐ ┌──▼────────┐ ┌───▼────┐
        │       │ Classes │ │ Volunteers│ │Teachers│
        │       └────┬────┘ └───────────┘ └────┬───┘
        │            │ 1                       │
        │            │                         │
        │       ┌────▼─────┐                   │
        └───────┤ Students │◄──────────────────┘
                └────┬─────┘
                     │ N
                     ▼
        ┌────────────────────────────┐
        │ Worksheets (per student,   │
        │ per class, per cycle)      │
        └────┬───────────────────────┘
             │ 1
             ▼
        ┌────────────────────────────┐
        │ AnswerSubmissions (ICR)    │
        └────┬───────────────────────┘
             │ 1
             ▼
        ┌────────────────────────────┐
        │ EvaluationReports          │
        └────────────────────────────┘

Users (all 7 roles) ──── Logbook ──── all actions
Curriculum       ────  PromptTemplates
SVGAssets        ────  AssetSubstitutionLog (per missing asset)
Tickets          ──── Superadmin review queue
Announcements    ──── broadcast channel
Certifications   ──── per student, when competencies complete
```

---

## Collections

### 1. `users` ✅ *(already built)*

All 7 role accounts. Already implemented in `backend-node/src/models/User.js`.

```js
{
  _id: ObjectId,
  name: String,             // required
  email: String,            // required, unique, lowercase
  password: String,         // bcrypt hash
  role: String,             // enum: superadmin | admin | district_admin
                           //        | block_admin | school | teacher | volunteer

  scope: {
    stateId:   String,      // e.g. "PB"
    districtId:String,      // e.g. "LDH"
    blockId:   String,      // e.g. "LDH-01"
    schoolId:  String,      // e.g. "gps-mt-001"
    classes:   [String],    // class IDs (for Teacher)
  },

  isActive:        Boolean, // soft-disable
  delayedAttempts: Number,  // §6.5 defaulter engine counter
  isDefaulter:     Boolean, // true → banned next academic year
  lastLoginAt:     Date,

  createdAt: Date,
  updatedAt: Date,
}
// indexes: { email: 1 unique }, { role: 1 }, { "scope.schoolId": 1 }
```

---

### 2. `states`

```js
{
  _id: ObjectId,
  code: String,        // unique, e.g. "PB", "HR", "UP"
  name: String,        // "Punjab"
  adminUserId: ObjectId, // ref → users (role=admin)
}
// indexes: { code: 1 unique }
```

### 3. `districts`

```js
{
  _id: ObjectId,
  code: String,        // "LDH"
  name: String,        // "Ludhiana"
  stateId: ObjectId,   // ref → states
  adminUserId: ObjectId, // ref → users (role=district_admin)
}
// indexes: { stateId: 1, code: 1 } unique compound
```

### 4. `blocks`

```js
{
  _id: ObjectId,
  code: String,        // "LDH-01"
  name: String,
  districtId: ObjectId,  // ref → districts
  adminUserId: ObjectId, // ref → users (role=block_admin)
}
// indexes: { districtId: 1, code: 1 } unique compound
```

### 5. `schools`

```js
{
  _id: ObjectId,
  schoolId: String,    // unique, e.g. "gps-mt-001"
  name: String,
  blockId: ObjectId,   // ref → blocks
  districtId: ObjectId,// ref → districts
  stateId: ObjectId,   // ref → states
  principalUserId: ObjectId, // ref → users (role=school)
  strength: String,    // "high" | "low"   (SRS §1.2)
  internet: Boolean,   // false → Volunteer/Block-admin flow
  assignedTeachers: [ObjectId],
  assignedVolunteers: [ObjectId],
  isLocked: Boolean,   // true → all teachers defaulters (R-12)
}
// indexes: { schoolId: 1 unique }, { blockId: 1 }, { strength: 1 }
```

### 6. `classes`

```js
{
  _id: ObjectId,
  schoolId: ObjectId,   // ref → schools
  teacherUserId: ObjectId, // ref → users (role=teacher)
  grade: Number,        // 2 | 3 | 4
  section: String,      // "A" | "B"
  studentCount: Number,
}
// indexes: { schoolId: 1, grade: 1, section: 1 } unique compound
```

### 7. `students` *(core)*

```js
{
  _id: ObjectId,
  studentId: String,   // unique persistent, e.g. "STU-PB-LDH-MT001-0001"
  name: String,
  age: Number,
  classId: ObjectId,    // ref → classes
  schoolId: ObjectId,   // ref → schools
  teacherUserId: ObjectId,
  aadharMasked: String,  // ****1234 for non-Superadmin
  aadharFull: String,    // Superadmin-only (R-6)
  currentLevel: String, // "L1".."L8"
  targetLevel: String,
  levelHistory: [{
    level: String,
    setAt: Date,
    cycleId: String,    // assessment cycle that assigned it
    reportId: ObjectId, // ref → evaluationreports
  }],
  certificates: [ObjectId], // ref → certifications
  addedBy: ObjectId,         // ref → users
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
// indexes:
//   { studentId: 1 unique }
//   { classId: 1 }, { schoolId: 1 }
//   { aadharFull: 1 unique sparse }     // Superadmin lookup
//   { aadharMasked: 1 }
```

### 8. `curriculum`

Index/pointer to per-level Markdown files. Core-team maintained; not UI-editable.

```js
{
  _id: ObjectId,
  level: String,         // "L1".."L8" or "Preschool 1/2/3"
  grade: Number,         // 1..5
  title: String,
  filePath: String,      // e.g. "curriculum/levels/Level3.md"
  topics: [String],      // "Number Sense", "Patterns", ...
  difficultyBands: [String], // ["easy","medium","hard"]
  version: String,
  lastRevisedBy: ObjectId, // ref → users (Superadmin)
  createdAt: Date,
  updatedAt: Date,
}
// indexes: { level: 1, version: 1 } unique compound
```

### 9. `worksheets`

AI-generated worksheet JSON. Generation-lock flag per SRS §13.2 R-11.

```js
{
  _id: ObjectId,
  classId: ObjectId,
  studentId: ObjectId,
  schoolId: ObjectId,
  cycle: String,         // "Baseline" | "Mid-Year" | "End-Year"
  year: Number,          // academic year, e.g. 2026
  examDate: Date,

  generatedBy: {
    userId: ObjectId,
    role: String,        // teacher | school | volunteer | block_admin | superadmin
  },

  generationLock: {
    locked: Boolean,
    lockedBy: ObjectId,  // who generated/printed first in the pair
    lockedAt: Date,
    pairRole: String,    // "teacher" or "block_admin" — the locked-out counterpart
  },

  studentSnapshot: {     // snapshot of student.FLN at generation time
    level: String,
    competencies: [String],
  },

  promptTemplateId: ObjectId,
  llmProvider: String,   // which model
  questions: [Question], // validated JSON per §12
  assets: [{
    questionId: String,
    assetName: String,
    resolvedFrom: String, // file path or substituted from
    substituted: Boolean,
  }],
  pdfPath: String,
  status: String,        // "generated" | "printed" | "examined" | "submitted"
  printable: Boolean,    // within 1-hour print window
  createdAt: Date,
}
// indexes:
//   { studentId: 1, cycle: 1, year: 1 } unique compound
//   { "generationLock.locked": 1, classId: 1, examDate: 1 }
//   { classId: 1, examDate: 1 }
```

#### Embedded `Question` (matches SRS §12.1)
```js
Question = {
  question_id: String,       // "Q1"
  question: String,
  answer: String,            // expected_answer
  answer_type: String,       // "text" | "number" | "multiple_choice" | "draw"
  topic: String,             // "Number Sense" | "Fractions" | ...
  subtopic: String,
  difficulty: String,        // "easy" | "medium" | "hard"
  source_level: String,
  class_level: Number,
  reasoning: String,
  svg_assets: [String],
}
```

### 10. `answerSubmissions`

ICR JSON ingestion.

```js
{
  _id: ObjectId,
  worksheetId: ObjectId,
  studentId: ObjectId,
  classId: ObjectId,
  cycle: String,
  scanBatchId: String,      // groups bulk scans (40-50 sheets)
  submittedBy: ObjectId,    // Teacher or Volunteer (or Block Admin)
  submittedAt: Date,
  isDelayed: Boolean,        // true → after 1-hour submission window (R-12)
  submissionWindowEnd: Date, // window for delayed-attempt calculation
  answers: {                // ICR structured JSON e.g. { "Q1": "A", "Q2": 5 }
    questionId: answer
  },
  evalStatus: String,        // "pending" | "running" | "done" | "failed"
  evaluationReportId: ObjectId,
  processedAt: Date,
}
// indexes:
//   { worksheetId: 1, studentId: 1 } unique compound
//   { submittedBy: 1, submittedAt: -1 }
//   { evalStatus: 1 }
```

### 11. `evaluationReports`

Python Evaluation Engine output (3 stages per SRS §9).

```js
{
  _id: ObjectId,
  worksheetId: ObjectId,
  studentId: ObjectId,
  cycle: String,
  overallScore: Number,       // e.g. 18
  totalQuestions: Number,     // 20
  conceptMastery: [{
    topic: String,
    level: String,            // "Strong" | "Needs Practice"
  }],
  strengths: [String],        // competencies mastered
  weaknesses: [String],       // competencies to improve
  mistakePatterns: [String],
  recommendedLevel: String,   // "L5"
  previousLevel: String,
  levelChanged: Boolean,
  narrative: String,          // AI-generated paragraph for teacher/volunteer
  classification: {           // Stage 1 output
    questionClassifications: [{
      questionId: String,
      type: String,
      difficulty: String,
      competency: String,
    }],
  },
  levelFlagTriggered: Boolean, // 50%+ easy-question failure → R-15
  flaggedQuestions: [String],
  generatedAt: Date,
}
// indexes: { studentId: 1, cycle: 1 }, { worksheetId: 1 }
```

### 12. `certifications`

```js
{
  _id: ObjectId,
  studentId: ObjectId,
  level: String,            // milestone level achieved
  competencies: [String],   // required competencies that are now satisfied
  reportId: ObjectId,       // ref → evaluationreports
  issuedAt: Date,
  issuedBy: "system",       // always system (R-7)
}
// indexes: { studentId: 1, level: 1 } unique compound
```

### 13. `svgAssets`

Pre-built SVG asset library (R-9 substitution).

```js
{
  _id: ObjectId,
  name: String,             // unique, e.g. "fruits-apple-red"
  category: String,         // "fruits" | "animals" | "shapes" | "numbers" | "tracing"
  filePath: String,         // "/assets/svg/fruits/apple-red.svg"
  version: String,          // yearly visual-style version (R-10)
  tags: [String],
  createdAt: Date,
}
// indexes: { name: 1 unique }, { category: 1 }
```

### 14. `assetSubstitutionLog`

```js
{
  _id: ObjectId,
  worksheetId: ObjectId,
  questionId: String,
  requestedName: String,    // asset not found
  substitutedWith: String,  // what was used instead
  category: String,         // same category used
  level: String,
  createdAt: Date,
}
// indexes: { worksheetId: 1 }, { requestedName: 1 }
```

### 15. `promptTemplates`

```js
{
  _id: ObjectId,
  name: String,             // "worksheet-generation-prompt"
  purpose: String,          // "generation" | "evaluation" | "classification"
  version: String,
  body: String,             // template with {{placeholders}}
  placeholders: [String],   // ["student_level","competency_topic",...]
  createdAt: Date,
}
// indexes: { name: 1, version: 1 } unique compound
```

### 16. `logbook`

Immutable audit trail (NFR-22). Every significant action.

```js
{
  _id: ObjectId,
  actorUserId: ObjectId,
  actorRole: String,
  action: String,           // "download" | "print" | "conduct" | "scan" | "verify" | ...
  schoolId: ObjectId,
  classId: ObjectId,
  studentId: ObjectId,
  worksheetId: ObjectId,
  status: String,           // "success" | "failure"
  metadata: Object,         // action-specific extras
  at: Date,
}
// indexes:
//   { at: -1 }, { schoolId: 1, at: -1 }, { actorUserId: 1, at: -1 }
//   { action: 1, at: -1 }
```

### 17. `announcements`

```js
{
  _id: ObjectId,
  title: String,
  body: String,
  postedByUserId: ObjectId, // Superadmin only (R-13)
  urgent: Boolean,          // true → email escalation
  emailEscalated: Boolean,
  visibleToRoles: [String], // default: all 7
  postedAt: Date,
  expiresAt: Date,
}
// indexes: { postedAt: -1 }
```

### 18. `tickets`

In-app feedback (R-14).

```js
{
  _id: ObjectId,
  type: String,              // "general" | "curriculum" (Teacher-only)
  submittedByUserId: ObjectId,
  submittedByRole: String,
  subject: String,
  body: String,
  priority: String,         // "Low" | "Medium" | "High"
  status: String,           // "open" | "approved" | "rejected" | "applied"
  reviewedByUserId: ObjectId,   // Superadmin
  reviewNotes: String,
  resolvedAt: Date,
  createdAt: Date,
}
// indexes: { status: 1, createdAt: -1 }, { submittedByUserId: 1 }
```

---

## Relationships summary

| From | Rel | To |
|---|---|---|
| users.scope | embedded | (state/district/block/school IDs in user doc) |
| states | 1─N | districts |
| districts | 1─N | blocks |
| blocks | 1─N | schools |
| schools | 1─N | classes + users (teacher, volunteer assignments) |
| classes | 1─N | students |
| students | 1─N | worksheets + evaluations + certificates |
| worksheets | 1─1 | students, classes, schools (per cycle/year) |
| worksheets | 1─N | AnswerSubmissions (one per student when scanned) |
| AnswerSubmissions | 1─1 | EvaluationReports |
| schools | N─M | volunteers + teachers (assignments) |
| Curriculum | points-to | Markdown files (no DB content, just metadata) |

---

## Field conventions

- **IDs**: human-readable strings preferred (`gps-mt-001`, `STU-PB-LDH-MT001-0001`) — readable in Compass without ObjectId decoding.
- **Time**: always `Date`, never strings.
- **Soft-delete**: `isActive` / `isLocked` flags instead of hard deletion to preserve logbook integrity.
- **Aadhar**: dual-field pattern — `aadharFull` for Superadmin (R-6), `aadharMasked` for everyone else; role-based projection in the controller layer.
- **Audit fields**: `createdAt` + `updatedAt` on every mutable collection.
- **Cycles**: always one of `"Baseline" | "Mid-Year" | "End-Year"` + the calendar year, never a single field.

---

## What to build next (backend)

Priority order for the Mongoose models:

1. ✅ `users` — done
2. `states` → `districts` → `blocks` → `schools` → `classes` (hierarchy chain)
3. `students` (with Aadhar masking logic in controllers)
4. `worksheets` + `answerSubmissions` + `evaluationReports` (the core triplet)
5. `curriculum` + `promptTemplates` (Python service will read these)
6. `svgAssets` + `assetSubstitutionLog` (R-9, R-10)
7. `certifications` (R-7)
8. `logbook` (cross-cutting — every controller writes here)
9. `tickets` + `announcements`
