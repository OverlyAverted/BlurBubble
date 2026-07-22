import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, Radio, Activity, ShieldAlert, Zap } from 'lucide-react';
import { CitizenState } from '../types';

interface AiAcousticClassifierProps {
  citizenState: CitizenState;
  addLog?: (log: any) => void;
}

interface AudioAnalysisResult {
  voiceFingerprintDetected: boolean;
  biometricCaptureRisk: string;
  suspectedDeviceType: string;
  acousticCountermeasure: string;
  auditNotes: string;
  rfc9402ComplianceStatus: string;
}

export const AiAcousticClassifier: React.FC<AiAcousticClassifierProps> = ({ citizenState, addLog }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jammingActive, setJammingActive] = useState(false);

  const runAcousticAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decibelLevel: 62,
          frequencyPeaks: [440, 1200, 2800, 8500, 18500],
          platformTarget: 'Public Streaming & Platform Audio Harvesters',
          sampleContext: 'Acoustic mic probe telemetry'
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data: AudioAnalysisResult = await res.json();
      setResult(data);

      if (addLog) {
        addLog({
          deviceModel: 'GEMINI_ACOUSTIC_AI',
          action: 'censored',
          shieldApplied: `AUDIO_SCAN_${data.biometricCaptureRisk}`,
          distance: 1.0,
          rotatedId: data.suspectedDeviceType
        });
      }
    } catch (err: any) {
      console.error('Audio analysis error:', err);
      setError(err.message || 'Audio classifier failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUltrasonicJammer = () => {
    setJammingActive(!jammingActive);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
    if (addLog) {
      addLog({
        deviceModel: 'ULTRASONIC_ACOUSTIC_JAMMER',
        action: jammingActive ? 'ignored' : 'censored',
        shieldApplied: jammingActive ? 'ACOUSTIC_JAMMER_OFF' : '18.5KHZ_PHASE_INVERTED',
        distance: 0,
        rotatedId: 'NOISE_MASK_ACTIVE'
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(168,85,247,0.1)] my-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono text-white tracking-wider flex items-center gap-2">
              Gemini 3.6 Acoustic Fingerprint & Voice Crawler Classifier
              <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                AUDIO AI
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Detects parabolic audio harvesters & platform crawler bots indexing voice biometrics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAcousticAnalysis}
          disabled={loading}
          className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400 text-purple-300 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              Analyzing Spectrum...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-400" />
              Run Acoustic AI Scan
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      {result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Voice Capture Risk</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                result.biometricCaptureRisk === 'HIGH' || result.biometricCaptureRisk === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {result.biometricCaptureRisk}
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Suspected Scanner</span>
              <span className="font-bold text-purple-300 truncate block">{result.suspectedDeviceType}</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">RFC-9402 Status</span>
              <span className="font-bold text-cyan-300">{result.rfc9402ComplianceStatus}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-purple-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-bold font-mono text-purple-400 uppercase block">
              Gemini Acoustic Assessment
            </span>
            <p className="text-xs text-slate-300">{result.auditNotes}</p>
          </div>

          <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold font-mono text-white block">
                Ultrasonic Phase-Inversion Jammer
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {result.acousticCountermeasure}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleUltrasonicJammer}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition cursor-pointer ${
                jammingActive
                  ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900 border-slate-800 text-purple-300 hover:bg-slate-800'
              }`}
            >
              {jammingActive ? '⚡ JAMMER ACTIVE' : 'ENABLE JAMMER'}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <p className="text-xs font-mono text-slate-400">
            Click "Run Acoustic AI Scan" to analyze ambient frequencies for voice recording & audio crawlers
          </p>
        </div>
      )}
    </div>
  );
};
