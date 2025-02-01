// Custom error classes for different scenarios
export class LogoError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'LogoError';
  }
}

export class NetworkError extends LogoError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends LogoError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends LogoError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthorizationError';
  }
}

// Error handlers
export const handleImageError = async (
  error: Error,
  retryCount: number,
  maxRetries: number = 3
): Promise<{ shouldRetry: boolean; delay: number }> => {
  if (error instanceof NetworkError && retryCount < maxRetries) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    return { shouldRetry: true, delay };
  }
  return { shouldRetry: false, delay: 0 };
};

export const handleValidationError = (error: ValidationError) => {
  console.error(`Validation Error: ${error.message}`, error.details);
  return {
    message: error.message,
    fields: error.details?.fields || [],
    code: error.code
  };
};

// Error reporting utility
export const reportError = (error: Error, context?: any) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  });
  
  // Here you would typically send to your error reporting service
  // e.g., Sentry, LogRocket, etc.
};

// Error boundary fallback components
export const getErrorFallback = (error: Error) => {
  if (error instanceof AuthorizationError) {
    return {
      title: 'Access Denied',
      message: 'You don\'t have permission to view this content.',
      action: 'Sign In'
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      action: 'Retry'
    };
  }
  
  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'Refresh'
  };
}; 