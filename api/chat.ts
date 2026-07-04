import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatRequest } from '../src/lib/ai/types';
import { createGeminiProvider } from '../src/lib/ai/gemini';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  return key;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: ChatRequest = req.body;
    if (!body.message?.trim() || !body.lessonContent?.trim()) {
      return res.status(400).json({ error: 'message and lessonContent are required' });
    }

    const apiKey = getApiKey();
    const provider = createGeminiProvider(apiKey);
    const stream = await provider.chat(body);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (e: any) {
    console.error('Chat API error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
