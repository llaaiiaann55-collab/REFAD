import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  HeartPulse,
  Activity
} from 'lucide-react';

export const PatientsPage = () => {
  const { lang, navigateTo } = useApp();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error(err));
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      (p.name_ar && p.name_ar.includes(searchQuery)) ||
      (p.name_en && p.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.mrn && p.mrn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.room && p.room.includes(searchQuery));
    
    const matchesCondition = conditionFilter === 'all' || p.condition === conditionFilter;
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#075080]" />
            <h1 className="text-xl font-extrabold text-[#075080]">
              {lang === 'ar' ? 'إدارة مرضى القسم (Patient Roster)' : 'Inpatient Management'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'ar'
              ? 'بطاقات المرضى المفصلة، درجات الملاحظة السريرية، ومتابعة جاهزية تقارير التسليم'
              : 'Detailed patient profiles, clinical acuity classification, and handover readiness'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث بالاسم، الغرفة، الملف...' : 'Search by name, room, MRN...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 pe-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#45A83D] focus:border-[#45A83D] outline-none w-56 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setConditionFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${conditionFilter === 'all' ? 'bg-white shadow-xs text-[#075080] font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setConditionFilter('critical')}
              className={`px-2.5 py-1 rounded-lg transition-all ${conditionFilter === 'critical' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'حرج' : 'Critical'}
            </button>
            <button
              onClick={() => setConditionFilter('observation')}
              className={`px-2.5 py-1 rounded-lg transition-all ${conditionFilter === 'observation' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'ملاحظة' : 'Observation'}
            </button>
            <button
              onClick={() => setConditionFilter('stable')}
              className={`px-2.5 py-1 rounded-lg transition-all ${conditionFilter === 'stable' ? 'bg-[#45A83D] text-white font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'مستقر' : 'Stable'}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const isP101 = patient.id === 101;
          return (
            <div
              key={patient.id}
              className={`bg-white rounded-2xl shadow-xs border transition-all overflow-hidden flex flex-col justify-between hover:shadow-md ${
                isP101
                  ? 'border-[#45A83D] ring-2 ring-[#45A83D]/20 bg-gradient-to-b from-white to-[#EAF6E8]/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="p-5">
                {/* Top Badge: MRN and Condition */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#075080] bg-sky-50 px-2 py-0.5 rounded border border-sky-200/50">
                      {patient.mrn}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      غرفة {patient.room} ({patient.bed})
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      patient.condition === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : patient.condition === 'observation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {patient.condition === 'critical' && (lang === 'ar' ? 'حرج / Critical' : 'Critical')}
                    {patient.condition === 'observation' && (lang === 'ar' ? 'للملاحظة / Observation' : 'Observation')}
                    {patient.condition === 'stable' && (lang === 'ar' ? 'مستقر / Stable' : 'Stable')}
                  </span>
                </div>

                {/* Patient Name & Age */}
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'ar' ? patient.name_ar : patient.name_en}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {patient.gender} • {patient.age} {lang === 'ar' ? 'سنة' : 'Years old'}
                </p>

                {/* Clinical Diagnosis */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                    {lang === 'ar' ? 'التشخيص الطبي الحالي:' : 'Current Diagnosis:'}
                  </span>
                  <p className="font-semibold text-slate-800 line-clamp-2">
                    {lang === 'ar' ? patient.diagnosis_ar : patient.diagnosis_en}
                  </p>
                </div>

                {/* Allergies and Code Status */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                    <span className="text-[10px] text-rose-600 font-bold block">
                      {lang === 'ar' ? 'الحساسية:' : 'Allergies:'}
                    </span>
                    <span className="text-slate-700 font-medium truncate block">
                      {patient.allergies || (lang === 'ar' ? 'لا يوجد' : 'NKDA')}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {lang === 'ar' ? 'كود الإنعاش:' : 'Code Status:'}
                    </span>
                    <span className="text-[#075080] font-bold">
                      {patient.code_status}
                    </span>
                  </div>
                </div>

                {/* Last updated and pending tasks count */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">{patient.last_updated}</span>
                  </div>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                    {patient.pending_tasks_count || 1} {lang === 'ar' ? 'مهام معلقة' : 'tasks'}
                  </span>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="p-3 bg-slate-50/60 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigateTo('patient-detail', patient.id)}
                  className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-[#075080] text-slate-800 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'ar' ? 'ملف التوثيق' : 'Documentation'}</span>
                </button>

                <button
                  onClick={() => navigateTo('handover-ai', patient.id)}
                  className="py-2 px-3 rounded-xl bg-[#075080] hover:bg-[#06426a] text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{lang === 'ar' ? 'التسليم الذكي' : 'Handover'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
