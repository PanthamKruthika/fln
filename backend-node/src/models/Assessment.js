import mongoose from "mongoose";
import { ASSESSMENT_STATUS, ASSESSMENT_TYPES } from "./enums.js";

/**
 * Assessment — an event (Baseline / Mid-Year / End-Year / ad-hoc).
 *
 * One Assessment produces one or more Worksheets (one per class
 * typically) and many WorksheetAssignments.  Status moves through a
 * strict pipeline:
 *
 *   Upcoming → Generated → Conducted → Scripts Uploaded → Evaluated → Published
 *
 * Allowed transitions are enforced in the service layer, not the schema.
 */
const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    assessmentType: {
      type: String,
      enum: { values: ASSESSMENT_TYPES, message: "assessmentType must be one of {VALUES}" },
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assessmentDate: { type: Date, required: true, index: true },
    duration:       { type: Number, min: 1, max: 600, required: true },  // minutes

    totalMarks:     { type: Number, min: 0, default: 0 },
    totalQuestions: { type: Number, min: 0, default: 0 },

    status: {
      type: String,
      enum: { values: ASSESSMENT_STATUS, message: "status must be one of {VALUES}" },
      default: "Upcoming",
      required: true,
      index: true,
    },

    // Lifecycle timestamps (optional, set by services as state changes).
    generatedAt:      { type: Date, default: null },
    conductedAt:      { type: Date, default: null },
    scriptsUploadedAt:{ type: Date, default: null },
    evaluatedAt:      { type: Date, default: null },
    publishedAt:      { type: Date, default: null },
  },
  { timestamps: true },
);

// "Upcoming assessments for this class" etc.
assessmentSchema.index({ classId: 1, assessmentDate: 1 });
assessmentSchema.index({ teacherId: 1, status: 1 });

assessmentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Assessment", assessmentSchema);