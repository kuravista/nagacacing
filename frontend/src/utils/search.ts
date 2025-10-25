/**
 * Search and Filter Utilities
 * Handles search queries and market cap filtering
 */

import { Ticker } from '../data/schema.js';

/**
 * Search tickers by symbol or name
 * Case-insensitive, supports prefix and substring matching
 */
export function searchTickers(
  tickers: Ticker[],
  query: string
): Ticker[] {
  if (!query || query.trim().length === 0) {
    return tickers;
  }

  const lowerQuery = query.toLowerCase().trim();

  return tickers.filter((ticker) => {
    const symbol = ticker.symbol.toLowerCase();
    const name = ticker.name.toLowerCase();

    // Prefix match (higher priority)
    if (symbol.startsWith(lowerQuery) || name.startsWith(lowerQuery)) {
      return true;
    }

    // Substring match
    if (symbol.includes(lowerQuery) || name.includes(lowerQuery)) {
      return true;
    }

    return false;
  });
}

/**
 * Filter tickers by market cap quantile range
 * Q1: 0-25%, Q2: 25-50%, Q3: 50-75%, Q4: 75-100%
 */
export function filterByMarketCap(
  tickers: Ticker[],
  minQuantile: number,
  maxQuantile: number
): Ticker[] {
  if (tickers.length === 0) return [];

  const sorted = [...tickers].sort((a, b) => a.marketCap - b.marketCap);

  const minIndex = Math.floor((minQuantile / 100) * sorted.length);
  const maxIndex = Math.ceil((maxQuantile / 100) * sorted.length);

  const minCap = sorted[minIndex]?.marketCap || 0;
  const maxCap = sorted[Math.min(maxIndex, sorted.length - 1)]?.marketCap || Infinity;

  return tickers.filter((t) => t.marketCap >= minCap && t.marketCap <= maxCap);
}

/**
 * Calculate quantile thresholds for market cap
 */
export function calculateQuantiles(
  tickers: Ticker[]
): { Q1: number; Q2: number; Q3: number; Q4: number } {
  if (tickers.length === 0) {
    return { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  }

  const sorted = [...tickers].sort((a, b) => a.marketCap - b.marketCap);

  const q1Index = Math.floor(0.25 * sorted.length);
  const q2Index = Math.floor(0.5 * sorted.length);
  const q3Index = Math.floor(0.75 * sorted.length);

  return {
    Q1: sorted[q1Index]?.marketCap || 0,
    Q2: sorted[q2Index]?.marketCap || 0,
    Q3: sorted[q3Index]?.marketCap || 0,
    Q4: sorted[sorted.length - 1]?.marketCap || 0,
  };
}

/**
 * Combine search and market cap filters
 * AND logic: both conditions must be met
 */
export function applyFilters(
  tickers: Ticker[],
  searchQuery: string,
  minQuantile: number,
  maxQuantile: number
): Ticker[] {
  let filtered = searchTickers(tickers, searchQuery);
  filtered = filterByMarketCap(filtered, minQuantile, maxQuantile);
  return filtered;
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Cacing Hunter mode: highlight small caps (≤Q2)
 */
export function getCacingHunterResults(
  tickers: Ticker[]
): {
  small: Ticker[];
  large: Ticker[];
} {
  const quantiles = calculateQuantiles(tickers);

  return {
    small: tickers.filter((t) => t.marketCap <= quantiles.Q2),
    large: tickers.filter((t) => t.marketCap > quantiles.Q2),
  };
}
