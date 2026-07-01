import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { ArrowLeft, CheckCircle, Loader2, Copy, Check } from 'lucide-react';

interface PaymentPageProps {
  setCurrentPage: (page: string) => void;
}

export default function PaymentPage({ setCurrentPage }: PaymentPageProps) {
  const { t } = useI18n();
  const { user, addTransaction } = useAuth();
  const [paymentCode, setPaymentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCode.trim() || !user) return;
    setLoading(true);
    try {
      await addTransaction({
        type: 'deposit',
        amount: 0,
        status: 'pending',
        description: 'شحن رصيد',
        paymentCode,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{t('payment.success')}</h2>
          <button
            onClick={() => setCurrentPage('wallet')}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
          >
            {t('wallet.title')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900" />
      </div>

      <div className="relative w-full max-w-lg">
        <button
          onClick={() => setCurrentPage('wallet')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
          <h1 className="text-2xl font-black text-white mb-6">{t('payment.title')}</h1>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{t('payment.vodafoneCash')}</p>
                <div className="flex items-center gap-2">
                  <code className="text-green-400 text-sm font-mono">010XXXXXXXX</code>
                  <button
                    onClick={() => handleCopy('010XXXXXXXX')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied === '010XXXXXXXX' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <span className="text-2xl">💳</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{t('payment.instapay')}</p>
                <div className="flex items-center gap-2">
                  <code className="text-purple-400 text-sm font-mono">@codixa</code>
                  <button
                    onClick={() => handleCopy('@codixa')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied === '@codixa' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">{t('payment.instructions')}</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>1. {t('payment.step1')}</p>
              <p>2. {t('payment.step2')}</p>
              <p>3. {t('payment.step3')}</p>
              <p>4. {t('payment.step4')}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-semibold mb-2">{t('payment.codeLabel')}</label>
              <input
                type="text"
                value={paymentCode}
                onChange={e => setPaymentCode(e.target.value)}
                placeholder={t('payment.codePlaceholder')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : t('payment.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
