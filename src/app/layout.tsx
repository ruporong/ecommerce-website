import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Script from 'next/script';

import PushNotificationManager from '@/components/PushNotificationManager';
import TrackingScripts from '@/components/TrackingScripts';
import UtmTracker from '@/components/UtmTracker';
import { Suspense } from 'react';
import AuthProvider from '@/components/AuthProvider';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico';
  let storeName = 'Ruporong';
  let googleVerificationCode = '';

  try {
    await connectToDatabase();
    const faviconSetting = await Setting.findOne({ key: 'favicon_url' }).lean();
    if (faviconSetting?.value) faviconUrl = faviconSetting.value;
    const nameSetting = await Setting.findOne({ key: 'store_name' }).lean();
    if (nameSetting?.value) storeName = nameSetting.value;
    
    const googleVerificationSetting = await Setting.findOne({ key: 'google_site_verification' }).lean();
    googleVerificationCode = googleVerificationSetting?.value || '';
    
    if (googleVerificationCode && googleVerificationCode.includes('content=')) {
      const match = googleVerificationCode.match(/content=["']([^"']+)["']/i);
      if (match) {
        googleVerificationCode = match[1];
      }
    }
  } catch (error) {
    console.warn('Could not connect to database during RootLayout metadata generation, using fallback:', error);
  }
  
  return {
    title: storeName,
    description: "Discover the latest in premium women's fashion. Shop dresses, sarees, abayas, and more at " + storeName + ".",
    icons: {
      icon: faviconUrl,
    },
    verification: {
      google: googleVerificationCode || undefined,
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let firebaseConfigStr = '';
  let vapidKeyStr = '';

  try {
    await connectToDatabase();
    const firebaseConfigSetting = await Setting.findOne({ key: 'firebase_client_config' }).lean();
    const vapidKeySetting = await Setting.findOne({ key: 'firebase_vapid_key' }).lean();
    firebaseConfigStr = firebaseConfigSetting?.value || '';
    vapidKeyStr = vapidKeySetting?.value || '';
  } catch (error) {
    console.warn('Could not connect to database in RootLayout, using fallback:', error);
  }
  
  return (
    <html lang="en">
      <body className="font-sans text-charcoal bg-warm-white no-scrollbar">
        <AuthProvider>
        {children}
        <Toaster position="bottom-right" />
        <PushNotificationManager 
          configStr={firebaseConfigStr} 
          vapidKey={vapidKeyStr} 
        />
        <TrackingScripts />
        <Suspense fallback={null}><UtmTracker /></Suspense>
      </AuthProvider>
      </body>
    </html>
  );
}
