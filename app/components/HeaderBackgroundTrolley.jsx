'use client';

import React from 'react';

/**
 * HeaderBackgroundTrolley:
 * Desain Asli (Original & Custom Model) SakuGrosir Smart Trolley:
 * - Shopper sporty berlengan teal dengan Smartwatch di pergelangan tangan (khas "Smart Tracker")
 * - Stang ergonomis berlapis silikon hijau emerald
 * - Keranjang aerodinamis modern beraksen kisi diagonal cross-lattice & bumper hijau
 * - Muatan belanjaan cerdas: Eco Kraft Bag berlogo daun, struk belanja cerdas berkibar,
 *   pisang emas Cavendish, botol minyak/jus higienis, pouch grosir bertuliskan "HEMAT", dan apel hijau segar
 * - Velg roda racing beraksen emerald spinning fast
 * - Garis angin kecepatan tinggi (speed lines) melesat dari kanan ke kiri dan memudar (dashWind)
 * - Berjalan otomatis tanpa tombol replay/refresh (continuous infinite loop)
 */
export default function HeaderBackgroundTrolley() {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.16] select-none flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Custom Keyframes untuk Jiggle Troli, Putaran Roda, Struk Berkibar & Garis Angin */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes trolleyJiggle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2.2px) rotate(-0.7deg); }
          50% { transform: translateY(1.6px) rotate(0.5deg); }
          75% { transform: translateY(-1.2px) rotate(-0.3deg); }
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

        @keyframes receiptFlutter {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-5deg) translateY(-2px); }
        }

        .anim-trolley-jiggle {
          animation: trolleyJiggle 0.32s ease-in-out infinite;
          will-change: transform;
        }

        .anim-wheel-rear {
          transform-origin: 182px 172px;
          animation: wheelSpinFast 0.26s linear infinite;
        }

        .anim-wheel-front {
          transform-origin: 270px 172px;
          animation: wheelSpinFast 0.26s linear infinite;
        }

        .anim-dash-wind-1 {
          animation: dashWind 0.7s linear infinite 0s;
          will-change: transform, opacity;
        }
        .anim-dash-wind-2 {
          animation: dashWind 0.58s linear infinite 0.2s;
          will-change: transform, opacity;
        }
        .anim-dash-wind-3 {
          animation: dashWind 0.65s linear infinite 0.42s;
          will-change: transform, opacity;
        }

        .anim-receipt-flutter {
          animation: receiptFlutter 0.4s ease-in-out infinite;
          transform-origin: 198px 75px;
        }
      `}} />

      <svg 
        viewBox="0 0 420 200" 
        className="w-full h-full object-cover min-w-[380px] max-w-[500px]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="customKraftBagGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="customOilBottleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="customPouchHematGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="customSportySleeveGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="customChassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 1. Efek Garis Angin Kecepatan Tinggi (Speed Lines) */}
        <g>
          <line 
            x1="390" y1="58" x2="310" y2="58" 
            stroke="#059669" strokeWidth="2.5" strokeLinecap="round" 
            className="anim-dash-wind-1" 
          />
          <line 
            x1="415" y1="115" x2="335" y2="115" 
            stroke="#10b981" strokeWidth="3" strokeLinecap="round" 
            className="anim-dash-wind-2" 
          />
          <line 
            x1="375" y1="184" x2="280" y2="184" 
            stroke="#047857" strokeWidth="3.2" strokeLinecap="round" 
            className="anim-dash-wind-3" 
          />
        </g>

        {/* Lintasan Jalan Datar Bergaris Hijau SakuGrosir */}
        <line 
          x1="0" y1="184" x2="420" y2="184" 
          stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.8" strokeDasharray="14 7" 
        />

        {/* 2. Kelompok Utama Troli Model Baru SakuGrosir dengan Continuous Jiggle */}
        <g className="anim-trolley-jiggle">
          {/* Tangan Pendorong: Shopper Sporty dengan Smartwatch SakuGrosir */}
          <g id="shopper-sporty-arms">
            {/* Lengan Bawah */}
            <path d="M 64 74 L 146 94" stroke="#115e59" strokeWidth="15" strokeLinecap="round" />
            <path d="M 66 74 L 138 92" stroke="#ccfbf1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="150" cy="95" r="7.5" fill="#f97316" />

            {/* Lengan Atas dengan Smartwatch */}
            <path d="M 60 55 L 144 76" stroke="url(#customSportySleeveGrad)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 62 55 L 136 74" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" />
            {/* Jam Tangan Pintar (Smartwatch) SakuGrosir */}
            <rect 
              x="132" y="65" width="8" height="15" rx="3" 
              fill="#0f172a" stroke="#334155" strokeWidth="1.2" 
              transform="rotate(14 136 72)" 
            />
            <circle cx="137" cy="72" r="2.2" fill="#10b981" />
            <circle cx="148" cy="77" r="8" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
          </g>

          {/* Stang Ergonomis Berbalut Silikon Hijau Emerald */}
          <path d="M 148 77 L 168 96" stroke="#059669" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="148" cy="77" r="4.5" fill="#10b981" />

          {/* Muatan Belanjaan Khas SakuGrosir */}
          <g id="custom-groceries-cargo">
            {/* a. Kantong Kertas Eco Kraft Bag dengan Logo Daun */}
            <g id="eco-kraft-bag">
              <path d="M 166 142 L 174 88 L 210 88 L 202 142 Z" fill="url(#customKraftBagGrad)" stroke="#78350f" strokeWidth="1.5" />
              <line x1="174" y1="88" x2="188" y2="142" stroke="#78350f" strokeWidth="1" strokeOpacity="0.5" />
              {/* Badge Daun Hemat SakuGrosir */}
              <circle cx="188" cy="114" r="8" fill="#fef3c7" />
              <path d="M 188 108 C 193 110 194 116 188 120 C 182 116 183 110 188 108 Z" fill="#10b981" />
            </g>

            {/* b. Struk Belanja Cerdas Berkibar (Smart Budget Receipt) */}
            <g className="anim-receipt-flutter">
              <path d="M 194 78 L 198 52 L 218 54 L 214 80 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
              <path d="M 198 52 L 202 50 L 206 52 L 210 50 L 214 52 L 218 54" stroke="#64748b" strokeWidth="1" fill="#ffffff" />
              <line x1="202" y1="60" x2="212" y2="61" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="201" y1="66" x2="211" y2="67" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="200" y1="72" x2="208" y2="73" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* c. Sisir Pisang Emas Tropis (Cavendish Bananas) */}
            <g id="cavendish-bananas">
              <path d="M 204 100 Q 218 95 232 112 Q 218 108 206 102 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
              <path d="M 206 94 Q 222 90 238 108 Q 222 102 208 96 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
              <circle cx="206" cy="95" r="2" fill="#713f12" />
            </g>

            {/* d. Botol Minyak Goreng / Jus Sehat Higienis */}
            <g id="oil-bottle">
              <rect x="226" y="98" width="18" height="44" rx="4" fill="url(#customOilBottleGrad)" stroke="#b45309" strokeWidth="1.2" />
              <rect x="231" y="90" width="8" height="8" rx="1.5" fill="#10b981" stroke="#047857" strokeWidth="1" />
              <rect x="229" y="112" width="12" height="16" rx="2" fill="#ffffff" fillOpacity="0.9" />
              <line x1="231" y1="118" x2="239" y2="118" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="231" y1="122" x2="237" y2="122" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* e. Pouch Grosir Berlabel "HEMAT" */}
            <g id="hemat-grocery-pouch">
              <path d="M 244 104 L 250 96 L 274 96 L 280 104 L 276 144 L 246 144 Z" fill="url(#customPouchHematGrad)" stroke="#064e3b" strokeWidth="1.5" />
              <line x1="250" y1="99" x2="274" y2="99" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="248" y="114" width="28" height="14" rx="3" fill="#ffffff" />
              <text x="262" y="124.5" fontSize="7" fontWeight="900" fill="#047857" textAnchor="middle" fontFamily="sans-serif">
                HEMAT
              </text>
            </g>

            {/* f. Apel Hijau Segar dengan Daun (Granny Smith Apple) */}
            <g id="fresh-green-apple">
              <circle cx="218" cy="132" r="11" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
              <path d="M 218 121 Q 222 116 226 118" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <ellipse cx="224" cy="117" rx="3" ry="1.5" fill="#22c55e" transform="rotate(-20 224 117)" />
            </g>
          </g>

          {/* Rangka Keranjang Modern Aerodinamis (Modern SakuGrosir Basket) */}
          <g id="modern-aerodynamic-basket">
            <path d="M 168 96 L 284 96 L 272 144 L 180 144 Z" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round" />
            {/* List Bumper Hijau Atas */}
            <path d="M 166 96 L 286 96" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

            {/* Kisi Diagonal / Cross-Lattice Modern Grid */}
            <line x1="184" y1="96" x2="202" y2="144" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="204" y1="96" x2="222" y2="144" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="224" y1="96" x2="242" y2="144" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="244" y1="96" x2="260" y2="144" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="264" y1="96" x2="270" y2="120" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Kisi Diagonal Berlawanan */}
            <line x1="202" y1="96" x2="186" y2="144" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="222" y1="96" x2="206" y2="144" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="242" y1="96" x2="226" y2="144" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="262" y1="96" x2="246" y2="144" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="282" y1="96" x2="264" y2="144" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Sasis Dasar Aerodinamis (Low-Profile Racing Chassis) */}
          <path d="M 166 145 L 282 145 L 274 159 L 172 159 Z" fill="url(#customChassisGrad)" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="176" y1="152" x2="272" y2="152" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

          {/* Roda Belakang Berputar Cepat (High-Performance Rear Wheel) */}
          <g className="anim-wheel-rear">
            <circle cx="182" cy="172" r="12.5" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <circle cx="182" cy="172" r="8" fill="#059669" />
            <circle cx="182" cy="172" r="3.5" fill="#f8fafc" />
            {/* Spoke Velg Racing */}
            <line x1="182" y1="164" x2="182" y2="180" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="174" y1="172" x2="190" y2="172" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="176" y1="166" x2="188" y2="178" stroke="#34d399" strokeWidth="1.2" />
            <line x1="176" y1="178" x2="188" y2="166" stroke="#34d399" strokeWidth="1.2" />
          </g>

          {/* Roda Depan Berputar Cepat (High-Performance Front Wheel) */}
          <g className="anim-wheel-front">
            <circle cx="270" cy="172" r="12.5" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <circle cx="270" cy="172" r="8" fill="#059669" />
            <circle cx="270" cy="172" r="3.5" fill="#f8fafc" />
            {/* Spoke Velg Racing */}
            <line x1="270" y1="164" x2="270" y2="180" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="262" y1="172" x2="278" y2="172" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="264" y1="166" x2="276" y2="178" stroke="#34d399" strokeWidth="1.2" />
            <line x1="264" y1="178" x2="276" y2="166" stroke="#34d399" strokeWidth="1.2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
