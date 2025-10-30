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
    const { q, lat, lon, radius = 5000, restrictionIds } = req.query;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const maxDistanceMeters = 16093; // 10 miles

    // Parse restriction IDs if provided
    const restrictions = restrictionIds ? restrictionIds.split(',').map(id => parseInt(id)) : [];

    // ============================================
    // STEP 1: Search local database
    // ============================================
    let dbQuery = `
      SELECT r.id, r.name, r.address, r.latitude, r.longitude, 
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
    `;

    const params = [
      userLat, userLon, userLat, 
      `%${q}%`, `%${q}%`, 
      userLat, userLon, userLat, 
      maxDistanceMeters
    ];

    // Add dietary restriction filtering if restrictions are provided
    if (restrictions.length > 0) {
      dbQuery += `
        AND r.id IN (
          SELECT DISTINCT f.restaurant_id
          FROM foods f
          JOIN food_dietary_compliance fdc ON f.id = fdc.food_id
          WHERE fdc.restriction_id IN (${restrictions.map(() => '?').join(',')})
          AND f.available_quantity > 0
          GROUP BY f.restaurant_id, f.id
          HAVING COUNT(DISTINCT fdc.restriction_id) = ?
        )
      `;
      params.push(...restrictions, restrictions.length);
    }

    dbQuery += ` ORDER BY distance_m ASC LIMIT 10`;

    const [dbRestaurants] = await pool.query(dbQuery, params);

    // Format database results to match Yelp structure
    const formattedDbRestaurants = dbRestaurants.map(r => ({
      id: `db_${r.id}`,
      db_id: r.id, // Store the actual database ID for linking
      name: r.name,
      rating: parseFloat(r.rating) || 0,
      coordinates: {
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude)
      },
      location: {
        address1: r.address,
        city: r.address.split(',')[1]?.trim() || '',
        state: r.address.split(',')[2]?.trim().split(' ')[0] || ''
      },
      phone: r.phone,
      categories: r.cuisine_type ? [{ title: r.cuisine_type }] : [],
      available_items: r.available_items,
      source: 'database',
      has_menu: true,
      matches_restrictions: restrictions.length > 0 // Flag if filtered by restrictions
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
        source: 'yelp',
        matches_restrictions: false // Yelp results don't have our dietary data
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

    // Sort: database restaurants first (especially ones matching restrictions), then by rating
    combined.sort((a, b) => {
      // Prioritize restaurants matching restrictions
      if (a.matches_restrictions && !b.matches_restrictions) return -1;
      if (!a.matches_restrictions && b.matches_restrictions) return 1;
      
      // Then prioritize database restaurants
      if (a.source === 'database' && b.source !== 'database') return -1;
      if (a.source !== 'database' && b.source === 'database') return 1;
      
      // Finally sort by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    res.json({
      businesses: combined.slice(0, 10),
      total: combined.length,
      db_count: formattedDbRestaurants.length,
      yelp_count: yelpRestaurants.length,
      filtered_by_restrictions: restrictions.length > 0,
      restriction_ids: restrictions
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

export default router;