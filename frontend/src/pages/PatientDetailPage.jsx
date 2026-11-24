import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Activity,
  Pill,
  TestTube,
  FileText,
  CheckSquare,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  HeartPulse
} from 'lucide-react';

export const PatientDetailPage = () => {
  const { lang, selectedPatientId, navigateTo, showToast } = useApp();
  const [data, setData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('vitals');
  const [loading, setLoading] = useState(true);

  // Form states for adding new vitals
  const [newVital, setNewVital] = useState({
    bp_systolic: 128,
    bp_diastolic: 80,
    heart_rate: 76,
    temperature: 37.0,
    respiratory_rate: 18,
    spo2: 98,
    notes: 'قراءة دورية قبل التسليم'
  });

  // Form state for nursing note
  const [noteAr, setNoteAr] = useState('');
  const [noteEn, setNoteEn] = useState('');

  // Form state for new task
  const [newTask, setNewTask] = useState({
    description_ar: '',
    priority: 'high',
    due_time: '16:00',
    notes: ''
  });

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${selectedPatientId || 101}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.notes && d.notes.length > 0) {
          setNoteAr(d.notes[0].note_ar);
          setNoteEn(d.notes[0].note_en);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [selectedPatientId]);

  const handleSaveVital = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVital)
      });
      if (res.ok) {
        showToast(lang === 'ar' ? 'تم حفظ وتوثيق العلامات الحيوية بنجاح' : 'Vital signs recorded successfully');
        loadPatientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_ar: noteAr, note_en: noteEn, translation_approved: true })
      });
      if (res.ok) {
        const body = await res.json();
        setNoteEn(body.note_en);
        showToast(lang === 'ar' ? 'تم توثيق الملاحظة السريرية بنجاح' : 'Clinical note saved successfully');
        loadPatientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.description_ar) return;
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        showToast(lang === 'ar' ? 'تمت إضافة المهمة بنجاح' : 'Task added successfully');
        setNewTask({ description_ar: '', priority: 'high', due_time: '16:00', notes: '' });
        loadPatientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMedStatus = async (medId, status) => {
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}/medications/${medId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(lang === 'ar' ? 'تم تحديث حالة إعطاء الدواء' : 'Medication status updated');
        loadPatientData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold text-xs animate-pulse">
        {lang === 'ar' ? 'جاري تحميل ملف التوثيق السريري للمريض...' : 'Loading patient clinical file...'}
      </div>
    );
  }

  const patient = data.patient;

  return (
    <div className="space-y-6">
      {/* Top Patient Summary Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#075080] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                {patient.mrn}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">
                {lang === 'ar' ? patient.name_ar : patient.name_en}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                ({patient.age} {lang === 'ar' ? 'سنة' : 'yo'} • {patient.gender})
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {lang === 'ar' ? `غرفة ${patient.room} - سرير ${patient.bed} | ${patient.department}` : `Room ${patient.room} - Bed ${patient.bed} | ${patient.department}`}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                {lang === 'ar' ? `الحساسية: ${patient.allergies}` : `Allergy: ${patient.allergies}`}
              </span>
              <span className="text-[#075080] font-bold bg-sky-50 px-2 py-0.5 rounded">
                {lang === 'ar' ? `كود الإنعاش: ${patient.code_status}` : `Code: ${patient.code_status}`}
              </span>
              <span className="text-emerald-700 font-bold bg-[#EAF6E8] px-2 py-0.5 rounded">
                GCS: {patient.gcs}/15
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('handover-ai', patient.id)}
              className="py-2.5 px-4 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'ar' ? 'إنشاء التسليم الذكي (SBAR)' : 'Generate AI SBAR'}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'vitals', labelAr: 'العلامات الحيوية (Vitals)', labelEn: 'Vital Signs', icon: Activity, count: data.vitals.length },
            { id: 'meds', labelAr: 'سجل الأدوية (eMAR)', labelEn: 'Medications', icon: Pill, count: data.medications.length },
            { id: 'labs', labelAr: 'الفحوصات المخبرية (Labs)', labelEn: 'Laboratory', icon: TestTube, count: data.labs.length },
            { id: 'notes', labelAr: 'الملاحظات التمريضية (Notes)', labelEn: 'Nursing Notes', icon: FileText, count: data.notes.length },
            { id: 'tasks', labelAr: 'المهام المعلقة (Tasks)', labelEn: 'Pending Tasks', icon: CheckSquare, count: data.tasks.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                  isActive
                    ? 'border-[#45A83D] text-[#075080] bg-[#EAF6E8]/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#45A83D]' : 'text-slate-400'}`} />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#45A83D] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: VITALS */}
      {activeSubTab === 'vitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vitals History Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-[#075080] mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'سجل العلامات الحيوية الموثقة' : 'Recorded Vital Signs History'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3 text-start">{lang === 'ar' ? 'التوقيت' : 'Time'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'ضغط الدم (BP)' : 'BP (mmHg)'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'النبض (HR)' : 'HR (bpm)'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'الحرارة (Temp)' : 'Temp (°C)'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'التنفس (RR)' : 'RR (/min)'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'الأكسجين (SpO2)' : 'SpO2 (%)'}</th>
                    <th className="p-3 text-start">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.vitals.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/60">
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{v.recorded_at}</td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {v.bp_systolic}/{v.bp_diastolic}
                      </td>
                      <td className="p-3 text-center font-bold text-[#075080]">{v.heart_rate}</td>
                      <td className="p-3 text-center">{v.temperature}°C</td>
                      <td className="p-3 text-center">{v.respiratory_rate}</td>
                      <td className="p-3 text-center font-bold text-[#287C36]">
                        {v.spo2}%
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{v.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Vital Reading Form */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-[#075080] mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'توثيق قراءة جديدة' : 'Record New Vitals'}</span>
            </h3>

            <form onSubmit={handleSaveVital} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'الضغط الانقباضي' : 'BP Systolic'}
                  </label>
                  <input
                    type="number"
                    value={newVital.bp_systolic}
                    onChange={e => setNewVital({ ...newVital, bp_systolic: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'الضغط الانبساطي' : 'BP Diastolic'}
                  </label>
                  <input
                    type="number"
                    value={newVital.bp_diastolic}
                    onChange={e => setNewVital({ ...newVital, bp_diastolic: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'النبض (HR)' : 'Heart Rate'}
                  </label>
                  <input
                    type="number"
                    value={newVital.heart_rate}
                    onChange={e => setNewVital({ ...newVital, heart_rate: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'الحرارة (°C)' : 'Temperature'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVital.temperature}
                    onChange={e => setNewVital({ ...newVital, temperature: parseFloat(e.target.value) || 37.0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'التنفس (RR)' : 'Respiratory Rate'}
                  </label>
                  <input
                    type="number"
                    value={newVital.respiratory_rate}
                    onChange={e => setNewVital({ ...newVital, respiratory_rate: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'الأكسجين (SpO2 %)' : 'SpO2 (%)'}
                  </label>
                  <input
                    type="number"
                    value={newVital.spo2}
                    onChange={e => setNewVital({ ...newVital, spo2: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {lang === 'ar' ? 'ملاحظة سريرية' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={newVital.notes}
                  onChange={e => setNewVital({ ...newVital, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-[#45A83D] hover:bg-[#287C36] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ وتوثيق القراءة' : 'Save Vitals'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MEDS */}
      {activeSubTab === 'meds' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#075080] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'سجل إعطاء الأدوية السريرية (eMAR)' : 'Electronic Medication Administration Record'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {lang === 'ar' ? 'تحقق مزدوج من الجرعات للمناوبة' : 'Double-check verification active'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.medications.map(m => {
              const isAdministered = m.status === 'administered';
              return (
                <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {lang === 'ar' ? m.name_ar : m.name_en}
                      </span>
                      <span className="text-xs bg-slate-100 text-[#075080] px-2 py-0.5 rounded font-mono font-bold">
                        {m.dose}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({m.route} • {m.frequency})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ar' ? 'الموعد المجدول:' : 'Scheduled:'} <span className="font-bold">{m.scheduled_time}</span>
                      {m.administered_at && ` • ${lang === 'ar' ? 'أعطي في:' : 'Given at:'} ${m.administered_at}`}
                      {m.notes && ` • ${m.notes}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAdministered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#45A83D]" />
                        <span>{lang === 'ar' ? 'تم الإعطاء' : 'Administered'}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateMedStatus(m.id, 'administered')}
                          className="px-3 py-1.5 rounded-lg bg-[#45A83D] text-white text-xs font-bold hover:bg-[#287C36] transition-all"
                        >
                          {lang === 'ar' ? 'توثيق الإعطاء' : 'Administer'}
                        </button>
                        <button
                          onClick={() => handleUpdateMedStatus(m.id, 'held')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
                        >
                          {lang === 'ar' ? 'إيقاف / تأجيل' : 'Hold'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LABS */}
      {activeSubTab === 'labs' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#075080] flex items-center gap-2">
              <TestTube className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'نتائج الفحوصات والتحاليل المخبرية' : 'Laboratory & Diagnostic Reports'}</span>
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
              {data.labs.filter(l => l.status === 'pending').length} {lang === 'ar' ? 'فحص بانتظار الاعتماد' : 'Pending Lab'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.labs.map(lab => {
              const isPending = lab.status === 'pending';
              return (
                <div
                  key={lab.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-200'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {lang === 'ar' ? lab.test_name_ar : lab.test_name_en}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isPending ? (lang === 'ar' ? '⏳ قيد الفحص بالمختبر' : 'Pending') : (lang === 'ar' ? '✓ معتمد' : 'Completed')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? 'توقيت الطلب:' : 'Ordered:'} <span className="font-mono">{lab.ordered_at}</span> • {lab.specimen_type}
                  </p>

                  {isPending ? (
                    <div className="p-2.5 rounded-lg bg-amber-100/70 text-amber-900 text-xs">
                      <span className="font-bold block mb-0.5">
                        {lang === 'ar' ? 'تنبيه التسليم التمريضي:' : 'Handover Caution:'}
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {lab.pending_reason || (lang === 'ar' ? 'العينة قيد المعالجة، يلزم إشعار الطبيب فور صدورها.' : 'Sample processing in central lab.')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                      <span className="text-slate-500 block text-[10px]">{lang === 'ar' ? 'النتيجة المعتمدة:' : 'Result:'}</span>
                      <p className="font-extrabold text-[#075080] mt-0.5">{lab.result_value}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {lang === 'ar' ? 'المعدل الطبيعي:' : 'Normal Reference:'} {lab.normal_range}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NOTES */}
      {activeSubTab === 'notes' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#075080] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'الملاحظات التمريضية والتوثيق السريري' : 'Nursing Clinical Notes'}</span>
            </h3>
            <button
              onClick={() => navigateTo('translation', patient.id)}
              className="text-xs text-[#075080] hover:text-[#3A83B5] font-bold flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'محرر الترجمة الثنائي' : 'Bilingual Translation Editor'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'ar' ? 'الملاحظة باللغة العربية' : 'Arabic Clinical Note'}
              </label>
              <textarea
                rows={6}
                value={noteAr}
                onChange={e => setNoteAr(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#45A83D] outline-none"
                placeholder={lang === 'ar' ? 'اكتب ملاحظات المناوبة التمريضية...' : 'Enter Arabic notes...'}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'ar' ? 'الترجمة الإنجليزية المعتمدة (Bilingual Standard)' : 'Approved English Translation'}
              </label>
              <textarea
                rows={6}
                value={noteEn}
                onChange={e => setNoteEn(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#075080] outline-none font-sans"
                placeholder={lang === 'ar' ? 'الترجمة السريرية باللغة الإنجليزية...' : 'Enter English translation...'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleSaveNote}
              className="py-2.5 px-6 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ واعتماد الملاحظة السريرية' : 'Save & Approve Note'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: TASKS */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-[#075080] mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'مهام المريض المجدولة للمناوبة الحالية والقادمة' : 'Scheduled Shift Patient Tasks'}</span>
            </h3>

            <div className="space-y-3">
              {data.tasks.map(t => (
                <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.priority === 'high' ? (lang === 'ar' ? 'أولوية قصوى' : 'High') : (lang === 'ar' ? 'أولوية متوسطة' : 'Medium')}
                      </span>
                      <span className="text-xs font-bold text-[#075080] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t.due_time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {lang === 'ar' ? t.description_ar : t.description_en}
                    </p>
                    {t.notes && <p className="text-[11px] text-slate-500 mt-1">{t.notes}</p>}
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    t.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status === 'completed' ? (lang === 'ar' ? 'مكتملة' : 'Done') : (lang === 'ar' ? 'قيد الترحيل' : 'To Carryover')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Task Form */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-[#075080] mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'إضافة مهمة جديدة' : 'Add New Task'}</span>
            </h3>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {lang === 'ar' ? 'وصف المهمة' : 'Task Description'}
                </label>
                <textarea
                  rows={3}
                  value={newTask.description_ar}
                  onChange={e => setNewTask({ ...newTask, description_ar: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder={lang === 'ar' ? 'مثال: فحص موضع القسطرة والنبض البعيد...' : 'e.g. Inspect puncture site...'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="high">{lang === 'ar' ? 'عالية (High)' : 'High'}</option>
                    <option value="medium">{lang === 'ar' ? 'متوسطة (Med)' : 'Medium'}</option>
                    <option value="routine">{lang === 'ar' ? 'روتينية' : 'Routine'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ar' ? 'وقت الاستحقاق' : 'Due Time'}
                  </label>
                  <input
                    type="time"
                    value={newTask.due_time}
                    onChange={e => setNewTask({ ...newTask, due_time: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدراج المهمة' : 'Add Task'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
