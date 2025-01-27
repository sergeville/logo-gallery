export const ValidationFieldType = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Array: 'array',
  Object: 'object',
  Date: 'date',
  Email: 'email',
  URL: 'url'
} as const;

export const ValidationErrorType = {
  Required: 'required',
  Format: 'format',
  Length: 'length',
  Range: 'range',
  Pattern: 'pattern',
  Custom: 'custom'
} as const; 