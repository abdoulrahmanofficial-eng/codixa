import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import RoadmapPage from './pages/RoadmapPage';
import AchievementsPage from './pages/AchievementsPage';
import LessonPage from './pages/LessonPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState('python');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'courses':
        return <CoursesPage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'roadmap':
        return <RoadmapPage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
      case 'achievements':
        return <AchievementsPage />;
      case 'lesson':
        return <LessonPage selectedCourse={selectedCourse} setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setSelectedCourse={setSelectedCourse} />;
    }
  };

  const showNavbar = currentPage !== 'lesson';

  return (
    <div className="min-h-screen bg-slate-900">
      {showNavbar && (
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
      {renderPage()}
    </div>
  );
}
