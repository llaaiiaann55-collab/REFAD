import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const TasksPage = () => {
  const { lang, navigateTo, showToast } = useApp();
  const [tasks, setTasks] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(
          lang === 'ar'
            ? `تم تحديث حالة المهمة السريرية إلى: ${newStatus === 'completed' ? 'مكتملة' : newStatus}`
            : `Task updated to ${newStatus}`
        );
        loadTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchPri = filterPriority === 'all' || t.priority === filterPriority;
    const matchStat = filterStatus === 'all' || (filterStatus === 'pending' ? t.status !== 'completed' : t.status === filterStatus);
    return matchPri && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <CheckSquare className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#075080]">
                {lang === 'ar' ? 'تتبع وترحيل المهام السريرية (Shift Task Carryover)' : 'Pending Tasks Tracking'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'ar'
                  ? 'ضمان استمرارية الرعاية: المهام غير المكتملة تظل ظاهرة وترحل تلقائياً للمناوبة التالية ولا تسقط'
                  : 'Zero task drop guarantee: unfinished tasks carry over to the next shift upon confirmation'}
              </p>
            </div>
          </div>
        </div>

        {/* Priority & Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white shadow-xs text-[#075080] font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'جميع المهام' : 'All'}
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'غير المكتملة' : 'Unfinished'}
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'completed' ? 'bg-[#45A83D] text-white font-bold' : 'text-slate-600'}`}
            >
              {lang === 'ar' ? 'المكتملة' : 'Done'}
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration Scenario Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-bold">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'مهمة فحص موقع القسطرة الفخذية للمريض 101 مستحقة في تمام الساعة 16:00، ويجب أن تؤكد الممرضة المستلمة (نورة) استلامها رسمياً.'
              : 'Femoral puncture check for Patient 101 is due at 16:00 and will migrate to incoming nurse Noura.'}
          </span>
        </div>
        <button
          onClick={() => navigateTo('confirmation', 101)}
          className="px-3 py-1.5 rounded-lg bg-[#075080] text-white text-xs font-bold hover:bg-[#06426a] shrink-0 ms-2"
        >
          {lang === 'ar' ? 'شاشة تأكيد التسليم' : 'Go to Confirmation'}
        </button>
      </div>

      {/* Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map(task => {
          const isCompleted = task.status === 'completed';
          const isP101 = task.patient_id === 101;
          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-5 shadow-xs border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'border-slate-200 bg-slate-50/50 opacity-75'
                  : task.priority === 'high'
                  ? 'border-rose-200 ring-1 ring-rose-100 bg-gradient-to-b from-white to-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: Patient & Room */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#075080] bg-sky-50 px-2 py-0.5 rounded font-mono">
                      {task.patient_name_ar}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      غرفة {task.room} ({task.bed})
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority === 'high' ? (lang === 'ar' ? 'أولوية قصوى' : 'High') : (lang === 'ar' ? 'متوسطة' : 'Medium')}
                  </span>
                </div>

                {/* Task Title */}
                <h3 className={`text-sm font-bold mt-1 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {lang === 'ar' ? task.description_ar : task.description_en}
                </h3>

                {task.notes && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {task.notes}
                  </p>
                )}
              </div>

              {/* Timing & Carryover Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ar' ? 'الاستحقاق:' : 'Due:'} {task.due_time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'pending')}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                    >
                      {lang === 'ar' ? 'إلغاء الإكمال' : 'Reopen'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#075080] text-[11px] font-bold hover:bg-sky-100 transition-all"
                      >
                        {lang === 'ar' ? 'جاري التنفيذ' : 'In Progress'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="px-3 py-1 rounded-lg bg-[#45A83D] text-white text-[11px] font-bold hover:bg-[#287C36] transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إكمال' : 'Complete'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
