import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
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
  getAllTransactions: () => Promise<Transaction[]>;
  setAdminRole: (userId: string, isAdmin: boolean) => Promise<void>;
  addUserBalance: (userId: string, amount: number) => Promise<void>;
  updateProfileData: (data: { name?: string; avatar?: string }) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  setLastCourse: (courseId: string) => Promise<void>;
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
  getAllTransactions: async () => [],
  setAdminRole: async () => {},
  addUserBalance: async () => {},
  updateProfileData: async () => {},
  completeLesson: async () => {},
  setLastCourse: async () => {},
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
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          createdAt: Date.now(),
          purchasedCourses: ['scratch'],
          completedLessons: [],
          xp: 0,
          level: 1,
          wallet: { balance: 0, transactions: [] },
        });
        // Load full profile from RTDB asynchronously (don't block UI)
        fetchProfile(firebaseUser.uid).catch(() => {});
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
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
      addTransaction,
      approveDeposit,
      rejectDeposit,
      getAllUsers,
      getAllTransactions,
      setAdminRole,
      addUserBalance,
      updateProfileData,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
