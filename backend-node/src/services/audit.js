// Audit log helper — append a structured record to the AuditLog collection.
import AuditLog from "../models/AuditLog.js";

/**
 * Write a single audit-log entry.
 *
 * @param req        Express request (to pull user + IP)
 * @param action     e.g. "create" / "update" / "publish" / "upload"
 * @param module     e.g. "assessments" / "users" / "schools"
 * @param resourceId ObjectId of the affected record (optional)
 * @param metadata   free-form payload
 */
export async function writeAuditLog({ req, action, module, resourceId = null, metadata = null }) {
  try {
    await AuditLog.create({
      userId: req.user?.sub,
      action,
      module,
      resourceId,
      ipAddress: req.ip || req.headers?.["x-forwarded-for"] || "",
      userAgent: req.headers?.["user-agent"] || "",
      metadata,
    });
  } catch (err) {
    // Never let an audit-log failure break the main request
    console.error("[audit] failed to write log:", err.message);
  }
}