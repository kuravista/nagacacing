/**
 * Data Loader - Frontend
 * Loads data.json from CDN with retry logic and schema validation
 */

import { Data, validateDataSafe } from './schema.js';
import { getMockData } from './mockData.js';

const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

export interface LoaderOptions {
  url: string;
  maxAttempts?: number;
  onRetry?: (attempt: number, delay: number, error: Error) => void;
}

export interface LoadResult {
  success: boolean;
  data?: Data;
  error?: string;
  attempts: number;
  lastError?: Error;
}

/**
 * Load data.json from URL with retry and validation
 * @param options Loader configuration
 * @returns Loading result with data or error details
 */
export async function loadData(options: LoaderOptions): Promise<LoadResult> {
  const maxAttempts = options.maxAttempts || RETRY_DELAYS.length + 1;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Fetch from URL
      const response = await fetch(options.url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      // Validate against schema
      const validation = validateDataSafe(json);

      if (!validation.success) {
        throw new Error(`Schema validation failed: ${validation.error}`);
      }

      console.log(`✓ Data loaded successfully on attempt ${attempt}`);
      return {
        success: true,
        data: validation.data,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if CORS error - don't retry, fail fast
      if (lastError.message.includes('CORS') || lastError.message.includes('Failed to fetch')) {
        console.error(`✗ CORS or network error (not retrying): ${lastError.message}`);
        return {
          success: false,
          error: lastError.message,
          attempts: attempt,
          lastError,
        };
      }

      if (attempt === maxAttempts) {
        console.error(`✗ Failed to load data after ${maxAttempts} attempts:`, lastError.message);
        return {
          success: false,
          error: lastError.message,
          attempts: maxAttempts,
          lastError,
        };
      }

      const delayIndex = Math.min(attempt - 1, RETRY_DELAYS.length - 1);
      const delay = RETRY_DELAYS[delayIndex];

      console.warn(
        `Attempt ${attempt} failed (${lastError.message}), retrying in ${delay}ms...`
      );

      if (options.onRetry) {
        options.onRetry(attempt, delay, lastError);
      }

      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempts: maxAttempts,
    lastError,
  };
}

/**
 * Load data with fallback to cached version
 * @param options Loader configuration
 * @param cachedData Previously loaded data to use as fallback
 * @returns Loading result with data (fresh or cached)
 */
export async function loadDataWithFallback(
  options: LoaderOptions,
  cachedData?: Data
): Promise<LoadResult> {
  const result = await loadData(options);

  if (result.success) {
    // Store in localStorage for fallback
    try {
      localStorage.setItem('nagacacing_data_cache', JSON.stringify(result.data));
      localStorage.setItem('nagacacing_data_cache_timestamp', new Date().toISOString());
    } catch (e) {
      console.warn('Failed to cache data to localStorage');
    }
    return result;
  }

  // If loading failed and we have cached data, use it
  if (cachedData) {
    console.warn('Using cached data due to load failure');
    return {
      success: true,
      data: cachedData,
      error: `${result.error} (using stale cache)`,
      attempts: result.attempts,
    };
  }

  // Try to restore from localStorage
  try {
    const cached = localStorage.getItem('nagacacing_data_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      const validation = validateDataSafe(parsed);
      if (validation.success) {
        const timestamp = localStorage.getItem('nagacacing_data_cache_timestamp');
        console.warn(`Using cached data from ${timestamp}`);
        return {
          success: true,
          data: validation.data,
          error: `${result.error} (using stale cache)`,
          attempts: result.attempts,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to restore cached data from localStorage');
  }

  // Final fallback: use mock data for development
  console.warn('Using mock data (development fallback)');
  return {
    success: true,
    data: getMockData(),
    error: `${result.error} (using development mock data)`,
    attempts: result.attempts,
  };
}

/**
 * Sleep for a given number of milliseconds
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get cached data if available
 * @returns Cached data or undefined
 */
export function getCachedData(): Data | undefined {
  try {
    const cached = localStorage.getItem('nagacacing_data_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      const validation = validateDataSafe(parsed);
      if (validation.success) {
        return validation.data;
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve cached data');
  }
  return undefined;
}

/**
 * Clear cached data
 */
export function clearCache(): void {
  try {
    localStorage.removeItem('nagacacing_data_cache');
    localStorage.removeItem('nagacacing_data_cache_timestamp');
  } catch (e) {
    console.warn('Failed to clear cache');
  }
}
