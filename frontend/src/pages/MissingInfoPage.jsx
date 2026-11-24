import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  BrainCircuit,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const MissingInfoPage = () => {
  const { lang, selectedPatientId, navigateTo, showToast } = useApp();
  const [validation, setValidation] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvedCodes, setResolvedCodes] = useState([]);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const fetchValidationData = async () => {
    setLoading(true);
    try {
      const [valRes, patRes] = await Promise.all([
        fetch(`/api/handover/validate/${selectedPatientId || 101}`, { method: 'POST' }),
        fetch(`/api/patients/${selectedPatientId || 101}`)
      ]);
      if (valRes.ok) setValidation(await valRes.json());
      if (patRes.ok) {
        const pd = await patRes.json();
        setPatient(pd.patient);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationData();
  }, [selectedPatientId]);

  const handleMarkUnavailable = (findingCode, reason) => {
    setResolvedCodes(prev => [...prev, findingCode]);
    showToast(
      lang === 'ar'
        ? 'تم توثيق المعلومة بأنها "غير متوفرة مشروعاً" وإعفاؤها من حظر التسليم'
        : 'Documented as legitimately unavailable and exempted from handover block',
      'info'
    );
  };

  if (loading || !validation) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-slate-200">
        <AlertOctagon className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-[#075080]">
          {lang === 'ar' ? 'جاري فحص سلامة واكتمال السجلات التمريضية...' : 'Auditing clinical records completeness...'}
        </h3>
      </div>
    );
  }

  const redCount = validation.red_count || 0;
  const yellowCount = validation.yellow_count || 0;
  const isSafeToHandover = redCount === 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'مكتشف المعلومات والبيانات الناقصة (Missing Information Detector)' : 'Missing Information Detector'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'محرك التحقق الذكي قبل اعتماد التسليم: يكشف نقص العلامات الحيوية، الفحوصات المعلقة، والمهام غير المكتملة'
                  : 'Pre-handover safety validation: detects missing vitals, pending labs, and unresolved tasks'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('patient-detail', selectedPatientId || 101)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>{lang === 'ar' ? 'ملف التوثيق' : 'Document'}</span>
          </button>
          <button
            onClick={() => navigateTo('handover-ai', selectedPatientId || 101)}
            className="px-4 py-2 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'ar' ? 'الانتقال لتقرير SBAR' : 'To SBAR'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Traffic Light Status Summary Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-xs transition-all ${
          redCount > 0
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : yellowCount > 0
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-[#EAF6E8] border-[#45A83D]/40 text-[#287C36]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {redCount > 0 ? (
              <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
            ) : yellowCount > 0 ? (
              <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-[#45A83D] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base">
                  {redCount > 0 && (lang === 'ar' ? 'تنبيه أحمر: معلومات إلزامية مفقودة تمنع إتمام التسليم' : 'Red Alert: Required Information Missing')}
                  {redCount === 0 && yellowCount > 0 && (lang === 'ar' ? 'تنبيه أصفر: يتطلب توضيحاً سريرياً أو ترحيل مهام' : 'Yellow Alert: Needs Clinical Clarification / Carryover')}
                  {redCount === 0 && yellowCount === 0 && (lang === 'ar' ? 'الحالة خضراء: التوثيق السريري مكتمل وجاهز للتسليم' : 'Green Status: Complete & Safe to Handover')}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white shadow-xs">
                  {patient?.name_ar} (غرفة {patient?.room})
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed max-w-3xl">
                {lang === 'ar'
                  ? 'يقوم النظام بمراجعة معايير السلامة السريرية تلقائياً. لا يتم حظر التسليم إذا كانت المعلومة غير متوفرة بشكل مشروع، حيث يمكن للممرض توثيق السبب وإحالتها للمناوبة القادمة.'
                  : 'The engine audits mandatory clinical data points. Legitimate unavailability can be documented without blocking continuity of care.'}
              </p>
            </div>
          </div>

          {/* Traffic Light Badges */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-white p-2 rounded-xl shadow-xs border border-slate-200">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${redCount > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span>🔴</span>
              <span>{redCount} {lang === 'ar' ? 'حرج' : 'Red'}</span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${yellowCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span>🟡</span>
              <span>{yellowCount} {lang === 'ar' ? 'تنبيه' : 'Yellow'}</span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${redCount === 0 && yellowCount === 0 ? 'bg-[#45A83D] text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span>🟢</span>
              <span>{lang === 'ar' ? 'مكتمل' : 'Green'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#075080]">
            {lang === 'ar' ? 'بنود التقييم والتنبيهات المكتشفة' : 'Detected Validation Findings'}
          </h3>
          <span className="text-xs text-slate-500">
            {validation.findings.length} {lang === 'ar' ? 'عناصر تم فحصها' : 'Items Evaluated'}
          </span>
        </div>

        <div className="p-6 divide-y divide-slate-100 space-y-4">
          {validation.findings.map((item, index) => {
            const isResolved = resolvedCodes.includes(item.code);
            return (
              <div
                key={index}
                className={`pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl transition-all ${
                  isResolved
                    ? 'bg-slate-50 opacity-60'
                    : item.level === 'red'
                    ? 'bg-rose-50/40 border border-rose-200'
                    : 'bg-amber-50/40 border border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.level === 'red' ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {lang === 'ar' ? item.title_ar : item.title_en}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          item.level === 'red' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.level === 'red' ? (lang === 'ar' ? 'إلزامي' : 'Mandatory') : (lang === 'ar' ? 'توضيح ومتابعة' : 'Clarification')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {lang === 'ar' ? item.description_ar : item.description_en}
                    </p>

                    {isResolved && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#287C36] mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'تم توثيق الوضع السريري وإجازة التسليم' : 'Clinical justification documented'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!isResolved && (
                    <>
                      {item.allow_unavailable && (
                        <button
                          onClick={() => handleMarkUnavailable(item.code, 'Legitimately unavailable')}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all"
                        >
                          {lang === 'ar' ? 'توثيق كغير متوفر' : 'Mark Unavailable'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (item.field === 'tasks') navigateTo('tasks');
                          else if (item.field === 'notes') navigateTo('translation', selectedPatientId || 101);
                          else navigateTo('patient-detail', selectedPatientId || 101);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        {lang === 'ar' ? 'استكمال في الملف' : 'Resolve in File'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
