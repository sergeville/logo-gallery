import { userValidationRules, logoValidationRules } from '@/scripts/test-data/utils/validation-rules';
import { ObjectId } from 'mongodb';

describe('Validation Rules', () => {
  describe('userValidationRules', () => {
    it('has required rules for _id', () => {
      expect(userValidationRules._id).toBeDefined();
      expect(userValidationRules._id[0]).toEqual({
        field: '_id',
        type: 'objectId',
        message: 'Invalid user ID'
      });
    });

    it('has required rules for email', () => {
      expect(userValidationRules.email).toBeDefined();
      expect(userValidationRules.email).toHaveLength(2);
      expect(userValidationRules.email[0]).toEqual({
        field: 'email',
        type: 'required',
        message: 'Email is required'
      });
      expect(userValidationRules.email[1]).toEqual({
        field: 'email',
        type: 'email',
        message: 'Invalid email format'
      });
    });

    it('has required rules for name', () => {
      expect(userValidationRules.name).toBeDefined();
      expect(userValidationRules.name[0]).toEqual({
        field: 'name',
        type: 'required',
        message: 'Name is required'
      });
    });

    it('has required rules for password', () => {
      expect(userValidationRules.password).toBeDefined();
      expect(userValidationRules.password[0]).toEqual({
        field: 'password',
        type: 'required',
        message: 'Password is required'
      });
    });

    it('has required rules for dates', () => {
      expect(userValidationRules.createdAt).toBeDefined();
      expect(userValidationRules.createdAt[0]).toEqual({
        field: 'createdAt',
        type: 'required',
        message: 'Created date is required'
      });

      expect(userValidationRules.updatedAt).toBeDefined();
      expect(userValidationRules.updatedAt[0]).toEqual({
        field: 'updatedAt',
        type: 'required',
        message: 'Updated date is required'
      });
    });
  });

  describe('logoValidationRules', () => {
    it('has required rules for _id', () => {
      expect(logoValidationRules._id).toBeDefined();
      expect(logoValidationRules._id[0]).toEqual({
        field: '_id',
        type: 'objectId',
        message: 'Invalid logo ID'
      });
    });

    it('has required rules for userId', () => {
      expect(logoValidationRules.userId).toBeDefined();
      expect(logoValidationRules.userId[0]).toEqual({
        field: 'userId',
        type: 'objectId',
        message: 'Invalid user ID'
      });
    });

    it('has required rules for name', () => {
      expect(logoValidationRules.name).toBeDefined();
      expect(logoValidationRules.name[0]).toEqual({
        field: 'name',
        type: 'required',
        message: 'Name is required'
      });
    });

    it('has required rules for description', () => {
      expect(logoValidationRules.description).toBeDefined();
      expect(logoValidationRules.description[0]).toEqual({
        field: 'description',
        type: 'required',
        message: 'Description is required'
      });
    });

    it('has required rules for url', () => {
      expect(logoValidationRules.url).toBeDefined();
      expect(logoValidationRules.url).toHaveLength(2);
      expect(logoValidationRules.url[0]).toEqual({
        field: 'url',
        type: 'required',
        message: 'URL is required'
      });
      expect(logoValidationRules.url[1]).toEqual({
        field: 'url',
        type: 'url',
        message: 'Invalid URL format'
      });
    });

    it('has required rules for imageUrl', () => {
      expect(logoValidationRules.imageUrl).toBeDefined();
      expect(logoValidationRules.imageUrl).toHaveLength(2);
      expect(logoValidationRules.imageUrl[0]).toEqual({
        field: 'imageUrl',
        type: 'required',
        message: 'Image URL is required'
      });
      expect(logoValidationRules.imageUrl[1]).toEqual({
        field: 'imageUrl',
        type: 'url',
        message: 'Invalid image URL format'
      });
    });

    it('has required rules for thumbnailUrl', () => {
      expect(logoValidationRules.thumbnailUrl).toBeDefined();
      expect(logoValidationRules.thumbnailUrl).toHaveLength(2);
      expect(logoValidationRules.thumbnailUrl[0]).toEqual({
        field: 'thumbnailUrl',
        type: 'required',
        message: 'Thumbnail URL is required'
      });
      expect(logoValidationRules.thumbnailUrl[1]).toEqual({
        field: 'thumbnailUrl',
        type: 'url',
        message: 'Invalid thumbnail URL format'
      });
    });

    it('has required rules for tags', () => {
      expect(logoValidationRules.tags).toBeDefined();
      expect(logoValidationRules.tags[0]).toEqual({
        field: 'tags',
        type: 'array',
        message: 'Tags must be an array',
        minLength: 1
      });
    });

    it('has required rules for dates', () => {
      expect(logoValidationRules.createdAt).toBeDefined();
      expect(logoValidationRules.createdAt[0]).toEqual({
        field: 'createdAt',
        type: 'required',
        message: 'Created date is required'
      });

      expect(logoValidationRules.updatedAt).toBeDefined();
      expect(logoValidationRules.updatedAt[0]).toEqual({
        field: 'updatedAt',
        type: 'required',
        message: 'Updated date is required'
      });
    });
  });
}); 