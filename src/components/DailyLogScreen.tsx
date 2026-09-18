import React, { useState, useMemo } from 'react';
import { Observation, SupervisorUser, ScreenType } from '../types';
import { useData } from '../context/DataContext';
import { 
  getISODateString, 
  parseDate, 
  formatArabicTime, 
  formatArabicDate 
} from '../utils/dateUtils';
import { 
  CalendarDays, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';

interface DailyLogScreenProps {
  onSelectObservation: (obs: Observation) => void;
}

export const DailyLogScreen: React.FC<DailyLogScreenProps> = ({ onSelectObservation }) => {
  const { observations, supervisors, loading, error } = useData();

  const todayStr = getISODateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getISODateString(yesterday);

  // Filter States
  const [selectedDateMode, setSelectedDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('all');
  const [expandedSupervisorId, setExpandedSupervisorId] = useState<string | null>(null);

  // Active Target Date
  const targetDateStr =
    selectedDateMode === 'today'
      ? todayStr
      : selectedDateMode === 'yesterday'
      ? yesterdayStr
      : customDate;

  // Compute Supervisor Activity
  const supervisorActivities = useMemo(() => {
    // Collect all supervisors from users list + any creator/closer in observations
    const allSupervisorsMap = new Map<string, { id: string; name: string }>();

    supervisors.forEach((s) => {
      allSupervisorsMap.set(s.id, { id: s.id, name: s.displayName });
    });

    observations.forEach((o) => {
      if (o.createdBy && !allSupervisorsMap.has(o.createdBy)) {
        allSupervisorsMap.set(o.createdBy, { id: o.createdBy, name: o.createdByName });
      }
      if (o.closedBy && !allSupervisorsMap.has(o.closedBy)) {
        allSupervisorsMap.set(o.closedBy, { id: o.closedBy, name: o.closedByName || 'مشرف' });
      }
    });

    const results: Array<{
      id: string;
      name: string;
      createdCount: number;
      closedCount: number;
      stillOpenCount: number;
      createdObservations: Observation[];
      closedObservations: Observation[];
    }> = [];

    allSupervisorsMap.forEach((sup) => {
      if (selectedSupervisorId !== 'all' && sup.id !== selectedSupervisorId) {
        return;
      }

      // Observations created by this supervisor on the selected date
      const createdObs = observations.filter((o) => {
        if (o.createdBy !== sup.id) return false;
        const d = parseDate(o.createdAt);
        return d && getISODateString(d) === targetDateStr;
      });

      // Observations closed by this supervisor on the selected date
      const closedObs = observations.filter((o) => {
        if (o.closedBy !== sup.id) return false;
        const d = parseDate(o.closedAt);
        return d && getISODateString(d) === targetDateStr;
      });

      // Observations created on that date that are STILL OPEN
      const stillOpenObs = createdObs.filter((o) => o.status === 'OPEN');

      // Only show supervisor if they had activity on that date or if explicitly filtered
      if (createdObs.length > 0 || closedObs.length > 0 || selectedSupervisorId === sup.id) {
        results.push({
          id: sup.id,
          name: sup.name,
          createdCount: createdObs.length,
          closedCount: closedObs.length,
          stillOpenCount: stillOpenObs.length,
          createdObservations: createdObs,
          closedObservations: closedObs,
        });
      }
    });

    return results;
  }, [observations, supervisors, targetDateStr, selectedSupervisorId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 text-right">
      
      {/* Header */}
      <div className="pb-3 mb-4 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-sky-600" />
          <span>سجل النشاط اليومي الميداني</span>
        </h2>
        <p className="text-[11px] text-slate-700 mt-0.5">
          سجل تشغيلي بحت لمتابعة الملاحظات المسجلة والمغلقة لكل مشرف بدون تصنيفات أو تقييمات.
        </p>
      </div>

      {/* Date selector tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs mb-3 space-y-3">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>تحديد التاريخ:</span>
        </label>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedDateMode('today')}
            className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
              selectedDateMode === 'today'
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            اليوم
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateMode('yesterday')}
            className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
              selectedDateMode === 'yesterday'
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            أمس
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateMode('custom')}
            className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
              selectedDateMode === 'custom'
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            تاريخ سابق
          </button>
        </div>

        {selectedDateMode === 'custom' && (
          <div className="pt-1">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-right"
            />
          </div>
        )}
      </div>

      {/* Supervisor filter dropdown */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs mb-4">
        <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-sky-600" />
          <span>تصفية حسب المشرف:</span>
        </label>
        <select
          value={selectedSupervisorId}
          onChange={(e) => setSelectedSupervisorId(e.target.value)}
          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-right"
        >
          <option value="all">جميع المشرفين ({supervisors.length})</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName} ({s.role === 'admin' ? 'مدير' : 'مشرف'})
            </option>
          ))}
        </select>
      </div>

      {/* Supervisor Activity Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-700">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          جاري استرجاع السجل...
        </div>
      ) : error ? (
        <div className="py-10 px-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2 opacity-90" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">تعذر تحميل البيانات</h3>
          <p className="text-xs text-slate-700 max-w-xs mx-auto mb-4 leading-relaxed">
            تعذر تحميل البيانات حالياً. تحقق من الاتصال ثم حاول مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : supervisorActivities.length === 0 ? (
        <div className="py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
          <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">لا يوجد نشاط مسجل في هذا التاريخ</h3>
          <p className="text-xs text-slate-700 max-w-xs mx-auto">
            لم تسجل أو تغلق ملاحظات في تاريخ {targetDateStr} للمشرف المحدد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {supervisorActivities.map((act) => {
            const isExpanded = expandedSupervisorId === act.id;

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                {/* Supervisor Summary Header */}
                <div
                  onClick={() => setExpandedSupervisorId(isExpanded ? null : act.id)}
                  className="p-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{act.name}</h4>
                      <p className="text-[10px] text-slate-700">
                        انقر لعرض الملاحظات الفعلية
                      </p>
                    </div>
                  </div>

                  {/* Operational Activity Badges */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-center">
                      <span className="text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg font-bold">
                        فتح: {act.createdCount}
                      </span>
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold">
                        أغلق: {act.closedCount}
                      </span>
                      {act.stillOpenCount > 0 && (
                        <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg font-bold">
                          مفتوحة: {act.stillOpenCount}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-700">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Activity: Shows the actual observations */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    
                    {/* Created by supervisor on that date */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>الملاحظات التي فتحها المشرف في هذا التاريخ ({act.createdObservations.length}):</span>
                      </h5>

                      {act.createdObservations.length === 0 ? (
                        <p className="text-[11px] text-slate-700 italic pr-2">لم يقم بفتح ملاحظات في هذا التاريخ.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {act.createdObservations.map((obs) => (
                            <div
                              key={obs.id}
                              onClick={() => onSelectObservation(obs)}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs hover:border-sky-300 cursor-pointer shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-slate-900 truncate">{obs.description}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                                    obs.status === 'OPEN'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : obs.status === 'PAUSED'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {obs.status === 'OPEN' ? 'مفتوحة' : obs.status === 'PAUSED' ? 'معلّقة' : 'مغلقة'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-700 flex items-center justify-between">
                                <span>الموقع: {obs.locationName}</span>
                                <span>الوقت: {formatArabicTime(obs.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Closed by supervisor on that date */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>الملاحظات التي أغلقها المشرف في هذا التاريخ ({act.closedObservations.length}):</span>
                      </h5>

                      {act.closedObservations.length === 0 ? (
                        <p className="text-[11px] text-slate-700 italic pr-2">لم يقم بإغلاق ملاحظات في هذا التاريخ.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {act.closedObservations.map((obs) => (
                            <div
                              key={obs.id}
                              onClick={() => onSelectObservation(obs)}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs hover:border-emerald-300 cursor-pointer shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-slate-900 truncate">{obs.description}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 shrink-0">
                                  مغلقة
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-700 flex items-center justify-between">
                                <span>فتحها: {obs.createdByName}</span>
                                <span>وقت الإغلاق: {formatArabicTime(obs.closedAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
