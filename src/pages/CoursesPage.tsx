import { useState, useMemo, useEffect } from 'react';
import { courses } from '../data/courses';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useBilingualContent } from '../i18n/content';
import { getDynamicCourses, type BackendCourse } from '../lib/courseService';
import { getAllPriceOverrides } from '../lib/priceService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Clock, Users, ChevronLeft, Play, Star, Trophy, Zap, Lock, ShoppingCart, Loader2, Server } from 'lucide-react';


interface CoursesPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedCourse: (id: string) => void;
}

export default function CoursesPage({ setCurrentPage, setSelectedCourse }: CoursesPageProps) {
  const { t, lang } = useI18n();
  const { user, profile, purchaseCourse, validateDiscountCode: validateCode } = useAuth();
  const { localizeCourses } = useBilingualContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(t('common.all'));
  const [dynamicCourses, setDynamicCourses] = useState<BackendCourse[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState(true);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      getDynamicCourses(),
      getAllPriceOverrides(),
    ]).then(([c, overrides]) => {
      setDynamicCourses(c);
      setPriceOverrides(overrides);
      setLoadingDynamic(false);
    }).catch(() => setLoadingDynamic(false));
  }, []);
  const [selectedLang, setSelectedLang] = useState(t('common.all'));
  const [confirmCourse, setConfirmCourse] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountValid, setDiscountValid] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const localizedCourses = useMemo(() => localizeCourses(courses, lang), [lang]);
  const completedLessonIds = profile?.completedLessons || [];

  // Find course to continue: نفضّل آخر كورس فتحه المستخدم (يترجم بعد الريفريش)
  const continueCourse = useMemo(() => {
    if (!user) return null;
    const purchased = profile?.purchasedCourses || ['scratch'];

    const buildItem = (c: typeof courses[0]) => {
      const total = c.chapters.reduce((s, ch) => s + ch.lessons.length, 0);
      const done = c.chapters.reduce((s, ch) => s + ch.lessons.filter(l => completedLessonIds.includes(l.id)).length, 0);
      const localized = localizeCourses([c], lang)[0];
      return {
        course: c,
        progress: total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0,
        icon: localized.icon,
        purchased: purchased.includes(c.id) || c.free,
      };
    };

    // 1) آخر كورس فتحه المستخدم (محفوظ في profile)
    const lastCourseId = profile?.lastCourse;
    if (lastCourseId) {
      if (lastCourseId === 'backend-engineering') {
        const beCompleted = (profile?.completedLessons || []).filter(id => id.startsWith('be-l')).length;
        return {
          course: { id: 'backend-engineering', title: 'Production Backend Engineering Track', bgGradient: 'from-slate-700 to-slate-900', free: true },
          progress: Math.min(100, Math.round((beCompleted / 48) * 100)),
          icon: '⚙️',
          purchased: true,
        };
      }
      const last = courses.find(c => c.id === lastCourseId);
      if (last && (purchased.includes(last.id) || last.free)) {
        return buildItem(last);
      }
    }

    // 2) وإلا، الكورس صاحب أكبر تقدم
    let best = null as { course: typeof courses[0]; progress: number; icon: string; purchased: boolean } | null;
    for (const c of courses) {
      const item = buildItem(c);
      if (item.progress > 0 && (best === null || item.progress > best.progress)) {
        best = item;
      }
    }

    // 3) Fallback: أول كورس متاح
    if (!best) {
      for (const c of courses) {
        if (purchased.includes(c.id) || c.free) {
          best = buildItem(c);
          break;
        }
      }
    }
    return best;
  }, [user, completedLessonIds, lang, profile?.lastCourse, profile?.purchasedCourses]);
  const levels = lang === 'en'
    ? [t('common.all'), 'Beginner', 'Intermediate', 'Advanced']
    : [t('common.all'), 'مبتدئ', 'متوسط', 'متقدم'];
  const languages = [t('common.all'), 'Scratch', 'Python', 'HTML/CSS', 'JavaScript', 'Python + AI'];

  const filtered = localizedCourses.filter(c => {
    const matchSearch = c.title.includes(searchQuery) || c.description.includes(searchQuery);
    const matchLevel = selectedLevel === t('common.all') || c.level === selectedLevel;
    const matchLang = selectedLang === t('common.all') || c.language === selectedLang;
    return matchSearch && matchLevel && matchLang;
  });

  const handleCourseClick = (courseId: string) => {
    if (courseId === 'backend-engineering') {
      setSelectedCourse(courseId);
      setCurrentPage('backend-course');
      return;
    }
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    if (course.free) {
      setSelectedCourse(courseId);
      setCurrentPage('lesson');
    } else if (user && profile?.purchasedCourses?.includes(courseId)) {
      setSelectedCourse(courseId);
      setCurrentPage('lesson');
    } else if (user) {
      setSelectedCourse(courseId);
      setCurrentPage('lesson');
    } else {
      setCurrentPage('auth');
    }
  };

  const handleBuyConfirm = async () => {
    if (!confirmCourse || !user) return;
    const course = courses.find(c => c.id === confirmCourse);
    const isBackend = confirmCourse === 'backend-engineering';
    if (!course && !isBackend) return;
    const defaultPrice = isBackend ? (dynamicCourses.find(d => d.id === 'backend-engineering')?.price ?? 0) : course!.price;
    const basePrice = getEffectivePrice(confirmCourse, defaultPrice);
    const finalPrice = discountValid ? basePrice - Math.round(basePrice * discountPct / 100) : basePrice;
    if (profile && profile.wallet.balance >= finalPrice) {
      setBuying(true);
      const success = await purchaseCourse(confirmCourse, finalPrice);
      setBuying(false);
      setDiscountCode('');
      setDiscountValid(false);
      setDiscountPct(0);
      setConfirmCourse(null);
      if (success) {
        setSelectedCourse(confirmCourse);
        setCurrentPage(isBackend ? 'backend-course' : 'lesson');
      }
    } else {
      setConfirmCourse(null);
      setCurrentPage('wallet');
    }
  };

  const getEffectivePrice = (courseId: string, defaultPrice: number) => priceOverrides[courseId] ?? defaultPrice;

  const isCourseAccessible = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return false;
    if (course.free) return true;
    if (user && profile?.purchasedCourses?.includes(courseId)) return true;
    return false;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-4">
            <BookOpen size={14} />
            {courses.length} {t('courses.badge')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('courses.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('courses.desc')}
          </p>
        </div>

        {/* Continue Learning */}
        {continueCourse && (
          <div className={`bg-gradient-to-br ${continueCourse.course.bgGradient} rounded-2xl p-5 sm:p-6 border border-white/10 mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24" />
            <div className="relative flex items-center gap-4 sm:gap-6">
              <div className="text-5xl sm:text-6xl flex-shrink-0">{continueCourse.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/60 font-semibold mb-1 uppercase tracking-wider">
                  {continueCourse.progress > 0
                    ? (lang === 'ar' ? 'اكمل تعلمك' : 'Continue Learning')
                    : (lang === 'ar' ? 'ابدأ التعلم' : 'Start Learning')}
                </div>
                <h3 className="text-white font-black text-xl sm:text-2xl mb-1 truncate">{continueCourse.course.title}</h3>
                {continueCourse.progress > 0 ? (
                  <>
                    <p className="text-white/80 text-sm mb-3">{continueCourse.progress}% {lang === 'ar' ? 'مكتمل' : 'complete'}</p>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden max-w-xs">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${continueCourse.progress}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-white/80 text-sm">{lang === 'ar' ? 'ابدأ رحلتك الآن' : 'Start your journey now'}</p>
                )}
              </div>
              <button
                onClick={() => { setSelectedCourse(continueCourse.course.id); setCurrentPage(continueCourse.course.id === 'backend-engineering' ? 'backend-course' : 'lesson'); }}
                className="flex-shrink-0 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm border border-white/20"
              >
                {continueCourse.progress > 0 ? (lang === 'ar' ? 'استمر' : 'Continue') : (lang === 'ar' ? 'ابدأ' : 'Start')} →
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('courses.searchPlaceholder')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedLevel === level
                      ? 'bg-indigo-600 text-white'
                      : 'glass text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Language Filter */}
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="flex items-center gap-1 text-slate-400 text-sm ml-2">
              <Filter size={14} />
              {t('courses.filterLang')}:
            </span>
            {languages.map(langItem => (
              <button
                key={langItem}
                onClick={() => setSelectedLang(langItem)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLang === langItem
                    ? 'bg-purple-600 text-white'
                    : 'glass text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {langItem}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">
            {t('courses.showing')} <span className="text-white font-bold">{filtered.length + 1}</span> {t('courses.course')}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Backend Engineering Track - always visible */}
          {(() => {
            const dc = dynamicCourses.find(c => c.id === 'backend-engineering');
            const beOverride = priceOverrides['backend-engineering'];
            const isFree = beOverride !== undefined ? beOverride === 0 : (dc ? dc.free : true);
            const defaultPrice = dc ? dc.price : 0;
            const price = getEffectivePrice('backend-engineering', defaultPrice);
            const isPurchased = user && profile?.purchasedCourses?.includes('backend-engineering');
            const beCanAccess = isFree || isPurchased;
            return (
              <div key="backend-engineering"
                className="glass rounded-2xl overflow-hidden card-hover border border-white/10 cursor-pointer group"
                onClick={() => beCanAccess ? handleCourseClick('backend-engineering') : user ? setConfirmCourse('backend-engineering') : setCurrentPage('auth')}
              >
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-5xl mb-3">⚙️</div>
                      <span className="badge text-xs bg-purple-500/40 text-purple-200 border border-purple-400/30">
                        {lang === 'ar' ? 'مبتدئ إلى محترف' : 'Beginner to Pro'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="glass rounded-xl px-3 py-1.5 border border-white/20">
                        <span className="text-white text-xs font-bold">Python</span>
                      </div>
                      {isFree ? (
                        <span className="px-2 py-0.5 bg-green-500/30 text-green-200 rounded-lg text-xs font-bold border border-green-400/30">
                          {t('courses.free')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-lg text-xs font-bold border border-yellow-400/30">
                          {price} EGP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                    {lang === 'ar' ? 'مسار تطوير الواجهات الخلفية الإحترافي' : 'Production Backend Engineering Track'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                    {lang === 'ar'
                      ? 'مسار متكامل لتعلم تطوير الواجهات الخلفية من الصفر إلى الاحتراف. بايثون، APIs، قواعد البيانات، FastAPI، DevOps، Docker، تصميم الأنظمة، السحابة، و Kubernetes.'
                      : 'A complete backend engineering track from zero to production. Python, APIs, databases, FastAPI, DevOps, Docker, system design, cloud, and Kubernetes.'}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-white font-bold text-sm">48</div>
                      <div className="text-slate-500 text-xs">{t('courses.lessons')}</div>
                    </div>
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-white font-bold text-sm">8</div>
                      <div className="text-slate-500 text-xs">{t('courses.chapters')}</div>
                    </div>
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-indigo-400 font-bold text-sm">15</div>
                      <div className="text-slate-500 text-xs">{t('courses.skills')}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['Python', 'APIs', 'FastAPI', 'DevOps'].map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs border border-indigo-500/20">{skill}</span>
                    ))}
                  </div>
                  {beCanAccess ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCourseClick('backend-engineering'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                      <Server size={14} />
                      {lang === 'ar' ? 'ابدأ المسار' : 'Start Track'}
                      <ChevronLeft size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); user ? setConfirmCourse('backend-engineering') : setCurrentPage('auth'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-yellow-500/30">
                      <ShoppingCart size={14} />
                      {t('courses.buyNow')} - {price} EGP
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
          {filtered.map((course) => {
            const accessible = isCourseAccessible(course.id);
            return (
              <div
                key={course.id}
                className="glass rounded-2xl overflow-hidden card-hover border border-white/10 cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                {/* Header */}
                <div className={`bg-gradient-to-br ${course.bgGradient} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-5xl mb-3">{course.icon}</div>
                      <span className={`badge text-xs ${
                        course.level === 'مبتدئ' || course.level === 'Beginner' ? 'bg-green-500/40 text-green-200 border border-green-400/30' :
                        course.level === 'متوسط' || course.level === 'Intermediate' ? 'bg-yellow-500/40 text-yellow-200 border border-yellow-400/30' :
                        'bg-red-500/40 text-red-200 border border-red-400/30'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="glass rounded-xl px-3 py-1.5 border border-white/20">
                        <span className="text-white text-xs font-bold">{course.language}</span>
                      </div>
                      {course.free ? (
                        <span className="px-2 py-0.5 bg-green-500/30 text-green-200 rounded-lg text-xs font-bold border border-green-400/30">
                          {t('courses.free')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-lg text-xs font-bold border border-yellow-400/30">
                          {getEffectivePrice(course.id, course.price)} EGP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-white font-bold text-sm">{course.lessons}</div>
                      <div className="text-slate-500 text-xs">{t('courses.lessons')}</div>
                    </div>
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-white font-bold text-sm">{course.chapters.length}</div>
                      <div className="text-slate-500 text-xs">{t('courses.chapters')}</div>
                    </div>
                    <div className="glass rounded-lg p-2 border border-white/5 text-center">
                      <div className="text-indigo-400 font-bold text-sm">{course.skills.length}</div>
                      <div className="text-slate-500 text-xs">{t('courses.skills')}</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {course.ageRange}
                    </span>
                    {!course.free && !accessible && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Lock size={12} />
                        {t('courses.locked')}
                      </span>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites.length > 0 && (
                    <div className="mb-4 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-yellow-400 text-xs">
                        ⚠️ {t('courses.prerequisites')}: {course.prerequisites.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  {course.free || accessible ? (
                    <button onClick={(e) => { e.stopPropagation(); user ? handleCourseClick(course.id) : setCurrentPage('auth'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                      <Play size={14} />
                      {t('courses.startNow')}
                      <ChevronLeft size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); user ? setConfirmCourse(course.id) : setCurrentPage('auth'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-yellow-500/30"
                    >
                      <ShoppingCart size={14} />
                      {t('courses.buyNow')} - {getEffectivePrice(course.id, course.price)} EGP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white font-bold text-xl mb-2">{t('courses.noResults')}</h3>
            <p className="text-slate-400">{t('courses.noResultsHint')}</p>
          </div>
        )}

        {/* Bottom Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Zap size={28} className="text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">{t('courses.updates')}</h3>
            <p className="text-slate-400 text-sm">{t('courses.updatesDesc')}</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Trophy size={28} className="text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">{t('courses.certificate')}</h3>
            <p className="text-slate-400 text-sm">{t('courses.certificateDesc')}</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Star size={28} className="text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">{t('courses.support')}</h3>
            <p className="text-slate-400 text-sm">{t('courses.supportDesc')}</p>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {confirmCourse && (() => {
          const isBackend = confirmCourse === 'backend-engineering';
          const dc = isBackend ? dynamicCourses.find(d => d.id === 'backend-engineering') : null;
          const c = isBackend ? null : courses.find(co => co.id === confirmCourse);
          if (!c && !isBackend) return null;
          const defaultPrice = isBackend ? (dc?.price ?? 0) : c!.price;
          const effectivePrice = getEffectivePrice(confirmCourse, defaultPrice);
          const enoughBalance = profile && profile.wallet.balance >= effectivePrice;
          const title = isBackend ? (lang === 'ar' ? 'مسار تطوير الواجهات الخلفية الإحترافي' : 'Production Backend Engineering Track') : c!.title;
          const desc = isBackend ? (lang === 'ar' ? 'مسار متكامل لتطوير الواجهات الخلفية من الصفر إلى الاحتراف' : 'A complete backend engineering track from zero to production') : c!.description;
          const icon = isBackend ? '⚙️' : c!.icon;
          const bgGradient = isBackend ? 'from-slate-700 to-slate-900' : c!.bgGradient;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass rounded-3xl p-6 sm:p-8 border border-white/10 max-w-sm w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center mx-auto mb-4 text-3xl`}>
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-slate-400 text-sm mb-4">{desc}</p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="glass rounded-xl px-4 py-2 border border-white/10 text-center">
                    <div className={`font-black text-xl ${discountValid ? 'text-green-400' : 'text-yellow-400'}`}>
                      {discountValid ? `${effectivePrice - Math.round(effectivePrice * discountPct / 100)} EGP` : `${effectivePrice} EGP`}
                      {discountValid && <div className="text-green-400/60 text-xs font-normal line-through">{effectivePrice} EGP</div>}
                    </div>
                    <div className="text-slate-500 text-xs">{lang === 'ar' ? 'السعر' : 'Price'}</div>
                  </div>
                  <div className="glass rounded-xl px-4 py-2 border border-white/10 text-center">
                    <div className="text-white font-bold text-xl">{profile?.wallet?.balance || 0}</div>
                    <div className="text-slate-500 text-xs">{lang === 'ar' ? 'رصيدك' : 'Your Balance'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input type="text" value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountValid(false); setDiscountError(''); }}
                    placeholder={lang === 'ar' ? 'كود الخصم' : 'Discount code'}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-green-500 transition-colors" />
                  <button onClick={async () => {
                    setDiscountError('');
                    const result = await validateCode(discountCode);
                    setDiscountValid(result.valid);
                    setDiscountPct(result.percentage);
                    if (!result.valid) setDiscountError(lang === 'ar' ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid or expired discount code');
                  }} disabled={!discountCode}
                    className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all disabled:opacity-50">
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                  {discountValid && (
                    <span className="text-green-400 text-xs font-bold">-{discountPct}%</span>
                  )}
                </div>
                {discountError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                    {discountError}
                  </div>
                )}
                {!enoughBalance && !discountValid && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                    {lang === 'ar' ? 'رصيدك غير كافٍ. اشحن محفظتك أولاً.' : 'Insufficient balance. Top up your wallet first.'}
                  </div>
                )}
                {discountValid && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm mb-4">
                    {lang === 'ar' ? `تم تطبيق الخصم! سعر الكورس بعد الخصم: ${effectivePrice - Math.round(effectivePrice * discountPct / 100)} EGP` : `Discount applied! Course price after discount: ${effectivePrice - Math.round(effectivePrice * discountPct / 100)} EGP`}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setConfirmCourse(null)}
                    className="flex-1 py-3 glass border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                    {t('common.cancel')}
                  </button>
                  {(enoughBalance || (discountValid && profile && profile.wallet.balance >= effectivePrice - Math.round(effectivePrice * discountPct / 100))) ? (
                    <button onClick={handleBuyConfirm} disabled={buying}
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {buying ? <><Loader2 size={16} className="animate-spin" /> {lang === 'ar' ? 'جاري...' : 'Buying...'}</> : (lang === 'ar' ? 'تأكيد الشراء' : 'Confirm Purchase')}
                    </button>
                  ) : (
                    <button onClick={() => { setConfirmCourse(null); setCurrentPage('wallet'); }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                      {lang === 'ar' ? 'اشحن المحفظة' : 'Top Up'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
