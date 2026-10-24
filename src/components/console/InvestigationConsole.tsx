import React, { useState } from 'react';
import { Search, Mic, ArrowRight, Sparkles, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { SignatureOrb } from '../orb/SignatureOrb';
import { VoiceInputModal } from '../voice/VoiceInputModal';
import { STARTER_QUESTIONS } from '../../data/mockData';

interface InvestigationConsoleProps {
  onStartInvestigation: (query: string) => void;
  activeQuery?: string;
  isProcessing?: boolean;
  clarificationData?: {
    prompt: string;
    options: string[];
  } | null;
  onClearClarification?: () => void;
}

export const InvestigationConsole: React.FC<InvestigationConsoleProps> = ({
  onStartInvestigation,
  activeQuery = '',
  isProcessing = false,
  clarificationData,
  onClearClarification
}) => {
  const [query, setQuery] = useState(activeQuery);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isProcessing) return;
    onStartInvestigation(query.trim());
  };

  const handleSelectStarter = (starterText: string) => {
    setQuery(starterText);
    setHasInteracted(true);
    onClearClarification?.();
    onStartInvestigation(starterText);
  };

  const handleVoiceTranscription = (transcription: string) => {
    setQuery(transcription);
    setHasInteracted(true);
    onClearClarification?.();
    onStartInvestigation(transcription);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center px-4 py-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-signal-blue/10 via-signal-cyan/15 to-signal-magenta/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Signature Central Orb */}
      <div className="mb-6 relative z-10">
        <SignatureOrb
          size="lg"
          isInvestigating={isProcessing}
          onActivate={() => setHasInteracted(true)}
        />
      </div>

      {/* Hero Title & Subtitle */}
      <div className="relative z-10 max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-xs font-mono text-slate-300 mb-3">
          <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
          <span>AUTONOMOUS BUSINESS INVESTIGATION AGENT</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          What would you like to investigate?
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          State your operational anomaly, sales discrepancy, or supply disruption. SignalTrace connects evidence, tests competing hypotheses, and proves root causes.
        </p>
      </div>

      {/* Clarification Needed Notice */}
      {clarificationData && (
        <div className="w-full max-w-2xl mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600 text-left z-20 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Clarification Required Before Investigation Plan</span>
          </div>
          <p className="text-xs text-slate-200 mb-3">{clarificationData.prompt}</p>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400">
              Select one of the identified scopes:
            </span>
            {clarificationData.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectStarter(opt)}
                className="w-full p-2.5 rounded-xl bg-surface-dark hover:bg-surface-light border border-surface-border hover:border-signal-cyan text-xs text-slate-200 text-left transition-colors flex items-center justify-between group"
              >
                <span>{opt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-signal-cyan group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Investigation Input Box */}
      <div className="w-full max-w-2xl relative z-20">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center glass-panel rounded-2xl border border-surface-border/90 p-2 shadow-2xl focus-within:border-signal-cyan focus-within:ring-2 focus-within:ring-signal-cyan/30 transition-all"
        >
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-signal-cyan/70" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setHasInteracted(true)}
            placeholder="e.g. Why did our sales drop by 30% this week in the audio hardware category?"
            disabled={isProcessing}
            className="w-full bg-transparent border-none text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-0 py-2 disabled:opacity-50"
          />

          <div className="flex items-center gap-1.5 pl-2">
            {/* Voice Input Trigger */}
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              aria-label="Dictate investigation using voice"
              title="Dictate with microphone (Web Speech API)"
              className="p-2.5 rounded-xl bg-surface-light/80 hover:bg-surface-border text-slate-300 hover:text-signal-cyan transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-signal-cyan to-signal-blue text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-cyan-glow hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>{isProcessing ? 'Analyzing...' : 'Investigate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Input helper tags */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-signal-cyan" />
            Truthfulness Rule: Grounded in retrieved evidence, not hallucinations.
          </span>
          <span className="hidden sm:inline">Press Enter ↵ to launch</span>
        </div>
      </div>

      {/* Suggested Starter Questions */}
      <div className="w-full max-w-3xl mt-8 relative z-10 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-signal-cyan" />
            <span>Curated Demonstration Scenarios</span>
          </div>
          <span className="text-[11px] font-mono text-signal-magenta">
            Flagship Dataset Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STARTER_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectStarter(item.query)}
              className="p-3.5 rounded-xl glass-panel-subtle hover:glass-panel-active border border-surface-border hover:border-signal-cyan/50 text-left transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-light text-signal-cyan mb-2 inline-block">
                  {item.category}
                </span>
                <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                  &ldquo;{item.query}&rdquo;
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSubmitTranscription={handleVoiceTranscription}
      />
    </div>
  );
};
