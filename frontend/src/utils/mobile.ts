/**
 * Mobile Utilities
 * Ranking, clustering, and mobile-specific filtering
 */

import { Ticker } from '../data/schema.js';

/**
 * Composite score for mobile ranking
 * Formula: 0.6 × z-score + 0.4 × normalized changePct
 * Used to rank tickers for mobile "Top 20 Cacing"
 */
export function calculateCompositeScore(
  ticker: Ticker,
  allTickers: Ticker[]
): number {
  // Calculate z-score for volume
  const volumes = allTickers.map((t) => t.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const stdDev = Math.sqrt(
    volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
  );
  const zScore = stdDev === 0 ? 0 : (ticker.volume - avgVolume) / stdDev;

  // Normalize changePct to 0-1 range
  const changePercents = allTickers.map((t) => t.changePct);
  const minChange = Math.min(...changePercents);
  const maxChange = Math.max(...changePercents);
  const changeRange = maxChange - minChange;
  const normalizedChange = changeRange === 0 ? 0.5 : (ticker.changePct - minChange) / changeRange;

  // Composite: 60% volume, 40% change
  return 0.6 * zScore + 0.4 * normalizedChange;
}

/**
 * Get top N Cacing (small-cap independent stocks)
 * Sorted by composite score (descending)
 */
export function getTopCacing(
  tickers: Ticker[],
  count: number = 20
): Ticker[] {
  // Filter: small-cap (≤Q2) + no groupId
  const cacingTickers = tickers.filter((t) => !t.groupId);

  // Calculate quantiles
  const sorted = [...cacingTickers].sort((a, b) => a.marketCap - b.marketCap);
  const q2Index = Math.floor(0.5 * sorted.length);
  const q2Threshold = sorted[q2Index]?.marketCap || Infinity;

  // Filter to small-cap Cacing only
  const smallCapCacing = cacingTickers.filter((t) => t.marketCap <= q2Threshold);

  // Score and sort
  const scored = smallCapCacing.map((t) => ({
    ticker: t,
    score: calculateCompositeScore(t, tickers),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.ticker);
}

/**
 * Cluster Naga (large-cap) stocks by group
 * Returns array of groups with their tickers
 */
export interface NagaCluster {
  groupId: string;
  groupName: string;
  tickers: Ticker[];
  avgChangePct: number;
  totalMarketCap: number;
}

export function clusterNaga(tickers: Ticker[]): NagaCluster[] {
  // Group tickers by groupId (Naga only)
  const nagaTickers = tickers.filter((t) => t.groupId);
  const groups = new Map<string, Ticker[]>();

  nagaTickers.forEach((t) => {
    if (t.groupId) {
      if (!groups.has(t.groupId)) {
        groups.set(t.groupId, []);
      }
      groups.get(t.groupId)!.push(t);
    }
  });

  // Convert to clusters with metrics
  const clusters: NagaCluster[] = [];

  groups.forEach((tickers, groupId) => {
    const avgChangePct = tickers.reduce((sum, t) => sum + t.changePct, 0) / tickers.length;
    const totalMarketCap = tickers.reduce((sum, t) => sum + t.marketCap, 0);

    // Use first ticker's group name if available
    const groupName = tickers[0]?.name?.split(' ')[0] || groupId;

    clusters.push({
      groupId,
      groupName,
      tickers,
      avgChangePct,
      totalMarketCap,
    });
  });

  // Sort by composite metric (avgChange × marketCap)
  clusters.sort((a, b) => {
    const aMetric = a.avgChangePct * (a.totalMarketCap / 1e9);
    const bMetric = b.avgChangePct * (b.totalMarketCap / 1e9);
    return bMetric - aMetric;
  });

  return clusters;
}

/**
 * Get mobile-optimized data subset
 * Returns: Naga clusters + Top 20 Cacing
 */
export function getMobileOptimizedData(
  tickers: Ticker[],
  cacingLimit: number = 20
): {
  nagaClusters: NagaCluster[];
  topCacing: Ticker[];
} {
  return {
    nagaClusters: clusterNaga(tickers),
    topCacing: getTopCacing(tickers, cacingLimit),
  };
}

/**
 * Detect mobile viewport
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768; // iPad breakpoint
}

/**
 * Get optimal bubble count for mobile performance
 * Target: ≥30 FPS with reduced set
 */
export function getMobileOptimalBubbleCount(
  totalCount: number,
  targetFps: number = 30
): number {
  // Heuristic: reduce by 30-50% for mobile mid-range devices
  // Assuming desktop target: 60 FPS with 900 bubbles
  // Mobile target: 30 FPS suggests ~450 bubbles optimal
  const reductionRatio = (targetFps / 60) * 0.6; // Conservative factor
  const optimalCount = Math.floor(totalCount * reductionRatio);

  return Math.max(optimalCount, 100); // Minimum 100 bubbles
}

/**
 * Format market cap for mobile display
 */
export function formatMobileMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(1)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(1)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(0)}M`;
  }
  return `$${marketCap.toFixed(0)}`;
}

/**
 * Calculate mobile-optimized scales
 * Smaller bubbles for dense mobile display
 */
export function getMobileRadiusScale(
  marketCap: number,
  minCap: number,
  maxCap: number
): number {
  // Square root scaling for market cap
  const normalizedCap = (marketCap - minCap) / (maxCap - minCap);
  const sqrtCap = Math.sqrt(Math.max(normalizedCap, 0));

  // Mobile range: 8-32px (vs desktop 12-48px)
  const minRadius = 8;
  const maxRadius = 32;

  return minRadius + sqrtCap * (maxRadius - minRadius);
}
