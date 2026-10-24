import React, { useState } from 'react';
import { EvidenceItem } from '../../types';
import {
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface EvidencePanelProps {
  evidenceList: EvidenceItem[];
  highlightedEvidenceId?: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidenceList,
  highlightedEvidenceId
}) => {
  const [filter, setFilter] = useState<'all' | 'fact' | 'inference'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = evidenceList.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-5 glass-panel rounded-2xl border border-surface-border text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Grounding Evidence & Provenance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every conclusion links to verifiable source records, SQL views, or computed metrics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-surface-light p-0.5 border border-surface-border text-xs">
            {(['all', 'fact', 'inference'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                  filter === cat
                    ? 'bg-signal-cyan/20 text-signal-cyan font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Records' : cat === 'fact' ? 'Observed Facts' : 'Inferences'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter evidence by keyword, SKU, or data source..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-dark border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-cyan"
        />
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No evidence records matched your search filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isHighlighted = highlightedEvidenceId === item.id;

            return (
              <div
                key={item.id}
                id={`evidence-${item.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isHighlighted
                    ? 'bg-surface-card border-signal-cyan ring-1 ring-signal-cyan'
                    : 'bg-surface-dark/70 border-surface-border hover:border-surface-border/90'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        item.category === 'fact'
                          ? 'bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/30'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {item.category === 'fact' ? 'Observed Fact' : 'Structured Inference'}
                    </span>
                    {item.isDemoSeed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-light text-slate-400 border border-surface-border">
                        DEMO SEED
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.description}</p>

                {/* Key Metrics Grid */}
                {item.metrics && item.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {item.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-surface-dark border border-surface-border"
                      >
                        <span className="text-[10px] font-mono text-slate-400 block">{m.label}</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-white font-mono">
                            {m.value}
                          </span>
                          {m.delta && (
                            <span className="text-[10px] font-mono text-signal-magenta">
                              {m.delta}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grounding Provenance Footer */}
                <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-signal-cyan shrink-0" />
                    <span className="truncate">
                      <strong>Source:</strong> {item.sourceName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-signal-blue font-mono text-[10px] truncate max-w-xs">
                    <span>{item.sourceUri}</span>
                  </div>
                </div>

                {/* Confidence Basis */}
                {item.confidenceBasis && (
                  <div className="mt-2 text-[11px] text-slate-400 italic bg-surface-light/50 p-2 rounded-md">
                    <strong>Confidence Basis:</strong> {item.confidenceBasis}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
