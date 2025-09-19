import express from "express";
import pool from "../db.js";
const router = express.Router();

// For demo, use worker_id=2 (replace with auth in real app)
const DEMO_WORKER_ID = 2;

// GET /api/worker/water-bodies?worker_id=123
router.get('/water-bodies', async (req, res) => {
  const { worker_id } = req.query;
  
  if (!worker_id) {
    return res.status(400).json({ error: 'Worker ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT wb.* FROM water_bodies wb
       JOIN worker_water_bodies wwb ON wb.id = wwb.water_body_id
       WHERE wwb.worker_id = $1`,
      [worker_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/worker/water-quality?worker_id=123
router.get('/water-quality', async (req, res) => {
  const { worker_id } = req.query;
  
  if (!worker_id) {
    return res.status(400).json({ error: 'Worker ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT wqr.*, wb.name as water_body_name,
              CASE 
                WHEN wqr.arsenic > 0.01 OR 
                     wqr.lead > 0.015 OR 
                     wqr.nitrates > 50 OR 
                     wqr.bacteria > 100 OR
                     wqr.viruses > 0 OR
                     wqr.mercury > 0.002 OR
                     wqr.cadmium > 0.005
                THEN 'Contaminated' 
                ELSE 'Safe' 
              END as status
       FROM water_quality_reports wqr
       JOIN water_bodies wb ON wqr.water_body_id = wb.id
       WHERE wqr.water_body_id IN (
         SELECT water_body_id FROM worker_water_bodies WHERE worker_id = $1
       )
       ORDER BY wqr.date DESC`,
      [worker_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/worker/water-quality

import dotenv from 'dotenv';
dotenv.config();

// Model API expects these features:
const MODEL_FEATURES = [
  'aluminium','ammonia','arsenic','barium','cadmium','chloramine','chromium','copper','flouride','bacteria','viruses','lead','nitrates','nitrites','mercury','perchlorate','radium','selenium','silver','uranium'
];

router.post('/water-quality', async (req, res) => {
  const { water_body_id, date, ...params } = req.body;
  try {
    const reportDate = date || new Date().toISOString().split('T')[0];
    // Insert report as usual
    const featureCols = MODEL_FEATURES.join(',');
    const featurePlaceholders = MODEL_FEATURES.map((_, i) => `$${i + 3}`).join(',');
    const insertQuery = `INSERT INTO water_quality_reports (water_body_id, date, ${featureCols}) VALUES ($1, $2, ${featurePlaceholders}) RETURNING *`;
    const insertValues = [water_body_id, reportDate, ...MODEL_FEATURES.map(f => params[f] ?? null)];
    const insertResult = await pool.query(insertQuery, insertValues);
    const report = insertResult.rows[0];

    // Prepare features for model API
    const features = {};
    for (const f of MODEL_FEATURES) features[f] = params[f] ?? 0;

    // Call model API using base URL from env
    const baseUrl = process.env.MODEL_API_URL || 'http://localhost:8000';
    const modelRes = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    const modelData = await modelRes.json();

    // If unsafe, create alert
    if (modelData.status === 'Unsafe') {
      // Find village_id for this water_body
      const vq = await pool.query('SELECT village_id FROM water_bodies WHERE id = $1', [water_body_id]);
      const village_id = vq.rows[0]?.village_id;
      await pool.query(
        `INSERT INTO alerts (village_id, date, risk_level, likely_disease, alert_type, sent_to)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [village_id, reportDate, 'High', modelData.predicted_disease, 'water_contamination', 'community']
      );
    }

    res.json({ message: 'Water quality report submitted', report, model: modelData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/worker/water-quality/:id
router.put('/water-quality/:id', async (req, res) => {
  const { id } = req.params;
  const { turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds, date } = req.body;
  try {
    const reportDate = date || new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `UPDATE water_quality_reports SET 
       date=$2, turbidity=$3, ph=$4, dissolved_oxygen=$5, nitrates=$6, 
       fluoride=$7, arsenic=$8, ecoli=$9, tds=$10 
       WHERE id=$1 RETURNING *`,
      [id, reportDate, turbidity || null, ph || null, dissolved_oxygen || null, nitrates || null, fluoride || null, arsenic || null, ecoli || null, tds || null]
    );
    res.json({ message: 'Water quality report updated', report: result.rows[0] });
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
    const reportDate = date || new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `INSERT INTO health_reports (village_id, date, symptoms, case_counts, reporter_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [village_id, reportDate, symptoms, case_counts || 1, reporter_type || 'CHW']
    );
    res.json({ message: 'Health report submitted', report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/worker/health-reports
router.get('/health-reports', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hr.*, v.name as village_name 
       FROM health_reports hr
       JOIN villages v ON hr.village_id = v.id
       WHERE hr.village_id IN (
         SELECT assigned_village FROM users WHERE id = $1
       )
       ORDER BY hr.date DESC`,
      [DEMO_WORKER_ID]
    );
    res.json(result.rows);
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
