import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Code2, Loader2, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AuthPageProps {
  setCurrentPage: (page: string) => void;
}

export default function AuthPage({ setCurrentPage }: AuthPageProps) {
  const { t, lang } = useI18n();
  const { login, register, user, profile, sendVerificationEmail, verifyEmail, verifyWithCode, verifyResetCode, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCodeStep, setResetCodeStep] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetCodeLoading, setResetCodeLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [newPwdLoading, setNewPwdLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastFade, setToastFade] = useState(false);

  useEffect(() => {
    if (toast) {
      setToastFade(false);
      const t1 = setTimeout(() => setToastFade(true), 1700);
      const t2 = setTimeout(() => { setToast(''); setToastFade(false); }, 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [toast]);

  // Email verification state
  const [showVerify, setShowVerify] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [code, setCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Detect verifyEmail mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');
    if (mode === 'verifyEmail' && oobCode) {
      (async () => {
        try {
          await verifyEmail(oobCode);
          setVerifiedSuccess(true);
        } catch {
          setError(lang === 'ar' ? 'رابط التأكيد غير صالح أو منتهي' : 'Invalid or expired verification link');
        }
      })();
    }
  }, []);

  // Redirect to courses if already logged in and email verified
  useEffect(() => {
    if (user && (user.emailVerified || profile?.emailVerified) && !showVerify && !verifiedSuccess) {
      setCurrentPage('courses');
    }
  }, [user, profile, setCurrentPage, showVerify, verifiedSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          await auth.currentUser.reload();
          if (!auth.currentUser.emailVerified) {
            setShowVerify(true);
            sendVerificationEmail().then(() => setVerifySent(true)).catch(() => {});
            return;
          }
        }
      } else {
        if (!name.trim()) {
          setError(t('auth.namePlaceholder'));
          setLoading(false);
          return;
        }
        await register(email, password, name);
        setShowVerify(true);
        try {
          await sendVerificationEmail();
          setVerifySent(true);
        } catch {
          setError(t('auth.error.default'));
        }
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setResetCodeStep(true);
    } catch (err: any) {
      setError(err.message || t('auth.error.default'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    setError('');
    if (!resetCodeInput || resetCodeInput.length !== 6) {
      setError(lang === 'ar' ? 'أدخل الكود المكون من 6 أرقام' : 'Enter the 6-digit code');
      return;
    }
    setResetCodeLoading(true);
    try {
      const ok = await verifyResetCode(email, resetCodeInput);
      if (ok) {
        setResetCodeStep(false);
        setShowNewPassword(true);
      } else {
        setError(lang === 'ar' ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Invalid or expired code');
      }
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setResetCodeLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError(lang === 'ar' ? 'كلمة السر يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    setNewPwdLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setToast(lang === 'ar' ? '✅ تم تغيير كلمة السر بنجاح' : '✅ Password updated');
      setShowNewPassword(false);
      setShowReset(false);
      setResetSent(false);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || t('auth.error.default'));
    } finally {
      setNewPwdLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setVerifyLoading(true);
    try {
      await sendVerificationEmail();
      setVerifySent(true);
    } catch {
      setError(t('auth.error.default'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!code || code.length !== 6) {
      setError(lang === 'ar' ? 'أدخل الكود المكون من 6 أرقام' : 'Enter the 6-digit code');
      return;
    }
    setCodeLoading(true);
    try {
      const ok = await verifyWithCode(user?.uid || '', code);
      if (ok) {
        setVerifiedSuccess(true);
      } else {
        setError(lang === 'ar' ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Invalid or expired code');
      }
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    setError('');
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        setCurrentPage('courses');
      } else {
        setError(lang === 'ar' ? 'لم يتم تأكيد البريد الإلكتروني بعد' : 'Email not verified yet');
      }
    }
  };

  // Show verified success from URL action
  if (verifiedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
        </div>
        <div className="relative w-full max-w-md">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('auth.verifiedSuccess')}</h2>
            <button onClick={() => setCurrentPage('courses')} className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              {lang === 'ar' ? 'الدخول إلى المنصة' : 'Go to Courses'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show verification UI
  if (showVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative w-full max-w-md">
          <button onClick={() => { setCurrentPage('home'); setShowVerify(false); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft size={16} />
            {t('common.back')}
          </button>
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('auth.verifyEmail')}</h2>
            <p className="text-slate-400 text-sm mb-4">{t('auth.verifyEmailDesc')}</p>
            <p className="text-slate-400 text-xs mb-4">{lang === 'ar' ? 'تم إنشاء حسابك بـ' : 'Account created with'} <span className="text-indigo-300">{email}</span></p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center mb-4">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="text-slate-400 text-xs">{lang === 'ar' ? 'أدخل كود التفعيل المرسل إلى بريدك' : 'Enter the 6-digit code'}</label>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
                className="flex-1 text-center text-2xl tracking-[12px] font-bold bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              <button onClick={handleVerifyCode} disabled={codeLoading || code.length !== 6}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
                {codeLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              </button>
            </div>

            <button onClick={handleResendVerification} disabled={verifyLoading}
              className="w-full py-3 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors disabled:opacity-50">
              {verifyLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : t('auth.resendVerification')}
            </button>

            <button onClick={() => { setShowVerify(false); setCurrentPage('home'); }}
              className="mt-2 text-slate-500 hover:text-slate-400 text-sm transition-colors">
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center ${toastFade ? 'animate-fadeOut' : 'animate-slideUp'}`}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 bg-green-500/10 border border-green-500/25 rounded-2xl backdrop-blur-xl shadow-2xl shadow-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span className="text-green-400 font-semibold text-sm">{toast}</span>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md">
        <button onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Code2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              {showReset ? t('auth.resetPassword') : (isLogin ? t('auth.login') : t('auth.signup'))}
            </h1>
            <p className="text-slate-400 text-sm">
              {showReset ? t('auth.resetPasswordDesc') : (isLogin ? t('auth.welcomeBack') : t('auth.welcome'))}
            </p>
          </div>

          {showReset ? (
            showNewPassword ? (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} className="text-white" />
                  </div>
                  <p className="text-slate-300 text-sm">{lang === 'ar' ? 'أدخل كلمة السر الجديدة' : 'Enter your new password'}</p>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••"
                      className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`} minLength={6} required />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>}
                <button type="submit" disabled={newPwdLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
                  {newPwdLoading ? <Loader2 size={18} className="animate-spin" /> : (lang === 'ar' ? 'تغيير كلمة السر' : 'Reset Password')}
                </button>
              </form>
            ) : resetCodeStep ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Code2 size={32} className="text-white" />
                </div>
                <p className="text-green-400 font-semibold mb-1">{t('auth.resetSent')}</p>
                <p className="text-slate-400 text-xs mb-4">{lang === 'ar' ? 'أدخل كود إعادة التعيين المرسل إلى بريدك' : 'Enter the reset code sent to your email'}</p>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center mb-4">{error}</div>}
                <div className="flex gap-2 mb-3">
                  <input type="text" maxLength={6} value={resetCodeInput} onChange={e => setResetCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
                    className="flex-1 text-center text-2xl tracking-[12px] font-bold bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                  <button onClick={handleVerifyResetCode} disabled={resetCodeLoading || resetCodeInput.length !== 6}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
                    {resetCodeLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  </button>
                </div>
                <button onClick={() => { setShowReset(false); setResetCodeStep(false); setResetSent(false); setResetCodeInput(''); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">{t('auth.backToLogin')}</button>
              </div>
            ) : resetSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <p className="text-green-400 font-semibold mb-2">{t('auth.resetSent')}</p>
                <button onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">{t('auth.backToLogin')}</button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`} required />
                  </div>
                </div>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>}
                <button type="submit" disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
                  {resetLoading ? <Loader2 size={18} className="animate-spin" /> : t('auth.resetPassword')}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { setShowReset(false); setError(''); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">{t('auth.backToLogin')}</button>
                </div>
              </form>
            )
          ) : (
            <><form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">{t('auth.name')}</label>
                <div className="relative">
                  <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.namePlaceholder')}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`} required />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors`} minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => { setShowReset(true); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">{t('auth.forgotPassword')}</button>
              </div>
            )}

            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? t('auth.login') : t('auth.signup'))}
            </button>
            </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? (
              <button onClick={() => { setIsLogin(false); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">{t('auth.createAccount')}</button>
            ) : (
              <button onClick={() => { setIsLogin(true); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">{t('auth.loginHere')}</button>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
