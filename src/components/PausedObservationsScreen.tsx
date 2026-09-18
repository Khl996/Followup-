import React, { useMemo } from 'react';
import { Observation, ScreenType } from '../types';
import { useData } from '../context/DataContext';
import { 
  formatArabicDate, 
  formatArabicTime, 
  checkReviewDue, 
  parseDate 
} from '../utils/dateUtils';
import { 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  Calendar,
  ChevronLeft
} from 'lucide-react';

interface PausedObservationsScreenProps {
  setScreen: (screen: ScreenType) => void;
  onSelectObservation: (obs: Observation) => void;
}

export const PausedObservationsScreen: React.FC<PausedObservationsScreenProps> = ({
  setScreen,
  onSelectObservation,
}) => {
  const { observations, loading, error } = useData();

  // All paused observations sorted primarily by expected review date
  const pausedList = useMemo(() => {
    const list = observations.filter((o) => o.status === 'PAUSED');

    list.sort((a, b) => {
      // Due/Overdue first
      const dueA = checkReviewDue(a.reviewDate);
      const dueB = checkReviewDue(b.reviewDate);

      if (dueA.isDue && !dueB.isDue) return -1;
      if (!dueA.isDue && dueB.isDue) return 1;

      // Then by reviewDate ascending
      const dateA = a.reviewDate ? new Date(a.reviewDate).getTime() : 9999999999999;
      const dateB = b.reviewDate ? new Date(b.reviewDate).getTime() : 9999999999999;
      return dateA - dateB;
    });

    return list;
  }, [observations]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 text-right">
      
      {/* Header */}
      <div className="pb-3 mb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>الملاحظات المعلّقة</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {pausedList.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-700 mt-0.5">
              ملاحظات بانتظار توفر مواد، توريد، أو مقاول. مرتبة حسب تاريخ المراجعة.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-700">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          جاري تحميل الملاحظات المعلقة...
        </div>
      ) : error ? (
        <div className="py-10 px-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-2 opacity-90" />
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
      ) : pausedList.length === 0 ? (
        <div className="py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">لا توجد ملاحظات معلقة حالياً</h3>
          <p className="text-xs text-slate-700 max-w-xs mx-auto mb-4">
            جميع الملاحظات قيد المعالجة المباشرة أو تم إغلاقها بنجاح.
          </p>
          <button
            onClick={() => setScreen('home')}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pausedList.map((obs) => {
            const reviewStatus = checkReviewDue(obs.reviewDate);

            return (
              <div
                key={obs.id}
                onClick={() => onSelectObservation(obs)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-md active:scale-[0.99] relative overflow-hidden ${
                  reviewStatus.isDue
                    ? 'border-amber-400/90 ring-1 ring-amber-300/80 bg-amber-50/15'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                {/* Top Status & Review Date */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                    {obs.categoryName}
                  </span>

                  {/* Review Date Alert Pill */}
                  {reviewStatus.isDue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>{reviewStatus.isToday ? 'المراجعة مستحقة اليوم!' : 'متأخر عن تاريخ المراجعة!'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-700" />
                      <span>مراجعة: {formatArabicDate(obs.reviewDate)}</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                  {obs.description}
                </h3>

                {/* Pause Reason Block */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs mb-2">
                  <span className="text-[10px] text-amber-800 font-bold block mb-0.5">سبب التعليق:</span>
                  <p className="font-semibold text-amber-950">{obs.pauseReason || 'غير محدد'}</p>
                  {obs.reviewDate && (
                    <span className="text-[11px] text-amber-800 block mt-1">
                      تاريخ المراجعة المتوقع: <strong>{formatArabicDate(obs.reviewDate)}</strong>
                    </span>
                  )}
                </div>

                {/* Location & Worker */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-2">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate">{obs.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <User className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate">الفني: {obs.workerName}</span>
                  </div>
                </div>

                {/* Creator and Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
                  <span>
                    فتحها المشرف: <strong className="text-slate-700">{obs.createdByName}</strong>
                  </span>
                  <div className="flex items-center gap-1 text-sky-700 font-bold">
                    <span>عرض واتخاذ إجراء</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
