// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

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
      // Resend returned an error — log and fall through
      console.error('Resend error:', data);
    } catch (e: any) { console.error('Resend exception:', e?.message); /* fall through to SMTP */ }
  }

  // SMTP fallback (Brevo / Sendinblue)
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  if (SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Codixa" <${process.env.SMTP_FROM || 'codixa.info.io@gmail.com'}>`,
        to,
        subject: 'كود تفعيل حسابك في كودكسا',
        html: buildHtml(code, name),
      });
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.json({ ok: false, reason: 'No email provider configured. Set RESEND_API_KEY or SMTP_USER+SMTP_PASS' });
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
