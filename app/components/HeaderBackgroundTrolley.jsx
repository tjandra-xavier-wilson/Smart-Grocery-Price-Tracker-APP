'use client';

import React from 'react';

/**
 * HeaderBackgroundTrolley:
 * Komponen animasi latar belakang (background) troli belanja melaju kencang menembus angin
 * Berjalan otomatis secara kontinu (infinite loop) dengan transparansi rendah (opacity-15)
 * Memuat detail ilustrasi: dua tangan mendorong, roti baguette, sayuran, tomat, susu MILK,
 * kotak sereal bintang, wortel, roda berputar, garis lintasan, serta 3 garis angin kecepatan tinggi (speed lines).
 */
export default function HeaderBackgroundTrolley() {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.16] select-none flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Custom CSS Keyframes untuk Jiggle Troli, Putaran Roda, dan Garis Angin Kecepatan Tinggi */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes trolleyJiggle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-0.5deg); }
          50% { transform: translateY(1.5px) rotate(0.4deg); }
          75% { transform: translateY(-1px) rotate(-0.2deg); }
        }

        @keyframes wheelSpinFast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dashWind {
          0% {
            transform: translateX(280px);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          75% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(-360px);
            opacity: 0;
          }
        }

        .anim-trolley-jiggle {
          animation: trolleyJiggle 0.34s ease-in-out infinite;
          will-change: transform;
        }

        .anim-wheel-rear {
          transform-origin: 180px 172px;
          animation: wheelSpinFast 0.28s linear infinite;
        }

        .anim-wheel-front {
          transform-origin: 262px 172px;
          animation: wheelSpinFast 0.28s linear infinite;
        }

        .anim-dash-wind-1 {
          animation: dashWind 0.75s linear infinite 0s;
          will-change: transform, opacity;
        }
        .anim-dash-wind-2 {
          animation: dashWind 0.62s linear infinite 0.22s;
          will-change: transform, opacity;
        }
        .anim-dash-wind-3 {
          animation: dashWind 0.7s linear infinite 0.44s;
          will-change: transform, opacity;
        }
      `}} />

      <svg 
        viewBox="0 0 420 200" 
        className="w-full h-full object-cover min-w-[380px] max-w-[500px]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="headerBreadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="headerChassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* 1. Efek Garis Angin Kecepatan Tinggi (Speed Lines) */}
        <g>
          {/* Garis Angin 1 (Atas: dekat bagian atas barang belanjaan) */}
          <line 
            x1="380" y1="65" x2="305" y2="65" 
            stroke="#059669" strokeWidth="2.5" strokeLinecap="round" 
            className="anim-dash-wind-1" 
          />
          {/* Garis Angin 2 (Tengah: melesat melewati badan keranjang) */}
          <line 
            x1="410" y1="120" x2="330" y2="120" 
            stroke="#10b981" strokeWidth="3" strokeLinecap="round" 
            className="anim-dash-wind-2" 
          />
          {/* Garis Angin 3 (Bawah: di bawah roda troli dekat jalan) */}
          <line 
            x1="370" y1="184" x2="275" y2="184" 
            stroke="#047857" strokeWidth="3" strokeLinecap="round" 
            className="anim-dash-wind-3" 
          />
        </g>

        {/* Lintasan Jalan Hijau Datar di Bawah Roda */}
        <line 
          x1="0" y1="184" x2="420" y2="184" 
          stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.75" strokeDasharray="16 8" 
        />

        {/* 2. Kelompok Utama Troli, Tangan & Barang Belanjaan dengan Efek Continuous Jiggle */}
        <g className="anim-trolley-jiggle">
          {/* Tangan Pendorong (Dua Lengan Biru dengan Telapak Peach) */}
          <g id="pushing-arms">
            {/* Lengan Bawah */}
            <path d="M 68 76 L 148 96" stroke="#1e40af" strokeWidth="15" strokeLinecap="round" />
            <circle cx="152" cy="97" r="7.5" fill="#f97316" />
            {/* Lengan Atas */}
            <path d="M 64 58 L 146 78" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" />
            <circle cx="150" cy="79" r="8" fill="#fdba74" stroke="#f97316" strokeWidth="1.5" />
          </g>

          {/* Pegangan Troli Besi (Handlebar) */}
          <path d="M 150 79 L 168 96" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />

          {/* Muatan Barang-Barang Belanjaan di Dalam Keranjang */}
          <g id="groceries-items">
            {/* a. Baguette / Roti Panjang Prancis */}
            <path 
              d="M 164 140 L 176 74 Q 182 62 192 68 L 198 80 L 180 142 Z" 
              fill="url(#headerBreadGrad)" stroke="#78350f" strokeWidth="1.5" 
            />
            {/* Sayatan Garis Roti */}
            <line x1="176" y1="88" x2="188" y2="92" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
            <line x1="174" y1="104" x2="186" y2="108" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
            <line x1="172" y1="120" x2="184" y2="124" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />

            {/* b. Sayuran Hijau Segar (Lettuce / Daun Selada) */}
            <path 
              d="M 186 115 C 182 85 200 70 212 80 C 220 70 236 80 232 100 C 235 110 220 125 195 125 Z" 
              fill="#22c55e" stroke="#15803d" strokeWidth="1.5" 
            />
            <path d="M 205 90 Q 212 105 210 120" stroke="#16a34a" strokeWidth="1.5" fill="none" />

            {/* c. Tomat / Apel Merah */}
            <circle cx="200" cy="130" r="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            <path d="M 200 118 Q 204 114 206 116" stroke="#15803d" strokeWidth="1.5" fill="none" />

            {/* d. Kotak Susu Biru (MILK Carton) */}
            <g id="milk-carton-item">
              <path 
                d="M 206 102 L 216 92 L 226 92 L 236 102 L 236 145 L 206 145 Z" 
                fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" 
              />
              <polygon points="216,92 226,92 222,86 218,86" fill="#93c5fd" />
              <rect x="210" y="112" width="22" height="14" rx="2" fill="#ffffff" />
              <text x="221" y="122.5" fontSize="7" fontWeight="900" fill="#1d4ed8" textAnchor="middle" fontFamily="sans-serif">
                MILK
              </text>
            </g>

            {/* e. Kotak Snack / Sereal Bintang (Star Snack Box) */}
            <g id="star-box-item">
              <rect x="234" y="96" width="28" height="49" rx="2" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />
              <circle cx="248" cy="112" r="7.5" fill="#ffffff" />
              {/* Bintang Kuning */}
              <polygon 
                points="248,107 249.8,110.7 253.8,111.3 250.9,114.1 251.6,118 248,116.1 244.4,118 245.1,114.1 242.2,111.3 246.2,110.7" 
                fill="#facc15" 
              />
              <line x1="240" y1="126" x2="256" y2="126" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="240" y1="132" x2="252" y2="132" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* f. Wortel Segar dengan Daun Hijau (Carrot) */}
            <g id="carrot-item">
              <line x1="264" y1="92" x2="276" y2="82" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <line x1="264" y1="94" x2="280" y2="88" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
              <line x1="262" y1="96" x2="274" y2="94" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
              <polygon points="252,118 266,92 258,90" fill="#f97316" stroke="#c2410c" strokeWidth="1.2" />
            </g>
          </g>

          {/* Rangka Besi Keranjang Troli (Basket Frame & Metallic Grid) */}
          <g id="basket-metallic-grid">
            <polygon 
              points="168,96 280,96 266,145 180,145" 
              fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" 
            />
            {/* Kisi Vertikal */}
            <line x1="188" y1="96" x2="194" y2="145" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="208" y1="96" x2="210" y2="145" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="228" y1="96" x2="228" y2="145" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="248" y1="96" x2="246" y2="145" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="266" y1="96" x2="260" y2="145" stroke="#cbd5e1" strokeWidth="2" />
            {/* Kisi Horizontal */}
            <line x1="172" y1="112" x2="274" y2="112" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="176" y1="128" x2="270" y2="128" stroke="#94a3b8" strokeWidth="1.5" />
          </g>

          {/* Sasis Dasar Bawah Keranjang (Chassis Tray) */}
          <path 
            d="M 166 146 L 274 146 L 268 158 L 172 158 Z" 
            fill="url(#headerChassisGrad)" stroke="#0f172a" strokeWidth="1.5" 
          />

          {/* Roda Belakang Berputar Cepat (Rear Wheel) */}
          <g className="anim-wheel-rear">
            <circle cx="180" cy="172" r="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <circle cx="180" cy="172" r="7.5" fill="#0284c7" />
            <circle cx="180" cy="172" r="3" fill="#facc15" />
            <line x1="180" y1="165" x2="180" y2="179" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="173" y1="172" x2="187" y2="172" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Roda Depan Berputar Cepat (Front Wheel) */}
          <g className="anim-wheel-front">
            <circle cx="262" cy="172" r="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <circle cx="262" cy="172" r="7.5" fill="#0284c7" />
            <circle cx="262" cy="172" r="3" fill="#facc15" />
            <line x1="262" y1="165" x2="262" y2="179" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="255" y1="172" x2="269" y2="172" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
