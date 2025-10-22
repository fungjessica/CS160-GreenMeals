import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const JWT_SECRET = config.jwtSecret;

// Define the middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export function isRestaurantOwner(req, res, next) {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ error: 'Access denied. Restaurant owners only.' });
  }
  next();
}