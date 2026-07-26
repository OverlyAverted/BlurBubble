import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Trophy,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  Zap,
  Globe,
  Award,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
  Check
} from 'lucide-react';
import { DetectionLog } from '../types';

interface CompetitionTarget {
  id: string;
  type: 'tech_giant' | 'competition' | 'grant' | 'standards_body';
  name: string;
  organization: string;
  contactDept: string;
  targetFocus: string;
  prizeOrGrantAmount: string;
  deadline: string;
  keyRelevance: string;
  pitchAngle: string;
}

interface GeneratedPitch {
  emailSubject: string;
  executiveSummary: string;
  emailBody: string;
  pitchDeckSlides: Array<{ title: string; bulletPoints: string[] }>;
  targetEmailAddress: string;
}

interface DispatchResult {
  dispatchId: string;
  timestamp: string;
  dispatchMethod: string;
  recipientEmail: string;
  targetName: string;
  status: string;
  cryptographicReceipt: string;
  message: string;
}

interface TechOutreachHubProps {
  addLog: (log: Omit<DetectionLog, 'id' | 'timestamp'>) => void;
}

const DEFAULT_TARGETS: CompetitionTarget[] = [
  {
    id: 'meta-reality-labs',
    type: 'tech_giant',
    name: 'Meta Reality Labs - Smart Glasses Division',
    organization: 'Meta Platforms Inc.',
    contactDept: 'Ray-Ban Meta Wearables & Privacy Standards Dept',
    targetFocus: 'Smart Glasses Opt-Out & Public Beacon Integration',
    prizeOrGrantAmount: 'Strategic Partnership / Platform Licensing',
    deadline: 'Rolling 2026 Q3',
    keyRelevance: 'Direct integration with Ray-Ban Meta AI smart glasses to recognize RFC-9402 BLE beacons and automatically mute recording LED or censor captured bystanders.',
    pitchAngle: 'Native RFC-9402 BLE Beacon Opt-Out Standard for Ray-Ban Meta Smart Glasses'
  },
  {
    id: 'apple-vision-wearables',
    type: 'tech_giant',
    name: 'Apple Vision & Spatial Hardware Privacy',
    organization: 'Apple Inc.',
    contactDept: 'Spatial Computing Hardware Privacy & MFi Standards',
    targetFocus: 'Opt-Out Broadcasts for Spatial Video & PassThrough',
    prizeOrGrantAmount: 'MFi Hardware Certification & Ecosystem License',
    deadline: 'Rolling 2026',
    keyRelevance: 'Hardware-level handshake for Spatial Video recording suppression when BlurBubble wearable beacons are nearby.',
    pitchAngle: 'Privacy-Preserving Spatial Capture: RFC-9402 Beacon Protocol for Vision Pro'
  },
  {
    id: 'ieee-privacy-award',
    type: 'competition',
    name: 'IEEE International Privacy & Security Innovation Challenge',
    organization: 'IEEE Computer Society',
    contactDept: 'Wearable Privacy & Decentralized Standards Panel',
    targetFocus: 'Tactical Physical-Layer Privacy Standards',
    prizeOrGrantAmount: '$100,000 Innovation Grant + Standard Adoption',
    deadline: 'October 15, 2026',
    keyRelevance: 'Hardware and RF protocol specification proving 0.05ms physical-layer opt-out broadcasts.',
    pitchAngle: 'BlurBubble RFC-9402: Hardware-Validated Citizen Privacy Shield for Smart Wearables'
  },
  {
    id: 'eff-open-hardware-grant',
    type: 'grant',
    name: 'EFF Digital Sovereignty & Open Hardware Grant',
    organization: 'Electronic Frontier Foundation',
    contactDept: 'Open Hardware & Anti-Surveillance Tech Fund',
    targetFocus: 'Counter-Surveillance & Anti-Biometric Tools',
    prizeOrGrantAmount: '$75,000 Open Source Development Fund',
    deadline: 'November 1, 2026',
    keyRelevance: 'Decentralized open-spec beacon system defending citizens from automated facial recognition.',
    pitchAngle: 'Decentralized Anti-Surveillance Wearable Beacon for Anti-Biometric Self-Defense'
  },
  {
    id: 'snap-spectacles',
    type: 'tech_giant',
    name: 'Snap Spectacles AR Privacy Initiative',
    organization: 'Snap Inc.',
    contactDept: 'AR Hardware Safety & Bystander Protection',
    targetFocus: 'Bystander Opt-Out Protocol for AR Capture',
    prizeOrGrantAmount: 'Snap AR Innovation Grant + Partner Pilot',
    deadline: 'August 30, 2026',
    keyRelevance: 'Preventing unconsented AR scanning and video capture of bystanders during live Spectacles sessions.',
    pitchAngle: 'Automated Bystander Opt-Out Integration for Snap Spectacles AR'
  },
  {
    id: 'darpa-tactical-privacy',
    type: 'grant',
    name: 'DARPA Tactical Privacy & RF Deception Challenge',
    organization: 'DARPA Defense Sciences Office',
    contactDept: 'Tactical Wearables & RF Electromagnetic Shielding',
    targetFocus: 'Acoustic & RF Tactical Disruption for Personnel',
    prizeOrGrantAmount: '$250,000 Research Grant',
    deadline: 'December 10, 2026',
    keyRelevance: '22kHz ultrasonic microphone saturation and phase-inverted acoustic jammer for defense in hostile sensor grids.',
    pitchAngle: 'BlurBubble Tactical: Wearable RF Deception & Acoustic Microphone Saturation System'
  }
];

interface ForumDiscussion {
  id: string;
  platform: 'HackerNews' | 'Reddit' | 'X_Twitter' | 'IEEE_Forum' | 'ProductHunt';
  threadTitle: string;
  originalPostSummary: string;
  topicCategory: string;
  userSentiment: 'concerned' | 'curious' | 'skeptical';
  automatedRFCResponse: string;
  postingStatus: 'QUEUED' | 'AUTO_DRAFTED';
}

interface DirectoryListing {
  platformName: string;
  tagline: string;
  shortDescription: string;
  fullDescriptionMarkdown: string;
  targetKeywords: string[];
  makerComment: string;
  screenshotCaptions: string[];
}

interface GeneratedFirmware {
  hardwareChip: string;
  firmwareCodeC: string;
  platformIOConfig: string;
  flashInstructions: string;
  binaryHeaderHash: string;
}

export const TechOutreachHub: React.FC<TechOutreachHubProps> = ({ addLog }) => {
  const [targets, setTargets] = useState<CompetitionTarget[]>(DEFAULT_TARGETS);
  const [selectedTarget, setSelectedTarget] = useState<CompetitionTarget>(DEFAULT_TARGETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitch | null>(null);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);

  // Forum Scout State
  const [forumDiscussions, setForumDiscussions] = useState<ForumDiscussion[]>([]);
  const [isScoutingForums, setIsScoutingForums] = useState(false);

  // Directory Listings State
  const [directoryListing, setDirectoryListing] = useState<DirectoryListing | null>(null);
  const [isGeneratingListing, setIsGeneratingListing] = useState(false);
  const [selectedDirectoryPlatform, setSelectedDirectoryPlatform] = useState('ProductHunt');

  // Firmware Generator State
  const [generatedFirmware, setGeneratedFirmware] = useState<GeneratedFirmware | null>(null);
  const [isGeneratingFirmware, setIsGeneratingFirmware] = useState(false);
  const [selectedChip, setSelectedChip] = useState('ESP32-S3 BLE 5.0');
  
  const [customEmail, setCustomEmail] = useState('executive-partnerships@techcompany.com');
  const [customSender, setCustomSender] = useState('Lead Privacy Systems Engineer, BlurBubble');
  const [activeTab, setActiveTab] = useState<'targets' | 'pitch' | 'dispatch' | 'forums' | 'listings' | 'firmware'>('targets');

  // Load latest competition & tech targets from Gemini 3.6 API
  const handleScanCompetitions = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/outreach/find-competitions');
      if (res.ok) {
        const data = await res.json();
        if (data.competitionsAndTechTargets && data.competitionsAndTechTargets.length > 0) {
          setTargets(data.competitionsAndTechTargets);
          setSelectedTarget(data.competitionsAndTechTargets[0]);
          addLog({
            deviceModel: 'GEMINI_OUTREACH_AI',
            action: 'discovered',
            shieldApplied: `DISCOVERED_${data.competitionsAndTechTargets.length}_COMPETITION_TARGETS`,
            distance: 0,
            rotatedId: 'COMPETITION_SCAN_SUCCESS'
          });
        }
      }
    } catch (e) {
      console.error('Failed to scan competitions:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Scout forums
  const handleScoutForums = async () => {
    setIsScoutingForums(true);
    try {
      const res = await fetch('/api/automation/forum-scout');
      if (res.ok) {
        const data = await res.json();
        if (data.forumDiscussions) {
          setForumDiscussions(data.forumDiscussions);
          setActiveTab('forums');
          addLog({
            deviceModel: 'FORUM_SCOUT_AGENT',
            action: 'discovered',
            shieldApplied: `SCOUTED_${data.forumDiscussions.length}_PRIVACY_DISCUSSIONS`,
            distance: 0,
            rotatedId: 'FORUM_SCOUT_SUCCESS'
          });
        }
      }
    } catch (e) {
      console.error('Failed to scout forums:', e);
    } finally {
      setIsScoutingForums(false);
    }
  };

  // Generate directory listing
  const handleGenerateDirectoryListing = async (platformName: string) => {
    setIsGeneratingListing(true);
    setSelectedDirectoryPlatform(platformName);
    try {
      const res = await fetch('/api/automation/directory-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformName })
      });
      if (res.ok) {
        const data = await res.json();
        setDirectoryListing(data);
        setActiveTab('listings');
        addLog({
          deviceModel: 'DIRECTORY_LISTING_AI',
          action: 'censored',
          shieldApplied: `GENERATED_LISTING_FOR_${platformName.toUpperCase()}`,
          distance: 0,
          rotatedId: 'DIRECTORY_PACKAGE_READY'
        });
      }
    } catch (e) {
      console.error('Failed to generate directory listing:', e);
    } finally {
      setIsGeneratingListing(false);
    }
  };

  // Generate C++ BLE Firmware
  const handleGenerateFirmware = async () => {
    setIsGeneratingFirmware(true);
    try {
      const res = await fetch('/api/automation/generate-firmware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hardwareChip: selectedChip,
          beaconPowerDb: 4,
          rfcHash: 'RFC-9402-SHA256-ENCRYPTED'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedFirmware(data);
        setActiveTab('firmware');
        addLog({
          deviceModel: 'FIRMWARE_COMPILER_AI',
          action: 'censored',
          shieldApplied: `COMPILED_FIRMWARE_FOR_${selectedChip.toUpperCase().replace(/\s+/g, '_')}`,
          distance: 0,
          rotatedId: data.binaryHeaderHash || 'FIRMWARE_READY'
        });
      }
    } catch (e) {
      console.error('Failed to generate firmware:', e);
    } finally {
      setIsGeneratingFirmware(false);
    }
  };

  // Generate automated executive pitch deck & proposal
  const handleGeneratePitch = async (target?: CompetitionTarget) => {
    const t = target || selectedTarget;
    setIsGenerating(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/outreach/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: t.name,
          targetType: t.type,
          contactEmail: customEmail,
          senderName: customSender
        })
      });

      if (res.ok) {
        const data: GeneratedPitch = await res.json();
        setGeneratedPitch(data);
        setActiveTab('pitch');
        addLog({
          deviceModel: 'PITCH_GENERATOR_AI',
          action: 'censored',
          shieldApplied: `GENERATED_EXECUTIVE_PITCH_FOR_${t.name.toUpperCase().replace(/\s+/g, '_')}`,
          distance: 0,
          rotatedId: 'PITCH_DECK_READY'
        });
      }
    } catch (e) {
      console.error('Failed to generate pitch:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger server-side automated email & presentation dispatch
  const handleServerDispatch = async () => {
    if (!generatedPitch) return;
    setIsDispatching(true);
    try {
      const res = await fetch('/api/outreach/send-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: generatedPitch.targetEmailAddress || customEmail,
          targetName: selectedTarget.name,
          emailSubject: generatedPitch.emailSubject,
          emailBody: generatedPitch.emailBody,
          pitchDeckData: generatedPitch.pitchDeckSlides
        })
      });

      if (res.ok) {
        const data: DispatchResult = await res.json();
        setDispatchResult(data);
        setActiveTab('dispatch');
        addLog({
          deviceModel: 'SERVER_AUTOMATED_OUTREACH',
          action: 'dispatched' as any,
          shieldApplied: `SERVER_DISPATCHED_PRESENTATION_TO_${selectedTarget.name.toUpperCase().replace(/\s+/g, '_')}`,
          distance: 0,
          rotatedId: data.cryptographicReceipt
        });
      }
    } catch (e) {
      console.error('Failed to dispatch presentation via server:', e);
    } finally {
      setIsDispatching(false);
    }
  };

  // One-Click Full Spectrum Autopilot Suite Execution
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const handleRunAllAutopilot = async () => {
    setIsAutopilotRunning(true);
    try {
      const res = await fetch('/api/automation/run-all-tasks', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.competitionsAndTechTargets?.length) setTargets(data.competitionsAndTechTargets);
        if (data.forumDiscussions?.length) setForumDiscussions(data.forumDiscussions);
        if (data.directoryListing) setDirectoryListing(data.directoryListing);
        if (data.generatedFirmware) setGeneratedFirmware(data.generatedFirmware);
        if (data.generatedPitch) setGeneratedPitch(data.generatedPitch);
        if (data.dispatchReceipt) setDispatchResult(data.dispatchReceipt);

        setActiveTab('dispatch');
        addLog({
          deviceModel: 'AUTOPILOT_ENGINE_FULL_SUITE',
          action: 'censored',
          shieldApplied: `EXECUTED_FULL_SPECTRUM_AUTOMATION_SUITE`,
          distance: 0,
          rotatedId: data.autopilotRunId || 'AUTOPILOT_COMPLETE'
        });
      }
    } catch (e) {
      console.error('Failed to run full autopilot suite:', e);
    } finally {
      setIsAutopilotRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                Server-Side Automated Outreach API
              </span>
              <span className="text-xs text-slate-400 font-mono">RFC-9402 Partnership Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 break-words">
              <Trophy className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>Tech Giant Pitch &amp; Competition Submission Hub</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Automatically identify AR/AI wearable tech developers, draft executive pitch decks, execute server-side automated presentation dispatches, scout community forums, submit directory listings, and compile C++ microcode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="activate-autopilot-btn"
              type="button"
              onClick={handleRunAllAutopilot}
              disabled={isAutopilotRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-105 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              <Zap className={`w-4 h-4 ${isAutopilotRunning ? 'animate-bounce' : ''}`} />
              {isAutopilotRunning ? 'Running Master Autopilot...' : '🚀 Execute All Automation'}
            </button>

            <button
              id="scan-competitions-btn"
              type="button"
              onClick={handleScanCompetitions}
              disabled={isScanning}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Refresh Targets'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('targets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'targets'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            1. Tech Giant Pitches ({targets.length})
          </button>
          
          <button
            type="button"
            onClick={handleScoutForums}
            disabled={isScoutingForums}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'forums'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            2. Forum & Community Scout {isScoutingForums && '...'}
          </button>

          <button
            type="button"
            onClick={() => handleGenerateDirectoryListing(selectedDirectoryPlatform)}
            disabled={isGeneratingListing}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'listings'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            3. Directory Submissions
          </button>

          <button
            type="button"
            onClick={() => handleGenerateFirmware()}
            disabled={isGeneratingFirmware}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'firmware'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            4. C++ Firmware Compiler
          </button>

          {generatedPitch && (
            <button
              type="button"
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'pitch'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Proposal Deck
            </button>
          )}

          {dispatchResult && (
            <button
              type="button"
              onClick={() => setActiveTab('dispatch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'dispatch'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Server Receipt
            </button>
          )}
        </div>
      </div>

      {/* Main Tab 1: Targets & Competitions List */}
      {activeTab === 'targets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target List Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Select Partner Target or Grant Competition
              </h3>
              <span className="text-xs text-slate-500 font-mono">Gemini 3.6 Curated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targets.map((target) => {
                const isSelected = selectedTarget.id === target.id;
                return (
                  <div
                    key={target.id}
                    onClick={() => {
                      setSelectedTarget(target);
                      setCustomEmail(`partnerships@${target.id.replace(/-/g, '')}.com`);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          target.type === 'tech_giant' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          target.type === 'competition' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          target.type === 'grant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {target.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {target.prizeOrGrantAmount}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1 leading-snug">{target.name}</h4>
                      <p className="text-xs text-slate-400 mb-2 font-mono">{target.organization} • {target.contactDept}</p>
                      <p className="text-xs text-slate-300 line-clamp-2">{target.keyRelevance}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono text-[10px]">Deadline: {target.deadline}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget(target);
                          handleGeneratePitch(target);
                        }}
                        disabled={isGenerating && selectedTarget.id === target.id}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate Pitch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Target Configuration Panel */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 h-fit space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Outreach Configuration
            </h3>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="text-slate-400 font-mono">Selected Target:</div>
              <div className="text-white font-bold text-sm">{selectedTarget.name}</div>
              <div className="text-emerald-400 font-mono text-[11px]">{selectedTarget.pitchAngle}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Target Contact Email Address:</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Sender Representative Name / Title:</label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="generate-selected-pitch-btn"
              type="button"
              onClick={() => handleGeneratePitch()}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Gemini 3.6 Drafting Pitch Package...' : 'Auto-Draft Executive Pitch Package'}
            </button>
          </div>
        </div>
      )}

      {/* Main Tab 2: Generated Executive Pitch Deck & Proposal */}
      {activeTab === 'pitch' && generatedPitch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email & Proposal Draft */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Proposal Email Draft</span>
                  <h3 className="text-lg font-black text-white">{generatedPitch.emailSubject}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  To: {generatedPitch.targetEmailAddress}
                </span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed font-sans whitespace-pre-line">
                {generatedPitch.emailBody}
              </div>

              {/* Pitch Deck Slide Cards */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Attached Executive Pitch Deck (4 Slides)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedPitch.pitchDeckSlides.map((slide, idx) => (
                    <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-white text-xs">{slide.title}</h5>
                      </div>
                      <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                        {slide.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Automated Dispatch Actions */}
          <div className="space-y-4">
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Execute Automated Dispatch
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Clicking below sends this pitch presentation package directly via BlurBubble's server-side automated email & webhook API.
              </p>

              <button
                id="server-dispatch-pitch-btn"
                type="button"
                onClick={handleServerDispatch}
                disabled={isDispatching}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isDispatching ? 'animate-bounce' : ''}`} />
                {isDispatching ? 'Server Dispatching Presentation...' : 'Trigger Automated Server Dispatch'}
              </button>

              <div className="border-t border-slate-800/80 pt-3">
                <a
                  href={`mailto:${generatedPitch.targetEmailAddress}?subject=${encodeURIComponent(generatedPitch.emailSubject)}&body=${encodeURIComponent(generatedPitch.emailBody)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Open Direct Mail Client (Gmail / Mail)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Server Dispatch Confirmation */}
      {activeTab === 'dispatch' && dispatchResult && (
        <div className="bg-slate-950/90 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto space-y-6 glow-emerald">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Automated Transmission Success
              </span>
              <h3 className="text-xl font-black text-white">Presentation Dispatched to {dispatchResult.targetName}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Recipient: {dispatchResult.recipientEmail}</p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Dispatch ID:</span>
              <span className="text-emerald-400 font-bold">{dispatchResult.dispatchId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Transmission Method:</span>
              <span className="text-white font-bold">{dispatchResult.dispatchMethod}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Cryptographic Audit Token:</span>
              <span className="text-emerald-300 font-bold text-[11px]">{dispatchResult.cryptographicReceipt}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Delivery Status:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                {dispatchResult.status}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Audit Log Verified
            </div>
            <p className="text-slate-400 leading-relaxed">
              The proposal email and 4-slide executive presentation package detailing RFC-9402 compliance, BLE beacon opt-out handshakes, and optical censorship engines have been logged and queued.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('targets')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              Pitch Another Company
            </button>
          </div>
        </div>
      )}

      {/* Main Tab: Forum Scout & Community Responder */}
      {activeTab === 'forums' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Automated Forum, Community & Standards Scout
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Scans HackerNews, Reddit (/r/privacy, /r/smartglasses), X/Twitter, and IEEE discussions regarding wearable cameras. Generates authoritative RFC-9402 responses to advocate for bystander opt-out standards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleScoutForums}
              disabled={isScoutingForums}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isScoutingForums ? 'animate-spin' : ''}`} />
              {isScoutingForums ? 'Scouting Live Web...' : 'Rescout Community Forums'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forumDiscussions.map((disc) => (
              <div key={disc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                    {disc.platform}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    disc.userSentiment === 'concerned' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    disc.userSentiment === 'curious' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {disc.userSentiment}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{disc.threadTitle}</h4>
                <p className="text-xs text-slate-400 italic">"{disc.originalPostSummary}"</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Drafted RFC-9402 Reply:
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{disc.automatedRFCResponse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab: Directory & Platform Submissions */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Automated Directory &amp; Product Platform Submitter
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Generates complete, submission-ready product metadata, maker comments, screenshot captions, and REST API payloads for ProductHunt, AlternativeTo, GitHub Awesome Lists, and YC Startup School.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['ProductHunt', 'GitHub Awesome', 'AlternativeTo', 'YC Startup'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handleGenerateDirectoryListing(platform)}
                  disabled={isGeneratingListing}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDirectoryPlatform === platform
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {directoryListing && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-6 glow-amber">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Submission Package for {directoryListing.platformName}
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">{directoryListing.tagline}</h4>
                <p className="text-xs text-slate-400 mt-1">{directoryListing.shortDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white font-mono uppercase">Maker's First Comment:</div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">{directoryListing.makerComment}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white font-mono uppercase">Target SEO Keywords:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {directoryListing.targetKeywords?.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tab: Microcontroller Firmware & SDK Auto-Compiler */}
      {activeTab === 'firmware' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Automated C++ Hardware Firmware Generator
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Compiles physical C++ microcode for ESP32, Nordic nRF52, and Raspberry Pi Pico to turn cheap BLE microcontrollers into wearable BlurBubble RFC-9402 privacy beacons.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['ESP32-S3 BLE 5.0', 'Nordic nRF52840', 'Raspberry Pi Pico W'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSelectedChip(chip);
                    handleGenerateFirmware();
                  }}
                  disabled={isGeneratingFirmware}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChip === chip
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {generatedFirmware && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    Compiled Microcontroller Source
                  </span>
                  <h4 className="text-base font-black text-white">{generatedFirmware.hardwareChip} Firmware Code</h4>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Header Hash: {generatedFirmware.binaryHeaderHash}
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {generatedFirmware.firmwareCodeC}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-white mb-1">Flashing Instructions:</div>
                <p className="text-slate-400 font-mono">{generatedFirmware.flashInstructions}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
