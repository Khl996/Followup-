import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Building2, UserCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, isFirebaseLive, demoSupervisors, switchDemoUser, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err: any) {
      console.error('Login error', err);
      setError(err.message || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-right overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building2 className="w-5 h-5 text-sky-700" />
            <span>تسجيل دخول المشرف</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-700 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isFirebaseLive ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">البريد الإلكتروني للمشرف</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supervisor@hospital.gov.sa"
                  required
                  className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden text-left"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'جاري التحقق...' : 'دخول إلى النظام'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950">
              <p className="font-bold mb-1">الوضع التجريبي الميداني النشط:</p>
              <p className="text-[11px] text-sky-800">
                يمكنك التبديل الفوري بين حسابات المشرفين لتجربة متابعة الملاحظات وتسليم المناوبات:
              </p>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {demoSupervisors.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    switchDemoUser(s.id);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs ${
                    currentUser?.id === s.id
                      ? 'bg-sky-100 border-sky-400 text-sky-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{s.displayName}</span>
                    <span className="text-[10px] text-slate-700">{s.email}</span>
                  </div>
                  {s.role === 'admin' ? (
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                      مدير
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      مشرف
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
