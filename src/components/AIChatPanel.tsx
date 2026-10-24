import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, CheckCircle, Sparkles, Bot, User, AlertCircle, Square } from 'lucide-react';
import { sendChatMessage } from '../lib/aiService';
import type { ChatMessage } from '../lib/ai/types';

interface AIChatPanelProps {
  lessonContent: string;
  lessonTitle?: string;
  courseTitle?: string;
}

function getTextDir(text: string): 'rtl' | 'ltr' {
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return arabic > latin ? 'rtl' : 'ltr';
}

export default function AIChatPanel({ lessonContent, lessonTitle, courseTitle }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: lessonTitle
      ? `👋 مرحباً! أنا **Codixa AI**، أساعدك في درس "${lessonTitle}". اسألني أي سؤال برمجي!`
      : `👋 Hello! I'm **Codixa AI**, your programming tutor. Ask me any coding question!`,
  }]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const streamingTextRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || streaming) return;

    setInput('');
    setError(null);
    setStreaming(true);
    setStreamingText('');
    streamingTextRef.current = '';

    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    const currentHistory = [...messages, userMsg];

    await sendChatMessage(
      msg,
      currentHistory.slice(1),
      lessonContent,
      lessonTitle,
      courseTitle,
      {
        signal: controller.signal,
        onToken: (token) => {
          streamingTextRef.current = token;
          setStreamingText(token);
        },
        onDone: () => {
          const finalText = streamingTextRef.current;
          if (finalText) {
            setMessages(prev => [...prev, { role: 'assistant', content: finalText }]);
          }
          setStreamingText('');
          setStreaming(false);
          streamingTextRef.current = '';
          abortRef.current = null;
        },
        onError: (errMsg) => {
          if (errMsg === 'Aborted') return;
          setError(errMsg);
          setStreaming(false);
          setStreamingText('');
          streamingTextRef.current = '';
          abortRef.current = null;
        },
      },
    );
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    const finalText = streamingTextRef.current;
    if (finalText) {
      setMessages(prev => [...prev, { role: 'assistant', content: finalText }]);
    }
    setStreamingText('');
    streamingTextRef.current = '';
    abortRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCode = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessage = (content: string) => {
    const parts: { type: 'text' | 'code'; lang: string; content: string }[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', lang: '', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'text', content: match[2] });
      lastIndex = match.index + match[0].length;
    }

    const rest = content.slice(lastIndex);
    if (rest.includes('```')) {
      const idx = rest.indexOf('```');
      if (idx > 0) parts.push({ type: 'text', lang: '', content: rest.slice(0, idx) });
      const after = rest.slice(idx + 3);
      const nl = after.indexOf('\n');
      const lang = (nl >= 0 ? after.slice(0, nl) : '').trim();
      const code = nl >= 0 ? after.slice(nl + 1) : after;
      if (code) parts.push({ type: 'code', lang, content: code });
    } else if (rest) {
      parts.push({ type: 'text', lang: '', content: rest });
    }

    return parts.map((part, i) => {
      if (part.type === 'code') {
        return (
          <div key={i} className="code-block-wrapper my-3">
            <div className="code-block overflow-hidden">
              <div className="terminal-header">
                <span className="terminal-dot bg-red-400/70" />
                <span className="terminal-dot bg-yellow-400/70" />
                <span className="terminal-dot bg-green-400/70" />
                <span className="text-xs text-slate-400 font-mono ml-2">{part.lang || 'code'}</span>
                <button
                  onClick={() => copyCode(part.content, i)}
                  className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copiedIndex === i ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-[13px] font-mono text-slate-200 overflow-x-auto leading-relaxed"><code>{part.content}</code></pre>
            </div>
          </div>
        );
      }
      return (
        <div key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderTextHtml(part.content) }} />
      );
    });
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] glass rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Codixa AI</div>
                  {lessonTitle && <div className="text-slate-500 text-xs truncate max-w-[200px]">{lessonTitle}</div>}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} dir={msg.role === 'assistant' ? getTextDir(msg.content) : undefined} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/20 text-white rounded-tr-sm border border-indigo-500/20'
                      : 'bg-white/[0.04] text-slate-200 rounded-tl-sm border border-white/5'
                  }`} dir={getTextDir(msg.content)} style={{ textAlign: getTextDir(msg.content) === 'rtl' ? 'right' : 'left' }}>
                    {renderMessage(msg.content)}
                  </div>
                </div>
              ))}

              {/* Streaming indicator */}
              {streaming && streamingText && (
                <div dir={getTextDir(streamingText)} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-1 ring-white/10">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.04] text-slate-200 border border-white/5" dir={getTextDir(streamingText)} style={{ textAlign: getTextDir(streamingText) === 'rtl' ? 'right' : 'left' }}>
                    {renderMessage(streamingText)}
                    <span className="inline-block w-2 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
                  </div>
                </div>
              )}

              {/* Loading dots (before first token) */}
              {streaming && !streamingText && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-white/[0.04] rounded-tl-sm border border-white/5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/10 bg-white/5 shrink-0">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a programming question..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-500"
                  style={{ minHeight: 40, maxHeight: 120 }}
                />
                {streaming ? (
                  <button
                    onClick={handleStop}
                    className="w-10 h-10 rounded-xl bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-all shrink-0"
                  >
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
