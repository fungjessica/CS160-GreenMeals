// ============================================
// ORDER ROUTES - Customer Order Management
// ============================================
// Handles customer order operations
// - Create new orders
// - View order history
// - Cancel orders
// - Pay orders

import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 * - Reserves pickup slot
 * - Creates order record
 * - Adds order items
 * - Decrements food inventory
 * Requires: Customer authentication
 */
router.post('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { restaurantId, foodItems, pickupSlotId, totalAmount } = req.body;
    
    await connection.beginTransaction();
    
    // Check if pickup slot is still available
    const [slot] = await connection.query(
      `SELECT max_orders, 
              (SELECT COUNT(*) FROM orders WHERE pickup_slot_id = ? AND status != 'cancelled') as current_orders
       FROM pickup_slots WHERE id = ?`,
      [pickupSlotId, pickupSlotId]
    );
    
    if (slot.length === 0) {
      throw new Error('Pickup slot not found');
    }
    
    /*
    if (slot[0].current_orders >= slot[0].max_orders) {
      throw new Error('Pickup slot is full');
    }
    */
    
    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, restaurant_id, pickup_slot_id, total_amount, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [req.user.id, restaurantId, pickupSlotId, totalAmount]
    );
    
    const orderId = orderResult.insertId;
    
    // Add order items and decrement inventory
    for (let item of foodItems) {
      // Check if food has enough quantity
      const [food] = await connection.query(
        'SELECT available_quantity FROM foods WHERE id = ?',
        [item.foodId]
      );
      
      if (food.length === 0 || food[0].available_quantity < item.quantity) {
        throw new Error(`Insufficient quantity for food item ${item.foodId}`);
      }
      
      // Insert order item
      await connection.query(
        `INSERT INTO order_items (order_id, food_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.foodId, item.quantity, item.price]
      );
      
      // Reduce available quantity
      await connection.query(
        `UPDATE foods SET available_quantity = available_quantity - ? WHERE id = ?`,
        [item.quantity, item.foodId]
      );
    }
    
    await connection.commit();
    res.status(201).json({ 
      orderId, 
      message: 'Order created successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/orders
 * Get all orders for logged-in customer
 * Includes restaurant info, pickup time, and order items
 * Requires: Customer authentication
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get all orders for this user
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              r.name as restaurant_name, r.address as restaurant_address,
              ps.slot_start, ps.slot_end
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       JOIN pickup_slots ps ON o.pickup_slot_id = ps.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    
    // Get items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.quantity, oi.price, f.name as food_name
         FROM order_items oi
         JOIN foods f ON oi.food_id = f.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;

    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel an order
 * - Marks order as cancelled
 * - Restores food quantities
 * - Frees up pickup slot
 * Requires: Customer authentication
 */
router.patch('/:orderId/cancel', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { orderId } = req.params;
    
    // Verify order belongs to this user
    const [orders] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (orders[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }
    
    if (orders[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed order' });
    }
    
    await connection.beginTransaction();
    
    // Get order items to restore quantities
    const [items] = await connection.query(
      'SELECT food_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    // Restore food quantities
    for (let item of items) {
      await connection.query(
        'UPDATE foods SET available_quantity = available_quantity + ? WHERE id = ?',
        [item.quantity, item.food_id]
      );
    }
    
    // Mark order as cancelled
    await connection.query(
      'UPDATE orders SET status = "cancelled" WHERE id = ?',
      [orderId]
    );
    
    await connection.commit();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

/**
 * PATCH /api/orders/:orderId/pay
 * Mark order as paid
 * Requires: Customer authentication
 */
router.patch('/:orderId/pay', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify the order belongs to the logged-in user
    const [orders] = await pool.query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orders[0].status === 'completed') {
      return res.status(400).json({ error: 'Order already completed' });
    }

    await pool.query('UPDATE orders SET status = "completed" WHERE id = ?', [orderId]);

    res.json({ message: 'Order marked as completed successfully' });
  } catch (error) {
    console.error('Error updating order status to completed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.use((req, res) => {
  console.log("⚠️ orderRoutes unmatched:", req.method, req.originalUrl);
  res.status(404).json({ error: 'Order route not found', path: req.originalUrl });
});
export default router;