import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/villages - Public endpoint for getting all villages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, district, state FROM villages ORDER BY state, district, name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching villages:', err);
    res.status(500).json({ error: 'Failed to fetch villages' });
  }
});

export default router;