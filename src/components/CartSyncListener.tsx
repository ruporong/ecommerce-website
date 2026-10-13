'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function CartSyncListener() {
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart_session_id', sessionId);
    }
    const fcmToken = localStorage.getItem('fcm_token_value');

    const syncCart = async () => {
      try {
        await fetch('/api/cart-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, token: fcmToken, items })
        });
      } catch (e) {
        console.error('Failed to sync cart', e);
      }
    };

    // Debounce it a bit
    const timer = setTimeout(syncCart, 2000);
    return () => clearTimeout(timer);
  }, [items]);

  return null;
}
