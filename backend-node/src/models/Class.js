import mongoose from "mongoose";
import { STATUS } from "./enums.js";

/**
 * Class — a Teacher-owned grouping of Students within a School.
 *
 * Compound uniqueness: (schoolId, grade, section, academicYear)
 * so the same teacher can teach "Class 3-A" across multiple years
 * without conflict, and two sections of the same grade never collide.
 *
 * `totalStudents` is a denormalised counter maintained by application
 * code (denormalised for dashboard performance — recomputed when a
 * student is added/removed).
 */
const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 5,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{2}$/, "academicYear must look like '2025-26'"],
      index: true,
    },
    totalStudents: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

classSchema.index(
  { schoolId: 1, grade: 1, section: 1, academicYear: 1 },
  { unique: true },
);

classSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Class", classSchema);