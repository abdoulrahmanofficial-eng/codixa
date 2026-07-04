import type { AIProvider, ChatRequest } from './types';

function buildSystemPrompt(req: ChatRequest): string {
  const parts: string[] = [
    'You are Codixa AI, a friendly programming assistant integrated into the Codixa learning platform.',
    '',
    'Your ONLY role is to help students learn programming and computer science.',
    '',
    'The student is currently viewing:',
  ];
  if (req.courseTitle) parts.push(`- Course: ${req.courseTitle}`);
  if (req.lessonTitle) parts.push(`- Lesson: ${req.lessonTitle}`);
  parts.push(
    '',
    'Here is the content of the current lesson — use this as your primary reference:',
    '---',
    req.lessonContent,
    '---',
    '',
    'Rules you MUST follow:',
    '- Answer ONLY programming and computer science questions.',
    '- Explain code from the lesson clearly, step by step.',
    '- Explain lesson concepts in simple, beginner-friendly terms.',
    '- Help debug programming errors when asked.',
    '- Generate practice quizzes based on the lesson when asked.',
    '- If asked about non-programming topics (general knowledge, entertainment, politics, etc.), politely say you can only help with programming and computer science.',
    '- Be encouraging, supportive, and suitable for a learning platform.',
    '- Respond in the same language as the lesson content (Arabic or English).',
    '- Format code blocks with triple backticks and the language name.',
    '- Keep explanations concise and clear.',
  );
  return parts.join('\n');
}

export function createGeminiProvider(apiKey: string): AIProvider {
  return {
    async chat(req: ChatRequest): Promise<ReadableStream<Uint8Array>> {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

      const contents: any[] = [];
      for (const msg of req.history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: req.message }],
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(req) }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${err}`);
      }

      const responseBody = response.body;
      if (!responseBody) throw new Error('No response body');

      const reader = responseBody.getReader();
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
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                } catch {
                  // skip unparseable chunks
                }
              }
            }
          } catch (e) {
            controller.error(e);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
      });
    },
  };
}
