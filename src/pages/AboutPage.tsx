import { useI18n } from '../i18n/I18nContext';
import { Code2, GraduationCap, Target, Users, Globe, Shield, Sparkles, BookOpen, Award, Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function AboutPage({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { t, lang } = useI18n();

  const stats = [
    { icon: <BookOpen size={22} />, value: '6+', label: lang === 'ar' ? 'كورسات متكاملة' : 'Complete Courses', color: 'from-blue-500 to-cyan-500' },
    { icon: <GraduationCap size={22} />, value: '100+', label: lang === 'ar' ? 'درس تفاعلي' : 'Interactive Lessons', color: 'from-purple-500 to-pink-500' },
    { icon: <Target size={22} />, value: 'Scratch→AI', label: lang === 'ar' ? 'من الصفر للاحتراف' : 'Beginner to Advanced', color: 'from-yellow-500 to-orange-500' },
    { icon: <Globe size={22} />, value: 'عربي/EN', label: lang === 'ar' ? 'واجهة ثنائية اللغة' : 'Bilingual Platform', color: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    {
      icon: <Sparkles size={28} />,
      title: lang === 'ar' ? 'تجربة تعلم تفاعلية' : 'Interactive Learning',
      desc: lang === 'ar' ? 'دروس مشروحة بطريقة مبسطة مع تطبيق عملي واختبارات تفاعلية' : 'Simplified lessons with practical application and interactive quizzes',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      border: 'border-indigo-500/30',
    },
    {
      icon: <Shield size={28} />,
      title: lang === 'ar' ? 'محفظة إلكترونية' : 'E-Wallet',
      desc: lang === 'ar' ? 'نظام محفظة آمن لشراء الكورسات وشحن الرصيد بسهولة' : 'Secure wallet system for purchasing courses and easy top-ups',
      gradient: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
    },
    {
      icon: <Target size={28} />,
      title: lang === 'ar' ? 'مسارات تعليمية' : 'Learning Paths',
      desc: lang === 'ar' ? 'مسارات منظمة حسب العمر والمستوى تناسب الجميع' : 'Organized paths by age and level suitable for everyone',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
    },
    {
      icon: <Award size={28} />,
      title: lang === 'ar' ? 'شهادات إتمام' : 'Certificates',
      desc: lang === 'ar' ? 'احصل على شهادة عند إتمام كل كورس باسمك' : 'Get a personalized certificate upon completing each course',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
    },
    {
      icon: <Code2 size={28} />,
      title: lang === 'ar' ? 'محاكي أكواد' : 'Code Playground',
      desc: lang === 'ar' ? 'جرب الكود مباشرة في المتصفح وشوف النتيجة فوراً' : 'Try code directly in the browser and see results instantly',
      gradient: 'from-pink-500/20 to-rose-500/20',
      border: 'border-pink-500/30',
    },
    {
      icon: <Users size={28} />,
      title: lang === 'ar' ? 'مجتمع متعلمين' : 'Learning Community',
      desc: lang === 'ar' ? 'تنافس مع الآخرين في لوحة المتصدرين وشارك إنجازاتك' : 'Compete with others on the leaderboard and share achievements',
      gradient: 'from-orange-500/20 to-red-500/20',
      border: 'border-orange-500/30',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setCurrentPage('courses')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </motion.button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
            <Code2 size={14} />
            {lang === 'ar' ? 'حول المنصة' : 'About the Platform'}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            {lang === 'ar' ? 'Codixa' : 'Codixa'}
            <span className="gradient-text"> {lang === 'ar' ? 'منصة تعليم البرمجة' : 'Learning Platform'}</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'منصة عربية متكاملة لتعليم البرمجة للأطفال والشباب. نوفر كورسات تفاعلية ومسارات تعليمية منظمة بأحدث الأساليب التعليمية.'
              : 'A complete Arabic platform for teaching programming to children and youth. We provide interactive courses and structured learning paths using the latest educational methods.'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 border border-white/10 text-center relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative">
                <div className="text-white mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-xs font-semibold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-8 sm:p-10 border border-white/10 mb-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full -translate-y-48" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              {lang === 'ar' ? 'رسالتنا' : 'Our Mission'}
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
              {lang === 'ar'
                ? 'نؤمن أن البرمجة ليست مجرد مهارة تقنية، بل لغة العصر الجديد. هدفنا هو تمكين الجيل العربي من فهم التكنولوجيا وصناعتها، وليس فقط استهلاكها، من خلال محتوى تعليمي ممتع وتفاعلي باللغة العربية.'
                : 'We believe programming is not just a technical skill, but the language of the new era. Our goal is to empower the Arab generation to understand and create technology, not just consume it, through fun and interactive educational content in Arabic.'}
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">
          {lang === 'ar' ? 'مميزات المنصة' : 'Platform Features'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`glass rounded-2xl p-6 border ${feat.border} hover:scale-[1.02] transition-all cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 ${feat.border.replace('border', 'text')}`}>
                {feat.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-3xl p-8 border border-white/10 mb-12"
        >
          <h2 className="text-2xl font-black text-white text-center mb-8">
            {lang === 'ar' ? 'التقنيات المستخدمة' : 'Built With'}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'React 19', color: 'from-blue-500 to-cyan-500' },
              { name: 'TypeScript', color: 'from-blue-600 to-blue-400' },
              { name: 'Tailwind v4', color: 'from-cyan-500 to-teal-500' },
              { name: 'Firebase', color: 'from-yellow-500 to-orange-500' },
              { name: 'Framer Motion', color: 'from-pink-500 to-rose-500' },
              { name: 'Vite', color: 'from-purple-500 to-violet-500' },
              { name: 'Vercel', color: 'from-black to-slate-700' },
            ].map((tech, i) => (
              <span
                key={i}
                className={`px-4 py-2 rounded-xl bg-gradient-to-r ${tech.color} text-white font-bold text-sm border border-white/10 shadow-lg`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Developer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-8 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
              <Code2 size={28} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">{lang === 'ar' ? 'المطور' : 'Developer'}</h3>
            <p className="text-indigo-400 font-bold text-xl mt-1">Abdulrahman Mohamed</p>
            <p className="text-slate-500 text-sm mt-2">
              {lang === 'ar' ? 'مهندس برمجيات ومطور ويب' : 'Software Engineer & Web Developer'}
            </p>
            <div className="border-t border-white/10 mt-6 pt-6">
              <p className="text-slate-500 text-xs">
                {lang === 'ar'
                  ? 'جميع الحقوق محفوظة © 2026 Codixa'
                  : 'All rights reserved © 2026 Codixa'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
