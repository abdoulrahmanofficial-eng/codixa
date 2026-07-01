import { useState } from 'react';
import { BookOpen, Home, Map, Trophy, Menu, X, Code2, Zap } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: <Home size={18} /> },
    { id: 'courses', label: 'الكورسات', icon: <BookOpen size={18} /> },
    { id: 'roadmap', label: 'المسارات', icon: <Map size={18} /> },
    { id: 'achievements', label: 'الإنجازات', icon: <Trophy size={18} /> },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
              <Code2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-black gradient-text">كودي</span>
            <span className="text-xs text-indigo-400 font-semibold hidden sm:block">تعلم البرمجة</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('courses')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
            >
              <Zap size={16} />
              ابدأ التعلم
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    currentPage === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { setCurrentPage('courses'); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
              >
                <Zap size={16} />
                ابدأ التعلم الآن
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
