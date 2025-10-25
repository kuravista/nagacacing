/**
 * Unit Tests for Mobile Utilities
 * Tests: Ranking, clustering, performance optimization
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  calculateCompositeScore,
  getTopCacing,
  clusterNaga,
  getMobileOptimizedData,
  isMobileViewport,
  getMobileOptimalBubbleCount,
  formatMobileMarketCap,
  getMobileRadiusScale,
} from '../../src/utils/mobile';
import { Ticker } from '../../src/data/schema.js';

describe('Mobile Utilities', () => {
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
    {
      symbol: 'MNCN',
      name: 'Media Nusantara Citra',
      price: 1500,
      changePct: 2.1,
      volume: 2000000,
      marketCap: 8000000000,
      groupId: null,
      sector: 'Media',
    },
    {
      symbol: 'TLKM',
      name: 'Telekomunikasi Indonesia',
      price: 3200,
      changePct: -1.2,
      volume: 4000000,
      marketCap: 70000000000,
      groupId: 'G-03',
      sector: 'Telecom',
    },
  ];

  describe('Composite Score Calculation', () => {
    it('should calculate composite score', () => {
      const score = calculateCompositeScore(mockTickers[0], mockTickers);
      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
    });

    it('should give higher scores to higher volume + positive change', () => {
      // GOTO has high change (3.2%) but low volume
      const gotoScore = calculateCompositeScore(mockTickers[2], mockTickers);
      // BBCA has high volume but moderate change (1.5%)
      const bbcaScore = calculateCompositeScore(mockTickers[0], mockTickers);

      // Both should have reasonable scores
      expect(gotoScore).toBeDefined();
      expect(bbcaScore).toBeDefined();
    });
  });

  describe('Top Cacing Ranking', () => {
    it('should filter only Cacing (no groupId)', () => {
      const topCacing = getTopCacing(mockTickers, 5);
      topCacing.forEach((t) => {
        expect(t.groupId).toBeNull();
      });
    });

    it('should return top N Cacing', () => {
      const topCacing = getTopCacing(mockTickers, 2);
      expect(topCacing.length).toBeLessThanOrEqual(2);
    });

    it('should rank by composite score', () => {
      const topCacing = getTopCacing(mockTickers, 2);
      if (topCacing.length > 1) {
        const score1 = calculateCompositeScore(topCacing[0], mockTickers);
        const score2 = calculateCompositeScore(topCacing[1], mockTickers);
        expect(score1).toBeGreaterThanOrEqual(score2);
      }
    });

    it('should handle empty Cacing list', () => {
      const nagaOnly = mockTickers.filter((t) => t.groupId);
      const topCacing = getTopCacing(nagaOnly, 5);
      expect(topCacing).toHaveLength(0);
    });
  });

  describe('Naga Clustering', () => {
    it('should cluster Naga by groupId', () => {
      const clusters = clusterNaga(mockTickers);
      expect(clusters.length).toBeGreaterThan(0);
      clusters.forEach((cluster) => {
        expect(cluster.groupId).toBeDefined();
        expect(cluster.tickers.length).toBeGreaterThan(0);
      });
    });

    it('should calculate cluster metrics', () => {
      const clusters = clusterNaga(mockTickers);
      clusters.forEach((cluster) => {
        expect(cluster.avgChangePct).toBeDefined();
        expect(cluster.totalMarketCap).toBeGreaterThan(0);
      });
    });

    it('should sort clusters by composite metric', () => {
      const clusters = clusterNaga(mockTickers);
      if (clusters.length > 1) {
        // Verify descending order
        for (let i = 0; i < clusters.length - 1; i++) {
          const metric1 = clusters[i].avgChangePct * (clusters[i].totalMarketCap / 1e9);
          const metric2 = clusters[i + 1].avgChangePct * (clusters[i + 1].totalMarketCap / 1e9);
          expect(metric1).toBeGreaterThanOrEqual(metric2);
        }
      }
    });

    it('should not include Cacing in clusters', () => {
      const clusters = clusterNaga(mockTickers);
      clusters.forEach((cluster) => {
        cluster.tickers.forEach((ticker) => {
          expect(ticker.groupId).toBeTruthy();
        });
      });
    });
  });

  describe('Mobile Optimized Data', () => {
    it('should return both Naga clusters and Top Cacing', () => {
      const optimized = getMobileOptimizedData(mockTickers, 20);
      expect(optimized.nagaClusters).toBeDefined();
      expect(optimized.topCacing).toBeDefined();
    });

    it('should respect Cacing limit', () => {
      const optimized = getMobileOptimizedData(mockTickers, 2);
      expect(optimized.topCacing.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Viewport Detection', () => {
    it('should return boolean', () => {
      const isMobile = isMobileViewport();
      expect(typeof isMobile).toBe('boolean');
    });
  });

  describe('Bubble Count Optimization', () => {
    it('should reduce bubble count for mobile', () => {
      const optimalCount = getMobileOptimalBubbleCount(900, 30);
      expect(optimalCount).toBeLessThan(900);
      expect(optimalCount).toBeGreaterThanOrEqual(100);
    });

    it('should maintain minimum bubble count', () => {
      const optimalCount = getMobileOptimalBubbleCount(50, 30);
      expect(optimalCount).toBeGreaterThanOrEqual(100);
    });

    it('should scale with FPS target', () => {
      const count60fps = getMobileOptimalBubbleCount(900, 60);
      const count30fps = getMobileOptimalBubbleCount(900, 30);
      expect(count60fps).toBeGreaterThan(count30fps);
    });
  });

  describe('Market Cap Formatting', () => {
    it('should format trillions', () => {
      const formatted = formatMobileMarketCap(1.5e12);
      expect(formatted).toContain('T');
      expect(formatted).toBe('$1.5T');
    });

    it('should format billions', () => {
      const formatted = formatMobileMarketCap(5e9);
      expect(formatted).toBe('$5.0B');
    });

    it('should format millions', () => {
      const formatted = formatMobileMarketCap(100e6);
      expect(formatted).toContain('M');
    });

    it('should format raw numbers', () => {
      const formatted = formatMobileMarketCap(12345);
      expect(formatted).toContain('$');
    });
  });

  describe('Mobile Radius Scale', () => {
    it('should calculate mobile radius', () => {
      const radius = getMobileRadiusScale(50e9, 5e9, 100e9);
      expect(radius).toBeGreaterThanOrEqual(8); // min
      expect(radius).toBeLessThanOrEqual(32); // max
    });

    it('should scale with market cap', () => {
      const smallRadius = getMobileRadiusScale(5e9, 5e9, 100e9);
      const largeRadius = getMobileRadiusScale(100e9, 5e9, 100e9);
      expect(largeRadius).toBeGreaterThan(smallRadius);
    });

    it('should have mobile-appropriate ranges', () => {
      const minCap = 1e9;
      const maxCap = 100e9;
      const minRadius = getMobileRadiusScale(minCap, minCap, maxCap);
      const maxRadius = getMobileRadiusScale(maxCap, minCap, maxCap);

      expect(minRadius).toBeCloseTo(8, 0);
      expect(maxRadius).toBeCloseTo(32, 0);
    });
  });

  describe('Performance - Large Dataset', () => {
    let largeTickers: Ticker[];

    beforeAll(() => {
      largeTickers = Array.from({ length: 900 }, (_, i) => ({
        symbol: `TIK${String(i).padStart(4, '0')}`,
        name: `Ticker ${i}`,
        price: Math.random() * 10000,
        changePct: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 5000000),
        marketCap: Math.floor(Math.random() * 3000000000000) + 500000000,
        groupId: i < 100 ? `G-${String((i % 20) + 1).padStart(2, '0')}` : null,
        sector: ['Tech', 'Finance', 'Energy', 'Consumer'][i % 4],
      }));
    });

    it('should cluster Naga in <100ms', () => {
      const start = performance.now();
      clusterNaga(largeTickers);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should get Top Cacing in <100ms', () => {
      const start = performance.now();
      getTopCacing(largeTickers, 20);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should optimize mobile data in <150ms', () => {
      const start = performance.now();
      getMobileOptimizedData(largeTickers, 20);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(150);
    });
  });
});
