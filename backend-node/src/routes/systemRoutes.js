import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/public/stats", (_req, res) => {
  res.json({
    states: 28,
    districts: 723,
    blocks: 5820,
    schools: 14290,
    students: 1842300,
    assessmentsConducted: 4218000,
    flnCertificationPct: 62.4,
    lastUpdated: new Date().toISOString(),
  });
});

export default router;