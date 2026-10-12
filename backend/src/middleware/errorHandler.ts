import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Invalid request data";
    res.status(400).json({ error: message, details: err.errors });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error", message: err instanceof Error ? err.message : String(err) });
}
