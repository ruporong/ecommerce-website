importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// We need to fetch the config from an API or just rely on URL params, but SW can't easily query the DB.
// Since the SW just needs basic config, we can inject it via a query param when registering, or we can fetch an API.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const config = event.data.config;
    if (config && !firebase.apps.length) {
      firebase.initializeApp(config);
      const messaging = firebase.messaging();
      
      messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body,
          icon: '/icon.png'
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  }
});
