import jwt from "jsonwebtoken";
import { USER_ROLES } from "../models/enums.js";

const ROLES_ENUM = USER_ROLES;

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "missing bearer token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "unauthenticated" });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        message: `forbidden; role '${req.user.role}' not in [${allowed.join(", ")}]`,
      });
    }
    next();
  };
}

export const KNOWN_ROLES = ROLES_ENUM;