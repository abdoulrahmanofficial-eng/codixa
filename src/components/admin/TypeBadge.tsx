export default function TypeBadge({ type, lang }: { type: string; lang: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
      type === 'deposit' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }`}>
      {type === 'deposit' ? (lang === 'ar' ? 'إيداع' : 'Deposit') : (lang === 'ar' ? 'شراء' : 'Purchase')}
    </span>
  );
}
