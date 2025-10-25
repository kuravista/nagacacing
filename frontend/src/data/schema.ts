/**
 * Data Schema - Zod Validation
 * Validates data.json payloads loaded from CDN
 */

import { z } from 'zod';

/**
 * Group schema (Naga)
 */
export const GroupSchema = z.object({
  groupId: z.string().min(1, 'groupId is required'),
  groupName: z.string().min(1, 'groupName is required'),
  tickers: z.array(z.string()).nonempty('tickers array must not be empty'),
});

export type Group = z.infer<typeof GroupSchema>;

/**
 * Ticker schema (Naga member or Cacing)
 */
export const TickerSchema = z.object({
  symbol: z.string().min(1, 'symbol is required'),
  name: z.string().min(1, 'name is required'),
  price: z.number().finite('price must be a finite number'),
  changePct: z.number().min(-100).max(100, 'changePct must be between -100 and 100'),
  volume: z.number().int().min(0, 'volume must be non-negative'),
  marketCap: z.number().int().min(0, 'marketCap must be non-negative'),
  groupId: z.string().nullable().optional(),
  sector: z.string().min(1, 'sector is required'),
  spark7: z.array(z.number()).max(7, 'spark7 must have at most 7 items').optional(),
});

export type Ticker = z.infer<typeof TickerSchema>;

/**
 * Stats schema
 */
export const StatsSchema = z.object({
  universeSize: z.number().int().min(0),
  volumeAvgWindowDays: z.number().int().min(1),
  minMarketCap: z.number().int().min(0),
  maxMarketCap: z.number().int().min(0),
});

export type Stats = z.infer<typeof StatsSchema>;

/**
 * Complete data.json schema
 */
export const DataSchema = z.object({
  version: z.string().min(1, 'version is required'),
  generatedAt: z.string().datetime('generatedAt must be ISO 8601 datetime'),
  dataDelayMinutes: z.number().int().min(0),
  dailyStory: z.string().max(140, 'dailyStory must be ≤ 140 characters'),
  groups: z.array(GroupSchema),
  tickers: z.array(TickerSchema).nonempty('tickers array must not be empty'),
  stats: StatsSchema,
});

export type Data = z.infer<typeof DataSchema>;

/**
 * Validate data payload
 * @param data Unknown data to validate
 * @returns Validated data or throws ZodError
 */
export function validateData(data: unknown): Data {
  return DataSchema.parse(data);
}

/**
 * Safe validate with error details
 * @param data Unknown data to validate
 * @returns { success: true, data } or { success: false, error }
 */
export function validateDataSafe(
  data: unknown
): { success: true; data: Data } | { success: false; error: string } {
  const result = DataSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join('; ');

  return { success: false, error: errors };
}
