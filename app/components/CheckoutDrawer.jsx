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
  Bike, 
  CheckCircle2, 
  Clock, 
  CreditCard 
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
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedVoucher === 'GRABMART50') {
    discountAmount = Math.min(Math.round(subtotal * 0.5), 25000);
  } else if (appliedVoucher === 'ONGKIRFREE') {
    discountAmount = deliveryFee;
  } else if (appliedVoucher === 'PROTEINHEMAT') {
    discountAmount = 15000;
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
        notes: `GrabMart Supermarket - ${currentAddress}`
      };

      const itemsPayload = cartItems.map(item => ({
        nama_barang: item.name,
        kategori: item.category || 'Sayur/Buah',
        satuan: 'pcs',
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
        orderId: 'GM-' + Math.floor(100000 + Math.random() * 900000),
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
        orderId: 'GM-' + Math.floor(100000 + Math.random() * 900000),
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
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-grab-light flex items-center justify-center text-grab-green">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Ringkasan Pesanan</h3>
              <p className="text-[11px] text-subtext">GrabMart Express Delivery</p>
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
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {orderConfirmed ? (
            /* Order Success State */
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-grab-light text-grab-green rounded-full flex items-center justify-center mx-auto shadow-grab animate-bounce-short">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="bg-emerald-100 text-grab-dark text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                  Pesanan Terkonfirmasi
                </span>
                <h4 className="font-extrabold text-xl text-charcoal mt-2">
                  Terima Kasih! Pesananmu Diproses
                </h4>
                <p className="text-xs text-subtext mt-1 max-w-[280px] mx-auto">
                  Driver Grab sedang menuju mitra supermarket untuk mengambil belanjaanmu.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-subtext">Nomor Pesanan</span>
                  <span className="font-mono font-bold text-charcoal">{orderConfirmed.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtext">Waktu Pesan</span>
                  <span className="font-medium text-charcoal">{orderConfirmed.time} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtext">Total Belanja</span>
                  <span className="font-bold text-grab-green">{formatRupiah(orderConfirmed.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtext">Tersimpan di</span>
                  <span className="font-semibold text-emerald-700 uppercase">
                    {orderConfirmed.source === 'supabase' ? 'Supabase PostgreSQL' : 'LocalStorage Offline'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                <Bike className="w-4 h-4 text-grab-green shrink-0 animate-pulse" />
                <span>Estimasi tiba dalam <strong>25-35 menit</strong> ke {currentAddress.split(',')[0]}</span>
              </div>

              <button
                onClick={() => {
                  playTapSound();
                  onClearCart();
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="w-full py-3.5 bg-grab-green hover:bg-grab-dark text-white font-bold text-sm rounded-xl active-press shadow-grab"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            /* Normal Checkout View */
            <>
              {/* Delivery Address Card */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-grab-light flex items-center justify-center text-grab-green shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 fill-grab-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-subtext uppercase">Alamat Antar</span>
                    <span className="text-[11px] font-bold text-grab-green">Ubah</span>
                  </div>
                  <p className="text-xs font-semibold text-charcoal mt-0.5 leading-snug">
                    {currentAddress}
                  </p>
                  <p className="text-[11px] text-subtext mt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-grab-green" />
                    <span>Estimasi tiba: <strong>30 menit</strong> (Instan)</span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-subtext uppercase tracking-wider">
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
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg shrink-0" 
                        />
                        <div>
                          <h5 className="text-xs font-bold text-charcoal line-clamp-1 max-w-[150px]">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-subtext">
                            {formatRupiah(item.price)} / {item.unit || 'pcs'}
                          </p>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full p-1">
                        <button
                          onClick={() => {
                            playTapSound();
                            onUpdateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-charcoal hover:bg-gray-200 active-press shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            playTapSound();
                            onUpdateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-full bg-grab-green text-white flex items-center justify-center hover:bg-grab-dark active-press shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Voucher Input */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <form onSubmit={handleApplyVoucher} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-3 text-grab-green" />
                    <input
                      type="text"
                      placeholder="Masukkan kode promo (e.g. GRABMART50)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-grab-green uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-grab-green text-white text-xs font-bold rounded-xl active-press hover:bg-grab-dark"
                  >
                    Terapkan
                  </button>
                </form>

                {appliedVoucher && (
                  <div className="mt-2 flex items-center justify-between text-xs text-grab-green font-semibold px-1">
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
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal">OVO Saldo (GrabPay)</span>
                    <p className="text-[11px] text-subtext">Saldo: Rp 280.000</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-grab-green">Ubah</span>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-white border border-gray-100 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-subtext">
                  <span>Subtotal Belanja</span>
                  <span className="font-semibold text-charcoal">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-subtext">
                  <span>Biaya Pengantaran</span>
                  <span className="font-semibold text-charcoal">{formatRupiah(deliveryFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Diskon Promo ({appliedVoucher})</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-subtext">
                  <span>Biaya Layanan & Kemasan</span>
                  <span className="font-semibold text-charcoal">{formatRupiah(platformFee)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-sm text-charcoal">
                  <span>Total Pembayaran</span>
                  <span className="text-grab-green text-base">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Action Button */}
        {!orderConfirmed && (
          <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
            <button
              disabled={isSubmitting || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-grab-green hover:bg-grab-dark text-white font-bold text-sm rounded-2xl active-press shadow-grab flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menghubungkan ke Supabase...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pesan Sekarang • {formatRupiah(grandTotal)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
