/**
 * Feedback Button Component
 * Floating button that opens external feedback form
 */

import React from 'react';

interface FeedbackButtonProps {
  formUrl?: string;
}

const DEFAULT_FORM_URL = 'https://forms.gle/nagacacing-feedback';

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  formUrl = DEFAULT_FORM_URL,
}) => {
  const handleClick = () => {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      data-testid="feedback-button"
      aria-label="Send feedback"
      title="Kirim feedback tentang NagaCacing"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 200ms ease',
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f03e3e';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 8px 24px rgba(255, 107, 107, 0.4)';
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#ff6b6b';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 12px rgba(255, 107, 107, 0.3)';
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      💬
    </button>
  );
};

export default FeedbackButton;
