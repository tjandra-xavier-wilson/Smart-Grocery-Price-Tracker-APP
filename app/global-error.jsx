'use client';

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[Sentinel GlobalError Caught]:', error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px 24px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Smart Grocery Sentinel</h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            Aplikasi mendeteksi kendala inisialisasi awal. Tekan tombol di bawah untuk memuat ulang sistem.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.clear();
                window.location.reload();
              }
            }}
            style={{ width: '100%', padding: '12px 20px', borderRadius: '9999px', background: '#065F46', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}

