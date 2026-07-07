import mongoose from "mongoose";
import {
  DIFFICULTY,
  FLN_LEVELS,
  QUESTION_TYPES,
  WORKSHEET_TYPES,
} from "./enums.js";

/**
 * Worksheet — generated paper for one assessment, assigned to many students.
 *
 * IMPORTANT: one Worksheet CAN be assigned to many students. The
 * WorksheetAssignments collection is the junction that makes that work.
 *
 * Questions are embedded inside the Worksheet because:
 *   - the question set is immutable for a given worksheetId/version;
 *   - they're always loaded together with the worksheet;
 *   - the ICR pipeline needs the bbox + correctAnswer side-by-side.
 *
 * boundingBox coordinates are in PDF points (1/72 inch). The Python
 * automation service (automation/) reads these directly.
 */
const boundingBoxSchema = new mongoose.Schema(
  {
    page:   { type: Number, required: true, min: 1, default: 1 },
    x:      { type: Number, required: true, min: 0 },
    y:      { type: Number, required: true, min: 0 },
    width:  { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    questionNo: {
      type: Number,
      required: true,
      min: 1,
    },
    questionType: {
      type: String,
      enum: { values: QUESTION_TYPES, message: "questionType must be one of {VALUES}" },
      required: true,
    },
    questionText: { type: String, default: "" },       // optional, the worksheet PDF usually carries the prompt visually
    concept:      { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: { values: DIFFICULTY, message: "difficulty must be one of {VALUES}" },
      required: true,
    },
    level: {
      type: String,
      enum: { values: FLN_LEVELS, message: "level must be one of {VALUES}" },
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    boundingBox: { type: boundingBoxSchema, required: true },

    // For matching / circle / tick questions — labelled sub-regions
    // (e.g. one Region per choice bubble).
    regions: [{
      label: { type: String, required: true, trim: true },
      bbox:  { type: boundingBoxSchema, required: true },
    }],
  },
  { _id: false },
);

const worksheetSchema = new mongoose.Schema(
  {
    worksheetId: {
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

    worksheetTitle: { type: String, required: true, trim: true, maxlength: 200 },
    worksheetType: {
      type: String,
      enum: { values: WORKSHEET_TYPES, message: "worksheetType must be one of {VALUES}" },
      required: true,
    },
    level: {
      type: String,
      enum: { values: FLN_LEVELS, message: "level must be one of {VALUES}" },
      required: true,
    },

    pdfUrl:          { type: String, default: "" },
    qrCode:          { type: String, default: "" },    // per-student QR for printing

    totalMarks:     { type: Number, min: 0, default: 0 },
    totalQuestions: { type: Number, min: 0, default: 0 },

    templateVersion: {
      type: String,
      default: "v1",
      index: true,
    },

    questions: {
      type: [questionSchema],
      validate: [
        (v) => v.length > 0,
        "questions must not be empty",
      ],
    },
  },
  { timestamps: true },
);

worksheetSchema.index({ assessmentId: 1, templateVersion: 1 });

worksheetSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Worksheet", worksheetSchema);