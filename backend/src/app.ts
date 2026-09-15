// src/app.ts
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import healthRouter from "./routes/health";
import projectRouter from "./routes/projectRoutes";
import snapshotRouter from "./routes/snapshotRoutes";
import analyticsRouter from "./routes/analyticsRoutes";
import riskRouter from "./routes/riskRoutes";
import comparisonRouter from "./routes/comparisonRoutes";
import predictionRouter from "./routes/predictionRoutes";
import errorHandler from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// API version prefix
const apiPrefix = "/api/v1";

app.use(`${apiPrefix}/health`, healthRouter);

// Snapshot routes are mounted before project routes so that the flat
// `/projects/snapshots` path is not captured by `/projects/:id`.
app.use(`${apiPrefix}/projects`, snapshotRouter);
app.use(`${apiPrefix}/projects`, projectRouter);

app.use(`${apiPrefix}/analytics`, analyticsRouter);
app.use(`${apiPrefix}/risk`, riskRouter);
app.use(`${apiPrefix}/comparison`, comparisonRouter);
app.use(`${apiPrefix}/predictions`, predictionRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
