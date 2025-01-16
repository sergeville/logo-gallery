export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: unknown,
    public timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && this.details ? { details: this.details } : {})
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Not authenticated') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, resourceType?: string) {
    super(message, 404, 'NOT_FOUND', resourceType ? { resourceType } : undefined);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: unknown) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export function handleApiError(error: unknown): { statusCode: number; body: Record<string, unknown> } {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON()
    };
  }

  // Handle unknown errors
  const defaultError = new AppError(
    'Internal server error',
    500,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? error : undefined
  );

  return {
    statusCode: defaultError.statusCode,
    body: defaultError.toJSON()
  };
}

export function createErrorResponse(error: unknown): Response {
  const { statusCode, body } = handleApiError(error);
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'X-Error-Code': body.code as string
    }
  });
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createValidationError(field: string, message: string, value?: unknown): ValidationError {
  return new ValidationError(message, {
    field,
    value,
    timestamp: new Date().toISOString()
  });
}

export function createDatabaseError(operation: string, error: unknown): DatabaseError {
  return new DatabaseError(`Database ${operation} failed`, {
    originalError: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
} 