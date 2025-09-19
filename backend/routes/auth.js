import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
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
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO users (name, role, contact, assigned_village, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, role, contact, assigned_village, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register-public
router.post('/register-public', async (req, res) => {
  const { name, email, contact, assigned_village, password } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email || !contact || !assigned_village || !password) {
      return res.status(400).json({ error: 'Name, email, contact, village, and password are required' });
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

    // Verify village exists
    const villageCheck = await pool.query('SELECT id FROM villages WHERE id = $1', [assigned_village]);
    if (villageCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid village selected' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the public user
    const result = await pool.query(
      'INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, contact, assigned_village',
      [name, email, 'citizen', contact, assigned_village, hashedPassword] // Note: role is 'citizen' for public users
    );

    res.json({ 
      message: 'Registration successful! You can now login with your credentials.',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
