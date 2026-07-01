import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Play, Trash2, RotateCcw, Terminal, AlertCircle, CheckCircle, Copy } from 'lucide-react';

const defaultJS = `// JavaScript Playground
// جرب تكتب كود هنا وشوف النتيجة

function greet(name) {
  return "Hello " + name + "! 👋";
}

console.log(greet("Codixa"));

// جرب loops
for (let i = 1; i <= 5; i++) {
  console.log("Count: " + i);
}`;

const defaultHTML = `<!-- HTML Playground -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; text-align: center; padding: 40px; background: #1e1e2e; color: white; }
    h1 { color: #818cf8; }
    button { padding: 10px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>👋 مرحباً Codixa!</h1>
  <p>جرب تعدل الكود وشوف التغيير</p>
  <button onclick="alert('Hello from Codixa!')">اضغط هنا</button>
</body>
</html>`;

const jsExamples = [
  { label: 'Hello World', code: 'console.log("Hello Codixa! 🚀");' },
  { label: 'Loop', code: 'for (let i = 1; i <= 5; i++) {\n  console.log("Count: " + i);\n}' },
  { label: 'Array', code: 'const fruits = ["🍎", "🍌", "🍇"];\nfruits.forEach(f => console.log(f));' },
  { label: 'Function', code: 'function add(a, b) {\n  return a + b;\n}\nconsole.log("3 + 5 = " + add(3, 5));' },
];

const htmlExamples = [
  { label: 'Simple Page', code: '<h1 style="color:#818cf8">Hello Codixa!</h1>\n<p>This is a simple page</p>' },
  { label: 'Button', code: '<button onclick="this.textContent=\'Clicked! 🎉\'">Click Me</button>' },
  { label: 'List', code: '<ul>\n  <li>🚀 Learn</li>\n  <li>💻 Code</li>\n  <li>🏆 Build</li>\n</ul>' },
];

export default function PlaygroundPage() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<'js' | 'html'>('js');
  const [jsCode, setJsCode] = useState(defaultJS);
  const [htmlCode, setHtmlCode] = useState(defaultHTML);
  const [output, setOutput] = useState<string[]>([]);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runJS = () => {
    setError('');
    setOutput([]);
    const logs: string[] = [];
    const mockConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args: any[]) => logs.push('❌ ' + args.join(' ')),
      warn: (...args: any[]) => logs.push('⚠️ ' + args.join(' ')),
      info: (...args: any[]) => logs.push('ℹ️ ' + args.join(' ')),
    };
    try {
      const fn = new Function('console', jsCode);
      fn(mockConsole);
      setOutput(logs);
      if (logs.length === 0) setOutput(['✓ ' + (lang === 'ar' ? 'تم التشغيل بنجاح (لا يوجد مخرجات)' : 'Code ran successfully (no output)')]);
    } catch (e: any) {
      setError(e.message || String(e));
      setOutput(logs);
    }
  };

  const runHTML = () => {
    setError('');
    setHtmlPreview(htmlCode);
  };

  const run = () => {
    if (tab === 'js') runJS();
    else runHTML();
  };

  const clearOutput = () => {
    setOutput([]);
    setError('');
    setHtmlPreview('');
  };

  const resetCode = () => {
    if (tab === 'js') setJsCode(defaultJS);
    else setHtmlCode(defaultHTML);
    clearOutput();
  };

  const loadExample = (code: string) => {
    if (tab === 'js') setJsCode(code);
    else setHtmlCode(code);
    clearOutput();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(tab === 'js' ? jsCode : htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const currentCode = tab === 'js' ? jsCode : htmlCode;
  const setCurrentCode = (val: string) => {
    if (tab === 'js') setJsCode(val);
    else setHtmlCode(val);
  };
  const examples = tab === 'js' ? jsExamples : htmlExamples;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 text-green-300 text-sm font-semibold mb-4">
            <Terminal size={14} />
            {t('playground.title')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('playground.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('playground.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setTab('js')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === 'js' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'glass text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {t('playground.tab.js')}
              </button>
              <button
                onClick={() => setTab('html')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === 'html' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'glass text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {t('playground.tab.html')}
              </button>
              <div className="flex-1" />
              <button
                onClick={copyCode}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              >
                <Copy size={14} /> {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}
              </button>
            </div>

            {/* Code Editor */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-slate-500 text-xs mr-2 font-mono">
                  {tab === 'js' ? 'script.js' : 'index.html'}
                </span>
              </div>
              <textarea
                value={currentCode}
                onChange={e => setCurrentCode(e.target.value)}
                className="w-full h-80 bg-transparent text-green-400 font-mono text-sm p-4 resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
                style={{ tabSize: 2 }}
                placeholder={t('playground.placeholder')}
                spellCheck={false}
                dir="ltr"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={run}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
              >
                <Play size={16} fill="white" />
                {t('playground.run')}
              </button>
              <button
                onClick={clearOutput}
                className="flex items-center gap-2 px-4 py-3 glass border border-white/10 text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all"
              >
                <Trash2 size={16} />
                {t('playground.clear')}
              </button>
              <button
                onClick={resetCode}
                className="flex items-center gap-2 px-4 py-3 glass border border-white/10 text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all"
              >
                <RotateCcw size={16} />
                {t('playground.reset')}
              </button>

              <div className="flex-1" />

              {/* Quick Examples */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">{lang === 'ar' ? 'أمثلة:' : 'Examples:'}</span>
                {examples.map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.code)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="glass rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-slate-300 font-semibold text-sm flex items-center gap-2">
                  <Terminal size={16} className="text-green-400" />
                  {t('playground.output')}
                </span>
                {tab === 'html' && htmlPreview && (
                  <span className="text-xs text-green-400">✓ Live</span>
                )}
              </div>

              <div className="flex-1 overflow-auto p-4" ref={outputRef}>
                {tab === 'html' && htmlPreview ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlPreview}
                    className="w-full h-96 rounded-xl bg-white"
                    title="HTML Preview"
                    sandbox="allow-scripts"
                  />
                ) : output.length > 0 ? (
                  <div className="space-y-1">
                    {output.map((line, i) => (
                      <div key={i} className="text-green-400 font-mono text-sm leading-relaxed break-all whitespace-pre-wrap">
                        <span className="text-slate-600 mr-2">❯</span>{line}
                      </div>
                    ))}
                    {error && (
                      <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-red-400 font-bold text-xs mb-1">{t('playground.error')}</div>
                          <div className="text-red-300 font-mono text-sm">{error}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Terminal size={40} className="text-slate-600 mb-3" />
                    <p className="text-slate-500 text-sm mb-2">{t('playground.noOutput')}</p>
                    <p className="text-slate-600 text-xs">{t('playground.help')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
