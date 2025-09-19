import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  email: { type: String, unique: true },
});

export default mongoose.model("Patient", patientSchema);
