/**
 * Snapshot Service
 * Exports canvas visualization to PNG with watermark
 */

/**
 * Watermark text configuration
 */
const WATERMARK_CONFIG = {
  text: 'NagaCacing.com | Visualisasi Naga vs Cacing',
  fontSize: 12,
  fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
  color: '#1a1a1a',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  padding: { x: 12, y: 8 },
  position: 'bottom-right' as const,
  contrast: 21, // Ratio against white background
};

/**
 * Calculate contrast ratio (WCAG formula)
 * https://www.w3.org/WAI/WCAG21/Appendix/general/relative_luminance
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance (WCAG formula)
 */
function getRelativeLuminance(colorHex: string): number {
  const rgb = parseInt(colorHex.slice(1), 16);
  const r = ((rgb >> 16) & 255) / 255;
  const g = ((rgb >> 8) & 255) / 255;
  const b = (rgb & 255) / 255;

  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Export canvas to PNG with watermark
 */
export async function exportCanvasAsPNG(
  canvas: HTMLCanvasElement,
  filename: string = 'nagacacing-snapshot.png'
): Promise<void> {
  const dataUrl = await canvasToPNG(canvas);
  downloadPNG(dataUrl, filename);
}

/**
 * Convert canvas to PNG data URL
 */
export async function canvasToPNG(canvas: HTMLCanvasElement): Promise<string> {
  // Create a new canvas with watermark area
  const watermarkedCanvas = addWatermark(canvas);

  return new Promise((resolve, reject) => {
    try {
      const dataUrl = watermarkedCanvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      reject(new Error(`Failed to convert canvas to PNG: ${error}`));
    }
  });
}

/**
 * Add watermark to canvas
 */
export function addWatermark(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  // Create new canvas with same dimensions
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Draw source canvas
  ctx.drawImage(sourceCanvas, 0, 0);

  // Calculate watermark position
  const { x, y } = calculateWatermarkPosition(
    canvas.width,
    canvas.height,
    WATERMARK_CONFIG
  );

  // Measure text
  ctx.font = `${WATERMARK_CONFIG.fontSize}px ${WATERMARK_CONFIG.fontFamily}`;
  const metrics = ctx.measureText(WATERMARK_CONFIG.text);
  const textWidth = metrics.width;
  const textHeight = WATERMARK_CONFIG.fontSize;

  // Draw watermark background
  const bgX = x - WATERMARK_CONFIG.padding.x;
  const bgY = y - WATERMARK_CONFIG.padding.y;
  const bgWidth = textWidth + WATERMARK_CONFIG.padding.x * 2;
  const bgHeight = textHeight + WATERMARK_CONFIG.padding.y * 2;

  ctx.fillStyle = WATERMARK_CONFIG.backgroundColor;
  ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

  // Draw text
  ctx.fillStyle = WATERMARK_CONFIG.color;
  ctx.font = `${WATERMARK_CONFIG.fontSize}px ${WATERMARK_CONFIG.fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.fillText(WATERMARK_CONFIG.text, x, y);

  return canvas;
}

/**
 * Calculate watermark position
 */
function calculateWatermarkPosition(
  canvasWidth: number,
  canvasHeight: number,
  config: typeof WATERMARK_CONFIG
): { x: number; y: number } {
  const padding = 16;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('Failed to get context');

  ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  const metrics = ctx.measureText(config.text);
  const textWidth = metrics.width;
  const textHeight = config.fontSize;

  let x = padding;
  let y = padding;

  if (config.position === 'bottom-right') {
    x = canvasWidth - textWidth - config.padding.x * 2 - padding;
    y = canvasHeight - textHeight - config.padding.y * 2 - padding;
  }

  return { x: Math.max(padding, x), y: Math.max(padding, y) };
}

/**
 * Download PNG file
 */
export function downloadPNG(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get PNG file size in MB
 */
export function getPNGSizeInMB(dataUrl: string): number {
  // Data URL format: "data:image/png;base64,..."
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;

  const binaryString = atob(base64);
  const bytes = binaryString.length;
  return bytes / (1024 * 1024);
}

/**
 * Validate watermark contrast
 */
export function isWatermarkAccessible(): boolean {
  const contrast = calculateContrastRatio(WATERMARK_CONFIG.color, '#ffffff');
  return contrast >= 4.5; // WCAG AA minimum
}

/**
 * Export canvas with options
 */
export async function exportSnapshot(
  canvas: HTMLCanvasElement,
  options: {
    filename?: string;
    includeWatermark?: boolean;
    format?: 'png' | 'jpeg';
    quality?: number;
  } = {}
): Promise<{
  dataUrl: string;
  sizeInMB: number;
  isAccessible: boolean;
}> {
  const {
    filename = 'nagacacing-snapshot.png',
    includeWatermark = true,
    format = 'png',
    quality = 0.95,
  } = options;

  // Prepare canvas
  let exportCanvas = canvas;
  if (includeWatermark) {
    exportCanvas = addWatermark(canvas);
  }

  // Convert to data URL
  const dataUrl = exportCanvas.toDataURL(`image/${format}`, quality);

  // Calculate metrics
  const sizeInMB = getPNGSizeInMB(dataUrl);
  const isAccessible = isWatermarkAccessible();

  // Validate
  if (sizeInMB > 3) {
    throw new Error(
      `PNG file size (${sizeInMB.toFixed(2)}MB) exceeds 3MB limit`
    );
  }

  if (!isAccessible) {
    throw new Error('Watermark contrast does not meet WCAG AA standards');
  }

  // Download
  downloadPNG(dataUrl, filename);

  return {
    dataUrl,
    sizeInMB,
    isAccessible,
  };
}
