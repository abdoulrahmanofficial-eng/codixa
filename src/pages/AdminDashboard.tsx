import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, Transaction } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { getDynamicCourses, updateCoursePrice as updateDynamicPrice, type BackendCourse } from '../lib/courseService';
import { setCoursePrice, getAllPriceOverrides, removeCoursePrice } from '../lib/priceService';
import { courses as staticCourses } from '../data/courses';
import SeedCoursePanel from './SeedCoursePanel';
import {
  Users, ShoppingCart, CheckCircle, XCircle, TrendingUp, Loader2, ArrowLeft,
  Search, Shield, ShieldOff, UserCog, Activity, CreditCard, BookOpen, Star, DollarSign,
  Calendar, Filter, RefreshCw, ChevronDown, ChevronUp, Plus, Minus, Edit3, Tag
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

type AdminTab = 'overview' | 'users' | 'transactions' | 'courses' | 'settings';

export default function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const { t, lang } = useI18n();
  const { isAdmin, profile, getAllUsers, getAllTransactions, approveDeposit, rejectDeposit, setAdminRole, addUserBalance, deductUserBalance, transferBalance, createDiscountCode, getAllDiscountCodes, deleteDiscountCode } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addBalanceUserId, setAddBalanceUserId] = useState<string | null>(null);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [deductBalanceUserId, setDeductBalanceUserId] = useState<string | null>(null);
  const [deductBalanceAmount, setDeductBalanceAmount] = useState('');
  const [discountCodes, setDiscountCodes] = useState<{ code: string; percentage: number; createdAt: number; active: boolean }[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [transferFromId, setTransferFromId] = useState<string | null>(null);
  const [transferToId, setTransferToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [dynamicCourses, setDynamicCourses] = useState<BackendCourse[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allTx, courses, overrides, codes] = await Promise.all([getAllUsers(), getAllTransactions(), getDynamicCourses(), getAllPriceOverrides(), getAllDiscountCodes()]);
      setUsers(allUsers);
      setTransactions(allTx);
      setDynamicCourses(courses);
      setPriceOverrides(overrides);
      setDiscountCodes(codes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, txId: string) => {
    setActionLoading(`${userId}-${txId}`);
    await approveDeposit(userId, txId);
    await loadData();
    setActionLoading(null);
  };

  const handleReject = async (userId: string, txId: string) => {
    setActionLoading(`${userId}-${txId}`);
    await rejectDeposit(userId, txId);
    await loadData();
    setActionLoading(null);
  };

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    setActionLoading(`admin-${userId}`);
    await setAdminRole(userId, !currentAdmin);
    await loadData();
    setActionLoading(null);
  };

  const handleAddBalance = async () => {
    if (!addBalanceUserId || !addBalanceAmount) return;
    const amount = parseInt(addBalanceAmount);
    if (isNaN(amount) || amount <= 0) return;
    setActionLoading(`balance-${addBalanceUserId}`);
    await addUserBalance(addBalanceUserId, amount);
    setAddBalanceUserId(null);
    setAddBalanceAmount('');
    await loadData();
    setActionLoading(null);
  };

  const handleDeductBalance = async () => {
    if (!deductBalanceUserId || !deductBalanceAmount) return;
    const amount = parseInt(deductBalanceAmount);
    if (isNaN(amount) || amount <= 0) return;
    setActionLoading(`deduct-${deductBalanceUserId}`);
    await deductUserBalance(deductBalanceUserId, amount);
    setDeductBalanceUserId(null);
    setDeductBalanceAmount('');
    await loadData();
    setActionLoading(null);
  };

  const handleTransferBalance = async () => {
    if (!transferFromId || !transferToId || !transferAmount) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0 || transferFromId === transferToId) return;
    setActionLoading(`transfer-${transferFromId}`);
    await transferBalance(transferFromId, transferToId, amount);
    setTransferFromId(null);
    setTransferToId('');
    setTransferAmount('');
    await loadData();
    setActionLoading(null);
  };

  const pendingTx = useMemo(() => transactions.filter(tx => tx.status === 'pending'), [transactions]);
  const totalBalance = useMemo(() => users.reduce((sum, u) => sum + (u.wallet?.balance || 0), 0), [users]);
  const totalRevenue = useMemo(() =>
    transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0), [transactions]);
  const totalXP = useMemo(() => users.reduce((sum, u) => sum + (u.xp || 0), 0), [users]);
  const totalPurchases = useMemo(() =>
    transactions.filter(tx => tx.type === 'purchase' && tx.status === 'completed').length, [transactions]);
  const adminCount = useMemo(() => users.filter(u => u.isAdmin).length, [users]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (txFilter === 'pending') list = list.filter(tx => tx.status === 'pending');
    else if (txFilter === 'completed') list = list.filter(tx => tx.status === 'completed');
    else if (txFilter === 'failed') list = list.filter(tx => tx.status === 'failed');
    return list;
  }, [transactions, txFilter]);

  const allCourses = useMemo(() => {
    const staticMapped = staticCourses.map(c => ({ id: c.id, title: c.title, price: c.price, free: c.free, type: 'static' as const, icon: c.icon }));
    const dynamicMapped = dynamicCourses.map(c => ({ id: c.id, title: c.title, price: c.price, free: c.free ?? true, type: 'dynamic' as const, icon: c.icon || '📚' }));
    return [...staticMapped, ...dynamicMapped];
  }, [staticCourses, dynamicCourses]);

  const getUserName = (userId: string) => users.find(u => u.uid === userId)?.name || 'Unknown';
  const getUserTransactions = (userId: string) => transactions.filter(tx => tx.userId === userId);

  const StatCard = ({ icon, value, label, color, sub }: { icon: React.ReactNode; value: string | number; label: string; color: string; sub?: string }) => (
    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-2xl mb-4">{lang === 'ar' ? 'غير مصرح بالدخول' : 'Access Denied'}</h2>
          <p className="text-slate-400 mb-6">{lang === 'ar' ? 'ليس لديك صلاحيات المدير' : 'You do not have admin privileges.'}</p>
          <button onClick={() => setCurrentPage('home')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold">
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: <Activity size={16} /> },
    { id: 'users', label: lang === 'ar' ? 'المستخدمين' : 'Users', icon: <Users size={16} />, badge: users.length },
    { id: 'transactions', label: lang === 'ar' ? 'المعاملات' : 'Transactions', icon: <CreditCard size={16} />, badge: pendingTx.length },
    { id: 'courses', label: lang === 'ar' ? 'الكورسات' : 'Courses', icon: <BookOpen size={16} />, badge: staticCourses.length + dynamicCourses.length },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: <UserCog size={16} /> },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      completed: lang === 'ar' ? 'مكتمل' : 'Done',
      pending: lang === 'ar' ? 'معلق' : 'Pending',
      failed: lang === 'ar' ? 'فشل' : 'Failed',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const TypeBadge = ({ type }: { type: string }) => (
    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
      type === 'deposit' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }`}>
      {type === 'deposit' ? (lang === 'ar' ? 'إيداع' : 'Deposit') : (lang === 'ar' ? 'شراء' : 'Purchase')}
    </span>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} />
              {t('common.back')}
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 text-yellow-300 text-sm font-semibold">
              🔑 {lang === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
            </div>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glass text-slate-300 hover:text-white border border-white/10 transition-all hover:bg-white/10">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {lang === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
          <StatCard icon={<Users size={18} className="text-blue-400" />} value={users.length} label={lang === 'ar' ? 'المستخدمين' : 'Users'} color="bg-blue-500/20" sub={lang === 'ar' ? `${adminCount} مدير` : `${adminCount} admin`} />
          <StatCard icon={<DollarSign size={18} className="text-green-400" />} value={`${totalBalance} EGP`} label={lang === 'ar' ? 'إجمالي الرصيد' : 'Total Balance'} color="bg-green-500/20" />
          <StatCard icon={<TrendingUp size={18} className="text-yellow-400" />} value={`${totalRevenue} EGP`} label={lang === 'ar' ? 'الإيرادات' : 'Revenue'} color="bg-yellow-500/20" />
          <StatCard icon={<ShoppingCart size={18} className="text-red-400" />} value={pendingTx.length} label={lang === 'ar' ? 'معلقة' : 'Pending'} color="bg-red-500/20" sub={lang === 'ar' ? 'معاملة تحتاج مراجعة' : 'need review'} />
          <StatCard icon={<BookOpen size={18} className="text-purple-400" />} value={totalPurchases} label={lang === 'ar' ? 'المشتريات' : 'Purchases'} color="bg-purple-500/20" />
          <StatCard icon={<Star size={18} className="text-indigo-400" />} value={totalXP.toLocaleString()} label="XP" color="bg-indigo-500/20" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'glass text-slate-300 hover:text-white border border-white/10'
              }`}>
              {t.icon}
              {t.label}
              {t.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                  t.id === 'transactions' && t.badge > 0 ? 'bg-red-500/30 text-red-200' : 'bg-white/10 text-slate-400'
                }`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={36} className="animate-spin text-indigo-400 mx-auto mb-4" />
              <p className="text-slate-400">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Overview Tab ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Pending Transactions */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <CreditCard size={18} className="text-yellow-400" />
                      {lang === 'ar' ? 'المعاملات المعلقة' : 'Pending Transactions'}
                      {pendingTx.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/30 text-red-200 rounded text-xs font-bold">{pendingTx.length}</span>
                      )}
                    </h3>
                    {pendingTx.length > 0 && (
                      <button onClick={() => setTab('transactions')} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                        {lang === 'ar' ? 'عرض الكل' : 'View all'}
                      </button>
                    )}
                  </div>
                  {pendingTx.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle size={40} className="text-green-400 mx-auto mb-2" />
                      <p className="text-slate-400">{lang === 'ar' ? 'لا توجد معاملات معلقة' : 'No pending transactions'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingTx.slice(0, 10).map(tx => (
                        <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <DollarSign size={18} className="text-yellow-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm truncate">{getUserName(tx.userId || '')}</div>
                            <div className="text-slate-400 text-xs truncate">{tx.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold">{tx.amount} EGP</div>
                            <div className="text-slate-500 text-[10px]">{new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleApprove(tx.userId || '', tx.id)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
                              disabled={actionLoading === `${tx.userId}-${tx.id}`}>
                              {actionLoading === `${tx.userId}-${tx.id}` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            </button>
                            <button onClick={() => handleReject(tx.userId || '', tx.id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                              disabled={actionLoading === `${tx.userId}-${tx.id}`}>
                              <XCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <div className="text-slate-400 text-sm mb-1">{lang === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}</div>
                    <div className="text-2xl font-black text-white">{totalPurchases}</div>
                    <div className="mt-3 w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, totalPurchases)}%` }} />
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <div className="text-slate-400 text-sm mb-1">{lang === 'ar' ? 'عدد الكورسات' : 'Total Courses'}</div>
                    <div className="text-2xl font-black text-white">{staticCourses.length + dynamicCourses.length}</div>
                    <div className="mt-3 flex gap-2 text-xs text-slate-500">
                      <span>{staticCourses.length} {lang === 'ar' ? 'ثابت' : 'static'}</span>
                      <span>+</span>
                      <span>{dynamicCourses.length} {lang === 'ar' ? 'متحرك' : 'dynamic'}</span>
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <div className="text-slate-400 text-sm mb-1">{lang === 'ar' ? 'كورسات مبيعة' : 'Courses Sold'}</div>
                    <div className="text-2xl font-black text-white">{users.reduce((sum, u) => sum + (u.purchasedCourses?.filter(c => c !== 'scratch').length || 0), 0)}</div>
                    <div className="mt-3 w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${Math.min(100, users.reduce((sum, u) => sum + (u.purchasedCourses?.length || 0), 0))}%` }} />
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <div className="text-slate-400 text-sm mb-1">{lang === 'ar' ? 'إجمالي XP' : 'Total XP'}</div>
                    <div className="text-2xl font-black text-white">{totalXP.toLocaleString()}</div>
                    <div className="mt-3 w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, totalXP / 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Users Tab ── */}
            {tab === 'users' && (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <div className="relative">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder={lang === 'ar' ? 'بحث باسم أو بريد...' : 'Search by name or email...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>

                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <div key={u.uid}>
                        <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer" onClick={() => setExpandedUser(expandedUser === u.uid ? null : u.uid)}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${u.isAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {u.name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm truncate">{u.name}</span>
                              {u.isAdmin && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">Admin</span>}
                            </div>
                            <div className="text-slate-400 text-xs truncate">{u.email}</div>
                          </div>
                          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                            <span>{u.wallet?.balance || 0} EGP</span>
                            <span>{(u.purchasedCourses || []).length} courses</span>
                            <span>{u.xp || 0} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={e => { e.stopPropagation(); handleToggleAdmin(u.uid, !!u.isAdmin); }}
                              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${u.isAdmin ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                              title={u.isAdmin ? (lang === 'ar' ? 'إزالة صلاحية المدير' : 'Remove admin') : (lang === 'ar' ? 'جعله مديراً' : 'Make admin')}
                              disabled={actionLoading === `admin-${u.uid}`}>
                              {actionLoading === `admin-${u.uid}` ? <Loader2 size={14} className="animate-spin" /> : (u.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />)}
                            </button>
                            {expandedUser === u.uid ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </div>
                        {expandedUser === u.uid && (
                          <div className="px-4 pb-4 pt-0 bg-white/5 mx-4 mb-2 rounded-xl">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 pt-3">
                              <div><span className="text-slate-500 text-xs">{lang === 'ar' ? 'الرصيد' : 'Balance'}</span><div className="text-white font-bold">{u.wallet?.balance || 0} EGP</div></div>
                              <div><span className="text-slate-500 text-xs">{lang === 'ar' ? 'الكورسات' : 'Courses'}</span><div className="text-white font-bold">{(u.purchasedCourses || []).length}</div></div>
                              <div><span className="text-slate-500 text-xs">XP</span><div className="text-yellow-400 font-bold">{u.xp || 0}</div></div>
                              <div><span className="text-slate-500 text-xs">{lang === 'ar' ? 'المستوى' : 'Level'}</span><div className="text-indigo-400 font-bold">{u.level || 1}</div></div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <input type="number" min="1" placeholder={lang === 'ar' ? 'المبلغ...' : 'Amount...'}
                                value={addBalanceUserId === u.uid ? addBalanceAmount : ''}
                                onChange={e => { setAddBalanceUserId(u.uid); setAddBalanceAmount(e.target.value); }}
                                className="w-28 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-green-500 transition-colors" />
                              <button onClick={handleAddBalance}
                                disabled={addBalanceUserId !== u.uid || !addBalanceAmount || actionLoading === `balance-${u.uid}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs font-bold disabled:opacity-50">
                                {actionLoading === `balance-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                {lang === 'ar' ? 'إضافة رصيد' : 'Add Balance'}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <input type="number" min="1" placeholder={lang === 'ar' ? 'الخصم...' : 'Deduct...'}
                                value={deductBalanceUserId === u.uid ? deductBalanceAmount : ''}
                                onChange={e => { setDeductBalanceUserId(u.uid); setDeductBalanceAmount(e.target.value); }}
                                className="w-28 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition-colors" />
                              <button onClick={handleDeductBalance}
                                disabled={deductBalanceUserId !== u.uid || !deductBalanceAmount || actionLoading === `deduct-${u.uid}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs font-bold disabled:opacity-50">
                                {actionLoading === `deduct-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />}
                                {lang === 'ar' ? 'خصم رصيد' : 'Deduct Balance'}
                              </button>
                              </div>
                            <div className="flex items-center gap-2 mb-3">
                              <select value={transferFromId === u.uid ? transferToId : ''}
                                onChange={e => { setTransferFromId(u.uid); setTransferToId(e.target.value); }}
                                className="w-32 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white text-xs focus:outline-none focus:border-indigo-500">
                                <option value="">{lang === 'ar' ? 'المستلم...' : 'Recipient...'}</option>
                                {users.filter(other => other.uid !== u.uid).map(other => (
                                  <option key={other.uid} value={other.uid} className="bg-slate-800">{other.name || other.email || other.uid}</option>
                                ))}
                              </select>
                              <input type="number" min="1" placeholder={lang === 'ar' ? 'المبلغ...' : 'Amount...'}
                                value={transferFromId === u.uid ? transferAmount : ''}
                                onChange={e => { setTransferFromId(u.uid); setTransferAmount(e.target.value); }}
                                className="w-20 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-yellow-500 transition-colors" />
                              <button onClick={handleTransferBalance}
                                disabled={transferFromId !== u.uid || !transferToId || !transferAmount || actionLoading === `transfer-${u.uid}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all text-xs font-bold disabled:opacity-50">
                                {actionLoading === `transfer-${u.uid}` ? <Loader2 size={12} className="animate-spin" /> : <span>⇄</span>}
                                {lang === 'ar' ? 'تحويل' : 'Transfer'}
                              </button>
                            </div>
                            {getUserTransactions(u.uid).length > 0 && (
                              <div>
                                <span className="text-slate-500 text-xs">{lang === 'ar' ? 'آخر المعاملات' : 'Recent transactions'}</span>
                                <div className="space-y-1 mt-1">
                                  {getUserTransactions(u.uid).slice(0, 5).map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                                      <div className="flex items-center gap-2">
                                        <TypeBadge type={tx.type} />
                                        <span className="text-slate-400">{tx.description}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold">{tx.amount} EGP</span>
                                        <StatusBadge status={tx.status} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-10 text-slate-400">{lang === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Transactions Tab ── */}
            {tab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'completed', 'failed'] as const).map(f => (
                    <button key={f} onClick={() => setTxFilter(f)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        txFilter === f ? 'bg-indigo-600 text-white' : 'glass text-slate-300 hover:text-white border border-white/10'
                      }`}>
                      <Filter size={12} />
                      {f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') :
                       f === 'pending' ? (lang === 'ar' ? 'معلق' : 'Pending') :
                       f === 'completed' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                       (lang === 'ar' ? 'فشل' : 'Failed')}
                      <span className="px-1 bg-white/10 rounded text-[10px]">
                        {f === 'all' ? transactions.length :
                         f === 'pending' ? pendingTx.length :
                         f === 'completed' ? transactions.filter(tx => tx.status === 'completed').length :
                         transactions.filter(tx => tx.status === 'failed').length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'الوصف' : 'Desc'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'كود الدفع' : 'Payment Code'}</th>
                          <th className="text-right p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                          <th className="text-center p-3 text-slate-400 font-semibold">{lang === 'ar' ? 'إجراء' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(tx => (
                          <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                            <td className="p-3">
                              <div className="text-white font-semibold text-xs truncate max-w-[120px]">{getUserName(tx.userId || '')}</div>
                            </td>
                            <td className="p-3"><TypeBadge type={tx.type} /></td>
                            <td className="p-3 text-white font-bold">{tx.amount} EGP</td>
                            <td className="p-3"><StatusBadge status={tx.status} /></td>
                            <td className="p-3 text-slate-300 text-xs max-w-[150px] truncate">{tx.description}</td>
                            <td className="p-3">
                              {tx.paymentCode ? (
                                <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-yellow-400 font-bold">{tx.paymentCode}</span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-400 text-xs">{new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                            <td className="p-3 text-center">
                              {tx.status === 'pending' ? (
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => handleApprove(tx.userId || '', tx.id)}
                                    className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
                                    disabled={actionLoading === `${tx.userId}-${tx.id}`}>
                                    {actionLoading === `${tx.userId}-${tx.id}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                  </button>
                                  <button onClick={() => handleReject(tx.userId || '', tx.id)}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
                                    <XCircle size={14} />
                                  </button>
                                </div>
                              ) : <span className="text-slate-500">—</span>}
                            </td>
                          </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <tr><td colSpan={8} className="text-center py-10 text-slate-400">{lang === 'ar' ? 'لا توجد معاملات' : 'No transactions'}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Courses Tab ── */}
            {tab === 'courses' && (
              <div className="space-y-6">
                <SeedCoursePanel />

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-indigo-400" />
                  </div>
                ) : (<>
                {/* All Courses (Static + Dynamic) with Price Override */}
                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Tag size={18} className="text-yellow-400" />
                      {lang === 'ar' ? 'أسعار جميع الكورسات' : 'All Course Prices'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {lang === 'ar'
                        ? 'تعديل السعر هنا سيخزن التغيير في قاعدة البيانات ويتجاوز السعر الافتراضي.'
                        : 'Editing price here stores the override in the database, overriding the default price.'}
                    </p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {allCourses.map(c => {
                      const effectivePrice = priceOverrides[c.id] ?? c.price;
                      const isOverridden = priceOverrides[c.id] !== undefined;
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl flex-shrink-0">
                            {c.icon || '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm truncate">{c.title}</div>
                            <div className="text-slate-400 text-xs">
                              {c.type === 'static' ? (lang === 'ar' ? 'ثابت' : 'Static') : (lang === 'ar' ? 'ديناميكي' : 'Dynamic')}
                              {isOverridden ? <span className="text-yellow-400 mr-2"> • {lang === 'ar' ? 'معدل' : 'Overridden'}</span> : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {editingPrice === c.id ? (
                              <div className="flex items-center gap-2">
                                <input type="number" min="0" value={priceInput}
                                  onChange={e => setPriceInput(e.target.value)}
                                  className="w-20 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                                <button onClick={async () => {
                                  const price = parseInt(priceInput);
                                  if (isNaN(price) || price < 0) return;
                                  setPriceSaving(true);
                                  await setCoursePrice(c.id, price, profile?.uid || '');
                                  await loadData();
                                  setPriceSaving(false);
                                  setEditingPrice(null);
                                }} disabled={priceSaving}
                                  className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 disabled:opacity-50">
                                  {priceSaving ? <Loader2 size={12} className="animate-spin" /> : (lang === 'ar' ? 'حفظ' : 'Save')}
                                </button>
                                <button onClick={() => setEditingPrice(null)}
                                  className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30">
                                  X
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="text-right">
                                  <div className={`font-bold ${isOverridden ? 'text-yellow-400' : 'text-white'}`}>{effectivePrice} EGP</div>
                                  {isOverridden && (
                                    <button onClick={async () => {
                                      setPriceSaving(true);
                                      await setCoursePrice(c.id, effectivePrice, profile?.uid || '');
                                      await removeCoursePrice(c.id);
                                      await loadData();
                                      setPriceSaving(false);
                                    }} className="text-xs text-red-400 hover:text-red-300 transition-all">
                                      {lang === 'ar' ? 'إعادة افتراضي' : 'Reset default'}
                                    </button>
                                  )}
                                </div>
                                <button onClick={() => { setEditingPrice(c.id); setPriceInput(String(effectivePrice)); }}
                                  className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                                  title={lang === 'ar' ? 'تعديل السعر' : 'Edit price'}>
                                  <Edit3 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Discount Codes */}
                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Tag size={18} className="text-green-400" />
                      {lang === 'ar' ? 'أكواد الخصم' : 'Discount Codes'}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                        placeholder={lang === 'ar' ? 'الكود...' : 'Code...'}
                        className="w-32 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500 transition-colors" />
                      <input type="number" min="1" max="100" value={newPercentage} onChange={e => setNewPercentage(e.target.value)}
                        placeholder={lang === 'ar' ? 'الخصم %' : 'Discount %'}
                        className="w-24 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500 transition-colors" />
                      <button onClick={async () => {
                        if (!newCode || !newPercentage) return;
                        const pct = parseInt(newPercentage);
                        if (isNaN(pct) || pct < 1 || pct > 100) return;
                        await createDiscountCode(newCode, pct);
                        setNewCode('');
                        setNewPercentage('');
                        const codes = await getAllDiscountCodes();
                        setDiscountCodes(codes);
                      }} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all">
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </button>
                    </div>
                    {discountCodes.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">{lang === 'ar' ? 'لا توجد أكواد خصم' : 'No discount codes'}</p>
                    ) : (
                      <div className="space-y-2">
                        {discountCodes.map(dc => (
                          <div key={dc.code} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                            <div>
                              <span className="text-white font-bold text-sm font-mono">{dc.code}</span>
                              <span className="mr-3 text-green-400 font-bold text-sm">{dc.percentage}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${dc.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {dc.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                              </span>
                              <button onClick={async () => {
                                await deleteDiscountCode(dc.code);
                                const codes = await getAllDiscountCodes();
                                setDiscountCodes(codes);
                              }} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                                <XCircle size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </>)}
              </div>
            )}

            {/* ── Settings Tab ── */}
            {tab === 'settings' && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-yellow-400" />
                    {lang === 'ar' ? 'إدارة الصلاحيات' : 'Role Management'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {lang === 'ar'
                      ? 'يمكنك إضافة أو إزالة صلاحيات المدير من أي مستخدم عبر زر التبديل في تبويب المستخدمين.'
                      : 'Toggle admin permissions for any user from the Users tab.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setTab('users')} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                      <Users size={16} />
                      {lang === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
                    </button>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-400" />
                    {lang === 'ar' ? 'إحصائيات المنصة' : 'Platform Statistics'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'متوسط الرصيد لكل مستخدم' : 'Avg balance per user'}</div>
                      <div className="text-white font-bold text-lg">{users.length > 0 ? (totalBalance / users.length).toFixed(0) : 0} EGP</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'متوسط XP لكل مستخدم' : 'Avg XP per user'}</div>
                      <div className="text-white font-bold text-lg">{users.length > 0 ? (totalXP / users.length).toFixed(0) : 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'نسبة المعاملات المكتملة' : 'Completion rate'}</div>
                      <div className="text-white font-bold text-lg">
                        {transactions.length > 0
                          ? `${((transactions.filter(tx => tx.status === 'completed').length / transactions.length) * 100).toFixed(1)}%`
                          : '0%'}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'متوسط الدخل لكل مستخدم' : 'Avg revenue per user'}</div>
                      <div className="text-white font-bold text-lg">{users.length > 0 ? (totalRevenue / users.length).toFixed(0) : 0} EGP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
