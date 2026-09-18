import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  Globe, 
  Key, 
  Terminal,
  Layers
} from 'lucide-react';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIRESTORE_RULES_TEXT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'Khalid.a.kh990@gmail.com' ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }

    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128;
    }

    // Default deny catch-all
    match /{document=**} {
      allow read, write: if false;
    }

    // 1. Users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow update, delete: if isAdmin();
    }

    // 2. Workers (Technicians/cleaners)
    match /workers/{workerId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin() && isValidId(workerId);
    }

    // 3. Locations
    match /locations/{locationId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin() && isValidId(locationId);
    }

    // 4. Categories
    match /categories/{categoryId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin() && isValidId(categoryId);
    }

    // 5. Observations
    match /observations/{observationId} {
      allow read: if isSignedIn();

      allow create: if isSignedIn()
        && isValidId(observationId)
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.status == 'OPEN'
        && request.resource.data.description is string
        && request.resource.data.description.size() > 0;

      allow update: if isSignedIn() && (
        isAdmin() ||
        (request.resource.data.status == 'CLOSED' && request.resource.data.closedBy == request.auth.uid) ||
        (request.resource.data.status == 'PAUSED' && request.resource.data.pausedBy == request.auth.uid) ||
        (resource.data.status == 'PAUSED' && request.resource.data.status == 'OPEN')
      );

      allow delete: if isAdmin();
    }
  }
}`;

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ isOpen, onClose }) => {
  const { isFirebaseLive } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);
  const [configInput, setConfigInput] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'collections' | 'rules' | 'admin' | 'hosting'>('config');

  if (!isOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_TEXT);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleSaveCustomConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean input if pasted as object or json
      let parsed: any;
      const trimmed = configInput.trim();
      if (trimmed.startsWith('const firebaseConfig =') || trimmed.startsWith('var firebaseConfig =')) {
        const jsonLike = trimmed
          .replace(/^(const|var|let)\s+firebaseConfig\s*=\s*/, '')
          .replace(/;\s*$/, '')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        parsed = JSON.parse(jsonLike);
      } else {
        parsed = JSON.parse(trimmed);
      }

      if (parsed.apiKey && parsed.projectId) {
        localStorage.setItem('hospital_firebase_custom_config', JSON.stringify(parsed));
        setConfigSaved(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        alert('يرجى التأكد من احتواء الإعدادات على apiKey و projectId على الأقل.');
      }
    } catch (err) {
      alert('صيغة JSON غير صحيحة. يرجى لصق كائن firebaseConfig صحيح.');
    }
  };

  const handleClearCustomConfig = () => {
    localStorage.removeItem('hospital_firebase_custom_config');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 text-right overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">دليل إعداد Firebase والاستضافة</h3>
              <p className="text-[11px] text-slate-700">
                حالة الاتصال الحالية: {isFirebaseLive ? '✅ متصل بـ Cloud Firestore' : '⚡ الوضع التجريبي النشط'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-700 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 overflow-x-auto px-2 py-1 gap-1">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'config' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. ربط المشروع
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'collections' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. المجموعات والفهارس
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. قواعد الحماية
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. حساب المدير
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'hosting' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. استضافة Firebase
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: CONNECT FIREBASE */}
          {activeTab === 'config' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950">
                <p className="font-bold mb-1">ربط التطبيق بمشروع Firebase الخاص بك:</p>
                <p className="text-[11px] leading-relaxed">
                  يمكنك إما ضبط متغيرات البيئة في <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900">.env</code> أو لصق كائن <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900">firebaseConfig</code> مباشرة في الصندوق أدناه للاتصال الفوري!
                </p>
              </div>

              <form onSubmit={handleSaveCustomConfig} className="space-y-2">
                <label className="block font-bold text-slate-800">
                  الصق كائن إعدادات Firebase (JSON):
                </label>
                <textarea
                  rows={6}
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-hospital.firebaseapp.com",\n  "projectId": "my-hospital",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                  className="w-full p-2.5 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                  dir="ltr"
                />

                {configSaved && (
                  <p className="text-emerald-700 font-bold text-center">
                    تم الحفظ بنجاح! جاري إعادة التحميل للاتصال بقاعدتك...
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl transition-colors"
                  >
                    حفظ وربط Firebase
                  </button>

                  {localStorage.getItem('hospital_firebase_custom_config') && (
                    <button
                      type="button"
                      onClick={handleClearCustomConfig}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl transition-colors"
                    >
                      إلغاء الربط
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: COLLECTIONS & INDEXES */}
          {activeTab === 'collections' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">المجموعات المطلوبة في Cloud Firestore:</h4>
                
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                  <div className="p-2.5">
                    <strong className="text-sky-900 block font-mono">1. observations</strong>
                    <span className="text-slate-600 text-[11px]">
                      الملاحظات الميدانية (الحالة، الوصف، الموقع، الفني، من فتحها وتاريخها، من علقها وسببها وتاريخ المراجعة، من أغلقها وتاريخها).
                    </span>
                  </div>
                  <div className="p-2.5">
                    <strong className="text-sky-900 block font-mono">2. workers</strong>
                    <span className="text-slate-600 text-[11px]">
                      الفنيون والعمال الميدانيون (الاسم، القسم، نشط/معطل). ليس لديهم حسابات تسجيل دخول.
                    </span>
                  </div>
                  <div className="p-2.5">
                    <strong className="text-sky-900 block font-mono">3. locations</strong>
                    <span className="text-slate-600 text-[11px]">
                      مواقع ومرافق المستشفى (الاسم، نشط/معطل).
                    </span>
                  </div>
                  <div className="p-2.5">
                    <strong className="text-sky-900 block font-mono">4. categories</strong>
                    <span className="text-slate-600 text-[11px]">
                      تصنيفات الملاحظات مثل: صيانة كهرباء، سباكة، تكييف، نظافة.
                    </span>
                  </div>
                  <div className="p-2.5">
                    <strong className="text-sky-900 block font-mono">5. users</strong>
                    <span className="text-slate-600 text-[11px]">
                      حسابات المشرفين (المعرف uid، الاسم، البريد، الدور: admin أو supervisor).
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <h5 className="font-bold text-slate-800 mb-1">الفهارس المركبة (Firestore Indexes):</h5>
                <p className="text-[11px] text-slate-600 mb-1.5">
                  تنشئ تلقائياً عند أول استعلام أو يمكن إضافتها في وحدة تحكم Firebase:
                </p>
                <ul className="list-disc pr-4 space-y-1 font-mono text-[11px] text-slate-700">
                  <li>observations (status ASC, createdAt DESC)</li>
                  <li>observations (status ASC, reviewDate ASC)</li>
                  <li>observations (createdBy ASC, createdAt DESC)</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">قواعد أمان Cloud Firestore (firestore.rules):</h4>
                <button
                  onClick={handleCopyRules}
                  className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRules ? 'تم النسخ!' : 'نسخ القواعد'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                قواعد مبرمجة ومفحوصة تمنع التلاعب، وتسمح فقط للمشرفين المعتمدين بإنشاء وإغلاق الملاحظات، وتحصر إدارة الفنيين والمواقع بمديري النظام.
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-56 leading-relaxed" dir="ltr">
                {FIRESTORE_RULES_TEXT}
              </pre>
            </div>
          )}

          {/* TAB 4: FIRST ADMIN ACCOUNT */}
          {activeTab === 'admin' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">إنشاء وتعيين حساب المدير الأول:</h4>
              <ol className="list-decimal pr-4 space-y-2 text-slate-700 text-xs">
                <li>
                  في <strong>Firebase Console</strong>، ادخل إلى <strong>Authentication</strong> وفعل طريقة الدخول بالبريد الإلكتروني وكلمة المرور (Email/Password).
                </li>
                <li>
                  أنشئ حساباً للمدير بالبريد الإلكتروني:
                  <div className="mt-1 p-2 bg-sky-50 border border-sky-200 rounded-lg font-mono text-sky-900 font-bold text-left" dir="ltr">
                    Khalid.a.kh990@gmail.com
                  </div>
                  (هذا البريد محدد مسبقاً في قواعد الحماية كمدير نظام تلقائي).
                </li>
                <li>
                  أو سجل الدخول بأي حساب مشرف، ثم في مجموعة <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">users</code> في Firestore اضبط حقل <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">role: "admin"</code>.
                </li>
                <li>
                  سيتمكن المدير من إضافة وإدارة المشرفين والفنيين والمواقع والتصنيفات من شاشة "الإدارة".
                </li>
              </ol>
            </div>
          )}

          {/* TAB 5: HOSTING DEPLOYMENT */}
          {activeTab === 'hosting' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">خطوات النشر على Firebase Hosting:</h4>
              <ol className="list-decimal pr-4 space-y-2 text-slate-700 text-xs">
                <li>
                  ثبت أدوات Firebase CLI إذا لم تكن مثبتة:
                  <code className="block mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] text-left" dir="ltr">
                    npm install -g firebase-tools
                  </code>
                </li>
                <li>
                  سجل الدخول لحساب جوجل الخاص بك:
                  <code className="block mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] text-left" dir="ltr">
                    firebase login
                  </code>
                </li>
                <li>
                  ابنِ ملفات الإنتاج للتطبيق:
                  <code className="block mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] text-left" dir="ltr">
                    npm run build
                  </code>
                </li>
                <li>
                  هيئ الاستضافة (حدد مجلد <code className="text-sky-300">dist</code> كمجلد عام ووافق على Single-Page App):
                  <code className="block mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] text-left" dir="ltr">
                    firebase init hosting
                  </code>
                </li>
                <li>
                  انشر التطبيق مباشرة:
                  <code className="block mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] text-left" dir="ltr">
                    firebase deploy
                  </code>
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
