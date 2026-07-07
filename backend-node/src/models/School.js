import mongoose from "mongoose";
import {
  BOARD,
  MANAGEMENT_TYPE,
  MEDIUM,
  PINCODE_PATTERN,
  SCHOOL_TYPE,
  STATUS,
  UDISE_PATTERN,
} from "./enums.js";

/**
 * School — every school has a unique UDISE+ School ID (11-digit code).
 * Owns: Teachers, Classes, Students, the Principal user account.
 *
 * Address is embedded because:
 *   - it's always read together with the school record;
 *   - it never has more than one row per school;
 *   - it avoids a needless join for the most common query.
 *
 * The Principal is referenced, not embedded, because User is large and
 * may be looked up across many schools during provisioning.
 */
const addressSchema = new mongoose.Schema(
  {
    village:  { type: String, trim: true, default: "" },
    mandal:   { type: String, trim: true, default: "" },  // or "tehsil" / "block" depending on state
    district: { type: String, trim: true, default: "" },
    state:    { type: String, trim: true, default: "" },
    pincode:  {
      type: String,
      trim: true,
      match: [PINCODE_PATTERN, "pincode must be a 6-digit number"],
      default: "",
    },
  },
  { _id: false },
);

const schoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: [true, "schoolName is required"],
      trim: true,
      maxlength: 200,
    },
    udiseCode: {
      type: String,
      required: [true, "udiseCode is required"],
      unique: true,
      trim: true,
      match: [UDISE_PATTERN, "udiseCode must be an 11-digit number"],
      index: true,
    },
    schoolType: {
      type: String,
      enum: { values: SCHOOL_TYPE, message: "schoolType must be one of {VALUES}" },
      default: "primary",
      required: true,
    },
    managementType: {
      type: String,
      enum: { values: MANAGEMENT_TYPE, message: "managementType must be one of {VALUES}" },
      required: true,
    },
    board: {
      type: String,
      enum: { values: BOARD, message: "board must be one of {VALUES}" },
      default: "State Board",
    },
    mediumOfInstruction: [{
      type: String,
      enum: { values: MEDIUM, message: "mediumOfInstruction must be one of {VALUES}" },
      required: true,
    }],
    address: { type: addressSchema, default: () => ({}) },
    principalName:  { type: String, trim: true, default: "" },
    principalPhone: { type: String, trim: true, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "email must be a valid address"],
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{2}$/, "academicYear must look like '2025-26'"],
      index: true,
    },
    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },

    // Optional references for fast joins.
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", index: true },
    stateId:    { type: mongoose.Schema.Types.ObjectId, ref: "State",    index: true },
    principalUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Most dashboard queries filter by district + academic year + status.
schoolSchema.index({ districtId: 1, academicYear: 1, status: 1 });

// JSON transform
schoolSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("School", schoolSchema);