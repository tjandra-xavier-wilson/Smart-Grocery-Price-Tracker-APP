'use client';

import React, { useState, useEffect } from 'react';

export default function TopStatusBar() {
  const [wibTime, setWibTime] = useState('09:41');

  useEffect(() => {
    // Fungsi untuk mendapatkan format waktu 24 jam (HH:mm) WIB (Asia/Jakarta)
    const getWIBTime = () => {
      try {
        return new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wib = new Date(utc + (3600000 * 7));
        const hh = String(wib.getHours()).padStart(2, '0');
        const mm = String(wib.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
    };

    setWibTime(getWIBTime());
    const timer = setInterval(() => {
      setWibTime(getWIBTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-5 pt-2 pb-0.5 flex items-center justify-between text-xs text-slate-800 font-semibold select-none bg-transparent relative z-10">
      {/* 1. Jam Digital Dinamis Real-Time (WIB / Asia/Jakarta) */}
      <div className="flex items-center min-w-[56px] text-left">
        <span 
          className="font-black tracking-tight tabular-nums text-[12px] text-slate-900"
          title="Waktu Indonesia Barat (WIB) Real-time"
        >
          {wibTime}
        </span>
      </div>

      {/* 2. Sleek Center Dynamic Island Capsule */}
      <div className="w-16 h-3.5 bg-slate-800/10 rounded-full flex items-center justify-center">
        <span className="w-2 h-2 bg-slate-700/60 rounded-full" />
      </div>

      {/* 3. Indikator Sinyal di Sudut Kanan (Ikon Baterai Telah Dihapus) */}
      <div className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-bold min-w-[56px] justify-end">
        <span>5G</span>
        <span className="text-[8px] tracking-widest text-slate-500">●●●</span>
      </div>
    </div>
  );
}

