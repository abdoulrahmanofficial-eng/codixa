import { useState } from 'react';
import { courses } from '../data/courses';
import { Search, Filter, BookOpen, Clock, Users, ChevronLeft, Play, Star, Trophy, Zap } from 'lucide-react';

interface CoursesPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedCourse: (id: string) => void;
}

export default function CoursesPage({ setCurrentPage, setSelectedCourse }: CoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('الكل');
  const [selectedLang, setSelectedLang] = useState('الكل');

  const levels = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'];
  const languages = ['الكل', 'Scratch', 'Python', 'HTML/CSS', 'JavaScript', 'Python + AI'];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.includes(searchQuery) || c.description.includes(searchQuery);
    const matchLevel = selectedLevel === 'الكل' || c.level === selectedLevel;
    const matchLang = selectedLang === 'الكل' || c.language === selectedLang;
    return matchSearch && matchLevel && matchLang;
  });

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-4">
            <BookOpen size={14} />
            {courses.length} كورس متاح
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            كل الكورسات
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            اختار الكورس المناسب لمستواك وابدأ رحلة تعلم البرمجة من النهارده
          </p>
        </div>

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
                placeholder="ابحث عن كورس..."
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
              اللغة:
            </span>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLang === lang
                    ? 'bg-purple-600 text-white'
                    : 'glass text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">
            يتم عرض <span className="text-white font-bold">{filtered.length}</span> كورس
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="glass rounded-2xl overflow-hidden card-hover border border-white/10 cursor-pointer group"
              onClick={() => { setSelectedCourse(course.id); setCurrentPage('lesson'); }}
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${course.bgGradient} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-5xl mb-3">{course.icon}</div>
                    <span className={`badge text-xs ${
                      course.level === 'مبتدئ' ? 'bg-green-500/40 text-green-200 border border-green-400/30' :
                      course.level === 'متوسط' ? 'bg-yellow-500/40 text-yellow-200 border border-yellow-400/30' :
                      'bg-red-500/40 text-red-200 border border-red-400/30'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <div className="glass rounded-xl px-3 py-1.5 border border-white/20">
                    <span className="text-white text-xs font-bold">{course.language}</span>
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
                    <div className="text-slate-500 text-xs">درس</div>
                  </div>
                  <div className="glass rounded-lg p-2 border border-white/5 text-center">
                    <div className="text-white font-bold text-sm">{course.chapters.length}</div>
                    <div className="text-slate-500 text-xs">فصل</div>
                  </div>
                  <div className="glass rounded-lg p-2 border border-white/5 text-center">
                    <div className="text-yellow-400 font-bold text-sm">4.9</div>
                    <div className="text-slate-500 text-xs">تقييم</div>
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
                </div>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <div className="mb-4 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ يحتاج إتمام: {course.prerequisites.join(', ')}
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
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                  <Play size={14} />
                  ابدأ التعلم الآن
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white font-bold text-xl mb-2">مش لاقي نتائج</h3>
            <p className="text-slate-400">جرب تغير كلمات البحث أو الفلتر</p>
          </div>
        )}

        {/* Bottom Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Zap size={28} className="text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">تحديثات مستمرة</h3>
            <p className="text-slate-400 text-sm">بنضيف محتوى جديد كل أسبوع</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Trophy size={28} className="text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">شهادة إتمام</h3>
            <p className="text-slate-400 text-sm">احصل على شهادة لكل كورس تنهيه</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/10 text-center">
            <Star size={28} className="text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">دعم مستمر</h3>
            <p className="text-slate-400 text-sm">مجتمع من المتعلمين والمدربين</p>
          </div>
        </div>
      </div>
    </div>
  );
}
