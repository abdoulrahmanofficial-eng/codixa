import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Code2, Loader2 } from 'lucide-react';

interface AuthPageProps {
  setCurrentPage: (page: string) => void;
}

export default function AuthPage({ setCurrentPage }: AuthPageProps) {
  const { t, lang } = useI18n();
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to courses if already logged in
  useEffect(() => {
    if (user) {
      setCurrentPage('courses');
    }
  }, [user, setCurrentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError(t('auth.namePlaceholder'));
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') setError(t('auth.error.emailInUse'));
      else if (code === 'auth/invalid-email') setError(t('auth.error.invalidEmail'));
      else if (code === 'auth/weak-password') setError(t('auth.error.weakPassword'));
      else if (code === 'auth/wrong-password') setError(t('auth.error.wrongPassword'));
      else if (code === 'auth/user-not-found') setError(t('auth.error.userNotFound'));
      else if (code === 'auth/invalid-credential') setError(t('auth.error.wrongPassword'));
      else setError(t('auth.error.default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Code2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              {isLogin ? t('auth.login') : t('auth.signup')}
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? t('auth.welcomeBack') : t('auth.welcome')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                isLogin ? t('auth.login') : t('auth.signup')
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? (
              <button onClick={() => { setIsLogin(false); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                {t('auth.createAccount')}
              </button>
            ) : (
              <button onClick={() => { setIsLogin(true); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                {t('auth.loginHere')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
