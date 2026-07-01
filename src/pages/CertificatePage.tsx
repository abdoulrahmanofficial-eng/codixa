import { useMemo, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data/courses';
import { useBilingualContent } from '../i18n/content';
import { Award, Download, Printer, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificatePageProps {
  courseId: string;
  setCurrentPage: (page: string) => void;
}

export default function CertificatePage({ courseId, setCurrentPage }: CertificatePageProps) {
  const { t, lang } = useI18n();
  const { user, profile } = useAuth();
  const { localizeCourses } = useBilingualContent();
  const certRef = useRef<HTMLDivElement>(null);

  const course = useMemo(() => {
    const raw = courses.find(c => c.id === courseId);
    if (!raw) return null;
    return localizeCourses([raw], lang)[0];
  }, [courseId, lang]);

  const completedDate = profile?.completedCourses?.[courseId];
  const userName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const certId = `${user?.uid?.slice(0, 8)}-${courseId}-${completedDate || Date.now()}`;
  const dateStr = completedDate
    ? new Date(completedDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>${t('cert.title')} - ${course?.title || courseId}</title>
        <style>
          @page { size: landscape; margin: 20mm; }
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; }
          .cert { width: 900px; background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 4px solid #818cf8; border-radius: 24px; padding: 60px; text-align: center; position: relative; overflow: hidden; }
          .cert::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(129,140,248,0.15), transparent 70%); }
          .cert-content { position: relative; }
          .badge { font-size: 72px; }
          h1 { font-size: 36px; color: #f8fafc; margin: 16px 0; }
          .sub { color: #94a3b8; font-size: 16px; letter-spacing: 2px; text-transform: uppercase; }
          .name { font-size: 42px; color: #818cf8; font-weight: 900; margin: 16px 0; }
          .course-name { font-size: 28px; color: #fbbf24; font-weight: 700; margin: 8px 0; }
          .date { color: #64748b; font-size: 14px; margin-top: 32px; }
          .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #334155; display: flex; justify-content: space-between; color: #64748b; font-size: 12px; }
          .dir-rtl { direction: rtl; }
          .dir-ltr { direction: ltr; }
        </style>
      </head>
      <body>
        <div class="cert dir-${lang === 'ar' ? 'rtl' : 'ltr'}">
          <div class="cert-content">
            <div class="badge">${course?.icon || '🎓'}</div>
            <h1>${t('cert.title')}</h1>
            <p class="sub">${t('cert.subtitle')}</p>
            <p class="name">${userName}</p>
            <p class="sub">${t('cert.forCompleting')}</p>
            <p class="course-name">${course?.title || courseId}</p>
            <p class="date">${t('cert.date')}: ${dateStr}</p>
            <p style="color:#475569;font-size:11px;margin-top:8px;">${t('cert.code')}: ${certId}</p>
            <div class="footer">
              <span style="font-weight:700;color:#818cf8;">Codixa</span>
              <span>© ${new Date().getFullYear()} Codixa</span>
            </div>
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-white font-bold text-2xl mb-4">{lang === 'ar' ? 'الكورس غير موجود' : 'Course not found'}</h2>
          <button onClick={() => setCurrentPage('achievements')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            {lang === 'ar' ? 'العودة للإنجازات' : 'Back to Achievements'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => setCurrentPage('achievements')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        {/* Congrats Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">{t('cert.congrats')}</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">{t('cert.desc')}</p>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          ref={certRef}
          className="certificate-border relative overflow-hidden"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full -translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full translate-x-24 translate-y-24" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full" />

          <div className="relative text-center">
            {/* Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20 text-5xl">
              <Award size={48} className="text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{t('cert.title')}</h1>
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-8">{t('cert.subtitle')}</p>

            {/* User Name */}
            <div className="mb-6">
              <p className="text-4xl sm:text-5xl font-black gradient-text">{userName}</p>
            </div>

            {/* Separator */}
            <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6 rounded-full" />

            {/* Course */}
            <p className="text-slate-400 mb-2">{t('cert.forCompleting')}</p>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-4xl">{course.icon}</span>
              <span className="text-2xl sm:text-3xl font-bold text-yellow-400">{course.title}</span>
            </div>

            {/* Date & ID */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6">
              <div className="glass rounded-xl px-4 py-2 border border-white/10">
                <p className="text-slate-500 text-xs mb-1">{t('cert.date')}</p>
                <p className="text-white font-bold text-sm">{dateStr}</p>
              </div>
              <div className="glass rounded-xl px-4 py-2 border border-white/10">
                <p className="text-slate-500 text-xs mb-1">{t('cert.code')}</p>
                <p className="text-white font-mono text-xs">{certId}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
              <span className="text-lg font-black gradient-text">Codixa</span>
              <span className="text-slate-600 text-xs">© {new Date().getFullYear()} Codixa</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Printer size={18} />
            {t('cert.print')}
          </button>
          <button
            onClick={() => setCurrentPage('achievements')}
            className="flex items-center gap-2 px-6 py-3 glass border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
