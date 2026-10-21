'use client';

import React, { useState } from 'react';
import { Mail, Tag, Bell, Gift, Sparkles, Check } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function InboxTab({ onApplyVoucher }) {
  const [copiedId, setCopiedId] = useState(null);

  const notifications = [
    {
      id: 'n1',
      title: 'Diskon 50% Sayuran Segar Hari Ini!',
      desc: 'Borong sayuran segar organik dari petani mitra dengan kode voucher khusus.',
      code: 'GRABMART50',
      time: '10 menit lalu',
      badge: 'Promo Mart',
      icon: Tag,
      color: 'bg-emerald-50 text-grab-green',
    },
    {
      id: 'n2',
      title: 'Gratis Ongkir Kilat 30 Menit!',
      desc: 'Nikmati bebas biaya antar untuk pemesanan groceries minimal Rp 30.000.',
      code: 'ONGKIRFREE',
      time: '2 jam lalu',
      badge: 'Voucher Kilat',
      icon: Gift,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'n3',
      title: 'Flash Sale Protein Segar (Daging & Salmon)',
      desc: 'Potongan langsung Rp 15.000 untuk salmon dan dada ayam tanpa tulang.',
      code: 'PROTEINHEMAT',
      time: 'Kemarin',
      badge: 'Flash Sale',
      icon: Sparkles,
      color: 'bg-rose-50 text-rose-600',
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
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-charcoal">Kotak Masuk & Promo</h2>
          <p className="text-xs text-subtext">Kumpulan promo dan voucher GrabMart eksklusif</p>
        </div>
        <div className="p-2 bg-grab-light text-grab-green rounded-full">
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
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card space-y-3"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-grab-green">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-charcoal mt-0.5 leading-snug">{item.title}</h4>
                  <p className="text-xs text-subtext mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Code voucher copy bar */}
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-grab-green" />
                  <span className="font-mono font-bold text-xs text-charcoal">{item.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(item)}
                  className="px-3 py-1 bg-grab-green text-white text-xs font-bold rounded-lg active-press hover:bg-grab-dark flex items-center space-x-1"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Dipakai!</span>
                    </>
                  ) : (
                    <span>Gunakan Voucher</span>
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
