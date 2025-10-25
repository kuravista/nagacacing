/**
 * Onboarding Modal Component
 * Shows once per user via localStorage
 * Features: Keyboard navigation, focus trap, accessible
 */

import React, { useEffect, useRef, useState } from 'react';

interface OnboardingModalProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const STORAGE_KEY = 'nagacacing_onboarding_shown';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onClose,
  isOpen = true,
}) => {
  const [shouldShow, setShouldShow] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);
    if (hasSeenOnboarding === 'true') {
      setShouldShow(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShouldShow(false);
    onClose?.();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!shouldShow || !modalRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          aria-label="Close onboarding"
          data-testid="onboarding-close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999',
            padding: '0.5rem',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 200ms',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        {/* Content */}
        <h2
          id="onboarding-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            marginTop: 0,
          }}
        >
          🐉 Selamat Datang di NagaCacing!
        </h2>

        <p
          id="onboarding-desc"
          style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '1.5rem',
            lineHeight: '1.6',
          }}
        >
          Platform visualisasi pasar saham Indonesia yang menceritakan kisah
          dinamika "Naga" (Konglomerat Besar) vs "Cacing" (Emiten Independen).
        </p>

        {/* Features */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '1rem',
            }}
          >
            Fitur Utama:
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.75rem',
            }}
          >
            <FeatureItem
              icon="🫧"
              title="Eksplorasi Pasar"
              description="Lihat 900+ saham sebagai bubble chart yang menunjukkan market cap (ukuran), perubahan harian (warna), dan volume (highlight)."
            />
            <FeatureItem
              icon="🔍"
              title="Inspeksi Ticker"
              description="Klik bubble untuk melihat detail: harga, perubahan %, volume, market cap, sektor, dan chart 7 hari."
            />
            <FeatureItem
              icon="🔎"
              title="Cari & Filter"
              description="Cari berdasarkan simbol/nama, filter market cap (Quartile 1-4), atau aktifkan Cacing Hunter untuk menemukan small-cap."
            />
            <FeatureItem
              icon="📸"
              title="Bagikan Snapshot"
              description="Export visualisasi sebagai PNG dengan watermark profesional untuk dibagikan ke media sosial atau laporan."
            />
          </div>
        </div>

        {/* Tips */}
        <div
          style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1a1a1a',
              marginTop: 0,
              marginBottom: '0.5rem',
            }}
          >
            💡 Tips Penggunaan:
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: '0.875rem',
              color: '#666',
              lineHeight: '1.6',
            }}
          >
            <li>Gunakan scroll untuk jelajahi pasar sebelum memilih saham</li>
            <li>Warna hijau = kenaikan, merah = penurunan, abu-abu = stabil</li>
            <li>Bubble besar = market cap tinggi, bubble kecil = market cap rendah</li>
            <li>Keyboard: Escape untuk tutup popup, Tab untuk navigasi</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleClose}
            data-testid="onboarding-get-started"
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              backgroundColor: '#51cf66',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#40c057';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#51cf66';
            }}
          >
            Mulai Eksplorasi
          </button>
          <button
            onClick={handleClose}
            data-testid="onboarding-learn-more"
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f0f0f0',
              color: '#1a1a1a',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#e6e6e6';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
            }}
          >
            Pelajari Lebih Lanjut
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <p
          style={{
            fontSize: '0.75rem',
            color: '#999',
            marginTop: '1rem',
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          Tekan <kbd>Escape</kbd> untuk menutup dialog ini
        </p>
      </div>
    </div>
  );
};

/**
 * Feature Item Component
 */
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
    <div
      style={{
        fontSize: '1.5rem',
        minWidth: '2rem',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontWeight: 600,
          color: '#1a1a1a',
          fontSize: '0.875rem',
          marginBottom: '0.25rem',
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: '#666',
          fontSize: '0.8125rem',
          lineHeight: '1.5',
        }}
      >
        {description}
      </div>
    </div>
  </div>
);

export default OnboardingModal;
