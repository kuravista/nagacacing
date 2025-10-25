/**
 * Footer Disclaimer Component
 * Important legal and informational notices
 */

import React, { useState } from 'react';

interface FooterDisclaimerProps {
  compactMode?: boolean;
}

export const FooterDisclaimer: React.FC<FooterDisclaimerProps> = ({
  compactMode = false,
}) => {
  const [expanded, setExpanded] = useState(!compactMode);

  if (compactMode) {
    return (
      <footer
        data-testid="footer-disclaimer"
        style={{
          backgroundColor: '#f9f9f9',
          borderTop: '1px solid #ddd',
          padding: '0.75rem 1rem',
          fontSize: '0.75rem',
          color: '#999',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0 }}>
          <span>
            NagaCacing adalah platform visualisasi data pasar saham Indonesia.
          </span>
          {' '}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1a1a1a',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              font: 'inherit',
            }}
          >
            Baca disclaimer lengkap
          </button>
        </p>
      </footer>
    );
  }

  return (
    <footer
      data-testid="footer-disclaimer"
      style={{
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #ddd',
        padding: '2rem 1rem',
        fontSize: '0.8125rem',
        color: '#666',
        lineHeight: '1.7',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1a1a1a',
            marginTop: 0,
            marginBottom: '1rem',
          }}
        >
          ⚖️ Disclaimer & Informasi Penting
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Section 1 */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                marginTop: 0,
                marginBottom: '0.5rem',
              }}
            >
              📋 Tujuan Platform
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              NagaCacing adalah alat visualisasi data pasar saham Indonesia yang dirancang
              untuk edukasi dan eksplorasi tren pasar. Platform ini menampilkan dinamika
              antara Naga (konglomerat besar) dan Cacing (emiten independen).
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                marginTop: 0,
                marginBottom: '0.5rem',
              }}
            >
              ⚠️ Tidak Ada Saran Investasi
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              Konten di NagaCacing BUKAN merupakan saran investasi, rekomendasi jual/beli,
              atau jaminan keuntungan. Semua data adalah untuk tujuan informasional saja.
              Konsultasikan dengan profesional keuangan sebelum mengambil keputusan investasi.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                marginTop: 0,
                marginBottom: '0.5rem',
              }}
            >
              📊 Sumber Data
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              Data harga dan volume bersumber dari Yahoo Finance dan diperbarui secara berkala.
              Data historis mungkin tertinggal. Verifikasi data penting dengan sumber resmi
              seperti IDX atau bursa lokal.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                marginTop: 0,
                marginBottom: '0.5rem',
              }}
            >
              🔒 Privasi & Keamanan
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              NagaCacing tidak mengumpulkan data pribadi Anda. Semua pemrosesan terjadi
              di browser Anda. Kami tidak melacak aktivitas pengguna. Feedback dikirim
              melalui form eksternal.
            </p>
          </div>
        </div>

        {/* Full Disclaimer */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#1a1a1a',
              marginTop: 0,
              marginBottom: '0.75rem',
            }}
          >
            Syarat & Ketentuan Lengkap
          </h4>
          <ul style={{ fontSize: '0.8rem', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>
              Tanggung jawab: Kami tidak bertanggung jawab atas kerugian finansial atau
              keputusan investasi berdasarkan data di platform ini.
            </li>
            <li>
              Akurasi: Meskipun kami berusaha menyediakan data akurat, tidak ada jaminan
              kelengkapan atau keakuratan.
            </li>
            <li>
              Perubahan: Platform dapat berubah atau dihentikan tanpa pemberitahuan.
            </li>
            <li>
              Compliance: Pengguna bertanggung jawab mematuhi hukum lokal dan peraturan investasi.
            </li>
            <li>
              Riset: Lakukan riset mendalam sebelum membuat keputusan investasi.
            </li>
          </ul>
        </div>

        {/* Footer Info */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #ddd',
            fontSize: '0.75rem',
            color: '#999',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0 }}>
            © 2025 NagaCacing. Visualisasi Naga vs Cacing. Dibuat dengan ❤️ untuk investor Indonesia.
          </p>
          <p style={{ margin: 0, marginTop: '0.5rem' }}>
            <a
              href="https://github.com/nagacacing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1a1a1a',
                textDecoration: 'none',
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              GitHub
            </a>
            {' | '}
            <a
              href="mailto:feedback@nagacacing.com"
              style={{
                color: '#1a1a1a',
                textDecoration: 'none',
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              Email
            </a>
            {' | '}
            <a
              href="https://nagacacing.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1a1a1a',
                textDecoration: 'none',
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterDisclaimer;
