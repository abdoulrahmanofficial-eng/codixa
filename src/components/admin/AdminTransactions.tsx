import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import type { Transaction } from '../../contexts/AuthContext';

interface Props {
  transactions: Transaction[];
  getUserName: (id: string) => string;
  handleApprove: (userId: string, txId: string) => void;
  handleReject: (userId: string, txId: string) => void;
  actionLoading: string | null;
  lang: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };

export default function AdminTransactions({ transactions, getUserName, handleApprove, handleReject, actionLoading, lang }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const pendingTx = useMemo(() => transactions.filter(tx => tx.status === 'pending'), [transactions]);
  const filtered = useMemo(() => {
    let list = filter === 'all' ? transactions
      : filter === 'pending' ? pendingTx
      : filter === 'completed' ? transactions.filter(tx => tx.status === 'completed')
      : transactions.filter(tx => tx.status === 'failed');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        getUserName(tx.userId || '').toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
      );
    }
    return list;
  }, [transactions, filter, search, pendingTx, getUserName]);

  const countAll = transactions.length;
  const countPending = pendingTx.length;
  const countCompleted = transactions.filter(tx => tx.status === 'completed').length;
  const countFailed = transactions.filter(tx => tx.status === 'failed').length;

  const filters = [
    { id: 'all' as const, label: lang === 'ar' ? 'الكل' : 'All', count: countAll, color: 'text-white' },
    { id: 'pending' as const, label: lang === 'ar' ? 'معلق' : 'Pending', count: countPending, color: 'text-amber-400' },
    { id: 'completed' as const, label: lang === 'ar' ? 'مكتمل' : 'Completed', count: countCompleted, color: 'text-emerald-400' },
    { id: 'failed' as const, label: lang === 'ar' ? 'فشل' : 'Failed', count: countFailed, color: 'text-rose-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}>
              <Filter size={12} />
              {f.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === f.id ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-500'}`}>{f.count}</span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-9 pl-3 text-white placeholder-slate-500 text-xs outline-none focus:border-indigo-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                {[
                  lang === 'ar' ? 'المستخدم' : 'User',
                  lang === 'ar' ? 'النوع' : 'Type',
                  lang === 'ar' ? 'المبلغ' : 'Amount',
                  lang === 'ar' ? 'الحالة' : 'Status',
                  lang === 'ar' ? 'الوصف' : 'Description',
                  lang === 'ar' ? 'كود الدفع' : 'Payment Code',
                  lang === 'ar' ? 'التاريخ' : 'Date',
                  lang === 'ar' ? 'إجراء' : 'Action',
                ].map(h => (
                  <th key={h} className="text-right p-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(tx => (
                <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-all">
                  <td className="p-3"><span className="text-white font-semibold text-xs">{getUserName(tx.userId || '')}</span></td>
                  <td className="p-3"><TypeBadge type={tx.type} lang={lang} /></td>
                  <td className="p-3"><span className="text-white font-bold">{tx.amount} EGP</span></td>
                  <td className="p-3"><StatusBadge status={tx.status} lang={lang} /></td>
                  <td className="p-3 text-slate-400 text-xs max-w-[160px] truncate">{tx.description || '—'}</td>
                  <td className="p-3">
                    {tx.paymentCode ? (
                      <span className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-amber-400 font-bold">{tx.paymentCode}</span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="p-3 text-slate-500 text-xs">{new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                  <td className="p-3 text-center">
                    {tx.status === 'pending' ? (
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleApprove(tx.userId || '', tx.id)}
                          disabled={actionLoading === `${tx.userId}-${tx.id}`}
                          className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40 flex items-center justify-center">
                          {actionLoading === `${tx.userId}-${tx.id}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => handleReject(tx.userId || '', tx.id)}
                          className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all flex items-center justify-center">
                          <XCircle size={14} />
                        </button>
                      </div>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-slate-500">
                  <p className="text-sm font-medium">{lang === 'ar' ? 'لا توجد معاملات' : 'No transactions'}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
