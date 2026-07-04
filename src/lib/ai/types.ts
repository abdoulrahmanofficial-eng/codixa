export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  lessonContent: string;
  lessonTitle?: string;
  courseTitle?: string;
}

export interface AIProvider {
  chat(req: ChatRequest): Promise<ReadableStream<Uint8Array>>;
}
