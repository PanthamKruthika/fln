import mongoose from "mongoose";
import { ASSESSMENT_TYPES, FLN_LEVELS } from "./enums.js";

/**
 * StudentProgress — flat, indexed history of every assessment a student
 * has taken.  Updated whenever a new Evaluation is inserted (or via a
 * post-save hook on Evaluation).
 *
 * Kept separate from Evaluation so the dashboard timeline query is a
 * single fast collection scan with no joins.
 */
const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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
    evaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evaluation",
      required: true,
    },

    assessmentType: {
      type: String,
      enum: { values: ASSESSMENT_TYPES, message: "assessmentType must be one of {VALUES}" },
      required: true,
      index: true,
    },

    score: { type: Number, min: 0, default: 0 },
    percentage: { type: Number, min: 0, max: 100, default: 0 },

    level: {
      type: String,
      enum: { values: FLN_LEVELS, message: "level must be one of {VALUES}" },
      required: true,
    },
    recommendedLevel: {
      type: String,
      enum: { values: FLN_LEVELS, message: "recommendedLevel must be one of {VALUES}" },
      required: true,
    },

    assessmentDate: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

// Most common query: "show me this student's progress, newest first".
studentProgressSchema.index({ studentId: 1, assessmentDate: -1 });

studentProgressSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("StudentProgress", studentProgressSchema);