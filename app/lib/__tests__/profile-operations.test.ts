import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase, DB_NAMES } from '../db-config';
import { getUserProfile, updateUserProfile, updatePassword } from '../profile-operations';
import { registerUser } from '../auth';
import { ObjectId } from 'mongodb';
import { TestHelper } from './test-helper';
import type { UserProfile } from '../types';

let mongoServer: MongoMemoryServer;
let testDb: any;

interface TestUser {
  _id: string;
  email: string;
  username: string;
  password: string;
}

describe('[P1] User Profile Management', () => {
  let testUser: TestUser;
  const testPassword = 'Password123!';
  let testHelper: TestHelper;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();

    // Set up MongoDB URI and ensure cached connection is cleared
    await closeDatabase();
    process.env.MONGODB_URI = mongoServer.getUri();

    // Establish database connection
    const { db } = await connectToDatabase();
    testDb = db;

    // Verify connection
    await testDb.admin().ping();
  });

  beforeEach(async () => {
    try {
      // Always get a fresh connection for each test
      const { db } = await connectToDatabase();
      testDb = db;

      // Clean up database collections
      await testDb.collection('users').deleteMany({});
      
      // Create a fresh test user with validation
      const result = await registerUser({
        email: 'test@example.com',
        password: testPassword,
        username: 'testuser'
      });

      if (!result.user || !result.user._id) {
        throw new Error('Failed to create test user');
      }

      // Verify user was created
      const createdUser = await testDb.collection('users').findOne({ _id: new ObjectId(result.user._id) });
      if (!createdUser) {
        throw new Error('Test user not found after creation');
      }

      testUser = {
        _id: result.user._id.toString(),
        email: 'test@example.com',
        username: 'testuser',
        password: testPassword
      };

      testHelper = TestHelper.getInstance();
      await testHelper.connect();
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterEach(async () => {
    await testHelper.clearCollections();
  });

  afterAll(async () => {
    try {
      await closeDatabase();
      await mongoServer.stop();
      process.env.MONGODB_URI = ''; // Clear the URI
    } catch (error) {
      console.error('Failed to cleanup test environment:', error);
      throw error;
    }
  });

  describe('Profile Retrieval', () => {
    describe('Success Cases', () => {
      it('should get user profile successfully', async () => {
        const result = await getUserProfile(testUser._id);

        expect(result.status).toBe(200);
        expect(result.profile).toBeDefined();
        expect(result.profile!.email).toBe(testUser.email);
        expect(result.profile!.username).toBe(testUser.username);
      });
    });

    describe('Error Cases', () => {
      it('should handle non-existent user', async () => {
        const result = await getUserProfile('nonexistentid123');

        expect(result.status).toBe(404);
        expect(result.error).toBe('User not found');
      });

      it('should handle invalid ObjectId format', async () => {
        const result = await getUserProfile('invalid-id');

        expect(result.status).toBe(404);
        expect(result.error).toBe('User not found');
      });
    });
  });

  describe('Profile Updates', () => {
    describe('Success Cases', () => {
      it('should update basic profile information', async () => {
        const updates = {
          displayName: 'test-user',
          bio: 'Test bio'
        };

        const result = await updateUserProfile(testUser._id, updates);

        expect(result.status).toBe(200);
        expect(result.profile).toBeDefined();
        expect(result.profile!.displayName).toBe(updates.displayName);
        expect(result.profile!.bio).toBe(updates.bio);
      });

      it('should update social links', async () => {
        const updates = {
          socialLinks: {
            website: 'https://example.com',
            twitter: 'testuser',
            github: 'testuser'
          }
        };

        const result = await updateUserProfile(testUser._id, updates);

        expect(result.status).toBe(200);
        expect(result.profile!.socialLinks).toEqual(updates.socialLinks);
      });

      it('should update user preferences', async () => {
        const updates = {
          preferences: {
            emailNotifications: true,
            theme: 'dark'
          }
        };

        const result = await updateUserProfile(testUser._id, updates);

        expect(result.status).toBe(200);
        expect(result.profile!.preferences).toEqual(updates.preferences);
      });

      it('should handle partial updates', async () => {
        const result = await updateUserProfile(testUser._id, {
          displayName: 'test-user',
          bio: 'Updated bio'
        });

        expect(result.status).toBe(200);
        expect(result.profile!.displayName).toBe('test-user');
        expect(result.profile!.bio).toBe('Updated bio');
      });
    });

    describe('Error Cases', () => {
      it('should handle database connection failure', async () => {
        // Save original URI and close connection
        const originalUri = process.env.MONGODB_URI;
        await closeDatabase();

        // Set invalid URI and attempt update
        process.env.MONGODB_URI = 'mongodb://invalid:27017';
        const result = await updateUserProfile(testUser._id, {
          displayName: 'test-user'
        });

        // Verify error response
        expect(result.status).toBe(500);
        expect(result.error).toBe('Database connection failed');

        // Restore original connection
        process.env.MONGODB_URI = originalUri;
        const { db } = await connectToDatabase();
        testDb = db;
      }, { timeout: 15000 }); // Increase test timeout
    });
  });

  describe('Password Management', () => {
    describe('Success Cases', () => {
      it('should update password with valid credentials', async () => {
        const result = await updatePassword(testUser._id, {
          currentPassword: testPassword,
          newPassword: 'NewPassword123!'
        });

        expect(result.status).toBe(200);
      }, { timeout: 15000 }); // Increase test timeout
    });

    describe('Error Cases', () => {
      it('should reject incorrect current password', async () => {
        const result = await updatePassword(testUser._id, {
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        });

        expect(result.status).toBe(401);
        expect(result.error).toBe('Current password is incorrect');
      }, { timeout: 15000 }); // Increase test timeout

      it('should handle non-existent user', async () => {
        const result = await updatePassword('nonexistentid123', {
          currentPassword: testPassword,
          newPassword: 'NewPassword123!'
        });

        expect(result.status).toBe(404);
        expect(result.error).toBe('User not found');
      }, { timeout: 15000 }); // Increase test timeout

      it('should handle invalid ObjectId format', async () => {
        const result = await updatePassword('invalid-id', {
          currentPassword: testPassword,
          newPassword: 'NewPassword123!'
        });

        expect(result.status).toBe(404);
        expect(result.error).toBe('User not found');
      });
    });
  });

  it('should update user profile', async () => {
    const user = await testHelper.createTestUser();
    const profileUpdate: UserProfile = {
      displayName: 'Test User',
      bio: 'Test bio',
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    const result = await updateUserProfile(user._id.toString(), profileUpdate);
    expect(result.success).toBe(true);
  });
}); 