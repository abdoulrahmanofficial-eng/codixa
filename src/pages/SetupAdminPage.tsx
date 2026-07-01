import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, update, get } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Shield, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

interface SetupAdminPageProps {
  setCurrentPage: (page: string) => void;
}

export default function SetupAdminPage({ setCurrentPage }: SetupAdminPageProps) {
  const { user, profile, isAdmin } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdmin) setDone(true);
  }, [isAdmin]);

  const makeAdmin = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      await update(ref(rtdb, `users/${user.uid}`), { isAdmin: true });
      setDone(true);
      setTimeout(() => setCurrentPage('home'), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-2xl mb-4">سجل دخول أولاً</h2>
          <button onClick={() => setCurrentPage('auth')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 max-w-sm w-full text-center">
        {done ? (
          <>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Admin Activated! 🎉</h2>
            <p className="text-slate-400 text-sm">تم تفعيل صلاحيات الأدمن</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Admin Setup</h2>
            <p className="text-slate-400 text-sm mb-2">{user.email}</p>
            <p className="text-slate-500 text-xs mb-6">اضغط عشان تخلي حسابك Admin للمنصة</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={makeAdmin}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 mb-3"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : '🔑 تفعيل Admin'}
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center justify-center gap-2 mx-auto text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              رجوع
            </button>
          </>
        )}
      </div>
    </div>
  );
}
