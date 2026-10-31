import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 864e5);

const specs = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "Medicine"];
const hospitals = ["Square Hospital", "United Hospital", "Evercare", "Labaid", "Popular"];
const conditions = ["Hypertension", "Diabetes", "Asthma", "Migraine", "Fracture", "Fever", "Allergy"];

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([User.deleteMany(), Doctor.deleteMany(), Patient.deleteMany()]);
await Promise.all([User.syncIndexes(), Doctor.syncIndexes(), Patient.syncIndexes()]);

await User.create({
  name: "Admin",
  email: process.env.ADMIN_EMAIL,
  password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
});

const doctors = await Doctor.insertMany(
  Array.from({ length: 15 }, (_, i) => ({
    name: `Dr. Demo ${i + 1}`,
    specialization: pick(specs),
    hospital: pick(hospitals),
    phone: `017000000${String(i).padStart(2, "0")}`,
    email: `doctor${i + 1}@example.com`,
    createdAt: daysAgo(Math.floor(Math.random() * 30)),
  }))
);

await Patient.insertMany(
  Array.from({ length: 200 }, (_, i) => ({
    name: `Patient ${i + 1}`,
    age: 5 + Math.floor(Math.random() * 80),
    gender: pick(["male", "female", "other"]),
    phone: `018000000${String(i).padStart(3, "0")}`,
    condition: pick(conditions),
    doctor: pick(doctors)._id,
    createdAt: daysAgo(Math.floor(Math.random() * 30)),
  }))
);

console.log("Seeded. Login:", process.env.ADMIN_EMAIL);
await mongoose.disconnect();