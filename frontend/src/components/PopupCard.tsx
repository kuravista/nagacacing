/**
 * Popup Card Component
 * Displays ticker details (symbol, price, volume, etc.)
 * with optional spark7 mini-chart and focus trap
 */

import React, { useEffect, useRef } from 'react';
import { Ticker } from '../data/schema.js';
import SparkChart from './SparkChart.js';

interface PopupCardProps {
  ticker: Ticker | null;
  position: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  onClose: () => void;
}

export const PopupCard: React.FC<PopupCardProps> = ({
  ticker,
  position,
  viewportWidth,
  viewportHeight,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate position with bounds checking
  const calculatePosition = (): { x: number; y: number } => {
    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 10;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal
    if (x + popupWidth + margin > viewportWidth) {
      x = viewportWidth - popupWidth - margin;
    }
    if (x - margin < 0) {
      x = margin;
    }

    // Adjust vertical
    if (y + popupHeight + margin > viewportHeight) {
      y = viewportHeight - popupHeight - margin;
    }
    if (y - margin < 0) {
      y = margin;
    }

    return { x, y };
  };

  const { x, y } = calculatePosition();

  // Focus trap and keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap: Tab key
      if (e.key === 'Tab' && popupRef.current) {
        const focusableElements = popupRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const activeElement = document.activeElement;

        if (e.shiftKey) {
          // Shift+Tab
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!ticker) {
    return null;
  }

  const changeColor = ticker.changePct >= 0 ? '#51cf66' : '#ff6b6b';
  const changeSign = ticker.changePct >= 0 ? '+' : '';

  return (
    <div
      ref={popupRef}
      data-testid="popup-card"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: '320px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        padding: '1rem',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div
            data-testid="popup-symbol"
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            {ticker.symbol}
          </div>
          <div
            data-testid="popup-name"
            style={{
              fontSize: '0.8125rem',
              color: '#666',
              marginTop: '0.25rem',
            }}
          >
            {ticker.name}
          </div>
        </div>
        <button
          ref={closeButtonRef}
          data-testid="popup-close-btn"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close popup"
        >
          ✕
        </button>
      </div>

      {/* Price & Change */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '1rem',
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          data-testid="popup-price"
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          ${ticker.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </div>
        <div
          data-testid="popup-change"
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: changeColor,
          }}
        >
          {changeSign}{ticker.changePct.toFixed(2)}%
        </div>
      </div>

      {/* Spark Chart */}
      {ticker.spark7 && ticker.spark7.length > 0 ? (
        <div
          data-testid="popup-spark-chart"
          style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
            7-Day Price
          </div>
          <SparkChart data={ticker.spark7} color={changeColor} height={40} />
        </div>
      ) : (
        <div
          data-testid="popup-spark-placeholder"
          style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f0f0f0',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            color: '#ccc',
            fontSize: '0.75rem',
          }}
        >
          No chart data available
        </div>
      )}

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Volume */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
            Volume
          </div>
          <div
            data-testid="popup-volume"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#1a1a1a',
            }}
          >
            {(ticker.volume / 1000000).toFixed(1)}M
          </div>
        </div>

        {/* Market Cap */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
            Market Cap
          </div>
          <div
            data-testid="popup-marketcap"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#1a1a1a',
            }}
          >
            ${(ticker.marketCap / 1000000000).toFixed(1)}B
          </div>
        </div>

        {/* Sector */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
            Sector
          </div>
          <div
            data-testid="popup-sector"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#1a1a1a',
            }}
          >
            {ticker.sector}
          </div>
        </div>

        {/* Group */}
        {ticker.groupId && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
              Group
            </div>
            <div
              data-testid="popup-group"
              style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#1a1a1a',
              }}
            >
              {ticker.groupId}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f0f0f0',
          fontSize: '0.75rem',
          color: '#ccc',
          textAlign: 'center',
        }}
      >
        Press ESC to close
      </div>
    </div>
  );
};

export default PopupCard;
