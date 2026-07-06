import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) =>
  res.json({ name: "FLN Backend", status: "ok" }),
);

app.use("/api", systemRoutes);
app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(err.status || 500).json({ message: err.message || "internal error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[boot] failed to start:", err.message);
    process.exit(1);
  });