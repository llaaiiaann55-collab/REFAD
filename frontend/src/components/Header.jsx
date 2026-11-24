import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Globe, UserCheck, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export const Header = () => {
  const { lang, toggleLanguage, currentUser, users, switchRole, notifications, markNotificationRead, navigateTo } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.is_read);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <img 
            src="/logo.png" 
            alt="REFAD Logo" 
            className="h-12 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105" 
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-[#075080]">رِفاد</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF6E8] text-[#287C36] font-semibold border border-[#45A83D]/30">
                REFAD AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'ar' ? 'منصة تسليم واستلام المناوبات التمريضية' : 'Smart Nursing Handover Platform'}
            </p>
          </div>
        </div>

        {/* Center: Shift status badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
          <Clock className="w-4 h-4 text-[#45A83D]" />
          <span className="text-slate-500">{lang === 'ar' ? 'المناوبة الجارية:' : 'Current Shift:'}</span>
          <span className="font-bold text-[#075080]">
            {lang === 'ar' ? 'الصباحية (07:00 - 15:00)' : 'Morning (07:00 - 15:00)'}
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#45A83D] animate-pulse"></span>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title={lang === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <Globe className="w-4 h-4 text-[#075080]" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); }}
              className="relative p-2 text-slate-600 hover:text-[#075080] hover:bg-slate-100 rounded-lg transition-colors"
              title={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95`}>
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#075080]">
                    {lang === 'ar' ? 'التنبيهات السريرية' : 'Clinical Alerts'}
                  </h4>
                  <span className="text-xs bg-[#EAF6E8] text-[#287C36] px-2 py-0.5 rounded font-semibold">
                    {unreadNotifs.length} {lang === 'ar' ? 'جديد' : 'New'}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400">
                      {lang === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No current alerts'}
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link_target) {
                            if (n.link_target.includes('/handover')) navigateTo('confirmation', 101);
                            if (n.link_target.includes('/tasks')) navigateTo('tasks');
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${!n.is_read ? 'bg-[#EAF6E8]/40' : ''}`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'urgent_lab' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#45A83D]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">
                            {lang === 'ar' ? n.title_ar : n.title_en}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            {lang === 'ar' ? n.message_ar : n.message_en}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {n.created_at ? n.created_at.replace('T', ' ').substring(0, 16) : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Role Quick-Switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-[#45A83D] bg-slate-50 hover:bg-white transition-all text-start"
            >
              <div className="w-8 h-8 rounded-full bg-[#EAF6E8] flex items-center justify-center text-lg border border-[#45A83D]/40">
                {currentUser?.avatar || '👩‍⚕️'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {lang === 'ar' ? currentUser?.name_ar : currentUser?.name_en}
                </p>
                <span className="text-[10px] text-[#287C36] font-semibold">
                  {currentUser?.role === 'nurse' && (lang === 'ar' ? 'الممرضة المسلمة' : 'Outgoing Nurse')}
                  {currentUser?.role === 'receiving_nurse' && (lang === 'ar' ? 'الممرضة المستلمة' : 'Receiving Nurse')}
                  {currentUser?.role === 'supervisor' && (lang === 'ar' ? 'مشرف التمريض' : 'Supervisor')}
                </span>
              </div>
              <UserCheck className="w-4 h-4 text-slate-400 ms-1" />
            </button>

            {showRoleMenu && (
              <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in`}>
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">
                    {lang === 'ar' ? 'التبديل بين أدوار العرض التجريبي' : 'Switch Role for Live Demo'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'ar' ? 'اختر دور المستخدم لاختبار تسليم المناوبة كاملاً' : 'Select user to test full handover workflow'}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {users.map((u) => {
                    const isSelected = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchRole(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-start transition-all ${
                          isSelected ? 'bg-[#EAF6E8] border border-[#45A83D]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">{u.avatar}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isSelected ? 'text-[#287C36]' : 'text-slate-800'}`}>
                            {lang === 'ar' ? u.name_ar : u.name_en}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {u.role === 'nurse' && (lang === 'ar' ? 'الممرضة المسلمة (صباحاً)' : 'Outgoing Nurse (Day)')}
                            {u.role === 'receiving_nurse' && (lang === 'ar' ? 'الممرضة المستلمة (مساءً)' : 'Receiving Nurse (Evening)')}
                            {u.role === 'supervisor' && (lang === 'ar' ? 'مشرف التمريض والتحليلات' : 'Supervisor & Analytics')}
                          </p>
                        </div>
                        {isSelected && <ShieldCheck className="w-4 h-4 text-[#45A83D]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
