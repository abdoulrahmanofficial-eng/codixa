import type { ChatMessage } from './ai/types';

interface StreamCallbacks {
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
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      onToken(buffer);
      buffer = '';
    }

    onDone();
  } catch (e: any) {
    onError(e.message || 'Connection error');
  }
}
