import mongoose from "mongoose";
import { QUESTION_TYPES, SUBMISSION_PROCESSING_STATUS } from "./enums.js";

/**
 * StudentSubmission — one scanned page becomes one document.
 *
 * Teacher uploads ONE PDF for the whole class; the backend splits
 * it per-student/per-page and creates one StudentSubmission per
 * page. Extracted answers are embedded inside this document
 * (per requirement) because:
 *   - they're produced, read, and discarded with the submission;
 *   - they're small (one per question, ~20 items);
 *   - embedding lets the AI service fetch a single document.
 *
 * `uploadedImage` is the path or signed URL of the cropped image
 * page that was fed to the ICR pipeline.  We keep it for audit /
 * reprocessing.
 */
const extractedAnswerSchema = new mongoose.Schema(
  {
    questionNo:      { type: Number, required: true, min: 1 },
    questionType:    {
      type: String,
      enum: { values: QUESTION_TYPES, message: "questionType must be one of {VALUES}" },
      required: true,
    },
    studentAnswer:   { type: String, default: "" },
    confidence:      { type: Number, min: 0, max: 1, default: 0 },
    extractorName:   { type: String, default: "" },     // e.g. "handwriting-ocr", "circle-detector"
    rawPayload:      { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const studentSubmissionSchema = new mongoose.Schema(
  {
    worksheetAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorksheetAssignment",
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    worksheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worksheet",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    uploadedImage: { type: String, required: true },          // path or signed URL of the page
    pageNumber:    { type: Number, required: true, min: 1 },
    uploadDate:    { type: Date, default: () => new Date() },
    uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    processingStatus: {
      type: String,
      enum: { values: SUBMISSION_PROCESSING_STATUS, message: "processingStatus must be one of {VALUES}" },
      default: "Uploaded",
      required: true,
      index: true,
    },

    // Per-question extracted answers — embedded per spec.
    extractedAnswers: { type: [extractedAnswerSchema], default: [] },
  },
  { timestamps: true },
);

studentSubmissionSchema.index({ studentId: 1, assessmentId: 1 });
studentSubmissionSchema.index({ worksheetId: 1, studentId: 1 }, { unique: true });

studentSubmissionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("StudentSubmission", studentSubmissionSchema);