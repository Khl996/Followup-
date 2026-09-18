import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ScreenType } from '../types';
import { 
  Users, 
  Wrench, 
  MapPin, 
  Tag, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface AdminScreenProps {
  setScreen: (screen: ScreenType) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ setScreen }) => {
  const { 
    workers, 
    locations, 
    categories, 
    supervisors, 
    addWorker, 
    toggleWorkerStatus, 
    addLocation, 
    toggleLocationStatus, 
    addCategory, 
    toggleCategoryStatus,
    seedStarterData
  } = useData();
  const { createSupervisorAccount, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'workers' | 'locations' | 'categories' | 'supervisors'>('workers');

  // New worker form
  const [workerName, setWorkerName] = useState('');
  const [workerDept, setWorkerDept] = useState('');

  // New location form
  const [locationName, setLocationName] = useState('');

  // New category form
  const [categoryName, setCategoryName] = useState('');

  // New supervisor form
  const [supEmail, setSupEmail] = useState('');
  const [supPass, setSupPass] = useState('');
  const [supName, setSupName] = useState('');
  const [supRole, setSupRole] = useState<'admin' | 'supervisor'>('supervisor');

  const [msg, setMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [creatingSupervisor, setCreatingSupervisor] = useState(false);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-right">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">صلاحية محددة</h2>
          <p className="text-xs text-slate-600 mb-4">
            هذه الشاشة مخصصة لمدير النظام فقط لإدارة الفنيين والمشرفين والمرجعيات.
          </p>
          <button
            onClick={() => setScreen('home')}
            className="py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim() || !workerDept.trim()) return;
    try {
      await addWorker(workerName, workerDept);
      setWorkerName('');
      setWorkerDept('');
      setMsg('تمت إضافة الفني/العامل بنجاح');
      setTimeout(() => setMsg(''), 2500);
    } catch (err: any) {
      setMsg(err.message || 'حدث خطأ أثناء الإضافة');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;
    try {
      await addLocation(locationName);
      setLocationName('');
      setMsg('تمت إضافة الموقع بنجاح');
      setTimeout(() => setMsg(''), 2500);
    } catch (err: any) {
      setMsg(err.message || 'حدث خطأ أثناء الإضافة');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await addCategory(categoryName);
      setCategoryName('');
      setMsg('تمت إضافة التصنيف بنجاح');
      setTimeout(() => setMsg(''), 2500);
    } catch (err: any) {
      setMsg(err.message || 'حدث خطأ أثناء الإضافة');
    }
  };

  const handleAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supEmail.trim() || !supName.trim()) return;
    if (!supPass || supPass.trim().length < 6) {
      setMsg('يرجى إدخال كلمة مرور للمشرف لا تقل عن 6 خانات.');
      return;
    }
    setCreatingSupervisor(true);
    try {
      await createSupervisorAccount(
        supEmail.trim(), 
        supPass.trim(), 
        supName.trim(), 
        supRole
      );
      setSupEmail('');
      setSupPass('');
      setSupName('');
      setMsg('تم إنشاء حساب المشرف بنجاح');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg(`خطأ: ${err.message}`);
    } finally {
      setCreatingSupervisor(false);
    }
  };

  const handleSeedStarterData = async () => {
    setSeeding(true);
    try {
      const res = await seedStarterData();
      setMsg(res.message);
      setTimeout(() => setMsg(''), 3500);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 text-right">
      
      {/* Header */}
      <div className="pb-3 mb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('home')}
            className="p-1.5 -mr-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            title="رجوع للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-700" />
              <span>لوحة إدارة النظام</span>
            </h2>
            <p className="text-[11px] text-slate-700 mt-0.5">
              إدارة الفنيين، المواقع، التصنيفات، والمشرفين
            </p>
          </div>
        </div>

        {/* First-Run Starter Data Button */}
        <button
          onClick={handleSeedStarterData}
          disabled={seeding}
          className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1.5 rounded-xl hover:bg-sky-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="تهيئة الأقسام والتصنيفات والمواقع الافتراضية إذا كانت قاعدة البيانات جديدة"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>{seeding ? 'جاري التهيئة...' : 'تهيئة البيانات الأساسية'}</span>
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center animate-in fade-in">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex-1 min-w-[75px] py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'workers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          الفنيون والعمال ({workers.length})
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'locations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          المواقع ({locations.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          التصنيفات ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('supervisors')}
          className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'supervisors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          المشرفون ({supervisors.length})
        </button>
      </div>

      {/* 1. WORKERS TAB */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          
          {/* Add Worker Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>إضافة فني أو عامل جديد (لا يملك حساباً في التطبيق)</span>
            </h3>
            <form onSubmit={handleAddWorker} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم الفني (مثال: سعود، كمال...)"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  required
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
                <input
                  type="text"
                  placeholder="القسم أو التخصص (مثال: كهرباء، سباكة، نظافة...)"
                  value={workerDept}
                  onChange={(e) => setWorkerDept(e.target.value)}
                  required
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                حفظ الفني
              </button>
            </form>
          </div>

          {/* Workers List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>قائمة الفنيين والعمال ({workers.length})</span>
              <span className="text-[11px] text-slate-700">تنشيط / تعطيل</span>
            </div>
            {workers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                لا يوجد فنيون مسجلون. يمكنك إضافتهم أعلاه أو الضغط على "تهيئة البيانات الأساسية".
              </div>
            ) : (
              workers.map((w) => (
                <div key={w.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <p className="font-bold text-slate-900">{w.name}</p>
                    <p className="text-[11px] text-slate-700">{w.department}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWorkerStatus(w.id, !w.active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      w.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {w.active ? 'نشط' : 'معطل'}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 2. LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          
          {/* Add Location Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>إضافة موقع بالمستشفى</span>
            </h3>
            <form onSubmit={handleAddLocation} className="space-y-2.5">
              <input
                type="text"
                placeholder="اسم الموقع (مثال: عيادات الدور الثاني، طوارئ أطفال...)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
              <button
                type="submit"
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                حفظ الموقع
              </button>
            </form>
          </div>

          {/* Locations List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>المواقع المعتمدة ({locations.length})</span>
              <span className="text-[11px] text-slate-700">الحالة</span>
            </div>
            {locations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                لا توجد مواقع مسجلة. يمكنك إضافتها أعلاه أو الضغط على "تهيئة البيانات الأساسية".
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <span className="font-bold text-slate-900">{loc.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleLocationStatus(loc.id, !loc.active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      loc.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc.active ? 'نشط' : 'معطل'}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 3. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          
          {/* Add Category Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>إضافة تصنيف ملاحظة جديد</span>
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-2.5">
              <input
                type="text"
                placeholder="اسم التصنيف (مثال: أمن وسلامة، تكييف...)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
              <button
                type="submit"
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                حفظ التصنيف
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>التصنيفات المعتمدة ({categories.length})</span>
              <span className="text-[11px] text-slate-700">الحالة</span>
            </div>
            {categories.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                لا توجد تصنيفات مسجلة. يمكنك إضافتها أعلاه أو الضغط على "تهيئة البيانات الأساسية".
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <span className="font-bold text-slate-900">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCategoryStatus(cat.id, !cat.active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      cat.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.active ? 'نشط' : 'معطل'}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 4. SUPERVISORS TAB */}
      {activeTab === 'supervisors' && (
        <div className="space-y-4">
          
          {/* Add Supervisor Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>إضافة حساب مشرف مرافق جديد</span>
            </h3>
            <form onSubmit={handleAddSupervisor} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم المشرف (مثال: فهد، محمد...)"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  required
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  required
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="كلمة المرور (6 خانات على الأقل)"
                  value={supPass}
                  onChange={(e) => setSupPass(e.target.value)}
                  required
                  minLength={6}
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                  dir="ltr"
                />
                <select
                  value={supRole}
                  onChange={(e) => setSupRole(e.target.value as any)}
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                >
                  <option value="supervisor">مشرف مرافق (عادي)</option>
                  <option value="admin">مدير نظام (Admin)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creatingSupervisor}
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {creatingSupervisor ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المشرف'}
              </button>
            </form>
          </div>

          {/* Supervisors List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>المشرفون المسجلون ({supervisors.length})</span>
              <span className="text-[11px] text-slate-700">الصلاحية</span>
            </div>
            {supervisors.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                لا يوجد مشرفون مسجلون في قاعدة البيانات حالياً.
              </div>
            ) : (
              supervisors.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <p className="font-bold text-slate-900">{s.displayName}</p>
                    <p className="text-[11px] text-slate-700">{s.email}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.role === 'admin'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {s.role === 'admin' ? 'مدير نظام' : 'مشرف مرافق'}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
