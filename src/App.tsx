import React, { useState, useEffect } from 'react';
import { NavView, UserSession, Investigation, DataSourceStatus } from './types';
import {
  CURRENT_DEMO_USER,
  INITIAL_DATA_SOURCES,
  FLAGSHIP_INVESTIGATION,
  INVESTIGATION_HISTORY_SEED
} from './data/mockData';
import { ApiService } from './services/api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { InvestigationConsole } from './components/console/InvestigationConsole';
import { InvestigationWorkspace } from './components/workspace/InvestigationWorkspace';
import { InvestigationHistory } from './components/history/InvestigationHistory';
import { DataSourcesSettings } from './components/settings/DataSourcesSettings';
import { LoginDemoEntry } from './components/auth/LoginDemoEntry';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [userSession, setUserSession] = useState<UserSession | null>(CURRENT_DEMO_USER);
  const [investigations, setInvestigations] = useState<Investigation[]>(INVESTIGATION_HISTORY_SEED);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation>(FLAGSHIP_INVESTIGATION);
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>(INITIAL_DATA_SOURCES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [clarificationData, setClarificationData] = useState<{
    prompt: string;
    options: string[];
  } | null>(null);

  // Initialize and sync investigations from persistent backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [loadedInvs, loadedSources] = await Promise.allSettled([
          ApiService.getInvestigations(),
          ApiService.getDataSources()
        ]);

        if (loadedInvs.status === 'fulfilled' && loadedInvs.value.length > 0) {
          setInvestigations(loadedInvs.value);
          const flagship = loadedInvs.value.find((i) => i.id === FLAGSHIP_INVESTIGATION.id);
          if (flagship) setActiveInvestigation(flagship);
        }
        if (loadedSources.status === 'fulfilled' && loadedSources.value.length > 0) {
          setDataSources(loadedSources.value);
        }
      } catch (e) {
        console.warn('Backend store connecting, using initial seed data.', e);
      }
    }
    loadBackendData();
  }, []);

  // Handle URL hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as NavView;
      if (['dashboard', 'console', 'workspace', 'history', 'datasources', 'auth'].includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
      handleHash();
    }
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view: NavView) => {
    setCurrentView(view);
    window.location.hash = view;
  };

  const handleStartInvestigation = async (query: string) => {
    try {
      setIsProcessingQuery(true);
      setClarificationData(null);

      // Call Backend Orchestrator
      const response = await ApiService.queryInvestigation(query);

      if (response.status === 'clarification_needed') {
        setIsProcessingQuery(false);
        setClarificationData({
          prompt: response.clarificationPrompt || 'Please clarify your inquiry scope:',
          options: response.suggestedClarifications || []
        });
        return;
      }

      if (response.investigation) {
        const inv = response.investigation;
        setActiveInvestigation(inv);
        setInvestigations((prev) => [inv, ...prev.filter((i) => i.id !== inv.id)]);
        handleNavigate('workspace');
      }
    } catch (err: any) {
      console.error('Failed to run investigation via API:', err);
      // Fallback graceful handling
      setActiveInvestigation(FLAGSHIP_INVESTIGATION);
      handleNavigate('workspace');
    } finally {
      setIsProcessingQuery(false);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      const { action } = await ApiService.approveAction(
        activeInvestigation.id,
        actionId,
        userSession?.role
      );
      setActiveInvestigation((prev) => ({
        ...prev,
        actions: prev.actions.map((a) => (a.id === actionId ? action : a))
      }));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleRejectAction = async (actionId: string) => {
    try {
      const { action } = await ApiService.rejectAction(
        activeInvestigation.id,
        actionId,
        userSession?.role
      );
      setActiveInvestigation((prev) => ({
        ...prev,
        actions: prev.actions.map((a) => (a.id === actionId ? action : a))
      }));
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  const handleExecuteAction = async (actionId: string) => {
    try {
      const res = await ApiService.executeAction(
        activeInvestigation.id,
        actionId,
        userSession?.role
      );
      setActiveInvestigation((prev) => ({
        ...prev,
        actions: prev.actions.map((a) => (a.id === actionId ? res.action : a))
      }));
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  const handleVerifyAction = async (actionId: string) => {
    try {
      const { action } = await ApiService.verifyAction(activeInvestigation.id, actionId);
      setActiveInvestigation((prev) => ({
        ...prev,
        actions: prev.actions.map((a) => (a.id === actionId ? action : a))
      }));
    } catch (err) {
      console.error('Verify failed:', err);
    }
  };

  const handleCancelInvestigation = async () => {
    try {
      const cancelled = await ApiService.cancelInvestigation(activeInvestigation.id);
      setActiveInvestigation(cancelled);
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleReopenInvestigation = (inv: Investigation) => {
    setActiveInvestigation(inv);
    handleNavigate('workspace');
  };

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setUserSession(null);
    handleNavigate('auth');
  };

  if (!userSession || currentView === 'auth') {
    return (
      <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col justify-center">
        <LoginDemoEntry onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex">
      {/* Sidebar Rail */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        userSession={userSession}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          userSession={userSession}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenConsole={() => handleNavigate('console')}
        />

        <main className="flex-1 pb-16">
          {currentView === 'dashboard' && (
            <Dashboard
              investigations={investigations}
              dataSources={dataSources}
              onOpenConsole={() => handleNavigate('console')}
              onOpenWorkspace={(inv) => {
                setActiveInvestigation(inv);
                handleNavigate('workspace');
              }}
            />
          )}

          {currentView === 'console' && (
            <InvestigationConsole
              onStartInvestigation={handleStartInvestigation}
              isProcessing={isProcessingQuery}
              clarificationData={clarificationData}
              onClearClarification={() => setClarificationData(null)}
            />
          )}

          {currentView === 'workspace' && (
            <InvestigationWorkspace
              investigation={activeInvestigation}
              onReopen={() => handleStartInvestigation(activeInvestigation.query || activeInvestigation.title)}
              onBackToConsole={() => handleNavigate('console')}
              onApproveAction={handleApproveAction}
              onRejectAction={handleRejectAction}
              onExecuteAction={handleExecuteAction}
              onVerifyAction={handleVerifyAction}
              onCancelInvestigation={handleCancelInvestigation}
            />
          )}

          {currentView === 'history' && (
            <InvestigationHistory
              investigations={investigations}
              onReopenInvestigation={handleReopenInvestigation}
            />
          )}

          {currentView === 'datasources' && (
            <DataSourcesSettings
              dataSources={dataSources}
              onRefreshDataSources={async () => {
                try {
                  const sources = await ApiService.getDataSources();
                  setDataSources(sources);
                } catch {
                  setDataSources((prev) => [...prev]);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
