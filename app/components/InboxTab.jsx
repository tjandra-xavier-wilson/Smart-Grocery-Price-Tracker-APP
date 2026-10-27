'use client';

import React, { useState } from 'react';
import { Mail, Tag, Bell, Gift, Sparkles, Check } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function InboxTab({ onApplyVoucher }) {
  const [copiedId, setCopiedId] = useState(null);

  const notifications = [
    {
      id: 'n1',
      title: 'Diskon 30% Belanja Pasar Pagi!',
      desc: 'Dapatkan potongan langsung hingga Rp 25.000 untuk sayuran segar & sembako.',
      code: 'PASARHEMAT',
      time: '15 menit lalu',
      badge: 'Voucher Utama',
      icon: Tag,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'n2',
      title: 'Bebas Ongkir Pengantaran Langsung!',
      desc: 'Nikmati gratis pengiriman tanpa minimum belanja ke wilayah terdekat mitra.',
      code: 'ONGKIRFREE',
      time: '1 jam lalu',
      badge: 'Bebas Ongkir',
      icon: Gift,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'n3',
      title: 'Potongan Sembako Rp 15.000',
      desc: 'Hemat belanja beras pulen, minyak goreng sawit, dan telur ayam ras pilihan.',
      code: 'SEMBAKOPINTAR',
      time: 'Hari ini',
      badge: 'Paket Hemat',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const handleCopy = (item) => {
    playTapSound();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.code);
    }
    setCopiedId(item.id);
    if (onApplyVoucher) onApplyVoucher(item.code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kotak Promo &amp; Kupon</h2>
          <p className="text-xs text-slate-500">Kumpulan kode diskon resmi belanja pasar hemat</p>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          <Mail className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card space-y-3"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-0.5 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Code voucher copy bar */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono font-bold text-xs text-slate-900">{item.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(item)}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg active-press hover:bg-indigo-700 shadow-brand flex items-center space-x-1 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Dipakai!</span>
                    </>
                  ) : (
                    <span>Gunakan</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
