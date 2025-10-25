/**
 * Legend Component
 * Explains visualization colors, sizes, and patterns
 */

import React, { useState } from 'react';

interface LegendProps {
  isOpen?: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isOpen = false }) => {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div
      data-testid="legend"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
        maxWidth: '300px',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        data-testid="legend-toggle"
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        <span>📊 Legenda</span>
        <span style={{ fontSize: '1.25rem' }}>{expanded ? '−' : '+'}</span>
      </button>

      {/* Content */}
      {expanded && (
        <div
          style={{
            padding: '0 1rem 1rem 1rem',
            borderTop: '1px solid #ddd',
            fontSize: '0.8125rem',
            color: '#666',
            lineHeight: '1.6',
          }}
        >
          {/* Size Legend */}
          <div style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
              }}
            >
              Ukuran Bubble
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                }}
              />
              <span>Market Cap Tinggi</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                }}
              />
              <span>Market Cap Rendah</span>
            </div>
          </div>

          {/* Color Legend */}
          <div style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
              }}
            >
              Warna (Perubahan Harian)
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ff6b6b',
                }}
              />
              <span>Merah: Penurunan (-)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                }}
              />
              <span>Abu-abu: Stabil (~0%)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#51cf66',
                }}
              />
              <span>Hijau: Kenaikan (+)</span>
            </div>
          </div>

          {/* Highlight Legend */}
          <div style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
              }}
            >
              Highlight (Volume Z-Score)
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                }}
              />
              <span>Terang: Volume Tinggi (z ≥ 2)</span>
            </div>
          </div>

          {/* Definitions */}
          <div style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Naga:</strong> Konglomerat besar (market cap tinggi)
            </div>
            <div>
              <strong>Cacing:</strong> Emiten independen (market cap rendah)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;
