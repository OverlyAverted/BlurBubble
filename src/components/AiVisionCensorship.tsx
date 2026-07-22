import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Sparkles, RefreshCw, AlertCircle, ShieldCheck, Camera, Layers, Zap } from 'lucide-react';
import { CitizenState } from '../types';

interface AiVisionCensorshipProps {
  citizenState: CitizenState;
  onChange: (newState: CitizenState) => void;
  addLog?: (log: any) => void;
}

interface BlurRegion {
  label: string;
  confidence: number;
  riskLevel: string;
  suggestedFilter: string;
}

interface FrameAnalysisResult {
  privacyViolationsFound: boolean;
  detectedSubjectsCount: number;
  riskDescription: string;
  blurRegions: BlurRegion[];
  opticalDefenseAdvice: string;
}

export const AiVisionCensorship: React.FC<AiVisionCensorshipProps> = ({ citizenState, onChange, addLog }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FrameAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleImage, setSampleImage] = useState<string>('sample1');

  // Generate a mock optical frame base64 representation or sample image data
  const analyzeFrameWithGemini = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a small 100x100 canvas snapshot or synthetic base64 image frame
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(150, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(40, 40, 30, 30);
      }
      const mockBase64 = canvas.toDataURL('image/jpeg');

      const res = await fetch('/api/gemini/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: mockBase64,
          mode: sampleImage
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data: FrameAnalysisResult = await res.json();
      setResult(data);

      if (addLog) {
        addLog({
          deviceModel: 'GEMINI_OPTICAL_AI',
          action: 'censored',
          shieldApplied: `FRAME_ANALYSIS_${data.privacyViolationsFound ? 'VIOLATIONS' : 'CLEAN'}`,
          distance: 1.5,
          rotatedId: `SUBJECTS_${data.detectedSubjectsCount}`
        });
      }
    } catch (err: any) {
      console.error('Optical analysis error:', err);
      setError(err.message || 'Vision analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyOpticalDefense = (suggestedFilter: string) => {
    const validLevel = ['strict_blur', 'pixelate', 'emoji', 'magic_removal', 'black_bar'].includes(suggestedFilter)
      ? (suggestedFilter as any)
      : 'strict_blur';

    const updated = {
      ...citizenState,
      privacyLevel: validLevel
    };
    onChange(updated);
    try {
      localStorage.setItem('blurbubble_citizen_state', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.1)] my-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono text-white tracking-wider flex items-center gap-2">
              Gemini 3.6 Vision AI Optical Censorship Assistant
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LENS AI
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Scans Smart Glasses HUD video feed for unconsented faces, security cams & screen leaks
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={analyzeFrameWithGemini}
          disabled={loading}
          className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              Scanning Frame...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Analyze Glasses Frame
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
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${result.privacyViolationsFound ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'}`}>
                {result.privacyViolationsFound ? <EyeOff className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-bold font-mono uppercase text-white block">
                  {result.privacyViolationsFound ? `⚠️ ${result.detectedSubjectsCount} Privacy Violations Detected` : '✓ Optical Frame Clean'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{result.riskDescription}</span>
              </div>
            </div>
          </div>

          {result.blurRegions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold font-mono uppercase text-cyan-400 tracking-wider block">
                Detected Optical Regions & Recommended Filters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.blurRegions.map((region, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-200 block">{region.label}</span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Confidence: {(region.confidence * 100).toFixed(0)}% • Risk: {region.riskLevel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyOpticalDefense(region.suggestedFilter)}
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition"
                    >
                      Apply {region.suggestedFilter.replace('_', ' ')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-950/80 border border-cyan-500/20 rounded-xl">
            <span className="text-[10px] font-bold font-mono uppercase text-cyan-400 block mb-1">
              Gemini 3.6 Lens Recommendation
            </span>
            <p className="text-xs text-slate-300">{result.opticalDefenseAdvice}</p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <p className="text-xs font-mono text-slate-400">
            Click "Analyze Glasses Frame" to scan camera input for unconsented faces & recording lenses
          </p>
        </div>
      )}
    </div>
  );
};
