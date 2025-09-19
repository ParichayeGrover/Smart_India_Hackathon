import express from "express";
import pool from "../db.js";
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
    const user = result.rows[0];
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // For demo, return a dummy JWT
    res.json({ token: 'dummy-jwt-token', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, role, contact, assigned_village, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, role, contact, assigned_village, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, role, contact, assigned_village, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
