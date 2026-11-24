import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ArrowLeft, UserCheck, BarChart3, AlertOctagon } from 'lucide-react';

export const DemoBanner = () => {
  const { lang, navigateTo, switchRole, currentUser } = useApp();

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-gradient-to-r from-[#075080] via-[#0b649e] to-[#287C36] text-white px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Narrative info */}
        <div className="flex items-center gap-2.5 text-center lg:text-start">
          <div className="p-1 rounded-md bg-white/20 text-white shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <span className="font-extrabold text-emerald-200 uppercase tracking-wider text-[11px] me-1">
              {lang === 'ar' ? 'سيناريو العرض التفاعلي:' : 'Hackathon Demo Scenario:'}
            </span>
            <span className="text-white/90">
              {lang === 'ar'
                ? 'المريض 101 (فهد العتيبي): لديه فحص تروبونين معلق ومهمة فحص القسطرة الفخذية غير مكتملة الساعة 16:00.'
                : 'Patient 101 (Fahad Al-Otaibi): Pending Troponin lab & incomplete femoral check task at 16:00.'}
            </span>
          </div>
        </div>

        {/* Quick Demo Workflow Triggers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => navigateTo('handover-ai', 101)}
            className="px-2.5 py-1 rounded-md bg-white text-[#075080] hover:bg-emerald-50 font-bold transition-all shadow-sm flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'توليد SBAR الذكي' : 'Generate SBAR'}</span>
            <Arrow className="w-3 h-3" />
          </button>

          <button
            onClick={() => navigateTo('missing-info', 101)}
            className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold transition-all shadow-sm flex items-center gap-1"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'كشف النواقص (Yellow)' : 'Missing Info (Yellow)'}</span>
          </button>

          {currentUser?.id !== 2 ? (
            <button
              onClick={() => {
                switchRole(2);
                navigateTo('confirmation', 101);
              }}
              className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تبديل لنورة (المستلمة)' : 'Switch to Noura (Receiver)'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                switchRole(1);
                navigateTo('dashboard');
              }}
              className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold transition-all flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الرجوع لسارة (المسلمة)' : 'Switch to Sarah (Sender)'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (currentUser?.id !== 3) switchRole(3);
              navigateTo('supervisor');
            }}
            className="px-2.5 py-1 rounded-md bg-[#075080]/60 hover:bg-[#075080] border border-white/30 text-white font-bold transition-all flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'لوحة المشرف' : 'Supervisor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
