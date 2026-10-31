import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const daily = (since) => [
  { $match: { createdAt: { $gte: since } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, date: "$_id", count: 1 } },
];

export const getStats = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalDoctors, totalPatients, patientsPerDoctor, patientsDaily, doctorsDaily, conditions] =
    await Promise.all([
      Doctor.estimatedDocumentCount(),
      Patient.estimatedDocumentCount(),
      Patient.aggregate([
        { $group: { _id: "$doctor", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "d" } },
        { $unwind: "$d" },
        { $project: { _id: 0, doctorId: "$_id", name: "$d.name", count: 1 } },
      ]),
      Patient.aggregate(daily(since)),
      Doctor.aggregate(daily(since)),
      Patient.aggregate([
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, condition: "$_id", count: 1 } },
      ]),
    ]);

  res.json({
    totals: {
      doctors: totalDoctors,
      patients: totalPatients,
      avgPatientsPerDoctor: totalDoctors ? +(totalPatients / totalDoctors).toFixed(1) : 0,
    },
    patientsPerDoctor,
    patientsDaily,
    doctorsDaily,
    conditions,
    rangeDays: days,
  });
});