import React, { useState } from 'react';
import { Observation } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PauseDialog } from './PauseDialog';
import { 
  formatArabicDateTime, 
  formatArabicDate, 
  checkReviewDue, 
  isOlderThan24Hours 
} from '../utils/dateUtils';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  MapPin, 
  User, 
  Tag, 
  Calendar, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface ObservationDetailsModalProps {
  observation: Observation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationDetailsModal: React.FC<ObservationDetailsModalProps> = ({
  observation,
  isOpen,
  onClose,
}) => {
  const { closeObservation, reopenObservation, pauseObservation } = useData();
  const { currentUser } = useAuth();

  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);

  if (!isOpen || !observation) return null;

  const handleCloseObservation = async () => {
    setClosing(true);
    try {
      await closeObservation(observation.id);
      onClose();
    } catch (err) {
      console.error('Failed to close observation', err);
    } finally {
      setClosing(false);
    }
  };

  const handleReopenObservation = async () => {
    setReopening(true);
    try {
      await reopenObservation(observation.id);
      onClose();
    } catch (err) {
      console.error('Failed to reopen observation', err);
    } finally {
      setReopening(false);
    }
  };

  const isOldOpen = observation.status === 'OPEN' && isOlderThan24Hours(observation.createdAt);
  const reviewDue = observation.status === 'PAUSED' ? checkReviewDue(observation.reviewDate) : null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 text-right overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">تفاصيل الملاحظة</span>
              {observation.status === 'OPEN' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  مفتوحة
                </span>
              )}
              {observation.status === 'PAUSED' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  معلّقة
                </span>
              )}
              {observation.status === 'CLOSED' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  مغلقة
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-700 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-4">

            {/* Overdue Warnings if any */}
            {isOldOpen && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ملاحظة مفتوحة منذ أكثر من 24 ساعة — يرجى التحقق من الموقع مع الفني.</span>
              </div>
            )}

            {reviewDue?.isDue && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {reviewDue.isToday ? 'موعد مراجعة هذه الملاحظة المعلقة مستحق اليوم!' : 'تاريخ مراجعة هذه الملاحظة المعلقة متأخر!'}
                </span>
              </div>
            )}

            {/* Description Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>وصف الملاحظة:</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                {observation.description}
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              
              {/* Category */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-700 block mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-700" />
                  نوع الملاحظة
                </span>
                <p className="font-bold text-slate-800 truncate">{observation.categoryName}</p>
              </div>

              {/* Location */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-700" />
                  الموقع
                </span>
                <p className="font-bold text-slate-800 line-clamp-1">{observation.locationName}</p>
              </div>

              {/* Worker Informed */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs col-span-2">
                <span className="text-[11px] text-slate-700 block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  الفني / العامل الذي تم إبلاغه
                </span>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sky-900 text-sm">{observation.workerName}</p>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    تم إبلاغه شفهياً في الميدان
                  </span>
                </div>
              </div>

            </div>

            {/* Lifecycle Log: Created, Paused, Closed */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3 text-xs">
              
              {/* Creator Info */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[11px] text-slate-700 block">فتحها المشرف:</span>
                  <span className="font-bold text-slate-900">{observation.createdByName}</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-slate-700 block">وقت وتاريخ الفتح:</span>
                  <span className="font-medium text-slate-700">{formatArabicDateTime(observation.createdAt)}</span>
                </div>
              </div>

              {/* Paused Info (if paused) */}
              {observation.status === 'PAUSED' && (
                <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="font-bold">علّقها المشرف: {observation.pausedByName || 'مشرف'}</span>
                    <span className="text-[11px] text-amber-800">{formatArabicDateTime(observation.pausedAt)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-800 block">سبب التعليق:</span>
                    <span className="font-semibold text-amber-950">{observation.pauseReason || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-800 block">تاريخ المراجعة المتوقع:</span>
                    <span className="font-bold text-amber-950">{formatArabicDate(observation.reviewDate)}</span>
                  </div>
                </div>
              )}

              {/* Closed Info (if closed) */}
              {observation.status === 'CLOSED' && (
                <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-800 block">أغلقها المشرف:</span>
                      <span className="font-bold text-emerald-900 text-sm">{observation.closedByName || 'مشرف'}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] text-emerald-800 block">وقت وتاريخ الإغلاق:</span>
                      <span className="font-semibold text-emerald-900">{formatArabicDateTime(observation.closedAt)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    تم التأكد ميدانياً من حل المشكلة وإغلاقها.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Footer Actions according to Screen 3 requirements */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
            
            {/* Action for OPEN: "تعليق" & "إغلاق" */}
            {observation.status === 'OPEN' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPauseDialogOpen(true)}
                  disabled={closing}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>تعليق الملاحظة</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseObservation}
                  disabled={closing}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{closing ? 'جاري الإغلاق...' : 'إغلاق الملاحظة'}</span>
                </button>
              </>
            )}

            {/* Action for PAUSED: "إعادة فتح" & "إغلاق" */}
            {observation.status === 'PAUSED' && (
              <>
                <button
                  type="button"
                  onClick={handleReopenObservation}
                  disabled={reopening || closing}
                  className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{reopening ? 'جاري الفتح...' : 'إعادة فتح الملاحظة'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseObservation}
                  disabled={reopening || closing}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{closing ? 'جاري الإغلاق...' : 'إغلاق الملاحظة'}</span>
                </button>
              </>
            )}

            {/* If CLOSED: Just close the modal */}
            {observation.status === 'CLOSED' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                إغلاق النافذة
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Pause Reason Dialog */}
      {isPauseDialogOpen && (
        <PauseDialog
          observation={observation}
          isOpen={isPauseDialogOpen}
          onClose={() => setIsPauseDialogOpen(false)}
          onConfirm={async (reason, date) => {
            await pauseObservation(observation.id, reason, date);
            setIsPauseDialogOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
