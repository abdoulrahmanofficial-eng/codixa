import { useState, useEffect } from 'react';
import { courses } from '../data/courses';
import type { Lesson, QuizQuestion, Chapter } from '../data/courses';
import {
  ChevronLeft, ChevronRight, BookOpen, Play, CheckCircle,
  Circle, Clock, Trophy, ArrowLeft, Menu, X,
  Code2, FileText, HelpCircle, Dumbbell, Star
} from 'lucide-react';

interface LessonPageProps {
  selectedCourse: string;
  setCurrentPage: (page: string) => void;
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
      elements.push(<h1 key={key} className="text-2xl sm:text-3xl font-black text-white mb-6 mt-4 gradient-text">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key} className="text-xl sm:text-2xl font-bold text-white mb-4 mt-6 flex items-center gap-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key} className="text-lg font-bold text-indigo-400 mb-3 mt-5">{line.slice(4)}</h3>);
    } else if (line.startsWith('```')) {
      // Code block
      const lang = line.slice(3).trim();
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
              {lang && <span className="text-slate-400 text-xs mr-2">{lang}</span>}
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 leading-relaxed">
                <code>{codeLines.join('\n')}</code>
              </pre>
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
      // Table
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
    } else if (line === '') {
      elements.push(<div key={key} className="h-2" />);
    } else {
      elements.push(
        <p key={key} className="text-slate-300 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }

  return <div className="lesson-content">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-indigo-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 underline" target="_blank">$1</a>');
}

function QuizComponent({ quiz, onComplete }: { quiz: QuizQuestion[]; onComplete: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

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
          {percentage >= 80 ? 'ممتاز!' : percentage >= 60 ? 'جيد!' : 'حاول مجدداً'}
        </h3>
        <p className="text-slate-400 mb-6">
          أجبت على <span className="text-white font-bold">{score}</span> من <span className="text-white font-bold">{quiz.length}</span> سؤال بشكل صحيح
        </p>
        <div className="w-32 h-32 rounded-full border-4 border-indigo-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-black text-white">{percentage}%</span>
        </div>
        {percentage >= 80 ? (
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            <CheckCircle size={18} className="inline ml-2" />
            انتقل للدرس التالي
          </button>
        ) : (
          <button
            onClick={() => { setCurrentQ(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false); }}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            حاول مجدداً
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-slate-400 text-sm">سؤال {currentQ + 1} من {quiz.length}</span>
        <div className="flex gap-1">
          {quiz.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-indigo-500' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-white font-bold text-lg sm:text-xl mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full text-right p-4 rounded-xl border transition-all quiz-option ${
              !answered
                ? 'border-white/10 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10'
                : idx === question.correct
                ? 'correct border-green-500 bg-green-500/10 text-green-400'
                : idx === selected
                ? 'wrong border-red-500 bg-red-500/10 text-red-400'
                : 'border-white/5 text-slate-500'
            }`}
          >
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

      {/* Explanation */}
      {answered && (
        <div className={`p-4 rounded-xl mb-6 border ${
          selected === question.correct
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-2">
            {selected === question.correct ? <CheckCircle size={16} /> : '❌'}
            {selected === question.correct ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
          </div>
          <p className="text-sm">{question.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {answered && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {currentQ + 1 >= quiz.length ? 'إنهاء الاختبار' : 'السؤال التالي'}
          <ChevronLeft size={18} />
        </button>
      )}
    </div>
  );
}

export default function LessonPage({ selectedCourse, setCurrentPage }: LessonPageProps) {
  const course = courses.find(c => c.id === selectedCourse);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Flatten all lessons
  const allLessons: { lesson: Lesson; chapter: Chapter }[] = [];
  course?.chapters.forEach(chapter => {
    chapter.lessons.forEach(lesson => {
      allLessons.push({ lesson, chapter });
    });
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentItem = allLessons[currentLessonIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLessonIndex]);

  if (!course || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-white font-bold text-2xl mb-4">الكورس غير موجود</h2>
          <button onClick={() => setCurrentPage('courses')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            العودة للكورسات
          </button>
        </div>
      </div>
    );
  }

  const { lesson, chapter } = currentItem;
  const isCompleted = completedLessons.has(lesson.id);
  const progressPercent = Math.round((completedLessons.size / allLessons.length) * 100);

  const markComplete = () => {
    setCompletedLessons(prev => new Set([...prev, lesson.id]));
    if (currentLessonIndex + 1 < allLessons.length) {
      setTimeout(() => setCurrentLessonIndex(i => i + 1), 500);
    }
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'reading': return <FileText size={14} />;
      case 'quiz': return <HelpCircle size={14} />;
      case 'exercise': return <Dumbbell size={14} />;
      case 'video': return <Play size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const getLessonTypeLabel = (type: Lesson['type']) => {
    switch (type) {
      case 'reading': return 'قراءة';
      case 'quiz': return 'اختبار';
      case 'exercise': return 'تمرين';
      case 'video': return 'فيديو';
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Top Progress Bar */}
      <div className="fixed top-16 right-0 left-0 z-40 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Course Header */}
      <div className="glass border-b border-white/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('courses')}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">الكورسات</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold text-sm truncate max-w-[200px]">{course.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="text-slate-400 hidden sm:block">{completedLessons.size}/{allLessons.length} درس</div>
                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/30">
                  {progressPercent}% مكتمل
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-3 py-1.5 glass border border-white/10 text-slate-300 rounded-lg text-sm hover:text-white transition-colors"
              >
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                <span className="hidden sm:inline">المنهج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-white/10 overflow-y-auto transition-transform duration-300 pt-32 pb-4 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-4">
            {/* Course Info */}
            <div className={`bg-gradient-to-br ${course.bgGradient} rounded-2xl p-4 mb-6 relative overflow-hidden`}>
              <div className="text-3xl mb-2">{course.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1">{course.title}</h3>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Clock size={12} />
                {course.duration}
                <Trophy size={12} className="mr-1" />
                {course.level}
              </div>
            </div>

            {/* Chapters & Lessons */}
            {course.chapters.map((ch) => (
              <div key={ch.id} className="mb-4">
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 px-1">{ch.title}</h4>
                <div className="space-y-1">
                  {ch.lessons.map((les) => {
                    const idx = allLessons.findIndex(item => item.lesson.id === les.id);
                    const isCurrent = idx === currentLessonIndex;
                    const isDone = completedLessons.has(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => { setCurrentLessonIndex(idx); setSidebarOpen(false); }}
                        className={`w-full text-right flex items-start gap-2 p-2.5 rounded-xl transition-all text-sm ${
                          isCurrent
                            ? 'sidebar-active'
                            : 'hover:bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone
                            ? <CheckCircle size={16} className="text-green-400" />
                            : isCurrent
                            ? <div className="w-4 h-4 rounded-full bg-white/30 border-2 border-white" />
                            : <Circle size={16} className="text-slate-600" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${isCurrent ? 'text-white' : ''}`}>{les.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`flex items-center gap-1 text-xs ${isCurrent ? 'text-white/70' : 'text-slate-600'}`}>
                              {getLessonIcon(les.type)}
                              {getLessonTypeLabel(les.type)}
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

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <span>{chapter.title}</span>
              <ChevronLeft size={14} />
              <span className="text-white">{lesson.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`badge glass border border-white/10 text-slate-300 flex items-center gap-1`}>
                {getLessonIcon(lesson.type)}
                {getLessonTypeLabel(lesson.type)}
              </span>
              <span className="badge glass border border-white/10 text-slate-300 flex items-center gap-1">
                <Clock size={12} />
                {lesson.duration}
              </span>
              {isCompleted && (
                <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle size={12} />
                  مكتمل
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{lesson.title}</h1>
          </div>

          {/* Lesson Content */}
          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 mb-6">
            <MarkdownRenderer content={lesson.content} />
          </div>

          {/* Code Example */}
          {lesson.codeExample && (
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Code2 size={18} className="text-indigo-400" />
                مثال كود كامل
              </h3>
              <div className="code-block overflow-hidden">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="text-slate-400 text-xs mr-2">{course.language}</span>
                </div>
                <div className="p-5 overflow-x-auto">
                  <pre className="text-sm text-slate-300 leading-relaxed">
                    <code>{lesson.codeExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="glass rounded-2xl p-6 sm:p-8 border border-indigo-500/20 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <HelpCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">اختبر نفسك!</h3>
                  <p className="text-slate-400 text-sm">{lesson.quiz.length} سؤال لاختبار فهمك</p>
                </div>
              </div>
              <QuizComponent quiz={lesson.quiz} onComplete={markComplete} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentLessonIndex(i => Math.max(0, i - 1))}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-2 px-5 py-3 glass border border-white/10 text-slate-300 rounded-xl font-semibold hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
              الدرس السابق
            </button>

            <div className="text-center">
              <div className="text-slate-400 text-sm">{currentLessonIndex + 1} / {allLessons.length}</div>
              {!isCompleted && !lesson.quiz && (
                <button
                  onClick={markComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm mt-1 hover:opacity-90 transition-all hover:scale-105"
                >
                  <CheckCircle size={14} />
                  تم الانتهاء
                </button>
              )}
              {isCompleted && (
                <div className="flex items-center gap-1 text-green-400 text-sm font-bold mt-1">
                  <CheckCircle size={14} />
                  مكتمل
                </div>
              )}
            </div>

            {currentLessonIndex + 1 < allLessons.length ? (
              <button
                onClick={() => setCurrentLessonIndex(i => Math.min(allLessons.length - 1, i + 1))}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105"
              >
                الدرس التالي
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('achievements')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                <Trophy size={18} />
                شاهد إنجازاتك
              </button>
            )}
          </div>

          {/* XP Earned */}
          {isCompleted && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-2 text-yellow-400 text-sm font-bold">
              <Star size={16} />
              +20 XP - أحسنت! واصل التعلم 🔥
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
