import { useState, useEffect } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('python');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && currentPage === null) {
      setCurrentPage(isAdmin ? 'admin' : user ? 'courses' : 'home');
    }
  }, [loading, user, isAdmin, currentPage]);

  // Redirect logged-in users away from home
  useEffect(() => {
    if (user && currentPage === 'home') {
      setCurrentPage(isAdmin ? 'admin' : 'courses');
    }
  }, [user, isAdmin, currentPage]);

  // Redirect admin away from non-admin pages
  useEffect(() => {
    if (isAdmin && currentPage !== 'admin' && currentPage !== null) {
      setCurrentPage('admin');
    }
  }, [isAdmin, currentPage]);

  if (loading || currentPage === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'courses':
        return <CoursesPage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'roadmap':
        return <RoadmapPage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'achievements':
        return <AchievementsPage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'lesson':
        return <LessonPage selectedCourse={selectedCourse} setCurrentPage={setCurrentPage} />;
      case 'auth':
        return <AuthPage setCurrentPage={setCurrentPage} />;
      case 'wallet':
        return <WalletPage setCurrentPage={setCurrentPage} />;
      case 'payment':
        return <PaymentPage setCurrentPage={setCurrentPage} />;
      case 'playground':
        return <PlaygroundPage />;
      case 'certificate':
        return <CertificatePage courseId={selectedCourse} setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminDashboard setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
    }
  };

  const showHeader = currentPage !== 'lesson' && currentPage !== 'auth' && currentPage !== 'payment' && currentPage !== 'certificate';

  return (
    <div className="min-h-screen bg-slate-900">
      {showHeader && (
        <>
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            open={sidebarOpen}
            setOpen={setSidebarOpen}
          />
        </>
      )}
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
}
