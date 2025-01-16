import { ValidationResult, ValidationError, FixSuggestion } from '@/app/lib/types';
import { ObjectId } from 'mongodb';

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'url' | 'objectId' | 'array' | 'dateRange';
  message: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
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
  return ObjectId.isValid(id);
}

export function validateDateRange(start: Date, end: Date): boolean {
  return start <= end;
}

export function createValidationResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: []
  };
}

export function addError(result: ValidationResult, error: ValidationError): void {
  result.errors.push(error);
  result.isValid = false;
}

export function addWarning(result: ValidationResult, warning: ValidationError): void {
  result.warnings.push(warning);
}

export function validateField(value: any, rule: ValidationRule): ValidationError | null {
  switch (rule.type) {
    case 'required':
      if (!value) {
        return {
          field: rule.field,
          message: rule.message || `${rule.field} is required`,
          type: 'error'
        };
      }
      break;

    case 'email':
      if (!validateEmail(value)) {
        return {
          field: rule.field,
          message: rule.message || 'Invalid email format',
          type: 'error'
        };
      }
      break;

    case 'url':
      if (!validateUrl(value)) {
        return {
          field: rule.field,
          message: rule.message || 'Invalid URL format',
          type: 'error'
        };
      }
      break;

    case 'objectId':
      if (!validateObjectId(value)) {
        return {
          field: rule.field,
          message: rule.message || 'Invalid ObjectId',
          type: 'error'
        };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return {
          field: rule.field,
          message: rule.message || `${rule.field} must be an array`,
          type: 'error'
        };
      }
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return {
          field: rule.field,
          message: rule.message || `${rule.field} must have at least ${rule.minLength} items`,
          type: 'error'
        };
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return {
          field: rule.field,
          message: rule.message || `${rule.field} must have at most ${rule.maxLength} items`,
          type: 'error'
        };
      }
      break;
  }

  return null;
}

export function generateFixSuggestions(field: string, value: any): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  switch (field) {
    case 'email':
      if (typeof value === 'string' && !validateEmail(value)) {
        suggestions.push({
          field,
          action: 'Format email correctly',
          example: 'example@domain.com',
          autoFixable: false
        });
      }
      break;

    case 'url':
      if (typeof value === 'string' && !validateUrl(value)) {
        suggestions.push({
          field,
          action: 'Format URL correctly',
          example: 'https://example.com',
          autoFixable: false
        });
      }
      break;

    case 'tags':
      if (!Array.isArray(value) || value.length === 0) {
        suggestions.push({
          field,
          action: 'Add at least one tag',
          example: '["tag1", "tag2"]',
          autoFixable: false
        });
      }
      break;
  }

  return suggestions;
} 