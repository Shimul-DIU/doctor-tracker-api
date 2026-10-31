import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const doctorSchema = z.object({
  name: z.string().trim().min(2),
  specialization: z.string().trim().min(2),
  hospital: z.string().trim().min(2),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Invalid phone"),
  email: z.string().trim().email(),
});

export const patientSchema = z.object({
  name: z.string().trim().min(2),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Invalid phone"),
  condition: z.string().trim().min(2),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  specialization: z.string().trim().optional(),
  hospital: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  doctor: z.string().trim().optional(),
});

export const buildDateRange = ({ from, to }) => {
  if (!from && !to) return undefined;
  const range = {};
  if (from) range.$gte = from;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
};