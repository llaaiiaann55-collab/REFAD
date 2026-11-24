import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  Edit3,
  Clock,
  ArrowRight,
  ArrowLeft,
  Link2,
  AlertOctagon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SmartHandoverPage = () => {
  const { lang, selectedPatientId, navigateTo, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nurseApproved, setNurseApproved] = useState(false);

  // Editable SBAR parts
  const [situation, setSituation] = useState('');
  const [background, setBackground] = useState('');
  const [assessment, setAssessment] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [traceability, setTraceability] = useState([]);
  const [showTraceability, setShowTraceability] = useState(true);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const fetchHandoverAI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/handover/generate/${selectedPatientId || 101}`, { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        setData(body);
        setSituation(body.sbar.situation);
        setBackground(body.sbar.background);
        setAssessment(body.sbar.assessment);
        setRecommendation(body.sbar.recommendation);
        setTraceability(body.sbar.traceability || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoverAI();
  }, [selectedPatientId]);

  const handleSubmitHandover = async () => {
    if (!nurseApproved) {
      showToast(
        lang === 'ar' ? 'يرجى مراجعة التقرير والموافقة على صحته السريرية أولاً' : 'Please review and approve report accuracy first',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/handover/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId || 101,
          situation,
          background,
          assessment,
          recommendation,
          traceability_metadata: traceability,
          incoming_nurse_id: 2
        })
      });

      if (res.ok) {
        showToast(
          lang === 'ar'
            ? 'تم توقيع وإرسال تقرير التسليم بنجاح للممرضة المستلمة (نورة الشهري)'
            : 'Handover report signed and dispatched to receiving nurse (Noura Al-Shehri)'
        );
        navigateTo('confirmation', selectedPatientId || 101);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-slate-200">
        <Sparkles className="w-10 h-10 text-[#45A83D] mx-auto mb-3 animate-spin" />
        <h3 className="text-base font-bold text-[#075080]">
          {lang === 'ar' ? 'جاري تحليل السجلات وتوليد ملخص SBAR المعتمد سريرياً...' : 'Synthesizing documented EHR data into SBAR...'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar' ? 'ضمان 100% عدم وجود أي معلومات مضللة أو غير موثقة (Zero Hallucination)' : '100% verified against documented sources'}
        </p>
      </div>
    );
  }

  const patient = data.patient;
  const validation = data.validation;

  return (
    <div className="space-y-6">
      {/* Top Banner: Patient Info & AI Verification Guardrails */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-[#EAF6E8] text-[#287C36]">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-[#075080]">
                  {lang === 'ar' ? 'مساعد التسليم الذكي السريري (REFAD AI Handover)' : 'AI Clinical Smart Handover'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'ar' ? 'توليد تلقائي لهيكل SBAR بناءً على السجلات الفعلية فقط مع حصر النواقص والمهام المعلقة' : 'Strict zero-hallucination SBAR generation mapped directly to clinical EHR'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('missing-info', patient.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
            >
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <span>
                {lang === 'ar' ? `كشف النواقص (${validation.total_warnings} تنبيهات)` : `Missing Info (${validation.total_warnings})`}
              </span>
            </button>
            <button
              onClick={fetchHandoverAI}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'إعادة التوليد' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Traceability Guarantee Banner */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#EAF6E8] to-[#f4faf2] border border-[#45A83D]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#287C36] font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'ضمان الموثوقية السريرية: كافة العبارات مستخرجة حرفياً من ملف المريض والعلامات الحيوية، ولا يمكن للذكاء الاصطناعي اختلاق جرعات أو تشخيصات.'
                : 'Zero-hallucination clinical guarantee: all points derive directly from documented vital signs, medications, and lab orders.'}
            </span>
          </div>
          <button
            onClick={() => setShowTraceability(!showTraceability)}
            className="text-[11px] font-bold text-[#075080] hover:underline flex items-center gap-1 shrink-0 ms-2"
          >
            <span>{lang === 'ar' ? (showTraceability ? 'إخفاء مراجع الأدلة' : 'عرض مراجع الأدلة') : (showTraceability ? 'Hide Sources' : 'Show Sources')}</span>
            {showTraceability ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Traceability Metadata Accordion */}
        {showTraceability && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {lang === 'ar' ? 'سجل الأدلة والمصادر السريرية الموثقة:' : 'Traceable EHR Data Sources:'}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {traceability.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100">
                  <Link2 className="w-3.5 h-3.5 text-[#45A83D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">{item.item}</span>
                    <span className="text-[10px] text-slate-500">{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SBAR Structured Report Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#075080]">
              {lang === 'ar' ? 'تقرير التسليم والاستلام المنظم (SBAR Nursing Handover Report)' : 'Structured SBAR Handover Document'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? `المريض: ${patient.name_ar} (ملف ${patient.mrn}) | غرفة ${patient.room} | وحدة CCU`
                : `Patient: ${patient.name_en} (${patient.mrn}) | Room ${patient.room} | CCU`}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#45A83D]" />
            <span>{lang === 'ar' ? 'معتمد للمناوبة الصباحية' : 'Morning Shift Certified'}</span>
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* S: SITUATION */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#075080] text-white flex items-center justify-center font-extrabold text-sm">
                  S
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-[#075080]">
                    {lang === 'ar' ? 'Situation – الحالة الراهنة والمشكلة الحالية' : 'Situation'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'ar' ? 'التشخيص الطبي الأساسي، سبب التنويم، والحالة العامة' : 'Primary clinical problem and current status'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                {lang === 'ar' ? 'قابل للتعديل من الممرض' : 'Nurse Editable'}
              </span>
            </div>
            <textarea
              rows={2}
              value={situation}
              onChange={e => setSituation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-sky-300 bg-white text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#075080]"
            />
          </div>

          {/* B: BACKGROUND */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-extrabold text-sm">
                  B
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {lang === 'ar' ? 'Background – الخلفية السريرية والتاريخ المرضي' : 'Background'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'ar' ? 'تاريخ التنويم، الحساسية، كود الإنعاش، والحمية الغذائية' : 'Admission history, allergies, code status, precautions'}
                  </span>
                </div>
              </div>
            </div>
            <textarea
              rows={2}
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#075080]"
            />
          </div>

          {/* A: ASSESSMENT */}
          <div className="rounded-xl border border-emerald-200 bg-[#EAF6E8]/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#287C36] text-white flex items-center justify-center font-extrabold text-sm">
                  A
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-[#287C36]">
                    {lang === 'ar' ? 'Assessment – التقييم التمريضي والعلامات الحيوية' : 'Assessment'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'ar' ? 'آخر قراءات الضغط والنبض والأكسجين، الأدوية، وفحوصات المختبر' : 'Latest vitals, medications status, lab findings'}
                  </span>
                </div>
              </div>
            </div>
            <textarea
              rows={3}
              value={assessment}
              onChange={e => setAssessment(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#45A83D]"
            />
          </div>

          {/* R: RECOMMENDATION */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-extrabold text-sm">
                  R
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-900">
                    {lang === 'ar' ? 'Recommendation – التوصيات والمهام المعلقة للمناوبة التالية' : 'Recommendation'}
                  </h4>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    {lang === 'ar' ? 'الفحوصات المعلقة (التروبونين)، مهمة القسطرة الساعة 16:00، خطة المتابعة' : 'Pending labs, carryover tasks, care continuity actions'}
                  </span>
                </div>
              </div>
            </div>
            <textarea
              rows={3}
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-amber-300 bg-white text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Review & Submit Section */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={nurseApproved}
              onChange={e => setNurseApproved(e.target.checked)}
              className="w-4 h-4 rounded text-[#45A83D] focus:ring-[#45A83D]"
            />
            <span className="text-xs font-bold text-slate-700">
              {lang === 'ar'
                ? 'أقر أنا الممرضة المسلمة بأنني راجعت دقة وصحة بيانات التسليم ومطابقتها لحالة المريض الفعلية.'
                : 'I hereby certify that I reviewed and verified the clinical accuracy of this handover report.'}
            </span>
          </label>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('patient-detail', patient.id)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
            >
              {lang === 'ar' ? 'تعديل السجل الطبي' : 'Edit EHR'}
            </button>

            <button
              onClick={handleSubmitHandover}
              disabled={isSubmitting || !nurseApproved}
              className={`py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                nurseApproved
                  ? 'bg-[#075080] hover:bg-[#06426a] text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'ar' ? 'جاري الإرسال والتوقيع...' : 'Dispatching...') : (lang === 'ar' ? 'اعتماد وإرسال للممرضة المستلمة' : 'Sign & Dispatch to Incoming Nurse')}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
