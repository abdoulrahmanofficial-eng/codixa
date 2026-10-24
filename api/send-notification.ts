// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

const RTDB_URL = 'https://codixa-io-default-rtdb.firebaseio.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { targetUserId, title, body, lang } = req.body || {};
  if (!targetUserId || !title) return res.status(400).json({ error: 'Missing targetUserId or title' });

  webpush.setVapidDetails(
    'mailto:admin@codixa.io',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const subsList: any[] = [];
  try {
    const resp = await fetch(`${RTDB_URL}/user-push-subs/${targetUserId}.json`);
    const data = await resp.json();
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const sub = data[key];
        if (sub?.endpoint && sub?.keys) {
          subsList.push(sub);
        }
      }
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to read subscriptions' });
  }

  if (subsList.length === 0) {
    return res.json({ ok: true, sent: 0, total: 0 });
  }

  const payload = JSON.stringify({
    title: lang === 'ar' ? title : title,
    body: body || (lang === 'ar' ? 'اضغط لعرض الإشعار' : 'Tap to view'),
    icon: 'https://codixa-io.vercel.app/icon-192.png',
    badge: 'https://codixa-io.vercel.app/icon-192.png',
    clickUrl: '/notifications',
  });

  const results = await Promise.allSettled(
    subsList.map((sub: any) => webpush.sendNotification(sub, payload))
  );

  res.json({
    ok: true,
    sent: results.filter(r => r.status === 'fulfilled').length,
    total: subsList.length,
  });
}
