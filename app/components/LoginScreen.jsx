'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Shield, 
  ArrowRight,
  ShoppingBag,
  User,
  X,
  UserCheck,
  AlertCircle,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';
import { 
  signInWithGoogle, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  getDeviceAccounts, 
  saveDeviceAccount, 
  removeDeviceAccount, 
  SINGLE_USER_STORAGE_KEY,
  DESIGNATED_OWNER_EMAIL
} from '../../src/lib/supabaseClient';

export default function LoginScreen({ onLoginSuccess, externalError = '' }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(externalError || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [deviceAccounts, setDeviceAccounts] = useState([]);


  // Load saved device accounts strictly from LocalStorage (no fake hardcoded accounts)
  useEffect(() => {
    const accounts = getDeviceAccounts();
    setDeviceAccounts(accounts);
    if (accounts.length > 0 && !email) {
      setEmail(accounts[0].email);
    }
  }, []);

  useEffect(() => {
    if (externalError) {
      setErrorMsg(externalError);
    }
  }, [externalError]);

  // Quick account switch handler
  const handleSelectAccount = (account) => {
    playTapSound();
    setEmail(account.email);
    if (account.name) setFullName(account.name);
    setErrorMsg('');
    setInfoMsg(`Akun "${account.name || account.email}" dipilih. Silakan masukkan PIN.`);
    setTimeout(() => setInfoMsg(''), 3000);
  };

  // Remove account from device handler
  const handleRemoveAccount = (e, targetEmail) => {
    e.stopPropagation();
    playTapSound();
    const updated = removeDeviceAccount(targetEmail);
    setDeviceAccounts(updated);
    if (email.toLowerCase() === targetEmail.toLowerCase()) {
      setEmail(updated.length > 0 ? updated[0].email : '');
    }
  };

  // Submit handler for Email & PIN / Password via Supabase Auth
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    playTapSound();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !pin.trim()) {
      setErrorMsg('Alamat email dan Kata Sandi / PIN wajib diisi');
      return;
    }

    if (pin.length < 6) {
      setErrorMsg('Kata Sandi / PIN keamanan minimal 6 karakter atau digit');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        // Mode Masuk: autentikasi via Supabase Auth dengan fallback resilient
        const res = await signInWithEmailPassword(email, pin);
        
        if (!res.success) {
          setErrorMsg(res.error || 'Email atau Kata Sandi / PIN salah. Pastikan akun sudah terdaftar.');
          setLoading(false);
          return;
        }

        const u = res.data?.user;
        const profile = {
          id: u?.id || 'user-' + Date.now(),
          name: u?.user_metadata?.full_name || fullName || u?.email?.split('@')[0] || email.split('@')[0],
          email: u?.email || email.trim(),
          avatar_url: u?.user_metadata?.avatar_url || null,
          provider: u?.app_metadata?.provider || 'email_password',
          role: 'user',
          authenticated_at: new Date().toISOString()
        };

        // Simpan data identitas profil ke LocalStorage jika checkbox aktif
        if (rememberMe) {
          saveDeviceAccount(profile);
          setDeviceAccounts(getDeviceAccounts());
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(SINGLE_USER_STORAGE_KEY, JSON.stringify(profile));
            localStorage.setItem('sakugrosir_is_logged_in', 'true');
          }
        }

        playSuccessSound();
        if (onLoginSuccess) {
          onLoginSuccess(profile);
        }

      } else {
        // Mode Daftar: pendaftaran via Supabase Auth dengan penanganan kuota rate-limit bebas macet
        const res = await signUpWithEmailPassword(email, pin, fullName);
        
        if (!res.success) {
          setErrorMsg(res.error || 'Gagal melakukan pendaftaran akun baru.');
          setLoading(false);
          return;
        }

        // Aturan Keamanan: Setelah registrasi akun baru berhasil, jangan langsung auto-login ke dashboard!
        // Arahkan user kembali ke tab 'Masuk' dengan notifikasi: "Registrasi berhasil, silakan login ulang dengan akun Anda."
        playSuccessSound();
        setAuthMode('login');
        setPin(''); // Kosongkan PIN untuk keamanan login ulang
        setErrorMsg('');
        setInfoMsg(res.message || 'Registrasi berhasil, silakan login ulang dengan akun Anda.');

        // Update list akun perangkat
        setDeviceAccounts(getDeviceAccounts());
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi pada modul autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In: Membuka tab Google Auth untuk memilih akun (Bukan di halaman), lalu langsung masuk menu utama
  const handleGoogleSignIn = () => {
    playTapSound();
    setErrorMsg('');
    setInfoMsg('');

    const width = 480;
    const height = 640;
    const left = typeof window !== 'undefined' ? Math.round(window.screenX + (window.outerWidth - width) / 2) : 100;
    const top = typeof window !== 'undefined' ? Math.round(window.screenY + (window.outerHeight - height) / 2) : 100;

    let authWindow = null;
    try {
      authWindow = window.open(
        '/auth/google',
        'GoogleSignInWindow',
        `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0,location=1`
      );
    } catch (e) {
      authWindow = null;
    }

    if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
      window.location.href = '/auth/google';
      return;
    }

    // Dengarkan pesan autentikasi sukses dari tab Google Auth
    const handleAuthMessage = (event) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.profile) {
        window.removeEventListener('message', handleAuthMessage);
        const profile = event.data.profile;
        saveDeviceAccount(profile);
        setDeviceAccounts(getDeviceAccounts());
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(SINGLE_USER_STORAGE_KEY, JSON.stringify(profile));
          localStorage.setItem('sakugrosir_is_logged_in', 'true');
        }
        playSuccessSound();
        if (onLoginSuccess) {
          onLoginSuccess(profile);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);

    // Fallback deteksi storage lintas tab jika window.opener dibatasi browser
    const handleStorageChange = (e) => {
      if (e.key === 'sakugrosir_is_logged_in' && e.newValue === 'true') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('message', handleAuthMessage);
        try {
          const userRaw = localStorage.getItem(SINGLE_USER_STORAGE_KEY);
          if (userRaw) {
            const profile = JSON.parse(userRaw);
            playSuccessSound();
            if (onLoginSuccess) onLoginSuccess(profile);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-sky-50/50 via-white to-slate-50 select-none animate-fade-in relative">
      {/* 1. TOP HEADER STATUS BADGES */}
      <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1 px-0.5">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
          <span className="text-slate-800 tracking-tight font-extrabold text-[10.5px]">
            PWA · OFFLINE ENGINE READY
          </span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-bold text-[10.5px]">Sentinel Shield Active</span>
        </div>
      </div>

      {/* 2. APP LOGO & BRANDING HERO */}
      <div className="flex flex-col items-center text-center my-auto py-3">
        {/* Logo Emerald Rounded Box */}
        <div className="relative mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/25">
            <div className="relative flex flex-col items-center">
              <ShoppingBag className="w-9 h-9 text-white stroke-[2.3]" />
              <Lock className="w-4 h-4 text-emerald-200 stroke-[2.5] absolute bottom-1.5" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Smart Grocery Sentinel
        </h1>
        <p className="text-xs text-slate-600 font-semibold mt-1">
          Asisten Belanja Hemat &amp; Pelindung Anggaran Pintar
        </p>

        {/* Pill Badge */}
        <div className="mt-2.5 px-3.5 py-1 bg-sky-50 border border-sky-100 text-sky-800 rounded-full text-[11px] font-bold flex items-center space-x-1.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Offline-Ready • Cloud Sync Persistent</span>
        </div>

        {/* ============================================================== */}
        {/* FITUR AKUN TERDAFTAR DI PERANGKAT (DEVICE ACCOUNTS SELECTOR)    */}
        {/* ============================================================== */}
        {deviceAccounts.length > 0 && (
          <div className="w-full mt-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 text-left shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-extrabold text-slate-700 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Akun Tersimpan di Perangkat Ini:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Pilih untuk login cepat
              </span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5 no-scrollbar">
              {deviceAccounts.map((acc, idx) => {
                const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-300/60 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{(acc.name || acc.email).charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate leading-snug flex items-center space-x-1">
                          <span>{acc.name || 'Pengguna'}</span>
                          {isSelected && <span className="text-[9px] text-emerald-700 font-extrabold">● Dipilih</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Hapus Akun dari Perangkat Ini */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveAccount(e, acc.email)}
                      className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Akun dari Perangkat Ini"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. WHITE AUTH CARD CONTAINER */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm mt-3.5 text-left">
          {/* Segmented Switch: Masuk | Daftar */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setAuthMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setAuthMode('register');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Nama Lengkap (Khusus Mode Daftar) */}
            {authMode === 'register' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <span>Nama Lengkap</span>
                  <span className="text-[10px] text-slate-400 font-medium">Wajib</span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Alamat Email */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Alamat Email</span>
                <span className="text-[10px] text-slate-400 font-medium">Wajib</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  @
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Kata Sandi / PIN Keamanan */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Kata Sandi / PIN Keamanan</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">PIN 6-Digit</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Minimal 6 karakter atau PIN 6-digit"
                  maxLength={24}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Ingat Perangkat Ini & Lupa Sandi */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700 accent-emerald-800"
                />
                <span className="text-slate-700 font-semibold text-[11px]">Ingat Perangkat Ini</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setInfoMsg('Untuk mereset sandi, silakan gunakan PIN baru melalui tab Daftar atau hubungi admin.');
                  setTimeout(() => setInfoMsg(''), 4000);
                }}
                className="text-[11px] text-emerald-800 font-bold hover:underline"
              >
                Lupa PIN / Sandi?
              </button>
            </div>

            {/* Error Message Toast/Alert */}
            {errorMsg && (
              <div className="flex items-start space-x-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Info Message Box (e.g. Registrasi berhasil) */}
            {infoMsg && (
              <div className="flex items-start space-x-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-slide-up">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{infoMsg}</span>
              </div>
            )}

            {/* Primary Emerald Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{authMode === 'login' ? 'Masuk ke Keranjang Belanja' : 'Daftar Akun Baru'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider: ATAU MASUK DENGAN */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-2.5 tracking-wider">Atau Masuk Dengan</span>
            </div>
          </div>

          {/* Google Sign In Button - Langsung Terhubung ke Google OAuth */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Lanjutkan dengan Akun Google</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[10px] text-slate-400 font-medium py-1">
        Smart Grocery Sentinel v2.0 • Supabase Auth Integrated
      </div>
    </div>
  );
}
