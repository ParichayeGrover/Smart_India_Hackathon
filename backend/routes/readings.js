import express from "express";
import Reading from "../models/Reading.js";

const router = express.Router();

// Add new health reading
router.post("/", async (req, res) => {
  try {
    const reading = new Reading(req.body);
    await reading.save();
    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get readings for a patient
router.get("/:patientId", async (req, res) => {
  const readings = await Reading.find({ patientId: req.params.patientId }).sort({ timestamp: -1 });
  res.json(readings);
});

export default router;
