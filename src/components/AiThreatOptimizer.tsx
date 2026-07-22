import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, AlertTriangle, CheckCircle2, Zap, Radio, Sliders, RefreshCw, Cpu, Activity } from 'lucide-react';
import { CitizenState } from '../types';

interface AiThreatOptimizerProps {
  citizenState: CitizenState;
  onChange: (newState: CitizenState) => void;
  addLog?: (log: any) => void;
}

interface ThreatAnalysisResult {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilityScore: number;
  recommendedShieldPower: number;
  recommendedPrivacyLevel: 'strict_blur' | 'pixelate' | 'emoji' | 'magic_removal' | 'black_bar';
  recommendedRangeMeters: number;
  tacticalSummary: string;
  keyThreats: string[];
  suggestedCountermeasures: string[];
}

export const AiThreatOptimizer: React.FC<AiThreatOptimizerProps> = ({ citizenState, onChange, addLog }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreatAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runThreatAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/threat-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfEnvironment: {
            bleBeaconsDetected: citizenState.registeredEntities.length + 3,
            wifiNetworksScanned: 12,
            activeShielding: citizenState.isBroadcasting
          },
          detectedDevices: [
            { type: 'Smart Camera (4K)', distanceMeters: 4.2 },
            { type: 'Parabolic Mic Array', distanceMeters: 8.5 },
            { type: 'Platform BLE Crawler', distanceMeters: 2.1 }
          ],
          noiseLevel: 58,
          currentShieldPower: citizenState.rangeMeters * 2
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: ThreatAnalysisResult = await res.json();
      setResult(data);

      if (addLog) {
        addLog({
          deviceModel: 'GEMINI_AI_THREAT_CORE',
          action: 'censored',
          shieldApplied: `AI_ANALYSIS_${data.threatLevel}`,
          distance: 0,
          rotatedId: `VULN_SCORE_${data.vulnerabilityScore}`
        });
      }
    } catch (err: any) {
      console.error('AI Threat Analysis error:', err);
      setError(err.message || 'AI threat assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyCountermeasures = () => {
    if (!result) return;
    const updated = {
      ...citizenState,
      isBroadcasting: true,
      privacyLevel: result.recommendedPrivacyLevel,
      rangeMeters: result.recommendedRangeMeters,
      emergencyPrivacyActive: result.threatLevel === 'CRITICAL'
    };
    onChange(updated);
    try {
      localStorage.setItem('blurbubble_citizen_state', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (addLog) {
      addLog({
        deviceModel: 'GEMINI_AUTO_OPTIMIZER',
        action: 'censored',
        shieldApplied: `APPLIED_${result.recommendedPrivacyLevel.toUpperCase()}`,
        distance: result.recommendedRangeMeters,
        rotatedId: 'COUNTERMEASURES_ENGAGED'
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.1)] relative overflow-hidden my-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono text-white tracking-wider flex items-center gap-2">
              Gemini 3.6 Real-Time Threat Analysis & Shield Optimizer
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                AI CORE Active
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Evaluates RF density, optical exposure & acoustic noise to compute vulnerability index
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runThreatAnalysis}
          disabled={loading}
          className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              Analyzing Environment...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-emerald-400" />
              Run AI Threat Scan
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Threat Level</span>
              <span className={`text-sm font-extrabold font-mono uppercase px-2 py-0.5 rounded inline-block ${
                result.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                result.threatLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {result.threatLevel}
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Vulnerability Index</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono text-cyan-400">{result.vulnerabilityScore}/100</span>
                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.vulnerabilityScore > 70 ? 'bg-rose-500' :
                      result.vulnerabilityScore > 40 ? 'bg-amber-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${result.vulnerabilityScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Recommended Filter</span>
              <span className="text-xs font-bold font-mono text-emerald-300 uppercase block truncate">
                {result.recommendedPrivacyLevel.replace('_', ' ')} ({result.recommendedRangeMeters}m)
              </span>
            </div>
          </div>

          {/* Tactical Summary */}
          <div className="p-3 bg-slate-950/80 border border-emerald-500/20 rounded-xl">
            <span className="text-[10px] font-extrabold font-mono text-emerald-400 uppercase block mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Tactical AI Assessment
            </span>
            <p className="text-xs font-sans text-slate-200 leading-relaxed">{result.tacticalSummary}</p>
          </div>

          {/* Detected Threat List & Countermeasures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-[10px] text-rose-400 font-extrabold uppercase block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Detected Threat Vectors
              </span>
              <ul className="space-y-1 text-slate-300 pl-1">
                {result.keyThreats.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-rose-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Steps
              </span>
              <ul className="space-y-1 text-slate-300 pl-1">
                {result.suggestedCountermeasures.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-emerald-400">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={applyCountermeasures}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current animate-bounce" />
            Auto-Apply AI Shield Countermeasures ({result.recommendedPrivacyLevel.toUpperCase()}, {result.recommendedRangeMeters}m)
          </button>
        </motion.div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <p className="text-xs font-mono text-slate-400 mb-2">
            Click "Run AI Threat Scan" to analyze ambient smart camera & RF signals with Gemini 3.6
          </p>
        </div>
      )}
    </div>
  );
};
