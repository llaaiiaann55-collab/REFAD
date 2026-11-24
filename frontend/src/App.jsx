import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DemoBanner } from './components/DemoBanner';
import { Toast } from './components/Toast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShiftsPage } from './pages/ShiftsPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { SmartHandoverPage } from './pages/SmartHandoverPage';
import { TranslationPage } from './pages/TranslationPage';
import { MissingInfoPage } from './pages/MissingInfoPage';
import { TasksPage } from './pages/TasksPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupervisorPage } from './pages/SupervisorPage';

export const App = () => {
  const { lang, dir, activeTab } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return (
      <div dir={dir} className="font-arabic min-h-screen bg-[#F7FAFC]">
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
        <Toast />
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'patients':
        return <PatientsPage />;
      case 'patient-detail':
        return <PatientDetailPage />;
      case 'handover-ai':
        return <SmartHandoverPage />;
      case 'translation':
        return <TranslationPage />;
      case 'missing-info':
        return <MissingInfoPage />;
      case 'tasks':
        return <TasksPage />;
      case 'confirmation':
        return <ConfirmationPage />;
      case 'history':
        return <HistoryPage />;
      case 'supervisor':
        return <SupervisorPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div dir={dir} className={`min-h-screen bg-[#F7FAFC] ${lang === 'ar' ? 'font-arabic' : 'font-english'}`}>
      <Header />
      <DemoBanner />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default App;
