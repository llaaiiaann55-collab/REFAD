import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Send,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';

export const ConfirmationPage = () => {
  const { lang, selectedPatientId, currentUser, switchRole, showToast, navigateTo } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [tasksAcknowledged, setTasksAcknowledged] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const loadHandover = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHandover();
  }, [selectedPatientId]);

  const handleRequestClarification = async () => {
    if (!clarificationQuestion || !data.latest_handover) return;
    try {
      const res = await fetch('/api/handover/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handover_id: data.latest_handover.id,
          question: clarificationQuestion
        })
      });
      if (res.ok) {
        showToast(
          lang === 'ar' ? 'تم إرسال طلب الاستفسار إلى الممرضة المسلمة' : 'Clarification request sent to outgoing nurse',
          'info'
        );
        setShowClarificationModal(false);
        setClarificationQuestion('');
        loadHandover();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplyClarification = async () => {
    if (!clarificationResponse || !data.latest_handover) return;
    try {
      const res = await fetch('/api/handover/reply-clarification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handover_id: data.latest_handover.id,
          response: clarificationResponse
        })
      });
      if (res.ok) {
        showToast(
          lang === 'ar' ? 'تم توثيق الرد على الاستفسار وإشعار الممرضة المستلمة' : 'Clarification answered',
          'success'
        );
        setClarificationResponse('');
        loadHandover();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinalConfirm = async () => {
    if (!tasksAcknowledged) {
      showToast(
        lang === 'ar' ? 'يرجى تأكيد الاطلاع وقبول استلام المهام المعلقة أولاً' : 'Please accept pending tasks first',
        'error'
      );
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch('/api/handover/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handover_id: data.latest_handover?.id || 1,
          acknowledgment_notes: 'تمت المراجعة السريرية الشاملة وقبول رعاية المريض واستلام مهام القسطرة والتحاليل المعلقة'
        })
      });
      if (res.ok) {
        showToast(
          lang === 'ar'
            ? 'تم اعتماد واستلام المناوبة رسمياً، ونقل المهام المعلقة لجدول المناوبة المسائية!'
            : 'Shift handover confirmed & pending tasks transferred to evening roster!'
        );
        loadHandover();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-slate-200">
        <ClipboardCheck className="w-10 h-10 text-[#45A83D] mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-[#075080]">
          {lang === 'ar' ? 'جاري تحميل تفاصيل اعتماد تسليم المناوبة...' : 'Loading handover confirmation details...'}
        </h3>
      </div>
    );
  }

  const patient = data.patient;
  const handover = data.latest_handover;
  const isAcknowledged = handover?.status === 'acknowledged';
  const isIncomingNurse = currentUser?.role === 'receiving_nurse' || currentUser?.id === 2;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#EAF6E8] text-[#287C36]">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'تأكيد واعتماد استلام المناوبة (Shift Handover Confirmation)' : 'Shift Handover Confirmation'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'بروتوكول الاعتماد الرقمي الثنائي: مراجعة الممرض المستلم، طلب الاستيضاحات، وتحويل المسؤولية السريرية والمهام رسمياً'
                  : 'Two-way digital verification, clarification requests, and authorized care transfer'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Banner */}
        <div className="flex items-center gap-2">
          {!isIncomingNurse ? (
            <button
              onClick={() => switchRole(2)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'التبديل إلى نورة (الممرضة المستلمة)' : 'Switch to Noura (Receiver)'}</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-[#287C36] bg-[#EAF6E8] px-3.5 py-2 rounded-xl border border-[#45A83D]/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'أنت الآن بدور الممرضة المستلمة (نورة)' : 'You are Receiving Nurse (Noura)'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Handover Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isAcknowledged
            ? 'bg-[#EAF6E8] border-[#45A83D]/40 text-[#287C36]'
            : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white shadow-xs">
            {isAcknowledged ? (
              <CheckCircle2 className="w-6 h-6 text-[#45A83D]" />
            ) : (
              <Clock className="w-6 h-6 text-[#075080]" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              {isAcknowledged
                ? (lang === 'ar' ? '✓ تم تأكيد استلام رعاية المريض رسمياً ونقل كافة المهام للمناوبة المسائية' : '✓ Care Responsibility Formally Acknowledged')
                : (lang === 'ar' ? 'تقرير التسليم بانتظار مراجعة واعتماد الممرضة المستلمة (نورة الشهري)' : 'Handover Awaiting Receiving Nurse Confirmation')}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'ar'
                ? `المسلم: سارة العتيبي (صباحاً) ➔ المستلم: نورة الشهري (مساءً) | المريض: ${patient.name_ar} (غرفة ${patient.room})`
                : `From: Sarah (Day) ➔ To: Noura (Eve) | Patient: ${patient.name_en} (Room ${patient.room})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {handover?.signed_at && (
            <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
              {handover.signed_at.replace('T', ' ').substring(0, 16)}
            </span>
          )}
        </div>
      </div>

      {/* SBAR Review Summary for Receiving Nurse */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-[#075080] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#45A83D]" />
            <span>{lang === 'ar' ? 'ملخص تقرير التسليم المعتمد سريرياً (SBAR Report)' : 'Approved SBAR Clinical Handover'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">CCU-POST-PCI-101</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100">
            <span className="font-bold text-[#075080] block mb-1">
              [S] {lang === 'ar' ? 'الحالة الراهنة (Situation):' : 'Situation:'}
            </span>
            <p className="text-slate-700">{handover?.situation || 'الحالة العامة مستقرة بعد القسطرة.'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-bold text-slate-800 block mb-1">
              [B] {lang === 'ar' ? 'الخلفية المرضية (Background):' : 'Background:'}
            </span>
            <p className="text-slate-700">{handover?.background || 'تاريخ مرضي: ارتفاع ضغط الدم، حساسية البنسلين.'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EAF6E8]/40 border border-[#45A83D]/20">
            <span className="font-bold text-[#287C36] block mb-1">
              [A] {lang === 'ar' ? 'التقييم التمريضي (Assessment):' : 'Assessment:'}
            </span>
            <p className="text-slate-700">{handover?.assessment || 'علامات حيوية مستقرة 130/82، تشبع أكسجين 98%، الهيبارين مستمر.'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70">
            <span className="font-bold text-amber-900 block mb-1">
              [R] {lang === 'ar' ? 'التوصيات والمهام (Recommendation):' : 'Recommendation:'}
            </span>
            <p className="text-amber-950 font-semibold">{handover?.recommendation || 'متابعة فحص التروبونين وفحص موقع القسطرة الساعة 16:00.'}</p>
          </div>
        </div>

        {/* Pending Tasks Explicit Handover Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              {lang === 'ar' ? 'المهام المعلقة المنقولة لمسؤوليتك في هذه المناوبة:' : 'Tasks Transferred to Your Care Responsibility:'}
            </span>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {data.tasks.filter(t => t.status !== 'completed').length} {lang === 'ar' ? 'مهام ملزمة' : 'Mandatory'}
            </span>
          </div>

          <div className="space-y-2">
            {data.tasks.map(t => (
              <div key={t.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{t.description_ar}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {lang === 'ar' ? 'توقيت الاستحقاق:' : 'Due:'} <strong className="text-[#075080]">{t.due_time}</strong> • {t.priority === 'high' ? 'أولوية قصوى' : 'أولوية متوسطة'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {lang === 'ar' ? 'بانتظار قبولك' : 'Pending Transfer'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clarification Section */}
        {handover?.clarification_text && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>{lang === 'ar' ? 'استفسار من الممرضة المستلمة:' : 'Clarification Requested by Receiver:'}</span>
            </div>
            <p className="text-slate-800 font-medium ps-6">{handover.clarification_text}</p>

            {handover.clarification_response ? (
              <div className="ps-6 pt-2 border-t border-amber-200 text-slate-700">
                <span className="font-bold text-[#287C36] block mb-0.5">
                  {lang === 'ar' ? 'رد الممرضة المسلمة (سارة):' : 'Response from Sarah:'}
                </span>
                <p className="bg-white p-2 rounded border border-amber-200">{handover.clarification_response}</p>
              </div>
            ) : !isIncomingNurse ? (
              <div className="ps-6 pt-2">
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'اكتب ردك التوضيحي هنا...' : 'Type response...'}
                  value={clarificationResponse}
                  onChange={e => setClarificationResponse(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs mb-2"
                />
                <button
                  onClick={handleReplyClarification}
                  className="px-3 py-1 bg-[#45A83D] text-white text-xs font-bold rounded"
                >
                  {lang === 'ar' ? 'إرسال الرد التوضيحي' : 'Send Clarification Response'}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Confirmation Actions */}
      {!isAcknowledged && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={tasksAcknowledged}
              onChange={e => setTasksAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded text-[#45A83D] focus:ring-[#45A83D]"
            />
            <span className="text-xs font-bold text-slate-800">
              {lang === 'ar'
                ? 'أؤكد أنا الممرضة المستلمة بأنني راجعت حالة المريض، وفحصت المهام المعلقة، وأتحمل مسؤولية الرعاية السريرية الكاملة للمناوبة المسائية.'
                : 'I hereby confirm reviewing patient status, pending labs, and officially accept clinical responsibility for this shift.'}
            </span>
          </label>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowClarificationModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#075080]" />
              <span>{lang === 'ar' ? 'طلب استيضاح' : 'Request Clarification'}</span>
            </button>

            <button
              onClick={handleFinalConfirm}
              disabled={isConfirming || !tasksAcknowledged}
              className={`py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                tasksAcknowledged
                  ? 'bg-[#45A83D] hover:bg-[#287C36] text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConfirming ? (lang === 'ar' ? 'جاري الاعتماد...' : 'Accepting...') : (lang === 'ar' ? 'تأكيد واعتماد الاستلام رسمياً' : 'Accept Care Responsibility')}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-[#075080]" />
              <h3 className="font-bold text-sm text-[#075080]">
                {lang === 'ar' ? 'طلب استيضاح حول تقرير التسليم' : 'Request Clarification on Handover'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {lang === 'ar'
                ? 'إذا كانت هناك معلومة غير واضحة (مثل وقت صدور نتيجة التروبونين أو تعليمات موضع القسطرة)، اكتب استفسارك ليتم إشعار الممرضة المسلمة فوراً وتوثيقه في سجل التدقيق.'
                : 'Send question to the outgoing nurse. This interaction will be logged in the clinical audit trail.'}
            </p>

            <textarea
              rows={4}
              value={clarificationQuestion}
              onChange={e => setClarificationQuestion(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs mb-4 focus:ring-2 focus:ring-[#075080] outline-none"
              placeholder={lang === 'ar' ? 'اكتب سؤالك أو استفسارك هنا...' : 'Type your question...'}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClarificationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleRequestClarification}
                className="px-5 py-2 rounded-xl bg-[#075080] text-white text-xs font-bold hover:bg-[#06426a]"
              >
                {lang === 'ar' ? 'إرسال الاستفسار' : 'Submit Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
