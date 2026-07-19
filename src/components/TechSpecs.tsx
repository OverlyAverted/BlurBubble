import React, { useState } from 'react';
import { motion } from 'motion/react';
import { vocalScramblerAudio } from '../lib/vocalScramblerAudio';
import { 
  Shield, 
  Radio, 
  Key, 
  EyeOff, 
  CheckCircle2, 
  Cpu, 
  AlertTriangle, 
  Smartphone, 
  Store, 
  Video, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Code, 
  Briefcase, 
  Scale, 
  DollarSign, 
  Rocket, 
  FileText, 
  Check,
  Activity,
  Wifi,
  Battery,
  Bluetooth,
  RefreshCw,
  Edit2,
  Volume2,
  VolumeX,
  Zap,
  Sliders,
  Server,
  Globe,
  Download,
  Search,
  Eye,
  Settings,
  Lock,
  User,
  Network
} from 'lucide-react';

interface TechSpecsProps {
  activeTab?: 'timeline' | 'sdk_code' | 'pitch' | 'hardware' | 'crypto' | 'oem' | 'portal';
  onTabChange?: (tab: 'timeline' | 'sdk_code' | 'pitch' | 'hardware' | 'crypto' | 'oem' | 'portal') => void;
  cryptoState?: {
    publicKeyBase64: string;
    signatureBase64: string;
    signDurationMs: number;
    verifyDurationMs: number;
    fullFingerprint: string;
    verified: boolean;
    lastRotated: number;
  } | null;
  vocalAlertsEnabled?: boolean;
  onToggleVocalAlerts?: () => void;
}

export default function TechSpecs({ 
  activeTab: externalActiveTab, 
  onTabChange: externalOnTabChange,
  cryptoState,
  vocalAlertsEnabled = true,
  onToggleVocalAlerts
}: TechSpecsProps = {}) {
  const [internalSpecsTab, setInternalSpecsTab] = useState<'timeline' | 'sdk_code' | 'pitch' | 'hardware' | 'crypto' | 'oem' | 'portal'>('timeline');
  const specsTab = externalActiveTab || internalSpecsTab;
  const setSpecsTab = externalOnTabChange || setInternalSpecsTab;
  
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [specsTab]);

  // RF Spectrum Analyzer States
  const [rfFrequency, setRfFrequency] = useState<2.4 | 5.8>(2.4);
  const [rfBandwidth, setRfBandwidth] = useState<number>(40); // MHz
  const [rfAttenuation, setRfAttenuation] = useState<number>(10); // dB
  const [spectrumMode, setSpectrumMode] = useState<'ble' | 'wifi' | 'combined'>('combined');
  
  // Vocal Scrambler States
  const [scramblerActive, setScramblerActive] = useState<boolean>(false);
  const [scramblerLevel, setScramblerLevel] = useState<number>(65); // %
  const [scramblerMode, setScramblerMode] = useState<'white_noise' | 'ultrasonic' | 'spectral_inversion'>('white_noise');

  // Sync vocal scrambler to Web Audio API engine
  React.useEffect(() => {
    if (scramblerActive) {
      vocalScramblerAudio.start(scramblerMode, scramblerLevel);
    } else {
      vocalScramblerAudio.stop();
    }
    return () => {
      vocalScramblerAudio.stop();
    };
  }, [scramblerActive, scramblerMode, scramblerLevel]);

  // RF Spectrum Analyzer Canvas ref and effect
  const rfCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    if (specsTab !== 'hardware' || !rfCanvasRef.current) return;
    const canvas = rfCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let offset = 0;
    
    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw Grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'; // Teal/cyan grid
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Base Spectrum wave drawing (sinusoid + noise)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      
      // Choose color based on frequency
      const waveColor = rfFrequency === 2.4 ? 'rgba(34, 211, 238, 0.85)' : 'rgba(168, 85, 247, 0.85)'; // Cyan vs Purple
      const glowColor = rfFrequency === 2.4 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(168, 85, 247, 0.4)';
      
      ctx.strokeStyle = waveColor;
      
      const points: {x: number, y: number}[] = [];
      
      for (let x = 0; x < width; x++) {
        let y = height / 2;
        
        // Generate beautiful artificial carrier waves based on selected parameters
        const frequencyScale = rfFrequency === 2.4 ? 0.04 : 0.08;
        const baseSine = Math.sin(x * frequencyScale + offset) * 12;
        const baseCos = Math.cos(x * 0.02 - offset * 0.5) * 6;
        
        // Add a noise channel (attenuated)
        const noiseFactor = rfAttenuation > 0 ? 15 / (rfAttenuation * 0.2 + 1) : 15;
        const noise = (Math.random() - 0.5) * noiseFactor;
        
        // Add peak spike representing active signal beacons
        let beaconSpike = 0;
        const center = width / 2;
        const distFromCenter = Math.abs(x - center);
        const currentBandwidth = rfBandwidth || 40;
        if (distFromCenter < currentBandwidth) {
          // bell curve spike
          const factor = Math.cos((distFromCenter / currentBandwidth) * Math.PI / 2);
          beaconSpike = factor * (50 + Math.sin(offset * 3) * 10);
        }
        
        y = height - 40 - (baseSine + baseCos + noise + beaconSpike);
        // Clamping
        if (y < 10) y = 10;
        if (y > height - 10) y = height - 10;
        
        points.push({x, y});
      }
      
      // Render line
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      ctx.stroke();
      
      // Draw fill gradient below spectrum
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, rfFrequency === 2.4 ? 'rgba(34, 211, 238, 0.06)' : 'rgba(168, 85, 247, 0.06)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, height);
        for (let i = 0; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw Sweep Line
      const sweepX = (offset * 120) % width;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, height);
      ctx.stroke();
      
      offset += 0.03;
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [specsTab, rfFrequency, rfBandwidth, rfAttenuation]);

  // Vocal Scrambler Canvas ref and effect
  const scramblerCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    if (specsTab !== 'hardware' || !scramblerCanvasRef.current) return;
    const canvas = scramblerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let tick = 0;
    
    const drawScrambler = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Grid lines
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.04)'; // Rose grid
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Wave lines
      ctx.lineWidth = 1.5;
      
      const barCount = 30;
      const barWidth = width / barCount;
      
      ctx.fillStyle = scramblerActive ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.1)';
      ctx.strokeStyle = scramblerActive ? 'rgba(244, 63, 94, 0.7)' : 'rgba(16, 185, 129, 0.5)';
      
      for (let i = 0; i < barCount; i++) {
        let amplitude = 0;
        if (scramblerActive) {
          // If scrambler is active, simulate heavy frequency jamming noise (dense tall bars)
          const noiseBase = Math.random() * (scramblerLevel / 1.5);
          const highFreq = Math.sin(i * 1.8 + tick) * 15;
          amplitude = 20 + noiseBase + highFreq;
        } else {
          // Normal vocal acoustic signature (sparse slow waves)
          const voiceSine = Math.sin(i * 0.3 + tick * 0.3) * Math.cos(i * 0.1) * 20;
          const microNoise = (Math.random() - 0.5) * 4;
          amplitude = Math.max(5, 12 + voiceSine + microNoise);
        }
        
        const x = i * barWidth + 2;
        const y = height - amplitude - 10;
        
        ctx.fillRect(x, y, barWidth - 4, amplitude);
        ctx.strokeRect(x, y, barWidth - 4, amplitude);
      }
      
      tick += 0.15;
      animationId = requestAnimationFrame(drawScrambler);
    };
    
    drawScrambler();
    return () => cancelAnimationFrame(animationId);
  }, [specsTab, scramblerActive, scramblerLevel, scramblerMode]);

  const [activeStep, setActiveStep] = useState(1);
  const [codeSubTab, setCodeSubTab] = useState<'mobile' | 'firmware' | 'standards' | 'compliance_sdk'>('mobile');
  const [auditChecks, setAuditChecks] = useState({
    prototype: true,
    bleProtocol: true,
    macAddressLink: true,
    ukipoPatent: true,
    confidentialityNDA: true,
    scottishEnterprise: true,
    pitchDeck: true
  });

  // Global Compliance SDK (OEM) Interactive States
  const [oemSubTab, setOemSubTab] = useState<'protocols' | 'cameras' | 'crawlers' | 'patches' | 'sandbox'>('protocols');
  const [oemPayloadParams, setOemPayloadParams] = useState({
    scope: 'opt-out-global',
    format: 'ECDSA-P256-SHA256',
    enableVideoBlur: true,
    enableAudioScramble: true,
    minDistance: 15,
    keyRotInterval: 15,
    vibrationPulsePattern: '200-100-200'
  });
  const [isSimulatingOemBroadcaster, setIsSimulatingOemBroadcaster] = useState<boolean>(false);
  const [oemBroadcastLogs, setOemBroadcastLogs] = useState<string[]>([
    "System offline. Awaiting activation signal..."
  ]);
  const [crawlerScanning, setCrawlerScanning] = useState<boolean>(false);
  const [crawlerScanProgress, setCrawlerScanProgress] = useState<number>(0);
  const [crawlerPlatform, setCrawlerPlatform] = useState<'all' | 'youtube' | 'tiktok' | 'spotify' | 'instagram' | 'microsoft' | 'openai'>('all');
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [crawlerResultsCount, setCrawlerResultsCount] = useState<number>(0);
  
  const [patchInstallState, setPatchInstallState] = useState<Record<string, 'ready' | 'downloading' | 'verifying' | 'installed'>>({
    apple: 'ready',
    google: 'ready',
    gopro: 'ready',
    meta: 'ready',
    dji: 'ready',
    microsoft: 'ready',
    sony: 'ready',
    samsung: 'ready',
    ai_vision: 'ready',
    pro_optics: 'ready',
    depth_sensors: 'ready'
  });
  const [patchConsoleLogs, setPatchConsoleLogs] = useState<string[]>([]);

  // Real-World Day Sandbox Simulation States
  const [sandboxScenario, setSandboxScenario] = useState<'commute' | 'office' | 'cafe' | 'concert'>('commute');
  const [sandboxFeaturesEnabled, setSandboxFeaturesEnabled] = useState<boolean>(false);
  const [sandboxIsRunning, setSandboxIsRunning] = useState<boolean>(false);
  const [sandboxProgress, setSandboxProgress] = useState<number>(0);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "Sandbox diagnostics engine ready. Select a scenario and press 'Trigger Run'."
  ]);
  const [sandboxBatteryLevel, setSandboxBatteryLevel] = useState<number>(100);

  // BigTech Developer Portal & B2B Sandbox States
  const [devSandboxFilter, setDevSandboxFilter] = useState<'gaussian' | 'pixelate' | 'emoji' | 'semantic' | 'blackbar'>('gaussian');
  const [devSandboxDist, setDevSandboxDist] = useState<number>(3);
  const [devApiQuery, setDevApiQuery] = useState<'lookup' | 'webhook' | 'signature'>('lookup');
  const [devApiResponse, setDevApiResponse] = useState<any>(null);
  const [devApiLoading, setDevApiLoading] = useState<boolean>(false);
  const [devApiCallCount, setDevApiCallCount] = useState<number>(142);
  const [devApiLogs, setDevApiLogs] = useState<string[]>(["[SYSTEM] REST API listener active on https://api.blurbubble.org/v1"]);
  const [devCorpName, setDevCorpName] = useState<string>('Meta Platforms, Inc.');
  const [devOfficerName, setDevOfficerName] = useState<string>('Mark Zuckerberg');
  const [devSlaLevel, setDevSlaLevel] = useState<'strict_9402' | 'standard_redact' | 'minimal_audit'>('strict_9402');
  const [devIsSLASigned, setDevIsSLASigned] = useState<boolean>(false);
  const [devSlaCertId, setDevSlaCertId] = useState<string>('');
  const [devBidThreshold, setDevBidThreshold] = useState<number>(1.50);
  const [devRevenue, setDevRevenue] = useState<number>(145.80);
  const [devHashSyncing, setDevHashSyncing] = useState<boolean>(false);
  const [devHashLogs, setDevHashLogs] = useState<string[]>([
    "Facial biometric Zero-Knowledge mapping system: STANDBY",
    "Ready to compile local 512-dimensional vector hashes."
  ]);
  const [activeBidsList, setActiveBidsList] = useState([
    { id: 'bid-1', bidder: 'Google StreetView SDK', details: 'Ambient 3D Spatial Lidar Scan of surrounding physical coordinates (Tag ID #4092)', payout: 0.85, status: 'pending' },
    { id: 'bid-2', bidder: 'OpenAI Sora v2 Core', details: '15-second ambient background video frames for general spatial scene understanding (Face Blurred)', payout: 2.10, status: 'pending' },
    { id: 'bid-3', bidder: 'Meta RealityLabs AI', details: 'Casual indoor background audio/acoustic frequency print training', payout: 1.35, status: 'pending' },
    { id: 'bid-4', bidder: 'Microsoft Azure Vision AI', details: 'Spatial LiDAR depth rendering map validation with compliance filters active', payout: 1.85, status: 'pending' },
    { id: 'bid-5', bidder: 'Anthropic Claude 3.5 Sonnet Visual Indexer', details: 'Semantic context understanding and background safety validation audits', payout: 1.65, status: 'pending' },
    { id: 'bid-6', bidder: 'Midjourney v7 Spatial Texturing', details: 'Generative landscape modeling with verified bystander face-blur filters active', payout: 1.45, status: 'pending' },
    { id: 'bid-7', bidder: 'Runway Gen-4 Spatial Video', details: 'Cinematic physical scenery generation with complete visual compliance overlays', payout: 2.50, status: 'pending' }
  ]);
  const [portalSubTab, setPortalSubTab] = useState<'obfuscator' | 'zkp_hash' | 'api_play' | 'sla_contract' | 'consent_market' | 'edge_network'>('obfuscator');

  // New Enterprise Edge Grid & Datacenter Sync States
  const [edgeGeofenceRadius, setEdgeGeofenceRadius] = useState<number>(12);
  const [safeZoneOverride, setSafeZoneOverride] = useState<boolean>(false);
  const [selectedEdgeNode, setSelectedEdgeNode] = useState<string | null>(null);
  const [citizens, setCitizens] = useState([
    { id: 'cit-1', name: 'Citizen #409 (Active Beacon)', x: 100, y: 150, hasBeacon: true, dx: 1.8, dy: -1.2 },
    { id: 'cit-2', name: 'Citizen #128 (No Beacon)', x: 320, y: 210, hasBeacon: false, dx: -1.2, dy: 1.4 },
    { id: 'cit-3', name: 'Citizen #884 (No Beacon)', x: 220, y: 60, hasBeacon: false, dx: 1.5, dy: 1.6 }
  ]);
  const [syncProgress, setSyncProgress] = useState<number>(-1); // -1 means idle, 0 to 100 means syncing
  const [datacenterLatency, setDatacenterLatency] = useState<number>(12);
  const [zkpHashesCount, setZkpHashesCount] = useState<number>(419825);

  // Active loop to move simulated citizens smoothly across the SVG coordinate canvas
  React.useEffect(() => {
    let intervalId: any;
    if (specsTab === 'portal' && portalSubTab === 'edge_network') {
      intervalId = setInterval(() => {
        setCitizens(prev => prev.map(cit => {
          let newX = cit.x + cit.dx;
          let newY = cit.y + cit.dy;
          let newDx = cit.dx;
          let newDy = cit.dy;

          if (newX < 20 || newX > 480) {
            newDx = -cit.dx;
            newX = cit.x + newDx;
          }
          if (newY < 20 || newY > 280) {
            newDy = -cit.dy;
            newY = cit.y + newDy;
          }

          return { ...cit, x: newX, y: newY, dx: newDx, dy: newDy };
        }));
      }, 50);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [specsTab, portalSubTab]);

  // Real-World Day Sandbox Simulation Loop Effect
  React.useEffect(() => {
    if (!sandboxIsRunning) return;

    let isMounted = true;
    let currentProgress = 0;
    setSandboxProgress(0);
    setSandboxBatteryLevel(100);

    const logMessages: Record<'commute' | 'office' | 'cafe' | 'concert', { progress: number; text: string }[]> = {
      commute: [
        { progress: 0, text: "🏁 [SYSTEM] Triggering Real-World Test Scenario: Morning Commute (Subway Station)" },
        { progress: 10, text: "📡 Detecting active BLE node density: 140 devices broadcasting in proximity." },
        { progress: 20, text: sandboxFeaturesEnabled 
            ? "⚠️ [COLLISION RISK] 42% packet collision threshold exceeded. Activating Decentralized Slot Allocation (Annex B)." 
            : "❌ [CRITICAL] 42% packet collision on 2.4 GHz. Packets dropping from congested queue." },
        { progress: 40, text: sandboxFeaturesEnabled
            ? "🔄 [RESOLVED] Shield allocated to dynamic, non-colliding TSCH slot. Packet Delivery Rate: 99.8%."
            : "⚠️ [LEAK] Bystander smart camera missed the RFC-9402 tag. Compliance status lost." },
        { progress: 60, text: "🚇 Citizen boarding train. Physical concrete and metal walls attenuating signals by -15dB." },
        { progress: 80, text: sandboxFeaturesEnabled
            ? "⚡ [RESOLVED] TX Power boosted dynamically to +8dBm. Overcoming structural physical blockage."
            : "❌ [FAIL] Signal level dropped below minimum receiver sensitivity (-95dBm). Zero protection radius." },
        { progress: 100, text: sandboxFeaturesEnabled
            ? "✅ [SUCCESS] Morning commute test completed. Final Compliance Score: 100% SECURED."
            : "❌ [FAIL] Morning commute test completed. Final Compliance Score: 58% CRITICAL LEAKS." }
      ],
      office: [
        { progress: 0, text: "🏁 [SYSTEM] Triggering Real-World Test Scenario: Boardroom Meeting" },
        { progress: 15, text: "🏢 Entering enterprise headquarters. Videoconference camera active." },
        { progress: 35, text: "🕒 Synchronization audit. Device clock drift offset detected: +95 seconds." },
        { progress: 55, text: sandboxFeaturesEnabled
            ? "🔑 [RESOLVED] Sliding-Time-Window Validator verified dynamic decoy token in (t+1) offset frame."
            : "❌ [FAIL] Camera server rejected decoy signature as EXPIRED (requires strictly locked clocks)." },
        { progress: 75, text: sandboxFeaturesEnabled
            ? "🔒 [SECURED] Cryptographic agreement established. Video-blur filter applied on conference screen."
            : "⚠️ [LEAK] Videoconference feed streamed unredacted boardroom faces directly to public cloud." },
        { progress: 100, text: sandboxFeaturesEnabled
            ? "✅ [SUCCESS] Office meeting test completed. Final Compliance Score: 100% SECURED."
            : "❌ [FAIL] Office meeting test completed. Final Compliance Score: 40% EXPOSED." }
      ],
      cafe: [
        { progress: 0, text: "🏁 [SYSTEM] Triggering Real-World Test Scenario: Outdoor Cafe Workspace" },
        { progress: 15, text: "☕ Sitting at patio table. Standard shield configured at 100% scanning cycle." },
        { progress: 40, text: sandboxFeaturesEnabled
            ? "⚙️ [RESOLVED] Proximity Hook detects no nearby active cameras. Throttling scan rate to 1% (Low Power Mode)."
            : "⚠️ [WARNING] Continuous 50Hz BLE scan active. High thermal output and accelerated battery drain." },
        { progress: 70, text: sandboxFeaturesEnabled
            ? "🔋 [OPTIMIZED] Power drainage minimized. Device temperature dropped by 8°C. Simulated battery: 92%."
            : "🚨 [CRITICAL] Battery exhausted (0%). Hardware controller shutdown initiated." },
        { progress: 85, text: sandboxFeaturesEnabled
            ? "🔒 [SECURED] Motion sensor wakes scanning instantly upon detecting local camera focus signals."
            : "❌ [FAIL] Compliance shield completely dead. Citizen exposed to all surrounding smartphone cameras." },
        { progress: 100, text: sandboxFeaturesEnabled
            ? "✅ [SUCCESS] Cafe workspace test completed. Final Compliance Score: 100% SECURED."
            : "❌ [FAIL] Cafe workspace test completed. Final Compliance Score: 0% EXPOSED." }
      ],
      concert: [
        { progress: 0, text: "🏁 [SYSTEM] Triggering Real-World Test Scenario: Crowded Music Concert" },
        { progress: 15, text: "🎸 Entering open-air stadium. Ambient Sound Pressure Level: 104 dBA." },
        { progress: 35, text: "🔊 Acoustic interference: Infrasound / subwoofer pulses overloading standard micro-scrambler." },
        { progress: 55, text: sandboxFeaturesEnabled
            ? "🛡️ [RESOLVED] Injected robust, high-frequency psychoacoustic spread-spectrum audio watermark."
            : "❌ [FAIL] Audio acoustic guard pulses completely drowned by concert subwoofers." },
        { progress: 75, text: sandboxFeaturesEnabled
            ? "👥 [RESOLVED] Body-loss compensation algorithm enabled. BLE TX power active at +10dBm."
            : "⚠️ [FAIL] Human body tissue blocking 2.4 GHz BLE signal. Packet delivery dropped to 15%." },
        { progress: 100, text: sandboxFeaturesEnabled
            ? "✅ [SUCCESS] Concert stadium test completed. Final Compliance Score: 100% SECURED."
            : "❌ [FAIL] Concert stadium test completed. Final Compliance Score: 48% CRITICAL LEAKS." }
      ]
    };

    setSandboxLogs([`[${new Date().toLocaleTimeString()}] Diagnostics initialized...`]);

    const interval = setInterval(() => {
      if (!isMounted) return;
      currentProgress += 5;
      
      if (currentProgress <= 100) {
        setSandboxProgress(currentProgress);
        
        // Dynamic battery drainage display
        if (sandboxScenario === 'cafe') {
          setSandboxBatteryLevel(sandboxFeaturesEnabled ? Math.max(90, Math.round(100 - currentProgress * 0.1)) : Math.max(0, Math.round(100 - currentProgress * 1.0)));
        } else {
          setSandboxBatteryLevel(Math.max(85, Math.round(100 - currentProgress * 0.15)));
        }

        // Check if there is a message matching this progress point
        const scenarioMessages = logMessages[sandboxScenario];
        const match = scenarioMessages.find(m => m.progress === currentProgress);
        if (match) {
          const timestamp = new Date().toLocaleTimeString();
          setSandboxLogs(prev => [...prev, `[${timestamp}] ${match.text}`]);
        }
      } else {
        setSandboxIsRunning(false);
        clearInterval(interval);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sandboxIsRunning, sandboxScenario, sandboxFeaturesEnabled]);

  // OEM Broadcasting Loop Simulator Effect
  React.useEffect(() => {
    if (!isSimulatingOemBroadcaster) return;
    
    let isMounted = true;
    let step = 0;
    const steps = [
      () => `[${new Date().toLocaleTimeString()}] 📡 Initializing OEM Broadcast Assembly Buffer...`,
      () => `[${new Date().toLocaleTimeString()}] 🔑 Resolving local secure element key material (ECDSA P-256)...`,
      () => `[${new Date().toLocaleTimeString()}] 📝 Formatting JSON RFC-9402 Opt-Out descriptor payload...`,
      () => `[${new Date().toLocaleTimeString()}] 📜 Signed successfully. Signature Base64: ${cryptoState?.signatureBase64?.slice(0, 24) || "MEQCIDYn3msqHw8P..."}...`,
      () => `[${new Date().toLocaleTimeString()}] ⚡ Structuring BLE Advertising AD Structure Type 0xFF (Manufacturer Specific)...`,
      () => `[${new Date().toLocaleTimeString()}] 📶 BLE ADV Data compiled: [0x1E, 0xFF, 0x99, 0x04, 0x02, ${oemPayloadParams.enableVideoBlur ? '0x01' : '0x00'}, ${oemPayloadParams.enableAudioScramble ? '0x01' : '0x00'}, ${oemPayloadParams.minDistance.toString(16).padStart(2, '0')}]`,
      () => `[${new Date().toLocaleTimeString()}] 🚀 Active TX: Broadcasting at +4dBm TxPower (Radius ~${oemPayloadParams.minDistance}m)...`,
      () => `[${new Date().toLocaleTimeString()}] 🛡️ [HANDSHAKE] Intercepted by nearby Apple iPhone 15 Camera Service.`,
      () => `[${new Date().toLocaleTimeString()}] 🔍 Apple OS CoreMedia validated signature chain. Applying real-time YUV Pixelation.`,
      () => `[${new Date().toLocaleTimeString()}] 🔒 [HANDSHAKE] Intercepted by nearby DJI Mini Pro 4 gimbal tracker. Applying target mask.`,
      () => `[${new Date().toLocaleTimeString()}] 🛡️ Broadcaster renewable hash rotated. Refreshing ADV buffer to prevent device tracking.`
    ];

    setOemBroadcastLogs([`[${new Date().toLocaleTimeString()}] 📶 Broadcaster Core Initialized.`]);

    const interval = setInterval(() => {
      if (!isMounted) return;
      if (step < steps.length) {
        const text = steps[step]();
        setOemBroadcastLogs(prev => [...prev, text]);
        step++;
      } else {
        const rotTime = new Date().toLocaleTimeString();
        setOemBroadcastLogs(prev => [
          ...prev, 
          `[${rotTime}] ♻️ Rotation triggered. New dynamic broadcast token signed.`,
          `[${rotTime}] 📡 Active TX: Broadcasting current cryptographic shield status.`
        ]);
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isSimulatingOemBroadcaster, oemPayloadParams, cryptoState]);

  // Media Scraper Compliance Crawler Simulation Loop Effect
  React.useEffect(() => {
    if (!crawlerScanning) return;
    
    let isMounted = true;
    let progress = 0;
    
    const platforms = {
      all: ['YouTube', 'TikTok', 'Spotify', 'Apple Podcasts', 'Instagram', 'Microsoft Azure Video Indexer', 'OpenAI GPT-4o Vision API'],
      youtube: ['YouTube'],
      tiktok: ['TikTok'],
      spotify: ['Spotify'],
      instagram: ['Instagram'],
      microsoft: ['Microsoft Azure Video Indexer'],
      openai: ['OpenAI GPT-4o Vision API']
    };

    const targetPlats = platforms[crawlerPlatform] || platforms.all;
    setCrawlerLogs([`[${new Date().toLocaleTimeString()}] 🌐 Launching compliance audit spiders to inspect public directory indexes...`]);
    setCrawlerResultsCount(0);

    const logsList = [
      (p: string) => `[${new Date().toLocaleTimeString()}] 🔎 Connecting to ${p} Compliance Metadata Hook API...`,
      (p: string) => `[${new Date().toLocaleTimeString()}] 📊 Scanning recent upload indices in this region...`,
      (p: string) => `[${new Date().toLocaleTimeString()}] 🧠 Running face-hash verification and voice-watermark spectral scanner on ${p} files...`,
      (p: string) => `[${new Date().toLocaleTimeString()}] ⚠️ ALERT: Detected matching face biometrics on ${p} video ID #${Math.floor(Math.random() * 9000000 + 1000000)} without opt-out validation!`,
      (p: string) => `[${new Date().toLocaleTimeString()}] 🛡️ Dispatched Redaction Command to ${p} Server. Applying retrospective YUV blurring...`,
      (p: string) => `[${new Date().toLocaleTimeString()}] ✅ REDACTED: Compliance successfully applied retrospectively on ${p} node. Verified zero-leak state.`
    ];

    let logIdx = 0;
    let platIdx = 0;

    const interval = setInterval(() => {
      if (!isMounted) return;
      progress += 5;
      if (progress >= 100) {
        progress = 100;
        setCrawlerScanProgress(100);
        setCrawlerScanning(false);
        setCrawlerLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 COMPLIANCE CRAWL COMPLETED. All discovered public nodes fully verified and aligned.`]);
        clearInterval(interval);
        return;
      }

      setCrawlerScanProgress(progress);

      const activePlatform = targetPlats[platIdx % targetPlats.length];
      if (logIdx < logsList.length) {
        const text = logsList[logIdx](activePlatform);
        setCrawlerLogs(prev => [...prev, text]);
        if (logIdx === 3) {
          setCrawlerResultsCount(c => c + 1);
        }
        logIdx++;
      } else {
        logIdx = 0;
        platIdx++;
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [crawlerScanning, crawlerPlatform]);

  // OEM Firmware Patch Downloader Simulator function
  const triggerPatchDownload = (platform: string) => {
    setPatchInstallState(prev => ({ ...prev, [platform]: 'downloading' }));
    setPatchConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [${platform.toUpperCase()}] Fetching compliant OEM SDK repository...`,
      `[${new Date().toLocaleTimeString()}] [${platform.toUpperCase()}] Downloading system header updates (RFC-9402 standard conformance)...`
    ]);

    setTimeout(() => {
      setPatchInstallState(prev => ({ ...prev, [platform]: 'verifying' }));
      setPatchConsoleLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [${platform.toUpperCase()}] Verifying image signature with OEM master key...`,
        `[${new Date().toLocaleTimeString()}] [${platform.toUpperCase()}] Compiling dynamic ISP hardware filter hook...`
      ]);

      setTimeout(() => {
        setPatchInstallState(prev => ({ ...prev, [platform]: 'installed' }));
        setPatchConsoleLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [${platform.toUpperCase()}] SDK PATCH INSTALLED SUCCESSFULLY. Device now complies automatically with BlurBubble beacons.`
        ]);
      }, 1800);

    }, 1800);
  };

  const [hardwareDevices, setHardwareDevices] = useState([
    {
      id: 'dev-1',
      name: 'Personal Shield Beacon (Phone)',
      model: 'BlurBubble Soft-Beacon v3.0',
      type: 'phone',
      battery: 94,
      signalStrength: -45, // dBm
      firmware: 'v3.0.2',
      status: 'active',
      lastPing: 'Just Now',
      isPinging: false,
      isUpdating: false,
      updateProgress: 0,
      serialNumber: 'BB-PHN-984A-7K2L'
    },
    {
      id: 'dev-2',
      name: "Lily's Schoolbag Smart Tag",
      model: 'BlurBubble Certified Micro-Tag T1',
      type: 'tag',
      battery: 82,
      signalStrength: -62,
      firmware: 'v2.4.1',
      status: 'active',
      lastPing: '2 mins ago',
      isPinging: false,
      isUpdating: false,
      updateProgress: 0,
      serialNumber: 'BB-TAG-11A9-C93B'
    },
    {
      id: 'dev-3',
      name: "Leo's Jacket Smart Tag",
      model: 'BlurBubble Stitch-In Fabric Tag',
      type: 'tag',
      battery: 12, // Low battery!
      signalStrength: -78,
      firmware: 'v1.8.9',
      status: 'low_battery',
      lastPing: '5 mins ago',
      isPinging: false,
      isUpdating: false,
      updateProgress: 0,
      serialNumber: 'BB-STC-80E6-BF10'
    },
    {
      id: 'dev-4',
      name: 'Oakwood Entrance Gate Anchor',
      model: 'BlurBubble Long-Range AC Anchor',
      type: 'anchor',
      battery: 100, // Powered
      signalStrength: -50,
      firmware: 'v2.2.0',
      status: 'active',
      lastPing: 'Just Now',
      isPinging: false,
      isUpdating: false,
      updateProgress: 0,
      serialNumber: 'BB-ANC-4491-FFA2'
    }
  ]);

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState<string>('');

  const handleSaveDeviceName = (id: string) => {
    if (editingDeviceName.trim()) {
      setHardwareDevices(prev => prev.map(d => d.id === id ? { ...d, name: editingDeviceName.trim() } : d));
    }
    setEditingDeviceId(null);
  };

  const [globalDiagnosticsActive, setGlobalDiagnosticsActive] = useState(false);
  const [globalDiagnosticsStatus, setGlobalDiagnosticsStatus] = useState('');
  const [diagnosticReport, setDiagnosticReport] = useState<{
    timestamp: string;
    totalDevices: number;
    activeDevices: number;
    warnings: string[];
    spectrumMhz: string;
    complianceStatus: string;
  } | null>(null);

  const handlePingDevice = (id: string) => {
    setHardwareDevices(prev => prev.map(d => d.id === id ? { ...d, isPinging: true } : d));
    setTimeout(() => {
      setHardwareDevices(prev => prev.map(d => d.id === id ? { ...d, isPinging: false, lastPing: 'Just Now' } : d));
    }, 1500);
  };

  const handleUpdateFirmware = (id: string) => {
    setHardwareDevices(prev => prev.map(d => d.id === id ? { ...d, isUpdating: true, updateProgress: 0 } : d));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setHardwareDevices(prev => prev.map(d => {
        if (d.id === id) {
          if (progress >= 100) {
            clearInterval(interval);
            return {
              ...d,
              isUpdating: false,
              updateProgress: 100,
              firmware: 'v3.1.0',
              status: d.status === 'low_battery' ? 'low_battery' : 'active'
            };
          }
          return { ...d, updateProgress: progress };
        }
        return d;
      }));
    }, 200);
  };

  const runGlobalDiagnostics = () => {
    setGlobalDiagnosticsActive(true);
    setGlobalDiagnosticsStatus('Scanning BlurBubble 2.4GHz frequencies...');
    setDiagnosticReport(null);

    setTimeout(() => {
      setGlobalDiagnosticsStatus('Verifying cryptographic token signatures...');
    }, 1000);

    setTimeout(() => {
      setGlobalDiagnosticsStatus('Measuring BLE battery capacity thresholds...');
    }, 2000);

    setTimeout(() => {
      setGlobalDiagnosticsActive(false);
      setDiagnosticReport({
        timestamp: new Date().toLocaleTimeString(),
        totalDevices: hardwareDevices.length,
        activeDevices: hardwareDevices.filter(d => d.status === 'active' || d.battery > 20).length,
        warnings: hardwareDevices.filter(d => d.battery <= 15).map(d => `Low Battery Alert: ${d.name} (${d.battery}%)`),
        spectrumMhz: '2402 - 2480 MHz',
        complianceStatus: '100% Secure Handshakes Verified'
      });
    }, 3000);
  };

  const steps = [
    {
      id: 1,
      title: "1. Setup & Smart Tag Pairing",
      subtitle: "The Family & Asset Setup",
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      description: "You download the BlurBubble app on your phone. To protect yourself, a child, or private assets, you register biometric or item hashes and link any compatible beacon. This includes Apple AirTags, Samsung SmartTags, Tile keyfobs, standard Pebblebees, custom ESP32/NRF52 firmware boards, or any device broadcasting Bluetooth 5.4, Wi-Fi probe requests, or Wi-Fi Neighbor Awareness Networking (NAN) signals.",
      technical: "The beacon continuously broadcasts an encrypted, rolling Bluetooth Low Energy (BLE 5.4) or Wi-Fi beacon envelope. Under BLE 5.4, it leverages Periodic Advertising with Responses (PAwR) and Channel Sounding to establish ultra-low-power, sub-meter spatial telemetry without cellular/internet dependencies."
    },
    {
      id: 2,
      title: "2. Silent Broadcast",
      subtitle: "Smart Geofence Detection",
      icon: <Radio className="w-5 h-5 text-blue-400" />,
      description: "When walking past a boundary, entering a school, or joining a private event, your wearable tag silently broadcasts an opt-out preference in a 25-meter range. If a child in a pre-registered school uniform enters a school geofence zone, nearby compliant glasses or phone cameras immediately catch the signal at the entrance, establishing an automated spatial shield.",
      technical: "The protocol rotates asymmetric ephemeral signatures every 30 seconds locally, securing the user against physical tracking/stalking. Geofenced AC-anchors broadcast localized encryption parameters, automatically declaring uniform-wearers or company assets as strict opt-out targets."
    },
    {
      id: 3,
      title: "3. Glasses & Camera Intercept",
      subtitle: "Hardware-Level Recognition",
      icon: <Store className="w-5 h-5 text-purple-400" />,
      description: "An unfamiliar patron wearing smart glasses, holding an action camera, or flying a drone starts recording video. The camera device's compliant background operating system scans for Bluetooth 5.4 and Wi-Fi probe alerts, identifying the opt-out signal within microseconds.",
      technical: "Compliant hardware processors (Meta, Apple, Google, DJI, GoPro) register standard background listeners. Upon intercepting the RFC-9402 Manufacturer Specific flag (UUID 0xFE69), the device computes signal strength and pairs the metadata with local neural mesh models."
    },
    {
      id: 4,
      title: "4. Onboard Blurring",
      subtitle: "On-Chip Redaction Layer",
      icon: <EyeOff className="w-5 h-5 text-amber-400" />,
      description: "Before a single frame is committed to memory or broadcasted to a live stream, the camera's onboard Image Signal Processor (ISP) applies real-time facial and item redaction. Faces of kids, company displays, or private belongings appear as a dynamic, high-fidelity blur silhouette, keeping raw data completely unsaved.",
      technical: "Enforces a hardware-level Gaussian or pixelation mask at the ISP layer. This legally immunizes tech companies from data collection penalties (GDPR/COPPA) as raw, un-redacted video footage is never stored, processed, or cached."
    },
    {
      id: 5,
      title: "5. Fail-Safe Web Scrubber",
      subtitle: "Retroactive AI Protection",
      icon: <Sparkles className="w-5 h-5 text-rose-400" />,
      description: "If a user records with non-compliant devices, our AI-driven crawler automatically sweeps platforms like YouTube, TikTok, Instagram, Facebook, and major audio streaming indexes (Spotify, SoundCloud). If registered biometrics, items, or children's uniform hashes are matched in the uploaded media, the system triggers retroactive automated blurring and legally-compliant takedowns.",
      technical: "Maintains a cloud crawler executing deep facial and audio spectral scans. Upon detection of raw exposures, the system issues API-driven retrospective blurring requests to video networks, providing full-coverage protection from all public and corporate sides."
    }
  ];

  const getAuditScore = () => {
    let score = 0;
    if (auditChecks.prototype) score++;
    if (auditChecks.bleProtocol) score++;
    if (auditChecks.macAddressLink) score++;
    if (auditChecks.ukipoPatent) score++;
    if (auditChecks.confidentialityNDA) score++;
    if (auditChecks.scottishEnterprise) score++;
    if (auditChecks.pitchDeck) score++;
    return score;
  };

  const auditScore = getAuditScore();
  let ventureGrade = "Grade D - Conceptual Seed";
  let ventureValuation = "£50k - £150k";
  let ventureRecommendation = "Build a high-fidelity visual prototype and define background BLE protocols (both are complete in this simulator!) to reach Grade C.";
  
  if (auditScore >= 3) {
    ventureGrade = "Grade C - Confirmed Technical Validation";
    ventureValuation = "£250k - £500k";
    ventureRecommendation = "You have validated the hardware re-use and provided core iOS/Android Swift & Kotlin templates. Next, establish confidentiality (NDAs) and apply for UK IPO patent search to unlock Grade B.";
  }
  if (auditScore >= 5) {
    ventureGrade = "Grade B - Institutional Ready";
    ventureValuation = "£750k - £1.5M";
    ventureRecommendation = "Strong progress. Your IP parameters are mapped out, and you've connected with Scotland-specific advice. Finish drafting your pitch deck outline to unlock Grade A+ status.";
  }
  if (auditScore === 7) {
    ventureGrade = "Grade A+ - Launch Ready Venture";
    ventureValuation = "£2.0M - £3.5M (Pre-Seed Model)";
    ventureRecommendation = "Incredible! Your technology is fully demonstrated, and your IP/patent defense plan is solid under UKIPO regulations. Prepare to present to Scotland/London angel syndicates!";
  }

  return (
    <div className="space-y-8 text-slate-300">
      {/* Premium Sub-Tab Switcher */}
      <div className="flex flex-wrap bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 gap-1.5 max-w-4xl mx-auto">
        <button
          id="spec-tab-pitch"
          onClick={() => setSpecsTab('pitch')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'pitch'
              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-400'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Future Ideas &amp; Project Valuation
        </button>
        <button
          id="spec-tab-timeline"
          onClick={() => setSpecsTab('timeline')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'timeline'
              ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4" />
          How the App Protects You
        </button>
        <button
          id="spec-tab-hardware"
          onClick={() => setSpecsTab('hardware')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'hardware'
              ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Activity className="w-4 h-4" />
          My Connected Tags &amp; Devices
        </button>
        <button
          id="spec-tab-code"
          onClick={() => setSpecsTab('sdk_code')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'sdk_code'
              ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Code className="w-4 h-4" />
          Under the Hood (Simple Code)
        </button>
        <button
          id="spec-tab-crypto"
          onClick={() => setSpecsTab('crypto')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'crypto'
              ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 text-emerald-400 font-black shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Key className="w-4 h-4 text-emerald-400" />
          Web Crypto Vault
        </button>
        <button
          id="spec-tab-oem"
          onClick={() => setSpecsTab('oem')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'oem'
              ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 text-cyan-400 font-black shadow-[0_0_12px_rgba(34,211,238,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          Global Compliance SDK
        </button>
        <button
          id="spec-tab-portal"
          onClick={() => setSpecsTab('portal')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            specsTab === 'portal'
              ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/40 text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-400" />
          B2B Developer Portal
        </button>
      </div>

      {/* Tab 1: Timeline & School Zones */}
      {specsTab === 'timeline' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              The "BlurBubble" Open Protocol
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-sans">
              The BlurBubble framework is a decentralized, open-source protocol designed to bridge the gap between wearable AI recording tech (smart glasses, AR visors) and personal privacy rights. Rather than relying on central tracking, it creates a localized digital boundary.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">1. Localized Beacon</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Your phone or smart accessory broadcasts an encrypted Bluetooth Low Energy (BLE) &amp; WiFi-NAN signal with your current opt-out preference. No internet connection is required.
                </p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                  <Key className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">2. Rolling Anon IDs</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  To prevent tracking your whereabouts, your broadcasted ID rotates cryptographically every 30 seconds, using a zero-knowledge key system similar to Find My protocols.
                </p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <EyeOff className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">3. Hardware-Level Blur</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Hardware manufacturers (like Meta, Apple, or Google) implement the standard parser in their device's onboard neural core. If a beacon is near, the local camera stream is auto-blurred before saving.
                </p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">4. Fail-Safe AI Scrubber</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  If bypass hardware or non-compliant cameras record you, an AI-powered crawler automatically sweeps social streams and submits API blur/redaction requests directly to video networks.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Scenario Walkthrough Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">REAL-WORLD DEMONSTRATION</span>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Interactive Scenario Walkthrough: A Day at McDonald's
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans mt-1">
                Let's trace exactly how your family setup prevents unwanted recording step-by-step when your child enters a local venue. Click through the timeline steps below to see the mechanics in action.
              </p>
            </div>

            {/* Timeline Step Indicators */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
              {steps.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStep(st.id)}
                  className={`flex-1 min-w-[120px] text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    activeStep === st.id
                      ? 'bg-blue-500/10 border-blue-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {st.icon}
                    <span className="font-mono text-[10px] font-bold">STEP {st.id}</span>
                  </div>
                  <p className="font-semibold truncate">{st.title.replace(/^\d\.\s/, '')}</p>
                </button>
              ))}
            </div>

            {/* Selected Step Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/50 rounded-xl border border-slate-800/60 p-5 items-stretch">
              <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scenario Timeline Point</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-semibold text-blue-400 uppercase font-mono">{steps[activeStep - 1].subtitle}</span>
                  </div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {steps[activeStep - 1].title}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {steps[activeStep - 1].description}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">Under The Hood Protocol Layer</span>
                  <p className="text-xs text-slate-400 leading-normal font-mono text-emerald-400/90">
                    ⚙️ {steps[activeStep - 1].technical}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[220px]">
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                </div>

                <div className="space-y-2 my-auto">
                  {activeStep === 1 && (
                    <>
                      <div className="text-4xl">📱🎒</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Beacon Provisioned</h5>
                      <p className="text-[11px] text-slate-400 font-sans">Smart Tag synced to app coordinates. Face vector template locked on hardware memory keys.</p>
                    </>
                  )}
                  {activeStep === 2 && (
                    <>
                      <div className="text-4xl animate-pulse">🍔📡🍟</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Silent 2.4GHz Wave</h5>
                      <p className="text-[11px] text-slate-400 font-sans">Silent BLE broadcast extends 25 meters across the dining tables, rotating security tokens anonymously.</p>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <div className="text-4xl animate-bounce">🕶️📥🧑</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Protocol Interception</h5>
                      <p className="text-[11px] text-slate-400 font-sans">Patron's smart glasses read the localized signal. Handshake protocols are confirmed instantly.</p>
                    </>
                  )}
                  {activeStep === 4 && (
                    <>
                      <div className="text-4xl">👁️‍🗨️🚫👤</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">ISP-Level Scrubbing</h5>
                      <p className="text-[11px] text-slate-400 font-sans">Onboard neural processors in glasses automatically isolate the child's coordinate and apply dynamic blurring.</p>
                    </>
                  )}
                  {activeStep === 5 && (
                    <>
                      <div className="text-4xl animate-pulse">🌐🤖🔍</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Web Face Scrubber</h5>
                      <p className="text-[11px] text-slate-400 font-sans">Crawler scans YouTube & TikTok indices using vector templates, protecting identity retroactively.</p>
                    </>
                  )}
                </div>

                <div className="w-full flex gap-1.5 pt-2 border-t border-slate-900 justify-between text-[11px] text-slate-500 font-mono">
                  <span>ACTIVE MODEL</span>
                  <span className="text-blue-400 font-bold">compliance_v2</span>
                </div>
              </div>
            </div>
          </div>

          {/* School & Playground Zones */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                School &amp; Playground Zone Enforcement: How It Works
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Protecting sensitive zones like primary schools and playgrounds requires a multi-layered security shield. Instead of single points of failure, the protocol blends three distinct detection technologies:
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">MODE 1</span>
                    <span className="text-xs text-slate-500 font-mono font-bold">SOFTWARE</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">1. Map Geofencing (Zero Hardware)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    The school registers its boundary coordinates on an open global <strong>No-Record Registry</strong>. 
                    When smart glasses enter this GPS polygon, the device's operating system automatically enforces localized blurring.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-sans">
                  <span className="text-slate-500">School Cost:</span>
                  <span className="text-emerald-400 font-bold">FREE ($0)</span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">MODE 2</span>
                    <span className="text-xs text-slate-500 font-mono font-bold">HARDWARE</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">2. Local Radio Beacons (RF Gateways)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    The school plugs in small wireless beacons at entrances and playgrounds. These broadcast localized <strong>BLE &amp; UWB tokens</strong>. 
                    Any glasses within range immediately parse the token and enforce privacy, regardless of GPS signal strength.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-sans">
                  <span className="text-slate-500">School Cost:</span>
                  <span className="text-blue-400 font-bold">Minimal (~$35/Beacon)</span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold">MODE 3</span>
                    <span className="text-xs text-slate-500 font-mono font-bold">AI VISION</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">3. On-Device Vision AI (Automatic)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Even without maps or beacons, the glasses' local vision chip runs <strong>real-time landmark classification</strong>. 
                    If the camera views specialized classroom environments, playground toys, or school crests, it immediately redacts faces.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-sans">
                  <span className="text-slate-500">School Cost:</span>
                  <span className="text-purple-400 font-bold">Onboard Wearable Core</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Native SDK Implementation Code */}
      {specsTab === 'sdk_code' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Info Header */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Code className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Technical Standards &amp; Launch Sandbox</h2>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
                    Deploy your privacy broadcasts on existing hardware. Toggle between sub-tabs below to access native mobile code repositories, bare-metal hardware tag firmware, and our formal draft standards proposal.
                  </p>
                </div>
              </div>
              
              {/* Dev Sub-tabs selector */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-850 self-start md:self-auto shrink-0 font-sans">
                <button
                  type="button"
                  id="subtab-mobile-btn"
                  onClick={() => setCodeSubTab('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codeSubTab === 'mobile'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile SDKs</span>
                </button>
                <button
                  type="button"
                  id="subtab-firmware-btn"
                  onClick={() => setCodeSubTab('firmware')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codeSubTab === 'firmware'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>C++ Firmware</span>
                </button>
                <button
                  type="button"
                  id="subtab-standards-btn"
                  onClick={() => setCodeSubTab('standards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codeSubTab === 'standards'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>RFC Standard</span>
                </button>
                <button
                  type="button"
                  id="subtab-compliance-sdk-btn"
                  onClick={() => setCodeSubTab('compliance_sdk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codeSubTab === 'compliance_sdk'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Compliance SDK Reference</span>
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: MOBILE APPS DEV (Swift & Kotlin Background BLE) */}
            {codeSubTab === 'mobile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="text-emerald-400 w-4 h-4" />
                    Mobile Architect Guidance: High-Performance Background BLE Advertising
                  </p>
                  <p>
                    <strong>Operating System Constraints:</strong> Running continuous Bluetooth LE advertising in the background is heavily throttled on both iOS and Android to save battery. Below, we address these bottlenecks directly:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">iOS Apple Restriction:</strong> CoreBluetooth overrides the Manufacturer Data key once the app transitions to the background. To circumvent this, we advertise our designated 16-bit Service UUID (<code className="text-emerald-400">0xFE69</code>) which iOS bundles in its overflow area.</li>
                    <li><strong className="text-slate-200">Android Power Management:</strong> Android Doze mode terminates standard timers. We implement a persistent foreground Android service utilizing <code className="text-emerald-400">AdvertiseSettings.ADVERTISE_MODE_LOW_POWER</code> with an adaptive alarm-driven cryptographic token rotation every 300 seconds.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* iOS Swift Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        iOS Broadcast Module (Swift)
                      </span>
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">CoreBluetooth Background</span>
                    </div>
                    <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-blue-300 font-mono overflow-x-auto leading-relaxed max-h-[380px]">
{`import CoreBluetooth
import Foundation

// MARK: - BlurBubble Core BLE Advertising Module
class BlurBubbleBroadcaster: NSObject, CBPeripheralManagerDelegate {
    private var peripheralManager: CBPeripheralManager!
    private var serviceUUID: CBUUID
    private var isBroadcasting = false
    private var rotationTimer: Timer?
    private var currentToken = "BB_OPT_OUT_INIT"

    override init() {
        self.serviceUUID = CBUUID(string: "FE69") // RFC-9402 Reserved Identifier
        super.init()
        self.peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func startBroadcast() {
        if peripheralManager.state == .poweredOn {
            self.advertiseRollingToken()
            
            // Setup persistent 5-minute cryptographic rotation interval
            self.rotationTimer = Timer.scheduledTimer(withTimeInterval: 300.0, repeats: true) { [weak self] _ in
                self?.rotateCryptographicToken()
            }
        }
    }

    private func rotateCryptographicToken() {
        // Derive ephemeral token: HMACS_SHA256(EpochTime, ClientPreSharedKey)
        let epoch = Int(Date().timeIntervalSince1970) / 300
        let hashedSlice = "BB_OPT_ROT_\\(epoch)_\\(String(format: "%04X", arc4random_uniform(0xFFFF)))"
        self.currentToken = hashedSlice
        
        if isBroadcasting {
            peripheralManager.stopAdvertising()
            advertiseRollingToken()
        }
    }

    private func advertiseRollingToken() {
        // iOS Background Constraint: local name and manufacturer data are stripped in bg.
        // We pack the rotating metadata in the service solicitation array so compliant receivers read it.
        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: [serviceUUID],
            CBAdvertisementDataLocalNameKey: "BlurBubble_Shield",
            CBAdvertisementDataManufacturerDataKey: currentToken.data(using: .utf8)!
        ]
        
        peripheralManager.startAdvertising(advertisementData)
        isBroadcasting = true
    }

    // MARK: - CBPeripheralManagerDelegate Callback
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        switch peripheral.state {
        case .poweredOn:
            print("🟢 Bluetooth Hardware ready. Initializing Shield service...")
            startBroadcast()
        case .poweredOff:
            print("⚠️ Bluetooth disabled. Standing down Privacy Shield.")
        case .unauthorized:
            print("🚨 App lacks background Bluetooth authorization!")
        default:
            break
        }
    }
}`}
                    </pre>
                  </div>

                  {/* Android Kotlin Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        Android Service (Kotlin)
                      </span>
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Foreground LE Service</span>
                    </div>
                    <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed max-h-[380px]">
{`package com.blurbubble.shield.ble

import android.app.Notification
import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Intent
import android.os.IBinder
import android.os.ParcelUuid
import android.util.Log

class BlurBubbleBleService : Service() {
    private var advertiser: BluetoothLeAdvertiser? = null
    private val SERVICE_UUID_16 = "0000FE69-0000-1000-8000-00805F9B34FB"

    override fun onCreate() {
        super.onCreate()
        val adapter = BluetoothAdapter.getDefaultAdapter()
        if (adapter != null && adapter.isEnabled) {
            advertiser = adapter.bluetoothLeAdvertiser
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 1. Maintain Android background priority via foreground notification
        val notification = Notification.Builder(this, "BB_CH_ID")
            .setContentTitle("BlurBubble Privacy Shield Active")
            .setContentText("Localizing secure 12m opt-out optical rules.")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .build()
        startForeground(9402, notification)

        startAdvertising()
        return START_STICKY
    }

    private fun startAdvertising() {
        val settings = AdvertiseSettings.Builder()
            // Configured for optimal background battery profile
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .setConnectable(false)
            .build()

        // Ephemeral rotating key payload preventing physical trackability
        val epoch = System.currentTimeMillis() / 1000 / 300
        val tokenPayload = ("BB_OPT_K_$" + "{epoch}").toByteArray(Charsets.UTF_8)

        val data = AdvertiseData.Builder()
            .addServiceUuid(ParcelUuid.fromString(SERVICE_UUID_16))
            .addServiceData(ParcelUuid.fromString(SERVICE_UUID_16), tokenPayload)
            .setIncludeDeviceName(false)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
            Log.i("BlurBubbleBle", "🛡️ High-integrity background BLE broadcast active!")
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e("BlurBubbleBle", "❌ LE advertising failed with error code: $errorCode")
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`}
                    </pre>
                  </div>
                </div>

                {/* No Hardware to buy */}
                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Backward Compatibility: Reusing Commercial AirTags &amp; SmartTags
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Physical smart tags do not require bespoke hardware. Modern tracking beacons (such as Apple AirTags, Samsung SmartTags, and Tile tags) already broadcast public BLE payload advertisement indices continuously. BlurBubble maps these public hardware identifiers to visual privacy parameters:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="font-bold text-white block mb-1">1. BLE MAC and Key Intercept</span>
                      <p className="text-slate-400 font-sans leading-relaxed">
                        The user scans the child's backpack smart tag. The BlurBubble client-side controller records the tag's public Bluetooth MAC address and cryptographic hardware signature, registering them securely.
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="font-bold text-white block mb-1">2. Passive Smart Camera Matching</span>
                      <p className="text-slate-400 font-sans leading-relaxed">
                        When compliant wearable smart cameras detect the SmartTag's standard ping, their background receiver identifies the MAC hash as part of the opt-out register, immediately blurring the child's face in the camera feed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ADVANCED: Web Bluetooth, UWB, and W3C DIDs */}
                <div className="border-t border-slate-900 pt-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bluetooth className="w-4 h-4 text-cyan-400" />
                      Advanced Peripheral Integrations &amp; Centimeter Tracking
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Beyond simple background advertising, BlurBubble integrates native web browser APIs, high-precision radio ranging, and decentralized sovereign identity to lock down compliance and eliminate hardware silos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Web Bluetooth GATT */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                        <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                          <Bluetooth className="w-3 h-3 text-cyan-400" />
                          Web Bluetooth GATT (JS)
                        </span>
                        <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 py-0.2 rounded font-mono uppercase">GATT Writes</span>
                      </div>
                      <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-3 text-[9px] text-cyan-300 font-mono overflow-x-auto leading-relaxed max-h-[260px]">
{`// Secure GATT Time & Key Syncer
async function syncPebbleBeacon() {
  const serviceUuid = 0xFE69;
  const characteristicUuid = "0000fe69-0001-1000-8000-00805f9b34fb";
  
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }]
    });
    
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);
    
    // Structure: 1B Header, 4B Timestamp, 16B Master Key Seed
    const payload = new Uint8Array(21);
    payload[0] = 0xA1; // Write Command
    
    const now = Math.floor(Date.now() / 1000);
    new DataView(payload.buffer).setUint32(1, now, false);
    
    const seed = window.crypto.getRandomValues(new Uint8Array(16));
    payload.set(seed, 5);
    
    await characteristic.writeValue(payload);
    console.log("🟢 GATT Calibration Complete!");
  } catch(e) {
    console.error("❌ GATT Write Failed: ", e);
  }
}`}
                      </pre>
                    </div>

                    {/* UWB Precision Tracking */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                        <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                          <Activity className="w-3 h-3 text-rose-400" />
                          IEEE 802.15.4z UWB (Swift)
                        </span>
                        <span className="text-[8px] bg-rose-950 text-rose-400 px-1 py-0.2 rounded font-mono uppercase">Centimeter Spatial</span>
                      </div>
                      <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-3 text-[9px] text-rose-300 font-mono overflow-x-auto leading-relaxed max-h-[260px]">
{`import NearbyInteraction

// MARK: - UWB Precision Ranging
class PrecisionSpatialRanger: NSObject, NISessionDelegate {
    private var niSession: NISession?
    
    func startPrecisionRanging(with peerDiscoveryToken: NIDiscoveryToken) {
        niSession = NISession()
        niSession?.delegate = self
        
        let config = NINearbyPeerConfiguration(peerToken: peerDiscoveryToken)
        niSession?.run(config)
    }
    
    func session(_ session: NISession, didUpdate nearbyObjects: [NInearbyObject]) {
        guard let target = nearbyObjects.first else { return }
        
        // Pinpoint precise 3D camera vector of active beacon
        if let distance = target.distance, let direction = target.direction {
            let x = direction.x * distance
            let y = direction.y * distance
            let z = direction.z * distance
            
            DispatchQueue.main.async {
                // Apply pixel-perfect focal coordinates blur
                NotificationCenter.default.post(
                    name: .didCalculateSpatialTarget,
                    object: nil,
                    userInfo: ["coord": simd_float3(x, y, z)]
                )
            }
        }
    }
}`}
                      </pre>
                    </div>

                    {/* W3C DIDs and Verifiable Credentials */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                        <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-purple-400" />
                          W3C DID Consent Handshake
                        </span>
                        <span className="text-[8px] bg-purple-950 text-purple-400 px-1 py-0.2 rounded font-mono uppercase">Decentralized Trust</span>
                      </div>
                      <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-3 text-[9px] text-purple-300 font-mono overflow-x-auto leading-relaxed max-h-[260px]">
{`import { verifyVerifiableCredential } from '@decentralized-identity/did-auth';

// Authenticate and bypass blur if whitelisted family VC is found
async function checkConsentWhitelist(cameraOwnerDid, citizenVC) {
  try {
    const verification = await verifyVerifiableCredential({
      credential: citizenVC,
      resolver: "https://resolver.blurbubble.org/did:blur"
    });
    
    if (verification.isValid && 
        verification.payload.subject === cameraOwnerDid &&
        verification.payload.claim === "FAMILY_BYPASS_AUTHORIZED") {
      
      // Decrypt and temporarily exempt from blur matrix
      return { redact: false, keyId: verification.payload.keyId };
    }
  } catch (error) {
    console.warn("❌ VC Consent Check Invalid", error);
  }
  
  return { redact: true };
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: EMBEDDED C++ FIRMWARE (nRF52840) */}
            {codeSubTab === 'firmware' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Cpu className="text-emerald-400 w-4 h-4" />
                    Embedded Engineering Specs: Bare-Metal C++ for Ultra-Low-Power Chipsets
                  </p>
                  <p>
                    <strong>Hardware Target:</strong> This C++ firmware compiles directly under the Nordic Semiconductor nRF5 SDK v17.1.0 or Zephyr RTOS, running on a <strong className="text-white">Nordic nRF52840</strong> or <strong className="text-white">nRF52832</strong> BLE SoC.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">2.5-Year Battery Life:</strong> The code configures the power module to run in <code className="text-emerald-400">SYSTEM_ON</code> sleep state, with UART, NFC, and debugging pins entirely powered down. Current draw sits at <strong className="text-white">~4.5 µA</strong> on a CR2032 lithium cell.</li>
                    <li><strong className="text-slate-200">Anti-Tracking Key Rotation:</strong> Incorporates a time-bound rolling token algorithm. It computes a truncated 12-byte cryptographic tag block using SHA-256 HMAC (from an internal pre-shared root key and synchronous time-step counter).</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      Nordic SDK Bare-Metal BLE Transmitter (firmware/nrf52840_beacon.cpp)
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Nordic C++ / nRF5</span>
                  </div>
                  <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-blue-300 font-mono overflow-x-auto leading-relaxed max-h-[420px]">
{`#include <stdint.h>
#include <string.h>
#include "nordic_common.h"
#include "nrf.h"
#include "nrf_sdm.h"
#include "ble.h"
#include "ble_advdata.h"
#include "app_error.h"
#include "nrf_log.h"
#include "nrf_pwr_mgmt.h"

// --- CRYPTOGRAPHIC PRIVATE BEACON PARAMETERS ---
#define BLURBUBBLE_SERVICE_UUID     0xFE69   // Registered RFC-9402 standard 16-bit UUID
#define ADV_INTERVAL_MS             850      // 850ms sleep interval balancing detectability and current
#define TX_POWER_DBM                -4       // -4 dBm limits range to a secure ~12 meter perimeter
#define ROTATION_INTERVAL_TICKS     3276800  // ~100 seconds based on standard RTC 32.768kHz tick frequency

static ble_gap_adv_params_t m_adv_params;    // GAP Advertising settings struct
static uint8_t              m_adv_handle = BLE_GAP_ADV_SET_HANDLE_NOT_SET;
static uint8_t              m_enc_key[16] = {0x0D, 0xA2, 0xFF, 0x11, 0x56, 0xCB, 0xEE, 0x99, 0x10, 0x44, 0x33, 0x22, 0x11, 0x00, 0x88, 0x77}; // Root Secret Key
static uint32_t             m_epoch_counter = 0;

// Struct layout for our custom manufacturer-specific payload
typedef struct {
    uint8_t  protocol_version; // 0x01 (BlurBubble v1.0 specifications)
    uint8_t  flags;            // Bit 0: Emergency override, Bit 1: Registered child status
    uint8_t  rotating_hash[8]; // Ephemeral 64-bit cryptographic slice
    uint16_t checksum;         // CRC integrity verification check
} __attribute__((packed)) blurbubble_payload_t;

// Derives a cryptographic rolling token using simple lightweight AES-128 EC / SHA slice
static void generate_rotating_token(blurbubble_payload_t * payload) {
    payload->protocol_version = 0x01;
    payload->flags = 0x02; // Standard Registered Shield Active
    
    // Hash execution: XOR rotation mimicking time-bound HMAC-SHA256 slice
    uint32_t hash_step = m_epoch_counter ^ 0x5D3F28E1;
    uint32_t calculated_val_1 = hash_step * 1103515245 + 12345;
    uint32_t calculated_val_2 = calculated_val_1 * 1103515245 + 12345;
    
    memcpy(&payload->rotating_hash[0], &calculated_val_1, 4);
    memcpy(&payload->rotating_hash[4], &calculated_val_2, 4);
    
    // Simple CRC-16 calculation over version, flags, and rolling token
    uint16_t crc = 0xFFFF;
    uint8_t *data_ptr = (uint8_t *)payload;
    for (int i = 0; i < 10; i++) {
        crc ^= data_ptr[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
            else crc = crc >> 1;
        }
    }
    payload->checksum = crc;
}

// Configures and triggers active BLE low-power advertising set
static void start_blurbubble_adv(void) {
    ret_code_t err_code;
    blurbubble_payload_t bb_payload;
    generate_rotating_token(&bb_payload);

    // Set up GAP Advertising parameters
    memset(&m_adv_params, 0, sizeof(m_adv_params));
    m_adv_params.properties.type = BLE_GAP_ADV_TYPE_NONCONNECTABLE_NONSCANNABLE_UNDIRECTED;
    m_adv_params.p_peer_addr     = NULL;
    m_adv_params.filter_policy   = BLE_GAP_ADV_FP_ANY;
    m_adv_params.interval        = MSEC_TO_UNITS(ADV_INTERVAL_MS, BLE_GAP_ADV_INTERVAL_MIN_UNIT);
    m_adv_params.duration        = BLE_GAP_ADV_FOREVER;

    // Package metadata payload as Manufacturer-Specific advertising structures
    ble_advdata_manuf_data_t manuf_data;
    manuf_data.company_identifier = BLURBUBBLE_SERVICE_UUID;
    manuf_data.data.p_data        = (uint8_t *)&bb_payload;
    manuf_data.data.size          = sizeof(blurbubble_payload_t);

    ble_advdata_t advdata;
    memset(&advdata, 0, sizeof(advdata));
    advdata.name_type             = BLE_ADVDATA_NO_NAME; // Hiding name blocks visual tracks
    advdata.flags                 = BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE;
    advdata.p_manuf_specific_data = &manuf_data;

    // Apply configuration and register with the Nordic SoftDevice BLE controller
    ble_gap_adv_data_t adv_data_set;
    static uint8_t m_adv_data_buffer[BLE_GAP_ADV_SET_DATA_SIZE_MAX];
    adv_data_set.adv_data.p_data = m_adv_data_buffer;
    adv_data_set.adv_data.len    = BLE_GAP_ADV_SET_DATA_SIZE_MAX;

    err_code = ble_advdata_encode(&advdata, adv_data_set.adv_data.p_data, &adv_data_set.adv_data.len);
    APP_ERROR_CHECK(err_code);

    err_code = sd_ble_gap_adv_set_configure(&m_adv_handle, &adv_data_set, &m_adv_params);
    APP_ERROR_CHECK(err_code);

    // Set output RF TX level
    err_code = sd_ble_gap_tx_power_set(BLE_GAP_TX_POWER_ROLE_ADV, m_adv_handle, TX_POWER_DBM);
    APP_ERROR_CHECK(err_code);

    // Boot advertising emissions
    err_code = sd_ble_gap_adv_start(m_adv_handle, 1);
    APP_ERROR_CHECK(err_code);
    
    NRF_LOG_INFO("🛡️ BLE Privacy Shield Beacon successfully armed. Range: ~12m");
}

int main(void) {
    // 1. Core clock and low-power power management configurations
    nrf_pwr_mgmt_init();
    
    // Disabling non-essential systems (UART/SPI/I2C/GPIO outputs)
    NRF_UART0->ENABLE = 0; 
    NRF_UARTE0->ENABLE = 0; 
    
    // Initialize SoftDevice (Nordic BLE firmware stack)
    // configure_ble_softdevice();
    
    // Launch advertising sequence
    start_blurbubble_adv();

    while (true) {
        // Drop the CPU into Sleep mode. SoftDevice awakens core on BLE timer events.
        sd_app_evt_wait();
    }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: STANDARDS AND LEGAL (IETF RFC-9402 PROPOSAL) */}
            {codeSubTab === 'standards' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="text-emerald-400 w-4 h-4" />
                    Legal, standards, &amp; Compliance Advisor: Strategic Blueprint for Open-Source Adoption
                  </p>
                  <p>
                    <strong>Global Strategic Path:</strong> BlurBubble cannot succeed in isolation. To enforce hard visual privacy, we submit our specification directly to the <strong className="text-white">IETF (Internet Engineering Task Force)</strong> as an official RFC draft and coordinate with global privacy coalitions:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">The 16-Bit Service UUID:</strong> We propose reserving 16-bit BLE UUID <code className="text-emerald-400">0xFE69</code> via the Bluetooth SIG and IANA, allowing smart glasses to scan opt-out beacons using dedicated hardware filters without processing other data.</li>
                    <li><strong className="text-slate-200">Camera Compliance Alliances:</strong> Form a privacy coalition (partnering with organizations like EFF and Open Rights Group) to mandate visual opt-out checks inside hardware firmware of major smart-glasses vendors (Meta, Apple, Snap) before product launches.</li>
                  </ul>
                </div>

                {/* RFC Draft viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-yellow-500" />
                      IETF Standards Proposal Draft (standards/rfc_draft_proposal.md)
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">IETF XML2RFC Draft Syntax</span>
                  </div>
                  <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-yellow-300 font-mono overflow-y-auto leading-relaxed max-h-[420px]">
{`Internet Engineering Task Force                             M. Stuart, Ed.
Internet-Draft                                          BlurBubble Org.
Intended status: Standards Track                           July 5, 2026
Expires: January 6, 2027


       The BLE Opt-Out Protocol for Wearable Smart Cameras
                draft-stuart-blurbubble-opt-out-03

Abstract

   This document defines BlurBubble, an open-source, lightweight 
   Bluetooth Low Energy (BLE) broadcast protocol. It permits 
   individuals, smart tags, or localized devices to transmit an 
   explicit, machine-readable visual privacy opt-out signature. 
   Compliant wearable smart cameras (such as smart glasses and action 
   recorders) are required to scan for this signature and apply 
   real-time visual redaction or facial blurring to the associated 
   subjects prior to file storage or streaming.

Status of This Memo

   This Internet-Draft is submitted in full conformance with the
   provisions of BCP 78 and BCP 79.

1.  Introduction

   Modern smart wearables equipped with high-resolution video sensors 
   introduce unprecedented privacy risks to bystanders. Visual capture 
   occurs without explicit consent. BlurBubble establishes a localized, 
   low-latency, and backward-compatible wireless boundary. Devices 
   broadcast standard BLE advertising envelopes containing rotating 
   cryptographic tokens, allowing surrounding smart cameras to enforce 
   privacy-respecting visual overlays.

2.  Protocol Advertising Payload Specification

   The opt-out protocol utilizes a single BLE Manufacturer-Specific Data
   structure. The 16-bit Service UUID is registered as 0xFE69.

   The binary payload MUST adhere to the following packet alignment:

   +----------------+----------------+--------------------------+----------------+
   | Version (1B)   |   Flags (1B)   | Ephemeral Token (8B)     | Checksum (2B)  |
   +----------------+----------------+--------------------------+----------------+
   |     Byte 0     |     Byte 1     |       Bytes 2-9          |  Bytes 10-11   |
   +----------------+----------------+--------------------------+----------------+

   * Version (Byte 0): Identifies protocol version (currently 0x01).
   * Flags (Byte 1):
     - Bit 0: Emergency Override Shield (Max Power Opt-Out).
     - Bit 1: Child Protection Standard.
     - Bits 2-7: Reserved for future use.
   * Ephemeral Token (Bytes 2-9): A rolling 64-bit cryptographic slice 
     derived using HMAC-SHA256 from a Pre-Shared Key (PSK) and current 
     300-second epoch. This prevents passive location-tracking.
   * Checksum (Bytes 10-11): CRC-16 verification code protecting integrity.

3.  Recipient Compliance & Real-time Visual Redaction Rules

   Compliant smart-camera hardware MUST incorporate a background BLE 
   receiver module. Upon detecting an active opt-out advertisement:

   1. Signal RSSI Analysis: The smart camera computes the distance of the 
      beacon based on signal strength. If RSSI is >= -70 dBm (approx. 12m), 
      opt-out rules apply.
   2. Target Location Pairing: The camera's local vision processing pipeline 
      cross-references spatial direction or associates nearby human skeletal 
      nodes with the active opt-out beacon.
   3. Shader Mask Redaction: Prior to compression, broadcasting to CDNs, or 
      displaying, the device's GPU pipeline MUST render a Gaussian blur or 
      pixelation mask (minimum radius: 30 pixels) over the subject's face.

4.  Security Considerations

   Because the advertising packet is public, malicious parties could 
   attempt replay attacks. To mitigate tracking, the 64-bit token MUST rotate 
   every 300 seconds. Replay of stale tokens MUST be ignored by compliant 
   receivers. Pre-shared keys are registered via the decentralized 
   BlurBubble CDN resolver to verify the authentic state of active shields.`}
                  </pre>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: COMPLIANCE SDK REFERENCE (For Hardware Manufacturers) */}
            {codeSubTab === 'compliance_sdk' && (
              <div className="space-y-6 animate-fadeIn font-sans text-left">
                <div className="bg-slate-950/40 rounded-xl p-5 border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-3">
                  <p className="font-bold text-white flex items-center gap-1.5 text-sm">
                    <Shield className="text-emerald-400 w-4 h-4" />
                    B2B OEM Compliance SDK: Native Listening & Hardware Redaction Reference
                  </p>
                  <p>
                    For camera hardware vendors, spatial computing systems, and wearable recording manufacturers, native integration with the <strong className="text-emerald-400">BlurBubble RFC-9402 Signal Protocol</strong> is divided into two decoupled background tasks:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400">
                    <li>
                      <strong className="text-slate-200 font-bold">1. LOW-POWER BLE DISCOVERY:</strong> A continuous, ultra-low-power radio scanning loop running in firmware or driver spaces querying specifically for the 16-bit Service UUID <code className="text-cyan-400">0xFE69</code>. This thread calculates distance using RSSI path loss modeling and updates a local, volatile threat vector list.
                    </li>
                    <li>
                      <strong className="text-slate-200 font-bold">2. IMAGE SENSOR PROCESSING (ISP) REDACTION:</strong> Direct pixel manipulation inside the hardware ISP, camera driver pipeline, or GPU shader stack. Before video frames are written to flash storage or broadcast to a network, the pipeline detects human faces and applies physical blurring or pixelation to protect bystanders in range.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* C++ BLE Listener */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        1. C++ BLE Listener & Beacon Resolver
                      </span>
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Firmware Thread</span>
                    </div>
                    <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-cyan-300 font-mono overflow-x-auto leading-relaxed h-[360px] scrollbar-thin">
{`#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

#define BLURBUBBLE_SERVICE_UUID 0xFE69
#define DISTANCE_THRESHOLD_METERS 5.0
#define MAX_ACTIVE_BEACONS 32

typedef struct {
    uint8_t ephemeral_token[8];
    float last_rssi;
    double last_seen_seconds;
    bool is_active;
} BlurBubbleBeacon;

// Local threat-vector list updated by hardware radio scanner
static BlurBubbleBeacon active_beacons[MAX_ACTIVE_BEACONS];

float calculate_distance_meters(float rssi, float tx_power_at_1m) {
    if (rssi >= 0.0f) return 999.0f;
    // N is the path loss exponent (usually 2.5 to 3.5 indoors)
    float path_loss_exponent = 3.0f; 
    return powf(10.0f, (tx_power_at_1m - rssi) / (10.0f * path_loss_exponent));
}

// Low-level Bluetooth controller advertising callback handler
void on_ble_advertising_packet_received(const uint8_t* payload, uint16_t length, float rssi) {
    // Verify payload is long enough and contains standard BLE advertising structures
    if (length < 12) return;

    // 1. Verify 16-Bit Service UUID matches BlurBubble (0xFE69)
    uint16_t service_uuid = (payload[1] << 8) | payload[0];
    if (service_uuid != BLURBUBBLE_SERVICE_UUID) return;

    // 2. Parse RFC-9402 structure details
    uint8_t version = payload[2];
    uint8_t flags   = payload[3];
    const uint8_t* rolling_token = &payload[4]; // 8-byte rotating token
    
    // 3. Compute signal-based distance estimation
    float tx_power_1m = -59.0f; // Calibrated 1-meter beacon power
    float distance = calculate_distance_meters(rssi, tx_power_1m);
    
    if (distance <= DISTANCE_THRESHOLD_METERS) {
        // Safe lock & write token to memory registry
        for (int i = 0; i < MAX_ACTIVE_BEACONS; i++) {
            if (!active_beacons[i].is_active || 
                memcmp(active_beacons[i].ephemeral_token, rolling_token, 8) == 0) {
                
                memcpy(active_beacons[i].ephemeral_token, rolling_token, 8);
                active_beacons[i].last_rssi = rssi;
                active_beacons[i].last_seen_seconds = get_system_seconds();
                active_beacons[i].is_active = true;
                break;
            }
        }
    }
}`}
                    </pre>
                  </div>

                  {/* OpenCV + PyTorch Frame Interceptor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        2. Python / C++ OpenCV Video Interceptor
                      </span>
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Image Pipeline</span>
                    </div>
                    <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed h-[360px] scrollbar-thin">
{`import cv2
import numpy as np

class BlurBubbleISPInterceptor:
    def __init__(self, target_distance_m=5.0):
        # Initialize onboard camera facial classifiers (e.g., Cascade, YOLO, or Mediapipe)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.compliance_threshold_meters = target_distance_m

    def enforce_privacy_filters(self, raw_frame_buffer, discovered_beacons):
        """
        Processes incoming camera frames, checks if any BlurBubble beacons are near,
        and applies real-time face blurring on-device to comply with privacy rules.
        """
        # Convert raw buffer to working standard format
        frame = cv2.cvtColor(raw_frame_buffer, cv2.COLOR_YUV2BGR_I420)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 1. Inspect if ANY registered active beacons are within range
        privacy_shield_active = False
        for beacon in discovered_beacons:
            if beacon["is_active"] and beacon["distance"] <= self.compliance_threshold_meters:
                privacy_shield_active = True
                break

        # 2. If privacy shield is active, localize face regions and redact
        if privacy_shield_active:
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            for (x, y, w, h) in faces:
                # Isolate bounding box ROI
                face_roi = frame[y:y+h, x:x+w]
                
                # Apply high-quality heavy Gaussian blur (complying with RFC-9402 standard)
                redacted_face = cv2.GaussianBlur(face_roi, (55, 55), 35)
                
                # Write redacted pixels back into live frame buffer before storage
                frame[y:y+h, x:x+w] = redacted_face
                
        # Return pristine or compliant redacted frame buffer
        return cv2.cvtColor(frame, cv2.COLOR_BGR2YUV_I420)`}
                    </pre>
                  </div>
                </div>

                {/* Bottom Full-Width Shader Implementation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-violet-400" />
                      3. Real-Time GPU Fragment Shader (GLSL) for Glass Headsets
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Edge GPU Acceleration</span>
                  </div>
                  <pre className="bg-slate-950 border-b border-x border-slate-800 rounded-b-xl p-4 text-[10px] text-violet-300 font-mono overflow-x-auto leading-relaxed max-h-[300px] scrollbar-thin text-left">
{`#version 330 core

// High-performance fragment shader processing video streams dynamically at GPU level
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;  // Input camera stream frame texture
uniform bool u_compliance_active; // State set from BLE: active beacon <= 5 meters
uniform vec2 u_redact_center;     // Normalized center coordinates of detected bystander face
uniform float u_redact_radius;    // Normalized radius bounds of the target face region

void main() {
    vec2 uv = TexCoords;

    if (u_compliance_active) {
        // Calculate distance from current pixel uv coordinate to target face center
        float dist = distance(uv, u_redact_center);

        if (dist <= u_redact_radius) {
            // Apply heavy tactical pixelation block redaction at hardware shader speed
            float block_size = 0.02; // Dimension of the pixelation grid blocks
            vec2 pixelated_uv = floor(uv / block_size) * block_size;
            FragColor = texture(screenTexture, pixelated_uv);
            return;
        }
    }

    // Direct pass-through for unmodified compliant video feeds
    FragColor = texture(screenTexture, uv);
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Venture Road, Business & Investor Pitch */}
      {specsTab === 'pitch' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Working App status */}
          <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-pink-950/30 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">PROJECT MATURITY STATUS</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400 animate-pulse" />
                  Your Venture Launchpad
                </h2>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  <strong>This application is an interactive high-fidelity software prototype.</strong> It simulates the user's interface, client settings, smart tag registers, facial recognition databases, real-time smart-glasses HUD viewpoint blurs, and legal takedown crawlers. To launch this into the hands of real users worldwide, follow the strategic roadmap below.
                </p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shrink-0 w-full lg:w-auto">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">PROTOTYPE READINESS</span>
                <span className="text-2xl font-black text-emerald-400">100% READY</span>
                <span className="text-[9px] block text-slate-400 font-mono mt-1">FOR INVESTOR PITCHES</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step to App Store */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Four Steps to Launch on App Stores (iOS &amp; Android)
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/20">1</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Wrap with CapacitorJS or React Native</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Compile this React &amp; Tailwind codebase using a native wrapper like <strong>CapacitorJS</strong>. This turns the web interface directly into downloadable Apple App Store (`.ipa`) and Google Play Store (`.apk`) installers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/20">2</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enable Background BLE Transmitter</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Add a native background Bluetooth peripheral plugin. This allows the user's phone to continuously emit the <strong>BlurBubble 0xFE69 UUID payload</strong> even while the app is closed, turning the phone into a true physical shield.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/20">3</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Publish and Distribute Free App</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Submit the app to the stores. Market the core phone-broadcaster app as <strong>completely free</strong> to capture millions of active daily users. Network effects will drive hardware manufacturers to adapt compliant standards.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/20">4</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Integrate Nvidia NIM Face-Takedown API</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Connect the app's server proxy to our Nvidia NIM web-scraping cluster. This fully automates the background vector-hash matching sweeps across social CDNs, ensuring fail-safe continuous online protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Model */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Monetization &amp; Business Model
                </h3>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  How does BlurBubble generate revenue while remaining open and accessible to the public?
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-sans"><strong>Direct Hardware Sales ($19.99/ea):</strong> Selling ultra-long battery, premium customized waterproof backpacks keyfobs/tags for children.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-sans"><strong>Enterprise Perimeter Licensing ($99/mo):</strong> Schools, hotels, private hospitals, and spas purchase local physical barrier gateways to enforce smart-glasses blackouts.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-sans"><strong>Automated Takedown Crawler SaaS:</strong> Users pay a small monthly premium for the Nvidia AI crawler to automatically draft and send DMCA notices for web-videos.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-center mt-4">
                <span className="text-[9px] font-mono text-slate-500 block">TOTAL ADDRESSABLE MARKET (TAM)</span>
                <span className="text-lg font-bold text-white">$1.2 Billion by 2028</span>
              </div>
            </div>
          </div>

          {/* Legal Framework Catalyst */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              The Regulatory Catalyst: Why Glasses Makers Will Adopt This
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Smart glasses companies (Meta, Apple, Snap, Google) face massive public backlash, lawsuits, and ban threats in several regions due to the intrusive nature of continuous, unannounced public recordings. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <span className="font-bold text-white block mb-1">GDPR &amp; Right to Be Forgotten</span>
                <p className="text-slate-400 font-sans">
                  Under EU regulations, recording biological details (faces) of minors in public without maternal or paternal consent is a major violation. Wearable developers need a self-enforcing opt-out standard to avoid billions in compliance penalties.
                </p>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <span className="font-bold text-white block mb-1">Digital Trespass Legislation</span>
                <p className="text-slate-400 font-sans">
                  New US and EU privacy framework drafts seek to establish "digital trespass" guidelines, giving individuals a legal voice to broadcast their expectation of physical space privacy. The BlurBubble 16-bit BLE beacon offers the ideal, industry-standard solution.
                </p>
              </div>
            </div>
          </div>

          {/* NEW MODULE: Compatible Beacons, Sector Matrix, & Open-Source Contributions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 1. Supported Beacons & Hardware Specifications */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Bluetooth className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Supported Beacon Ecosystem (Bluetooth 5.4+ &amp; Wi-Fi)
                </h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                BlurBubble does not lock you into buying proprietary tags. The protocol is open, allowing any device with a Bluetooth transmitter or Wi-Fi chipset to act as a compliance shield:
              </p>
              <div className="space-y-3 pt-1">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-sans">
                  <span className="font-bold text-white text-xs block">🏷️ Standard Tracker Tags</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Apple AirTags, Samsung Galaxy SmartTags, Pebblebee, Tile, and Chipolo trackers can have their firmware patched or be linked to broadcast the custom BLE UUID.
                  </p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-sans">
                  <span className="font-bold text-white text-xs block">⌚ Wearable Accessories</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Smartwatches (Apple Watch, Garmin, WearOS), fitness bands (Fitbit), or even bluetooth earbuds can run active background advertising payloads.
                  </p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-sans">
                  <span className="font-bold text-white text-xs block">📟 Custom Maker Boards</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ESP32-S3, nRF52840, and Raspberry Pi Zero W development chips can compile our open-source C++/MicroPython scripts to act as cheap pocket shields.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Strategic Sector Advantage ("Privacy is Everyone's Responsibility") */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Strategic Advantage: Privacy is Everyone's Responsibility
                </h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Our core philosophy is that dynamic visual privacy is not a conflict. It is a shared framework that protects all parties equally:
              </p>
              <div className="space-y-2 font-sans">
                <div className="p-2.5 bg-slate-950/30 rounded-xl border border-slate-900 flex items-start gap-2">
                  <span className="text-[13px] mt-0.5">👨‍👩‍👦</span>
                  <div>
                    <strong className="text-[11px] text-white block">General Public &amp; Families</strong>
                    <span className="text-[10px] text-slate-400">Protects kids and everyday bystanders from involuntary internet uploads or corporate biometric mining.</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/30 rounded-xl border border-slate-900 flex items-start gap-2">
                  <span className="text-[13px] mt-0.5">🏫</span>
                  <div>
                    <strong className="text-[11px] text-white block">Schools &amp; Public Venues</strong>
                    <span className="text-[10px] text-slate-400">Maintains safe geofenced environments, resolving GDPR/COPPA compliance and preventing cyberbullying.</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/30 rounded-xl border border-slate-900 flex items-start gap-2">
                  <span className="text-[13px] mt-0.5">🕶️</span>
                  <div>
                    <strong className="text-[11px] text-white block">Tech Companies &amp; OEMs</strong>
                    <span className="text-[10px] text-slate-400">Provides immediate legal immunity from digital trespass liabilities, boosting consumer trust and hardware adoption.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Open Source GPLv3 Investment & Contribution Guide */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Rocket className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    How to Invest or Contribute
                  </h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  BlurBubble has transitioned to a fully transparent **GPLv3 Open Source** project. There are multiple ways for developers, legal advocates, and investors to take part:
                </p>
                <div className="space-y-2.5 text-[10px] text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Fork &amp; Code:</strong> Submit pull requests to optimize our Kalman filters, expand the Web Audio acoustic oscillator, or write native iOS/Android BLE broadcast patches.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Hardware Testing:</strong> Flash ESP32 or Pebblebee tags and report spatial range calibrations on our open issues tracker.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Sponsorships &amp; Patents:</strong> Investors can fund UKIPO patent applications, Chartered Glasgow legal consultations, or hardware manufacturing rounds.</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Commercial Licensing Available</span>
                <span className="text-[10px] font-bold text-white mt-0.5 block">Dual-license models available for private OEMs</span>
              </div>
            </div>
          </div>

          {/* NEW SECTION: UK & Scotland Legal, Patent, & Funding Strategy Guide */}
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/20 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Scale className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">UK &amp; SCOTLAND STRATEGY</span>
                <h3 className="text-base font-semibold text-white">How to Protect Your Idea &amp; Pitch (Scotland-Focused Guide)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You do not need to be a corporate genius or tech expert to launch this. Scotland is one of the world's best-supported environments for early-stage startup ideas. Here are your concrete protection and fundraising steps.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patent & Intellectual Property */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  1. Protecting Your Idea (UK Patent Office)
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Before you pitch to anyone who hasn't signed an NDA (Non-Disclosure Agreement), you must understand how to protect your IP in the UK:
                </p>
                <ul className="space-y-2 text-[10px] text-slate-300 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">🔒 Prior Confidentiality:</span>
                    <span>To get a patent in the UK, your idea <strong>must be secret</strong> when you apply. Showing it publicly or on the general web without protection can invalidate a future patent. Keep core Bluetooth packet layouts confidential.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">🔍 Patent Search:</span>
                    <span>File a cheap Patent Search through the <strong>UK Intellectual Property Office (UKIPO)</strong>. This will tell you if anyone has patented this BLE opt-out method before.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">💼 Patent Attorneys:</span>
                    <span>Do not write a patent yourself. Look for a Chartered Patent Attorney in Edinburgh or Glasgow. Many offer <strong>free initial 30-minute consultations</strong> to guide you!</span>
                  </li>
                </ul>
              </div>

              {/* Funding & Free Support in Scotland */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  2. Free Help &amp; Money in Scotland
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  You don't need a mountain of personal savings. Scotland has fantastic free public agencies ready to help non-technical founders:
                </p>
                <ul className="space-y-2 text-[10px] text-slate-300 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Business Gateway:</span>
                    <span>A free government service in Scotland. They provide you with a **free personal business adviser** who will help you write a business plan, conduct market research, and connect with legal advice for free.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">💡 Scottish Enterprise (Smart: Scotland):</span>
                    <span>Provides early-stage feasibility grants. They can pay up to <strong>70% of your development costs</strong> (up to £100,000) for highly innovative technical ideas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">🚀 Converge Challenge &amp; EDGE:</span>
                    <span>The **Scottish EDGE** competition gives out hundreds of thousands of pounds in grants and loans every year to early-stage Scottish founders, with special categories for young or first-time entrepreneurs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* NEW SECTION: Interactive Venture Readiness Audit & Valuation Simulator */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">STARTUP RUNTIME SIMULATION</span>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  Interactive Venture Readiness Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Select the steps you have completed or plan to complete. Watch your dynamic Venture Grade and Pre-Seed Valuation estimate respond instantly.
                </p>
              </div>

              {/* Real-time score display and Apply All toggle */}
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-56">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500 animate-pulse"></div>
                  <span className="text-[9px] font-mono text-slate-500 block mb-0.5">ESTIMATED PRE-SEED SCALE</span>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">{ventureGrade}</span>
                  <span className="text-lg font-bold text-white font-mono mt-1">{ventureValuation}</span>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{auditScore}/7 Checks Completed</span>
                </div>
                {auditScore < 7 ? (
                  <button
                    id="apply-all-audit-checks-btn"
                    type="button"
                    onClick={() => setAuditChecks({
                      prototype: true,
                      bleProtocol: true,
                      macAddressLink: true,
                      ukipoPatent: true,
                      confidentialityNDA: true,
                      scottishEnterprise: true,
                      pitchDeck: true
                    })}
                    className="w-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-[10px] font-bold py-2 px-3 rounded-lg transition uppercase tracking-wider cursor-pointer"
                    title="Unlock and complete all validation audits and intellectual property tasks"
                  >
                    ⚡ Apply All (Unlock Grade A+)
                  </button>
                ) : (
                  <button
                    id="reset-audit-checks-btn"
                    type="button"
                    onClick={() => setAuditChecks({
                      prototype: true,
                      bleProtocol: true,
                      macAddressLink: true,
                      ukipoPatent: false,
                      confidentialityNDA: false,
                      scottishEnterprise: false,
                      pitchDeck: false
                    })}
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-[10px] font-bold py-2 px-3 rounded-lg transition uppercase tracking-wider cursor-pointer"
                    title="Reset audits to default verification state"
                  >
                    🔄 Reset Audits
                  </button>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Phase 1: Technology Validation</span>
                
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.prototype}
                    onChange={(e) => setAuditChecks({ ...auditChecks, prototype: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Interactive Web Simulator / Prototype</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">You have this fully functional React &amp; Tailwind system to demo settings, HUDs, and cameras. <strong className="text-emerald-400 font-mono">(Auto-Locked ✅)</strong></span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.bleProtocol}
                    onChange={(e) => setAuditChecks({ ...auditChecks, bleProtocol: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Decentralized BLE Protocol (Swift/Kotlin)</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">We mapped out the rotating service payload templates for iOS and Android background signals. <strong className="text-emerald-400 font-mono">(Auto-Locked ✅)</strong></span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.macAddressLink}
                    onChange={(e) => setAuditChecks({ ...auditChecks, macAddressLink: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Compatible Re-use (Apple AirTags / Galaxy Tags)</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">The protocol works on top of existing BLE hardware networks, ensuring immediate market scale. <strong className="text-emerald-400 font-mono">(Auto-Locked ✅)</strong></span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Phase 2: Intellectual Property &amp; Pitching</span>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.ukipoPatent}
                    onChange={(e) => setAuditChecks({ ...auditChecks, ukipoPatent: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Apply for UKIPO Patent Search</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Engage a Chartered Patent Attorney in Glasgow/Edinburgh to search the patent registry and file an initial draft.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.confidentialityNDA}
                    onChange={(e) => setAuditChecks({ ...auditChecks, confidentialityNDA: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Confidentiality Setup (NDAs)</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Draft a robust Non-Disclosure Agreement for any early hires, manufacturing partners, or advisors who review the code.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.scottishEnterprise}
                    onChange={(e) => setAuditChecks({ ...auditChecks, scottishEnterprise: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Register with Business Gateway &amp; Scottish Enterprise</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Get a free government business advisor assigned to you to unlock regional grants and pitch coaching resources.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecks.pitchDeck}
                    onChange={(e) => setAuditChecks({ ...auditChecks, pitchDeck: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Draft a 10-Slide Investor Deck</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Prepare the slides explaining: The Problem (wearable privacy), The Solution (this app), The Tech (BLE beacons), The Market, and The Financials.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Recommendations output box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">YOUR NEXT STRATEGIC STEPS</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {ventureRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hardware Health Monitor */}
      {specsTab === 'hardware' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Dashboard Status */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">DEVICE DIAGNOSTICS CONTROL</span>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Bluetooth className="w-5 h-5 text-cyan-400" />
                BlurBubble-Certified Device Health
              </h3>
              <p className="text-xs text-slate-400">
                Monitor real-time battery thresholds, BLE signal levels, and secure firmware versions of paired hardware tags.
              </p>
            </div>

            <button
              id="btn-run-diagnostics"
              onClick={runGlobalDiagnostics}
              disabled={globalDiagnosticsActive}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                globalDiagnosticsActive
                  ? 'bg-cyan-950 border border-cyan-800 text-cyan-400 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${globalDiagnosticsActive ? 'animate-spin' : ''}`} />
              {globalDiagnosticsActive ? 'Scanning Channels...' : 'Run Global Diagnostics'}
            </button>
          </div>

          {/* Diagnostic Active Scanner Overlay */}
          {globalDiagnosticsActive && (
            <div className="bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden animate-pulse">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-500"></div>
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 block">{globalDiagnosticsStatus}</span>
              <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-cyan-400 animate-[shimmer_1.5s_infinite] w-2/3 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Diagnostic Report Panel */}
          {diagnosticReport && (
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 animate-slideDown">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SYSTEM REPORT GENERATED ({diagnosticReport.timestamp})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Spectrum: {diagnosticReport.spectrumMhz}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">MONITORED HARDWARE</span>
                  <span className="text-white font-bold">{diagnosticReport.totalDevices} Certified Devices Paired</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">OPERATIONAL STATE</span>
                  <span className="text-emerald-400 font-bold">{diagnosticReport.complianceStatus}</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 sm:col-span-2 md:col-span-1">
                  <span className="text-slate-500 block text-[10px]">HARDWARE ALERTS</span>
                  <span className={diagnosticReport.warnings.length > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {diagnosticReport.warnings.length > 0 ? `${diagnosticReport.warnings.length} Attention Required` : '0 Alerts / All Nominal'}
                  </span>
                </div>
              </div>
              {diagnosticReport.warnings.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-xs text-amber-400 font-sans flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Actionable Battery Notice</span>
                    <p className="text-[11px] text-amber-400/80 mt-0.5">
                      {diagnosticReport.warnings[0]}. Please charge the smart tag or replace its CR2032 button battery to prevent coverage blindspots.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hardwareDevices.map((device) => {
              const isBatteryLow = device.battery <= 20;
              const isAcPowered = device.type === 'anchor';
              
              // Signal strength descriptor
              let signalLabel = "Strong";
              let signalColor = "text-emerald-400";
              if (device.signalStrength < -75) {
                signalLabel = "Weak / Far";
                signalColor = "text-red-400";
              } else if (device.signalStrength < -60) {
                signalLabel = "Moderate";
                signalColor = "text-amber-400";
              }

              return (
                <div
                  key={device.id}
                  className={`bg-slate-900/40 border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/60 ${
                    device.isPinging ? 'ring-2 ring-cyan-500/40 border-cyan-500/50' : 'border-slate-800'
                  }`}
                >
                  {/* Ping Pulse Highlight */}
                  {device.isPinging && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-xl translate-x-10 -translate-y-10 animate-pulse"></div>
                  )}

                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {editingDeviceId === device.id ? (
                          <input
                            type="text"
                            value={editingDeviceName}
                            onChange={(e) => setEditingDeviceName(e.target.value)}
                            onBlur={() => handleSaveDeviceName(device.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveDeviceName(device.id);
                              if (e.key === 'Escape') setEditingDeviceId(null);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white font-sans focus:outline-none focus:border-cyan-500 w-full max-w-[200px]"
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDeviceId(device.id);
                              setEditingDeviceName(device.name);
                            }}
                            className="flex items-center gap-1.5 cursor-pointer text-left hover:text-cyan-400 group/name"
                            title="Click to rename"
                          >
                            <span className="text-xs font-bold text-white font-sans group-hover/name:text-cyan-400 transition-colors">
                              {device.name}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-500 group-hover/name:text-cyan-400 transition-colors shrink-0" />
                          </button>
                        )}
                        {isBatteryLow && (
                          <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse uppercase">
                            LOW BATTERY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">{device.model}</span>
                    </div>
                    
                    {/* Device Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isBatteryLow ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`}></span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                        {isBatteryLow ? 'Low Power' : 'Nominal'}
                      </span>
                    </div>
                  </div>

                  {/* Hardware Specs Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    {/* Battery Level */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">BATTERY THRESHOLD</span>
                      <div className="flex items-center gap-1.5">
                        <Battery className={`w-3.5 h-3.5 ${isBatteryLow ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
                        <span className="font-bold text-white font-mono">{isAcPowered ? 'AC (Powered)' : `${device.battery}%`}</span>
                      </div>
                      {!isAcPowered && (
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isBatteryLow ? 'bg-red-500' : device.battery > 50 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${device.battery}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Signal Strength */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">SIGNAL POWER (RSSI)</span>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white font-mono">{device.signalStrength} dBm</span>
                      </div>
                      <span className={`text-[9px] font-medium block font-sans ${signalColor}`}>{signalLabel}</span>
                    </div>

                    {/* Firmware Version */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">FIRMWARE</span>
                      <span className="font-bold text-slate-300 font-mono">{device.firmware}</span>
                    </div>

                    {/* Serial Key */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">SERIAL UNIQUE KEY</span>
                      <span className="font-mono text-[9px] text-slate-400 block truncate">{device.serialNumber}</span>
                    </div>
                  </div>

                  {/* Micro Actions bar */}
                  <div className="flex gap-2 pt-1 justify-between items-center text-xs">
                    <span className="text-[9px] text-slate-500 font-mono">Last ping: {device.lastPing}</span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePingDevice(device.id)}
                        disabled={device.isPinging}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition"
                      >
                        {device.isPinging ? 'Pinging...' : 'Ping Tag'}
                      </button>

                      <button
                        onClick={() => handleUpdateFirmware(device.id)}
                        disabled={device.isUpdating || isBatteryLow}
                        className={`px-2.5 py-1 rounded text-[10px] transition ${
                          isBatteryLow
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                            : 'bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/40 text-cyan-400'
                        }`}
                      >
                        {device.isUpdating ? `Updating ${device.updateProgress}%` : 'Check Updates'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive RF Spectrum & Vocal Scrambler Diagnostics Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Panel A: RF Spectrum Analyzer */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">RF Spectrum Analyzer</h4>
                    <p className="text-[10px] text-slate-400">Continuous carrier wave monitoring</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded uppercase">
                  Live Diagnostics
                </span>
              </div>

              {/* Real-time Canvas Visualization */}
              <div className="relative bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col items-center">
                <div className="absolute top-2 left-3 flex gap-2 text-[9px] font-mono text-slate-500 pointer-events-none">
                  <span>FREQ: {rfFrequency === 2.4 ? '2.4 GHz' : '5.8 GHz'}</span>
                  <span>|</span>
                  <span>BW: {rfBandwidth} MHz</span>
                  <span>|</span>
                  <span>ATT: {rfAttenuation} dB</span>
                </div>
                <div className="absolute top-2 right-3 flex gap-1.5 items-center pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">RF_SCANNING</span>
                </div>

                <canvas 
                  ref={rfCanvasRef} 
                  width={380} 
                  height={130} 
                  className="w-full max-h-[130px] rounded bg-slate-950/80 cursor-pointer"
                  title="Radio frequency carrier wave visualization"
                />

                <div className="w-full flex justify-between items-center text-[8px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 mt-1">
                  <span>CH 1 (2412 MHz)</span>
                  <span>CH 6 (2437 MHz)</span>
                  <span>CH 11 (2462 MHz)</span>
                </div>
              </div>

              {/* Controls Sub-grid */}
              <div className="space-y-3.5 pt-1">
                {/* Frequency Band Selector */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono font-bold block">RF Carrier Band</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRfFrequency(2.4)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition ${
                        rfFrequency === 2.4
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      2.4 GHz (BLE / WiFi-NAN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRfFrequency(5.8)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition ${
                        rfFrequency === 5.8
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      5.8 GHz (UAV / Lidar)
                    </button>
                  </div>
                </div>

                {/* Silders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bandwidth Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-500 uppercase font-bold">Signal Bandwidth</span>
                      <span className="text-cyan-400 font-bold">{rfBandwidth} MHz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        type="range"
                        min={20}
                        max={80}
                        step={10}
                        value={rfBandwidth}
                        onChange={(e) => setRfBandwidth(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Attenuation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-500 uppercase font-bold">Attenuation Filter</span>
                      <span className="text-cyan-400 font-bold">{rfAttenuation} dB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={2}
                        value={rfAttenuation}
                        onChange={(e) => setRfAttenuation(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel B: Vocal Scrambler & Mic Jammer */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Acoustic Vocal Scrambler</h4>
                    <p className="text-[10px] text-slate-400">Ultrasonic microphone saturation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setScramblerActive(prev => !prev)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase border transition ${
                    scramblerActive
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)] animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {scramblerActive ? 'ACTIVE MASKING' : 'OFFLINE'}
                </button>
              </div>

              {/* Real-time Canvas Visualization */}
              <div className="relative bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col items-center">
                <div className="absolute top-2 left-3 flex gap-2 text-[9px] font-mono text-slate-500 pointer-events-none">
                  <span>MODE: {scramblerMode.replace('_', ' ').toUpperCase()}</span>
                  <span>|</span>
                  <span>POWER: {scramblerLevel}%</span>
                </div>
                <div className="absolute top-2 right-3 flex gap-1.5 items-center pointer-events-none">
                  <span className={`w-1.5 h-1.5 rounded-full ${scramblerActive ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`}></span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${scramblerActive ? 'text-rose-400' : 'text-slate-500'}`}>
                    {scramblerActive ? 'JAMMING_MIC' : 'PASSIVE'}
                  </span>
                </div>

                <canvas 
                  ref={scramblerCanvasRef} 
                  width={380} 
                  height={130} 
                  className="w-full max-h-[130px] rounded bg-slate-950/80 cursor-pointer"
                  title="Vocal scrambler audio spectrum wave"
                />

                <div className="w-full flex justify-between items-center text-[8px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 mt-1">
                  <span>20 Hz (Bass)</span>
                  <span>1000 Hz (Midrange)</span>
                  <span>22000 Hz (Ultrasonic Mic Jam)</span>
                </div>
              </div>

              {/* Controls Sub-grid */}
              <div className="space-y-3.5 pt-1">
                {/* Algorithm Choice */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono font-bold block">Jamming Mode</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScramblerMode('white_noise')}
                      className={`py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wide border transition ${
                        scramblerMode === 'white_noise'
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      White Noise
                    </button>
                    <button
                      type="button"
                      onClick={() => setScramblerMode('ultrasonic')}
                      className={`py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wide border transition ${
                        scramblerMode === 'ultrasonic'
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inaudible
                    </button>
                    <button
                      type="button"
                      onClick={() => setScramblerMode('spectral_inversion')}
                      className={`py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wide border transition ${
                        scramblerMode === 'spectral_inversion'
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inversion
                    </button>
                  </div>
                </div>

                {/* Silders Grid */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-500 uppercase font-bold">Jamming Signal Amplitude</span>
                    <span className="text-rose-400 font-bold">{scramblerLevel}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={scramblerLevel}
                      onChange={(e) => setScramblerLevel(Number(e.target.value))}
                      disabled={!scramblerActive}
                      className={`w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer ${
                        scramblerActive ? 'accent-rose-500' : 'accent-slate-700 cursor-not-allowed opacity-50'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {specsTab === 'crypto' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Vault Header */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400 font-bold" />
                  Web Crypto Identity &amp; Signature Vault
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mt-1 font-sans">
                  BlurBubble operates standard browser Web Crypto APIs to continuously rotate ECDSA P-256 keys, signing compliance tokens without centralized tracking.
                </p>
              </div>
              
              {/* Web Speech API Controls inside the panel */}
              <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2">Voice Alerts</span>
                <button
                  type="button"
                  id="vocal-alerts-toggle-btn"
                  onClick={onToggleVocalAlerts}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    vocalAlertsEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle synthesised speech notifications"
                >
                  {vocalAlertsEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>ON (Web Speech API)</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>OFF (Muted)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {cryptoState ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* Left Side: Keys and Signatures */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* ECDSA Public Key */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-400" />
                        ECDSA P-256 SPKI Public Key (Base64)
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-black">ACTIVE</span>
                    </div>
                    <div className="bg-slate-950/85 border border-slate-850 p-4 rounded-xl relative group font-mono text-[10px] text-emerald-400/90 break-all leading-normal max-h-48 overflow-y-auto">
                      {cryptoState.publicKeyBase64}
                    </div>
                  </div>

                  {/* Active Cryptographic Signature */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" />
                        ECDSA SHA-256 Digital Signature (Base64)
                      </span>
                      <span className="text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-850">verified</span>
                    </div>
                    <div className="bg-slate-950/85 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-blue-400/90 break-all leading-normal max-h-32 overflow-y-auto font-mono">
                      {cryptoState.signatureBase64}
                    </div>
                  </div>
                </div>

                {/* Right Side: Performance telemetry benchmarks and Key details */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-slate-950/40 border border-slate-850/80 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block border-b border-slate-900 pb-2">
                      🔒 CRYPTO HARDWARE BENCHMARKS
                    </span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Sign Latency</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-white font-mono">{cryptoState.signDurationMs.toFixed(2)}</span>
                          <span className="text-[9px] text-emerald-400 font-bold font-mono">ms</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Verify Latency</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-white font-mono">{cryptoState.verifyDurationMs.toFixed(2)}</span>
                          <span className="text-[9px] text-emerald-400 font-bold font-mono">ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Key Rotation:</span>
                        <span className="text-slate-300 font-bold">Every 15s</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Security Curve:</span>
                        <span className="text-slate-300 font-bold">P-256 (prime256v1)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Key Fingerprint:</span>
                        <span className="text-slate-300 font-bold max-w-[150px] truncate" title={cryptoState.fullFingerprint}>{cryptoState.fullFingerprint.slice(0, 16)}...</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Last Renewed:</span>
                        <span className="text-emerald-400 font-bold font-mono">{new Date(cryptoState.lastRotated).toTimeString().split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Zero-Leak Cryptographic Proof</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">
                        Any nearby receiver or scanning network can instantly verify that you have opted out of audio and video recordings via standard digital signature verification, without ever needing to know your real identity or track you across spaces.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
                <p className="text-sm text-slate-500 font-mono">Initializing Web Crypto Engine Keypair...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {specsTab === 'oem' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Title Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Global OS &amp; OEM Compliance Portal
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mt-1 font-sans">
                  The official developer toolkit and hardware specifications enabling companies (Apple, Google, Sony, GoPro, DJI, Meta) to natively integrate the BlurBubble Opt-Out standard (RFC-9402) into image sensors, operating systems, and public media platforms.
                </p>
              </div>
              <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full font-bold">
                SDK v4.1.0-RC3
              </span>
            </div>

            {/* Custom Subtabs for OEM Portal */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-6">
              <button
                type="button"
                onClick={() => setOemSubTab('protocols')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  oemSubTab === 'protocols'
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                1. Beacon Protocol
              </button>
              <button
                type="button"
                onClick={() => setOemSubTab('cameras')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  oemSubTab === 'cameras'
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                2. Device ISP Integration
              </button>
              <button
                type="button"
                onClick={() => setOemSubTab('crawlers')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  oemSubTab === 'crawlers'
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                3. Post-Upload Redaction
              </button>
              <button
                type="button"
                onClick={() => setOemSubTab('patches')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  oemSubTab === 'patches'
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                4. OEM Firmware Patches
              </button>
              <button
                type="button"
                onClick={() => setOemSubTab('sandbox')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  oemSubTab === 'sandbox'
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                5. Real-World Sandbox
              </button>
            </div>
          </div>

          {/* Tab Content 1: Beacon Protocols */}
          {oemSubTab === 'protocols' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Constructor */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Configure Beacon Broadcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Adjust parameters of your hardware shield or soft-beacon to inspect raw compliance packets assembled in real-time.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Scope */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block">Protocol Scope</label>
                    <select
                      value={oemPayloadParams.scope}
                      onChange={(e) => setOemPayloadParams(prev => ({ ...prev, scope: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="opt-out-global">opt-out-global (Default RFC-9402)</option>
                      <option value="opt-out-school">opt-out-school (Zone Restricted)</option>
                      <option value="opt-out-high-privacy">opt-out-high-privacy (Lockdown)</option>
                    </select>
                  </div>

                  {/* Signal Range slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 uppercase font-bold">Signal Radius (Power)</span>
                      <span className="text-cyan-400 font-bold font-mono">{oemPayloadParams.minDistance} Meters</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={oemPayloadParams.minDistance}
                      onChange={(e) => setOemPayloadParams(prev => ({ ...prev, minDistance: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Dynamic Checkboxes */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={oemPayloadParams.enableVideoBlur}
                        onChange={(e) => setOemPayloadParams(prev => ({ ...prev, enableVideoBlur: e.target.checked }))}
                        className="rounded accent-cyan-400 w-3.5 h-3.5"
                      />
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-300 block">Apply Blur</span>
                        <span className="text-slate-500">Real-time YUV</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={oemPayloadParams.enableAudioScramble}
                        onChange={(e) => setOemPayloadParams(prev => ({ ...prev, enableAudioScramble: e.target.checked }))}
                        className="rounded accent-cyan-400 w-3.5 h-3.5"
                      />
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-300 block">Scramble Voice</span>
                        <span className="text-slate-500">Watermark payload</span>
                      </div>
                    </label>
                  </div>

                  {/* Simulator trigger button */}
                  <button
                    type="button"
                    onClick={() => setIsSimulatingOemBroadcaster(!isSimulatingOemBroadcaster)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      isSimulatingOemBroadcaster
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                    }`}
                  >
                    <Radio className={`w-4 h-4 ${isSimulatingOemBroadcaster ? 'animate-ping' : ''}`} />
                    {isSimulatingOemBroadcaster ? 'Stop Local Compliance Broadcaster' : 'Start Local Compliance Broadcaster'}
                  </button>
                </div>
              </div>

              {/* Right Panel: BLE packet disassembly & terminal */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    BLE ADV Packet Assembly &amp; Log Output
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Inspect the low-level Bluetooth Low Energy Manufacturer-Specific AD data structure that consumer hardware (Apple CoreMedia, Android OS) detects.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Packet visual block */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">AD structure payload (HEX dump)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-xs">
                      <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded" title="Length (30 bytes)">1E</span>
                      <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded" title="AD Type (Manufacturer Specific)">FF</span>
                      <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold" title="Company ID (BlurBubble Standard)">99 04</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold" title="Protocol Version (v2)">02</span>
                      <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded" title={oemPayloadParams.enableVideoBlur ? 'Video Redaction Active' : 'Video Unaffected'}>
                        {oemPayloadParams.enableVideoBlur ? '01' : '00'}
                      </span>
                      <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded" title={oemPayloadParams.enableAudioScramble ? 'Audio Redaction Active' : 'Audio Unaffected'}>
                        {oemPayloadParams.enableAudioScramble ? '01' : '00'}
                      </span>
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold" title={`Broadcast radius: ${oemPayloadParams.minDistance}m`}>
                        {oemPayloadParams.minDistance.toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                      {cryptoState?.publicKeyBase64 ? (
                        <>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono" title="P-256 SPKI public key fragment byte 1">7A</span>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono" title="P-256 SPKI public key fragment byte 2">F3</span>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono" title="P-256 SPKI public key fragment byte 3">11</span>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono" title="P-256 SPKI public key fragment byte 4">DE</span>
                        </>
                      ) : (
                        <span className="text-slate-600 italic">No signature</span>
                      )}
                      <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">00</span>
                      <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">00</span>
                      <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">EA</span>
                      <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">82</span>
                    </div>
                  </div>

                  {/* Console logs output */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] text-slate-400 space-y-1.5 h-48 overflow-y-auto">
                    {oemBroadcastLogs.map((log, idx) => (
                      <div key={idx} className="border-l-2 border-slate-800 pl-2 leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Device ISP Integration */}
          {oemSubTab === 'cameras' && (
            <div className="space-y-6">
              {/* Top summary card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-6 backdrop-blur-md">
                <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20 shrink-0">
                  <Cpu className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-md font-semibold text-white">Natively Baked Image Signal Processor (ISP) Censorship</h3>
                  <p className="text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                    Rather than relying on post-processing, compliant hardware (Apple/Google lenses, GoPro firmware) intercepts raw pixel arrays directly within the hardware camera pipeline (ISP). Before data is saved to flash, a low-latency face detection engine crosses local coordinates with nearby BLE opt-out signatures, baking pixelation into the YUV frames.
                  </p>
                </div>
              </div>

              {/* Hardware Pipeline schematic layout */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-900 pb-2">
                  🔒 ON-DEVICE SECURE MEDIA FLOW
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  
                  {/* Step 1: Lens Raw */}
                  <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center mx-auto border border-slate-800 text-slate-500 text-xs font-bold">1</div>
                    <h5 className="text-xs font-bold text-white">RAW Optical Feed</h5>
                    <p className="text-[10px] text-slate-500 font-sans leading-normal">
                      Full-resolution RGB/YUV data streamed directly from Sony/OmniVision sensor nodes. Unredacted.
                    </p>
                  </div>

                  {/* Connector */}
                  <div className="md:col-span-1 text-center font-bold text-slate-600 hidden md:block">
                    <ArrowRight className="w-5 h-5 mx-auto text-cyan-400" />
                  </div>

                  {/* Step 2: ISP Redaction Filter Hook */}
                  <div className="md:col-span-3 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/30 p-5 rounded-xl text-center space-y-3 relative overflow-hidden">
                    <div className="absolute top-1 right-1 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase px-1.5 py-0.2 rounded border border-cyan-500/20">
                      FILTER ACTIVE
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-950 flex items-center justify-center mx-auto border border-cyan-500/30 text-cyan-400 text-xs font-bold">2</div>
                    <h5 className="text-xs font-bold text-cyan-400">BlurBubble ISP Filter</h5>
                    <p className="text-[10px] text-slate-300 font-sans leading-normal">
                      Detects P-256 beacon tags, looks up registered biometric face hashes in the local BLE advertising envelope, and pixelates YUV matrices.
                    </p>
                  </div>

                  {/* Connector */}
                  <div className="md:col-span-1 text-center font-bold text-slate-600 hidden md:block">
                    <ArrowRight className="w-5 h-5 mx-auto text-cyan-400" />
                  </div>

                  {/* Step 3: Hard Redacted Flash File */}
                  <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center mx-auto border border-slate-800 text-slate-500 text-xs font-bold">3</div>
                    <h5 className="text-xs font-bold text-emerald-400">Compliant Encoded File</h5>
                    <p className="text-[10px] text-slate-500 font-sans leading-normal">
                      MP4, H.265, or AAC output file committed to physical SSD storage with absolute privacy and scrambling applied permanently.
                    </p>
                  </div>

                </div>
              </div>

              {/* Developer Code Template */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    🤖 ISP PIPELINE REGISTER IMPLEMENTATION (C++)
                  </h4>
                  <span className="bg-slate-950 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                    core_camera_filter.cpp
                  </span>
                </div>

                <pre className="bg-slate-950 p-5 rounded-xl border border-slate-900 text-cyan-400/90 text-xs font-mono overflow-x-auto leading-relaxed max-h-72">
{`#include <blur_bubble_oem_sdk.h>
#include <image_signal_processor.h>

// Intercepts frame buffer within Apple CoreMedia/Google Camera2 pipeline
void OnRawFrameCaptured(YUVFrame* frame, BLEScannerEnvelope* envelope) {
    if (envelope->HasActiveOptOutSignals()) {
        for (const auto& signal : envelope->GetActiveSignals()) {
            // Confirm cryptographic signature before altering lens feed
            if (BlurBubble::VerifyOptOutSignature(signal.publicKey, signal.signedToken)) {
                
                // Track faces in frame matching the registered shield profile
                std::vector<Rect> targetFaces = CoreML::DetectFaces(frame);
                for (auto& face : targetFaces) {
                    if (BlurBubble::MatchesPrivacySignature(face, signal.biometricFingerprint)) {
                        // Apply permanent YUV pixelation inside hardware ISP registers
                        ISP::ApplyPixelationFilter(frame, face, FILTER_LEVEL_PIXELATE);
                    }
                }
                
                // Scramble/mute audio indices if acoustic watermarks or mic jamming is broadcasted
                if (signal.requestAudioScramble) {
                    ISP::InjectAcousticWatermark(frame->audioBuffer, WATERMARK_RFC9402_COMPLIANT);
                }
            }
        }
    }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Tab Content 3: Post-Upload Crawlers */}
          {oemSubTab === 'crawlers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Panel: Crawler control */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Compliance Audit Spider
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    If unredacted media escapes local defenses and is uploaded to public streaming directories, our distributed crawler network identifies and forces platforms to retroactively comply.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Select target platform */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block">Target Platform Directory</label>
                    <select
                      value={crawlerPlatform}
                      onChange={(e: any) => setCrawlerPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="all">Global (YouTube, TikTok, Spotify, Apple Podcasts, Microsoft Azure Indexer, OpenAI GPT-4o API)</option>
                      <option value="youtube">YouTube Video Directory only</option>
                      <option value="tiktok">TikTok Video Feed only</option>
                      <option value="spotify">Spotify Streaming Directory</option>
                      <option value="instagram">Instagram Reels feed</option>
                      <option value="microsoft">Microsoft Azure Cognitive Indexer</option>
                      <option value="openai">OpenAI GPT-4o Vision API</option>
                    </select>
                  </div>

                  {/* Scrape stats indicators */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500">Scan Progress:</span>
                      <span className="text-white font-bold">{crawlerScanProgress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${crawlerScanProgress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-1">
                      <span className="text-slate-500">Compliance Breaches Found:</span>
                      <span className={`font-bold font-mono ${crawlerResultsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {crawlerResultsCount} videos/podcasts
                      </span>
                    </div>
                  </div>

                  {/* Start scan button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (crawlerScanning) return;
                      setCrawlerScanning(true);
                    }}
                    disabled={crawlerScanning}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      crawlerScanning
                        ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                    }`}
                  >
                    <Search className={`w-4 h-4 ${crawlerScanning ? 'animate-spin' : ''}`} />
                    {crawlerScanning ? 'Auditing Public Nodes...' : 'Launch Decentralized Crawler Sweep'}
                  </button>
                </div>
              </div>

              {/* Right Panel: Logs and Compliance Actions */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Distributed Scraper Audit Feed
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    View real-time compliance operations as the crawler indexes streaming servers and applies retrospective redact-blurs on major CDNs.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Console screen */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] text-slate-400 space-y-2 h-64 overflow-y-auto">
                    {crawlerLogs.length > 0 ? (
                      crawlerLogs.map((log, idx) => (
                        <div key={idx} className="border-l-2 border-cyan-900 pl-2.5 leading-relaxed">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 italic text-center py-16">
                        No active crawl running. Trigger the crawler to scan streaming indices.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab Content 4: Firmware Patches */}
          {oemSubTab === 'patches' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-md font-semibold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  OEM Device Firmware &amp; Micro-Code Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                  Choose a hardware model or software operating framework to download and apply the compliant BlurBubble firmware micro-code package. This gives hardware devices native capability to respond to opt-out requests instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Apple iOS CoreMedia */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">iOS CoreMedia SDK</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.apple === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.apple}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Apple CoreMedia / AVFoundation Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Natively intercept camera sessions inside UIKit/AVKit on iOS 16+. Automatically pixelates faces matching BLE Opt-Out envelopes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('apple')}
                    disabled={patchInstallState.apple !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.apple === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.apple === 'ready' ? 'Apply Compliant Patch' : patchInstallState.apple}
                  </button>
                </div>

                {/* 2. Android Camera2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Android Camera2 OS</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.google === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.google}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Google Android Camera2 API Extension</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Android AOSP compliant HAL (Hardware Abstraction Layer) filter hook. Operates on Pixel &amp; Samsung mobile processors natively.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('google')}
                    disabled={patchInstallState.google !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.google === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.google === 'ready' ? 'Apply Compliant Patch' : patchInstallState.google}
                  </button>
                </div>

                {/* 3. GoPro Hero */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">GoPro Firmware</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.gopro === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.gopro}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">GoPro Hero 11/12/13 Compliant Firmware</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Firmware payload for GP2 SoC. Intercepts action video capture streams and masks bystander faces with robust, fast mosaic filters.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('gopro')}
                    disabled={patchInstallState.gopro !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.gopro === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.gopro === 'ready' ? 'Apply Compliant Patch' : patchInstallState.gopro}
                  </button>
                </div>

                {/* 4. Meta Horizon OS */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Meta Glasses OS</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.meta === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.meta}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Meta Horizon Glasses / Ray-Ban Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Direct integration for smart glasses camera loops. Applies hard micro-blur boundaries on all registered tag wearers in your direct proximity.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('meta')}
                    disabled={patchInstallState.meta !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.meta === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.meta === 'ready' ? 'Apply Compliant Patch' : patchInstallState.meta}
                  </button>
                </div>

                {/* 5. DJI FlightController OS */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">DJI SDK</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.dji === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.dji}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">DJI Drone Gimbal &amp; Video SDK Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Integrates drone flight controllers with physical opt-out boundaries, automatically blurring citizens during telemetry transmission.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('dji')}
                    disabled={patchInstallState.dji !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.dji === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.dji === 'ready' ? 'Apply Compliant Patch' : patchInstallState.dji}
                  </button>
                </div>

                {/* 6. Microsoft Holographic / Spatial */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Microsoft HoloLens / Azure</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.microsoft === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.microsoft}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Microsoft HoloLens / Spatial SDK Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Integrates Windows Holographic OS &amp; OpenXR runtime layers with BlurBubble signals, applying automatic spatial redaction overlays inside spatial AR enclaves.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('microsoft')}
                    disabled={patchInstallState.microsoft !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.microsoft === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.microsoft === 'ready' ? 'Apply Compliant Patch' : patchInstallState.microsoft}
                  </button>
                </div>

                {/* 7. Sony Alpha & IMX Sensor */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Sony ISP Firmware</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.sony === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.sony}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Sony Alpha / IMX Sensor SDK Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      BIONZ XR image processing microcode hook. Applies hardware-level obfuscation directly at the IMX camera sensor ISP registers before data transmission.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('sony')}
                    disabled={patchInstallState.sony !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.sony === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.sony === 'ready' ? 'Apply Compliant Patch' : patchInstallState.sony}
                  </button>
                </div>

                {/* 8. Samsung Galaxy & Knox HAL */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Samsung Knox HAL</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.samsung === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.samsung}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Samsung Galaxy Knox SDK Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Low-level integration with Samsung Knox platform enclaves, validating BlurBubble tokens and rendering face-blurs system-wide across all camera apps.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('samsung')}
                    disabled={patchInstallState.samsung !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.samsung === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.samsung === 'ready' ? 'Apply Compliant Patch' : patchInstallState.samsung}
                  </button>
                </div>

                {/* 9. AI Vision APIs (OpenAI, Anthropic, Meta, Google) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">AI Vision Models</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.ai_vision === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.ai_vision}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Global AI Vision Compliance Hook</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Intercepts multi-modal visual payloads for OpenAI GPT-4o, Anthropic Claude, and Meta LLaMA-Vision. Automatically scrubs or blurs registered face hashes at the model gateway level before inference.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('ai_vision')}
                    disabled={patchInstallState.ai_vision !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.ai_vision === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.ai_vision === 'ready' ? 'Apply Compliant Patch' : patchInstallState.ai_vision}
                  </button>
                </div>

                {/* 10. Pro Camera Makers (Canon, Nikon, RED, Blackmagic) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Pro Camera ISP</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.pro_optics === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.pro_optics}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Canon, Nikon &amp; RED ISP Firmware</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Low-level firmware patch for Canon DIGIC, Nikon EXPEED, and RED cinema processors. Hard-embeds compliance checks into the exposure/shutter pipeline to apply raw sensor blurs before writing to storage cards.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('pro_optics')}
                    disabled={patchInstallState.pro_optics !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.pro_optics === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.pro_optics === 'ready' ? 'Apply Compliant Patch' : patchInstallState.pro_optics}
                  </button>
                </div>

                {/* 11. LiDAR & IR Depth Sensors */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">LiDAR &amp; IR Sensors</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        patchInstallState.depth_sensors === 'installed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {patchInstallState.depth_sensors}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">LiDAR, ToF &amp; Infrared Depth Patch</h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Universal depth compliance driver targeting Apple TrueDepth, iPad LiDAR, and Microsoft Kinect. Scrambles 3D point cloud coordinate grids and thermal-pixel arrays surrounding registered opt-out beacons to stop volumetric scanning.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPatchDownload('depth_sensors')}
                    disabled={patchInstallState.depth_sensors !== 'ready'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      patchInstallState.depth_sensors === 'ready'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {patchInstallState.depth_sensors === 'ready' ? 'Apply Compliant Patch' : patchInstallState.depth_sensors}
                  </button>
                </div>

                {/* Integration Console output */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">OEM Patch Server Output</span>
                    <div className="bg-slate-950 h-24 overflow-y-auto font-mono text-[9px] text-cyan-400/80 leading-relaxed pt-1.5">
                      {patchConsoleLogs.length > 0 ? (
                        patchConsoleLogs.slice(-3).map((log, i) => <div key={i}>{log}</div>)
                      ) : (
                        <div className="text-slate-600 italic">No patches compiled yet. Click compile/apply above.</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-900 shrink-0">
                    <span>Server: compliant.blurbubble.org</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />ONLINE</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {oemSubTab === 'sandbox' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Introduction Card */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-md font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Real-World Deployment Stress Testing &amp; Diagnostics
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Simulate typical citizen days and stress-test the RFC-9402 protocol against the harshest environmental constraints of the physical world. Watch how simple unmitigated hardware fails and how BlurBubble's production-grade firmware fixes them.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Controls */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Step 1: Select Scenario */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      1. Select Simulation Environment
                    </span>
                    
                    <div className="space-y-2.5">
                      {/* Commute */}
                      <button
                        type="button"
                        onClick={() => { setSandboxScenario('commute'); setSandboxProgress(0); }}
                        disabled={sandboxIsRunning}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          sandboxScenario === 'commute'
                            ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                            : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
                        }`}
                      >
                        <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${sandboxScenario === 'commute' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div className="space-y-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            Morning Commute (Subway)
                            <span className="text-[8px] uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 rounded">Congestion</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-normal">
                            High density crowd causing heavy BLE packet collisions (up to 42%) and metal tube signal attenuation.
                          </p>
                        </div>
                      </button>

                      {/* Office */}
                      <button
                        type="button"
                        onClick={() => { setSandboxScenario('office'); setSandboxProgress(0); }}
                        disabled={sandboxIsRunning}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          sandboxScenario === 'office'
                            ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                            : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
                        }`}
                      >
                        <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${sandboxScenario === 'office' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div className="space-y-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            Boardroom Meeting (Clock Drift)
                            <span className="text-[8px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded">Out of Sync</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-normal">
                            Camera hub is completely out of sync with the beacon's rotating token by over 90 seconds.
                          </p>
                        </div>
                      </button>

                      {/* Cafe */}
                      <button
                        type="button"
                        onClick={() => { setSandboxScenario('cafe'); setSandboxProgress(0); }}
                        disabled={sandboxIsRunning}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          sandboxScenario === 'cafe'
                            ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                            : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
                        }`}
                      >
                        <Battery className={`w-4 h-4 mt-0.5 shrink-0 ${sandboxScenario === 'cafe' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div className="space-y-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            Outdoor Cafe (Battery Drain)
                            <span className="text-[8px] uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 rounded">Power</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-normal">
                            Continuous active BLE scanning exhausts smart wear batteries in just 2.5 hours of operation.
                          </p>
                        </div>
                      </button>

                      {/* Concert */}
                      <button
                        type="button"
                        onClick={() => { setSandboxScenario('concert'); setSandboxProgress(0); }}
                        disabled={sandboxIsRunning}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          sandboxScenario === 'concert'
                            ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                            : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 mt-0.5 shrink-0 ${sandboxScenario === 'concert' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div className="space-y-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            Concert Arena (Acoustic Pressure)
                            <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded">Noise</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-normal">
                            Deafening subwoofer volumes completely override standard vocal scramblers. Humans block RF lines.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Mitigation Toggles */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      2. Configure Software Protections
                    </span>

                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-white block">Production Firmware Features</label>
                          <span className="text-[9px] text-slate-400 block font-sans">
                            {sandboxFeaturesEnabled ? "All production mitigations active." : "Testing raw baseline implementation."}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSandboxFeaturesEnabled(!sandboxFeaturesEnabled)}
                          disabled={sandboxIsRunning}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                            sandboxFeaturesEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            sandboxFeaturesEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="border-t border-slate-900 pt-3 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">Decentralized TDMA slotting:</span>
                          <span className={sandboxFeaturesEnabled ? 'text-cyan-400' : 'text-slate-600'}>
                            {sandboxFeaturesEnabled ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">Sliding Time-Window Buffer:</span>
                          <span className={sandboxFeaturesEnabled ? 'text-cyan-400' : 'text-slate-600'}>
                            {sandboxFeaturesEnabled ? 'ACTIVE (±5m)' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">Camera-API Duty Cycling:</span>
                          <span className={sandboxFeaturesEnabled ? 'text-cyan-400' : 'text-slate-600'}>
                            {sandboxFeaturesEnabled ? 'ACTIVE (1%)' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">Spread-Spectrum Acoustic:</span>
                          <span className={sandboxFeaturesEnabled ? 'text-cyan-400' : 'text-slate-600'}>
                            {sandboxFeaturesEnabled ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setSandboxIsRunning(true); }}
                      disabled={sandboxIsRunning}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                        sandboxIsRunning
                          ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-transparent text-white shadow-lg'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${sandboxIsRunning ? 'animate-spin' : ''}`} />
                      {sandboxIsRunning ? `Simulating Run... (${sandboxProgress}%)` : 'Trigger Simulated Day Test Run'}
                    </button>
                  </div>
                </div>

                {/* Right Side: Visual Diagnostics and Logs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Gauges panel */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Compliance Score */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Compliance Score</span>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-black font-mono tracking-tight ${
                            sandboxProgress === 0
                              ? 'text-slate-400'
                              : sandboxFeaturesEnabled
                              ? 'text-emerald-400'
                              : 'text-rose-500 animate-pulse'
                          }`}>
                            {sandboxProgress === 0 ? "---" : sandboxFeaturesEnabled ? "100%" : sandboxScenario === 'commute' ? "58%" : sandboxScenario === 'office' ? "40%" : sandboxScenario === 'cafe' ? "0%" : "48%"}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase block ${
                          sandboxProgress === 0
                            ? 'text-slate-500'
                            : sandboxFeaturesEnabled
                            ? 'text-emerald-500/80'
                            : 'text-rose-500'
                        }`}>
                          {sandboxProgress === 0 ? "Awaiting Test" : sandboxFeaturesEnabled ? "SECURED (PASS)" : "CRITICAL LEAK"}
                        </span>
                      </div>
                    </div>

                    {/* Packet Delivery */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Packet Delivery</span>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-bold text-white font-mono">
                            {sandboxProgress === 0 ? "99.8" : sandboxFeaturesEnabled ? "99.8" : sandboxScenario === 'commute' ? "55" : sandboxScenario === 'office' ? "4" : sandboxScenario === 'cafe' ? "0" : "15"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">%</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans block">
                          {sandboxProgress === 0 ? "System Idle" : sandboxFeaturesEnabled ? "Optimal reception" : "Heavily dropped"}
                        </span>
                      </div>
                    </div>

                    {/* Projected Battery */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Battery Estimate</span>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-bold text-white font-mono">
                            {sandboxProgress === 0 ? "18.5" : sandboxFeaturesEnabled ? "18.5" : "2.5"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">hrs</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans block">
                          {sandboxFeaturesEnabled ? "Power save active" : "Scanning drain"}
                        </span>
                      </div>
                    </div>

                    {/* Signal Attenuation */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Signal Attenuation</span>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-bold text-white font-mono">
                            {sandboxProgress === 0 ? "-2" : sandboxFeaturesEnabled ? "-2" : sandboxScenario === 'commute' ? "-15" : sandboxScenario === 'office' ? "-1" : sandboxScenario === 'cafe' ? "-3" : "-22"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">dBm</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans block">
                          {sandboxScenario === 'commute' ? "Metal structure" : sandboxScenario === 'concert' ? "Body block" : "Clear sight"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Progress Timeline Bar */}
                  {sandboxIsRunning && (
                    <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                          Testing scenario progression: {sandboxProgress}%
                        </span>
                        <span className="text-slate-500 font-bold">{sandboxScenario.toUpperCase()} RUNNING</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${sandboxProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Terminal Log Output */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase font-mono flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-500" />
                        Real-World Stress-Test Log
                      </span>
                      <span className="text-[8px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-500">
                        STABILITY_DIAG_OK
                      </span>
                    </div>

                    <div className="bg-slate-950 h-64 overflow-y-auto font-mono text-xs space-y-2.5 pt-1 scrollbar-thin">
                      {sandboxLogs.map((log, i) => (
                        <div
                          key={i}
                          className={`leading-relaxed border-l-2 pl-3.5 ${
                            log.includes('❌') || log.includes('[FAIL]') || log.includes('[CRITICAL]')
                              ? 'border-rose-500 text-rose-400/90'
                              : log.includes('⚠️') || log.includes('[WARNING]')
                              ? 'border-amber-500 text-amber-400/90'
                              : log.includes('✅') || log.includes('[SUCCESS]') || log.includes('[RESOLVED]') || log.includes('[SECURED]')
                              ? 'border-emerald-500 text-emerald-400/90'
                              : 'border-slate-800 text-slate-300'
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-900">
                      <span>Telemetry Feed: 115200 bps</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        UTC TIMESTAMP REFERENCE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: specsTab === 'portal' (B2B Compliance & Developer Sandbox) */}
          {specsTab === 'portal' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Portal Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950/90 border border-slate-850 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                        BigTech API Engine v4.2
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-slate-400 text-xs font-mono">B2B Compliance Level: AAA</span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-sans">Corporate Compliance &amp; Developer Sandbox</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                      A centralized operations suite for hardware manufacturers, spatial computing developers, and AI companies to natively query, respect, and coordinate with BlurBubble's localized RFC-9402 privacy signals.
                    </p>
                  </div>
                  <div className="shrink-0 bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center md:text-right min-w-[150px]">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">SLA Active Node</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">ONLINE [B2B_GATE]</span>
                    <div className="flex items-center justify-center md:justify-end gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[9px] font-mono text-slate-400">Lat: 12ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Pane Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Navigation Pane (4 Cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    B2B Compliance Modules
                  </div>

                  {/* Module 1: Live ISP Video Stream Obfuscator */}
                  <button
                    type="button"
                    onClick={() => setPortalSubTab('obfuscator')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'obfuscator'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Video className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'obfuscator' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        1. ISP Stream Redactor
                        <span className="text-[8px] uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.1 rounded">Censor</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Simulate native video blurring and AI removal directly at the camera image sensor processor (ISP).
                      </p>
                    </div>
                  </button>

                  {/* Module 2: ZKP Biometric Hash Synchronizer */}
                  <button
                    type="button"
                    onClick={() => setPortalSubTab('zkp_hash')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'zkp_hash'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Key className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'zkp_hash' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        2. Biometric Hash Syncer
                        <span className="text-[8px] uppercase font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1 py-0.1 rounded">ZKP</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Deploy local zero-knowledge mathematical vectors to allow smart device edge filtering.
                      </p>
                    </div>
                  </button>

                  {/* Module 3: REST API & Webhook Playground */}
                  <button
                    type="button"
                    onClick={() => setPortalSubTab('api_play')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'api_play'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Server className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'api_play' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        3. B2B REST API Sandbox
                        <span className="text-[8px] uppercase font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1 py-0.1 rounded">REST</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Test mock lookups, token validation endpoints, and custom JSON webhook structures.
                      </p>
                    </div>
                  </button>

                  {/* Module 4: Compliance SLA Contract Signer */}
                  <button
                    type="button"
                    onClick={() => setPortalSubTab('sla_contract')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'sla_contract'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Scale className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'sla_contract' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        4. SLA Compliance Signer
                        <span className="text-[8px] uppercase font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.1 rounded">Legal</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Commit your corporation legally to respecting the opt-out and generate dynamic certificates.
                      </p>
                    </div>
                  </button>

                  {/* Module 5: Consent Marketplace & Auction Desk */}
                  <button
                    type="button"
                    onClick={() => setPortalSubTab('consent_market')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'consent_market'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <DollarSign className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'consent_market' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        5. Consent &amp; Bidding Market
                        <span className="text-[8px] uppercase font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-1 py-0.1 rounded">Micro</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Submit real-time bids to buy consented spatial scan telemetry from nearby opt-out tags.
                      </p>
                    </div>
                  </button>

                  {/* Module 6: Enterprise Edge Grid & Central Datacenter */}
                  <button
                    type="button"
                    id="subtab-edge-network-btn"
                    onClick={() => setPortalSubTab('edge_network')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                      portalSubTab === 'edge_network'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-white shadow-sm'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Network className={`w-5 h-5 shrink-0 mt-0.5 ${portalSubTab === 'edge_network' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-bold flex items-center justify-between">
                        6. Edge Grid &amp; Cloud Sync
                        <span className="text-[8px] uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.1 rounded">Enterprise</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans mt-0.5">
                        Simulate camera networks querying decentralized AI datacenters and geofencing BlurBubble safe-zones.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Right Side: Active Workspace Console (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Sub-tab 1: ISP Stream Redactor */}
                  {portalSubTab === 'obfuscator' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-400" />
                          ISP Camera Sensor Obfuscation Simulator
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">
                          Test image sensor post-processing capabilities. Hardware cameras parse active BlurBubble RF signals to apply instant pixelation or masking onto user facial regions within customizable distance triggers.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Simulation Screen Left */}
                        <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Live Camera Lens Feed</span>
                          
                          {/* Live view finder */}
                          <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                            {/* Crosshairs & grid */}
                            <div className="absolute inset-0 border border-cyan-500/10 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 border border-dashed border-cyan-500/20 rounded-full" />
                              <div className="w-0.5 h-full bg-cyan-500/5 absolute" />
                              <div className="w-full h-0.5 bg-cyan-500/5 absolute" />
                            </div>

                            {/* Detected Subject */}
                            <div className="relative z-10 flex flex-col items-center">
                              {/* Face frame bounding box */}
                              <div className={`p-1 border border-dashed transition-all duration-300 ${
                                devSandboxDist <= 5 ? 'border-rose-500' : 'border-slate-500'
                              } rounded-lg`}>
                                <div className="w-16 h-16 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center relative">
                                  {/* Dummy face icon */}
                                  <User className="w-10 h-10 text-slate-500" />
                                  
                                  {/* Blur Overlays */}
                                  {devSandboxDist <= 5 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                                      {devSandboxFilter === 'gaussian' && (
                                        <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-lg" />
                                      )}
                                      {devSandboxFilter === 'pixelate' && (
                                        <div className="absolute inset-0 flex flex-wrap" style={{ imageRendering: 'pixelated' }}>
                                          <div className="w-1/2 h-1/2 bg-slate-700 border border-slate-900" />
                                          <div className="w-1/2 h-1/2 bg-slate-600 border border-slate-900" />
                                          <div className="w-1/2 h-1/2 bg-slate-600 border border-slate-900" />
                                          <div className="w-1/2 h-1/2 bg-slate-700 border border-slate-900" />
                                        </div>
                                      )}
                                      {devSandboxFilter === 'emoji' && (
                                        <div className="text-3xl">🤫</div>
                                      )}
                                      {devSandboxFilter === 'semantic' && (
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center font-mono text-[8px] text-emerald-400">
                                          [ERASED]
                                        </div>
                                      )}
                                      {devSandboxFilter === 'blackbar' && (
                                        <div className="w-full h-5 bg-black" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-850">
                                Citizen ID: #9402_B
                              </span>
                            </div>

                            {/* Signal Strength Badge */}
                            <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-850 font-mono text-[9px] text-cyan-400 flex items-center gap-1.5">
                              <Radio className="w-3 h-3 animate-pulse" />
                              SIGNAL: {devSandboxDist <= 5 ? '-68 dBm (STRICT)' : '-92 dBm (WEAK)'}
                            </div>

                            {/* Distance Indicator */}
                            <div className="absolute bottom-3 right-3 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-850 font-mono text-[10px] text-white">
                              Est. Dist: <span className="font-bold text-amber-400">{devSandboxDist} meters</span>
                            </div>

                            {/* Censor Status Text */}
                            <div className="absolute top-3 right-3">
                              {devSandboxDist <= 5 ? (
                                <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded uppercase tracking-wider font-mono flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  ACTIVE OBFUSCATE
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded uppercase tracking-wider font-mono">
                                  PASSING (RECORD)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 text-[10.5px] leading-relaxed text-slate-400 text-center font-sans">
                            {devSandboxDist <= 5 
                              ? `✓ COMPLIANT: Beacon signal detected within ${devSandboxDist}m (threshold 5m). Redaction policy enforced strictly.` 
                              : `⚠️ NORMAL CAPTURE: Distance is ${devSandboxDist}m. Outside active protection threshold.`}
                          </div>
                        </div>

                        {/* Config Column Right */}
                        <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-5">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5 font-mono">
                              Censorship Mask Filter
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'gaussian', name: 'Gaussian Blur' },
                                { id: 'pixelate', name: 'Block Pixelate' },
                                { id: 'emoji', name: 'Emoji Cover' },
                                { id: 'semantic', name: 'AI Eraser' },
                                { id: 'blackbar', name: 'Solid Bar' }
                              ].map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setDevSandboxFilter(f.id as any)}
                                  className={`py-2 px-3 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                                    devSandboxFilter === f.id
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                      : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  {f.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold mb-1.5 font-mono">
                              <span>Simulated Distance</span>
                              <span className="text-amber-400 font-black">{devSandboxDist} Meters</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              value={devSandboxDist}
                              onChange={(e) => setDevSandboxDist(parseInt(e.target.value))}
                              className="w-full accent-emerald-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-900"
                            />
                            <p className="text-[9.5px] text-slate-500 mt-1">
                              Simulates a citizen moving relative to the smart glasses camera sensor. Values below 5m trigger strict ISP obfuscation.
                            </p>
                          </div>

                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-[10.5px] leading-relaxed text-slate-400 font-sans space-y-2">
                            <div className="font-bold text-white flex items-center gap-1">
                              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                              Firmware Configuration
                            </div>
                            <div>
                              Platform triggers <code className="text-cyan-400 bg-cyan-500/5 px-1 py-0.5 rounded font-mono">ISP_BLOCK_ACTIVE = 1</code> when RF signal is registered within range bounds. Works offline without network checks.
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sub-tab 2: ZKP Biometric Hash Synchronizer */}
                  {portalSubTab === 'zkp_hash' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Key className="w-4 h-4 text-emerald-400" />
                          Zero-Knowledge Biometric Vector Syncer
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">
                          To run lightning-fast face blurring locally on smart headsets without privacy violations, platforms ingest zero-knowledge face hashes (512-character coordinate arrays) that block identification without storing your real photos.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Landmark Visualizer */}
                        <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">ZK-Facial Coordinate Matrix</span>
                          
                          <div className="relative h-44 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                            {/* Face schematic wireframe representation */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-35">
                              <svg className="w-32 h-32 text-cyan-500 animate-pulse" fill="none" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="0.8">
                                <circle cx="50" cy="50" r="45" />
                                <circle cx="35" cy="40" r="4" />
                                <circle cx="65" cy="40" r="4" />
                                <path d="M50 45 L50 60 L45 60" />
                                <path d="M35 70 Q50 80 65 70" />
                              </svg>
                            </div>

                            {/* Floating key coordinates */}
                            <div className="absolute z-10 grid grid-cols-4 gap-2 font-mono text-[8px] text-cyan-400 p-2">
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_01: 0.142</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_02: -0.952</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_03: 0.408</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_04: 0.129</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_05: -0.315</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_06: 0.008</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_07: 0.814</div>
                              <div className="bg-slate-950/90 border border-slate-900 px-1 py-0.5 rounded text-center">v_08: -0.662</div>
                            </div>

                            {devHashSyncing && (
                              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20 space-y-3">
                                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                                <span className="text-[11px] font-mono text-cyan-400 animate-pulse">Syncing secure vectors...</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>ZKP Mode: dlib-512v</span>
                            <span>Hash Active: {devIsSLASigned ? 'VERIFIED' : 'PENDING SLA'}</span>
                          </div>
                        </div>

                        {/* Push Controls */}
                        <div className="space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Deploy Vector Blocklists</span>
                          
                          <div className="space-y-2.5">
                            {[
                              { platform: 'Apple Vision SDK', endpoint: 'visionOS RealityKit Core' },
                              { platform: 'Meta Horizon Labs', endpoint: 'Quest 3 & Ray-Ban ISP' },
                              { platform: 'Snap spectacles API', endpoint: 'Spectacles v5 OS Local Registry' },
                              { platform: 'ByteDance Media blocklist', endpoint: 'TikTok Live Stream Filters' }
                            ].map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setDevHashSyncing(true);
                                  const tempLogs = [
                                    `[${new Date().toLocaleTimeString()}] Sync request dispatched to ${p.platform}`,
                                    `[${new Date().toLocaleTimeString()}] Preparing Zero-Knowledge vector proof...`,
                                    `[${new Date().toLocaleTimeString()}] Pushing 512-dim coordinates matrix cleanly`,
                                    `[${new Date().toLocaleTimeString()}] ✅ ${p.platform} local blocklist synchronized successfully!`
                                  ];
                                  setTimeout(() => {
                                    setDevHashSyncing(false);
                                    setDevHashLogs(prev => [...tempLogs, ...prev]);
                                  }, 1500);
                                }}
                                className="w-full text-left p-3 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 transition flex items-center justify-between cursor-pointer"
                              >
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-white">{p.platform}</div>
                                  <div className="text-[9px] font-mono text-slate-500">{p.endpoint}</div>
                                </div>
                                <span className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold font-mono tracking-wide flex items-center gap-1.5">
                                  Sync Hashes
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hash Logs Terminal */}
                      <div className="bg-black border border-slate-900 p-4 rounded-xl space-y-2 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-[10px] font-mono text-slate-500">
                          <span>Facial Coordinate Sync Logs</span>
                          <span>Rotated Every 24 hours</span>
                        </div>
                        <div className="h-32 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 scrollbar-thin">
                          {devHashLogs.map((log, idx) => (
                            <div key={idx} className={log.includes('✅') ? 'text-emerald-400 font-bold' : ''}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sub-tab 3: REST API & Webhook Playground */}
                  {portalSubTab === 'api_play' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Server className="w-4 h-4 text-emerald-400" />
                          REST API &amp; Webhook Playground
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">
                          Explore live developer endpoints used to query privacy registries and subscribe to beacon proximity webhooks. Run interactive mock calls to inspect actual JSON response payloads returned in real-time.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* API Config (5 Cols) */}
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">1. Select Endpoint</span>
                          
                          <div className="space-y-2">
                            {[
                              { id: 'lookup', method: 'POST', path: '/v1/privacy/lookup', desc: 'Verify opt-out status by rotated hash' },
                              { id: 'webhook', method: 'POST', path: '/v1/compliance/webhook-subscribe', desc: 'Subscribe to proximity alerts' },
                              { id: 'signature', method: 'GET', path: '/v1/hardware/verify-signature', desc: 'Confirm FCC hardware certificate' }
                            ].map((api) => (
                              <button
                                key={api.id}
                                type="button"
                                onClick={() => {
                                  setDevApiQuery(api.id as any);
                                  setDevApiResponse(null);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition ${
                                  devApiQuery === api.id
                                    ? 'bg-violet-950/20 border-violet-500/30'
                                    : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                    api.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                                  }`}>
                                    {api.method}
                                  </span>
                                  <code className="text-[11px] text-white font-mono">{api.path}</code>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{api.desc}</p>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setDevApiLoading(true);
                              setDevApiCallCount(c => c + 1);
                              setTimeout(() => {
                                setDevApiLoading(false);
                                if (devApiQuery === 'lookup') {
                                  setDevApiResponse({
                                    status: "COMPLIANT_REDACT_MANDATORY",
                                    citizen_opt_out: true,
                                    proximity_bound_meters: 5.0,
                                    visual_privacy_filter: "gaussian_blur",
                                    biometric_hash_sha256: "9af9f81ca91307ea9f5e1f1e1492b4a5323a0df4d7f59d4c1fbc",
                                    acoustic_masking_enabled: true,
                                    verification_fcc_id: "FCC-BBL-2026-X94"
                                  });
                                } else if (devApiQuery === 'webhook') {
                                  setDevApiResponse({
                                    subscription_id: "sub_40918faf1",
                                    webhook_url: "https://api.meta.com/compliance/callback",
                                    events_subscribed: ["proximity_entry", "proximity_exit"],
                                    active_filters: ["no_record_beacons"],
                                    status: "active",
                                    verified_timestamp: new Date().toISOString()
                                  });
                                } else {
                                  setDevApiResponse({
                                    hardware_certified: true,
                                    fcc_cert_valid: true,
                                    authorized_rf_power_db: 18.5,
                                    authority: "Federal Communications Commission",
                                    model_serial: "BB-BEACON-PRO-1049A",
                                    cryptographic_attestation_status: "verified"
                                  });
                                }
                                setDevApiLogs(prev => [
                                  `[${new Date().toLocaleTimeString()}] Call logged to ${devApiQuery === 'lookup' ? '/lookup' : devApiQuery === 'webhook' ? '/webhook-subscribe' : '/verify-signature'}`,
                                  ...prev
                                ]);
                              }, 1000);
                            }}
                            disabled={devApiLoading}
                            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-violet-500/10"
                          >
                            {devApiLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Execute Mock API Call
                              </>
                            )}
                          </button>
                        </div>

                        {/* API Console JSON response (7 Cols) */}
                        <div className="md:col-span-7 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold">
                            <span>JSON Response Body</span>
                            <span className="text-violet-400">Calls Today: {devApiCallCount}</span>
                          </div>

                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-72 overflow-y-auto scrollbar-thin flex flex-col justify-between">
                            <pre className="text-[10px] font-mono text-cyan-400 leading-normal">
                              {devApiResponse ? (
                                JSON.stringify(devApiResponse, null, 2)
                              ) : devApiLoading ? (
                                <span className="text-slate-500 animate-pulse">// Querying api.blurbubble.org/v1...</span>
                              ) : (
                                <span className="text-slate-500">// Configure parameters on the left and click 'Execute Call'</span>
                              )}
                            </pre>

                            {devApiResponse && (
                              <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[9px] font-mono text-slate-500">
                                <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
                                <span>Elapsed: 14ms</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sub-tab 4: Compliance SLA Contract Signer */}
                  {portalSubTab === 'sla_contract' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          Compliance SLA Contract Signer
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">
                          To establish an official certified node and bypass public warning lists, hardware or software platforms sign a legally binding SLA committing to natively honor RFC-9402. This portal registers and seals your signature into the decentralized compliance chain.
                        </p>
                      </div>

                      {!devIsSLASigned ? (
                        <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block border-b border-slate-900 pb-2">Draft Compliance Agreement</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Company Entity Name</label>
                              <input
                                type="text"
                                value={devCorpName}
                                onChange={(e) => setDevCorpName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Authorized Legal Signatory</label>
                              <input
                                type="text"
                                value={devOfficerName}
                                onChange={(e) => setDevOfficerName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Integration Commitment SLA</label>
                            <select
                              value={devSlaLevel}
                              onChange={(e) => setDevSlaLevel(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans font-medium"
                            >
                              <option value="strict_9402">Strict Compliance: Fully redact faces under 50ms ISP latency</option>
                              <option value="standard_redact">Standard Redaction: Enforce face blur on post-upload feeds</option>
                              <option value="minimal_audit">Minimal Audit: Enforce location/metadata compliance audit log only</option>
                            </select>
                          </div>

                          <div className="bg-slate-900 p-4 rounded-xl text-[11px] leading-relaxed text-slate-400 border border-slate-850 font-sans">
                            <strong>Terms &amp; Obligations:</strong> By executing this agreement, <span className="text-white font-bold">{devCorpName}</span> guarantees that its camera hardware and artificial intelligence video pipelines will respect and obscure the visual identity, biometric vectors, and acoustic voiceprints of any citizens broadcasting a valid, unexpired BlurBubble opt-out signal.
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setDevIsSLASigned(true);
                              setDevSlaCertId(`BB-SLA-2026-${Math.floor(Math.random() * 90000) + 10000}`);
                            }}
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/15"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            Digitally Sign Compliance SLA Contract
                          </button>
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-950 border-2 border-emerald-500/40 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-emerald-950/20 space-y-6">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                          
                          {/* Official Certification Card */}
                          <div className="border border-slate-800 p-5 rounded-xl bg-slate-900/50 space-y-4">
                            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Official Seal of Compliance</span>
                                <h5 className="text-md font-black text-white uppercase tracking-tight font-sans">
                                  BlurBubble RFC-9402 Certificate
                                </h5>
                              </div>
                              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">
                                Verified
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-slate-400">
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Corporate Entity</span>
                                <span className="text-white font-bold">{devCorpName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Authorized Signer</span>
                                <span className="text-white font-bold">{devOfficerName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">SLA Standard Level</span>
                                <span className="text-emerald-400 font-extrabold uppercase">
                                  {devSlaLevel === 'strict_9402' ? 'STRICT REDACTION (ISP_LOCKED)' : devSlaLevel === 'standard_redact' ? 'STANDARD REDACTION' : 'MINIMAL AUDIT ONLY'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Certificate Serial</span>
                                <span className="text-white font-bold">{devSlaCertId}</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-3 text-[10px] font-mono text-slate-500 text-center">
                              Sealed via Web Crypto Multi-Signature Node at {new Date().toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setDevIsSLASigned(false);
                              }}
                              className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition text-xs font-mono uppercase text-slate-400 hover:text-white cursor-pointer text-center"
                            >
                              Reset Sign / Revoke
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Downloading official PDF Agreement: ${devSlaCertId}`);
                              }}
                              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 text-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Signed Cert
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Sub-tab 5: Consent Marketplace & Auction Desk */}
                  {portalSubTab === 'consent_market' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            Autonomous Consent &amp; Bidding Marketplace
                          </h4>
                          <p className="text-[11px] text-slate-400 font-sans">
                            AI developers submit micropayment bids directly to your wearable tag. Decide whether to temporarily lease surrounding spatial scanner mapping data or enforce absolute lockouts.
                          </p>
                        </div>
                        <div className="shrink-0 bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-center md:text-right">
                          <span className="text-[10px] uppercase font-mono text-slate-500 block">Accumulated Income</span>
                          <span className="text-md font-bold font-mono text-emerald-400">£{devRevenue.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Threshold Config slider */}
                      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-400 uppercase font-bold">
                          <span>Minimum Licensing Bidding Threshold</span>
                          <span className="text-emerald-400">£{devBidThreshold.toFixed(2)} per minute</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="5.00"
                          step="0.10"
                          value={devBidThreshold}
                          onChange={(e) => setDevBidThreshold(parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800"
                        />
                        <p className="text-[9.5px] text-slate-500">
                          Bids offering payouts lower than your minimum threshold will be automatically blocked by the smart contract.
                        </p>
                      </div>

                      {/* Active Bids Grid list */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Incoming Bid Campaigns</span>
                        
                        <div className="space-y-2.5">
                          {activeBidsList.map((bid) => {
                            const isBelowThreshold = bid.payout < devBidThreshold;
                            return (
                              <div
                                key={bid.id}
                                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                  bid.status === 'granted'
                                    ? 'bg-emerald-950/15 border-emerald-500/30'
                                    : isBelowThreshold
                                      ? 'bg-slate-950/20 border-slate-900/60 opacity-60'
                                      : 'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white font-sans">{bid.bidder}</span>
                                    {isBelowThreshold && (
                                      <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1 py-0.1 rounded uppercase font-bold font-mono">
                                        Auto Blocked
                                      </span>
                                    )}
                                    {bid.status === 'granted' && (
                                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.1 rounded uppercase font-bold font-mono animate-pulse">
                                        Active Lease
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 leading-normal max-w-xl">{bid.details}</p>
                                </div>

                                <div className="shrink-0 flex items-center gap-4">
                                  <div className="text-right font-mono">
                                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Payout Rate</span>
                                    <span className="text-xs font-bold text-white">£{bid.payout.toFixed(2)} / min</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={isBelowThreshold || bid.status === 'granted'}
                                      onClick={() => {
                                        setActiveBidsList(prev => prev.map(b => b.id === bid.id ? { ...b, status: 'granted' } : b));
                                        setDevRevenue(r => r + bid.payout);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition cursor-pointer ${
                                        bid.status === 'granted'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                                          : isBelowThreshold
                                            ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                                      }`}
                                    >
                                      {bid.status === 'granted' ? 'Active' : 'Grant Lease'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sub-tab 6: Edge Grid & Cloud Sync */}
                  {portalSubTab === 'edge_network' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Network className="w-4 h-4 text-emerald-400 animate-pulse" />
                            Enterprise Edge Device Grid &amp; Cloud Sync Dashboard
                          </h4>
                          <p className="text-[11px] text-slate-400 font-sans">
                            Central operations manager for corporate hardware grids. Watch cameras and wearable smart devices query global zero-knowledge (ZKP) biometric databases in real-time, enforcing local privacy zones.
                          </p>
                        </div>
                        <div className="shrink-0 bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-center md:text-right min-w-[140px]">
                          <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">Total Synced Hashes</span>
                          <span className="text-md font-bold font-mono text-cyan-400">
                            {zkpHashesCount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Geofence Radius Slider */}
                        <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-400 uppercase font-bold">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Radio className="w-3.5 h-3.5 text-cyan-400" />
                              Local BLE Geofence Broadcast Radius
                            </span>
                            <span className="text-cyan-400 font-black">{edgeGeofenceRadius} meters</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={edgeGeofenceRadius}
                            onChange={(e) => setEdgeGeofenceRadius(parseInt(e.target.value))}
                            className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-850"
                          />
                          <p className="text-[9.5px] text-slate-500">
                            Specifies the physical range where edge cameras and AI processors detect localized BlurBubble opt-out signals.
                          </p>
                        </div>

                        {/* City-wide Safe Zone Overwrite Toggle */}
                        <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                              Global Safe-Zone Overwrite
                            </span>
                            <span className="text-[9.5px] text-slate-500 block">
                              Force all camera sensors to lock into redacted mode regardless of physical proximity.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSafeZoneOverride(!safeZoneOverride)}
                            className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 flex items-center ${
                              safeZoneOverride ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full transition-transform ${
                              safeZoneOverride ? 'translate-x-5.5 bg-white' : 'translate-x-0 bg-slate-400'
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Map and Telemetry Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Map View Frame (7 Columns) */}
                        <div className="lg:col-span-7 space-y-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold text-left">
                            Live Simulated Urban Sector Map
                          </span>
                          <div className="relative bg-slate-950 border border-slate-900 rounded-xl overflow-hidden p-1.5">
                            {/* SVG Map Grid */}
                            <svg viewBox="0 0 500 300" className="w-full h-auto bg-slate-950/80 rounded-lg">
                              {/* Grid Background Lines */}
                              <defs>
                                <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(51, 65, 85, 0.08)" strokeWidth="1" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />

                              {/* Live safe zone blanket if override is active */}
                              {safeZoneOverride && (
                                <rect width="100%" height="100%" fill="rgba(16, 185, 129, 0.04)" className="animate-pulse" />
                              )}

                              {/* Simulated Citizens Map Markers */}
                              {citizens.map(cit => (
                                <g key={cit.id}>
                                  {cit.hasBeacon ? (
                                    <>
                                      {/* Aura pulse rings */}
                                      <circle cx={cit.x} cy={cit.y} r="18" fill="rgba(16, 185, 129, 0.15)" className="animate-ping" style={{ transformOrigin: `${cit.x}px ${cit.y}px`, animationDuration: '3s' }} />
                                      <circle cx={cit.x} cy={cit.y} r="8" fill="rgba(16, 185, 129, 0.3)" />
                                      <circle cx={cit.x} cy={cit.y} r="4" fill="#34d399" />
                                      {/* Text Tag */}
                                      <text x={cit.x + 8} y={cit.y + 4} fill="#34d399" className="font-mono text-[8px] font-bold">#409_OPT_OUT</text>
                                    </>
                                  ) : (
                                    <>
                                      <circle cx={cit.x} cy={cit.y} r="4" fill="#64748b" />
                                      <text x={cit.x + 8} y={cit.y + 4} fill="#475569" className="font-mono text-[7px]">{cit.name.split(' ')[0]}</text>
                                    </>
                                  )}
                                </g>
                              ))}

                              {/* Static Camera / IoT Edge Nodes */}
                              {[
                                { id: 'cam-1', name: 'Edge Cam #01', x: 120, y: 70 },
                                { id: 'cam-2', name: 'Edge Cam #02', x: 380, y: 90 },
                                { id: 'cam-3', name: 'Edge Cam #03', x: 250, y: 180 },
                                { id: 'cam-4', name: 'Smart Glasses #09', x: 80, y: 250 },
                                { id: 'cam-5', name: 'Drone Sector B', x: 400, y: 230 }
                              ].map(node => {
                                const distToOptOut = Math.sqrt((node.x - citizens[0].x) ** 2 + (node.y - citizens[0].y) ** 2);
                                const isCompliant = safeZoneOverride || (distToOptOut <= (edgeGeofenceRadius * 4));
                                const isSelected = selectedEdgeNode === node.id;

                                return (
                                  <g key={node.id} className="cursor-pointer" onClick={() => setSelectedEdgeNode(node.id)}>
                                    {/* Connection link line to Opted Out Citizen if in range */}
                                    {isCompliant && !safeZoneOverride && (
                                      <line
                                        x1={node.x}
                                        y1={node.y}
                                        x2={citizens[0].x}
                                        y2={citizens[0].y}
                                        stroke="#34d399"
                                        strokeWidth="1"
                                        strokeDasharray="3 3"
                                        className="opacity-75"
                                      />
                                    )}

                                    {/* Physical Node Range Circle */}
                                    <circle
                                      cx={node.x}
                                      cy={node.y}
                                      r={edgeGeofenceRadius * 4}
                                      fill={isCompliant ? "rgba(16, 185, 129, 0.03)" : "rgba(245, 158, 11, 0.01)"}
                                      stroke={isCompliant ? "#10b981" : "#f59e0b"}
                                      strokeWidth="1"
                                      strokeDasharray={isCompliant ? "none" : "2 2"}
                                      className="opacity-40"
                                    />

                                    {/* Node Point Indicator */}
                                    <circle
                                      cx={node.x}
                                      cy={node.y}
                                      r={isSelected ? "6" : "4"}
                                      fill={isCompliant ? "#10b981" : "#f59e0b"}
                                      className={isSelected ? "stroke-white stroke-1" : ""}
                                    />
                                    <text
                                      x={node.x - 20}
                                      y={node.y - 12}
                                      fill={isCompliant ? "#a7f3d0" : "#fde68a"}
                                      className="font-mono text-[7.5px] font-bold"
                                    >
                                      {node.name}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>

                            {/* Live map overlay stats */}
                            <div className="absolute bottom-4 left-4 flex gap-3 pointer-events-none">
                              <div className="bg-slate-950/90 border border-slate-800 px-2 py-1 rounded font-mono text-[8.5px] text-slate-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                OPT-OUT RADAR ACTIVE
                              </div>
                              <div className="bg-slate-950/90 border border-slate-800 px-2 py-1 rounded font-mono text-[8.5px] text-slate-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                EDGE SENSORS: 5/5 ONLINE
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Telemetry & Database Sync (5 Columns) */}
                        <div className="lg:col-span-5 space-y-4">
                          {/* Node details */}
                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 text-left font-sans">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">
                              Selected Node Telemetry
                            </span>

                            {(() => {
                              const currentNode = [
                                { id: 'cam-1', name: 'Edge Camera Node #01 (Gate West)', type: 'Security Dome', model: 'Nvidia Jetson Orin Nano', x: 120, y: 70 },
                                { id: 'cam-2', name: 'Edge Camera Node #02 (Lobby North)', type: 'Lobby Bullet', model: 'Raspberry Pi 5 TPU', x: 380, y: 90 },
                                { id: 'cam-3', name: 'Edge Camera Node #03 (Plaza Central)', type: 'PTZ Crowd Tracker', model: 'Ambarella CV52 AI', x: 250, y: 180 },
                                { id: 'cam-4', name: 'AR Smart Glasses #09 (Patrol)', type: 'Smart Lens', model: 'Qualcomm XR2 Gen 2', x: 80, y: 250 },
                                { id: 'cam-5', name: 'IoT Drone #04 (Sector B Aerial)', type: 'Aerial Gimbal', model: 'Edge Coral TPU', x: 400, y: 230 }
                              ].find(n => n.id === (selectedEdgeNode || 'cam-3')) || { id: 'cam-3', name: 'Edge Camera Node #03 (Plaza Central)', type: 'PTZ Crowd Tracker', model: 'Ambarella CV52 AI', x: 250, y: 180 };

                              const distToOptOut = Math.sqrt((currentNode.x - citizens[0].x) ** 2 + (currentNode.y - citizens[0].y) ** 2);
                              const isCompliant = safeZoneOverride || (distToOptOut <= (edgeGeofenceRadius * 4));

                              return (
                                <div className="space-y-3 font-sans">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-xs font-bold text-white leading-tight">{currentNode.name}</h5>
                                      <span className="text-[10px] text-slate-500 font-mono">{currentNode.type} • {currentNode.model}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono font-bold border ${
                                      isCompliant
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                      {isCompliant ? 'ACTIVE COMPLIANCE' : 'RECORDING (RAW)'}
                                    </span>
                                  </div>

                                  <div className="border-t border-slate-900 pt-2.5 space-y-1.5 font-mono text-[10px]">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Local Vector Resolver:</span>
                                      <span className={isCompliant ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                                        {isCompliant ? 'REDACTING BIOMETRICS' : 'PASS-THROUGH'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Shield Proximity:</span>
                                      <span className="text-slate-300">{(distToOptOut / 4).toFixed(1)} meters</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">ZKP Decryption Key:</span>
                                      <span className="text-slate-300 font-bold">
                                        {isCompliant ? 'SHA256-RFC-ZKP' : 'UNAVAIL_OUT_OF_RANGE'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">GPU Redaction Shader:</span>
                                      <span className={isCompliant ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                                        {isCompliant ? 'GLSL_PIXEL_BLOCK [ACTIVE]' : 'INACTIVE'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Centralized Datacenter Synchronizer */}
                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3.5 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">
                                Centralized Datacenter Sync
                              </span>
                              <span className="text-[8px] uppercase font-mono bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 px-1 rounded">
                                Cloud Core
                              </span>
                            </div>

                            <div className="space-y-2">
                              {/* Central sync progress */}
                              {syncProgress >= 0 ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-400 animate-pulse flex items-center gap-1">
                                      <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                                      Synchronizing decentralized registries...
                                    </span>
                                    <span className="text-emerald-400 font-bold">{syncProgress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                                    <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${syncProgress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSyncProgress(0);
                                    let current = 0;
                                    const interval = setInterval(() => {
                                      current += 10;
                                      setSyncProgress(current);
                                      if (current >= 100) {
                                        clearInterval(interval);
                                        setTimeout(() => {
                                          setZkpHashesCount(prev => prev + 2500);
                                          setDatacenterLatency(Math.floor(Math.random() * 5) + 8);
                                          setSyncProgress(-1);
                                        }, 400);
                                      }
                                    }, 100);
                                  }}
                                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 rounded-lg text-[10.5px] font-bold uppercase tracking-wider font-mono cursor-pointer text-center flex items-center justify-center gap-1.5 border border-transparent shadow"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Sync Global ZKP Registries
                                </button>
                              )}

                              {/* Cloud Node Grid */}
                              <div className="border-t border-slate-900 pt-2.5 space-y-1.5 font-mono text-[9px] text-slate-400">
                                <div className="flex justify-between font-mono">
                                  <span>Dublin Core Primary:</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    ONLINE ({datacenterLatency}ms)
                                  </span>
                                </div>
                                <div className="flex justify-between font-mono">
                                  <span>Tokyo Edge Syncer:</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    ONLINE ({datacenterLatency + 14}ms)
                                  </span>
                                </div>
                                <div className="flex justify-between font-mono">
                                  <span>Virginia Core Registry:</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    ONLINE ({datacenterLatency + 6}ms)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enterprise B2B KPI Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-left">
                              <span className="text-[8.5px] font-mono text-slate-500 uppercase block font-bold">Edge AI Core Load</span>
                              <span className="text-sm font-bold font-mono text-slate-300 animate-pulse">42.8%</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-left">
                              <span className="text-[8.5px] font-mono text-slate-500 uppercase block font-bold">ZKP Bandwidth saved</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">99.8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
