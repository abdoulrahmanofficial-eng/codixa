import type { ChatRequest } from '../src/lib/ai/types';
import { createGeminiProvider } from '../src/lib/ai/gemini';

export const config = {
  runtime: 'nodejs18.x',
};

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  return key;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    if (!body.message?.trim() || !body.lessonContent?.trim()) {
      return new Response(
        JSON.stringify({ error: 'message and lessonContent are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = getApiKey();
    const provider = createGeminiProvider(apiKey);
    const stream = await provider.chat(body);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e: any) {
    console.error('Chat API error:', e);
    return new Response(
      JSON.stringify({ error: e.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
