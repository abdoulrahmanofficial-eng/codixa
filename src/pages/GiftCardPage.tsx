import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowLeft, Copy, CheckCircle, Loader2, Ticket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

interface GiftCardPageProps {
  setCurrentPage: (page: string) => void;
}

export default function GiftCardPage({ setCurrentPage }: GiftCardPageProps) {
  const { t, lang } = useI18n();
  const { profile, createGiftCard, redeemGiftCard } = useAuth();
  const [tab, setTab] = useState<'buy' | 'redeem'>('buy');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [buying, setBuying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const balance = profile?.wallet?.balance || 0;

  const handleBuy = async () => {
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

  const handleRedeem = async () => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;
    setRedeeming(true);
    setRedeemMsg(null);
    try {
      await redeemGiftCard(code);
      setRedeemMsg({ ok: true, text: lang === 'ar' ? `تم استلام الرصيد بنجاح! 🎉` : 'Balance added successfully! 🎉' });
      setRedeemCode('');
    } catch (e: any) {
      setRedeemMsg({ ok: false, text: e.message });
    } finally {
      setRedeeming(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              {lang === 'ar' ? 'بطاقات الهدايا' : 'Gift Cards'}
            </h1>
            <p className="text-slate-400 text-sm">
              {lang === 'ar' ? 'اشتري كارت هدية لصديق أو استخدم كود' : 'Buy a gift card for a friend or redeem a code'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('buy')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'buy' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <Gift size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'شراء' : 'Buy'}
            </button>
            <button onClick={() => setTab('redeem')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'redeem' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass text-slate-300 border border-white/10'}`}>
              <Ticket size={16} className="inline mr-1.5" />
              {lang === 'ar' ? 'استخدام كود' : 'Redeem'}
            </button>
          </div>

          {/* Buy Tab */}
          {tab === 'buy' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="text-sm text-slate-400 mb-4">
                {lang === 'ar' ? 'الرصيد الحالي:' : 'Current balance:'} <span className="text-yellow-400 font-bold">{balance} EGP</span>
              </div>

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
                    <button onClick={copyCode} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
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
                  <button onClick={handleBuy} disabled={buying || !amount || parseInt(amount) < 10 || parseInt(amount) > balance}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {buying ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                    {lang === 'ar' ? 'شراء الكارت' : 'Buy Gift Card'}
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
                    {lang === 'ar' ? 'كود بطاقة الهدية' : 'Gift Card Code'}
                  </label>
                  <input type="text" value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-pink-500 transition-all text-center font-bold tracking-widest"
                    placeholder="GIFT-XXXXXX" />
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
        </motion.div>
      </div>
    </div>
  );
}