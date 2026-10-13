"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 min-h-[70vh]">
      <h1 className="text-3xl font-serif text-charcoal mb-8">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-lg">
          <p className="text-gray-500 mb-6 text-lg">Your cart is currently empty.</p>
          <Link href="/" className="inline-block bg-charcoal text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-black transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-6">
                  <div className="w-24 h-32 bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium text-charcoal">{item.name}</h3>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">৳{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50">-</button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 sticky top-28">
              <h2 className="text-lg font-serif mb-6">Order Summary</h2>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">৳{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between mb-6 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium text-lg">৳{getTotalPrice()}</span>
              </div>
              <Link href="/checkout" className="block w-full bg-charcoal text-white text-center py-4 text-sm tracking-widest uppercase hover:bg-black transition-colors">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
