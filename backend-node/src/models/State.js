import mongoose from "mongoose";
import { STATE_CODE_PATTERN, STATUS } from "./enums.js";

/**
 * State — top of the geographic hierarchy.
 * One state → many districts (1:N). State Admin user is referenced (optional).
 *
 * stateCode is the 2-letter UDISE+ state abbreviation (e.g. "PB", "HR").
 * It's the natural primary lookup key from outside the system.
 */
const stateSchema = new mongoose.Schema(
  {
    stateCode: {
      type: String,
      required: [true, "stateCode is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [STATE_CODE_PATTERN, "stateCode must be 2 uppercase letters (e.g. PB, HR)"],
      index: true,
    },
    stateName: {
      type: String,
      required: [true, "stateName is required"],
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },
    // Optional: link to the State-Admin user(s) responsible for this state.
    adminUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// Compound index for the most common "list active states" query.
stateSchema.index({ status: 1, stateName: 1 });

// Pretty-print
stateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("State", stateSchema);