
import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "https://manacine-ai.vercel.app",
  "http://localhost:3000",
];

/*
|--------------------------------------------------------------------------
| CORS Middleware
|--------------------------------------------------------------------------
*/

app.use(
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const origin = req.headers.origin;

    console.log(
      `[CORS] ${req.method} ${req.originalUrl}`
    );

    console.log(
      `[CORS] Origin: ${origin || "none"}`
    );

    /*
    |--------------------------------------------------------------------------
    | Allow configured frontend origins
    |--------------------------------------------------------------------------
    */

    if (
      origin &&
      allowedOrigins.includes(origin)
    ) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        origin
      );

      res.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Required CORS headers
    |--------------------------------------------------------------------------
    */

    res.setHeader(
      "Vary",
      "Origin"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    /*
    |--------------------------------------------------------------------------
    | Handle browser preflight
    |--------------------------------------------------------------------------
    */

    if (req.method === "OPTIONS") {
      console.log(
        "[CORS] OPTIONS preflight accepted"
      );

      return res.status(204).end();
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| BODY PARSER
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
| ROOT
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      service: "manacine-api",
      message: "ManaCine backend is running",
    });
  }
);

/*
|--------------------------------------------------------------------------
| API ROOT
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
| HEALTH CHECK
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
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| PROJECT ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/projects",
  projectRoutes
);

/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
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
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (
    req: Request,
    res: Response
  ) => {
    console.log(
      `[404] ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      ok: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  }
);

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(
      "================================"
    );

    console.error(
      "MANACINE SERVER ERROR"
    );

    console.error(error);

    console.error(
      "================================"
    );

    res.status(500).json({
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
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "========================================"
    );

    console.log(
      "       MANACINE AI BACKEND"
    );

    console.log(
      "========================================"
    );

    console.log(
      `PORT: ${PORT}`
    );

    console.log(
      `ENVIRONMENT: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

    console.log(
      "ALLOWED ORIGINS:"
    );

    allowedOrigins.forEach(
      (origin) => {
        console.log(
          ` - ${origin}`
        );
      }
    );

    console.log(
      "========================================"
    );
  }
);
