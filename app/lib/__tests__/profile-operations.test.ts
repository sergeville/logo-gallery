import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import { getUserProfile, updateUserProfile, updatePassword } from '../profile-operations';
import { registerUser } from '../auth';

let mongoServer: MongoMemoryServer;

describe('[P1] User Profile Management', () => {
  let testUserId: string;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test'
      }
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create a test user
    const user = await registerUser({
      email: 'test@example.com',
      password: testPassword,
      username: 'testuser'
    });
    testUserId = user.user!._id;
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const { db } = await connectToDatabase();
    // Reset user profile to default state
    await db.collection('users').updateOne(
      { _id: testUserId },
      {
        $unset: {
          displayName: '',
          bio: '',
          avatarUrl: '',
          socialLinks: '',
          preferences: ''
        }
      }
    );
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Profile Retrieval', () => {
    it('should get user profile successfully', async () => {
      const result = await getUserProfile(testUserId);

      expect(result.status).toBe(200);
      expect(result.profile).toBeDefined();
      expect(result.profile!.email).toBe('test@example.com');
      expect(result.profile!.username).toBe('testuser');
    });

    it('should handle non-existent user', async () => {
      const result = await getUserProfile('nonexistentid123');

      expect(result.status).toBe(404);
      expect(result.error).toBe('User not found');
    });
  });

  describe('Profile Updates', () => {
    it('should update basic profile information', async () => {
      const updates = {
        displayName: 'Test User',
        bio: 'A test user bio',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const result = await updateUserProfile(testUserId, updates);

      expect(result.status).toBe(200);
      expect(result.profile).toBeDefined();
      expect(result.profile!.displayName).toBe(updates.displayName);
      expect(result.profile!.bio).toBe(updates.bio);
      expect(result.profile!.avatarUrl).toBe(updates.avatarUrl);
    });

    it('should update social links', async () => {
      const updates = {
        socialLinks: {
          website: 'https://example.com',
          twitter: '@testuser',
          github: 'testuser'
        }
      };

      const result = await updateUserProfile(testUserId, updates);

      expect(result.status).toBe(200);
      expect(result.profile!.socialLinks).toEqual(updates.socialLinks);
    });

    it('should update user preferences', async () => {
      const updates = {
        preferences: {
          emailNotifications: true,
          theme: 'dark' as const
        }
      };

      const result = await updateUserProfile(testUserId, updates);

      expect(result.status).toBe(200);
      expect(result.profile!.preferences).toEqual(updates.preferences);
    });

    it('should handle partial updates', async () => {
      // First update
      await updateUserProfile(testUserId, {
        displayName: 'Test User',
        bio: 'Initial bio'
      });

      // Partial update
      const result = await updateUserProfile(testUserId, {
        bio: 'Updated bio'
      });

      expect(result.status).toBe(200);
      expect(result.profile!.displayName).toBe('Test User');
      expect(result.profile!.bio).toBe('Updated bio');
    });
  });

  describe('Password Management', () => {
    it('should update password with valid credentials', async () => {
      const result = await updatePassword(testUserId, {
        currentPassword: testPassword,
        newPassword: 'NewPassword123!'
      });

      expect(result.status).toBe(200);
    });

    it('should reject incorrect current password', async () => {
      const result = await updatePassword(testUserId, {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!'
      });

      expect(result.status).toBe(401);
      expect(result.error).toBe('Current password is incorrect');
    });

    it('should handle non-existent user', async () => {
      const result = await updatePassword('nonexistentid123', {
        currentPassword: testPassword,
        newPassword: 'NewPassword123!'
      });

      expect(result.status).toBe(404);
      expect(result.error).toBe('User not found');
    });
  });
}); 