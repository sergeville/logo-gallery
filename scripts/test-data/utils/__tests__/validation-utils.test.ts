import { validateEmail, validateUrl, validateObjectId, validateDateRange, validateField, ValidationRule } from '../validation-utils';
import { ObjectId } from 'mongodb';
import { LOCALHOST_URL } from '@/config/constants';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('invalidates incorrect email formats', () => {
      expect(validateEmail('test')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('validates correct URL formats', () => {
      expect(validateUrl(LOCALHOST_URL)).toBe(true);
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl(LOCALHOST_URL)).toBe(true);
    });

    it('invalidates incorrect URL formats', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('http://')).toBe(false);
    });
  });

  describe('validateObjectId', () => {
    it('validates correct ObjectId formats', () => {
      const validId = new ObjectId();
      expect(validateObjectId(validId)).toBe(true);
      expect(validateObjectId(validId.toString())).toBe(true);
    });

    it('invalidates incorrect ObjectId formats', () => {
      expect(validateObjectId('invalid-id')).toBe(false);
      expect(validateObjectId(123)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('validates dates in correct order', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      expect(validateDateRange(start, end)).toBe(true);
      expect(validateDateRange(start, start)).toBe(true);
    });

    it('invalidates dates in incorrect order', () => {
      const start = new Date('2023-12-31');
      const end = new Date('2023-01-01');
      expect(validateDateRange(start, end)).toBe(false);
    });
  });

  describe('validateField', () => {
    it('validates required fields', () => {
      const rule: ValidationRule = {
        field: 'name',
        type: 'required',
        message: 'Name is required'
      };

      expect(validateField('Test', rule)).toBeNull();
      expect(validateField('', rule)).toEqual({
        field: 'name',
        message: 'Name is required',
        type: 'error'
      });
    });

    it('validates email fields', () => {
      const rule: ValidationRule = {
        field: 'email',
        type: 'email',
        message: 'Invalid email format'
      };

      expect(validateField('test@example.com', rule)).toBeNull();
      expect(validateField('invalid-email', rule)).toEqual({
        field: 'email',
        message: 'Invalid email format',
        type: 'error'
      });
    });

    it('validates URL fields', () => {
      const rule: ValidationRule = {
        field: 'url',
        type: 'url',
        message: 'Invalid URL format'
      };

      expect(validateField('https://example.com', rule)).toBeNull();
      expect(validateField('invalid-url', rule)).toEqual({
        field: 'url',
        message: 'Invalid URL format',
        type: 'error'
      });
    });

    it('validates array fields', () => {
      const rule: ValidationRule = {
        field: 'tags',
        type: 'array',
        message: 'Tags must be an array',
        minLength: 1
      };

      expect(validateField(['tag1', 'tag2'], rule)).toBeNull();
      expect(validateField([], rule)).toEqual({
        field: 'tags',
        message: 'Tags must have at least 1 items',
        type: 'error'
      });
      expect(validateField('not-an-array', rule)).toEqual({
        field: 'tags',
        message: 'Tags must be an array',
        type: 'error'
      });
    });
  });
}); 