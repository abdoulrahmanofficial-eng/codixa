// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(200).json({ ok: false, reason: 'RESEND_API_KEY not set' });

  const { to, code, name } = req.body || {};
  if (!to || !code) return res.status(400).json({ error: 'Missing to or code' });

  const subject = 'كود تفعيل حسابك في كودكسا';
  const html = `
    <div style="font-family: Arial; max-width: 480px; margin: auto; padding: 32px;">
      <h2 style="color: #0f172a;">مرحبًا ${name || 'بك'} 👋</h2>
      <p style="color: #334155; font-size: 16px;">كود التفعيل الخاص بك:</p>
      <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center; font-size: 36px; letter-spacing: 12px; font-weight: bold; color: #0f172a; margin: 16px 0;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 14px;">أدخل هذا الكود في صفحة التفعيل لتفعيل حسابك. الكود صالح لمدة 10 دقائق.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة.</p>
    </div>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Codixa <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    const data = await resp.json();
    res.json({ ok: resp.ok, id: data.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
