import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect, requireRole } from "../middleware/auth.js";
import { login, me } from "../controllers/auth.js";
import * as doctor from "../controllers/doctor.js";
import * as patient from "../controllers/patient.js";
import { getStats } from "../controllers/dashboard.js";

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
router.post("/auth/login", loginLimiter, login);

// এর পরের সব route protected
router.use(protect, requireRole("admin"));
router.get("/auth/me", me);

router.get("/dashboard/stats", getStats);

router.get("/doctors/filters", doctor.doctorFilters);
router.route("/doctors").get(doctor.listDoctors).post(doctor.createDoctor);
router
  .route("/doctors/:id")
  .get(doctor.getDoctor)
  .put(doctor.updateDoctor)
  .delete(doctor.deleteDoctor);
router
  .route("/doctors/:id/patients")
  .get(doctor.listDoctorPatients)
  .post(doctor.addPatientToDoctor);
router.delete("/doctors/:id/patients/:patientId", doctor.removePatientFromDoctor);

router.get("/patients/conditions", patient.patientConditions);
router.get("/patients", patient.listPatients);
router.route("/patients/:id").put(patient.updatePatient).delete(patient.deletePatient);

export default router;