import { useRef, useCallback, createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import RoadmapPage from './pages/RoadmapPage';
import AchievementsPage from './pages/AchievementsPage';
import LessonPage from './pages/LessonPage';
import AuthPage from './pages/AuthPage';
import WalletPage from './pages/WalletPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import PlaygroundPage from './pages/PlaygroundPage';
import CertificatePage from './pages/CertificatePage';
import AboutPage from './pages/AboutPage';
import BackendCoursePage from './pages/BackendCoursePage';

const pageMap: Record<string, string> = {
  home: '/',
  courses: '/courses',
  roadmap: '/roadmap',
  achievements: '/achievements',
  auth: '/auth',
  wallet: '/wallet',
  payment: '/payment',
  playground: '/playground',
  profile: '/profile',
  about: '/about',
  'backend-course': '/backend-course',
  admin: '/admin',
};

const noHeaderPaths = ['/lesson', '/auth', '/payment', '/certificate', '/backend-course'];

type NavContextType = {
  selectedCourse: string;
  setSelectedCourse: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const NavContext = createContext<NavContextType | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

function NavProvider({ children }: { children: ReactNode }) {
  const [selectedCourse, setSelectedCourse] = useState('python');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <NavContext.Provider value={{ selectedCourse, setSelectedCourse, sidebarOpen, setSidebarOpen }}>{children}</NavContext.Provider>;
}

function makeNav(navigate: ReturnType<typeof useNavigate>, selectedCourse: string) {
  return (page: string, courseId?: string) => {
    if (page === 'lesson') { navigate(`/lesson/${courseId || selectedCourse}`); return; }
    if (page === 'certificate') { navigate(`/certificate/${courseId || selectedCourse}`); return; }
    const p = pageMap[page];
    if (p) navigate(p);
  };
}

function AppShell({ children, showHeader, setCurrentPage, pageName }: { children: ReactNode; showHeader?: boolean; setCurrentPage: (page: string, courseId?: string) => void; pageName: string }) {
  const { setSidebarOpen, sidebarOpen } = useNav();
  const { pathname } = useLocation();
  const h = showHeader !== undefined ? showHeader : !noHeaderPaths.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-slate-900">
      {h && (
        <>
          <Header currentPage={pageName} setCurrentPage={setCurrentPage} onMenuClick={() => setSidebarOpen(true)} />
          <Sidebar currentPage={pageName} setCurrentPage={setCurrentPage} open={sidebarOpen} setOpen={setSidebarOpen} />
        </>
      )}
      {children}
    </div>
  );
}

function RHome() { const n = useNavigate(); const { selectedCourse, setSelectedCourse } = useNav(); const sp = useCallback((p: string, cid?: string) => makeNav(n, selectedCourse)(p, cid), [n, selectedCourse]); return <AppShell setCurrentPage={sp} pageName="home"><HomePage setCurrentPage={sp} setSelectedCourse={setSelectedCourse} /></AppShell>; }
function RCourses() { const n = useNavigate(); const { selectedCourse, setSelectedCourse } = useNav(); const sp = useCallback((p: string, cid?: string) => makeNav(n, selectedCourse)(p, cid), [n, selectedCourse]); return <AppShell setCurrentPage={sp} pageName="courses"><CoursesPage setCurrentPage={sp} setSelectedCourse={setSelectedCourse} /></AppShell>; }
function RRoadmap() { const n = useNavigate(); const { selectedCourse, setSelectedCourse } = useNav(); const sp = useCallback((p: string, cid?: string) => makeNav(n, selectedCourse)(p, cid), [n, selectedCourse]); return <AppShell setCurrentPage={sp} pageName="roadmap"><RoadmapPage setCurrentPage={sp} setSelectedCourse={setSelectedCourse} /></AppShell>; }
function RAchievements() { const n = useNavigate(); const { selectedCourse, setSelectedCourse } = useNav(); const sp = useCallback((p: string, cid?: string) => makeNav(n, selectedCourse)(p, cid), [n, selectedCourse]); return <AppShell setCurrentPage={sp} pageName="achievements"><AchievementsPage setCurrentPage={sp} setSelectedCourse={setSelectedCourse} /></AppShell>; }
function RAuth() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell showHeader={false} setCurrentPage={sp} pageName="auth"><AuthPage setCurrentPage={sp} /></AppShell>; }
function RWallet() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell setCurrentPage={sp} pageName="wallet"><WalletPage setCurrentPage={sp} /></AppShell>; }
function RPayment() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell showHeader={false} setCurrentPage={sp} pageName="payment"><PaymentPage setCurrentPage={sp} /></AppShell>; }
function RPlayground() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell setCurrentPage={sp} pageName="playground"><PlaygroundPage /></AppShell>; }
function RProfile() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell setCurrentPage={sp} pageName="profile"><ProfilePage /></AppShell>; }
function RAbout() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell setCurrentPage={sp} pageName="about"><AboutPage setCurrentPage={sp} /></AppShell>; }
function RAdmin() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell setCurrentPage={sp} pageName="admin"><AdminDashboard setCurrentPage={sp} /></AppShell>; }
function RBackend() { const n = useNavigate(); const sp = useCallback((p: string) => makeNav(n, '')(p), [n]); return <AppShell showHeader={false} setCurrentPage={sp} pageName="backend-course"><BackendCoursePage setCurrentPage={sp} /></AppShell>; }

function LessonRoute() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const sp = useCallback((page: string, id?: string) => makeNav(navigate, courseId || 'python')(page, id), [navigate, courseId]);
  return <div className="min-h-screen bg-slate-900"><LessonPage selectedCourse={courseId || 'python'} setCurrentPage={sp} /></div>;
}

function CertRoute() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const sp = useCallback((page: string, id?: string) => makeNav(navigate, courseId || 'python')(page, id), [navigate, courseId]);
  return <div className="min-h-screen bg-slate-900"><CertificatePage courseId={courseId || 'python'} setCurrentPage={sp} /></div>;
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const prevUserRef = useRef(user);

  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;
    if (!loading && !user && prev) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<RAuth />} />
        <Route path="/about" element={<RAbout />} />
        <Route path="/" element={<RHome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<RAdmin />} />
        <Route path="/backend-course" element={<RBackend />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RHome />} />
      <Route path="/courses" element={<RCourses />} />
      <Route path="/roadmap" element={<RRoadmap />} />
      <Route path="/achievements" element={<RAchievements />} />
      <Route path="/auth" element={<RAuth />} />
      <Route path="/wallet" element={<RWallet />} />
      <Route path="/payment" element={<RPayment />} />
      <Route path="/playground" element={<RPlayground />} />
      <Route path="/profile" element={<RProfile />} />
      <Route path="/about" element={<RAbout />} />
      <Route path="/lesson/:courseId" element={<LessonRoute />} />
      <Route path="/certificate/:courseId" element={<CertRoute />} />
      <Route path="/backend-course" element={<RBackend />} />
      <Route path="/admin" element={<RAdmin />} />
      <Route path="*" element={<Navigate to="/courses" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <NavProvider>
            <AppRoutes />
          </NavProvider>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
