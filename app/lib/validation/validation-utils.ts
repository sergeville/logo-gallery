import type { ValidationRule } from './validation-rules'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationWarning {
  field: string
  message: string
}

export interface ValidationFix {
  field: string
  action: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  fixes: ValidationFix[]
  data?: any
}

export function validateField(value: any, rule: ValidationRule, fieldName: string): ValidationError | null {
  if (rule.required && !value) {
    return {
      field: fieldName,
      message: rule.message
    }
  }

  if (value) {
    if (rule.minLength && value.length < rule.minLength) {
      return {
        field: fieldName,
        message: rule.message
      }
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        field: fieldName,
        message: rule.message
      }
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        field: fieldName,
        message: rule.message
      }
    }
  }

  return null
}

export function validateObject<T extends object>(obj: T, rules: Record<keyof T, ValidationRule>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const fixes: ValidationFix[] = []

  for (const [field, rule] of Object.entries(rules) as [keyof T, ValidationRule][]) {
    const error = validateField(obj[field], rule, field as string)
    if (error) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes
  }
} 