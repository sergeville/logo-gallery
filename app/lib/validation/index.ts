export const ValidationFieldType = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Date: 'date',
  Email: 'email',
  URL: 'url',
  ID: 'id',
  Object: 'object',
  Array: 'array'
} as const;

export const ValidationErrorType = {
  Required: 'required',
  Format: 'format',
  Length: 'length',
  Range: 'range',
  Items: 'items',
  Custom: 'custom'
} as const;

export interface ValidationRule {
  type: typeof ValidationFieldType[keyof typeof ValidationFieldType];
  field: string;
  name: string;
  code: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  validate?: (value: any) => boolean;
} 