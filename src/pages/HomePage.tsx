import { useState, useEffect, useMemo } from 'react';
import { courses, roadmaps } from '../data/courses';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useBilingualContent } from '../i18n/content';
import {
  Rocket, Star, Users, Trophy, ArrowLeft, Code2, BookOpen,
  Zap, ChevronLeft, Play, Target
} from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedCourse: (id: string) => void;
}

const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < texts[currentIndex].length) {
          setCurrentText(prev => prev + texts[currentIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setCurrentText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        } else {
          setDeleting(false);
          setCurrentIndex(prev => (prev + 1) % texts.length);
        }
      }
    }, deleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [charIndex, currentIndex, deleting, texts]);

  return (
    <span className="gradient-text">
      {currentText}
      <span className="text-indigo-400 animate-pulse">|</span>
    </span>
  );
};

const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) => (
  <div className={`glass rounded-2xl p-6 text-center card-hover border border-white/10`}>
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
      {icon}
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-slate-400 text-sm font-medium">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) => (
  <div className={`glass rounded-2xl p-6 card-hover border border-white/10 group`}>
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function HomePage({ setCurrentPage, setSelectedCourse }: HomePageProps) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { localizeCourses } = useBilingualContent();

  const localizedCourses = useMemo(() => localizeCourses(courses, lang), [lang]);

  const typewriterTexts = [
    t('home.typewriter.professional'),
    t('home.typewriter.webDev'),
    t('home.typewriter.aiExpert'),
    t('home.typewriter.gameDev'),
    t('home.typewriter.innovator'),
  ];

  const stats = [
    { icon: <BookOpen size={24} className="text-white" />, value: `${courses.length}+`, label: t('home.stats.courses'), color: 'from-purple-500 to-pink-500' },
    { icon: <Users size={24} className="text-white" />, value: t('home.stats.active'), label: t('home.stats.students'), color: 'from-blue-500 to-cyan-500' },
    { icon: <Star size={24} className="text-white" />, value: t('home.stats.interactive'), label: t('home.stats.learning'), color: 'from-green-500 to-emerald-500' },
    { icon: <Trophy size={24} className="text-white" />, value: t('home.stats.certified'), label: t('home.stats.achievement'), color: 'from-yellow-500 to-orange-500' },
  ];

  const features = [
    { icon: '🎮', title: t('feature.games'), desc: t('feature.gamesDesc'), color: 'from-yellow-500 to-orange-500' },
    { icon: '🤖', title: t('feature.ai'), desc: t('feature.aiDesc'), color: 'from-purple-500 to-pink-500' },
    { icon: '📱', title: t('feature.anytime'), desc: t('feature.anytimeDesc'), color: 'from-blue-500 to-cyan-500' },
    { icon: '🏆', title: t('feature.certificates'), desc: t('feature.certificatesDesc'), color: 'from-green-500 to-emerald-500' },
    { icon: '👨‍👩‍👧‍👦', title: t('feature.community'), desc: t('feature.communityDesc'), color: 'from-red-500 to-pink-500' },
    { icon: '🎯', title: t('feature.paths'), desc: t('feature.pathsDesc'), color: 'from-indigo-500 to-purple-500' },
  ];

  const testimonials = [
    { name: t('testimonial.1.name'), age: 14, text: t('testimonial.1.text'), avatar: '👦', stars: 5 },
    { name: t('testimonial.2.name'), age: 16, text: t('testimonial.2.text'), avatar: '👧', stars: 5 },
    { name: t('testimonial.3.name'), age: 12, text: t('testimonial.3.text'), avatar: '👦', stars: 5 },
    { name: t('testimonial.4.name'), age: 18, text: t('testimonial.4.text'), avatar: '👩', stars: 5 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 mt-12 sm:mt-20 animate-fadeInUp">
            <Zap size={14} className="text-yellow-400" />
            {t('home.hero.badge')}
            <Zap size={14} className="text-yellow-400" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-fadeInUp">
            {t('home.hero.title1')}
            <br />
            {t('home.hero.title2')}
            <br />
            <TypewriterText texts={typewriterTexts} />
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp">
            {t('home.hero.desc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeInUp">
            <button
              onClick={() => setCurrentPage('courses')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-indigo-500/40"
            >
              <Rocket size={20} />
              {t('home.hero.cta')}
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage('roadmap')}
              className="flex items-center justify-center gap-2 px-8 py-4 glass border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all hover:scale-105"
            >
              <Target size={20} />
              {t('home.hero.choosePath')}
            </button>
          </div>

          {/* Floating Code Cards */}
          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="code-block p-4 text-left animate-float" style={{ animationDelay: '0s' }}>
                <div className="text-slate-500 text-xs mb-2"># Python</div>
                <div className="text-sm">
                  <span className="code-keyword">def </span>
                  <span className="code-function">hello</span>
                  <span className="text-white">(name):</span>
                  <br />
                  <span className="text-slate-500">  # </span>
                  <span className="code-comment">{lang === 'ar' ? 'مرحباً بالعالم!' : 'Hello World!'}</span>
                  <br />
                  <span className="text-white">  </span>
                  <span className="code-keyword">print</span>
                  <span className="text-white">(</span>
                  <span className="code-string">f"</span>
                  <span className="code-string">{lang === 'ar' ? 'مرحباً' : 'Hello'}"{'{'}name{'}'}"</span>
                  <span className="text-white">)</span>
                </div>
              </div>
              <div className="code-block p-4 text-left animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-slate-500 text-xs mb-2">&lt;!-- HTML --&gt;</div>
                <div className="text-sm">
                  <span className="code-keyword">&lt;div </span>
                  <span className="code-variable">class</span>
                  <span className="text-white">=</span>
                  <span className="code-string">"hero"</span>
                  <span className="code-keyword">&gt;</span>
                  <br />
                  <span className="text-white">  </span>
                  <span className="code-keyword">&lt;h1&gt;</span>
                  <span className="code-string">{lang === 'ar' ? 'موقعي' : 'My Site'}</span>
                  <span className="code-keyword">&lt;/h1&gt;</span>
                  <br />
                  <span className="code-keyword">&lt;/div&gt;</span>
                </div>
              </div>
              <div className="code-block p-4 text-left animate-float" style={{ animationDelay: '2s' }}>
                <div className="text-slate-500 text-xs mb-2">// JavaScript</div>
                <div className="text-sm">
                  <span className="code-keyword">const </span>
                  <span className="code-variable">dream </span>
                  <span className="text-white">= </span>
                  <span className="code-string">{lang === 'ar' ? '"مبرمج"' : '"Programmer"'}</span>
                  <span className="text-white">;</span>
                  <br />
                  <span className="code-function">console</span>
                  <span className="text-white">.</span>
                  <span className="code-function">log</span>
                  <span className="text-white">(</span>
                  <br />
                  <span className="text-white">  </span>
                  <span className="code-string">{lang === 'ar' ? '"أنا سأكون"' : '"I will be"'}</span>
                  <span className="text-white">, dream</span>
                  <br />
                  <span className="text-white">);</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-4">
            📚 {t('home.courses.sectionBadge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('home.courses.title')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('home.courses.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedCourses.map((course) => (
            <div
              key={course.id}
              className="glass rounded-2xl overflow-hidden card-hover border border-white/10 cursor-pointer group"
              onClick={() => { setSelectedCourse(course.id); setCurrentPage('lesson'); }}
            >
              <div className={`bg-gradient-to-br ${course.bgGradient} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="text-5xl mb-3">{course.icon}</div>
                    {course.free ? (
                      <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded-lg text-xs font-bold border border-green-400/30">
                        {t('courses.free')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/30 text-yellow-200 rounded-lg text-xs font-bold border border-yellow-400/30">
                        {course.price} EGP
                      </span>
                    )}
                  </div>
                  <span className={`badge ${
                    course.level === 'مبتدئ' || course.level === 'Beginner' ? 'bg-green-500/30 text-green-300 border border-green-500/30' :
                    course.level === 'متوسط' || course.level === 'Intermediate' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-500/30 text-red-300 border border-red-500/30'
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.lessons} {t('lesson.count')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy size={14} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {course.ageRange}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-xs border border-white/10">
                      {skill}
                    </span>
                  ))}
                  {course.skills.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-xs border border-white/10">
                      +{course.skills.length - 3}
                    </span>
                  )}
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                >
                  <Play size={14} />
                  {t('home.courses.start')}
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('courses')}
            className="flex items-center gap-2 mx-auto px-6 py-3 glass border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            {t('home.courses.viewAll')}
            <ArrowLeft size={16} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-4">
            ✨ {t('home.features.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('home.features.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </section>

      {/* Learning Paths Preview */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 mb-4">
            🗺️ {t('home.roadmaps.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('home.roadmaps.title')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('home.roadmaps.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="glass rounded-2xl p-6 card-hover border border-white/10 cursor-pointer"
              onClick={() => setCurrentPage('roadmap')}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-2xl mb-4`}>
                {roadmap.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{roadmap.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{roadmap.subtitle}</p>
              <div className="flex gap-3 text-sm text-slate-400 mb-4">
                <span>⏱️ {roadmap.duration}</span>
                <span>👤 {roadmap.ageRange}</span>
              </div>
              <div className="space-y-2">
                {roadmap.steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {step.id}
                    </span>
                    <span className="text-slate-300">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 mb-4">
            ⭐ {t('home.testimonials.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('home.testimonials.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((tItem, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/10 card-hover">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
                  {tItem.avatar}
                </div>
                <div>
                  <div className="text-white font-bold">{tItem.name}</div>
                  <div className="text-slate-400 text-sm">{lang === 'ar' ? `عمر ${tItem.age} سنة` : `${tItem.age} ${t('home.testimonials.age')}`}</div>
                  <div className="flex gap-1 mt-1">
                    {Array(tItem.stars).fill(0).map((_, j) => (
                      <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">"{tItem.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
            <div className="relative">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                {t('home.cta.title')}
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                {t('home.cta.desc')}
              </p>
              <button
                onClick={() => setCurrentPage('courses')}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-indigo-500/40"
              >
                <Rocket size={24} />
                {t('home.cta.button')}
                <ArrowLeft size={24} />
              </button>
              <p className="text-slate-400 text-sm mt-4">✅ {t('home.cta.features')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code2 size={24} className="text-indigo-400" />
              <span className="text-white font-bold text-lg">{t('nav.brand')}</span>
              <span className="text-slate-400 text-sm">- {t('home.footer.tagline')}</span>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <span>Scratch</span>
              <span>Python</span>
              <span>HTML/CSS</span>
              <span>JavaScript</span>
              <span>AI</span>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">
                {t('home.footer.made')}
              </div>
              <div className="text-slate-600 text-xs mt-1">
                {lang === 'ar'
                  ? 'جميع الحقوق محفوظة © 2026 Codixa | الملكية الفكرية للمهندس عبدالرحمن محمد'
                  : 'All rights reserved © 2026 Codixa | Intellectual property of Eng. Abdulrahman Mohamed'}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
