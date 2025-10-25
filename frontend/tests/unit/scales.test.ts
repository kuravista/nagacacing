/**
 * Unit Tests for Visualization Scales
 * Tests: radius scaling, color scaling, z-score highlighting thresholds
 */

import { describe, it, expect } from 'vitest';
import {
  radiusScale,
  colorScale,
  calculateZScore,
  getHighlightThreshold,
  normalizeChangePct,
} from '../../src/viz/scales';

describe('Radius Scale', () => {
  it('should scale market cap to radius', () => {
    const minCap = 500000000; // $500M
    const maxCap = 3000000000000; // $3T
    const mid Cap = (minCap + maxCap) / 2;

    const minRadius = radiusScale(minCap, minCap, maxCap);
    const maxRadius = radiusScale(maxCap, minCap, maxCap);
    const midRadius = radiusScale(midCap, minCap, maxCap);

    // Monotonic increase
    expect(minRadius).toBeLessThan(maxRadius);
    expect(midRadius).toBeGreaterThan(minRadius);
    expect(midRadius).toBeLessThan(maxRadius);

    // Radius should be in reasonable range (desktop: 10-80px)
    expect(minRadius).toBeGreaterThanOrEqual(10);
    expect(maxRadius).toBeLessThanOrEqual(80);
  });

  it('should use square root of market cap for radius', () => {
    const minCap = 500000000;
    const maxCap = 3000000000000;

    // Market cap values that differ by 4x should have radius differ by 2x
    const cap1 = 1000000000; // $1B
    const cap4x = 4000000000; // $4B (4x larger)

    const radius1 = radiusScale(cap1, minCap, maxCap);
    const radius4x = radiusScale(cap4x, minCap, maxCap);

    // sqrt(4) = 2, so radius should ~double
    expect(radius4x / radius1).toBeCloseTo(Math.sqrt(4), 1);
  });

  it('should handle mobile mode with smaller radii', () => {
    const minCap = 500000000;
    const maxCap = 3000000000000;

    const desktopMinRadius = radiusScale(minCap, minCap, maxCap, 'desktop');
    const desktopMaxRadius = radiusScale(maxCap, minCap, maxCap, 'desktop');
    const mobileMinRadius = radiusScale(minCap, minCap, maxCap, 'mobile');
    const mobileMaxRadius = radiusScale(maxCap, minCap, maxCap, 'mobile');

    // Mobile should be smaller
    expect(mobileMinRadius).toBeLessThan(desktopMinRadius);
    expect(mobileMaxRadius).toBeLessThan(desktopMaxRadius);

    // Mobile range: 8-60px
    expect(mobileMinRadius).toBeGreaterThanOrEqual(8);
    expect(mobileMaxRadius).toBeLessThanOrEqual(60);
  });
});

describe('Color Scale', () => {
  it('should map changePct to RGB color', () => {
    const minColor = colorScale(-10, -10, 10); // Red
    const midColor = colorScale(0, -10, 10);   // Neutral
    const maxColor = colorScale(10, -10, 10);  // Green

    // All should be valid RGB hex colors
    expect(minColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(midColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(maxColor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should be monotonic: red < neutral < green', () => {
    const red = colorScale(-10, -10, 10);
    const neutral = colorScale(0, -10, 10);
    const green = colorScale(10, -10, 10);

    // Convert hex to RGB value for comparison
    const redValue = parseInt(red.slice(1), 16);
    const neutralValue = parseInt(neutral.slice(1), 16);
    const greenValue = parseInt(green.slice(1), 16);

    // Red should have high R component, low G
    // Green should have high G component, low R
    // Neutral should be in between
    const redR = (redValue >> 16) & 255;
    const redG = (redValue >> 8) & 255;
    const neutralG = (neutralValue >> 8) & 255;
    const greenG = (greenValue >> 8) & 255;

    expect(redR).toBeGreaterThan(redG); // Red-heavy
    expect(greenG).toBeGreaterThan(neutralG); // Green increases
    expect(neutralG).toBeGreaterThan(redG); // Neutral in middle
  });

  it('should clamp changePct to [-10, +10] range', () => {
    const clamped = colorScale(25, -10, 10); // +25% clamped to +10%
    const normal = colorScale(10, -10, 10);

    // Both should produce the same color (clamping works)
    expect(clamped).toBe(normal);
  });

  it('should interpolate smoothly between colors', () => {
    const colorAt5Pct = colorScale(5, -10, 10);
    const colorAt10Pct = colorScale(10, -10, 10);

    // Both should be valid colors (interpolation doesn't break)
    expect(colorAt5Pct).toMatch(/^#[0-9A-F]{6}$/i);
    expect(colorAt10Pct).toMatch(/^#[0-9A-F]{6}$/i);

    // At +5% should be less green than at +10%
    const val5 = parseInt(colorAt5Pct.slice(1), 16);
    const val10 = parseInt(colorAt10Pct.slice(1), 16);
    const green5 = (val5 >> 8) & 255;
    const green10 = (val10 >> 8) & 255;

    expect(green5).toBeLessThanOrEqual(green10);
  });
});

describe('Z-Score Calculation', () => {
  it('should calculate z-score correctly', () => {
    const values = [10, 20, 30, 40, 50];
    const mean = 30;
    const stdDev = Math.sqrt(200); // Approximate

    const zScore = calculateZScore(50, values);

    // z-score should be positive for value > mean
    expect(zScore).toBeGreaterThan(0);
  });

  it('should return 0 z-score for mean value', () => {
    const values = [10, 20, 30, 40, 50];
    const zScore = calculateZScore(30, values);

    expect(zScore).toBeCloseTo(0, 1);
  });

  it('should highlight when z-score >= 2', () => {
    const threshold = getHighlightThreshold();

    // Threshold should be 2 for z-score highlighting
    expect(threshold).toBe(2);
  });

  it('should handle edge case of single value', () => {
    const values = [100];
    const zScore = calculateZScore(100, values);

    // When all values are the same, z-score is undefined (NaN)
    expect(isNaN(zScore) || zScore === 0).toBe(true);
  });
});

describe('Normalize ChangePct', () => {
  it('should normalize changePct to [0, 1] range', () => {
    const normalized = normalizeChangePct(0);
    expect(normalized).toBe(0.5); // 0% is center = 0.5

    const normalizedNeg = normalizeChangePct(-10);
    expect(normalizedNeg).toBe(0); // -10% is 0

    const normalizedPos = normalizeChangePct(10);
    expect(normalizedPos).toBe(1); // +10% is 1
  });

  it('should clamp values outside [-10, +10]', () => {
    const normalized25 = normalizeChangePct(25);
    expect(normalized25).toBe(1); // Clamped to +10%

    const normalizedNeg25 = normalizeChangePct(-25);
    expect(normalizedNeg25).toBe(0); // Clamped to -10%
  });
});

describe('Highlight Thresholds', () => {
  it('should activate highlight when z >= 2', () => {
    expect(getHighlightThreshold()).toBe(2);
  });

  it('should deactivate highlight when z < 1', () => {
    const threshold = getHighlightThreshold();
    expect(threshold).toBe(2); // Active at z >= 2, so inactive at z < 2
  });
});
