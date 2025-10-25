/**
 * Mobile Toggle Component
 * Switch between Naga (clusters) and Cacing (Top 20) modes
 */

import React from 'react';

interface MobileToggleProps {
  mode: 'naga' | 'cacing';
  onModeChange?: (mode: 'naga' | 'cacing') => void;
  isMobile?: boolean;
}

export const MobileToggle: React.FC<MobileToggleProps> = ({
  mode,
  onModeChange,
  isMobile = false,
}) => {
  if (!isMobile) return null;

  return (
    <div
      data-testid="mobile-toggle"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '24px',
        padding: '0.375rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Naga Button */}
      <button
        onClick={() => onModeChange?.('naga')}
        data-testid="toggle-naga"
        aria-pressed={mode === 'naga'}
        style={{
          flex: 1,
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: 'none',
          backgroundColor: mode === 'naga' ? '#1a1a1a' : 'transparent',
          color: mode === 'naga' ? '#fff' : '#666',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 200ms',
          whiteSpace: 'nowrap',
          minWidth: '80px',
        }}
        onMouseEnter={(e) => {
          if (mode !== 'naga') {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'naga') {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
      >
        🐉 Naga
      </button>

      {/* Cacing Button */}
      <button
        onClick={() => onModeChange?.('cacing')}
        data-testid="toggle-cacing"
        aria-pressed={mode === 'cacing'}
        style={{
          flex: 1,
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: 'none',
          backgroundColor: mode === 'cacing' ? '#51cf66' : 'transparent',
          color: mode === 'cacing' ? '#fff' : '#666',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 200ms',
          whiteSpace: 'nowrap',
          minWidth: '80px',
        }}
        onMouseEnter={(e) => {
          if (mode !== 'cacing') {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'cacing') {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
      >
        🪱 Cacing
      </button>
    </div>
  );
};

export default MobileToggle;
