import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { ArrowLeft, Wallet, Plus, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatEGP } from '../utils/format';

interface WalletPageProps {
  setCurrentPage: (page: string) => void;
}

export default function WalletPage({ setCurrentPage }: WalletPageProps) {
  const { t, lang } = useI18n();
  const { profile, user, addTransaction, transferBalance, findUserByEmail } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMsg, setTransferMsg] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={14} className="text-yellow-400" />,
    completed: <CheckCircle size={14} className="text-green-400" />,
    failed: <XCircle size={14} className="text-red-400" />,
  };

  const statusLabels: Record<string, string> = {
    pending: t('wallet.pending'),
    completed: t('wallet.completed'),
    failed: t('wallet.failed'),
  };

  const transactions = profile?.wallet?.transactions
    ? [...profile.wallet.transactions].reverse()
    : [];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMsg('');
    const amt = parseInt(transferAmt);
    if (!amt || amt <= 0) { setTransferMsg(lang === 'ar' ? 'المبلغ غير صحيح' : 'Invalid amount'); return; }
    if (!transferEmail.trim()) { setTransferMsg(lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required'); return; }
    if (!user?.uid) return;
    setTransferLoading(true);
    try {
      const recipient = await findUserByEmail(transferEmail.trim());
      if (!recipient) { setTransferMsg(lang === 'ar' ? 'المستخدم غير موجود — تأكد من البريد الإلكتروني أو الاسم' : 'User not found — check the email or name'); setTransferLoading(false); return; }
      if (recipient.uid === user.uid) { setTransferMsg(lang === 'ar' ? 'لا يمكن التحويل لنفسك' : 'Cannot transfer to yourself'); setTransferLoading(false); return; }
      await transferBalance(user.uid, recipient.uid, amt);
      setTransferEmail('');
      setTransferAmt('');
      setShowTransfer(false);
      setTransferMsg(lang === 'ar' ? 'تم التحويل بنجاح' : 'Transfer successful');
      setTimeout(() => setTransferMsg(''), 3000);
    } catch (e) {
      setTransferMsg(lang === 'ar' ? 'فشل التحويل' : 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const amt = parseInt(amount);
    if (!amt || amt < 50) {
      setMessage(t('wallet.minAmount'));
      return;
    }
    if (!paymentCode.trim()) {
      setMessage(t('wallet.codeRequired'));
      return;
    }
    setLoading(true);
    try {
      await addTransaction({
        type: 'deposit',
        amount: amt,
        status: 'pending',
        description: lang === 'ar' ? 'شحن رصيد' : 'Wallet Top-Up',
        paymentCode: paymentCode.trim(),
      });
      setShowSuccess(true);
      setLastTxId(`tx_${Date.now()}`);
      setShowTopUp(false);
      setAmount('');
      setPaymentCode('');
    } catch (err) {
      setMessage(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-2xl mb-4">{t('auth.protectedTitle')}</h2>
          <p className="text-slate-400 mb-6">{t('auth.protectedDesc')}</p>
          <button
            onClick={() => setCurrentPage('auth')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
          >
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            {t('common.back')}
          </button>
          <div className="flex-1" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-semibold">
            <Wallet size={14} />
            {t('wallet.title')}
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-4xl animate-pulse-glow">
              💰
            </div>
            <div className="flex-1 text-center sm:text-right">
              <p className="text-slate-400 text-sm mb-1">{t('wallet.balance')}</p>
              <p className="text-4xl sm:text-5xl font-black text-white">
                {formatEGP(profile?.wallet?.balance || 0)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTopUp(!showTopUp)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                <Plus size={18} />
                {t('wallet.topUp')}
              </button>
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                ⇄
                {lang === 'ar' ? 'تحويل' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>

        {/* Pending Alert */}
        {pendingTransactions.length > 0 && (
          <div className="p-4 mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-bold text-sm">
                {lang === 'ar' ? `${pendingTransactions.length} معاملة معلقة` : `${pendingTransactions.length} pending transaction(s)`}
              </p>
              <p className="text-yellow-400/70 text-xs">
                {lang === 'ar' ? 'بانتظار مراجعة الإدارة' : 'Awaiting admin review'}
              </p>
            </div>
          </div>
        )}

        {/* Top Up Form */}
        {showTopUp && (
          <div className="glass rounded-2xl p-6 border border-indigo-500/20 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">{t('wallet.addFunds')}</h3>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">{t('wallet.amount')}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={t('wallet.amountPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  min="50"
                />
                <p className="text-slate-500 text-xs mt-1">{t('wallet.minAmount')}</p>
              </div>

              {/* Payment Methods */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-white font-semibold text-sm mb-3">{t('payment.title')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{t('payment.vodafoneCash')}</p>
                      <p className="text-slate-400 text-xs">{t('payment.vodafoneNumber')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{t('payment.instapay')}</p>
                      <p className="text-slate-400 text-xs">{t('payment.instapayHandle')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">{t('payment.codeLabel')}</label>
                <input
                  type="text"
                  value={paymentCode}
                  onChange={e => setPaymentCode(e.target.value)}
                  placeholder={t('payment.codePlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-slate-500 text-xs mt-1">{t('wallet.codeHint')}</p>
              </div>

              {message && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : t('payment.submit')}
              </button>
            </form>
          </div>
        )}

        {/* Transfer Form */}
        {showTransfer && (
          <div className="glass rounded-2xl p-6 border border-purple-500/20 mb-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              ⇄
              <span>{lang === 'ar' ? 'تحويل رصيد' : 'Transfer Balance'}</span>
            </h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  {lang === 'ar' ? 'البريد الإلكتروني أو اسم المستخدم' : 'Recipient Email or Name'}
                </label>
                <input type="text" value={transferEmail} onChange={e => setTransferEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني أو الاسم...' : 'Email or name...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  {lang === 'ar' ? 'المبلغ' : 'Amount'}
                </label>
                <input type="number" min="1" value={transferAmt} onChange={e => setTransferAmt(e.target.value)}
                  placeholder={lang === 'ar' ? 'المبلغ...' : 'Amount...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              {transferMsg && (
                <div className={`p-3 rounded-xl text-sm text-center ${transferMsg.includes('نجاح') || transferMsg.includes('successful') ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {transferMsg}
                </div>
              )}
              <button type="submit" disabled={transferLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">
                {transferLoading ? <Loader2 size={18} className="animate-spin" /> : '⇄'}
                {lang === 'ar' ? 'تحويل' : 'Transfer'}
              </button>
            </form>
          </div>
        )}

        {/* Transactions */}
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-400" />
            {t('wallet.history')}
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400 text-sm">{t('wallet.noTransactions')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-indigo-500/20'
                  }`}>
                    {tx.type === 'deposit' ? '📥' : '📤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{tx.description}</div>
                    <div className="text-slate-500 text-xs">
                      {new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatEGP(tx.amount)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {statusIcons[tx.status]}
                      {statusLabels[tx.status]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowSuccess(false)}>
          <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              {lang === 'ar' ? 'تم إرسال الطلب! 🎉' : 'Request Sent! 🎉'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {lang === 'ar'
                ? 'طلب شحن الرصيد قيد المراجعة. سيتم إضافة الرصيد بعد التأكيد من الإدارة.'
                : 'Your top-up request is pending review. Balance will be added after admin confirmation.'}
            </p>
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30 mb-6">
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-bold">
                <Clock size={16} />
                {t('wallet.pending')}
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all"
            >
              {lang === 'ar' ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
