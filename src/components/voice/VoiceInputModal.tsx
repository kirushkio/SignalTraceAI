import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, RefreshCw, Check, X, Volume2, ShieldAlert } from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTranscription: (text: string) => void;
}

type VoiceState =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'reviewing'
  | 'permission_denied'
  | 'unsupported'
  | 'error';

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSubmitTranscription
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcription, setTranscription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Reference to native SpeechRecognition instance
  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Check browser speech recognition support
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize and start listening
  const startListening = () => {
    if (!isSpeechSupported) {
      setVoiceState('unsupported');
      setErrorMessage(
        'The Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari, or enter your query via keyboard.'
      );
      return;
    }

    try {
      setVoiceState('requesting');
      setErrorMessage('');
      setTranscription('');
      setInterimText('');

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
        // Visualizer audio simulator loop
        audioIntervalRef.current = setInterval(() => {
          setAudioLevel(Math.floor(Math.random() * 80) + 20);
        }, 120);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscription((prev) => (prev ? `${prev} ${final}` : final));
          setInterimText('');
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('permission_denied');
          setErrorMessage(
            'Microphone access was denied. Please click the camera/mic icon in your browser URL bar to grant permission, then try again.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceState('reviewing');
        } else {
          setVoiceState('error');
          setErrorMessage(`Speech recognition error: ${event.error || 'Failed to capture audio'}`);
        }
      };

      recognition.onend = () => {
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        setAudioLevel(0);
        setVoiceState((current) => (current === 'listening' ? 'reviewing' : current));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceState('error');
      setErrorMessage(err.message || 'Unable to access microphone device');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setAudioLevel(0);
    setVoiceState('reviewing');
  };

  const handleUseSample = (sample: string) => {
    setTranscription(sample);
    setVoiceState('reviewing');
  };

  const handleConfirmSubmit = () => {
    const finalQuery = (transcription + ' ' + interimText).trim();
    if (!finalQuery) return;
    onSubmitTranscription(finalQuery);
    handleClose();
  };

  const handleClose = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setVoiceState('idle');
    setTranscription('');
    setInterimText('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setVoiceState('idle');
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-surface-border shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-signal-cyan via-signal-blue to-signal-magenta" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              voiceState === 'listening' ? 'bg-signal-cyan/20 text-signal-cyan animate-pulse' : 'bg-surface-light text-slate-300'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 id="voice-modal-title" className="text-base font-semibold text-white">
                Voice Investigation Input
              </h3>
              <p className="text-xs text-slate-400">
                Dictate your operational incident or root-cause question
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close voice modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Voice States */}
        <div className="py-6 flex flex-col items-center text-center">
          {/* STATE: Requesting Permission */}
          {voiceState === 'requesting' && (
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-signal-blue/20 text-signal-cyan flex items-center justify-center mb-3 animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-slate-200">Requesting microphone access...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Please allow audio permissions in the browser prompt to begin speaking.
              </p>
            </div>
          )}

          {/* STATE: Listening */}
          {voiceState === 'listening' && (
            <div className="flex flex-col items-center w-full py-2">
              {/* Luminous Pulsing Mic Ring */}
              <div className="relative mb-6">
                <div
                  className="w-24 h-24 rounded-full bg-signal-cyan/15 flex items-center justify-center border-2 border-signal-cyan/80 transition-all duration-150"
                  style={{
                    boxShadow: `0 0 ${audioLevel / 2 + 10}px rgba(57, 207, 255, 0.6)`
                  }}
                >
                  <Mic className="w-10 h-10 text-signal-cyan animate-pulse" />
                </div>
                {/* Audio Waves Simulation */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                  {[20, 45, 80, 60, 95, 40, 70, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-signal-cyan rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(6, (h * audioLevel) / 100)}px`,
                        opacity: audioLevel > 15 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-sm font-medium text-signal-cyan flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal-cyan animate-ping" />
                Listening... Speak your question now
              </div>

              {/* Live transcript preview */}
              <div className="w-full mt-4 p-3.5 rounded-xl bg-surface-dark border border-surface-border text-left min-h-[70px]">
                <p className="text-xs font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-signal-cyan" /> Live Transcription:
                </p>
                <p className="text-sm text-slate-100 italic">
                  {transcription || interimText || 'Listening for speech audio...'}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-2 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-200 transition-colors flex items-center gap-2"
                >
                  <MicOff className="w-4 h-4 text-signal-magenta" /> Stop Recording & Review
                </button>
              </div>
            </div>
          )}

          {/* STATE: Reviewing & Editing */}
          {voiceState === 'reviewing' && (
            <div className="w-full text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Review & Edit Transcription Before Submitting:
              </label>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="No transcription captured. You can type your question here or try again..."
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-dark border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-signal-cyan focus:ring-1 focus:ring-signal-cyan transition-colors resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                You can freely revise or expand the transcribed text above before starting the investigation.
              </p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={startListening}
                  className="px-3 py-2 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-record
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 rounded-lg border border-surface-border hover:bg-surface-light text-xs font-medium text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!transcription.trim()}
                    onClick={handleConfirmSubmit}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-signal-cyan to-signal-blue hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-obsidian flex items-center gap-1.5 shadow-cyan-glow transition-all"
                  >
                    <Check className="w-4 h-4" /> Start Investigation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE: Permission Denied */}
          {voiceState === 'permission_denied' && (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-signal-rose/20 text-signal-rose flex items-center justify-center mb-3">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-white">Microphone Access Denied</h4>
              <p className="text-xs text-slate-300 mt-1.5 max-w-sm">{errorMessage}</p>

              <div className="mt-4 p-3 bg-surface-dark rounded-xl border border-surface-border text-left w-full">
                <p className="text-xs font-semibold text-signal-cyan mb-1">
                  How to enable microphone in browser:
                </p>
                <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Click the padlock or site settings icon next to the URL bar</li>
                  <li>Toggle Microphone permission to <strong>Allow</strong></li>
                  <li>Click Retry below or use keyboard input</li>
                </ol>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={startListening}
                  className="px-4 py-2 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUseSample(
                      'Why did our sales drop by 30% this week in the audio hardware category?'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-signal-blue/20 hover:bg-signal-blue/30 text-signal-cyan text-xs font-medium border border-signal-blue/40 transition-colors"
                >
                  Use Demo Voice Sample
                </button>
              </div>
            </div>
          )}

          {/* STATE: Unsupported Browser */}
          {voiceState === 'unsupported' && (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-signal-amber/20 text-signal-amber flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-white">Browser Speech API Unsupported</h4>
              <p className="text-xs text-slate-300 mt-1.5 max-w-sm">{errorMessage}</p>

              <div className="mt-5 w-full">
                <p className="text-xs font-medium text-slate-400 mb-2">
                  Test with a simulated speech transcription query:
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleUseSample(
                      'Why did our sales drop by 30% this week in the audio hardware category?'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl bg-surface-dark hover:bg-surface-light border border-surface-border hover:border-signal-cyan/40 text-xs text-slate-200 transition-colors flex items-center justify-between"
                >
                  <span>&ldquo;Why did our sales drop by 30% this week?&rdquo;</span>
                  <span className="text-[10px] font-mono text-signal-cyan border border-signal-cyan/40 px-1.5 py-0.5 rounded">
                    Demo Transcript
                  </span>
                </button>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-200 transition-colors"
                >
                  Back to Typed Input
                </button>
              </div>
            </div>
          )}

          {/* STATE: General Error */}
          {voiceState === 'error' && (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-signal-rose/20 text-signal-rose flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-white">Audio Capture Error</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">{errorMessage}</p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={startListening}
                  className="px-4 py-2 rounded-lg bg-surface-light hover:bg-surface-border text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUseSample(
                      'Why did our sales drop by 30% this week in the audio hardware category?'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-signal-blue/20 hover:bg-signal-blue/30 text-signal-cyan text-xs font-medium border border-signal-blue/40 transition-colors"
                >
                  Use Sample Query
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
