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
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Riwayat &amp; Catatan Belanja</h2>
          <p className="text-xs text-slate-500">Tersinkronisasi otomatis dengan Cloud PostgreSQL</p>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          <ReceiptText className="w-5 h-5" />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Mengambil data dari Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Belum Ada Riwayat Belanja</h4>
          <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
            Pilih sayuran segar dan kebutuhan dapur favoritmu, lalu simpan belanjaan pertamamu!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {order.notes || 'Belanja Pasar Selesai'}
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{order.shopping_date || 'Hari ini'}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tersimpan
                </span>
              </div>

              {/* Items summary */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {order.grocery_items?.length || 1} macam barang belanjaan
                </span>
                <span className="font-bold text-indigo-600 text-sm">
                  {formatRupiah(order.total_spent || 0)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cloud ID: #{order.id?.slice(0, 6) || 'lokal'}</span>
                </div>
                <button
                  onClick={() => {
                    playTapSound();
                    if (onReorder) onReorder(order);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center space-x-1 active-press transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pesan Ulang</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
