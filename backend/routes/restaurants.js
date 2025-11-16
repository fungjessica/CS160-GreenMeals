// ============================================
// RESTAURANT ROUTES
// ============================================
// Handles restaurant-related endpoints for both owners and customers
// - Restaurant owner: manage restaurant info, inventory, orders
// - Customers: search restaurants, view menus, get pickup slots

import express from 'express';
import axios from 'axios';
import pool from '../config/database.js';
import { authenticateToken, isRestaurantOwner } from '../middleware/auth.js';
import config from '../config/config.js';

const router = express.Router();

// ============================================
// RESTAURANT OWNER ENDPOINTS
// ============================================

/**
 * GET /api/restaurants/my-restaurant
 * Get restaurant details for logged-in owner
 * Requires: Restaurant owner authentication
 */
router.get('/my-restaurant', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.user.restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurants[0]);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/restaurants/update
 * Update restaurant information (name, address, cuisine, phone)
 * Uses Google Geocoding API to get coordinates from address
 * Requires: Restaurant owner authentication
 */
router.put('/update', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const { name, address, cuisine_type, phone } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'No restaurant found for this user' });
    }

    // Get coordinates from Google Geocoding API if address provided
    let latitude = null, longitude = null;
    if (address && config.googleMapsApiKey) {
      try {
        const geoRes = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json',
          {
            params: {
              address: address,
              key: config.googleMapsApiKey,
            },
          }
        );

        if (geoRes.data.status === 'OK') {
          const location = geoRes.data.results[0].geometry.location;
          latitude = location.lat;
          longitude = location.lng;
        }
      } catch (geoError) {
        console.error('Geocoding error:', geoError);
        // Continue without coordinates if geocoding fails
      }
    }

    // Update restaurant info
    const [result] = await pool.query(
      `UPDATE restaurants 
       SET name=?, address=?, latitude=?, longitude=?, cuisine_type=?, phone=? 
       WHERE id=?`,
      [name, address, latitude, longitude, cuisine_type, phone, restaurantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ 
      message: 'Restaurant information updated successfully',
      latitude,
      longitude
    });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/restaurants/inventory
 * Get all food items for restaurant owner's restaurant
 * Includes dietary tags for each item
 * Requires: Restaurant owner authentication
 */
router.get('/inventory', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const [foods] = await pool.query(
      `SELECT f.*, 
              GROUP_CONCAT(dr.restriction_name) as dietary_tags
       FROM foods f
       LEFT JOIN food_dietary_compliance fdc ON f.id = fdc.food_id
       LEFT JOIN dietary_restrictions dr ON fdc.restriction_id = dr.id
       WHERE f.restaurant_id = ?
       GROUP BY f.id
       ORDER BY f.created_at DESC`,
      [req.user.restaurantId]
    );

    res.json(foods);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/restaurants/foods
 * Add a new food item to restaurant's inventory
 * Requires: Restaurant owner authentication
 */
router.post('/foods', authenticateToken, isRestaurantOwner, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      name, 
      description, 
      price, 
      discount_percent, 
      photo_url, 
      available_quantity, 
      pickup_start, 
      pickup_end, 
      dietary_restriction_ids 
    } = req.body;

    await connection.beginTransaction();

    // Insert food item
    const [result] = await connection.query(
      `INSERT INTO foods (restaurant_id, name, description, price, discount_percent, photo_url, available_quantity, pickup_start, pickup_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.restaurantId, name, description, price, discount_percent || 0, photo_url, available_quantity, pickup_start, pickup_end]
    );

    const foodId = result.insertId;

    // Add dietary compliance tags
    if (dietary_restriction_ids && dietary_restriction_ids.length > 0) {
      const values = dietary_restriction_ids.map(rid => [foodId, rid]);
      await connection.query(
        'INSERT INTO food_dietary_compliance (food_id, restriction_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Food item added successfully', foodId });
  } catch (error) {
    await connection.rollback();
    console.error('Add food error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/restaurants/foods/:foodId
 * Delete a food item from inventory
 * Requires: Restaurant owner authentication
 */
router.delete('/foods/:foodId', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const { foodId } = req.params;

    // Only allow deletion if food belongs to this restaurant
    const [result] = await pool.query(
      'DELETE FROM foods WHERE id = ? AND restaurant_id = ?',
      [foodId, req.user.restaurantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/restaurant/orders
 * Get all orders for restaurant owner's restaurant
 * Includes customer info and order items
 * Requires: Restaurant owner authentication
 */
router.get('/orders', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    // Get all orders for this restaurant
    const [orders] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.phone as customer_phone,
              ps.slot_start, ps.slot_end
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN pickup_slots ps ON o.pickup_slot_id = ps.id
       WHERE o.restaurant_id = ?
       ORDER BY ps.slot_start DESC`,
      [req.user.restaurantId]
    );

    // Get items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, f.name as food_name
         FROM order_items oi
         JOIN foods f ON oi.food_id = f.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/restaurant/order/:orderId/status
 * Update order status (pending -> confirmed -> ready -> completed)
 * Requires: Restaurant owner authentication
 */
router.patch('/orders/:orderId/status', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update order status
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?',
      [status, orderId, req.user.restaurantId]
    );

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /owner/restaurant/report
router.get('/report', authenticateToken, async (req, res) => {
  
  try {
    const restaurantId = req.user.restaurantId; 
    console.log("🧩 Report route hit for restaurant:", restaurantId);
    console.log("🔐 Current user payload:", req.user); 
    const [rows] = await pool.query(`
      SELECT 
        f.name AS food_name,
        SUM(oi.quantity) AS total_sold,
  SUM(
    (oi.price * (1 - (f.discount_percent / 100))) * oi.quantity
  ) AS revenue
      FROM order_items oi
      JOIN foods f ON oi.food_id = f.id
      JOIN orders o ON o.id = oi.order_id
      WHERE f.restaurant_id = ?
        AND o.status IN ('completed')
      GROUP BY f.name
      ORDER BY revenue DESC;
    `, [restaurantId]);

    console.log("📊 Report result:", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to load report data" });
  }
});



// ============================================
// CUSTOMER ENDPOINTS
// ============================================


// router.get('/search', authenticateToken, async (req, res) => {
//   try {
//     const { latitude, longitude, radius = 5, restrictionIds } = req.query;
    
//     // Calculate distance using Haversine formula (in kilometers)
//     let query = `
//       SELECT DISTINCT r.id, r.name, r.address, r.latitude, r.longitude, 
//              r.cuisine_type, r.rating, r.phone,
//              (6371 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
//              cos(radians(r.longitude) - radians(?)) + 
//              sin(radians(?)) * sin(radians(r.latitude)))) AS distance
//       FROM restaurants r
//       WHERE r.id IN (SELECT DISTINCT restaurant_id FROM foods WHERE available_quantity > 0)
//     `;
    
//     const params = [latitude, longitude, latitude];
    
//     // Filter by dietary restrictions if specified
//     if (restrictionIds && restrictionIds.length > 0) {
//       const ids = Array.isArray(restrictionIds) ? restrictionIds : [restrictionIds];
//       query += `
//         AND r.id IN (
//           SELECT DISTINCT f.restaurant_id
//           FROM foods f
//           JOIN food_dietary_compliance fdc ON f.id = fdc.food_id
//           WHERE fdc.restriction_id IN (${ids.map(() => '?').join(',')})
//           GROUP BY f.restaurant_id
//           HAVING COUNT(DISTINCT fdc.restriction_id) = ?
//         )
//       `;
//       params.push(...ids, ids.length);
//     }
    
//     query += ` HAVING distance < ? ORDER BY distance LIMIT 10`;
//     params.push(radius);
    
//     const [restaurants] = await pool.query(query, params);
//     res.json(restaurants);
//   } catch (error) {
//     console.error('Search restaurants error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


export default router;