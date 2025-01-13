import { ObjectId } from 'mongodb';
import { validateUser, validateLogo, validateUserBatch, validateLogoBatch } from '../validation-utils';
import { generateTestUser, generateTestLogo } from '../test-data-generator';

describe('Validation Utilities', () => {
  describe('User Validation', () => {
    it('should validate a valid user', () => {
      const user = generateTestUser();
      const errors = validateUser(user);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid email format', () => {
      const user = generateTestUser({ email: 'invalid-email' });
      const errors = validateUser(user);
      expect(errors).toContainEqual({
        field: 'email',
        message: 'Invalid email format'
      });
    });

    it('should detect missing required fields', () => {
      const user = generateTestUser();
      delete (user as any).username;
      delete (user as any).email;

      const errors = validateUser(user);
      expect(errors).toContainEqual({
        field: 'username',
        message: 'Username is required'
      });
      expect(errors).toContainEqual({
        field: 'email',
        message: 'Email is required'
      });
    });

    it('should validate username length', () => {
      const shortUser = generateTestUser({ username: 'ab' });
      const longUser = generateTestUser({ username: 'a'.repeat(31) });

      const shortErrors = validateUser(shortUser);
      const longErrors = validateUser(longUser);

      expect(shortErrors).toContainEqual({
        field: 'username',
        message: 'Username must be between 3 and 30 characters'
      });
      expect(longErrors).toContainEqual({
        field: 'username',
        message: 'Username must be between 3 and 30 characters'
      });
    });

    it('should validate password requirements', () => {
      const user = generateTestUser({ password: 'short' });
      const errors = validateUser(user);
      expect(errors).toContainEqual({
        field: 'password',
        message: 'Password must be at least 8 characters'
      });
    });

    it('should validate profile fields', () => {
      const user = generateTestUser({
        profile: {
          website: 'invalid-url',
          bio: 'A'.repeat(501),
          avatarUrl: 'invalid-url'
        }
      });

      const errors = validateUser(user);
      expect(errors).toContainEqual({
        field: 'profile.website',
        message: 'Website must be a valid URL'
      });
      expect(errors).toContainEqual({
        field: 'profile.avatarUrl',
        message: 'Avatar URL must be a valid URL'
      });
      expect(errors).toContainEqual({
        field: 'profile.bio',
        message: 'Bio must not exceed 500 characters'
      });
    });
  });

  describe('Logo Validation', () => {
    const ownerId = new ObjectId();

    it('should validate a valid logo', () => {
      const logo = generateTestLogo(ownerId);
      const errors = validateLogo(logo);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const logo = generateTestLogo(ownerId);
      delete (logo as any).name;
      delete (logo as any).imageUrl;

      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'name',
        message: 'Name is required'
      });
      expect(errors).toContainEqual({
        field: 'imageUrl',
        message: 'Image URL is required'
      });
    });

    it('should validate name length', () => {
      const shortName = generateTestLogo(ownerId, { name: 'ab' });
      const longName = generateTestLogo(ownerId, { name: 'a'.repeat(101) });

      const shortErrors = validateLogo(shortName);
      const longErrors = validateLogo(longName);

      expect(shortErrors).toContainEqual({
        field: 'name',
        message: 'Name must be between 3 and 100 characters'
      });
      expect(longErrors).toContainEqual({
        field: 'name',
        message: 'Name must be between 3 and 100 characters'
      });
    });

    it('should validate URL formats', () => {
      const logo = generateTestLogo(ownerId, {
        imageUrl: 'invalid-url',
        thumbnailUrl: 'also-invalid'
      });

      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'imageUrl',
        message: 'Image URL must be a valid URL'
      });
      expect(errors).toContainEqual({
        field: 'thumbnailUrl',
        message: 'Thumbnail URL must be a valid URL'
      });
    });

    it('should validate dimensions', () => {
      const logo = generateTestLogo(ownerId, {
        dimensions: {
          width: -1,
          height: 0
        }
      });

      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'dimensions.width',
        message: 'Width must be a positive number'
      });
      expect(errors).toContainEqual({
        field: 'dimensions.height',
        message: 'Height must be a positive number'
      });
    });

    it('should validate file type', () => {
      const logo = generateTestLogo(ownerId, { fileType: 'invalid' });
      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'fileType',
        message: 'Invalid file type'
      });
    });

    it('should validate metadata', () => {
      const logo = generateTestLogo(ownerId);
      delete (logo as any).metadata.version;
      delete (logo as any).metadata.status;

      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'metadata.version',
        message: 'Version is required'
      });
      expect(errors).toContainEqual({
        field: 'metadata.status',
        message: 'Status is required'
      });
    });

    it('should validate colors format', () => {
      const logo = generateTestLogo(ownerId, {
        colors: ['invalid', '#12345G']
      });

      const errors = validateLogo(logo);
      expect(errors).toContainEqual({
        field: 'colors',
        message: 'Colors must be valid hex color codes'
      });
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple users', () => {
      const users = [
        generateTestUser(), // Valid
        generateTestUser({ email: 'invalid-email' }), // Invalid email
        generateTestUser({ username: 'a' }) // Invalid username
      ];

      const results = validateUserBatch(users);
      expect(results).toHaveLength(2); // Two invalid users
      expect(results[0].index).toBe(1); // Second user
      expect(results[1].index).toBe(2); // Third user
    });

    it('should validate multiple logos', () => {
      const ownerId = new ObjectId();
      const logos = [
        generateTestLogo(ownerId), // Valid
        generateTestLogo(ownerId, { imageUrl: 'invalid' }), // Invalid URL
        generateTestLogo(ownerId, { fileType: 'invalid' }) // Invalid file type
      ];

      const results = validateLogoBatch(logos);
      expect(results).toHaveLength(2); // Two invalid logos
      expect(results[0].index).toBe(1); // Second logo
      expect(results[1].index).toBe(2); // Third logo
    });
  });
}); 