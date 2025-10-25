/**
 * Controls Component
 * Search input, market cap slider, and Cacing Hunter mode toggle
 */

import React, { useCallback, useMemo } from 'react';
import { useFilterState } from '../state/store.js';
import { debounce } from '../utils/search.js';

interface ControlsProps {
  onSearchChange?: (query: string) => void;
  onSliderChange?: (min: number, max: number) => void;
  onModeChange?: (hunting: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onSearchChange,
  onSliderChange,
  onModeChange,
}) => {
  const { searchQuery, marketCapFilter, showCacingHunterMode } = useFilterState();
  const { setSearchQuery, setMarketCapFilter, setCacingHunterMode } = useFilterState();

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        onSearchChange?.(value);
      }, 150),
    [setSearchQuery, onSearchChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMarketCapFilter(value, 100);
    onSliderChange?.(value, 100);
  };

  const handleHunterModeToggle = () => {
    setCacingHunterMode(!showCacingHunterMode);
    onModeChange?.(!showCacingHunterMode);
  };

  const handleReset = () => {
    setSearchQuery('');
    setMarketCapFilter(0, 100);
    setCacingHunterMode(false);
    onSearchChange?.('');
    onSliderChange?.(0, 100);
  };

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}
    >
      {/* Search Input */}
      <div style={{ flex: '1', minWidth: '200px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
          Search
        </label>
        <input
          type="text"
          placeholder="Symbol or name..."
          onChange={handleSearchChange}
          defaultValue={searchQuery}
          data-testid="search-input"
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.875rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Market Cap Slider */}
      <div style={{ flex: '1', minWidth: '150px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
          Market Cap: Q{Math.ceil(marketCapFilter.min / 25) || 1}–Q4
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="25"
          value={marketCapFilter.min}
          onChange={handleSliderChange}
          data-testid="slider-input"
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Cacing Hunter Mode */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={handleHunterModeToggle}
          data-testid="hunter-mode-btn"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: showCacingHunterMode ? '#51cf66' : '#f0f0f0',
            color: showCacingHunterMode ? '#fff' : '#1a1a1a',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 200ms',
          }}
          title="Highlight small-cap stocks (≤Q2)"
        >
          🪱 Cacing Hunter
        </button>
      </div>

      {/* Reset Button */}
      <div>
        <button
          onClick={handleReset}
          data-testid="reset-btn"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 200ms',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Controls;
