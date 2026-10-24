import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, variant = 'default', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div className="glass rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl relative"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
              <X size={16} />
            </button>
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel}
                className="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all">
                {cancelLabel || 'Cancel'}
              </button>
              <button onClick={onConfirm}
                className={`px-5 py-2 rounded-xl text-white text-sm font-bold transition-all ${
                  variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}>
                {confirmLabel || 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
