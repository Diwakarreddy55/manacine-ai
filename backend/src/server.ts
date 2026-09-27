import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "manacine-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

const storage = path.resolve(process.env.STORAGE_DIR || "./storage");
app.use("/storage", express.static(storage));

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`ManaCine API running on port ${port}`));
