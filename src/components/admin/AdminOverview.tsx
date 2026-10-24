import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, ShoppingCart, BookOpen, Star, CreditCard, CheckCircle, XCircle, Loader2, ArrowUpRight, Wallet, Receipt, BarChart3 } from 'lucide-react';
import type { Transaction } from '../../contexts/AuthContext';

interface Props {
  pendingTx: Transaction[];
  totalBalance: number;
  totalRevenue: number;
  totalXP: number;
  totalPurchases: number;
  regularUsers: any[];
  staticCount: number;
  dynamicCount: number;
  coursesSold: number;
  getUserName: (id: string) => string;
  handleApprove: (userId: string, txId: string) => void;
  handleReject: (userId: string, txId: string) => void;
  actionLoading: string | null;
  lang: string;
  setTab: (tab: string) => void;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminOverview({
  pendingTx, totalBalance, totalRevenue, totalXP, totalPurchases, regularUsers,
  staticCount, dynamicCount, coursesSold, getUserName, handleApprove, handleReject,
  actionLoading, lang, setTab,
}: Props) {
  const stats = [
    { icon: <Users size={20} />, value: regularUsers.length, label: lang === 'ar' ? 'المستخدمين' : 'Users', sub: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total registered', gradient: 'from-blue-600/40 to-blue-800/20', border: 'border-blue-500/30', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    { icon: <Wallet size={20} />, value: `${totalBalance} EGP`, label: lang === 'ar' ? 'إجمالي الرصيد' : 'Balance', sub: lang === 'ar' ? 'رصيد المستخدمين' : 'User wallets total', gradient: 'from-emerald-600/40 to-emerald-800/20', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
    { icon: <TrendingUp size={20} />, value: `${totalRevenue} EGP`, label: lang === 'ar' ? 'الإيرادات' : 'Revenue', sub: lang === 'ar' ? 'إجمالي الودائع' : 'Total deposits', gradient: 'from-amber-600/40 to-amber-800/20', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { icon: <Receipt size={20} />, value: pendingTx.length, label: lang === 'ar' ? 'معلق' : 'Pending', sub: lang === 'ar' ? 'تحتاج مراجعة' : 'Need review', gradient: 'from-rose-600/40 to-rose-800/20', border: 'border-rose-500/30', iconBg: 'bg-rose-500/20', iconColor: 'text-rose-400' },
    { icon: <ShoppingCart size={20} />, value: totalPurchases, label: lang === 'ar' ? 'المشتريات' : 'Purchases', sub: lang === 'ar' ? 'معاملة مكتملة' : 'Completed purchases', gradient: 'from-violet-600/40 to-violet-800/20', border: 'border-violet-500/30', iconBg: 'bg-violet-500/20', iconColor: 'text-violet-400' },
    { icon: <Star size={20} />, value: totalXP.toLocaleString(), label: 'XP', sub: lang === 'ar' ? 'إجمالي النقاط' : 'Total experience', gradient: 'from-indigo-600/40 to-indigo-800/20', border: 'border-indigo-500/30', iconBg: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item} className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.gradient} p-5 group hover:scale-[1.02] transition-all duration-300 cursor-default`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${s.iconColor}`}>{s.icon}</div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
            <div className="text-slate-500 text-[10px] mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Transactions */}
        <motion.div variants={item} className="lg:col-span-2 glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <CreditCard size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{lang === 'ar' ? 'المعاملات المعلقة' : 'Pending Transactions'}</h3>
                <p className="text-slate-500 text-xs">{lang === 'ar' ? 'آخر الطلبات في انتظار المراجعة' : 'Latest requests awaiting review'}</p>
              </div>
            </div>
            {pendingTx.length > 0 && (
              <button onClick={() => setTab('transactions')} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowUpRight size={12} />
              </button>
            )}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pendingTx.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-slate-500">
                <CheckCircle size={36} className="text-emerald-400/60 mb-3" />
                <p className="text-sm font-medium text-slate-400">{lang === 'ar' ? 'لا توجد معاملات معلقة' : 'No pending transactions'}</p>
                <p className="text-xs text-slate-600 mt-1">{lang === 'ar' ? 'كل شيء على ما يرام' : 'Everything is clear'}</p>
              </div>
            ) : (
              pendingTx.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-amber-500/[0.03] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <DollarSign size={18} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{getUserName(tx.userId || '')}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{tx.amount} EGP</span>
                    </div>
                    <div className="text-slate-500 text-xs truncate mt-0.5">{tx.description || '—'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleApprove(tx.userId || '', tx.id)} disabled={actionLoading === `${tx.userId}-${tx.id}`}
                      className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40 flex items-center justify-center">
                      {actionLoading === `${tx.userId}-${tx.id}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    </button>
                    <button onClick={() => handleReject(tx.userId || '', tx.id)}
                      className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all flex items-center justify-center">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
            {pendingTx.length > 5 && (
              <button onClick={() => setTab('transactions')} className="w-full py-3 text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                {lang === 'ar' ? `عرض ${pendingTx.length - 5} معاملات أخرى` : `View ${pendingTx.length - 5} more transactions`}
              </button>
            )}
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div variants={item} className="space-y-3">
          <div className="glass rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{lang === 'ar' ? 'إحصائيات سريعة' : 'Quick Insights'}</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">{lang === 'ar' ? 'المشتريات' : 'Purchases'}</span><span className="text-white font-bold">{totalPurchases}</span></div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${Math.min(100, totalPurchases * 5)}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">{lang === 'ar' ? 'الكورسات' : 'Courses'}</span><span className="text-white font-bold">{staticCount + dynamicCount}</span></div>
                <div className="flex gap-2 text-[10px] text-slate-500"><span>{staticCount} static</span><span>+</span><span>{dynamicCount} dynamic</span></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">{lang === 'ar' ? 'كورسات مبيعة' : 'Courses Sold'}</span><span className="text-white font-bold">{coursesSold}</span></div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300" style={{ width: `${Math.min(100, coursesSold)}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">XP</span><span className="text-amber-400 font-bold">{totalXP.toLocaleString()}</span></div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${Math.min(100, totalXP / 100)}%` }} /></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Receipt size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{lang === 'ar' ? 'معدلات' : 'Ratios'}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-500 text-[10px]">{lang === 'ar' ? 'متوسط الرصيد' : 'Avg Balance'}</div>
                <div className="text-white font-bold text-sm mt-0.5">{regularUsers.length > 0 ? (totalBalance / regularUsers.length).toFixed(0) : 0} EGP</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-500 text-[10px]">{lang === 'ar' ? 'متوسط XP' : 'Avg XP'}</div>
                <div className="text-white font-bold text-sm mt-0.5">{regularUsers.length > 0 ? (totalXP / regularUsers.length).toFixed(0) : 0}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
