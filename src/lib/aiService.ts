import type { ChatMessage } from './ai/types';

interface StreamCallbacks {
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  lessonContent: string,
  lessonTitle: string | undefined,
  courseTitle: string | undefined,
  callbacks: StreamCallbacks,
): Promise<void> {
  const { onToken, onDone, onError } = callbacks;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, lessonContent, lessonTitle, courseTitle }),
      signal: callbacks.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Request failed' }));
      onError(errData.error || `Error ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response stream');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      onToken(fullText);
    }

    onDone();
  } catch (e: any) {
    if (callbacks.signal?.aborted) return;
    onError(e.message || 'Connection error');
  }
}
