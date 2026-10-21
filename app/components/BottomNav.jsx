'use client';

import React from 'react';
import { Home, ReceiptText, Mail, User } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function BottomNav({ activeTab = 'home', onChangeTab, ordersCount = 0 }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ReceiptText, badge: ordersCount > 0 ? ordersCount : null },
    { id: 'inbox', label: 'Inbox', icon: Mail, badge: 'Promo' },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white border-t border-gray-100 shadow-nav pb-safe">
      <div className="grid grid-cols-4 h-16 items-center px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                if (onChangeTab) onChangeTab(tab.id);
              }}
              className="flex flex-col items-center justify-center h-full relative focus:outline-none group active-press"
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive 
                      ? 'text-grab-green stroke-[2.5]' 
                      : 'text-subtext stroke-2'
                  }`} 
                />

                {/* Badge indicator */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 bg-grab-green text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span 
                className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive 
                    ? 'text-grab-green font-bold' 
                    : 'text-subtext group-hover:text-charcoal'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Tab bar indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-grab-green rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
