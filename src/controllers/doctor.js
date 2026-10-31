import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  doctorSchema,
  patientSchema,
  listQuerySchema,
  buildDateRange,
} from "../utils/schemas.js";

const paginated = (items, total, page, limit) => ({
  items,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
});

export const listDoctors = asyncHandler(async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const filter = {};
  if (q.search) filter.$text = { $search: q.search };
  if (q.specialization) filter.specialization = q.specialization;
  if (q.hospital) filter.hospital = q.hospital;
  const range = buildDateRange(q);
  if (range) filter.createdAt = range;

  const [items, total] = await Promise.all([
    Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);
  res.json(paginated(items, total, q.page, q.limit));
});

// filter dropdown এর জন্য distinct মান
export const doctorFilters = asyncHandler(async (_req, res) => {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct("specialization"),
    Doctor.distinct("hospital"),
  ]);
  res.json({ specializations: specializations.sort(), hospitals: hospitals.sort() });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).lean();
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

export const createDoctor = asyncHandler(async (req, res) => {
  const data = doctorSchema.parse(req.body);
  const doctor = await Doctor.create(data);
  res.status(201).json(doctor);
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const data = doctorSchema.partial().parse(req.body);
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  await Patient.deleteMany({ doctor: doctor._id }); // cascade
  res.json({ message: "Doctor and related patients deleted" });
});

/* ---- doctor এর অধীনে patients ---- */
export const listDoctorPatients = asyncHandler(async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const filter = { doctor: req.params.id };
  if (q.search) filter.$text = { $search: q.search };
  if (q.condition) filter.condition = q.condition;

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);
  res.json(paginated(items, total, q.page, q.limit));
});

export const addPatientToDoctor = asyncHandler(async (req, res) => {
  const exists = await Doctor.exists({ _id: req.params.id });
  if (!exists) return res.status(404).json({ message: "Doctor not found" });
  const data = patientSchema.parse(req.body);
  const patient = await Patient.create({ ...data, doctor: req.params.id });
  res.status(201).json(patient);
});

export const removePatientFromDoctor = asyncHandler(async (req, res) => {
  const result = await Patient.findOneAndDelete({
    _id: req.params.patientId,
    doctor: req.params.id,
  });
  if (!result) return res.status(404).json({ message: "Patient not found" });
  res.json({ message: "Patient removed" });
});