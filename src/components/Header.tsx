import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { user, profile, getNotifications, markNotificationRead } = useAuth();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpenNotifs = () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) {
      const unreadIds = notifications.filter(n => !profile?.readNotifications?.[n.id]).map(n => n.id);
      unreadIds.forEach(id => markNotificationRead(id));
    }
  };

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

              <div ref={notifRef} className="relative">
                <button onClick={handleOpenNotifs}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl glass border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/10">
                        <span className="text-white font-bold text-sm">
                          {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">
                            {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-all ${profile?.readNotifications?.[n.id] ? 'opacity-60' : ''}`}>
                              <div className="text-white text-sm font-semibold">{n.title}</div>
                              <div className="text-slate-400 text-xs mt-0.5">{n.body}</div>
                              <div className="text-slate-500 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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