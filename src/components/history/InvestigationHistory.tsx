import React, { useState } from 'react';
import { Investigation } from '../../types';
import {
  Clock,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InvestigationHistoryProps {
  investigations: Investigation[];
  onReopenInvestigation: (investigation: Investigation) => void;
}

export const InvestigationHistory: React.FC<InvestigationHistoryProps> = ({
  investigations,
  onReopenInvestigation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = investigations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.businessArea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || inv.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-left">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Investigation History & Prior Context
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Audit log of completed and in-flight investigations. Reopen any investigation to review the causal evidence graph and verification outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-3 py-1.5 rounded-xl bg-surface-dark border border-surface-border">
              {investigations.length} Archived Incidents
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-border">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical records by title, product category, or summary..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-dark border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-cyan"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-mono uppercase transition-colors ${
                  severityFilter === sev
                    ? 'bg-signal-cyan/20 text-signal-cyan border border-signal-cyan/40 font-semibold'
                    : 'bg-surface-light text-slate-400 border border-surface-border hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Items Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl border border-surface-border text-slate-400 text-xs">
            No historical investigations found matching the search criteria.
          </div>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-2xl glass-panel border border-surface-border hover:border-signal-cyan/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      inv.severity === 'critical'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                        : inv.severity === 'high'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                        : 'bg-blue-950/80 text-signal-cyan border border-blue-700'
                    }`}
                  >
                    {inv.severity}
                  </span>
                  <span className="text-xs font-mono text-signal-cyan">{inv.id}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{inv.businessArea}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {inv.targetTimeWindow}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white">{inv.title}</h3>
                <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
                  {inv.summary}
                </p>

                {inv.actions && inv.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Approved Mitigations:</span>
                    {inv.actions.map((act) => (
                      <span
                        key={act.id}
                        className="px-2 py-0.5 rounded bg-surface-dark border border-surface-border text-[11px] text-emerald-400"
                      >
                        ✓ {act.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-surface-border">
                <button
                  type="button"
                  onClick={() => onReopenInvestigation(inv)}
                  className="px-4 py-2 rounded-xl bg-signal-cyan/15 hover:bg-signal-cyan/25 border border-signal-cyan/40 text-xs font-semibold text-signal-cyan transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Inspect & Reopen</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
