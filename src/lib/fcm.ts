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
