import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import Setting from '@/models/Setting';
import connectToDatabase from './mongodb';

export const getFirebaseAdmin = async () => {
  if (getApps().length > 0) {
    return getApp();
  }

  await connectToDatabase();
  const serviceAccountSetting = await Setting.findOne({ key: 'firebase_service_account' });
  
  if (!serviceAccountSetting || !serviceAccountSetting.value) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountSetting.value);
    
    return initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
    return null;
  }
};
