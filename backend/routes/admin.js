import express from "express";
import bcrypt from "bcrypt";
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
    const result = await pool.query(`
      SELECT wb.*, 
             COALESCE(latest_wqr.status, 'Unknown') as status,
             latest_wqr.date as last_updated,
             latest_wqr.ph, latest_wqr.nitrates, latest_wqr.fluoride, 
             latest_wqr.arsenic, latest_wqr.ecoli, latest_wqr.tds,
             assigned_worker.name as assigned_worker_name,
             assigned_worker.id as assigned_worker_id
      FROM water_bodies wb
      LEFT JOIN (
        SELECT DISTINCT ON (water_body_id) 
               water_body_id,
               CASE 
                 WHEN ph < 6.5 OR ph > 8.5 OR 
                      nitrates > 50 OR 
                      fluoride > 1.5 OR 
                      arsenic > 0.01 OR 
                      ecoli > 0 OR 
                      tds > 500 
                 THEN 'Contaminated' 
                 ELSE 'Safe' 
               END as status,
               date, ph, nitrates, fluoride, arsenic, ecoli, tds
        FROM water_quality_reports 
        ORDER BY water_body_id, date DESC
      ) latest_wqr ON wb.id = latest_wqr.water_body_id
      LEFT JOIN worker_water_bodies wwb ON wb.id = wwb.water_body_id
      LEFT JOIN users assigned_worker ON wwb.worker_id = assigned_worker.id
      WHERE wb.village_id = $1 OR $1 IS NULL
    `, [village_id || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/workers?village_id=1 (village_id is optional)
router.get('/workers', async (req, res) => {
  const { village_id } = req.query;
  try {
    let query, params;
    if (village_id) {
      // Filter by village if village_id is provided
      query = "SELECT * FROM users WHERE role = 'worker' AND assigned_village = $1";
      params = [village_id];
    } else {
      // Return all workers if no village_id is provided
      query = "SELECT * FROM users WHERE role = 'worker'";
      params = [];
    }
    
    const result = await pool.query(query, params);
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
    const result = await pool.query(`
      SELECT a.*, v.name as village_name
      FROM alerts a
      JOIN villages v ON a.village_id = v.id
      WHERE a.village_id = $1 OR $1 IS NULL
      ORDER BY a.date DESC
    `, [village_id || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/health-reports?village_id=1
router.get('/health-reports', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT hr.*, v.name as village_name
      FROM health_reports hr
      JOIN villages v ON hr.village_id = v.id
      WHERE hr.village_id = $1 OR $1 IS NULL
      ORDER BY hr.date DESC
    `, [village_id || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/dashboard-stats?village_id=1
router.get('/dashboard-stats', async (req, res) => {
  const { village_id } = req.query;
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM water_bodies WHERE village_id = $1) as total_water_bodies,
        (SELECT COUNT(*) FROM users WHERE role = 'worker' AND assigned_village = $1) as total_workers,
        (SELECT COUNT(*) FROM alerts WHERE village_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days') as recent_alerts,
        (SELECT COUNT(*) FROM health_reports WHERE village_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days') as recent_health_reports
    `, [village_id]);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/create-worker
router.post('/create-worker', async (req, res) => {
  const { name, email, contact, assigned_village, password } = req.body;
  try {
    // Validate required fields
    if (!name || !email || !contact || !assigned_village || !password) {
      return res.status(400).json({ error: 'Name, email, contact, assigned village, and password are required' });
    }

    // Check if email already exists
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Check if contact already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE contact = $1', [contact]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this contact already exists' });
    }

    // Create the worker
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, contact, assigned_village',
      [name, email, 'worker', contact, assigned_village, hashedPassword]
    );

    res.json({ 
      message: 'Worker created successfully',
      worker: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/create-water-body
router.post('/create-water-body', async (req, res) => {
  const { name, type, village_id } = req.body;
  try {
    // Validate required fields
    if (!name || !type || !village_id) {
      return res.status(400).json({ error: 'Name, type, and village are required' });
    }

    // Check if water body with same name already exists in this village
    const existingWaterBody = await pool.query(
      'SELECT id FROM water_bodies WHERE name = $1 AND village_id = $2', 
      [name, village_id]
    );
    if (existingWaterBody.rows.length > 0) {
      return res.status(400).json({ error: 'A water body with this name already exists in this village' });
    }

    // Create the water body
    const result = await pool.query(
      'INSERT INTO water_bodies (name, type, village_id) VALUES ($1, $2, $3) RETURNING id, name, type, village_id',
      [name, type, village_id]
    );

    res.json({ 
      message: 'Water body created successfully',
      waterBody: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/delete-worker/:id
router.delete('/delete-worker/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if worker exists and is actually a worker
    const workerCheck = await pool.query('SELECT id, name, role FROM users WHERE id = $1 AND role = $2', [id, 'worker']);
    if (workerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Remove worker assignments first (to maintain referential integrity)
    await pool.query('DELETE FROM worker_water_bodies WHERE worker_id = $1', [id]);

    // Delete the worker
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ 
      message: 'Worker deleted successfully',
      deletedWorker: workerCheck.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
