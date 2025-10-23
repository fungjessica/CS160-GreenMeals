// ============================================
// SERVER.JS - Too Good To Go Backend API
// ============================================
// Main entry point for the Express server
// All business logic is in separate route files

import express from 'express';
import cors from 'cors';
import config from './config/config.js';

// Import all route modules
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import yelpRoutes from './routes/yelp.js';

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS - allows frontend to communicate with backend
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware (optional - helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// API ROUTES
// ============================================

// Mount all routes with their base paths
app.use('/api/auth', authRoutes);              // Authentication: /api/auth/*
app.use('/api/users', userRoutes);             // User management: /api/users/*
app.use('/api/restaurants', restaurantRoutes); // Restaurant operations: /api/restaurants/*
app.use('/api/orders', orderRoutes);           // Order management: /api/orders/*
app.use('/api/yelp', yelpRoutes);              // Yelp integration: /api/yelp/*

// Backward compatibility route for old frontend code
// This allows /api/dietary-restrictions to still work
app.get('/api/dietary-restrictions', async (req, res, next) => {
  try {
    // Import the handler from users route
    const { default: usersRouter } = await import('./routes/users.js');
    req.url = '/dietary-restrictions';
    usersRouter(req, res, next);
  } catch (error) {
    next(error);
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Health check endpoint - useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Too Good To Go API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      yelp: '/api/yelp',
      health: '/api/health'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - catch all undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler - catches all errors
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n🚀 ====================================');
  console.log('   Too Good To Go Backend Server');
  console.log('   ====================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log('====================================\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});