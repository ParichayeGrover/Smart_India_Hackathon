import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  heartRate: Number,
  bloodPressure: String, // e.g. "120/80"
  oxygenLevel: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Reading", readingSchema);
