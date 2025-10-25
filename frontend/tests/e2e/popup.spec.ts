/**
 * E2E Tests for Popup Card Interaction
 * Tests: click bubble → popup display, no overflow, close interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Popup Card - User Story 2', () => {
  test.beforeEach(async ({ page }) => {
    // Mock data.json response
    await page.route('**/data.json', async (route) => {
      const mockData = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        dataDelayMinutes: 15,
        dailyStory: 'Market test data',
        groups: [
          {
            groupId: 'G-01',
            groupName: 'Test Group',
            tickers: ['TEST1'],
          },
        ],
        tickers: [
          {
            symbol: 'TEST1',
            name: 'Test Ticker One',
            price: 1234.56,
            changePct: 2.5,
            volume: 5000000,
            marketCap: 50000000000,
            groupId: 'G-01',
            sector: 'Technology',
            spark7: [1200, 1210, 1220, 1230, 1225, 1240, 1235],
          },
          {
            symbol: 'TEST2',
            name: 'Test Ticker Two',
            price: 567.89,
            changePct: -1.2,
            volume: 2000000,
            marketCap: 20000000000,
            groupId: null,
            sector: 'Finance',
          },
        ],
        stats: {
          universeSize: 2,
          volumeAvgWindowDays: 20,
          minMarketCap: 20000000000,
          maxMarketCap: 50000000000,
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('should open popup when clicking a bubble', async ({ page }) => {
    const startTime = performance.now();

    // Click on canvas (approximate center for first bubble)
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    // Measure time to popup appearance
    const popupOpened = page.locator('[data-testid="popup-card"]');
    await expect(popupOpened).toBeVisible({ timeout: 200 });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Should appear within 120ms
    expect(responseTime).toBeLessThan(120);
  });

  test('should display popup with ticker details', async ({ page }) => {
    // Click canvas
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    // Wait for popup
    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Check for required fields
    const symbolField = page.locator('[data-testid="popup-symbol"]');
    const nameField = page.locator('[data-testid="popup-name"]');
    const priceField = page.locator('[data-testid="popup-price"]');
    const changeField = page.locator('[data-testid="popup-change"]');

    await expect(symbolField).toBeVisible();
    await expect(nameField).toBeVisible();
    await expect(priceField).toBeVisible();
    await expect(changeField).toBeVisible();

    // Verify data is populated
    const symbolText = await symbolField.textContent();
    expect(symbolText).toBeTruthy();
  });

  test('should display mini-chart when spark7 data exists', async ({ page }) => {
    // Click on TEST1 (has spark7)
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Check for mini-chart
    const miniChart = page.locator('[data-testid="popup-spark-chart"]');
    await expect(miniChart).toBeVisible();
  });

  test('should show placeholder when spark7 is unavailable', async ({ page }) => {
    // Click on TEST2 (no spark7)
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 500, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Check for placeholder
    const placeholder = page.locator('[data-testid="popup-spark-placeholder"]');
    await expect(placeholder).toBeVisible();
  });

  test('should not overflow screen edges', async ({ page }) => {
    // Set small viewport
    await page.setViewportSize({ width: 500, height: 600 });

    // Click canvas
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 480, y: 580 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Get popup bounding box
    const popupBox = await popup.boundingBox();
    expect(popupBox).toBeTruthy();

    // Verify it doesn't overflow
    if (popupBox) {
      expect(popupBox.x).toBeGreaterThanOrEqual(0);
      expect(popupBox.y).toBeGreaterThanOrEqual(0);
      expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(500);
      expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(600);
    }
  });

  test('should close popup on outside click', async ({ page }) => {
    // Click canvas to open popup
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Click outside popup (on background)
    await page.click('main', { position: { x: 100, y: 100 } });

    // Wait for popup to disappear
    await expect(popup).not.toBeVisible({ timeout: 500 });
  });

  test('should close popup on Escape key', async ({ page }) => {
    // Click canvas to open popup
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait for popup to disappear
    await expect(popup).not.toBeVisible({ timeout: 500 });
  });

  test('should close popup on close button click', async ({ page }) => {
    // Click canvas to open popup
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Click close button
    const closeButton = page.locator('[data-testid="popup-close-btn"]');
    await closeButton.click();

    // Wait for popup to disappear
    await expect(popup).not.toBeVisible({ timeout: 500 });
  });

  test('should trap focus within popup when open', async ({ page }) => {
    // Click canvas to open popup
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Tab through focusable elements (should stay within popup)
    const firstFocusable = popup.locator('button, input, a').first();
    await firstFocusable.focus();

    // Verify active element is within popup
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(activeElement).toContain('popup');
  });

  test('should display all ticker fields correctly', async ({ page }) => {
    // Click canvas
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 300, y: 300 } });

    const popup = page.locator('[data-testid="popup-card"]');
    await expect(popup).toBeVisible({ timeout: 200 });

    // Check all fields
    const fields = {
      name: page.locator('[data-testid="popup-name"]'),
      symbol: page.locator('[data-testid="popup-symbol"]'),
      price: page.locator('[data-testid="popup-price"]'),
      change: page.locator('[data-testid="popup-change"]'),
      volume: page.locator('[data-testid="popup-volume"]'),
      marketCap: page.locator('[data-testid="popup-marketcap"]'),
      sector: page.locator('[data-testid="popup-sector"]'),
    };

    for (const [fieldName, fieldLocator] of Object.entries(fields)) {
      await expect(fieldLocator).toBeVisible();
      const value = await fieldLocator.textContent();
      expect(value?.length).toBeGreaterThan(0);
    }
  });
});
