/**
 * Version Badge Component
 * Displays data version and generation timestamp
 */

import React from 'react';

interface VersionBadgeProps {
  version: string | null;
  generatedAt: string | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  version,
  generatedAt,
  position = 'top-right',
}) => {
  if (!version || !generatedAt) {
    return null;
  }

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
    },
    'top-right': {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
    },
    'bottom-left': {
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
    },
    'bottom-right': {
      position: 'absolute',
      bottom: '1rem',
      right: '1rem',
    },
  };

  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        ...positionStyles[position],
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '0.5rem 0.75rem',
        fontSize: '0.75rem',
        color: '#666',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        zIndex: 100,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>v{version}</div>
      <div>Generated: {formattedDate}</div>
    </div>
  );
};

export default VersionBadge;
