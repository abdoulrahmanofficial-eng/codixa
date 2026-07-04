import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  User,
} from 'firebase/auth';
import { ref, get, set, update, push, child } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';
import { courses } from '../data/courses';

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'purchase';
  amount: number;
  date: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  paymentCode?: string;
  courseId?: string;
  userId?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: number;
  purchasedCourses: string[];
  completedLessons: string[];
  completedCourses?: Record<string, number>;
  xp: number;
  level: number;
  wallet: WalletData;
  isAdmin?: boolean;
  avatar?: string;
  lastCourse?: string;
  lastLesson?: Record<string, string>; // { courseId: lessonId }
  readNotifications?: Record<string, boolean>;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  purchaseCourse: (courseId: string, price: number) => Promise<boolean>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Promise<string | null>;
  approveDeposit: (userId: string, txId: string) => Promise<void>;
  rejectDeposit: (userId: string, txId: string) => Promise<void>;
  getAllUsers: () => Promise<UserProfile[]>;
  findUserByEmail: (email: string) => Promise<{ uid: string; name: string } | null>;
  getAllTransactions: () => Promise<Transaction[]>;
  setAdminRole: (userId: string, isAdmin: boolean) => Promise<void>;
  addUserBalance: (userId: string, amount: number) => Promise<void>;
  deductUserBalance: (userId: string, amount: number) => Promise<void>;
  transferBalance: (fromUserId: string, toUserId: string, amount: number) => Promise<void>;
  createDiscountCode: (code: string, percentage: number) => Promise<void>;
  getAllDiscountCodes: () => Promise<{ code: string; percentage: number; createdAt: number; active: boolean }[]>;
  deleteDiscountCode: (code: string) => Promise<void>;
  validateDiscountCode: (code: string) => Promise<{ valid: boolean; percentage: number }>;
  updateProfileData: (data: { name?: string; avatar?: string }) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  setLastCourse: (courseId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (oobCode: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  createNotification: (title: string, body: string) => Promise<void>;
  getNotifications: () => Promise<AppNotification[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  purchaseCourse: async () => false,
  addTransaction: async () => null,
  approveDeposit: async () => {},
  rejectDeposit: async () => {},
  getAllUsers: async () => [],
  findUserByEmail: async () => null,
  getAllTransactions: async () => [],
  setAdminRole: async () => {},
  addUserBalance: async () => {},
  deductUserBalance: async () => {},
  transferBalance: async () => {},
  createDiscountCode: async () => {},
  getAllDiscountCodes: async () => [],
  deleteDiscountCode: async () => {},
  validateDiscountCode: async () => ({ valid: false, percentage: 0 }),
  updateProfileData: async () => {},
  completeLesson: async () => {},
  setLastCourse: async () => {},
  setLastLesson: async () => {},
  resetPassword: async () => {},
  sendVerificationEmail: async () => {},
  verifyEmail: async () => {},
  deleteUser: async () => {},
  createNotification: async () => {},
  getNotifications: async () => [],
  markNotificationRead: async () => {},
  deleteNotification: async () => {},
  isAdmin: false,
});

function createDefaultProfile(uid: string, name: string, email: string): UserProfile {
  return {
    uid,
    name,
    email,
    createdAt: Date.now(),
    purchasedCourses: ['scratch'],
    completedLessons: [],
    xp: 0,
    level: 1,
    wallet: { balance: 0, transactions: [] },
  };
}

function rtdbToArray(data: Record<string, any> | null | undefined): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.keys(data).map(k => ({ ...data[k], id: k }));
}

function arrayToRtdb(arr: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  arr.forEach((item, index) => {
    result[index] = { ...item };
    delete result[index].id;
  });
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.isAdmin === true;

  const fetchProfile = async (uid: string) => {
    try {
      const snap = await get(ref(rtdb, `users/${uid}`));
      if (snap.exists()) {
        const data = snap.val();
        const purchasedCourses = data.purchasedCourses
          ? (Array.isArray(data.purchasedCourses) ? data.purchasedCourses : Object.keys(data.purchasedCourses))
          : ['scratch'];
        const completedLessons = data.completedLessons
          ? (Array.isArray(data.completedLessons) ? data.completedLessons : Object.keys(data.completedLessons))
          : [];
        const transactions = data.wallet?.transactions
          ? rtdbToArray(data.wallet.transactions)
          : [];
        setProfile({
          ...data,
          uid,
          purchasedCourses,
          completedLessons,
          wallet: {
            balance: data.wallet?.balance || 0,
            transactions,
          },
        });
        return true;
      }
    } catch (e) {
      console.warn('RTDB fetch failed, using local profile:', e);
    }
    return false;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let nullTimeout: number | undefined;
    let isInitialCheck = true;
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (cancelled) return;
      if (nullTimeout) { clearTimeout(nullTimeout); nullTimeout = undefined; }
      setUser(firebaseUser);
      if (firebaseUser) {
        isInitialCheck = false;
        fetchProfile(firebaseUser.uid).then(found => {
          if (cancelled) return;
          if (!found) {
            const newProfile = createDefaultProfile(
              firebaseUser.uid,
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              firebaseUser.email || ''
            );
            setProfile(newProfile);
            set(ref(rtdb, `users/${firebaseUser.uid}`), {
              name: newProfile.name,
              email: newProfile.email,
              createdAt: newProfile.createdAt,
              purchasedCourses: arrayToRtdb(newProfile.purchasedCourses),
              wallet: { balance: 0 },
              xp: 0,
              level: 1,
            }).catch(() => {});
          }
          setLoading(false);
        }).catch(() => {
          if (cancelled) return;
          setProfile(null);
          setLoading(false);
        });
      } else {
        if (isInitialCheck) {
          isInitialCheck = false;
          nullTimeout = window.setTimeout(() => {
            if (cancelled) return;
            setProfile(null);
            setLoading(false);
          }, 300);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });
    return () => { cancelled = true; if (nullTimeout) clearTimeout(nullTimeout); unsub(); };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const newProfile = createDefaultProfile(cred.user.uid, name, email);
    await set(ref(rtdb, `users/${cred.user.uid}`), {
      name: newProfile.name,
      email: newProfile.email,
      createdAt: newProfile.createdAt,
      purchasedCourses: arrayToRtdb(newProfile.purchasedCourses),
      completedLessons: [],
      xp: 0,
      level: 1,
      wallet: { balance: 0, transactions: {} },
    });
    setProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPasswordFn = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmailFn = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const verifyEmailFn = async (oobCode: string) => {
    await applyActionCode(auth, oobCode);
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date'>): Promise<string | null> => {
    if (!user) return null;
    const txRef = push(ref(rtdb, `users/${user.uid}/wallet/transactions`));
    const txId = txRef.key!;
    await set(txRef, {
      ...tx,
      date: Date.now(),
    });
    await refreshProfile();
    return txId;
  };

  const approveDeposit = async (userId: string, txId: string) => {
    const snap = await get(ref(rtdb, `users/${userId}`));
    if (!snap.exists()) return;
    const data = snap.val();
    const transactions = rtdbToArray(data.wallet?.transactions);
    const txIndex = transactions.findIndex((t: any) => t.id === txId);
    if (txIndex === -1) return;
    const amount = transactions[txIndex].amount;
    await update(ref(rtdb, `users/${userId}`), {
      [`wallet/transactions/${txId}/status`]: 'completed',
      ['wallet/balance']: (data.wallet?.balance || 0) + amount,
    });
  };

  const rejectDeposit = async (userId: string, txId: string) => {
    const snap = await get(ref(rtdb, `users/${userId}`));
    if (!snap.exists()) return;
    await update(ref(rtdb, `users/${userId}`), {
      [`wallet/transactions/${txId}/status`]: 'failed',
    });
  };

  const findUserByEmail = async (query: string): Promise<{ uid: string; name: string } | null> => {
    const snap = await get(ref(rtdb, 'users'));
    if (!snap.exists()) return null;
    const data = snap.val();
    const q = query.toLowerCase().trim();
    for (const uid of Object.keys(data)) {
      const name = (data[uid].name || '').toLowerCase();
      const email = (data[uid].email || '').toLowerCase();
      if (email === q || name === q) {
        return { uid, name: data[uid].name || email };
      }
    }
    return null;
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    const snap = await get(ref(rtdb, 'users'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.keys(data).map(uid => {
      const d = data[uid];
      const purchasedCourses = d.purchasedCourses
        ? (Array.isArray(d.purchasedCourses) ? d.purchasedCourses : Object.keys(d.purchasedCourses))
        : [];
      const completedLessons = d.completedLessons
        ? (Array.isArray(d.completedLessons) ? d.completedLessons : Object.keys(d.completedLessons))
        : [];
      const transactions = d.wallet?.transactions
        ? rtdbToArray(d.wallet.transactions)
        : [];
      return {
        ...d,
        uid,
        purchasedCourses,
        completedLessons,
        wallet: {
          balance: d.wallet?.balance || 0,
          transactions,
        },
      } as UserProfile;
    });
  };

  const getAllTransactions = async (): Promise<Transaction[]> => {
    const users = await getAllUsers();
    const allTxs: Transaction[] = [];
    users.forEach(u => {
      (u.wallet?.transactions || []).forEach((tx: Transaction) => {
        allTxs.push({ ...tx, userId: u.uid });
      });
    });
    return allTxs.sort((a, b) => b.date - a.date);
  };

  const setAdminRole = async (userId: string, admin: boolean) => {
    if (!isAdmin) return;
    await set(ref(rtdb, `users/${userId}/isAdmin`), admin);
  };

  const addUserBalance = async (userId: string, amount: number) => {
    if (!isAdmin) return;
    const snap = await get(ref(rtdb, `users/${userId}`));
    if (!snap.exists()) return;
    const data = snap.val();
    const txRef = push(ref(rtdb, `users/${userId}/wallet/transactions`));
    await set(txRef, {
      type: 'deposit',
      amount,
      date: Date.now(),
      status: 'completed',
      description: 'تمت الإضافة بواسطة المدير',
    });
    await update(ref(rtdb, `users/${userId}`), {
      ['wallet/balance']: (data.wallet?.balance || 0) + amount,
    });
  };

  const deductUserBalance = async (userId: string, amount: number) => {
    if (!isAdmin) return;
    const snap = await get(ref(rtdb, `users/${userId}`));
    if (!snap.exists()) return;
    const data = snap.val();
    const currentBalance = data.wallet?.balance || 0;
    const newBalance = Math.max(0, currentBalance - amount);
    const txRef = push(ref(rtdb, `users/${userId}/wallet/transactions`));
    await set(txRef, {
      type: 'purchase',
      amount,
      date: Date.now(),
      status: 'completed',
      description: 'تم الخصم بواسطة المدير',
    });
    await update(ref(rtdb, `users/${userId}`), {
      ['wallet/balance']: newBalance,
    });
  };

  const transferBalance = async (fromUserId: string, toUserId: string, amount: number) => {
    if (!isAdmin && fromUserId !== user?.uid) return;
    if (amount <= 0) return;
    const [fromSnap, toSnap] = await Promise.all([
      get(ref(rtdb, `users/${fromUserId}`)),
      get(ref(rtdb, `users/${toUserId}`)),
    ]);
    if (!fromSnap.exists() || !toSnap.exists()) return;
    const fromData = fromSnap.val();
    const toData = toSnap.val();
    const fromBalance = fromData.wallet?.balance || 0;
    if (amount > fromBalance) throw new Error('Insufficient balance');
    const fromTxRef = push(ref(rtdb, `users/${fromUserId}/wallet/transactions`));
    await set(fromTxRef, {
      type: 'transfer_out',
      amount,
      date: Date.now(),
      status: 'completed',
      description: `تحويل إلى ${toData.name || toUserId}`,
    });
    const toTxRef = push(ref(rtdb, `users/${toUserId}/wallet/transactions`));
    await set(toTxRef, {
      type: 'transfer_in',
      amount,
      date: Date.now(),
      status: 'completed',
      description: `تحويل من ${fromData.name || fromUserId}`,
    });
    await Promise.all([
      update(ref(rtdb, `users/${fromUserId}`), { ['wallet/balance']: fromBalance - amount }),
      update(ref(rtdb, `users/${toUserId}`), { ['wallet/balance']: (toData.wallet?.balance || 0) + amount }),
    ]);
    // Create notification for recipient
    const notifRef = push(ref(rtdb, 'notifications'));
    await set(notifRef, {
      title: '💰 تحويل وارِد / Transfer Received',
      body: `تم استلام ${amount} EGP من ${fromData.name || fromUserId} — Received ${amount} EGP from ${fromData.name || fromUserId}`,
      createdAt: Date.now(),
    });
  };

  const deleteUserFn = async (userId: string) => {
    if (!isAdmin) throw new Error('Admin only');
    await set(ref(rtdb, `users/${userId}`), null);
  };

  const createNotificationFn = async (title: string, body: string) => {
    if (!isAdmin) throw new Error('Admin only');
    const notifRef = push(ref(rtdb, 'notifications'));
    await set(notifRef, { title, body, createdAt: Date.now() });
  };

  const getNotificationsFn = async (): Promise<AppNotification[]> => {
    const snap = await get(ref(rtdb, 'notifications'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.entries(data)
      .map(([id, val]: any) => ({ id, ...val }))
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const markNotificationReadFn = async (notificationId: string) => {
    if (!user) return;
    await update(ref(rtdb, `users/${user.uid}/readNotifications`), { [notificationId]: true });
  };

  const deleteNotificationFn = async (notificationId: string) => {
    if (!isAdmin) throw new Error('Admin only');
    await set(ref(rtdb, `notifications/${notificationId}`), null);
  };

  const createDiscountCode = async (code: string, percentage: number) => {
    if (!isAdmin) return;
    await set(ref(rtdb, `discount-codes/${code.toUpperCase()}`), {
      code: code.toUpperCase(),
      percentage,
      createdAt: Date.now(),
      active: true,
    });
  };

  const getAllDiscountCodes = async (): Promise<{ code: string; percentage: number; createdAt: number; active: boolean }[]> => {
    const snap = await get(ref(rtdb, 'discount-codes'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.keys(data).map(k => data[k]);
  };

  const deleteDiscountCode = async (code: string) => {
    if (!isAdmin) return;
    await set(ref(rtdb, `discount-codes/${code.toUpperCase()}`), null);
  };

  const validateDiscountCode = async (code: string): Promise<{ valid: boolean; percentage: number }> => {
    const snap = await get(ref(rtdb, `discount-codes/${code.toUpperCase()}`));
    if (!snap.exists()) return { valid: false, percentage: 0 };
    const data = snap.val();
    if (!data.active) return { valid: false, percentage: 0 };
    return { valid: true, percentage: data.percentage };
  };

  const purchaseCourse = async (courseId: string, price: number): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.wallet.balance < price) return false;
    if (profile.purchasedCourses.includes(courseId)) return true;

    const userRef = ref(rtdb, `users/${user.uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) return false;
    const data = snap.val();
    const purchasedObj = data.purchasedCourses ? { ...data.purchasedCourses } : {};
    purchasedObj[courseId] = true;

    const txRef = push(ref(rtdb, `users/${user.uid}/wallet/transactions`));
    await set(txRef, {
      type: 'purchase',
      amount: price,
      date: Date.now(),
      status: 'completed',
      description: `شراء كورس ${courseId}`,
      courseId,
    });

    await update(userRef, {
      purchasedCourses: purchasedObj,
      ['wallet/balance']: (data.wallet?.balance || 0) - price,
    });

    await refreshProfile();
    return true;
  };

  const updateProfileData = async (data: { name?: string; avatar?: string }) => {
    if (!user) return;
    const updates: Record<string, any> = {};
    if (data.name !== undefined) {
      updates.name = data.name;
      await updateProfile(user, { displayName: data.name });
    }
    if (data.avatar !== undefined) {
      updates.avatar = data.avatar;
    }
    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb, `users/${user.uid}`), updates);
      await refreshProfile();
    }
  };

  const XP_PER_LESSON = 10;

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) return;
    const data = snap.val();

    const completedObj = data.completedLessons ? { ...data.completedLessons } : {};
    if (completedObj[lessonId]) return;

    completedObj[lessonId] = true;
    const newXP = (data.xp || 0) + XP_PER_LESSON;
    const newLevel = Math.floor(newXP / 500) + 1;

    // Check if any course is fully completed
    const completedCourses = data.completedCourses ? { ...data.completedCourses } : {};
    for (const c of courses) {
      if (completedCourses[c.id]) continue;
      const allLessonIds = c.chapters.flatMap(ch => ch.lessons.map(l => l.id));
      const allDone = allLessonIds.every(id => completedObj[id]);
      if (allDone) {
        completedCourses[c.id] = Date.now();
      }
    }
    // Check backend engineering course (48 lessons: be-l1 to be-l48)
    if (!completedCourses['backend-engineering']) {
      const beAllDone = Array.from({ length: 48 }, (_, i) => `be-l${i + 1}`).every(id => completedObj[id]);
      if (beAllDone) {
        completedCourses['backend-engineering'] = Date.now();
      }
    }

    const updates: Record<string, any> = {
      completedLessons: completedObj,
      xp: newXP,
      level: newLevel,
    };
    if (Object.keys(completedCourses).length > 0) {
      updates.completedCourses = completedCourses;
    }

    await update(userRef, updates);
    await refreshProfile();
  };

  // حفظ آخر كورس فتحه المستخدم عشان يرجعله بعد الريفريش
  const setLastCourse = async (courseId: string) => {
    if (!user) return;
    if (profile?.lastCourse === courseId) return; // تجنّب الكتابة الزائدة
    try {
      await update(ref(rtdb, `users/${user.uid}`), { lastCourse: courseId });
      await refreshProfile();
    } catch (e) {
      console.warn('Failed to save lastCourse:', e);
    }
  };

  // حفظ آخر درس فتحه المستخدم في كورس معين
  const setLastLesson = async (courseId: string, lessonId: string) => {
    if (!user) return;
    if (profile?.lastLesson?.[courseId] === lessonId) return; // تجنّب الكتابة الزائدة
    try {
      const updates: Record<string, any> = {
        lastLesson: { ...(profile?.lastLesson || {}), [courseId]: lessonId }
      };
      await update(ref(rtdb, `users/${user.uid}`), updates);
      await refreshProfile();
    } catch (e) {
      console.warn('Failed to save lastLesson:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      purchaseCourse,
      completeLesson,
      setLastCourse,
      setLastLesson,
      resetPassword: resetPasswordFn,
      sendVerificationEmail: sendVerificationEmailFn,
      verifyEmail: verifyEmailFn,
      addTransaction,
      approveDeposit,
      rejectDeposit,
      getAllUsers,
      findUserByEmail,
      getAllTransactions,
      setAdminRole,
      addUserBalance,
      deductUserBalance,
      transferBalance,
      deleteUser: deleteUserFn,
      createNotification: createNotificationFn,
      getNotifications: getNotificationsFn,
      markNotificationRead: markNotificationReadFn,
      deleteNotification: deleteNotificationFn,
      createDiscountCode,
      getAllDiscountCodes,
      deleteDiscountCode,
      validateDiscountCode,
      updateProfileData,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
