'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Store, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShoppingBag,
  Shield
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

/**
 * SplashScreen Component:
 * Tampilan Animasi Pembuka sebelum masuk ke aplikasi Smart Grocery Sentinel.
 * Menampilkan:
 * 1. Visual & Logo Sentral dengan aura bercahaya (glowing pulse & orbital halo) emerald green.
 * 2. Badge sistem "Aisle Companion" dan judul & tagline.
 * 3. 4 Kartu Fitur (Smart Shopping, Realtime Price Tracker, Sentinel AI Assistant, Histori & Analytics).
 * 4. Progress bar interaktif & persentase (0% - 100%) dengan feedback kesiapan sistem.
 * 5. Transisi otomatis ke aplikasi tanpa tombol manual.
 * 6. Footer status keamanan engine v2.4.0 & enkripsi standar finansial.
 */
export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let current = 0;
    // Simulasi inisialisasi mesin offline PWA & proteksi anggaran (total durasi ~1.8 detik)
    const interval = setInterval(() => {
      // Pertambahan progress bertahap yang dinamis
      const step = current < 60 ? 3 : current < 90 ? 2 : 1.5;
      current += step;

      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);

        try {
          playSuccessSound();
        } catch (e) {}

        // Tahan 350ms pada 100% dengan status "Sistem siap!", lalu fade-out otomatis
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 400);
        }, 350);
      } else {
        setProgress(current);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onFinish]);

  // Teks feedback status kesiapan sistem berdasarkan persentase loading
  const getStatusText = () => {
    if (progress < 30) return 'Memuat mesin offline PWA...';
    if (progress < 65) return 'Menyiapkan pelindung anggaran...';
    if (progress < 95) return 'Menginisialisasi basis data Sentinel...';
    return 'Sistem siap! Selamat berbelanja.';
  };

  return (
    <div 
      className={`min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-sky-50/50 via-white to-emerald-50/30 select-none relative transition-all duration-400 ease-out ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Custom CSS Keyframes untuk Glowing Pulse & Orbital Halo */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbitalPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.95;
          }
        }
        @keyframes haloGlow {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25);
          }
          50% {
            box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.45);
          }
        }
        .anim-orbital-halo {
          animation: orbitalPulse 2.8s ease-in-out infinite;
        }
        .anim-card-glow {
          animation: haloGlow 2.2s ease-in-out infinite;
        }
      `}} />

      {/* 1. TOP HEADER STATUS BADGES */}
      <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1 px-0.5">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-slate-800 tracking-tight font-extrabold text-[10.5px]">
            PWA · OFFLINE ENGINE READY
          </span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-bold text-[10.5px]">Sentinel Shield Active</span>
        </div>
      </div>

      {/* Pill Badge Centered: Offline-Ready • Realtime Sync Shield */}
      <div className="flex justify-center mt-2 mb-1">
        <div className="px-3.5 py-1 bg-emerald-50/90 border border-emerald-200/70 text-emerald-800 rounded-full text-[10.5px] font-bold flex items-center space-x-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Offline-Ready • Realtime Sync Shield</span>
        </div>
      </div>

      {/* 2. VISUAL & LOGO SENTRAL (Glowing Pulse & Orbital Halo) */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Orbital Halo Glowing Chamber */}
        <div className="relative mb-2 flex items-center justify-center">
          {/* Outer Orbital Halo Pulse */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-100/60 via-teal-100/40 to-emerald-200/50 flex items-center justify-center anim-orbital-halo" />
          
          {/* Inner White Rounded Card with App Icon */}
          <div className="absolute w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 anim-card-glow">
            {/* Center Emerald App Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-950/20">
              <div className="relative flex flex-col items-center">
                <ShoppingBag className="w-7 h-7 text-white stroke-[2.3]" />
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5] absolute -bottom-1" />
              </div>
            </div>

            {/* Small Floating Shield Badge top-right */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-950 border-2 border-white flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Badge Sistem Aisle Companion */}
        <div className="mt-1 px-3 py-0.5 bg-emerald-50/90 border border-emerald-200/80 rounded-full text-[10px] font-black tracking-widest text-emerald-800 uppercase flex items-center space-x-1.5 shadow-2xs">
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          <span>AISLE COMPANION</span>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2.5">
          Smart Grocery Sentinel
        </h1>
        <p className="text-[11.5px] text-slate-600 font-semibold mt-0.5 max-w-[320px]">
          Asisten Belanja Hemat &amp; Pelindung Anggaran Pintar
        </p>

        {/* 3. 4 KARTU FITUR UTAMA (2x2 GRID) */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 w-full text-left">
          {/* Kartu 1 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-2">
              <h3 className="text-[11px] font-black text-slate-900 leading-tight">
                Smart Shopping &amp; Budget Cap
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-snug mt-1">
                Kawal batas plafon &amp; cegah belanja overbudget
              </p>
            </div>
          </div>

          {/* Kartu 2 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-2">
              <h3 className="text-[11px] font-black text-slate-900 leading-tight">
                Realtime Price Tracker
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-snug mt-1">
                Pantau diskon majemuk &amp; fluktuasi harga toko
              </p>
            </div>
          </div>

          {/* Kartu 3 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-2">
              <h3 className="text-[11px] font-black text-slate-900 leading-tight">
                Sentinel AI Assistant
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-snug mt-1">
                Rekomendasi hemat &amp; kurasi barang sekunder
              </p>
            </div>
          </div>

          {/* Kartu 4 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-2">
              <h3 className="text-[11px] font-black text-slate-900 leading-tight">
                Histori &amp; Analytics
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-snug mt-1">
                Laporan belanja berkala &amp; ekspor rekap
              </p>
            </div>
          </div>
        </div>

        {/* 4. PROGRESS BAR INTERAKTIF & STATUS KESIAPAN SISTEM */}
        <div className="w-full mt-3.5">
          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Kesiapan & Persentase */}
          <div className="mt-2 flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-[11px]">
              {progress >= 100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <span className="truncate">{getStatusText()}</span>
            </div>
            <span className="font-black text-emerald-800 text-xs tabular-nums shrink-0 ml-2">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER STATUS KEAMANAN & ENGINE */}
      <div className="text-center text-[10px] text-slate-400 font-semibold py-1 leading-relaxed flex flex-col items-center">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Sentinel Engine v2.4.0 • Zero-Latency Mode</span>
        </div>
        <span className="text-[9.5px] text-slate-400 font-medium">
          Enkripsi Lokal Sesuai Standar Finansial
        </span>
      </div>
    </div>
  );
}
