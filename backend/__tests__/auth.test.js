import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Auth Routes', () => {
  let request, express, authRoutes, app, pool, bcrypt, jwt;
  
  beforeEach(async () => {
    jest.resetModules();
    
    jest.unstable_mockModule('../config/database.js', () => ({
      default: {
        query: jest.fn(),
        getConnection: jest.fn()
      }
    }));
    
    jest.unstable_mockModule('bcrypt', () => ({
      default: {
        hash: jest.fn(),
        compare: jest.fn()
      }
    }));
    
    jest.unstable_mockModule('jsonwebtoken', () => ({
      default: {
        sign: jest.fn(() => 'fake-jwt-token')
      }
    }));
    
    const supertestModule = await import('supertest');
    request = supertestModule.default;
    
    const expressModule = await import('express');
    express = expressModule.default;
    
    const authModule = await import('../routes/auth.js');
    authRoutes = authModule.default;
    
    const poolModule = await import('../config/database.js');
    pool = poolModule.default;
    
    const bcryptModule = await import('bcrypt');
    bcrypt = bcryptModule.default;
    
    const jwtModule = await import('jsonwebtoken');
    jwt = jwtModule.default;
    
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer successfully', async () => {
      bcrypt.hash.mockResolvedValue('hashed_password_123');
      pool.query.mockResolvedValue([{ insertId: 1 }]);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '555-1234',
          role: 'customer'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should handle duplicate email errors', async () => {
      bcrypt.hash.mockResolvedValue('hashed_password');
      pool.query.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
          role: 'customer'
        });
      
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login customer with valid credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: 'hashed_password',
        role: 'customer',
        restaurant_id: null,
        phone: '555-1234'
      };

      const mockRestrictions = [
        { id: 1, restriction_name: 'Vegan', restriction_type: 'dietary_preference' }
      ];
      
      pool.query
        .mockResolvedValueOnce([[mockUser]])
        .mockResolvedValueOnce([mockRestrictions]);
      
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'fake-jwt-token');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password_hash: 'hashed_password',
        role: 'customer'
      };
      
      pool.query.mockResolvedValueOnce([[mockUser]]);
      bcrypt.compare.mockResolvedValue(false);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrong-password'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database connection failed'));
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Server error');
    });
  });
});