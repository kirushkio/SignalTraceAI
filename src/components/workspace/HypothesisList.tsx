import React, { useState } from 'react';
import { Hypothesis, EvidenceItem } from '../../types';
import {
  CheckCircle,
  HelpCircle,
  XCircle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Ban,
  ArrowRight
} from 'lucide-react';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
  evidenceList: EvidenceItem[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const HypothesisList: React.FC<HypothesisListProps> = ({
  hypotheses,
  evidenceList,
  onSelectEvidence
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(hypotheses[0]?.id || null);

  const getPlausibilityBadge = (plausibility: Hypothesis['plausibility']) => {
    switch (plausibility) {
      case 'High Plausibility':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-signal-magenta/15 text-signal-magenta border border-signal-magenta/40">
            <CheckCircle className="w-3 h-3" /> Most Likely Cause
          </span>
        );
      case 'Supported Inference':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/40">
            <CheckCircle className="w-3 h-3" /> Supported Inference
          </span>
        );
      case 'Unlikely / Contradicted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800">
            <Ban className="w-3 h-3" /> Contradicted by Data
          </span>
        );
      case 'Ruled Out':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-light text-slate-400 border border-surface-border">
            <XCircle className="w-3 h-3" /> Ruled Out
          </span>
        );
    }
  };

  return (
    <div className="p-5 glass-panel rounded-2xl border border-surface-border text-left">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-magenta animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Competing Hypotheses Evaluation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares competing root causes against multi-source evidence rather than guessing.
          </p>
        </div>
        <span className="text-[11px] font-mono text-signal-cyan">
          {hypotheses.length} Hypotheses Tested
        </span>
      </div>

      <div className="space-y-3">
        {hypotheses.map((hyp) => {
          const isExpanded = expandedId === hyp.id;
          const supportingEvidence = evidenceList.filter((e) =>
            hyp.supportingEvidenceIds.includes(e.id)
          );
          const contradictingEvidence = evidenceList.filter((e) =>
            hyp.contradictingEvidenceIds.includes(e.id)
          );

          return (
            <div
              key={hyp.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                hyp.isPrimaryCause
                  ? 'bg-surface-card border-signal-magenta/40 shadow-magenta-glow/20'
                  : 'bg-surface-dark/70 border-surface-border hover:border-slate-600'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : hyp.id)}
                className="w-full p-4 flex items-start justify-between gap-3 text-left"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-light text-slate-300">
                      {hyp.category}
                    </span>
                    {getPlausibilityBadge(hyp.plausibility)}
                  </div>
                  <h4 className="text-sm font-semibold text-white">{hyp.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{hyp.summary}</p>
                </div>
                <div className="text-slate-400 pt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Hypothesis Details & Evidence Links */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-surface-border/70 space-y-3 bg-surface-dark/40 text-xs">
                  {/* Supporting Evidence Links */}
                  {supportingEvidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1.5">
                        <FileCheck className="w-3.5 h-3.5" /> Supporting Evidence ({supportingEvidence.length}):
                      </span>
                      <div className="space-y-1.5">
                        {supportingEvidence.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => onSelectEvidence?.(ev.id)}
                            className="p-2 rounded-lg bg-surface-light/80 hover:bg-surface-light border border-surface-border hover:border-signal-cyan/40 flex items-center justify-between cursor-pointer group"
                          >
                            <span className="text-slate-200 font-medium group-hover:text-signal-cyan">
                              {ev.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {ev.sourceName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contradicting Evidence Links */}
                  {contradictingEvidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mb-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" /> Contradicting Evidence ({contradictingEvidence.length}):
                      </span>
                      <div className="space-y-1.5">
                        {contradictingEvidence.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => onSelectEvidence?.(ev.id)}
                            className="p-2 rounded-lg bg-surface-light/80 hover:bg-surface-light border border-surface-border hover:border-rose-500/40 flex items-center justify-between cursor-pointer group"
                          >
                            <span className="text-slate-200 font-medium group-hover:text-rose-300">
                              {ev.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {ev.sourceName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unresolved Questions */}
                  {hyp.unresolvedQuestions.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-surface-dark border border-surface-border">
                      <span className="text-[10px] uppercase font-mono text-amber-300 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3 h-3" /> Unresolved Questions for Complete Confidence:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {hyp.unresolvedQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
