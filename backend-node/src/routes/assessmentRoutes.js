import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import { randomUUID } from "crypto";

import Assessment from "../models/Assessment.js";
import AssessmentTemplate from "../models/AssessmentTemplate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { writeAuditLog } from "../services/audit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project-rooted uploads dir so files survive controller restarts.
const UPLOAD_ROOT = path.resolve(__dirname, "..", "..", "uploads", "questionpapers");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".pdf";
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are accepted"));
    }
    cb(null, true);
  },
});

const router = Router();

const AUTOMATION_URL = process.env.AUTOMATION_URL || "http://127.0.0.1:5050";
const TEMPLATE_BUILDER_URL = process.env.TEMPLATE_BUILDER_URL || "http://127.0.0.1:5051";


// --------------------------------------------------------------------------- #
// Assessment CRUD (Super Admin + Admin)
// --------------------------------------------------------------------------- #

router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req, res, next) => {
  try {
    const assessment = await Assessment.create(req.body);
    await writeAuditLog({ req, action: "create", module: "assessments", resourceId: assessment._id });
    res.status(201).json(assessment);
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;
    if (req.query.status) filter.status = req.query.status;
    const list = await Assessment.find(filter).sort({ assessmentDate: -1 }).limit(200);
    res.json(list);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: "Assessment not found" });
    res.json(a);
  } catch (err) { next(err); }
});

router.patch("/:id", requireAuth, requireRole("superadmin", "admin"), async (req, res, next) => {
  try {
    const a = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!a) return res.status(404).json({ message: "Assessment not found" });
    await writeAuditLog({ req, action: "update", module: "assessments", resourceId: a._id });
    res.json(a);
  } catch (err) { next(err); }
});


// --------------------------------------------------------------------------- #
// Template extraction (PDF → Python → AI-extracted template)
// --------------------------------------------------------------------------- #

router.post(
  "/template/upload",
  requireAuth,
  requireRole("superadmin", "admin"),
  upload.single("pdf"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "pdf file is required (field name: pdf)" });

      const grade = Number(req.body.grade || 2);
      const subject = req.body.subject || "Numeracy";
      const academicYear = req.body.academicYear || "2025-26";
      const templateIdHint = req.body.templateId || "";

      const FormData = (await import("form-data")).default;
      const form = new FormData();
      form.append("pdf", fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: "application/pdf",
      });
      form.append("grade", String(grade));
      form.append("subject", subject);
      form.append("academic_year", academicYear);
      if (templateIdHint) form.append("template_id", templateIdHint);

      let extraction;
      try {
        const resp = await axios.post(`${TEMPLATE_BUILDER_URL}/assessment-template/extract`, form, {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 120_000,
        });
        extraction = resp.data;
      } catch (err) {
        return res.status(502).json({
          message: `Python template-builder service unavailable. Start it with:
  automation/.venv/bin/python -m uvicorn template_builder:app --port 5051

Underlying error: ${err.message}`,
        });
      }

      // Persist a DRAFT template tied to the assessment so the UI
      // can resume editing it later.
      const draft = await AssessmentTemplate.findOneAndUpdate(
        { templateId: extraction.templateId },
        {
          $set: {
            templateId: extraction.templateId,
            assessmentId: req.body.assessmentId || null,
            worksheetType: req.body.worksheetType || "Diagnostic",
            templateVersion: req.body.templateVersion || "v1",
            sourcePdfPath: req.file.path,
            sourcePdfName: req.file.originalname,
            questions: extraction.questions,
            totalMarks: extraction.totalMarks,
            totalQuestions: extraction.totalQuestions,
            status: "draft",
            createdBy: req.user.sub,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      await writeAuditLog({
        req,
        action: "upload",
        module: "assessments",
        resourceId: draft._id,
        metadata: { sourcePdf: req.file.originalname, source: extraction.source },
      });

      res.status(201).json({ template: draft, extraction });
    } catch (err) { next(err); }
  },
);


// --------------------------------------------------------------------------- #
// Template CRUD
// --------------------------------------------------------------------------- #

router.put(
  "/template/:templateId",
  requireAuth,
  requireRole("superadmin", "admin"),
  async (req, res, next) => {
    try {
      const t = await AssessmentTemplate.findOneAndUpdate(
        { templateId: req.params.templateId },
        { $set: { ...req.body, updatedAt: new Date() } },
        { new: true },
      );
      if (!t) return res.status(404).json({ message: "Template not found" });
      await writeAuditLog({ req, action: "update", module: "assessments", resourceId: t._id });
      res.json(t);
    } catch (err) { next(err); }
  },
);

router.post(
  "/template/:templateId/approve",
  requireAuth,
  requireRole("superadmin", "admin"),
  async (req, res, next) => {
    try {
      const t = await AssessmentTemplate.findOneAndUpdate(
        { templateId: req.params.templateId },
        { $set: { status: "approved", approvedBy: req.user.sub, approvedAt: new Date() } },
        { new: true },
      );
      if (!t) return res.status(404).json({ message: "Template not found" });
      await writeAuditLog({ req, action: "publish", module: "assessments", resourceId: t._id });
      res.json(t);
    } catch (err) { next(err); }
  },
);

router.get(
  "/template/by-assessment/:assessmentId",
  requireAuth,
  async (req, res, next) => {
    try {
      const t = await AssessmentTemplate.find({ assessmentId: req.params.assessmentId })
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(t);
    } catch (err) { next(err); }
  },
);

router.get(
  "/template/:templateId",
  requireAuth,
  async (req, res, next) => {
    try {
      const t = await AssessmentTemplate.findOne({ templateId: req.params.templateId });
      if (!t) return res.status(404).json({ message: "Template not found" });
      res.json(t);
    } catch (err) { next(err); }
  },
);

export default router;