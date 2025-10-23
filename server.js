// ============================================
// SERVER.JS - Too Good To Go Backend API
// ============================================
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import axios from 'axios';

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ============================================
// CONFIGURATION CONSTANTS
// ============================================
const JWT_SECRET = 'your_jwt_secret_key_change_in_production';
const GOOGLE_MAPS_API_KEY = "AIzaSyDyQkvnxEaHaWOJp10IuVtM-ilMT_nxoaM";
const YELP_API_KEY = 'SeMVqOcTs3fB6lvE2mIdSsrn9KApbk7GKM5EAAQQiGpHiR9J2yfLW2J_fx2luw2QC11lDH9XV5EuySo0yimf_NGUOnLz1GyvUTRVWHK_IabIqFtPIgEPGufYkJfUaHYx';

// ============================================
// DATABASE CONNECTION POOL
// ============================================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Ethan06032004*',
  database: 'too_good_to_go',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const isRestaurantOwner = (req, res, next) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ error: 'Access denied. Restaurant owners only.' });
  }
  next();
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!['customer', 'restaurant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    let restaurantId = null;
    if (role === 'restaurant') {
      const [restaurantResult] = await pool.query(
        'INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)',
        [`${name}'s Restaurant`, 'Unknown address', phone]
      );
      restaurantId = restaurantResult.insertId;
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone, role, restaurantId]
    );

    const userId = result.insertId;
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

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
    const validPassword = await bcrypt.compare(password.trim(), user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

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

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, restaurant_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

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

// ============================================
// YELP API + DATABASE SEARCH
// ============================================
app.get('/api/yelp/restaurants', authenticateToken, async (req, res) => {
  try {
    const { q, lat, lon, radius = 5000 } = req.query;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const maxDistanceMeters = 16093;

    // STEP 1: Search database
    const [dbRestaurants] = await pool.query(
      `SELECT r.id, r.name, r.address, r.latitude, r.longitude, 
              r.cuisine_type, r.phone, r.rating,
              (6371000 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
              cos(radians(r.longitude) - radians(?)) + 
              sin(radians(?)) * sin(radians(r.latitude)))) AS distance_m,
              (SELECT COUNT(*) FROM foods f WHERE f.restaurant_id = r.id AND f.available_quantity > 0) as available_items
       FROM restaurants r
       WHERE (r.name LIKE ? OR r.cuisine_type LIKE ?)
       AND (6371000 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
            cos(radians(r.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(r.latitude)))) <= ?
       ORDER BY distance_m ASC
       LIMIT 10`,
      [userLat, userLon, userLat, `%${q}%`, `%${q}%`, userLat, userLon, userLat, maxDistanceMeters]
    );

    const formattedDbRestaurants = dbRestaurants.map(r => ({
      id: `db_${r.id}`,
      db_id: r.id,
      name: r.name,
      rating: parseFloat(r.rating) || 0,
      coordinates: {
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude)
      },
      location: {
        address1: r.address
      },
      phone: r.phone,
      categories: r.cuisine_type ? [{ title: r.cuisine_type }] : [],
      available_items: r.available_items,
      source: 'database',
      has_menu: true
    }));

    // STEP 2: Search Yelp (optional)
    let yelpRestaurants = [];
    try {
      const yelpResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
        headers: { Authorization: `Bearer ${YELP_API_KEY}` },
        params: {
          term: q || 'restaurants',
          latitude: userLat,
          longitude: userLon,
          radius: Math.min(parseInt(radius), maxDistanceMeters),
          categories: 'restaurants,food',
          limit: 10
        }
      });
      yelpRestaurants = (yelpResponse.data.businesses || []).map(r => ({
        ...r,
        source: 'yelp'
      }));
    } catch (yelpError) {
      console.error('Yelp API error:', yelpError.response?.data || yelpError.message);
    }

    // STEP 3: Combine
    const allRestaurants = [...formattedDbRestaurants, ...yelpRestaurants];
    const seen = new Set();
    const combined = allRestaurants.filter(r => {
      const key = `${r.name.toLowerCase()}_${Math.round(r.coordinates.latitude * 100)}_${Math.round(r.coordinates.longitude * 100)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json({
      businesses: combined.slice(0, 10),
      total: combined.length,
      db_count: formattedDbRestaurants.length,
      yelp_count: yelpRestaurants.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// ============================================
// RESTAURANT UPDATE
// ============================================
app.put('/api/restaurant/update', authenticateToken, async (req, res) => {
  try {
    const { name, address, cuisine_type, phone } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'No restaurant found for this user' });
    }

    let latitude = null, longitude = null;
    if (address) {
      const geoRes = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: address,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (geoRes.data.status === 'OK') {
        const location = geoRes.data.results[0].geometry.location;
        latitude = location.lat;
        longitude = location.lng;
      }
    }

    const [result] = await pool.query(
      `UPDATE restaurants 
       SET name=?, address=?, latitude=?, longitude=?, cuisine_type=?, phone=? 
       WHERE id=?`,
      [name, address, latitude, longitude, cuisine_type, phone, restaurantId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant information updated successfully' });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// DIETARY RESTRICTIONS
// ============================================
app.post('/api/users/restrictions', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { restrictionIds } = req.body;
    
    await connection.beginTransaction();
    
    await connection.query(
      'DELETE FROM user_dietary_restrictions WHERE user_id = ?',
      [req.user.id]
    );
    
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

app.get('/api/dietary-restrictions', async (req, res) => {
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

// ============================================
// RESTAURANT MANAGEMENT
// ============================================
app.get('/api/restaurant/my-restaurant', authenticateToken, isRestaurantOwner, async (req, res) => {
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

app.get('/api/restaurant/inventory', authenticateToken, isRestaurantOwner, async (req, res) => {
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

app.post('/api/restaurant/foods', authenticateToken, isRestaurantOwner, async (req, res) => {
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

    const [result] = await connection.query(
      `INSERT INTO foods (restaurant_id, name, description, price, discount_percent, photo_url, available_quantity, pickup_start, pickup_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.restaurantId, name, description, price, discount_percent || 0, photo_url, available_quantity, pickup_start, pickup_end]
    );

    const foodId = result.insertId;

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

app.delete('/api/restaurant/foods/:foodId', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const { foodId } = req.params;

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

app.get('/api/restaurant/orders', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
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

app.patch('/api/restaurant/orders/:orderId/status', authenticateToken, isRestaurantOwner, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

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

// ============================================
// CUSTOMER FEATURES
// ============================================
app.get('/api/restaurants/search', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, restrictionIds } = req.query;
    
    let query = `
      SELECT DISTINCT r.id, r.name, r.address, r.latitude, r.longitude, 
             r.cuisine_type, r.rating, r.phone,
             (6371 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
             cos(radians(r.longitude) - radians(?)) + 
             sin(radians(?)) * sin(radians(r.latitude)))) AS distance
      FROM restaurants r
      WHERE r.id IN (SELECT DISTINCT restaurant_id FROM foods WHERE available_quantity > 0)
    `;
    
    const params = [latitude, longitude, latitude];
    
    if (restrictionIds && restrictionIds.length > 0) {
      const ids = Array.isArray(restrictionIds) ? restrictionIds : [restrictionIds];
      query += `
        AND r.id IN (
          SELECT DISTINCT f.restaurant_id
          FROM foods f
          JOIN food_dietary_compliance fdc ON f.id = fdc.food_id
          WHERE fdc.restriction_id IN (${ids.map(() => '?').join(',')})
          GROUP BY f.restaurant_id
          HAVING COUNT(DISTINCT fdc.restriction_id) = ?
        )
      `;
      params.push(...ids, ids.length);
    }
    
    query += ` HAVING distance < ? ORDER BY distance LIMIT 10`;
    params.push(radius);
    
    const [restaurants] = await pool.query(query, params);
    res.json(restaurants);
  } catch (error) {
    console.error('Search restaurants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:restaurantId/menu', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { restrictionIds } = req.query;
    
    const [foods] = await pool.query(
      `SELECT f.* FROM foods f
       WHERE f.restaurant_id = ? AND f.available_quantity > 0
       ORDER BY f.created_at DESC`,
      [restaurantId]
    );
    
    for (let food of foods) {
      const [compliance] = await pool.query(
        `SELECT dr.id, dr.restriction_name, dr.restriction_type
         FROM dietary_restrictions dr
         JOIN food_dietary_compliance fdc ON dr.id = fdc.restriction_id
         WHERE fdc.food_id = ?`,
        [food.id]
      );
      food.dietaryCompliance = compliance;
      
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

app.get('/api/restaurants/:restaurantId/pickup-slots', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date } = req.query;
    
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

app.post('/api/orders', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { restaurantId, foodItems, pickupSlotId, totalAmount } = req.body;
    
    await connection.beginTransaction();
    
    const [slot] = await connection.query(
      `SELECT max_orders, 
              (SELECT COUNT(*) FROM orders WHERE pickup_slot_id = ? AND status != 'cancelled') as current_orders
       FROM pickup_slots WHERE id = ?`,
      [pickupSlotId, pickupSlotId]
    );
    
    if (slot.length === 0 || slot[0].current_orders >= slot[0].max_orders) {
      throw new Error('Pickup slot is full');
    }
    
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, restaurant_id, pickup_slot_id, total_amount, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [req.user.id, restaurantId, pickupSlotId, totalAmount]
    );
    
    const orderId = orderResult.insertId;
    
    for (let item of foodItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, food_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.foodId, item.quantity, item.price]
      );
      
      await connection.query(
        `UPDATE foods SET available_quantity = available_quantity - ? WHERE id = ?`,
        [item.quantity, item.foodId]
      );
    }
    
    await connection.commit();
    res.status(201).json({ orderId, message: 'Order created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
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

app.patch('/api/orders/:orderId/cancel', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { orderId } = req.params;
    
    await connection.beginTransaction();
    
    const [items] = await connection.query(
      'SELECT food_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    for (let item of items) {
      await connection.query(
        'UPDATE foods SET available_quantity = available_quantity + ? WHERE id = ?',
        [item.quantity, item.food_id]
      );
    }
    
    await connection.query(
      'UPDATE orders SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
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

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});