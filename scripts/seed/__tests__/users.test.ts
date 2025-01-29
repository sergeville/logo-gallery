import { ObjectId } from 'mongodb';
import { seedUsers, createTestUser } from '@/scripts/seed/users';
import { User } from '@/app/types';

describe('User Seeding', () => {
  describe('seedUsers', () => {
    it('should generate the specified number of users', async () => {
      const users = await seedUsers({ count: 3 });
      expect(users).toHaveLength(3);
      users.forEach(user => {
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user.role).toMatch(/^(user|admin)$/);
      });
    });

    it('should generate users with optional fields when specified', async () => {
      const users = await seedUsers({ count: 2, withProfiles: true });
      expect(users).toHaveLength(2);
      users.forEach(user => {
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('image');
      });
    });

    it('should assign admin role correctly', async () => {
      const users = await seedUsers({ count: 2, roles: ['admin'] });
      expect(users).toHaveLength(2);
      users.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });
  });

  describe('createTestUser', () => {
    it('should create a user with default values', async () => {
      const user = await createTestUser();
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user.role).toBe('user');
    });

    it('should override default values with provided ones', async () => {
      const customData = {
        email: 'custom@test.com',
        name: 'Custom User',
        role: 'admin' as const
      };
      const user = await createTestUser(customData);
      expect(user.email).toBe(customData.email);
      expect(user.name).toBe(customData.name);
      expect(user.role).toBe(customData.role);
    });
  });
}); 