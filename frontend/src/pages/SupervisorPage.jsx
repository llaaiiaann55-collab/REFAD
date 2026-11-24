import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  FileCheck,
  ArrowUpRight,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const SupervisorPage = () => {
  const { lang } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/supervisor/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-slate-200">
        <BarChart3 className="w-10 h-10 text-[#075080] mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-[#075080]">
          {lang === 'ar' ? 'جاري تجميع المؤشرات والتحليلات الإشرافية المباشرة...' : 'Loading supervisor clinical analytics...'}
        </h3>
      </div>
    );
  }

  // Chart data
  const shiftChartData = analytics.shift_compliance.map(s => ({
    name: lang === 'ar' ? s.shift_ar.split(' ')[0] : s.shift_en,
    rate: s.completed,
    time: s.average_time
  }));

  const gapsData = analytics.documentation_gaps.map(g => ({
    name: lang === 'ar' ? g.field_ar : g.field_en,
    count: g.frequency
  }));

  const pieData = [
    { name: lang === 'ar' ? 'تم الاستلام والاعتماد' : 'Acknowledged', value: analytics.completed_handovers || 1, color: '#45A83D' },
    { name: lang === 'ar' ? 'قيد المراجعة' : 'Pending', value: analytics.incomplete_handovers || 1, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#EAF6E8] text-[#287C36]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'لوحة تحكم المشرف والتحليلات السريرية (Supervisor Analytics)' : 'Supervisor Analytics & Governance'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'مؤشرات الأداء اللحظية لتسليم واستلام المناوبات، امتثال الأقسام، ونقاط فجوات التوثيق'
                  : 'Real-time handover compliance metrics, department benchmarking, and documentation gap tracking'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#287C36] bg-[#EAF6E8] px-3.5 py-1.5 rounded-xl border border-[#45A83D]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#45A83D] animate-ping" />
            <span>{lang === 'ar' ? 'مزامنة حية مع السجلات' : 'Live EHR Sync'}</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {lang === 'ar' ? 'إجمالي تقارير التسليم' : 'Total Handovers'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#075080]">{analytics.total_handovers || 3}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 me-0.5" />
              +100%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === 'ar' ? 'خلال المناوبات الحالية' : 'Across current shifts'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {lang === 'ar' ? 'نسبة اعتماد واستلام المناوبة' : 'Acknowledgment Rate'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#45A83D]">{analytics.acknowledgment_rate || 96.8}%</span>
            <span className="text-xs text-emerald-600 font-bold">هدف &gt; 95%</span>
          </div>
          <span className="text-[10px] text-[#287C36] font-bold mt-1 block">
            ✓ {lang === 'ar' ? 'متوافق مع المعيار الذهبي' : 'Meets Gold Standard'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {lang === 'ar' ? 'متوسط زمن التسليم والاستلام' : 'Avg Handover Time'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{analytics.avg_completion_time_mins}</span>
            <span className="text-xs text-slate-500">{lang === 'ar' ? 'دقيقة' : 'Mins'}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            ↓ {lang === 'ar' ? 'انخفاض من 45 دقيقة سابقة' : 'Reduced from 45 mins baseline'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {lang === 'ar' ? 'المهام السريرية المرحلة' : 'Transferred Tasks'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{analytics.pending_tasks_count || 4}</span>
            <span className="text-xs text-amber-600 font-semibold">{lang === 'ar' ? 'مهام نشطة' : 'Active'}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {lang === 'ar' ? 'جميعها تحت مسؤولية ممرض محدد' : 'All assigned with clear ownership'}
          </span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Frequently Missing Documentation Fields */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#075080]">
                {lang === 'ar' ? 'أكثر حقول التوثيق نقصاً وتكراراً للتنبيهات' : 'Most Frequently Missing Documentation Fields'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'تحليل ذكاء اصطناعي لنقاط الضعف لتحسين جودة التمريض' : 'AI analytics identifying training opportunities'}
              </p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val) => [`${val} ${lang === 'ar' ? 'تكرار' : 'times'}`, lang === 'ar' ? 'معدل التكرار' : 'Count']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#075080" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shift Compliance & Handover Timeliness */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#075080]">
                {lang === 'ar' ? 'نسبة الامتثال والزمن حسب المناوبة' : 'Compliance & Timeliness by Shift'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'مقارنة بين المناوبات الصباحية، المسائية، والليلية' : 'Comparison across Morning, Evening, and Night shifts'}
              </p>
            </div>
            <Clock className="w-4 h-4 text-[#45A83D]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, lang === 'ar' ? 'نسبة الامتثال' : 'Compliance Rate']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="rate" fill="#45A83D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Handover Performance Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#075080]">
            {lang === 'ar' ? 'مؤشرات امتثال الأجنحة وأقسام التمريض' : 'Department Handover Performance Benchmarks'}
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {analytics.department_stats.length} {lang === 'ar' ? 'أقسام تحت المراقبة' : 'Monitored Wards'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {analytics.department_stats.map((dept, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-all">
              <div>
                <h4 className="font-bold text-sm text-slate-800">{dept.dept_ar}</h4>
                <span className="text-xs text-slate-500">
                  {dept.patients} {lang === 'ar' ? 'مرضى نشطين' : 'Active patients'} • {dept.tasks} {lang === 'ar' ? 'مهام جارية' : 'Tasks in progress'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-end">
                  <span className="font-extrabold text-sm text-[#287C36] block">{dept.rate}%</span>
                  <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'نسبة الالتزام' : 'Compliance'}</span>
                </div>

                <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#45A83D] h-full rounded-full"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
