import express from "express";
import pool from "../db.js";
const router = express.Router();

// For demo, use worker_id=2 (replace with auth in real app)
const DEMO_WORKER_ID = 2;

// GET /api/worker/water-bodies
router.get('/water-bodies', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wb.* FROM water_bodies wb
       JOIN worker_water_bodies wwb ON wb.id = wwb.water_body_id
       WHERE wwb.worker_id = $1`,
      [DEMO_WORKER_ID]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/worker/water-quality
router.get('/water-quality', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM water_quality_reports WHERE water_body_id IN (
        SELECT water_body_id FROM worker_water_bodies WHERE worker_id = $1
      )`,
      [DEMO_WORKER_ID]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/worker/water-quality
router.post('/water-quality', async (req, res) => {
  const { water_body_id, turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds, date } = req.body;
  try {
    await pool.query(
      `INSERT INTO water_quality_reports (water_body_id, date, turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [water_body_id, date, turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds]
    );
    res.json({ message: 'Water quality report submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/worker/water-quality/:id
router.put('/water-quality/:id', async (req, res) => {
  const { id } = req.params;
  const { turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds, date } = req.body;
  try {
    await pool.query(
      `UPDATE water_quality_reports SET date=$2, turbidity=$3, ph=$4, dissolved_oxygen=$5, nitrates=$6, fluoride=$7, arsenic=$8, ecoli=$9, tds=$10 WHERE id=$1`,
      [id, date, turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds]
    );
    res.json({ message: 'Water quality report updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/worker/water-quality/:id
router.delete('/water-quality/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM water_quality_reports WHERE id = $1', [id]);
    res.json({ message: 'Water quality report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/worker/health-report
router.post('/health-report', async (req, res) => {
  const { village_id, date, symptoms, case_counts, reporter_type } = req.body;
  try {
    await pool.query(
      `INSERT INTO health_reports (village_id, date, symptoms, case_counts, reporter_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [village_id, date, symptoms, case_counts, reporter_type]
    );
    res.json({ message: 'Health report submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/worker/alerts
router.get('/alerts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts WHERE village_id IN (
        SELECT assigned_village FROM users WHERE id = $1
      )`,
      [DEMO_WORKER_ID]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
