// File: server/tests/unit/auth.test.js

const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User.model');
const { generateTenantId } = require('../../utils/helpers');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@student.com',
          password: 'Password123!',
          role: 'student',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+61400000000'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@student.com');
    });

    it('should not register with duplicate email', async () => {
      await User.create({
        email: 'duplicate@test.com',
        password: 'Password123!',
        role: 'student',
        tenantId: generateTenantId()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123!',
          role: 'student',
          firstName: 'Jane',
          lastName: 'Doe'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'Password123!',
          role: 'student',
          firstName: 'Test',
          lastName: 'User'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword!'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
