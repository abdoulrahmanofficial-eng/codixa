import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Loader2, XCircle, Megaphone, CheckCircle2 } from 'lucide-react';
import type { AppNotification } from '../../contexts/AuthContext';

interface Props {
  notifications: AppNotification[];
  createNotification: (title: string, body: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getNotifications: () => Promise<AppNotification[]>;
  setNotifications: (n: AppNotification[]) => void;
  lang: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

export default function AdminNotifications({ notifications, createNotification, deleteNotification, getNotifications, setNotifications, lang }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await createNotification(title.trim(), body.trim());
      setTitle('');
      setBody('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      const n = await getNotifications();
      setNotifications(n);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Send */}
      <div className="lg:col-span-2">
        <div className="glass rounded-2xl border border-white/10 overflow-hidden sticky top-28">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Megaphone size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">{lang === 'ar' ? 'إرسال إشعار' : 'Send Notification'}</h3>
              <p className="text-slate-500 text-xs">{lang === 'ar' ? 'لكل المستخدمين' : 'To all users'}</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5">{lang === 'ar' ? 'العنوان' : 'Title'}</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder-slate-500"
                placeholder={lang === 'ar' ? 'عنوان الإشعار' : 'Notification title'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && body) bodyRef.current?.focus(); }} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5">{lang === 'ar' ? 'المحتوى' : 'Body'}</label>
              <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)} rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-500"
                placeholder={lang === 'ar' ? 'محتوى الإشعار' : 'Notification body'} />
            </div>
            <button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20">
              {sending ? <Loader2 size={16} className="animate-spin" /> : sent ? <CheckCircle2 size={16} /> : <Send size={16} />}
              {sending ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : sent ? (lang === 'ar' ? 'تم الإرسال!' : 'Sent!') : (lang === 'ar' ? 'إرسال الإشعار' : 'Send')}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-3">
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Bell size={18} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{lang === 'ar' ? 'الإشعارات السابقة' : 'Previous Notifications'}</h3>
                <p className="text-slate-500 text-xs">{notifications.length} {lang === 'ar' ? 'إشعار' : 'notifications'}</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-500">
                  <Bell size={32} className="opacity-30 mb-3" />
                  <p className="text-sm font-medium">{lang === 'ar' ? 'لا توجد إشعارات بعد' : 'No notifications yet'}</p>
                </div>
              ) : (
                notifications.map(n => (
                  <motion.div key={n.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="p-4 hover:bg-white/[0.02] transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Bell size={13} className="text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm">{n.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.body}</div>
                          <div className="text-slate-600 text-[10px] mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <button onClick={async () => {
                        if (!window.confirm(lang === 'ar' ? `حذف "${n.title}"؟` : `Delete "${n.title}"?`)) return;
                        await deleteNotification(n.id);
                        setNotifications(notifications.filter(x => x.id !== n.id));
                      }} className="opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center shrink-0">
                        <XCircle size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
