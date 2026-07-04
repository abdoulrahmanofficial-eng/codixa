import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data/courses';
import { Trophy, Star, Zap, BookOpen, Target, Award, Lock, CheckCircle, Loader2, Medal } from 'lucide-react';

interface AchievementsPageProps {
  setCurrentPage?: (page: string) => void;
  setSelectedCourse?: (id: string) => void;
}

export default function AchievementsPage({ setCurrentPage, setSelectedCourse }: AchievementsPageProps = {}) {
  const { t, lang } = useI18n();
  const { user, profile, getAllUsers } = useAuth();
  const [allUsers, setAllUsers] = useState<Awaited<ReturnType<typeof getAllUsers>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(users => { setAllUsers(users); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const completedLessonIds = profile?.completedLessons || [];
  const currentXP = profile?.xp || 0;
  const targetXP = Math.max(500, Math.pow(2, (profile?.level || 1) - 1) * 500);
  const level = profile?.level || 1;
  const completedCount = completedLessonIds.length;

  // Course progress from real data
  const progressData = useMemo(() => courses.map(c => {
    const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
    const done = c.chapters.reduce((sum, ch) =>
      sum + ch.lessons.filter(l => completedLessonIds.includes(l.id)).length, 0);
    return {
      course: c.id,
      label: c.title,
      progress: totalLessons > 0 ? Math.min(100, Math.round((done / totalLessons) * 100)) : 0,
      color: c.bgGradient,
      icon: c.icon,
      lessons: totalLessons,
      done,
    };
  }), [completedLessonIds]);

  // Dynamic badges
  const allBadges = useMemo(() => {
    const scratchDone = progressData.find(p => p.course === 'scratch')?.done || 0;
    const scratchTotal = progressData.find(p => p.course === 'scratch')?.lessons || 1;
    const pythonDone = progressData.find(p => p.course === 'python')?.done || 0;
    const pythonTotal = progressData.find(p => p.course === 'python')?.lessons || 1;
    const htmlDone = progressData.find(p => p.course === 'html-css')?.done || 0;
    const htmlTotal = progressData.find(p => p.course === 'html-css')?.lessons || 1;
    const jsDone = progressData.find(p => p.course === 'javascript')?.done || 0;
    const jsTotal = progressData.find(p => p.course === 'javascript')?.lessons || 1;
    const aiDone = progressData.find(p => p.course === 'ai-basics')?.done || 0;
    const aiTotal = progressData.find(p => p.course === 'ai-basics')?.lessons || 1;
    const reactDone = progressData.find(p => p.course === 'react')?.done || 0;
    const reactTotal = progressData.find(p => p.course === 'react')?.lessons || 1;

    return [
      { id: 1, icon: '🚀', title: t('badge.1.title'), desc: t('badge.1.desc'), earned: completedCount >= 1, color: 'from-blue-500 to-cyan-500', xp: 50 },
      { id: 2, icon: '🔥', title: t('badge.2.title'), desc: t('badge.2.desc'), earned: completedCount >= 10, color: 'from-orange-500 to-red-500', xp: 100 },
      { id: 3, icon: '🐍', title: t('badge.3.title'), desc: t('badge.3.desc'), earned: pythonDone >= pythonTotal, color: 'from-green-500 to-emerald-500', xp: 200 },
      { id: 4, icon: '🌐', title: t('badge.4.title'), desc: t('badge.4.desc'), earned: htmlDone >= htmlTotal, color: 'from-orange-500 to-yellow-500', xp: 150 },
      { id: 5, icon: '⚡', title: t('badge.5.title'), desc: t('badge.5.desc'), earned: jsDone >= jsTotal, color: 'from-yellow-400 to-orange-500', xp: 300 },
      { id: 6, icon: '🎮', title: t('badge.6.title'), desc: t('badge.6.desc'), earned: scratchDone >= scratchTotal, color: 'from-pink-500 to-purple-500', xp: 250 },
      { id: 7, icon: '🤖', title: t('badge.7.title'), desc: t('badge.7.desc'), earned: aiDone >= aiTotal, color: 'from-purple-500 to-indigo-500', xp: 500 },
      { id: 8, icon: '💎', title: t('badge.8.title'), desc: t('badge.8.desc'), earned: reactDone >= reactTotal, color: 'from-indigo-500 to-purple-500', xp: 1000 },
      { id: 9, icon: '🌟', title: t('badge.9.title'), desc: t('badge.9.desc'), earned: currentXP >= 1000, color: 'from-yellow-500 to-amber-500', xp: 800 },
    ];
  }, [completedCount, currentXP, progressData, t]);

  const earnedCount = allBadges.filter(b => b.earned).length;

  // Leaderboard from RTDB — top 3 non-admin users
  const leaderboard = useMemo(() => {
    const sorted = [...allUsers].filter(u => !u.isAdmin).sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return sorted.slice(0, 3).map((u, i) => ({
      rank: i + 1,
      name: u.name || u.email?.split('@')[0] || 'User',
      xp: u.xp || 0,
      avatar: u.avatar,
      badge: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
      isMe: u.uid === user?.uid,
      level: u.level || 1,
    }));
  }, [allUsers, user]);

  const myRank = leaderboard.find(l => l.isMe);
  const firstPlaceXP = leaderboard[0]?.xp || 0;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 text-yellow-300 text-sm font-semibold mb-4">
            <Trophy size={14} />
            {t('achievements.badge')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('achievements.title')} 🏆
          </h1>
          <p className="text-slate-400 text-lg">{t('achievements.desc')}</p>
        </div>

        {/* Level & XP Card */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl animate-pulse-glow overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.[0] || '👤'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                Lv.{level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-right">
              <h2 className="text-white font-black text-2xl mb-1">
                {user?.displayName || (lang === 'ar' ? 'اسمك هنا 👋' : 'Your name here 👋')}
              </h2>
              <p className="text-slate-400 text-sm mb-4">{t('profile.level')}</p>

              {/* XP Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">{t('achievements.level')} {level}</span>
                  <span className="text-indigo-400 font-bold">{currentXP} / {targetXP} {t('achievements.xp')}</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${(currentXP / targetXP) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-1">{targetXP - currentXP} {t('achievements.xp')} {t('achievements.xpToNext')} {level + 1}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('achievements.completedLessons'), value: completedCount.toString(), icon: <BookOpen size={16} />, color: 'text-blue-400' },
                { label: t('achievements.badgesEarned'), value: earnedCount.toString(), icon: <Trophy size={16} />, color: 'text-purple-400' },
                { label: t('achievements.leaderboard'), value: myRank ? `#${myRank.rank}` : '—', icon: <Star size={16} />, color: 'text-yellow-400' },
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
                {t('achievements.badgesSection')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allBadges.map((badge) => (
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
                      +{badge.xp} {t('achievements.xp')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Progress */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                <Target className="text-indigo-400" size={22} />
                {t('achievements.courseProgress')}
              </h2>
              <div className="space-y-5">
                {progressData.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white font-semibold text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.progress === 100 && (
                          <button
                            onClick={() => { setSelectedCourse?.(item.course); setCurrentPage?.('certificate'); }}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
                          >
                            <Medal size={12} />
                            {t('cert.view')}
                          </button>
                        )}
                        <span className="text-slate-400 text-sm font-bold">{item.progress}%</span>
                      </div>
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
                {t('achievements.dailyChallenges')}
              </h2>
              <p className="text-slate-400 text-sm mb-6">{t('achievements.challengesDesc')}</p>
              <div className="space-y-3">
                {[
                  { id: 1, title: t('challenge.1.title'), desc: t('challenge.1.desc'), xp: 20, done: false, icon: '🐍' },
                  { id: 2, title: t('challenge.2.title'), desc: t('challenge.2.desc'), xp: 25, done: false, icon: '🌐' },
                  { id: 3, title: t('challenge.3.title'), desc: t('challenge.3.desc'), xp: 30, done: false, icon: '📚' },
                ].map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center gap-4 p-4 rounded-xl border glass border-white/10 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-white/5">
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-white">{challenge.title}</div>
                      <div className="text-slate-500 text-xs">{challenge.desc}</div>
                    </div>
                    <div className="text-sm font-bold px-2 py-1 rounded-lg text-yellow-400 bg-yellow-500/10">
                      +{challenge.xp} {t('achievements.xp')}
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
                {t('achievements.leaderboard')}
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10"><p className="text-slate-400 text-sm">{lang === 'ar' ? 'لا يوجد متصدرين بعد' : 'No leaders yet'}</p></div>
                ) : (
                  leaderboard.map((player) => (
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden ${
                        player.isMe ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                      }`}>
                        {player.avatar?.startsWith('data:') ? (
                          <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          player.avatar || (player.name?.[0] || '👤')
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm truncate ${player.isMe ? 'text-indigo-400' : 'text-white'}`}>
                          {player.name} {player.isMe && `(${t('achievements.you')})`}
                        </div>
                        <div className="text-slate-500 text-xs">{player.xp} {t('achievements.xp')} · Lv.{player.level}</div>
                      </div>
                      <div className="text-xl">{player.badge}</div>
                    </div>
                  ))
                )}
              </div>

              {leaderboard.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                  <div className="text-indigo-400 font-bold text-sm mb-1">
                    {t('achievements.needXP')} {Math.max(0, firstPlaceXP - currentXP)} {t('achievements.xp')} {t('achievements.toReach')}
                  </div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${firstPlaceXP > 0 ? Math.min(100, (currentXP / firstPlaceXP) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
