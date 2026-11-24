import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  ClipboardList,
  AlertCircle,
  Clock,
  HeartPulse,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText
} from 'lucide-react';

export const DashboardPage = () => {
  const { lang, currentUser, navigateTo } = useApp();
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patRes, taskRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/tasks')
        ]);
        if (patRes.ok) setPatients(await patRes.json());
        if (taskRes.ok) setTasks(await taskRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const pendingHandoversCount = patients.filter(p => p.handover_status !== 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👩‍⚕️</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#075080]">
              {lang === 'ar'
                ? `مرحبًا بعودتك، ${currentUser?.name_ar || 'الممرضة سارة'}`
                : `Welcome back, ${currentUser?.name_en || 'Nurse Sarah'}`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {lang === 'ar'
              ? 'وحدة العناية القلبية (CCU) – جناح A | محطة التمريض رقم 2'
              : 'Cardiac Care Unit (CCU) – Wing A | Nursing Station #2'}
          </p>
        </div>

        {/* Shift Timings Card */}
        <div className="flex items-center gap-3 bg-[#EAF6E8] p-3 rounded-xl border border-[#45A83D]/30 shrink-0">
          <Clock className="w-6 h-6 text-[#287C36]" />
          <div>
            <span className="text-[11px] font-bold text-[#287C36] block">
              {lang === 'ar' ? 'المناوبة الصباحية الجارية' : 'Current Active Shift'}
            </span>
            <span className="text-xs font-extrabold text-[#075080]">07:00 – 15:00</span>
            <span className="text-[10px] text-slate-500 block">
              {lang === 'ar' ? 'المناوبة التالية: المسائية (الممرضة نورة)' : 'Next Shift: Evening (Nurse Noura)'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Patients */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-[#45A83D] transition-all">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {lang === 'ar' ? 'عدد المرضى المسؤول عنهم' : 'Assigned Patients'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#075080]">{patients.length || 3}</span>
              <span className="text-[11px] text-slate-400 font-semibold">{lang === 'ar' ? 'مرضى' : 'Patients'}</span>
            </div>
            <span className="text-[10px] text-[#45A83D] font-bold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {lang === 'ar' ? 'جميعهم في CCU' : 'All in CCU'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#075080] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Handover Reports */}
        <div 
          onClick={() => navigateTo('confirmation')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-amber-400 cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {lang === 'ar' ? 'تقارير التسليم المعلقة' : 'Pending Handovers'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">{pendingHandoversCount || 1}</span>
              <span className="text-[11px] text-amber-500 font-semibold">{lang === 'ar' ? 'تقرير قيد الاعتماد' : 'Pending'}</span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {lang === 'ar' ? 'المريض 101 بانتظار الاستلام' : 'Patient 101 Awaiting Ack'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Incomplete Tasks */}
        <div 
          onClick={() => navigateTo('tasks')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-rose-400 cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {lang === 'ar' ? 'المهام غير المكتملة' : 'Incomplete Tasks'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{pendingTasksCount || 4}</span>
              <span className="text-[11px] text-slate-400 font-semibold">{lang === 'ar' ? 'مهام' : 'Tasks'}</span>
            </div>
            <span className="text-[10px] text-rose-500 font-bold mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lang === 'ar' ? 'مهمة عاجلة الساعة 16:00' : 'High priority at 16:00'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Current Shift Status */}
        <div 
          onClick={() => navigateTo('shifts')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-[#45A83D] cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {lang === 'ar' ? 'المناوبة الحالية' : 'Current Shift'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-[#287C36]">
                {lang === 'ar' ? 'صباحية' : 'Morning'}
              </span>
              <span className="text-[10px] text-slate-500">07:00-15:00</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold mt-1 inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#45A83D]" />
              {lang === 'ar' ? 'متبقي 45 دقيقة للتسليم' : '45 mins remaining'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EAF6E8] text-[#287C36] flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Assigned Patients Quick-Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#075080]">
              {lang === 'ar' ? 'المرضى المسؤول عنهم في هذه المناوبة' : 'Patients Under Your Care (Current Shift)'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'انقر على بطاقة أي مريض للبدء في التسليم الذكي أو التوثيق' : 'Click on any patient card to begin smart handover or clinical documentation'}
            </p>
          </div>
          <button
            onClick={() => navigateTo('patients')}
            className="text-xs font-bold text-[#075080] hover:text-[#3A83B5] flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'عرض السجل الكامل' : 'View Full Roster'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patients.map((p) => {
            const isP101 = p.id === 101;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border transition-all ${
                  isP101
                    ? 'border-[#45A83D] ring-2 ring-[#45A83D]/20 bg-gradient-to-b from-white to-[#EAF6E8]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#075080]">
                    {p.mrn}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.condition === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : p.condition === 'observation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {p.condition === 'critical' && (lang === 'ar' ? 'حرج / Critical' : 'Critical')}
                    {p.condition === 'observation' && (lang === 'ar' ? 'للملاحظة / Observation' : 'Observation')}
                    {p.condition === 'stable' && (lang === 'ar' ? 'مستقر / Stable' : 'Stable')}
                  </span>
                </div>

                {/* Name & Room */}
                <div className="mb-3">
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {lang === 'ar' ? p.name_ar : p.name_en}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {lang === 'ar' ? `غرفة ${p.room} - سرير ${p.bed}` : `Room ${p.room} - Bed ${p.bed}`} ({p.age} {lang === 'ar' ? 'سنة' : 'yo'})
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 font-medium">
                    {lang === 'ar' ? p.diagnosis_ar : p.diagnosis_en}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span>{lang === 'ar' ? 'المهام المعلقة:' : 'Pending Tasks:'}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {p.pending_tasks_count || 1} {lang === 'ar' ? 'مهام' : 'tasks'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigateTo('patient-detail', p.id)}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    {lang === 'ar' ? 'التوثيق' : 'Document'}
                  </button>
                  <button
                    onClick={() => navigateTo('handover-ai', p.id)}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>{lang === 'ar' ? 'تسليم SBAR' : 'SBAR'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Transition Timeline & Handover Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Shift Continuity Window */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#075080] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'نافذة تسليم واستلام المناوبة' : 'Shift Handover Window'}</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#287C36]">
              {lang === 'ar' ? 'جارية الآن' : 'Active'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {lang === 'ar' ? 'الممرضة المسلمة: سارة العتيبي' : 'Outgoing Nurse: Sarah Al-Otaibi'}
                </p>
                <span className="text-[11px] text-slate-500">
                  {lang === 'ar' ? 'المناوبة الصباحية (CCU) – سلمت 2 من 3 مرضى' : 'Morning Shift (CCU) – Handed 2/3'}
                </span>
              </div>
              <span className="text-xs font-bold text-[#287C36]">67%</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EAF6E8]/50 border border-[#45A83D]/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {lang === 'ar' ? 'الممرضة المستلمة: نورة الشهري' : 'Incoming Nurse: Noura Al-Shehri'}
                </p>
                <span className="text-[11px] text-slate-500">
                  {lang === 'ar' ? 'المناوبة المسائية (15:00 - 23:00) – بانتظار اعتماد تقرير المريض 101' : 'Evening Shift (15:00 - 23:00) – Awaiting P101'}
                </span>
              </div>
              <button
                onClick={() => navigateTo('confirmation', 101)}
                className="px-2.5 py-1 rounded bg-[#075080] text-white text-xs font-bold hover:bg-[#06426a]"
              >
                {lang === 'ar' ? 'مراجعة' : 'Review'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#075080] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'إجراءات التسليم السريع (REFAD Smart Actions)' : 'Quick Actions'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar'
                ? 'استخدم الميزات المدعومة بالذكاء الاصطناعي لضمان اكتمال التوثيق السريري قبل إنهاء المناوبة.'
                : 'Leverage AI features to ensure zero documentation gaps before concluding your shift.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigateTo('missing-info', 101)}
              className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-start transition-all"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 mb-1" />
              <span className="text-xs font-bold text-amber-900 block">
                {lang === 'ar' ? 'كاشف النواقص' : 'Missing Info'}
              </span>
              <span className="text-[10px] text-amber-700">
                {lang === 'ar' ? 'فحص سلامة التوثيق' : 'Validate Safety'}
              </span>
            </button>

            <button
              onClick={() => navigateTo('translation', 101)}
              className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 text-start transition-all"
            >
              <FileText className="w-5 h-5 text-[#075080] mb-1" />
              <span className="text-xs font-bold text-[#075080] block">
                {lang === 'ar' ? 'الترجمة السريرية' : 'Translation'}
              </span>
              <span className="text-[10px] text-slate-500">
                {lang === 'ar' ? 'عربي / English' : 'Arabic / English'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
