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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, lessonContent, lessonTitle, courseTitle } = req.body;

  if (!message?.trim() || !lessonContent?.trim()) {
    return res.status(400).json({ error: 'message and lessonContent are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(lessonContent, lessonTitle, courseTitle) }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({ error: `Gemini API error: ${errText}` });
    }

    const body = response.body;
    if (!body) {
      return res.status(502).json({ error: 'No response body from Gemini' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(text);
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }

    res.end();
  } catch (e: any) {
    console.error('Chat API error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
