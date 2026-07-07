import mongoose from "mongoose";
import { FLN_LEVELS } from "./enums.js";

/**
 * Evaluation — the marks for one student's submission.
 *
 * Marks + counts are flat (easy to aggregate, query, index).
 * Level mastery and concept mastery are embedded maps because they're
 * always queried as a single block alongside the rest of the report.
 *
 * One Evaluation per StudentSubmission (1:1).
 */
const levelMasterySchema = new mongoose.Schema(
  {
    L1: { type: Number, min: 0, max: 100, default: 0 },
    L2: { type: Number, min: 0, max: 100, default: 0 },
    L3: { type: Number, min: 0, max: 100, default: 0 },
    L4: { type: Number, min: 0, max: 100, default: 0 },
    L5: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const conceptMasterySchema = new mongoose.Schema(
  {
    Counting:           { type: Number, min: 0, max: 100, default: 0 },
    "Number Sense":     { type: Number, min: 0, max: 100, default: 0 },
    Addition:           { type: Number, min: 0, max: 100, default: 0 },
    Subtraction:        { type: Number, min: 0, max: 100, default: 0 },
    Patterns:           { type: Number, min: 0, max: 100, default: 0 },
    Shapes:             { type: Number, min: 0, max: 100, default: 0 },
    Measurement:        { type: Number, min: 0, max: 100, default: 0 },
    Money:              { type: Number, min: 0, max: 100, default: 0 },
    "Calendar and Time":{ type: Number, min: 0, max: 100, default: 0 },
    Fractions:          { type: Number, min: 0, max: 100, default: 0 },
    "Data Handling":    { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentSubmission",
      required: true,
      unique: true,
      index: true,
    },
    worksheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worksheet",
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    marks: {
      obtainedMarks: { type: Number, min: 0, default: 0 },
      totalMarks:    { type: Number, min: 0, default: 0 },
      percentage:    { type: Number, min: 0, max: 100, default: 0 },
    },

    counts: {
      correctAnswers: { type: Number, min: 0, default: 0 },
      wrongAnswers:   { type: Number, min: 0, default: 0 },
    },

    levelMastery:    { type: levelMasterySchema,    default: () => ({}) },
    conceptMastery:  { type: conceptMasterySchema,  default: () => ({}) },

    currentLevel: {
      type: String,
      enum: { values: FLN_LEVELS, message: "currentLevel must be one of {VALUES}" },
      default: "L1",
    },
    recommendedLevel: {
      type: String,
      enum: { values: FLN_LEVELS, message: "recommendedLevel must be one of {VALUES}" },
      default: "L1",
    },

    evaluationDate: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

// "All evaluations for this student, newest first" — the progress feed.
evaluationSchema.index({ studentId: 1, evaluationDate: -1 });
evaluationSchema.index({ assessmentId: 1, percentage: -1 });

evaluationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Evaluation", evaluationSchema);