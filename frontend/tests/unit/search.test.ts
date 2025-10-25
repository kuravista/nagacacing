/**
 * Unit Tests for Search and Filter Logic
 * Tests: case-insensitive search, debounce, slider performance
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  searchTickers,
  filterByMarketCap,
  calculateQuantiles,
  applyFilters,
  debounce,
  getCacingHunterResults,
} from '../../src/utils/search';
import { Ticker } from '../../src/data/schema.js';

describe('Search Utilities', () => {
  const mockTickers: Ticker[] = [
    {
      symbol: 'BBCA',
      name: 'Bank Central Asia',
      price: 9250,
      changePct: 1.5,
      volume: 5000000,
      marketCap: 50000000000,
      groupId: 'G-01',
      sector: 'Finance',
    },
    {
      symbol: 'ASII',
      name: 'Astra International',
      price: 5600,
      changePct: -0.5,
      volume: 3000000,
      marketCap: 30000000000,
      groupId: 'G-02',
      sector: 'Automotive',
    },
    {
      symbol: 'GOTO',
      name: 'GoTo Gojek Tokopedia',
      price: 125,
      changePct: 3.2,
      volume: 500000,
      marketCap: 5000000000,
      groupId: null,
      sector: 'Technology',
    },
  ];

  describe('searchTickers', () => {
    it('should return all tickers when query is empty', () => {
      const results = searchTickers(mockTickers, '');
      expect(results).toHaveLength(3);
    });

    it('should find tickers by symbol prefix', () => {
      const results = searchTickers(mockTickers, 'BB');
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('BBCA');
    });

    it('should find tickers by name prefix', () => {
      const results = searchTickers(mockTickers, 'Bank');
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('Bank');
    });

    it('should be case-insensitive', () => {
      const results1 = searchTickers(mockTickers, 'bbca');
      const results2 = searchTickers(mockTickers, 'BBCA');
      const results3 = searchTickers(mockTickers, 'BbCa');

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results3).toHaveLength(1);
    });

    it('should support substring matching', () => {
      const results = searchTickers(mockTickers, 'stra');
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('ASII');
    });

    it('should match multiple results', () => {
      const results = searchTickers(mockTickers, 'a');
      expect(results.length).toBeGreaterThan(1);
    });
  });

  describe('filterByMarketCap', () => {
    it('should filter by quantile range', () => {
      // Q1-Q2: bottom 50%
      const results = filterByMarketCap(mockTickers, 0, 50);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((t) => {
        expect(t.marketCap).toBeLessThanOrEqual(30000000000);
      });
    });

    it('should support Q1-Q4 ranges', () => {
      const q1 = filterByMarketCap(mockTickers, 0, 25);
      const q2 = filterByMarketCap(mockTickers, 25, 50);
      const q3 = filterByMarketCap(mockTickers, 50, 75);
      const q4 = filterByMarketCap(mockTickers, 75, 100);

      expect(q1).toBeDefined();
      expect(q2).toBeDefined();
      expect(q3).toBeDefined();
      expect(q4).toBeDefined();
    });

    it('should return empty array for empty input', () => {
      const results = filterByMarketCap([], 0, 100);
      expect(results).toHaveLength(0);
    });
  });

  describe('calculateQuantiles', () => {
    it('should calculate correct quantile thresholds', () => {
      const quantiles = calculateQuantiles(mockTickers);

      expect(quantiles.Q1).toBeLessThanOrEqual(quantiles.Q2);
      expect(quantiles.Q2).toBeLessThanOrEqual(quantiles.Q3);
      expect(quantiles.Q3).toBeLessThanOrEqual(quantiles.Q4);
    });

    it('should handle edge case of single ticker', () => {
      const quantiles = calculateQuantiles([mockTickers[0]]);
      expect(quantiles.Q1).toBe(mockTickers[0].marketCap);
    });
  });

  describe('applyFilters - AND logic', () => {
    it('should apply search AND market cap filter', () => {
      const results = applyFilters(mockTickers, 'Bank', 0, 100);
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('BBCA');
    });

    it('should return empty when no results match both filters', () => {
      const results = applyFilters(mockTickers, 'Bank', 0, 25);
      expect(results).toHaveLength(0);
    });

    it('should handle empty search query', () => {
      const results = applyFilters(mockTickers, '', 0, 100);
      expect(results).toHaveLength(3);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debouncedFn = debounce(fn, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });

    it('should execute with latest arguments', async () => {
      let lastArg = '';
      const fn = (arg: string) => {
        lastArg = arg;
      };
      const debouncedFn = debounce(fn, 50);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(lastArg).toBe('third');
    });
  });

  describe('getCacingHunterResults', () => {
    it('should separate small (≤Q2) and large caps', () => {
      const { small, large } = getCacingHunterResults(mockTickers);

      small.forEach((t) => {
        expect(t.marketCap).toBeLessThanOrEqual(30000000000);
      });

      large.forEach((t) => {
        expect(t.marketCap).toBeGreaterThan(30000000000);
      });
    });

    it('should highlight Cacing (independent) stocks', () => {
      const { small } = getCacingHunterResults(mockTickers);
      const cacing = small.filter((t) => !t.groupId);
      expect(cacing.length).toBeGreaterThan(0);
    });
  });

  describe('Performance - 900+ bubbles', () => {
    let largeTickers: Ticker[];

    beforeAll(() => {
      // Generate 900 mock tickers
      largeTickers = Array.from({ length: 900 }, (_, i) => ({
        symbol: `TIK${String(i).padStart(4, '0')}`,
        name: `Ticker ${i}`,
        price: Math.random() * 10000,
        changePct: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 5000000),
        marketCap: Math.floor(Math.random() * 3000000000000) + 500000000,
        groupId: i < 50 ? `G-${String((i % 10) + 1).padStart(2, '0')}` : null,
        sector: ['Tech', 'Finance', 'Energy', 'Consumer'][i % 4],
      }));
    });

    it('should search 900 tickers in <150ms', () => {
      const start = performance.now();
      searchTickers(largeTickers, 'TIK001');
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(150);
    });

    it('should filter 900 tickers by market cap in <200ms', () => {
      const start = performance.now();
      filterByMarketCap(largeTickers, 25, 75);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(200);
    });

    it('should apply combined filters to 900 tickers in <200ms', () => {
      const start = performance.now();
      applyFilters(largeTickers, 'TIK', 0, 100);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(200);
    });

    it('should calculate quantiles for 900 tickers in <100ms', () => {
      const start = performance.now();
      calculateQuantiles(largeTickers);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100);
    });
  });
});
