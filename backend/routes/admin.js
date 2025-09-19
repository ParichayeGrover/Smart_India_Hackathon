import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/admin/villages
router.get('/villages', async (req, res) => {
  // For demo: return all villages (in real app, filter by admin's assigned_village)
  try {
    const result = await pool.query('SELECT * FROM villages');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/water-bodies?village_id=1
router.get('/water-bodies', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM water_bodies WHERE village_id = $1', [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/workers?village_id=1
router.get('/workers', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query("SELECT * FROM users WHERE role = 'worker' AND assigned_village = $1", [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/assign-worker
router.post('/assign-worker', async (req, res) => {
  const { worker_id, water_body_id } = req.body;
  try {
    await pool.query('INSERT INTO worker_water_bodies (worker_id, water_body_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [worker_id, water_body_id]);
    res.json({ message: 'Worker assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/assignments?village_id=1
router.get('/assignments', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT wwb.id, u.name as worker_name, wb.name as water_body_name
      FROM worker_water_bodies wwb
      JOIN users u ON wwb.worker_id = u.id
      JOIN water_bodies wb ON wwb.water_body_id = wb.id
      WHERE wb.village_id = $1
    `, [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/alerts?village_id=1
router.get('/alerts', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE village_id = $1', [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
