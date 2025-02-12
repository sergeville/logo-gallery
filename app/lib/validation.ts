import { config } from './config';

export interface ValidationRule {
  field: string;
  message: string;
  code: string;
  validate: (value: any) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface FixSuggestion {
  field: string;
  action: string;
  value?: any;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  fixes: ValidationError[];
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function createValidationResult(): ValidationResult {
  return {
    errors: [],
    warnings: [],
    fixes: []
  };
}

export function validateField(value: any, rule: ValidationRule): ValidationError | null {
  if (!rule.validate(value)) {
    return {
      field: rule.field,
      message: rule.message,
      code: rule.code
    };
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateObjectId(id: any): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(String(id));
}

export function validateDateRange(start: Date, end: Date): boolean {
  return start <= end;
}

const userProfileValidationRules = {
  name: [{
    field: 'name',
    message: 'Name must be a string',
    code: 'INVALID_NAME_TYPE',
    validate: (value: any) => typeof value === 'string'
  }, {
    field: 'name',
    message: 'Name must be between 2 and 50 characters',
    code: 'INVALID_NAME_LENGTH',
    validate: (value: string) => value.length >= 2 && value.length <= 50
  }],
  email: [{
    field: 'email',
    message: 'Email must be a string',
    code: 'INVALID_EMAIL_TYPE',
    validate: (value: any) => typeof value === 'string'
  }, {
    field: 'email',
    message: 'Invalid email format',
    code: 'INVALID_EMAIL_FORMAT',
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }],
  bio: [{
    field: 'bio',
    message: 'Bio must be a string',
    code: 'INVALID_BIO_TYPE',
    validate: (value: any) => typeof value === 'string' || value === undefined
  }, {
    field: 'bio',
    message: 'Bio must not exceed 500 characters',
    code: 'INVALID_BIO_LENGTH',
    validate: (value: string) => !value || value.length <= 500
  }],
  website: [{
    field: 'website',
    message: 'Website must be a string',
    code: 'INVALID_WEBSITE_TYPE',
    validate: (value: any) => typeof value === 'string' || value === undefined
  }, {
    field: 'website',
    message: 'Invalid website URL',
    code: 'INVALID_WEBSITE_URL',
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }],
  location: [{
    field: 'location',
    message: 'Location must be a string',
    code: 'INVALID_LOCATION_TYPE',
    validate: (value: any) => typeof value === 'string' || value === undefined
  }, {
    field: 'location',
    message: 'Location must not exceed 100 characters',
    code: 'INVALID_LOCATION_LENGTH',
    validate: (value: string) => !value || value.length <= 100
  }]
};

export function validateUserProfile(profile: any): ValidationResult {
  const result = createValidationResult();
  const errors: ValidationError[] = [];

  // Validate each field if present
  Object.entries(userProfileValidationRules).forEach(([field, rules]) => {
    if (field in profile) {
      rules.forEach(rule => {
        if (!rule.validate(profile[field])) {
          errors.push({
            field,
            message: rule.message,
            code: rule.code
          });
        }
      });
    }
  });

  result.errors.push(...errors);
  return result;
}

export function validateEnvironmentVariables(env: Record<string, string | undefined>): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    fixes: []
  };

  // Required environment variables
  const requiredVars = [
    'MONGODB_URI',
    'MONGODB_DB',
    'AUTH_SECRET'
  ];

  for (const varName of requiredVars) {
    if (!env[varName]) {
      result.errors.push({
        code: 'MISSING_ENV_VAR',
        field: varName,
        message: `Missing required environment variable: ${varName}`
      });
    }
  }

  return result;
}

export function validateMongoDBUri(uri: string): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    fixes: []
  };

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    result.errors.push({
      code: 'INVALID_MONGODB_URI',
      field: 'MONGODB_URI',
      message: 'MongoDB URI must start with mongodb:// or mongodb+srv://'
    });
  }

  return result;
}

export function validatePort(port: string | number): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    fixes: []
  };

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    result.errors.push({
      code: 'INVALID_PORT',
      field: 'PORT',
      message: 'Port must be a number between 1 and 65535'
    });
  }

  return result;
}

export function validateApiUrl(url: string): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    fixes: []
  };

  try {
    new URL(url);
  } catch {
    result.errors.push({
      code: 'INVALID_API_URL',
      field: 'API_URL',
      message: 'Invalid API URL format'
    });
  }

  return result;
}

export function validateDatabaseName(name: string): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    fixes: []
  };

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    result.errors.push({
      code: 'INVALID_DB_NAME',
      field: 'MONGODB_DB',
      message: 'Database name can only contain letters, numbers, hyphens, and underscores'
    });
  }

  return result;
}

export type EnvironmentVariables = {
  MONGODB_URI: string;
  MONGODB_DB: string;
  AUTH_SECRET: string;
  PORT?: string;
  API_URL?: string;
  NODE_ENV?: string;
}; 