import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AppNotification } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

interface NotificationsPageProps {
  setCurrentPage: (page: string) => void;
}

export default function NotificationsPage({ setCurrentPage }: NotificationsPageProps) {
  const { t, lang } = useI18n();
  const { getNotifications, markNotificationRead, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const n = await getNotifications();
      setNotifications(n);
      setLoading(false);
      // Mark all unread as read
      const unreadIds = n.filter(notif => !profile?.readNotifications?.[notif.id]).map(notif => notif.id);
      await Promise.all(unreadIds.map(id => markNotificationRead(id)));
    };
    load();
  }, [getNotifications, markNotificationRead, profile?.readNotifications]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            {t('common.back')}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
            </div>
          ) : (
            <div>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all`}
                >
                  <div className="text-white font-semibold text-sm">{n.title}</div>
                  <div className="text-slate-400 text-sm mt-1 leading-relaxed">{n.body}</div>
                  <div className="text-slate-500 text-xs mt-2">
                    {new Date(n.createdAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}