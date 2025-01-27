import { ObjectId } from 'mongodb';
import type { ClientUser, ClientLogo } from '@/scripts/seed/validation'
import type { ValidationResult, ValidationError, ValidationWarning, ValidationFix } from '@/app/lib/validation/validation-utils'

interface ValidationRule {
  field: string;
  message: string;
  code: string;
  validate: (value: any) => boolean;
}

const isValidDate = (value: any): boolean => {
  if (!(value instanceof Date)) {
    try {
      value = new Date(value);
    } catch {
      return false;
    }
  }
  return !isNaN(value.getTime());
};

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// User validation rules
export const userRules: ValidationRule[] = [
  {
    field: 'email',
    message: 'Invalid email format',
    code: 'INVALID_EMAIL',
    validate: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  {
    field: 'name',
    message: 'Name is required',
    code: 'INVALID_NAME',
    validate: (value: any) => typeof value === 'string' && value.length > 0
  },
  {
    field: 'password',
    message: 'Password must be at least 8 characters',
    code: 'INVALID_PASSWORD',
    validate: (value: any) => typeof value === 'string' && value.length >= 8
  },
  {
    field: 'createdAt',
    message: 'Invalid creation date',
    code: 'INVALID_DATE',
    validate: isValidDate
  },
  {
    field: 'updatedAt',
    message: 'Invalid update date',
    code: 'INVALID_DATE',
    validate: isValidDate
  }
];

// Logo validation rules
export const logoRules: ValidationRule[] = [
  {
    field: 'name',
    message: 'Name is required',
    code: 'INVALID_NAME',
    validate: (value: any) => typeof value === 'string' && value.length > 0
  },
  {
    field: 'description',
    message: 'Description is required',
    code: 'INVALID_DESCRIPTION',
    validate: (value: any) => typeof value === 'string' && value.length > 0
  },
  {
    field: 'url',
    message: 'Invalid URL format',
    code: 'INVALID_URL',
    validate: (value: any) => typeof value === 'string' && isValidUrl(value)
  },
  {
    field: 'imageUrl',
    message: 'Invalid image URL format',
    code: 'INVALID_IMAGE_URL',
    validate: (value: any) => typeof value === 'string' && isValidUrl(value)
  },
  {
    field: 'userId',
    message: 'User ID is required',
    code: 'INVALID_USER_ID',
    validate: (value: any) => typeof value === 'string' && value.length > 0
  },
  {
    field: 'createdAt',
    message: 'Invalid creation date',
    code: 'INVALID_DATE',
    validate: isValidDate
  },
  {
    field: 'updatedAt',
    message: 'Invalid update date',
    code: 'INVALID_DATE',
    validate: isValidDate
  }
];

export function validateUser(user: Partial<ClientUser>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const fixes: ValidationFix[] = []

  if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format'
    })
  }

  if (!user.name || user.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes
  }
}

export function validateLogo(logo: Partial<ClientLogo>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const fixes: ValidationFix[] = []

  if (!logo.imageUrl || !/^https?:\/\/.+/.test(logo.imageUrl)) {
    errors.push({
      field: 'imageUrl',
      message: 'Invalid URL format'
    })
  }

  if (!logo.description || logo.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description is required'
    })
  }

  if (!logo.name || logo.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes
  }
} 