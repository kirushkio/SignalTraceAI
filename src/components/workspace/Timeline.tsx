import React from 'react';
import { TimelineStep } from '../../types';
import { CheckCircle2, Clock, PlayCircle, XCircle, Database, Cpu, HardDrive, Shield } from 'lucide-react';

interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  const getToolBadge = (tool?: TimelineStep['sourceTool']) => {
    switch (tool) {
      case 'Zetaris':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/80 text-signal-cyan">
            <Database className="w-3 h-3" /> Zetaris Virtualizer
          </span>
        );
      case 'Nemotron':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80 text-purple-300">
            <Cpu className="w-3 h-3" /> NVIDIA Nemotron
          </span>
        );
      case 'Meterless':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/60 border border-pink-800/80 text-signal-magenta">
            <HardDrive className="w-3 h-3" /> Meterless Continuity
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-light border border-surface-border text-slate-300">
            <Shield className="w-3 h-3" /> Investigation Engine
          </span>
        );
    }
  };

  const getStepIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-signal-cyan" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-signal-magenta animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="relative p-5 glass-panel rounded-2xl border border-surface-border">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Investigation Execution Plan
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {steps.filter((s) => s.status === 'completed').length} / {steps.length} Steps Completed
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-border">
        {steps.map((step) => {
          const isCurrent = step.status === 'in_progress';
          const isDone = step.status === 'completed';

          return (
            <div key={step.id} className="relative group text-left">
              {/* Step indicator node */}
              <div
                className={`absolute -left-[27px] top-0 p-0.5 rounded-full bg-obsidian border ${
                  isCurrent
                    ? 'border-signal-magenta shadow-magenta-glow'
                    : isDone
                    ? 'border-signal-cyan'
                    : 'border-surface-border'
                }`}
              >
                {getStepIcon(step.status)}
              </div>

              {/* Step content card */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-surface-light border-signal-magenta/40 shadow-magenta-glow/30'
                    : isDone
                    ? 'bg-surface-dark/70 border-surface-border'
                    : 'bg-surface-dark/40 border-surface-border/50 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                    {getToolBadge(step.sourceTool)}
                  </div>
                  {step.timestamp && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {step.timestamp}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
