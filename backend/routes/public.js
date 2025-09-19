import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/public/alerts?village_id=1
router.get('/alerts', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE village_id = $1', [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/water-status?village_id=1
router.get('/water-status', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT wb.name as area, wqr.status, wqr.date
       FROM water_quality_reports wqr
       JOIN water_bodies wb ON wqr.water_body_id = wb.id
       WHERE wb.village_id = $1`,
      [village_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
