// ============================================
// USER ROUTES - Dietary Restrictions
// ============================================
// Handles user-related endpoints
// - Manage dietary restrictions
// - Get available dietary restrictions

import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/users/restrictions
 * Update user's dietary restrictions
 * Replaces all existing restrictions with new selection
 * Requires: Customer authentication
 */
router.post('/restrictions', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { restrictionIds } = req.body;
    
    await connection.beginTransaction();
    
    // Remove all existing restrictions for this user
    await connection.query(
      'DELETE FROM user_dietary_restrictions WHERE user_id = ?',
      [req.user.id]
    );
    
    // Add new restrictions if any were selected
    if (restrictionIds && restrictionIds.length > 0) {
      const values = restrictionIds.map(id => [req.user.id, id]);
      await connection.query(
        'INSERT INTO user_dietary_restrictions (user_id, restriction_id) VALUES ?',
        [values]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Dietary restrictions updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update restrictions error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/users/dietary-restrictions
 * OR /api/dietary-restrictions (for backward compatibility)
 * Get all available dietary restrictions
 * Used to populate selection options in the frontend
 * Public endpoint (no authentication required for listing)
 */
router.get('/dietary-restrictions', async (req, res) => {
  try {
    const [restrictions] = await pool.query(
      'SELECT id, restriction_name, restriction_type FROM dietary_restrictions ORDER BY restriction_type, restriction_name'
    );
    res.json(restrictions);
  } catch (error) {
    console.error('Get restrictions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;