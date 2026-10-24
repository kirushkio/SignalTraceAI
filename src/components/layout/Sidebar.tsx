import React from 'react';
import { NavView, UserSession } from '../../types';
import {
  LayoutDashboard,
  Search,
  Network,
  History,
  Database,
  Shield,
  LogOut,
  Sparkles,
  ChevronRight,
  Layers,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  userSession: UserSession;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userSession,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'console' as NavView, label: 'Investigation Console', icon: Search, badge: 'Orb' },
    { id: 'workspace' as NavView, label: 'Active Investigation', icon: Network },
    { id: 'history' as NavView, label: 'Investigation History', icon: History },
    { id: 'datasources' as NavView, label: 'Data Sources & Setup', icon: Database, badge: 'Sponsors' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Vertical Rail Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-surface-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-surface-border flex items-center justify-between">
            <div
              onClick={() => {
                onNavigate('dashboard');
                onCloseMobile();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* SignalTrace Mark */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-signal-cyan via-signal-blue to-signal-magenta p-0.5 shadow-cyan-glow/40">
                <div className="w-full h-full bg-obsidian rounded-[10px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-signal-cyan group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-sm font-bold tracking-tight text-white block">
                  SignalTrace AI
                </span>
                <span className="text-[10px] font-mono text-signal-cyan tracking-wider block">
                  PHASE 1 FOUNDATION
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/40 shadow-cyan-glow/20'
                      : 'text-slate-400 hover:text-white hover:bg-surface-light border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-signal-cyan' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-signal-cyan/20 text-signal-cyan'
                          : 'bg-surface-dark text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail: Sponsor Stack Status & User Profile */}
        <div className="p-3 border-t border-surface-border space-y-3 text-left">
          {/* Sponsor Quick Status Card */}
          <div className="p-3 rounded-xl bg-surface-dark border border-surface-border/80">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">
              System Stack Status
            </span>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Zetaris Data</span>
                <span className="text-signal-cyan">Seeded Mock</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nemotron LLM</span>
                <span className="text-signal-magenta">Phase 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Meterless Mem</span>
                <span className="text-signal-blue">Phase 3</span>
              </div>
            </div>
          </div>

          {/* User Account / Session card */}
          <div className="p-2.5 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate block">
                  {userSession.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-signal-cyan truncate block">
                {userSession.workspaceName}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sign out or switch workspace"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-surface-light transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
