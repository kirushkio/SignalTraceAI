import React from 'react';
import { NavView, UserSession } from '../../types';
import { Menu, ShieldAlert, Sparkles, HelpCircle, Bell } from 'lucide-react';

interface HeaderProps {
  currentView: NavView;
  userSession: UserSession;
  onOpenMobileMenu: () => void;
  onOpenConsole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  userSession,
  onOpenMobileMenu,
  onOpenConsole
}) => {
  const getViewTitle = (view: NavView) => {
    switch (view) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'console':
        return 'Investigation Console';
      case 'workspace':
        return 'Incident Investigation Workspace';
      case 'history':
        return 'Historical Prior Context';
      case 'datasources':
        return 'Data Sources & Sponsor Integrations';
      default:
        return 'SignalTrace AI';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-surface-border px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-light lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current View Breadcrumb */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              SignalTrace /
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {getViewTitle(currentView)}
            </h2>
          </div>
        </div>
      </div>

      {/* Right Header Status Badges */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {userSession.isDemoMode && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-signal-blue/15 border border-signal-blue/40 text-xs font-mono text-signal-cyan">
            <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
            <span>DEMO MODE: APEX RETAIL</span>
          </div>
        )}

        {/* Quick Launch Orb Shortcut */}
        <button
          type="button"
          onClick={onOpenConsole}
          className="px-3 py-1.5 rounded-xl bg-surface-light hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-signal-cyan" />
          <span className="hidden sm:inline">Investigate</span>
        </button>
      </div>
    </header>
  );
};
