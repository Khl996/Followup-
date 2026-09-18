import React, { useState, useMemo } from 'react';
import { Observation, ScreenType, HomeTab } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  formatArabicTime, 
  parseDate, 
  isOlderThan24Hours, 
  checkReviewDue,
  getISODateString 
} from '../utils/dateUtils';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  User, 
  MapPin, 
  Tag, 
  Calendar,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface HomeScreenProps {
  setScreen: (screen: ScreenType) => void;
  onSelectObservation: (obs: Observation) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setScreen, onSelectObservation }) => {
  const { observations, loading, error } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<HomeTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Today's Counters
  const todayStr = getISODateString(new Date());

  const counters = useMemo(() => {
    let todayCount = 0;
    let openCount = 0;
    let pausedCount = 0;
    let closedTodayCount = 0;

    observations.forEach((o) => {
      const createdDate = parseDate(o.createdAt);
      const isTodayCreated = createdDate && getISODateString(createdDate) === todayStr;

      if (isTodayCreated) {
        todayCount++;
      }

      if (o.status === 'OPEN') {
        openCount++;
      } else if (o.status === 'PAUSED') {
        pausedCount++;
      } else if (o.status === 'CLOSED') {
        const closedDate = parseDate(o.closedAt);
        const isClosedToday = closedDate && getISODateString(closedDate) === todayStr;
        if (isClosedToday || isTodayCreated) {
          closedTodayCount++;
        }
      }
    });

    return {
      todayCount,
      openCount,
      pausedCount,
      closedTodayCount,
    };
  }, [observations, todayStr]);

  // Filter observations by tab and search
  const filteredObservations = useMemo(() => {
    let list = [...observations];

    // Filter by tab
    if (activeTab === 'my') {
      list = list.filter((o) => o.createdBy === currentUser?.id);
    } else if (activeTab === 'paused') {
      list = list.filter((o) => o.status === 'PAUSED');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.description.toLowerCase().includes(q) ||
          o.locationName.toLowerCase().includes(q) ||
          o.workerName.toLowerCase().includes(q) ||
          o.categoryName.toLowerCase().includes(q) ||
          o.createdByName.toLowerCase().includes(q)
      );
    }

    // Sort order: Prioritize OPEN observations first!
    // Status order weight: OPEN (1), PAUSED (2), CLOSED (3)
    const statusWeight = { OPEN: 1, PAUSED: 2, CLOSED: 3 };

    list.sort((a, b) => {
      const weightA = statusWeight[a.status] || 99;
      const weightB = statusWeight[b.status] || 99;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      // If same status, sort by createdAt descending
      const timeA = parseDate(a.createdAt)?.getTime() || 0;
      const timeB = parseDate(b.createdAt)?.getTime() || 0;
      return timeB - timeA;
    });

    return list;
  }, [observations, activeTab, currentUser?.id, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 text-right">
      
      {/* 1. TOP COUNTERS FOR TODAY */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        
        {/* ملاحظات اليوم */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[11px] text-slate-700 block font-medium">ملاحظات اليوم</span>
          <span className="text-xl font-extrabold text-slate-900 leading-tight">
            {counters.todayCount}
          </span>
        </div>

        {/* مفتوحة */}
        <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200 text-center shadow-2xs">
          <span className="text-[11px] text-emerald-800 block font-bold">مفتوحة</span>
          <span className="text-xl font-extrabold text-emerald-700 leading-tight">
            {counters.openCount}
          </span>
        </div>

        {/* معلّقة */}
        <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200 text-center shadow-2xs">
          <span className="text-[11px] text-amber-800 block font-bold">معلّقة</span>
          <span className="text-xl font-extrabold text-amber-700 leading-tight">
            {counters.pausedCount}
          </span>
        </div>

        {/* مغلقة */}
        <div className="bg-slate-100/90 p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[11px] text-slate-700 block font-medium">مغلقة</span>
          <span className="text-xl font-extrabold text-slate-700 leading-tight">
            {counters.closedTodayCount}
          </span>
        </div>

      </div>

      {/* 2. LARGE PRIMARY BUTTON: "+ إضافة ملاحظة" */}
      <div className="mb-4">
        <button
          onClick={() => setScreen('add')}
          className="w-full py-3.5 px-4 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-bold rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          <span>+ إضافة ملاحظة</span>
        </button>
      </div>

      {/* 3. TABS: ملاحظاتي | جميع الملاحظات | معلّقة */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl mb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          جميع الملاحظات ({observations.length})
        </button>

        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'my'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          ملاحظاتي ({observations.filter((o) => o.createdBy === currentUser?.id).length})
        </button>

        <button
          onClick={() => setActiveTab('paused')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'paused'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          معلّقة ({counters.pausedCount})
        </button>
      </div>

      {/* Search Input for fast mobile scanning */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="بحث سريع بالملاحظة، الموقع، الفني، أو المشرف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
        />
        <Search className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5" />
      </div>

      {/* 4. OBSERVATION CARDS LIST */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-700">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          جاري تحميل الملاحظات الميدانية...
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
      ) : filteredObservations.length === 0 ? (
        <div className="py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">لا توجد ملاحظات حالياً</h3>
          <p className="text-xs text-slate-700 max-w-xs mx-auto mb-4">
            {searchQuery
              ? 'لا توجد نتائج مطابقة لبحثك الحالي.'
              : activeTab === 'paused'
              ? 'لا توجد ملاحظات معلقة حالياً. جميع الأعمال تسير بشكل طبيعي.'
              : 'سجّل ملاحظة ميدانية جديدة الآن بالضغط على الزر أعلاه.'}
          </p>
          <button
            onClick={() => setScreen('add')}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل ملاحظة جديدة</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredObservations.map((obs) => {
            const isOld = obs.status === 'OPEN' && isOlderThan24Hours(obs.createdAt);
            const reviewDue = obs.status === 'PAUSED' ? checkReviewDue(obs.reviewDate) : null;

            return (
              <div
                key={obs.id}
                onClick={() => onSelectObservation(obs)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-md active:scale-[0.99] relative overflow-hidden ${
                  isOld
                    ? 'border-amber-400/90 ring-1 ring-amber-300/60'
                    : obs.status === 'OPEN'
                    ? 'border-slate-200 hover:border-sky-300'
                    : obs.status === 'PAUSED'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Top Row: Category & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-md truncate max-w-[170px]">
                    {obs.categoryName}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Visual notice for old open observations */}
                    {isOld && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>مفتوحة &gt; 24 س</span>
                      </span>
                    )}

                    {/* Visual notice for review date due/overdue */}
                    {reviewDue?.isDue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-red-600" />
                        <span>{reviewDue.isToday ? 'مراجعة اليوم' : 'متأخر'}</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    {obs.status === 'OPEN' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        مفتوحة
                      </span>
                    )}
                    {obs.status === 'PAUSED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        معلّقة
                      </span>
                    )}
                    {obs.status === 'CLOSED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        مغلقة
                      </span>
                    )}
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                  {obs.description}
                </p>

                {/* Location */}
                <div className="text-xs text-slate-700 mb-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>الموقع: <strong className="text-slate-800">{obs.locationName}</strong></span>
                </div>

                {/* Worker informed */}
                <div className="text-xs text-slate-700 mb-2 flex items-center gap-1 truncate">
                  <User className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>تم إبلاغ: <strong className="text-sky-900">{obs.workerName}</strong></span>
                </div>

                {/* Creator and Time (فتحها: خالد — 08:17 ص) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
                  <span className="truncate">
                    فتحها: <span className="font-semibold text-slate-700">{obs.createdByName}</span> — {formatArabicTime(obs.createdAt)}
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
