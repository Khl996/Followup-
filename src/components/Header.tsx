import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ScreenType } from '../types';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Database, 
  CloudCheck, 
  Sparkles,
  LogOut,
  Settings
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  onOpenFirebaseGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, setScreen, onOpenFirebaseGuide }) => {
  const { currentUser, switchDemoUser, demoSupervisors, isFirebaseLive, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Hospital Facility Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">
              ملاحظات المشرفين الميدانية
            </h1>
            <p className="text-[11px] text-slate-700 leading-tight truncate">
              مرافق المستشفى
            </p>
          </div>
        </div>

        {/* Right side: Supervisor selector / profile & Connection status */}
        <div className="flex items-center gap-2">
          
          {/* Connection Mode Indicator */}
          <button
            onClick={onOpenFirebaseGuide}
            title={isFirebaseLive ? 'متصل بقاعدة Cloud Firestore' : 'الوضع التجريبي الميداني النشط (انقر لعرض إعداد Firebase)'}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              isFirebaseLive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500'}`} />
            <span className="hidden sm:inline">{isFirebaseLive ? 'Firestore حي' : 'وضع تجريبي'}</span>
          </button>

          {/* Supervisor Profile & Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center text-[11px] font-bold">
                {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'م'}
              </div>
              <span className="font-semibold max-w-[90px] truncate text-right">
                {currentUser?.displayName || 'المشرف'}
              </span>
              {isAdmin && (
                <span className="bg-sky-100 text-sky-800 text-[10px] px-1 rounded font-medium">مدير</span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-[11px] text-slate-700 font-medium">المشرف النشط حالياً:</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.displayName}</p>
                    <p className="text-[11px] text-slate-700 truncate">{currentUser?.email}</p>
                  </div>

                  {/* Switch Supervisor in Demo Mode */}
                  {!isFirebaseLive && (
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[11px] text-slate-700 font-semibold mb-1.5">
                        تبديل المشرف (محاكاة نوبات العمل):
                      </p>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {demoSupervisors.map((sup) => (
                          <button
                            key={sup.id}
                            onClick={() => {
                              switchDemoUser(sup.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-right px-2 py-1 rounded text-xs flex items-center justify-between transition-colors ${
                              currentUser?.id === sup.id
                                ? 'bg-sky-100 text-sky-900 font-bold'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="truncate">{sup.displayName}</span>
                            {sup.role === 'admin' && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">إدارة</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Settings / Admin Option */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setScreen('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-right px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-700" />
                      <span>إدارة النظام والإعدادات</span>
                    </button>
                  )}

                  {/* Firebase Guide button */}
                  <button
                    onClick={() => {
                      onOpenFirebaseGuide();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                  >
                    <Database className="w-4 h-4 text-slate-700" />
                    <span>دليل إعداد Firebase والاستضافة</span>
                  </button>

                  {/* Sign Out if Firebase Live */}
                  {isFirebaseLive && currentUser && (
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                      }}
                      className="w-full text-right px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>تسجيل الخروج</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
