import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../lib/i18n';

import { 
  FileText, 
  Shield, 
  ShieldCheck, 
  Calendar, 
  User, 
  Printer, 
  Download, 
  Award, 
  CheckCircle, 
  Lock, 
  Layers, 
  History, 
  Clock, 
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { CitizenState, DetectionLog } from '../types';
import { AiComplianceGenerator } from './AiComplianceGenerator';

interface ComplianceAuditProps {
  citizenState: CitizenState;
  logs: DetectionLog[];
  onAddLog: (log: Omit<DetectionLog, 'id'>) => void;
  onClearLogs: () => void;
}

export default function ComplianceAudit({ citizenState, logs, onAddLog, onClearLogs }: ComplianceAuditProps) {
  const { t } = useI18n();
  // Report configurations
  const [reportMonth, setReportMonth] = useState('07'); // Default July
  const [reportYear, setReportYear] = useState('2026');
  const [auditorName, setAuditorName] = useState(`Citizen-Agent-${citizenState.anonymousId || '42A7'}`);
  const [targetAudience, setTargetAudience] = useState<'personal' | 'security' | 'legal'>('security');
  const [customRemarks, setCustomRemarks] = useState(
    'All detected unauthorized recording attempts were successfully thwarted via dynamic face blurring and RF-beacon opt-out packets. Device compliance met proposed RFC-9402 localized guidelines.'
  );
  
  // Custom scope inclusions
  const [includeFaceRegistry, setIncludeFaceRegistry] = useState(true);
  const [includeDeviceLicenses, setIncludeDeviceLicenses] = useState(true);
  const [includePerimeterSensors, setIncludePerimeterSensors] = useState(true);
  const [includeSecurityHashes, setIncludeSecurityHashes] = useState(true);

  // Digital Signature
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>('typed');
  const [typedSignature, setTypedSignature] = useState(citizenState.anonymousId ? `Agent ${citizenState.anonymousId}` : 'Agent 42A7-C');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Document Styling Toggles
  const [documentTheme, setDocumentTheme] = useState<'light' | 'dark'>('light');
  
  // Dynamic Serial & Document ID
  const [documentId, setDocumentId] = useState('');
  
  useEffect(() => {
    // Generate a unique report reference code
    const randCode = Math.floor(1000 + Math.random() * 9000);
    setDocumentId(`BBS-AUD-${reportYear}-${reportMonth}-${randCode}`);
  }, [reportMonth, reportYear]);

  // Handle signature canvas drawing
  useEffect(() => {
    if (signatureType === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = documentTheme === 'light' ? '#0f172a' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureType, documentTheme]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    
    // Get mouse or touch coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Pre-configured test incidents creator
  const injectDemoIncident = () => {
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const mins = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const secs = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const timestamp = `${hours}:${mins}:${secs}`;

    const models = [
      { name: 'Apple Glass Alpha-2', channel: 'BLE Ch 39', action: 'censored' as const },
      { name: 'Meta Ray-Ban Wayfarer v3', channel: 'WiFi-NAN Broadcast', action: 'censored' as const },
      { name: 'Vuzix Shield Enterprise Glasses', channel: 'BLE Ch 37', action: 'censored' as const },
      { name: 'Ring Spotlight Cam Pro v4', channel: 'RTSP Stream Interceptor', action: 'censored' as const },
      { name: 'GoPro Hero 14 AI Vision', channel: 'WiFi-Direct Beacon', action: 'censored' as const }
    ];

    const pick = models[Math.floor(Math.random() * models.length)];
    const distance = parseFloat((Math.random() * 8 + 1).toFixed(1));

    onAddLog({
      timestamp,
      deviceModel: pick.name,
      action: pick.action,
      shieldApplied: citizenState.privacyLevel === 'none' ? 'STRICT BLUR' : citizenState.privacyLevel.toUpperCase().replace('_', ' '),
      distance,
      rotatedId: `AUDIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    });
  };

  // Filter logs based on report month/year cover (simulated month-to-month filter)
  const currentFilteredLogs = logs.filter(log => {
    // For simplicity, we assume current active logs are relevant, but we can group them nicely
    return true;
  });

  const censoredLogs = currentFilteredLogs.filter(l => l.action === 'censored' || l.action === 'erased');
  const discoveredLogs = currentFilteredLogs.filter(l => l.action === 'discovered');

  // Trigger browser print dialogue
  const handlePrint = () => {
    window.print();
  };

  // Download JSON summary of blocked recording events
  const handleDownloadJson = () => {
    // Generate a structured JSON audit export
    const exportData = {
      auditMetadata: {
        documentId: documentId,
        exportTimestamp: new Date().toISOString(),
        reportingPeriod: `${reportMonth}/${reportYear}`,
        auditorName: auditorName,
        auditorAnonymousId: citizenState.anonymousId,
        targetAudience: targetAudience,
        customRemarks: customRemarks,
        signatureType: signatureType,
        typedSignature: signatureType === 'typed' ? typedSignature : undefined,
        activeScopeFilters: {
          includeFaceRegistry,
          includeDeviceLicenses,
          includePerimeterSensors,
          includeSecurityHashes
        },
        deviceContext: {
          privacyLevel: citizenState.privacyLevel,
          isBroadcasting: citizenState.isBroadcasting,
          shieldRangeMeters: citizenState.rangeMeters,
          facialRecognitionOptOut: citizenState.facialRecognitionOptOut,
        },
        statsSummary: {
          totalLogsCount: logs.length,
          blockedAttemptsCount: logs.filter(l => l.action === 'censored' || l.action === 'erased').length,
          discoveredCamerasCount: logs.filter(l => l.action === 'discovered').length,
          uniqueIntrudingDevicesCount: Array.from(new Set(logs.map(l => l.deviceModel))).length,
          averageDistanceMeters: logs.length > 0 
            ? parseFloat((logs.reduce((acc, l) => acc + l.distance, 0) / logs.length).toFixed(2)) 
            : 0,
        }
      },
      events: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        deviceModel: log.deviceModel,
        action: log.action,
        shieldApplied: log.shieldApplied,
        distanceMeters: log.distance,
        rotatedId: log.rotatedId,
        verifiedSecure: log.action === 'censored' || log.action === 'erased',
      }))
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `privacy_audit_export_${documentId || new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Static stats calculation
  const totalIncidents = currentFilteredLogs.length;
  const blockedAttempts = censoredLogs.length;
  const threatDevicesCount = Array.from(new Set(currentFilteredLogs.map(l => l.deviceModel))).length;
  const complianceScore = totalIncidents > 0 ? Math.round((blockedAttempts / (totalIncidents - discoveredLogs.length || 1)) * 100) : 100;

  // Month names
  const months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];

  const currentMonthName = months.find(m => m.value === reportMonth)?.name || 'July';

  return (
    <div className="space-y-6">
      {/* CSS stylesheet injected for custom printing of the document page */}
      <style>{`
        @media print {
          /* Hide everything on the page except the printable-pdf-document */
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          #printable-pdf-document, #printable-pdf-document * {
            visibility: visible;
          }
          #printable-pdf-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            background-color: white !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Fix layout issues on print */
          .print-border-black {
            border-color: #000000 !important;
          }
          .print-text-black {
            color: #000000 !important;
          }
          .print-bg-gray {
            background-color: #f1f5f9 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Grid: Controls vs Interactive Paper PDF View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Audit Report Builder Controls (6 cols) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('audit.builderTitle')}</h3>
                <p className="text-[10px] text-slate-400">{t('audit.builderDesc')}</p>
              </div>
            </div>

            {/* Config Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Report Month</label>
                  <select
                    id="report-month-select"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Report Year</label>
                  <select
                    id="report-year-select"
                    value={reportYear}
                    onChange={(e) => setReportYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Auditor Name / ID Reference</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="auditor-name-input"
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="Enter your security credentials identifier"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Target Audience Format</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAudience('personal');
                      setCustomRemarks('This report serves as a verified chronological record of localized privacy enforcement. All listed wearable recording modules were subjected to autonomous cryptographic opt-out signals.');
                    }}
                    className={`py-1 rounded text-[9px] uppercase font-mono font-bold transition-all ${
                      targetAudience === 'personal' ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Personal Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAudience('security');
                      setCustomRemarks('Submitted to venue management. This digital certificate logs repeated unauthorized biometric scans blocked by the user’s decentralized shield. Please align surveillance devices with our active opt-out preferences.');
                    }}
                    className={`py-1 rounded text-[9px] uppercase font-mono font-bold transition-all ${
                      targetAudience === 'security' ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Security Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAudience('legal');
                      setCustomRemarks('EVIDENCE RECORD: Cryptographic signatures verify unauthorized bystander data-harvesters bypassed consent bounds. Dynamic blurring protocols deployed to protect legal personal identity in public space.');
                    }}
                    className={`py-1 rounded text-[9px] uppercase font-mono font-bold transition-all ${
                      targetAudience === 'legal' ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Legal Evidence
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Executive Summary &amp; Legal Remarks</label>
                <textarea
                  id="remarks-input"
                  rows={3}
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  placeholder="Provide brief context regarding your privacy logs..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Toggle Document Sections */}
              <div className="space-y-2 pt-2 border-t border-slate-850/60">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Report Sections Inclusions</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeFaceRegistry}
                      onChange={(e) => setIncludeFaceRegistry(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Face Opt-Out Proof</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeDeviceLicenses}
                      onChange={(e) => setIncludeDeviceLicenses(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Hardware Sync Proof</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includePerimeterSensors}
                      onChange={(e) => setIncludePerimeterSensors(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Perimeter Safe Zones</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeSecurityHashes}
                      onChange={(e) => setIncludeSecurityHashes(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>System Cryptography</span>
                  </label>
                </div>
              </div>

              {/* Digital Signature Pad Box */}
              <div className="space-y-2 pt-2 border-t border-slate-850/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Sign Evidence Log</span>
                  <div className="flex gap-1.5 bg-slate-950 p-0.5 rounded-md border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setSignatureType('typed')}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                        signatureType === 'typed' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      TYPED
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureType('drawn')}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                        signatureType === 'drawn' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      DRAWN
                    </button>
                  </div>
                </div>

                {signatureType === 'typed' ? (
                  <input
                    id="typed-sig-input"
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder={t('audit.typeNamePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative bg-white rounded-lg border border-slate-300 h-28 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={280}
                        height={110}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                      />
                      {!hasDrawnSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] text-slate-400 font-mono">{t('audit.signInstruction')}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-850 rounded text-[9px] font-mono transition-all"
                    >
                      {t('audit.clearSignature')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Controls */}
            <div className="pt-3 border-t border-slate-850/60 flex gap-2">
              <button
                id="inject-demo-incident-btn"
                type="button"
                onClick={injectDemoIncident}
                className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-blue-400 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                title="Create a synthetic nearby smart glasses incident with opt-out enforcement log"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('audit.simulateIncident')}
              </button>
              <button
                id="clear-audit-logs-btn"
                type="button"
                onClick={onClearLogs}
                className="bg-slate-950 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 p-2 rounded-xl transition-all"
                title="Flush current incident logs repository"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Print Utility Instruction Card */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-400">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="font-bold text-slate-300">Evidence Documentation Mode</span>
              <p>This panel formats a physical A4-style certificate matching security auditing standards. Use the **Print/Save PDF** action to open your browser’s print dialog. The webpage stylesheet is pre-optimized to isolate and print only the document page cleanly.</p>
            </div>
          </div>

          {/* NEW SECTION: Platform Success Rate Analytics Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('audit.metricsTitle')}</h3>
                <p className="text-[10px] text-slate-400">{t('audit.metricsDesc')}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Historical success rate tracking of automated CDN redaction filters. This visual represents compliant edge blurring within 150ms of a platform crawling sweep.
            </p>

            <div className="h-64 w-full bg-slate-950/40 rounded-xl border border-slate-850 p-2 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={[
                    { name: 'May 2026', YouTube: 91, TikTok: 85, Instagram: 88 },
                    { name: 'Jun 2026', YouTube: 94, TikTok: 89, Instagram: 91 },
                    { name: 'Jul 2026', YouTube: 98, TikTok: 92, Instagram: 95 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="YouTube" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TikTok" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Instagram" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2 items-center bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Audit Trend: Average response latency decreased to 118ms in July.</span>
            </div>
          </div>
        </div>

        {/* Right Side: PDF Document Layout View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Document actions bar */}
          <div className="flex items-center justify-between no-print bg-slate-900 border border-slate-850 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document View:</span>
              <div className="flex rounded bg-slate-950 p-0.5 border border-slate-850">
                <button
                  type="button"
                  onClick={() => setDocumentTheme('light')}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition ${
                    documentTheme === 'light' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Light / Paper
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentTheme('dark')}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition ${
                    documentTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Dark / Dashboard
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="download-audit-json-btn"
                type="button"
                onClick={handleDownloadJson}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-slate-650 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/20"
                title="Download JSON audit summary of all blocked recording events"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                id="print-audit-pdf-btn"
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                title="Print certificate or generate system-native PDF export"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* PHYSICAL A4-STYLE PDF CONTAINER */}
          <div 
            id="printable-pdf-document"
            className={`w-full transition-all duration-300 border rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 ${
              documentTheme === 'light' 
                ? 'bg-white text-slate-900 border-slate-300 font-sans print-border-black print-text-black' 
                : 'bg-slate-900 text-slate-300 border-slate-800 font-sans'
            }`}
          >
            {/* Stamp, Holographic seal effect inside document */}
            <div className="relative border-b border-dashed pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Document Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${
                  documentTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-850'
                }`}>
                  <Shield className={`w-6 h-6 ${documentTheme === 'light' ? 'text-slate-800' : 'text-emerald-400'}`} />
                </div>
                <div>
                  <h1 className={`text-md font-bold tracking-tight uppercase ${documentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    BlurBubble™ Opt-Out Protocol
                  </h1>
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 font-mono">
                    SECURED DIGITAL EVIDENCE SYSTEM • MULTI-BEACON SPEC
                  </span>
                </div>
              </div>

              {/* Holographic compliance Seal */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right font-mono text-[8px]">
                  <span className="block text-slate-400 uppercase">DOCUMENT LEVEL</span>
                  <span className={`font-bold ${documentTheme === 'light' ? 'text-slate-800' : 'text-emerald-400'}`}>
                    {targetAudience === 'personal' ? 'RESTRICTED • PERSONAL' : targetAudience === 'security' ? 'OFFICIAL CERTIFICATE' : 'LEGAL ADMISSIBLE'}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden rotate-12 ${
                  documentTheme === 'light' 
                    ? 'border-emerald-600 bg-emerald-500/5 text-emerald-700' 
                    : 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Award className="w-5 h-5 absolute opacity-10 animate-spin text-emerald-500" style={{ animationDuration: '20s' }} />
                  <span className="text-[7px] uppercase font-mono font-extrabold text-center tracking-tight leading-none">
                    SEALED
                  </span>
                  <span className="text-[6px] uppercase font-mono text-center">
                    COMPLIANT
                  </span>
                </div>
              </div>
            </div>

            {/* General Metadata Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-dashed">
              <div className="space-y-0.5">
                <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Certificate UUID</span>
                <span className="text-[10px] font-mono font-semibold uppercase">{documentId || 'GENERATING...'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Audit Covering Period</span>
                <span className="text-[10px] font-mono font-semibold">01 {currentMonthName} {reportYear} - 31 {currentMonthName} {reportYear}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Auditor Credential</span>
                <span className="text-[10px] font-semibold">{auditorName}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Date of Generation</span>
                <span className="text-[10px] font-mono text-slate-400">2026-{reportMonth}-02 05:26:17 UTC</span>
              </div>
            </div>

            {/* Executive Summary Stats Block */}
            <div className="space-y-2">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${documentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                1. Executive Summary &amp; Verification Metrics
              </h2>
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl ${
                documentTheme === 'light' ? 'bg-slate-50 border border-slate-200 print-bg-gray' : 'bg-slate-950/60 border border-slate-850'
              }`}>
                <div className="text-center space-y-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono block">Enforcement Rate</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-500">{complianceScore}%</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">Total Opt-Out Compliant</span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono block">Blocked Attempts</span>
                  <span className="text-xl font-extrabold font-mono text-blue-500">{blockedAttempts}</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">Successful Shield Triggers</span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono block">Unique Threat Devices</span>
                  <span className="text-xl font-extrabold font-mono text-amber-500">{threatDevicesCount}</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">Camera/Glasses Identified</span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono block">Protocol Broadcast</span>
                  <span className="text-xl font-extrabold font-mono text-blue-400">FCC Part 15</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">Low Energy BLE Compliant</span>
                </div>
              </div>
            </div>

            {/* Remarks Narrative Block */}
            <div className="space-y-2">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${documentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                2. Audit Narrative &amp; Legal Declaration
              </h2>
              <div className={`p-3 rounded-xl border border-dashed text-xs leading-relaxed italic ${
                documentTheme === 'light' ? 'bg-amber-50/10 border-amber-200' : 'bg-slate-950/20 border-slate-800'
              }`}>
                "{customRemarks}"
              </div>
            </div>

            {/* CHRONOLOGICAL AUDIT LEDGER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className={`text-xs font-bold uppercase tracking-wider ${documentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  3. Chronological Evidential Incident Log
                </h2>
                <span className="text-[8px] font-mono text-slate-400 uppercase">
                  RECORD COUNT: {totalIncidents} ATTEMPTS
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className={`border-b border-dashed ${documentTheme === 'light' ? 'text-slate-500 border-slate-300' : 'text-slate-400 border-slate-850'}`}>
                      <th className="py-2 font-mono font-bold uppercase">Time</th>
                      <th className="py-2 font-mono font-bold uppercase">Device Model</th>
                      <th className="py-2 font-mono font-bold uppercase">Assigned Channel/ID</th>
                      <th className="py-2 font-mono font-bold uppercase">Est. Range</th>
                      <th className="py-2 font-mono font-bold uppercase">Opt-out Action</th>
                      <th className="py-2 font-mono font-bold uppercase text-right">Shield Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFilteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-mono italic">
                          No detected recording attempts logged. Use 'Simulate Incident' button to populate data.
                        </td>
                      </tr>
                    ) : (
                      currentFilteredLogs.slice(0, 8).map((log, index) => {
                        const isBlocked = log.action === 'censored' || log.action === 'erased';
                        return (
                          <tr 
                            key={log.id || index} 
                            className={`border-b border-dashed last:border-0 ${
                              documentTheme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-850 hover:bg-slate-950/20'
                            }`}
                          >
                            <td className="py-2 font-mono font-semibold">{log.timestamp}</td>
                            <td className="py-2 font-bold">{log.deviceModel}</td>
                            <td className="py-2 font-mono text-slate-400">{log.rotatedId}</td>
                            <td className="py-2 font-mono">{log.distance} m</td>
                            <td className="py-2 font-mono font-semibold uppercase text-blue-400">{log.shieldApplied}</td>
                            <td className="py-2 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border tracking-tight ${
                                isBlocked 
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {isBlocked ? '✓ BLOCKED' : '✓ DISCOVERED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {currentFilteredLogs.length > 8 && (
                <span className="block text-[8px] text-slate-500 font-mono text-right mt-1 italic">
                  * showing top 8 events of {currentFilteredLogs.length} logged incidents in monthly window
                </span>
              )}
            </div>

            {/* Dynamic sections depending on checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
              
              {/* Left Column Section: Face Registry Opt-Out Verification */}
              {includeFaceRegistry && (
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Section A: Face Registry Verification Code</span>
                  <div className={`p-2.5 rounded-lg text-[9px] font-mono space-y-1 ${
                    documentTheme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/40 border border-slate-850'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Enrolled Faces:</span>
                      <span className="font-bold">{citizenState.registeredFaces?.length || 0} Faces</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enforcement Status:</span>
                      <span className="text-emerald-500 font-bold">100% BLUR FORCE ACTIVE</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-800 pt-1 mt-1 text-[8px]">
                      <span className="text-slate-500">Hash Checksum:</span>
                      <span className="text-slate-400 select-all font-bold">SHA256:d8a2...3f12</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column Section: System Security Integrity */}
              {includeSecurityHashes && (
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Section B: Device Verification Signature</span>
                  <div className={`p-2.5 rounded-lg text-[9px] font-mono space-y-1 ${
                    documentTheme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/40 border border-slate-850'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">WebAuthn Enrollment:</span>
                      <span className={citizenState.biometricLockEnabled ? 'text-emerald-500 font-bold' : 'text-slate-500 font-semibold'}>
                        {citizenState.biometricLockEnabled ? 'REGISTERED & ENCRYPTED' : 'UNARMED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ZKP Shield Sequence:</span>
                      <span className="text-blue-400 font-bold">ACTIVE (ZKS-ECC-256)</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-800 pt-1 mt-1 text-[8px]">
                      <span className="text-slate-500">Device Hardware ID:</span>
                      <span className="text-slate-400 select-all font-bold">ZKP-MAC-{citizenState.anonymousId || '42A7'}-SECURE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Signature Block, Barcode & Compliance Seal */}
            <div className="border-t border-slate-300 print-border-black pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Verification Barcode */}
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-end h-8 gap-0.5">
                  <div className="w-1.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-0.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-1 h-full bg-slate-800 print-bg-black" />
                  <div className="w-0.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-1.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-0.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-0.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-1.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-1 h-full bg-slate-800 print-bg-black" />
                  <div className="w-0.5 h-full bg-slate-800 print-bg-black" />
                  <div className="w-1.5 h-full bg-slate-800 print-bg-black" />
                </div>
                <span className="text-[7px] font-mono tracking-widest text-slate-400">
                  REF-BLURBUBBLE-{citizenState.anonymousId || '42A7'}-SHIELD-ACTIVE
                </span>
              </div>

              {/* Citizen Signature Sign-off */}
              <div className="text-center sm:text-right space-y-1.5 w-44">
                <div className="border-b border-slate-400 print-border-black pb-1.5 min-h-[40px] flex items-end justify-center sm:justify-end">
                  {signatureType === 'typed' ? (
                    <span className="font-serif italic text-lg tracking-wider text-blue-500 font-bold pr-2 print-text-black">
                      {typedSignature || `Agent ${citizenState.anonymousId || '42A7-C'}`}
                    </span>
                  ) : (
                    hasDrawnSignature ? (
                      <div className="w-full flex justify-center sm:justify-end">
                        <span className="font-serif italic text-[11px] text-blue-500 font-bold select-none pr-1">
                          [Electronically signed with device biometrics]
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono italic pr-1">Missing signature</span>
                    )
                  )}
                </div>
                <div className="space-y-0.5 text-center sm:text-right">
                  <span className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Authorized Signature</span>
                  <span className="text-[7px] text-slate-400 font-mono block">
                    Citizen Opt-Out Auditor • {currentMonthName} {reportYear}
                  </span>
                </div>
              </div>

            </div>

            {/* Official Legal Disclaimer Footer inside report */}
            <div className="pt-4 border-t border-dashed text-center mb-4">
              <p className="text-[7px] text-slate-400 leading-normal max-w-lg mx-auto">
                LEGAL COMPLIANCE STATEMENT: The owner of this signature exerts explicit local bystander rights to be excluded from AI training loops, continuous telemetry streams, facial profiling caches, or commercial recording platforms. This digital ledger represents a real-world verifiable RF-proof record. Unauthorized interception breaches proposed localized boundary limits.
              </p>
            </div>

            {/* Gemini 3.6 AI Cease-and-Desist Legal Generator */}
            <AiComplianceGenerator addLog={onAddLog} />

          </div>

        </div>

      </div>

    </div>
  );
}
