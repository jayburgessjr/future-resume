/**
 * Centralized error handling and monitoring system
 * Provides user-friendly error messages and optional analytics integration
 */

import { logger } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: Date;
  additionalData?: Record<string, unknown>;
}

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  originalError?: Error;
}

// Error codes and their user-friendly messages
const ERROR_MAPPINGS: Record<string, { userMessage: string; severity: ErrorSeverity }> = {
  // Authentication Errors
  'AUTH_FAILED': {
    userMessage: 'Authentication failed. Please sign in again.',
    severity: 'medium'
  },
  'AUTH_EXPIRED': {
    userMessage: 'Your session has expired. Please sign in again.',
    severity: 'low'
  },
  'AUTH_REQUIRED': {
    userMessage: 'Please sign in to continue.',
    severity: 'low'
  },

  // Resume Generation Errors
  'RESUME_GENERATION_FAILED': {
    userMessage: 'Resume generation failed. Please check your inputs and try again.',
    severity: 'high'
  },
  'RESUME_API_TIMEOUT': {
    userMessage: 'Resume generation is taking longer than expected. Please try again.',
    severity: 'medium'
  },
  'RESUME_INVALID_INPUT': {
    userMessage: 'Please check your resume content and job description are properly formatted.',
    severity: 'low'
  },
  'RESUME_QUOTA_EXCEEDED': {
    userMessage: 'You\'ve reached your monthly resume generation limit. Consider upgrading your plan.',
    severity: 'medium'
  },

  // API Errors
  'API_RATE_LIMITED': {
    userMessage: 'Too many requests. Please wait a moment and try again.',
    severity: 'medium'
  },
  'API_SERVER_ERROR': {
    userMessage: 'Server error occurred. Please try again in a few minutes.',
    severity: 'high'
  },
  'API_NETWORK_ERROR': {
    userMessage: 'Network error. Please check your connection and try again.',
    severity: 'medium'
  },

  // File/Export Errors
  'EXPORT_FAILED': {
    userMessage: 'Failed to export resume. Please try again.',
    severity: 'medium'
  },
  'FILE_TOO_LARGE': {
    userMessage: 'File size too large. Please use a smaller file.',
    severity: 'low'
  },
  'FILE_INVALID_FORMAT': {
    userMessage: 'Invalid file format. Please use a supported format.',
    severity: 'low'
  },

  // Subscription Errors
  'SUBSCRIPTION_REQUIRED': {
    userMessage: 'This feature requires a Pro subscription. Would you like to upgrade?',
    severity: 'low'
  },
  'PAYMENT_FAILED': {
    userMessage: 'Payment processing failed. Please check your payment details.',
    severity: 'medium'
  },

  // Generic Errors
  'UNKNOWN_ERROR': {
    userMessage: 'An unexpected error occurred. Please try again.',
    severity: 'medium'
  },
  'VALIDATION_ERROR': {
    userMessage: 'Please check your input and try again.',
    severity: 'low'
  }
};

export class AppErrorHandler {
  private static instance: AppErrorHandler;
  private errorReports: AppError[] = [];
  private maxReports = 100; // Keep last 100 errors

  private constructor() {}

  static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler();
    }
    return AppErrorHandler.instance;
  }

  /**
   * Create a standardized app error
   */
  createError(
    code: string,
    originalError?: Error,
    context?: ErrorContext
  ): AppError {
    const mapping = ERROR_MAPPINGS[code] || ERROR_MAPPINGS['UNKNOWN_ERROR'];
    
    return {
      code,
      message: originalError?.message || `Error code: ${code}`,
      userMessage: mapping.userMessage,
      severity: mapping.severity,
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      },
      originalError
    };
  }

  /**
   * Handle and log an error
   */
  handleError(error: AppError | Error | string, context?: ErrorContext): AppError {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = this.createError('UNKNOWN_ERROR', new Error(error), context);
    } else if (error instanceof Error) {
      // Try to map common error patterns to codes
      const code = this.inferErrorCode(error);
      appError = this.createError(code, error, context);
    } else {
      appError = error;
    }

    // Log the error
    this.logError(appError);

    // Store for analytics/reporting
    this.storeError(appError);

    // Send to monitoring service (if configured)
    this.reportToMonitoring(appError);

    return appError;
  }

  /**
   * Infer error code from error message/type
   */
  private inferErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'AUTH_FAILED';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'API_NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'RESUME_API_TIMEOUT';
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'API_RATE_LIMITED';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('quota') || message.includes('limit')) {
      return 'RESUME_QUOTA_EXCEEDED';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      stack: error.originalError?.stack
    };

    switch (error.severity) {
      case 'critical':
        logger.error('CRITICAL ERROR:', logData);
        break;
      case 'high':
        logger.error('ERROR:', logData);
        break;
      case 'medium':
        logger.warn('WARNING:', logData);
        break;
      case 'low':
        logger.info('INFO:', logData);
        break;
    }
  }

  /**
   * Store error for local analytics
   */
  private storeError(error: AppError): void {
    this.errorReports.push(error);
    
    // Keep only last N errors
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }

    // Store in localStorage for persistence (optional)
    if (typeof window !== 'undefined' && error.severity === 'critical') {
      try {
        const stored = JSON.parse(localStorage.getItem('app_critical_errors') || '[]');
        stored.push({
          ...error,
          timestamp: error.context?.timestamp?.toISOString()
        });
        localStorage.setItem('app_critical_errors', JSON.stringify(stored.slice(-10)));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Report to external monitoring service
   */
  private reportToMonitoring(error: AppError): void {
    // Only report medium+ severity errors
    if (error.severity === 'low') return;

    // Example integration points:
    // - Sentry
    // - LogRocket
    // - Custom analytics endpoint

    if (typeof window !== 'undefined' && window.gtag) {
      // Google Analytics error tracking
      window.gtag('event', 'exception', {
        description: error.code,
        fatal: error.severity === 'critical'
      });
    }

    // Custom analytics endpoint (example)
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          code: error.code,
          severity: error.severity,
          context: error.context,
          userMessage: error.userMessage
        })
      }).catch(() => {
        // Ignore analytics errors
      });
    }
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCode: Record<string, number>;
    recent: AppError[];
  } {
    const bySeverity = this.errorReports.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const byCode = this.errorReports.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorReports.length,
      bySeverity,
      byCode,
      recent: this.errorReports.slice(-10)
    };
  }

  /**
   * Clear error history (for testing)
   */
  clearErrors(): void {
    this.errorReports = [];
  }
}

// Export singleton instance
export const errorHandler = AppErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error | string, context?: ErrorContext) => 
  errorHandler.handleError(error, context);

export const createError = (code: string, originalError?: Error, context?: ErrorContext) =>
  errorHandler.createError(code, originalError, context);

// Hook for React components
export function useErrorHandler() {
  return {
    handleError,
    createError,
    getStats: () => errorHandler.getErrorStats()
  };
}