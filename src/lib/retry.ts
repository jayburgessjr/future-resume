import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return error.message.includes('fetch') || 
           error.message.includes('timeout') ||
           error.message.includes('Network') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504');
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.warn(`Operation failed on attempt ${attempt}/${opts.maxAttempts}:`, lastError.message);

      // Don't retry if it's the last attempt or if retry condition is not met
      if (attempt === opts.maxAttempts || !opts.retryCondition?.(lastError)) {
        break;
      }

      // Call onRetry callback if provided
      opts.onRetry?.(attempt, lastError);

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );

      logger.debug(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Specialized retry for API calls
export async function withApiRetry<T>(
  operation: () => Promise<T>,
  context: string = 'API call'
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 3,
    delayMs: 2000,
    backoffMultiplier: 1.5,
    retryCondition: (error) => {
      // Retry on network errors and server errors, but not client errors
      const message = error.message.toLowerCase();
      return (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504') ||
        message.includes('connection')
      );
    },
    onRetry: (attempt, error) => {
      logger.warn(`${context} retry attempt ${attempt}:`, error.message);
    },
  });
}

// Specialized retry for authentication
export async function withAuthRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 2,
    delayMs: 1000,
    backoffMultiplier: 1,
    retryCondition: (error) => {
      const message = error.message.toLowerCase();
      // Only retry on network issues, not auth failures
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('fetch')
      ) && !message.includes('unauthorized') && !message.includes('invalid');
    },
    onRetry: (attempt, error) => {
      logger.warn(`Authentication retry attempt ${attempt}:`, error.message);
    },
  });
}

// Circuit breaker pattern for repeated failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private timeoutMs = 30000,
    private monitoringPeriodMs = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'half-open';
        logger.debug('Circuit breaker moving to half-open state');
      } else {
        throw new Error('Circuit breaker is open - operation not attempted');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      logger.warn(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Global circuit breaker for resume generation
export const resumeGenerationCircuitBreaker = new CircuitBreaker(3, 30000);