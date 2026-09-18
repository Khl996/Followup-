import React from 'react';
import { ScreenType } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  PlusCircle, 
  Clock, 
  CalendarDays, 
  Settings 
} from 'lucide-react';

interface BottomNavProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen }) => {
  const { observations } = useData();
  const { isAdmin } = useAuth();

  const pausedCount = observations.filter((o) => o.status === 'PAUSED').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/90 shadow-lg pb-safe">
      <div className="max-w-2xl mx-auto px-2 flex items-center justify-around h-16">
        
        {/* Screen 1: Home */}
        <button
          onClick={() => setScreen('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentScreen === 'home'
              ? 'text-sky-700 font-bold'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${currentScreen === 'home' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] leading-tight">الرئيسية</span>
          {currentScreen === 'home' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-sky-700 rounded-full" />
          )}
        </button>

        {/* Screen 2: Add Observation (Highlight Primary) */}
        <button
          onClick={() => setScreen('add')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentScreen === 'add'
              ? 'text-sky-700 font-bold'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center -mt-3 shadow-md transition-transform active:scale-95 ${
            currentScreen === 'add' 
              ? 'bg-sky-700 text-white ring-2 ring-sky-200'
              : 'bg-sky-600 text-white hover:bg-sky-700'
          }`}>
            <PlusCircle className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5">إضافة</span>
        </button>

        {/* Screen 4: Paused Observations */}
        <button
          onClick={() => setScreen('paused')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentScreen === 'paused'
              ? 'text-sky-700 font-bold'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <div className="relative mb-1">
            <Clock className={`w-5 h-5 ${currentScreen === 'paused' ? 'stroke-[2.5px]' : ''}`} />
            {pausedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-none">
                {pausedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">المعلّقة</span>
          {currentScreen === 'paused' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-sky-700 rounded-full" />
          )}
        </button>

        {/* Screen 5: Daily Log */}
        <button
          onClick={() => setScreen('log')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentScreen === 'log'
              ? 'text-sky-700 font-bold'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <CalendarDays className={`w-5 h-5 mb-1 ${currentScreen === 'log' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] leading-tight">السجل اليومي</span>
          {currentScreen === 'log' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-sky-700 rounded-full" />
          )}
        </button>

        {/* Admin / Settings Screen (always accessible to admin, or as settings) */}
        {isAdmin && (
          <button
            onClick={() => setScreen('admin')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
              currentScreen === 'admin'
                ? 'text-sky-700 font-bold'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-5 h-5 mb-1 ${currentScreen === 'admin' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[11px] leading-tight">الإدارة</span>
            {currentScreen === 'admin' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-sky-700 rounded-full" />
            )}
          </button>
        )}

      </div>
    </nav>
  );
};
