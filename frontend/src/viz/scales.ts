/**
 * Visualization Scales
 * Radius scale (√marketCap), color scale (changePct -10→0→+10)
 */

/**
 * Scale market cap to radius
 * Uses square root for perceptual linearity
 * Desktop: 10-80px, Mobile: 8-60px
 */
export function radiusScale(
  marketCap: number,
  minCap: number,
  maxCap: number,
  mode: 'desktop' | 'mobile' = 'desktop'
): number {
  const [minRadius, maxRadius] = mode === 'mobile' ? [8, 60] : [10, 80];

  // Normalize market cap to [0, 1] using square root
  const normalized = (Math.sqrt(marketCap) - Math.sqrt(minCap)) / (Math.sqrt(maxCap) - Math.sqrt(minCap));
  const clamped = Math.max(0, Math.min(1, normalized));

  // Interpolate within radius range
  return minRadius + clamped * (maxRadius - minRadius);
}

/**
 * Scale changePct to color (hex)
 * Range: -10% (bright red) → 0% (dark red/dark green) → +10% (bright green)
 * More negative = brighter red, more positive = brighter green
 * NO neutral gray color
 */
export function colorScale(changePct: number, minPct: number, maxPct: number): string {
  // Clamp changePct to range
  const clamped = Math.max(minPct, Math.min(maxPct, changePct));

  // Normalize to [0, 1] where 0.5 = 0% change
  const normalized = (clamped - minPct) / (maxPct - minPct);

  let r, g, b;

  if (normalized < 0.5) {
    // NEGATIVE: Dark red → Bright red
    // More negative (closer to 0) = brighter red
    const intensity = (0.5 - normalized) * 2; // 0 at 0%, 1 at -10%
    r = Math.round(150 + intensity * 105);  // 150 (dark) → 255 (bright)
    g = Math.round(50 + intensity * 0);     // 50 (dark) → 50 (stays dark)
    b = Math.round(50 + intensity * 0);     // 50 (dark) → 50 (stays dark)
  } else {
    // POSITIVE: Dark green → Bright green  
    // More positive (closer to 1) = brighter green
    const intensity = (normalized - 0.5) * 2; // 0 at 0%, 1 at +10%
    r = Math.round(50 + intensity * 0);       // 50 (dark) → 50 (stays dark)
    g = Math.round(150 + intensity * 105);    // 150 (dark) → 255 (bright)
    b = Math.round(50 + intensity * 50);      // 50 (dark) → 100 (slight tint)
  }

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Calculate z-score for volume highlighting
 * z = (value - mean) / stdDev
 */
export function calculateZScore(value: number, values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0; // All values are the same

  return (value - mean) / stdDev;
}

/**
 * Get highlight threshold for z-score
 * Bubbles with z >= threshold get highlight effect
 */
export function getHighlightThreshold(): number {
  return 2; // Active when z >= 2 (top ~2.3% of values)
}

/**
 * Normalize changePct to [0, 1] for color interpolation
 * -10% → 0, 0% → 0.5, +10% → 1
 */
export function normalizeChangePct(changePct: number): number {
  const clamped = Math.max(-10, Math.min(10, changePct));
  return (clamped + 10) / 20; // [-10, 10] → [0, 1]
}

/**
 * Memoized scale functions for performance
 * Caches calculations to avoid recomputation
 */
export class MemoizedScales {
  private radiusCache = new Map<string, number>();
  private colorCache = new Map<string, string>();
  private zScoreCache = new Map<string, number>();

  radiusScale(marketCap: number, minCap: number, maxCap: number, mode: 'desktop' | 'mobile' = 'desktop'): number {
    const key = `${marketCap}_${minCap}_${maxCap}_${mode}`;
    if (this.radiusCache.has(key)) {
      return this.radiusCache.get(key)!;
    }
    const result = radiusScale(marketCap, minCap, maxCap, mode);
    this.radiusCache.set(key, result);
    return result;
  }

  colorScale(changePct: number, minPct: number, maxPct: number): string {
    const key = `${changePct}_${minPct}_${maxPct}`;
    if (this.colorCache.has(key)) {
      return this.colorCache.get(key)!;
    }
    const result = colorScale(changePct, minPct, maxPct);
    this.colorCache.set(key, result);
    return result;
  }

  calculateZScore(value: number, valuesHash: string): number {
    const key = `${value}_${valuesHash}`;
    if (this.zScoreCache.has(key)) {
      return this.zScoreCache.get(key)!;
    }
    // Note: In practice, pass actual values array and implement proper hashing
    return 0;
  }

  clear(): void {
    this.radiusCache.clear();
    this.colorCache.clear();
    this.zScoreCache.clear();
  }
}

export const memoizedScales = new MemoizedScales();
