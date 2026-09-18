import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ScreenType, Observation } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { AddObservationScreen } from './components/AddObservationScreen';
import { PausedObservationsScreen } from './components/PausedObservationsScreen';
import { DailyLogScreen } from './components/DailyLogScreen';
import { AdminScreen } from './components/AdminScreen';
import { ObservationDetailsModal } from './components/ObservationDetailsModal';
import { SupervisorAuthCard } from './components/SupervisorAuthCard';
import { AlertTriangle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, loading, isFirebaseLive } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSelectObservation = (obs: Observation) => {
    setSelectedObservation(obs);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-700 text-xs" dir="rtl">
        <div className="w-8 h-8 border-3 border-sky-700 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-bold">جاري تشغيل نظام الملاحظات الميدانية...</p>
      </div>
    );
  }

  // If Firebase fails to initialize
  if (!isFirebaseLive) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-right font-sans" dir="rtl">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-2">تعذر الاتصال بقاعدة بيانات النظام</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            تعذر الاتصال بخوادم الملاحظات الميدانية. يرجى التحقق من اتصال الإنترنت، أو مراجعة مسؤول إدارة المرافق.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // If supervisor is not signed in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans" dir="rtl">
        <SupervisorAuthCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans" dir="rtl">
      
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {currentScreen === 'home' && (
          <HomeScreen
            setScreen={setCurrentScreen}
            onSelectObservation={handleSelectObservation}
          />
        )}

        {currentScreen === 'add' && (
          <AddObservationScreen
            setScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'paused' && (
          <PausedObservationsScreen
            setScreen={setCurrentScreen}
            onSelectObservation={handleSelectObservation}
          />
        )}

        {currentScreen === 'log' && (
          <DailyLogScreen
            onSelectObservation={handleSelectObservation}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminScreen
            setScreen={setCurrentScreen}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
      />

      {/* Observation Details Modal */}
      <ObservationDetailsModal
        observation={selectedObservation}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedObservation(null);
        }}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
