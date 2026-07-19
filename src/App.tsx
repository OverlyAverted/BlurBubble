import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Eye, 
  Settings, 
  FileCode, 
  Activity, 
  Radio, 
  Layers, 
  Lock, 
  User, 
  HelpCircle,
  EyeOff,
  Sparkles,
  RefreshCw,
  Sparkle,
  ShieldAlert,
  Bell,
  BellRing,
  Wifi,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Sun,
  Moon,
  Award,
  Cpu,
  Fingerprint,
  FileText,
  BookOpen,
  Check,
  Smile,
  Camera,
  ChevronDown,
  ChevronUp,
  Battery,
  BatteryWarning,
  Home,
  Map,
  Volume2,
  VolumeX,
  Clock,
  RotateCcw,
  History
} from 'lucide-react';
import { CitizenState, DetectionLog, PrivacyLevel } from './types';
// @ts-ignore
import appLogo from './assets/images/app_logo_1783164957092.jpg';
import PrivacyBeacon from './components/PrivacyBeacon';
import GlassesHUD from './components/GlassesHUD';
import TechSpecs from './components/TechSpecs';
import ComplianceAudit from './components/ComplianceAudit';
import OSHomeLauncher from './components/OSHomeLauncher';
import NDAGatekeeper from './components/NDAGatekeeper';
import RadarSweepOverlay from './components/RadarSweepOverlay';
import { useI18n, languageNames, Language } from './lib/i18n';
import { generateECDSAKeyPair, deriveKeyFingerprint, signCompliancePayload, verifyCompliancePayload } from './lib/privacyCrypto';


const INITIAL_CITIZEN_STATE: CitizenState = {
  isBroadcasting: true,
  privacyLevel: 'strict_blur',
  rangeMeters: 12,
  anonymousId: 'A8F90C12E345D8B6',
  facialRecognitionOptOut: true,
  dataRetentionPref: 'zero_retention',
  registeredEntities: [
    {
      id: 'ent-1',
      name: 'My iPhone 16 Pro (Active Beacon)',
      type: 'phone',
      isActive: true,
      privacyLevel: 'strict_blur',
      batteryPercent: 88,
      acousticWatermarkingEnabled: true,
      ultrasonicMicSaturationEnabled: true,
      vocalScramblerEnabled: true
    },
    {
      id: 'ent-2',
      name: "Lily's Backpack (Child Smart Tag)",
      type: 'smart_tag',
      isActive: true,
      privacyLevel: 'magic_removal',
      batteryPercent: 94,
      acousticWatermarkingEnabled: true,
      ultrasonicMicSaturationEnabled: false,
      vocalScramblerEnabled: false
    },
    {
      id: 'ent-3',
      name: "School Jacket (Smart Fob)",
      type: 'key_fob',
      isActive: false,
      privacyLevel: 'pixelate',
      batteryPercent: 41,
      acousticWatermarkingEnabled: false,
      ultrasonicMicSaturationEnabled: false,
      vocalScramblerEnabled: false
    },
    {
      id: 'ent-4',
      name: "Leo's Keychain (Apple AirTag)",
      type: 'airtag',
      isActive: true,
      privacyLevel: 'strict_blur',
      batteryPercent: 92,
      acousticWatermarkingEnabled: true,
      ultrasonicMicSaturationEnabled: false,
      vocalScramblerEnabled: true
    },
    {
      id: 'ent-5',
      name: "Dog Collar (Galaxy SmartTag)",
      type: 'galaxy_tag',
      isActive: true,
      privacyLevel: 'emoji',
      batteryPercent: 79,
      acousticWatermarkingEnabled: false,
      ultrasonicMicSaturationEnabled: true,
      vocalScramblerEnabled: false
    }
  ],
  registeredFaces: [
    {
      id: 'face-1',
      name: 'Paul (Myself)',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      confidenceScore: 0.98
    },
    {
      id: 'face-2',
      name: 'Lily (My Child)',
      photoUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      confidenceScore: 0.95
    }
  ],
  socialProfile: {
    username: '@paul_stuart',
    bio: 'AR Creator & Privacy Advocate. Building tools for an elegant digital future.',
    interests: ['AI Tech', 'Privacy', 'Hiking'],
    link: '#'
  },
  enablePhoneBuzz: true,
  enablePushNotifications: true,
  enableLowBatteryNotifications: true,
  lowBatteryThreshold: 20,
  notifyOnChildEngaged: true,
  notifyOnVideoFound: true,
  notifyOnVideoDeleted: true,
  notificationSound: 'sonar_chime',
  notificationMinDistance: 15,
  notificationShowDistance: true,
  notificationShowModel: true,
  notificationSoundVolume: 80,
  irDisruptionEnabled: true,
  lidarInterferenceEnabled: true,
  antiLipReadingEnabled: true,
  acousticWatermarkingEnabled: true,
  ultrasonicMicSaturationEnabled: true,
  vocalScramblerEnabled: true,
  targetedShieldingEnabled: true,
  targetedSoundAngle: 45,
  targetedPeripheralConnected: false,
  targetedSoundIntensity: 75,
  theme: 'stealth',
  disguiseUiActive: false,
  disguiseType: 'transit_route',
  smartSchedulingEnabled: true,
  scheduleSlots: [
    {
      id: 'slot-1',
      label: 'Work (Low Threat)',
      startTime: '09:00',
      endTime: '17:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      broadcastEnabled: false,
      icon: 'briefcase',
      isActive: true
    },
    {
      id: 'slot-2',
      label: 'School Run (High Threat)',
      startTime: '07:30',
      endTime: '09:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      broadcastEnabled: true,
      icon: 'baby',
      isActive: true
    },
    {
      id: 'slot-3',
      label: 'Night Out (Social Shield)',
      startTime: '19:00',
      endTime: '23:59',
      days: ['Fri', 'Sat'],
      broadcastEnabled: true,
      icon: 'beer',
      isActive: true
    }
  ],
  hardwareLicenses: [
    {
      id: 'lic-1',
      deviceName: 'BlurBubble Pocket Beacon v2',
      serialNumber: 'BB-BEACON-88219-X',
      status: 'active',
      purchaseDate: '2026-01-15',
      expirationDate: '2027-01-15',
      decryptedPubKey: 'ecc-secp256k1:04a9f3cf197c36b8e3a290bc9837107c',
      rfComplianceCert: 'FCC ID: 2A8R9-BBV2',
      certType: 'FCC',
      authorityName: 'Federal Communications Commission',
      lastVerified: '2026-06-15',
      maxRFPowerDb: 10,
      frequencyRangeMhz: '2402 - 2480 MHz',
      laboratory: 'Bay Area Compliance Laboratories Corp.'
    },
    {
      id: 'lic-2',
      deviceName: 'BlurBubble Smart Tag Collar (Collar v1)',
      serialNumber: 'BB-COLLAR-11920-A',
      status: 'active',
      purchaseDate: '2026-03-22',
      expirationDate: '2027-03-22',
      decryptedPubKey: 'ecc-secp256k1:04b1e5aa827d09c2f6d0f55c82bd243a',
      rfComplianceCert: 'FCC ID: 2A8R9-BBC1',
      certType: 'FCC',
      authorityName: 'Federal Communications Commission',
      lastVerified: '2026-06-20',
      maxRFPowerDb: 8,
      frequencyRangeMhz: '2402 - 2480 MHz',
      laboratory: 'Bay Area Compliance Laboratories Corp.'
    }
  ],
  wifiRulesEnabled: true,
  currentWifiSsid: '',
  wifiRules: [
    {
      id: 'wifi-1',
      ssid: 'Starbucks_Guest_WiFi',
      label: 'Local Coffee Shop',
      privacyLevel: 'strict_blur',
      broadcastEnabled: true,
      facialRecognitionOptOut: true,
      isActive: true
    },
    {
      id: 'wifi-2',
      ssid: 'HQ_Corporate_Secure',
      label: 'Corporate Office',
      privacyLevel: 'magic_removal',
      broadcastEnabled: false,
      facialRecognitionOptOut: true,
      isActive: true
    },
    {
      id: 'wifi-3',
      ssid: 'Transit_Terminal_Free',
      label: 'Municipal Transit Station',
      privacyLevel: 'black_bar',
      broadcastEnabled: true,
      facialRecognitionOptOut: true,
      isActive: true
    }
  ],
  biometricLockEnabled: false,
  biometricRegistered: false,
  governanceHierarchy: ['lockdown', 'strict_rules', 'perimeter_shields', 'allow_list', 'wifi_triggers', 'smart_schedules'],
  totalLockdownMode: false,
  hierarchyRulesEnabled: true,
  showMetricsBar: true,
  showControlBar: true,
  showAuditLogs: true,
  showEmergencyButton: true,
  showGuideButton: true,
  showTopBar: true,
  showSignalHistory: false,
  showPrivacyImpactScore: false,
  showBatteryWidget: true,
  showSignalMap: true,
  intelligentBatteryOptimization: true,
  adversarialPoisoning: true,
  decoyPersonaBroadcast: false,
  rfc9402SocialBlock: true,
  regulatoryCeaseAndDesist: true,
  mobileCamsBlock: true,
  cctvBlock: true,
  smartHomeExclusion: true,
  aerialDroneDisruption: false,
  gptBotExclusion: true,
  googleExtendedBlock: true,
  anthropicBlock: true,
  commonCrawlOptOut: true,
  dataBrokersSweep: true
};

const INITIAL_LOGS: DetectionLog[] = [
  {
    id: 'log-1',
    timestamp: '15:42:10',
    deviceModel: 'Meta Glasses v4 (Beta)',
    action: 'censored',
    shieldApplied: 'STRICT BLUR',
    distance: 5.4,
    rotatedId: 'A8F90C12E345D8B6',
  },
  {
    id: 'log-2',
    timestamp: '15:39:45',
    deviceModel: 'Apple Vision Wear v2',
    action: 'censored',
    shieldApplied: 'STRICT BLUR',
    distance: 12.1,
    rotatedId: 'A8F90C12E345D8B6',
  }
];

const VIEW_GROUPS = [
  {
    id: 'beacon',
    label: 'My Privacy Shield Controls',
    icon: '🛡️',
    options: [
      // 1. My Personal Shield (defense)
      { value: 'citizen:overview', label: 'Main Dashboard', icon: '📊', desc: 'Your general status, signal charts, and widget layout' },
      { value: 'citizen:signal', label: 'Shield Broadcast Range', icon: '📡', desc: 'Pick how far your Stop Recording signal can reach' },
      { value: 'citizen:settings', label: 'Alerts & Sound Settings', icon: '⚙️', desc: 'Change sounds, pocket buzz alerts, and notifications' },
      { value: 'citizen:faces', label: 'My Blurred Faces', icon: '👤', desc: 'Add photos of your face so smart cameras blur them' },
      { value: 'citizen:tags', label: 'Protected Toys & Bags', icon: '🎒', desc: 'Add virtual tags to blur items like backpacks' },
      { value: 'citizen:wifi', label: 'Home WiFi Rules', icon: '📶', desc: 'Turn shield on/off automatically when you join home WiFi' },

      // 2. When to Block (rules)
      { value: 'citizen:perimeter', label: 'Safe School Zones', icon: '📍', desc: 'Pick safe places on a map where recording is blocked' },
      { value: 'citizen:hierarchy', label: 'What Rule Wins?', icon: '⚖️', desc: 'Sort your safety rules so the app knows which to follow first' },
      { value: 'citizen:biometric', label: 'Lock My App', icon: '🔒', desc: 'Use your finger scan or code to keep others out' },

      // 3. My Connected Gear (hardware)
      { value: 'citizen:pairing', label: 'Pair My Badge', icon: '🔌', desc: 'Link physical keychains or pocket buttons' },
      { value: 'citizen:licensing', label: 'Safety Badges & Checks', icon: '📋', desc: 'Official certificates showing our safety lab tests' },
      { value: 'citizen:retention', label: 'Clean Out My History', icon: '💾', desc: 'Decide when the app automatically wipes old records' },
      { value: 'citizen:escrow', label: 'Warrant Overrides', icon: '🔑', desc: 'See keys that can turn off the shield in emergency cases' },

      // 4. Safe & Legal Rules (compliance)
      { value: 'citizen:legal', label: 'Safety Quiz', icon: '📖', desc: 'A fun quick test to learn how privacy laws protect you' },
      { value: 'citizen:scrub', label: 'Request Blur Online', icon: '🎬', desc: 'Request to blur your face on public video databases' }
    ]
  },
  {
    id: 'glasses',
    label: 'Test Cameras & Glasses',
    icon: '🕶️',
    options: [
      { value: 'glasses:scanner', label: 'Local Devices Finder', icon: '📡', desc: 'Scan for nearby active signals and tracking gear' },
      { value: 'glasses:webcam', label: 'Your Live Camera View', icon: '📷', desc: 'See how your screen blurs faces in real-time' },
      { value: 'glasses:heatmap', label: 'Privacy Map & Heat', icon: '🗺️', desc: 'See where cameras are around you' },
      { value: 'glasses:street', label: 'Virtual Walk Sandbox', icon: '🚶', desc: 'See how glasses automatically blur street bystanders' },
    ]
  },
  {
    id: 'audit',
    label: 'Official Safety Proof',
    icon: '🔍',
    options: [
      { value: 'audit:main', label: 'Live Shield Safe-Check', icon: '🔍', desc: 'Check if your shield is working and officially safe' },
    ]
  },
  {
    id: 'tech',
    label: 'Friendly Help Guides',
    icon: '📖',
    options: [
      { value: 'tech:pitch', label: 'App Future Plans & Ideas', icon: '🚀', desc: 'Simple guide to our goals, ideas, and dreams' },
      { value: 'tech:timeline', label: 'How We Keep You Safe', icon: '🛡️', desc: 'A timeline of how we protect you step-by-step' },
      { value: 'tech:hardware', label: 'Connected Gear & Tags', icon: '⚡', desc: 'Check on your badges and battery levels' },
      { value: 'tech:sdk_code', label: 'Computer Code Behind It', icon: '💻', desc: 'Super simple look at the code that does the magic' },
      { value: 'tech:crypto', label: 'Web Crypto Shield Vault', icon: '🔑', desc: 'Inspect real-time browser ECDSA public keys and active signatures' },
      { value: 'tech:oem', label: 'Global Compliance SDK', icon: '🔌', desc: 'Hardware protocols & OS integration templates for companies like Apple & Google' },
    ]
  }
];

export default function App() {
  const { language, setLanguage, t } = useI18n();
  const [ndaAccepted, setNdaAccepted] = useState(() => {
    return localStorage.getItem('bb_nda_accepted') === 'true';
  });

  const handleAcceptNDA = (user: { name: string; email: string; organization: string }) => {
    localStorage.setItem('bb_nda_accepted', 'true');
    localStorage.setItem('bb_nda_user', JSON.stringify(user));
    setNdaAccepted(true);
    // Add a diagnostic log event
    addLog({
      deviceModel: 'SECURITY_ENCLAVE_UNLOCK',
      action: 'censored',
      shieldApplied: `WORKSPACE_UNLOCKED_BY_${user.name.toUpperCase().replace(/\s+/g, '_')}`,
      distance: 0,
      rotatedId: 'MNDA_SIGNED_AND_STAMPED'
    });
  };

  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [activeView, setActiveView] = useState<'citizen' | 'glasses' | 'tech' | 'audit'>('citizen');
  const [citizenTab, setCitizenTab] = useState<'overview' | 'settings' | 'signal' | 'tags' | 'faces' | 'scrub' | 'perimeter' | 'retention' | 'escrow' | 'licensing' | 'legal' | 'pairing' | 'wifi' | 'biometric' | 'hierarchy' | 'targeted' | 'audio_shield' | 'audio_scrub' | 'audio_map'>('overview');
  const [glassesTab, setGlassesTab] = useState<'webcam' | 'street' | 'scanner' | 'heatmap' | 'audio-lab'>('street');
  const [techTab, setTechTab] = useState<'timeline' | 'sdk_code' | 'pitch' | 'hardware' | 'crypto' | 'oem'>('timeline');
  const [showHelpCenter, setShowHelpCenter] = useState<boolean>(false);
  const [guideCategory, setGuideCategory] = useState<'intro' | 'shield' | 'hud' | 'audit' | 'faq' | 'tour' | 'support'>('intro');
  const [showRadarSweep, setShowRadarSweep] = useState(false);
  const [isIndicatorHovered, setIsIndicatorHovered] = useState(false);
  const [integrityTrend, setIntegrityTrend] = useState<'STABLE' | 'RISING' | 'DROPPING' | 'MUTED'>('STABLE');
  const prevIntegrityRef = useRef<number>(0);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [alertsMuted, setAlertsMuted] = useState(true);

  // Active deflection animation states
  const [isDeflecting, setIsDeflecting] = useState(false);
  const deflectionTimeoutRef = useRef<any>(null);

  // Interactive Onboarding Tour Checklist States
  const [tourSteps, setTourSteps] = useState(() => {
    const saved = localStorage.getItem('bb_tour_steps');
    return saved ? JSON.parse(saved) : {
      shieldActivated: false,
      osLauncherOpened: false,
      webcamTested: false,
      complianceChecked: false,
      ticketSubmitted: false,
      diagnosticsRun: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('bb_tour_steps', JSON.stringify(tourSteps));
  }, [tourSteps]);

  // Simulated Support tickets state
  const [supportTickets, setSupportTickets] = useState<Array<{
    id: string;
    category: string;
    message: string;
    email: string;
    status: 'open' | 'investigating' | 'resolved';
    timestamp: string;
    ticketNum: string;
  }>>(() => {
    const saved = localStorage.getItem('bb_support_tickets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ticket-init-1',
        category: 'Feature Request',
        message: 'Requesting Apple Vision Pro spatial blur integration for high-density environments.',
        email: 'alex_creates@gmail.com',
        status: 'resolved',
        timestamp: '2026-07-07 14:22',
        ticketNum: 'T-8841'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bb_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Support Desk Form States
  const [feedbackEmail, setFeedbackEmail] = useState('support@blurbubble.org');
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // System Diagnostics States
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);
  const [isDiagnosticsRunning, setIsDiagnosticsRunning] = useState(false);
  const [diagnosticsProgress, setDiagnosticsProgress] = useState(0);

  const runSystemDiagnostics = () => {
    if (isDiagnosticsRunning) return;
    setIsDiagnosticsRunning(true);
    setDiagnosticsLogs([]);
    setDiagnosticsProgress(0);

    const steps = [
      { msg: '🤖 [SYS] Booting BlurBubble physical transceiver diagnostics...', progress: 15 },
      { msg: '📡 [SYS] Scanning RF spectrum bands 2.40 GHz - 2.48 GHz... [OK]', progress: 30 },
      { msg: '🔑 [SYS] Recalibrating rolling 128-bit ECDH cryptographic key arrays... [SUCCESS]', progress: 50 },
      { msg: '🧠 [SYS] Profiling NPU facial biometric hashing engine... [LATENCY: 4.1ms]', progress: 70 },
      { msg: '📶 [SYS] Syncing SSID whitelist rules (Starbucks_Guest_WiFi, Corporate)... [OK]', progress: 85 },
      { msg: '✅ [SYS] Diagnostics complete. Decibel levels verified. Hardware is 100% HEALTHY.', progress: 100 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setDiagnosticsLogs(prev => [...prev, step.msg]);
        setDiagnosticsProgress(step.progress);
        if (index === steps.length - 1) {
          setIsDiagnosticsRunning(false);
          setTourSteps((prev: any) => ({ ...prev, diagnosticsRun: true }));
          addLog({
            deviceModel: 'SYSTEM_HARDWARE_SELF_TEST',
            action: 'censored',
            shieldApplied: 'DIAGNOSTICS_COMPLETED_100_HEALTHY',
            distance: 0,
            rotatedId: 'HEALTHY_TRANSCEIVER_SIG'
          });
        }
      }, (index + 1) * 800);
    });
  };

  const handleSystemFactoryReset = () => {
    localStorage.removeItem('bb_tour_steps');
    localStorage.removeItem('bb_support_tickets');
    setCitizenState(INITIAL_CITIZEN_STATE);
    setTourSteps({
      shieldActivated: false,
      osLauncherOpened: false,
      webcamTested: false,
      complianceChecked: false,
      ticketSubmitted: false,
      diagnosticsRun: false
    });
    setSupportTickets([
      {
        id: 'ticket-init-1',
        category: 'Feature Request',
        message: 'Requesting Apple Vision Pro spatial blur integration for high-density environments.',
        email: 'alex_creates@gmail.com',
        status: 'resolved',
        timestamp: '2026-07-07 14:22',
        ticketNum: 'T-8841'
      }
    ]);
    clearLogs();
  };

  // Custom View Selector Dropdown States
  const [isViewSelectorOpen, setIsViewSelectorOpen] = useState(false);
  const [isCustomizerExpanded, setIsCustomizerExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    beacon: false,
    glasses: false,
    tech: false,
    audit: false
  });

  // Real-time clock for top simulated OS Status Bar
  const [statusBarTime, setStatusBarTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setStatusBarTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchApp = (view: 'citizen' | 'glasses' | 'tech' | 'audit', tab?: string) => {
    setActiveView(view);
    if (tab) {
      if (view === 'citizen') {
        setCitizenTab(tab as any);
      } else if (view === 'glasses') {
        setGlassesTab(tab as any);
      } else if (view === 'tech') {
        setTechTab(tab as any);
      }
    }
    setCitizenState(prev => ({ ...prev, disguiseUiActive: false }));
  };
  
  // Vocal Assistant Alerts (Web Speech API)
  const [vocalAlertsEnabled, setVocalAlertsEnabled] = useState<boolean>(false);

  // Web Crypto Shield Engine State
  const [cryptoState, setCryptoState] = useState<{
    publicKeyBase64: string;
    signatureBase64: string;
    signDurationMs: number;
    verifyDurationMs: number;
    fullFingerprint: string;
    verified: boolean;
    lastRotated: number;
  } | null>(null);

  const speakAlert = (text: string) => {
    if (!vocalAlertsEnabled || alertsMuted) return;
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  // Biometric Lock Screen States
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSimulatedTouchId, setShowSimulatedTouchId] = useState<boolean>(false);
  const [simulatedTouchState, setSimulatedTouchState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>('');
  const [showPasscodeOption, setShowPasscodeOption] = useState<boolean>(false);
  
  // Citizen state setup with safe localStorage hydration
  const [citizenState, setCitizenState] = useState<CitizenState>(() => {
    try {
      const saved = localStorage.getItem('blurbubble_citizen_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge to maintain forward-compatible types in case we update structure
        return { ...INITIAL_CITIZEN_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Error hydrating citizen state:', e);
    }
    return INITIAL_CITIZEN_STATE;
  });

  const [shieldActiveSeconds, setShieldActiveSeconds] = useState<number>(0);

  // Active broadcasting counter effect
  useEffect(() => {
    let intervalId: any = null;
    if (citizenState.isBroadcasting) {
      intervalId = setInterval(() => {
        setShieldActiveSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setShieldActiveSeconds(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [citizenState.isBroadcasting]);

  const formatTimeActive = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [autoHideInactive, setAutoHideInactive] = useState<boolean>(false);

  // Monitor user actions to complete interactive tour steps
  useEffect(() => {
    if (citizenState?.isBroadcasting) {
      setTourSteps((prev: any) => prev.shieldActivated ? prev : { ...prev, shieldActivated: true });
    }
    if (citizenState?.disguiseUiActive) {
      setTourSteps((prev: any) => prev.osLauncherOpened ? prev : { ...prev, osLauncherOpened: true });
    }
    if (activeView === 'glasses' && glassesTab === 'webcam') {
      setTourSteps((prev: any) => prev.webcamTested ? prev : { ...prev, webcamTested: true });
    }
    if (activeView === 'audit') {
      setTourSteps((prev: any) => prev.complianceChecked ? prev : { ...prev, complianceChecked: true });
    }
  }, [citizenState?.isBroadcasting, citizenState?.disguiseUiActive, activeView, glassesTab]);

  // Threshold-based battery alert check
  const triggeredThresholdsRef = useRef<Record<string, { low: boolean; critical: boolean }>>({});

  useEffect(() => {
    if (!citizenState.registeredEntities) return;

    citizenState.registeredEntities.forEach((tag) => {
      const prevFlags = triggeredThresholdsRef.current[tag.id] || { low: false, critical: false };
      
      const isBelow15 = tag.batteryPercent < 15;
      const isBelow10 = tag.batteryPercent < 10;

      // 15% threshold check (Low battery alert)
      if (isBelow15 && !isBelow10 && !prevFlags.low) {
        triggerAlert(
          `🔋 Battery Low: ${tag.name}`,
          `Battery level has dropped to ${tag.batteryPercent}%. BLE transmission frequency optimized to save energy.`,
          'battery_warning'
        );
        triggeredThresholdsRef.current[tag.id] = { ...prevFlags, low: true };
      }
      
      // 10% threshold check (Critical battery alert)
      if (isBelow10 && !prevFlags.critical) {
        triggerAlert(
          `🚨 Critical Battery: ${tag.name}`,
          `Battery level is critically low at ${tag.batteryPercent}%. Power saving throttles engaged to prevent connection dropout.`,
          'battery_warning'
        );

        // Attempt to trigger real HTML5 Browser Notification
        try {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              try {
                new Notification(`🚨 Critical Battery: ${tag.name}`, {
                  body: `Battery level is critically low at ${tag.batteryPercent}%. Power saving throttles engaged to prevent connection dropout.`
                });
              } catch (e) {
                console.warn('HTML5 Notification instantiation error:', e);
              }
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  try {
                    new Notification(`🚨 Critical Battery: ${tag.name}`, {
                      body: `Battery level is critically low at ${tag.batteryPercent}%. Power saving throttles engaged to prevent connection dropout.`
                    });
                  } catch (e) {
                    console.warn('HTML5 Notification instantiation error:', e);
                  }
                }
              }).catch((e) => {
                console.warn('HTML5 Notification permission error:', e);
              });
            }
          }
        } catch (e) {
          console.warn('Browser Notification API error:', e);
        }

        triggeredThresholdsRef.current[tag.id] = { low: true, critical: true };
      }

      // Reset thresholds if battery goes back up
      if (!isBelow15) {
        triggeredThresholdsRef.current[tag.id] = { low: false, critical: false };
      } else if (!isBelow10) {
        triggeredThresholdsRef.current[tag.id] = { ...prevFlags, critical: false };
      }
    });
  }, [citizenState.registeredEntities]);

  // Listen for alerts and handle auto-lock on mount
  useEffect(() => {
    if (citizenState.biometricLockEnabled && citizenState.biometricRegistered) {
      setIsLocked(true);
    }

    const handleCustomAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        triggerAlert(
          customEvent.detail.title,
          customEvent.detail.body,
          customEvent.detail.type
        );
      }
    };

    window.addEventListener('trigger-test-alert', handleCustomAlert);
    return () => {
      window.removeEventListener('trigger-test-alert', handleCustomAlert);
    };
  }, [citizenState.biometricLockEnabled, citizenState.biometricRegistered]);

  // Logs tracking simulation with safe localStorage hydration
  const [logs, setLogs] = useState<DetectionLog[]>(() => {
    try {
      const saved = localStorage.getItem('blurbubble_detection_logs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error hydrating detection logs:', e);
    }
    return INITIAL_LOGS;
  });

  // Persist State Updates
  useEffect(() => {
    try {
      localStorage.setItem('blurbubble_citizen_state', JSON.stringify(citizenState));
    } catch (e) {
      console.error('Error saving citizen state:', e);
    }
  }, [citizenState]);

  // Scroll to top on activeView changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

  // Persist Logs Updates
  useEffect(() => {
    try {
      localStorage.setItem('blurbubble_detection_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving detection logs:', e);
    }
  }, [logs]);

  // Factory Reset Handler
  const handleFactoryReset = () => {
    try {
      localStorage.removeItem('blurbubble_citizen_state');
      localStorage.removeItem('blurbubble_detection_logs');
      setCitizenState(INITIAL_CITIZEN_STATE);
      setLogs(INITIAL_LOGS);
      
      triggerAlert(
        'Factory Reset Complete',
        'Your BlurBubble device has been reset to its original manufacturer configuration. All custom rules and smart tags have been cleared.',
        'blocking'
      );
    } catch (e) {
      console.error('Error resetting device:', e);
    }
  };

  // Haptics & Notification Simulation states
  const [buzzing, setBuzzing] = useState(false);
  const [showHapticRings, setShowHapticRings] = useState(false);

  // Quick Actions Floating Menu States
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [deepScanProgress, setDeepScanProgress] = useState(0);
  const [deepScanStep, setDeepScanStep] = useState(0);
  const [deepScanStatus, setDeepScanStatus] = useState('');

  const startDeepScan = () => {
    setIsQuickActionsOpen(false);
    setIsDeepScanning(true);
    setDeepScanProgress(0);
    setDeepScanStep(1);
    setDeepScanStatus('Initializing hardware spectrum check...');
    
    const steps = [
      { p: 15, s: 1, text: 'Scanning local 2.4GHz RF spectrum bands...' },
      { p: 35, s: 2, text: 'Sweeping BLE advertising packets and active channels...' },
      { p: 60, s: 3, text: 'Verifying nearby hardware-level smart tags...' },
      { p: 80, s: 4, text: 'Auditing compliant optical handshakes & camera IDs...' },
      { p: 95, s: 5, text: 'Querying decentralized CDN video indexers for facial hashes...' },
      { p: 100, s: 6, text: 'All audits verified. Compiling system report...' }
    ];
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const current = steps[currentIdx];
        setDeepScanProgress(current.p);
        setDeepScanStep(current.s);
        setDeepScanStatus(current.text);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsDeepScanning(false);
        
        addLog({
          deviceModel: 'SHIELD_DEEP_SCANNER',
          action: 'discovered',
          shieldApplied: 'COMPLETE INTEGRITY MATCHED',
          distance: 0,
          rotatedId: 'DEEP_SCAN_COMPLETED'
        });
        
        triggerAlert(
          '⚡ Deep Scan Audit: Secure',
          'Deep scan completed successfully. Inspected 12 RF spectrum bands, verified 5 secure metadata tags, and certified all CDN compliance crawlers. Zero unauthorized face leaks found.',
          'blocking'
        );
      }
    }, 750);
  };

  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'blocking' | 'child_blocking' | 'video_found' | 'video_deleted' | 'battery_warning';
    timestamp: string;
  } | null>(null);

  const [notificationsList, setNotificationsList] = useState<Array<{
    id: string;
    title: string;
    body: string;
    type: 'blocking' | 'child_blocking' | 'video_found' | 'video_deleted' | 'battery_warning';
    timestamp: string;
    isRead: boolean;
  }>>([
    {
      id: 'notif-init',
      title: 'Shield Security Armed',
      body: 'Decentralized BLE broadcast active. Continuous protection synced across all child smart tags.',
      type: 'blocking',
      timestamp: '15:30:15',
      isRead: true
    }
  ]);

  const playAlertSound = (soundType?: string, volumePercent?: number) => {
    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const volume = (volumePercent !== undefined ? volumePercent : 80) / 100;
      gainNode.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      
      const type = soundType || 'sonar_chime';
      if (type === 'sonar_chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.62);
      } else if (type === 'tactical_click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
        gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else { // silent_glow
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
      }
    } catch (err) {
      console.error("Audio error", err);
    }
  };

  const triggerAlert = (
    title: string, 
    body: string, 
    type: 'blocking' | 'child_blocking' | 'video_found' | 'video_deleted' | 'battery_warning'
  ) => {
    let finalBody = body;
    let finalTitle = title;

    // Check if we should hide distance in alerts
    if (citizenState.notificationShowDistance === false) {
      finalBody = finalBody.replace(/\s*at\s*\d+(\.\d+)?m/gi, '');
      finalBody = finalBody.replace(/\s*\(\d+(\.\d+)?m\)/gi, '');
    }

    // Check if we should hide device model in alerts
    if (citizenState.notificationShowModel === false) {
      const models = [
        'Apple Vision Wear v2', 
        'Sony Spatial Display', 
        'Meta Ray-Ban v3', 
        'Sony Spatial Wear', 
        'Apple Glasses v1', 
        'Meta Ray-Ban v2', 
        'Sony Spatial Wear v1'
      ];
      for (const model of models) {
        finalBody = finalBody.replace(new RegExp(model, 'gi'), 'a smart device');
      }
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newAlert = {
      id: 'alert-' + Date.now() + '-' + Math.random(),
      title: finalTitle,
      body: finalBody,
      type,
      timestamp: timeStr,
      isRead: false
    };

    // Store in history
    setNotificationsList(prev => [newAlert, ...prev].slice(0, 20));

    // Show toast banner if push notifications enabled
    if (citizenState.enablePushNotifications) {
      setActiveToast(newAlert);
      
      // Play selected alert chime sound
      if (!alertsMuted) {
        playAlertSound(citizenState.notificationSound, citizenState.notificationSoundVolume);
      }

      // Auto-dismiss toast after 5 seconds
      setTimeout(() => {
        setActiveToast(current => current?.id === newAlert.id ? null : current);
      }, 5000);
    }

    // Trigger phone vibration simulation if enabled
    if (citizenState.enablePhoneBuzz) {
      setBuzzing(true);
      setShowHapticRings(true);
      
      // Vibrate real physical phone if api is supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 150, 300]);
      }
      
      setTimeout(() => {
        setBuzzing(false);
      }, 1000);
      
      setTimeout(() => {
        setShowHapticRings(false);
      }, 2500);
    }
  };

  const addLog = (newLog: Omit<DetectionLog, 'id'> | Omit<DetectionLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = ('timestamp' in newLog && newLog.timestamp) ? newLog.timestamp : now.toTimeString().split(' ')[0];
    const logItem: DetectionLog = {
      ...newLog,
      id: Math.random().toString(),
      timestamp: timeStr,
    } as DetectionLog;
    setLogs((prev) => [logItem, ...prev].slice(0, 30)); // limit to 30 logs

    // Whenever an interception log is created (action === 'censored'), trigger active deflection pulse on top shield icon
    if (newLog.action === 'censored') {
      setIsDeflecting(false);
      if (deflectionTimeoutRef.current) {
        clearTimeout(deflectionTimeoutRef.current);
      }
      setTimeout(() => {
        setIsDeflecting(true);
        deflectionTimeoutRef.current = setTimeout(() => {
          setIsDeflecting(false);
        }, 750); // duration of the deflect animation
      }, 10);
    }
  };

  const clearLogs = () => setLogs([]);

  // Web Crypto Key Generation & Rotation Loop
  useEffect(() => {
    let rotationInterval: any = null;
    let isMounted = true;

    const performRotation = async (isFirstTime = false) => {
      try {
        const keyPair = await generateECDSAKeyPair();
        const { fullFingerprint, shortId, spkiBase64 } = await deriveKeyFingerprint(keyPair.publicKey);
        
        // Formulate opt-out broadcast payload (compliance token conforming to RFC-9402 standards)
        const payload = JSON.stringify({
          protocol: "RFC-9402",
          scope: "opt-out",
          timestamp: Date.now(),
          beaconId: shortId,
        });

        // Sign payload with private key
        const { signatureBase64, durationMs: signDuration } = await signCompliancePayload(keyPair.privateKey, payload);
        
        // Instantly verify with public key to validate security chain
        const { verified, durationMs: verifyDuration } = await verifyCompliancePayload(keyPair.publicKey, payload, signatureBase64);

        if (!isMounted) return;

        setCryptoState({
          publicKeyBase64: spkiBase64,
          signatureBase64,
          signDurationMs: signDuration,
          verifyDurationMs: verifyDuration,
          fullFingerprint,
          verified,
          lastRotated: Date.now(),
        });

        // Dynamic ID Rotation - updates active tracking ID to the new derived hash!
        setCitizenState(prev => {
          if (prev.anonymousId !== shortId) {
            return { ...prev, anonymousId: shortId };
          }
          return prev;
        });

        if (isFirstTime) {
          speakAlert("Tactical privacy shield initialized. WebAssembly NPU coprocessor online.");
        } else {
          speakAlert("Key rotated. Broadcast ID renewed.");
        }

        // Log the rotation event to the decentralized ledger
        addLog({
          deviceModel: 'ECDSA P-256 Web Crypto Engine',
          action: 'discovered',
          shieldApplied: 'Opt-Out Signature Verified',
          distance: 0,
          rotatedId: shortId,
        });

      } catch (err) {
        console.error('Failed to perform cryptographic rotation:', err);
      }
    };

    // Run first generation immediately
    performRotation(true);

    // Rotate every 15 seconds if broadcasting is active
    if (citizenState.isBroadcasting) {
      rotationInterval = setInterval(() => {
        performRotation(false);
      }, 15000);
    }

    return () => {
      isMounted = false;
      if (rotationInterval) clearInterval(rotationInterval);
    };
  }, [citizenState.isBroadcasting]);

  const activateEmergencyShield = () => {
    setCitizenState(prev => ({
      ...prev,
      emergencyPrivacyActive: true,
      isBroadcasting: true
    }));
    addLog({
      deviceModel: 'ALL_NEARBY_DEVICES',
      action: 'erased',
      shieldApplied: 'HARD OPT-OUT (MAX SHIELD)',
      distance: 0,
      rotatedId: 'EMERGENCY_BROADCAST_SIG'
    });
    triggerAlert(
      '🚨 EMERGENCY SHIELD ACTIVE',
      'All localized beacons are broadcasting at peak power with maximum hard opt-out rules. All nearby camera devices blocked.',
      'blocking'
    );
    speakAlert("Emergency lockdown engaged. Absolute encryption protocol active.");
    setShowEmergencyConfirm(false);
  };

  const deactivateEmergencyShield = () => {
    setCitizenState(prev => ({
      ...prev,
      emergencyPrivacyActive: false
    }));
    addLog({
      deviceModel: 'ALL_NEARBY_DEVICES',
      action: 'censored',
      shieldApplied: 'STRICT BLUR',
      distance: 0,
      rotatedId: 'EMERGENCY_BROADCAST_SIG'
    });
    triggerAlert(
      '🛡️ Emergency Shield Disarmed',
      'Emergency protocol deactivated. Standing down to standard localized safety profile.',
      'blocking'
    );
    speakAlert("Emergency lockdown deactivated. Resuming default broadcast protocol.");
  };

  // Auto-simulate pedestrian handshakes & crawler interceptions
  useEffect(() => {
    if (!citizenState.isBroadcasting) return;

    const interval = setInterval(() => {
      const roll = Math.random();
      
      if (roll < 0.45) {
        // Scenario 1: Intercept recording of Paul (Myself)
        const models = [
          'Meta Ray-Ban v3',
          'Snap Spectacles Pro',
          'Apple AR Glass Lite',
          'Google Iris Concept',
          'Xreal Beam Air v2',
        ];
        const selectedModel = models[Math.floor(Math.random() * models.length)];
        const distance = parseFloat((Math.random() * (citizenState.rangeMeters - 1) + 1).toFixed(1));
        const action = citizenState.privacyLevel === 'none' ? 'discovered' : 'censored';
        const shield = citizenState.privacyLevel === 'none' ? 'SOCIAL OVERLAY' : citizenState.privacyLevel.toUpperCase().replace('_', ' ');

        addLog({
          deviceModel: selectedModel,
          action,
          shieldApplied: shield,
          distance,
          rotatedId: citizenState.anonymousId,
        });

        if (action === 'censored') {
          triggerAlert(
            'Bystander Alert', 
            `Someone pointed a ${selectedModel} at you at ${distance}m. Active blur filter applied automatically.`, 
            'blocking'
          );
        }
      } 
      else if (roll < 0.75) {
        // Scenario 2: Intercept recording of Lily or protected item (Child Tag)
        // Check if child/item tags are active
        const activeEntities = citizenState.registeredEntities.filter(e => e.isActive);
        if (activeEntities.length > 0 && citizenState.notifyOnChildEngaged) {
          const targetEntity = activeEntities[Math.floor(Math.random() * activeEntities.length)];
          const models = ['Apple Vision Wear v2', 'Sony Spatial Display', 'Meta Ray-Ban v3'];
          const selectedModel = models[Math.floor(Math.random() * models.length)];
          const distance = parseFloat((Math.random() * 8 + 1).toFixed(1));

          addLog({
            deviceModel: `${selectedModel} (scanning ${targetEntity.name})`,
            action: 'censored',
            shieldApplied: targetEntity.privacyLevel.toUpperCase().replace('_', ' '),
            distance,
            rotatedId: 'CHILD_TAG_SHIELD_SECURE',
          });

          triggerAlert(
            'Child / Object Protection engaged',
            `Smart sensor blocked recording of "${targetEntity.name}" by a nearby ${selectedModel} (${distance}m).`,
            'child_blocking'
          );
        }
      } 
      else if (roll < 0.90) {
        // Scenario 3: Retroactive crawler finds video online (DeleteMe style)
        if (citizenState.notifyOnVideoFound) {
          const platforms = ['youtube', 'tiktok', 'instagram'];
          const selectedPlatform = platforms[Math.floor(Math.random() * platforms.length)];
          const urls = {
            youtube: 'https://youtube.com/watch?v=k827y398df',
            tiktok: 'https://tiktok.com/@daily_vlog_world/video/902837429',
            instagram: 'https://instagram.com/p/Co8907ad822/'
          };
          const link = urls[selectedPlatform as keyof typeof urls];

          triggerAlert(
            'Unconsented Video Detected Online',
            `Bystander indexer found your face/child in a video uploaded to ${selectedPlatform.toUpperCase()}. Dispatching CDN-level blur...`,
            'video_found'
          );

          // Schedule a video deletion/blur success 6 seconds later
          if (citizenState.notifyOnVideoDeleted) {
            setTimeout(() => {
              triggerAlert(
                'Video Successfully Blurred',
                `Platform API compliance verified. Your face is now actively blurred on ${selectedPlatform.toUpperCase()} (${link}).`,
                'video_deleted'
              );
            }, 6000);
          }
        }
      }
    }, 15000); // Trigger a lively event every 15 seconds

    return () => clearInterval(interval);
  }, [citizenState]);

  // Hook up event listener for the Simulation Playground buttons
  useEffect(() => {
    const handleTestAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { title, body, type } = customEvent.detail;
        triggerAlert(title, body, type);
      }
    };
    window.addEventListener('trigger-test-alert', handleTestAlert);
    return () => window.removeEventListener('trigger-test-alert', handleTestAlert);
  }, [citizenState]);

  // Watch currentWifiSsid and apply WiFi Trigger Rules
  useEffect(() => {
    if (!citizenState.wifiRulesEnabled || !citizenState.currentWifiSsid) return;

    const activeRule = citizenState.wifiRules?.find(
      (rule) => rule.ssid === citizenState.currentWifiSsid && rule.isActive
    );

    if (activeRule) {
      const needsUpdate = 
        citizenState.isBroadcasting !== activeRule.broadcastEnabled ||
        citizenState.privacyLevel !== activeRule.privacyLevel ||
        citizenState.facialRecognitionOptOut !== activeRule.facialRecognitionOptOut;

      if (needsUpdate) {
        setCitizenState((prev) => ({
          ...prev,
          isBroadcasting: activeRule.broadcastEnabled,
          privacyLevel: activeRule.privacyLevel,
          facialRecognitionOptOut: activeRule.facialRecognitionOptOut
        }));

        triggerAlert(
          'WiFi Rule Automation Active',
          `Connected to "${activeRule.ssid}" (${activeRule.label}). Applied rule config: Shield set to ${activeRule.privacyLevel.toUpperCase().replace('_', ' ')}, Broadcasting: ${activeRule.broadcastEnabled ? 'ON' : 'OFF'}, Face Opt-Out: ${activeRule.facialRecognitionOptOut ? 'ON' : 'OFF'}.`,
          'blocking'
        );
      }
    }
  }, [citizenState.currentWifiSsid, citizenState.wifiRules, citizenState.wifiRulesEnabled]);

  // Dynamic counter calculations
  const totalCensored = logs.filter((l) => l.action === 'censored').length;
  const totalDiscovered = logs.filter((l) => l.action === 'discovered').length;

  const shieldIntegrity = citizenState.isBroadcasting 
    ? Math.min(100, 60 
        + (citizenState.facialRecognitionOptOut ? 15 : 0) 
        + (citizenState.dataRetentionPref === 'zero_retention' ? 15 : 0) 
        + (citizenState.irDisruptionEnabled ? 10 : 0))
    : 0;

  useEffect(() => {
    if (!citizenState.isBroadcasting) {
      setIntegrityTrend('MUTED');
      prevIntegrityRef.current = 0;
      return;
    }
    
    if (prevIntegrityRef.current === 0) {
      setIntegrityTrend('RISING');
      const timer = setTimeout(() => {
        setIntegrityTrend(shieldIntegrity >= 85 ? 'STABLE' : 'DROPPING');
      }, 3000);
      prevIntegrityRef.current = shieldIntegrity;
      return () => clearTimeout(timer);
    }

    if (shieldIntegrity !== prevIntegrityRef.current) {
      if (shieldIntegrity > prevIntegrityRef.current) {
        setIntegrityTrend('RISING');
      } else {
        setIntegrityTrend('DROPPING');
      }
      
      const timer = setTimeout(() => {
        setIntegrityTrend(shieldIntegrity >= 85 ? 'STABLE' : 'DROPPING');
      }, 3000);
      
      prevIntegrityRef.current = shieldIntegrity;
      return () => clearTimeout(timer);
    } else {
      setIntegrityTrend(shieldIntegrity >= 85 ? 'STABLE' : 'DROPPING');
    }
    prevIntegrityRef.current = shieldIntegrity;
  }, [shieldIntegrity, citizenState.isBroadcasting]);

  if (!ndaAccepted) {
    return <NDAGatekeeper onAccept={handleAcceptNDA} />;
  }

  return (
    <div className={`min-h-screen ${citizenState.theme === 'visibility' ? 'theme-visibility bg-zinc-50 text-zinc-900' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950`}>
      
      {/* Simulated Apple / Android OS Main Status Bar */}
      {citizenState.showTopBar !== false && (
        <div className="bg-slate-950 border-b border-slate-900/60 text-slate-400 text-xs py-2 px-4 font-mono select-none flex items-center justify-between z-50 sticky top-0 bg-slate-950/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Live Clock on Far Left */}
            <div className="text-[11px] font-bold text-slate-200">
              {statusBarTime}
            </div>
            {/* Divider */}
            <span className="text-slate-700 select-none text-[9px]">•</span>
            {/* Carrier */}
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">BlurBubble 5G</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Wrap statusbar-bubble-indicator button, its radar sweep overlay, and interactive tooltip inside a relative container with hover tracking */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setIsIndicatorHovered(true);
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(15);
                }
              }}
              onMouseLeave={() => setIsIndicatorHovered(false)}
            >
              <button 
                id="statusbar-bubble-indicator"
                onClick={() => {
                  const updated = !citizenState.isBroadcasting;
                  setCitizenState(prev => ({ ...prev, isBroadcasting: updated }));
                  addLog({
                    deviceModel: 'WEARABLE_SHIELD',
                    action: updated ? 'censored' : 'ignored',
                    shieldApplied: updated ? 'SHIELD BROADCAST ACTIVE' : 'SHIELD BROADCAST SILENT',
                    distance: 0,
                    rotatedId: 'BROADCAST_SIG_MANUAL'
                  });
                  // Toggle radar sweep overlay on click
                  setShowRadarSweep(prev => !prev);
                }}
                className={`flex items-center justify-center rounded-lg border transition-all cursor-pointer relative overflow-visible ${
                  citizenState.isBroadcasting ? 'gap-1.5 px-2 py-1' : 'p-1.5'
                } ${
                  citizenState.isBroadcasting 
                    ? shieldIntegrity >= 85
                      ? 'bg-emerald-950/45 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : shieldIntegrity >= 70
                        ? 'bg-emerald-950/30 border-emerald-500/25 text-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                        : 'bg-amber-950/20 border-amber-500/30 text-amber-500/95 shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={citizenState.isBroadcasting ? `BlurBubble Broadcast Shield ACTIVE (Integrity: ${shieldIntegrity}%) - Click to open sweep controls` : "BlurBubble Broadcast Shield SILENT - Click to activate"}
              >
                {/* Subtle Scan-line Effect during Hover State */}
                {isIndicatorHovered && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none z-10">
                    <motion.div
                      initial={{ top: '-100%' }}
                      animate={{ top: '100%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: 'linear',
                      }}
                      className="absolute left-0 right-0 h-[2px] bg-emerald-400/70 shadow-[0_0_6px_#34d399] opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none opacity-40 animate-pulse" />
                  </div>
                )}

                <div className={`relative w-4 h-4 flex items-center justify-center ${
                  isDeflecting ? 'animate-shield-deflect' : ''
                }`}>
                  {/* Active outward pulsing ripple rings when a scan is deflected */}
                  {isDeflecting && (
                    <>
                      <span className={`absolute inset-0 rounded-full border-2 animate-shield-glow-ring pointer-events-none ${
                        shieldIntegrity >= 85 ? 'border-emerald-400' : shieldIntegrity >= 70 ? 'border-emerald-500' : 'border-amber-400'
                      }`} />
                      <span className={`absolute inset-0 rounded-full border animate-shield-glow-ring pointer-events-none ${
                        shieldIntegrity >= 85 ? 'border-emerald-400' : shieldIntegrity >= 70 ? 'border-emerald-500' : 'border-amber-400'
                      }`} style={{ animationDelay: '0.15s' }} />
                    </>
                  )}
                  
                  {/* Animated shield icon that changes color intensity and pulse frequency based on integrity */}
                  <motion.div
                    className="flex items-center justify-center"
                    animate={citizenState.isBroadcasting ? {
                      scale: shieldIntegrity >= 85 ? [1, 1.05, 1] : shieldIntegrity >= 70 ? [1, 1.1, 1] : [1, 1.18, 1],
                      opacity: shieldIntegrity >= 85 ? [0.85, 1, 0.85] : shieldIntegrity >= 70 ? [0.75, 1, 0.75] : [0.55, 1, 0.55],
                    } : {}}
                    transition={{
                      repeat: Infinity,
                      duration: shieldIntegrity >= 85 ? 2.5 : shieldIntegrity >= 70 ? 1.6 : 0.8,
                      ease: "easeInOut"
                    }}
                  >
                    <Shield
                      className={`w-4 h-4 transition-all duration-300 ${
                        citizenState.isBroadcasting 
                          ? shieldIntegrity >= 85
                            ? 'text-emerald-400' 
                            : shieldIntegrity >= 70
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                          : 'text-slate-600 opacity-45 scale-95'
                      }`}
                    />
                  </motion.div>
                </div>

                {/* Dynamic Trend Label next to the shield icon */}
                {citizenState.isBroadcasting && (
                  <div className="flex items-center gap-1.5 ml-1.5 border-l border-slate-800 pl-1.5">
                    <span className={`text-[8px] font-mono font-extrabold tracking-wider ${
                      integrityTrend === 'RISING'
                        ? 'text-emerald-300 animate-pulse'
                        : integrityTrend === 'DROPPING'
                          ? 'text-amber-400 animate-pulse'
                          : shieldIntegrity >= 85
                            ? 'text-emerald-400/80'
                            : 'text-amber-500/80'
                    }`}>
                      {integrityTrend}
                    </span>
                    <span className="text-slate-800 text-[8px] select-none font-mono">•</span>
                    <span className="text-[8px] font-mono font-bold text-emerald-400/90 flex items-center gap-0.5" title="Broadcasting Time Active">
                      <Clock className="w-2.5 h-2.5 shrink-0 text-emerald-400/60" />
                      {formatTimeActive(shieldActiveSeconds)}
                    </span>
                  </div>
                )}
              </button>

              <AnimatePresence>
                {/* Detailed Hover Telemetry Tooltip */}
                {isIndicatorHovered && !showRadarSweep && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 22,
                      mass: 0.8
                    }}
                    className="absolute right-0 top-full mt-2 w-72 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md p-4 text-slate-200 z-[60] flex flex-col font-sans select-none"
                  >
                    {/* Tooltip Header */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-slate-400">
                        Shield Telemetry
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Rapid One-Tap Audio Shield Control */}
                        <button
                          type="button"
                          id="rapid-audio-shield-mute-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAlertsMuted(prev => !prev);
                            playAlertSound('tactical_click');
                          }}
                          className={`p-1 rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            alertsMuted 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          }`}
                          title={alertsMuted ? "Rapid Unmute Notification Alerts" : "Rapid Mute Notification Alerts"}
                        >
                          {alertsMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          )}
                        </button>

                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          citizenState.isBroadcasting 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          {citizenState.isBroadcasting ? 'ACTIVE' : 'MUTED'}
                        </span>
                      </div>
                    </div>

                    {/* Threat Detection Frequency Display */}
                    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span className="text-[9px] font-bold font-mono text-slate-300">Threat Detection Frequency</span>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-cyan-400">
                        {citizenState.isBroadcasting 
                          ? `${(2.4 + (100 - shieldIntegrity) * 0.15).toFixed(2)} GHz` 
                          : "0.00 GHz"}
                      </span>
                    </div>

                    {/* Active Timer Section */}
                    {citizenState.isBroadcasting && (
                      <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 rounded-xl px-3 py-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400">Time Active</span>
                            <span className="text-xs font-bold font-mono text-emerald-300">
                              {formatTimeActive(shieldActiveSeconds)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="reset-broadcast-timer-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShieldActiveSeconds(0);
                            addLog({
                              deviceModel: 'WEARABLE_SHIELD',
                              action: 'censored',
                              shieldApplied: 'BROADCAST TIMER RESET',
                              distance: 0,
                              rotatedId: 'TIMER_RESET'
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white font-mono text-[9px] uppercase font-bold transition duration-200 cursor-pointer"
                          title="Reset Broadcasting Timer to 0:00"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Reset
                        </button>
                      </div>
                    )}

                    {/* Mute Alerts Quick Control */}
                    <div className="flex items-center justify-between bg-slate-900/50 border border-slate-900 rounded-xl px-3 py-2 mb-2">
                      <div className="flex items-center gap-2">
                        {alertsMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        )}
                        <span className="text-[10px] font-bold font-mono text-slate-300">Mute Alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAlertsMuted(prev => !prev);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          alertsMuted ? 'bg-rose-500/80' : 'bg-slate-800'
                        }`}
                        title={alertsMuted ? "Unmute notification alerts" : "Mute notification alerts"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            alertsMuted ? 'translate-x-4 bg-white' : 'translate-x-0 bg-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Auto-Hide Inactive Components Quick Control */}
                    <div className="flex items-center justify-between bg-slate-900/50 border border-slate-900 rounded-xl px-3 py-2 mb-3">
                      <div className="flex items-center gap-2">
                        {autoHideInactive ? (
                          <EyeOff className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="text-[10px] font-bold font-mono text-slate-300">Focus Active Only</span>
                      </div>
                      <button
                        type="button"
                        id="toggle-autohide-inactive-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAutoHideInactive(prev => !prev);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoHideInactive ? 'bg-emerald-500/85' : 'bg-slate-800'
                        }`}
                        title={autoHideInactive ? "Show all shield components" : "Hide inactive shield components"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoHideInactive ? 'translate-x-4 bg-white' : 'translate-x-0 bg-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reconnect Shield Quick Action */}
                    {!citizenState.isBroadcasting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCitizenState(prev => ({
                            ...prev,
                            isBroadcasting: true
                          }));
                          addLog({
                            deviceModel: 'ALL_NEARBY_DEVICES',
                            action: 'censored',
                            shieldApplied: 'STRICT BLUR',
                            distance: 0,
                            rotatedId: 'RECONNECTED_SIG'
                          });
                          triggerAlert(
                            '🛡️ Privacy Broadcast Active',
                            'Your localized privacy shield signal has been restored and is active.',
                            'blocking'
                          );
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 mb-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-500/60 rounded-xl text-emerald-400 font-extrabold font-mono text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      >
                        <Shield className="w-3.5 h-3.5 animate-pulse" />
                        Reconnect Shield
                      </button>
                    )}

                    {/* Tooltip Body: Shield Integrity Section */}
                    <div className="space-y-1.5 mb-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          Shield Integrity
                        </span>
                        <span className={`font-bold ${shieldIntegrity >= 80 ? 'text-emerald-400' : shieldIntegrity > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {shieldIntegrity}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900/60 border border-slate-800/40 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${
                            shieldIntegrity >= 80 
                              ? 'bg-emerald-500' 
                              : shieldIntegrity > 0 
                                ? 'bg-amber-500' 
                                : 'bg-red-500/30'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${shieldIntegrity}%` }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-[8px] text-slate-500 font-mono leading-normal leading-relaxed">
                        {citizenState.isBroadcasting 
                          ? "Active signal masking prevents unauthorized camera sweeps and biometric collection." 
                          : "VULNERABLE: Signal broadcast offline. Click shield icon to restore bystander privacy protections."}
                      </p>
                    </div>

                    {/* Breakdown of Shield Components */}
                    <div className="border-t border-b border-slate-900/60 py-2 mb-2.5 space-y-1.5">
                      <div className="text-[8px] font-bold uppercase tracking-wider font-mono text-slate-400 flex justify-between">
                        <span>Shield Component</span>
                        <span>Weight</span>
                      </div>
                      <div className="space-y-1 text-[9px] font-mono">
                        {/* Active Signal Masking */}
                        {(!autoHideInactive || citizenState.isBroadcasting) && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${citizenState.isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                              Active Signal Masking
                            </span>
                            <span className={`font-bold ${citizenState.isBroadcasting ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {citizenState.isBroadcasting ? '+60%' : 'Inactive'}
                            </span>
                          </div>
                        )}

                        {/* Biometric Opt-Out */}
                        {(!autoHideInactive || citizenState.facialRecognitionOptOut) && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${citizenState.facialRecognitionOptOut ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                              Biometric Opt-Out
                            </span>
                            <span className={`font-bold ${citizenState.facialRecognitionOptOut ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {citizenState.facialRecognitionOptOut ? '+15%' : 'Inactive'}
                            </span>
                          </div>
                        )}

                        {/* Zero Retention preference */}
                        {(!autoHideInactive || citizenState.dataRetentionPref === 'zero_retention') && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${citizenState.dataRetentionPref === 'zero_retention' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                              Zero Data Retention
                            </span>
                            <span className={`font-bold ${citizenState.dataRetentionPref === 'zero_retention' ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {citizenState.dataRetentionPref === 'zero_retention' ? '+15%' : 'Inactive'}
                            </span>
                          </div>
                        )}

                        {/* IR Disruption Shield */}
                        {(!autoHideInactive || citizenState.irDisruptionEnabled) && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${citizenState.irDisruptionEnabled ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                              IR Disruption Shield
                            </span>
                            <span className={`font-bold ${citizenState.irDisruptionEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {citizenState.irDisruptionEnabled ? '+10%' : 'Inactive'}
                            </span>
                          </div>
                        )}

                        {/* Fallback state when all active components are hidden */}
                        {autoHideInactive &&
                          !citizenState.isBroadcasting &&
                          !citizenState.facialRecognitionOptOut &&
                          citizenState.dataRetentionPref !== 'zero_retention' &&
                          !citizenState.irDisruptionEnabled && (
                            <div className="text-[8px] text-slate-500 text-center py-1 font-mono italic">
                              NO ACTIVE DEFENSES PRESENT
                            </div>
                        )}
                      </div>
                    </div>

                      {/* Tooltip Body: Nearby Devices / Scanner Section */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400">Nearby Threat Beacons</span>
                          <span className="text-slate-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded text-[8px]">
                            5 Detected
                          </span>
                        </div>

                        {/* List of 5 simulated blips synchronized with the Radar Overlay */}
                        <div className="bg-slate-900/20 rounded-lg p-2 border border-slate-900 space-y-1 font-mono text-[9px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1 truncate">
                              <span>📹</span> Traffic Cam Facial Scan
                            </span>
                            <span className={`font-bold px-1 py-0.5 rounded-[3px] text-[8px] ${
                              citizenState.isBroadcasting && citizenState.rangeMeters >= 7 
                                ? 'text-emerald-400 bg-emerald-500/5' 
                                : 'text-red-400 bg-red-500/5'
                            }`}>
                              {citizenState.isBroadcasting && citizenState.rangeMeters >= 7 ? "MASKED" : "EXPOSED"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1 truncate">
                              <span>🚁</span> Patrol Drone Stream
                            </span>
                            <span className={`font-bold px-1 py-0.5 rounded-[3px] text-[8px] ${
                              citizenState.isBroadcasting && citizenState.rangeMeters >= 14 
                                ? 'text-emerald-400 bg-emerald-500/5' 
                                : 'text-red-400 bg-red-500/5'
                            }`}>
                              {citizenState.isBroadcasting && citizenState.rangeMeters >= 14 ? "MASKED" : "EXPOSED"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1 truncate">
                              <span>📺</span> Smart TV Beacon (BLE)
                            </span>
                            <span className={`font-bold px-1 py-0.5 rounded-[3px] text-[8px] ${
                              citizenState.isBroadcasting && citizenState.rangeMeters >= 19 
                                ? 'text-emerald-400 bg-emerald-500/5' 
                                : 'text-red-400 bg-red-500/5'
                            }`}>
                              {citizenState.isBroadcasting && citizenState.rangeMeters >= 19 ? "MASKED" : "EXPOSED"}
                            </span>
                          </div>
                        </div>

                        <p className="text-[7.5px] text-slate-500 font-mono text-center pt-0.5">
                          Hover out to close • Click indicator to edit radius
                        </p>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {showRadarSweep && (
                  <RadarSweepOverlay
                    isBroadcasting={citizenState.isBroadcasting}
                    rangeMeters={citizenState.rangeMeters}
                    onToggleBroadcast={() => {
                      const updated = !citizenState.isBroadcasting;
                      setCitizenState(prev => ({ ...prev, isBroadcasting: updated }));
                      addLog({
                        deviceModel: 'WEARABLE_SHIELD',
                        action: updated ? 'censored' : 'ignored',
                        shieldApplied: updated ? 'SHIELD BROADCAST ACTIVE' : 'SHIELD BROADCAST SILENT',
                        distance: 0,
                        rotatedId: 'BROADCAST_SIG_MANUAL'
                      });
                    }}
                    onChangeRange={(newRange) => {
                      setCitizenState(prev => ({ ...prev, rangeMeters: newRange }));
                    }}
                    onClose={() => setShowRadarSweep(false)}
                    addLog={addLog}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Signal Strength Indicator */}
            <div className="flex items-end gap-0.5 h-3.5 pb-0.5 text-emerald-400" title="Full Signal Strength">
              <span className="w-1 h-1.5 bg-emerald-500 rounded-2xs inline-block"></span>
              <span className="w-1 h-2 bg-emerald-500 rounded-2xs inline-block"></span>
              <span className="w-1 h-2.5 bg-emerald-500 rounded-2xs inline-block"></span>
              <span className="w-1 h-3.5 bg-emerald-500 rounded-2xs inline-block"></span>
            </div>

            {/* WiFi Connection Indicator */}
            <Wifi className="w-3.5 h-3.5 text-emerald-400" title="Connected to Secure WiFi Network" />

            {/* Battery level indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold" title="Battery Level: 88%">
              <span>88%</span>
              <div className="relative w-6 h-3.5 border border-slate-700 rounded-sm p-0.5 flex items-center bg-slate-900/50">
                <div className="h-full bg-emerald-500 rounded-3xs" style={{ width: '88%' }}></div>
                <div className="absolute -right-1 top-1 w-0.5 h-1.5 bg-slate-700 rounded-r-3xs"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upper Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-emerald-500/5 overflow-hidden">
              <img
                src={appLogo}
                alt="BlurBubble Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans">BlurBubble™</h1>
                <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                  {t('app.version')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full sm:w-auto relative">
            {/* Left group of upper nav containing Home Button and App Interface Options directly underneath */}
            <div className={`flex flex-col gap-2 w-full sm:w-auto relative ${isCustomizerExpanded ? 'z-50' : isViewSelectorOpen ? 'z-10' : 'z-30'}`}>
              {/* Home / Main Dashboard Button */}
              <button
                id="back-to-home-btn"
                type="button"
                onClick={() => {
                  setActiveView('citizen');
                  setCitizenTab('overview');
                  setIsViewSelectorOpen(false);
                  setIsCustomizerExpanded(false);
                }}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                  activeView === 'citizen' && citizenTab === 'overview'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white hover:border-slate-700 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-pointer'
                }`}
                title="Go back to the Main Dashboard"
              >
                <Home className={`w-4 h-4 ${activeView === 'citizen' && citizenTab === 'overview' ? 'text-emerald-400' : 'text-slate-400 animate-pulse'}`} />
                <span>{t('nav.home')}</span>
              </button>

              {/* Collapsible App Customization Menu under need the home screen button */}
              <div className="relative w-full z-40">
                <button
                  id="app-interface-options-trigger"
                  type="button"
                  onClick={() => {
                    setIsCustomizerExpanded(!isCustomizerExpanded);
                    setIsViewSelectorOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2.5 bg-slate-900/90 hover:bg-slate-900/100 px-4 py-2.5 rounded-xl border border-slate-800 text-left transition shadow-lg select-none cursor-pointer group focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm select-none">🎨</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans text-slate-300 group-hover:text-white">App Interface Options</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isCustomizerExpanded ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {isCustomizerExpanded && (
                  <>
                    {/* Backdrop to close the customizer when clicking outside */}
                    <div className="fixed inset-0 z-30" onClick={() => setIsCustomizerExpanded(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] bg-slate-950/95 border border-slate-800/80 rounded-2xl shadow-2xl z-50 p-4 flex flex-col gap-2.5 max-h-[380px] overflow-y-auto backdrop-blur-xl animate-in fade-in duration-150 glow-emerald">
                      <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5 px-1">
                        Choose What Boxes to Show
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {/* 1. Status Bar */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showTopBar: prev.showTopBar === false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showTopBar !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Simulated OS Status Bar"
                        >
                          <div className="flex items-center gap-2">
                            <Eye className={`w-3.5 h-3.5 ${citizenState.showTopBar !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Status Bar</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showTopBar !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 2. Emergency Shield */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showEmergencyButton: prev.showEmergencyButton === false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showEmergencyButton !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Emergency Shield Button"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className={`w-3.5 h-3.5 ${citizenState.showEmergencyButton !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Emergency Shield Button</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showEmergencyButton !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 3. User Guide & Info Button */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showGuideButton: prev.showGuideButton === false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showGuideButton !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the User Guide & Info button"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle className={`w-3.5 h-3.5 ${citizenState.showGuideButton !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>User Guide Button</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showGuideButton !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 4. Camouflage / Theme Control Box */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showControlBar: prev.showControlBar === false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showControlBar !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Theme & Camouflage Control Box"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className={`w-3.5 h-3.5 ${citizenState.showControlBar !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Camouflage Control Box</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showControlBar !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 5. Telemetry Metrics Box */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showMetricsBar: prev.showMetricsBar === false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showMetricsBar !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Live Telemetry Metrics Box"
                        >
                          <div className="flex items-center gap-2">
                            <Activity className={`w-3.5 h-3.5 ${citizenState.showMetricsBar !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Telemetry Metrics Box</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showMetricsBar !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 6. Vocal Assistant Alerts Toggle */}
                        <button
                          type="button"
                          onClick={() => setVocalAlertsEnabled(!vocalAlertsEnabled)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            vocalAlertsEnabled
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle Vocal Speech alerts and compliance audio broadcasts"
                        >
                          <div className="flex items-center gap-2">
                            {vocalAlertsEnabled ? (
                              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>Speech Alerts (Web Speech)</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${vocalAlertsEnabled ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 7. Signal History Box */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showSignalHistory: !prev.showSignalHistory }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showSignalHistory
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Signal History Panel"
                        >
                          <div className="flex items-center gap-2">
                            <History className={`w-3.5 h-3.5 ${citizenState.showSignalHistory ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Signal History Panel</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showSignalHistory ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 8. Privacy Impact Score Gauge */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showPrivacyImpactScore: !prev.showPrivacyImpactScore }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showPrivacyImpactScore
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Spatial Compliance & Privacy Impact Score"
                        >
                          <div className="flex items-center gap-2">
                            <Award className={`w-3.5 h-3.5 ${citizenState.showPrivacyImpactScore ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Privacy Impact Score</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showPrivacyImpactScore ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 9. Connected Hardware Battery Status Widget */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showBatteryWidget: prev.showBatteryWidget === false ? true : false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showBatteryWidget !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the Main Dashboard Connected Hardware Battery Status Widget"
                        >
                          <div className="flex items-center gap-2">
                            <Battery className={`w-3.5 h-3.5 ${citizenState.showBatteryWidget !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>Battery Status Overview</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showBatteryWidget !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>

                        {/* 10. D3 Signal Strength Map Widget */}
                        <button
                          type="button"
                          onClick={() => setCitizenState(prev => ({ ...prev, showSignalMap: prev.showSignalMap === false ? true : false }))}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            citizenState.showSignalMap !== false
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/50 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                          title="Toggle visibility of the D3 Real-Time Signal Strength Map Widget"
                        >
                          <div className="flex items-center gap-2">
                            <Map className={`w-3.5 h-3.5 ${citizenState.showSignalMap !== false ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>D3 Signal Strength Map</span>
                          </div>
                          <span className={`w-1.5 h-1.5 rounded-full ${citizenState.showSignalMap !== false ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                        </button>
                      </div>

                      {/* Language Selection Section nested inside the customization menu */}
                      <div className="mt-4 border-t border-slate-800/40 pt-3 flex flex-col gap-2">
                        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
                          <span>🌐</span>
                          <span>App Language / Selection</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-1">
                          {(['en', 'fr', 'de'] as Language[]).map((lang) => {
                            const isSelected = language === lang;
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  setLanguage(lang);
                                }}
                                className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black'
                                    : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                <span className="uppercase font-mono text-[10px]">{lang}</span>
                                <span className="text-[10px] truncate max-w-[50px]">{languageNames[lang].split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Custom Premium Collapsible View Selection Dropdown Menu */}
            <div className={`relative w-full sm:w-80 shrink-0 ${isViewSelectorOpen ? 'z-50' : isCustomizerExpanded ? 'z-10' : 'z-30'}`}>
              <button
                id="main-view-selector-trigger"
                type="button"
                onClick={() => {
                  setIsViewSelectorOpen(!isViewSelectorOpen);
                  setIsCustomizerExpanded(false);
                }}
                className="w-full flex items-center justify-between gap-2.5 bg-slate-900/90 hover:bg-slate-900/100 px-4 py-3 rounded-xl border border-slate-800 text-left transition shadow-lg select-none cursor-pointer group focus:outline-none"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest shrink-0">{t('nav.screen')}</span>
                  <div className="w-[1px] h-3.5 bg-slate-800 shrink-0"></div>
                  {(() => {
                    const activeFullValue = `${activeView}:${activeView === 'citizen' ? citizenTab : activeView === 'glasses' ? glassesTab : activeView === 'tech' ? techTab : 'main'}`;
                    let activeOption = null;
                    for (const group of VIEW_GROUPS) {
                      const opt = group.options.find(o => o.value === activeFullValue);
                      if (opt) {
                        activeOption = opt;
                        break;
                      }
                    }
                    if (!activeOption) return <span className="text-slate-400 text-xs font-bold">{t('nav.selectView')}</span>;
                    return (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-sm shrink-0 select-none">{activeOption.icon}</span>
                        <span className="text-xs font-bold text-slate-100 truncate">{t(`view.${activeOption.value.replace(':', '.')}`)}</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-slate-300">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isViewSelectorOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </div>
              </button>

              {/* Backdrop overlay behind the dropdown but in front of body to handle clicking outside */}
              {isViewSelectorOpen && (
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsViewSelectorOpen(false)} 
                />
              )}

              {/* Collapsible Dropdown Popover */}
              {isViewSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] bg-slate-950/95 border border-slate-800/80 rounded-2xl shadow-2xl z-40 max-h-[380px] overflow-y-auto backdrop-blur-xl animate-in fade-in duration-100 divide-y divide-slate-900 glow-emerald">
                  <div className="py-1.5">
                    {VIEW_GROUPS.map((group) => {
                      const isExpanded = !!expandedGroups[group.id];
                      return (
                        <div key={group.id} className="flex flex-col">
                          {/* Group header row - Clickable to Collapse/Expand options */}
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedGroups(prev => ({
                                ...prev,
                                [group.id]: !prev[group.id]
                              }));
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm select-none">{group.icon}</span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">{t(`cat.${group.id}`)}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-400' : ''}`} />
                          </button>

                          {/* Options container with simple native height transitions or clean lists */}
                          {isExpanded && (
                            <div className="bg-slate-950/60 py-1 border-t border-slate-900/30">
                              {group.options.map((opt) => {
                                const activeFullValue = `${activeView}:${activeView === 'citizen' ? citizenTab : activeView === 'glasses' ? glassesTab : activeView === 'tech' ? techTab : 'main'}`;
                                const isSelected = opt.value === activeFullValue;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      const [view, tab] = opt.value.split(':');
                                      setActiveView(view as any);
                                      if (view === 'citizen') {
                                        setCitizenTab(tab as any);
                                      } else if (view === 'glasses') {
                                        setGlassesTab(tab as any);
                                      } else if (view === 'tech') {
                                        setTechTab(tab as any);
                                      }
                                      setIsViewSelectorOpen(false);
                                    }}
                                    className={`w-full flex flex-col items-start gap-0.5 px-6 py-2 hover:bg-emerald-950/10 text-left transition border-l-2 ${
                                      isSelected
                                        ? 'bg-slate-900/50 border-emerald-500 text-white font-bold'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs select-none">{opt.icon}</span>
                                      <span className="text-xs font-bold leading-tight">{t(`view.${opt.value.replace(':', '.')}`)}</span>
                                      {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-500 pl-5 leading-normal truncate w-full block font-medium">
                                      {t(`desc.${opt.value.replace(':', '.')}`)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Friendly Guide Toggle */}
            {citizenState.showGuideButton && (
              <div className="flex items-center gap-1 bg-slate-900/45 p-1 rounded-xl border border-slate-800/40 shrink-0 w-full sm:w-auto">
                <button
                  id="guide-toggle-btn"
                  type="button"
                  onClick={() => setShowHelpCenter(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-slate-950 hover:border-blue-500 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] flex-1 justify-center"
                  title="Open dynamic step-by-step user walkthrough and feature reference guide"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 group-hover:text-inherit animate-pulse" />
                  <span>USER GUIDE &amp; INFO</span>
                </button>
                <button
                  onClick={() => setCitizenState({ ...citizenState, showGuideButton: false })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  title="Hide User Guide button"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Emergency Toggle */}
            {citizenState.showEmergencyButton && (
              <div className="flex items-center gap-1 bg-slate-900/45 p-1 rounded-xl border border-slate-800/40 shrink-0 w-full sm:w-auto">
                <button
                  id="emergency-toggle"
                  onClick={() => {
                    if (citizenState.emergencyPrivacyActive) {
                      deactivateEmergencyShield();
                    } else {
                      setShowEmergencyConfirm(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border flex-1 justify-center ${
                    citizenState.emergencyPrivacyActive
                      ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse'
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:text-red-400 hover:border-red-500/50'
                  }`}
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${citizenState.emergencyPrivacyActive ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                  <span className="tracking-wide">EMERGENCY SHIELD</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${citizenState.emergencyPrivacyActive ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                </button>
                <button
                  onClick={() => setCitizenState({ ...citizenState, showEmergencyButton: false })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  title="Hide Emergency Shield button"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Camouflage & Theme Control Bar */}
      {activeView === 'citizen' && citizenState.showControlBar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl backdrop-blur-md">
            {/* OS Window Title Bar */}
            <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 shrink-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
                    onClick={() => setCitizenState({ ...citizenState, showControlBar: false })} 
                    title="Close Window" 
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Theme &amp; Camouflage Control</span>
              </div>
              <button
                type="button"
                onClick={() => setCitizenState({ ...citizenState, showControlBar: false })}
                className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/65 border border-slate-800"
                title="Close Window"
              >
                ✕
              </button>
            </div>
            {/* Window Content */}
            <div className={`p-4 transition-colors duration-300 ${citizenState.theme === 'visibility' ? 'bg-zinc-100 text-zinc-800' : 'bg-slate-900/40 text-slate-300'}`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Theme Selection */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold ${citizenState.theme === 'visibility' ? 'text-zinc-500' : 'text-slate-500'}`}>Theme mode:</span>
                    <div className="flex items-center gap-1 bg-slate-950/20 p-1 rounded-lg border border-slate-800/40">
                      <button
                        type="button"
                        onClick={() => setCitizenState({ ...citizenState, theme: 'stealth' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          citizenState.theme === 'stealth'
                            ? 'bg-slate-850 text-emerald-400 border border-slate-700/60'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Moon className="w-3 h-3" />
                        Stealth Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setCitizenState({ ...citizenState, theme: 'visibility' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          citizenState.theme === 'visibility'
                            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-300'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-500" />
                        High Visibility
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Indicators & Reset Control */}
                <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0 font-sans">
                  {/* Local Security Offline Indicator */}
                  <div id="sec-offline-indicator" className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                    <span>OFFLINE-FIRST</span>
                  </div>

                  {/* Lock App Button */}
                  <button
                    id="lock-app-btn"
                    type="button"
                    onClick={() => {
                      if (!citizenState.biometricLockEnabled || !citizenState.biometricRegistered) {
                        triggerAlert(
                          'Passkey Lock Not Configured',
                          'Please register your biometric credentials in the "Biometric Lock" tab first before arming the auto-lock screen.',
                          'child_blocking'
                        );
                        return;
                      }
                      setIsLocked(true);
                      triggerAlert(
                        'Dashboard Locked',
                        'BlurBubble screen restricted to prevent unauthorized tampering.',
                        'blocking'
                      );
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      citizenState.biometricLockEnabled && citizenState.biometricRegistered
                        ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-500/10'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                    }`}
                    title="Lock dashboard manually with security passkey"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Lock Dashboard</span>
                  </button>

                  {/* Factory Reset */}
                  <button
                    id="factory-reset-btn"
                    type="button"
                    onClick={handleFactoryReset}
                    className="flex items-center gap-1 bg-slate-950/40 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                    title="Reset configuration to fresh factory defaults"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Factory Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Overview Metrics Bar */}
      {activeView === 'citizen' && citizenState.showMetricsBar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl backdrop-blur-md">
            {/* OS Window Title Bar */}
            <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 shrink-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
                    onClick={() => setCitizenState({ ...citizenState, showMetricsBar: false })} 
                    title="Close Window" 
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Live Telemetry Metrics</span>
              </div>
              <button
                type="button"
                onClick={() => setCitizenState({ ...citizenState, showMetricsBar: false })}
                className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/65 border border-slate-800"
                title="Close Window"
              >
                ✕
              </button>
            </div>
            {/* Window Content */}
            <div className="p-5 bg-slate-900/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                    Censors Applied
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white font-mono">{totalCensored}</span>
                    <span className="text-xs text-slate-400 font-medium">Recordings Blocked</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                    Discovery Matches
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white font-mono">{totalDiscovered}</span>
                    <span className="text-xs text-slate-400 font-medium">Profiles Shared</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                    Local Compliance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-emerald-400 font-mono">100%</span>
                    <span className="text-xs text-slate-400 font-medium">Wearable Conformity</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                    Cryptographic Trust
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-blue-400 font-mono">ECC-256</span>
                    <span className="text-xs text-slate-400 font-medium">Zero-Knowledge ID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {citizenState.disguiseUiActive ? (
            <motion.div
              key="os_launcher"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <OSHomeLauncher
                citizenState={citizenState}
                setCitizenState={setCitizenState}
                onLaunchApp={handleLaunchApp}
                logs={logs}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'citizen' && (
                <PrivacyBeacon
                  state={citizenState}
                  onChange={setCitizenState}
                  logs={logs}
                  onClearLogs={clearLogs}
                  activeTab={citizenTab}
                  onTabChange={setCitizenTab}
                  onAddLog={addLog}
                  onTriggerAlert={triggerAlert}
                />
              )}

              {activeView === 'glasses' && (
                <GlassesHUD
                  citizenState={citizenState}
                  onChange={setCitizenState}
                  addLog={addLog}
                  logs={logs}
                  activeTab={glassesTab}
                  onTabChange={setGlassesTab}
                />
              )}

              {activeView === 'tech' && (
                <TechSpecs 
                  activeTab={techTab}
                  onTabChange={setTechTab}
                  cryptoState={cryptoState}
                  vocalAlertsEnabled={vocalAlertsEnabled}
                  onToggleVocalAlerts={() => setVocalAlertsEnabled(!vocalAlertsEnabled)}
                />
              )}

              {activeView === 'audit' && (
                <ComplianceAudit
                  citizenState={citizenState}
                  logs={logs}
                  onAddLog={addLog}
                  onClearLogs={clearLogs}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            BlurBubble Opt-Out Shield Protocol Simulator. Fully compliant with proposed RFC-9402 localized boundaries.
          </p>
          <p className="text-[10px] text-slate-600">
            Built as a real-world feasibility demonstration for bystander privacy control in the wearable AI era.
          </p>
        </div>
      </footer>

      {/* Real-time iOS/Android-style Smartphone Toast Banner Overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={(event, info) => {
              if (Math.abs(info.offset.x) > 120 || Math.abs(info.velocity.x) > 400) {
                setActiveToast(null);
              }
            }}
            whileDrag={{ scale: 0.98, opacity: 0.8 }}
            className="fixed top-20 right-4 md:right-8 z-50 max-w-sm w-full bg-slate-950/95 border border-slate-800 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl p-4 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y select-none"
          >
            {/* Ambient indicator glow */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              activeToast.type === 'blocking' ? 'bg-emerald-500' :
              activeToast.type === 'child_blocking' ? 'bg-purple-500' :
              activeToast.type === 'video_found' ? 'bg-amber-500 animate-pulse' : 
              activeToast.type === 'battery_warning' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'
            }`} />

            <div className="flex gap-3 pl-1.5">
              <div className="shrink-0 mt-0.5">
                {activeToast.type === 'blocking' && <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />}
                {activeToast.type === 'child_blocking' && <ShieldAlert className="w-5 h-5 text-purple-400 animate-pulse" />}
                {activeToast.type === 'video_found' && <BellRing className="w-5 h-5 text-amber-400" />}
                {activeToast.type === 'video_deleted' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                {activeToast.type === 'battery_warning' && <BatteryWarning className="w-5 h-5 text-rose-400 animate-bounce" style={{ animationDuration: '2s' }} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    {activeToast.type === 'blocking' && '🛡️ Bystander Intercept'}
                    {activeToast.type === 'child_blocking' && '🎒 Child Protection Engaged'}
                    {activeToast.type === 'video_found' && '🌐 Crawler Face Search Match'}
                    {activeToast.type === 'video_deleted' && '✅ CDN Video Blur Secured'}
                    {activeToast.type === 'battery_warning' && '⚠️ Battery Security Warning'}
                  </span>
                  <span className="text-[9px] text-slate-500 shrink-0 font-mono">{activeToast.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">{activeToast.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{activeToast.body}</p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-900/60 text-[10px]">
                  {citizenState.enablePhoneBuzz ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <Smartphone className="w-3 h-3 animate-bounce" /> Pocket buzz sent!
                    </span>
                  ) : (
                    <span className="text-slate-600 font-mono select-none pointer-events-none">
                      ↔ Swipe to dismiss
                    </span>
                  )}
                  <button
                    onClick={() => setActiveToast(null)}
                    className="text-slate-400 hover:text-white font-bold ml-auto font-sans uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Smartphone Haptic Pocket Buzz Visualizer */}
      <AnimatePresence>
        {showHapticRings && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-xs font-sans text-xs text-slate-300 backdrop-blur"
          >
            {/* Pulsing ring animation */}
            <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
              <Smartphone className={`w-6 h-6 text-emerald-400 ${buzzing ? 'animate-bounce' : ''}`} />
              
              {buzzing && (
                <>
                  <span className="absolute inset-0 rounded-xl border border-emerald-500/60 animate-ping opacity-75"></span>
                  <span className="absolute inset-1 rounded-xl border border-emerald-400/40 animate-ping opacity-50" style={{ animationDelay: '0.3s' }}></span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">POCKET HAPTIC CHANNELS</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Phone Buzzing (Vibrator)
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Two short pulses received (Active Shield Triggered)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- QUICK ACTIONS FLOATING MENU --- */}
      {activeView === 'citizen' && citizenTab === 'overview' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
          {/* Expanded Menu */}
          <AnimatePresence>
            {isQuickActionsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-slate-950/95 border border-slate-800/80 rounded-2xl p-4 shadow-2xl w-72 backdrop-blur-xl flex flex-col gap-3 glow-emerald text-white"
              >
                <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">⚡ Core Quick Actions</span>
                  <span className="text-[9px] text-slate-500 font-mono">1-TAP SHORTCUTS</span>
                </div>
                
                {/* Action 1: Emergency Shield */}
                <button
                  id="qa-emergency-shield-btn"
                  type="button"
                  onClick={() => {
                    if (citizenState.emergencyPrivacyActive) {
                      deactivateEmergencyShield();
                      setIsQuickActionsOpen(false);
                    } else {
                      setShowEmergencyConfirm(true);
                      setIsQuickActionsOpen(false);
                    }
                  }}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    citizenState.emergencyPrivacyActive
                      ? 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20 text-red-200'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850/80 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${citizenState.emergencyPrivacyActive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Emergency Shield</span>
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${citizenState.emergencyPrivacyActive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-850 text-slate-500'}`}>
                        {citizenState.emergencyPrivacyActive ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Force maximum optical opt-out on all nearby hardware.</p>
                  </div>
                </button>

                {/* Action 2: Pause All / Resume Broadcasts */}
                <button
                  id="qa-pause-all-btn"
                  type="button"
                  onClick={() => {
                    const isCurrentlyBroadcasting = citizenState.isBroadcasting;
                    if (isCurrentlyBroadcasting) {
                      setCitizenState({
                        ...citizenState,
                        isBroadcasting: false,
                        emergencyPrivacyActive: false
                      });
                      addLog({
                        deviceModel: 'ALL_NEARBY_DEVICES',
                        action: 'ignored',
                        shieldApplied: 'NONE (PAUSED)',
                        distance: 0,
                        rotatedId: 'STANDBY_MODE_ACTIVE'
                      });
                      triggerAlert(
                        '🚫 Privacy Broadcast Paused',
                        'Your localized privacy shield signal has been temporarily deactivated. Nearby cameras can record normally.',
                        'battery_warning'
                  );
                    } else {
                      setCitizenState({
                        ...citizenState,
                        isBroadcasting: true
                      });
                      addLog({
                        deviceModel: 'ALL_NEARBY_DEVICES',
                        action: 'censored',
                        shieldApplied: 'STRICT BLUR',
                        distance: 0,
                        rotatedId: 'REACTIVE_BROADCAST_ACTIVE'
                      });
                      triggerAlert(
                        '🟢 Privacy Broadcast Resumed',
                        'Your localized 12m privacy boundary signal is active. All complying smart recorders will censor your face.',
                        'blocking'
                      );
                    }
                    setIsQuickActionsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    !citizenState.isBroadcasting
                      ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850/80 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${!citizenState.isBroadcasting ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{citizenState.isBroadcasting ? 'Pause All' : 'Resume Broadcast'}</span>
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${!citizenState.isBroadcasting ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {citizenState.isBroadcasting ? 'BROADCASTING' : 'PAUSED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Toggle RF emissions and smart shield opt-out broadcasts.</p>
                  </div>
                </button>

                {/* Action 3: Deep Scan */}
                <button
                  id="qa-deep-scan-btn"
                  type="button"
                  onClick={startDeepScan}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850/80 text-slate-300 text-left transition cursor-pointer group/ds w-full"
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover/ds:bg-emerald-500/20 group-hover/ds:text-emerald-400 shrink-0 transition">
                    <RefreshCw className="w-4 h-4 group-hover/ds:animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block text-white group-hover/ds:text-emerald-400 transition">Deep Scan</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Conduct live 2.4GHz spectrum checks and platform database audits.</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Button */}
          <button
            id="quick-actions-floating-trigger"
            type="button"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold text-xs border shadow-2xl transition-all duration-300 cursor-pointer ${
              isQuickActionsOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-emerald-500/20'
                : citizenState.emergencyPrivacyActive
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 scale-100 hover:scale-105 shadow-red-500/20 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-850 text-white border-slate-800 hover:border-slate-700 scale-100 hover:scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
            }`}
            title="Open Quick Actions floating helper menu"
          >
            <Sparkles className={`w-4 h-4 ${isQuickActionsOpen ? 'animate-spin' : ''}`} style={isQuickActionsOpen ? { animationDuration: '3s' } : undefined} />
            <span>QUICK ACTIONS</span>
            {isQuickActionsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
        </div>
      )}

      {/* --- DEEP SCAN RADAR FULLSCREEN OVERLAY --- */}
      <AnimatePresence>
        {isDeepScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-6 font-sans select-none text-white"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Decorative cyber grid background lines */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            
            {/* Rotating Radar Sweep */}
            <div className="relative w-72 h-72 rounded-full border border-emerald-500/20 flex items-center justify-center">
              {/* Glowing sweep beam */}
              <div className="absolute inset-1 rounded-full border border-emerald-500/10" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/5" />
              <div className="absolute w-[2px] h-36 bg-gradient-to-t from-transparent via-emerald-500/30 to-emerald-400 origin-bottom bottom-1/2 left-1/2 animate-[spin_3s_linear_infinite]" />
              
              {/* Pulsing Target Reticle */}
              <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/40 border-dashed animate-[spin_10s_linear_infinite] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              </div>

              {/* Dynamic scanning blips */}
              {deepScanStep >= 2 && (
                <div className="absolute top-16 right-20 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              )}
              {deepScanStep >= 3 && (
                <div className="absolute bottom-16 left-12 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse" style={{ animationDelay: '0.4s' }} />
              )}
              {deepScanStep >= 4 && (
                <div className="absolute bottom-24 right-16 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" style={{ animationDelay: '0.8s' }} />
              )}
              {deepScanStep >= 5 && (
                <div className="absolute top-28 left-16 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" style={{ animationDelay: '1.2s' }} />
              )}
            </div>

            <div className="mt-8 max-w-md w-full text-center space-y-4">
              <div>
                <span className="text-[10px] font-mono font-black text-emerald-400 tracking-widest bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">
                  SECURE DEEP SCAN IN PROGRESS
                </span>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Scanning BlurBubble Shield Frequencies
                </h3>
                <p className="text-xs text-slate-400 h-5 font-mono">
                  {deepScanStatus}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1">
                  <span>CHANNELS 1-14 AUDIT</span>
                  <span className="text-emerald-400 font-bold">{deepScanProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${deepScanProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>

              {/* Cyber Logs Console */}
              <div className="bg-black/60 rounded-xl border border-slate-800 p-3 h-28 text-left overflow-hidden font-mono text-[9px] text-slate-400 space-y-1 select-none shadow-2xl relative">
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div className="text-slate-500 border-b border-slate-900 pb-1 mb-1.5 flex justify-between uppercase font-bold text-[8px]">
                  <span>Active Spectrum Logs</span>
                  <span className="animate-pulse">🟢 MONITORING</span>
                </div>
                {deepScanStep >= 1 && <div className="text-slate-300">&gt; [RF_CORE] Sweeping 2400-2483.5 MHz... Nominal spectrum coverage.</div>}
                {deepScanStep >= 2 && <div className="text-cyan-400/80">&gt; [BLE_NET] Discovered active broadcast beacon: {citizenState.anonymousId}</div>}
                {deepScanStep >= 3 && <div className="text-slate-300">&gt; [TAGS_AUDIT] {citizenState.registeredEntities.filter(e => e.isActive).length} active smart tags verified and responsive.</div>}
                {deepScanStep >= 4 && <div className="text-cyan-400/80">&gt; [HANDSHAKE] Verification complete: AR Glasses HUD v1.2 complies with RFC-9402.</div>}
                {deepScanStep >= 5 && <div className="text-purple-400/80">&gt; [CDN_INDEXER] Social CDN metadata synced. {citizenState.registeredFaces.length} facial templates registered.</div>}
                {deepScanStep >= 6 && <div className="text-emerald-400 font-bold animate-pulse">&gt; [INTEGRITY] Success. Perimeter hardened. Shield is active.</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Biometric App Lock Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 font-sans select-none"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950 to-rose-950/15 opacity-80 pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden space-y-6"
            >
              {/* Subtle ambient security lock grid */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -z-10" />
              
              {/* Lock Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 relative">
                  <Lock className="w-6 h-6 animate-pulse" />
                  <span className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-25" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">BlurBubble Secure Shield</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Dashboard restricted by WebAuthn hardware biometric opt-out guard.
                </p>
              </div>

              {/* Registered Credential Tag */}
              {citizenState.biometricRegistered && (
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] uppercase font-mono text-slate-500 font-bold tracking-widest block">Active Key Device</span>
                  <span className="text-xs font-semibold text-rose-300 font-mono">🔑 {citizenState.biometricRelyingParty}</span>
                </div>
              )}

              {/* Error messages if any */}
              {authError && (
                <div className="bg-rose-950/30 border border-rose-900/40 text-rose-400 text-[11px] p-3 rounded-lg leading-relaxed text-center font-mono">
                  ⚠️ {authError}
                </div>
              )}

              {/* Main Interactive Action */}
              <div className="space-y-4">
                
                {/* Fingerprint Touch Area */}
                <button
                  type="button"
                  id="lock-screen-verify-btn"
                  onClick={async () => {
                    setIsAuthenticating(true);
                    setAuthError(null);
                    try {
                      const challenge = new Uint8Array(32);
                      window.crypto.getRandomValues(challenge);
                      
                      const assertion = await navigator.credentials.get({
                        publicKey: {
                          challenge: challenge,
                          rpId: window.location.hostname || "localhost",
                          userVerification: "required",
                          timeout: 5000
                        }
                      });
                      
                      if (assertion) {
                        setIsLocked(false);
                        triggerAlert(
                          'Identity Verified',
                          'Hardware credentials validated. Access granted to Opt-Out Shield Protocol.',
                          'blocking'
                        );
                      }
                    } catch (err: any) {
                      console.warn("TouchID Assertion Error:", err);
                      setAuthError("Iframe context blocked direct enclave. Initializing local cryptographic simulation...");
                      
                      // Auto trigger simulation for premium seamless preview
                      setTimeout(() => {
                        setShowSimulatedTouchId(true);
                        setSimulatedTouchState('scanning');
                        
                        setTimeout(() => {
                          setSimulatedTouchState('success');
                          setTimeout(() => {
                            setIsLocked(false);
                            setShowSimulatedTouchId(false);
                            setSimulatedTouchState('idle');
                            setAuthError(null);
                            triggerAlert(
                              'Identity Verified (Simulated)',
                              'Virtual hardware signature approved successfully.',
                              'blocking'
                            );
                          }, 800);
                        }, 1600);
                      }, 1000);
                    } finally {
                      setIsAuthenticating(false);
                    }
                  }}
                  className="w-full relative py-6 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 group-hover:border-rose-400/40 flex items-center justify-center transition-all">
                    <Fingerprint className="w-7 h-7 text-rose-400 group-hover:scale-105 transition-all" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {isAuthenticating ? "Accessing Secure Enclave..." : "Scan Passkey / Biometrics"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Click to trigger device biometrics
                  </span>
                </button>

                {/* Simulated Floating Dialog (iOS style popup fallback) */}
                {showSimulatedTouchId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-72 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-2xl text-center space-y-4"
                    >
                      <div className="relative w-16 h-16 mx-auto rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center overflow-visible">
                        {/* Dynamic back-glow effect when scanning */}
                        {simulatedTouchState === 'scanning' && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0.3 }}
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.8, 0.3],
                              boxShadow: [
                                "0 0 10px 2px rgba(244, 63, 94, 0.2)",
                                "0 0 25px 8px rgba(244, 63, 94, 0.6)",
                                "0 0 10px 2px rgba(244, 63, 94, 0.2)"
                              ]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 rounded-full bg-rose-500/20"
                          />
                        )}
                        
                        <motion.div
                          animate={simulatedTouchState === 'scanning' ? {
                            scale: [1, 1.12, 1],
                            filter: [
                              "drop-shadow(0 0 2px rgba(244, 63, 94, 0.4))",
                              "drop-shadow(0 0 12px rgba(244, 63, 94, 0.9))",
                              "drop-shadow(0 0 2px rgba(244, 63, 94, 0.4))"
                            ]
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative z-10 flex items-center justify-center"
                        >
                          <Fingerprint className="w-8 h-8 text-rose-400" />
                        </motion.div>

                        {simulatedTouchState === 'scanning' && (
                          <motion.span 
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                            className="absolute inset-0 rounded-full border border-rose-500/60" 
                          />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Touch ID for "BlurBubble"</h4>
                        <p className="text-xs text-slate-400">Scan fingerprint to unlock your Opt-Out dashboard.</p>
                      </div>

                      <div className="text-xs font-mono font-bold">
                        {simulatedTouchState === 'scanning' && (
                          <span className="text-rose-400">SCANNING HARDWARE SECURE KEY...</span>
                        )}
                        {simulatedTouchState === 'success' && (
                          <span className="text-emerald-400">✓ KEY SIGNATURE VERIFIED</span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* PIN Code Emergency Fallback Option */}
                {showPasscodeOption ? (
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-850 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Emergency Bypass PIN</span>
                      <button
                        type="button"
                        onClick={() => setShowPasscodeOption(false)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Use Biometrics
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={4}
                        value={passcodeAttempt}
                        onChange={(e) => setPasscodeAttempt(e.target.value)}
                        placeholder="••••"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-center text-sm font-bold tracking-widest text-white focus:outline-none focus:border-rose-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (passcodeAttempt === '1234') {
                              setIsLocked(false);
                              setPasscodeAttempt('');
                              setShowPasscodeOption(false);
                              setAuthError(null);
                              triggerAlert('Access Granted', 'Authorized bypass PIN verified.', 'blocking');
                            } else {
                              setAuthError('Invalid emergency bypass PIN. Correct PIN: 1234');
                              setPasscodeAttempt('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (passcodeAttempt === '1234') {
                            setIsLocked(false);
                            setPasscodeAttempt('');
                            setShowPasscodeOption(false);
                            setAuthError(null);
                            triggerAlert('Access Granted', 'Authorized bypass PIN verified.', 'blocking');
                          } else {
                            setAuthError('Invalid emergency bypass PIN. Correct PIN: 1234');
                            setPasscodeAttempt('');
                          }
                        }}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs px-3 rounded-lg"
                      >
                        Submit
                      </button>
                    </div>
                    <span className="block text-[9px] text-slate-500 text-center font-mono">Default developer emergency PIN is <span className="font-bold text-rose-400">1234</span></span>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowPasscodeOption(true)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-mono underline uppercase tracking-wider"
                    >
                      Use Emergency PIN Code
                    </button>
                  </div>
                )}

              </div>

              {/* Debug / Auditor Diagnostic console in Lock Screen */}
              <div className="bg-black/50 rounded-xl p-3.5 border border-slate-950 font-mono text-[9px] text-slate-400 leading-normal space-y-1">
                <div className="text-rose-400 font-bold border-b border-slate-900 pb-1 flex justify-between uppercase">
                  <span>Vault Diagnostics</span>
                  <span>status: SECURE</span>
                </div>
                <div>[SECURE] Host: {window.location.hostname || "localhost"}</div>
                <div>[SECURE] Sandbox restricted: {window.parent !== window ? 'TRUE (IFRAME)' : 'FALSE'}</div>
                <div>[SECURE] Local Bypass: PIN:1234 available</div>
                <div>[SECURE] WebAuthn support: {window.PublicKeyCredential ? 'PRESENT' : 'NOT DETECTED'}</div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- UNIVERSAL USER FRIENDLY WALKTHROUGH & INTERACTIVE HELP CENTER --- */}
      <AnimatePresence>
        {showHelpCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setShowHelpCenter(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`w-full max-w-4xl ${citizenState.theme === 'visibility' ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'bg-slate-900 border-slate-800 text-white'} border rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${citizenState.theme === 'visibility' ? 'bg-zinc-200/50 border-zinc-300' : 'bg-slate-950/50 border-slate-800'} flex items-start justify-between gap-4 shrink-0`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                      Interactive User Guide
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                      v1.2 Active
                    </span>
                  </div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Welcome to BlurBubble™ Privacy Hub
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    BlurBubble™ is an offline-first system designed to protect your physical identity in public spaces. Use this interactive reference to explore each feature, understand how it works, and trigger live simulations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpCenter(false)}
                  className={`p-2 rounded-xl transition border ${citizenState.theme === 'visibility' ? 'bg-zinc-300 hover:bg-zinc-400 border-zinc-400 text-zinc-800' : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white'} text-xs font-bold`}
                  title="Close help guide"
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Body & Tab Navigation - Bento Grid Layout */}
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                
                {/* Left Side Quick Menu / Tab Options */}
                <div className={`w-full md:w-60 border-b md:border-b-0 md:border-r p-4 space-y-1.5 overflow-y-auto shrink-0 ${citizenState.theme === 'visibility' ? 'bg-zinc-200/30 border-zinc-300' : 'bg-slate-950/20 border-slate-850'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-2">
                    Guide Index
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setGuideCategory('audit')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'audit'
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>1. Check Safety Proof</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('faq')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'faq'
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>2. Easy Q&amp;A Help</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('hud')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'hud'
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>3. Glasses Test Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('intro')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'intro'
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <Sparkle className="w-4 h-4 shrink-0" />
                    <span>4. Learn What This Is</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('shield')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'shield'
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>5. Safety Shield Setup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('tour')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'tour'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>6. Interactive Feature Tour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideCategory('support')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      guideCategory === 'support'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>7. Help Desk & Support</span>
                  </button>

                  <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block px-2">
                      Quick Simulator Tests
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerAlert(
                          'Simulated Shield Breach',
                          'A suspicious un-flagged recording node has approached your perimeter (7.2 meters away). Shield status optimized.',
                          'blocking'
                        );
                      }}
                      className="w-full py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 text-left font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🚨</span> Trigger Shield Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerAlert(
                          'Smart Tag Shield Engaged',
                          "Bystander camera attempted scanning Lily's school-backpack. Decoy-hash and children opt-out broadcast successfully.",
                          'child_blocking'
                        );
                      }}
                      className="w-full py-1.5 px-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-[10px] text-purple-400 text-left font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🎒</span> Trigger Child Shield Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerAlert(
                          'Web Crawler Match Found',
                          "Automatic social media indexer matched Paul face-vector signature in a public YouTube video upload. Dispatched compliance requests.",
                          'video_found'
                        );
                      }}
                      className="w-full py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 text-left font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🌐</span> Trigger Crawler Alert
                    </button>
                  </div>
                </div>

                {/* Right Side Details/Content Viewer */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  
                  {/* Category 1: Welcome & Overview */}
                  {guideCategory === 'intro' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                          🏡 Introduction to Decentralized Privacy
                        </h4>
                        <p className="text-xs text-slate-400">
                          How BlurBubble guarantees your spatial and facial privacy.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                        <h5 className="text-xs font-bold text-white">The Opt-Out Concept</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          BlurBubble utilizes low-power local signals (BLE and Wi-Fi) to broadcast your customized <strong>Privacy Preference Bubble</strong>. This signal is designed to communicate with nearby complying recorders, smart spectacles, and security networks, asking them to automatically blur or replace your profile before video is captured or stored.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-950/20 border border-slate-850 rounded-xl space-y-1.5">
                          <span className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            Offline-First Design
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            All cryptographic calculations and broadcast keys rotate locally on your device. There is no cloud telemetry, tracking, or user surveillance.
                          </p>
                        </div>
                        <div className="p-3.5 bg-slate-950/20 border border-slate-850 rounded-xl space-y-1.5">
                          <span className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                            Zero-Knowledge ID
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Your broadcast identifier shifts anonymously every 15 minutes, preventing physical trackers or signal sniffers from auditing your locations.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
                        <h5 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <span>💡</span> How to explore this simulation app:
                        </h5>
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">Step A:</span>
                            <span>Navigate to <strong>Citizen Settings</strong> (active view). Select a Censor Shield Mode (e.g., Magic Removal or Strict Blur).</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">Step B:</span>
                            <span>Change the broadcast range. Notice the immediate real-time calculations.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">Step C:</span>
                            <span>Switch to <strong>Glasses Viewfinder</strong> and observe the simulated street people or webcam to visualize how nearby smart glasses apply the censorship layers instantly!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category 2: Citizen Settings */}
                  {guideCategory === 'shield' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                          <Shield className="w-4 h-4" />
                          Citizen Settings &amp; Personal Protections
                        </h4>
                        <p className="text-xs text-slate-400">
                          Understanding the features inside the primary dashboard.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                            Active Signal Broadcasting
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Toggling 'Broadcasting' turns on low-power BLE advertise parameters. By increasing your range (meters), you grow your defensive privacy bubble. If smart spectacles enter this radius, they receive your rolling cryptographic identifier.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Smile className="w-3.5 h-3.5 text-purple-400" />
                            Facial Registry &amp; Vector Vectors
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Rather than storing actual images, BlurBubble converts your facial features into an encrypted 128-dimensional vector hash. Recording drones or public platform indexers match this hash locally to automatically mask your face without having access to your image files.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            Smart Protection Tags (Wearables &amp; Pets)
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Add custom beacons to secure valuables, backpacks, family members, or pets. This extends your shield coverage to children or smart items, forcing third-party lenses to automatically apply censorship filters over them.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                            WiFi Automation triggers (SSID rules)
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Create rules to transition your security posture dynamically based on connected SSIDs. For instance, set broadcasting to automatic "Low" in your trusted home WiFi network to conserve battery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category 3: Glasses Viewfinder */}
                  {guideCategory === 'hud' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                          <Eye className="w-4 h-4" />
                          Glasses Viewfinder &amp; HUD Simulation
                        </h4>
                        <p className="text-xs text-slate-400">
                          Visualizing compliance through the eyes of recording hardware.
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        To test how BlurBubble behaves in the real world, the <strong>Glasses Viewfinder</strong> simulates compliance overlays from the perspective of an onboard AI wearer.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-blue-400" />
                            Street Simulator
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Observe pedestrians walking in public. As they approach, the HUD detects their registered privacy beacons and places automatic real-time blurs, pixelation filters, or black bar blocks on them instantly.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                            Webcam Sandbox
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Toggle your computer webcam to act as a recording glasses lens. Drag the focus circle over your face to simulate how complying edge-computing smart lenses apply dynamic real-time blur layers over you!
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-amber-400" />
                            BLE Device Scanner
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Inspect nearby recording nodes (Ray-Ban glasses, DJI drones, Sony security rigs) sweep signals, and execute compliance handshakes to enforce localized digital guidelines.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-red-400" />
                            RF Signal Heatmap
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Visualize the wireless signal coverage of your anonymous beacon. Track localized privacy metrics, channel noise, and device density in real-time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category 4: Audit & Crawler */}
                  {guideCategory === 'audit' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                          <FileText className="w-4 h-4" />
                          Compliance Audit &amp; Platform Crawler
                        </h4>
                        <p className="text-xs text-slate-400">
                          Ensuring protection across streaming services and auditing log files.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>🌐</span> Decentralized Platform Web Crawler
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Our automatic background crawler constantly sweeps streaming platforms like YouTube, TikTok, and Instagram for unconsented face captures. If a matched facial biometric is discovered, BlurBubble automatically coordinates direct API compliance requests to blur or obscure your video segments retroactive.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1.5">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            Logs &amp; History Audit
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Track every single simulated bypass handshake, opt-out compliance exchange, or proximity sensor scan. Logs are kept in a local, zero-knowledge on-device ledger, allowing you to trace who approached your privacy perimeter and which shield was applied.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category 5: FAQs */}
                  {guideCategory === 'faq' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                          ❓ Frequently Asked Questions &amp; Help
                        </h4>
                        <p className="text-xs text-slate-400">
                          Common user questions and operational troubleshooting tips.
                        </p>
                      </div>

                      <div className="space-y-3 divide-y divide-slate-800/60">
                        <div className="pt-2 space-y-1">
                          <h5 className="text-xs font-bold text-white">Q: Do nearby cameras need cellular connection to blur my face?</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            No! Complying smart glasses and security systems execute matching filters directly on their local edge processors (NPU/APU), recognizing your BLE broadcast anonymously even when cellular network is offline.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <h5 className="text-xs font-bold text-white">Q: What is the developer Emergency PIN code?</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            If you activate the "Biometric Lock" and lock your screen, you can unlock using simulated Touch ID or by providing the default emergency PIN code: <span className="font-mono text-emerald-400 font-bold">1234</span>.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <h5 className="text-xs font-bold text-white">Q: Is the webcam mode real?</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Yes! Clicking 'Activate Webcam Sandbox' connects to your computer camera locally. No image is transmitted anywhere, keeping your face completely private while illustrating dynamic real-time video censorship.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <h5 className="text-xs font-bold text-white">Q: How can I clear all data?</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            You can click "Factory Reset" in the top bar from any view. This immediately purges all registered face vectors, SSIDs rules, wearable tags, and compliance logs from localStorage.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category 6: Interactive Feature Tour */}
                  {guideCategory === 'tour' && (() => {
                    const completedCount = Object.values(tourSteps).filter(Boolean).length;
                    const totalSteps = Object.keys(tourSteps).length;
                    const pct = Math.round((completedCount / totalSteps) * 100);
                    return (
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                            Interactive Application Walkthrough
                          </h4>
                          <p className="text-xs text-slate-400">
                            Complete these key simulation exercises to master the BlurBubble privacy controls.
                          </p>
                        </div>

                        {/* Interactive Progress Bar */}
                        <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 font-semibold">ECOSYSTEM MASTERY PROGRESS</span>
                            <span className="text-emerald-400 font-bold">{pct}% ({completedCount}/{totalSteps} Steps)</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-850">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {pct === 100 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-400 font-bold flex items-center gap-2 mt-2"
                            >
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-bounce" />
                              <span>Ecosystem Mastery Complete! You have successfully tested and configured every core privacy layer.</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Steps Checklist */}
                        <div className="space-y-3">
                          {[
                            {
                              id: 'shieldActivated',
                              label: '🛡️ Activate Shield Broadcast',
                              desc: 'Turn on broadcasting to begin emitting active decoy-hashes and personal protection beacons.',
                              actionLabel: 'Go to Overview ➔',
                              target: () => {
                                handleLaunchApp('citizen', 'overview');
                                setShowHelpCenter(false);
                              }
                            },
                            {
                              id: 'osLauncherOpened',
                              label: '📱 Launch OS Home Screen',
                              desc: 'Enable the simulated smartphone disguise to reveal the customizable widgets and floating dock.',
                              actionLabel: 'Launch OS OS ➔',
                              target: () => {
                                setCitizenState(prev => ({ ...prev, disguiseUiActive: true }));
                                setShowHelpCenter(false);
                              }
                            },
                            {
                              id: 'webcamTested',
                              label: '📷 Test webcam Face Blur',
                              desc: 'Open the Live Webcam Sandbox and position the target overlay to observe complies filter rendering.',
                              actionLabel: 'Open Webcam HUD ➔',
                              target: () => {
                                handleLaunchApp('glasses', 'webcam');
                                setShowHelpCenter(false);
                              }
                            },
                            {
                              id: 'complianceChecked',
                              label: '🔍 Check Official Audit Proof',
                              desc: 'Inspect regulatory certificates, decrypted ECC keys, and compliance verification receipts.',
                              actionLabel: 'Open Audit Page ➔',
                              target: () => {
                                handleLaunchApp('audit', 'main');
                                setShowHelpCenter(false);
                              }
                            },
                            {
                              id: 'ticketSubmitted',
                              label: '📝 Submit Feedback Ticket',
                              desc: 'Send a simulated customer feedback, bug report, or feature request to our server support desk.',
                              actionLabel: 'Go to Help Desk ➔',
                              target: () => {
                                setGuideCategory('support');
                              }
                            },
                            {
                              id: 'diagnosticsRun',
                              label: '⚙️ Run Hardware Self-Test',
                              desc: 'Initialize the full hardware transceiver self-test to verify local NPU and BLE frequencies.',
                              actionLabel: 'Run self-test ➔',
                              target: () => {
                                setGuideCategory('support');
                              }
                            }
                          ].map((step) => {
                            const isDone = (tourSteps as any)[step.id];
                            return (
                              <div 
                                key={step.id} 
                                className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-4 ${
                                  isDone 
                                    ? 'bg-emerald-950/10 border-emerald-500/25 text-slate-300' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className="mt-0.5 shrink-0">
                                    {isDone ? (
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                                        <Check className="w-3.5 h-3.5 font-black" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-500" />
                                    )}
                                  </div>
                                  <div className="space-y-0.5 text-left">
                                    <h5 className={`text-xs font-bold ${isDone ? 'text-slate-200 line-through font-normal' : 'text-slate-300'}`}>
                                      {step.label}
                                    </h5>
                                    <p className="text-[11px] text-slate-400 leading-normal font-normal">{step.desc}</p>
                                  </div>
                                </div>
                                {!isDone && (
                                  <button
                                    onClick={step.target}
                                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-[9px] uppercase tracking-wide shrink-0 transition"
                                  >
                                    {step.actionLabel}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Category 7: Support & Help Desk */}
                  {guideCategory === 'support' && (
                    <div className="space-y-6">
                      <div className="space-y-1 text-left">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-cyan-400">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                          BlurBubble Help Desk &amp; Console
                        </h4>
                        <p className="text-xs text-slate-400">
                          Submit system tickets, run hardware calibrations, or reset local database states.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Panel A: Submit Ticket Form */}
                        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4 text-left">
                          <h5 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            Submit Helpdesk Ticket
                          </h5>

                          {feedbackSuccess ? (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-center space-y-2"
                            >
                              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                                <Check className="w-4 h-4 font-black" />
                              </div>
                              <p className="text-xs font-bold text-slate-200">Ticket Submitted Successfully!</p>
                              <p className="text-[10px] text-slate-400 leading-normal font-normal">Your issue has been logged into the dynamic activity ledger. We are processing your request.</p>
                              <button
                                onClick={() => setFeedbackSuccess(false)}
                                className="mt-2 text-[10px] text-cyan-400 underline font-bold"
                              >
                                Submit another ticket
                              </button>
                            </motion.div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!feedbackMessage.trim()) return;
                                setIsSubmittingFeedback(true);
                                setTimeout(() => {
                                  const ticketNum = `T-${Math.floor(1000 + Math.random() * 9000)}`;
                                  const newTicket = {
                                    id: `ticket-${Date.now()}`,
                                    category: feedbackCategory,
                                    message: feedbackMessage,
                                    email: feedbackEmail || 'support@blurbubble.org',
                                    status: 'open' as const,
                                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                    ticketNum
                                  };
                                  setSupportTickets(prev => [newTicket, ...prev]);
                                  addLog({
                                    deviceModel: 'SYSTEM_SUPPORT_DESK',
                                    action: 'censored',
                                    shieldApplied: `SUPPORT TICKET SUBMITTED (${ticketNum})`,
                                    distance: 0,
                                    rotatedId: ticketNum
                                  });
                                  setTourSteps((prev: any) => ({ ...prev, ticketSubmitted: true }));
                                  setIsSubmittingFeedback(false);
                                  setFeedbackSuccess(true);
                                  setFeedbackMessage('');
                                }, 1200);
                              }}
                              className="space-y-3"
                            >
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Contact Email</label>
                                <input
                                  type="email"
                                  required
                                  value={feedbackEmail}
                                  onChange={(e) => setFeedbackEmail(e.target.value)}
                                  placeholder="user@example.com"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition font-normal"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Request Type</label>
                                <select
                                  value={feedbackCategory}
                                  onChange={(e) => setFeedbackCategory(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                                >
                                  <option value="Feature Request">💡 Feature Request</option>
                                  <option value="Bug Report">🐛 Bug Report</option>
                                  <option value="Hardware Help">🕶️ Smart Glasses Help</option>
                                  <option value="General Question">❓ General Inquiry</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Describe Your Issue</label>
                                <textarea
                                  required
                                  rows={3}
                                  value={feedbackMessage}
                                  onChange={(e) => setFeedbackMessage(e.target.value)}
                                  placeholder="What do you want us to add, help you with, or fix?"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none font-normal"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isSubmittingFeedback}
                                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-900/40 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {isSubmittingFeedback ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Encrypting & Sending...
                                  </>
                                ) : (
                                  <>Encrypt & Submit Ticket</>
                                )}
                              </button>
                            </form>
                          )}
                        </div>

                        {/* Panel B: Live Diagnostics Terminal */}
                        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4 text-left">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-2 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-sans font-bold">
                                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                                Hardware Diagnostics Self-Test
                              </span>
                              {isDiagnosticsRunning && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                            </h5>

                            {/* Simulated Terminal Monitor */}
                            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 min-h-[140px] max-h-[160px] overflow-y-auto space-y-1.5 font-mono select-text text-left">
                              {diagnosticsLogs.length > 0 ? (
                                diagnosticsLogs.map((log, i) => (
                                  <div key={i} className="text-[9px] text-emerald-400 leading-normal border-b border-slate-900/30 pb-0.5 font-mono">
                                    {log}
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-500 leading-normal font-mono font-normal">
                                  System idle. Click "Run Diagnostics" to perform full RF calibration, BLE channel testing, and verify face-vector latency parameters.
                                </p>
                              )}
                              {isDiagnosticsRunning && (
                                <div className="text-[9px] text-cyan-400 font-bold animate-pulse font-mono">
                                  ⚙️ SYSTEM SCANNING IN PROGRESS...
                                </div>
                              )}
                            </div>

                            {/* Progress bar for diagnostics */}
                            {isDiagnosticsRunning && (
                              <div className="space-y-1">
                                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${diagnosticsProgress}%` }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={runSystemDiagnostics}
                            disabled={isDiagnosticsRunning}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-900/40 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticsRunning ? 'animate-spin' : ''}`} />
                            Run Hardware Self-Test
                          </button>
                        </div>

                      </div>

                      {/* Panel C: Submitted tickets and factory reset */}
                      <div className="space-y-4 pt-4 border-t border-slate-800/60 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Tickets registry */}
                          <div className="space-y-2">
                            <h6 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Submitted Tickets Ledger</h6>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {supportTickets.map((ticket) => (
                                <div key={ticket.id} className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1 font-sans text-left font-normal text-slate-300">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-mono font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                      {ticket.ticketNum}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono text-[8px] ${
                                      ticket.status === 'resolved'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : ticket.status === 'investigating'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                                    }`}>
                                      {ticket.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-200 line-clamp-1">"{ticket.message}"</p>
                                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                    <span>Category: {ticket.category}</span>
                                    <span>{ticket.timestamp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Factory Reset Recovery */}
                          <div className="p-4 bg-rose-950/10 border border-rose-500/10 hover:border-rose-500/30 rounded-xl space-y-2 text-left transition duration-300">
                            <h6 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                              <span>⚠️</span> Factory Restore &amp; Wipe Cache
                            </h6>
                            <p className="text-[10px] text-slate-400 leading-normal font-normal">
                              Purge customized SSIDs, reset face registration vectors, clear all active system logs, and restore default parameters. This action is irreversible.
                            </p>
                            <button
                              onClick={() => {
                                if (confirm('Are you absolutely sure you want to perform a hard factory reset? This will restore original parameters, remove your tickets, and clear all active activity logs.')) {
                                  handleSystemFactoryReset();
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 border border-rose-500/20 text-rose-400 text-[10px] font-bold transition duration-200 cursor-pointer"
                            >
                              Double-Lock Factory Reset
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t ${citizenState.theme === 'visibility' ? 'bg-zinc-200 border-zinc-300' : 'bg-slate-950/60 border-slate-800'} flex items-center justify-between gap-4 shrink-0`}>
                <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                  Click anywhere outside, or hit Close to resume testing the simulation.
                </span>
                <button
                  type="button"
                  onClick={() => setShowHelpCenter(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold transition text-xs shadow-lg shadow-blue-500/15"
                >
                  I Understand, Let's Test It!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Shield Confirmation Dialog */}
      <AnimatePresence>
        {showEmergencyConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-950 border border-red-500/40 rounded-2xl p-6 shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl shrink-0 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-red-400 font-mono flex items-center gap-2">
                    ⚠️ ENGAGE EMERGENCY SHIELD PROTOCOL?
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Warning: Engaging the Emergency Shield activates full localized RF/Optical opt-out defenses. This forces peer hardware to drop connection logs and restricts automated scanning arrays.
                  </p>
                </div>
              </div>

              {/* Systems Affected Breakdown */}
              <div className="mt-5 border border-slate-900 bg-slate-900/30 rounded-xl p-4 space-y-3">
                <span className="text-[9px] font-extrabold uppercase tracking-wider font-mono text-slate-500 block border-b border-slate-900 pb-1.5">
                  SYSTEMS & COUNTERMEASURES IMPACT SUMMARY
                </span>

                <div className="space-y-2.5">
                  {/* System 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 animate-ping" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-200 block font-mono">📡 RF & BLE Beacons (Peak Transmission Power)</span>
                      <span className="text-[9px] text-slate-500 block leading-normal">
                        Switches RF power to absolute maximum (+12dBm) for persistent 30m broadcast saturation.
                      </span>
                    </div>
                  </div>

                  {/* System 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-200 block font-mono">👁️ Optical Obfuscation Engine (Max Opt-out)</span>
                      <span className="text-[9px] text-slate-500 block leading-normal">
                        Upgrades standard selective face-blur to a zero-exceptions, complete opt-out pixelation across all complying recorders.
                      </span>
                    </div>
                  </div>

                  {/* System 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-200 block font-mono">⚡ Active Defense Modules Enabled</span>
                      <span className="text-[9px] text-slate-500 block leading-normal">
                        Flashes IR Jammer LEDs, spins the mock LiDAR noise sweep, and engages ultrasonic microphone saturation to distort close-range cameras.
                      </span>
                    </div>
                  </div>

                  {/* System 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-200 block font-mono">🧹 Strict Zero-Retention Compliance</span>
                      <span className="text-[9px] text-slate-500 block leading-normal">
                        Instructs any participating local logs and networks to clear all caching registers immediately.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialogue Actions */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition text-[11px] font-bold font-mono text-center cursor-pointer"
                >
                  ABORT PROTOCOL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    activateEmergencyShield();
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[11px] font-mono tracking-wide text-center cursor-pointer border border-red-500 shadow-lg shadow-red-500/25 transition duration-200"
                >
                  ENGAGE EMERGENCY PROTECTION (MAX)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
