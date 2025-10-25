/**
 * Mock Data for Development
 * Used when backend is not available or data.json is unreachable
 */

import { Data } from './schema.js';

export const MOCK_DATA: Data = {
  version: '1.0.0-mock',
  generatedAt: new Date().toISOString(),
  dataDelayMinutes: 15,
  dailyStory: '🐉 Naga leading today with 2.5% avg gain; 🪱 Cacing mixed sentiment',
  groups: [
    {
      groupId: 'G-BARITO',
      groupName: 'Barito Group',
      tickers: ['ADRO', 'ABMM', 'DSSA'],
    },
    {
      groupId: 'G-BANK',
      groupName: 'Banking Group',
      tickers: ['BBCA', 'BBNI', 'BBKP', 'BRIS'],
    },
    {
      groupId: 'G-MINING',
      groupName: 'Mining Group',
      tickers: ['BUMI', 'INCO', 'PTBA'],
    },
  ],
  tickers: [
    // Banking
    { symbol: 'BBCA', name: 'Bank Central Asia', price: 9250, changePct: 2.1, volume: 2500000, marketCap: 2850000000000, groupId: 'G-BANK', sector: 'Financials', spark7: [9200, 9210, 9220, 9235, 9240, 9250, 9245] },
    { symbol: 'BBNI', name: 'Bank Negara Indonesia', price: 8750, changePct: 1.8, volume: 1800000, marketCap: 2100000000000, groupId: 'G-BANK', sector: 'Financials', spark7: [8700, 8710, 8730, 8740, 8750, 8745, 8750] },
    { symbol: 'BBKP', name: 'Bank Bukopin', price: 850, changePct: -0.5, volume: 500000, marketCap: 85000000000, groupId: 'G-BANK', sector: 'Financials' },
    { symbol: 'BRIS', name: 'Bank Rakyat Indonesia', price: 3850, changePct: 1.5, volume: 3200000, marketCap: 1200000000000, groupId: 'G-BANK', sector: 'Financials' },
    
    // Mining
    { symbol: 'ADRO', name: 'Adaro Energy', price: 2850, changePct: 3.2, volume: 5000000, marketCap: 450000000000, groupId: 'G-BARITO', sector: 'Mining', spark7: [2750, 2780, 2800, 2830, 2840, 2850, 2855] },
    { symbol: 'BUMI', name: 'Bumi Resources', price: 1450, changePct: 2.8, volume: 4200000, marketCap: 380000000000, groupId: 'G-MINING', sector: 'Mining' },
    { symbol: 'INCO', name: 'Vale Indonesia', price: 6850, changePct: 1.9, volume: 2100000, marketCap: 520000000000, groupId: 'G-MINING', sector: 'Mining' },
    { symbol: 'PTBA', name: 'Tambang Batubara Bukit', price: 1850, changePct: 2.1, volume: 1800000, marketCap: 280000000000, groupId: 'G-MINING', sector: 'Mining' },
    
    // Independent (Cacing)
    { symbol: 'UNVR', name: 'Unilever Indonesia', price: 4850, changePct: -0.8, volume: 800000, marketCap: 320000000000, groupId: null, sector: 'Consumer' },
    { symbol: 'ASII', name: 'Astra International', price: 5250, changePct: 1.2, volume: 2200000, marketCap: 410000000000, groupId: null, sector: 'Automotive' },
    { symbol: 'TLKM', name: 'Telekomunikasi Indonesia', price: 3250, changePct: 0.5, volume: 3500000, marketCap: 280000000000, groupId: null, sector: 'Telecom' },
    { symbol: 'PGAS', name: 'Perusahaan Gas Negara', price: 850, changePct: 1.8, volume: 2100000, marketCap: 65000000000, groupId: null, sector: 'Energy' },
    { symbol: 'SMGR', name: 'Semen Indonesia', price: 10250, changePct: -1.2, volume: 950000, marketCap: 850000000000, groupId: null, sector: 'Materials' },
    { symbol: 'MYRX', name: 'Myriad Technology', price: 850, changePct: 5.5, volume: 8500000, marketCap: 75000000000, groupId: null, sector: 'Technology', spark7: [800, 810, 820, 830, 840, 845, 850] },
    
    // More independent stocks for variety
    { symbol: 'INDF', name: 'Indofood Sukses Makmur', price: 7850, changePct: 0.8, volume: 1200000, marketCap: 610000000000, groupId: null, sector: 'Food & Beverage' },
    { symbol: 'ICBP', name: 'Indofood CBP Sukses Makmur', price: 3150, changePct: -0.2, volume: 800000, marketCap: 210000000000, groupId: null, sector: 'Food & Beverage' },
    { symbol: 'JSMR', name: 'Jasa Marga', price: 5950, changePct: 2.2, volume: 1500000, marketCap: 380000000000, groupId: null, sector: 'Infrastructure' },
    { symbol: 'WIKA', name: 'Wijaya Karya', price: 850, changePct: 1.5, volume: 2800000, marketCap: 120000000000, groupId: null, sector: 'Construction' },
  ],
  stats: {
    universeSize: 20,
    volumeAvgWindowDays: 20,
    minMarketCap: 65000000000,
    maxMarketCap: 2850000000000,
  },
};

export function getMockData(): Data {
  return MOCK_DATA;
}
