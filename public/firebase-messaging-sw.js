importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyChrCv4D91a2w4h7_wzGe8hdct5bP_Aamc",
  authDomain: "codixa-io.firebaseapp.com",
  databaseURL: "https://codixa-io-default-rtdb.firebaseio.com",
  projectId: "codixa-io",
  storageBucket: "codixa-io.firebasestorage.app",
  messagingSenderId: "305339914704",
  appId: "1:305339914704:web:d1f6be0efb5d89b5c281d5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Codixa Admin';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data?.click_action === 'OPEN_ADMIN'
    ? 'https://codixa-io.vercel.app/admin'
    : 'https://codixa-io.vercel.app';
  event.waitUntil(clients.openWindow(urlToOpen));
});
