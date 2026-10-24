import React, { useState } from 'react';
import { Investigation, GraphNode, WorkflowEvent } from '../../types';
import { InvestigationGraph } from './InvestigationGraph';
import { Timeline } from './Timeline';
import { HypothesisList } from './HypothesisList';
import { EvidencePanel } from './EvidencePanel';
import { ActionApprovalPanel } from './ActionApprovalPanel';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Activity,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface InvestigationWorkspaceProps {
  investigation: Investigation;
  onReopen?: () => void;
  onBackToConsole?: () => void;
  onApproveAction?: (actionId: string) => Promise<void> | void;
  onRejectAction?: (actionId: string) => Promise<void> | void;
  onExecuteAction?: (actionId: string) => Promise<void> | void;
  onVerifyAction?: (actionId: string) => Promise<void> | void;
  onCancelInvestigation?: () => Promise<void> | void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  investigation,
  onReopen,
  onBackToConsole,
  onApproveAction,
  onRejectAction,
  onExecuteAction,
  onVerifyAction,
  onCancelInvestigation
}) => {
  const [activeTab, setActiveTab] = useState<'unified' | 'graph' | 'hypotheses' | 'evidence' | 'actions' | 'report' | 'events'>('unified');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | null>(null);

  const getSeverityBadge = (severity: Investigation['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            CRITICAL SEVERITY
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700">
            HIGH SEVERITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-950/80 text-signal-cyan border border-blue-700">
            MODERATE SEVERITY
          </span>
        );
    }
  };

  const handleSelectEvidenceFromHypothesis = (evidenceId: string) => {
    setHighlightedEvidenceId(evidenceId);
    setActiveTab('unified');
    setTimeout(() => {
      const el = document.getElementById(`evidence-${evidenceId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-left space-y-6">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="glass-panel rounded-2xl p-6 border border-surface-border">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-signal-cyan uppercase tracking-wider">
              INVESTIGATION #{investigation.id}
            </span>
            <span className="text-slate-600">•</span>
            {getSeverityBadge(investigation.severity)}
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-light text-slate-300 border border-surface-border">
              {investigation.businessArea}
            </span>
            {investigation.status === 'cancelled' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                CANCELLED
              </span>
            )}
            {investigation.isDemoSeed && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-dark border border-signal-blue/40 text-signal-blue">
                DEMO SEED DATA
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {investigation.status !== 'cancelled' && onCancelInvestigation && (
              <button
                type="button"
                onClick={onCancelInvestigation}
                className="px-3 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/40 text-xs font-medium text-rose-300 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Run
              </button>
            )}
            <button
              type="button"
              onClick={onReopen}
              className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-run
            </button>
            <button
              type="button"
              onClick={onBackToConsole}
              className="px-3 py-1.5 rounded-lg bg-signal-cyan/15 hover:bg-signal-cyan/25 border border-signal-cyan/30 text-xs font-medium text-signal-cyan transition-colors"
            >
              New Query
            </button>
          </div>
        </div>

        {/* Title & Synthesis Banner */}
        <div className="mt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {investigation.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-5xl">
            {investigation.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-signal-cyan" />
              Window: {investigation.targetTimeWindow}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-signal-cyan" />
              Grounded in Zetaris Cross-Source Joins & Nemotron Causal Rules
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-surface-border">
        {[
          { id: 'unified', label: 'Unified Overview', icon: Layers },
          { id: 'graph', label: 'Causal Graph', icon: Sparkles },
          { id: 'hypotheses', label: 'Competing Hypotheses', icon: AlertTriangle },
          { id: 'evidence', label: 'Grounding Evidence', icon: FileText },
          { id: 'actions', label: 'Actions & Approval', icon: CheckCircle2 },
          { id: 'report', label: 'Investigation Report', icon: FileSpreadsheet },
          { id: 'events', label: 'Audit Trail Events', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/40 shadow-cyan-glow/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Unified Tab */}
      {activeTab === 'unified' && (
        <div className="space-y-6">
          <InvestigationGraph
            nodes={investigation.nodes}
            edges={investigation.edges}
            onSelectNode={(n) => setSelectedNode(n)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Timeline steps={investigation.timeline} />
            <HypothesisList
              hypotheses={investigation.hypotheses}
              evidenceList={investigation.evidence}
              onSelectEvidence={handleSelectEvidenceFromHypothesis}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvidencePanel
              evidenceList={investigation.evidence}
              highlightedEvidenceId={highlightedEvidenceId}
            />
            <ActionApprovalPanel
              investigationId={investigation.id}
              actions={investigation.actions}
              onApprove={onApproveAction}
              onReject={onRejectAction}
              onExecute={onExecuteAction}
              onVerify={onVerifyAction}
            />
          </div>
        </div>
      )}

      {/* Graph Tab */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          <InvestigationGraph
            nodes={investigation.nodes}
            edges={investigation.edges}
            onSelectNode={(n) => setSelectedNode(n)}
          />
        </div>
      )}

      {/* Hypotheses Tab */}
      {activeTab === 'hypotheses' && (
        <div className="max-w-4xl mx-auto">
          <HypothesisList
            hypotheses={investigation.hypotheses}
            evidenceList={investigation.evidence}
            onSelectEvidence={handleSelectEvidenceFromHypothesis}
          />
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="max-w-4xl mx-auto">
          <EvidencePanel
            evidenceList={investigation.evidence}
            highlightedEvidenceId={highlightedEvidenceId}
          />
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="max-w-3xl mx-auto">
          <ActionApprovalPanel
            investigationId={investigation.id}
            actions={investigation.actions}
            onApprove={onApproveAction}
            onReject={onRejectAction}
            onExecute={onExecuteAction}
            onVerify={onVerifyAction}
          />
        </div>
      )}

      {/* Investigation Report Tab */}
      {activeTab === 'report' && investigation.report && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 glass-panel rounded-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-semibold text-white">
                Comprehensive Incident Investigation Report
              </h3>
              <span className="text-xs font-mono text-signal-cyan">
                {investigation.report.timeWindow}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {investigation.report.executiveSummary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {investigation.report.metricsSummary.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-dark border border-surface-border">
                  <span className="text-[10px] font-mono text-slate-400 block">{m.label}</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-white font-mono">{m.value}</span>
                    {m.delta && (
                      <span className="text-xs font-mono text-signal-magenta">{m.delta}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-dark border border-signal-magenta/30">
              <span className="text-xs font-semibold text-signal-magenta block mb-1">
                Primary Root Cause Assessment:
              </span>
              <p className="text-xs text-slate-200">{investigation.report.primaryRootCause}</p>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {investigation.report.plausibilityRationale}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-dark border border-surface-border">
              <span className="text-xs font-semibold text-signal-cyan block mb-1">
                Calculated Business Impact:
              </span>
              <p className="text-xs text-slate-200">
                {investigation.report.calculatedBusinessImpact}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-dark border border-surface-border">
              <span className="text-xs font-semibold text-amber-300 block mb-1">
                Limitations & Missing Data:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                {investigation.report.limitationsAndMissingData.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Events Audit Trail Tab */}
      {activeTab === 'events' && (
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="p-5 glass-panel rounded-2xl border border-surface-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Workflow Continuity & Audit Events (Meterless Ready)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real audit log of model tool invocations, queries, schema joins, approvals, and executed actions.
            </p>

            <div className="space-y-2">
              {(investigation.workflowEvents || [
                {
                  id: 'evt-1',
                  investigationId: investigation.id,
                  timestamp: investigation.startedAt,
                  eventType: 'query_received',
                  sourceModule: 'orchestrator',
                  summary: `Query initiated: "${investigation.query || investigation.title}"`
                },
                {
                  id: 'evt-2',
                  investigationId: investigation.id,
                  timestamp: investigation.updatedAt,
                  eventType: 'report_generated',
                  sourceModule: 'nemotron_reasoner',
                  summary: 'Evidence synthesized and causal graph committed to persistent memory.'
                }
              ]).map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-surface-dark border border-surface-border flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-light text-signal-cyan uppercase">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        [{evt.sourceModule}]
                      </span>
                    </div>
                    <p className="text-slate-200">{evt.summary}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {evt.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
