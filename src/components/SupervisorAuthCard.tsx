import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

export const SupervisorAuthCard: React.FC = () => {
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email.trim(), password);
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('بيانات الدخول غير صحيحة أو أن الحساب غير مسجل.');
      } else if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب ألا تقل عن 6 خانات.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.');
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
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form Only */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              البريد الإلكتروني للمشرف
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supervisor@hospital.org"
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
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'جاري الدخول...' : 'دخول المشرف'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
