import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ScreenType } from '../types';
import { 
  ArrowRight, 
  MapPin, 
  User, 
  Tag, 
  Search, 
  Check, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface AddObservationScreenProps {
  setScreen: (screen: ScreenType) => void;
}

export const AddObservationScreen: React.FC<AddObservationScreenProps> = ({ setScreen }) => {
  const { categories, locations, workers, addObservation } = useData();

  // Active items only
  const activeCategories = categories.filter((c) => c.active);
  const activeLocations = locations.filter((l) => l.active);
  const activeWorkers = workers.filter((w) => w.active);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategories[0]?.id || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(activeLocations[0]?.id || '');
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<string>(activeWorkers[0]?.id || '');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter locations by search
  const filteredLocations = activeLocations.filter((loc) =>
    loc.name.toLowerCase().includes(locationSearch.trim().toLowerCase())
  );

  const selectedLocObj = activeLocations.find((l) => l.id === selectedLocation);
  const selectedCatObj = activeCategories.find((c) => c.id === selectedCategory);
  const selectedWorkerObj = activeWorkers.find((w) => w.id === selectedWorker);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('يرجى كتابة وصف الملاحظة.');
      return;
    }

    if (!selectedCategory) {
      setErrorMessage('يرجى اختيار نوع الملاحظة.');
      return;
    }

    if (!selectedLocation) {
      setErrorMessage('يرجى تحديد موقع الملاحظة.');
      return;
    }

    if (!selectedWorker) {
      setErrorMessage('يرجى اختيار الفني أو العامل الذي تم إبلاغه.');
      return;
    }

    setSubmitting(true);
    try {
      await addObservation({
        categoryId: selectedCategory,
        categoryName: selectedCatObj?.name || 'عام',
        locationId: selectedLocation,
        locationName: selectedLocObj?.name || 'موقع عام',
        workerId: selectedWorker,
        workerName: selectedWorkerObj?.name || 'فني',
        description: description.trim(),
      });

      // Navigate back to home immediately
      setScreen('home');
    } catch (err: any) {
      console.error('Error adding observation', err);
      setErrorMessage('حدث خطأ أثناء حفظ الملاحظة، يرجى المحاولة ثانية.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 text-right">
      
      {/* Top bar with back button */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('home')}
            className="p-1.5 -mr-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            title="رجوع للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">تسجيل ملاحظة ميدانية جديدة</h2>
            <p className="text-[11px] text-slate-700">توثيق سريع للملاحظة والفني المبلّغ</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Field 1: Category */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            <span>1. نوع الملاحظة</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 2: Location with quick search */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs relative">
          <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>2. الموقع</span>
              <span className="text-red-500">*</span>
            </span>
            {selectedLocObj && (
              <span className="text-[11px] text-sky-700 font-medium truncate max-w-[200px]">
                المحدد: {selectedLocObj.name}
              </span>
            )}
          </label>

          {/* Location quick search input */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="ابحث في المواقع (مثال: عيادات، طوارئ، تنويم...)"
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setIsLocationDropdownOpen(true);
              }}
              onFocus={() => setIsLocationDropdownOpen(true)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden transition-colors"
            />
            <Search className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5" />
          </div>

          {/* Quick list / chips of locations */}
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-0.5">
            {filteredLocations.length === 0 ? (
              <p className="text-xs text-slate-700 py-3 text-center">لا توجد مواقع مطابقة للبحث</p>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = selectedLocation === loc.id;
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc.id);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{loc.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Field 3: Description text */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>3. وصف الملاحظة</span>
            <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصف الملاحظة الميدانية بدقة (مثال: لمبة الممر المؤدي للعيادات الخارجية طافية، أو تسريب في صنبور المغسلة...)"
            required
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden resize-none transition-colors"
          />
        </div>

        {/* Field 4: Worker informed */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>4. الفني / العامل الذي تم إبلاغه شفهياً</span>
            <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-700 mb-2.5">
            اختر الفني الذي بلّغته بالخلل ميدانياً لمتابعة الإغلاق لاحقاً:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeWorkers.map((w) => {
              const isSelected = selectedWorker === w.id;
              return (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => setSelectedWorker(w.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-1 ring-sky-500'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold truncate">{w.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <span className="text-[10px] text-slate-700 block truncate">{w.department}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Primary Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5px]" />
            <span>{submitting ? 'جاري الحفظ...' : 'حفظ الملاحظة'}</span>
          </button>
          <p className="text-center text-[11px] text-slate-700 mt-2">
            يتم التوثيق تلقائياً باسمك وحالة "مفتوحة" وتوقيت الخادم الحالي
          </p>
        </div>

      </form>
    </div>
  );
};
