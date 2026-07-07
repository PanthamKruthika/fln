import mongoose from "mongoose";
import { AUDIT_ACTION, AUDIT_MODULE } from "./enums.js";

/**
 * AuditLog — immutable trail of every significant action (NFR-22).
 *
 * Append-only by convention.  No update/delete endpoints should exist.
 * `metadata` is a flexible payload (request body, diff, etc.).
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: { values: AUDIT_ACTION, message: "action must be one of {VALUES}" },
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: { values: AUDIT_MODULE, message: "module must be one of {VALUES}" },
      required: true,
      index: true,
    },
    resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },

    at: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: { createdAt: "at", updatedAt: false } },
);

// Most common queries:
//   "recent activity in module X"          → { module, at }
//   "what did user U do"                   → { userId, at }
//   "what happened to resource R"           → { resourceId, at }
auditLogSchema.index({ module: 1, at: -1 });
auditLogSchema.index({ userId: 1, at: -1 });
auditLogSchema.index({ action: 1, at: -1 });

// JSON — never expose ObjectId internals
auditLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("AuditLog", auditLogSchema);