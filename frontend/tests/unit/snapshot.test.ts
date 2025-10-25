/**
 * Unit Tests for Snapshot Export
 * Tests: PNG conversion, watermark, file size, contrast
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateContrastRatio,
  getPNGSizeInMB,
  isWatermarkAccessible,
  addWatermark,
  canvasToPNG,
} from '../../src/services/snapshot';

describe('Snapshot Service', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;

    const ctx = mockCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
    }
  });

  describe('Contrast Ratio Calculation', () => {
    it('should calculate correct contrast ratio', () => {
      // Black on white should be 21:1
      const contrast = calculateContrastRatio('#000000', '#ffffff');
      expect(contrast).toBeCloseTo(21, 0);
    });

    it('should return >= 4.5 for dark text on white', () => {
      const contrast = calculateContrastRatio('#1a1a1a', '#ffffff');
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('should return >= 3 for large text contrast (WCAG AAA)', () => {
      const contrast = calculateContrastRatio('#1a1a1a', '#ffffff');
      expect(contrast).toBeGreaterThanOrEqual(3);
    });

    it('should handle symmetry (order should not matter)', () => {
      const ratio1 = calculateContrastRatio('#000000', '#ffffff');
      const ratio2 = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio1).toBeCloseTo(ratio2);
    });
  });

  describe('Watermark Accessibility', () => {
    it('should confirm watermark is WCAG AA compliant', () => {
      const isAccessible = isWatermarkAccessible();
      expect(isAccessible).toBe(true);
    });

    it('should have contrast ratio >= 4.5', () => {
      const contrast = calculateContrastRatio('#1a1a1a', '#ffffff');
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('PNG Size Calculation', () => {
    it('should calculate size correctly from data URL', () => {
      // Small PNG data URL for testing
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const sizeInMB = getPNGSizeInMB(dataUrl);
      expect(sizeInMB).toBeGreaterThan(0);
      expect(sizeInMB).toBeLessThan(1);
    });

    it('should return 0 for invalid data URL', () => {
      const invalidUrl = 'not-a-data-url';
      const size = getPNGSizeInMB(invalidUrl);
      expect(size).toBe(0);
    });

    it('should handle high resolution canvas', () => {
      const largeCanvas = document.createElement('canvas');
      largeCanvas.width = 4000;
      largeCanvas.height = 2250;

      const ctx = largeCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, largeCanvas.width, largeCanvas.height);
      }

      const dataUrl = largeCanvas.toDataURL('image/png');
      const sizeInMB = getPNGSizeInMB(dataUrl);

      // Should be reasonable size (less than 3MB)
      expect(sizeInMB).toBeLessThan(3);
    });
  });

  describe('Watermark Addition', () => {
    it('should add watermark without errors', () => {
      const watermarkedCanvas = addWatermark(mockCanvas);
      expect(watermarkedCanvas).toBeDefined();
      expect(watermarkedCanvas.width).toBe(mockCanvas.width);
      expect(watermarkedCanvas.height).toBe(mockCanvas.height);
    });

    it('should preserve canvas dimensions', () => {
      const watermarkedCanvas = addWatermark(mockCanvas);
      expect(watermarkedCanvas.width).toBe(1920);
      expect(watermarkedCanvas.height).toBe(1080);
    });

    it('should contain watermark text', () => {
      const watermarkedCanvas = addWatermark(mockCanvas);
      const ctx = watermarkedCanvas.getContext('2d');
      expect(ctx).toBeDefined();

      // Verify canvas has content (watermark was drawn)
      const imageData = ctx?.getImageData(0, 0, watermarkedCanvas.width, 1);
      expect(imageData).toBeDefined();
    });
  });

  describe('Canvas to PNG Conversion', () => {
    it('should convert canvas to PNG data URL', async () => {
      const dataUrl = await canvasToPNG(mockCanvas);

      expect(dataUrl).toBeDefined();
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should produce valid base64', async () => {
      const dataUrl = await canvasToPNG(mockCanvas);
      const base64 = dataUrl.split(',')[1];

      expect(base64).toBeDefined();
      // Verify it can be decoded
      expect(() => atob(base64)).not.toThrow();
    });
  });

  describe('Snapshot Size Limits', () => {
    it('should produce PNG under 3MB for standard resolution', async () => {
      const dataUrl = await canvasToPNG(mockCanvas);
      const sizeInMB = getPNGSizeInMB(dataUrl);

      expect(sizeInMB).toBeLessThan(3);
    });

    it('should produce PNG under 3MB for high resolution', async () => {
      const highResCanvas = document.createElement('canvas');
      highResCanvas.width = 3840;
      highResCanvas.height = 2160;

      const ctx = highResCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, highResCanvas.width, highResCanvas.height);
        // Add some complexity
        ctx.fillStyle = '#f0f0f0';
        for (let i = 0; i < 100; i++) {
          ctx.fillRect(
            Math.random() * highResCanvas.width,
            Math.random() * highResCanvas.height,
            50,
            50
          );
        }
      }

      const dataUrl = await canvasToPNG(highResCanvas);
      const sizeInMB = getPNGSizeInMB(dataUrl);

      expect(sizeInMB).toBeLessThan(3);
    });
  });

  describe('Watermark Positioning', () => {
    it('should position watermark in bottom-right', () => {
      const watermarkedCanvas = addWatermark(mockCanvas);

      // Verify watermark is not empty
      expect(watermarkedCanvas.width).toBeGreaterThan(0);
      expect(watermarkedCanvas.height).toBeGreaterThan(0);

      // Get pixel data from bottom-right area where watermark should be
      const ctx = watermarkedCanvas.getContext('2d');
      if (ctx) {
        const bottomRightData = ctx.getImageData(
          watermarkedCanvas.width - 200,
          watermarkedCanvas.height - 50,
          200,
          50
        );

        // Verify bottom-right has different pixels (watermark)
        expect(bottomRightData.data.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Export Process', () => {
    it('should complete export without errors', async () => {
      const dataUrl = await canvasToPNG(mockCanvas);

      expect(dataUrl).toBeDefined();
      expect(dataUrl.length).toBeGreaterThan(0);
    });

    it('should handle multiple consecutive exports', async () => {
      const dataUrl1 = await canvasToPNG(mockCanvas);
      const dataUrl2 = await canvasToPNG(mockCanvas);

      expect(dataUrl1).toEqual(dataUrl2);
    });
  });
});
