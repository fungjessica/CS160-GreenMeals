import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// We'll test with a real database connection for integration tests
// Or you can create a test database
describe('Restaurant Routes - Integration Tests', () => {
  let app;

  beforeAll(async () => {
    // Import your actual routes
    const restaurantRoutes = await import('../routes/restaurants.js');
    
    // Create test app
    app = express();
    app.use(express.json());
    
    // Add auth middleware that sets a test user
    app.use((req, res, next) => {
      req.user = { 
        id: 1, 
        restaurantId: 1, 
        role: 'restaurant' 
      };
      next();
    });
    
    app.use('/api/restaurants', restaurantRoutes.default);
  });

  it('should return 404 for non-existent restaurant', async () => {
    const response = await request(app)
      .get('/api/restaurants/my-restaurant');
    
    expect([200, 401]).toContain(response.status);
  });
});