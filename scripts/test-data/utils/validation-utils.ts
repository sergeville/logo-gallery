import { TestUser, TestLogo } from './test-data-generator';
import { ObjectId } from 'mongodb';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
  details?: Record<string, any>;
  fixes?: Array<FixSuggestion>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FixSuggestion {
  description: string;
  action: string;
  example?: string;
  autoFixable: boolean;
}

export function createValidationResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: []
  };
}

export function addError(result: ValidationResult, message: string, details?: Record<string, any>, fixes?: FixSuggestion[]): void {
  result.isValid = false;
  result.errors.push({ field: '', message, type: 'error', details, fixes });
}

export function addWarning(result: ValidationResult, message: string, details?: Record<string, any>, fixes?: FixSuggestion[]): void {
  result.warnings.push({ field: '', message, type: 'warning', details, fixes });
}

export function generateFixSuggestions(field: string, value: any, expectedFormat: string): FixSuggestion[] {
  return [{
    description: `Invalid ${field} format`,
    action: `Update ${field} to match expected format`,
    example: expectedFormat,
    autoFixable: false
  }];
}

export function validateObjectId(id: any): boolean {
  return ObjectId.isValid(id);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateDateRange(date: Date): boolean {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const dateToCheck = new Date(date);
  return dateToCheck >= oneYearAgo && dateToCheck <= now;
}

export function validateRequiredFields(obj: any, fields: string[]): string[] {
  return fields.filter(field => !obj[field]);
}

export function validateArrayMinLength(arr: any[] | undefined, minLength: number): boolean {
  return Array.isArray(arr) && arr.length >= minLength;
}

export function validateUser(user: TestUser): ValidationResult {
  const result = createValidationResult();

  // Required fields
  if (!user.email) {
    addError(result, 'Email is required', { field: 'email' });
  } else if (!validateEmail(user.email)) {
    addError(result, 'Invalid email format', { email: user.email }, [{
      description: 'Invalid email format',
      action: 'Update email to match expected format',
      example: 'user@example.com',
      autoFixable: false
    }]);
  }

  if (!user.username) {
    addError(result, 'Username is required', { field: 'username' });
  } else if (user.username.length < 3 || user.username.length > 30) {
    addError(result, 'Invalid username length', { username: user.username }, [{
      description: 'Invalid username length',
      action: 'Update username to be between 3-30 characters',
      example: 'username (3-30 characters)',
      autoFixable: false
    }]);
  }

  if (!user.name) {
    addError(result, 'Name is required', { field: 'name' });
  }

  if (!user.password) {
    addError(result, 'Password is required', { field: 'password' });
  } else if (user.password.length < 8) {
    addError(result, 'Password must be at least 8 characters', { password: user.password }, [{
      description: 'Password too short',
      action: 'Update password to be at least 8 characters',
      example: 'password (8 characters)',
      autoFixable: false
    }]);
  }

  // Optional fields validation
  if (user.profile) {
    if (user.profile.website && !/^https?:\/\//.test(user.profile.website)) {
      addError(result, 'Invalid website format', { field: 'profile.website' }, [{
        description: 'Invalid website URL format',
        action: 'Add https:// prefix to website URL',
        example: 'https://example.com',
        autoFixable: true
      }]);
    }
    if (user.profile.avatarUrl && !/^https?:\/\//.test(user.profile.avatarUrl)) {
      addError(result, 'Invalid avatar URL format', { field: 'profile.avatarUrl' }, [{
        description: 'Invalid avatar URL format',
        action: 'Add https:// prefix to avatar URL',
        example: 'https://example.com/avatar.jpg',
        autoFixable: true
      }]);
    }
    if (user.profile.bio && user.profile.bio.length > 500) {
      addError(result, 'Bio must not exceed 500 characters', { field: 'profile.bio' }, [{
        description: 'Bio too long',
        action: 'Truncate bio to 500 characters',
        example: 'profile.bio (500 characters)',
        autoFixable: true
      }]);
    }
  }

  return result;
}

export function validateLogo(logo: TestLogo): ValidationResult {
  const result = createValidationResult();

  if (!logo) {
    addError(result, 'Logo object is required', { field: 'logo' }, [{
      description: 'Logo object is missing',
      action: 'Provide a valid logo object',
      example: '{ name: "logo", imageUrl: "..." }',
      autoFixable: false
    }]);
    return result;
  }

  if (!logo.name) {
    addError(result, 'Name is required', { field: 'name' });
  } else if (logo.name.length < 3 || logo.name.length > 100) {
    addError(result, 'Invalid name length', { name: logo.name }, [{
      description: 'Invalid name length',
      action: 'Update name to be between 3-100 characters',
      example: 'name (3-100 characters)',
      autoFixable: false
    }]);
  }

  if (!logo.imageUrl) {
    addError(result, 'Image URL is required', { field: 'imageUrl' });
  } else if (!/^https?:\/\//.test(logo.imageUrl)) {
    addError(result, 'Invalid image URL format', { field: 'imageUrl' }, [{
      description: 'Invalid image URL format',
      action: 'Add https:// prefix to image URL',
      example: 'https://example.com/logo.png',
      autoFixable: true
    }]);
  }

  if (!logo.thumbnailUrl) {
    addError(result, 'Thumbnail URL is required', { field: 'thumbnailUrl' });
  } else if (!/^https?:\/\//.test(logo.thumbnailUrl)) {
    addError(result, 'Invalid thumbnail URL format', { field: 'thumbnailUrl' }, [{
      description: 'Invalid thumbnail URL format',
      action: 'Add https:// prefix to thumbnail URL',
      example: 'https://example.com/thumbnail.jpg',
      autoFixable: true
    }]);
  }

  // Dimensions validation
  if (!logo.dimensions) {
    addError(result, 'Dimensions are required', { field: 'dimensions' });
  } else {
    if (!logo.dimensions.width || logo.dimensions.width <= 0) {
      addError(result, 'Invalid width', { field: 'dimensions.width' }, [{
        description: 'Invalid width value',
        action: 'Set width to a positive number',
        example: 'width > 0',
        autoFixable: true
      }]);
    }
    if (!logo.dimensions.height || logo.dimensions.height <= 0) {
      addError(result, 'Invalid height', { field: 'dimensions.height' }, [{
        description: 'Invalid height value',
        action: 'Set height to a positive number',
        example: 'height > 0',
        autoFixable: true
      }]);
    }
  }

  if (!logo.fileSize || logo.fileSize <= 0) {
    addError(result, 'File size must be a positive number', { field: 'fileSize' }, [{
      description: 'Invalid file size',
      action: 'Set file size to a positive number',
      example: 'fileSize > 0',
      autoFixable: true
    }]);
  }

  if (!logo.fileType) {
    addError(result, 'File type is required', { field: 'fileType' });
  } else if (!['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(logo.fileType.toLowerCase())) {
    addError(result, 'Invalid file type', { field: 'fileType' }, [{
      description: 'Invalid file type',
      action: 'Set file type to a supported format',
      example: 'png, jpg, jpeg, gif, svg',
      autoFixable: true
    }]);
  }

  // Metadata validation
  if (!logo.metadata) {
    addError(result, 'Metadata is required', { field: 'metadata' }, [{
      description: 'Missing metadata',
      action: 'Add required metadata object',
      example: '{ version: "1.0", status: "active" }',
      autoFixable: true
    }]);
  } else {
    if (!logo.metadata.version) {
      addError(result, 'Version is required', { field: 'metadata.version' }, [{
        description: 'Missing version',
        action: 'Set version number',
        example: '1.0',
        autoFixable: true
      }]);
    }
    if (!logo.metadata.status) {
      addError(result, 'Status is required', { field: 'metadata.status' }, [{
        description: 'Missing status',
        action: 'Set status value',
        example: 'active',
        autoFixable: true
      }]);
    }
  }

  // Optional fields validation
  if (logo.colors && (!Array.isArray(logo.colors) || logo.colors.some(color => !/^#[0-9A-F]{6}$/i.test(color)))) {
    addError(result, 'Colors must be valid hex color codes', { field: 'colors' }, [{
      description: 'Invalid color format',
      action: 'Convert colors to 6-digit hex format',
      example: '#RRGGBB',
      autoFixable: true
    }]);
  }

  return result;
}

export function validateUserBatch(users: TestUser[]): { index: number; errors: ValidationError[] }[] {
  return users.map((user, index) => ({
    index,
    errors: validateUser(user).errors
  })).filter(result => result.errors.length > 0);
}

export function validateLogoBatch(logos: TestLogo[]): { index: number; errors: ValidationError[] }[] {
  return logos.map((logo, index) => ({
    index,
    errors: validateLogo(logo).errors
  })).filter(result => result.errors.length > 0);
}

export function formatValidationResults(result: ValidationResult): string {
  let output = '';
  
  if (result.errors.length > 0) {
    output += '\nErrors:\n';
    result.errors.forEach(error => {
      output += `  • ${error.message}\n`;
    });
  }
  
  if (result.warnings.length > 0) {
    output += '\nWarnings:\n';
    result.warnings.forEach(warning => {
      output += `  • ${warning.message}\n`;
    });
  }
  
  return output;
} 