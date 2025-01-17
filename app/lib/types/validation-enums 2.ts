// Validation field types
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

// Validation error types
export const ValidationErrorType = {
  Required: 'required',
  Format: 'format',
  Length: 'length',
  Range: 'range',
  Items: 'items',
  Custom: 'custom'
} as const; 