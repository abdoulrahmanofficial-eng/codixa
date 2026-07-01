import { roadmaps, courses } from '../data/courses';
import { ArrowLeft, Clock, Users, BookOpen, Zap, Target } from 'lucide-react';

interface RoadmapPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedCourse: (id: string) => void;
}

export default function RoadmapPage({ setCurrentPage, setSelectedCourse }: RoadmapPageProps) {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 text-green-300 text-sm font-semibold mb-4">
            <Target size={14} />
            خطط مسارك التعليمي
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            مسارات التعلم
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            اختار المسار المناسب لعمرك وأهدافك وابدأ رحلتك المرتبة خطوة بخطوة
          </p>
        </div>

        {/* Roadmaps */}
        <div className="space-y-10">
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id} className="glass rounded-3xl border border-white/10 overflow-hidden">
              {/* Roadmap Header */}
              <div className={`bg-gradient-to-r ${roadmap.color} p-6 sm:p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-20 -translate-x-20" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/30">
                      {roadmap.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{roadmap.title}</h2>
                      <p className="text-white/80 font-medium">{roadmap.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-white/90 text-sm">
                    <div className="glass rounded-xl px-4 py-2 border border-white/20 text-center">
                      <div className="font-bold">{roadmap.duration}</div>
                      <div className="text-white/70 text-xs">المدة</div>
                    </div>
                    <div className="glass rounded-xl px-4 py-2 border border-white/20 text-center">
                      <div className="font-bold">{roadmap.ageRange}</div>
                      <div className="text-white/70 text-xs">الفئة العمرية</div>
                    </div>
                    <div className="glass rounded-xl px-4 py-2 border border-white/20 text-center">
                      <div className="font-bold">{roadmap.steps.length}</div>
                      <div className="text-white/70 text-xs">مراحل</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="p-6 sm:p-8">
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute right-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden sm:block" />

                  <div className="space-y-6">
                    {roadmap.steps.map((step) => {
                      const course = courses.find(c => c.id === step.courseId);
                      return (
                        <div key={step.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                          {/* Step Number */}
                          <div className="flex-shrink-0 flex sm:flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-2xl shadow-lg`}>
                              {step.icon}
                            </div>
                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${roadmap.color} text-white text-xs font-bold`}>
                              المرحلة {step.id}
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 glass rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all group">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-white font-bold text-xl mb-1">{step.title}</h3>
                                <p className="text-slate-400 text-sm">{step.desc}</p>
                              </div>
                              <span className="px-3 py-1.5 glass border border-white/10 text-slate-400 text-xs rounded-xl whitespace-nowrap flex items-center gap-1">
                                <Clock size={12} />
                                {step.duration}
                              </span>
                            </div>

                            {/* Course Info */}
                            {course && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {course.skills.slice(0, 5).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-xs border border-white/10">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                              {course && (
                                <button
                                  onClick={() => { setSelectedCourse(step.courseId); setCurrentPage('lesson'); }}
                                  className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r ${roadmap.color} text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg`}
                                >
                                  <Zap size={14} />
                                  ابدأ هذه المرحلة
                                </button>
                              )}
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                {course && (
                                  <>
                                    <span className="flex items-center gap-1">
                                      <BookOpen size={12} />
                                      {course.lessons} درس
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users size={12} />
                                      {course?.ageRange}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completion Badge */}
                <div className={`mt-8 p-5 rounded-2xl bg-gradient-to-r ${roadmap.color} bg-opacity-10 border border-white/10 flex flex-col sm:flex-row items-center gap-4`}>
                  <div className="text-4xl">🏆</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">بعد إتمام المسار</h4>
                    <p className="text-slate-300 text-sm">
                      ستحصل على شهادة <span className="text-white font-bold">{roadmap.title}</span> وستكون مؤهلاً للبدء في مشاريع حقيقية!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Path Section */}
        <div className="mt-10 glass rounded-3xl p-8 border border-indigo-500/20 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">مش عارف تختار؟</h2>
          <p className="text-slate-400 text-lg mb-6 max-w-xl mx-auto">
            ابدأ من حيث تريد! كل كورس مستقل وكامل بذاته. المهم تبدأ!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { emoji: '👶', text: 'عمرك أقل من 12؟', action: 'ابدأ بـ Scratch', courseId: 'scratch' },
              { emoji: '🌐', text: 'عايز تعمل موقع؟', action: 'ابدأ بـ HTML/CSS', courseId: 'html-css' },
              { emoji: '🐍', text: 'عايز تتعلم برمجة؟', action: 'ابدأ بـ Python', courseId: 'python' },
              { emoji: '🤖', text: 'مهتم بـ AI؟', action: 'مسار الذكاء الاصطناعي', courseId: 'ai-basics' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => { setSelectedCourse(item.courseId); setCurrentPage('lesson'); }}
                className="glass rounded-2xl p-4 border border-white/10 hover:border-indigo-500/30 transition-all hover:scale-105 text-center"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-slate-300 text-sm mb-1">{item.text}</div>
                <div className="text-indigo-400 text-xs font-bold">{item.action}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage('courses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105"
          >
            اعرض كل الكورسات
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
