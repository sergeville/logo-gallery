import { generateTestUser, generateTestLogo } from '@/scripts/test-data/utils/test-data-generator';

describe('Test Data Fixtures', () => {
  describe('User Fixtures', () => {
    it('should generate a test user with required fields', () => {
      const user = generateTestUser();
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
    });
  });

  describe('Logo Fixtures', () => {
    it('should generate a test logo with required fields', () => {
      const logo = generateTestLogo();
      expect(logo).toHaveProperty('name');
      expect(logo).toHaveProperty('url');
      expect(logo).toHaveProperty('description');
    });
  });
}); 