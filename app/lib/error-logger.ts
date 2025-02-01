type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  userId?: string;
  path?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldSampleError(severity: ErrorSeverity): boolean {
    // Sample errors based on severity
    switch (severity) {
      case 'critical':
      case 'high':
        return true;
      case 'medium':
        return Math.random() < 0.5; // 50% sampling
      case 'low':
        return Math.random() < 0.1; // 10% sampling
      default:
        return false;
    }
  }

  log(
    error: Error,
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {}
  ): void {
    if (!this.shouldSampleError(severity)) {
      return;
    }

    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error,
      severity,
      context,
      stack: error.stack
    };

    // Add to in-memory logs with size limit
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[${errorLog.severity.toUpperCase()}] ${errorLog.timestamp}:`,
        {
          message: error.message,
          context,
          stack: error.stack
        }
      );
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(errorLog);
    }
  }

  private async reportToService(errorLog: ErrorLog): Promise<void> {
    try {
      // Here you would typically send to your error reporting service
      // Example with a hypothetical API endpoint:
      const response = await fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        console.error('Failed to report error to service:', response.statusText);
      }
    } catch (e) {
      console.error('Error reporting failed:', e);
    }
  }

  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.logs.slice(-limit);
  }

  getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Utility functions for common error logging patterns
export const logError = (
  error: Error,
  context: ErrorContext = {}
): void => {
  errorLogger.log(error, 'medium', context);
};

export const logCriticalError = (
  error: Error,
  context: ErrorContext = {}
): void => {
  errorLogger.log(error, 'critical', context);
};

export const logNetworkError = (
  error: Error,
  path: string,
  context: ErrorContext = {}
): void => {
  errorLogger.log(error, 'high', { ...context, path });
};

export const logComponentError = (
  error: Error,
  component: string,
  context: ErrorContext = {}
): void => {
  errorLogger.log(error, 'medium', { ...context, component });
}; 