import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowLeft, Copy, CheckCircle, Loader2, Ticket, BookOpen, Package, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { courses as staticCourses } from '../data/courses';
import { getDynamicCourses, type BackendCourse } from '../lib/courseService';
import { getAllPriceOverrides } from '../lib/priceService';

interface GiftCardPageProps {
  setCurrentPage: (page: string) => void;
}

interface CourseItem {
  id: string;
  title: string;
  price: number;
  free: boolean;
  icon: string;
  bgGradient: string;
}

export default function GiftCardPage({ setCurrentPage }: GiftCardPageProps) {
  const { t, lang } = useI18n();
  const { profile, createGiftCard, redeemGiftCard, createGiftCourse, redeemGiftCourse, getMyGifts, cancelGift } = useAuth();
  const [tab, setTab] = useState<'card' | 'course' | 'redeem' | 'mygifts'>('card');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [buying, setBuying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseMsg, setCourseMsg] = useState('');
  const [buyingCourse, setBuyingCourse] = useState(false);
  const [generatedCourseCode, setGeneratedCourseCode] = useState('');
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [myGiftsLoading, setMyGiftsLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const balance = profile?.wallet?.balance || 0;

  useEffect(() => {
    (async () => {
      const [dynamic, overrides] = await Promise.all([getDynamicCourses(), getAllPriceOverrides()]);
      const allCourses: CourseItem[] = staticCourses
        .filter(c => !c.free)
        .map(c => ({ id: c.id, title: c.title, price: overrides[c.id] ?? c.price, free: c.free, icon: c.icon, bgGradient: c.bgGradient }));
      const dynamicMapped = dynamic
        .filter(c => !c.free)
        .map(c => ({ id: c.id, title: c.title, price: overrides[c.id] ?? c.price, free: c.free, icon: c.icon || '📚', bgGradient: c.bgGradient }));
      const all = [...allCourses, ...dynamicMapped];
      all.sort((a, b) => a.price - b.price);
      setCourses(all);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setCoursePrice(0); return; }
    const found = courses.find(c => c.id === selectedCourse);
    if (found) setCoursePrice(found.price);
  }, [selectedCourse, courses]);

  const handleBuyCard = async () => {
    const amt = parseInt(amount);
    if (isNaN(amt) || amt < 10) return;
    setBuying(true);
    setGeneratedCode('');
    try {
      const code = await createGiftCard(amt, message.trim() || undefined);
      setGeneratedCode(code);
      setAmount('');
      setMessage('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBuying(false);
    }
  };

  const handleBuyCourse = async () => {
    if (!selectedCourse || coursePrice <= 0) return;
    setBuyingCourse(true);
    setGeneratedCourseCode('');
    try {
      const code = await createGiftCourse(selectedCourse, coursePrice, courseMsg.trim() || undefined);
      setGeneratedCourseCode(code);
      setSelectedCourse('');
      setCourseMsg('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBuyingCourse(false);
    }
  };

  const handleRedeem = async () => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;
    setRedeeming(true);
    setRedeemMsg(null);
    try {
      const card = await redeemGiftCard(code);
      const msgText = card.message
        ? (lang === 'ar' ? `من ${card.senderName}: "${card.message}"` : `From ${card.senderName}: "${card.message}"`)
        : (lang === 'ar' ? `من ${card.senderName}` : `From ${card.senderName}`);
      setRedeemMsg({ ok: true, text: (lang === 'ar' ? `تم استلام الرصيد بنجاح! 🎉\n${msgText}` : `Balance added! 🎉\n${msgText}`) });
      setRedeemCode('');
    } catch {
      try {
        const gc = await redeemGiftCourse(code);
        const msgText = gc.message
          ? (lang === 'ar' ? `من ${gc.senderName}: "${gc.message}"` : `From ${gc.senderName}: "${gc.message}"`)
          : (lang === 'ar' ? `من ${gc.senderName}` : `From ${gc.senderName}`);
        setRedeemMsg({ ok: true, text: (lang === 'ar' ? `تم إضافة الكورس بنجاح! 🎉\n${msgText}` : `Course added! 🎉\n${msgText}`) });
        setRedeemCode('');
      } catch (e: any) {
        setRedeemMsg({ ok: false, text: e.message });
      }
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selected = courses.find(c => c.id === selectedCourse);

  const fetchMyGifts = async () => {
    setMyGiftsLoading(true);
    const gifts = await getMyGifts();
    setMyGifts(gifts);
    setMyGiftsLoading(false);
  };

  useEffect(() => {
    if (tab === 'mygifts') fetchMyGifts();
  }, [tab]);

  const handleCancelGift = async (code: string, type: 'card' | 'course') => {
    if (!(lang === 'ar' ? window.confirm('هل أنت متأكد من إلغاء الهدية واسترداد المبلغ؟') : window.confirm('Are you sure you want to cancel this gift and refund?'))) return;
    setCancelling(code);
    try {
      await cancelGift(code, type);
      await fetchMyGifts();
      setRedeemMsg({ ok: true, text: lang === 'ar' ? 'تم إلغاء الهدية واسترداد المبلغ' : 'Gift cancelled and refunded' });
      setTimeout(() => setRedeemMsg(null), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setCurrentPage('home')} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="glass rounded-2xl p-6 border border-white/10 mb-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Gift size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              {lang === 'ar' ? 'الهدايا' : 'Gifts'}
            </h1>
            <p className="text-slate-400 text-sm">
              {lang === 'ar' ? 'اشتري هدية لصديق أو استخدم كود' : 'Buy a gift for a friend or redeem a code'}
            </p>
            <div className="text-sm text-slate-400 mt-2">
              {lang === 'ar' ? 'الرصيد الحالي:' : 'Current balance:'} <span className="text-yellow-400 font-bold">{balance} EGP</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('card')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'card' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <Gift size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'كارت رصيد' : 'Gift Card'}
            </button>
            <button onClick={() => setTab('course')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'course' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <BookOpen size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'هدية كورس' : 'Gift Course'}
            </button>
            <button onClick={() => setTab('redeem')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'redeem' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <Ticket size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'استخدام كود' : 'Redeem'}
            </button>
            <button onClick={() => setTab('mygifts')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'mygifts' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <Package size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'هداياي' : 'My Gifts'}
            </button>
          </div>

          {/* Buy Card Tab */}
          {tab === 'card' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              {generatedCode ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-3">
                    {lang === 'ar' ? 'تم إنشاء الكارت! شارك الكود ده:' : 'Card created! Share this code:'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{generatedCode}</span>
                    <button onClick={() => copyCode(generatedCode)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} className="text-slate-300" />}
                    </button>
                  </div>
                  <button onClick={() => setGeneratedCode('')}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                    {lang === 'ar' ? 'إنشاء كارت آخر' : 'Create Another'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'المبلغ (EGP)' : 'Amount (EGP)'}
                    </label>
                    <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-pink-500 transition-all"
                      placeholder={lang === 'ar' ? 'أقل مبلغ 10 EGP' : 'Minimum 10 EGP'} />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'رسالة (اختياري)' : 'Message (optional)'}
                    </label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-pink-500 transition-all resize-none"
                      placeholder={lang === 'ar' ? 'اكتب رسالة للصديق...' : 'Write a message...'} />
                  </div>
                  <button onClick={handleBuyCard} disabled={buying || !amount || parseInt(amount) < 10 || parseInt(amount) > balance}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {buying ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                    {lang === 'ar' ? 'شراء الكارت' : 'Buy Gift Card'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Buy Course Tab */}
          {tab === 'course' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              {generatedCourseCode ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-3">
                    {lang === 'ar' ? 'تم إنشاء هدية الكورس! شارك الكود ده:' : 'Course gift created! Share this code:'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{generatedCourseCode}</span>
                    <button onClick={() => copyCode(generatedCourseCode)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} className="text-slate-300" />}
                    </button>
                  </div>
                  <button onClick={() => setGeneratedCourseCode('')}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                    {lang === 'ar' ? 'إنشاء هدية أخرى' : 'Create Another'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'اختر الكورس' : 'Select a course'}
                    </label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {courses.map(c => {
                        const isSelected = selectedCourse === c.id;
                        return (
                          <button key={c.id} onClick={() => setSelectedCourse(c.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${isSelected ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                            <span className="text-xl">{c.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-semibold truncate">{c.title}</div>
                              <div className="text-yellow-400 text-xs font-bold">{c.price} EGP</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {selected && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                      <span className="text-slate-300">{lang === 'ar' ? 'السعر:' : 'Price:'} </span>
                      <span className="text-yellow-400 font-bold">{coursePrice} EGP</span>
                      <span className={`mr-3 ${coursePrice > balance ? 'text-red-400' : 'text-green-400'}`}>
                        {coursePrice > balance ? (lang === 'ar' ? 'رصيد غير كاف' : 'Insufficient balance') : (lang === 'ar' ? 'الرصيد كاف' : 'Sufficient balance')}
                      </span>
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'رسالة (اختياري)' : 'Message (optional)'}
                    </label>
                    <textarea value={courseMsg} onChange={e => setCourseMsg(e.target.value)} rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-pink-500 transition-all resize-none"
                      placeholder={lang === 'ar' ? 'اكتب رسالة للصديق...' : 'Write a message...'} />
                  </div>
                  <button onClick={handleBuyCourse}
                    disabled={buyingCourse || !selectedCourse || coursePrice <= 0 || coursePrice > balance}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {buyingCourse ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                    {lang === 'ar' ? 'شراء هدية الكورس' : 'Buy Course Gift'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Redeem Tab */}
          {tab === 'redeem' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'كود الهدية' : 'Gift Code'}
                  </label>
                  <input type="text" value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-pink-500 transition-all text-center font-bold tracking-widest"
                    placeholder="GIFT-XXXXXX" />
                  <p className="text-slate-500 text-xs mt-1.5 text-center">
                    {lang === 'ar' ? 'الكود يشتغل مع كروت الرصيد وهدايا الكورسات' : 'Works for both balance cards and course gifts'}
                  </p>
                </div>
                <button onClick={handleRedeem} disabled={redeeming || !redeemCode.trim()}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {redeeming ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                  {lang === 'ar' ? 'استخدام الكود' : 'Redeem'}
                </button>
                {redeemMsg && (
                  <div className={`p-4 rounded-xl text-sm font-semibold text-center ${redeemMsg.ok ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {redeemMsg.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Gifts Tab */}
          {tab === 'mygifts' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              {myGiftsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                </div>
              ) : myGifts.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={32} className="text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    {lang === 'ar' ? 'لا توجد هدايا نشطة' : 'No active gifts'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myGifts.map(g => (
                    <div key={g.code} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${g.type === 'card' ? 'bg-pink-500/20' : 'bg-blue-500/20'}`}>
                        {g.type === 'card' ? <Gift size={18} className="text-pink-400" /> : <BookOpen size={18} className="text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-mono font-bold">{g.code}</div>
                        <div className="text-slate-400 text-xs">
                          {g.type === 'card'
                            ? (lang === 'ar' ? `${g.amount} EGP كارت رصيد` : `${g.amount} EGP Gift Card`)
                            : (lang === 'ar' ? `هدية كورس - ${g.amount} EGP` : `Course Gift - ${g.amount} EGP`)}
                        </div>
                        {g.message && <div className="text-slate-500 text-xs truncate">"{g.message}"</div>}
                      </div>
                      <button onClick={() => handleCancelGift(g.code, g.type)} disabled={cancelling === g.code}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
                        {cancelling === g.code ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
