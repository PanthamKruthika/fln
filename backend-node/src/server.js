import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";

const app = express();

console.log("PORT:", process.env.PORT);
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl / server-to-server (no Origin header).
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    name: "FLN Backend",
    status: "ok",
  });
});

app.use("/api", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });