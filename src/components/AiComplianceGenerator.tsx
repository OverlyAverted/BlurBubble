import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, FileText, Sparkles, RefreshCw, Copy, Check, Download, ShieldAlert, Gavel } from 'lucide-react';

interface AiComplianceGeneratorProps {
  addLog?: (log: any) => void;
}

interface ComplianceResult {
  letterTitle: string;
  noticeHeader: string;
  legalBodyText: string;
  citedRegulations: string[];
  mandatoryRemedies: string[];
  complianceHash: string;
}

export const AiComplianceGenerator: React.FC<AiComplianceGeneratorProps> = ({ addLog }) => {
  const [offenderName, setOffenderName] = useState('Unconsented Facial Recognition System #842');
  const [violationType, setViolationType] = useState('Biometric Facial Scan & Data Storage');
  const [jurisdiction, setJurisdiction] = useState('California CCPA / EU GDPR / BIPA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLegalNotice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/compliance-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offenderName,
          violationType,
          beaconId: 'BLURBUBBLE-RFC9402-BEACON-ALPHA',
          jurisdiction,
          timestamp: new Date().toISOString()
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data: ComplianceResult = await res.json();
      setResult(data);

      if (addLog) {
        addLog({
          deviceModel: 'GEMINI_LEGAL_COUNSEL',
          action: 'censored',
          shieldApplied: 'LEGAL_NOTICE_GENERATED',
          distance: 0,
          rotatedId: data.complianceHash
        });
      }
    } catch (err: any) {
      console.error('Compliance generation error:', err);
      setError(err.message || 'Legal notice generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const fullText = `${result.letterTitle}\n${result.noticeHeader}\n\n${result.legalBodyText}\n\nCITED REGULATIONS:\n${result.citedRegulations.join('\n')}\n\nMANDATORY REMEDIES:\n${result.mandatoryRemedies.join('\n')}\n\nCOMPLIANCE VERIFICATION HASH: ${result.complianceHash}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    if (!result) return;
    const fullText = `${result.letterTitle}\n${result.noticeHeader}\n\n${result.legalBodyText}\n\nCITED REGULATIONS:\n${result.citedRegulations.join('\n')}\n\nMANDATORY REMEDIES:\n${result.mandatoryRemedies.join('\n')}\n\nCOMPLIANCE VERIFICATION HASH: ${result.complianceHash}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BlurBubble_Legal_OptOut_Notice_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(245,158,11,0.1)] my-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono text-white tracking-wider flex items-center gap-2">
              Gemini 3.6 AI Legal Opt-Out & Cease-and-Desist Generator
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LEGAL COUNSEL AI
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Generates binding RFC-9402 legal opt-out demands & compliance notices under BIPA, CCPA, GDPR & EU AI Act
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs font-mono">
        <div>
          <label className="text-[10px] text-slate-400 uppercase block mb-1">Offending System / Operator</label>
          <input
            type="text"
            value={offenderName}
            onChange={(e) => setOffenderName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase block mb-1">Violation Type</label>
          <input
            type="text"
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase block mb-1">Jurisdiction / Framework</label>
          <input
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generateLegalNotice}
        disabled={loading}
        className="w-full py-2.5 mb-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Drafting Formal Legal Cease-and-Desist Notice...
          </>
        ) : (
          <>
            <Gavel className="w-4 h-4 text-amber-400" />
            Draft Legal Cease-and-Desist Notice (Gemini 3.6 Legal AI)
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-amber-400 uppercase">{result.letterTitle}</span>
              <span className="text-[9px] text-slate-500">Hash: {result.complianceHash}</span>
            </div>

            <div className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-line">
              <strong className="block font-mono text-amber-300 mb-1">{result.noticeHeader}</strong>
              {result.legalBodyText}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-amber-400 uppercase block mb-1">Cited Regulations</span>
                <ul className="space-y-0.5 text-slate-300">
                  {result.citedRegulations.map((r, idx) => (
                    <li key={idx}>• {r}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-emerald-400 uppercase block mb-1">Mandatory Remedies</span>
                <ul className="space-y-0.5 text-slate-300">
                  {result.mandatoryRemedies.map((m, idx) => (
                    <li key={idx}>✓ {m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Legal Document'}
              </button>

              <button
                type="button"
                onClick={downloadTextFile}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Notice (.txt)
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
