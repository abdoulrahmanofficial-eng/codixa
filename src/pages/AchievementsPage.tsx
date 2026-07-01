import { Trophy, Star, Zap, BookOpen, Target, Award, Lock, CheckCircle } from 'lucide-react';

export default function AchievementsPage() {
  const badges = [
    { id: 1, icon: '🚀', title: 'البداية الرائعة', desc: 'أكملت أول درس', earned: true, color: 'from-blue-500 to-cyan-500', xp: 50 },
    { id: 2, icon: '🔥', title: 'متحمس للتعلم', desc: '3 أيام متتالية على المنصة', earned: true, color: 'from-orange-500 to-red-500', xp: 100 },
    { id: 3, icon: '🐍', title: 'صديق Python', desc: 'أكملت الوحدة الأولى من Python', earned: true, color: 'from-green-500 to-emerald-500', xp: 200 },
    { id: 4, icon: '🌐', title: 'بناء المواقع', desc: 'أنشأت أول صفحة HTML', earned: false, color: 'from-orange-500 to-yellow-500', xp: 150 },
    { id: 5, icon: '⚡', title: 'مطور JavaScript', desc: 'أكملت مقدمة JavaScript', earned: false, color: 'from-yellow-400 to-orange-500', xp: 300 },
    { id: 6, icon: '🎮', title: 'صانع الألعاب', desc: 'أنهيت كورس Scratch', earned: false, color: 'from-pink-500 to-purple-500', xp: 250 },
    { id: 7, icon: '🤖', title: 'خبير AI', desc: 'أكملت كورس الذكاء الاصطناعي', earned: false, color: 'from-purple-500 to-indigo-500', xp: 500 },
    { id: 8, icon: '💎', title: 'المحترف', desc: 'أكملت 3 كورسات كاملة', earned: false, color: 'from-indigo-500 to-purple-500', xp: 1000 },
    { id: 9, icon: '🌟', title: 'نجم البرمجة', desc: '30 يوم متتالي على المنصة', earned: false, color: 'from-yellow-500 to-amber-500', xp: 800 },
  ];

  const currentXP = 350;
  const targetXP = 500;
  const level = 4;

  const leaderboard = [
    { rank: 1, name: 'أحمد محمد', xp: 2450, avatar: '👦', badge: '🥇' },
    { rank: 2, name: 'سارة علي', xp: 2100, avatar: '👧', badge: '🥈' },
    { rank: 3, name: 'يوسف أحمد', xp: 1800, avatar: '👦', badge: '🥉' },
    { rank: 4, name: 'مريم حسن', xp: 1500, avatar: '👩', badge: '⭐' },
    { rank: 5, name: 'أنت 🎯', xp: currentXP, avatar: '😊', badge: '🎯', isMe: true },
    { rank: 6, name: 'علي عمر', xp: 280, avatar: '👦', badge: '' },
    { rank: 7, name: 'نور محمد', xp: 200, avatar: '👧', badge: '' },
  ];

  const dailyChallenges = [
    { id: 1, title: 'أكتب حلقة for في Python', desc: 'اكتب كود يطبع الأرقام من 1 لـ 10', xp: 20, done: true, icon: '🐍' },
    { id: 2, title: 'أنشئ صفحة HTML', desc: 'أنشئ صفحة بعنوان وفقرة وصورة', xp: 25, done: false, icon: '🌐' },
    { id: 3, title: 'شاهد 3 دروس اليوم', desc: 'تابع ثلاثة دروس كاملة', xp: 30, done: false, icon: '📚' },
  ];

  const progressData = [
    { course: 'Scratch', progress: 80, color: 'from-yellow-500 to-orange-500', icon: '🎮' },
    { course: 'Python', progress: 45, color: 'from-blue-500 to-cyan-500', icon: '🐍' },
    { course: 'HTML/CSS', progress: 20, color: 'from-orange-500 to-red-500', icon: '🌐' },
    { course: 'JavaScript', progress: 0, color: 'from-yellow-400 to-orange-500', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 text-yellow-300 text-sm font-semibold mb-4">
            <Trophy size={14} />
            صفحة الإنجازات والتقدم
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            إنجازاتك 🏆
          </h1>
          <p className="text-slate-400 text-lg">تابع تقدمك واجمع الشارات والنقاط</p>
        </div>

        {/* Level & XP Card */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl animate-pulse-glow">
                😊
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                Lv.{level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-right">
              <h2 className="text-white font-black text-2xl mb-1">اسمك هنا 👋</h2>
              <p className="text-slate-400 text-sm mb-4">مبتدئ متحمس في رحلة البرمجة</p>

              {/* XP Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">المستوى {level}</span>
                  <span className="text-indigo-400 font-bold">{currentXP} / {targetXP} XP</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${(currentXP / targetXP) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-1">{targetXP - currentXP} XP للمستوى {level + 1}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'دروس مكتملة', value: '12', icon: <BookOpen size={16} />, color: 'text-blue-400' },
                { label: 'أيام متتالية', value: '5', icon: <Zap size={16} />, color: 'text-yellow-400' },
                { label: 'شارات مكتسبة', value: '3', icon: <Trophy size={16} />, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl p-3 border border-white/10 text-center">
                  <div className={`${stat.color} mb-1 flex justify-center`}>{stat.icon}</div>
                  <div className="text-white font-black text-xl">{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badges */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                <Award className="text-yellow-400" size={22} />
                الشارات والإنجازات
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`glass rounded-2xl p-4 border text-center transition-all ${
                      badge.earned
                        ? 'border-yellow-500/30 bg-yellow-500/5 hover:scale-105'
                        : 'border-white/5 opacity-50'
                    }`}
                  >
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.earned ? badge.color : 'from-slate-700 to-slate-600'} flex items-center justify-center text-2xl mx-auto mb-3 ${badge.earned ? 'shadow-lg' : ''}`}>
                      {badge.earned ? badge.icon : <Lock size={20} className="text-slate-500" />}
                      {badge.earned && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`font-bold text-sm mb-1 ${badge.earned ? 'text-white' : 'text-slate-500'}`}>
                      {badge.title}
                    </div>
                    <div className="text-slate-500 text-xs mb-2">{badge.desc}</div>
                    <div className={`text-xs font-bold ${badge.earned ? 'text-yellow-400' : 'text-slate-600'}`}>
                      +{badge.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Progress */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                <Target className="text-indigo-400" size={22} />
                تقدمك في الكورسات
              </h2>
              <div className="space-y-5">
                {progressData.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white font-semibold text-sm">{item.course}</span>
                      </div>
                      <span className="text-slate-400 text-sm font-bold">{item.progress}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-black text-xl mb-2 flex items-center gap-2">
                <Zap className="text-yellow-400" size={22} />
                تحديات اليوم
              </h2>
              <p className="text-slate-400 text-sm mb-6">أكمل التحديات اليومية لتجمع نقاط إضافية</p>
              <div className="space-y-3">
                {dailyChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      challenge.done
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'glass border-white/10 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      challenge.done ? 'bg-green-500/20' : 'bg-white/5'
                    }`}>
                      {challenge.done ? '✅' : challenge.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${challenge.done ? 'text-green-400 line-through' : 'text-white'}`}>
                        {challenge.title}
                      </div>
                      <div className="text-slate-500 text-xs">{challenge.desc}</div>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded-lg ${
                      challenge.done ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'
                    }`}>
                      +{challenge.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div>
            <div className="glass rounded-2xl p-6 border border-white/10 sticky top-24">
              <h2 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                <Star className="text-yellow-400" size={22} />
                المتصدرون
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      player.isMe
                        ? 'bg-indigo-500/10 border-indigo-500/40'
                        : 'glass border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      player.rank === 1 ? 'bg-yellow-500 text-white' :
                      player.rank === 2 ? 'bg-slate-400 text-white' :
                      player.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-white/10 text-slate-400'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg">
                      {player.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${player.isMe ? 'text-indigo-400' : 'text-white'}`}>
                        {player.name}
                      </div>
                      <div className="text-slate-500 text-xs">{player.xp} XP</div>
                    </div>
                    <div className="text-xl">{player.badge}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                <div className="text-indigo-400 font-bold text-sm mb-1">تحتاج {leaderboard[3].xp - currentXP} XP</div>
                <div className="text-slate-400 text-xs">للوصول للمركز الرابع</div>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(currentXP / leaderboard[3].xp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
