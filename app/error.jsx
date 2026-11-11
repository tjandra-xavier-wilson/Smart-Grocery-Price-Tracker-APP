'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[Sentinel ErrorBoundary Caught]:', error);
  }, [error]);

  const handleHardReset = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((k) => caches.delete(k));
          });
        }
        window.location.href = '/';
      }
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e2e8f0] via-[#e8eff2] to-[#d6e6e6] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[430px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Terjadi Gangguan Sementara
        </h2>

        <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed max-w-[320px]">
          Aplikasi mendeteksi kendala pada pemuatan halaman atau koneksi sesi. Anda dapat mencoba memuat ulang atau mereset aplikasi.
        </p>

        {error?.message && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-mono text-slate-500 max-w-full overflow-x-auto text-left">
            {error.message}
          </div>
        )}

        <div className="w-full space-y-2 mt-6">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-950/20 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-once" />
            <span>Coba Muat Ulang Halaman</span>
          </button>

          <button
            onClick={handleHardReset}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Reset Cache &amp; Buka Ulang</span>
          </button>
        </div>
      </div>
    </main>
  );
}

