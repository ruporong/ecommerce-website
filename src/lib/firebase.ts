import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Initialize Firebase only if config is provided
export const initFirebase = (configStr: string) => {
  try {
    let config;
    try {
      config = JSON.parse(configStr);
    } catch(e) {
      const match = configStr.match(/\{[\s\S]*?\}/);
      if (match) {
        try {
          config = new Function('return ' + match[0])();
        } catch(err) {
          throw e; // original error
        }
      } else {
        throw e;
      }
    }
    if (!getApps().length) {
      return initializeApp(config);
    }
    return getApp();
  } catch (e) {
    console.error("Firebase config parsing error", e);
    return null;
  }
};

export const requestFirebaseToken = async (configStr: string, vapidKey: string, swRegistration?: ServiceWorkerRegistration) => {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const app = initFirebase(configStr);
    if (!app) return null;

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration });
      return token;
    }
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export const listenForMessages = (configStr: string, callback: (payload: any) => void) => {
  try {
    const app = initFirebase(configStr);
    if (!app) return;
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Failed to set up message listener', error);
  }
};
