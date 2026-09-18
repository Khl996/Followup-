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
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { SupervisorAuthCard } from './components/SupervisorAuthCard';

const MainContent: React.FC = () => {
  const { currentUser, loading, isFirebaseLive } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFirebaseGuideOpen, setIsFirebaseGuideOpen] = useState(false);

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

  // If live Firebase is connected and no supervisor is signed in yet
  if (isFirebaseLive && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans" dir="rtl">
        <SupervisorAuthCard onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)} />
        <FirebaseGuideModal
          isOpen={isFirebaseGuideOpen}
          onClose={() => setIsFirebaseGuideOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans" dir="rtl">
      
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
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
            onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
      />

      {/* Observation Details Modal (Screen 3) */}
      <ObservationDetailsModal
        observation={selectedObservation}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedObservation(null);
        }}
      />

      {/* Firebase Setup, Security Rules & Hosting Guide Modal */}
      <FirebaseGuideModal
        isOpen={isFirebaseGuideOpen}
        onClose={() => setIsFirebaseGuideOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </AuthProvider>
  );
}
