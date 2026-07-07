import mongoose from "mongoose";
import { FLN_LEVELS, GENDER, STATUS } from "./enums.js";

/**
 * Student — the leaf of the hierarchy.
 *
 * `studentId` is a system-generated, human-readable code
 * (e.g. "STU-PB-LDH-MT001-0001") used everywhere except ObjectId lookups.
 * `admissionNumber` is the school's own admission register number
 * (often printed on the student ID card).
 *
 * Parent details + address are embedded because:
 *   - they belong to exactly one student;
 *   - they're always needed together on report cards and forms;
 *   - they don't have a separate lifecycle.
 *
 * `age` is a denormalised mirror of `dateOfBirth` so dashboards can
 * filter/sort without recalculating.
 *
 * NOTE (SRS §13.2 R-6): Aadhar field not present in this schema per the
 * supplied spec, but production should add `aadharFull` (Superadmin
 * only) and `aadharMasked` (everyone else) as a dual-field pattern.
 */
const parentDetailsSchema = new mongoose.Schema(
  {
    fatherName:   { type: String, trim: true, default: "" },
    motherName:   { type: String, trim: true, default: "" },
    guardianName: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    village:  { type: String, trim: true, default: "" },
    mandal:   { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    state:    { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    admissionNumber: { type: String, trim: true, default: "", index: true },
    rollNumber:      { type: Number, min: 1, max: 200, required: true },

    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName:  { type: String, required: true, trim: true, maxlength: 60 },

    gender: {
      type: String,
      enum: { values: GENDER, message: "gender must be one of {VALUES}" },
      required: true,
    },
    dateOfBirth: { type: Date, required: true },
    age:         { type: Number, min: 3, max: 25, required: true },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
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
      match: [/^\d{4}-\d{2}$/, "academicYear must look like '2025-26'"],
      index: true,
    },

    currentFLNLevel: {
      type: String,
      enum: { values: FLN_LEVELS, message: "currentFLNLevel must be one of {VALUES}" },
      default: "L1",
    },
    targetFLNLevel: {
      type: String,
      enum: { values: FLN_LEVELS, message: "targetFLNLevel must be one of {VALUES}" },
      default: "L3",
    },

    photo: { type: String, default: "" },

    parentDetails: { type: parentDetailsSchema, default: () => ({}) },
    address:       { type: addressSchema,       default: () => ({}) },

    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

// "Roster for this class this year" — the most common dashboard query.
studentSchema.index({ classId: 1, academicYear: 1, status: 1 });
studentSchema.index({ schoolId: 1, academicYear: 1, status: 1 });
studentSchema.index({ classId: 1, rollNumber: 1 }, { unique: true });

// Virtual full name
studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

studentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Student", studentSchema);