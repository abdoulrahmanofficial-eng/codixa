import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Home, Map, Trophy, Code2, X, LogOut, Wallet, User, Globe, Zap, Shield, Settings, Terminal } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: (dir: string) => ({
    x: dir === 'rtl' ? 300 : -300,
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (dir: string) => ({
    x: dir === 'rtl' ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300 },
  }),
};

export default function Sidebar({ currentPage, setCurrentPage, open, setOpen }: SidebarProps) {
  const { t, lang, setLang } = useI18n();
  const { user, profile, logout, isAdmin } = useAuth();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navItems = isAdmin
    ? [{ id: 'admin', label: 'Admin', icon: <Shield size={20} /> }]
    : [
        ...(!user ? [{ id: 'home', label: t('nav.home'), icon: <Home size={20} /> }] : []),
        { id: 'courses', label: t('nav.courses'), icon: <BookOpen size={20} /> },
        { id: 'roadmap', label: t('nav.roadmap'), icon: <Map size={20} /> },
        { id: 'achievements', label: t('nav.achievements'), icon: <Trophy size={20} /> },
        { id: 'playground', label: t('nav.playground'), icon: <Terminal size={20} /> },
      ];

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            custom={dir}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-2 bottom-2 z-[60] w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col rounded-2xl"
            style={{ [dir === 'rtl' ? 'right' : 'left']: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
                  <Code2 size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-lg font-black gradient-text">{t('nav.brand')}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold block leading-tight">{t('nav.tagline')}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Section */}
            {user && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.[0] || '👤'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-indigo-400 text-xs font-semibold">
                      {profile?.wallet?.balance || 0} EGP
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg text-center border border-yellow-500/30">
                    🔑 Admin
                  </div>
                )}
              </motion.div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    custom={i + 1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => { setCurrentPage(item.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {user && (
                <motion.div
                  custom={navItems.length + 1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-4"
                >
                  <button
                    onClick={() => { setCurrentPage('wallet'); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      currentPage === 'wallet'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Wallet size={20} className="text-yellow-400" />
                    {t('nav.wallet')}
                    <span className="mr-auto text-yellow-400 font-bold">
                      {profile?.wallet?.balance || 0} EGP
                    </span>
                  </button>
                </motion.div>
              )}

              {user && (
                <motion.div
                  custom={navItems.length + 2}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-2"
                >
                  <button
                    onClick={() => { setCurrentPage('profile'); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      currentPage === 'profile'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Settings size={20} className="text-indigo-400" />
                    {t('nav.profile')}
                  </button>
                </motion.div>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-white/10 p-4 space-y-2">
              <motion.button
                custom={10}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Globe size={18} />
                {t('nav.langToggle')}
              </motion.button>

              {user ? (
                <motion.button
                  custom={11}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                  {t('nav.logout')}
                </motion.button>
              ) : (
                <motion.button
                  custom={11}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => { setCurrentPage('auth'); setOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  <User size={18} />
                  {t('nav.login')}
                </motion.button>
              )}

              {!user && (
                <motion.button
                  custom={12}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => { setCurrentPage('courses'); setOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  <Zap size={18} />
                  {t('nav.mobileCta')}
                </motion.button>
              )}

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
