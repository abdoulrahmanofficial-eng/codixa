import { ref, push, set } from 'firebase/database';
import { rtdb } from './firebase';

const VAPID_PUBLIC_KEY = 'BCSBSR6PvDWD0AHo3HT0QiZo6YbKE0RypBodZKmQ13Rj8_XwAV3yVmwWYU0niBbjK1z9BsLHF3LDmTAklZ30Pa0';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, c => c.charCodeAt(0));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function showBrowserNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icon-192.png', tag: 'codixa-admin' });
    } catch {
      // Notifications may not be available
    }
  }
}

export async function subscribeToPush(uid: string): Promise<boolean> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subRef = push(ref(rtdb, `admin-push-subs/${uid}`));
    await set(subRef, subscription.toJSON());

    return true;
  } catch (err) {
    console.error('Push subscribe error:', err);
    return false;
  }
}


