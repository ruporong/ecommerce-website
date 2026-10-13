'use client';

import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = items.reduce((total, item) => total + Number(item.quantity), 0);
  const totalPrice = items.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      ></div>

      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[100] shadow-2xl transition-transform duration-500 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
          <h3 className="font-serif text-2xl">Your Bag (<span className="cart-count text-dusty-rose">{totalItems}</span>)</h3>
          <button onClick={closeDrawer} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p className="text-lg font-serif">Your bag is empty</p>
              <button onClick={closeDrawer} className="mt-4 text-xs tracking-widest uppercase border-b border-charcoal pb-1 text-charcoal hover:text-dusty-rose hover:border-dusty-rose transition-colors">Continue Shopping</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:border-dusty-rose/30 transition-colors">
                  <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 transition-all opacity-100 shadow-sm z-10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                  <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top mix-blend-multiply" />
                    ) : (
                      <PlaceholderImage className="w-full h-full object-cover object-top mix-blend-multiply" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col py-1">
                    <div className="pr-4">
                      <h4 className="text-sm font-medium hover:text-dusty-rose transition-colors line-clamp-2 leading-snug">
                        <Link href={`/product/${item.id}`} onClick={closeDrawer}>{item.name}</Link>
                      </h4>
                      <p className="font-serif text-lg text-charcoal mt-2">৳{item.price}</p>
                    </div>
                    
                    <div className="mt-auto flex justify-between items-end">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-charcoal transition-colors disabled:opacity-30" disabled={item.quantity <= 1}>-</button>
                        <span className="w-8 text-center text-xs font-medium text-charcoal">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-charcoal transition-colors">+</button>
                      </div>
                      <span className="text-xs text-gray-400 font-medium tracking-wide">TOTAL: ৳{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="font-serif text-xl">৳{totalPrice}</span>
          </div>
          <Link href="/checkout" onClick={closeDrawer} className="w-full py-4 bg-charcoal text-white text-[13px] tracking-widest uppercase font-medium rounded-2xl hover:bg-dusty-rose transition-colors flex justify-center">
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
