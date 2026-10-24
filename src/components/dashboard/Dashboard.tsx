import React from 'react';
import { Investigation, DataSourceStatus } from '../../types';
import { SignatureOrb } from '../orb/SignatureOrb';
import {
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Database,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Package,
  Truck,
  Sparkles,
  MapPin
} from 'lucide-react';

interface DashboardProps {
  onOpenConsole: () => void;
  onOpenWorkspace: (investigation: Investigation) => void;
  investigations: Investigation[];
  dataSources: DataSourceStatus[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenConsole,
  onOpenWorkspace,
  investigations,
  dataSources
}) => {
  const activeInvestigation = investigations[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-left">
      {/* Top Banner: Hero Investigation Entry Point with Orb */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-signal-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-signal-magenta/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-xs font-mono text-signal-cyan mb-3">
              <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
              <span>SIGNALTRACE AI ORCHESTRATOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Autonomous Business Investigation & Resolution
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              Connect multi-source ERP, inventory, and supplier logs. Formulate competing hypotheses, verify facts from inferences, and execute approved mitigations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenConsole}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-signal-cyan to-signal-blue text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-cyan-glow hover:opacity-95 transition-all"
              >
                <span>Launch New Investigation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {activeInvestigation && (
                <button
                  type="button"
                  onClick={() => onOpenWorkspace(activeInvestigation)}
                  className="px-4 py-2.5 rounded-xl glass-panel hover:bg-surface-light border border-surface-border text-xs sm:text-sm text-slate-200 font-medium transition-colors flex items-center gap-2"
                >
                  <span>Resume Active Incident</span>
                  <ChevronRight className="w-4 h-4 text-signal-cyan" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Signature Orb */}
          <div className="flex flex-col items-center">
            <SignatureOrb size="md" onActivate={onOpenConsole} />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Derives from verified demo dataset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales Drop */}
        <div className="p-4 rounded-2xl glass-panel border border-surface-border relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Audio Category Revenue
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400">
              DEMO SEED
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">$518.5K</span>
            <span className="text-xs font-semibold text-rose-400 font-mono flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -32.4% WoW
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Shortfall of $248,500 vs 6-week baseline
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500/40" />
        </div>

        {/* Card 2: Stockouts */}
        <div className="p-4 rounded-2xl glass-panel border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Critical Stockouts
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400">
              WMS FEED
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-signal-cyan font-mono">2 SKUs</span>
            <span className="text-xs font-semibold text-rose-400 font-mono">0 Available</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            SKU-409 (Headphones) & SKU-412 (Soundbar)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-cyan/40" />
        </div>

        {/* Card 3: Supplier Delay */}
        <div className="p-4 rounded-2xl glass-panel border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Supplier Lead-Time
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400">
              EDI 856
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">+9 Days</span>
            <span className="text-xs font-semibold text-amber-300 font-mono">Port Hold</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Shenzhen Acoustics PO-88321 (4,500 units)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400/40" />
        </div>

        {/* Card 4: Action Approval Gate */}
        <div className="p-4 rounded-2xl glass-panel border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Action Gate Status
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400">
              HUMAN SIGN-OFF
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-signal-magenta font-mono">2 Pending</span>
            <span className="text-xs font-semibold text-signal-magenta font-mono">Awaiting Review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cross-dock authorization & buffer update
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-magenta/40" />
        </div>
      </div>

      {/* Main Grid: Active Incident on Left, Supporting Panels on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Incidents & Investigations (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-cyan animate-pulse" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Active & Recent Investigations
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {investigations.length} Tracked
            </span>
          </div>

          <div className="space-y-3">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onOpenWorkspace(inv)}
                className="p-5 rounded-2xl glass-panel-subtle hover:glass-panel-active border border-surface-border hover:border-signal-cyan/50 cursor-pointer transition-all group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        inv.severity === 'critical'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {inv.severity} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-signal-cyan">{inv.id}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {inv.updatedAt}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-signal-cyan transition-colors mb-1.5">
                  {inv.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {inv.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-surface-border text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-surface-dark font-mono text-[11px]">
                      {inv.businessArea}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      Root cause proven
                    </span>
                  </div>

                  <span className="text-signal-cyan group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs font-medium">
                    Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Grounded Visual Support Panels (1 Col) */}
        <div className="space-y-6">
          {/* Upper-Right Card: Category Revenue Trend (Grounded in W40-W42 figures) */}
          <div className="p-5 glass-panel rounded-2xl border border-surface-border">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Audio Revenue Trend
                </h3>
                <p className="text-[11px] text-slate-400">Oct 2026 Weekly GMV</p>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400">
                POSTGRES SALES DB
              </span>
            </div>

            {/* Sparkline / Bar comparison */}
            <div className="space-y-2 py-2">
              {[
                { week: 'Week 40 (Baseline)', amount: '$752,000', height: '80%', color: 'bg-signal-blue' },
                { week: 'Week 41 (Pre-Stockout)', amount: '$767,000', height: '82%', color: 'bg-signal-blue' },
                { week: 'Week 42 (Incident)', amount: '$518,500', height: '52%', color: 'bg-rose-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300">{item.week}</span>
                    <span className="text-white font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-dark overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: item.height }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-slate-400 flex items-center justify-between">
              <span>Impact concentration:</span>
              <span className="text-signal-magenta font-mono font-medium">
                84% from SKU-409 & 412
              </span>
            </div>
          </div>

          {/* Lower-Right Card: Inbound Logistics Incident Status (Port of Long Beach) */}
          <div className="p-5 glass-panel rounded-2xl border border-surface-border">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Port Logistics Node
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                EDI EXCEPTION
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surface-dark border border-surface-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-200 font-semibold">PO-88321 Shenzhen Acoustics</span>
                  <span className="text-rose-400 font-mono text-[11px]">+9 Days Delay</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Vessel: Evergreen Star • Location: Port of Long Beach Terminal B
                </p>
                <div className="mt-2 pt-2 border-t border-surface-border/60 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Customs Status: Released Oct 19</span>
                  <span className="text-signal-cyan">Cross-Dock Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsor Integrations Status Preview */}
          <div className="p-4 rounded-2xl glass-panel-subtle border border-surface-border text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">
              Sponsor Integration Status (PRD Phase 1):
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Zetaris Data Layer:</span>
                <span className="text-signal-cyan font-mono">Demo Seeded</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Meterless Context/H-MEM:</span>
                <span className="text-signal-magenta font-mono">Phase 3 Pending</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">NVIDIA Nemotron:</span>
                <span className="text-signal-blue font-mono">Phase 3 Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
