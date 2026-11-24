import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, Sun, Sunset, Moon, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ShiftsPage = () => {
  const { lang, navigateTo } = useApp();
  const [schedule, setSchedule] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    fetch('/api/shifts/schedule')
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(err => console.error(err));
  }, []);

  const getShiftIcon = (type) => {
    switch (type) {
      case 'morning':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'evening':
        return <Sunset className="w-5 h-5 text-indigo-500" />;
      case 'night':
        return <Moon className="w-5 h-5 text-sky-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#45A83D]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-[#075080]" />
            <h1 className="text-xl font-extrabold text-[#075080]">
              {lang === 'ar' ? 'جدول المناوبات والتعيينات التمريضية' : 'Nursing Shift Schedule & Rostering'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'ar'
              ? 'توزيع التمريض على الفترات الصباحية والمسائية والليلية مع حصر المرضى ونوافذ التسليم'
              : 'Nurse allocation across Morning, Evening, and Night shifts with patient roster and handoff windows'}
          </p>
        </div>

        {/* Date & Dept Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {lang === 'ar' ? 'اليوم: 24 نوفمبر 2026' : 'Today: Nov 24, 2026'}
          </span>
          <span className="text-xs font-bold text-[#287C36] bg-[#EAF6E8] px-3 py-1.5 rounded-lg border border-[#45A83D]/30">
            {lang === 'ar' ? 'وحدة CCU' : 'CCU Ward'}
          </span>
        </div>
      </div>

      {/* Visual Shift Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schedule.map((item) => {
          const shift = item.shift;
          const isCurrent = shift.shift_type === 'morning';
          const isNext = shift.shift_type === 'evening';

          return (
            <div
              key={shift.id}
              className={`bg-white rounded-2xl shadow-xs border transition-all overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-[#45A83D] ring-2 ring-[#45A83D]/20'
                  : isNext
                  ? 'border-indigo-300 ring-1 ring-indigo-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className={`p-4 border-b ${isCurrent ? 'bg-[#EAF6E8]/40' : isNext ? 'bg-indigo-50/40' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getShiftIcon(shift.shift_type)}
                    <h3 className="font-extrabold text-sm text-[#075080]">
                      {lang === 'ar' ? shift.name_ar : shift.name_en}
                    </h3>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#45A83D] text-white">
                      {lang === 'ar' ? 'جارية الآن' : 'Active Now'}
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {lang === 'ar' ? 'المناوبة التالية' : 'Next Shift'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{shift.start_time} – {shift.end_time}</span>
                  <span className="text-slate-400">•</span>
                  <span>{lang === 'ar' ? '8 ساعات' : '8 Hours'}</span>
                </div>
              </div>

              {/* Nurses & Assigned Patients */}
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {lang === 'ar' ? 'الممرضون المسؤولون' : 'Assigned Nurses'}
                  </span>
                  <div className="space-y-2">
                    {item.nurses.map((nurseName, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👩‍⚕️</span>
                          <span className="font-bold text-slate-800">{nurseName}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#075080] bg-sky-50 px-2 py-0.5 rounded">
                          {isCurrent ? (lang === 'ar' ? 'مسلّمة' : 'Sender') : (lang === 'ar' ? 'مستلمة' : 'Receiver')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'ar' ? 'المرضى المخصصون' : 'Allocated Patients'}
                    </span>
                    <span className="text-[11px] font-bold text-[#287C36]">
                      {item.assignments.length} {lang === 'ar' ? 'مرضى' : 'Patients'}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {item.assignments.map((asg) => (
                      <div
                        key={asg.id}
                        onClick={() => navigateTo('patient-detail', asg.patient_id)}
                        className="p-2 rounded-lg border border-slate-100 hover:border-[#45A83D] bg-white cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-700">{asg.patient_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">غرفة {asg.room}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                {isCurrent ? (
                  <button
                    onClick={() => navigateTo('confirmation', 101)}
                    className="w-full py-2 px-3 rounded-xl bg-[#45A83D] hover:bg-[#287C36] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {lang === 'ar' ? 'إجراء تسليم المناوبة (Handover)' : 'Initiate Shift Handover'}
                  </button>
                ) : isNext ? (
                  <button
                    onClick={() => navigateTo('confirmation', 101)}
                    className="w-full py-2 px-3 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {lang === 'ar' ? 'استلام المناوبة ومراجعة المرضى' : 'Receive Shift & Review'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
                  >
                    {lang === 'ar' ? 'مجدولة لاحقاً' : 'Scheduled Later'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
