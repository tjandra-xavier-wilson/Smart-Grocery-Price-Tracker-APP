'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Truck
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';
import { saveShoppingTrip } from '../../src/lib/supabaseClient';

export default function CheckoutDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentAddress,
  appliedVoucher,
  onApplyVoucher,
  onOrderSuccess
}) {
  const [voucherInput, setVoucherInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 12000;
  
  // Calculate discount based on clean original vouchers
  let discountAmount = 0;
  if (appliedVoucher === 'PASARHEMAT') {
    discountAmount = Math.min(Math.round(subtotal * 0.3), 25000);
  } else if (appliedVoucher === 'SEMBAKOPINTAR') {
    discountAmount = Math.min(15000, subtotal);
  } else if (appliedVoucher === 'ONGKIRFREE') {
    discountAmount = deliveryFee;
  }
  
  const platformFee = 2000;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount + platformFee);

  const formatRupiah = (val) => {
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    playTapSound();
    onApplyVoucher(voucherInput.trim().toUpperCase());
    setVoucherInput('');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    playTapSound();
    setIsSubmitting(true);

    try {
      const historyPayload = {
        shopping_date: new Date().toISOString().split('T')[0],
        total_spent: grandTotal,
        notes: `PasarPintar - ${currentAddress}`
      };

      const itemsPayload = cartItems.map(item => ({
        nama_barang: item.name,
        kategori: item.category || 'sembako',
        satuan: item.unit || 'pcs',
        kuantitas: item.quantity,
        harga_satuan: item.originalPrice || item.price,
        harga_akhir_per_satuan: item.price,
        total_harga_item: item.price * item.quantity,
        harga_bulan_lalu: item.originalPrice || item.price
      }));

      // Insert into Supabase
      const saveRes = await saveShoppingTrip(historyPayload, itemsPayload);

      playSuccessSound();
      setOrderConfirmed({
        orderId: 'PP-' + Math.floor(100000 + Math.random() * 900000),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        total: grandTotal,
        itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        source: saveRes.source || 'supabase'
      });

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      playSuccessSound();
      setOrderConfirmed({
        orderId: 'PP-' + Math.floor(100000 + Math.random() * 900000),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        total: grandTotal,
        itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        source: 'local'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Ringkasan Keranjang</h3>
              <p className="text-[11px] text-slate-500 font-medium">PasarPintar Direct Delivery</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              if (orderConfirmed) {
                onClearCart();
                setOrderConfirmed(null);
              }
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {orderConfirmed ? (
            /* Order Success State */
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-brand border border-indigo-200 animate-bounce-short">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pesanan Berhasil Disimpan
                </span>
                <h4 className="font-extrabold text-xl text-slate-900 mt-2">
                  Terima Kasih Atas Pesananmu!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
                  Belanjaan pasar sedang disiapkan dan harga telah tercatat di kalkulator anggaran.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Transaksi</span>
                  <span className="font-mono font-bold text-slate-800">{orderConfirmed.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Pembelian</span>
                  <span className="font-medium text-slate-800">{orderConfirmed.time} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pembayaran</span>
                  <span className="font-bold text-indigo-600 text-sm">{formatRupiah(orderConfirmed.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penyimpanan Sinkron</span>
                  <span className="font-semibold text-emerald-700 uppercase">
                    {orderConfirmed.source === 'supabase' ? 'Supabase PostgreSQL' : 'LocalStorage Offline'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center space-x-2 text-xs text-indigo-900">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Pengiriman dari <strong>{currentAddress.split(',')[0]}</strong></span>
              </div>

              <button
                onClick={() => {
                  playTapSound();
                  onClearCart();
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl active-press shadow-brand transition-all"
              >
                Selesai &amp; Kembali ke Katalog
              </button>
            </div>
          ) : (
            /* Normal Checkout View */
            <>
              {/* Delivery Address Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lokasi Pengantaran</span>
                    <span className="text-[11px] font-bold text-indigo-600">Terpilih</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">
                    {currentAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>Estimasi tiba: <strong>30-45 menit</strong> (Jadwal Pagi)</span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Daftar Belanja ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} item)
                  </h4>
                  <button 
                    onClick={() => {
                      playTapSound();
                      onClearCart();
                    }}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Kosongkan</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-xl"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg shrink-0 bg-slate-100" 
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px]">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {formatRupiah(item.price)} / {item.unit || 'pcs'}
                          </p>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full p-1">
                        <button
                          onClick={() => {
                            playTapSound();
                            onUpdateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 active-press shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold min-w-[14px] text-center text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            playTapSound();
                            onUpdateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active-press shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Voucher Input */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <form onSubmit={handleApplyVoucher} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-3 text-indigo-600" />
                    <input
                      type="text"
                      placeholder="Kode promo (PASARHEMAT / SEMBAKOPINTAR)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 uppercase font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl active-press hover:bg-indigo-700 shadow-brand"
                  >
                    Gunakan
                  </button>
                </form>

                {appliedVoucher && (
                  <div className="mt-2 flex items-center justify-between text-xs text-indigo-700 font-semibold px-1">
                    <span>Voucher &quot;{appliedVoucher}&quot; Aktif!</span>
                    <button 
                      onClick={() => onApplyVoucher(null)} 
                      className="text-rose-500 font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Saldo Dompet / QRIS Kasir</span>
                    <p className="text-[11px] text-slate-500 font-medium">Bebas Biaya Admin Tambahan</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600">Aktif</span>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Belanja Pasar</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Biaya Pengantaran Mitra</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(deliveryFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Diskon Promo ({appliedVoucher})</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Biaya Pemeliharaan Sistem</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(platformFee)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Total Pembayaran</span>
                  <span className="text-indigo-600 text-base">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Action Button */}
        {!orderConfirmed && (
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
            <button
              disabled={isSubmitting || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl active-press shadow-brand flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan ke Supabase Database...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Konfirmasi Belanja • {formatRupiah(grandTotal)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
