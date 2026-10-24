import { motion } from 'framer-motion';
import { Shield, Calendar, Wrench, BarChart3, Users, DollarSign, TrendingUp, CheckCircle2, XCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  lang: string;
  setTab: (tab: string) => void;
  maintenanceMode: boolean;
  maintenanceSaving: boolean;
  toggleMaintenance: () => void;
  totalBalance: number;
  totalRevenue: number;
  totalXP: number;
  regularUsers: any[];
  transactions: any[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminSettings({ lang, setTab, maintenanceMode, maintenanceSaving, toggleMaintenance, totalBalance, totalRevenue, totalXP, regularUsers, transactions }: Props) {
  const completed = transactions.filter((tx: any) => tx.status === 'completed').length;
  const completionRate = transactions.length > 0 ? ((completed / transactions.length) * 100).toFixed(1) : '0';

  const cards = [
    { label: lang === 'ar' ? 'متوسط الرصيد' : 'Avg Balance', value: `${regularUsers.length > 0 ? (totalBalance / regularUsers.length).toFixed(0) : 0} EGP`, icon: <DollarSign size={16} />, color: 'from-emerald-600/30 to-emerald-800/10', border: 'border-emerald-500/20', textColor: 'text-emerald-400' },
    { label: lang === 'ar' ? 'متوسط XP' : 'Avg XP', value: `${regularUsers.length > 0 ? (totalXP / regularUsers.length).toFixed(0) : 0}`, icon: <TrendingUp size={16} />, color: 'from-amber-600/30 to-amber-800/10', border: 'border-amber-500/20', textColor: 'text-amber-400' },
    { label: lang === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate', value: `${completionRate}%`, icon: <CheckCircle2 size={16} />, color: 'from-emerald-600/30 to-emerald-800/10', border: 'border-emerald-500/20', textColor: 'text-emerald-400' },
    { label: lang === 'ar' ? 'متوسط الإيرادات' : 'Avg Revenue', value: `${regularUsers.length > 0 ? (totalRevenue / regularUsers.length).toFixed(0) : 0} EGP`, icon: <BarChart3 size={16} />, color: 'from-violet-600/30 to-violet-800/10', border: 'border-violet-500/20', textColor: 'text-violet-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Shield size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">{lang === 'ar' ? 'إدارة الصلاحيات' : 'Role Management'}</h3>
            <p className="text-slate-500 text-xs">{lang === 'ar' ? 'إضافة أو إزالة صلاحيات المدير' : 'Add or remove admin permissions'}</p>
          </div>
        </div>
        <div className="p-5">
          <button onClick={() => setTab('admins')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20">
            <Shield size={16} />
            {lang === 'ar' ? 'إدارة المدراء' : 'Manage Admins'}
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Wrench size={18} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">{lang === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</h3>
            <p className="text-slate-500 text-xs">{lang === 'ar' ? 'تعطيل المنصة للمستخدمين مع بقاء وصول المدير' : 'Disable platform for users, admin access remains'}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <button onClick={toggleMaintenance} disabled={maintenanceSaving}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${maintenanceMode ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-white/20'} ${maintenanceSaving ? 'opacity-50' : ''}`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${maintenanceMode ? 'end-0.5' : 'start-0.5'}`} />
            </button>
            <div className="flex items-center gap-2">
              {maintenanceMode ? <AlertTriangle size={16} className="text-rose-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
              <span className={`text-sm font-semibold ${maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maintenanceMode
                  ? (lang === 'ar' ? 'وضع الصيانة مفعل' : 'Maintenance ON')
                  : (lang === 'ar' ? 'المنصة شغالة' : 'Platform Live')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <BarChart3 size={18} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">{lang === 'ar' ? 'إحصائيات المنصة' : 'Platform Statistics'}</h3>
            <p className="text-slate-500 text-xs">{lang === 'ar' ? 'مؤشرات أداء المنصة' : 'Platform performance indicators'}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((c, i) => (
              <div key={i} className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.color} p-4`}>
                <div className={`${c.textColor} mb-2`}>{c.icon}</div>
                <div className="text-white font-bold text-lg">{c.value}</div>
                <div className="text-slate-500 text-[10px] mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
