import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AIChatBI } from './components/chat/AIChatBI';
import { AutoEDAStudio } from './components/eda/AutoEDAStudio';
import { PredictiveStudio } from './components/predictive/PredictiveStudio';
import { ScenarioSimulator } from './components/simulator/ScenarioSimulator';
import { ExecutiveReports } from './components/reports/ExecutiveReports';
import { DatasetManager } from './components/datasets/DatasetManager';
import { SemanticLayer } from './components/semantic/SemanticLayer';
import { SettingsModal } from './components/settings/SettingsModal';

const MainLayout = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'chat' && <AIChatBI />}
          {activeTab === 'eda' && <AutoEDAStudio />}
          {activeTab === 'predictive' && <PredictiveStudio />}
          {activeTab === 'simulator' && <ScenarioSimulator />}
          {activeTab === 'semantic' && <SemanticLayer />}
          {activeTab === 'reports' && <ExecutiveReports />}
          {activeTab === 'datasets' && <DatasetManager />}
        </main>
      </div>
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
