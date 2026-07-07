import mongoose from "mongoose";
import { WORKSHEET_ASSIGNMENT_STATUS } from "./enums.js";

/**
 * WorksheetAssignment — junction collection.
 *
 * Purpose: assign ONE Worksheet to MANY Students without duplicating
 * the worksheet (Worksheet itself is immutable and shared).
 *
 * Compound uniqueness: (worksheetId, studentId) — a student can't be
 * assigned the same worksheet twice for the same assessment.
 */
const worksheetAssignmentSchema = new mongoose.Schema(
  {
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

    assignedDate: { type: Date, default: () => new Date() },
    assignedBy:   {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: { values: WORKSHEET_ASSIGNMENT_STATUS, message: "status must be one of {VALUES}" },
      default: "Assigned",
      index: true,
    },

    // Back-reference: once the student submits, link to that submission.
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentSubmission",
      default: null,
    },
  },
  { timestamps: true },
);

worksheetAssignmentSchema.index({ worksheetId: 1, studentId: 1 }, { unique: true });
worksheetAssignmentSchema.index({ studentId: 1, status: 1 });

worksheetAssignmentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("WorksheetAssignment", worksheetAssignmentSchema);