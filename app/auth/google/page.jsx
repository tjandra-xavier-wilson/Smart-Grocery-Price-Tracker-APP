'use client';

import React, { useState, useEffect } from 'react';
import { User, ChevronRight, ArrowLeft } from 'lucide-react';
import { 
  saveDeviceAccount, 
  getDeviceAccounts, 
  SINGLE_USER_STORAGE_KEY,
  DESIGNATED_OWNER_EMAIL
} from '../../../src/lib/supabaseClient';

export default function GoogleAuthChooserPage() {
  const [deviceAccounts, setDeviceAccounts] = useState([]);
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const accounts = getDeviceAccounts();
      setDeviceAccounts(accounts);
    } catch (e) {}
  }, []);

  const defaultAccounts = [
    {
      name: 'Tjandra Xavier Wilson',
      email: 'xavierwilsontjandra@gmail.com',
      initial: 'T',
      avatarBg: 'bg-[#5f6368]',
      type: 'user'
    },
    {
      name: 'Tjandra Xavier Wilson',
      email: DESIGNATED_OWNER_EMAIL,
      initial: 'T',
      avatarBg: 'bg-[#1a73e8]',
      verified: true,
      type: 'owner'
    },
    {
      name: 'Tjandra Wilson',
      email: 'tjandrawilson@mutiarabangsa.sch.id',
      initial: 'T',
      avatarBg: 'bg-[#00897b]',
      type: 'user'
    },
    {
      name: 'Tjandra Delvino Bryan',
      email: 'tjankwokming@gmail.com',
      initial: 'T',
      avatarBg: 'bg-[#d93025]',
      type: 'user'
    },
    {
      name: 'TJANDRA DELVINO BRYAN',
      email: 'tjandra.vino@gmail.com',
      initial: 'T',
      avatarBg: 'bg-[#8d6e63]',
      type: 'user'
    }
  ];

  const handleSelectAccount = (acc) => {
    const profile = {
      id: acc.id || 'goog_' + Date.now(),
      name: acc.name || acc.email.split('@')[0],
      email: acc.email.trim().toLowerCase(),
      avatar_url: acc.avatar_url || 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google',
      role: 'user',
      authenticated_at: new Date().toISOString()
    };

    try {
      saveDeviceAccount(profile);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SINGLE_USER_STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem('sakugrosir_is_logged_in', 'true');
      }
    } catch (e) {}

    // 1. Jika dibuka di dalam popup / child window: kirim pesan ke tab utama dan tutup
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          profile: profile
        }, '*');
      } catch (e) {}

      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          window.location.href = '/';
        }
      }, 150);
      return;
    }

    // 2. Jika dibuka di tab penuh: langsung redirect ke menu utama /
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMsg('Masukkan alamat email Google yang valid');
      return;
    }

    handleSelectAccount({
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim()
    });
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-sans flex flex-col justify-between p-6 select-none">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Google Branding Header */}
        <div className="mb-2 flex items-center space-x-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span className="text-sm font-medium text-[#c4c7c5]">Login dengan Google</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-normal text-white mt-4 mb-1">
          Pilih akun
        </h1>
        <p className="text-sm text-[#c4c7c5] mb-6">
          Lanjutkan ke <span className="text-white font-medium">Smart Grocery Sentinel</span>
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Account List matching Image 2 */}
        <div className="divide-y divide-[#282a2c] border-y border-[#282a2c]">
          {defaultAccounts.map((acc, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectAccount(acc)}
              className="py-3 px-1.5 flex items-center justify-between hover:bg-[#1e1f20] active:bg-[#282a2c] cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                <div className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-medium text-sm flex items-center justify-center shrink-0`}>
                  {acc.initial}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate group-hover:text-sky-300 transition-colors">
                    {acc.name}
                  </div>
                  <div className="text-xs text-[#9aa0a6] truncate font-mono">
                    {acc.email}
                  </div>
                </div>
              </div>
              {acc.verified && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full shrink-0 font-medium">
                  Terverifikasi
                </span>
              )}
            </div>
          ))}

          {/* Device accounts not already in list */}
          {deviceAccounts
            .filter(d => !defaultAccounts.some(da => da.email.toLowerCase() === d.email.toLowerCase()))
            .map((acc, idx) => (
              <div
                key={'dev-' + idx}
                onClick={() => handleSelectAccount(acc)}
                className="py-3 px-1.5 flex items-center justify-between hover:bg-[#1e1f20] active:bg-[#282a2c] cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-full bg-[#5f6368] text-white font-medium text-sm flex items-center justify-center shrink-0">
                    {(acc.name || acc.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate group-hover:text-sky-300 transition-colors">
                      {acc.name || 'Akun Google'}
                    </div>
                    <div className="text-xs text-[#9aa0a6] truncate font-mono">
                      {acc.email}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {/* Option: Gunakan Akun Lain */}
          {!showOtherForm ? (
            <div
              onClick={() => setShowOtherForm(true)}
              className="py-3.5 px-1.5 flex items-center space-x-3.5 hover:bg-[#1e1f20] active:bg-[#282a2c] cursor-pointer transition-colors text-white"
            >
              <div className="w-9 h-9 rounded-full border border-[#5f6368] flex items-center justify-center text-[#9aa0a6] shrink-0">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Gunakan akun lain</span>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="py-4 px-2 space-y-3 bg-[#1e1f20] rounded-xl my-2">
              <div className="text-xs text-[#c4c7c5] font-medium flex items-center justify-between">
                <span>Masukkan Akun Google Baru:</span>
                <button
                  type="button"
                  onClick={() => setShowOtherForm(false)}
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Batal
                </button>
              </div>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full px-3 py-2 bg-[#131314] border border-[#3c4043] rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
              />
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-3 py-2 bg-[#131314] border border-[#3c4043] rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Lanjutkan Masuk
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Google Footer */}
      <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between text-xs text-[#9aa0a6]">
        <span>Indonesia</span>
        <div className="flex items-center space-x-4">
          <span className="hover:underline cursor-pointer">Bantuan</span>
          <span className="hover:underline cursor-pointer">Privasi</span>
          <span className="hover:underline cursor-pointer">Persyaratan</span>
        </div>
      </div>
    </div>
  );
}
