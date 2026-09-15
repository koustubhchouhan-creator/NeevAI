// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

// Centralized error handling middleware
export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Duplicate key (e.g. projectId already exists)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    message = `Duplicate ${field}: ${err.keyValue?.[field]}`;
  }

  // Mongoose validation / cast errors
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors ?? {})
      .map((e: any) => e.message)
      .join("; ");
  }

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  res.status(status).json({ status: "error", message });
}
