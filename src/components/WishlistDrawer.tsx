'use client';

import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function WishlistDrawer() {
  const { isDrawerOpen, closeDrawer, items, removeItem } = useWishlistStore();
  const { addItem, openDrawer: openCartDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

    closeDrawer();
    openCartDrawer();
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      ></div>

      {/* Wishlist Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-[100] shadow-2xl transition-transform duration-500 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl text-charcoal">Your Wishlist</h3>
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-charcoal rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={closeDrawer} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-charcoal hover:bg-black hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <p className="text-lg font-serif text-charcoal mb-1">Your wishlist is empty</p>
              <p className="text-xs text-gray-500 mb-6">Explore our collections and save your favorite items.</p>
              <Link 
                href="/shop" 
                onClick={closeDrawer}
                className="px-6 py-2.5 bg-charcoal text-white text-xs tracking-widest uppercase font-medium rounded-full hover:bg-black transition-colors"
              >
                Discover Collections
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const hasDiscount = Boolean(item.discount_price && Number(item.discount_price) > 0 && Number(item.discount_price) < Number(item.price));
                const effectivePrice = hasDiscount ? Number(item.discount_price) : Number(item.price);

                return (
                  <div 
                    key={item.id} 
                    className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-all"
                  >
                    {/* Remove button */}
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-10"
                      title="Remove from wishlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>

                    {/* Image */}
                    <Link 
                      href={`/product/${item.slug}`} 
                      onClick={closeDrawer}
                      className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 block"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <PlaceholderImage className="w-full h-full object-cover object-top" />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link 
                          href={`/product/${item.slug}`} 
                          onClick={closeDrawer}
                          className="text-sm font-serif font-medium text-charcoal hover:underline line-clamp-1 block"
                        >
                          {item.name}
                        </Link>
                        {item.category && (
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                        )}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-semibold text-charcoal text-sm">৳{effectivePrice}</span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">৳{item.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Add to Bag button */}
                      <button 
                        onClick={() => handleMoveToCart(item)}
                        className="mt-2 w-full py-2 px-3 text-[11px] tracking-widest uppercase font-bold bg-charcoal text-white rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <Link 
              href="/wishlist" 
              onClick={closeDrawer}
              className="block w-full text-center py-3 border border-charcoal text-charcoal text-xs tracking-widest uppercase font-bold rounded-xl hover:bg-charcoal hover:text-white transition-all"
            >
              View Full Wishlist Page
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
