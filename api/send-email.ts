// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, code, name } = req.body || {};
  if (!to || !code) return res.status(400).json({ error: 'Missing to or code' });

  // Try Resend first (works for owner's email)
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (RESEND_KEY) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Codixa <onboarding@resend.dev>',
          to,
          subject: 'كود تفعيل حسابك في كودكسا',
          html: buildHtml(code, name),
        }),
      });
      const data = await resp.json();
      if (resp.ok) return res.json({ ok: true, id: data.id });
    } catch {}
  }

  // Brevo API (no IP whitelist needed)
  const BREVO_KEY = process.env.SMTP_PASS;
  if (BREVO_KEY) {
    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Codixa', email: 'codixa.info.io@gmail.com' },
          to: [{ email: to, name: name || '' }],
          subject: 'كود تفعيل حسابك في كودكسا',
          htmlContent: buildHtml(code, name),
        }),
      });
      const data = await resp.json();
      if (resp.ok) return res.json({ ok: true, id: data.messageId });
      return res.status(500).json({ error: 'Brevo API error', details: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.json({ ok: false, reason: 'No email provider configured. Set RESEND_API_KEY or SMTP_PASS (Brevo key)' });
}

function buildHtml(code: string, name?: string) {
  return `
    <div style="font-family: Arial; max-width: 480px; margin: auto; padding: 32px;">
      <h2 style="color: #0f172a;">مرحبًا ${name || 'بك'} 👋</h2>
      <p style="color: #334155; font-size: 16px;">كود التفعيل الخاص بك:</p>
      <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center; font-size: 36px; letter-spacing: 12px; font-weight: bold; color: #0f172a; margin: 16px 0; direction: ltr;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 14px;">أدخل هذا الكود في صفحة التفعيل لتفعيل حسابك. الكود صالح لمدة 10 دقائق.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة.</p>
    </div>
  `;
}
