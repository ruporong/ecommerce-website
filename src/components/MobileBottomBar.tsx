'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useEffect, useState } from 'react';

export default function MobileBottomBar({ onOpenCategories }: { onOpenCategories?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const totalCart = cartItems.reduce((total, item) => total + Number(item.quantity), 0);

  const wishlistItems = useWishlistStore((state) => state.items);
  const totalWishlist = wishlistItems.length;

  const accountLink = session?.user ? '/user/dashboard' : '/user/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isShop = pathname === '/shop' || pathname.startsWith('/category');
  const isAccount = pathname.startsWith('/user');

  return (
    <aside 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? 'text-charcoal font-bold' : 'text-gray-400 hover:text-charcoal font-medium'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isHome ? '2' : '1.8'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span className="text-[10px] tracking-wider uppercase mt-1">Home</span>
        </Link>

        {/* 2. Categories / Shop */}
        <Link 
          href="/shop"
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isShop ? 'text-charcoal font-bold' : 'text-gray-400 hover:text-charcoal font-medium'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
          <span className="text-[10px] tracking-wider uppercase mt-1">Catalog</span>
        </Link>

        {/* 3. Wishlist */}
        <button 
          type="button"
          onClick={() => useWishlistStore.getState().openDrawer()}
          className="flex flex-col items-center justify-center py-1 text-gray-400 hover:text-charcoal font-medium transition-colors relative"
        >
          <div className="relative">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={mounted && totalWishlist > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {mounted && totalWishlist > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {totalWishlist}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase mt-1">Wishlist</span>
        </button>

        {/* 4. Bag / Cart */}
        <button 
          type="button"
          onClick={() => useCartStore.getState().openDrawer()}
          className="flex flex-col items-center justify-center py-1 text-gray-400 hover:text-charcoal font-medium transition-colors relative"
        >
          <div className="relative">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            {mounted && totalCart > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-charcoal text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {totalCart}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase mt-1">Bag</span>
        </button>

        {/* 5. Account */}
        <Link 
          href={accountLink}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isAccount ? 'text-charcoal font-bold' : 'text-gray-400 hover:text-charcoal font-medium'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isAccount ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span className="text-[10px] tracking-wider uppercase mt-1">Account</span>
        </Link>

      </div>
    </aside>
  );
}
