import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  },
  { timestamps: true }
);

patientSchema.index({ name: "text", condition: "text" });
patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });

export default mongoose.model("Patient", patientSchema);