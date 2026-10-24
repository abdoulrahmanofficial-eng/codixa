// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, newPassword } = req.body || {};
  if (!email || !newPassword) return res.status(400).json({ error: 'Missing email or newPassword' });

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'codixa-io';

  if (!privateKey || !clientEmail) {
    return res.status(500).json({ error: 'Firebase Admin not configured' });
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);
    await updateUserPassword(accessToken, projectId, email, newPassword);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

function signJwt(clientEmail, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
    sub: clientEmail,
  };
  const message = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(message), privateKey.replace(/\\n/g, '\n'));
  return `${message}.${base64url(sig)}`;
}

async function getAccessToken(clientEmail, privateKey) {
  const jwt = signJwt(clientEmail, privateKey);
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error_description || 'Failed to get access token');
  return data.access_token;
}

async function updateUserPassword(accessToken, projectId, email, newPassword) {
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: [], email: [email] }),
    }
  );
  const lookup = await resp.json();
  if (!resp.ok || !lookup.users || !lookup.users.length) {
    throw new Error('User not found');
  }
  const uid = lookup.users[0].localId;
  const updateResp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: uid, password: newPassword }),
    }
  );
  const updateData = await updateResp.json();
  if (!updateResp.ok) throw new Error(updateData.error?.message || 'Failed to update password');
}
