// Authentication routes
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import config from '../config/config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = config.jwtSecret;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    if (!['customer', 'restaurant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    } 
    // check email exists or not
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    //create user
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone, role]
    );
    const userId = userResult.insertId;

    let restaurantId = null;
    //if restaurant -> use userId as owner_id for that retaurant
    if (role === 'restaurant') {
      const [restaurantResult] = await pool.query(
        'INSERT INTO restaurants (name, address, phone,owner_id) VALUES (?, ?, ?,?)',
        [`${name}'s Restaurant`, 'Unknown address', phone, userId]
      );
      restaurantId = restaurantResult.insertId;
      // Update user record with restaurantId
      await pool.query('UPDATE users SET restaurant_id = ? WHERE id = ?', [restaurantId, userId]);
    }

    const token = jwt.sign({ id: userId, email, role, restaurantId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email, role, restaurantId }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.query(
      `SELECT u.*, r.name AS restaurant_name
       FROM users u
       LEFT JOIN restaurants r ON u.restaurant_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Compare provided password with hashed password in database
    const validPassword = await bcrypt.compare(password.trim(), user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurantId: user.restaurant_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurant_id,
        restaurantName: user.restaurant_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Get user basic info
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, restaurant_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If customer, also get their dietary restrictions
    let dietaryRestrictions = [];
    if (users[0].role === 'customer') {
      const [restrictions] = await pool.query(
        `SELECT dr.id, dr.restriction_name, dr.restriction_type 
         FROM dietary_restrictions dr
         JOIN user_dietary_restrictions udr ON dr.id = udr.restriction_id
         WHERE udr.user_id = ?`,
        [req.user.id]
      );
      dietaryRestrictions = restrictions;
    }

    res.json({
      user: users[0],
      dietaryRestrictions
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;