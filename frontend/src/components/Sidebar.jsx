import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileSpreadsheet,
  BrainCircuit,
  AlertOctagon,
  Languages,
  CheckSquare,
  ClipboardCheck,
  History,
  BarChart3,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { lang, activeTab, navigateTo, currentUser } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية والمناوبة',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'shifts',
      labelAr: 'جدول المناوبات',
      labelEn: 'Shift Schedule',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'patients',
      labelAr: 'إدارة المرضى',
      labelEn: 'Patient Management',
      icon: Users,
      badge: '3'
    },
    {
      id: 'patient-detail',
      labelAr: 'التوثيق السريري',
      labelEn: 'Patient Documentation',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'handover-ai',
      labelAr: 'التسليم الذكي (SBAR)',
      labelEn: 'AI Smart Handover',
      icon: BrainCircuit,
      badge: 'AI',
      highlight: true
    },
    {
      id: 'missing-info',
      labelAr: 'مكتشف المعلومات الناقصة',
      labelEn: 'Missing Info Detector',
      icon: AlertOctagon,
      badge: 'فحص',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'translation',
      labelAr: 'الترجمة السريرية الذكية',
      labelEn: 'Bilingual Translation',
      icon: Languages,
      badge: 'AR/EN'
    },
    {
      id: 'tasks',
      labelAr: 'تتبع المهام المعلقة',
      labelEn: 'Pending Tasks',
      icon: CheckSquare,
      badge: '2'
    },
    {
      id: 'confirmation',
      labelAr: 'تأكيد واعتماد التسليم',
      labelEn: 'Handover Confirmation',
      icon: ClipboardCheck,
      badge: 'مهم'
    },
    {
      id: 'history',
      labelAr: 'سجل التسليم والتدقيق',
      labelEn: 'History & Audit Trail',
      icon: History,
      badge: null
    },
    {
      id: 'supervisor',
      labelAr: 'لوحة تحكم المشرف والتحليلات',
      labelEn: 'Supervisor Analytics',
      icon: BarChart3,
      badge: 'مباشر'
    }
  ];

  return (
    <aside className="w-64 bg-white border-e border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4.5rem)]">
      {/* Navigation list */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {lang === 'ar' ? 'القائمة السريرية' : 'Clinical Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-start ${
                isActive
                  ? 'bg-[#075080] text-white shadow-sm shadow-[#075080]/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#45A83D]' : 'text-slate-400'}`} />
                <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor
                      ? item.badgeColor
                      : item.highlight
                      ? 'bg-[#EAF6E8] text-[#287C36]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Compliance & Hackathon Badge */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#EAF6E8] to-[#f0f9ed] border border-[#45A83D]/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#287C36]" />
            <span className="text-xs font-bold text-[#287C36]">
              {lang === 'ar' ? 'معايير أمان الرعاية' : 'Patient Safety Standard'}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            {lang === 'ar'
              ? 'متوافق مع بروتوكول SBAR السريري ومعايير JCI لمنع فجوات التواصل التمريضي.'
              : 'Compliant with SBAR clinical handover and JCI continuous patient care standards.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
