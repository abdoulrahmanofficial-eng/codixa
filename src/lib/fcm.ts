import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ref, set } from 'firebase/database';
import { auth, rtdb } from './firebase';

const VAPID_KEY = 'BCSBSR6PvDWD0AHo3HT0QiZo6YbKE0RypBodZKmQ13Rj8_XwAV3yVmwWYU0niBbjK1z9BsLHF3LDmTAklZ30Pa0';

export async function initAdminFcm() {
  if (!auth.currentUser) return;
  if (typeof Notification === 'undefined') return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    await set(ref(rtdb, `admin-fcm-tokens/${auth.currentUser.uid}`), {
      token,
      email: auth.currentUser.email,
      updatedAt: Date.now(),
    });

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Codixa';
      const body = payload.notification?.body || '';
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
    });
  } catch {
    // FCM may not be available in all environments
  }
}
