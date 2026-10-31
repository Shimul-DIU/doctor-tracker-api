import { ZodError } from "zod";

export const notFound = (req, res) =>
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
};