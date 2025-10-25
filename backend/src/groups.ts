/**
 * Groups Loader and Normalizer
 * Loads group_konglo.json and normalizes it into the internal format
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { logger } from './logger.js';

/**
 * Source format from group_konglo.json
 */
const SourceGroupSchema = z.object({
  idgroup: z.number().min(1),
  name: z.string(),
  tickers: z.array(z.string()),
  sectors: z.array(z.string()).optional(),
  keyPeople: z.string().optional(),
});

export type SourceGroup = z.infer<typeof SourceGroupSchema>;

/**
 * Normalized format for internal use
 */
const NormalizedGroupSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  tickers: z.array(z.string()),
  sectors: z.array(z.string()).optional(),
  keyPeople: z.string().optional(),
});

export type NormalizedGroup = z.infer<typeof NormalizedGroupSchema>;

/**
 * Load groups from source file
 * @returns Array of normalized groups
 * @throws If file not found or validation fails
 */
export function loadGroups(): NormalizedGroup[] {
  try {
    const docsPath = path.resolve(process.cwd(), '../docs/group_konglo.json');
    const raw = fs.readFileSync(docsPath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Expected array of groups');
    }

    const normalized = parsed.map((group: unknown) => {
      const validated = SourceGroupSchema.parse(group);
      return {
        groupId: `G-${validated.idgroup.toString().padStart(2, '0')}`,
        groupName: validated.name,
        tickers: validated.tickers,
        sectors: validated.sectors,
        keyPeople: validated.keyPeople,
      } as NormalizedGroup;
    });

    logger.info(`Loaded ${normalized.length} groups from group_konglo.json`);
    return normalized;
  } catch (error) {
    logger.error('Failed to load groups', { error });
    throw error;
  }
}

/**
 * Build a mapping of ticker → groupId for quick lookup
 * @param groups Normalized groups array
 * @returns Map of ticker symbol → groupId
 */
export function buildTickerToGroupMap(
  groups: NormalizedGroup[]
): Map<string, string> {
  const map = new Map<string, string>();

  groups.forEach((group) => {
    group.tickers.forEach((ticker) => {
      map.set(ticker.toUpperCase(), group.groupId);
    });
  });

  logger.debug(`Built ticker-to-group map with ${map.size} entries`);
  return map;
}

/**
 * Validate that all tickers in a dataset match against known groups
 * @param tickers Array of ticker symbols
 * @param groups Normalized groups array
 * @returns Object with validation results and stats
 */
export function validateTickersAgainstGroups(
  tickers: string[],
  groups: NormalizedGroup[]
): {
  valid: boolean;
  total: number;
  matched: number;
  unmatched: string[];
} {
  const tickerSet = new Set(tickers.map((t) => t.toUpperCase()));
  const groupedTickerSet = new Set<string>();

  groups.forEach((group) => {
    group.tickers.forEach((ticker) => {
      groupedTickerSet.add(ticker.toUpperCase());
    });
  });

  const unmatched = Array.from(tickerSet).filter((t) => !groupedTickerSet.has(t));

  const result = {
    valid: unmatched.length === 0,
    total: tickerSet.size,
    matched: tickerSet.size - unmatched.length,
    unmatched,
  };

  logger.info(
    `Ticker validation: ${result.matched}/${result.total} matched; ` +
      `${result.unmatched.length} independent (Cacing)`
  );

  return result;
}

/**
 * Export groups in data.json format
 * @param groups Normalized groups array
 * @returns Array of groups formatted for data.json
 */
export function formatGroupsForDataJson(
  groups: NormalizedGroup[]
): Array<{
  groupId: string;
  groupName: string;
  tickers: string[];
}> {
  return groups.map((group) => ({
    groupId: group.groupId,
    groupName: group.groupName,
    tickers: group.tickers,
  }));
}
