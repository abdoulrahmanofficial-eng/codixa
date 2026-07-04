import type { VercelRequest, VercelResponse } from '@vercel/node';

function buildSystemPrompt(lessonContent: string, lessonTitle?: string, courseTitle?: string): string {
  const parts: string[] = [
    'You are Codixa AI, a friendly programming assistant integrated into the Codixa learning platform.',
    '',
    'Your ONLY role is to help students learn programming and computer science.',
    '',
    'The student is currently viewing:',
  ];
  if (courseTitle) parts.push(`- Course: ${courseTitle}`);
  if (lessonTitle) parts.push(`- Lesson: ${lessonTitle}`);
  parts.push(
    '',
    'Here is the content of the current lesson — use this as your primary reference:',
    '---',
    lessonContent,
    '---',
    '',
    'Rules you MUST follow:',
    '- Answer ONLY programming and computer science questions.',
    '- Explain code from the lesson clearly, step by step.',
    '- Explain lesson concepts in simple, beginner-friendly terms.',
    '- Help debug programming errors when asked.',
    '- Generate practice quizzes based on the lesson when asked.',
    '- If asked about non-programming topics, politely say you can only help with programming and computer science.',
    '- Be encouraging and supportive.',
    '- Respond in the same language as the lesson content (Arabic or English).',
    '- Format code blocks with triple backticks and the language name.',
    '- Keep explanations concise and clear.',
  );
  return parts.join('\n');
}

async function streamOpenAI(message: string, history: any[], lessonContent: string, lessonTitle?: string, courseTitle?: string): Promise<ReadableStream> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const messages: any[] = [
    { role: 'system', content: buildSystemPrompt(lessonContent, lessonTitle, courseTitle) },
  ];
  if (history && Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role && msg.content) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const body = response.body;
  if (!body) throw new Error('No response body');

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {}
          }
        }
      } catch (e) { controller.error(e); }
      finally { controller.close(); reader.releaseLock(); }
    },
  });
}

async function streamOpenCodeZen(message: string, history: any[], lessonContent: string, lessonTitle?: string, courseTitle?: string): Promise<ReadableStream> {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenCode Zen API key not configured');

  const model = process.env.ZEN_MODEL || 'deepseek-v4-flash-free';

  const messages: any[] = [
    { role: 'system', content: buildSystemPrompt(lessonContent, lessonTitle, courseTitle) },
  ];
  if (history && Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role && msg.content) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenCode Zen API error: ${err}`);
  }

  const body = response.body;
  if (!body) throw new Error('No response body');

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {}
          }
        }
      } catch (e) { controller.error(e); }
      finally { controller.close(); reader.releaseLock(); }
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, lessonContent, lessonTitle, courseTitle } = req.body;

  if (!message?.trim() || !lessonContent?.trim()) {
    return res.status(400).json({ error: 'message and lessonContent are required' });
  }

  try {
    const provider = process.env.AI_PROVIDER || 'opencode';
    let stream: ReadableStream;

    if (provider === 'openai') {
      stream = await streamOpenAI(message, history, lessonContent, lessonTitle, courseTitle);
    } else if (provider === 'gemini') {
      const { streamGemini } = await import('./_gemini');
      stream = await streamGemini(message, history, lessonContent, lessonTitle, courseTitle);
    } else {
      stream = await streamOpenCodeZen(message, history, lessonContent, lessonTitle, courseTitle);
    }

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
