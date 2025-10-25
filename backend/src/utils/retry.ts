/**
 * Retry Utility with Exponential Backoff
 * Implements retry logic with configurable delays: 1s, 5s, 30s
 */

import { logger } from '../logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  delays?: number[];
  onRetry?: (attempt: number, delay: number, error: Error) => void;
}

const DEFAULT_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Result of function if successful
 * @throws Last error if all retries exhausted
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const delays = options.delays || DEFAULT_DELAYS;
  const maxAttempts = options.maxAttempts || delays.length + 1;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        logger.error(`Retry exhausted after ${attempt} attempts`, { error: lastError });
        throw lastError;
      }

      const delayIndex = Math.min(attempt - 1, delays.length - 1);
      const delay = delays[delayIndex];

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
      });

      if (options.onRetry) {
        options.onRetry(attempt, delay, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed for unknown reason');
}

/**
 * Sleep for a given number of milliseconds
 * @param ms Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry synchronous function with backoff
 * @param fn Synchronous function to retry
 * @param options Retry configuration
 * @returns Result of function if successful
 * @throws Last error if all retries exhausted
 */
export function retrySync<T>(
  fn: () => T,
  options: RetryOptions = {}
): T {
  const delays = options.delays || DEFAULT_DELAYS;
  const maxAttempts = options.maxAttempts || delays.length + 1;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        logger.error(`Retry exhausted after ${attempt} attempts`, { error: lastError });
        throw lastError;
      }

      logger.warn(`Attempt ${attempt} failed`, {
        error: lastError.message,
      });

      if (options.onRetry) {
        options.onRetry(attempt, 0, lastError);
      }
    }
  }

  throw lastError || new Error('Retry failed for unknown reason');
}
