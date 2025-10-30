import express from 'express';
import axios from 'axios';
import pool from '../config/database.js';
import { authenticateToken, isRestaurantOwner } from '../middleware/auth.js';
import config from '../config/config.js';

const router = express.Router();
// GET /api/customer/restaurant/search
// Get all restaurants match with restaurant name input from users or selected cuisine
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
      const [restaurants] = await pool.query(
        `
        SELECT * FROM restaurants
        WHERE name LIKE ? OR cuisine_type LIKE ?
        `,
        [`%${q}%`, `%${q}%`]
      );
  
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'No restaurants found' });
      }
  
      res.json(restaurants);
    } catch (error) {
      console.error('Search restaurant error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

/**
 * GET /api/restaurants/:restaurantId/menu
 * Get menu (food items) for a specific restaurant
 * Shows which items match user's dietary restrictions
 * Requires: Customer authentication
 */
router.get('/:restaurantId/menu', authenticateToken, async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const { restrictionIds } = req.query;
      
      // Get all available food items
      const [foods] = await pool.query(
        `SELECT f.* FROM foods f
         WHERE f.restaurant_id = ? AND f.available_quantity > 0
         ORDER BY f.created_at DESC`,
        [restaurantId]
      );
      
      // For each food item, get its dietary compliance tags
      for (let food of foods) {
        const [compliance] = await pool.query(
          `SELECT dr.id, dr.restriction_name, dr.restriction_type
           FROM dietary_restrictions dr
           JOIN food_dietary_compliance fdc ON dr.id = fdc.restriction_id
           WHERE fdc.food_id = ?`,
          [food.id]
        );
        food.dietaryCompliance = compliance;
        
        // Check if food matches user's restrictions
        if (restrictionIds) {
          const ids = Array.isArray(restrictionIds) ? restrictionIds : [restrictionIds];
          food.matchesRestrictions = ids.every(id => 
            compliance.some(c => c.id === parseInt(id))
          );
        }
      }
      
      res.json(foods);
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
   * GET /api/restaurants/:restaurantId/pickup-slots
   * Get available pickup time slots for a restaurant on a specific date
   * Requires: Customer authentication
   */
  router.get('/:restaurantId/pickup-slots', authenticateToken, async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      // Get slots with current booking counts
      const [slots] = await pool.query(
        `SELECT id, slot_start, slot_end, max_orders, 
                (SELECT COUNT(*) FROM orders WHERE pickup_slot_id = ps.id AND status != 'cancelled') as current_orders,
                (max_orders - (SELECT COUNT(*) FROM orders WHERE pickup_slot_id = ps.id AND status != 'cancelled')) as available_slots
         FROM pickup_slots ps
         WHERE restaurant_id = ? AND DATE(slot_start) = ? AND slot_start > NOW()
         ORDER BY slot_start`,
        [restaurantId, date]
      );
      
      res.json(slots);
    } catch (error) {
      console.error('Get pickup slots error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

export default router;