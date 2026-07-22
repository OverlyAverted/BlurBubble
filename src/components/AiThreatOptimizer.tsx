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
  const [autoDeployShield, setAutoDeployShield] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('blurbubble_auto_deploy_shield');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [lockdownTriggered, setLockdownTriggered] = useState(false);

  const toggleAutoDeploy = () => {
    const nextVal = !autoDeployShield;
    setAutoDeployShield(nextVal);
    try {
      localStorage.setItem('blurbubble_auto_deploy_shield', JSON.stringify(nextVal));
    } catch (e) {
      console.error(e);
    }
  };

  const executeLockdown = (analysisData: ThreatAnalysisResult) => {
    setLockdownTriggered(true);
    const lockdownState: CitizenState = {
      ...citizenState,
      isBroadcasting: true,
      privacyLevel: 'strict_blur',
      rangeMeters: 50,
      emergencyPrivacyActive: true,
      disguiseUiActive: true
    };
    onChange(lockdownState);
    try {
      localStorage.setItem('blurbubble_citizen_state', JSON.stringify(lockdownState));
    } catch (e) {
      console.error(e);
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 250]);
    }

    if (addLog) {
      addLog({
        deviceModel: 'GEMINI_AUTO_LOCKDOWN_ENGINE',
        action: 'censored',
        shieldApplied: `TOTAL_LOCKDOWN_AUTO_DEPLOYED_${analysisData.threatLevel}`,
        distance: 50,
        rotatedId: 'EMERGENCY_50M_STRICT_BLUR'
      });
    }
  };

  const runThreatAnalysis = async () => {
    setLoading(true);
    setError(null);
    setLockdownTriggered(false);
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

      // Check for High Threat Spike and Auto-Deploy Lockdown
      const isHighThreat = data.threatLevel === 'HIGH' || data.threatLevel === 'CRITICAL' || data.vulnerabilityScore >= 60;
      if (autoDeployShield && isHighThreat) {
        executeLockdown(data);
      }

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
    <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.08)] relative overflow-hidden my-4 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase font-mono text-white tracking-wider">
                Gemini 3.6 Threat Optimizer
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI CORE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              RF density, optical exposure & acoustic vulnerability analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleAutoDeploy}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              autoDeployShield
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Automatically trigger 50m total lockdown when high threat is detected"
          >
            <Shield className={`w-3.5 h-3.5 ${autoDeployShield ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>AUTO-DEPLOY: {autoDeployShield ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={runThreatAnalysis}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Analyzing...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Run AI Scan
              </>
            )}
          </button>
        </div>
      </div>

      {lockdownTriggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs rounded-xl mb-4 flex items-center gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="font-extrabold uppercase block text-[11px]">🚨 AUTOMATIC LOCKDOWN ENGAGED</span>
            <span className="text-[10px] text-rose-200">
              High-threat scan detected. Gemini 3.6 deployed maximum 50m Strict Blur shield.
            </span>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Top Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between sm:block">
              <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Threat Level</span>
              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded inline-block ${
                result.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                result.threatLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {result.threatLevel}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-slate-400 uppercase">Vulnerability Index</span>
                <span className="text-xs font-bold text-cyan-400">{result.vulnerabilityScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.vulnerabilityScore > 70 ? 'bg-rose-500' :
                    result.vulnerabilityScore > 40 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${result.vulnerabilityScore}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between sm:block">
              <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Recommended Defense</span>
              <span className="text-xs font-bold text-emerald-300 uppercase truncate block">
                {result.recommendedPrivacyLevel.replace('_', ' ')} ({result.recommendedRangeMeters}m)
              </span>
            </div>
          </div>

          {/* Tactical Assessment */}
          <div className="p-3 bg-slate-950/90 border border-emerald-500/20 rounded-xl">
            <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Tactical AI Assessment
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">{result.tacticalSummary}</p>
          </div>

          {/* Threats & Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[9px] text-rose-400 font-bold uppercase block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Threat Vectors
              </span>
              <ul className="space-y-0.5 text-slate-300">
                {result.keyThreats.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-[10px]">
                    <span className="text-rose-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[9px] text-emerald-400 font-bold uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Recommended Action
              </span>
              <ul className="space-y-0.5 text-slate-300">
                {result.suggestedCountermeasures.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-[10px]">
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
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Apply Recommended Countermeasures ({result.recommendedPrivacyLevel.replace('_', ' ').toUpperCase()}, {result.recommendedRangeMeters}m)
          </button>
        </motion.div>
      ) : (
        <div className="py-4 px-3 border border-slate-800/80 rounded-xl bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>Ready to scan ambient smart cameras, RF beacons & acoustic probes.</span>
          </div>
          <button
            type="button"
            onClick={runThreatAnalysis}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
};
