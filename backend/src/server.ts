import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = [
  "http://localhost:3000",
  "https://manacine-ai.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as health checks/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Explicitly handle preflight requests
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "manacine-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.use("/storage", express.static("storage"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ManaCine API running on port ${PORT}`);
});
