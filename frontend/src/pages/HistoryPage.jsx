import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  FileText,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HistoryPage = () => {
  const { lang } = useApp();
  const [history, setHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('handovers');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/handover/history'),
      fetch('/api/audit-logs')
    ])
      .then(async ([hRes, aRes]) => {
        if (hRes.ok) setHistory(await hRes.json());
        if (aRes.ok) setAuditLogs(await aRes.json());
      })
      .catch(err => console.error(err));
  }, []);

  const filteredHandovers = history.filter(h => {
    return (
      (h.patient_name_ar && h.patient_name_ar.includes(search)) ||
      (h.mrn && h.mrn.toLowerCase().includes(search.toLowerCase())) ||
      (h.outgoing_nurse_name && h.outgoing_nurse_name.includes(search))
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-sky-50 text-[#075080]">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'سجل التسليم والأرشيف السريري (Handover History & Audit Trail)' : 'Handover History & Audit Trail'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'أرشيف غير قابل للتعديل لكافة تقارير التسليم المعتمدة مع توثيق زمني كامل وسجل تدقيق شامل'
                  : 'Immutable clinical handover archive and tamper-evident audit logs'}
              </p>
            </div>
          </div>
        </div>

        {/* Print / Tab toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('handovers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'handovers' ? 'bg-white shadow-xs text-[#075080] font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'تقارير التسليم' : 'Handover Reports'}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'audit' ? 'bg-white shadow-xs text-[#075080] font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'سجل التدقيق (Audit Logs)' : 'Audit Trail'}
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title={lang === 'ar' ? 'طباعة تقرير التسليم' : 'Print Handover Sheet'}
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'handovers' ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث بالاسم، الملف، الممرض...' : 'Search records...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ps-9 pe-3 py-1.5 text-xs border border-slate-300 rounded-lg w-full bg-white outline-none focus:ring-2 focus:ring-[#075080]"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredHandovers.length} {lang === 'ar' ? 'تقارير محفوظة' : 'Reports'}
            </span>
          </div>

          {/* List of Handovers */}
          <div className="divide-y divide-slate-100">
            {filteredHandovers.map(h => {
              const isExpanded = expandedId === h.id;
              return (
                <div key={h.id} className="p-5 hover:bg-slate-50/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#075080] bg-sky-50 px-2.5 py-0.5 rounded">
                          {h.mrn}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {lang === 'ar' ? h.patient_name_ar : h.patient_name_en}
                        </h3>
                        <span className="text-xs text-slate-500">
                          (غرفة {h.room} - {h.department})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{lang === 'ar' ? 'المسلّمة:' : 'Sent by:'} <strong className="text-slate-700">{h.outgoing_nurse_name}</strong></span>
                        <span>➔</span>
                        <span>{lang === 'ar' ? 'المستلمة:' : 'Received by:'} <strong className="text-slate-700">{h.incoming_nurse_name || (lang === 'ar' ? 'نورة الشهري' : 'Noura')}</strong></span>
                        <span>•</span>
                        <span className="font-mono">{h.created_at?.replace('T', ' ').substring(0, 16)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          h.status === 'acknowledged'
                            ? 'bg-[#EAF6E8] text-[#287C36]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{h.status === 'acknowledged' ? (lang === 'ar' ? 'معتمد ومستلم' : 'Acknowledged') : (lang === 'ar' ? 'قيد المراجعة' : 'Pending Ack')}</span>
                      </span>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : h.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded SBAR details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl">
                      <div>
                        <strong className="text-[#075080] block">[S] الحالة:</strong>
                        <p className="text-slate-700">{h.situation}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block">[B] الخلفية:</strong>
                        <p className="text-slate-700">{h.background}</p>
                      </div>
                      <div>
                        <strong className="text-[#287C36] block">[A] التقييم:</strong>
                        <p className="text-slate-700">{h.assessment}</p>
                      </div>
                      <div>
                        <strong className="text-amber-800 block">[R] التوصيات:</strong>
                        <p className="text-slate-700">{h.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#075080] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#45A83D]" />
              <span>{lang === 'ar' ? 'سجل التدقيق الأمني والسريري (Clinical Audit Trail)' : 'Security & Clinical Audit Log'}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">JCI Compliance Audit Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3 text-start">{lang === 'ar' ? 'التوقيت' : 'Timestamp'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'الإجراء السريري' : 'Action'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'الكيان' : 'Entity'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'التفاصيل' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {log.timestamp?.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {log.user_name} ({log.role})
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-[#075080] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{log.entity}</td>
                    <td className="p-3 text-slate-700 text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
