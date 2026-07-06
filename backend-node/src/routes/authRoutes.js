import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);

router.post(
  "/register",
  requireAuth,
  requireRole("superadmin", "admin"),
  register,
);

export default router;