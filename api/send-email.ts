// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, code, name } = req.body || {};
  if (!to || !code) return res.status(400).json({ error: 'Missing to or code' });

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Codixa" <${process.env.SMTP_USER}>`,
      to,
      subject: 'كود تفعيل حسابك في كودكسا',
      html: buildHtml(code, name),
    });

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

function buildHtml(code, name) {
  return `
    <div style="font-family: Arial; max-width: 480px; margin: auto; padding: 32px;">
      <h2 style="color: #0f172a;">مرحبًا ${name || 'بك'} 👋</h2>
      <p style="color: #334155; font-size: 16px;">كود التفعيل الخاص بك:</p>
      <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center; font-size: 36px; letter-spacing: 12px; font-weight: bold; color: #0f172a; margin: 16px 0; direction: ltr;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 14px;">أدخل هذا الكود في صفحة التفعيل لتفعيل حسابك.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    </div>
  `;
}
