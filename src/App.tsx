import { useState, useRef, createContext, useContext, useEffect, ReactNode } from 'react';
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
  setCurrentPage: (page: string, courseId?: string) => void;
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
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourseState] = useState('python');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedCourseRef = useRef('python');

  const setSelectedCourse = (id: string) => {
    selectedCourseRef.current = id;
    setSelectedCourseState(id);
  };

  const setCurrentPage = (page: string, courseId?: string) => {
    if (page === 'lesson') { navigate(`/lesson/${courseId || selectedCourseRef.current}`); return; }
    if (page === 'certificate') { navigate(`/certificate/${courseId || selectedCourseRef.current}`); return; }
    const path = pageMap[page];
    if (path) navigate(path);
  };

  return <NavContext.Provider value={{ setCurrentPage, selectedCourse, setSelectedCourse, sidebarOpen, setSidebarOpen }}>{children}</NavContext.Provider>;
}

function AppShell({ children, showHeader }: { children: ReactNode; showHeader?: boolean }) {
  const { setCurrentPage, setSidebarOpen, sidebarOpen } = useNav();
  const { pathname } = useLocation();
  const h = showHeader !== undefined ? showHeader : !noHeaderPaths.some(p => pathname.startsWith(p));
  const pageName = Object.entries(pageMap).find(([, v]) => v === pathname)?.[0] || 'home';

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

function LessonRoute() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const setCurrentPage = (page: string, id?: string) => {
    if (page === 'lesson') { navigate(`/lesson/${id || courseId}`); return; }
    if (page === 'certificate') { navigate(`/certificate/${id || courseId}`); return; }
    const path = pageMap[page];
    if (path) navigate(path);
  };
  return <div className="min-h-screen bg-slate-900"><LessonPage selectedCourse={courseId || 'python'} setCurrentPage={setCurrentPage} /></div>;
}

function CertRoute() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const setCurrentPage = (page: string, id?: string) => {
    if (page === 'lesson') { navigate(`/lesson/${id || courseId}`); return; }
    if (page === 'certificate') { navigate(`/certificate/${id || courseId}`); return; }
    const path = pageMap[page];
    if (path) navigate(path);
  };
  return <div className="min-h-screen bg-slate-900"><CertificatePage courseId={courseId || 'python'} setCurrentPage={setCurrentPage} /></div>;
}

// Route wrapper components - each creates nav functions from context and renders the actual page
function RHome() { const n = useNav(); return <AppShell><HomePage setCurrentPage={n.setCurrentPage} setSelectedCourse={n.setSelectedCourse} /></AppShell>; }
function RCourses() { const n = useNav(); return <AppShell><CoursesPage setCurrentPage={n.setCurrentPage} setSelectedCourse={n.setSelectedCourse} /></AppShell>; }
function RRoadmap() { const n = useNav(); return <AppShell><RoadmapPage setCurrentPage={n.setCurrentPage} setSelectedCourse={n.setSelectedCourse} /></AppShell>; }
function RAchievements() { const n = useNav(); return <AppShell><AchievementsPage setCurrentPage={n.setCurrentPage} setSelectedCourse={n.setSelectedCourse} /></AppShell>; }
function RAuth() { const n = useNav(); return <AppShell showHeader={false}><AuthPage setCurrentPage={n.setCurrentPage} /></AppShell>; }
function RWallet() { const n = useNav(); return <AppShell><WalletPage setCurrentPage={n.setCurrentPage} /></AppShell>; }
function RPayment() { const n = useNav(); return <AppShell showHeader={false}><PaymentPage setCurrentPage={n.setCurrentPage} /></AppShell>; }
function RPlayground() { return <AppShell><PlaygroundPage /></AppShell>; }
function RProfile() { return <AppShell><ProfilePage /></AppShell>; }
function RAbout() { const n = useNav(); return <AppShell><AboutPage setCurrentPage={n.setCurrentPage} /></AppShell>; }
function RAdmin() { const n = useNav(); return <AppShell><AdminDashboard setCurrentPage={n.setCurrentPage} /></AppShell>; }
function RBackend() { const n = useNav(); return <AppShell showHeader={false}><BackendCoursePage setCurrentPage={n.setCurrentPage} /></AppShell>; }

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
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
