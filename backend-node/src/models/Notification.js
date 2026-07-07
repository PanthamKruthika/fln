import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "./enums.js";

/**
 * Notification — in-app message shown to a specific teacher.
 *
 * Read state is per-user; the bell badge counts `isRead: false`.
 * expiresAt (optional) lets old notifications auto-prune.
 */
const notificationSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPE, message: "type must be one of {VALUES}" },
      default: "info",
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// "Unread bell badge count" query.
notificationSchema.index({ teacherId: 1, isRead: 1, createdAt: -1 });

// Optional: TTL index for auto-pruning expired notifications.
// Uncomment when you want auto-cleanup:
// notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Notification", notificationSchema);