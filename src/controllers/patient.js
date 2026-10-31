import Patient from "../models/Patient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { patientSchema, listQuerySchema, buildDateRange } from "../utils/schemas.js";

export const listPatients = asyncHandler(async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const filter = {};
  if (q.search) filter.$text = { $search: q.search };
  if (q.condition) filter.condition = q.condition;
  if (q.doctor) filter.doctor = q.doctor;
  const range = buildDateRange(q);
  if (range) filter.createdAt = range;

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);
  res.json({
    items,
    meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 },
  });
});

export const patientConditions = asyncHandler(async (_req, res) => {
  res.json({ conditions: (await Patient.distinct("condition")).sort() });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const data = patientSchema.partial().parse(req.body);
  const patient = await Patient.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json({ message: "Patient deleted" });
});