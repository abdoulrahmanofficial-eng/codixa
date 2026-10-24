import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, Transaction, AppNotification } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { getDynamicCourses, updateCoursePrice as updateDynamicPrice, type BackendCourse } from '../lib/courseService';
import { setCoursePrice, getAllPriceOverrides, removeCoursePrice } from '../lib/priceService';
import { courses as staticCourses } from '../data/courses';
import { ref, get, set, onChildAdded, off } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { subscribeToPush, showBrowserNotification } from '../lib/fcm';
import {
  Users, ShoppingCart, CheckCircle, TrendingUp, Loader2, ArrowLeft,
  Search, Shield, ShieldOff, UserCog, Activity, CreditCard, BookOpen, Star, DollarSign,
  Calendar, Filter, RefreshCw, ChevronDown, ChevronUp, Plus, Minus, Edit3, Tag,
  Bell, Send, XCircle
} from 'lucide-react';
import StatCard from '../components/admin/StatCard';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminAdmins from '../components/admin/AdminAdmins';
import AdminTransactions from '../components/admin/AdminTransactions';
import AdminCourses from '../components/admin/AdminCourses';
import AdminSettings from '../components/admin/AdminSettings';
import AdminNotifications from '../components/admin/AdminNotifications';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

type AdminTab = 'overview' | 'users' | 'admins' | 'transactions' | 'courses' | 'settings' | 'notifications';

export default function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const { t, lang } = useI18n();
  const { isAdmin, profile, getAllUsers, getAllTransactions, approveDeposit, rejectDeposit, setAdminRole, addUserBalance, deductUserBalance, transferBalance, createDiscountCode, getAllDiscountCodes, deleteDiscountCode, deleteUser, createNotification, getNotifications, markNotificationRead, deleteNotification, sendUserNotification } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [discountCodes, setDiscountCodes] = useState<{ code: string; percentage: number; createdAt: number; active: boolean }[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<BackendCourse[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; userName: string; amount: number } | null>(null);
  const pendingNotified = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAdmin) return;
    const pendingRef = ref(rtdb, 'pending-deposits');
    get(pendingRef).then((snap) => {
      if (snap.exists()) Object.keys(snap.val()).forEach((key) => pendingNotified.current.add(key));
    });
    const handler = onChildAdded(pendingRef, (snap) => {
      const key = snap.key;
      if (!key || pendingNotified.current.has(key)) return;
      pendingNotified.current.add(key);
      const data = snap.val();
      if (data?.userName && data?.amount) {
        setToast({ message: lang === 'ar' ? 'طلب شحن جديد' : 'New deposit request', userName: data.userName, amount: data.amount });
        setTimeout(() => setToast(null), 6000);
        showBrowserNotification(lang === 'ar' ? '💰 طلب شحن جديد' : '💰 New Deposit', `${data.userName} — ${data.amount} EGP`);
      }
    });
    return () => off(pendingRef, 'child_added', handler);
  }, [isAdmin, lang]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
    const uid = profile?.uid;
    if (uid) subscribeToPush(uid);
  }, [isAdmin, profile?.uid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allTx, courses, overrides, codes, notifs] = await Promise.all([
        getAllUsers(), getAllTransactions(), getDynamicCourses(), getAllPriceOverrides(), getAllDiscountCodes(), getNotifications()
      ]);
      setUsers(allUsers);
      setTransactions(allTx);
      setDynamicCourses(courses);
      setPriceOverrides(overrides);
      setDiscountCodes(codes);
      setNotifications(notifs);
      const maintSnap = await get(ref(rtdb, 'config/maintenance'));
      setMaintenanceMode(maintSnap.exists() ? maintSnap.val().enabled : false);
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

  const handleAddBalance = async (uid: string, amount: number) => {
    if (!uid || !amount || amount <= 0) return;
    setActionLoading(`balance-${uid}`);
    await addUserBalance(uid, amount);
    await loadData();
    setActionLoading(null);
  };

  const handleDeductBalance = async (uid: string, amount: number) => {
    if (!uid || !amount || amount <= 0) return;
    setActionLoading(`deduct-${uid}`);
    await deductUserBalance(uid, amount);
    await loadData();
    setActionLoading(null);
  };

  const handleTransferBalance = async (fromUid: string, toUid: string, amount: number) => {
    if (!fromUid || !toUid || !amount || amount <= 0 || fromUid === toUid) return;
    setActionLoading(`transfer-${fromUid}`);
    await transferBalance(fromUid, toUid, amount);
    await loadData();
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من حذف المستخدم "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه.`
      : `Are you sure you want to delete user "${userName}"? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(`delete-${userId}`);
    try {
      await deleteUser(userId);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error deleting user');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleMaintenance = async () => {
    setMaintenanceSaving(true);
    const newVal = !maintenanceMode;
    await set(ref(rtdb, 'config/maintenance'), { enabled: newVal });
    setMaintenanceMode(newVal);
    setMaintenanceSaving(false);
  };

  const pendingTx = useMemo(() => transactions.filter(tx => tx.status === 'pending'), [transactions]);
  const regularUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);
  const totalBalance = useMemo(() => regularUsers.reduce((sum, u) => sum + (u.wallet?.balance || 0), 0), [regularUsers]);
  const totalRevenue = useMemo(() =>
    transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0), [transactions]);
  const totalXP = useMemo(() => regularUsers.reduce((sum, u) => sum + (u.xp || 0), 0), [regularUsers]);
  const totalPurchases = useMemo(() =>
    transactions.filter(tx => tx.type === 'purchase' && tx.status === 'completed').length, [transactions]);
  const adminCount = useMemo(() => users.filter(u => u.isAdmin).length, [users]);
  const coursesSold = useMemo(() =>
    regularUsers.reduce((sum, u) => sum + (u.purchasedCourses?.filter(c => c !== 'scratch').length || 0), 0), [regularUsers]);

  const getUserName = (userId: string) => users.find(u => u.uid === userId)?.name || 'Unknown';

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
    { id: 'users', label: lang === 'ar' ? 'المستخدمين' : 'Users', icon: <Users size={16} />, badge: regularUsers.length },
    { id: 'admins', label: lang === 'ar' ? 'المدراء' : 'Admins', icon: <Shield size={16} />, badge: adminCount },
    { id: 'transactions', label: lang === 'ar' ? 'المعاملات' : 'Transactions', icon: <CreditCard size={16} />, badge: pendingTx.length },
    { id: 'courses', label: lang === 'ar' ? 'الكورسات' : 'Courses', icon: <BookOpen size={16} /> },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: <UserCog size={16} /> },
    { id: 'notifications', label: lang === 'ar' ? 'الإشعارات' : 'Notifications', icon: <Bell size={16} /> },
  ];

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

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-[100] animate-slide-in cursor-pointer" onClick={() => { setToast(null); setTab('transactions'); }}>
            <div className="glass rounded-2xl p-4 border border-green-500/30 shadow-lg shadow-green-500/10 flex items-center gap-3 min-w-[280px]">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 animate-pulse">
                <DollarSign size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">{toast.message}</div>
                <div className="text-slate-300 text-xs truncate">{toast.userName} — {toast.amount} EGP</div>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}

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
            {tab === 'overview' && (
              <AdminOverview
                pendingTx={pendingTx}
                totalBalance={totalBalance}
                totalRevenue={totalRevenue}
                totalXP={totalXP}
                totalPurchases={totalPurchases}
                regularUsers={regularUsers}
                staticCount={staticCourses.length}
                dynamicCount={dynamicCourses.length}
                coursesSold={coursesSold}
                getUserName={getUserName}
                handleApprove={handleApprove}
                handleReject={handleReject}
                actionLoading={actionLoading}
                lang={lang}
                setTab={setTab}
              />
            )}

            {tab === 'users' && (
              <AdminUsers
                users={users}
                transactions={transactions}
                currentAdminUid={profile?.uid}
                handleToggleAdmin={handleToggleAdmin}
                handleAddBalance={handleAddBalance}
                handleDeductBalance={handleDeductBalance}
                handleTransferBalance={handleTransferBalance}
                handleDeleteUser={handleDeleteUser}
                sendUserNotification={sendUserNotification}
                actionLoading={actionLoading}
                lang={lang}
              />
            )}

            {tab === 'admins' && (
              <AdminAdmins
                users={users}
                currentAdminUid={profile?.uid}
                setAdminRole={setAdminRole}
                loadData={loadData}
                actionLoading={actionLoading}
                setActionLoading={setActionLoading}
                lang={lang}
              />
            )}

            {tab === 'transactions' && (
              <AdminTransactions
                transactions={transactions}
                getUserName={getUserName}
                handleApprove={handleApprove}
                handleReject={handleReject}
                actionLoading={actionLoading}
                lang={lang}
              />
            )}

            {tab === 'courses' && (
              <AdminCourses
                dynamicCourses={dynamicCourses}
                priceOverrides={priceOverrides}
                discountCodes={discountCodes}
                profileUid={profile?.uid}
                setCoursePrice={setCoursePrice}
                removeCoursePrice={removeCoursePrice}
                createDiscountCode={createDiscountCode}
                deleteDiscountCode={deleteDiscountCode}
                getAllDiscountCodes={getAllDiscountCodes}
                loadData={loadData}
                loading={loading}
                lang={lang}
              />
            )}

            {tab === 'settings' && (
              <AdminSettings
                lang={lang}
                setTab={setTab}
                maintenanceMode={maintenanceMode}
                maintenanceSaving={maintenanceSaving}
                toggleMaintenance={toggleMaintenance}
                totalBalance={totalBalance}
                totalRevenue={totalRevenue}
                totalXP={totalXP}
                regularUsers={regularUsers}
                transactions={transactions}
              />
            )}

            {tab === 'notifications' && (
              <AdminNotifications
                notifications={notifications}
                createNotification={createNotification}
                deleteNotification={deleteNotification}
                getNotifications={getNotifications}
                setNotifications={setNotifications}
                lang={lang}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
