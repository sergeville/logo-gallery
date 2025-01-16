import { ObjectId } from 'mongodb';
import { ValidationResult, ValidationRule, createValidationResult, validateField } from '@/app/lib/validation';

// User validation rules
const userValidationRules: Record<string, ValidationRule[]> = {
  email: [{
    field: 'email',
    message: 'Invalid email format',
    code: 'INVALID_EMAIL',
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }],
  name: [{
    field: 'name',
    message: 'Name must be at least 2 characters long',
    code: 'INVALID_NAME_LENGTH',
    validate: (value: string) => value.length >= 2
  }],
  password: [{
    field: 'password',
    message: 'Password must be at least 8 characters long',
    code: 'INVALID_PASSWORD_LENGTH',
    validate: (value: string) => value.length >= 8
  }],
  createdAt: [{
    field: 'createdAt',
    message: 'Invalid creation date',
    code: 'INVALID_CREATED_DATE',
    validate: (value: Date) => value instanceof Date && !isNaN(value.getTime())
  }],
  updatedAt: [{
    field: 'updatedAt',
    message: 'Invalid update date',
    code: 'INVALID_UPDATED_DATE',
    validate: (value: Date) => value instanceof Date && !isNaN(value.getTime())
  }]
};

// Logo validation rules
const logoValidationRules: Record<string, ValidationRule[]> = {
  name: [{
    field: 'name',
    message: 'Name must be at least 3 characters long',
    code: 'INVALID_NAME_LENGTH',
    validate: (value: string) => value.length >= 3
  }],
  description: [{
    field: 'description',
    message: 'Description must be at least 10 characters long',
    code: 'INVALID_DESCRIPTION_LENGTH',
    validate: (value: string) => value.length >= 10
  }],
  url: [{
    field: 'url',
    message: 'Invalid URL format',
    code: 'INVALID_URL',
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }],
  thumbnailUrl: [{
    field: 'thumbnailUrl',
    message: 'Invalid thumbnail URL format',
    code: 'INVALID_THUMBNAIL_URL',
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }],
  previewUrl: [{
    field: 'previewUrl',
    message: 'Invalid preview URL format',
    code: 'INVALID_PREVIEW_URL',
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }],
  userId: [{
    field: 'userId',
    message: 'Invalid user ID',
    code: 'INVALID_USER_ID',
    validate: (value: string) => ObjectId.isValid(value)
  }],
  tags: [{
    field: 'tags',
    message: 'Tags must be an array',
    code: 'INVALID_TAGS',
    validate: (value: any) => Array.isArray(value)
  }],
  createdAt: [{
    field: 'createdAt',
    message: 'Invalid creation date',
    code: 'INVALID_CREATED_DATE',
    validate: (value: Date) => value instanceof Date && !isNaN(value.getTime())
  }],
  updatedAt: [{
    field: 'updatedAt',
    message: 'Invalid update date',
    code: 'INVALID_UPDATED_DATE',
    validate: (value: Date) => value instanceof Date && !isNaN(value.getTime())
  }]
};

export function validateUser(user: any): ValidationResult {
  const result = createValidationResult();

  // Required fields
  const requiredFields = ['email', 'name', 'password', 'createdAt'];
  for (const field of requiredFields) {
    if (!user[field]) {
      result.errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      });
      continue;
    }

    // Apply validation rules
    if (userValidationRules[field]) {
      for (const rule of userValidationRules[field]) {
        const error = validateField(user[field], rule);
        if (error) {
          result.errors.push(error);
        }
      }
    }
  }

  return result;
}

export function validateLogo(logo: any): ValidationResult {
  const result = createValidationResult();

  // Required fields
  const requiredFields = ['name', 'url', 'userId', 'createdAt'];
  for (const field of requiredFields) {
    if (!logo[field]) {
      result.errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      });
      continue;
    }

    // Apply validation rules
    if (logoValidationRules[field]) {
      for (const rule of logoValidationRules[field]) {
        const error = validateField(logo[field], rule);
        if (error) {
          result.errors.push(error);
        }
      }
    }
  }

  return result;
} 