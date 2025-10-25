/**
 * E2E Tests for Bubble Visualization
 * Tests: data loading, bubble rendering, version badge display
 */

import { test, expect } from '@playwright/test';

test.describe('Bubble Visualization - User Story 1', () => {
  test.beforeEach(async ({ page }) => {
    // Mock data.json response
    await page.route('**/data.json', async (route) => {
      await route.abort('blockedbyresponse');
    });

    // Provide mock data via intercept
    await page.route('**/data.json', async (route) => {
      const mockData = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        dataDelayMinutes: 15,
        dailyStory: 'Naga lead today with 2% avg gain; Cacing mixed.',
        groups: generateMockGroups(10), // 10 groups
        tickers: generateMockTickers(950), // 950 independent + 50 in groups = 1000 total
        stats: {
          universeSize: 1000,
          volumeAvgWindowDays: 20,
          minMarketCap: 500000000,
          maxMarketCap: 3000000000000,
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  });

  test('should load data and render >= 900 bubbles', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for data to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Check that data loaded (success state visible)
    const successState = page.locator('text=Data Loaded Successfully');
    await expect(successState).toBeVisible({ timeout: 5000 });

    // Verify ticker count >= 900
    const tickerCountText = page.locator('text=/Total Tickers:/');
    const tickerCountLine = await tickerCountText.evaluate((el) => el.textContent);
    const tickerCount = parseInt(tickerCountLine?.split(':')[1] || '0');
    expect(tickerCount).toBeGreaterThanOrEqual(900);
  });

  test('should display version badge with data metadata', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for footer with version info
    const versionBadge = page.locator('text=/v\\d+\\.\\d+\\.\\d+/');
    await expect(versionBadge).toBeVisible({ timeout: 5000 });

    // Verify version format (semver)
    const versionText = await versionBadge.textContent();
    expect(versionText).toMatch(/v\d+\.\d+\.\d+/);

    // Verify generatedAt timestamp
    const timestampText = page.locator('text=/Generated:/');
    await expect(timestampText).toBeVisible();
  });

  test('should render visualization canvas', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for canvas element to be present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify canvas has dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width).toBeGreaterThan(0);
    expect(canvasBox?.height).toBeGreaterThan(0);
  });

  test('should handle mobile mode responsively', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:5173');

    // Wait for data to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Verify mobile mode is detected
    const mobileIndicator = page.locator('text=Mobile Optimized');
    await expect(mobileIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should display version info in multiple locations', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for content
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Check footer version
    const footerVersion = page.locator('footer text=/v\\d+\\.\\d+\\.\\d+/');
    await expect(footerVersion).toBeVisible({ timeout: 5000 });

    // Verify data shows groups and tickers
    const dataInfo = page.locator('text=/Total Tickers|Groups|Daily Story/');
    const infoCount = await dataInfo.count();
    expect(infoCount).toBeGreaterThan(0);
  });
});

/**
 * Generate mock groups for testing
 */
function generateMockGroups(count: number) {
  const groups = [];
  for (let i = 0; i < count; i++) {
    groups.push({
      groupId: `G-${String(i + 1).padStart(2, '0')}`,
      groupName: `Group ${i + 1}`,
      tickers: [`SYM${i}A`, `SYM${i}B`, `SYM${i}C`, `SYM${i}D`, `SYM${i}E`],
    });
  }
  return groups;
}

/**
 * Generate mock tickers for testing
 */
function generateMockTickers(count: number) {
  const tickers = [];
  for (let i = 0; i < count; i++) {
    const changePct = (Math.random() - 0.5) * 20; // -10% to +10%
    const marketCap = Math.floor(Math.random() * 2900000000000) + 500000000;
    const volume = Math.floor(Math.random() * 5000000);

    tickers.push({
      symbol: `TICK${String(i).padStart(4, '0')}`,
      name: `Ticker ${i}`,
      price: Math.random() * 10000,
      changePct,
      volume,
      marketCap,
      groupId: i < 50 ? `G-${String((i % 10) + 1).padStart(2, '0')}` : null,
      sector: ['Tech', 'Finance', 'Energy', 'Consumer', 'Industrial'][i % 5],
      spark7: Array.from({ length: 7 }, () => Math.random() * 100),
    });
  }
  return tickers;
}
