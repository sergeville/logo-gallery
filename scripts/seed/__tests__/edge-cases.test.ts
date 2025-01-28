import { validateUser, validateLogo } from '../../test-data/utils/model-validators';
import { ObjectId } from 'mongodb';

describe('Edge Cases', () => {
  describe('User Validation', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date()
    };

    it('rejects user with invalid email', () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      expect(() => validateUser(invalidUser)).toThrow('Invalid email format');
    });

    it('rejects user with missing name', () => {
      const invalidUser = { ...validUser, name: '' };
      expect(() => validateUser(invalidUser)).toThrow('name is required');
    });

    it('accepts valid user', () => {
      expect(() => validateUser(validUser)).not.toThrow();
    });
  });

  describe('Logo Validation', () => {
    const validLogo = {
      name: 'Test Logo',
      url: 'https://example.com/logo.png',
      description: 'A test logo',
      userId: new ObjectId(),
      createdAt: new Date()
    };

    it('rejects logo with invalid URL', () => {
      const invalidLogo = { ...validLogo, url: 'invalid-url' };
      expect(() => validateLogo(invalidLogo)).toThrow('Invalid URL format');
    });

    it('rejects logo with empty description', () => {
      const invalidLogo = { ...validLogo, description: '' };
      expect(() => validateLogo(invalidLogo)).toThrow('description is required');
    });

    it('accepts valid logo', () => {
      expect(() => validateLogo(validLogo)).not.toThrow();
    });
  });
}); 