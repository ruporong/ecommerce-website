'use client';
import { useEffect, useState } from 'react';
import { requestFirebaseToken, listenForMessages } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function PushNotificationManager({ configStr, vapidKey }: { configStr: string, vapidKey: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'customer';
  useEffect(() => {
    if (!configStr || !vapidKey) return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Send config to SW
        const sw = registration.active || registration.waiting || registration.installing;
        if (sw) {
          
          let parsedConfig;
          try {
            parsedConfig = JSON.parse(configStr);
          } catch(e) {
            // In case user pasted "const firebaseConfig = { ... }"
            const match = configStr.match(/\{[\s\S]*?\}/);
            if (match) {
              try { parsedConfig = new Function('return ' + match[0])(); } catch(err) { parsedConfig = null; }
            }
          }
          if (parsedConfig) {
            sw.postMessage({ type: 'FIREBASE_CONFIG', config: parsedConfig });
          }
  
        }
        
        // Wait for user interaction or just request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await requestFirebaseToken(configStr, vapidKey, registration);
          listenForMessages(configStr, (payload) => {
            toast.success(`${payload.notification?.title}\n${payload.notification?.body}`, {
              duration: 5000,
              position: 'top-right',
            });
          });
          
          if (token) {
            const savedRole = localStorage.getItem('fcm_token_role');
            if (!localStorage.getItem('fcm_token_saved') || savedRole !== role) {
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, role })
              });
              localStorage.setItem('fcm_token_value', token);
              localStorage.setItem('fcm_token_saved', 'true');
              localStorage.setItem('fcm_token_role', role);
            }
          }

        }
      } catch (e) {
        console.error('Push setup failed', e);
      }
    };

    // Ask after a few seconds to not block main thread / UX
    setTimeout(setup, 3000);

  }, [configStr, vapidKey, role]);

  return null;
}
