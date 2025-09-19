import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/villages
router.get('/villages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM villages');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/water-bodies?village_id=1
router.get('/water-bodies', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM water_bodies WHERE village_id = $1', [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
