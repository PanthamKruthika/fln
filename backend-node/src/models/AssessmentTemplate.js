import mongoose from "mongoose";
import {
  DIFFICULTY,
  FLN_LEVELS,
  QUESTION_TYPES,
  WORKSHEET_TYPES,
} from "./enums.js";

/**
 * AssessmentTemplate — the canonical answer-key for an assessment,
 * produced by Super Admin after reviewing the AI's OCR + question
 * analysis of the uploaded question paper.
 *
 * Differs from Worksheet (the student-facing paper) in two ways:
 *  - no `boundingBox` yet — those are added when the template is
 *    rendered into a Worksheet PDF;
 *  - `answerOptions` carries the raw options for MCQ / matching /
 *    tick questions so the Super Admin can correct the AI's guess.
 *
 * One Assessment has many AssessmentTemplate versions (a new version
 * is created when the question paper is updated). Worksheet rows
 * reference (assessmentId, templateVersion).
 */
const assessmentTemplateQuestionSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true, min: 1 },
    questionText: { type: String, default: "", trim: true },
    questionType: {
      type: String,
      enum: { values: QUESTION_TYPES, message: "questionType must be one of {VALUES}" },
      required: true,
    },
    concept: { type: String, trim: true, default: "" },
    difficulty: {
      type: String,
      enum: { values: DIFFICULTY, message: "difficulty must be one of {VALUES}" },
      default: "easy",
    },
    level: {
      type: String,
      enum: { values: FLN_LEVELS, message: "level must be one of {VALUES}" },
      default: "L1",
    },
    marks: { type: Number, min: 0, default: 1 },
    correctAnswer: { type: String, default: "" },
    // For MCQ / matching / tick — let Super Admin edit
    answerOptions: { type: mongoose.Schema.Types.Mixed, default: null },
    // AI suggestion source — "ai" or "human"
    provenance: {
      type: String,
      enum: ["ai", "human", "human-edited"],
      default: "ai",
    },
  },
  { _id: false },
);

const assessmentTemplateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    worksheetType: {
      type: String,
      enum: { values: WORKSHEET_TYPES, message: "worksheetType must be one of {VALUES}" },
      default: "Diagnostic",
    },
    templateVersion: { type: String, default: "v1", index: true },

    // Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["draft", "approved", "archived"],
      default: "draft",
      index: true,
    },

    // Reference to the uploaded PDF (path on disk or signed URL)
    sourcePdfPath: { type: String, default: "" },
    sourcePdfName: { type: String, default: "" },

    questions: {
      type: [assessmentTemplateQuestionSchema],
      validate: [(v) => v.length > 0, "questions must not be empty"],
    },

    totalMarks:     { type: Number, min: 0, default: 0 },
    totalQuestions: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

// Most common query: latest approved template for an assessment.
assessmentTemplateSchema.index({ assessmentId: 1, status: 1, templateVersion: 1 });

assessmentTemplateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const assessmentTemplate = mongoose.model("AssessmentTemplate", assessmentTemplateSchema);
export default assessmentTemplate;