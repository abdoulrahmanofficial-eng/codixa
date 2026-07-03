import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { seedCourseExists, getDynamicCourse, updateCoursePrice } from '../lib/courseService';
import { BACKEND_COURSE_ID } from '../data/backendCourseLessons';
import { Loader2, CheckCircle, DollarSign, Terminal } from 'lucide-react';

export default function SeedCoursePanel() {
  const { lang } = useI18n();
  const [courseExists, setCourseExists] = useState<boolean | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [newPrice, setNewPrice] = useState('');
  const [priceUpdating, setPriceUpdating] = useState(false);
  const [priceUpdated, setPriceUpdated] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const exists = await seedCourseExists(BACKEND_COURSE_ID);
      setCourseExists(exists);
      if (exists) {
        const course = await getDynamicCourse(BACKEND_COURSE_ID);
        if (course) setCurrentPrice(course.price);
      }
    } catch {
      setCourseExists(false);
    }
  };

  const handleUpdatePrice = async () => {
    const price = parseInt(newPrice);
    if (isNaN(price) || price < 0) return;
    setPriceUpdating(true);
    setPriceUpdated(false);
    try {
      await updateCoursePrice(BACKEND_COURSE_ID, price);
      setCurrentPrice(price);
      setPriceUpdated(true);
      setNewPrice('');
      setTimeout(() => setPriceUpdated(false), 3000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setPriceUpdating(false);
    }
  };

  const isSeeded = courseExists === true;

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-indigo-400" />
          {lang === 'ar' ? 'حالة التهيئة' : 'Seed Status'}
        </h3>

        {courseExists === null ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={14} className="animate-spin" />
            {lang === 'ar' ? 'جاري التحقق...' : 'Checking...'}
          </div>
        ) : isSeeded ? (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            {lang === 'ar' ? 'تم تهيئة الكورس في قاعدة البيانات' : 'Course is seeded in the database'}
          </div>
        ) : (
          <div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm mb-4">
              {lang === 'ar'
                ? 'لم يتم تهيئة الكورس بعد. استخدم الأمر التالي في التيرمينال لرفع المحتوى.'
                : 'Course not seeded yet. Run this command in your terminal to upload the content.'}
            </div>
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
              <code className="block whitespace-pre-wrap">
{`ADMIN_EMAIL="admin@example.com" \\
ADMIN_PASSWORD="your-password" \\
node scripts/seed.mjs`}
              </code>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
