// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, code, name, type } = req.body || {};
  if (!to || !code) return res.status(400).json({ error: 'Missing to or code' });

  const isReset = type === 'reset';
  const subject = isReset
    ? 'Reset your Codixa password'
    : 'Verify your Codixa email';

  const text = isReset
    ? `Your password reset code: ${code}\n\nEnter this code to reset your password. If you didn't request this, ignore this email.`
    : `Your verification code: ${code}\n\nEnter this code to activate your account.`;

  const senderName = process.env.BREVO_SENDER_NAME || 'Codixa';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
  const logoUrl = `${process.env.APP_URL || 'https://codixa-io.vercel.app'}/icon-512.png`;
  const html = buildHtml(code, name, isReset, logoUrl);

  try {
    if (process.env.BREVO_API_KEY) {
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to, ...(name ? { name } : {}) }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => '');
        throw new Error(`Brevo ${r.status}: ${detail}`.slice(0, 400));
      }
    } else {
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
        from: `"${senderName}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

function buildHtml(code, name, isReset, logoUrl) {
  const title = isReset ? 'Password Reset' : 'Email Verification';
  const greeting = `Hi ${name || 'there'},`;
  const message = isReset
    ? 'You requested a password reset. Enter the code below to continue:'
    : 'Thanks for signing up! Enter the code below to verify your email:';
  const helpText = isReset
    ? 'If you didn\'t request this, you can safely ignore this email.'
    : 'If you didn\'t create an account, you can safely ignore this email.';
  return `<!DOCTYPE html>
<html dir="ltr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7);padding:36px 32px;text-align:center">
<img src="${logoUrl}" width="56" height="56" alt="Codixa" style="display:block;margin:0 auto 16px;border-radius:16px;border:2px solid rgba(255,255,255,0.15)" />
<h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;letter-spacing:0.5px">${title}</h1>
<p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.7)">Codixa — Learn to code, your way.</p>
</td></tr>
<tr><td style="padding:36px 32px 28px">
<p style="margin:0 0 6px;font-size:16px;color:#cbd5e1;line-height:1.6">${greeting}</p>
<p style="margin:0 0 28px;font-size:15px;color:#94a3b8;line-height:1.6">${message}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.08));border-radius:16px;border:1.5px solid rgba(99,102,241,0.25);box-shadow:0 0 0 1px rgba(99,102,241,0.08)">
<tr><td align="center" style="padding:32px 20px">
<span style="font-size:48px;letter-spacing:14px;font-weight:800;color:#a5b4fc;font-family:'Courier New',monospace;user-select:all;-webkit-user-select:all">${code}</span>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;text-align:center">⏱ This code expires in <strong style="color:#cbd5e1">10 minutes</strong></p>
</td></tr>
<tr><td style="padding:0 32px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05)">
<tr><td style="padding:20px">
<p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;text-align:center">${helpText}</p>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:20px 32px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<p style="margin:0;font-size:12px;color:#475569;text-align:center">Codixa — Learn to code, your way.</p>
<p style="margin:4px 0 0;font-size:11px;color:#334155;text-align:center">This is an automated message, please do not reply.</p>
</td>
</tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
