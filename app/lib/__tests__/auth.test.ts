import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { loginUser, registerUser, validateSession } from '../auth';
import { connectToDatabase, closeDatabase } from '../db-config';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('[P0] Authentication Flow', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test',
      },
    });
    process.env.MONGODB_URI = mongoServer.getUri();
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection('users').deleteMany({});
    await db.collection('sessions').deleteMany({});
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
      };

      const result = await registerUser(input);

      expect(result.status).toBe(201);
      expect(result.token).toBeDefined();
      expect(result.user).toMatchObject({
        email: input.email,
        username: input.username,
      });
      expect(result.user!.password).toBeUndefined();
    });

    it('should prevent registration with existing email', async () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
      };

      // Register first user
      await registerUser(input);

      // Try to register second user with same email
      const result = await registerUser({
        ...input,
        username: 'testuser2',
      });

      expect(result.status).toBe(400);
      expect(result.error).toBe('Email already registered');
      expect(result.token).toBeUndefined();
    });
  });

  describe('User Login', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
    };

    beforeEach(async () => {
      // Create test user before each login test
      await registerUser(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const result = await loginUser({
        email: testUser.email,
        password: testUser.password,
      });

      expect(result.status).toBe(200);
      expect(result.token).toBeDefined();
      expect(result.user).toMatchObject({
        email: testUser.email,
        username: testUser.username,
      });
      expect(result.user!.password).toBeUndefined();
    });

    it('should reject login with invalid password', async () => {
      const result = await loginUser({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(result.status).toBe(401);
      expect(result.error).toBe('Invalid credentials');
      expect(result.token).toBeUndefined();
    });

    it('should reject login with non-existent email', async () => {
      const result = await loginUser({
        email: 'nonexistent@example.com',
        password: testUser.password,
      });

      expect(result.status).toBe(401);
      expect(result.error).toBe('Invalid credentials');
      expect(result.token).toBeUndefined();
    });
  });

  describe('Session Validation', () => {
    it('should validate a valid session token', async () => {
      // Register and login to get a token
      const user = await registerUser({
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
      });

      const isValid = await validateSession(user.token!);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid session token', async () => {
      const isValid = await validateSession('invalid-token');
      expect(isValid).toBe(false);
    });
  });
});
