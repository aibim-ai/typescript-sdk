import { AibimError, AibimRateLimitError } from './errors.js';

export class RetryPolicy {
  private maxRetries: number;
  private backoffFactor: number;
  private maxBackoffMs: number;
  private retryableStatuses: number[];

  constructor(
    maxRetries: number = 3,
    backoffFactor: number = 0.5,
    maxBackoffMs: number = 30000,
    retryableStatuses: number[] = [429, 500, 502, 503, 504],
  ) {
    this.maxRetries = maxRetries;
    this.backoffFactor = backoffFactor;
    this.maxBackoffMs = maxBackoffMs;
    this.retryableStatuses = retryableStatuses;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt >= this.maxRetries) {
          break;
        }

        const isRetryable = this.shouldRetry(error);
        if (!isRetryable) {
          throw error;
        }

        const delayMs = this.calculateDelay(attempt, error);
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof AibimRateLimitError) {
      return true;
    }
    if (error instanceof AibimError && error.statusCode !== undefined) {
      return this.retryableStatuses.includes(error.statusCode);
    }
    if (error instanceof TypeError) {
      // Network errors (fetch failures)
      return true;
    }
    return false;
  }

  private calculateDelay(attempt: number, error: unknown): number {
    // Respect retry-after header for rate limit errors
    if (error instanceof AibimRateLimitError && error.retryAfter !== undefined) {
      return Math.min(error.retryAfter * 1000, this.maxBackoffMs);
    }

    // Exponential backoff with jitter
    const baseDelay = this.backoffFactor * Math.pow(2, attempt) * 1000;
    const jitter = Math.random() * baseDelay * 0.5;
    return Math.min(baseDelay + jitter, this.maxBackoffMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
