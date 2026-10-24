export default function StatusBadge({ status, lang }: { status: string; lang: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const labels: Record<string, string> = {
    completed: lang === 'ar' ? 'مكتمل' : 'Done',
    pending: lang === 'ar' ? 'معلق' : 'Pending',
    failed: lang === 'ar' ? 'فشل' : 'Failed',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${colors[status] || colors.pending}`}>
      {labels[status] || status}
    </span>
  );
}
