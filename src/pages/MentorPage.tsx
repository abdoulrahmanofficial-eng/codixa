import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../contexts/AuthContext';
import { getAllPriceOverrides } from '../lib/priceService';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Send, Loader2, Sparkles, Bot, User, AlertCircle, Square,
  Copy, CheckCircle, ThumbsUp, ThumbsDown, RotateCcw, Trash2,
  Settings, Search, BookOpen, FileText, Upload, X, Plus,
  ChevronLeft, ChevronRight, Sun, Moon, Star, GraduationCap,
  Lightbulb, ListChecks, PenLine, Bookmark, Pin, Folder,
  Clock, ArrowLeft, PanelLeftClose, PanelLeft, MessageSquare,
  Edit3, Hash, Sigma, Code2, Table2, Image, StopCircle,
  BarChart3, Zap, Target, Layers, Trophy, Play, Check,
  ChevronDown, Filter, Download, Share2, MoreHorizontal,
  Globe, Lock, Key, SlidersHorizontal, ChevronUp, Eye, EyeOff,
} from 'lucide-react';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Citation {
  source: string;
  chapter: string;
  section: string;
  chunkId: string;
  score: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  citations?: Citation[];
  timestamp: number;
  liked?: boolean;
  disliked?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  folder?: string;
  createdAt: number;
  updatedAt: number;
}

type EduMode = 'beginner' | 'intermediate' | 'advanced' | 'university' | 'kid' | 'stepbystep' | 'hints' | 'answer';
type View = 'dashboard' | 'chat';

const EDU_MODES: { id: EduMode; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'beginner', labelAr: 'مبتدئ', labelEn: 'Beginner', icon: <Star size={14} /> },
  { id: 'intermediate', labelAr: 'متوسط', labelEn: 'Intermediate', icon: <BarChart3 size={14} /> },
  { id: 'advanced', labelAr: 'متقدم', labelEn: 'Advanced', icon: <Target size={14} /> },
  { id: 'university', labelAr: 'جامعي', labelEn: 'University', icon: <GraduationCap size={14} /> },
  { id: 'kid', labelAr: 'طفل (10 سنوات)', labelEn: 'Kid (Age 10)', icon: <Lightbulb size={14} /> },
  { id: 'stepbystep', labelAr: 'خطوة بخطوة', labelEn: 'Step by Step', icon: <Layers size={14} /> },
  { id: 'hints', labelAr: 'تلميحات فقط', labelEn: 'Hints Only', icon: <Zap size={14} /> },
  { id: 'answer', labelAr: 'إجابة نهائية', labelEn: 'Final Answer', icon: <Trophy size={14} /> },
];

const SUGGESTED_ACTIONS = [
  { icon: <Code2 size={18} />, ar: 'اشرح الفرق بين المصفوفة والقائمة المترابطة', en: 'Arrays vs linked lists' },
  { icon: <Sigma size={18} />, ar: 'اشرح تعقيد الوقت Big-O بأمثلة', en: 'Explain Big-O with examples' },
  { icon: <Table2 size={18} />, ar: 'علّمني أساسيات SQL والاستعلامات', en: 'Teach me SQL basics' },
  { icon: <Lightbulb size={18} />, ar: 'اشرح مبادئ OOP بالكود', en: 'Explain OOP with code' },
  { icon: <ListChecks size={18} />, ar: 'اختبرني في أساسيات Python', en: 'Quiz me on Python basics' },
  { icon: <PenLine size={18} />, ar: 'ساعدني في تصحيح خطأ في كودي', en: 'Help me debug my code' },
];

function stripImageMarkers(text: string): string {
  return text
    .replace(/\[\[IMAGE:[\s\S]*?\]\]/gi, '')
    .replace(/\[\[IMAGE:[\s\S]*$/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractImagePrompts(text: string): { clean: string; prompts: string[] } {
  const prompts: string[] = [];
  const stripped = text.replace(/\[\[IMAGE:\s*([\s\S]*?)\]\]/gi, (_m, p) => {
    const s = String(p).trim();
    if (s) prompts.push(s);
    return '';
  });
  return { clean: stripImageMarkers(stripped), prompts: prompts.slice(0, 1) };
}

function getTextDir(text: string): 'rtl' | 'ltr' {
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return arabic > latin ? 'rtl' : 'ltr';
}

function dirProps(text: string): { dir: 'rtl' | 'ltr'; style: { textAlign: 'right' | 'left' } } {
  const d = getTextDir(text);
  return { dir: d, style: { textAlign: d === 'rtl' ? 'right' : 'left' } };
}

export default function MentorPage() {
  const { t, lang, setLang } = useI18n();
  const { user, profile, purchaseCourse } = useAuth();
  const navigate = useNavigate();
  const isPro = !!user && !!profile?.purchasedCourses?.includes('mentor');
  const [mentorPrice, setMentorPrice] = useState(99);
  const [view, setView] = useState<View>('dashboard');
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('codixa-mentor-convs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [editingMode, setEditingMode] = useState<EduMode>(() => {
    try { return (localStorage.getItem('codixa-mentor-mode') as EduMode) || 'intermediate'; } catch { return 'intermediate'; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [kbText, setKbText] = useState<string>(() => {
    try { return localStorage.getItem('codixa-kb-text') || ''; } catch { return ''; }
  });

  // User profile
  const [userName, setUserName] = useState<string>(() => {
    try { return localStorage.getItem('codixa-user-name') || ''; } catch { return ''; }
  });
  const [userGoals, setUserGoals] = useState<string>(() => {
    try { return localStorage.getItem('codixa-user-goals') || ''; } catch { return ''; }
  });
  const [showOnboarding, setShowOnboarding] = useState(() => !userName);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Daily usage tracking
  const MAX_FREE_MSGS = 20;
  const getUsage = (): { date: string; count: number } => {
    try {
      const raw = localStorage.getItem('codixa-usage');
      if (!raw) return { date: '', count: 0 };
      const parsed = JSON.parse(raw);
      const today = new Date().toDateString();
      if (parsed.date !== today) return { date: '', count: 0 };
      return parsed;
    } catch { return { date: '', count: 0 }; }
  };
  const [usage, setUsage] = useState(getUsage);
  const remaining = isPro ? Infinity : MAX_FREE_MSGS - usage.count;

  // Load mentor price from admin overrides
  useEffect(() => {
    getAllPriceOverrides().then(overrides => {
      if (overrides.mentor) setMentorPrice(overrides.mentor);
    }).catch(() => {});
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('codixa-mentor-convs', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try { localStorage.setItem('codixa-mentor-mode', editingMode); } catch {}
  }, [editingMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const createNewConversation = useCallback(() => {
    const id = Date.now().toString();
    const conv: Conversation = {
      id,
      title: lang === 'ar' ? 'محادثة جديدة' : 'New conversation',
      messages: [],
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(id);
    setMessages([]);
    setView('chat');
    setStreamingText('');
    setError(null);
  }, [lang]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
      setView('dashboard');
    }
  }, [activeConvId]);

  const togglePin = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const updateConvTitle = useCallback((id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c));
  }, []);

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedConvs = filteredConversations.filter(c => c.pinned);
  const unpinnedConvs = filteredConversations.filter(c => !c.pinned);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && images.length === 0) || streaming) return;
    if (remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    let convId = activeConvId;
    if (!convId) {
      const id = Date.now().toString();
      const title = text || (lang === 'ar' ? 'صورة' : 'Image');
      const conv: Conversation = {
        id,
        title: title.slice(0, 40) + (title.length > 40 ? '...' : ''),
        messages: [],
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations(prev => [conv, ...prev]);
      setActiveConvId(id);
      convId = id;
      setView('chat');
    }

    const sentImages = images;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      images: sentImages.length ? sentImages : undefined,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setImages([]);
    setStreaming(true);
    setStreamingText('');
    setError(null);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const chatHistory = updatedMessages.map(m => {
        if (m.images && m.images.length) {
          return {
            role: m.role,
            content: [
              ...(m.content ? [{ type: 'text', text: m.content }] : []),
              ...m.images.map(url => ({ type: 'image_url', image_url: { url } })),
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          mode: editingMode,
          language: lang,
          topK: 4,
          kbText: kbText || undefined,
          userName: userName || undefined,
          userGoals: userGoals || undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          errMsg = err.error || errMsg;
        } catch {
          const text = await response.text().catch(() => '');
          if (text) errMsg = text.slice(0, 200);
        }
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let lastCitations: Citation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'token') {
              fullContent += data.content;
              setStreamingText(fullContent);
            } else if (data.type === 'done') {
              lastCitations = data.citations || [];
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e: any) {
            if (e.message?.includes('JSON')) continue;
            throw e;
          }
        }
      }

      const { clean: cleanContent, prompts: imagePrompts } = extractImagePrompts(fullContent);
      let generatedImages: string[] = [];
      if (imagePrompts.length > 0) {
        try {
          const imgRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: imagePrompts[0] }),
          });
          if (imgRes.ok) {
            const data = await imgRes.json();
            if (data?.image) generatedImages = [data.image as string];
          }
        } catch {}
      }

      // Increment usage
      const today = new Date().toDateString();
      const newUsage = { date: today, count: (usage.date === today ? usage.count : 0) + 1 };
      localStorage.setItem('codixa-usage', JSON.stringify(newUsage));
      setUsage(newUsage);

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: cleanContent,
        images: generatedImages.length ? generatedImages : undefined,
        citations: lastCitations,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      setStreamingText('');

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        const fallback = text || (lang === 'ar' ? 'صورة' : 'Image');
        const title = c.messages.length === 0
          ? fallback.slice(0, 40) + (fallback.length > 40 ? '...' : '')
          : c.title;
        return { ...c, messages: finalMessages, title, updatedAt: Date.now() };
      }));
    } catch (e: any) {
      if (abortController.signal.aborted) return;
      setError(e.message || 'Connection error');
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    if (streamingText) {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: stripImageMarkers(streamingText) + '\n\n*⏸️ Generation stopped*',
        timestamp: Date.now(),
      };
      const finalMessages = [...messages, assistantMsg];
      setMessages(finalMessages);
      setStreamingText('');
      if (activeConvId) {
        setConversations(prev => prev.map(c =>
          c.id === activeConvId ? { ...c, messages: finalMessages, updatedAt: Date.now() } : c
        ));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages(messages.slice(0, -1));
      setInput(lastUserMsg.content);
      if (lastUserMsg.images) setImages(lastUserMsg.images);
      setTimeout(() => handleSend(), 100);
    }
  };

  const handleImageSelect = (files: FileList) => {
    const selected = Array.from(files).filter(f => f.type.startsWith('image/'));
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => prev.length < 4 ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSuggestedAction = (action: { ar: string; en: string }) => {
    setInput(lang === 'ar' ? action.ar : action.en);
    if (inputRef.current) inputRef.current.focus();
  };

  const handlePdfUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') continue;
        setUploadedDocs(prev => [...prev, file.name]);

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        localStorage.setItem('codixa-kb-text', fullText);
        setKbText(fullText);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to read PDF');
    }
    setIsUploading(false);
    setShowPdfUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderMath = (expr: string, display: boolean): string => {
    try {
      return katex.renderToString(expr, { displayMode: display, throwOnError: false });
    } catch {
      return `<span class="text-red-400 text-sm font-mono">${expr}</span>`;
    }
  };

  const renderMarkdown = (content: string) => {
    // 1) Normalize old-style \(...\) → $...$ and \[...\] → $$...$$
    content = content
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$$$1$');
    // 2) Auto-wrap bare LaTeX paragraphs: any paragraph with \command but no $ gets $$...$$
    content = content.split(/\n\n+/).map(p => {
      if (!p.includes('$') && /\\[a-zA-Z]+/.test(p)) {
        return `$$${p.trim()}$$\n\n`;
      }
      return p;
    }).join('\n\n');

    // 3) Split into $$display$$ / $inline$ / text segments
    const segments = content.split(/(\$\$[\s\S]*?\$\$|\$(?:[^$\n]+?)\$)/g);
    return segments.map(seg => {
      // Display math $$...$$
      if (seg.startsWith('$$') && seg.endsWith('$$') && seg.length > 4) {
        return renderMath(seg.slice(2, -2).trim(), true);
      }
      // Inline math $...$
      if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
        return renderMath(seg.slice(1, -1).trim(), false);
      }
      // Plain text — HTML-escape then apply Markdown
      return seg
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
          const enc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<div class="code-block-wrapper my-3"><div class="code-block overflow-hidden"><div class="terminal-header"><span class="text-xs text-slate-400">${lang || 'code'}</span></div><pre class="p-4 overflow-x-auto"><code class="text-sm text-slate-300 leading-relaxed">${enc}</code></pre></div></div>`;
        })
        .replace(/```([\s\S]*?)```/g, (_, code) => {
          const enc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<div class="code-block-wrapper my-3"><div class="code-block overflow-hidden"><pre class="p-4 overflow-x-auto"><code class="text-sm text-slate-300 leading-relaxed">${enc}</code></pre></div></div>`;
        })
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-sm font-mono">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em class="text-slate-300">$1</em>')
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-indigo-400 mt-4 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-3">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-white mt-6 mb-4 gradient-text">$1</h1>')
        .replace(/^- (.+)$/gm, '<li class="text-slate-300 flex items-start gap-2 mb-1"><span class="text-indigo-400 mt-1.5">•</span><span>$1</span></li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="text-slate-300 flex items-start gap-2 mb-1"><span class="text-indigo-400 font-bold mt-1.5">$&</span></li>')
        .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-3">')
        .replace(/\n/g, '<br/>');
    }).join('');
  };

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Chat Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: lang === 'ar' ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: lang === 'ar' ? 300 : -300, opacity: 0 }}
            className="w-72 lg:w-80 bg-slate-900/95 border-r border-white/10 flex flex-col flex-shrink-0"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-indigo-400" />
                  <span className="text-white font-bold text-sm">{lang === 'ar' ? 'المحادثات' : 'Conversations'}</span>
                </div>
                <button
                  onClick={createNewConversation}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pinnedConvs.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={activeConvId === conv.id}
                  lang={lang}
                  onClick={() => { setActiveConvId(conv.id); setMessages(conv.messages); setView('chat'); setStreamingText(''); }}
                  onDelete={() => deleteConversation(conv.id)}
                  onPin={() => togglePin(conv.id)}
                  onRename={(t) => updateConvTitle(conv.id, t)}
                />
              ))}
              {pinnedConvs.length > 0 && unpinnedConvs.length > 0 && (
                <div className="border-t border-white/5 my-2" />
              )}
              {unpinnedConvs.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={activeConvId === conv.id}
                  lang={lang}
                  onClick={() => { setActiveConvId(conv.id); setMessages(conv.messages); setView('chat'); setStreamingText(''); }}
                  onDelete={() => deleteConversation(conv.id)}
                  onPin={() => togglePin(conv.id)}
                  onRename={(t) => updateConvTitle(conv.id, t)}
                />
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  {lang === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            {view === 'chat' && (
              <>
                <button
                  onClick={() => { setView('dashboard'); setActiveConvId(null); setMessages([]); }}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="text-white font-semibold text-sm truncate max-w-[200px]">
                  {activeConv?.title || (lang === 'ar' ? 'محادثة جديدة' : 'New conversation')}
                </div>
              </>
            )}
            {view === 'dashboard' && (
              <>
                <Brain size={20} className="text-indigo-400" />
                <span className="text-white font-bold text-sm">Codixa Mentor</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xs font-bold"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view === 'dashboard' && (
            <DashboardView
              lang={lang}
              suggestedActions={SUGGESTED_ACTIONS}
              onAction={handleSuggestedAction}
              onCreateNew={createNewConversation}
              onOpenConv={(conv) => { setActiveConvId(conv.id); setMessages(conv.messages); setView('chat'); }}
              conversations={conversations.slice(0, 5)}
              uploadedDocs={uploadedDocs}
              isUploading={isUploading}
              onShowUpload={() => setShowPdfUpload(true)}
              onSearchQuery={(q) => { setInput(q); if (inputRef.current) inputRef.current.focus(); }}
              editingMode={editingMode}
              setEditingMode={setEditingMode}
              showModes={showModes}
              setShowModes={setShowModes}
              isPro={isPro}
              mentorPrice={mentorPrice}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}

          {view === 'chat' && (
            <ChatView
              lang={lang}
              messages={messages}
              streaming={streaming}
              streamingText={streamingText}
              isEmpty={isEmpty}
              editingMode={editingMode}
              showModes={showModes}
              setShowModes={setShowModes}
              setEditingMode={setEditingMode}
              onCopy={handleCopy}
              copiedId={copiedId}
              onRegenerate={handleRegenerate}
              renderMarkdown={renderMarkdown}
              error={error}
              onDismissError={() => setError(null)}
              plan={isPro ? 'pro' : 'free'}
              remaining={remaining}
              maxFree={MAX_FREE_MSGS}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}


        </div>

        {/* Input Area */}
        {view === 'chat' && (
          <div className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm p-4">
            {showPdfUpload && (
              <div
                ref={dropRef}
                className="mb-3 p-6 border-2 border-dashed border-indigo-500/40 rounded-xl text-center hover:border-indigo-500/60 transition-colors cursor-pointer bg-indigo-500/5"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handlePdfUpload(e.dataTransfer.files); }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && e.target.files.length > 0 && handlePdfUpload(e.target.files)}
                />
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="text-indigo-400 mx-auto mb-2 animate-spin" />
                    <p className="text-slate-400 text-sm">
                      {lang === 'ar' ? 'جاري معالجة PDF...' : 'Processing PDF...'}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-indigo-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">
                      {lang === 'ar' ? 'اسحب وأفلت PDF هنا أو اضغط للتصفح' : 'Drag & drop PDF here or click to browse'}
                    </p>
                  </>
                )}
              </div>
            )}
            {kbText && !showPdfUpload && (
              <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <FileText size={14} className="text-green-400" />
                <span className="text-xs text-green-400">{lang === 'ar' ? 'PDF محمل — الأسئلة مبنية على المستند' : 'PDF loaded — answers based on your document'}</span>
                <button
                  onClick={() => { localStorage.removeItem('codixa-kb-text'); setKbText(''); setUploadedDocs([]); }}
                  className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && e.target.files.length > 0 && handleImageSelect(e.target.files)}
            />
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="attachment" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                    <button
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowPdfUpload(!showPdfUpload)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showPdfUpload ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                title={lang === 'ar' ? 'إرفاق صورة' : 'Attach image'}
              >
                <Image size={18} />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={lang === 'ar' ? 'اسأل Codixa Mentor أي سؤال...' : 'Ask Codixa Mentor anything...'}
                  rows={1}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              {streaming ? (
                <button
                  onClick={handleStop}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all"
                >
                  <Square size={16} className="text-white" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && images.length === 0}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-40"
                >
                  <Send size={16} className="text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="px-4 py-3 border-t border-white/10 bg-slate-900/80">
            <button
              onClick={createNewConversation}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare size={16} />
              {lang === 'ar' ? 'ابدأ محادثة جديدة' : 'Start a new conversation'}
            </button>
          </div>
        )}

        {/* Onboarding Modal */}
        <AnimatePresence>
          {showOnboarding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => {}}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-slate-800 border border-white/10 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Brain size={24} className="text-white" />
                </div>
                <h2 className="text-white font-bold text-lg text-center mb-1">
                  {lang === 'ar' ? 'مرحباً بك في Codixa Mentor!' : 'Welcome to Codixa Mentor!'}
                </h2>
                <p className="text-slate-400 text-sm text-center mb-6">
                  {lang === 'ar' ? 'عرفنا على نفسك لنبدأ الرحلة التعليمية' : 'Tell us about yourself to get started'}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {lang === 'ar' ? 'اسمك' : 'Your Name'}
                    </label>
                    <input
                      value={userName}
                      onChange={e => { setUserName(e.target.value); localStorage.setItem('codixa-user-name', e.target.value); }}
                      placeholder={lang === 'ar' ? 'مثال: أحمد' : 'e.g. Ahmed'}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {lang === 'ar' ? 'أهدافك التعليمية (اختياري)' : 'Learning Goals (optional)'}
                    </label>
                    <textarea
                      value={userGoals}
                      onChange={e => { setUserGoals(e.target.value); localStorage.setItem('codixa-user-goals', e.target.value); }}
                      placeholder={lang === 'ar' ? 'مثال: أريد تعلم Python وبناء تطبيقات ويب' : 'e.g. I want to learn Python and build web apps'}
                      rows={3}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm transition-all"
                  >
                    {lang === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy size={24} className="text-yellow-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-1">
                  {lang === 'ar' ? 'ترقية إلى Codixa Mentor Pro' : 'Upgrade to Codixa Mentor Pro'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {lang === 'ar'
                    ? `استخدمت ${MAX_FREE_MSGS} رسالة اليوم. اشترِ Mentor Pro للحصول على رسائل غير محدودة.`
                    : `You've used ${MAX_FREE_MSGS} messages today. Buy Mentor Pro for unlimited messages.`}
                </p>
                {!user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all"
                    >
                      {lang === 'ar' ? 'سجل الدخول للشراء' : 'Log in to purchase'}
                    </button>
                    <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors">
                      {lang === 'ar' ? 'ربما لاحقاً' : 'Maybe later'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/50 text-sm">
                      <span className="text-slate-400">{lang === 'ar' ? 'السعر' : 'Price'}</span>
                      <span className="text-white font-bold">{mentorPrice} EGP</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/50 text-sm">
                      <span className="text-slate-400">{lang === 'ar' ? 'رصيد المحفظة' : 'Wallet'}</span>
                      <span className="text-white font-bold">{(profile?.wallet?.balance ?? 0).toFixed(0)} EGP</span>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all"
                    >
                      {lang === 'ar' ? 'جرب مجاناً' : 'Try for Free'}
                    </button>
                    <button
                      onClick={async () => {
                        if ((profile?.wallet?.balance ?? 0) >= mentorPrice) {
                          const ok = await purchaseCourse('mentor', mentorPrice);
                          if (ok) setShowUpgradeModal(false);
                        } else {
                          navigate('/wallet');
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Star size={16} />
                      {lang === 'ar' ? `اشترك — ${mentorPrice} جنيه/شهر` : `Subscribe — ${mentorPrice} EGP/month`}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConvItem({ conv, active, lang, onClick, onDelete, onPin, onRename }: {
  conv: Conversation; active: boolean; lang: string;
  onClick: () => void; onDelete: () => void; onPin: () => void; onRename: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conv.title);

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        active ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
      }`}
      onClick={onClick}
    >
      {conv.pinned && <Pin size={12} className="text-indigo-400 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { onRename(title); setEditing(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { onRename(title); setEditing(false); } }}
            className="w-full bg-slate-800 rounded px-2 py-0.5 text-sm text-white border border-indigo-500/50 focus:outline-none"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm text-slate-300 truncate">{conv.title}</div>
        )}
        <div className="text-[10px] text-slate-500 mt-0.5">
          {new Date(conv.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={e => { e.stopPropagation(); setEditing(!editing); }}
          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">
          <Edit3 size={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); onPin(); }}
          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">
          <Pin size={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-6 h-6 rounded hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function DashboardView({ lang, suggestedActions, onAction, onCreateNew, onOpenConv, conversations, uploadedDocs, isUploading, onShowUpload, onSearchQuery, editingMode, setEditingMode, showModes, setShowModes, isPro, mentorPrice, onUpgrade }: {
  lang: string; suggestedActions: typeof SUGGESTED_ACTIONS;
  onAction: (a: typeof SUGGESTED_ACTIONS[0]) => void;
  onCreateNew: () => void;
  onOpenConv: (c: Conversation) => void;
  conversations: Conversation[];
  uploadedDocs: string[];
  isUploading: boolean;
  onShowUpload: () => void;
  onSearchQuery: (q: string) => void;
  editingMode: EduMode; setEditingMode: (m: EduMode) => void;
  showModes: boolean; setShowModes: (v: boolean) => void;
  isPro: boolean; mentorPrice: number; onUpgrade: () => void;
}) {
  const currentMode = EDU_MODES.find(m => m.id === editingMode);
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Brain size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black gradient-text mb-2">
          {lang === 'ar' ? 'Codixa Mentor' : 'Codixa Mentor'}
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {lang === 'ar'
            ? 'مُعلمك الذكي في البرمجة — اسأل، تعلم، وطور مهاراتك'
            : 'Your personal AI programming tutor — ask, learn, and level up'}
        </p>
        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="relative">
            <button
              onClick={() => setShowModes(!showModes)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-600/30 transition-colors"
            >
              {currentMode?.icon}
              <span>{lang === 'ar' ? currentMode?.labelAr : currentMode?.labelEn}</span>
              <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {showModes && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-1 left-0 w-48 bg-slate-800 border border-white/10 rounded-xl p-1 z-50 shadow-xl"
                >
                  {EDU_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => { setEditingMode(mode.id); setShowModes(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                        editingMode === mode.id
                          ? 'bg-indigo-600/30 text-indigo-300'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {mode.icon}
                      <span>{lang === 'ar' ? mode.labelAr : mode.labelEn}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-[10px] text-slate-500">
            {lang === 'ar' ? 'مستوى التعليم' : 'Education Level'}
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder={lang === 'ar' ? 'اسأل أي سؤال في البرمجة...' : 'Ask any programming question...'}
            className="w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
            onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) { onSearchQuery((e.target as HTMLInputElement).value.trim()); } }}
          />
        </div>
      </motion.div>

      {/* Suggested Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Zap size={16} className="text-indigo-400" />
          {lang === 'ar' ? 'إجراءات مقترحة' : 'Suggested Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction(action)}
              className="flex items-center gap-3 p-3 glass rounded-xl hover:border-indigo-500/30 transition-all text-left group"
            >
              <span className="text-indigo-400 group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{lang === 'ar' ? action.ar : action.en}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            {lang === 'ar' ? 'آخر المحادثات' : 'Recent Conversations'}
          </h2>
          <div className="space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onOpenConv(conv)}
                className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:border-indigo-500/30 transition-all text-left"
              >
                <MessageSquare size={16} className="text-slate-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300 truncate">{conv.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {conv.messages.length} {lang === 'ar' ? 'رسالة' : 'messages'}
                  </div>
                </div>
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Uploaded docs */}
      {uploadedDocs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            {lang === 'ar' ? 'المستندات المرفوعة' : 'Uploaded Documents'}
            <button
              onClick={() => { localStorage.removeItem('codixa-kb-text'); setKbText(''); setUploadedDocs([]); }}
              className="ml-auto text-[10px] text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={14} />
            </button>
          </h2>
          <div className="flex flex-wrap gap-2">
            {uploadedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-xs text-slate-300">
                <FileText size={14} className="text-indigo-400" />
                {doc}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Subscribe Card */}
      {!isPro && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="glass rounded-2xl p-4 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">
                  {lang === 'ar' ? 'Codixa Mentor Pro' : 'Codixa Mentor Pro'}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {lang === 'ar' ? `رسائل غير محدودة — ${mentorPrice} جنيه/شهر` : `Unlimited messages — ${mentorPrice} EGP/month`}
                </p>
              </div>
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Star size={14} />
                {lang === 'ar' ? 'اشترك' : 'Subscribe'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Tools */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Zap size={16} className="text-indigo-400" />
          {lang === 'ar' ? 'أدوات سريعة' : 'Quick Tools'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: <PenLine size={18} />, ar: 'توليد ملخص', en: 'Generate Summary' },
            { icon: <ListChecks size={18} />, ar: 'أسئلة اختيار متعدد', en: 'Generate MCQs' },
            { icon: <Lightbulb size={18} />, ar: 'بطاقات تعليمية', en: 'Flashcards' },
            { icon: <BookOpen size={18} />, ar: 'خطة دراسة', en: 'Study Plan' },
          ].map((tool, i) => (
            <button
              key={i}
              onClick={() => onAction({ icon: tool.icon, ar: tool.ar, en: tool.en })}
              className="p-3 glass rounded-xl hover:border-indigo-500/30 transition-all text-center group"
            >
              <span className="text-indigo-400 group-hover:scale-110 transition-transform inline-block mb-1">{tool.icon}</span>
              <div className="text-xs text-slate-300">{lang === 'ar' ? tool.ar : tool.en}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* KB Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <BookOpen size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{lang === 'ar' ? 'قاعدة المعرفة' : 'Knowledge Base'}</div>
                <div className="text-slate-400 text-xs">{lang === 'ar' ? 'خبير البرمجة — جميع اللغات والمجالات' : 'Programming expert — all languages & areas'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ChatView({ lang, messages, streaming, streamingText, isEmpty, editingMode, showModes, setShowModes, setEditingMode, onCopy, copiedId, onRegenerate, renderMarkdown, error, onDismissError, plan, remaining, maxFree, onUpgrade }: {
  lang: string; messages: Message[]; streaming: boolean; streamingText: string;
  isEmpty: boolean; editingMode: EduMode; showModes: boolean;
  setShowModes: (v: boolean) => void; setEditingMode: (m: EduMode) => void;
  onCopy: (t: string, id: string) => void; copiedId: string | null;
  onRegenerate: () => void; renderMarkdown: (c: string) => string;
  error: string | null; onDismissError: () => void;
  plan: string; remaining: number; maxFree: number; onUpgrade: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const currentMode = EDU_MODES.find(m => m.id === editingMode);

  return (
    <div className="h-full flex flex-col">
      {/* Usage Bar */}
      <div className="px-4 py-1.5 border-b border-white/10 flex items-center gap-3">
        {plan === 'pro' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">PRO</span>
            <span className="text-[10px] text-slate-500">{lang === 'ar' ? 'غير محدود' : 'Unlimited'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining <= 3 ? 'bg-red-500' : remaining <= 8 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.max(2, ((maxFree - remaining) / maxFree) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {remaining}/{maxFree}
            </span>
            <button
              onClick={onUpgrade}
              className="text-[10px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap"
            >
              {lang === 'ar' ? 'ترقية' : 'Upgrade'}
            </button>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
        <div className="relative">
          <button
            onClick={() => setShowModes(!showModes)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-600/30 transition-colors"
          >
            {currentMode?.icon}
            <span>{lang === 'ar' ? currentMode?.labelAr : currentMode?.labelEn}</span>
            <ChevronDown size={12} />
          </button>
          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full mt-1 left-0 w-48 bg-slate-800 border border-white/10 rounded-xl p-1 z-50 shadow-xl"
              >
                {EDU_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => { setEditingMode(mode.id); setShowModes(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      editingMode === mode.id
                        ? 'bg-indigo-600/30 text-indigo-300'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {mode.icon}
                    <span>{lang === 'ar' ? mode.labelAr : mode.labelEn}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-[10px] text-slate-500">
          {lang === 'ar' ? 'مستوى التعليم' : 'Education Level'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Brain size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {lang === 'ar' ? 'على استعداد للتعلم!' : 'Ready to learn!'}
              </h3>
              <p className="text-slate-400 text-sm">
                {lang === 'ar'
                  ? 'اطرح سؤالك وسأشرحه لك خطوة بخطوة'
                  : 'Ask your question and I will explain it step by step'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 max-w-4xl mx-auto">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={onDismissError} className="hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                dir={msg.role === 'assistant' ? getTextDir(msg.content) : undefined}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-2xl rounded-br-lg px-4 py-3">
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {msg.images.map((img, ii) => (
                            <img key={ii} src={img} alt="attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-white/10" />
                          ))}
                        </div>
                      )}
                      {msg.content && <p className="text-white text-sm whitespace-pre-wrap" {...dirProps(msg.content)}>{msg.content}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.images.map((img, ii) => (
                            <img key={ii} src={img} alt="generated" className="rounded-xl border border-white/10 max-w-full" />
                          ))}
                        </div>
                      )}
                      <div
                        className="prose prose-invert max-w-none text-sm"
                        {...dirProps(msg.content)}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-semibold mb-2 flex items-center gap-1">
                            <BookOpen size={12} />
                            {lang === 'ar' ? 'المصادر' : 'Sources'}
                          </p>
                          {msg.citations.map((cit, ci) => (
                            <div key={ci} className="flex items-start gap-2 text-xs text-slate-400 mb-1.5 last:mb-0">
                              <span className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{ci + 1}</span>
                              <div>
                                <span className="text-indigo-300 font-medium">{cit.section}</span>
                                <span className="text-slate-500"> — {cit.chapter}</span>
                                <div className="text-[10px] text-slate-600">
                                  {lang === 'ar' ? 'التطابق' : 'Match'}: {(cit.score * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onCopy(msg.content, msg.id)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                        {i === messages.length - 1 && !streaming && (
                          <button
                            onClick={onRegenerate}
                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {streaming && streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                dir={getTextDir(stripImageMarkers(streamingText))}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain size={16} className="text-white" />
                </div>
                <div className="max-w-[80%]">
                  <div
                    className="text-sm"
                    {...dirProps(stripImageMarkers(streamingText))}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(stripImageMarkers(streamingText)) }}
                  />
                  {/\[\[IMAGE:[\s\S]*?\]\]/i.test(streamingText) && (
                    <div className="flex items-center gap-2 text-xs text-indigo-300 mt-2">
                      <Loader2 size={12} className="animate-spin" />
                      {lang === 'ar' ? 'يولّد صورة...' : 'Generating image...'}
                    </div>
                  )}
                  <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-1 rounded-sm" />
                </div>
              </motion.div>
            )}

            {streaming && !streamingText && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}


