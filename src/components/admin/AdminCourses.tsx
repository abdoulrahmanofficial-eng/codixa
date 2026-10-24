import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Edit3, Loader2, XCircle, Plus, BookOpen, Percent } from 'lucide-react';
import SeedCoursePanel from '../../pages/SeedCoursePanel';
import { courses as staticCourses } from '../../data/courses';
import type { BackendCourse } from '../../lib/courseService';

interface Props {
  dynamicCourses: BackendCourse[];
  priceOverrides: Record<string, number>;
  discountCodes: { code: string; percentage: number; createdAt: number; active: boolean }[];
  profileUid?: string;
  setCoursePrice: (id: string, price: number, uid: string) => Promise<void>;
  removeCoursePrice: (id: string) => Promise<void>;
  createDiscountCode: (code: string, pct: number) => Promise<void>;
  deleteDiscountCode: (code: string) => Promise<void>;
  getAllDiscountCodes: () => Promise<any[]>;
  loadData: () => void;
  loading: boolean;
  lang: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AdminCourses({
  dynamicCourses, priceOverrides, discountCodes, profileUid, setCoursePrice, removeCoursePrice,
  createDiscountCode, deleteDiscountCode, getAllDiscountCodes, loadData, loading, lang,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newPct, setNewPct] = useState('');

  const allCourses = [
    ...staticCourses.map(c => ({ id: c.id, title: c.title, price: c.price, free: c.free, type: 'static' as const, icon: c.icon })),
    ...dynamicCourses.map(c => ({ id: c.id, title: c.title, price: c.price, free: c.free ?? true, type: 'dynamic' as const, icon: c.icon || '📚' })),
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}><SeedCoursePanel /></motion.div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-indigo-400" /></div>
      ) : (
        <>
          <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <BookOpen size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{lang === 'ar' ? 'أسعار الكورسات' : 'Course Prices'}</h3>
                <p className="text-slate-500 text-xs">{lang === 'ar' ? 'تعديل السعر يتجاوز السعر الافتراضي' : 'Editing overrides the default price'}</p>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {allCourses.map(c => {
                const effective = priceOverrides[c.id] ?? c.price;
                const overridden = priceOverrides[c.id] !== undefined;
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl shrink-0 border border-white/5">
                      {c.icon || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{c.title}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.type === 'static' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'}`}>
                          {c.type === 'static' ? (lang === 'ar' ? 'ثابت' : 'Static') : (lang === 'ar' ? 'ديناميكي' : 'Dynamic')}
                        </span>
                        {overridden && <span className="text-amber-400">• {lang === 'ar' ? 'معدل' : 'Overridden'}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {editing === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <input type="number" min="0" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                            className="w-20 bg-white/10 border border-white/20 rounded-lg py-1.5 px-2 text-white text-xs outline-none focus:border-indigo-500" />
                          <button onClick={async () => {
                            const p = parseInt(priceInput); if (isNaN(p) || p < 0) return;
                            setSaving(true); await setCoursePrice(c.id, p, profileUid || ''); await loadData(); setSaving(false); setEditing(null);
                          }} disabled={saving}
                            className="px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/25 disabled:opacity-40">
                            {saving ? <Loader2 size={10} className="animate-spin" /> : (lang === 'ar' ? 'حفظ' : 'Save')}
                          </button>
                          <button onClick={() => setEditing(null)} className="px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 text-[10px] font-bold hover:bg-rose-500/25">
                            <XCircle size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${overridden ? 'text-amber-400' : 'text-white'}`}>{effective} EGP</div>
                            {overridden && (
                              <button onClick={async () => { setSaving(true); await removeCoursePrice(c.id); await loadData(); setSaving(false); }}
                                className="text-[10px] text-rose-400 hover:text-rose-300 transition-all">
                                {lang === 'ar' ? 'إعادة افتراضي' : 'Reset'}
                              </button>
                            )}
                          </div>
                          <button onClick={() => { setEditing(c.id); setPriceInput(String(effective)); }}
                            className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center"
                            title={lang === 'ar' ? 'تعديل السعر' : 'Edit price'}>
                            <Edit3 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Percent size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{lang === 'ar' ? 'أكواد الخصم' : 'Discount Codes'}</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                  placeholder={lang === 'ar' ? 'الكود...' : 'Code...'}
                  className="w-28 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500" />
                <input type="number" min="1" max="100" value={newPct} onChange={e => setNewPct(e.target.value)}
                  placeholder="%"
                  className="w-20 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500" />
                <button onClick={async () => {
                  if (!newCode || !newPct) return;
                  const p = parseInt(newPct); if (isNaN(p) || p < 1 || p > 100) return;
                  await createDiscountCode(newCode, p);
                  setNewCode(''); setNewPct('');
                  window.location.reload();
                }} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20">
                  <Plus size={16} />
                </button>
              </div>
              {discountCodes.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">{lang === 'ar' ? 'لا توجد أكواد خصم' : 'No discount codes'}</p>
              ) : (
                <div className="grid gap-2">
                  {discountCodes.map(dc => (
                    <div key={dc.code} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold font-mono text-sm">{dc.code}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400">{dc.percentage}%</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dc.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {dc.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                        </span>
                      </div>
                      <button onClick={async () => {
                        await deleteDiscountCode(dc.code);
                        window.location.reload();
                      }} className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center">
                        <XCircle size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
