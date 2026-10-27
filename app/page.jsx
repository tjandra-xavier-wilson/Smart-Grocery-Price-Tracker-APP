'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryCarousel from './components/CategoryCarousel';
import PromoBanner from './components/PromoBanner';
import ProductCard from './components/ProductCard';
import FloatingCartBar from './components/FloatingCartBar';
import BottomNav from './components/BottomNav';
import CheckoutDrawer from './components/CheckoutDrawer';
import AuthModal from './components/AuthModal';
import OrdersTab from './components/OrdersTab';
import AccountTab from './components/AccountTab';
import InboxTab from './components/InboxTab';
import { CATEGORIES, GROCERY_PRODUCTS, PROMO_BANNERS } from './data/groceryData';
import { supabase, getSingleUserSession, signOutUser } from '../src/lib/supabaseClient';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { playTapSound } from './utils/sound';

export default function Home() {
  const [currentAddress, setCurrentAddress] = useState('Lotte Mart Grocery - Puri Indah');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [appliedVoucher, setAppliedVoucher] = useState('PASARHEMAT');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('checking');
  const [currentUser, setCurrentUser] = useState(null);

  // Initial cart with realistic market grocery items (matching DT2 scenario)
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-1',
      name: 'Beras Rojolele Super Pulen',
      price: 74000,
      originalPrice: 82000,
      quantity: 1,
      unit: 'karung 5kg',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      category: 'sembako'
    },
    {
      id: 'prod-2',
      name: 'Minyak Goreng Sawit Murni 2L',
      price: 43000,
      originalPrice: 48000,
      quantity: 1,
      unit: 'pouch 2 liter',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
      category: 'sembako'
    }
  ]);

  // Check Supabase connection and load single-user session on load
  useEffect(() => {
    async function initSession() {
      // 1. Supabase Health Check
      try {
        const { error } = await supabase.from('budget_settings').select('id').limit(1);
        if (error) {
          setSupabaseStatus('offline');
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        setSupabaseStatus('offline');
      }

      // 2. Load Single-User Google Account
      const user = await getSingleUserSession();
      setCurrentUser(user);
    }

    initSession();

    // 3. Supabase Auth Listener for live Google OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url || null,
          provider: 'google',
          role: 'single_owner',
          isDesignatedOwner: true
        };
        setCurrentUser(profile);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  // Filter products based on search & category
  const filteredProducts = GROCERY_PRODUCTS.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'promo') return matchesSearch && product.discountPercent >= 15;
    return matchesSearch && product.category === selectedCategory;
  });

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: 1,
          unit: product.unit,
          image: product.image,
          category: product.category
        }
      ];
    });
  };

  const handleRemoveFromCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.id !== product.id);
      }
      return prev.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const getProductCartQuantity = (productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cartItems.length;
  const totalCartPrice = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      {/* Mobile Shell Mockup Wrapper */}
      <div className="w-full max-w-[430px] bg-white min-h-screen md:min-h-[890px] md:max-h-[920px] md:rounded-[44px] shadow-2xl md:ring-12 md:ring-slate-800/80 overflow-hidden flex flex-col relative transition-all duration-300">
        
        {/* Simulated Mobile Status Bar */}
        <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-800 font-semibold shrink-0 select-none border-b border-slate-50">
          <span className="font-bold tracking-tight">09:41</span>
          <div className="w-20 h-4 bg-slate-200/80 rounded-full flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-700">
            <span>5G</span>
            <span>●●●</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Scrollable Main Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-white">
          {activeTab === 'home' && (
            <div className="space-y-0">
              {/* 1. Header (Sticky) */}
              <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                currentAddress={currentAddress}
                setCurrentAddress={setCurrentAddress}
                supabaseStatus={supabaseStatus}
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />

              {/* 2. Category Carousel (Horizontal Scroll) */}
              <CategoryCarousel
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setSelectedCategory(id);
                }}
              />

              {/* 3. Banner Section */}
              <PromoBanner
                banners={PROMO_BANNERS}
                onApplyPromo={(code) => setAppliedVoucher(code)}
              />

              {/* Clean Minimalist Divider */}
              <div className="h-2 bg-slate-100/70 w-full" />

              {/* 4. Product Grid (Grocery Items) */}
              <section className="px-4 py-4 pb-36">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Katalog Pasar &amp; Bahan Pokok
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      35 pilihan bahan segar langsung dari pedagang pasar &amp; grosir
                    </p>
                  </div>
                  {filteredProducts.length > 0 && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {filteredProducts.length} Produk
                    </span>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">Produk tidak ditemukan</h4>
                    <p className="text-xs text-slate-500">
                      Coba cari dengan kata kunci lain seperti &quot;beras&quot;, &quot;minyak&quot;, atau &quot;telur&quot;.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  /* 2-column clean minimalist grid layout */
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantityInCart={getProductCartQuantity(product.id)}
                        onAddToCart={handleAddToCart}
                        onRemoveFromCart={handleRemoveFromCart}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrdersTab 
              onReorder={(order) => {
                setActiveTab('home');
                setIsCheckoutOpen(true);
              }} 
            />
          )}

          {activeTab === 'inbox' && (
            <InboxTab 
              onApplyVoucher={(code) => {
                setAppliedVoucher(code);
                setActiveTab('home');
                setIsCheckoutOpen(true);
              }} 
            />
          )}

          {activeTab === 'account' && (
            <AccountTab 
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* 5. Floating Cart Bar */}
        {activeTab === 'home' && totalCartCount > 0 && (
          <FloatingCartBar
            totalItems={totalCartCount}
            totalPrice={totalCartPrice}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {/* 6. Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tabId) => setActiveTab(tabId)}
          ordersCount={1}
        />

        {/* Slide-Up Checkout Drawer */}
        <CheckoutDrawer
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={(id) => handleUpdateQuantity(id, 0)}
          onClearCart={handleClearCart}
          currentAddress={currentAddress}
          appliedVoucher={appliedVoucher}
          onApplyVoucher={(code) => setAppliedVoucher(code)}
          onOrderSuccess={() => {}}
        />

        {/* Google Authentication & Single-User Access Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
          }}
        />

        {/* Home Indicator bar */}
        <div className="hidden md:flex justify-center pb-2 bg-white shrink-0 pointer-events-none">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </main>
  );
}
