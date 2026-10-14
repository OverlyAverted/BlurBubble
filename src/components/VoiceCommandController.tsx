import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  ShieldAlert, 
  VolumeX, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Radio, 
  Terminal, 
  X,
  Play
} from 'lucide-react';
import { DetectionLog } from '../types';

export interface VoiceCommandControllerProps {
  isOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
  onTriggerEmergency: () => void;
  onSilenceAlerts: () => void;
  alertsMuted: boolean;
  emergencyActive: boolean;
  onAddLog?: (log: Omit<DetectionLog, 'id' | 'timestamp'>) => void;
}

interface CommandLogEntry {
  id: string;
  command: string;
  matchedAction: string;
  timestamp: string;
  type: 'emergency' | 'silence' | 'unrecognized';
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({
  isOpen,
  onOpen,
  onClose,
  onTriggerEmergency,
  onSilenceAlerts,
  alertsMuted,
  emergencyActive,
  onAddLog
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastDetectedCommand, setLastDetectedCommand] = useState<{
    text: string;
    action: 'emergency' | 'silence';
    timestamp: string;
  } | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandLogEntry[]>([]);
  const [simulatedInput, setSimulatedInput] = useState('');

  // Refs for speech recognition instance & debounce
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const lastExecutedTimeRef = useRef<number>(0);

  // Check browser support for Web Speech API
  useEffect(() => {
    const hasSpeech = typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setSpeechSupported(!!hasSpeech);
  }, []);

  // Update isListeningRef when state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Execute recognized voice command with debounce
  const executeCommand = useCallback((phrase: string, source: 'voice' | 'simulation' = 'voice') => {
    const cleanPhrase = phrase.toLowerCase().trim();
    const now = Date.now();

    // Prevent duplicated triggers within 2000ms
    if (now - lastExecutedTimeRef.current < 2000) {
      return false;
    }

    const timeStr = new Date().toTimeString().split(' ')[0];

    // Pattern 1: Emergency Mode Trigger ('BlurBubble emergency')
    const isEmergency = 
      cleanPhrase.includes('blurbubble emergency') ||
      cleanPhrase.includes('blur bubble emergency') ||
      /(?:blur\s*bubble|blurbubble)\s*(?:,|:|-)?\s*(?:emergency|lockdown)/i.test(cleanPhrase);

    // Pattern 2: Silence Alerts Trigger ('BlurBubble silence')
    const isSilence = 
      cleanPhrase.includes('blurbubble silence') ||
      cleanPhrase.includes('blur bubble silence') ||
      cleanPhrase.includes('blurbubble silent') ||
      cleanPhrase.includes('blur bubble silent') ||
      /(?:blur\s*bubble|blurbubble)\s*(?:,|:|-)?\s*(?:silence|silent|mute)/i.test(cleanPhrase);

    if (isEmergency) {
      lastExecutedTimeRef.current = now;
      setLastDetectedCommand({
        text: phrase,
        action: 'emergency',
        timestamp: timeStr
      });

      setCommandHistory(prev => [
        {
          id: 'cmd-' + now,
          command: phrase,
          matchedAction: '🚨 EMERGENCY MODE ACTIVATED',
          timestamp: timeStr,
          type: 'emergency' as const
        },
        ...prev
      ].slice(0, 8));

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([250, 100, 250, 100, 400]);
      }

      if (onAddLog) {
        onAddLog({
          deviceModel: `VOICE_RECOGNITION_${source.toUpperCase()}`,
          action: 'erased',
          shieldApplied: 'HARD OPT-OUT (MAX EMERGENCY SHIELD)',
          distance: 0,
          rotatedId: 'VOICE_CMD_EMERGENCY'
        });
      }

      onTriggerEmergency();
      return true;
    }

    if (isSilence) {
      lastExecutedTimeRef.current = now;
      setLastDetectedCommand({
        text: phrase,
        action: 'silence',
        timestamp: timeStr
      });

      setCommandHistory(prev => [
        {
          id: 'cmd-' + now,
          command: phrase,
          matchedAction: '🔇 AUDIO ALERTS SILENCED',
          timestamp: timeStr,
          type: 'silence' as const
        },
        ...prev
      ].slice(0, 8));

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      if (onAddLog) {
        onAddLog({
          deviceModel: `VOICE_RECOGNITION_${source.toUpperCase()}`,
          action: 'erased',
          shieldApplied: 'AUDIO_ALERTS_SILENCED_MUTED',
          distance: 0,
          rotatedId: 'VOICE_CMD_SILENCE'
        });
      }

      onSilenceAlerts();
      return true;
    }

    return false;
  }, [onTriggerEmergency, onSilenceAlerts, onAddLog]);

  // Setup Web Speech API Recognition
  const startListening = useCallback(() => {
    setErrorMessage(null);

    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setSpeechSupported(false);
      setErrorMessage('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      // Abort previous instance if any
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i][0];
          currentTranscript += item.transcript;
          
          // Check for matching commands immediately on each result
          const handled = executeCommand(item.transcript, 'voice');
          if (handled) {
            // Flash transcript
            setTranscript(`✓ ${item.transcript}`);
          }
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        // Benign errors: 'no-speech' happens when user pauses talking
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access denied. Please enable microphone permissions in your browser.');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

        console.warn('Speech recognition warning:', event.error);
        if (event.error !== 'aborted') {
          setErrorMessage(`Speech status: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Automatically restart if listening was intentional
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err: any) {
      console.error('Failed starting Web Speech recognition:', err);
      setErrorMessage(err?.message || 'Could not start speech recognition.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [executeCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Quick simulation trigger for testing
  const handleSimulate = (phrase: string) => {
    setTranscript(`[Simulated] "${phrase}"`);
    executeCommand(phrase, 'simulation');
  };

  if (!isOpen) {
    if (!isListening) return null;

    return (
      <motion.div
        id="voice-command-floating-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/95 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] backdrop-blur-md font-mono text-xs text-slate-200 cursor-pointer"
      >
        <div className="flex items-center gap-2" onClick={() => onOpen?.()}>
          <div className="relative">
            <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[11px] font-bold text-white tracking-wide">MIC ACTIVE:</span>
          <span className="text-[10px] text-emerald-300 truncate max-w-[180px]">
            {transcript || 'Say "BlurBubble emergency" / "BlurBubble silence"'}
          </span>
        </div>

        <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stopListening();
            }}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Stop listening"
          >
            <MicOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div 
        id="voice-command-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="voice-command-panel"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-950/98 border border-slate-800/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.12)] p-5 text-slate-200 flex flex-col gap-4 font-sans max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                isListening 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}>
                {isListening ? (
                  <Mic className="w-5 h-5 animate-pulse text-emerald-400" />
                ) : (
                  <MicOff className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-white font-mono">
                    Voice Command Engine
                  </h2>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold">
                    Web Speech API
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hands-free tactical shield control via speech recognition
                </p>
              </div>
            </div>

            <button
              id="btn-close-voice-command-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Close Voice Command Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Microphone Status & Listening Visualizer */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-850 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Speech Recognition:
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-800 text-slate-400 border border-slate-750'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {isListening ? 'LISTENING ACTIVE' : 'STANDBY (OFF)'}
                </span>
              </div>

              {/* Start / Stop Toggle Button */}
              <button
                id="btn-voice-toggle-listening"
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Start Listening</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Waveform Animation when listening */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-950/80 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] font-mono text-emerald-400 mr-2">MIC INPUT:</span>
                {[40, 75, 90, 50, 85, 100, 60, 45, 90, 70, 30].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['4px', `${Math.max(6, h * 0.22)}px`, '4px'] }}
                    transition={{
                      duration: 0.6 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.05
                    }}
                    className="w-1 bg-emerald-400/80 rounded-full"
                  />
                ))}
                <span className="text-[9px] font-mono text-slate-400 ml-2 animate-pulse">
                  Listening for voice triggers...
                </span>
              </div>
            )}

            {/* Live Transcript Display Box */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase">
                <span>Live Speech Transcript</span>
                {transcript && (
                  <button 
                    type="button"
                    onClick={() => setTranscript('')} 
                    className="hover:text-slate-300 text-[8px] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className={`min-h-[1.5rem] break-words ${transcript ? 'text-emerald-300 font-semibold' : 'text-slate-600 italic text-[11px]'}`}>
                {transcript || (isListening ? 'Speak now into microphone...' : 'Press "Start Listening" or use test buttons below')}
              </p>
            </div>

            {/* Error message banner if any */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Supported Core Voice Commands Cards */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Supported Voice Triggers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Command 1: BlurBubble Emergency */}
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                emergencyActive 
                  ? 'bg-rose-950/25 border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      EMERGENCY TRIGGER
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">
                      {emergencyActive ? 'ACTIVE NOW' : 'READY'}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white">
                    Say: <span className="text-rose-400">&ldquo;BlurBubble emergency&rdquo;</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Instantly engages maximum lockdown, broadcasts peak RF power, and blocks all nearby camera devices.
                  </p>
                </div>

                <button
                  id="btn-voice-test-emergency"
                  type="button"
                  onClick={() => handleSimulate('BlurBubble emergency')}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 text-rose-400" />
                  Simulate &ldquo;BlurBubble emergency&rdquo;
                </button>
              </div>

              {/* Command 2: BlurBubble Silence */}
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                alertsMuted 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                      <VolumeX className="w-3 h-3 text-cyan-400" />
                      SILENCE TRIGGER
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">
                      {alertsMuted ? 'MUTED' : 'UNMUTED'}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white">
                    Say: <span className="text-cyan-400">&ldquo;BlurBubble silence&rdquo;</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Silences active warning alarms, stops vibration, mutes future alerts, and cancels ongoing voice speech.
                  </p>
                </div>

                <button
                  id="btn-voice-test-silence"
                  type="button"
                  onClick={() => handleSimulate('BlurBubble silence')}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  Simulate &ldquo;BlurBubble silence&rdquo;
                </button>
              </div>
            </div>
          </div>

          {/* Quick Custom Simulation Input */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Manual Test Input:
            </span>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (simulatedInput.trim()) {
                  handleSimulate(simulatedInput);
                  setSimulatedInput('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                id="voice-command-test-input"
                type="text"
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value)}
                placeholder="Type command e.g. 'BlurBubble emergency'..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

          {/* Last Executed Command Badge */}
          {lastDetectedCommand && (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Last Executed Voice Command</span>
                  <span className="text-white font-bold">&ldquo;{lastDetectedCommand.text}&rdquo;</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                {lastDetectedCommand.action.toUpperCase()}
              </span>
            </div>
          )}

          {/* Execution History */}
          {commandHistory.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Recent Voice Audit Log
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {commandHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-900 font-mono text-[10px]"
                  >
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-500">[{item.timestamp}]</span>
                      <span className="font-semibold text-white">&ldquo;{item.command}&rdquo;</span>
                    </div>
                    <span className={item.type === 'emergency' ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {item.matchedAction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              Web Speech API SpeechRecognition
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
