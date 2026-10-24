import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Shield, Plus, Minus, Loader2, Bell, XCircle, Send, User as UserIcon, ArrowLeftRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import ConfirmModal from './ConfirmModal';
import type { UserProfile, Transaction } from '../../contexts/AuthContext';

interface Props {
  users: UserProfile[];
  transactions: Transaction[];
  currentAdminUid?: string;
  handleToggleAdmin: (uid: string, isAdmin: boolean) => void;
  handleAddBalance: (uid: string, amount: number) => void;
  handleDeductBalance: (uid: string, amount: number) => void;
  handleTransferBalance: (fromUid: string, toUid: string, amount: number) => void;
  handleDeleteUser: (uid: string, name: string) => void;
  sendUserNotification: (uid: string, title: string, body: string) => void;
  actionLoading: string | null;
  lang: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AdminUsers({
  users, transactions, currentAdminUid, handleToggleAdmin, handleAddBalance, handleDeductBalance,
  handleTransferBalance, handleDeleteUser, sendUserNotification, actionLoading, lang,
}: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addUid, setAddUid] = useState(''); const [addAmt, setAddAmt] = useState('');
  const [deductUid, setDeductUid] = useState(''); const [deductAmt, setDeductAmt] = useState('');
  const [transferUid, setTransferUid] = useState(''); const [transferTo, setTransferTo] = useState(''); const [transferAmt, setTransferAmt] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ uid: string; name: string } | null>(null);
  const [notifPrompt, setNotifPrompt] = useState<{ uid: string } | null>(null);
  const [notifTitle, setNotifTitle] = useState(''); const [notifBody, setNotifBody] = useState('');

  const regular = users.filter(u => !u.isAdmin);
  const filtered = search ? regular.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.uid?.toLowerCase().includes(search.toLowerCase())) : regular;
  const getUserTx = (uid: string) => transactions.filter(tx => tx.userId === uid);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ConfirmModal open={!!confirmDelete} title={lang === 'ar' ? 'حذف المستخدم' : 'Delete User'}
        message={lang === 'ar' ? `هل أنت متأكد من حذف "${confirmDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.` : `Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        variant="danger" confirmLabel={lang === 'ar' ? 'حذف' : 'Delete'} cancelLabel={lang === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={() => { if (confirmDelete) { handleDeleteUser(confirmDelete.uid, confirmDelete.name); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)} />

      <ConfirmModal open={!!notifPrompt} title={lang === 'ar' ? 'إرسال إشعار' : 'Send Notification'}
        message={
          <div className="space-y-3" onClick={e => e.stopPropagation()}>
            <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
              placeholder={lang === 'ar' ? 'عنوان الإشعار' : 'Title'} autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500" />
            <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} rows={2}
              placeholder={lang === 'ar' ? 'المحتوى' : 'Body'}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 resize-none" />
          </div>
        }
        confirmLabel={lang === 'ar' ? 'إرسال' : 'Send'}
        onConfirm={() => { if (notifPrompt && notifTitle && notifBody) { sendUserNotification(notifPrompt.uid, notifTitle, notifBody); setNotifTitle(''); setNotifBody(''); setNotifPrompt(null); } }}
        onCancel={() => { setNotifPrompt(null); setNotifTitle(''); setNotifBody(''); }} />

      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم، بريد، أو معرف...' : 'Search name, email, or ID...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 transition-all" />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
          <UserIcon size={12} /><span>{filtered.length} {lang === 'ar' ? 'مستخدم' : 'users'}</span>
          <span className="text-white/10">|</span>
          <span>{lang === 'ar' ? 'اضغط على المستخدم للتوسيع' : 'Click a user to expand'}</span>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {filtered.map(u => (
            <motion.div key={u.uid} variants={item}>
              <div className="flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-all cursor-pointer" onClick={() => setExpanded(expanded === u.uid ? null : u.uid)}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-semibold text-sm">{u.name}</span>
                  <div className="text-slate-500 text-xs truncate">{u.email}</div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                  <div className="text-right"><div className="text-emerald-400 font-semibold">{u.wallet?.balance || 0} EGP</div><div className="text-[10px]">{lang === 'ar' ? 'رصيد' : 'balance'}</div></div>
                  <div className="text-right"><div className="text-white font-semibold">{(u.purchasedCourses || []).length}</div><div className="text-[10px]">{lang === 'ar' ? 'كورسات' : 'courses'}</div></div>
                  <div className="text-right"><div className="text-amber-400 font-semibold">{u.xp || 0}</div><div className="text-[10px]">XP</div></div>
                </div>
                <div className="flex items-center gap-1">
                  {u.uid !== currentAdminUid && (
                    <button onClick={e => { e.stopPropagation(); handleToggleAdmin(u.uid, false); }}
                      disabled={actionLoading === `admin-${u.uid}`}
                      className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40 flex items-center justify-center"
                      title={lang === 'ar' ? 'جعله مديراً' : 'Make admin'}>
                      {actionLoading === `admin-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                    </button>
                  )}
                  {expanded === u.uid ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </div>
              </div>

              {expanded === u.uid && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-0 mx-3 mb-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 pb-3 border-b border-white/5">
                      <div><span className="text-slate-500 text-[10px] uppercase tracking-wider">{lang === 'ar' ? 'الرصيد' : 'Balance'}</span><div className="text-emerald-400 font-bold mt-0.5">{u.wallet?.balance || 0} EGP</div></div>
                      <div><span className="text-slate-500 text-[10px] uppercase tracking-wider">{lang === 'ar' ? 'الكورسات' : 'Courses'}</span><div className="text-white font-bold mt-0.5">{(u.purchasedCourses || []).length}</div></div>
                      <div><span className="text-slate-500 text-[10px] uppercase tracking-wider">XP</span><div className="text-amber-400 font-bold mt-0.5">{u.xp || 0}</div></div>
                      <div><span className="text-slate-500 text-[10px] uppercase tracking-wider">{lang === 'ar' ? 'المستوى' : 'Level'}</span><div className="text-indigo-400 font-bold mt-0.5">{u.level || 1}</div></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" placeholder={lang === 'ar' ? 'المبلغ...' : 'Amount...'}
                          value={addUid === u.uid ? addAmt : ''}
                          onChange={e => { setAddUid(u.uid); setAddAmt(e.target.value); }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white placeholder-slate-500 text-xs outline-none focus:border-emerald-500 transition-colors" />
                        <button onClick={() => { handleAddBalance(u.uid, parseInt(addAmt)); setAddAmt(''); }}
                          disabled={addUid !== u.uid || !addAmt || actionLoading === `balance-${u.uid}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold shrink-0 disabled:opacity-40">
                          {actionLoading === `balance-${u.uid}` ? <Loader2 size={10} className="animate-spin" /> : <Plus size={12} />}
                          {lang === 'ar' ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" placeholder={lang === 'ar' ? 'الخصم...' : 'Deduct...'}
                          value={deductUid === u.uid ? deductAmt : ''}
                          onChange={e => { setDeductUid(u.uid); setDeductAmt(e.target.value); }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white placeholder-slate-500 text-xs outline-none focus:border-rose-500 transition-colors" />
                        <button onClick={() => { handleDeductBalance(u.uid, parseInt(deductAmt)); setDeductAmt(''); }}
                          disabled={deductUid !== u.uid || !deductAmt || actionLoading === `deduct-${u.uid}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all text-xs font-bold shrink-0 disabled:opacity-40">
                          {actionLoading === `deduct-${u.uid}` ? <Loader2 size={10} className="animate-spin" /> : <Minus size={12} />}
                          {lang === 'ar' ? 'خصم' : 'Deduct'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={transferUid === u.uid ? transferTo : ''}
                          onChange={e => { setTransferUid(u.uid); setTransferTo(e.target.value); }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white text-xs outline-none">
                          <option value="">{lang === 'ar' ? 'المستلم...' : 'To...'}</option>
                          {users.filter(o => o.uid !== u.uid && !o.isAdmin).map(o => (
                            <option key={o.uid} value={o.uid} className="bg-slate-800">{o.name || o.email}</option>
                          ))}
                        </select>
                        <input type="number" min="1" placeholder={lang === 'ar' ? 'المبلغ...' : 'Amt...'}
                          value={transferUid === u.uid ? transferAmt : ''}
                          onChange={e => { setTransferUid(u.uid); setTransferAmt(e.target.value); }}
                          className="w-16 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white placeholder-slate-500 text-xs outline-none focus:border-amber-500" />
                        <button onClick={() => { handleTransferBalance(u.uid, transferTo, parseInt(transferAmt)); setTransferAmt(''); }}
                          disabled={transferUid !== u.uid || !transferTo || !transferAmt || actionLoading === `transfer-${u.uid}`}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all text-xs font-bold shrink-0 disabled:opacity-40">
                          <ArrowLeftRight size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                      <button onClick={() => { setNotifPrompt({ uid: u.uid }); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-all text-xs font-bold">
                        <Send size={12} /> {lang === 'ar' ? 'إشعار' : 'Notify'}
                      </button>
                      <button onClick={() => setConfirmDelete({ uid: u.uid, name: u.name || u.email })}
                        disabled={u.uid === currentAdminUid}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all text-xs font-bold disabled:opacity-40">
                        {actionLoading === `delete-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        {lang === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>

                    {getUserTx(u.uid).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">{lang === 'ar' ? 'آخر المعاملات' : 'Recent Transactions'}</span>
                        <div className="space-y-1 mt-1.5">
                          {getUserTx(u.uid).slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/5">
                              <div className="flex items-center gap-2">
                                <TypeBadge type={tx.type} lang={lang} />
                                <span className="text-slate-400 truncate max-w-[180px]">{tx.description}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-white font-semibold">{tx.amount} EGP</span>
                                <StatusBadge status={tx.status} lang={lang} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <UserIcon size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{lang === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</p>
              {search && <p className="text-xs text-slate-600 mt-1">{lang === 'ar' ? 'جرب بحث مختلف' : 'Try a different search'}</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Fix ConfirmModal to accept ReactNode for message
