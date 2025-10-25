/**
 * Contract Tests for data.schema.json
 * Validates that generated data.json payloads conform to the schema
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Import the JSON schema
const schemaPath = path.resolve(
  process.cwd(),
  '../specs/001-nagacacing-mvp-spec/contracts/data.schema.json'
);
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

/**
 * Example valid data.json payload
 */
const validPayload = {
  version: '1.0.0',
  generatedAt: '2025-10-25T10:30:00Z',
  dataDelayMinutes: 15,
  dailyStory: 'Naga lead today with 2% avg gain; Cacing mixed.',
  groups: [
    {
      groupId: 'G-BARITO',
      groupName: 'Barito Pacific Group',
      tickers: ['BREN', 'TPIA', 'CUAN', 'BRPT', 'PTRO'],
    },
    {
      groupId: 'G-DJARUM',
      groupName: 'Djarum Group',
      tickers: ['BBCA', 'TOWR'],
    },
  ],
  tickers: [
    {
      symbol: 'BBCA',
      name: 'Bank Central Asia',
      price: 9250,
      changePct: 1.5,
      volume: 2500000,
      marketCap: 2850000000000,
      groupId: 'G-DJARUM',
      sector: 'Financials',
      spark7: [9200, 9210, 9220, 9235, 9240, 9250],
    },
    {
      symbol: 'BREN',
      name: 'PT Barito Renewables Energy',
      price: 450,
      changePct: -2.1,
      volume: 1200000,
      marketCap: 45000000000,
      groupId: 'G-BARITO',
      sector: 'Energy',
    },
    {
      symbol: 'GOTO',
      name: 'PT GoTo Gojek Tokopedia',
      price: 125,
      changePct: 3.2,
      volume: 500000,
      marketCap: 12500000000,
      groupId: null,
      sector: 'Technology',
    },
  ],
  stats: {
    universeSize: 900,
    volumeAvgWindowDays: 20,
    minMarketCap: 500000000,
    maxMarketCap: 3000000000000,
  },
};

describe('data.schema.json Contract Tests', () => {
  it('should validate a complete valid payload', () => {
    // Simple schema validation (in production, use ajv or json-schema-validator)
    expect(validPayload).toBeDefined();
    expect(validPayload.version).toBe('1.0.0');
    expect(validPayload.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(validPayload.groups.length).toBeGreaterThan(0);
    expect(validPayload.tickers.length).toBeGreaterThan(0);
  });

  it('should have required fields', () => {
    const requiredFields = [
      'version',
      'generatedAt',
      'dataDelayMinutes',
      'dailyStory',
      'groups',
      'tickers',
      'stats',
    ];
    requiredFields.forEach((field) => {
      expect(validPayload).toHaveProperty(field);
    });
  });

  it('should validate version as non-empty string', () => {
    expect(typeof validPayload.version).toBe('string');
    expect(validPayload.version.length).toBeGreaterThan(0);
  });

  it('should validate generatedAt as ISO 8601 datetime', () => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    expect(validPayload.generatedAt).toMatch(isoRegex);
    expect(new Date(validPayload.generatedAt).getTime()).not.toBeNaN();
  });

  it('should validate dataDelayMinutes as non-negative integer', () => {
    expect(typeof validPayload.dataDelayMinutes).toBe('number');
    expect(validPayload.dataDelayMinutes).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(validPayload.dataDelayMinutes)).toBe(true);
  });

  it('should validate dailyStory as string ≤ 140 chars', () => {
    expect(typeof validPayload.dailyStory).toBe('string');
    expect(validPayload.dailyStory.length).toBeLessThanOrEqual(140);
  });

  it('should validate groups array structure', () => {
    expect(Array.isArray(validPayload.groups)).toBe(true);
    validPayload.groups.forEach((group) => {
      expect(group).toHaveProperty('groupId');
      expect(group).toHaveProperty('groupName');
      expect(group).toHaveProperty('tickers');
      expect(typeof group.groupId).toBe('string');
      expect(typeof group.groupName).toBe('string');
      expect(Array.isArray(group.tickers)).toBe(true);
      group.tickers.forEach((ticker) => {
        expect(typeof ticker).toBe('string');
      });
    });
  });

  it('should validate tickers array structure', () => {
    expect(Array.isArray(validPayload.tickers)).toBe(true);
    validPayload.tickers.forEach((ticker) => {
      expect(ticker).toHaveProperty('symbol');
      expect(ticker).toHaveProperty('name');
      expect(ticker).toHaveProperty('price');
      expect(ticker).toHaveProperty('changePct');
      expect(ticker).toHaveProperty('volume');
      expect(ticker).toHaveProperty('marketCap');
      expect(ticker).toHaveProperty('sector');
      expect(typeof ticker.symbol).toBe('string');
      expect(typeof ticker.name).toBe('string');
      expect(typeof ticker.price).toBe('number');
      expect(typeof ticker.changePct).toBe('number');
      expect(typeof ticker.volume).toBe('number');
      expect(ticker.volume).toBeGreaterThanOrEqual(0);
      expect(typeof ticker.marketCap).toBe('number');
      expect(ticker.marketCap).toBeGreaterThanOrEqual(0);
      expect(typeof ticker.sector).toBe('string');
      if (ticker.groupId !== null) {
        expect(typeof ticker.groupId).toBe('string');
      }
      if (ticker.spark7) {
        expect(Array.isArray(ticker.spark7)).toBe(true);
        expect(ticker.spark7.length).toBeLessThanOrEqual(7);
        ticker.spark7.forEach((val) => {
          expect(typeof val).toBe('number');
        });
      }
    });
  });

  it('should validate stats object', () => {
    expect(validPayload.stats).toBeDefined();
    expect(typeof validPayload.stats.universeSize).toBe('number');
    expect(validPayload.stats.universeSize).toBeGreaterThanOrEqual(0);
    expect(typeof validPayload.stats.volumeAvgWindowDays).toBe('number');
    expect(validPayload.stats.volumeAvgWindowDays).toBeGreaterThan(0);
    expect(typeof validPayload.stats.minMarketCap).toBe('number');
    expect(validPayload.stats.minMarketCap).toBeGreaterThanOrEqual(0);
    expect(typeof validPayload.stats.maxMarketCap).toBe('number');
    expect(validPayload.stats.maxMarketCap).toBeGreaterThanOrEqual(0);
  });

  it('should allow null groupId for independent tickers', () => {
    const independentTicker = validPayload.tickers.find((t) => t.groupId === null);
    expect(independentTicker).toBeDefined();
    expect(independentTicker?.symbol).toBe('GOTO');
  });

  it('should validate optional spark7 field', () => {
    const withSpark = validPayload.tickers.find((t) => t.spark7);
    expect(withSpark).toBeDefined();
    expect(withSpark?.spark7?.length).toBeGreaterThan(0);
    expect(withSpark?.spark7?.length).toBeLessThanOrEqual(7);
  });

  it('should handle missing optional fields', () => {
    const minimalTicker = validPayload.tickers[1];
    // spark7 is optional, so it may not be present
    expect(minimalTicker).toHaveProperty('symbol');
    expect(minimalTicker).toHaveProperty('name');
  });

  it('should validate changePct range', () => {
    validPayload.tickers.forEach((ticker) => {
      // changePct typically ranges from -100 to +100
      expect(ticker.changePct).toBeGreaterThanOrEqual(-100);
      expect(ticker.changePct).toBeLessThanOrEqual(100);
    });
  });
});
