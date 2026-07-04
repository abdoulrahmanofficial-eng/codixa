import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Copy, CheckCircle, Sparkles, Bot, User, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../lib/aiService';
import type { ChatMessage } from '../lib/ai/types';

interface AIChatPanelProps {
  lessonContent: string;
  lessonTitle?: string;
  courseTitle?: string;
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const encoded = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="code-block-wrapper"><div class="code-block-header"><span>${lang || 'code'}</span><button class="copy-btn" onclick="(function(){const el=document.createElement('textarea');el.value=decodeURIComponent('${encodeURIComponent(code)}');document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el);const btn=this;btn.innerHTML='<svg...check...>';setTimeout(()=>btn.innerHTML='<svg...copy...>',2000)})()">Copy</button></div><pre><code class="language-${lang}">${encoded}</code></pre></div>`;
    })
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="chat-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="chat-h2">$2</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="chat-h1">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="chat-li">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="chat-li">$1</li>')
    .replace(/\n\n/g, '</p><p class="chat-p">')
    .replace(/\n/g, '<br/>');
}

function wrapParagraphs(html: string): string {
  if (!html.startsWith('<')) return `<p class="chat-p">${html}</p>`;
  return html;
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
        onToken: (token) => {
          streamingTextRef.current = token;
          setStreamingText(token);
        },
        onDone: () => {
          const finalText = streamingTextRef.current;
          setMessages(prev => [...prev, { role: 'assistant', content: finalText }]);
          setStreamingText('');
          setStreaming(false);
          streamingTextRef.current = '';
        },
        onError: (errMsg) => {
          setError(errMsg);
          setStreaming(false);
          setStreamingText('');
          streamingTextRef.current = '';
        },
      },
    );
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
    if (lastIndex < content.length) {
      parts.push({ type: 'text', lang: '', content: content.slice(lastIndex) });
    }

    return parts.map((part, i) => {
      if (part.type === 'code') {
        return (
          <div key={i} className="code-block-wrapper my-3 rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs text-slate-400 font-mono">{part.lang || 'code'}</span>
              <button
                onClick={() => copyCode(part.content, i)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copiedIndex === i ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                {copiedIndex === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed bg-black/40"><code>{part.content}</code></pre>
          </div>
        );
      }
      const html = part.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`([^`]+)`/g, '<code class="inline-code bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em class="text-slate-200">$1</em>')
        .replace(/^### (.+)$/gm, '<h3 class="text-white font-bold text-base mt-3 mb-1">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-4 mb-1">$2</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-white font-bold text-xl mt-4 mb-2">$1</h1>')
        .replace(/^- (.+)$/gm, '• $1')
        .replace(/^\d+\. (.+)$/gm, (m) => {
          const num = m.match(/^(\d+)\./)?.[1] || '';
          return `<span class="text-pink-400 font-bold">${num}.</span> ${m.replace(/^\d+\.\s*/, '')}`;
        });

      return (
        <div key={i} className="chat-text text-sm leading-relaxed text-slate-300 [&_p]:my-2">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
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
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 text-white rounded-tr-sm'
                      : 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/5'
                  }`}>
                    {renderMessage(msg.content)}
                  </div>
                </div>
              ))}

              {/* Streaming indicator */}
              {streaming && streamingText && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/5 text-slate-200 rounded-tl-sm border border-white/5">
                    {renderMessage(streamingText)}
                    <span className="inline-block w-2 h-4 bg-purple-400 ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Loading dots (before first token) */}
              {streaming && !streamingText && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-white/5 rounded-tl-sm border border-white/5">
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
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a programming question..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-500"
                  style={{ minHeight: 40, maxHeight: 100 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || streaming}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                >
                  {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
