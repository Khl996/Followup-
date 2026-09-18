import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ShieldCheck, UserPlus, LogIn, Database } from 'lucide-react';

interface SupervisorAuthCardProps {
  onOpenFirebaseGuide: () => void;
}

export const SupervisorAuthCard: React.FC<SupervisorAuthCardProps> = ({ onOpenFirebaseGuide }) => {
  const { loginWithEmail, createSupervisorAccount, switchDemoUser } = useAuth();

  const [email, setEmail] = useState('Khalid.a.kh990@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('خالد العتيبي');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await createSupervisorAccount(
          email.trim(),
          password,
          name.trim() || 'خالد العتيبي',
          email.trim().toLowerCase() === 'khalid.a.kh990@gmail.com' ? 'admin' : 'supervisor'
        );
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('المستخدم غير موجود أو كلمة المرور غير صحيحة. إذا كانت هذه أول مرة، انقر على "تسجيل هذا الحساب لأول مرة" أدناه.');
      } else if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد مسجل مسبقاً، يمكنك تسجيل الدخول به مباشرة.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب أن لا تقل عن 6 خانات.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-right">
        
        {/* Hospital Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-md mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            ملاحظات المشرفين الميدانية
          </h2>
          <p className="text-xs text-slate-700 mt-1">
            إدارة تشغيل ومرافق المستشفى
          </p>

          {/* Connected Firebase Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>متصل بمشروع Firebase: followup-eae79</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                اسم المشرف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل للمشرف"
                required
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              البريد الإلكتروني للمشرف
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Khalid.a.kh990@gmail.com"
                required
                className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-slate-700 absolute right-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-slate-700 absolute right-2.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'جاري التسجيل...' : 'تسجيل حساب المشرف في Firebase'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري الدخول...' : 'دخول المشرف'}</span>
              </>
            )}
          </button>

          {/* Toggle Login / Register */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold transition-colors"
            >
              {isRegistering
                ? 'لديك حساب بالفعل؟ تسجيل الدخول'
                : 'أول مرة تستخدم هذا الحساب؟ تسجيل الحساب في Firebase'}
            </button>
          </div>

        </form>

        {/* Demo Mode & Firebase Guide Option */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onOpenFirebaseGuide}
            className="text-slate-700 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>دليل الإعداد والقواعد</span>
          </button>

          <button
            type="button"
            onClick={() => switchDemoUser('sup-1')}
            className="text-sky-700 hover:text-sky-800 font-bold"
          >
            المعاينة بالوضع التجريبي الميداني &larr;
          </button>
        </div>

      </div>
    </div>
  );
};
