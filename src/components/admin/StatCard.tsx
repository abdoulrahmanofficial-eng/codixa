import type { ReactNode } from 'react';

export default function StatCard({ icon, value, label, color, sub }: { icon: ReactNode; value: string | number; label: string; color: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}
