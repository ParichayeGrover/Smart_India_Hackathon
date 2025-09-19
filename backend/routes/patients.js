import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// Register new patient
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all patients
router.get("/", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

export default router;
