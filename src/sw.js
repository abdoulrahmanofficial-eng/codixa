import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

self.skipWaiting();
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', event => {
  let data = { title: 'Codixa', body: '', icon: '/icon-192.png', badge: '/icon-192.png', clickUrl: '/' };
  try {
    const payload = event.data?.json();
    if (payload) {
      data = { ...data, ...payload };
    }
  } catch {}
  const show = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: { clickUrl: data.clickUrl },
    tag: 'codixa-notification',
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
  });
  event.waitUntil(show);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.clickUrl || '/';
  event.waitUntil(clients.openWindow(url));
});
