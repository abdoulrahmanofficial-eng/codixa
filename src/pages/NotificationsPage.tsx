import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft, X, BellPlus } from 'lucide-react';
import { ref, onValue, off, get } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { subscribeUserToPush } from '../lib/fcm';
import { useAuth } from '../contexts/AuthContext';
import type { AppNotification } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

interface NotificationsPageProps {
  setCurrentPage: (page: string) => void;
}

export default function NotificationsPage({ setCurrentPage }: NotificationsPageProps) {
  const { t, lang } = useI18n();
  const { user, markNotificationRead, deleteNotification } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<'loading' | 'on' | 'off'>('loading');

  useEffect(() => {
    if (!('Notification' in window)) { setPushStatus('off'); return; }
    if (Notification.permission === 'granted') {
      setPushStatus('on');
    } else if (Notification.permission === 'denied') {
      setPushStatus('off');
    } else {
      setPushStatus('off');
    }
  }, []);

  const enablePush = async () => {
    if (!user?.uid) return;
    setPushStatus('loading');
    const ok = await subscribeUserToPush(user.uid);
    setPushStatus(ok ? 'on' : 'off');
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id).catch(() => {});
  };

  useEffect(() => {
    if (!user?.uid) return;
    const notifRef = ref(rtdb, 'notifications');
    setLoading(true);
    onValue(notifRef, async (snap) => {
      const [dismissedSnap, readSnap] = await Promise.all([
        get(ref(rtdb, `users/${user.uid}/dismissedNotifications`)),
        get(ref(rtdb, `users/${user.uid}/readNotifications`)),
      ]);
      const dismissed: Record<string, boolean> = dismissedSnap.val() || {};
      const readNotifs: Record<string, boolean> = readSnap.val() || {};
      if (!snap.exists()) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const data = snap.val();
      const all: AppNotification[] = Object.entries(data)
        .filter(([id, v]: any) => v !== null && !dismissed[id])
        .map(([id, val]: any) => ({ id, ...val }));
      const filtered = all.filter(n => !n.targetUserId || n.targetUserId === user?.uid).sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(filtered);
      setLoading(false);
      const unreadIds = filtered.filter(notif => !readNotifs[notif.id]).map(notif => notif.id);
      if (unreadIds.length) markNotificationRead(unreadIds[0]);
    });
    return () => off(notifRef);
  }, [user?.uid, markNotificationRead]);

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

          {pushStatus === 'off' && (
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-indigo-500/10">
              <span className="text-sm text-slate-300">
                {lang === 'ar' ? 'فعّل الإشعارات لتصلك التنبيهات حتى خارج الموقع' : 'Enable push notifications to get alerts even when you\'re away'}
              </span>
              <button onClick={enablePush} className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0">
                <BellPlus size={14} />
                {lang === 'ar' ? 'تفعيل' : 'Enable'}
              </button>
            </div>
          )}

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
                    className={`group p-4 border-b border-white/5 hover:bg-white/5 transition-all relative`}
                  >
                    <button onClick={() => handleDelete(n.id)}
                      className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all`}>
                      <X size={14} className="text-slate-400 hover:text-red-400" />
                    </button>
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