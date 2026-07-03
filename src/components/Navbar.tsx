import { useState } from 'react';
import { BookOpen, Home, Map, Trophy, Menu, X, Code2, Zap, LogOut, Wallet, User, Globe } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { fmt } from '../lib/format';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const { t, lang, setLang } = useI18n();
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: <Home size={18} /> },
    { id: 'courses', label: t('nav.courses'), icon: <BookOpen size={18} /> },
    { id: 'roadmap', label: t('nav.roadmap'), icon: <Map size={18} /> },
    { id: 'achievements', label: t('nav.achievements'), icon: <Trophy size={18} /> },
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
            <span className="text-xl font-black gradient-text">{t('nav.brand')}</span>
            <span className="text-xs text-indigo-400 font-semibold hidden sm:block">{t('nav.tagline')}</span>
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

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <Globe size={16} />
              {t('nav.langToggle')}
            </button>

            {/* Wallet */}
            {user && (
              <button
                onClick={() => setCurrentPage('wallet')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-yellow-400 hover:bg-white/10 transition-all"
              >
                <Wallet size={16} />
                {profile?.wallet?.balance || 0} EGP
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('achievements')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <User size={16} />
                  {user.displayName || user.email?.split('@')[0]}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('auth')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
              >
                <User size={16} />
                {t('nav.login')}
              </button>
            )}

            {/* CTA */}
            <button
              onClick={() => setCurrentPage('courses')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
            >
              <Zap size={16} />
              {t('nav.startLearning')}
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

              {/* Lang Toggle */}
              <button
                onClick={() => { setLang(lang === 'ar' ? 'en' : 'ar'); setMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-300 hover:bg-white/10"
              >
                <Globe size={18} />
                {t('nav.langToggle')}
              </button>

              {/* Wallet */}
              {user && (
                <button
                  onClick={() => { setCurrentPage('wallet'); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-yellow-400 hover:bg-white/10"
                >
                  <Wallet size={18} />
                  {t('nav.wallet')} ({profile?.wallet?.balance || 0} EGP)
                </button>
              )}

              {/* Auth */}
              {user ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  {t('nav.logout')}
                </button>
              ) : (
                <button
                  onClick={() => { setCurrentPage('auth'); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-indigo-400 hover:bg-indigo-500/10"
                >
                  <User size={18} />
                  {t('nav.login')}
                </button>
              )}

              <button
                onClick={() => { setCurrentPage('courses'); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
              >
                <Zap size={16} />
                {t('nav.mobileCta')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
