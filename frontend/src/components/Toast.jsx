import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, lang } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed bottom-5 ${lang === 'ar' ? 'left-5' : 'right-5'} z-50 flex flex-col gap-2 max-w-sm w-full`}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-semibold backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-[#EAF6E8] text-[#287C36] border-[#45A83D]/40'
              : t.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-sky-50 text-[#075080] border-sky-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#45A83D] shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-[#3A83B5] shrink-0" />}
          <div className="flex-1 leading-snug">{t.message}</div>
        </div>
      ))}
    </div>
  );
};
