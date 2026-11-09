'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

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
        // Fallback jika environment tertentu tidak mendukung opsi timeZone
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wib = new Date(utc + (3600000 * 7));
        const hh = String(wib.getHours()).padStart(2, '0');
        const mm = String(wib.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
    };

    // Update segera saat mount
    setWibTime(getWIBTime());

    // Interval sinkronisasi waktu real-time setiap detik
    const timer = setInterval(() => {
      setWibTime(getWIBTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white px-5 pt-2.5 pb-1 flex items-center justify-between text-xs text-slate-800 font-semibold shrink-0 select-none border-b border-slate-100 relative">
      {/* 1. Jam Digital Dinamis Real-Time (WIB / Asia/Jakarta) */}
      <div className="flex items-center min-w-[56px] text-left">
        <span 
          className="font-black tracking-tight tabular-nums text-[12px] text-slate-900"
          title="Waktu Indonesia Barat (WIB) Real-time"
        >
          {wibTime}
        </span>
      </div>

      {/* 2. Animasi Visual Estetis: Troli Melaju Cepat Menembus Angin di Tengah Header */}
      <div 
        className="flex flex-col items-center justify-center relative px-2 py-0.5 overflow-hidden group cursor-default"
        title="SakuGrosir Express Engine: Troli Cepat & Hemat"
      >
        {/* CSS Keyframes Khusus Animasi Troli, Garis Angin & Jalan */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes cartVibrate {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-1.2px) rotate(-1deg); }
            75% { transform: translateY(0.8px) rotate(0.8deg); }
          }
          @keyframes windTop {
            0% { transform: translateX(20px); opacity: 0; }
            25% { opacity: 0.95; }
            80% { opacity: 0.7; }
            100% { transform: translateX(-24px); opacity: 0; }
          }
          @keyframes windMid {
            0% { transform: translateX(16px); opacity: 0; }
            30% { opacity: 0.85; }
            85% { opacity: 0.6; }
            100% { transform: translateX(-28px); opacity: 0; }
          }
          @keyframes windBottom {
            0% { transform: translateX(22px); opacity: 0; }
            25% { opacity: 0.9; }
            80% { opacity: 0.7; }
            100% { transform: translateX(-22px); opacity: 0; }
          }
          @keyframes roadMove {
            0% { background-position: 16px 0; }
            100% { background-position: 0 0; }
          }
          .anim-cart-bounce {
            animation: cartVibrate 0.38s ease-in-out infinite;
          }
          .anim-wind-1 {
            animation: windTop 0.48s linear infinite;
          }
          .anim-wind-2 {
            animation: windMid 0.58s linear infinite 0.16s;
          }
          .anim-wind-3 {
            animation: windBottom 0.44s linear infinite 0.28s;
          }
          .anim-road-track {
            background-image: repeating-linear-gradient(90deg, #059669 0px, #059669 4px, transparent 4px, transparent 8px);
            background-size: 8px 1.5px;
            animation: roadMove 0.28s linear infinite;
          }
        `}} />

        {/* Dynamic Island Capsule yang membungkus Troli & Garis Angin */}
        <div className="relative flex items-center justify-center w-24 h-5">
          {/* Garis Angin 1 (Atas: Melaju dari depan ke belakang lalu memudar) */}
          <span 
            className="absolute top-0.5 right-6 w-4 h-[1.2px] bg-emerald-600 rounded-full anim-wind-1 pointer-events-none" 
            aria-hidden="true"
          />
          {/* Garis Angin 2 (Tengah: Melaju dari depan ke belakang lalu memudar) */}
          <span 
            className="absolute top-2 right-4 w-5 h-[1.2px] bg-teal-500 rounded-full anim-wind-2 pointer-events-none" 
            aria-hidden="true"
          />
          {/* Garis Angin 3 (Bawah: Melaju dari depan ke belakang lalu memudar) */}
          <span 
            className="absolute top-3.5 right-5 w-3.5 h-[1px] bg-emerald-500 rounded-full anim-wind-3 pointer-events-none" 
            aria-hidden="true"
          />

          {/* Ikon Troli Mungil dengan Efek Goyang / Bounce Halus */}
          <div className="anim-cart-bounce z-10 flex items-center justify-center">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-800 fill-emerald-100 stroke-[2.4]" />
          </div>
        </div>

        {/* Jalan / Lintasan yang Ditempuh (Animasi Bergerak ke Belakang) */}
        <div className="w-16 h-[1.5px] rounded-full overflow-hidden relative -mt-0.5 bg-slate-200">
          <div className="w-full h-full anim-road-track" />
        </div>
      </div>

      {/* 3. Indikator Sinyal di Sudut Kanan (Ikon Baterai & Persentase Telah Dihapus) */}
      <div className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-bold min-w-[56px] justify-end">
        <span>5G</span>
        <span className="text-[8px] tracking-widest text-slate-400">●●●</span>
      </div>
    </div>
  );
}
