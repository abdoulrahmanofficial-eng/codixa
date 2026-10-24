import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldOff, Search, UserCog, Loader2, Crown, UserPlus } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import type { UserProfile } from '../../contexts/AuthContext';

interface Props {
  users: UserProfile[];
  currentAdminUid?: string;
  setAdminRole: (uid: string, isAdmin: boolean) => void;
  loadData: () => void;
  actionLoading: string | null;
  setActionLoading: (v: string | null) => void;
  lang: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AdminAdmins({ users, currentAdminUid, setAdminRole, loadData, actionLoading, setActionLoading, lang }: Props) {
  const adminList = users.filter(u => u.isAdmin);
  const [searchQ, setSearchQ] = useState('');
  const [demoteTarget, setDemoteTarget] = useState<{ uid: string; name: string } | null>(null);

  const candidates = users
    .filter(u => !u.isAdmin && u.uid !== currentAdminUid)
    .filter(u => {
      if (!searchQ) return false;
      const q = searchQ.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.uid?.toLowerCase().includes(q);
    });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <ConfirmModal open={!!demoteTarget} title={lang === 'ar' ? 'إزالة صلاحية المدير' : 'Demote Admin'}
        message={lang === 'ar' ? `هل أنت متأكد من إزالة صلاحية المدير عن "${demoteTarget?.name}"؟` : `Are you sure you want to remove admin rights from "${demoteTarget?.name}"?`}
        variant="danger" confirmLabel={lang === 'ar' ? 'إزالة' : 'Demote'} cancelLabel={lang === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={async () => {
          if (!demoteTarget) return;
          setActionLoading(`demote-${demoteTarget.uid}`);
          await setAdminRole(demoteTarget.uid, false);
          await loadData();
          setActionLoading(null);
          setDemoteTarget(null);
        }}
        onCancel={() => setDemoteTarget(null)} />

      <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">{lang === 'ar' ? 'المدراء' : 'Admins'}</h3>
              <p className="text-slate-500 text-xs">{adminList.length} {lang === 'ar' ? 'مدير' : 'administrators'}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {adminList.map(u => (
            <div key={u.uid} className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 flex items-center justify-center text-sm font-bold text-amber-300 shrink-0">
                {u.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{u.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{lang === 'ar' ? 'مدير' : 'Admin'}</span>
                  {u.uid === currentAdminUid && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">{lang === 'ar' ? 'أنت' : 'You'}</span>}
                </div>
                <div className="text-slate-500 text-xs">{u.email}</div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                <span>{u.wallet?.balance || 0} EGP</span>
                <span>{(u.purchasedCourses || []).length} {lang === 'ar' ? 'كورس' : 'courses'}</span>
                <span>{u.xp || 0} XP</span>
              </div>
              {u.uid !== currentAdminUid && (
                <button onClick={() => setDemoteTarget({ uid: u.uid, name: u.name })}
                  disabled={actionLoading === `demote-${u.uid}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all text-xs font-bold disabled:opacity-40">
                  {actionLoading === `demote-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                  {lang === 'ar' ? 'إزالة' : 'Demote'}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <UserPlus size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">{lang === 'ar' ? 'ترقية مستخدم' : 'Promote User'}</h3>
            <p className="text-slate-500 text-xs">{lang === 'ar' ? 'ابحث عن مستخدم لترقيته إلى مدير' : 'Search for a user to promote'}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث بالاسم أو البريد...' : 'Search by name or email...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
            {candidates.map(u => (
              <div key={u.uid} className="flex items-center gap-3 py-3 hover:bg-white/[0.02] transition-all rounded-lg px-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{u.name}</div>
                  <div className="text-slate-500 text-xs">{u.email}</div>
                </div>
                <button onClick={async () => {
                  setActionLoading(`promote-${u.uid}`);
                  await setAdminRole(u.uid, true);
                  setSearchQ('');
                  await loadData();
                  setActionLoading(null);
                }} disabled={actionLoading === `promote-${u.uid}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold disabled:opacity-40">
                  {actionLoading === `promote-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                  {lang === 'ar' ? 'ترقية' : 'Promote'}
                </button>
              </div>
            ))}
            {searchQ && candidates.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">{lang === 'ar' ? 'لا توجد نتائج' : 'No results'} 😕</div>
            )}
            {!searchQ && (
              <div className="text-center py-6 text-slate-500 text-xs">{lang === 'ar' ? 'اكتب للبحث عن مستخدمين لترقيتهم' : 'Type to search for users to promote'}</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
