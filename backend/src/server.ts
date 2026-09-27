```ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| PORT
|--------------------------------------------------------------------------
|
| Local:
|   PORT=5000
|
| Render:
|   Render provides PORT automatically.
|
*/
const PORT = Number(process.env.PORT || 5000);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Production frontend:
|   https://manacine-ai.vercel.app
|
| Local frontend:
|   http://localhost:3000
|
*/

const allowedOrigins = [
  "https://manacine-ai.vercel.app",
  "http://localhost:3000",
];

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) => {
    /*
     * Allow requests without Origin.
     * This is useful for health checks and server-to-server requests.
     */
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

/*
|--------------------------------------------------------------------------
| CORS Middleware
|--------------------------------------------------------------------------
|
| IMPORTANT:
| CORS must be registered BEFORE API routes.
|
*/

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Explicit OPTIONS / Preflight
|--------------------------------------------------------------------------
*/

app.options("*", cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      service: "manacine-api",
      environment:
        process.env.NODE_ENV || "development",
    });
  }
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
|
| Serves files from:
| backend/storage
|
*/

const storagePath = path.resolve(
  process.env.STORAGE_DIR || "./storage"
);

app.use(
  "/storage",
  express.static(storagePath)
);

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get(
  "/api",
  (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      service: "manacine-api",
      message: "ManaCine API is running",
    });
  }
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    req: Request,
    res: Response
  ) => {
    res.status(404).json({
      ok: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  }
);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: any,
    _req: Request,
    res: Response,
    _next: any
  ) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    /*
     * CORS error
     */
    if (
      error?.message?.startsWith(
        "CORS blocked origin:"
      )
    ) {
      return res.status(403).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error?.message ||
            "Internal server error",
    });
  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "======================================"
    );

    console.log(
      "       ManaCine AI API Server"
    );

    console.log(
      "======================================"
    );

    console.log(
      `Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

    console.log(
      `Port: ${PORT}`
    );

    console.log(
      `CORS Origins: ${allowedOrigins.join(
        ", "
      )}`
    );

    console.log(
      `Storage: ${storagePath}`
    );

    console.log(
      "======================================"
    );
  }
);
```
