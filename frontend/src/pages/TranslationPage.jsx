import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Languages,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Save,
  Copy,
  BookOpen,
  RefreshCw
} from 'lucide-react';

export const TranslationPage = () => {
  const { lang, selectedPatientId, showToast, navigateTo } = useApp();
  const [patient, setPatient] = useState(null);
  const [arabicText, setArabicText] = useState(
    "المريض فهد العتيبي (58 سنة) منوم بعد قسطرة تاجية علاجية وزراعة دعامة شريانية (Post-PCI STEMI). الحالة العامة مستقرة، واعي ومتجاوب بدرجة 15 على مقياس غلاسكو (GCS). ينفي وجود أي ألم في الصدر أو ضيق تنفس. تم فحص موضع وخز القسطرة الفخذية الأيمن، الضماد جاف وسليم ولا يوجد تورم دموي (hematoma) ونبض الشريان الظنبوبي محسوس +2 في الطرفين. سحبت عينة تروبونين المتابعة الساعة 12:30 وبانتظار النتيجة من المختبر. تسريب الهيبارين الوريدي مستمر بانتظام بمعدل 1000 وحدة/ساعة بدون مضاعفات."
  );
  const [englishText, setEnglishText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetch(`/api/patients/${selectedPatientId || 101}`)
      .then(res => res.json())
      .then(data => {
        setPatient(data.patient);
        if (data.notes && data.notes.length > 0) {
          setArabicText(data.notes[0].note_ar);
          setEnglishText(data.notes[0].note_en);
          setIsApproved(Boolean(data.notes[0].translation_approved));
        } else {
          handleAutoTranslate();
        }
      })
      .catch(e => console.error(e));
  }, [selectedPatientId]);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/handover/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: arabicText,
          source_lang: 'ar',
          target_lang: 'en'
        })
      });
      if (res.ok) {
        const d = await res.json();
        setEnglishText(d.translated);
        showToast(lang === 'ar' ? 'تمت الترجمة السريرية مع حفظ المصطلحات الطبية' : 'Clinical translation generated');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApproveTranslation = async () => {
    try {
      const res = await fetch(`/api/patients/${selectedPatientId || 101}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_ar: arabicText,
          note_en: englishText,
          translation_approved: true
        })
      });
      if (res.ok) {
        setIsApproved(true);
        showToast(
          lang === 'ar'
            ? 'تم اعتماد التوثيق السريري الثنائي وإضافته للملف الطبي الرسمي'
            : 'Bilingual documentation approved and attached to official medical chart'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-sky-50 text-[#075080]">
              <Languages className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'الترجمة السريرية التمريضية الذكية (Bilingual Clinical Translation)' : 'Bilingual Clinical Translation'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'ترجمة الملاحظات التمريضية بين العربية والإنجليزية مع الحفاظ الدقيق على المصطلحات والمختصرات الطبية المعتمدة'
                  : 'Medical-grade translation preserving terminology, acronyms, and original clinical intent'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoTranslate}
            disabled={isTranslating}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-[#45A83D] ${isTranslating ? 'animate-spin' : ''}`} />
            <span>{lang === 'ar' ? 'إعادة الترجمة السريرية' : 'Re-translate'}</span>
          </button>
        </div>
      </div>

      {/* Medical Safety Lexicon Pills */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF6E8] to-[#edf7ec] border border-[#45A83D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#287C36] font-bold">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'قاموس المصطلحات السريرية المحمية: يتم الحفاظ على مصطلحات PCI, STEMI, GCS, SpO2, Heparin دون تحريف لغوي.'
              : 'Protected Medical Lexicon: Terms like PCI, STEMI, GCS, SpO2, Heparin are conserved verbatim.'}
          </span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-[#287C36] shadow-xs shrink-0">
          ✓ {lang === 'ar' ? 'معتمد وفق JCI' : 'JCI Standards'}
        </span>
      </div>

      {/* Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arabic Column */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#075080] bg-sky-50 px-2.5 py-1 rounded-md">
                  العربية (الملاحظة الأصلية للممرض)
                </span>
                <span className="text-[10px] text-slate-400">RTL Input</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(arabicText);
                  showToast(lang === 'ar' ? 'تم نسخ النص العربي' : 'Copied Arabic text');
                }}
                className="text-slate-400 hover:text-slate-600"
                title="نسخ"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={12}
              value={arabicText}
              onChange={e => setArabicText(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl text-xs sm:text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#45A83D] font-arabic"
              placeholder="اكتب التوثيق التمريضي بالعربية..."
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            {lang === 'ar' ? 'يمكنك تحرير النص العربي في أي وقت قبل الاعتماد النهائي.' : 'You can edit the original text at any time.'}
          </p>
        </div>

        {/* English Column */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#287C36] bg-[#EAF6E8] px-2.5 py-1 rounded-md">
                  English (Medical Grade Translation)
                </span>
                <span className="text-[10px] text-slate-400">LTR Editable</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(englishText);
                  showToast(lang === 'ar' ? 'تم نسخ النص الإنجليزي' : 'Copied English text');
                }}
                className="text-slate-400 hover:text-slate-600"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={12}
              dir="ltr"
              value={englishText}
              onChange={e => setEnglishText(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl text-xs sm:text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#075080] font-english"
              placeholder="English translation will appear here..."
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isApproved ? (
                <span className="text-[#287C36] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'ar' ? 'معتمدة في الملف الطبي' : 'Approved in Medical Chart'}
                </span>
              ) : (
                lang === 'ar' ? 'بانتظار موافقة الممرض المسلم' : 'Pending Nurse Approval'
              )}
            </span>

            <button
              onClick={handleApproveTranslation}
              className="py-2 px-5 rounded-xl bg-[#45A83D] hover:bg-[#287C36] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'اعتماد التوثيق الثنائي' : 'Approve Bilingual Record'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
