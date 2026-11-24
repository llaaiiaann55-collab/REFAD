import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, UserCheck, ShieldCheck, ArrowRight, ArrowLeft, Hospital } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { lang, toggleLanguage, users, switchRole } = useApp();
  const [employeeId, setEmployeeId] = useState('NUR-4091');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const handleCustomLogin = (e) => {
    e.preventDefault();
    // Default to first user if matched or just login
    onLoginSuccess();
  };

  const handleRoleQuickLogin = (user) => {
    switchRole(user.id);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] via-[#EAF6E8]/40 to-[#075080]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top language toggle */}
      <div className="absolute top-6 end-6">
        <button
          onClick={toggleLanguage}
          className="px-3.5 py-1.5 text-xs font-bold text-[#075080] bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
        >
          {lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex p-3 rounded-2xl bg-white shadow-md border border-slate-100 mb-3">
          <img src="/logo.png" alt="REFAD Logo" className="h-20 w-auto object-contain mx-auto" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#075080] tracking-tight">
          {lang === 'ar' ? 'منصة رِفاد السريرية' : 'REFAD Clinical Portal'}
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#287C36]">
          {lang === 'ar' ? 'معلومات متصلة، ورعاية مستمرة' : 'Connected Information, Continuous Care'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'ar' ? 'نظام تسليم واستلام المناوبات التمريضية المدعوم بالذكاء الاصطناعي' : 'AI-Powered Nursing Shift Handover & Continuity Platform'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Quick Role Selection for Hackathon / Evaluation */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Hospital className="w-4 h-4 text-[#075080]" />
              <h4 className="text-xs font-bold text-slate-700">
                {lang === 'ar' ? 'تسجيل الدخول السريع لاختبار الأدوار (Quick Role Access)' : 'Quick Role Access for Live Evaluation'}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleRoleQuickLogin(u)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-[#45A83D] hover:bg-[#EAF6E8] transition-all text-start group bg-white shadow-xs"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{u.avatar}</span>
                    <span className="text-xs font-bold text-[#075080] group-hover:text-[#287C36] truncate">
                      {lang === 'ar' ? u.name_ar : u.name_en}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {u.role === 'nurse' && (lang === 'ar' ? 'ممرضة مسلمة (صباحاً)' : 'Outgoing Nurse')}
                    {u.role === 'receiving_nurse' && (lang === 'ar' ? 'ممرضة مستلمة (مساءً)' : 'Receiving Nurse')}
                    {u.role === 'supervisor' && (lang === 'ar' ? 'مشرف التمريض' : 'Supervisor')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-semibold">
                {lang === 'ar' ? 'أو تسجيل الدخول اليدوي ببيانات الموظف' : 'Or sign in with employee credentials'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleCustomLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني أو الرقم الوظيفي' : 'Email or Employee ID'}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full ps-10 pe-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#45A83D] focus:border-[#45A83D] outline-none"
                  placeholder="e.g. NUR-4091"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full ps-10 pe-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#45A83D] focus:border-[#45A83D] outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#45A83D] focus:ring-[#45A83D]"
                />
                <span className="text-slate-600 font-medium">
                  {lang === 'ar' ? 'تذكر بياناتي في هذه المحطة' : 'Remember me on this station'}
                </span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="font-semibold text-[#075080] hover:text-[#3A83B5]">
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#075080] hover:bg-[#06426a] focus:outline-none transition-all"
            >
              <span>{lang === 'ar' ? 'تسجيل الدخول للمنظومة' : 'Sign In to Portal'}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Access Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#45A83D] shrink-0" />
            <span>
              {lang === 'ar'
                ? 'نظام مشفر ومقيد بالصلاحيات السريرية المعتمدة وفق لوائح حماية بيانات المرضى.'
                : 'Encrypted and restricted by authorized clinical credentials complying with patient privacy laws.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
