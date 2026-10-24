import type { VercelRequest, VercelResponse } from '@vercel/node';

const IMAGE_MODEL = process.env.IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = (req.body?.prompt || '').toString().trim();
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiKey = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
  if (!accountId || !apiKey) {
    res.status(500).json({ error: 'Image generation is not configured on the server' });
    return;
  }

  try {
    const upstream = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${IMAGE_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt: prompt.slice(0, 2048), steps: 6 }),
      },
    );

    if (!upstream.ok) {
      const err = await upstream.text();
      console.error('Image API error:', upstream.status, err);
      res.status(500).json({ error: `Image API error: ${err.slice(0, 300)}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data: any = await upstream.json();
      const base64 = data?.result?.image;
      if (!base64) {
        res.status(500).json({ error: 'No image returned' });
        return;
      }
      res.status(200).json({ image: `data:image/jpeg;base64,${base64}` });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    const mime = contentType.includes('jpeg') ? 'image/jpeg' : 'image/png';
    res.status(200).json({ image: `data:${mime};base64,${buf.toString('base64')}` });
  } catch (e: any) {
    console.error('Generate image error:', e);
    res.status(500).json({ error: e.message || 'Image generation failed' });
  }
}
