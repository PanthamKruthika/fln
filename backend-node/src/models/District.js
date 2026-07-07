import mongoose from "mongoose";
import { STATUS } from "./enums.js";

/**
 * District — second level of the geographic hierarchy.
 * One district → many schools (1:N). District Admin user is referenced (optional).
 *
 * districtCode is a short alphanumeric slug (e.g. "LDH", "MOG"). It's
 * commonly paired with stateCode in user-facing identifiers like
 * "LDH-01" (block codes follow the same pattern).
 */
const districtSchema = new mongoose.Schema(
  {
    districtCode: {
      type: String,
      required: [true, "districtCode is required"],
      uppercase: true,
      trim: true,
      maxlength: 10,
      index: true,
    },
    districtName: {
      type: String,
      required: [true, "districtName is required"],
      trim: true,
      maxlength: 100,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "stateId is required"],
      index: true,
    },
    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },
    adminUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// districtCode is unique within a state, not globally.
districtSchema.index({ stateId: 1, districtCode: 1 }, { unique: true });

districtSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("District", districtSchema);