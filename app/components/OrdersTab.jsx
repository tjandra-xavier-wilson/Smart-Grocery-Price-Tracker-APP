'use client';

import React, { useState, useEffect } from 'react';
import { 
  ReceiptText, 
  RotateCcw, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  Database 
} from 'lucide-react';
import { playTapSound } from '../utils/sound';
import { getShoppingHistoryList } from '../../src/lib/supabaseClient';

export default function OrdersTab({ onReorder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getShoppingHistoryList();
        setOrders(data || []);
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-charcoal">Aktivitas & Riwayat Pesanan</h2>
          <p className="text-xs text-subtext">Riwayat tersinkronisasi dengan Supabase PostgreSQL</p>
        </div>
        <div className="p-2 bg-grab-light text-grab-green rounded-full">
          <ReceiptText className="w-5 h-5" />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-subtext space-y-2">
          <div className="w-8 h-8 border-2 border-grab-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Mengambil data dari Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-charcoal">Belum Ada Riwayat Belanja</h4>
          <p className="text-xs text-subtext max-w-[240px] mx-auto">
            Pilih sayuran segar dan kebutuhan dapur favoritmu, lalu lakukan checkout pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <div
              key={order.id || idx}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-grab-green flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal">
                      {order.store_name || 'GrabMart Express'}
                    </span>
                    <p className="text-[10px] text-subtext flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.date || 'Hari ini'}</span>
                    </p>
                  </div>
                </div>

                <span className="bg-emerald-50 text-grab-dark font-bold text-[10px] px-2 py-0.5 rounded-full">
                  Selesai
                </span>
              </div>

              {/* Items summary */}
              <div className="py-2 border-y border-gray-50 text-xs text-subtext space-y-1">
                <div className="flex justify-between font-medium text-charcoal">
                  <span>{order.items_count || order.items?.length || 1} Barang Belanjaan</span>
                  <span className="font-bold text-grab-green">{formatRupiah(order.total_spent)}</span>
                </div>
                {order.items && order.items.length > 0 && (
                  <p className="text-[11px] text-gray-400 truncate">
                    {order.items.map(i => i.nama_barang || i.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Reorder Button */}
              <button
                onClick={() => {
                  playTapSound();
                  if (onReorder) onReorder(order);
                }}
                className="w-full py-2 bg-grab-light hover:bg-emerald-100 text-grab-green font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors active-press"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pesan Lagi</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
