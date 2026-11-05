'use client';

import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openDrawer: openCartDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-[60vh] py-16 px-4 max-w-6xl mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const handleMoveToCart = (item: any) => {
    const effectivePrice = item.discount_price && Number(item.discount_price) > 0 
      ? Number(item.discount_price) 
      : Number(item.price);

    addItem({
      id: item.id || item.slug,
      name: item.name,
      price: effectivePrice,
      image: item.image,
      quantity: 1,
    });

    openCartDrawer();
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] py-12 md:py-20 text-charcoal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-8 mb-10">
          <div>
            <span className="text-xs tracking-[0.25em] uppercase text-dusty-rose font-semibold block mb-2">
              Saved Items
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal tracking-tight">
              My Wishlist
            </h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'} saved</span>
              <button 
                onClick={clearWishlist}
                className="text-xs text-red-600 hover:text-red-700 underline underline-offset-4 tracking-wider uppercase font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 text-gray-400">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Your Wishlist is Empty</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
              Explore our fine collections and add your favorite dresses, sarees, and accessories to your wishlist.
            </p>
            <Link 
              href="/shop"
              className="inline-block px-8 py-3.5 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-black transition-all shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const hasDiscount = Boolean(item.discount_price && Number(item.discount_price) > 0 && Number(item.discount_price) < Number(item.price));
              const effectivePrice = hasDiscount ? Number(item.discount_price) : Number(item.price);
              const discountPercent = hasDiscount ? Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100) : 0;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>

                  {/* Image */}
                  <Link href={`/product/${item.slug}`} className="block relative aspect-[4/5] bg-gray-50 overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <PlaceholderImage className="w-full h-full object-cover object-top" />
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      {item.category && (
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
                          {item.category}
                        </span>
                      )}
                      <h3 className="font-serif text-base text-charcoal font-medium line-clamp-1 mb-2 hover:underline">
                        <Link href={`/product/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-semibold text-charcoal text-lg">৳{effectivePrice}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">৳{item.price}</span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 px-4 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
