import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, User, Wallet, Menu, Bell } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import type { AppNotification } from '../contexts/AuthContext';
import { formatEGP } from '../utils/format';
import { fmt } from '../lib/format';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onMenuClick: () => void;
}

export default function Header({ currentPage, setCurrentPage, onMenuClick }: HeaderProps) {
  const { t, lang } = useI18n();
  const { user, profile, getNotifications } = useAuth();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter(n => !profile?.readNotifications?.[n.id]).length;

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const load = async () => {
      const n = await getNotifications();
      setNotifications(n);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user, getNotifications]);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 right-0 left-0 z-40 h-16 glass border-b border-white/10 rounded-b-2xl"
      dir={dir}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => setCurrentPage(user ? 'courses' : 'home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-black gradient-text hidden sm:block">{t('nav.brand')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <button
                onClick={() => setCurrentPage('wallet')}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-yellow-400 hover:bg-white/10 transition-all"
              >
                <Wallet size={15} />
                <span>{formatEGP(profile?.wallet?.balance || 0)}</span>
              </button>

              <button onClick={() => setCurrentPage('notifications')}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                ) : (
                  <User size={15} />
                )}
                <span className="hidden sm:inline max-w-[80px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('auth')}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
            >
              <User size={15} />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}