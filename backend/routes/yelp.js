// ============================================
// YELP ROUTES - Yelp API Integration
// ============================================
// Handles all Yelp API related endpoints
// - Search restaurants using Yelp API
// - Combine local database results with Yelp results

import express from 'express';
import axios from 'axios';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import config from '../config/config.js';

const router = express.Router();

/**
 * GET /api/yelp/restaurants
 * Search restaurants: combines local database results with Yelp API
 * 1. Searches local database within 10 miles
 * 2. Searches Yelp API
 * 3. Combines and deduplicates results
 * Requires authentication
 */
router.get('/restaurants', authenticateToken, async (req, res) => {
  try {
    const { q, lat, lon, radius = 5000 } = req.query;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    
    // 10 miles = 16,093 meters
    const maxDistanceMeters = 16093;

    // ============================================
    // STEP 1: Search local database
    // ============================================
    const [dbRestaurants] = await pool.query(
      `SELECT r.id, r.name, r.address, r.latitude, r.longitude, 
              r.cuisine_type, r.phone, r.rating,
              (6371000 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
              cos(radians(r.longitude) - radians(?)) + 
              sin(radians(?)) * sin(radians(r.latitude)))) AS distance_m
       FROM restaurants r
       WHERE (r.name LIKE ? OR r.cuisine_type LIKE ?)
       AND (6371000 * acos(cos(radians(?)) * cos(radians(r.latitude)) * 
            cos(radians(r.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(r.latitude)))) <= ?
       ORDER BY distance_m ASC
       LIMIT 10`,
      [userLat, userLon, userLat, `%${q}%`, `%${q}%`, userLat, userLon, userLat, maxDistanceMeters]
    );

    // Format database results to match Yelp structure
    const formattedDbRestaurants = dbRestaurants.map(r => ({
      id: `db_${r.id}`,
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
      cuisine_type: r.cuisine_type,
      categories: r.cuisine_type ? [{ title: r.cuisine_type }] : [],
      distance: r.distance_m,
      source: 'database'
    }));

    // ============================================
    // STEP 2: Search Yelp API
    // ============================================
    let yelpRestaurants = [];
    try {
      const yelpResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
        headers: { Authorization: `Bearer ${config.yelpApiKey}` },
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
      // Continue with just database results if Yelp fails
    }

    // ============================================
    // STEP 3: Combine and deduplicate results
    // ============================================
    const allRestaurants = [...formattedDbRestaurants, ...yelpRestaurants];
    
    // Remove duplicates (same restaurant from both sources)
    // Match by similar names and proximity
    const seen = new Set();
    const combined = allRestaurants.filter(r => {
      const coords = r.coordinates || { latitude: 0, longitude: 0 };
      const key = `${r.name.toLowerCase()}_${Math.round(coords.latitude * 100)}_${Math.round(coords.longitude * 100)}`;
      if (seen.has(key)) {
        return false;
      }
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

export default router;