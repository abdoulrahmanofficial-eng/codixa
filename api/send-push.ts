// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userName, amount } = req.body || {};
  if (!userName || !amount) return res.status(400).json({ error: 'Missing userName or amount' });

  webpush.setVapidDetails(
    'mailto:admin@codixa.io',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const subscriptions: any[] = [];

  try {
    const { default: admin } = await import('firebase-admin');

    if (!admin.apps.length) {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        return res.status(200).json({ ok: false, reason: 'FIREBASE_SERVICE_ACCOUNT env not set' });
      }
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        databaseURL: 'https://codixa-io-default-rtdb.firebaseio.com',
      });
    }

    const snap = await admin.database().ref('admin-push-subs').once('value');
    if (snap.exists()) {
      const data = snap.val();
      for (const uid of Object.keys(data)) {
        const subs = data[uid];
        if (typeof subs === 'object' && subs !== null) {
          for (const key of Object.keys(subs)) {
            const sub = subs[key];
            if (sub?.endpoint && sub?.keys) {
              subscriptions.push(sub);
            }
          }
        }
      }
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to read subscriptions' });
  }

  if (subscriptions.length === 0) {
    return res.json({ ok: true, sent: 0, total: 0 });
  }

  const payload = JSON.stringify({
    title: '💰 ' + (req.body.lang === 'ar' ? 'طلب شحن جديد' : 'New Deposit'),
    body: userName + ' — ' + amount + ' EGP',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    clickUrl: '/admin',
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub: any) => webpush.sendNotification(sub, payload))
  );

  res.json({
    ok: true,
    sent: results.filter(r => r.status === 'fulfilled').length,
    total: subscriptions.length,
  });
}
