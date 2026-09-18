import React, { useState } from 'react';
import { Observation } from '../types';
import { getISODateString } from '../utils/dateUtils';
import { Clock, AlertCircle, X, Calendar } from 'lucide-react';

interface PauseDialogProps {
  observation: Observation;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, reviewDate: string) => Promise<void>;
}

const COMMON_REASONS = [
  'عدم توفر مواد في المستودع',
  'انتظار توريد قطع غيار',
  'انتظار مقاول خارجي متخصص',
  'انتظار موافقة الإدارة المالية',
  'سبب آخر',
];

export const PauseDialog: React.FC<PauseDialogProps> = ({
  observation,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [reviewDate, setReviewDate] = useState(getISODateString(tomorrow));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'سبب آخر' ? (customReason.trim() || 'سبب آخر') : reason;
    if (!finalReason) return;

    setLoading(true);
    try {
      await onConfirm(finalReason, reviewDate);
      onClose();
    } catch (err) {
      console.error('Failed to pause observation', err);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setReviewDate(getISODateString(d));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-right overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
            <Clock className="w-5 h-5" />
            <span>تعليق الملاحظة الميدانية</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-700 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Observation preview */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 mb-4 text-xs text-amber-900">
          <p className="font-semibold text-slate-800 line-clamp-2">{observation.description}</p>
          <p className="text-[11px] text-slate-700 mt-1">
            الموقع: <span className="font-medium text-slate-700">{observation.locationName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Reason selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              سبب التعليق <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1.5">
              {COMMON_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    reason === r
                      ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pauseReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {reason === 'سبب آخر' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="اكتب سبب التعليق بالتفصيل..."
                rows={2}
                required
                className="mt-2 w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
              />
            )}
          </div>

          {/* Expected review date */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              تاريخ المراجعة المتوقع <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                غداً
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(3)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                بعد 3 أيام
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                بعد أسبوع
              </button>
            </div>
            <div className="relative">
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden text-right"
              />
            </div>
            <p className="text-[11px] text-slate-700 mt-1">
              سيتم تنبيه المشرفين عند حلول هذا التاريخ لمراجعة توفر المواد أو استكمال المعالجة.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'جاري الحفظ...' : 'تأكيد تعليق الملاحظة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
