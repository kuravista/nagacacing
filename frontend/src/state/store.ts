/**
 * Application State Management - Zustand Store
 * Centralized state for data, UI, and user interactions
 */

import { create } from 'zustand';
import { Data } from '../data/schema.js';

export interface AppState {
  // Data state
  data: Data | null;
  isLoading: boolean;
  error: string | null;
  dataVersion: string | null;
  dataGeneratedAt: string | null;

  // UI state
  isMobileMode: boolean;
  showOnboarding: boolean;
  selectedTickerSymbol: string | null;

  // Filter state
  searchQuery: string;
  marketCapFilter: {
    min: number;
    max: number;
  };
  showCacingHunterMode: boolean;

  // Actions
  setData: (data: Data | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsMobileMode: (isMobile: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setSelectedTicker: (symbol: string | null) => void;
  setSearchQuery: (query: string) => void;
  setMarketCapFilter: (min: number, max: number) => void;
  setCacingHunterMode: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  data: null,
  isLoading: true,
  error: null,
  dataVersion: null,
  dataGeneratedAt: null,
  isMobileMode: false,
  showOnboarding: true,
  selectedTickerSymbol: null,
  searchQuery: '',
  marketCapFilter: {
    min: 0,
    max: 100,
  },
  showCacingHunterMode: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setData: (data) =>
    set({
      data,
      dataVersion: data?.version || null,
      dataGeneratedAt: data?.generatedAt || null,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setIsMobileMode: (isMobileMode) => set({ isMobileMode }),

  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),

  setSelectedTicker: (selectedTickerSymbol) => set({ selectedTickerSymbol }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setMarketCapFilter: (min, max) =>
    set({
      marketCapFilter: { min, max },
    }),

  setCacingHunterMode: (showCacingHunterMode) => set({ showCacingHunterMode }),

  reset: () => set(initialState),
}));

/**
 * Selector hooks for optimized component rendering
 */

export const useDataState = () =>
  useAppStore((state) => ({
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  }));

export const useUIState = () =>
  useAppStore((state) => ({
    isMobileMode: state.isMobileMode,
    showOnboarding: state.showOnboarding,
    selectedTickerSymbol: state.selectedTickerSymbol,
  }));

export const useFilterState = () =>
  useAppStore((state) => ({
    searchQuery: state.searchQuery,
    marketCapFilter: state.marketCapFilter,
    showCacingHunterMode: state.showCacingHunterMode,
  }));

export const useVersionInfo = () =>
  useAppStore((state) => ({
    version: state.dataVersion,
    generatedAt: state.dataGeneratedAt,
  }));
