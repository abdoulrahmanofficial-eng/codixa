import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import {
  getDynamicCourse, getLessonMeta, getLessonsWithContent,
  type BackendCourse, type BackendLesson, type QuizQuestion,
} from '../lib/courseService';
import { getCoursePrice } from '../lib/priceService';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, CheckCircle, Circle, Menu, X, Loader2, ShoppingCart, Lock, HelpCircle, FileText, Dumbbell, Play, BookOpen, Trophy } from 'lucide-react';

interface BackendCoursePageProps {
  setCurrentPage: (page: string) => void;
}

const cleanTitle = (t: string) => t
  .replace(/\.md$/i, '')
  .replace(/^\d+\s*[-_]\s*/, '')
  .replace(/[-_]+/g, ' ')
  .trim();
const cleanQuestion = (q: string) => q.replace(/^(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر)\s*[\n\-:،,]*\s*/, '').trim();

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-indigo-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 underline" target="_blank">$1</a>');
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = keyCounter++;

    if (line.startsWith('# ')) {
      // skip h1 — it duplicates the page title above
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key} className="text-xl sm:text-2xl font-bold text-white mb-4 mt-6 flex items-center gap-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key} className="text-lg font-bold text-indigo-400 mb-3 mt-5">{line.slice(4)}</h3>);
    } else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={key} className="my-4">
          <div className="code-block overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500" />
              <div className="terminal-dot bg-yellow-500" />
              <div className="terminal-dot bg-green-500" />
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 leading-relaxed font-mono"><code>{codeLines.join('\n')}</code></pre>
            </div>
          </div>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key} className="space-y-2 mb-4 mr-4">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-slate-300">
              <span className="text-indigo-400 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key} className="space-y-2 mb-4 mr-4">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-slate-300">
              <span className="text-indigo-400 font-bold min-w-[20px]">{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].includes('---')) tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length > 0) {
        const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
        const rows = tableLines.slice(1).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));
        elements.push(
          <div key={key} className="my-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-900/50">
                  {headers.map((h, j) => (
                    <th key={j} className="px-4 py-2 text-right text-indigo-300 font-bold border border-white/10">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white/5' : ''}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-slate-300 border border-white/10" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    } else if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key} className="border-r-4 border-indigo-500 bg-indigo-500/10 p-4 rounded-xl my-4 text-slate-300">
          {quoteLines.map((q, j) => <p key={j} className="mb-1 last:mb-0">{q}</p>)}
        </blockquote>
      );
      continue;
    } else if (/^---/.test(line)) {
      elements.push(<hr key={key} className="border-white/10 my-6" />);
    } else if (line === '') {
      elements.push(<div key={key} className="h-2" />);
    } else {
      elements.push(
        <p key={key} className="text-slate-300 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
    i++;
  }
  return <div className="lesson-content">{elements}</div>;
}

function QuizComponent({ quiz, onComplete }: { quiz: QuizQuestion[]; onComplete: () => void }) {
  const { t } = useI18n();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }, [quiz]);

  const question = quiz[currentQ];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= quiz.length) {
      setFinished(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h3 className="text-2xl font-black text-white mb-2">
          {percentage >= 80 ? t('lesson.quiz.excellent') : percentage >= 60 ? t('lesson.quiz.good') : t('lesson.quiz.retry')}
        </h3>
        <p className="text-slate-400 mb-6">
          {t('lesson.quiz.score')} <span className="text-white font-bold">{score}</span> {t('lesson.quiz.of')} <span className="text-white font-bold">{quiz.length}</span> {t('lesson.quiz.correctly')}
        </p>
        <div className="w-32 h-32 rounded-full border-4 border-indigo-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-black text-white">{percentage}%</span>
        </div>
        {percentage >= 80 ? (
          <button onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto">
            <CheckCircle size={18} />
            {t('lesson.quiz.nextLesson')}
          </button>
        ) : (
          <button onClick={() => { setCurrentQ(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false); }}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all">
            {t('lesson.quiz.retryBtn')}
          </button>
        )}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-slate-400 text-sm">{t('lesson.quiz.questionOf')} {currentQ + 1} {t('lesson.quiz.of')} {quiz.length}</span>
        <div className="flex gap-1">
          {quiz.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-indigo-500' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-white font-bold text-lg sm:text-xl mb-6 leading-relaxed">
        {cleanQuestion(question.question)}
      </h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)}
            className={`w-full text-right p-4 rounded-xl border transition-all quiz-option ${
              !answered
                ? 'border-white/10 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10'
                : idx === question.correct
                ? 'correct border-green-500 bg-green-500/10 text-green-400'
                : idx === selected
                ? 'wrong border-red-500 bg-red-500/10 text-red-400'
                : 'border-white/5 text-slate-500'
            }`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                !answered ? 'border-current' :
                idx === question.correct ? 'border-green-500 bg-green-500 text-white' :
                idx === selected ? 'border-red-500 bg-red-500 text-white' :
                'border-white/10'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {answered && (
        <div className={`p-4 rounded-xl mb-6 border ${
          selected === question.correct
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-2">
            {selected === question.correct ? <CheckCircle size={16} /> : '❌'}
            {selected === question.correct ? `${t('lesson.quiz.correct')} 🎉` : t('lesson.quiz.wrong')}
          </div>
          <p className="text-sm">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
          {currentQ + 1 >= quiz.length ? t('lesson.finish') : t('lesson.nextQuestion')}
        </button>
      )}
    </div>
  );
}

const COURSE_ID = 'backend-engineering';

export default function BackendCoursePage({ setCurrentPage }: BackendCoursePageProps) {
  const { t, lang } = useI18n();
  const { user, profile, purchaseCourse, completeLesson, setLastCourse, setLastLesson } = useAuth();
  const [course, setCourse] = useState<BackendCourse | null>(null);
  const [lessonMeta, setLessonMeta] = useState<BackendLesson[]>([]);
  const [lessonContent, setLessonContent] = useState<BackendLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState(false);
  const [effectivePrice, setEffectivePrice] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.completedLessons) {
      setCompletedLessons(new Set(profile.completedLessons));
    }
  }, [profile?.completedLessons]);

  useEffect(() => {
    loadCourse();
    getCoursePrice(COURSE_ID).then(p => setEffectivePrice(p));
  }, []);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const [courseData, meta] = await Promise.all([
        getDynamicCourse(COURSE_ID),
        getLessonMeta(COURSE_ID),
      ]);
      if (courseData) setCourse(courseData);
      if (meta.length > 0) {
        setLessonMeta(meta);
        setLessonContent(meta.map(l => ({ ...l, content: '' })));
      }
    } catch (e) {
      console.error('Failed to load backend course:', e);
    } finally {
      setLoading(false);
    }
  };

  const isFree = effectivePrice !== null ? effectivePrice === 0 : (course?.free ?? true);
  const isPurchased = user && profile?.purchasedCourses?.includes(COURSE_ID);
  const canAccess = isFree || isPurchased;

  useEffect(() => {
    if (lessonMeta.length > 0 && course) {
      setCurrentLessonIndex(getInitialLessonIndex());
    }
  }, [lessonMeta.length, course?.id]);

  useEffect(() => {
    if (course && canAccess) {
      setLastCourse(COURSE_ID);
    }
  }, [course?.id, canAccess]);

  useEffect(() => {
    if (course && canAccess && currentItem) {
      setLastLesson(COURSE_ID, currentItem.id);
    }
  }, [currentLessonIndex]);

  // Load full content once access is confirmed
  const loadFullContent = useCallback(async () => {
    if (lessonContent.length > 0 && lessonContent[0]?.content) return;
    const isFree = effectivePrice !== null ? effectivePrice === 0 : (course?.free ?? true);
    const purchased = profile?.purchasedCourses ?? [];
    if (!isFree && !purchased.includes(COURSE_ID)) return;

    setLoadingContent(true);
    try {
      const full = await getLessonsWithContent(COURSE_ID, purchased, isFree);
      if (full.length > 0) setLessonContent(full);
    } catch (e) {
      console.error('Failed to load lesson content:', e);
    } finally {
      setLoadingContent(false);
    }
  }, [course?.free, profile?.purchasedCourses, lessonContent]);

  useEffect(() => {
    if (course && lessonMeta.length > 0) {
      loadFullContent();
    }
  }, [course, lessonMeta.length, loadFullContent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLessonIndex]);

  const getLessonType = (les: BackendLesson) => les.quiz && les.quiz.length > 0 ? 'reading' : 'reading';

  const getLessonIcon = (type: string) => {
    if (type === 'quiz') return <HelpCircle size={14} />;
    if (type === 'exercise') return <Dumbbell size={14} />;
    if (type === 'video') return <Play size={14} />;
    return <FileText size={14} />;
  };

  const getLessonTypeLabel = (type: string) => {
    if (type === 'quiz') return lang === 'ar' ? 'اختبار' : 'Quiz';
    if (type === 'exercise') return lang === 'ar' ? 'تمرين' : 'Exercise';
    if (type === 'video') return lang === 'ar' ? 'فيديو' : 'Video';
    return lang === 'ar' ? 'قراءة' : 'Reading';
  };

  const getInitialLessonIndex = () => {
    if (!profile?.lastLesson?.[COURSE_ID]) return 0;
    const idx = lessonMeta.findIndex(l => l.id === profile.lastLesson[COURSE_ID]);
    return idx >= 0 ? idx : 0;
  };

  const currentItem = lessonContent[currentLessonIndex] || lessonMeta[currentLessonIndex];

  const completedInCourse = lessonMeta.filter(l => completedLessons.has(l.id)).length;
  const progressPercent = lessonMeta.length > 0 ? Math.min(100, Math.round((completedInCourse / lessonMeta.length) * 100)) : 0;

  const chapters = course?.chapters || [];
  const groupedLessons = chapters.map(ch => ({
    chapter: ch,
    lessonItems: lessonMeta.filter(l => l.chapterId === ch.id),
  }));

  const handleBuy = async () => {
    if (!user) { setCurrentPage('auth'); return; }
    if (!course) return;
    setBuying(true);
    const price = effectivePrice ?? course.price;
    if (profile && profile.wallet.balance >= price) {
      await purchaseCourse(COURSE_ID, price);
      await loadFullContent();
    } else {
      setCurrentPage('wallet');
    }
    setBuying(false);
  };

  const markComplete = useCallback(() => {
    if (!currentItem) return;
    setCompletedLessons(prev => new Set([...prev, currentItem.id]));
    completeLesson(currentItem.id);
    if (currentLessonIndex + 1 < lessonMeta.length) {
      setTimeout(() => setCurrentLessonIndex(i => i + 1), 500);
    }
  }, [currentItem, currentLessonIndex, lessonMeta.length, completeLesson]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-white font-bold text-2xl mb-4">
            {lang === 'ar' ? 'الكورس غير متوفر بعد' : 'Course not available yet'}
          </h2>
          <p className="text-slate-400 mb-6">
            {lang === 'ar' ? 'يرجى العودة لاحقاً' : 'Please check back later'}
          </p>
          <button onClick={() => setCurrentPage('courses')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            {t('lesson.returnToCourses')}
          </button>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 text-5xl animate-pulse-glow">
            <Lock size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">{t('lesson.locked')}</h2>
          <p className="text-slate-400 mb-2">{course.title}</p>
          <p className="text-slate-400 mb-6">{t('lesson.lockedDesc')}</p>

          <div className="glass rounded-2xl p-4 border border-yellow-500/20 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 font-semibold">{course.title}</span>
              <span className="text-yellow-400 font-black text-lg">{effectivePrice ?? course.price} EGP</span>
            </div>
            {!user ? (
              <button onClick={() => setCurrentPage('auth')}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                {t('auth.login')}
              </button>
            ) : (
              <button onClick={handleBuy} disabled={buying}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
                <ShoppingCart size={18} />
                {t('lesson.buyNow')} - {effectivePrice ?? course.price} EGP
              </button>
            )}
          </div>
          <button onClick={() => setCurrentPage('courses')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">
            <ArrowLeft size={16} className="inline ml-1" />
            {t('lesson.returnToCourses')}
          </button>
        </div>
      </div>
    );
  }

  if (lessonMeta.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-white font-bold text-2xl mb-4">
            {lang === 'ar' ? 'جاري تحضير الدروس...' : 'Preparing lessons...'}
          </h2>
          <p className="text-slate-400 mb-6">
            {lang === 'ar' ? 'سيتم إضافة المحتوى قريباً' : 'Content will be added soon'}
          </p>
          <button onClick={() => setCurrentPage('courses')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            {t('lesson.returnToCourses')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    setCurrentLessonIndex(0);
    return null;
  }

  const currentLesson = currentItem;
  const hasContent = !!lessonContent[currentLessonIndex]?.content;

  return (
    <div className="min-h-screen flex flex-col pt-0">
      <div className="fixed top-0 right-0 left-0 z-40 h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentPage('courses')}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">{t('lesson.back')}</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold text-sm truncate max-w-[200px]">{course.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="text-slate-400 hidden sm:block">{completedInCourse}/{lessonMeta.length} {t('lesson.count')}</div>
                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/30">
                  {progressPercent}% {t('lesson.progress')}
                </div>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-3 py-1.5 glass border border-white/10 text-slate-300 rounded-lg text-sm hover:text-white transition-colors">
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                <span className="hidden sm:inline">{t('lesson.curriculum')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-white/10 overflow-y-auto transition-transform duration-300 pt-16 pb-4 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-4">
            <div className={`bg-gradient-to-br ${course.bgGradient} rounded-2xl p-4 mb-6 relative overflow-hidden`}>
              <div className="text-3xl mb-2">{course.icon || '⚙️'}</div>
              <h3 className="text-white font-bold text-sm mb-1">{course.title}</h3>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Clock size={12} />
                {course.lessonsCount} {t('lesson.count')}
                <Trophy size={12} className="mr-1" />
                {course.level}
              </div>
            </div>

            {groupedLessons.map(group => (
              <div key={group.chapter.id} className="mb-4">
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 px-1">{group.chapter.title}</h4>
                <div className="space-y-1">
                  {group.lessonItems.map(les => {
                    const idx = lessonMeta.findIndex(l => l.id === les.id);
                    const isCurrent = idx === currentLessonIndex;
                    const isDone = completedLessons.has(les.id);
                    return (
                      <button key={les.id} onClick={() => { setCurrentLessonIndex(idx); setSidebarOpen(false); }}
                        className={`w-full text-right flex items-start gap-2 p-2.5 rounded-xl transition-all text-sm ${isCurrent ? 'sidebar-active' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone ? <CheckCircle size={16} className="text-green-400" />
                            : isCurrent ? <div className="w-4 h-4 rounded-full bg-white/30 border-2 border-white" />
                            : <Circle size={16} className="text-slate-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${isCurrent ? 'text-white' : ''}`}>{cleanTitle(les.title)}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`flex items-center gap-1 text-xs ${isCurrent ? 'text-white/70' : 'text-slate-600'}`}>
                              {getLessonIcon(getLessonType(les))}
                              {getLessonTypeLabel(getLessonType(les))}
                            </span>
                            <span className={`text-xs ${isCurrent ? 'text-white/70' : 'text-slate-600'}`}>
                              <Clock size={10} className="inline ml-1" />
                              {les.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <span>{currentLesson.chapterTitle}</span>
              <ChevronLeft size={14} />
              <span className="text-white">{cleanTitle(currentLesson.title)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge glass border border-white/10 text-slate-300 flex items-center gap-1">
                <Clock size={12} />
                {currentLesson.duration}
              </span>
              {completedLessons.has(currentLesson.id) && (
                <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle size={12} />
                  {t('lesson.completed')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{cleanTitle(currentLesson.title)}</h1>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 mb-6">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
              </div>
            ) : hasContent ? (
              <MarkdownRenderer content={lessonContent[currentLessonIndex].content} />
            ) : (
              <p className="text-slate-400 text-center py-8">
                {lang === 'ar' ? 'جاري تحميل المحتوى...' : 'Loading content...'}
              </p>
            )}
          </div>

          {hasContent && lessonContent[currentLessonIndex].quiz && lessonContent[currentLessonIndex].quiz!.length > 0 && (
            <div className="glass rounded-2xl p-6 sm:p-8 border border-indigo-500/20 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <HelpCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{t('lesson.quiz.title')}</h3>
                  <p className="text-slate-400 text-sm">{lessonContent[currentLessonIndex].quiz!.length} {t('lesson.quiz.desc')}</p>
                </div>
              </div>
              <QuizComponent key={currentLesson.id} quiz={lessonContent[currentLessonIndex].quiz!} onComplete={markComplete} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <button onClick={() => setCurrentLessonIndex(i => Math.max(0, i - 1))}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-2 px-5 py-3 glass border border-white/10 text-slate-300 rounded-xl font-semibold hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
              {t('lesson.prev')}
            </button>

            <div className="text-center">
              <div className="text-slate-400 text-sm">{currentLessonIndex + 1} / {lessonMeta.length}</div>
              {!completedLessons.has(currentLesson.id) && hasContent && (
                <button onClick={markComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm mt-1 hover:opacity-90 transition-all hover:scale-105">
                  <CheckCircle size={14} />
                  {t('lesson.markComplete')}
                </button>
              )}
              {completedLessons.has(currentLesson.id) && (
                <div className="flex items-center gap-1 text-green-400 text-sm font-bold mt-1">
                  <CheckCircle size={14} /> {t('lesson.completed')}
                </div>
              )}
            </div>

            {currentLessonIndex + 1 < lessonMeta.length ? (
              <button onClick={() => setCurrentLessonIndex(i => Math.min(lessonMeta.length - 1, i + 1))}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105">
                {t('lesson.next')}
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button onClick={() => setCurrentPage('achievements')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                {t('lesson.viewAchievements')}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
