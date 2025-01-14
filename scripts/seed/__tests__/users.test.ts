import { seedUsers, seedAdmins, createTestUser } from '../users';

describe('User Seeding', () => {
  describe('seedUsers', () => {
    it('should generate the specified number of users', async () => {
      const users = await seedUsers({ count: 5 });
      expect(users).toHaveLength(5);
    });

    it('should generate users with profiles when specified', async () => {
      const users = await seedUsers({ count: 3, withProfiles: true });
      expect(users[0].profile).toBeDefined();
      expect(users[0].profile.bio).toBeDefined();
      expect(users[0].profile.location).toBeDefined();
    });

    it('should assign specified roles correctly', async () => {
      const users = await seedUsers({ count: 5, roles: ['admin'] });
      expect(users.every(user => user.role === 'admin')).toBe(true);
    });
  });

  describe('seedAdmins', () => {
    it('should generate admin users', async () => {
      const admins = await seedAdmins(3);
      expect(admins).toHaveLength(3);
      expect(admins.every(admin => admin.role === 'admin')).toBe(true);
    });
  });

  describe('createTestUser', () => {
    it('should create a user with default values', async () => {
      const user = await createTestUser();
      expect(user.username).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password).toBeDefined();
    });

    it('should override default values with provided ones', async () => {
      const customEmail = 'custom@test.com';
      const user = await createTestUser({ email: customEmail });
      expect(user.email).toBe(customEmail);
    });
  });
}); 