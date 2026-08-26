import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../lib/i18n';
import * as d3 from 'd3';

import { 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  EyeOff, 
  User, 
  Settings2, 
  Clock, 
  Volume2,
  VolumeX,
  Sliders,
  Battery,
  BatteryWarning,
  RefreshCw, 
  Share2, 
  AlertCircle,
  Hash,
  Sparkles,
  Layers,
  LayoutGrid,
  Sparkle,
  Plus,
  Trash2,
  Lock,
  Tag,
  Smile,
  Info,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Building,
  Home,
  Globe,
  KeyRound,
  History,
  Video,
  Shield,
  Search,
  Bell,
  BellRing,
  Award,
  Cpu,
  Smartphone,
  Bot,
  Calendar,
  Zap,
  FileText,
  Scale,
  Briefcase,
  Baby,
  Beer,
  Car,
  Users,
  School,
  Bluetooth,
  Wifi,
  Fingerprint,
  Key,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ChevronRight,
  Edit2,
  Check,
  Mic,
  Music,
  MicOff,
  Download,
  Mail,
  Copy,
  Send,
  X,
  Activity,
  Gavel,
  CheckSquare,
  FlaskConical,
  Compass,
  Gamepad2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import D3SignalMap from './D3SignalMap';
import GoogleMapsPrivacyRadar from './GoogleMapsPrivacyRadar';
import AppleMapsPrivacyRadar from './AppleMapsPrivacyRadar';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PrivacyLevel, CitizenState, DetectionLog, RegisteredEntity, FaceRecord, PerimeterSensor, WebTakedownRecord, EscrowKeyHolder, HardwareLicense, WifiTriggerRule } from '../types';
// @ts-ignore
import appLogo from '../assets/images/app_logo_1783164957092.jpg';

interface PrivacyBeaconProps {
  state: CitizenState;
  onChange: (newState: CitizenState) => void;
  logs: DetectionLog[];
  onClearLogs: () => void;
  activeTab?: 'overview' | 'signal' | 'tags' | 'faces' | 'scrub' | 'perimeter' | 'retention' | 'escrow' | 'licensing' | 'legal' | 'pairing' | 'wifi' | 'biometric' | 'hierarchy' | 'targeted' | 'audio_shield' | 'audio_scrub' | 'audio_map' | 'experimental';
  onTabChange?: (tab: 'overview' | 'signal' | 'tags' | 'faces' | 'scrub' | 'perimeter' | 'retention' | 'escrow' | 'licensing' | 'legal' | 'pairing' | 'wifi' | 'biometric' | 'hierarchy' | 'targeted' | 'audio_shield' | 'audio_scrub' | 'audio_map' | 'experimental') => void;
  onAddLog?: (log: any) => void;
  onTriggerAlert?: (title: string, body: string, type: 'blocking' | 'child_blocking' | 'video_found' | 'video_deleted' | 'battery_warning') => void;
}

const HIERARCHY_DETAILS: Record<string, { title: string; desc: string; icon: string; badgeColor: string; defaultRank: number }> = {
  lockdown: {
    title: "Total Lockdown Override",
    desc: "System-wide override that blocks all device whitelist connections, law enforcement warrants, and third-party API exceptions.",
    icon: "ShieldAlert",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    defaultRank: 1
  },
  strict_rules: {
    title: "Strict Restrictions (Emergency Shield)",
    desc: "Emergency opt-out broadcast enforcing strict blur / visual removal regardless of location or relationship.",
    icon: "Shield",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    defaultRank: 2
  },
  perimeter_shields: {
    title: "Perimeter Zones & Stationary Beacons",
    desc: "Hard geo-fenced boundaries (schools, home zones) that enforce stationary opt-out shields on any entering device.",
    icon: "MapPin",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    defaultRank: 3
  },
  allow_list: {
    title: "Allow List Exceptions (Family Whitelist)",
    desc: "Permits registered family channels, close-friend device cameras, or authorized streams to bypass opt-out blurring.",
    icon: "Users",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    defaultRank: 4
  },
  wifi_triggers: {
    title: "WiFi Automation Rules",
    desc: "Automated privacy profile switches triggered by joining specific SSID networks (office, coffee shops, home).",
    icon: "Wifi",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    defaultRank: 5
  },
  smart_schedules: {
    title: "Smart Scheduling Profiles",
    desc: "Time-of-day schedule blocks defining when broadcasting is automatically toggled (work hours, school runs).",
    icon: "Clock",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    defaultRank: 6
  }
};

const HELP_TOPICS: Record<string, {
  title: string;
  category: string;
  summary: string;
  whatItDoes: string;
  howToUse: string;
  benefits: string[];
}> = {
  overview: {
    title: "Privacy Hub & Overview Dashboard",
    category: "General Command Center",
    summary: "The main cockpit of the BlurBubble application, providing real-time telemetry, visual metrics, and state indications of your active defenses.",
    whatItDoes: "Aggregates signal indicators, historical log statistics, and current shielding levels into an easy-to-read heads-up display. It lets you monitor current BLE/WiFi active handshakes and observe overall system integrity.",
    howToUse: "Select different sub-modules from the category tabs to configure specific protection domains. Use the layout config switches at the bottom of the dashboard to show or hide cards according to your convenience.",
    benefits: [
      "Real-time visibility of system and battery status.",
      "Instant access to emergency max-security controls.",
      "A simplified unified control interface."
    ]
  },
  settings: {
    title: "Alerts & Central App Settings",
    category: "System Preferences",
    summary: "Allows you to fine-tune how and when BlurBubble delivers high-priority privacy alerts, audio chimes, and haptic feedback.",
    whatItDoes: "Enables configuring physical haptic pocket buzzer tick simulations, floating toast delivery parameters, smart-glasses brand-specific naming filters, and localized audio chimes built on web audio oscillators.",
    howToUse: "Toggle push notification banners, activate haptic buzz simulations, customize distance/model exclusions inside notification texts, or test custom oscillator-synthesized alarm sounds.",
    benefits: [
      "Customize alerts to avoid notification fatigue.",
      "Hide distance and camera models from descriptions for cleaner privacy.",
      "Audibly test synthesizer sound profiles directly in the browser."
    ]
  },
  signal: {
    title: "Do Not Record Broadcast Signal",
    category: "Active Defense",
    summary: "A continuous secure local radio transmission (via BLE and WiFi-NAN) that informs nearby smart wearables and camera equipment of your explicit refusal to be recorded.",
    whatItDoes: "It broadcasts your rolling anonymous cryptographic identifier. Complying smart glasses (like Meta Ray-Bans or Apple Vision Pro) receive this signal, lookup your coordinates, and automatically apply dynamic censorship overlay/blur to your face or profile in real-time.",
    howToUse: "Toggle 'Broadcasting' to activate the signal. Adjust the 'Broadcast Range' slider to expand your personal privacy bubble (up to 40 meters). Choose your preferred 'Censor Shield Mode' (e.g. Magic Removal or Strict Blur) to determine how third-party cameras obscure you.",
    benefits: [
      "Prevent stealth recordings in public transport or cafes.",
      "Zero-knowledge key rotation prevents tracking of your beacon.",
      "Completely offline BLE & WiFi-NAN protocol requiring no cellular connection."
    ]
  },
  faces: {
    title: "Cryptographic Face Registry",
    category: "Active Defense",
    summary: "An on-device localized biometric registry that converts your facial structure into a secure, non-reversible mathematical vector for camera face-blur compliance.",
    whatItDoes: "Instead of uploading your photos, this system computes secure face-vector hashes. When complying media platforms (YouTube, TikTok) receive footage or when edge-AI cameras scan a crowd, they match these hashes locally to blur your face without ever knowing your actual image.",
    howToUse: "Upload or capture a photo of your face. Click 'Compute Vector Hash' to add it to your local registry. You can test face matching with the simulator by choosing an image and triggering a simulated platform upload.",
    benefits: [
      "Secure on-device local hashing (your photos never leave your device).",
      "Dynamic compliance matching on public platforms.",
      "Manage whitelisted channels that are allowed to record you."
    ]
  },
  tags: {
    title: "Smart Protection Tags & Objects",
    category: "Active Defense",
    summary: "Assign privacy guardrails to physical items, pets, or family members by pairing low-power BLE tags or beacons.",
    whatItDoes: "Extends your opt-out shielding bubble to valuables, backpacks, child safety items, or pets. Complying recording devices recognize the nearby beacon ID and automatically obscure the tagged item or apply specialized blur levels (e.g., child protection overrides).",
    howToUse: "Click 'Scan for BLE Beacons' under the Smart Tags tab. Pair the discovered beacon, name it (e.g., 'Lily\'s Backpack'), and choose its specific shielding style.",
    benefits: [
      "Ensure children's privacy in school or park environments.",
      "Protect sensitive physical prototypes or documents from industrial spying.",
      "Continuous background ping with battery-saver mode."
    ]
  },
  wifi: {
    title: "WiFi SSID Automation Triggers",
    category: "Active Defense",
    summary: "Automate your privacy posture transitions based on the WiFi network you are connected to.",
    whatItDoes: "Allows your BlurBubble system to adapt instantly. For example, when you join your workplace WiFi, it can automatically set your shield to 'Magic Removal'. When you join your home WiFi, it can turn broadcasting 'OFF' and pause opt-outs for comfort.",
    howToUse: "Add a rule by specifying the network SSID, choosing the target privacy level (e.g., Strict Blur, Pixelate), and toggling whether broadcasting or face opt-out should be active. The system will auto-apply this when connected.",
    benefits: [
      "Set-it-and-forget-it automated privacy transitions.",
      "Prevent manual setting mistakes at gym, office, or cafes.",
      "Conserve device battery by disabling broadcast in trusted home zones."
    ]
  },
  hierarchy: {
    title: "Precedence Resolution Hierarchy",
    category: "Rules & Hierarchy",
    summary: "The rules engine that resolves logic conflicts when multiple overlapping privacy settings or exception claims occur.",
    whatItDoes: "Determines which rule wins when there is a conflict. For example, if a whitelisted family member is recording you, but you enter a 'Total Lockdown' geofence, the hierarchy ensures the lockdown override takes precedence, keeping you censored.",
    howToUse: "Review the priority hierarchy tree. Drag or toggle rule configurations to modify pre-programmed rules or observe simulated resolution logic by triggering mock conflict scenarios.",
    benefits: [
      "Ensures predictable, deterministic privacy behavior.",
      "Enforces physical lockdown mode in sensitive areas.",
      "Clear visual tracking of active rules and overrides."
    ]
  },
  perimeter: {
    title: "Geo-Fenced Perimeter Zones",
    category: "Rules & Hierarchy",
    summary: "Stationary, coordinate-based geofences that enforce specialized privacy profiles automatically.",
    whatItDoes: "Defines spatial boundaries (e.g., 50m around a preschool, hospital, or private residence). When any complying recording wearable or camera enters this geographic polygon, it is forced to lock its video sensor or mask out all registered profiles.",
    howToUse: "Register a perimeter zone by giving it a title and choosing its location. Test perimeter intrusion using the live simulator to see alerts fire as devices approach boundaries.",
    benefits: [
      "Establish strict privacy envelopes around home or sensitive areas.",
      "Automatic enforcement for children inside school boundaries.",
      "Works in real-time with GPS and ultra-wideband (UWB) tracking."
    ]
  },
  biometric: {
    title: "On-Device Biometric Armor",
    category: "Rules & Hierarchy",
    summary: "An ultra-secure lock that prevents physical tampering, force-deactivation, or unauthorized changes to your privacy profile.",
    whatItDoes: "Uses cryptographically backed WebAuthn / Passkey protocols to lock down settings. Once armed, any attempt to turn off broadcasting, register new faces, clear logs, or delete whitelists will prompt for fingerprint or facial scan verification.",
    howToUse: "Go to the Biometric Lock tab, name your key, and click 'Arm Biometric Lock'. Complete the simulated touch scan to activate. When active, settings will remain securely frozen until unlocked.",
    benefits: [
      "Defeats physical coercion and device tampering.",
      "Saves settings under deep hardware-isolated storage (TEE/Enclave).",
      "Immediate alert notifications if lock tampering is detected."
    ]
  },
  scrub: {
    title: "Retroactive Media Scrub",
    category: "Scrub & Compliance",
    summary: "An automated decentralized web crawler that scans streaming platforms and social media indexers to find and mask unconsented videos of you.",
    whatItDoes: "Continuously monitors popular video-sharing networks. Upon detecting your registered face vector in public streams, it automatically triggers a direct API takedown/blur compliance request, prompting platforms to censor your profile retroactively.",
    howToUse: "Ensure your Face Registry is populated. Turn on 'Decentralized Platform Scraping'. View discovered online media in the scrubbing feed and trigger automated platform API blur compliance requests.",
    benefits: [
      "Cleans up existing, historical unconsented uploads.",
      "CDN-level automated blurring rather than slow manual DMCA filings.",
      "Direct verification handshake showing compliance logs in real-time."
    ]
  },
  retention: {
    title: "Zero-Knowledge Data Trust",
    category: "Devices & Keys",
    summary: "Configures on-device history retention periods, strict encryption standards, and logs auto-purging.",
    whatItDoes: "Guarantees that your bystander logging data remains entirely private. You can customize when logs are permanently overwritten and set secure storage keys to make sure no government or platform can extract historical traces of who you've been around.",
    howToUse: "Select a 'Purge Cycle' (e.g., 2 hours, 24 hours, or immediate). Adjust the maximum logs limit, and enable zero-knowledge local database encryption with custom credentials.",
    benefits: [
      "Ensures absolute data minimization compliance (GDPR Article 5).",
      "Protects logs from forensic extraction in case of device seizure.",
      "Completely local with no remote backup vectors."
    ]
  },
  escrow: {
    title: "Warrant & Escrow Key Override",
    category: "Devices & Keys",
    summary: "A democratic, multi-signature digital escrow system that allows law enforcement overrides only when authorized by court-signed warrants.",
    whatItDoes: "Protects your absolute privacy while maintaining compliance with judicial systems. Your escrow key is split into multiple pieces (shards) held by trust authorities (like citizen unions or trusted friends). Only a cryptographically signed judicial warrant can assemble the key to pause your beacon.",
    howToUse: "Configure your trusted keyholders. View simulated warrant requests and run the key-assembling flow to see how multi-sig verification is strictly validated before any override is granted.",
    benefits: [
      "Foil unlawful surveillance while adhering to legitimate warrants.",
      "Multi-signature accountability ensures no single entity can spy on you.",
      "Full transparency logs of any judicial request or override attempt."
    ]
  },
  pairing: {
    title: "Hardware Device Pairing",
    category: "Devices & Keys",
    summary: "Establish a secure, low-energy Bluetooth link between your smartphone/app and your physical BlurBubble wearable shield or key-fob.",
    whatItDoes: "Pairs the companion app with active hardware. Once paired, the physical device and your phone act as a coordinated system, enabling precise proximity tracking, battery telemetry, and immediate haptic feedback whenever third-party recordings are blocked.",
    howToUse: "Click 'Scan for Devices'. Locate your BlurBubble physical wearable or key-fob, click 'Pair Device', and follow the cryptographic handshake steps to secure the link.",
    benefits: [
      "Enables continuous real-time haptic vibration on bypass alerts.",
      "Accurate battery tracking of your physical wearable.",
      "Enables physical tag-out shields for physical items."
    ]
  },
  licensing: {
    title: "Hardware Licensing & Sync",
    category: "Devices & Keys",
    summary: "Register and synchronize official hardware manufacturer licenses and cryptographic certificates for compliant cross-border protection.",
    whatItDoes: "Proves to platform scanners and corporate networks that your device is an officially certified, non-disruptive privacy beacon. This ensures your broadcast signal isn't blacklisted as a signal jammer and satisfies international compliance standards.",
    howToUse: "Click 'Register New License', enter a serial identifier, and complete the cryptographic registration. Keep the synchronization active to renew certificates automatically.",
    benefits: [
      "Guarantees that your signal is whitelisted by major tech platforms.",
      "Satisfies FCC, CE, and international wireless compliance guidelines.",
      "Provides cryptographic proof of your digital rights in court."
    ]
  },
  legal: {
    title: "Legal & Regulatory Compliance",
    category: "Scrub & Compliance",
    summary: "Learn and test your legal standing under modern privacy frameworks like GDPR, CCPA, and decentralized digital right bills.",
    whatItDoes: "Ensures you are fully informed of your digital rights regarding likeness ownership and public recording. Includes interactive educational guides and quizzes to test your understanding of personal privacy regulations in different jurisdictions.",
    howToUse: "Read the dynamic legal compliance manual, start the 'Digital Rights Quiz', answer the questions, and evaluate your legal posture score.",
    benefits: [
      "Understand the boundaries of likeness protection in public spaces.",
      "Provides quick-reference legal citations for filing complaints.",
      "Keeps you updated on emerging neural-recording legislation."
    ]
  },
  'privacy-levels': {
    title: "Censor Shield Options",
    category: "Active Defense Settings",
    summary: "The specific masking overlays requested by your beacon and enforced on complying lenses.",
    whatItDoes: "These options dictate how your visual presence will be replaced in media captures. Platforms or wearable glasses that recognize your broadcast will apply this exact style.",
    howToUse: "Select 'Magic Removal' to be fully erased and replaced with AI background fills, 'Strict Blur' for high-radius blurring of your face and body, 'Pixelate' for retro low-resolution sensor blocking, or 'Opt-In' to allow normal recording.",
    benefits: [
      "Dynamic real-time selection of privacy strength.",
      "Low latency, standardized compliance styling.",
      "Adaptable based on physical environments or proximity."
    ]
  }
};

const getIcon = (key: string) => {
  switch (key) {
    case 'lockdown': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    case 'strict_rules': return <Shield className="w-5 h-5 text-amber-400" />;
    case 'perimeter_shields': return <MapPin className="w-5 h-5 text-blue-400" />;
    case 'allow_list': return <Users className="w-5 h-5 text-emerald-400" />;
    case 'wifi_triggers': return <Wifi className="w-5 h-5 text-purple-400" />;
    case 'smart_schedules': return <Clock className="w-5 h-5 text-indigo-400" />;
    default: return <Layers className="w-5 h-5 text-slate-400" />;
  }
};

const BEACON_FEATURE_GROUPS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'üìä',
    options: [
      { value: 'overview', label: 'Overview Dashboard', icon: 'üõ°Ô∏è', desc: 'Configure layout & view status' }
    ]
  },
  {
    id: 'realtime',
    label: 'Real-Time Protection',
    icon: 'üì°',
    options: [
      { value: 'signal', label: 'Privacy Signal Broadcast', icon: 'üì°', desc: 'Configure range & signal broadcast' },
      { value: 'faces', label: 'My Saved Faces', icon: 'üë§', desc: 'Add faces to blur on cameras' },
      { value: 'tags', label: 'Protected Belongings', icon: 'üéí', desc: 'Protect bags, children\'s items, or pets' },
      { value: 'wifi', label: 'Automated WiFi Rules', icon: 'üì∂', desc: 'Change settings based on WiFi network' }
    ]
  },
  {
    id: 'rules',
    label: 'Rule Priority & Security',
    icon: '‚öñÔ∏è',
    options: [
      { value: 'hierarchy', label: 'Rule Priority Settings', icon: '‚öñÔ∏è', desc: 'Decide which rule wins first' },
      { value: 'perimeter', label: 'Protected Areas', icon: 'üìç', desc: 'Safe zones around home, school, or work' },
      { value: 'biometric', label: 'Settings Lock', icon: 'üîí', desc: 'Security fingerprint or passcode' }
    ]
  },
  {
    id: 'devices',
    label: 'Connected Devices & Keys',
    icon: 'üîå',
    options: [
      { value: 'pairing', label: 'Connect New Devices', icon: 'üîå', desc: 'Link local wearables or keychains' },
      { value: 'licensing', label: 'Device Certifications', icon: 'üìã', desc: 'Official safety approvals & certificates' },
      { value: 'escrow', label: 'Law Enforcement Access Keys', icon: 'üîë', desc: 'Emergency warrant keys' },
      { value: 'retention', label: 'My Data Preferences', icon: 'üíæ', desc: 'How long logs are stored' }
    ]
  },
  {
    id: 'compliance',
    label: 'Web Rights & Legal Guides',
    icon: 'üìñ',
    options: [
      { value: 'scrub', label: 'Online Video Blur Requests', icon: 'üé¨', desc: 'Scrub your face from public videos' },
      { value: 'legal', label: 'Your Privacy Rights Quiz', icon: 'üìñ', desc: 'Quick guide on video laws' }
    ]
  }
];

export default function PrivacyBeacon({ state, onChange, logs, onClearLogs, activeTab: externalActiveTab, onTabChange: externalOnTabChange, onAddLog, onTriggerAlert }: PrivacyBeaconProps) {
  const { t } = useI18n();
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'settings' | 'signal' | 'tags' | 'faces' | 'scrub' | 'perimeter' | 'retention' | 'escrow' | 'licensing' | 'legal' | 'pairing' | 'wifi' | 'biometric' | 'hierarchy' | 'targeted' | 'audio_shield' | 'audio_scrub' | 'audio_map' | 'experimental'>('overview');
  const [showContextHelp, setShowContextHelp] = useState(false);
  const showSignalHistory = !!state.showSignalHistory;
  const showPrivacyImpactScore = !!state.showPrivacyImpactScore;
  const showSignalMap = !!state.showSignalMap;
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuActiveCategory, setMenuActiveCategory] = useState<"all" | "defense" | "acoustic" | "rules" | "hardware">("all");
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const [activeShieldDropdown, setActiveShieldDropdown] = useState<"none" | "obfuscation" | "range" | "toggles" | "presets">("none");
  


  // Swipe vs Continuous Scroll Widget Layout states
  const [widgetViewMode, setWidgetViewMode] = useState<'scroll' | 'swipe'>(() => {
    try {
      return (localStorage.getItem('blurBubble_widgetViewMode') as 'scroll' | 'swipe') || 'swipe';
    } catch (e) {
      return 'swipe';
    }
  });
  const [activeWidgetIndex, setActiveWidgetIndex] = useState(0);

  // Compute enabled widgets for layout selection
  const enabledWidgetIds: string[] = [];
  if (showPrivacyImpactScore) enabledWidgetIds.push('privacy-score');
  if (showSignalHistory) enabledWidgetIds.push('signal-history');
  if (!!state.showBatteryWidget) enabledWidgetIds.push('battery-status');
  if (showSignalMap) enabledWidgetIds.push('signal-map');

  // Sync index to keep bounds correct on widget toggle
  useEffect(() => {
    if (activeWidgetIndex >= enabledWidgetIds.length) {
      setActiveWidgetIndex(Math.max(0, enabledWidgetIds.length - 1));
    }
  }, [enabledWidgetIds.length, activeWidgetIndex]);

  useEffect(() => {
    localStorage.setItem('blurBubble_widgetViewMode', widgetViewMode);
  }, [widgetViewMode]);

  const handleSwipeDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setActiveWidgetIndex(prev => (prev + 1) % Math.max(1, enabledWidgetIds.length));
    } else if (info.offset.x > swipeThreshold) {
      setActiveWidgetIndex(prev => (prev - 1 + enabledWidgetIds.length) % Math.max(1, enabledWidgetIds.length));
    }
  };

  // Custom Interactive Enhanced States
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const [isScanningWifiNetwork, setIsScanningWifiNetwork] = useState(false);
  const [scannedWifiNetworks, setScannedWifiNetworks] = useState<Array<{ ssid: string; label: string; privacyLevel: PrivacyLevel; dbm: number }>>([]);
  const [scannedWifiSuccess, setScannedWifiSuccess] = useState<string | null>(null);
  const [calibratingFaceId, setCalibratingFaceId] = useState<string | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  
  // No Data About Me Search simulation states
  const [simulatingFaceSearch, setSimulatingFaceSearch] = useState(false);
  const [faceSearchProgress, setFaceSearchProgress] = useState(0);
  const [faceSearchResult, setFaceSearchResult] = useState<string | null>(null);
  const [faceSearchLogs, setFaceSearchLogs] = useState<string[]>([]);

  // Find Tag / Bidirectional Audio & Visual Alerts
  const [ringingTagId, setRingingTagId] = useState<string | null>(null);
  const [activeHelpAlert, setActiveHelpAlert] = useState<{ tagId: string; tagName: string; time: string } | null>(null);

  // Acoustic Map & Heat States
  const [acousticLocation, setAcousticLocation] = useState<'dining' | 'classroom' | 'city_square' | 'cafe_inside'>('dining');
  const [acousticInterference, setAcousticInterference] = useState<'none' | 'wind' | 'wall' | 'ac_hum'>('none');
  const [acousticPinging, setAcousticPinging] = useState(false);
  const [acousticMapFrequency, setAcousticMapFrequency] = useState<number>(23.2); // kHz
  const [acousticLogs, setAcousticLogs] = useState<string[]>([
    "System Initialized: Acoustic Propagation Scanner active.",
    "Beacon Mode: Active Vocal Scrambler on channel A."
  ]);
  const [selectedAcousticThreat, setSelectedAcousticThreat] = useState<string | null>(null);

  // Play AirTag-like high pitch chirps on the tag
  const playTagBuzzerSound = () => {
    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playChirp = (startTime: number, duration: number, frequency: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        osc.frequency.exponentialRampToValueAtTime(frequency - 100, startTime + duration);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      };

      const now = ctx.currentTime;
      // AirTag signature sweet 3-beep pattern
      playChirp(now, 0.08, 2200);
      playChirp(now + 0.14, 0.08, 2400);
      playChirp(now + 0.28, 0.12, 2600);
    } catch (err) {
      console.error("Tag buzzer sound error", err);
    }
  };

  // Repeating alert chime when son needs help
  useEffect(() => {
    if (!activeHelpAlert) return;

    const interval = setInterval(() => {
      try {
        // @ts-ignore
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sawtooth'; // piercing & clear
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
        osc.frequency.linearRampToValueAtTime(587.33, ctx.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.35);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } catch (err) {
        console.error("Alarm sound loop error", err);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [activeHelpAlert]);

  // Central Logo Press & Hold and Tap Interaction States
  const [isHoldingLogo, setIsHoldingLogo] = useState(false);
  const [logoHoldProgress, setLogoHoldProgress] = useState(0); // 0 to 1
  const logoHoldTimerRef = useRef<any>(null);
  const logoHoldIntervalRef = useRef<any>(null);

  const handleLogoPointerDown = (e: React.PointerEvent) => {
    // If shield is off, quick tap to turn ON immediately
    if (!state.isBroadcasting) {
      onChange({ ...state, isBroadcasting: true });
      playLocalSoundTest('sonar_chime', 80);
      onAddLog({
        deviceModel: 'SHIELD_BEACON_CONTROLLER',
        action: 'activated',
        shieldApplied: 'SHIELD BROADCAST ACTIVE',
        distance: 0,
        rotatedId: 'MANUAL_QUICK_TAP'
      });
      // Physical vibration alert
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100]);
      }
      return;
    }

    // If shield is on, must press and hold to turn OFF
    setIsHoldingLogo(true);
    setLogoHoldProgress(0);

    const holdDuration = 1000; // 1 second press-and-hold requirement
    const intervalStep = 50;
    let elapsed = 0;

    if (logoHoldTimerRef.current) clearTimeout(logoHoldTimerRef.current);
    if (logoHoldIntervalRef.current) clearInterval(logoHoldIntervalRef.current);

    logoHoldIntervalRef.current = setInterval(() => {
      elapsed += intervalStep;
      const progress = Math.min(elapsed / holdDuration, 1);
      setLogoHoldProgress(progress);

      // Light haptic feedback during hold
      if (typeof navigator !== 'undefined' && navigator.vibrate && elapsed % 200 === 0 && progress < 1) {
        navigator.vibrate([30]);
      }
    }, intervalStep);

    logoHoldTimerRef.current = setTimeout(() => {
      clearInterval(logoHoldIntervalRef.current);
      setIsHoldingLogo(false);
      setLogoHoldProgress(0);

      onChange({ ...state, isBroadcasting: false });
      playLocalSoundTest('tactical_click', 80);
      onAddLog({
        deviceModel: 'SHIELD_BEACON_CONTROLLER',
        action: 'deactivated',
        shieldApplied: 'SHIELD BROADCAST SILENT',
        distance: 0,
        rotatedId: 'MANUAL_PRESS_HOLD'
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }, holdDuration);
  };

  const handleLogoPointerUpOrLeave = () => {
    if (logoHoldTimerRef.current) clearTimeout(logoHoldTimerRef.current);
    if (logoHoldIntervalRef.current) clearInterval(logoHoldIntervalRef.current);

    if (isHoldingLogo && state.isBroadcasting && logoHoldProgress < 1) {
      playLocalSoundTest('tactical_click', 40);
    }

    setIsHoldingLogo(false);
    setLogoHoldProgress(0);
  };
  
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  const calculatePrivacyScore = () => {
    let score = 10; // Base starting score
    const contributors = [];

    if (state.isBroadcasting) {
      score += 30;
      contributors.push({ name: 'RF Signal Broadcasting', value: 30, active: true });
    } else {
      contributors.push({ name: 'RF Signal Broadcasting', value: 30, active: false });
    }

    const rangePoints = Math.min(15, Math.round((state.rangeMeters / 100) * 15));
    if (state.isBroadcasting && rangePoints > 0) {
      score += rangePoints;
      contributors.push({ name: `Shield Radius (${state.rangeMeters}m)`, value: rangePoints, active: true });
    } else {
      contributors.push({ name: 'Shield Radius (>0m)', value: 15, active: false });
    }

    if (state.facialRecognitionOptOut) {
      score += 10;
      contributors.push({ name: 'Biometric Opt-Out Registry', value: 10, active: true });
    } else {
      contributors.push({ name: 'Biometric Opt-Out Registry', value: 10, active: false });
    }

    // Privacy Level
    let privacyLevelPoints = 0;
    let label = 'None';
    if (state.privacyLevel === 'strict_blur') { privacyLevelPoints = 15; label = 'Strict Blur'; }
    else if (state.privacyLevel === 'pixelate') { privacyLevelPoints = 12; label = 'Mosaic Pixelate'; }
    else if (state.privacyLevel === 'emoji') { privacyLevelPoints = 10; label = 'Dynamic Mask'; }
    else if (state.privacyLevel === 'black_bar') { privacyLevelPoints = 10; label = 'Censorship Bar'; }
    else if (state.privacyLevel === 'magic_removal') { privacyLevelPoints = 15; label = 'Inpainting Eraser'; }

    if (privacyLevelPoints > 0) {
      score += privacyLevelPoints;
      contributors.push({ name: `Obscuration Mask (${label})`, value: privacyLevelPoints, active: true });
    } else {
      contributors.push({ name: 'Obscuration Mask Active', value: 15, active: false });
    }

    // Acoustic shields
    if (state.acousticWatermarkingEnabled) {
      score += 5;
      contributors.push({ name: 'Acoustic Audio Watermarking', value: 5, active: true });
    } else {
      contributors.push({ name: 'Acoustic Audio Watermarking', value: 5, active: false });
    }

    if (state.ultrasonicMicSaturationEnabled) {
      score += 5;
      contributors.push({ name: 'Ultrasonic Mic Saturation', value: 5, active: true });
    } else {
      contributors.push({ name: 'Ultrasonic Mic Saturation', value: 5, active: false });
    }

    if (state.vocalScramblerEnabled) {
      score += 5;
      contributors.push({ name: 'Decentralized Vocal Scrambler', value: 5, active: true });
    } else {
      contributors.push({ name: 'Decentralized Vocal Scrambler', value: 5, active: false });
    }

    // Countermeasures
    if (state.irDisruptionEnabled) {
      score += 5;
      contributors.push({ name: 'Infrared (IR) Jamming', value: 5, active: true });
    } else {
      contributors.push({ name: 'Infrared (IR) Jamming', value: 5, active: false });
    }

    if (state.lidarInterferenceEnabled) {
      score += 5;
      contributors.push({ name: 'LiDAR Spatial Jammer', value: 5, active: true });
    } else {
      contributors.push({ name: 'LiDAR Spatial Jammer', value: 5, active: false });
    }

    if (state.antiLipReadingEnabled) {
      score += 5;
      contributors.push({ name: 'Holographic Lip Masking', value: 5, active: true });
    } else {
      contributors.push({ name: 'Holographic Lip Masking', value: 5, active: false });
    }

    // Emergency lockdown
    if (state.emergencyPrivacyActive || state.totalLockdownMode) {
      score = 100;
    }

    return { score: Math.min(100, score), contributors };
  };

  const calculatedScore = calculatePrivacyScore();

  const playLocalSoundTest = (soundType: string, volumePercent: number) => {
    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const volume = volumePercent / 100;
      gainNode.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      
      if (soundType === 'sonar_chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.62);
      } else if (soundType === 'tactical_click') {
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
      console.error(err);
    }
  };

  // Radar boundary ring interactive dragging handler
  const handleSvgInteraction = (e: any, isStart = false) => {
    // Find radar SVG element
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    
    // Get mouse/touch coordinate relative to SVG container
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // SVG viewBox coordinates (280x280) with center at (140, 140)
    const svgX = (relativeX / rect.width) * 280;
    const svgY = (relativeY / rect.height) * 280;
    
    const dx = svgX - 140;
    const dy = svgY - 140;
    
    // Radial distance from center (0 to 140 max)
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    const currentRadiusPx = state.rangeMeters * 3;
    const isCloseToEdge = Math.abs(radius - currentRadiusPx) < 15;

    if (isDraggingRange || isCloseToEdge) {
      if (isStart) {
        setIsDraggingRange(true);
      }
      // Scale distance (radius of 115px maps to 25m maximum range)
      // Map radius of 0-115px to 1m-25m
      const maxRadiusPx = 115;
      const calculatedMeters = Math.max(1, Math.min(25, Math.round((radius / maxRadiusPx) * 25)));
      
      onChange({
        ...state,
        rangeMeters: calculatedMeters
      });
    } else if (isStart && state.isBroadcasting) {
      // Place a custom node!
      const distance = Math.round(radius / 3);
      const angle = Math.atan2(dy, dx);
      const nodeTypes: ('beacon' | 'threat')[] = ['beacon', 'threat'];
      const chosenType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      
      const names = chosenType === 'beacon' 
        ? ['Smart Collar', 'Backpack Tag', 'Opt-Out Ring', 'Car Shielder', 'Key FOB', 'Acoustic Deflector']
        : ['Smart Glasses', 'Rogue Drone', 'CCTV Lens', 'Covert App', 'Snooping Mic', 'Camera Rig'];
        
      const name = names[Math.floor(Math.random() * names.length)] + ' #' + Math.floor(Math.random() * 900 + 100);
      
      const newNode = {
        id: Math.random().toString(),
        name,
        type: chosenType,
        distance,
        angle,
        x: svgX,
        y: svgY
      };
      
      setCustomRadarNodes(prev => [...prev, newNode]);
      
      // Add custom logging action
      if (chosenType === 'beacon') {
        onAddLog({
          deviceModel: name,
          action: 'discovered',
          shieldApplied: 'ROUTING_ENCRYPTED_HANDSHAKE',
          distance,
          rotatedId: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase()
        });
      } else {
        onAddLog({
          deviceModel: name,
          action: 'censored',
          shieldApplied: 'ACTIVE_PHASE_DEFLECTION',
          distance,
          rotatedId: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase()
        });
      }
    }
  };

  // Mobile Dropdown States
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [expandedMobileGroups, setExpandedMobileGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    realtime: false,
    rules: false,
    devices: false,
    compliance: false
  });
  
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
      try { window.scrollTo(0, 0); } catch (e2) {}
    }
    const tabToCategoryMap: Record<string, 'defense' | 'rules' | 'hardware' | 'compliance'> = {
      overview: 'defense',
      settings: 'defense',
      signal: 'defense',
      faces: 'defense',
      tags: 'defense',
      wifi: 'defense',
      hierarchy: 'rules',
      perimeter: 'rules',
      biometric: 'rules',
      pairing: 'hardware',
      licensing: 'hardware',
      escrow: 'hardware',
      retention: 'hardware',
      scrub: 'compliance',
      legal: 'compliance'
    };
    const cat = tabToCategoryMap[activeTab];
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [activeTab]);
  
  // --- USER EXPERIENCE SIMPLIFICATION ---
  const [selectedCategory, setSelectedCategory] = useState<'defense' | 'rules' | 'hardware' | 'compliance'>('defense');
  const [defenseSubCategory, setDefenseSubCategory] = useState<'all' | 'signal' | 'acoustic' | 'identity' | 'system'>('all');
  const [helpTopic, setHelpTopic] = useState<string | null>(null);

  // Inline Tag Editing States
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState<string>('');
  
  // Biometric Authentication States
  const [isRegisteringBiometric, setIsRegisteringBiometric] = useState(false);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const [customPasskeyName, setCustomPasskeyName] = useState("My Secure Touch ID");
  const [biometricLogs, setBiometricLogs] = useState<string[]>([
    "System Ready. WebAuthn capability detected in current user agent."
  ]);
  const [biometricStep, setBiometricStep] = useState<number>(-1); // -1: idle, 0: challenge, 1: device_prompt, 2: signature, 3: completed
  
  // WiFi Trigger Rules local states
  const [newWifiSsid, setNewWifiSsid] = useState('');
  const [newWifiLabel, setNewWifiLabel] = useState('');
  const [newWifiPrivacy, setNewWifiPrivacy] = useState<PrivacyLevel>('strict_blur');
  const [newWifiBroadcast, setNewWifiBroadcast] = useState(true);
  const [newWifiFaceOptOut, setNewWifiFaceOptOut] = useState(true);
  const [isSimulatingWifi, setIsSimulatingWifi] = useState(false);
  
  // Hardware pairing states
  const [isBleScanning, setIsBleScanning] = useState(false);
  const [bleProgress, setBleProgress] = useState(0); // 0 to 100 for scanning
  const [discoveredBleDevices, setDiscoveredBleDevices] = useState<any[]>([]);
  const [pairingBleDevice, setPairingBleDevice] = useState<any | null>(null);
  const [handshakeStepIdx, setHandshakeStepIdx] = useState<number>(-1);
  const [realBleError, setRealBleError] = useState<string | null>(null);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [pairedDeviceName, setPairedDeviceName] = useState('');
  const [pairingSubTab, setPairingSubTab] = useState<'console' | 'diagnostics'>('console');
  const [selectedDiagDeviceId, setSelectedDiagDeviceId] = useState<string | null>(null);
  const [isPingTesting, setIsPingTesting] = useState(false);
  const [pingProgress, setPingProgress] = useState(0);
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [txPowerSettings, setTxPowerSettings] = useState<Record<string, 'low' | 'medium' | 'high'>>({});

  // Audio Shield Tab States
  const [selectedAudioProfileId, setSelectedAudioProfileId] = useState<string>('primary');
  const [testedPhrase, setTestedPhrase] = useState<string>('Stop recording me: law 88 compliance check.');
  const [audioModulator, setAudioModulator] = useState<number>(120);
  const [pairedDeviceType, setPairedDeviceType] = useState<'phone' | 'smart_tag' | 'key_fob' | 'airtag' | 'galaxy_tag' | 'valuable' | 'artwork' | 'building' | 'prototype'>('smart_tag');
  const [pairedDevicePrivacy, setPairedDevicePrivacy] = useState<PrivacyLevel>('magic_removal');

  // --- FAMILY SHIELD SYNC & BATTERY SAVER STATES ---
  const [isSyncingFamily, setIsSyncingFamily] = useState(false);
  const [familySyncLogs, setFamilySyncLogs] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'fam-1', name: 'Father (Robert)', relation: 'Dad', deviceName: "Dad's iPhone 15", status: 'synchronized', battery: 94 },
    { id: 'fam-2', name: 'Mother (Sarah)', relation: 'Mom', deviceName: "Mom's Galaxy S24", status: 'synchronized', battery: 88 },
    { id: 'fam-3', name: 'Sister (Lily)', relation: 'Sister', deviceName: "Lily's Backpack Tag", status: 'synchronized', battery: 72 }
  ]);

  // --- CRYPTO TIMELOCK & TARGET DEFLECTION STATES ---
  const [cryptoTimer, setCryptoTimer] = useState<number>(90);
  const [currentCryptoID, setCurrentCryptoID] = useState<string>('0xFD23-A9B3-CE82-D0F4');
  const [nextCryptoID, setNextCryptoID] = useState<string>('0xFD23-7F91-32CB-140F');
  const [scrambledTrackers, setScrambledTrackers] = useState<Array<{ id: string; name: string; type: string; status: string; timestamp: string }>>([
    { id: 'trk-1', name: 'Commercial Location Broker', type: 'Bluetooth Beacon Sniffer', status: 'SCRAMBLED', timestamp: 'Just now' },
    { id: 'trk-2', name: 'Ad-Targeting Wi-Fi Probe', type: 'SSID Tracker Node', status: 'DEFLECTED', timestamp: '1m ago' },
    { id: 'trk-3', name: 'Retail Foot-Traffic Analyzer', type: 'BLE Scraper Gateway', status: 'SCRAMBLED', timestamp: '3m ago' }
  ]);
  const [isSweepingTrackers, setIsSweepingTrackers] = useState<boolean>(false);

  // --- REGIONAL COMPLIANCE CERTIFICATION STATES ---
  const [complianceRegion, setComplianceRegion] = useState<'US' | 'EU' | 'CA' | 'JP'>('US');
  const [complianceTesting, setComplianceTesting] = useState<boolean>(false);
  const [complianceProgress, setComplianceProgress] = useState<number>(0);
  const [complianceReport, setComplianceReport] = useState<{
    fccStatus: 'PASSED' | 'WARNING' | 'PENDING';
    ceStatus: 'PASSED' | 'WARNING' | 'PENDING';
    eirpPower: string;
    freqRange: string;
    exemptions: string[];
  } | null>(null);

  // --- ALLOW WHITE-LIST (PLATFORMS & ACCOUNTS) ---
  const [allowedList, setAllowedList] = useState<Array<{
    id: string;
    name: string;
    platform?: string;
    identifier: string;
    active: boolean;
    timeConstraintEnabled?: boolean;
    timeStart?: string;
    timeEnd?: string;
    identityConstraintEnabled?: boolean;
    allowedIdentityId?: string;
  }>>([
    { id: 'all-1', name: "Dad's YouTube Channel", platform: 'youtube', identifier: '@family_vlogs', active: true },
    { id: 'all-2', name: "Mom's Phone Camera", platform: 'device', identifier: 'UUID-F81D-41B2', active: true }
  ]);
  const [newAllowedName, setNewAllowedName] = useState('');
  const [newAllowedPlatform, setNewAllowedPlatform] = useState('youtube');
  const [newAllowedIdent, setNewAllowedIdent] = useState('');
  const [isSimulatingAllowedUpload, setIsSimulatingAllowedUpload] = useState(false);
  const [allowedUploadLogs, setAllowedUploadLogs] = useState<string[]>([]);
  const [editingAllowedItem, setEditingAllowedItem] = useState<any | null>(null);

  // --- LEGAL INTERACTIVE TUTORIAL STATES ---
  const [tutorialStep, setTutorialStep] = useState(0); // 0: intro, 1: q1, 2: q2, 3: q3, 4: score
  const [tutorialAnswers, setTutorialAnswers] = useState<Record<number, number>>({});
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [tutorialFeedback, setTutorialFeedback] = useState<string | null>(null);

  // --- PRIVACY GOVERNANCE HIERARCHY STATES ---
  const [selectedScenario, setSelectedScenario] = useState('scen-1');

  const startBleScan = () => {
    setIsBleScanning(true);
    setBleProgress(0);
    setDiscoveredBleDevices([]);
    setPairingBleDevice(null);
    setPairingSuccess(false);
    setRealBleError(null);
    
    const interval = setInterval(() => {
      setBleProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBleScanning(false);
          // Populate scanned devices
          setDiscoveredBleDevices([
            {
              id: 'ble-dev-1',
              name: 'BlurBubble Beacon v1-7A2F',
              mac: '00:1A:7D:DA:71:11',
              type: 'smart_tag',
              rssi: -48,
              desc: 'High-powered localized broadcast badge'
            },
            {
              id: 'ble-dev-2',
              name: 'BlurBubble KeyFob-1D90',
              mac: '24:0A:C4:F9:82:C4',
              type: 'key_fob',
              rssi: -62,
              desc: 'Compact keychain toggle with mechanical sync button'
            },
            {
              id: 'ble-dev-3',
              name: 'BlurBubble Tag v2-C93B',
              mac: '80:E6:50:1C:BF:10',
              type: 'smart_tag',
              rssi: -75,
              desc: 'Micro stitch-in fabric tag for clothing or bags'
            },
            {
              id: 'ble-dev-4',
              name: 'Confidential Prototype v4',
              mac: '44:91:60:FF:A2:3E',
              type: 'prototype',
              rssi: -54,
              desc: 'Confidential hardware development kit'
            }
          ]);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const startRealBleScan = async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      setRealBleError("Web Bluetooth API is not supported on this browser or inside this environment.");
      setIsBleScanning(false);
      return;
    }

    setIsBleScanning(true);
    setBleProgress(15);
    setDiscoveredBleDevices([]);
    setPairingBleDevice(null);
    setPairingSuccess(false);
    setRealBleError(null);

    try {
      setBleProgress(45);
      // Web Bluetooth requires a user gesture. It will prompt the user to select a device.
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true
      });

      setBleProgress(85);
      
      const realDevice = {
        id: device.id,
        name: device.name || 'Unidentified BlurBubble Beacon',
        mac: 'FF:EE:DD:CC:BB:AA', // MAC is masked by Web Bluetooth API for privacy, we use virtual MAC
        type: 'smart_tag' as const,
        rssi: -55,
        desc: 'Physical BLE transceiver queried via Web Bluetooth API',
        nativeDevice: device // Hold reference to device for GATT connections
      };

      setBleProgress(100);
      setIsBleScanning(false);
      setDiscoveredBleDevices([realDevice]);
    } catch (err: any) {
      console.info("Web Bluetooth scan outcome:", err?.message || err);
      const isCancelled = err?.name === "NotFoundError" || err?.message?.includes("User cancelled") || err?.message?.includes("device not found");
      setRealBleError(isCancelled ? "Device selection cancelled or no hardware chosen. You can also use one-click Simulated Hardware Emulation." : (err?.message || "Bluetooth scan cancelled."));
      setIsBleScanning(false);
    }
  };

  const runHandshakeSequence = async (device: any) => {
    setPairingBleDevice(device);
    setHandshakeStepIdx(0);
    setPairingSuccess(false);
    setPairedDeviceName(device.name.replace(/ v\d-\w+|-\w+/, '')); // pre-populate friendlier name
    setPairedDeviceType(device.type);
    
    const steps = [
      'Establishing Physical Web Bluetooth GATT Connection...',
      'Discovering BlurBubble Primary Opt-Out Service (0xFD70)...',
      'Reading Beacon Compliance Characteristic (0xFD71)...',
      'Performing Ephemeral ECDH Cryptographic Exchange...',
      'Exchanging rotating pseudo-random signature token keys...',
      'Writing Secure Encryption Handshake Challenge...',
      'Authentication handshakes completed! GATT connection established.'
    ];

    setHandshakeLogs([`[INFO] Starting handshake with ${device.name}...`]);

    if (device.nativeDevice) {
      try {
        setHandshakeLogs(prev => [...prev, `[INFO] Attempting physical GATT connect to ${device.id}...`]);
        const server = await device.nativeDevice.gatt.connect();
        setHandshakeLogs(prev => [...prev, `[SUCCESS] GATT Server Connected: ${server.connected}`]);
        
        let currentStep = 1;
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            setHandshakeStepIdx(currentStep);
            setHandshakeLogs(prev => [...prev, `[SECURE] ${steps[currentStep]}`]);
            currentStep++;
          } else {
            clearInterval(interval);
            setPairingSuccess(true);
          }
        }, 600);
      } catch (err: any) {
        console.error("GATT connection failed:", err);
        setHandshakeLogs(prev => [
          ...prev, 
          `[ERROR] GATT Server Connection failed: ${err.message}`,
          `[FALLBACK] Initializing isolated local sandbox cryptographic emulator...`
        ]);
        
        let currentStep = 0;
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            setHandshakeStepIdx(currentStep);
            setHandshakeLogs(prev => [...prev, `[SECURE] ${steps[currentStep]}`]);
            currentStep++;
          } else {
            clearInterval(interval);
            setPairingSuccess(true);
          }
        }, 500);
      }
    } else {
      // Standard simulated flow
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setHandshakeStepIdx(currentStep);
          setHandshakeLogs(prev => [...prev, `[SECURE] ${steps[currentStep]}`]);
          currentStep++;
        } else {
          clearInterval(interval);
          setPairingSuccess(true);
        }
      }, 600);
    }
  };

  const handleRegisterPairedDevice = () => {
    if (!pairedDeviceName.trim()) return;

    const newDevice: RegisteredEntity = {
      id: 'tag-' + Date.now(),
      name: pairedDeviceName,
      type: pairedDeviceType,
      isActive: true,
      privacyLevel: pairedDevicePrivacy,
      signalStrength: pairingBleDevice?.rssi || -60,
      batteryPercent: Math.floor(Math.random() * 20) + 80 // 80% to 100%
    };

    onChange({
      ...state,
      registeredEntities: [...state.registeredEntities, newDevice]
    });

    // Reset and redirect
    setPairingBleDevice(null);
    setPairingSuccess(false);
    setActiveTab('tags');

    // Trigger pocket haptic alert / notification in app
    window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
      detail: { 
        title: 'New Device Paired & Secured',
        body: `"${pairedDeviceName}" has completed the encrypted handshake and is now actively broadcasting.`,
        type: 'blocking'
      } 
    }));
  };

  const runFirmwareFlash = () => {
    if (fwFlashStatus === 'running') return;
    setFwFlashStatus('running');
    setFwFlashProgress(0);
    setFwFlashLogs(['[SYSTEM] Initiating hardware diagnostic bypass...']);
    
    const messages = [
      '[RF-CORE] Querying transceiver PLL register (0x028A)...',
      '[RF-CORE] Reading current flash partitions...',
      '[MEM] Sector verification: Block 0x00A0 to 0x0FFF OK.',
      '[MEM] Erasing page 0xF0... [DONE]',
      '[MEM] Writing fresh firmware package (v2.4.9-Stable)...',
      '[ALIGN] Aligning multi-array phased beam delay coefficients...',
      '[ALIGN] Recalibrating BLE RSSI advertisement window (150ms)...',
      '[ALIGN] Initializing secure on-chip cryptographic envelope...',
      '[ALIGN] Overriding BLE public address with rotating token generator...',
      '[SYSTEM] Success. Hardware transceivers calibrated to 100% efficiency!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / messages.length) * 100));
      setFwFlashProgress(progress);
      
      if (currentStep <= messages.length) {
        setFwFlashLogs(prev => [...prev, messages[currentStep - 1]]);
      }
      
      if (currentStep >= messages.length) {
        clearInterval(interval);
        setFwFlashStatus('success');
        onAddLog({
          deviceModel: 'BlurBubble Transceiver Core',
          action: 'calibrated',
          shieldApplied: 'FIRMWARE_RE-FLASH_v2.4.9_COMPLETED',
          distance: 0,
          rotatedId: '0xF3A9B2'
        });
      }
    }, 450);
  };

  const [newLicDeviceName, setNewLicDeviceName] = useState('');
  const [newLicSerial, setNewLicSerial] = useState('');
  const [newLicCertType, setNewLicCertType] = useState<'FCC' | 'CE' | 'ISED' | 'MIC' | 'VCCI'>('FCC');
  const [newLicCertId, setNewLicCertId] = useState('');
  const [newLicMaxPower, setNewLicMaxPower] = useState(10);
  const [newLicLab, setNewLicLab] = useState('Bay Area Compliance Labs');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ [id: string]: 'idle' | 'verifying' | 'verified' | 'failed' }>({});
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState<string | null>(null);
  const [selectedLetterTakedown, setSelectedLetterTakedown] = useState<WebTakedownRecord | null>(null);
  const [isAutoSweeping, setIsAutoSweeping] = useState(true);
  const [customRadarNodes, setCustomRadarNodes] = useState<{ id: string; name: string; type: 'beacon' | 'threat'; distance: number; angle: number; x: number; y: number }[]>([]);
  const [acousticWaveType, setAcousticWaveType] = useState<'sine' | 'triangle' | 'square' | 'noise'>('sine');
  const [acousticFrequency, setAcousticFrequency] = useState<number>(850);
  const [fwFlashStatus, setFwFlashStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [fwFlashProgress, setFwFlashProgress] = useState(0);
  const [fwFlashLogs, setFwFlashLogs] = useState<string[]>([]);
  const [activeThreatIntercept, setActiveThreatIntercept] = useState<{ id: string; target: string; type: string; distance: number } | null>(null);
  const [isShieldReinforced, setIsShieldReinforced] = useState(false);
  const [sweepIntensity, setSweepIntensity] = useState<'weekly' | 'daily' | 'realtime'>('daily');
  const [timeLeft, setTimeLeft] = useState(30);
  const [acousticMode, setAcousticMode] = useState<'beamforming' | 'voice_isolation' | 'wide_jamming'>('beamforming');
  const [beamformingAngle, setBeamformingAngle] = useState(12);
  const [voicePrintOnly, setVoicePrintOnly] = useState(true);
  const [bystanderPass, setBystanderPass] = useState(true);
  
  // Rotating cryptographic key BLE UUID 15-minute countdown
  const [uuidTimeLeft, setUuidTimeLeft] = useState(900);

  // Physical Anti-Camera LED array mode
  const [irLedMode, setIrLedMode] = useState<string>('steady');

  // Asymmetrical Protection Boundary Designer state
  const [selectedAsymmetricTagId, setSelectedAsymmetricTagId] = useState<string>('fam-3');
  const [asymmetricOffsets, setAsymmetricOffsets] = useState<Record<string, { front: number; back: number; left: number; right: number }>>({
    'fam-3': { front: 3.5, back: 8.5, left: 3.0, right: 3.0 },
    'default': { front: 3.0, back: 3.0, left: 3.0, right: 3.0 }
  });

  // Zero-Knowledge Audit Logs verification states
  const [activeZkVerificationId, setActiveZkVerificationId] = useState<string | null>(null);
  const [zkVerifying, setZkVerifying] = useState(false);
  const [zkComplete, setZkComplete] = useState(false);
  const [zkSteps, setZkSteps] = useState<string[]>([]);

  // Emergency Coercion Purge states
  const [coercionWipeActive, setCoercionWipeActive] = useState(false);
  const [wipeHoldSeconds, setWipeHoldSeconds] = useState(0);
  const [isHoldingWipe, setIsHoldingWipe] = useState(false);
  
  // States for adding smart tags
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<'phone' | 'smart_tag' | 'key_fob' | 'airtag' | 'galaxy_tag'>('smart_tag');
  const [newTagPrivacy, setNewTagPrivacy] = useState<PrivacyLevel>('magic_removal');
  
  // Real-time signal strength noise simulation
  const [signalNoise, setSignalNoise] = useState<Record<string, number>>({});
  
  // Perimeter Security states
  const [perimeterSensors, setPerimeterSensors] = useState<PerimeterSensor[]>([
    {
      id: 'sens-1',
      name: 'Safe-Entrance Shield Gate',
      location: 'Oakwood Primary School (Main Entry)',
      type: 'school',
      isActive: true,
      coverageMeters: 25,
      detectionsBlocked: 342,
      status: 'active'
    },
    {
      id: 'sens-2',
      name: 'Front Yard Privacy Dome',
      location: 'Stuart Family Residence',
      type: 'home',
      isActive: true,
      coverageMeters: 15,
      detectionsBlocked: 19,
      status: 'active'
    },
    {
      id: 'sens-3',
      name: 'Playground Active Censor Hub',
      location: 'Sunnyvale Public Park',
      type: 'public',
      isActive: false,
      coverageMeters: 30,
      detectionsBlocked: 815,
      status: 'maintenance'
    }
  ]);
  const [newSensName, setNewSensName] = useState('');
  const [newSensLocation, setNewSensLocation] = useState('');
  const [newSensType, setNewSensType] = useState<'school' | 'home' | 'commercial' | 'public'>('school');
  const [newSensRange, setNewSensRange] = useState(20);

  // Retroactive Web Face Scrubber States (DeleteMe for Video)
  const [takedowns, setTakedowns] = useState<WebTakedownRecord[]>([
    {
      id: 'tk-1',
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=dx782h932d',
      confidenceScore: 0.94,
      status: 'takedown_success',
      timestamp: '2026-06-28 10:14'
    },
    {
      id: 'tk-2',
      platform: 'tiktok',
      url: 'https://tiktok.com/@vlogger_star/video/849204820',
      confidenceScore: 0.97,
      status: 'dispatched',
      timestamp: '2026-06-30 14:22'
    },
    {
      id: 'tk-3',
      platform: 'instagram',
      url: 'https://instagram.com/p/Cg7823hd920/',
      confidenceScore: 0.89,
      status: 'detected',
      timestamp: '2026-07-01 11:05'
    }
  ]);
  const [isScanningCrawler, setIsScanningCrawler] = useState(false);
  const [newScrubUrl, setNewScrubUrl] = useState('');
  const [newScrubPlatform, setNewScrubPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | 'web_index'>('youtube');

  // Retroactive Web Voice/Audio Scrubber States
  const [audioTakedowns, setAudioTakedowns] = useState<any[]>([
    {
      id: 'at-1',
      platform: 'spotify',
      url: 'https://open.spotify.com/episode/podcast_72h932d',
      confidenceScore: 0.95,
      status: 'scrub_success',
      timestamp: '2026-06-29 09:12',
      matchedSegment: '02:14 - 02:40'
    },
    {
      id: 'at-2',
      platform: 'apple_podcasts',
      url: 'https://podcasts.apple.com/us/podcast/tech-insiders/id849204820',
      confidenceScore: 0.91,
      status: 'dispatched',
      timestamp: '2026-07-02 16:45',
      matchedSegment: '14:52 - 15:10'
    },
    {
      id: 'at-3',
      platform: 'soundcloud',
      url: 'https://soundcloud.com/user-392823/street-talk-exclusive',
      confidenceScore: 0.88,
      status: 'detected',
      timestamp: '2026-07-04 11:20',
      matchedSegment: '05:01 - 05:18'
    }
  ]);
  const [newAudioScrubUrl, setNewAudioScrubUrl] = useState('');
  const [newAudioScrubPlatform, setNewAudioScrubPlatform] = useState<'spotify' | 'apple_podcasts' | 'soundcloud' | 'audio_archive' | 'audio_database' | 'streaming_index'>('spotify');

  const [audioIntegrations, setAudioIntegrations] = useState([
    {
      id: 'spotify',
      name: 'Spotify Podcaster Secure API',
      icon: 'üéôÔ∏è',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Voice hash template synchronized with Spotify Trust & Safety Hub.',
      lastChecked: '6 mins ago',
      apiVersion: 'v2-voice-optout'
    },
    {
      id: 'apple_podcasts',
      name: 'Apple Directory Opt-Out API',
      icon: 'üéß',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Sub-audible spectral signature synced successfully.',
      lastChecked: '15 mins ago',
      apiVersion: 'v4.1'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud Content-ID Webhook',
      icon: 'üîä',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Real-time sonic fingerprint callback webhooks active.',
      lastChecked: '9 mins ago',
      apiVersion: 'v1.5-bystander'
    },
    {
      id: 'audio_database',
      name: 'Public Audio Database Indexer',
      icon: 'üóÑÔ∏è',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Synced with decentralized vocal storage indexes and raw wav repositories.',
      lastChecked: '4 mins ago',
      apiVersion: 'v1.0-indexer'
    },
    {
      id: 'streaming_index',
      name: 'Global Streaming Audio Indexer',
      icon: 'üìà',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Real-time monitoring of live streaming audio feeds and broadcast channels.',
      lastChecked: '1 min ago',
      apiVersion: 'v1.2-streaming'
    }
  ]);

  const [syncingAudioAppId, setSyncingAudioAppId] = useState<string | null>(null);
  const [isSimulatingAudioUpload, setIsSimulatingAudioUpload] = useState(false);
  const [audioSimulationMsg, setAudioSimulationMsg] = useState('');
  const [isScanningAudioCrawler, setIsScanningAudioCrawler] = useState(false);
  const [isAutoAudioSweeping, setIsAutoAudioSweeping] = useState(true);
  const [audioSweepIntensity, setAudioSweepIntensity] = useState<'weekly' | 'daily' | 'realtime'>('daily');
  const [audioUploadLogs, setAudioUploadLogs] = useState<string[]>([]);
  const [isSimulatingAudioAllowedUpload, setIsSimulatingAudioAllowedUpload] = useState(false);

  // Social Media API Integration States
  const [socialIntegrations, setSocialIntegrations] = useState([
    {
      id: 'youtube',
      name: 'YouTube Partner API',
      icon: 'üìπ',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Token refreshed: OAuth2 secure handshake active.',
      lastChecked: '4 mins ago',
      apiVersion: 'v3.2-secure'
    },
    {
      id: 'instagram',
      name: 'Instagram Graph API',
      icon: 'üì∏',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Graph handshake established via secure access token.',
      lastChecked: '12 mins ago',
      apiVersion: 'v18.0'
    },
    {
      id: 'tiktok',
      name: 'TikTok Safety Hub API',
      icon: 'üéµ',
      enabled: true,
      status: 'connected' as 'connected' | 'handshake' | 'disconnected',
      handshakeLog: 'Safety webhook registered. Frame callback handshakes active.',
      lastChecked: '8 mins ago',
      apiVersion: 'v2-bystander'
    }
  ]);
  
  // Alert Customizer States (Vibration patterns)
  const [vibrationPatterns, setVibrationPatterns] = useState<Record<string, { name: string; pattern: number[]; desc: string }>>(() => {
    try {
      const saved = localStorage.getItem('blurbubble_custom_vibrations');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      critical_battery: {
        name: 'Critical Battery Warning',
        pattern: [400, 100, 100, 100, 400],
        desc: 'Long-Short-Long pulses dispatched when companion badge drops below threshold.'
      },
      camera_intrusion: {
        name: 'Camera Intrusion Intercept',
        pattern: [100, 50, 100],
        desc: 'Double quick tap dispatched when nearby recording lens is detected.'
      },
      social_discovery: {
        name: 'Social Discovery Broadcast',
        pattern: [200, 200, 200],
        desc: 'Steady rhythmic taps indicating nearby BlurBubble peers.'
      },
      crawler_match: {
        name: 'Retroactive Crawler Match',
        pattern: [300, 150, 300],
        desc: 'Urgent twin vibration when unconsented online recordings are indexed.'
      }
    };
  });

  const [activeTestingPatternId, setActiveTestingPatternId] = useState<string | null>(null);
  const [visualVibrationTicks, setVisualVibrationTicks] = useState<boolean>(false);
  const [editingPatternId, setEditingPatternId] = useState<string>('critical_battery');
  const [patternInputText, setPatternInputText] = useState<string>('400, 100, 100, 100, 400');
  const [customizerSuccessMsg, setCustomizerSuccessMsg] = useState<string>('');

  const testVibrationPattern = (id: string, pattern: number[]) => {
    if (activeTestingPatternId) return; // ignore if already running

    // 1. Play actual physical vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }

    // 2. Play visual vibration sequence for screen-only devices / fallback
    setActiveTestingPatternId(id);
    playLocalSoundTest('sonar_chime', 40);

    let currentDelay = 0;
    const timeouts: number[] = [];

    pattern.forEach((duration, idx) => {
      // Even index is vibration (ON), odd index is pause (OFF)
      const isVibrate = idx % 2 === 0;

      if (isVibrate) {
        // Start vibrating
        const tStart = window.setTimeout(() => {
          setVisualVibrationTicks(true);
        }, currentDelay);
        timeouts.push(tStart);

        // Stop vibrating after duration
        const tEnd = window.setTimeout(() => {
          setVisualVibrationTicks(false);
        }, currentDelay + duration);
        timeouts.push(tEnd);
      }
      
      currentDelay += duration;
    });

    const tFinish = window.setTimeout(() => {
      setActiveTestingPatternId(null);
      setVisualVibrationTicks(false);
    }, currentDelay + 100);
    timeouts.push(tFinish);
  };

  useEffect(() => {
    if (vibrationPatterns[editingPatternId]) {
      setPatternInputText(vibrationPatterns[editingPatternId].pattern.join(', '));
    }
  }, [editingPatternId, vibrationPatterns]);

  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [simulationMsg, setSimulationMsg] = useState('');

  const toggleSocialApp = (id: string) => {
    setSocialIntegrations(prev => prev.map(app => {
      if (app.id === id) {
        const nextEnabled = !app.enabled;
        return {
          ...app,
          enabled: nextEnabled,
          status: nextEnabled ? 'connected' : 'disconnected',
          handshakeLog: nextEnabled 
            ? 'Re-enabled. Secure API token validated.' 
            : 'Integration disabled by user choice. Platform sync paused.'
        };
      }
      return app;
    }));
  };

  const triggerSocialHandshake = (id: string) => {
    setSyncingAppId(id);
    setSocialIntegrations(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: 'handshake', handshakeLog: 'Initiating fresh OAuth handshake protocol...' };
      }
      return app;
    }));

    setTimeout(() => {
      setSocialIntegrations(prev => prev.map(app => {
        if (app.id === id) {
          return {
            ...app,
            status: 'connected',
            handshakeLog: 'Handshake successful. Verified 256-bit SHA face template sync.',
            lastChecked: 'Just Now'
          };
        }
        return app;
      }));
      setSyncingAppId(null);
    }, 1500);
  };

  const simulateSocialUploadDetection = () => {
    const activePlatforms = socialIntegrations.filter(app => app.enabled);
    if (activePlatforms.length === 0) {
      setSimulationMsg('‚ùå Error: All social media API connections are disabled. Enable at least one platform to simulate automatic scanning.');
      return;
    }

    setIsSimulatingUpload(true);
    setSimulationMsg('Uploading mock video containing registered face template to active platforms...');

    setTimeout(() => {
      // Pick a random active platform
      const randomApp = activePlatforms[Math.floor(Math.random() * activePlatforms.length)];
      
      const mockUrls = {
        youtube: 'https://youtube.com/watch?v=scrub_' + Math.random().toString(36).substr(2, 8),
        instagram: 'https://instagram.com/reel/scrub_' + Math.random().toString(36).substr(2, 8),
        tiktok: 'https://tiktok.com/@creator/video/scrub_' + Math.random().toString(36).substr(2, 8)
      };

      const targetUrl = mockUrls[randomApp.id as keyof typeof mockUrls] || 'https://youtube.com/watch?v=scrub_generic';
      
      const newRecord: WebTakedownRecord = {
        id: 'tk-' + Date.now(),
        platform: randomApp.id as 'youtube' | 'tiktok' | 'instagram',
        url: targetUrl,
        confidenceScore: parseFloat((0.90 + Math.random() * 0.09).toFixed(2)),
        status: 'detected',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setTakedowns(prev => [newRecord, ...prev]);
      setSimulationMsg(`‚úÖ Detected & Flagged! ${randomApp.name} detected your registered face hash in an uploaded vlog. The API immediately flagged it for retroactive scrubbing! Check your list below.`);
      setIsSimulatingUpload(false);
    }, 2000);
  };

  const toggleAudioApp = (id: string) => {
    setAudioIntegrations(prev => prev.map(app => {
      if (app.id === id) {
        const nextEnabled = !app.enabled;
        return {
          ...app,
          enabled: nextEnabled,
          status: nextEnabled ? 'connected' : 'disconnected',
          handshakeLog: nextEnabled 
            ? 'Re-enabled. Secure audio API token validated.' 
            : 'Integration disabled by user choice. Platform sync paused.'
        };
      }
      return app;
    }));
  };

  const triggerAudioHandshake = (id: string) => {
    setSyncingAudioAppId(id);
    setAudioIntegrations(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: 'handshake', handshakeLog: 'Initiating fresh OAuth voice handshake protocol...' };
      }
      return app;
    }));

    setTimeout(() => {
      setAudioIntegrations(prev => prev.map(app => {
        if (app.id === id) {
          return {
            ...app,
            status: 'connected',
            handshakeLog: 'Handshake successful. Verified 256-bit SHA acoustic template sync.',
            lastChecked: 'Just Now'
          };
        }
        return app;
      }));
      setSyncingAudioAppId(null);
    }, 1500);
  };

  const simulateAudioUploadDetection = () => {
    const activePlatforms = audioIntegrations.filter(app => app.enabled);
    if (activePlatforms.length === 0) {
      setAudioSimulationMsg('‚ùå Error: All audio API connections are disabled. Enable at least one platform to simulate automatic scanning.');
      return;
    }

    setIsSimulatingAudioUpload(true);
    setAudioSimulationMsg('Uploading mock audio stream containing registered voice print to active platforms...');

    setTimeout(() => {
      const randomApp = activePlatforms[Math.floor(Math.random() * activePlatforms.length)];
      
      const mockUrls = {
        spotify: 'https://open.spotify.com/episode/' + Math.random().toString(36).substr(2, 8),
        apple_podcasts: 'https://podcasts.apple.com/us/podcast/id' + Math.floor(Math.random() * 900000000 + 100000000),
        soundcloud: 'https://soundcloud.com/user-' + Math.floor(Math.random() * 1000000) + '/track',
        audio_database: 'https://audiodb.org/files/leak_' + Math.floor(Math.random() * 10000) + '.wav',
        streaming_index: 'https://audiostream-index.net/stream/capture_' + Math.floor(Math.random() * 10000)
      };

      const targetUrl = (mockUrls as any)[randomApp.id] || 'https://open.spotify.com/episode/generic_scrub';
      
      const randomMin = Math.floor(Math.random() * 20);
      const randomSecStart = Math.floor(Math.random() * 45);
      const startStr = `${String(randomMin).padStart(2, '0')}:${String(randomSecStart).padStart(2, '0')}`;
      const endStr = `${String(randomMin).padStart(2, '0')}:${String(randomSecStart + 15).padStart(2, '0')}`;

      const newRecord = {
        id: 'at-' + Date.now(),
        platform: randomApp.id as any,
        url: targetUrl,
        confidenceScore: parseFloat((0.87 + Math.random() * 0.12).toFixed(2)),
        status: 'detected',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        matchedSegment: `${startStr} - ${endStr}`
      };

      setAudioTakedowns(prev => [newRecord, ...prev]);
      
      // Add the match to the general detection logs interface
      if (onAddLog) {
        onAddLog({
          id: 'log-audio-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          deviceModel: `${randomApp.name}`,
          action: 'discovered',
          shieldApplied: 'ACOUSTIC WATERMARK / SCRAMBLER',
          distance: 0,
          rotatedId: 'AUDIO_' + Math.random().toString(36).substring(2, 8).toUpperCase()
        });
      }

      if (onTriggerAlert) {
        onTriggerAlert(
          "Unconsented Vocal Recording Found",
          `Acoustic crawler detected your voice template on ${randomApp.name}. Takedown requested.`,
          "video_found"
        );
      }

      setAudioSimulationMsg(`‚úÖ Voice Print Flagged! ${randomApp.name} detected your acoustic fingerprint hash in a newly parsed audio stream. The API immediately logged it and dispatched a dynamic scrambling request!`);
      setIsSimulatingAudioUpload(false);
    }, 2000);
  };

  // Law Enforcement Escrow Override states
  const [escrowHolders, setEscrowHolders] = useState<EscrowKeyHolder[]>([
    {
      id: 'esc-1',
      agency: 'Oakwood Police Bureau',
      holderName: 'Chief Inspector G. Vance',
      keyStatus: 'escrowed',
      authClearance: 'Level-3 Public Safety Warrant Required'
    },
    {
      id: 'esc-2',
      agency: 'State Juvenile Court',
      holderName: 'Honorable Judge M. Sterling',
      keyStatus: 'escrowed',
      authClearance: 'Signed Court Order Token Required'
    },
    {
      id: 'esc-3',
      agency: 'Federal Privacy Oversight Unit',
      holderName: 'Director E. Thorne',
      keyStatus: 'locked',
      authClearance: 'Joint Multi-Agency Cryptographic Authorization Only'
    }
  ]);
  const [overrideActive, setOverrideActive] = useState(false);
  const [incidentHash, setIncidentHash] = useState('');
  const [overrideLogs, setOverrideLogs] = useState<string[]>([
    'System initialization: Multi-Sig Escrow loaded (ECC-384 keys).',
    'Escrow validation check: Bureau gateways online.'
  ]);
  const [newEscrowAgency, setNewEscrowAgency] = useState('');
  const [newEscrowName, setNewEscrowName] = useState('');
  const [newEscrowClearance, setNewEscrowClearance] = useState('Level-1 Public Safety Warrant Required');

  // Legal & Compliance States (Privacy Signal Declaration)
  const [declarantName, setDeclarantName] = useState('Paul Stuart');
  const [declarantEmail, setDeclarantEmail] = useState('overly.averted@icloud.com');
  const [declarantBeaconId, setDeclarantBeaconId] = useState<string>('all');
  const [declarantCustomDevice, setDeclarantCustomDevice] = useState('');
  const [declarantCustomSerial, setDeclarantCustomSerial] = useState('');
  const [declarationJurisdiction, setDeclarationJurisdiction] = useState<'USA' | 'EU' | 'CA' | 'JP' | 'Custom'>('USA');
  const [declarationPurpose, setDeclarationPurpose] = useState<'ai_optout' | 'anti_eavesdropping' | 'full_cloaking'>('ai_optout');
  const [declarationCustomNotes, setDeclarationCustomNotes] = useState('');
  const [isDeclarationGenerated, setIsDeclarationGenerated] = useState(false);
  const [declarationDocId, setDeclarationDocId] = useState('DEC-' + Math.floor(100000 + Math.random() * 900000));
  const [isPresenting, setIsPresenting] = useState(false);

  // Smart Scheduling local states
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('09:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('17:00');
  const [newSlotDays, setNewSlotDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [newSlotBroadcastEnabled, setNewSlotBroadcastEnabled] = useState(true);
  const [newSlotIcon, setNewSlotIcon] = useState<'briefcase' | 'baby' | 'beer' | 'home' | 'school' | 'car' | 'users' | 'shield'>('briefcase');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSlotPrivacyLevel, setNewSlotPrivacyLevel] = useState<string>('default');

  const [simulationMode, setSimulationMode] = useState<'real' | 'simulated'>('simulated');
  const [simulatedTime, setSimulatedTime] = useState('08:00');
  const [simulatedDay, setSimulatedDay] = useState('Mon');
  const [activeScheduledSlotName, setActiveScheduledSlotName] = useState<string>('None (Default Behavior)');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const renderSlotIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch (iconName) {
      case 'briefcase': return <Briefcase className={className} />;
      case 'baby': return <Baby className={className} />;
      case 'beer': return <Beer className={className} />;
      case 'home': return <Home className={className} />;
      case 'school': return <School className={className} />;
      case 'car': return <Car className={className} />;
      case 'users': return <Users className={className} />;
      case 'shield': return <Shield className={className} />;
      default: return <Clock className={className} />;
    }
  };

  // Smart Scheduling logic checking effect
  useEffect(() => {
    if (!state.smartSchedulingEnabled) {
      setActiveScheduledSlotName('None (Scheduler Disabled)');
      return;
    }

    let currentDayStr = simulatedDay;
    let currentTimeStr = simulatedTime;

    if (simulationMode === 'real') {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      currentTimeStr = `${hh}:${mm}`;

      const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      currentDayStr = daysShort[now.getDay()];
    }

    const slots = state.scheduleSlots || [];
    const activeMatch = slots.find((slot) => {
      if (!slot.isActive) return false;
      if (!slot.days.includes(currentDayStr)) return false;

      const [sh, sm] = slot.startTime.split(':').map(Number);
      const [eh, em] = slot.endTime.split(':').map(Number);
      const [ch, cm] = currentTimeStr.split(':').map(Number);

      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      const currentMin = ch * 60 + cm;

      if (startMin <= endMin) {
        return currentMin >= startMin && currentMin <= endMin;
      } else {
        // Night-shift overlap midnight
        return currentMin >= startMin || currentMin <= endMin;
      }
    });

    if (activeMatch) {
      setActiveScheduledSlotName(activeMatch.label);
      const updates: Partial<typeof state> = {};
      let needsUpdate = false;

      if (state.isBroadcasting !== activeMatch.broadcastEnabled) {
        updates.isBroadcasting = activeMatch.broadcastEnabled;
        needsUpdate = true;
      }

      if (activeMatch.privacyLevel && state.privacyLevel !== activeMatch.privacyLevel) {
        updates.privacyLevel = activeMatch.privacyLevel as any;
        needsUpdate = true;
      }

      if (needsUpdate) {
        onChange({
          ...state,
          ...updates
        });

        // Broadcast simulation alert
        const rulesText = `Beacon set to ${activeMatch.broadcastEnabled ? 'ON' : 'OFF'}${activeMatch.privacyLevel ? ` with ${activeMatch.privacyLevel.replace('_', ' ').toUpperCase()} filter` : ''}`;
        window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
          detail: { 
            title: `Smart Schedule Match: ${activeMatch.label}`,
            body: `${rulesText} automatically (Time: ${currentTimeStr}, ${currentDayStr}).`,
            type: 'schedule_update'
          } 
        }));
      }
    } else {
      setActiveScheduledSlotName('None (No active rule matches this time)');
    }
  }, [
    state.smartSchedulingEnabled,
    state.scheduleSlots,
    simulationMode,
    simulatedTime,
    simulatedDay,
    state.isBroadcasting,
    state.privacyLevel,
    onChange
  ]);

  const handleAddScheduleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotLabel.trim()) return;

    const newSlot = {
      id: 'slot-' + Math.floor(10000 + Math.random() * 90000),
      label: newSlotLabel,
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
      days: newSlotDays,
      broadcastEnabled: newSlotBroadcastEnabled,
      icon: newSlotIcon,
      isActive: true,
      ...(newSlotPrivacyLevel !== 'default' ? { privacyLevel: newSlotPrivacyLevel as any } : {})
    };

    onChange({
      ...state,
      scheduleSlots: [...(state.scheduleSlots || []), newSlot]
    });

    setNewSlotLabel('');
    setNewSlotStartTime('09:00');
    setNewSlotEndTime('17:00');
    setNewSlotDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setNewSlotBroadcastEnabled(true);
    setNewSlotIcon('briefcase');
    setNewSlotPrivacyLevel('default');

    window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
      detail: { 
        title: `Schedule Rule Created`,
        body: `Rule "${newSlot.label}" registered successfully.`,
        type: 'schedule_update'
      } 
    }));
  };

  const handleDeleteScheduleSlot = (id: string) => {
    onChange({
      ...state,
      scheduleSlots: (state.scheduleSlots || []).filter(s => s.id !== id)
    });
  };

  const handleToggleScheduleSlotActive = (id: string) => {
    onChange({
      ...state,
      scheduleSlots: (state.scheduleSlots || []).map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    });
  };

  const handleSimulateSlot = (slot: any) => {
    setSimulationMode('simulated');
    setSimulatedDay(slot.days[0] || 'Mon');
    
    // Set time to the middle of the slot
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    let midHour = sh;
    if (sh <= eh) {
      midHour = Math.floor((sh + eh) / 2);
    } else {
      // Midnight overlap
      midHour = Math.floor((sh + eh + 24) / 2) % 24;
    }
    setSimulatedTime(`${String(midHour).padStart(2, '0')}:00`);
  };

  const handleTriggerOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentHash.trim()) return;
    const nowStr = new Date().toLocaleTimeString();
    
    // Check if it's our designated law override sequence
    setOverrideActive(true);
    onChange({ ...state, overrideActive: true });
    setIncidentHash('');
    setEscrowHolders(prev => prev.map(h => h.id === 'esc-1' || h.id === 'esc-2' ? { ...h, keyStatus: 'emergency_accessed', lastUsed: 'Just Now' } : h));
    setOverrideLogs(prev => [
      `[${nowStr}] ‚ö†Ô∏è EMERGENCY OVERRIDE ENGAGED: Incident hash verified by Bureau & Judge Sterling.`,
      `[${nowStr}] Cryptographic multi-sig keys decrypted. Optical hardware feed bypass activated.`,
      `[${nowStr}] Local AR HUD filters paused within authorized grid coordinates.`,
      ...prev
    ]);
  };

  const handleRevokeOverride = () => {
    const nowStr = new Date().toLocaleTimeString();
    setOverrideActive(false);
    onChange({ ...state, overrideActive: false });
    setEscrowHolders(prev => prev.map(h => h.id === 'esc-1' || h.id === 'esc-2' ? { ...h, keyStatus: 'escrowed' } : h));
    setOverrideLogs(prev => [
      `[${nowStr}] üîí EMERGENCY OVERRIDE REVOKED. Censor systems re-established.`,
      `[${nowStr}] Hardware firmware returned to strict bystander-compliance state.`,
      ...prev
    ]);
  };

  const handleVerifyLicense = (id: string) => {
    setVerificationResult(prev => ({ ...prev, [id]: 'verifying' }));
    setTimeout(() => {
      setVerificationResult(prev => ({ ...prev, [id]: 'verified' }));
    }, 1200);
  };

  const handleRenewLicense = (id: string, years: number) => {
    setRenewingId(id);
    setTimeout(() => {
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + years);
      const updated = state.hardwareLicenses?.map(lic => {
        if (lic.id === id) {
          return {
            ...lic,
            status: 'active' as const,
            expirationDate: expDate.toISOString().split('T')[0],
            lastVerified: new Date().toISOString().split('T')[0],
          };
        }
        return lic;
      });
      onChange({ ...state, hardwareLicenses: updated });
      setRenewingId(null);
      setShowRenewalModal(null);
      setVerificationResult(prev => ({ ...prev, [id]: 'verified' }));
    }, 1200);
  };
  
  // States for adding registered faces
  const [newFaceName, setNewFaceName] = useState('');
  const [newFacePhoto, setNewFacePhoto] = useState('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80');

  // Social handles
  const [tempUsername, setTempUsername] = useState(state.socialProfile?.username || '@your_handle');
  const [tempBio, setTempBio] = useState(state.socialProfile?.bio || 'Let\'s connect in real life!');
  const [tempInterests, setTempInterests] = useState(state.socialProfile?.interests.join(', ') || 'Tech, Art, Design');

  // Daily Summary Email Generator States
  const [logsActiveTab, setLogsActiveTab] = useState<'ledger' | 'email'>('ledger');
  const [emailRecipient, setEmailRecipient] = useState('overly.averted@icloud.com');
  const [emailReportTime, setEmailReportTime] = useState('08:00');
  const [isAutoReportEnabled, setIsAutoReportEnabled] = useState(true);
  const [emailReportType, setEmailReportType] = useState<'standard' | 'forensic'>('standard');
  const [isSendingReportSimulation, setIsSendingReportSimulation] = useState(false);
  const [reportSimulationSuccess, setReportSimulationSuccess] = useState(false);

  // Rotate Key effect
  useEffect(() => {
    if (!state.isBroadcasting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setUuidTimeLeft((prev) => (prev <= 1 ? 900 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isBroadcasting]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(30);
      const chars = '0123456789ABCDEF';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += chars[Math.floor(Math.random() * 16)];
      }
      onChange({
        ...state,
        anonymousId: result,
      });
    }
  }, [timeLeft, state, onChange]);

  // Real-time periodic threat detection and active warning banner scheduler
  useEffect(() => {
    if (!state.isBroadcasting) {
      setActiveThreatIntercept(null);
      return;
    }

    const interval = setInterval(() => {
      // Chance to spawn an active threat intercept alert
      if (Math.random() < 0.45 && !activeThreatIntercept) {
        const models = [
          { type: 'CCTV Neural Core Scan', target: 'CCTV Dome #129', distance: 14 },
          { type: 'Rogue Lidar Sweep', target: 'Rogue Drone #804', distance: 19 },
          { type: 'Smart Lens Face Detection', target: 'Smart Glasses #382', distance: 11 }
        ];
        const chosen = models[Math.floor(Math.random() * models.length)];
        setActiveThreatIntercept({
          id: Math.random().toString(),
          type: chosen.type,
          target: chosen.target,
          distance: chosen.distance
        });
        
        // Push a critical alert event log
        onAddLog({
          deviceModel: chosen.target,
          action: 'intercepted',
          shieldApplied: `INTERCEPTED_${chosen.type.toUpperCase().replace(/ /g, '_')}`,
          distance: chosen.distance,
          rotatedId: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase()
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [state.isBroadcasting, activeThreatIntercept, onAddLog]);

  // Real-time signal strength noise simulation effect
  useEffect(() => {
    if (!state.isBroadcasting) return;

    const interval = setInterval(() => {
      setSignalNoise((prev) => {
        const next: Record<string, number> = { ...prev };
        state.registeredEntities.forEach((tag) => {
          next[tag.id] = Math.random() * 8 - 4;
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [state.isBroadcasting, state.registeredEntities]);

  // Coercion Purge logic
  const handleCoercionPurge = () => {
    setCoercionWipeActive(true);
    if (onClearLogs) {
      onClearLogs();
    }
    onChange({
      ...state,
      isBroadcasting: false,
      wifiRules: [],
      registeredFaces: [],
      registeredEntities: [],
      facialRecognitionOptOut: false,
      smartSchedulingEnabled: false,
      wifiRulesEnabled: false,
    });
    setTimeout(() => {
      setCoercionWipeActive(false);
    }, 4500);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHoldingWipe) {
      timer = setInterval(() => {
        setWipeHoldSeconds((prev) => {
          if (prev >= 2) {
            clearInterval(timer);
            setIsHoldingWipe(false);
            handleCoercionPurge();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setWipeHoldSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isHoldingWipe]);

  const handleLevelChange = (level: PrivacyLevel) => {
    onChange({
      ...state,
      privacyLevel: level,
    });
  };

  const handleProfileSave = () => {
    const interestsArray = tempInterests
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    onChange({
      ...state,
      socialProfile: {
        username: tempUsername.startsWith('@') ? tempUsername : `@${tempUsername}`,
        bio: tempBio,
        interests: interestsArray,
        link: 'https://blurbubble.me/discover',
      },
    });
  };

  // Smart Tag CRUD Helpers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: RegisteredEntity = {
      id: 'tag-' + Date.now(),
      name: newTagName,
      type: newTagType,
      isActive: true,
      privacyLevel: newTagPrivacy,
      batteryPercent: Math.floor(Math.random() * 20) + 80 // 80% to 100%
    };

    onChange({
      ...state,
      registeredEntities: [...state.registeredEntities, newTag]
    });
    setNewTagName('');
  };

  const handleDeleteTag = (id: string) => {
    onChange({
      ...state,
      registeredEntities: state.registeredEntities.filter(tag => tag.id !== id)
    });
  };

  const nextCryptoIDRef = useRef(nextCryptoID);
  nextCryptoIDRef.current = nextCryptoID;

  // --- CRYPTO TIMER ROTATION EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCryptoTimer((prev) => {
        if (prev <= 1) {
          setTimeout(() => {
            const hex = '0123456789ABCDEF';
            let newNextId = '0xFD23-';
            for (let i = 0; i < 3; i++) {
              let part = '';
              for (let j = 0; j < 4; j++) {
                part += hex[Math.floor(Math.random() * 16)];
              }
              newNextId += part + (i < 2 ? '-' : '');
            }
            
            const current = nextCryptoIDRef.current;
            setCurrentCryptoID(current);
            setNextCryptoID(newNextId);
            
            if (onAddLog) {
              onAddLog({
                deviceModel: "CHILD_SHIELD_CONTROLLER",
                action: 'rotated',
                shieldApplied: "ROTATE_CRYPTOGRAPHIC_ID_ROTATION_SUCCESS",
                distance: 0,
                rotatedId: current
              });
            }
          }, 0);
          
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onAddLog]);

  // --- INTERACTIVE EVENT HANDLERS FOR NEW PROMPTS ---
  const handleTriggerTrackingSweep = () => {
    setIsSweepingTrackers(true);
    setScrambledTrackers(prev => [
      {
        id: 'trk-sweep-' + Date.now(),
        name: 'Simulated Surveillance CCTV Probe',
        type: 'Facial Matcher Crawler',
        status: 'DEFLECTED',
        timestamp: 'Just now'
      },
      ...prev
    ]);
    
    setTimeout(() => {
      setIsSweepingTrackers(false);
      window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
        detail: { 
          title: 'üõ°Ô∏è Tracking Sweep Scrambled!',
          body: 'Simulated tracking probes scanned the area, but the 90-second cryptographic ID rotation rendered the child tag completely untrackable!',
          type: 'blocking'
        } 
      }));
    }, 2500);
  };

  const handleTriggerComplianceTest = () => {
    setComplianceTesting(true);
    setComplianceProgress(0);
    setComplianceReport(null);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setComplianceProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setComplianceTesting(false);
        setComplianceReport({
          fccStatus: 'PASSED',
          ceStatus: 'PASSED',
          eirpPower: complianceRegion === 'US' ? '+4 dBm' : '0 dBm',
          freqRange: '2402.0 MHz - 2480.0 MHz',
          exemptions: [
            complianceRegion === 'US' ? 'FCC Part 15.247 Exemption' : 'CE RED Directive Article 3',
            'Non-Trackable Active Refusal Authorization'
          ]
        });
        
        window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
          detail: { 
            title: `‚úÖ Compliance Certified: ${complianceRegion}`,
            body: `Self-diagnostic completed successfully! EIRP power level (${complianceRegion === 'US' ? '+4 dBm' : '0 dBm'}) is fully compliant with regional radio spectrum regulations.`,
            type: 'blocking'
          } 
        }));
      }
    }, 200);
  };

  const handleToggleTagStatus = (id: string) => {
    onChange({
      ...state,
      registeredEntities: state.registeredEntities.map(tag => 
        tag.id === id ? { ...tag, isActive: !tag.isActive } : tag
      )
    });
  };

  const handleRenameTag = (id: string, newName: string) => {
    if (newName.trim()) {
      onChange({
        ...state,
        registeredEntities: state.registeredEntities.map(tag => 
          tag.id === id ? { ...tag, name: newName.trim() } : tag
        )
      });
    }
    setEditingTagId(null);
  };

  const handleTagPrivacyChange = (id: string, level: PrivacyLevel) => {
    onChange({
      ...state,
      registeredEntities: state.registeredEntities.map(tag => 
        tag.id === id ? { ...tag, privacyLevel: level } : tag
      )
    });
  };

  const handleExportLogs = (format: 'csv' | 'pdf' | 'json') => {
    if (!logs || logs.length === 0) return;

    if (format === 'json') {
      const secureEnvelope = {
        title: "BLURBUBBLE PRIVACY COMPLIANCE HANDSHAKE LEDGER",
        export_date: new Date().toISOString(),
        regulatory_core: "v2.1 SECURE REGULATORY CORE",
        integrity_signature: "ECDSA_SHA256_" + Math.random().toString(36).substring(2).toUpperCase(),
        license_verification: {
          serial: "BB-LIC-99841-A",
          status: "ALL_UNITS_COMPLIANT"
        },
        user_metadata: {
          primary_anonymous_id: state.anonymousId,
          active_shield_broadcast: state.isBroadcasting ? "ACTIVE" : "STANDBY",
          retention_period: state.dataRetentionPref
        },
        records: logs
      };
      const blob = new Blob([JSON.stringify(secureEnvelope, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `blurbubble_signed_ledger_${new Date().toISOString().slice(0, 10)}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'Device Model', 'Action/Event', 'Shield Enforced', 'Distance (m)', 'Temporal Beacon ID'];
      const rows = logs.map(log => [
        `"${log.timestamp.replace(/"/g, '""')}"`,
        `"${log.deviceModel.replace(/"/g, '""')}"`,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.shieldApplied.replace(/"/g, '""')}"`,
        log.distance.toFixed(2),
        `"${log.rotatedId}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `blurbubble_privacy_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF export using jsPDF
      const doc = new jsPDF();
      
      // Document header with modern, clean styling matching BlurBubble branding
      doc.setFillColor(15, 23, 42); // slate-900 background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('BLURBUBBLE PRIVACY PROTECTION NETWORK', 15, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129); // emerald-400
      doc.text('SECURED DIGITAL COMPLIANCE AUDIT RECORD', 15, 26);
      
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 33);
      
      // Let's add metadata block
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AUDIT PARAMETERS & DEVICE STATUS:', 15, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Broadcasting Shield: ${state.isBroadcasting ? 'ACTIVE' : 'MUTED'}`, 15, 57);
      doc.text(`Primary Privacy Level: ${state.privacyLevel.toUpperCase()}`, 15, 63);
      doc.text(`Temporal Anonymous Rotating ID: ${state.anonymousId}`, 15, 69);
      doc.text(`Facial Recognition Opt-Out: ${state.facialRecognitionOptOut ? 'ENABLED' : 'DISABLED'}`, 110, 57);
      doc.text(`Data Retention Preference: ${state.dataRetentionPref.toUpperCase()}`, 110, 63);
      doc.text(`Protected Active Tags: ${state.registeredEntities.filter(e => e.isActive).length} devices`, 110, 69);
      
      // Divider line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 75, 195, 75);
      
      // Table Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Timestamp', 15, 83);
      doc.text('Intercepted Device Model', 45, 83);
      doc.text('Action', 105, 83);
      doc.text('Enforced Shield', 130, 83);
      doc.text('Dist (m)', 175, 83);
      
      // Divider line below header
      doc.line(15, 86, 195, 86);
      
      // Logs Table Content
      let yPosition = 93;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      
      logs.forEach((log, idx) => {
        // Alternating row background for beautiful readability
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(14, yPosition - 5, 182, 7.5, 'F');
        }
        
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(log.timestamp, 15, yPosition);
        
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(log.deviceModel, 45, yPosition);
        
        // Highlight action based on value
        if (log.action === 'censored') {
          doc.setTextColor(220, 38, 38); // red-600
        } else if (log.action === 'discovered' || log.action === 'erased') {
          doc.setTextColor(5, 150, 105); // emerald-600
        } else {
          doc.setTextColor(100, 116, 139);
        }
        doc.text(log.action.toUpperCase(), 105, yPosition);
        
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(log.shieldApplied, 130, yPosition);
        
        doc.setTextColor(100, 116, 139);
        doc.text(`${log.distance.toFixed(1)}m`, 175, yPosition);
        
        yPosition += 7.5;
        
        // Add new page if table overflows
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 20;
          // Sub-page Header
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 15, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('BLURBUBBLE PRIVACY PROTECTION NETWORK ‚Äî COMPLIANCE AUDIT', 15, 10);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          yPosition = 25;
        }
      });
      
      // Footer / Legal Notice
      if (yPosition > 255) {
        doc.addPage();
        yPosition = 30;
      } else {
        yPosition += 10;
      }
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, 195, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('LEGAL COMPLIANCE ASSURANCE:', 15, yPosition);
      
      yPosition += 5;
      doc.setFont('helvetica', 'oblique');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      
      const disclaimerLines = [
        'This document is a certified local record of spatial and biometric opt-out broadcasts transmitted under proposed RFC-9402 protocols.',
        'Nearby devices identifying this beacon are bound under public compliance frameworks to enforce automatic blurring or data erasure.',
        'Failure of external hardware vendors to apply corresponding shielding constitutes an unauthorized tracking violation.'
      ];
      
      disclaimerLines.forEach(line => {
        doc.text(line, 15, yPosition);
        yPosition += 4;
      });
      
      // Save document
      doc.save(`blurbubble_privacy_audit_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
  };

  const handleExportSignalHistoryAuditReport = async () => {
    try {
      const reportPayload = {
        title: "BLURBUBBLE‚Ñ¢ SHIELD SIGNAL HISTORY & COMPLIANCE AUDIT REPORT",
        standard: "RFC-9402 Decentralized Opt-Out Beacon Standard",
        exportTimestamp: new Date().toISOString(),
        beaconMetadata: {
          anonymousId: state.anonymousId || '0xFE69_DEFAULT',
          shieldStatus: state.isBroadcasting ? "ACTIVE_BROADCAST" : "SUSPENDED_STANDBY",
          privacyLevel: state.privacyLevel,
          coverageRangeMeters: state.rangeMeters,
          dataRetentionPref: state.dataRetentionPref || "24h"
        },
        analyticsSummary: {
          maxScanningIntensityUnits: Math.max(...signalHistoryData.map(d => d.intensity)),
          avgShieldProtectionPercentage: Math.round(signalHistoryData.reduce((acc, d) => acc + d.shielding, 0) / signalHistoryData.length),
          totalLogsRecorded: logs.length
        },
        signalHistoryWaveforms: signalHistoryData,
        activityLogs: logs,
        cryptographicProof: {
          signatureAlgorithm: "ECDSA_P256_SHA256",
          integritySignature: "ECDSA_SHA256_FINGERPRINT_" + (state.anonymousId || "0xFE69") + "_" + Date.now(),
          verificationToken: Math.random().toString(36).substring(2).toUpperCase() + "_AUTHENTICATED_AUDIT_PROOF",
          certifiedBy: "BlurBubble Decentralized Privacy Shield Core v2.4"
        }
      };

      const jsonStr = JSON.stringify(reportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blurbubble_signal_history_audit_report_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onAddLog) {
        onAddLog({
          deviceModel: 'SIGNAL_HISTORY_AUDIT_ENGINE',
          action: 'censored',
          shieldApplied: 'SIGNED_JSON_AUDIT_REPORT_EXPORTED',
          distance: state.rangeMeters,
          rotatedId: 'REPORT_' + Math.random().toString(36).substring(2, 8).toUpperCase()
        });
      }

      if (onTriggerAlert) {
        onTriggerAlert(
          'üìú AUDIT REPORT EXPORTED',
          'Your signed signal history and shield activity logs have been saved as a cryptographically verifiable JSON report.',
          'blocking'
        );
      }
    } catch (e) {
      console.error('Failed to export signal history report:', e);
    }
  };

  const generateDailySummaryEmailHtml = (recipient: string, reportTime: string, reportType: 'standard' | 'forensic'): string => {
    const totalCensors = logs.filter(l => l.action === 'censored').length;
    const totalDetections = logs.filter(l => l.action === 'discovered' || l.action === 'erased').length;
    const averageDistance = logs.length > 0 
      ? (logs.reduce((acc, curr) => acc + curr.distance, 0) / logs.length).toFixed(1)
      : '0.0';
    
    const latestLogsHtml = logs.slice(0, 5).map(log => `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 10px 8px; font-family: monospace; color: #94a3b8; font-size: 11px;">${log.timestamp}</td>
        <td style="padding: 10px 8px; color: #ffffff; font-size: 12px; font-weight: bold;">${log.deviceModel}</td>
        <td style="padding: 10px 8px; font-size: 11px; font-weight: bold; color: ${log.action === 'censored' ? '#f87171' : '#34d399'}">${log.action.toUpperCase()}</td>
        <td style="padding: 10px 8px; color: #cbd5e1; font-size: 12px;">${log.shieldApplied}</td>
        <td style="padding: 10px 8px; font-family: monospace; color: #94a3b8; font-size: 11px; text-align: right;">${log.distance.toFixed(1)}m</td>
      </tr>
    `).join('');

    const isForensic = reportType === 'forensic';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BlurBubble‚Ñ¢ Daily Privacy Summary</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px; border-bottom: 2px solid #10b981; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; tracking-tight: -0.025em; letter-spacing: -0.5px;">BLURBUBBLE‚Ñ¢ PRIVACY SHIELD</h1>
                    <p style="margin: 4px 0 0 0; color: #10b981; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">DAILY SECURED COMPLIANCE REPORT</p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 24px;">üõ°Ô∏è</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Summary Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin-top: 0; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                Hello, <strong>${recipient.split('@')[0]}</strong>. Below is your automated localized daily privacy summary from your active <strong>BlurBubble‚Ñ¢ Shield Node</strong>.
              </p>
              
              <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; margin-bottom: 15px; color: #f8fafc; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #374151; padding-bottom: 8px;">
                  üõ°Ô∏è 24-Hour Privacy Telemetry
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="33%" align="center" style="padding: 10px 0; border-right: 1px solid #374151;">
                      <div style="font-size: 26px; font-weight: 800; color: #ef4444; margin-bottom: 4px;">${totalCensors}</div>
                      <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Active Censors</div>
                    </td>
                    <td width="33%" align="center" style="padding: 10px 0; border-right: 1px solid #374151;">
                      <div style="font-size: 26px; font-weight: 800; color: #10b981; margin-bottom: 4px;">${totalDetections}</div>
                      <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Detections</div>
                    </td>
                    <td width="34%" align="center" style="padding: 10px 0;">
                      <div style="font-size: 26px; font-weight: 800; color: #60a5fa; margin-bottom: 4px;">${averageDistance}m</div>
                      <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Avg. Distance</div>
                    </td>
                  </tr>
                </table>
              </div>

              ${isForensic ? `
              <!-- Forensic Insights -->
              <div style="border-left: 3px solid #6366f1; background-color: rgba(99, 102, 241, 0.05); padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 5px 0; color: #818cf8; font-size: 12px; text-transform: uppercase; font-weight: bold; font-family: monospace;">[FORENSIC ANALYSIS MODE]</h4>
                <p style="margin: 0; color: #cbd5e1; font-size: 12px; line-height: 1.5;">
                  <strong>RF Signal Footprint:</strong> Real-time phase shift triangulation indicates that 74% of signals were directional smart glasses, and 26% were wide-angle security drones. Local spatial privacy remains uncompromised. Temporal rotation keys were cycled ${Math.floor(logs.length / 3) + 1} times to prevent longitudinal profiling.
                </p>
              </div>
              ` : ''}

              <!-- Recent Incidents Table -->
              <h3 style="color: #f8fafc; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                üö® Latest Interceptions
              </h3>
              ${logs.length > 0 ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #334155; text-align: left;">
                    <th style="padding: 8px; color: #94a3b8; font-size: 10px; text-transform: uppercase;">Time</th>
                    <th style="padding: 8px; color: #94a3b8; font-size: 10px; text-transform: uppercase;">Device</th>
                    <th style="padding: 8px; color: #94a3b8; font-size: 10px; text-transform: uppercase;">Action</th>
                    <th style="padding: 8px; color: #94a3b8; font-size: 10px; text-transform: uppercase;">Shielding</th>
                    <th style="padding: 8px; color: #94a3b8; font-size: 10px; text-transform: uppercase; text-align: right;">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  ${latestLogsHtml}
                </tbody>
              </table>
              ` : `
              <div style="border: 1px dashed #334155; padding: 25px; text-align: center; border-radius: 12px; color: #64748b; font-size: 13px; margin-bottom: 25px;">
                No active threat devices detected or logs generated in the last 24 hours. Safe boundaries maintained!
              </div>
              `}

              <!-- Legal & compliance -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1e293b; padding-top: 20px;">
                <tr>
                  <td>
                    <h4 style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Node Compliance Matrix</h4>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 10px; line-height: 1.4; font-style: italic;">
                      This notification was dispatched securely in an encrypted payload. Real-time logging conforms to localized opt-out regulations (RFC-9402). Your physical identity is masked, protected, and fully private in real-time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0d121f; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #475569; font-size: 10px;">
                ¬© 2026 BlurBubble Spatial Defense Technologies. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; color: #475569; font-size: 9px;">
                Secure local link: <a href="https://blurbubble.org" style="color: #10b981; text-decoration: none;">https://blurbubble.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleSimulateSendReport = () => {
    setIsSendingReportSimulation(true);
    setReportSimulationSuccess(false);
    
    setTimeout(() => {
      setIsSendingReportSimulation(false);
      setReportSimulationSuccess(true);
      
      if (onAddLog) {
        onAddLog({
          deviceModel: 'SYSTEM_REPORT_DAEMON',
          action: 'censored',
          shieldApplied: `DAILY SECURITY REPORT DISPATCHED TO ${emailRecipient}`,
          distance: 0,
          rotatedId: `MSG-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }

      setTimeout(() => {
        setReportSimulationSuccess(false);
      }, 6000);
    }, 1500);
  };

  // Signal History Data Generator for recharts
  const signalHistoryData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const timePoint = new Date(now.getTime() - i * 5 * 60 * 1000);
      const label = `${i === 0 ? 'Now' : `-${i * 5}m`}`;
      const timeMs = timePoint.getTime();
      const waveVal = Math.sin(timeMs / (10 * 60 * 1000));
      const noise = Math.sin(timeMs / (2 * 60 * 1000)) * 0.3 + 0.5;
      
      let baseIntensity = 5;
      if (state.isBroadcasting) {
        baseIntensity = Math.round(15 + waveVal * 8 + noise * 4);
      } else {
        baseIntensity = Math.round(6 + waveVal * 3 + noise * 2);
      }
      
      const logBonus = Math.min(10, logs.length);
      const finalIntensity = Math.max(1, baseIntensity + logBonus);
      
      const finalShielding = state.isBroadcasting 
        ? Math.max(85, Math.round(96 + waveVal * 2 + noise))
        : Math.max(0, Math.round(12 + waveVal * 5 + noise * 3));
        
      data.push({
        time: label,
        timestamp: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intensity: finalIntensity,
        shielding: finalShielding,
      });
    }
    return data;
  }, [state.isBroadcasting, logs.length]);

  // Face Photo Database Helpers
  const handleAddFace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaceName.trim()) return;

    const newFace: FaceRecord = {
      id: 'face-' + Date.now(),
      name: newFaceName,
      photoUrl: newFacePhoto,
      isRegistered: true,
      confidenceScore: 0.9 + Math.random() * 0.09 // 0.90 to 0.99
    };

    onChange({
      ...state,
      registeredFaces: [...state.registeredFaces, newFace]
    });
    setNewFaceName('');
  };

  const handleDeleteFace = (id: string) => {
    onChange({
      ...state,
      registeredFaces: state.registeredFaces.filter(face => face.id !== id)
    });
  };

  const handleToggleFaceStatus = (id: string) => {
    onChange({
      ...state,
      registeredFaces: state.registeredFaces.map(face => 
        face.id === id ? { ...face, isRegistered: !face.isRegistered } : face
      )
    });
  };

  const privacyOptions: { value: PrivacyLevel; label: string; desc: string; icon: React.ReactNode; colorClass: string }[] = [
    {
      value: 'magic_removal',
      label: 'Generative AI Removal (Magic Eraser)',
      desc: 'Removes your face/body completely from frames using local real-time fill',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      colorClass: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 focus:ring-emerald-500'
    },
    {
      value: 'strict_blur',
      label: 'Strict Blur Filter',
      desc: 'Enforces dense high-radius blur over entire body profile',
      icon: <EyeOff className="w-5 h-5 text-red-400" />,
      colorClass: 'border-red-500/40 bg-red-950/20 text-red-400 focus:ring-red-500'
    },
    {
      value: 'pixelate',
      label: '8-Bit Pixelation Shield',
      desc: 'Slightly stylized 8-bit dynamic pixelation blocks over your face',
      icon: <Layers className="w-5 h-5 text-amber-400" />,
      colorClass: 'border-amber-500/40 bg-amber-950/20 text-amber-400 focus:ring-amber-500'
    },
    {
      value: 'emoji',
      label: 'Interactive Avatar Overlay',
      desc: 'Overlays a dynamic privacy shield avatar above your posture',
      icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
      colorClass: 'border-blue-500/40 bg-blue-950/20 text-blue-400 focus:ring-blue-500'
    },
    {
      value: 'black_bar',
      label: 'Censored Eyes Bar',
      desc: 'Traditional deep-black bar covering eye coordinates',
      icon: <Hash className="w-5 h-5 text-purple-400" />,
      colorClass: 'border-purple-500/40 bg-purple-950/20 text-purple-400 focus:ring-purple-500'
    },
    {
      value: 'none',
      label: 'Opt-In Discovery Active',
      desc: 'Temporarily pauses all shields to broadcast your social discovery links',
      icon: <Smile className="w-5 h-5 text-sky-400" />,
      colorClass: 'border-sky-500/40 bg-sky-950/20 text-sky-400 focus:ring-sky-500'
    }
  ];

const ALL_PRIVACY_MODULES = [
    // Visual Defense
    { id: "overview", label: "Main Privacy Shield", icon: "üõ°Ô∏è", category: "defense", subCategory: "signal", desc: "Central interactive privacy beacon and instant protection status", status: state.isBroadcasting ? "ACTIVE" : "STANDBY" },
    { id: "signal", label: "Shield Broadcast Range", icon: "üì°", category: "defense", subCategory: "signal", desc: "Adjust Bluetooth/RF opt-out signal propagation distance (1-50m)", status: (state.rangeMeters || 12) + "m" },
    { id: "faces", label: "My Blurred Faces", icon: "üë§", category: "defense", subCategory: "identity", desc: "Register face profiles for AI camera recognition opt-out", count: state.registeredFaces?.length || 0 },
    { id: "tags", label: "Protected Bags & Devices", icon: "üéí", category: "defense", subCategory: "identity", desc: "Attach privacy tags to backpacks, phones, and wearables", count: state.registeredEntities?.length || 0 },
    { id: "google_maps_radar", label: "Google Maps Privacy Radar", icon: "üó∫Ô∏è", category: "defense", subCategory: "signal", desc: "Spatial Google Maps view with camera threat markers & safe perimeters", status: "RADAR" },
    { id: "apple_maps_radar", label: "Apple Maps Privacy Shield", icon: "üçè", category: "defense", subCategory: "signal", desc: "Vector Apple Maps radar with Look Around 360¬∞ street view blur", status: "MAPKIT" },
    { id: "experimental", label: "Experimental Countermeasures", icon: "üß™", category: "defense", subCategory: "identity", desc: "FLIR thermal pulse, retroreflective optical scramblers & LiDAR flood", status: (state.thermalPulseEnabled || state.antiLipReadingEnabled) ? "ACTIVE" : "STANDBY" },

    // Acoustic & Audio Defense
    { id: "targeted", label: "Targeted Audio Defenses", icon: "üîä", category: "acoustic", subCategory: "acoustic", desc: "Directional acoustic shielding to protect yourself without disrupting others", status: state.targetedShieldingEnabled ? "TARGETED" : "BLANKET" },
    { id: "audio_shield", label: "Acoustic Shield Settings", icon: "üéôÔ∏è", category: "acoustic", subCategory: "acoustic", desc: "Vocal Scrambler, inaudible watermarking & ultrasonic mic saturation", status: state.vocalScramblerEnabled ? "SCRAMBLING" : "OFF" },
    { id: "audio_map", label: "Audio Blind Spot Map", icon: "üó∫Ô∏è", category: "acoustic", subCategory: "acoustic", desc: "Map acoustic coverage shadows and microphone interference spheres", status: "SCANNER" },
    { id: "audio_scrub", label: "Podcast Voice Scrubber", icon: "üìª", category: "acoustic", subCategory: "acoustic", desc: "Automated takedown requests for voice recordings on audio streams", count: audioTakedowns?.length || 0 },

    // Rules & Spatial Policies
    { id: "perimeter", label: "Safe School Zones & Geofence", icon: "üìç", category: "rules", subCategory: "signal", desc: "Automated privacy shields when entering custom map coordinates", count: perimeterSensors?.length || 0 },
    { id: "hierarchy", label: "Rule Priority Hierarchy", icon: "‚öñÔ∏è", category: "rules", subCategory: "signal", desc: "Conflict resolution engine: define which safety rules take priority" },
    { id: "wifi", label: "Home & Work WiFi Triggers", icon: "üì∂", category: "rules", subCategory: "signal", desc: "Switch shield modes automatically upon connecting to trusted networks", status: state.wifiRulesEnabled ? "AUTO" : "OFF" },
    { id: "biometric", label: "Lock My App (Passkey)", icon: "üîí", category: "rules", subCategory: "identity", desc: "Biometric fingerprint or FaceID lock to prevent unauthorized tampering", status: state.biometricLockEnabled ? "LOCKED" : "OPEN" },
    { id: "settings", label: "Alerts, Sound & Haptics", icon: "‚öôÔ∏è", category: "rules", subCategory: "system", desc: "Customize tactile vibrations, audible alerts, and notifications" },

    // Hardware, Legal & Compliance
    { id: "licensing", label: "Safety Lab Certificates", icon: "üìã", category: "hardware", subCategory: "licensing", desc: "Official FCC/CE RF safety certificates and radiation test reports", count: state.hardwareLicenses?.length || 0 },
    { id: "retention", label: "Zero Data Retention", icon: "üíæ", category: "hardware", subCategory: "retention", desc: "Configure automatic cryptographic purging of past logs and tokens" },
    { id: "escrow", label: "Warrant Escrow Keys", icon: "üîë", category: "hardware", subCategory: "escrow", desc: "Review emergency split-key cryptographic escrow under legal warrant", count: escrowHolders?.length || 0 },
    { id: "pairing", label: "Hardware Key Pairing", icon: "üîå", category: "hardware", subCategory: "pairing", desc: "Pair physical Bluetooth fobs, buttons, or badges to trigger sweeps", count: state.registeredEntities?.filter((e: any) => e.type === "smart_tag" || e.type === "key_fob" || e.type === "airtag" || e.type === "galaxy_tag").length || 0 },
    { id: "scrub", label: "Video Database Takedowns", icon: "üé¨", category: "hardware", subCategory: "scrub", desc: "Automated RFC-9402 face removal requests on public video databases", count: takedowns?.length || 0 },
    { id: "legal", label: "Privacy Rights Quiz", icon: "üìñ", category: "hardware", subCategory: "legal", desc: "Interactive educational quiz on camera surveillance laws and legal rights" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {/* Coercion Defense System Wipe Overlay */}
      <AnimatePresence>
        {coercionWipeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="max-w-md space-y-6">
              <div className="relative flex h-16 w-16 mx-auto items-center justify-center bg-red-500/10 border-2 border-red-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-widest text-red-500 uppercase font-mono">COERCION DEFENSE PROTOCOL ACTIVE</h3>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Zero-delay panic gesture recognized. Local storage sanitization algorithm executed at level zero.
                </p>
              </div>

              {/* Progress visualizer */}
              <div className="w-64 bg-slate-900 border border-slate-800 rounded-full h-2.5 mx-auto overflow-hidden relative">
                <div className="bg-red-500 h-full animate-pulse" style={{ width: '100%' }}></div>
              </div>

              <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl text-left font-mono text-[9px] text-red-400/80 space-y-1 max-h-40 overflow-y-auto leading-normal">
                <p>&gt; [SYS_PANIC] G-Force shake or manual override detected...</p>
                <p className="text-white">&gt; [OK] Wiping private key material from RAM...</p>
                <p className="text-white">&gt; [OK] Nullifying all face hashes (state.registeredFaces)...</p>
                <p className="text-white">&gt; [OK] Sanitizing SSID automation rules...</p>
                <p className="text-white">&gt; [OK] Overwriting 100% of audit logs with cryptographic garbage...</p>
                <p className="text-white">&gt; [OK] Unbonding nearby Bluetooth beacons...</p>
                <p className="text-red-500 font-bold">&gt; [SECURE] DEVICE RETURNING TO ABSOLUTE STEALTH STATE ZERO.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeHelpAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative overflow-hidden"
            >
              {/* Pulsing Visual Glow overlay inside the alert */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-red-500/10 animate-pulse pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-5">
                {/* Visual Glow Alarm light */}
                <div className="relative flex h-16 w-16 items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-full animate-bounce">
                  <BellRing className="w-8 h-8 text-amber-400 animate-pulse" />
                  <span className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-60" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
                    üö® SOS Beacon Triggered
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Active Assistance Request</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    A physical alert button was pressed on one of your family tags. Your son needs help!
                  </p>
                </div>

                {/* Device Signal Context */}
                <div className="w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-left space-y-2 font-sans text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Active Beacon</span>
                    <span className="text-amber-400 font-bold font-mono">In Range</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tag Name:</span>
                    <span className="font-bold text-white">{activeHelpAlert.tagName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Logged:</span>
                    <span className="font-mono text-slate-300 font-bold">{activeHelpAlert.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alert Priority:</span>
                    <span className="text-rose-400 font-bold uppercase animate-pulse">Critical High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Action:</span>
                    <span className="text-emerald-400 font-semibold font-mono">Broadcasting Max Obfuscation</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      // Apply extreme privacy protection instantly
                      onChange({
                        ...state,
                        privacyLevel: 'strict_blur',
                        emergencyPrivacyActive: true,
                        isBroadcasting: true
                      });
                      setActiveHelpAlert(null);
                      // Log this emergency event
                      window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                        detail: { 
                          title: "üõ°Ô∏è MAXIMUM OBFUSCATION ENGAGED", 
                          body: `Emergency response active! Applied forced strict blur to safeguard surrounding vicinity of ${activeHelpAlert.tagName}.`,
                          type: 'child_blocking' 
                        } 
                      }));
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl transition shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Engage Maximum Privacy Shield
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveHelpAlert(null)}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    Silence &amp; Dismiss Alarm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      <div className={`${(state.showAuditLogs || (state.privacyLevel === 'none' && state.isBroadcasting)) ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          


          

          {/* Top Header & Navigation Switcher */}
          {activeTab === "overview" ? (
            /* Streamlined Privacy Shield Bar on Landing Page */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 mb-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${state.isBroadcasting ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]" : "bg-slate-900 text-slate-500 border-slate-800"}`}>
                  <Radio className={`w-4 h-4 ${state.isBroadcasting ? "animate-pulse" : ""}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Privacy Shield Controller
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${state.isBroadcasting ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-slate-850 text-slate-400 border-slate-750"}`}>
                      {state.isBroadcasting ? "TRANSMITTING" : "STANDBY"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>ID: <span className="text-slate-300">{state.anonymousId?.slice(0, 8) || "0xA8F9"}...</span></span>
                    <span>‚Ä¢</span>
                    <span>Range: <span className="text-emerald-400 font-bold">{state.rangeMeters || 12}m</span></span>
                    <span>‚Ä¢</span>
                    <span className="capitalize text-slate-300">{state.privacyLevel?.replace("_", " ") || "Strict Blur"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Customize Dashboard Widgets Toggle */}
                <button
                  type="button"
                  onClick={() => setShowWidgetCustomizer(!showWidgetCustomizer)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    showWidgetCustomizer || enabledWidgetIds.length > 0
                      ? "bg-slate-850 text-slate-200 border-slate-700"
                      : "bg-slate-950/60 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-750"
                  }`}
                  title="Toggle optional dashboard widgets (Score, History, Battery, Map)"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">Dashboard Widgets</span>
                  {enabledWidgetIds.length > 0 && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-500/30">
                      {enabledWidgetIds.length}
                    </span>
                  )}
                </button>

                {/* Primary Tools & Features Menu Trigger */}
                <button
                  id="open-privacy-tools-menu-btn"
                  type="button"
                  onClick={() => setIsToolsMenuOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition font-mono uppercase tracking-wider cursor-pointer"
                  title="Open full menu with all 20+ Privacy Tools & Features"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tools &amp; Menus</span>
                  <span className="text-[9px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-black">20+</span>
                </button>
              </div>
            </div>
          ) : (
            /* Secondary Tab Navigation Bar with Quick Return to Shield */
            <div className="mb-6 space-y-4">
              {/* Back to Privacy Shield Return Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  id="back-to-shield-widget-btn"
                  onClick={() => {
                    setActiveTab("overview");
                    if (externalOnTabChange) externalOnTabChange("overview");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>‚Üê Back to Privacy Shield</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Active Module:</span>
                  <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                    {ALL_PRIVACY_MODULES.find(m => m.id === activeTab)?.icon} {ALL_PRIVACY_MODULES.find(m => m.id === activeTab)?.label || activeTab}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsToolsMenuOpen(true)}
                    className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer ml-1"
                  >
                    (All Menus)
                  </button>
                </div>
              </div>

              {/* Category Selection Tabs */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "compliance", label: "Safe & Legal Rules", icon: "üé¨" },
                  { id: "rules", label: "When to Block", icon: "‚öñÔ∏è" },
                  { id: "defense", label: "My Personal Shield", icon: "üõ°Ô∏è" },
                  { id: "hardware", label: "My Connected Gear", icon: "üîå" }
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                        setDefenseSubCategory("all");
                        const firstTabMap: Record<string, string> = {
                          compliance: "legal",
                          rules: "perimeter",
                          defense: "overview",
                          hardware: "licensing"
                        };
                        setActiveTab(firstTabMap[cat.id] as any);
                      }}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-slate-900 border-slate-700 text-white shadow-sm"
                          : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="text-sm select-none">{cat.icon}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Defense Category Sub-Navigation Switcher */}
              {selectedCategory === "defense" && (
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Filter Shield Controls by Sub-Category
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/20">
                      QUICK CATEGORIES
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: "all", label: "All Controls", icon: <Layers className="w-3.5 h-3.5" />, desc: "9 items" },
                      { id: "signal", label: "Signal & WiFi", icon: <Radio className="w-3.5 h-3.5" />, desc: "3 items" },
                      { id: "acoustic", label: "Sound & Audio", icon: <Volume2 className="w-3.5 h-3.5" />, desc: "3 items" },
                      { id: "identity", label: "Identity", icon: <User className="w-3.5 h-3.5" />, desc: "2 items" },
                      { id: "system", label: "Settings", icon: <Settings2 className="w-3.5 h-3.5" />, desc: "1 item" }
                    ].map((sub) => {
                      const isActive = defenseSubCategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          id={`defense-subcat-${sub.id}-btn`}
                          type="button"
                          onClick={() => {
                            setDefenseSubCategory(sub.id as any);
                            playLocalSoundTest("tactical_click", 50);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                              : "bg-slate-900/30 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {sub.icon}
                            <span className="text-[10px] font-bold block leading-none">{sub.label}</span>
                          </div>
                          <span className="text-[8px] text-slate-500 font-sans mt-0.5 block font-mono">{sub.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Feature Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {ALL_PRIVACY_MODULES
                  .filter((item) => {
                    if (selectedCategory === "compliance") return item.id === "legal" || item.id === "scrub" || item.id === "audio_scrub";
                    if (selectedCategory === "rules") return item.id === "perimeter" || item.id === "hierarchy" || item.id === "biometric";
                    if (selectedCategory === "hardware") return item.id === "licensing" || item.id === "retention" || item.id === "escrow" || item.id === "pairing";
                    if (selectedCategory === "defense") {
                      if (defenseSubCategory === "all") return true;
                      return item.subCategory === defenseSubCategory;
                    }
                    return true;
                  })
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-950/20 border-emerald-500/50 text-white shadow-md shadow-emerald-950/10"
                            : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white hover:bg-slate-950/80"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base select-none">{item.icon}</span>
                          {item.count !== undefined && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                            }`}>
                              {item.count}
                            </span>
                          )}
                          {item.status !== undefined && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono tracking-wider ${
                              item.status === "ACTIVE" || item.status === "AUTO" || item.status === "RADAR"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold leading-tight block">{item.label}</span>
                        <span className="text-[9px] text-slate-500 leading-normal block mt-0.5 truncate w-full">{item.desc}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          {/* Quick Context-Aware Helper Tip */}
          {showContextHelp && (
            <div className="flex items-start justify-between gap-3.5 p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl relative shadow-md shadow-emerald-950/5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-sans block">Smart Assistant Tip</span>
                  <p className="text-xs text-slate-300 leading-relaxed pr-6">
                                        {activeTab === 'targeted' && "Configure targeted sound cancellation, biometric audio watermarking, and next-gen companion wearables."}
                    {activeTab === 'audio_shield' && "Replicate visual shield rules in the acoustic domain: toggle watermarking, mic saturation, and vocal scrambling per profile or device."}
                    {activeTab === 'settings' && "Configure haptic pocket pulses, audible alarm chirps, and dynamic push notifications."}
                    {activeTab === 'signal' && "Set your custom localized privacy boundary radius. Controls how far your refusing signal propagates."}
                    {activeTab === 'faces' && "Add face profiles for advanced optical recognition refusal to automatically apply camera-side overlays."}
                    {activeTab === 'tags' && "Register cryptographic metadata tags for backpacks, wallets, or briefcases to keep personal items obscured."}
                    {activeTab === 'wifi' && "Automate your defense configurations. Instantly transitions shield profiles when connecting to recognized SSIDs."}
                    {activeTab === 'hierarchy' && "Sort your policy rules to resolve active priority conflicts when multiple conditions are met."}
                    {activeTab === 'perimeter' && "Mark physical coordinates on a map to establish geo-fenced safe zones where shield is automated."}
                    {activeTab === 'biometric' && "Arm local biometric credentials (TouchID/FaceID) to prevent device tampering or forced deactivation."}
                    {activeTab === 'pairing' && "Bond physical smart keychains or active buttons to trigger instantaneous privacy sweeps."}
                    {activeTab === 'licensing' && "Verify official regulatory compliance certificates proving the safe operational standard of your device."}
                    {activeTab === 'escrow' && "View encrypted escrow keys held under legal warrant for emergency situational safety bypasses."}
                    {activeTab === 'retention' && "Establish secure memory scrubbing policies to automatically purge localized telemetry records."}
                    {activeTab === 'scrub' && "Initiate automatic face-obscuration requests on third-party video platforms and public streams."}
                    {activeTab === 'audio_scrub' && "Initiate automatic voice-print scrubbing and retroactive muting requests on popular podcast and audio stream databases."}
                    {activeTab === 'audio_map' && "Visualize local acoustic blind spots and saturation coverage spheres created by surrounding walls or interference."}
                    {activeTab === 'legal' && "Take a quick educational quiz to learn about local privacy laws, camera regulations, and legal rights."}
                    {activeTab === 'experimental' && "Activate and simulate speculative, next-gen privacy countermeasures (FLIR masking, Retroreflective lenses, LiDAR noise) and check real-world hardware compatibility."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContextHelp(false)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-900/40 text-xs self-start shrink-0"
                title="Hide helper tip"
              >
                ‚úï
              </button>
            </div>
          )}

          {/* Tab 0: Overview Dashboard & Layout Configuration */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Active Threat Intercept Banner */}
              <AnimatePresence>
                {activeThreatIntercept && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 text-xs transition duration-300 ${
                      isShieldReinforced 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isShieldReinforced ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold uppercase tracking-wider">
                            {isShieldReinforced ? 'üîí PERIMETER DEFENSES REINFORCED' : '‚ö†Ô∏è SPATIAL THREAT INTERCEPTED'}
                          </p>
                          <p className="text-slate-400 font-sans mt-0.5 leading-normal text-[11px]">
                            {isShieldReinforced 
                              ? `Active phase shield overload activated! Nearby ${activeThreatIntercept.target} successfully blinded.`
                              : `Targeted facial-recognition scan from nearby ${activeThreatIntercept.target} at ${activeThreatIntercept.distance}m.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        {!isShieldReinforced ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsShieldReinforced(true);
                              onAddLog({
                                deviceModel: activeThreatIntercept.target,
                                action: 'deflected',
                                shieldApplied: 'DEFENSIVE_SHIELD_OVERLOAD_EMERALD_REINFORCE',
                                distance: activeThreatIntercept.distance,
                                rotatedId: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase()
                              });
                              setTimeout(() => {
                                setIsShieldReinforced(false);
                                setActiveThreatIntercept(null);
                              }, 5000);
                            }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition uppercase tracking-wider text-[10px] cursor-pointer shadow-md shadow-red-500/15"
                          >
                            REINFORCE SHIELD
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest bg-emerald-950 px-2 py-1 rounded border border-emerald-500/30">
                            SHIELD POWER: 150%
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveThreatIntercept(null)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              
              {/* Comprehensive Central Privacy Shield Widget */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-2xl backdrop-blur-sm space-y-6">
                
                {/* Top Status & Telemetry Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-850 text-[10px] font-mono">
                      <span className={`w-2 h-2 rounded-full ${state.isBroadcasting ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`}></span>
                      <span className="text-slate-400 font-bold uppercase">Shield Status:</span>
                      <span className={state.isBroadcasting ? "text-emerald-400 font-bold" : "text-slate-500 font-semibold"}>
                        {state.isBroadcasting ? "TRANSMITTING ‚Ä¢ ENCRYPTED" : "STANDBY ‚Ä¢ SILENT"}
                      </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-850 text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500">BEACON ID:</span>
                      <span className="text-slate-200 font-bold">{state.anonymousId || "0xA8F9E13C"}</span>
                    </div>
                  </div>

                  {/* Quick Power Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !state.isBroadcasting;
                      onChange({ ...state, isBroadcasting: next });
                      playLocalSoundTest("tactical_click", 50);
                      if (onAddLog) {
                        onAddLog({
                          deviceModel: "Privacy Beacon",
                          action: next ? "deflected" : "detected",
                          shieldApplied: next ? "SHIELD_ACTIVATED" : "SHIELD_SILENCED",
                          distance: state.rangeMeters || 12,
                          rotatedId: state.anonymousId || "0xA8F9"
                        });
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                      state.isBroadcasting
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{state.isBroadcasting ? "Silence Beacon" : "Activate Shield"}</span>
                  </button>
                </div>

                {/* Central Interactive Shield Emblem */}
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                  <div className="relative">
                    <button
                      type="button"
                      id="central-privacy-shield-beacon"
                      onPointerDown={handleLogoPointerDown}
                      onPointerUp={handleLogoPointerUpOrLeave}
                      onPointerLeave={handleLogoPointerUpOrLeave}
                      className="relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-pointer group"
                      title={
                        state.isBroadcasting 
                          ? "Privacy Shield is ACTIVE ‚Ä¢ Press and Hold to Deactivate" 
                          : "Privacy Shield is SILENT ‚Ä¢ Quick Tap to Activate"
                      }
                    >
                      {/* Glowing Shield Ring & Radiating Radar Ripples when broadcasting */}
                      {state.isBroadcasting ? (
                        <>
                          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                          <div className="absolute -inset-4 rounded-full border border-emerald-500/35 animate-ping opacity-75" style={{ animationDuration: "3s" }}></div>
                          <div className="absolute -inset-8 rounded-full border border-emerald-400/20 animate-ping opacity-50" style={{ animationDuration: "3s", animationDelay: "1.2s" }}></div>
                        </>
                      ) : (
                        <div className="absolute inset-0 rounded-full bg-slate-800/10 blur-xl"></div>
                      )}

                      {/* Circular Hold Progress Ring Overlay */}
                      {isHoldingLogo && (
                        <svg className="absolute inset-0 w-28 h-28 z-20 -rotate-90 pointer-events-none scale-105">
                          <circle
                            cx="56"
                            cy="56"
                            r="52"
                            fill="transparent"
                            stroke="rgba(244, 63, 94, 0.2)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="52"
                            fill="transparent"
                            stroke="#f43f5e"
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 52}
                            strokeDashoffset={2 * Math.PI * 52 * (1 - logoHoldProgress)}
                            className="transition-all duration-75"
                          />
                        </svg>
                      )}

                      <div className={`w-28 h-28 rounded-full border-2 p-1.5 overflow-hidden relative z-10 transition-all duration-300 ${
                        state.isBroadcasting 
                          ? isHoldingLogo
                            ? "border-rose-500 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-95"
                            : "border-emerald-500 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-105 group-hover:scale-110"
                          : "border-slate-800 bg-slate-900 scale-100 group-hover:scale-105 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      }`}>
                        <img
                          src={appLogo}
                          alt="Privacy Beacon Logo"
                          className={`w-full h-full rounded-full object-cover transition-transform duration-500 ${
                            state.isBroadcasting && !isHoldingLogo ? "scale-105 animate-pulse" : "scale-100"
                          }`}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Overlapping Broadcasting Radio Badge */}
                      <div className={`absolute -bottom-1 -right-1 z-20 p-2 rounded-full border-2 border-slate-950 transition-all duration-300 ${
                        state.isBroadcasting 
                          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-bounce"
                          : "bg-slate-800 text-slate-500 shadow-none"
                      }`}>
                        <Radio className={`w-4 h-4 ${state.isBroadcasting && !isHoldingLogo ? "animate-pulse" : ""}`} />
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white tracking-tight">
                      {state.isBroadcasting ? "Privacy Shield Active" : "Privacy Shield Standby"}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {state.isBroadcasting 
                        ? "Broadcasting encrypted opt-out telemetry (RFC-9402). Nearby smart glasses, AI cameras, and acoustic pods are forbidden from capturing or storing your identity."
                        : "Beacon is in low-power standby mode. Tap the emblem or click Activate to broadcast localized privacy protection."}
                    </p>
                    
                    {/* Dynamic Gesture Hint */}
                    <div className="pt-1 h-5 flex items-center justify-center">
                      {isHoldingLogo ? (
                        <span className="text-[10px] font-bold text-rose-400 tracking-wider animate-pulse font-mono uppercase">
                          Silencing Shield... {Math.round(logoHoldProgress * 100)}%
                        </span>
                      ) : state.isBroadcasting ? (
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Press &amp; Hold Emblem to Deactivate
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-emerald-400/90 tracking-wider uppercase animate-pulse">
                          Tap Emblem to Activate Shield
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tactical Dropdown Controls Bar & Toggles Menu */}
                <div className="pt-2 border-t border-slate-900/90 space-y-3">
                  {/* Dropdown Action Buttons Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    
                    {/* 1. Visual Obfuscation Dropdown Trigger */}
                    <button
                      type="button"
                      id="dropdown-trigger-obfuscation"
                      onClick={() => {
                        setActiveShieldDropdown(activeShieldDropdown === "obfuscation" ? "none" : "obfuscation");
                        playLocalSoundTest("tactical_click", 50);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeShieldDropdown === "obfuscation"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Visual Mode</span>
                          <span className="text-xs font-bold text-white truncate block capitalize">
                            {state.privacyLevel === "strict_blur" && "üõ°Ô∏è Strict Blur"}
                            {state.privacyLevel === "magic_removal" && "ü™Ñ Magic Removal"}
                            {state.privacyLevel === "pixelate" && "üî≤ Pixelate"}
                            {state.privacyLevel === "black_bar" && "‚¨õ Black Bar"}
                            {state.privacyLevel === "emoji" && "üòä Emoji Mask"}
                            {state.privacyLevel === "custom_avatar" && "üé≠ Custom Avatar"}
                            {(!state.privacyLevel || state.privacyLevel === "none") && "üõ°Ô∏è Strict Blur"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeShieldDropdown === "obfuscation" ? "rotate-180 text-emerald-400" : ""}`} />
                    </button>

                    {/* 2. Broadcast Range Dropdown Trigger */}
                    <button
                      type="button"
                      id="dropdown-trigger-range"
                      onClick={() => {
                        setActiveShieldDropdown(activeShieldDropdown === "range" ? "none" : "range");
                        playLocalSoundTest("tactical_click", 50);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeShieldDropdown === "range"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Shield Radius</span>
                          <span className="text-xs font-bold text-white truncate block font-mono">
                            {state.rangeMeters || 12}m (~{Math.round((state.rangeMeters || 12) * 3.28)} ft)
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeShieldDropdown === "range" ? "rotate-180 text-emerald-400" : ""}`} />
                    </button>

                    {/* 3. Defenses & Toggles Dropdown Trigger */}
                    <button
                      type="button"
                      id="dropdown-trigger-toggles"
                      onClick={() => {
                        setActiveShieldDropdown(activeShieldDropdown === "toggles" ? "none" : "toggles");
                        playLocalSoundTest("tactical_click", 50);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeShieldDropdown === "toggles"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Defenses &amp; Toggles</span>
                          <span className="text-xs font-bold text-white truncate block">
                            {[
                              state.vocalScramblerEnabled,
                              state.facialRecognitionOptOut,
                              state.acousticWatermarkingEnabled,
                              state.targetedShieldingEnabled
                            ].filter(Boolean).length} Active Modules
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeShieldDropdown === "toggles" ? "rotate-180 text-emerald-400" : ""}`} />
                    </button>

                    {/* 4. Quick Defense Presets Trigger */}
                    <button
                      type="button"
                      id="dropdown-trigger-presets"
                      onClick={() => {
                        setActiveShieldDropdown(activeShieldDropdown === "presets" ? "none" : "presets");
                        playLocalSoundTest("tactical_click", 50);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeShieldDropdown === "presets"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Defense Presets</span>
                          <span className="text-xs font-bold text-white truncate block">
                            Max Cloak, Transit, Office
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeShieldDropdown === "presets" ? "rotate-180 text-emerald-400" : ""}`} />
                    </button>

                  </div>

                  {/* Active Dropdown Popover Menus */}
                  <AnimatePresence>
                    {activeShieldDropdown !== "none" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="p-4 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3"
                      >
                        {/* Visual Obfuscation Menu */}
                        {activeShieldDropdown === "obfuscation" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Visual Obfuscation &amp; Camera Masking Mode
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveShieldDropdown("none")}
                                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                Close ‚úï
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {[
                                { id: "strict_blur", label: "Strict Blur", icon: "üõ°Ô∏è", desc: "Gaussian facial & biometric blur" },
                                { id: "magic_removal", label: "Magic Removal", icon: "ü™Ñ", desc: "AI content-aware inpainting erase" },
                                { id: "pixelate", label: "Pixelate", icon: "üî≤", desc: "Digital 8-bit mosaic censorship" },
                                { id: "black_bar", label: "Black Bar", icon: "‚¨õ", desc: "High-contrast eye censorship strip" },
                                { id: "emoji", label: "Emoji Mask", icon: "üòä", desc: "Dynamic friendly emoji replacement" },
                                { id: "custom_avatar", label: "Synthetic Avatar", icon: "üé≠", desc: "Procedural 3D avatar disguise" }
                              ].map((lvl) => {
                                const isActive = (state.privacyLevel || "strict_blur") === lvl.id;
                                return (
                                  <button
                                    key={lvl.id}
                                    type="button"
                                    onClick={() => {
                                      onChange({ ...state, privacyLevel: lvl.id as any });
                                      playLocalSoundTest("tactical_click", 50);
                                      setActiveShieldDropdown("none");
                                    }}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                                      isActive
                                        ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold"
                                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className="text-xl shrink-0 select-none">{lvl.icon}</span>
                                      <div>
                                        <span className="text-xs font-bold block text-white">{lvl.label}</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">{lvl.desc}</span>
                                      </div>
                                    </div>
                                    {isActive && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Shield Broadcast Range Menu */}
                        {activeShieldDropdown === "range" && (
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                                Shield Broadcast Range &amp; Transmission Radius
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveShieldDropdown("none")}
                                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                Close ‚úï
                              </button>
                            </div>

                            {/* Range Presets */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {[
                                { meters: 5, label: "5m Pocket", desc: "Personal Bluetooth aura" },
                                { meters: 10, label: "10m Bubble", desc: "Walking perimeter" },
                                { meters: 12, label: "12m Room", desc: "Standard indoor zone" },
                                { meters: 25, label: "25m Perimeter", desc: "Crowded conference" },
                                { meters: 50, label: "50m Max", desc: "High-power long range" }
                              ].map((preset) => {
                                const isActive = (state.rangeMeters || 12) === preset.meters;
                                return (
                                  <button
                                    key={preset.meters}
                                    type="button"
                                    onClick={() => {
                                      onChange({ ...state, rangeMeters: preset.meters });
                                      playLocalSoundTest("tactical_click", 50);
                                    }}
                                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                                      isActive
                                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)] font-bold"
                                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                    }`}
                                  >
                                    <span className="text-xs font-mono font-bold">{preset.label}</span>
                                    <span className="text-[9px] text-slate-500 block truncate mt-0.5">{preset.desc}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Continuous Precision Slider */}
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Continuous Precision Slider:</span>
                                <span className="text-emerald-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                                  {state.rangeMeters || 12} Meters ({Math.round((state.rangeMeters || 12) * 3.28)} feet)
                                </span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="50"
                                step="1"
                                value={state.rangeMeters || 12}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  onChange({ ...state, rangeMeters: val });
                                }}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                              />
                              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>1m (Pocket)</span>
                                <span>25m (Medium)</span>
                                <span>50m (Max Range)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Defenses & Toggles Menu */}
                        {activeShieldDropdown === "toggles" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                                Active Privacy Defenses &amp; Signal Toggles
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveShieldDropdown("none")}
                                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                Done ‚úì
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Vocal Scrambler */}
                              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Vocal Scrambler</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Micro-shift harmonics against voice biometrics</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onChange({ ...state, vocalScramblerEnabled: !state.vocalScramblerEnabled });
                                    playLocalSoundTest("tactical_click", 50);
                                  }}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                                    state.vocalScramblerEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    state.vocalScramblerEnabled ? "translate-x-5" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>

                              {/* Face Opt-Out */}
                              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                    <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Facial Opt-Out (RFC-9402)</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Opt out of AI facial vision &amp; smart glasses</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onChange({ ...state, facialRecognitionOptOut: !state.facialRecognitionOptOut });
                                    playLocalSoundTest("tactical_click", 50);
                                  }}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                                    state.facialRecognitionOptOut ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    state.facialRecognitionOptOut ? "translate-x-5" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>

                              {/* Acoustic Watermark */}
                              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Acoustic Watermark</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Embed ultrasonic non-consent token</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onChange({ ...state, acousticWatermarkingEnabled: !state.acousticWatermarkingEnabled });
                                    playLocalSoundTest("tactical_click", 50);
                                  }}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                                    state.acousticWatermarkingEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    state.acousticWatermarkingEnabled ? "translate-x-5" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>

                              {/* Targeted Audio Shielding */}
                              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Targeted Vocal Shield</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Shields purely your personal vocal tract</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onChange({ ...state, targetedShieldingEnabled: !state.targetedShieldingEnabled });
                                    playLocalSoundTest("tactical_click", 50);
                                  }}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                                    state.targetedShieldingEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    state.targetedShieldingEnabled ? "translate-x-5" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Defense Presets Menu */}
                        {activeShieldDropdown === "presets" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                1-Click Defense Profiles &amp; Tactical Presets
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveShieldDropdown("none")}
                                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                Close ‚úï
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                              {[
                                {
                                  id: "max_cloak",
                                  title: "‚ö° Max Cloak",
                                  badge: "50m Range",
                                  desc: "Strict Blur + Vocal Scrambler + Acoustic Tone + 50m power",
                                  apply: () => onChange({
                                    ...state,
                                    isBroadcasting: true,
                                    privacyLevel: "strict_blur",
                                    rangeMeters: 50,
                                    vocalScramblerEnabled: true,
                                    facialRecognitionOptOut: true,
                                    acousticWatermarkingEnabled: true,
                                    ultrasonicMicSaturationEnabled: true
                                  })
                                },
                                {
                                  id: "transit",
                                  title: "üöå Public Transit",
                                  badge: "15m Range",
                                  desc: "Magic Removal + Face Opt-Out + Vocal Scrambler",
                                  apply: () => onChange({
                                    ...state,
                                    isBroadcasting: true,
                                    privacyLevel: "magic_removal",
                                    rangeMeters: 15,
                                    vocalScramblerEnabled: true,
                                    facialRecognitionOptOut: true
                                  })
                                },
                                {
                                  id: "office",
                                  title: "üè¢ Office Meeting",
                                  badge: "8m Range",
                                  desc: "Pixelate + Targeted Vocal Shield + Silent beacon",
                                  apply: () => onChange({
                                    ...state,
                                    isBroadcasting: true,
                                    privacyLevel: "pixelate",
                                    rangeMeters: 8,
                                    targetedShieldingEnabled: true
                                  })
                                },
                                {
                                  id: "cafe",
                                  title: "‚òï Quiet Caf√©",
                                  badge: "5m Range",
                                  desc: "Emoji Mask + Low-power 5m pocket aura",
                                  apply: () => onChange({
                                    ...state,
                                    isBroadcasting: true,
                                    privacyLevel: "emoji",
                                    rangeMeters: 5,
                                    facialRecognitionOptOut: true
                                  })
                                }
                              ].map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    p.apply();
                                    playLocalSoundTest("tactical_click", 50);
                                    setActiveShieldDropdown("none");
                                  }}
                                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition cursor-pointer space-y-1 group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{p.title}</span>
                                    <span className="text-[9px] font-mono bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800">{p.badge}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-snug">{p.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dashboard Widgets Customizer Panel (Collapsible) */}
                {showWidgetCustomizer && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          Choose Optional Dashboard Widgets
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {enabledWidgetIds.length} widgets enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[
                        {
                          id: "score",
                          label: "Privacy Impact Score",
                          desc: "Live numerical defense rating gauge",
                          checked: !!state.showPrivacyImpactScore,
                          toggle: () => onChange({ ...state, showPrivacyImpactScore: !state.showPrivacyImpactScore })
                        },
                        {
                          id: "history",
                          label: "Signal Broadcast History",
                          desc: "Telemetry trend chart",
                          checked: !!state.showSignalHistory,
                          toggle: () => onChange({ ...state, showSignalHistory: !state.showSignalHistory })
                        },
                        {
                          id: "battery",
                          label: "Hardware Battery & Health",
                          desc: "Beacon power meter & battery saver",
                          checked: !!state.showBatteryWidget,
                          toggle: () => onChange({ ...state, showBatteryWidget: !state.showBatteryWidget })
                        },
                        {
                          id: "map",
                          label: "Spatial D3 Signal Map",
                          desc: "Interactive canvas radar radius",
                          checked: !!state.showSignalMap,
                          toggle: () => onChange({ ...state, showSignalMap: !state.showSignalMap })
                        }
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={w.toggle}
                          className={`p-3 rounded-lg border text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                            w.checked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                              : "bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{w.label}</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">{w.desc}</span>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                            w.checked ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black" : "border-slate-700 bg-slate-900"
                          }`}>
                            {w.checked ? "‚úì" : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Widget Layout & Swipe Deck Controller (Only rendered when at least 1 secondary widget is enabled) */}
              {enabledWidgetIds.length > 0 && (
                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {widgetViewMode === "swipe" ? (
                        <span className="text-sm">üé¥</span>
                      ) : (
                        <span className="text-sm">üìú</span>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase block">
                        Dashboard Widget Display Mode
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {widgetViewMode === "swipe" 
                          ? `Swipable Deck active: swipe horizontally or click arrows to switch (Card ${enabledWidgetIds.length ? activeWidgetIndex + 1 : 0} of ${enabledWidgetIds.length})`
                          : "Continuous Scroll active: all selected widgets are displayed in a continuous list"
                        }
                      </span>
                    </div>
                  </div>

                  {/* Switcher & Swipe Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {widgetViewMode === "swipe" && enabledWidgetIds.length > 1 && (
                      <div className="flex items-center gap-1.5 mr-2">
                        <button
                          type="button"
                          onClick={() => setActiveWidgetIndex(prev => (prev - 1 + enabledWidgetIds.length) % enabledWidgetIds.length)}
                          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition text-xs font-bold cursor-pointer"
                          title="Previous Card"
                        >
                          ‚ü®
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-400 min-w-[2.5rem] text-center bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                          {activeWidgetIndex + 1} / {enabledWidgetIds.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveWidgetIndex(prev => (prev + 1) % enabledWidgetIds.length)}
                          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition text-xs font-bold cursor-pointer"
                          title="Next Card"
                        >
                          ‚ü©
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-850">
                      <button
                        type="button"
                        onClick={() => setWidgetViewMode("swipe")}
                        className={`px-3 py-1 rounded text-[9px] font-mono font-extrabold tracking-wider uppercase transition cursor-pointer ${
                          widgetViewMode === "swipe"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        üé¥ Swipe Deck
                      </button>
                      <button
                        type="button"
                        onClick={() => setWidgetViewMode("scroll")}
                        className={`px-3 py-1 rounded text-[9px] font-mono font-extrabold tracking-wider uppercase transition cursor-pointer ${
                          widgetViewMode === "scroll"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        üìú Scroll
                      </button>
                    </div>
                  </div>
                </div>
              )}
{/* Privacy Impact Score Gauge Panel */}
              <AnimatePresence>
                {showPrivacyImpactScore && (widgetViewMode === 'scroll' || enabledWidgetIds[activeWidgetIndex] === 'privacy-score') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      {...(widgetViewMode === 'swipe' ? {
                        drag: "x",
                        dragConstraints: { left: 0, right: 0 },
                        dragElastic: 0.2,
                        onDragEnd: handleSwipeDragEnd,
                        className: "cursor-grab active:cursor-grabbing select-none w-full"
                      } : {})}
                    >
                      <div id="privacy-impact-score-card" className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                      {/* OS Window Title Bar */}
                      <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5 shrink-0">
                            <span 
                              onClick={() => onChange({ ...state, showPrivacyImpactScore: false })}
                              className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
                              title="Close" 
                            />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Privacy Impact Score Monitor</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, showPrivacyImpactScore: false })}
                          className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/65 border border-slate-800"
                          title="Close Window"
                        >
                          ‚úï
                        </button>
                      </div>

                      {/* Content Wrapper */}
                      <div className="p-6 space-y-5 text-left bg-slate-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                              <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
                              Spatial Compliance & Privacy Impact Score
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-normal">
                              Dynamic security audit calculating real-time protection efficiency against biometric scanners, acoustic recording arrays, and RF signals.
                            </p>
                          </div>
                          <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest animate-pulse self-start sm:self-auto">
                            NPU ACTIVE
                          </span>
                        </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Gauge Dial (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2 border-b md:border-b-0 md:border-r border-slate-800/40 md:pr-6">
                    <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
                      {/* SVG Gauge Semicircle */}
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                            <stop offset="50%" stopColor="#eab308" /> {/* Yellow */}
                            <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Background track */}
                        <path 
                          d="M 10 45 A 40 40 0 0 1 90 45" 
                          fill="none" 
                          stroke="#1e293b" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                        />
                        {/* Dynamic Filled track using strokeDasharray/offset to animate color path */}
                        <path 
                          d="M 10 45 A 40 40 0 0 1 90 45" 
                          fill="none" 
                          stroke="url(#gaugeGrad)" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          strokeDasharray="126" 
                          strokeDashoffset={126 - (126 * Math.min(100, Math.max(0, calculatedScore.score))) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                        
                        {/* Needle */}
                        <g 
                          transform={`rotate(${((calculatedScore.score / 100) * 180) - 90} 50 45)`} 
                          className="transition-transform duration-1000 ease-out origin-[50px_45px]"
                        >
                          <line 
                            x1="50" 
                            y1="45" 
                            x2="50" 
                            y2="10" 
                            stroke="#ffffff" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            filter="url(#glow)"
                          />
                          <circle cx="50" cy="45" r="4" fill="#ffffff" />
                        </g>
                      </svg>

                      {/* Display Score in the center of dial */}
                      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold text-white font-mono tracking-tighter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                          {calculatedScore.score}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest font-mono font-bold text-slate-500">
                          {calculatedScore.score >= 80 ? 'üîí MAXIMUM' : calculatedScore.score >= 50 ? '‚ö†Ô∏è PARTIAL' : 'üö® CRITICAL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mitigation Vector Breakdown (7 cols) */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Active Privacy Countermeasures & Audit
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {calculatedScore.contributors.map((contrib, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 rounded-xl border text-[10px] font-mono font-medium transition-all duration-300 ${
                            contrib.active 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-slate-950/40 border-slate-900/60 text-slate-600'
                          }`}
                        >
                          <span className="truncate pr-1">{contrib.name}</span>
                          <span className="font-bold shrink-0">
                            {contrib.active ? `+${contrib.value}` : '0'} pts
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-1.5 bg-slate-900/30 border border-slate-850 p-2.5 rounded-xl text-[9px] font-mono text-slate-400 leading-relaxed">
                      <span className="text-emerald-400 shrink-0">üí°</span>
                      <p>
                        {calculatedScore.score < 50 
                          ? 'Activate the Beacon Signal Broadcaster, select a dynamic obscuration mask, and engage the sound scrambler to achieve full defense status.'
                          : calculatedScore.score < 85 
                          ? 'To achieve Maximum Stealth, activate infrared optical jammers, LiDAR countermeasures, or dynamic vocal scrambling in settings.'
                          : 'Optimal shield configurations are fully active. Your local area is hardened against third-party camera and mic tracking.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Signal History Analytics Window */}
              <AnimatePresence>
                {showSignalHistory && (widgetViewMode === 'scroll' || enabledWidgetIds[activeWidgetIndex] === 'signal-history') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      {...(widgetViewMode === 'swipe' ? {
                        drag: "x",
                        dragConstraints: { left: 0, right: 0 },
                        dragElastic: 0.2,
                        onDragEnd: handleSwipeDragEnd,
                        className: "cursor-grab active:cursor-grabbing select-none w-full"
                      } : {})}
                    >
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                      {/* OS Window Title Bar */}
                      <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5 shrink-0">
                            <span 
                              onClick={() => onChange({ ...state, showSignalHistory: false })}
                              className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
                              title="Close" 
                            />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Signal History Analytics (Last 60 Minutes)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span className={`w-1.5 h-1.5 rounded-full ${state.isBroadcasting ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                          <span>{state.isBroadcasting ? 'MONITORING' : 'SUSPENDED'}</span>
                        </div>
                      </div>

                      {/* Window Content */}
                      <div className="p-5 space-y-4 bg-slate-900/10 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/40 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              Spatial RF Waveforms & Opt-Out Forcefield
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-normal max-w-md">
                              Real-time visualization of scanning signals vs. current dynamic BlurBubble‚Ñ¢ shield block effectiveness.
                            </p>
                          </div>
                          {/* Right Controls: Mini Stats Pill & Export Button */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                            {/* Dynamic Mini Stats Pill */}
                            <div className="bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-xl flex items-center gap-4 text-center">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold font-mono">Max Intensity</span>
                                <span className="text-xs font-bold text-red-400 font-mono">
                                  {Math.max(...signalHistoryData.map(d => d.intensity))} units
                                </span>
                              </div>
                              <div className="border-l border-slate-850 h-5"></div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold font-mono">Avg Protection</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                  {Math.round(signalHistoryData.reduce((acc, d) => acc + d.shielding, 0) / signalHistoryData.length)}%
                                </span>
                              </div>
                            </div>

                            {/* Export Signed Audit JSON Button */}
                            <button
                              type="button"
                              onClick={handleExportSignalHistoryAuditReport}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                              title="Export signed JSON audit report of shield history & waveform logs for personal record-keeping"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                              <span>Export Signed Audit JSON</span>
                            </button>
                          </div>
                        </div>

                        {/* Recharts Chart Container */}
                        <div className="w-full h-[240px] bg-slate-950/60 rounded-xl border border-slate-850/60 p-2 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={signalHistoryData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                              <defs>
                                <linearGradient id="intensityGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                              <XAxis 
                                dataKey="time" 
                                stroke="#475569" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={{ stroke: '#1e293b' }}
                              />
                              <YAxis 
                                stroke="#475569" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false} 
                                domain={[0, 100]}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', padding: '10px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', fontFamily: 'monospace' }}
                                itemStyle={{ fontSize: '10px', padding: '2px 0' }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={32} 
                                iconType="circle"
                                iconSize={6}
                                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="intensity" 
                                name="Device Scanning Intensity" 
                                stroke="#f87171" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#intensityGrad)" 
                                activeDot={{ r: 4 }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="shielding" 
                                name="Shield Effectiveness %" 
                                stroke="#10b981" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#shieldGrad)" 
                                activeDot={{ r: 4 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                          <p className="text-[9px] text-slate-500 leading-relaxed max-w-xl text-left font-mono">
                            üì° Intensity represents the relative density of nearby active RF scanning packets (cameras, drones, glasses) intercepted by your beacon. Shielding levels confirm localized opt-out compliance performance.
                          </p>
                          <button
                            type="button"
                            onClick={handleExportSignalHistoryAuditReport}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 self-end sm:self-auto"
                            title="Export signed JSON audit report of shield history & waveform logs for personal record-keeping"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export Signed JSON Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                )}
              </AnimatePresence>

              {/* Battery Status Graphical Widget */}
              <AnimatePresence>
                {(state.showBatteryWidget !== false) && (widgetViewMode === 'scroll' || enabledWidgetIds[activeWidgetIndex] === 'battery-status') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      {...(widgetViewMode === 'swipe' ? {
                        drag: "x",
                        dragConstraints: { left: 0, right: 0 },
                        dragElastic: 0.2,
                        onDragEnd: handleSwipeDragEnd,
                        className: "cursor-grab active:cursor-grabbing select-none w-full"
                      } : {})}
                    >
                      <div id="battery-status-overview-card" className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                      {/* OS Window Title Bar */}
                      <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5 shrink-0">
                            <span 
                              onClick={() => onChange({ ...state, showBatteryWidget: false })}
                              className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
                              title="Close" 
                            />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Connected Beacons & Tags Battery Monitor</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, showBatteryWidget: false })}
                          className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/65 border border-slate-800"
                          title="Close Window"
                        >
                          ‚úï
                        </button>
                      </div>

                      {/* Content Wrapper */}
                      <div className="p-6 space-y-5 text-left bg-slate-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                              <Battery className="w-4 h-4 text-emerald-400 animate-pulse" />
                              Power Cell Status & Signal Optimization Telemetry
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-normal font-sans">
                              Real-time power levels, adaptive BLE transmission throttles, and simulated active battery cell diagnostics.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase tracking-widest ${
                              state.intelligentBatteryOptimization
                                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20 animate-pulse'
                                : 'text-slate-500 bg-slate-950 border-slate-850'
                            }`}>
                              {state.intelligentBatteryOptimization ? 'OPTIMIZER ON' : 'OPTIMIZER OFF'}
                            </span>
                          </div>
                        </div>

                        {/* Battery Cells Graphical Matrix */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {(state.registeredEntities || []).map((entity) => {
                            const threshold = state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20;
                            const isLow = entity.batteryPercent <= threshold;
                            const isNominal = entity.batteryPercent > 50;
                            const isMedium = entity.batteryPercent <= 50 && entity.batteryPercent > threshold;

                            // Determine status label & color
                            let statusText = "NOMINAL";
                            let statusColorClass = "text-emerald-400 border-emerald-500/20 bg-emerald-950/40";
                            let barColorClass = "bg-emerald-450";
                            let glowClass = "shadow-[0_0_10px_rgba(16,185,129,0.3)]";

                            if (isLow) {
                              statusText = "CRITICAL";
                              statusColorClass = "text-rose-400 border-rose-500/25 bg-rose-950/40 animate-pulse";
                              barColorClass = "bg-rose-500 animate-pulse";
                              glowClass = "shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                            } else if (isMedium) {
                              statusText = "MODERATE";
                              statusColorClass = "text-amber-400 border-amber-500/20 bg-amber-950/40";
                              barColorClass = "bg-amber-400";
                              glowClass = "shadow-[0_0_10px_rgba(230,140,10,0.2)]";
                            }

                            return (
                              <div 
                                key={entity.id} 
                                className={`p-4 rounded-xl border bg-slate-950/60 backdrop-blur-sm transition-all duration-300 relative ${
                                  entity.isActive ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-slate-900/80'
                                }`}
                              >
                                {entity.isActive && (
                                  <div className="absolute top-2.5 right-2.5 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </div>
                                )}
                                
                                <div className="space-y-3">
                                  {/* Device Name and Type Badge */}
                                  <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-1.5 w-full">
                                      <input
                                        type="text"
                                        value={entity.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = (state.registeredEntities || []).map(t => 
                                            t.id === entity.id ? { ...t, name: val } : t
                                          );
                                          onChange({ ...state, registeredEntities: updated });
                                        }}
                                        className="bg-slate-900 border border-slate-800/80 focus:border-emerald-500/40 text-[11px] font-bold text-white px-2 py-1 rounded w-full focus:outline-none transition-all placeholder:text-slate-600 focus:bg-slate-950"
                                        placeholder="Device Name"
                                        title="Directly rename this connected tag"
                                      />
                                      {entity.batteryPercent < 10 && (
                                        <span title="Critical Low Battery Warning (<10%)"><BatteryWarning className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" /></span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                                        {entity.type.replace('_', ' ')}
                                      </span>
                                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusColorClass}`}>
                                        {statusText}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Battery graphical cell */}
                                  <div className="flex items-center gap-3">
                                    {/* Icon-style Battery outline */}
                                    <div className="w-12 h-6 rounded border border-slate-750 p-0.5 flex relative bg-slate-900/60 shrink-0">
                                      <div 
                                        className={`h-full rounded-sm transition-all duration-500 ${barColorClass} ${glowClass}`}
                                        style={{ width: `${entity.batteryPercent}%` }}
                                      />
                                      {/* Battery tip */}
                                      <div className="absolute -right-[3px] top-1.5 w-[3px] h-3 bg-slate-750 rounded-r" />
                                    </div>
                                    
                                    <div className="space-y-0.5 text-left">
                                      <span className="text-sm font-extrabold text-white font-mono leading-none">
                                        {entity.batteryPercent}%
                                      </span>
                                      <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                                        Remaining
                                      </span>
                                    </div>
                                  </div>

                                  {/* Transmit Power Capping Status */}
                                  <div className="text-[9px] font-mono text-slate-500 flex justify-between items-center border-t border-slate-900/60 pt-2.5">
                                    <span>Signal Range Cap:</span>
                                    <span className={`font-bold ${entity.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                      {entity.isActive 
                                        ? state.batterySaverActive 
                                          ? '8m (Saver)' 
                                          : state.intelligentBatteryOptimization && entity.batteryPercent < 35 
                                            ? '10m (Scaled)' 
                                            : `${state.rangeMeters || 12}m`
                                        : 'STANDBY'
                                      }
                                    </span>
                                  </div>

                                  {/* Interactive Power Calibration Slider */}
                                  <div className="space-y-1 mt-2 pt-2 border-t border-slate-900/40 text-left">
                                    <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                                      <span>SIMULATE POWER level</span>
                                      <span className="text-slate-300 font-bold">{entity.batteryPercent}%</span>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="100"
                                      value={entity.batteryPercent}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        const updated = (state.registeredEntities || []).map(t => 
                                          t.id === entity.id ? { ...t, batteryPercent: val } : t
                                        );
                                        
                                        onChange({ ...state, registeredEntities: updated });

                                        // Dispatch interactive warning logs if drops under threshold
                                        const threshold = state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20;
                                        if (val <= threshold && entity.batteryPercent > threshold) {
                                          if (onTriggerAlert) {
                                            onTriggerAlert(
                                              "Critical Battery Warning",
                                              `Companion hardware '${entity.name}' battery level dropped to ${val}% (Threshold set at ${threshold}%).`,
                                              "battery_warning"
                                            );
                                          }
                                          if (onAddLog) {
                                            onAddLog({
                                              deviceModel: 'BATTERY_TELEMETRY',
                                              action: 'discovered',
                                              shieldApplied: `ALERT DISPATCHED: ${entity.name.toUpperCase()} AT ${val}%`,
                                              distance: 0,
                                              rotatedId: 'BATTERY_CRITICAL'
                                            });
                                          }
                                        }
                                      }}
                                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Optimization Controller panel */}
                        <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-extrabold text-white font-mono uppercase tracking-wider block">
                              Intelligent Battery Optimization Engine
                            </span>
                            <p className="text-[10px] text-slate-400 font-sans leading-normal">
                              Scales signal frequency, caps transmission ranges, and enters ultra-sleep intervals as companion device batteries drain.
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const active = !state.intelligentBatteryOptimization;
                                onChange({
                                  ...state,
                                  intelligentBatteryOptimization: active
                                });
                                if (onAddLog) {
                                  onAddLog({
                                    deviceModel: 'BATTERY_TELEMETRY',
                                    action: 'censored',
                                    shieldApplied: active ? 'BATTERY_OPTIMIZATION_ENABLED' : 'BATTERY_OPTIMIZATION_DISABLED',
                                    distance: 0,
                                    rotatedId: 'BATT_ENGINE'
                                  });
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                state.intelligentBatteryOptimization
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                              }`}
                            >
                              {state.intelligentBatteryOptimization ? 'Disable Optimizer' : 'Enable Optimizer'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                // Instantly recharge all connected beacons to 100%
                                const updated = (state.registeredEntities || []).map(t => ({ ...t, batteryPercent: 100 }));
                                onChange({ ...state, registeredEntities: updated });
                                if (onAddLog) {
                                  onAddLog({
                                    deviceModel: 'BATTERY_TELEMETRY',
                                    action: 'censored',
                                    shieldApplied: 'BEACON_POWER_CELLS_RECHARGED_100',
                                    distance: 0,
                                    rotatedId: 'BATT_RECHARGE'
                                  });
                                }
                              }}
                              className="px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white uppercase tracking-wider transition-all duration-200 cursor-pointer"
                            >
                              Recharge All Cells
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                )}
              </AnimatePresence>

              {/* D3 Real-Time Signal Strength Map Widget */}
              <AnimatePresence>
                {showSignalMap && (widgetViewMode === 'scroll' || enabledWidgetIds[activeWidgetIndex] === 'signal-map') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden animate-none"
                  >
                    <motion.div
                      {...(widgetViewMode === 'swipe' ? {
                        drag: "x",
                        dragConstraints: { left: 0, right: 0 },
                        dragElastic: 0.2,
                        onDragEnd: handleSwipeDragEnd,
                        className: "cursor-grab active:cursor-grabbing select-none w-full"
                      } : {})}
                    >
                      <D3SignalMap
                        state={state}
                        onChange={onChange}
                        onAddLog={onAddLog}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination Indicators & Empty State in Swipe Mode */}
              {widgetViewMode === 'swipe' && enabledWidgetIds.length > 0 && (
                <div className="flex flex-col items-center justify-center gap-2 pt-2 pb-4">
                  {enabledWidgetIds.length > 1 && (
                    <div className="flex items-center gap-2">
                      {enabledWidgetIds.map((widgetId, idx) => {
                        const widgetNames: Record<string, string> = {
                          'privacy-score': 'Privacy Impact Score',
                          'signal-history': 'Signal History Analytics',
                          'battery-status': 'Battery Monitor',
                          'signal-map': 'D3 Spatial Map'
                        };
                        const isActive = idx === activeWidgetIndex;
                        return (
                          <button
                            key={widgetId}
                            type="button"
                            onClick={() => setActiveWidgetIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                              isActive
                                ? 'bg-emerald-400 w-6 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                : 'bg-slate-800 hover:bg-slate-700 w-2'
                            }`}
                            title={`Switch to ${widgetNames[widgetId] || widgetId}`}
                          />
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">
                    ‚¨ÖÔ∏è SWIPE CARD OR CLICK DOTS TO NAVIGATE WINDOWS ‚û°Ô∏è
                  </p>
                </div>
              )}


            </motion.div>
          )}

          {/* Tab: Targeted Sound & Peripheral Console */}
          {activeTab === 'targeted' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              {/* OS Window 1: Targeted Audio-Visual Defenses & Companion Hardware */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Title Bar */}
                <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" title="Close" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Targeted Acoustic Defenses &amp; Peripheral Console</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`w-2 h-2 rounded-full ${state.targetedPeripheralConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
                    <span className={state.targetedPeripheralConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {state.targetedPeripheralConnected ? 'COMPANION PAIRED' : 'LOCAL SIMULATOR'}
                    </span>
                  </div>
                </div>

                {/* Window Content */}
                <div className="p-5 sm:p-6 space-y-6 bg-slate-900/10">
                  
                  {/* Conceptual Banner detailing the Targeted Shield paradigm */}
                  <div className="bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/20 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1.5 max-w-xl">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest inline-block">
                        Active Paradigm: Targeted Compliance
                      </span>
                      <h4 className="text-sm font-bold text-white font-sans">
                        Selective Opt-Out Shielding vs. Blanket Recording Interference
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        To respect the rights of others, BlurBubble operates strictly as a <strong>targeted privacy defense</strong>. If you are standing next to an innocent friend who is being recorded, <strong>only your face is blurred</strong> and <strong>only your speech is scrambled</strong>. Complying camera systems receive your localized opt-out broadcast and apply surgical masks, keeping bystanders fully visible and clear.
                      </p>
                    </div>

                    {/* Quick Mode Toggle Widget */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-900 rounded-xl flex flex-col items-center gap-3 shrink-0 w-full md:w-56 text-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Shield Scope Mode</span>
                      
                      <div className="grid grid-cols-2 gap-1 w-full p-0.5 bg-slate-900 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, targetedShieldingEnabled: true })}
                          className={`py-1.5 text-[10px] font-bold rounded-md font-mono transition uppercase ${
                            state.targetedShieldingEnabled !== false
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Targeted
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, targetedShieldingEnabled: false })}
                          className={`py-1.5 text-[10px] font-bold rounded-md font-mono transition uppercase ${
                            state.targetedShieldingEnabled === false
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Blanket
                        </button>
                      </div>

                      <span className="text-[9px] text-slate-400 leading-snug">
                        {state.targetedShieldingEnabled !== false 
                          ? "üîí Protects Paul Stuart only. Innocent bystanders are unaffected." 
                          : "‚ö†Ô∏è Overrides all nearby fields. Might disrupt normal recordings."}
                      </span>
                    </div>
                  </div>

                  {/* Core 3 Audio Shield Controllers */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Audio Defenses (Equivalent to Visual Blurs)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Vocal Resonance Scrambler */}
                      <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        state.vocalScramblerEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/35 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850 text-slate-400'
                      }`}>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${state.vocalScramblerEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              Vocal Scrambler
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Audio Blur</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Applies micro-pitch fluctuation filters to your voice signature. Nearby humans understand you flawlessly, but automated speech-to-text recorders capture scrambled wave data.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, vocalScramblerEnabled: !state.vocalScramblerEnabled })}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold font-mono uppercase border transition ${
                            state.vocalScramblerEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 cursor-pointer'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {state.vocalScramblerEnabled ? 'ACTIVE (Scrambling)' : 'STANDBY'}
                        </button>
                      </div>

                      {/* 2. Inaudible Biometric Audio Watermarking */}
                      <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        state.acousticWatermarkingEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/35 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850 text-slate-400'
                      }`}>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${state.acousticWatermarkingEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              Biometric AI Watermark
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Audio Metadata</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Injects near-ultrasonic cryptographic metadata into your spoken audio, forcing automated scraper bots to trigger reject policies and auto-delete your voice clips.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, acousticWatermarkingEnabled: !state.acousticWatermarkingEnabled })}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold font-mono uppercase border transition ${
                            state.acousticWatermarkingEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 cursor-pointer'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {state.acousticWatermarkingEnabled ? 'ACTIVE (Watermarked)' : 'STANDBY'}
                        </button>
                      </div>

                      {/* 3. Ultrasonic Microphone Saturation */}
                      <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        state.ultrasonicMicSaturationEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/35 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850 text-slate-400'
                      }`}>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${state.ultrasonicMicSaturationEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              Ultrasonic Mic Saturation
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Hardware Jam</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Emits safe, inaudible 22kHz pressure waves that physically vibrate the capture mic diaphragm on snooping devices, distorting their records with non-destructive white noise.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, ultrasonicMicSaturationEnabled: !state.ultrasonicMicSaturationEnabled })}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold font-mono uppercase border transition ${
                            state.ultrasonicMicSaturationEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 cursor-pointer'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {state.ultrasonicMicSaturationEnabled ? 'ACTIVE (Saturating)' : 'STANDBY'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Waveform Visualization section demonstrating Targeted Scrambling */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    {/* Column 1 & 2: Real-time Audio Feed Stream Simulator */}
                    <div className="lg:col-span-2 bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Live Acoustic Waveform Spectrograph</h5>
                          <p className="text-[10px] text-slate-500">Visual proof of targeted voice scrambling vs. bystander audio integrity.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/30 uppercase tracking-wider animate-pulse">
                          LIVE SPECTRUM MONITOR
                        </span>
                      </div>

                      {/* Waveform Streams */}
                      <div className="space-y-3.5 pt-1">
                        
                        {/* Stream A: Paul (Me) Scrambled */}
                        <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-3 space-y-2 relative overflow-hidden">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Track A: Paul Stuart (Protected Voice)
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                              state.vocalScramblerEnabled 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              {state.vocalScramblerEnabled ? 'üîí Scrambled & Watermarked' : '‚ö†Ô∏è RAW & UNPROTECTED'}
                            </span>
                          </div>

                          {/* Dynamic Waveform Graph */}
                          <div className="h-16 flex items-center gap-[3px] px-2 bg-slate-950/80 rounded border border-slate-900/50 relative overflow-hidden">
                            {/* Animated waveform bars representing voice scrambling */}
                            {Array.from({ length: 48 }).map((_, i) => {
                              const randomDelay = Math.random() * 0.8;
                              const randomDuration = 0.5 + Math.random() * 0.8;
                              const activeHeight = state.vocalScramblerEnabled 
                                ? `${15 + Math.sin(i * 0.4) * 15 + Math.random() * 45}%`
                                : `${5 + Math.sin(i * 0.2) * 10 + Math.random() * 15}%`;

                              return (
                                <div 
                                  key={i} 
                                  className={`flex-1 rounded-full transition-all duration-300 ${
                                    state.vocalScramblerEnabled 
                                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                                      : 'bg-slate-700'
                                  }`}
                                  style={{
                                    height: activeHeight,
                                    animation: state.vocalScramblerEnabled ? `pulse ${randomDuration}s ease-in-out infinite alternate` : 'none',
                                    animationDelay: `${randomDelay}s`
                                  }}
                                />
                              );
                            })}
                            
                            <div className="absolute right-3 top-2 flex items-center gap-1.5 font-mono text-[8px] text-slate-500 bg-slate-950/90 px-1 rounded border border-slate-900">
                              <span>Mod: {state.targetedSoundAngle || 45}¬∞ Beam</span>
                            </div>
                          </div>
                        </div>

                        {/* Stream B: Elena (Bystander next to me) Clear */}
                        <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-3 space-y-2 relative overflow-hidden">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Track B: Adjacent Bystander (Friend's Voice)
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                              state.targetedShieldingEnabled !== false
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {state.targetedShieldingEnabled !== false ? 'üîä 100% Crisp / Clear' : '‚ö†Ô∏è COLLATERAL AUDIO SCRAMBLE'}
                            </span>
                          </div>

                          {/* Dynamic Waveform Graph - Bystander stays calm, normal, pristine */}
                          <div className="h-16 flex items-center gap-[3px] px-2 bg-slate-950/80 rounded border border-slate-900/50 relative overflow-hidden">
                            {Array.from({ length: 48 }).map((_, i) => {
                              const isScrambled = state.targetedShieldingEnabled === false && state.vocalScramblerEnabled;
                              const randomDelay = Math.random() * 0.5;
                              const randomDuration = 0.8 + Math.random() * 0.6;
                              
                              const activeHeight = isScrambled
                                ? `${15 + Math.sin(i * 0.4) * 15 + Math.random() * 45}%` // Colateral scramble
                                : `${20 + Math.sin(i * 0.15) * 20 + Math.sin(i * 0.5) * 5}%`; // Beautiful smooth vocal stream

                              return (
                                <div 
                                  key={i} 
                                  className={`flex-1 rounded-full transition-all duration-300 ${
                                    isScrambled 
                                      ? 'bg-amber-500' 
                                      : 'bg-cyan-400/80'
                                  }`}
                                  style={{
                                    height: activeHeight,
                                    animation: `pulse ${randomDuration}s ease-in-out infinite alternate`,
                                    animationDelay: `${randomDelay}s`
                                  }}
                                />
                              );
                            })}
                            
                            <div className="absolute right-3 top-2 flex items-center gap-1.5 font-mono text-[8px] text-slate-500 bg-slate-950/90 px-1 rounded border border-slate-900">
                              <span>Range: Outside Beam Arc</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Interactive Controls for Beam Directional & Intensity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 bg-slate-950 p-3.5 border border-slate-900 rounded-xl">
                        
                        {/* Sliders Control 1: Directional Beam Angle */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-semibold uppercase">Directional Beam Angle</span>
                            <span className="text-emerald-400 font-bold">{state.targetedSoundAngle || 45}¬∞ Beam</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="180"
                            step="5"
                            value={state.targetedSoundAngle || 45}
                            onChange={(e) => onChange({ ...state, targetedSoundAngle: parseInt(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-900 cursor-pointer rounded-full"
                            title="Set the sonic cancellation beam width"
                          />
                          <p className="text-[8px] text-slate-500 leading-normal">
                            {state.targetedSoundAngle <= 45 
                              ? "Extremely focused 15¬∞-45¬∞ acoustic laser beam. Shields only you. Zero bystander interference." 
                              : state.targetedSoundAngle <= 90 
                                ? "Medium 90¬∞ acoustic cone. Protects immediate personal workspace." 
                                : "Wide 180¬∞ blanket wave. Shields entire table area, may affect nearby bystanders."}
                          </p>
                        </div>

                        {/* Sliders Control 2: Ultrasonic Emission Power */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-semibold uppercase">Ultrasonic Power Level</span>
                            <span className="text-emerald-400 font-bold">{state.targetedSoundIntensity || 75} dB SPL</span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="110"
                            step="5"
                            value={state.targetedSoundIntensity || 75}
                            onChange={(e) => onChange({ ...state, targetedSoundIntensity: parseInt(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-900 cursor-pointer rounded-full"
                            title="Set the ultrasonic emitter volume"
                          />
                          <p className="text-[8px] text-slate-500 leading-normal">
                            {state.targetedSoundIntensity <= 60
                              ? "Eco mode. Suppresses low-gain lapel recorders up to 1.5 meters."
                              : state.targetedSoundIntensity <= 85
                                ? "Nominal high-defense setting. Saturates standard smartphone mics up to 3 meters."
                                : "Overdrive boost. Safe ultrasonic saturation up to 5 meters against high-gain mic rigs."}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Column 3: Companion Hardware pairing state */}
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">BlurBubble Wearable Hardware</span>
                          <span className="text-[9px] text-slate-500 font-mono">BLE Core</span>
                        </div>

                        {/* Physical Hardware Representation Box */}
                        <div className="bg-slate-950 border border-slate-900/60 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                          {/* Hardware Glowing Ripple Background if connected */}
                          {state.targetedPeripheralConnected && (
                            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                              <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-500 opacity-5"></span>
                              <span className="animate-pulse absolute inline-flex h-36 w-36 rounded-full bg-emerald-500 opacity-5"></span>
                            </div>
                          )}

                          {/* Companion Icon */}
                          <div className={`p-4 rounded-2xl border transition-all relative z-10 ${
                            state.targetedPeripheralConnected
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-900 border-slate-850 text-slate-500'
                          }`}>
                            <Cpu className={`w-8 h-8 ${state.targetedPeripheralConnected ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
                          </div>

                          <div className="space-y-1 relative z-10">
                            <span className="text-xs font-bold block text-white font-mono">
                              {state.targetedPeripheralConnected ? 'BlurBubble Helix Badge v1.0' : 'No Companion Hardware Paired'}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-sans">
                              {state.targetedPeripheralConnected 
                                ? 'Paired via Secure Bluetooth-LE mesh. Hardware sound emitters armed.' 
                                : 'Using default mobile internal speaker simulation.'}
                            </span>
                          </div>

                          {/* Pairing Buttons */}
                          <div className="w-full relative z-10 pt-1">
                            <button
                              type="button"
                              id="toggle-hardware-pairing-btn"
                              onClick={() => {
                                const isConnected = !state.targetedPeripheralConnected;
                                onChange({
                                  ...state,
                                  targetedPeripheralConnected: isConnected
                                });
                                
                                if (onTriggerAlert) {
                                  onTriggerAlert(
                                    isConnected ? "Hardware Badge Bonded" : "Companion Hardware Disconnected",
                                    isConnected 
                                      ? "BlurBubble Helix Badge successfully paired. Dynamic acoustic directional canceling and ultrasonic emitters are now routed to physical pocket hardware."
                                      : "Hardware peripheral detached. Reverting acoustic shield emissions to mobile internal speaker array.",
                                    isConnected ? "video_found" : "video_deleted"
                                  );
                                }

                                if (onAddLog) {
                                  onAddLog({
                                    deviceModel: 'BLURBUBBLE_HARDWARE_PERIPHERAL',
                                    action: isConnected ? 'discovered' : 'censored',
                                    shieldApplied: isConnected ? 'SECURE_BLE_MESH_ESTABLISHED' : 'BLE_MESH_DISMANTLED_REVERT_TO_INTERNAL',
                                    distance: 0,
                                    rotatedId: isConnected ? 'HARDWARE_LINKED_SUITE_A2' : 'HARDWARE_UNLINKED'
                                  });
                                }
                              }}
                              className={`w-full py-1.5 rounded-lg text-[9px] font-extrabold font-mono uppercase border transition cursor-pointer ${
                                state.targetedPeripheralConnected
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              {state.targetedPeripheralConnected ? 'üîå DISCONNECT BADGE' : '‚ö° PAIR SECURE HELIX BADGE'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Test Button & Details */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Diagnostics</span>
                        <button
                          type="button"
                          id="targeted-acoustics-test-btn"
                          onClick={() => {
                            const isTargeted = state.targetedShieldingEnabled !== false;
                            
                            if (onTriggerAlert) {
                              onTriggerAlert(
                                isTargeted ? "Surgical Privacy Test Passed" : "Blanket Jammer Test Run",
                                isTargeted
                                  ? "Directional voice cancellation and optical overlays triggered successfully. Verification check confirms: Paul Stuart blurred & voice scrambled; bystander standing 1 meter away remains 100% untouched and recorded cleanly."
                                  : "Room-wide blanket jamming wave emitted. All nearby audio and visual capturing elements suppressed in a 5-meter radius.",
                                "video_found"
                              );
                            }

                            if (onAddLog) {
                              onAddLog({
                                deviceModel: 'DIAGNOSTIC_VOICE_ISOLATION',
                                action: 'censored',
                                shieldApplied: isTargeted 
                                  ? 'TARGETED_ACOUSTIC_MASKING_VERIFIED: paul_blurred_friend_clear' 
                                  : 'BLANKET_ROOM_JAMMING_VERIFIED: all_elements_jammed',
                                distance: 1.2,
                                rotatedId: 'ISOLATION_DIAGNOSTIC_VERIFICATION_COMPLETE'
                              });
                            }
                          }}
                          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 animate-pulse" />
                          Run Targeted Privacy Test
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Audio Shield Settings (Replicates visual controls but for audio domain) */}
          {activeTab === 'audio_shield' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              {/* Profile/Device Selector Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Title Bar */}
                <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" title="Close" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Acoustic Shield Console &amp; Profile Matrix</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`}></span>
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider">Acoustic Armor Armed</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* Explanation Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/20 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1.5 max-w-2xl">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest inline-block">
                        Acoustic Sensory Refusal Domain
                      </span>
                      <h4 className="text-sm font-bold text-white font-sans">
                        Multi-Layered Spatial Voice &amp; Mic Refusal System
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Just like visual shields blur facial details and proprietary objects, the <strong>Acoustic Shield Settings</strong> scramble vocal waves, tag voice clip metadata, and block physical microphones. Manage individual audio defense policies for your main voice profile or each paired hardware device.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-850 shrink-0">
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-slate-300 font-bold uppercase">3 Shield Classes</span>
                    </div>
                  </div>

                  {/* Profile selector dropdown and global parameters */}
                  <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Select Target Profile or Companion Device</h4>
                        <p className="text-[10px] text-slate-500">Configure independent acoustic properties for this profile</p>
                      </div>

                      {/* Dropdown for selecting profile */}
                      <select
                        id="audio-profile-select"
                        value={selectedAudioProfileId}
                        onChange={(e) => setSelectedAudioProfileId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 font-mono font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 max-w-[280px]"
                      >
                        <option value="primary">üë§ Paul Stuart (Primary Profile)</option>
                        {state.registeredEntities.map(ent => (
                          <option key={ent.id} value={ent.id}>
                            {ent.type === 'phone' ? 'üì±' : 'üéí'} {ent.name} ({ent.isActive ? 'ACTIVE' : 'STANDBY'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Render toggles and values for the selected profile */}
                    {(() => {
                      const isPrimary = selectedAudioProfileId === 'primary';
                      const entity = !isPrimary ? state.registeredEntities.find(ent => ent.id === selectedAudioProfileId) : null;
                      
                      // Resolve active state values for selected profile
                      const scramblerActive = isPrimary ? !!state.vocalScramblerEnabled : !!entity?.vocalScramblerEnabled;
                      const watermarkingActive = isPrimary ? !!state.acousticWatermarkingEnabled : !!entity?.acousticWatermarkingEnabled;
                      const saturationActive = isPrimary ? !!state.ultrasonicMicSaturationEnabled : !!entity?.ultrasonicMicSaturationEnabled;

                      const toggleProperty = (prop: 'vocalScramblerEnabled' | 'acousticWatermarkingEnabled' | 'ultrasonicMicSaturationEnabled') => {
                        if (isPrimary) {
                          onChange({ ...state, [prop]: !state[prop] });
                          
                          if (onTriggerAlert) {
                            onTriggerAlert(
                              `Paul Stuart Audio Armor Updated`,
                              `Acoustic shield parameter '${prop.replace('Enabled', '').replace(/([A-Z])/g, ' $1')}' has been updated on your primary profile.`,
                              "video_found"
                            );
                          }
                        } else if (entity) {
                          const updatedEntities = state.registeredEntities.map(ent => 
                            ent.id === entity.id ? { ...ent, [prop]: !ent[prop] } : ent
                          );
                          onChange({ ...state, registeredEntities: updatedEntities });

                          if (onTriggerAlert) {
                            onTriggerAlert(
                              `${entity.name} Parameter Shifted`,
                              `Acoustic shield parameter '${prop.replace('Enabled', '').replace(/([A-Z])/g, ' $1')}' has been toggled to ${!entity[prop] ? 'ACTIVE' : 'STANDBY'} on the device profile.`,
                              "video_found"
                            );
                          }
                        }
                      };

                      return (
                        <div className="space-y-6">
                          {/* 3 Interactive Cards replicating the visual logic */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* 1. Vocal Scrambler Control */}
                            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              scramblerActive 
                                ? 'bg-emerald-950/15 border-emerald-500/40 text-slate-200' 
                                : 'bg-slate-950/20 border-slate-850 text-slate-400'
                            }`}>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span className={`inline-block w-2 h-2 rounded-full ${scramblerActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    Vocal Scrambler
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">Audio Blur</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Modulates voice waves using live pseudo-noise carriers. Surrounding bystanders hear you clearly, but smart microphones/analyzers receive chaotic scrambled spectrographs.
                                </p>
                              </div>
                              <button
                                type="button"
                                id={`toggle-vocal-scrambler-${selectedAudioProfileId}`}
                                onClick={() => toggleProperty('vocalScramblerEnabled')}
                                className={`w-full py-2 rounded-lg text-[10px] font-bold font-mono uppercase border transition cursor-pointer ${
                                  scramblerActive
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {scramblerActive ? 'üîí SCRAMBLER ACTIVE' : '‚ö†Ô∏è STANDBY'}
                              </button>
                            </div>

                            {/* 2. Acoustic Watermarking Control */}
                            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              watermarkingActive 
                                ? 'bg-emerald-950/15 border-emerald-500/40 text-slate-200' 
                                : 'bg-slate-950/20 border-slate-850 text-slate-400'
                            }`}>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span className={`inline-block w-2 h-2 rounded-full ${watermarkingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    Acoustic Watermarking
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">Signature Tag</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Embeds sub-audible high-frequency metadata codes directly into your speech wave. Recording systems decode an "opt-out" flag, forcing compliant bots to purge or skip storing your voice.
                                </p>
                              </div>
                              <button
                                type="button"
                                id={`toggle-watermarking-${selectedAudioProfileId}`}
                                onClick={() => toggleProperty('acousticWatermarkingEnabled')}
                                className={`w-full py-2 rounded-lg text-[10px] font-bold font-mono uppercase border transition cursor-pointer ${
                                  watermarkingActive
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {watermarkingActive ? 'üîí WATERMARK ACTIVE' : '‚ö†Ô∏è STANDBY'}
                              </button>
                            </div>

                            {/* 3. Ultrasonic Mic Saturation Control */}
                            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              saturationActive 
                                ? 'bg-emerald-950/15 border-emerald-500/40 text-slate-200' 
                                : 'bg-slate-950/20 border-slate-850 text-slate-400'
                            }`}>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span className={`inline-block w-2 h-2 rounded-full ${saturationActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    Ultrasonic Mic Saturation
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">Hardware Block</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Emits micro-vibrational pressure pulses focused in the 22kHz-25kHz spectrum. Overloads adjacent lapel/smart mics to physically block local recordings from gaining legible audio.
                                </p>
                              </div>
                              <button
                                type="button"
                                id={`toggle-saturation-${selectedAudioProfileId}`}
                                onClick={() => toggleProperty('ultrasonicMicSaturationEnabled')}
                                className={`w-full py-2 rounded-lg text-[10px] font-bold font-mono uppercase border transition cursor-pointer ${
                                  saturationActive
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {saturationActive ? 'üîí SATURATOR ENFORCED' : '‚ö†Ô∏è STANDBY'}
                              </button>
                            </div>

                          </div>

                          {/* Interactive Scrambler Pitch, Preset Phrases & Dynamic Waveform visualization */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                            
                            {/* Visualizer and Simulator: Scrambler in Action */}
                            <div className="lg:col-span-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Live Acoustic Demodulator &amp; Scrambling Waveform</h5>
                                  <p className="text-[9px] text-slate-500">Simulating the effect of live audio processing for {isPrimary ? 'Paul Stuart' : entity?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                                    scramblerActive 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' 
                                      : 'bg-slate-900 text-slate-500 border-slate-800'
                                  }`}>
                                    {scramblerActive ? 'SCRAMBLING ON' : 'RAW STREAM'}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive phrase selector */}
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">Try Spoken Phrases:</span>
                                  {[
                                    "Initializing BlurBubble spatial envelope.",
                                    "Requesting secure biometric exclusion.",
                                    "Stop recording me: law 88 compliance check.",
                                    "Innocent bystanders remain fully untouched."
                                  ].map((phrase, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setTestedPhrase(phrase);
                                        // Trigger small alert simulation
                                        if (onTriggerAlert) {
                                          onTriggerAlert(
                                            "Scrambler Audio Analyzed",
                                            `Vocal scrambler processed '${phrase}' through a 2.4kHz acoustic filter. Bystanders hear normal sound, raw recording yields encrypted noise.`,
                                            "video_deleted"
                                          );
                                        }
                                      }}
                                      className={`px-2 py-1 text-[8px] font-mono rounded border transition ${
                                        testedPhrase === phrase
                                          ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-400 font-bold'
                                          : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      Phrase {idx + 1}
                                    </button>
                                  ))}
                                </div>

                                {/* Display Selected Phrase Raw vs Scrambled */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/30 p-3 rounded-lg border border-slate-900">
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-mono uppercase text-slate-500 font-bold block">Spoken (Bystanders Hear)</span>
                                    <p className="text-xs text-slate-200 font-medium italic">"{testedPhrase}"</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-mono uppercase text-slate-500 font-bold block">Intercepted (Bots Capture)</span>
                                    <p className="text-xs text-emerald-400 font-mono font-bold leading-relaxed tracking-wide">
                                      {scramblerActive 
                                        ? testedPhrase.split(' ').map(w => w.split('').map(() => '‚ñ†').join('')).join(' ') + " [X-" + (state.targetedSoundAngle || 45) + "]"
                                        : `"${testedPhrase}" [UNPROTECTED]`
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Waveform Graph */}
                              <div className="h-20 flex items-center gap-[3px] px-3.5 bg-slate-950 rounded-xl border border-slate-900 relative overflow-hidden">
                                {Array.from({ length: 55 }).map((_, i) => {
                                  const randomDelay = Math.random() * 0.7;
                                  const randomDuration = 0.4 + Math.random() * 0.7;
                                  
                                  // Modulate height based on selected triggers
                                  let heightFactor = 15;
                                  if (scramblerActive) heightFactor += 40;
                                  if (watermarkingActive) heightFactor += 15;
                                  if (saturationActive) heightFactor += 20;

                                  const barHeight = scramblerActive 
                                    ? `${10 + Math.sin(i * 0.35 + (audioModulator / 10)) * 25 + Math.random() * heightFactor}%`
                                    : `${5 + Math.sin(i * 0.15) * 15 + Math.random() * 12}%`;

                                  return (
                                    <div 
                                      key={i} 
                                      className={`flex-1 rounded-full transition-all duration-300 ${
                                        scramblerActive 
                                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                                          : 'bg-slate-700'
                                      }`}
                                      style={{
                                        height: barHeight,
                                        animation: `pulse ${randomDuration}s ease-in-out infinite alternate`,
                                        animationDelay: `${randomDelay}s`
                                      }}
                                    />
                                  );
                                })}

                                <div className="absolute left-3 top-2 flex items-center gap-1 text-[8px] font-mono text-slate-500 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-900">
                                  <span>FREQ: {scramblerActive ? `${440 + audioModulator * 12}Hz (Vocal Shift)` : '44.1kHz Bypass'}</span>
                                </div>

                                <div className="absolute right-3 top-2 flex items-center gap-1 text-[8px] font-mono text-slate-500 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-900">
                                  <span>AMPLITUDE: {scramblerActive ? `${state.targetedSoundIntensity || 75} dB` : 'Ambient'}</span>
                                </div>
                              </div>

                              {/* Interactive Modulation Slider */}
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-slate-300 font-semibold uppercase">Modulation Carrier Shift</span>
                                  <span className="text-emerald-400 font-bold">+{audioModulator} Hz Modulation</span>
                                </div>
                                <input
                                  type="range"
                                  min="20"
                                  max="300"
                                  step="10"
                                  value={audioModulator}
                                  onChange={(e) => setAudioModulator(parseInt(e.target.value))}
                                  className="w-full accent-emerald-500 h-1 bg-slate-950 cursor-pointer rounded-full"
                                  title="Adjust simulated scramble modulation speed/carrier shift"
                                />
                                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                                  <span>20 Hz (Deep Low-Frequency Scramble)</span>
                                  <span>300 Hz (High-Frequency Laser Scatter)</span>
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Summary & Diagnostic Testing Panel */}
                            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
                              <div className="space-y-3.5">
                                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Profile Summary</span>
                                  <span className="text-[9px] text-slate-500 font-mono">Audit State</span>
                                </div>

                                <div className="space-y-2.5 font-mono text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Target Type:</span>
                                    <span className="text-slate-300 uppercase font-bold">{isPrimary ? 'Primary User' : entity?.type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Device Power:</span>
                                    <span className="text-emerald-400 font-bold">{isPrimary ? '100% (Plugged)' : `${entity?.batteryPercent}%`}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Signal Range:</span>
                                    <span className="text-slate-300">{state.rangeMeters} Meters</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Visual Censor Style:</span>
                                    <span className="text-emerald-400 uppercase font-bold">{isPrimary ? state.privacyLevel.replace('_', ' ') : entity?.privacyLevel.replace('_', ' ')}</span>
                                  </div>
                                </div>

                                <div className="border-t border-slate-900 pt-3 space-y-2">
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Active Defense Logs</span>
                                  <div className="bg-slate-900/30 p-2.5 rounded border border-slate-900 text-[8px] font-mono text-slate-400 h-20 overflow-y-auto space-y-1">
                                    <div>[00:01:03] PAIRED: {isPrimary ? 'Paul Stuart HUD' : entity?.name} synchronized.</div>
                                    {scramblerActive && <div className="text-emerald-400">[00:01:14] BROADCAST: Vocal scrambler carrier shift active.</div>}
                                    {watermarkingActive && <div className="text-emerald-400">[00:01:21] WATERMARK: Embedded cryptotags injected.</div>}
                                    {saturationActive && <div className="text-rose-400 font-semibold">[00:01:29] MICROPHONE SATURATION: Emitting 22kHz pressure.</div>}
                                    {!scramblerActive && !watermarkingActive && !saturationActive && <div className="text-slate-500">[00:01:00] STANDBY: All acoustic shields disabled.</div>}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Diagnostics Check</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onTriggerAlert) {
                                      onTriggerAlert(
                                        "Acoustic Shield Audit Run",
                                        `Audio defense diagnostic finished with zero critical failures. Scrambling wave carrier shifted at ${audioModulator}Hz correctly, ultrasonic mic saturation emitter tuned at 22.4kHz, biometric watermark active.`,
                                        "video_found"
                                      );
                                    }
                                    if (onAddLog) {
                                      onAddLog({
                                        deviceModel: isPrimary ? 'PRIMARY_PAUL_STUART' : `DEVICE_${entity?.id}`,
                                        action: 'discovered',
                                        shieldApplied: scramblerActive 
                                          ? `ACOUSTIC_SCRAMBLER_MOD_${audioModulator}HZ` 
                                          : 'ACOUSTIC_STANDBY',
                                        distance: isPrimary ? 0 : 1.5,
                                        rotatedId: isPrimary ? 'PRIMARY_AUDIT_LOG' : `DEVICE_AUDIT_${entity?.id}`
                                      });
                                    }
                                  }}
                                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                                  Test Acoustic Shielding
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Device and profile list replicate visual shield table list */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Acoustic Shield Directories ({state.registeredEntities.length + 1})</h4>
                      <span className="text-[9px] font-mono text-slate-500">Click a card above to toggle, or select profile here</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Paul Stuart Primary Profile card */}
                      <div className={`p-4 rounded-xl border bg-slate-950/40 space-y-3 transition-all ${
                        selectedAudioProfileId === 'primary' ? 'border-emerald-500 bg-slate-950/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-850'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5 items-start">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                              üë§
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">Paul Stuart (Primary)</h5>
                              <span className="text-[8px] font-mono text-slate-500">USER PROFILE</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedAudioProfileId('primary')}
                            className="text-[9px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/10 transition cursor-pointer"
                          >
                            SELECT
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${state.vocalScramblerEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                            Scrambler: {state.vocalScramblerEnabled ? 'ON' : 'OFF'}
                          </span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${state.acousticWatermarkingEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                            Watermark: {state.acousticWatermarkingEnabled ? 'ON' : 'OFF'}
                          </span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${state.ultrasonicMicSaturationEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                            Saturation: {state.ultrasonicMicSaturationEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {/* Map of registered entities */}
                      {state.registeredEntities.map(ent => (
                        <div key={ent.id} className={`p-4 rounded-xl border bg-slate-950/40 space-y-3 transition-all ${
                          selectedAudioProfileId === ent.id ? 'border-emerald-500 bg-slate-950/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-850'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2.5 items-start">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                                {ent.type === 'phone' ? 'üì±' : 'üéí'}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-white truncate max-w-[120px]">{ent.name}</h5>
                                <span className="text-[8px] font-mono text-slate-500 uppercase">{ent.type}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedAudioProfileId(ent.id)}
                              className="text-[9px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/10 transition cursor-pointer"
                            >
                              SELECT
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${ent.vocalScramblerEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                              Scrambler: {ent.vocalScramblerEnabled ? 'ON' : 'OFF'}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${ent.acousticWatermarkingEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                              Watermark: {ent.acousticWatermarkingEnabled ? 'ON' : 'OFF'}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${ent.ultrasonicMicSaturationEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                              Saturation: {ent.ultrasonicMicSaturationEnabled ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Alerts & App Settings Hub */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              {/* OS Window 1: Alerts & Notifications Configurator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* OS Window Title Bar */}
                <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" title="Close" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Alerts & Notifications Configurator</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Window Content */}
                <div className="p-5 sm:p-6 space-y-6 bg-slate-900/10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column A: Delivery Toggles */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800/80 pb-2">Alert Triggers & Delivery Channels</h4>
                      
                      <div className="space-y-3">
                        {/* Master Push */}
                        <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          state.enablePushNotifications 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400 hover:border-slate-800'
                        }`}>
                          <input
                            type="checkbox"
                            checked={!!state.enablePushNotifications}
                            onChange={(e) => onChange({ ...state, enablePushNotifications: e.target.checked })}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold block text-white flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              Push Notification Banners
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Deliver real-time high-priority floating toast banners whenever a nearby camera scans your beacon.
                            </span>
                          </div>
                        </label>

                        {/* Master Haptic Buzz */}
                        <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          state.enablePhoneBuzz 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400 hover:border-slate-800'
                        }`}>
                          <input
                            type="checkbox"
                            checked={!!state.enablePhoneBuzz}
                            onChange={(e) => onChange({ ...state, enablePhoneBuzz: e.target.checked })}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold block text-white flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                              Pocket Haptic Vibrations
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Simulate immediate physical vibration ticks on your smartphone when recording handshakes trigger.
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="pt-2 space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trigger on Specific Events</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/80 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={!!state.notifyOnChildEngaged}
                              onChange={(e) => onChange({ ...state, notifyOnChildEngaged: e.target.checked })}
                              className="rounded border-slate-800 text-emerald-500 bg-slate-950"
                            />
                            <span className="text-slate-300">Child Tag Scans</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/80 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={!!state.notifyOnVideoFound}
                              onChange={(e) => onChange({ ...state, notifyOnVideoFound: e.target.checked })}
                              className="rounded border-slate-800 text-emerald-500 bg-slate-950"
                            />
                            <span className="text-slate-300">Online Video Matches</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/80 cursor-pointer text-xs sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={!!state.notifyOnVideoDeleted}
                              onChange={(e) => onChange({ ...state, notifyOnVideoDeleted: e.target.checked })}
                              className="rounded border-slate-800 text-emerald-500 bg-slate-950"
                            />
                            <span className="text-slate-300">Retroactive Takedown Success Confirmations</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Column B: Alert Details Customizer & Sound Selection */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800/80 pb-2">Display Filter & Sound Chimes</h4>

                      <div className="space-y-3">
                        {/* Toggle Distance */}
                        <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          state.notificationShowDistance !== false 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400 hover:border-slate-800'
                        }`}>
                          <input
                            type="checkbox"
                            checked={state.notificationShowDistance !== false}
                            onChange={(e) => onChange({ ...state, notificationShowDistance: e.target.checked })}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold block text-white">Display Device Distance</span>
                            <span className="text-[10px] text-slate-400 block">
                              Include simulated distance estimates (e.g. "1.8m away") inside your banner alert descriptions.
                            </span>
                          </div>
                        </label>

                        {/* Toggle Model */}
                        <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          state.notificationShowModel !== false 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400 hover:border-slate-800'
                        }`}>
                          <input
                            type="checkbox"
                            checked={state.notificationShowModel !== false}
                            onChange={(e) => onChange({ ...state, notificationShowModel: e.target.checked })}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold block text-white">Display Smart Glasses / Device Model</span>
                            <span className="text-[10px] text-slate-400 block">
                              Show specific camera models (e.g. "Meta Ray-Ban v3") or restrict display to generic labels (e.g. "a smart device").
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Sound Selection Dropdown */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-300">Alert Chime Sound</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Synthesizer Mode</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'sonar_chime', label: 'üîä Sonar Chime' },
                            { value: 'tactical_click', label: 'üîä Tactical Click' },
                            { value: 'silent_glow', label: 'üîä Silent Glow' }
                          ].map((chime) => (
                            <button
                              key={chime.value}
                              type="button"
                              onClick={() => {
                                const newSound = chime.value as any;
                                onChange({ ...state, notificationSound: newSound });
                                playLocalSoundTest(newSound, state.notificationSoundVolume || 80);
                              }}
                              className={`p-2 rounded-lg border text-xs text-center font-semibold transition-all ${
                                state.notificationSound === chime.value 
                                  ? 'bg-emerald-950/30 border-emerald-500 text-white' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {chime.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => playLocalSoundTest(state.notificationSound || 'sonar_chime', state.notificationSoundVolume || 80)}
                            className="p-2 rounded-lg border text-xs text-center font-bold bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                          >
                            ‚ö° Test Chime
                          </button>
                        </div>

                        {/* Volume Slider */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Chime Volume</span>
                            <span className="font-bold text-slate-200">{(state.notificationSoundVolume !== undefined ? state.notificationSoundVolume : 80)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(state.notificationSoundVolume !== undefined ? state.notificationSoundVolume : 80)}
                            onChange={(e) => onChange({ ...state, notificationSoundVolume: parseInt(e.target.value) })}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Configuration Section for Battery Percentage Threshold */}
                  <div className="border-t border-slate-800/80 pt-6 mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <Battery className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Hardware Battery Telemetry Alerts</h4>
                        <p className="text-[10px] text-slate-400">
                          Configure personalized battery percentage thresholds for instant alert dispatches on all registered active companion devices.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                      {/* Left: Custom Control Panel */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200">Enable Low-Battery Alerts</span>
                            <button
                              type="button"
                              id="toggle-low-battery-notifications-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onChange({ 
                                  ...state, 
                                  enableLowBatteryNotifications: !state.enableLowBatteryNotifications 
                                });
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                state.enableLowBatteryNotifications !== false ? 'bg-emerald-500/85' : 'bg-slate-800'
                              }`}
                              title={state.enableLowBatteryNotifications !== false ? "Disable Low Battery Notifications" : "Enable Low Battery Notifications"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  state.enableLowBatteryNotifications !== false ? 'translate-x-4' : 'translate-x-0 bg-slate-400'
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Deliver urgent push notifications and fire synchronized pocket haptics when wearable device batteries drop below safety levels.
                          </p>
                        </div>

                        {/* Slider Control */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-300">Custom Alert Threshold</span>
                            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                              (state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20) <= 15
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : (state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20) <= 25
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20}%
                            </span>
                          </div>
                          <input
                            type="range"
                            id="low-battery-threshold-input-slider"
                            min="5"
                            max="50"
                            step="1"
                            value={state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20}
                            onChange={(e) => {
                              onChange({ 
                                ...state, 
                                lowBatteryThreshold: parseInt(e.target.value) 
                              });
                            }}
                            className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                            title="Set custom battery threshold (5% - 50%)"
                          />
                          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                            <span>5% (Critical)</span>
                            <span>20% (Default)</span>
                            <span>50% (High)</span>
                          </div>
                        </div>

                        {/* Simulate / Trigger Test Alert Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            id="test-battery-alert-btn"
                            disabled={state.enableLowBatteryNotifications === false}
                            onClick={() => {
                              const threshold = state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20;
                              // Pick a device to simulate dropping
                              const entities = state.registeredEntities || [];
                              const targetDevice = entities.find(e => e.isActive) || entities[0];
                              const deviceName = targetDevice ? targetDevice.name : "Companion Beacon Tag";
                              
                              if (onTriggerAlert) {
                                onTriggerAlert(
                                  "Critical Battery Warning",
                                  `Companion hardware '${deviceName}' battery drops below safe threshold (currently at ${Math.min(targetDevice ? targetDevice.batteryPercent : 15, threshold - 2)}%, threshold set at ${threshold}%).`,
                                  "battery_warning"
                                );
                              }

                              if (onAddLog) {
                                onAddLog({
                                  deviceModel: 'BATTERY_TELEMETRY',
                                  action: 'discovered',
                                  shieldApplied: `ALERT DISPATCHED: ${deviceName.toUpperCase()} DROPPED BELOW ${threshold}%`,
                                  distance: 0,
                                  rotatedId: 'BATTERY_CRITICAL'
                                });
                              }
                            }}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center gap-2 border ${
                              state.enableLowBatteryNotifications !== false
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer'
                                : 'bg-slate-900/40 border-slate-900 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <BatteryWarning className="w-3.5 h-3.5" />
                            Dispatch Test Low-Battery Alert
                          </button>
                        </div>
                      </div>

                      {/* Right: Live Telemetry Preview */}
                      <div className="space-y-3 bg-slate-950/65 p-3 rounded-lg border border-slate-900/60 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Registered Devices</span>
                            <span className="text-[9px] text-slate-500 font-mono">Live Simulation</span>
                          </div>

                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                            {(state.registeredEntities || []).map(entity => {
                              const threshold = state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20;
                              const isLow = entity.batteryPercent <= threshold;
                              
                              return (
                                <div key={entity.id} className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-300 truncate max-w-[150px] font-medium">{entity.name}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-mono font-bold ${
                                        isLow ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                                      }`}>
                                        {entity.batteryPercent}%
                                      </span>
                                      {isLow ? (
                                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/25 animate-pulse">
                                          WARNING
                                        </span>
                                      ) : (
                                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                          NOMINAL
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Progress Bar Visual Gauge */}
                                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isLow ? 'bg-rose-500' : 'bg-emerald-400/80'
                                      }`}
                                      style={{ width: `${entity.batteryPercent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Dynamic Status summary footer */}
                        <div className="text-[9px] text-slate-500 bg-slate-900/40 p-2 rounded border border-slate-900/50 font-mono flex items-center gap-2 mt-2">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </div>
                          <span>
                            {(() => {
                              const threshold = state.lowBatteryThreshold !== undefined ? state.lowBatteryThreshold : 20;
                              const lowDevices = (state.registeredEntities || []).filter(e => e.batteryPercent <= threshold);
                              if (lowDevices.length > 0) {
                                return `Detected ${lowDevices.length} device(s) below custom threshold. ${state.enableLowBatteryNotifications !== false ? "Notifications will trigger." : "Notifications muted."}`;
                              }
                              return "All companion devices operating above critical battery threshold.";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OS Window: Alert Customizer & Vibration Pattern Configurator */}
              <div id="vibration-alert-customizer" className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* OS Window Title Bar */}
                <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" title="Close" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Alert Customizer &amp; Vibration Pattern Configurator</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>HAPTIC ENGINE ACTIVE</span>
                  </div>
                </div>

                {/* Window Content */}
                <div className="p-5 sm:p-6 bg-slate-900/10 space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Personalize physical haptic feedback pulses transmitted to your smartphone or companion badge. This leverages the browser's native <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">Vibration API</code> with custom millisecond sequences.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Alert Type Selector (4 cols) */}
                    <div className="lg:col-span-4 space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Select Target Event Alert</span>
                      <div className="space-y-2">
                        {(Object.entries(vibrationPatterns) as [string, { name: string; pattern: number[]; desc: string }][]).map(([id, item]) => {
                          const isEditing = editingPatternId === id;
                          const isTesting = activeTestingPatternId === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                setEditingPatternId(id);
                                setCustomizerSuccessMsg('');
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                isEditing
                                  ? 'bg-emerald-950/20 border-emerald-500 text-slate-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                  : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-xs font-bold block">{item.name}</span>
                                <span className="text-[9px] text-slate-500 block truncate max-w-[170px]">{item.desc}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono text-slate-400 border border-slate-800">
                                  {item.pattern.length} pulses
                                </span>
                                {isTesting && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Panel: Pattern Editor & Real-Time Test (8 cols) */}
                    <div className="lg:col-span-8 bg-slate-950/40 p-5 border border-slate-850 rounded-xl space-y-5 flex flex-col justify-between">
                      {(() => {
                        const currentItem = vibrationPatterns[editingPatternId];
                        if (!currentItem) return <div className="text-slate-500 text-xs font-mono">Select an alert type above.</div>;

                        const parsedArr = patternInputText
                          .split(',')
                          .map(x => parseInt(x.trim()))
                          .filter(x => !isNaN(x));
                        const isValid = parsedArr.length > 0 && parsedArr.every(x => x >= 0);
                        const totalDuration = parsedArr.reduce((a, b) => a + b, 0);

                        return (
                          <div className="space-y-4">
                            {/* Heading */}
                            <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                                  Edit Pattern: {currentItem.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{currentItem.desc}</p>
                              </div>
                              <span className="text-[9px] bg-slate-900 text-emerald-400 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                Active Customizer
                              </span>
                            </div>

                            {/* Live Pattern Testing & Fallback Visualizer */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 p-4 border border-slate-900 rounded-lg">
                              <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
                                {/* Interactive vibrating visual frame */}
                                <motion.div
                                  animate={visualVibrationTicks ? { 
                                    scale: [1, 1.15, 0.95, 1.1, 1], 
                                    rotate: [0, -4, 4, -4, 0],
                                    x: [0, -3, 3, -3, 0]
                                  } : { scale: 1 }}
                                  transition={visualVibrationTicks ? { repeat: Infinity, duration: 0.15 } : {}}
                                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-100 ${
                                    visualVibrationTicks 
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                      : 'bg-slate-900 border-slate-850 text-slate-500'
                                  }`}
                                >
                                  <Activity className={`w-7 h-7 ${visualVibrationTicks ? 'text-emerald-400' : 'text-slate-500'}`} />
                                </motion.div>
                                <span className={`text-[8px] font-mono mt-2 block font-extrabold uppercase ${
                                  visualVibrationTicks ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                                }`}>
                                  {visualVibrationTicks ? '‚ö° Buzzing Device ‚ö°' : 'Standby / Idle'}
                                </span>
                              </div>

                              <div className="md:col-span-8 space-y-2">
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Dynamic Simulated Signal Stream</span>
                                <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg font-mono text-[10px] text-slate-300 space-y-1.5 relative overflow-hidden">
                                  {/* Waveform indicator */}
                                  <div className="flex gap-0.5 items-end h-8 overflow-hidden">
                                    {parsedArr.map((duration, index) => {
                                      const isVibrate = index % 2 === 0;
                                      const heightPct = isVibrate ? 'h-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'h-1 bg-slate-800';
                                      const widthPx = Math.min(Math.max(duration / 10, 8), 100);
                                      return (
                                        <div 
                                          key={index} 
                                          style={{ width: `${widthPx}px` }} 
                                          className={`rounded-t transition-all ${heightPct}`} 
                                          title={`${isVibrate ? 'Vibrate' : 'Delay'}: ${duration}ms`}
                                        />
                                      );
                                    })}
                                    {parsedArr.length === 0 && (
                                      <div className="text-slate-500 text-xs italic flex items-center h-full">Empty sequence graph</div>
                                    )}
                                  </div>
                                  <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-900">
                                    <span>T = 0ms</span>
                                    <span>Total: {totalDuration}ms</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* User Custom Input Form */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-semibold text-slate-300">Custom Sequence (Milliseconds)</span>
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                  isValid 
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                }`}>
                                  {isValid ? '‚úÖ Formatted Correctly' : '‚ùå Needs integers (e.g. 200, 100)'}
                                </span>
                              </div>
                              
                              <input
                                type="text"
                                value={patternInputText}
                                onChange={(e) => {
                                  setPatternInputText(e.target.value);
                                  setCustomizerSuccessMsg('');
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                                placeholder="e.g. 200, 100, 200, 100, 400"
                              />
                              <p className="text-[9px] text-slate-500">
                                Enter comma-separated millisecond values. Even slots index vibration intervals, odd slots represent idle pause gaps. E.g. <strong className="text-slate-400 font-mono">400, 100, 100</strong> translates to 400ms buzz, 100ms silence, 100ms buzz.
                              </p>
                            </div>

                            {/* Quick Preset Selector */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Quick Presets / Inspiration Library</span>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                  { name: 'Long-Short-Long Pulse', pattern: [400, 100, 100, 100, 400] },
                                  { name: 'Double Fast Tap', pattern: [100, 50, 100] },
                                  { name: 'SOS Urgent Beacon', pattern: [100, 100, 100, 200, 200, 200, 100, 100, 100] },
                                  { name: 'Rhythmic Heartbeat', pattern: [80, 80, 80, 300, 80, 80, 80] },
                                  { name: 'Single Solid Alert', pattern: [500] }
                                ].map((preset, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      setPatternInputText(preset.pattern.join(', '));
                                      playLocalSoundTest('tactical_click', 50);
                                      setCustomizerSuccessMsg('');
                                    }}
                                    className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-slate-200 rounded text-left transition truncate block"
                                  >
                                    üí° {preset.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Success feedback line */}
                            {customizerSuccessMsg && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 animate-fadeIn">
                                <Check className="w-3.5 h-3.5" />
                                {customizerSuccessMsg}
                              </div>
                            )}

                            {/* Save and Test Buttons */}
                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                disabled={activeTestingPatternId !== null}
                                onClick={() => testVibrationPattern(editingPatternId, parsedArr)}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border ${
                                  activeTestingPatternId !== null
                                    ? 'bg-slate-900/40 border-slate-900 text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                                }`}
                              >
                                <Zap className="w-3.5 h-3.5" />
                                {activeTestingPatternId === editingPatternId ? 'Simulating Pattern...' : 'Test Pattern'}
                              </button>

                              <button
                                type="button"
                                disabled={!isValid}
                                onClick={() => {
                                  if (!isValid) return;
                                  const updated = {
                                    ...vibrationPatterns,
                                    [editingPatternId]: {
                                      ...currentItem,
                                      pattern: parsedArr
                                    }
                                  };
                                  setVibrationPatterns(updated);
                                  localStorage.setItem('blurbubble_custom_vibrations', JSON.stringify(updated));
                                  setCustomizerSuccessMsg(`Successfully saved updated pattern for '${currentItem.name}'! Persistent browser storage active.`);
                                  playLocalSoundTest('tactical_click', 80);

                                  if (onAddLog) {
                                    onAddLog({
                                      deviceModel: 'HAPTIC_ENGINE',
                                      action: 'discovered',
                                      shieldApplied: `VIBRATION PATTERN RECONFIGURED: ${currentItem.name.toUpperCase()} => [${parsedArr.join(', ')}]`,
                                      distance: 0,
                                      rotatedId: 'HAPTIC_CONFIG'
                                    });
                                  }
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                  isValid 
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Save Updated Pattern
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* OS Window 2: Quick-Access System Preferences */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* OS Window Title Bar */}
                <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" title="Close" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">Quick-Access System Preferences</span>
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
                    ACTIVE MODULES
                  </div>
                </div>

                {/* Window Content */}
                <div className="p-5 sm:p-6 bg-slate-900/10 space-y-6">
                  <p className="text-xs text-slate-400">
                    A centralized control center to quickly tweak active shield levels, broadcast power range, connected SSI automaton triggers, and main theme styles.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Preference Item 1: Broadcast Switch */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">Signal Transmission</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${state.isBroadcasting ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                          {state.isBroadcasting ? 'Broadcasting' : 'Silent'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Main toggle for local BLE and WiFi-NAN opt-out packets.
                      </p>
                      <button
                        type="button"
                        onClick={() => onChange({ ...state, isBroadcasting: !state.isBroadcasting })}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                          state.isBroadcasting 
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                        }`}
                      >
                        {state.isBroadcasting ? 'Disable Broadcast' : 'Enable Broadcast'}
                      </button>
                    </div>

                    {/* Preference Item 2: Range Meters */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">Signal Range</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{state.rangeMeters} Meters</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Power consumption level for signal bubble radius.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={state.rangeMeters}
                          onChange={(e) => onChange({ ...state, rangeMeters: parseInt(e.target.value) })}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>1m (Close)</span>
                          <span>50m (Max)</span>
                        </div>
                      </div>
                    </div>

                    {/* Preference Item 3: Shield Privacy Level */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">Default Privacy Level</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">{state.privacyLevel.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Blur style requested during nearby device handshakes.
                      </p>
                      <select
                        value={state.privacyLevel}
                        onChange={(e) => onChange({ ...state, privacyLevel: e.target.value as PrivacyLevel })}
                        className="w-full p-2 bg-slate-900 border border-slate-800 text-xs rounded-lg text-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      >
                        <option value="strict_blur">Gaussian Blur</option>
                        <option value="pixelate">Pixelate Matrix</option>
                        <option value="emoji">Emoji Overlay Mask</option>
                        <option value="black_bar">Black Bar Censored</option>
                        <option value="magic_removal">AI Magic Eraser</option>
                      </select>
                    </div>

                    {/* Preference Item 4: SSID Automate Rule */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">SSID Automation</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${state.wifiRulesEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                          {state.wifiRulesEnabled ? 'Auto SSID' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Auto-broadcast rules triggered by Wi-Fi connections.
                      </p>
                      <button
                        type="button"
                        onClick={() => onChange({ ...state, wifiRulesEnabled: !state.wifiRulesEnabled })}
                        className={`w-full py-2 rounded-lg text-xs font-bold border transition ${
                          state.wifiRulesEnabled 
                            ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {state.wifiRulesEnabled ? 'SSID Rules On' : 'SSID Rules Off'}
                      </button>
                    </div>

                    {/* Preference Item 5: Biometric Pin */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">Security Lock</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${state.biometricLockEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                          {state.biometricLockEnabled ? 'Locked' : 'Open'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        PIN or fingerprint challenge for access control.
                      </p>
                      <button
                        type="button"
                        onClick={() => onChange({ ...state, biometricLockEnabled: !state.biometricLockEnabled })}
                        className={`w-full py-2 rounded-lg text-xs font-bold border transition ${
                          state.biometricLockEnabled 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {state.biometricLockEnabled ? 'Disable Lock' : 'Enable Security Lock'}
                      </button>
                    </div>

                    {/* Preference Item 6: Layout Reset */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white block">Factory Defaults</span>
                        <span className="text-[10px] text-slate-500 font-mono">STEALTH</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Reset configuration profiles, clears counters and saved keys.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...state,
                            isBroadcasting: true,
                            privacyLevel: 'strict_blur',
                            rangeMeters: 12,
                            facialRecognitionOptOut: true,
                            dataRetentionPref: 'zero_retention',
                            enablePhoneBuzz: true,
                            enablePushNotifications: true,
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
                            theme: 'stealth',
                            biometricLockEnabled: false,
                            wifiRulesEnabled: true,
                            showMetricsBar: true,
                            showControlBar: true,
                            showAuditLogs: true,
                            showEmergencyButton: true,
                            showGuideButton: true
                          });
                        }}
                        className="w-full py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition"
                      >
                        Reset All Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 1: Signal & Shield */}
          {activeTab === 'signal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-1 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Do Not Record Status (Signal Beacon)
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {state.isBroadcasting ? 'Broadcasting "Do Not Record" Signal' : 'Signal Offline / Hidden Mode'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Sends dynamic BLE and WiFi-NAN packets instructing cameras and glasses to block your recording coordinates.
                  </p>
                </div>
                <button
                  id="beacon-toggle-btn"
                  onClick={() => onChange({ ...state, isBroadcasting: !state.isBroadcasting })}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-lg shrink-0 ${
                    state.isBroadcasting
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                      : 'bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300'
                  }`}
                >
                  {state.isBroadcasting ? 'Broadcasting ON' : 'Broadcasting OFF'}
                </button>
              </div>

              {state.isBroadcasting && (
                <div className="space-y-4">
                  {/* Key Rotation Widgets (Local rolling key & 15-min UUID) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Local rolling key */}
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          Rolling Anonymous Local Key
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2 py-1 rounded">
                            {state.anonymousId.match(/.{1,4}/g)?.join('-') || state.anonymousId}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-400" style={{ animationDuration: '6s' }} />
                            {timeLeft}s
                          </span>
                        </div>
                      </div>

                      <div className="w-24 bg-slate-900 rounded-full h-1 overflow-hidden shrink-0">
                        <div 
                          className="bg-blue-400 h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Global BLE UUID Rotation countdown */}
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                          Decentralized BLE UUID Rotation
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-1 rounded">
                            UUID_CYCLE_{Math.floor(uuidTimeLeft / 60) + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono font-bold">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-400" style={{ animationDuration: '15s' }} />
                            {Math.floor(uuidTimeLeft / 60)}:{(uuidTimeLeft % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <div className="w-24 bg-slate-900 rounded-full h-1 overflow-hidden shrink-0">
                        <div 
                          className="bg-indigo-400 h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${(uuidTimeLeft / 900) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive SVG Signal Radar / Bubble Visualizer */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                    <div className="text-center space-y-1 w-full border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Dynamic Signal Range Radar
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Click &amp; drag the outer green boundary ring to scale your opt-out broadcast bubble.
                      </p>
                    </div>

                    {/* SVG RADAR CONTAINER */}
                    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                      <svg
                        viewBox="0 0 280 280"
                        className="w-full h-full select-none"
                        onMouseDown={(e) => handleSvgInteraction(e, true)}
                        onMouseMove={(e) => {
                          if (isDraggingRange) {
                            handleSvgInteraction(e);
                          }
                        }}
                        onMouseUp={() => setIsDraggingRange(false)}
                        onMouseLeave={() => setIsDraggingRange(false)}
                        onTouchStart={(e) => handleSvgInteraction(e, true)}
                        onTouchMove={(e) => {
                          if (isDraggingRange) {
                            handleSvgInteraction(e);
                          }
                        }}
                        onTouchEnd={() => setIsDraggingRange(false)}
                      >
                        <defs>
                          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </radialGradient>
                          <linearGradient id="sweepGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                          </linearGradient>
                        </defs>

                        {/* Concentric Circle Grids */}
                        <circle cx="140" cy="140" r="30" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="140" cy="140" r="60" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="140" cy="140" r="90" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Cross Hair Axis Lines */}
                        <line x1="140" y1="10" x2="140" y2="270" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
                        <line x1="10" y1="140" x2="270" y2="140" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />

                        {/* Range Label Markings */}
                        <text x="140" y="105" fill="rgba(16, 185, 129, 0.35)" fontSize="8" fontFamily="monospace" textAnchor="middle">10m</text>
                        <text x="140" y="75" fill="rgba(16, 185, 129, 0.35)" fontSize="8" fontFamily="monospace" textAnchor="middle">20m</text>
                        <text x="140" y="45" fill="rgba(16, 185, 129, 0.35)" fontSize="8" fontFamily="monospace" textAnchor="middle">30m</text>
                        <text x="140" y="15" fill="rgba(16, 185, 129, 0.35)" fontSize="8" fontFamily="monospace" textAnchor="middle">40m</text>

                        {/* Dynamic Radar Sweep Hand */}
                        {state.isBroadcasting && (
                          <g className="origin-[140px_140px] animate-[spin_5s_linear_infinite]">
                            <line x1="140" y1="140" x2="140" y2="20" stroke="#10b981" strokeWidth="1" strokeOpacity="0.25" />
                            <path d="M 140 140 L 140 20 A 120 120 0 0 1 224.8 55.2 Z" fill="url(#sweepGradient)" />
                          </g>
                        )}

                        {/* Opt-Out Broadcast Boundary Circle (Interactive Drag Area) */}
                        <circle
                          cx="140"
                          cy="140"
                          r={state.rangeMeters * 3}
                          fill="url(#radarSweep)"
                          stroke="#10b981"
                          strokeWidth={isDraggingRange ? "3" : "1.5"}
                          strokeDasharray={isDraggingRange ? "none" : "4 2"}
                          className="transition-all duration-75 ease-out cursor-ns-resize"
                          opacity={state.isBroadcasting ? 1 : 0.15}
                        />

                        {/* Drag Handle Knob */}
                        {state.isBroadcasting && (
                          <circle
                            cx="140"
                            cy={140 - (state.rangeMeters * 3)}
                            r="6"
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="cursor-ns-resize shadow-md"
                          />
                        )}

                        {/* Center Beacon Station (Self) */}
                        <circle cx="140" cy="140" r="7" fill={state.isBroadcasting ? "#10b981" : "#64748b"} />
                        {state.isBroadcasting && (
                          <circle cx="140" cy="140" r="14" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping opacity-40" />
                        )}

                        {/* Simulated Nearby Threat 1: CCTV Camera (22m out) */}
                        <g>
                          {(() => {
                            const d_x = 140 + Math.cos(2.3) * (22 * 3);
                            const d_y = 140 + Math.sin(2.3) * (22 * 3);
                            const isShielded = state.isBroadcasting && state.rangeMeters >= 22;
                            return (
                              <>
                                <circle cx={d_x} cy={d_y} r="5" fill={isShielded ? "#10b981" : "#ef4444"} className={isShielded ? "" : "animate-pulse"} />
                                <circle cx={d_x} cy={d_y} r="10" fill="none" stroke={isShielded ? "#10b981" : "#ef4444"} strokeWidth="0.5" className="animate-ping" style={{ animationDuration: isShielded ? '3s' : '1.5s' }} />
                                <text x={d_x} y={d_y - 8} fill="#94a3b8" fontSize="6" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                  {isShielded ? "üîí CCTV (Blurred)" : "üìπ CCTV (Recording)"}
                                </text>
                              </>
                            );
                          })()}
                        </g>

                        {/* Simulated Nearby Threat 2: Drone Camera (35m out) */}
                        <g>
                          {(() => {
                            const d_x = 140 + Math.cos(-0.5) * (35 * 3);
                            const d_y = 140 + Math.sin(-0.5) * (35 * 3);
                            const isShielded = state.isBroadcasting && state.rangeMeters >= 35;
                            return (
                              <>
                                <circle cx={d_x} cy={d_y} r="5" fill={isShielded ? "#10b981" : "#ef4444"} className={isShielded ? "" : "animate-pulse"} />
                                <circle cx={d_x} cy={d_y} r="10" fill="none" stroke={isShielded ? "#10b981" : "#ef4444"} strokeWidth="0.5" className="animate-ping" style={{ animationDuration: isShielded ? '3s' : '1.8s' }} />
                                <text x={d_x} y={d_y - 8} fill="#94a3b8" fontSize="6" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                  {isShielded ? "üîí Drone (Blocked)" : "üöÅ Drone (Scanning)"}
                                </text>
                              </>
                            );
                          })()}
                        </g>

                        {/* Simulated Nearby Threat 3: Wearable HUD Glasses (12m out) */}
                        <g>
                          {(() => {
                            const d_x = 140 + Math.cos(4.2) * (12 * 3);
                            const d_y = 140 + Math.sin(4.2) * (12 * 3);
                            const isShielded = state.isBroadcasting && state.rangeMeters >= 12;
                            return (
                              <>
                                <circle cx={d_x} cy={d_y} r="5" fill={isShielded ? "#10b981" : "#ef4444"} className={isShielded ? "" : "animate-pulse"} />
                                <circle cx={d_x} cy={d_y} r="10" fill="none" stroke={isShielded ? "#10b981" : "#ef4444"} strokeWidth="0.5" className="animate-ping" style={{ animationDuration: isShielded ? '2.5s' : '1.2s' }} />
                                <text x={d_x} y={d_y - 8} fill="#94a3b8" fontSize="6" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                  {isShielded ? "üîí Glasses (Muted)" : "üï∂Ô∏è Smart Glasses"}
                                </text>
                              </>
                            );
                          })()}
                        </g>

                        {/* Custom Placed Radar Nodes */}
                        {state.isBroadcasting && customRadarNodes.map((node) => {
                          const isShielded = state.isBroadcasting && state.rangeMeters >= node.distance;
                          const nodeColor = node.type === 'beacon' ? '#10b981' : (isShielded ? '#10b981' : '#ef4444');
                          return (
                            <g key={node.id} className="cursor-pointer" onClick={(ev) => {
                              ev.stopPropagation();
                              // Pulse/Interact with custom node
                              onAddLog({
                                deviceModel: node.name,
                                action: node.type === 'beacon' ? 'discovered' : 'censored',
                                shieldApplied: 'PERIMETER_RE-EVALUATED_SHAKEHAND',
                                distance: node.distance,
                                rotatedId: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase()
                              });
                            }}>
                              <circle cx={node.x} cy={node.y} r="5.5" fill={nodeColor} />
                              <circle cx={node.x} cy={node.y} r="11" fill="none" stroke={nodeColor} strokeWidth="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />
                              <text x={node.x} y={node.y - 8} fill="#a7f3d0" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">
                                {node.type === 'beacon' ? `üì° ${node.name}` : (isShielded ? `üîí ${node.name}` : `‚ö†Ô∏è ${node.name}`)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Live overlay when signal is offline */}
                      {!state.isBroadcasting && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                          <Radio className="w-8 h-8 text-slate-500 mb-2" />
                          <span className="text-xs font-bold text-slate-400">Telemetry Offline</span>
                          <p className="text-[10px] text-slate-500 mt-1">Activate Do Not Record Status above to view and drag your shield range perimeter.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2 bg-slate-950/30 border border-slate-800/40 rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 uppercase tracking-wider font-semibold">Broadcast Range (Fine Tune)</span>
                      <span className="text-emerald-400 font-bold font-mono">{state.rangeMeters} Meters</span>
                    </div>
                    <input
                      id="beacon-range-slider"
                      type="range"
                      min="3"
                      max="40"
                      value={state.rangeMeters}
                      onChange={(e) => onChange({ ...state, rangeMeters: Number(e.target.value) })}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Approximate signal reach. Recording smart devices inside this boundary will blur you out automatically.
                    </p>
                  </div>

                  {/* Real-time Signal Strength & Optimization Console */}
                  <div id="realtime-signal-visualizer-container" className="space-y-3 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Bluetooth className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        Real-Time Hardware Signal Telemetry (BLE)
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded">
                        Scanning
                      </span>
                    </div>

                    <div className="space-y-3">
                      {state.registeredEntities.filter(tag => tag.isActive).length === 0 ? (
                        <div id="no-active-beacons-warning" className="text-center py-4 text-slate-500 text-xs">
                          <p className="font-sans font-semibold">No active BlurBubble beacons nearby.</p>
                          <p className="text-[10px] text-slate-600 mt-1">Activate or unmute tags in the "Smart Tags" tab, or pair new ones in the "Hardware Pairing" tab to start visual range telemetry.</p>
                        </div>
                      ) : (
                        state.registeredEntities.filter(tag => tag.isActive).map(tag => {
                          const noise = signalNoise[tag.id] || 0;
                          // Base signal strength at 1 meter: -35 dBm.
                          // As rangeMeters increases, we simulate higher TX power (boosts signal strength).
                          const txPowerOffset = (state.rangeMeters - 12) * 1.1;
                          const rawStrength = (tag.signalStrength || -60) + txPowerOffset + noise;
                          
                          // Clamp between -95 and -30
                          const dbm = Math.min(-30, Math.max(-95, Math.round(rawStrength)));
                          
                          // Signal rating
                          let signalClass = "text-emerald-400";
                          let bgBarClass = "bg-emerald-500";
                          let ratingText = "Optimal Coverage";
                          let recommendation = "Coverage is solid. Your device will trigger blurs reliably.";

                          if (dbm < -80) {
                            signalClass = "text-rose-400 animate-pulse";
                            bgBarClass = "bg-rose-500";
                            ratingText = "Critical Attenuation";
                            recommendation = "Signal weak. Increase Broadcast Range (TX Power) or move closer.";
                          } else if (dbm < -65) {
                            signalClass = "text-amber-400";
                            bgBarClass = "bg-amber-500";
                            ratingText = "Moderate / Fading";
                            recommendation = "Intermittent drops possible. Slightly boost Broadcast Range.";
                          }

                          // Percentage for visual signal bar (e.g. -95dBm is 0%, -30dBm is 100%)
                          const strengthPercent = Math.round(((dbm - (-95)) / (-30 - (-95))) * 100);

                          return (
                            <div key={tag.id} id={`signal-item-${tag.id}`} className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {tag.type === 'smart_tag' ? 'üéí' : 
                                     tag.type === 'phone' ? 'üì±' : 
                                     tag.type === 'airtag' ? 'üçé' : 
                                     tag.type === 'galaxy_tag' ? 'üåå' : 
                                     tag.type === 'key_fob' ? 'üîë' : 
                                     tag.type === 'prototype' ? 'üî¨' : 
                                     tag.type === 'artwork' ? 'üé®' : 
                                     tag.type === 'building' ? 'üè¢' : 'üíé'}
                                  </span>
                                  <span className="font-semibold text-white">{tag.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">({tag.type})</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono">
                                  <span className={`font-bold ${signalClass}`}>{dbm} dBm</span>
                                  <span className="text-slate-500 text-[10px]">‚Ä¢</span>
                                  <span className="text-slate-400 font-sans text-[10px]">{ratingText}</span>
                                </div>
                              </div>

                              {/* Visual Bar Graph */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${bgBarClass}`}
                                    style={{ width: `${strengthPercent}%` }}
                                  />
                                </div>
                                {/* dBm scale label */}
                                <div className="flex justify-between text-[8px] text-slate-600 font-mono px-0.5">
                                  <span>-95 dBm (Limit)</span>
                                  <span>-75 dBm</span>
                                  <span>-55 dBm</span>
                                  <span>-30 dBm (Max)</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-400 italic">
                                üí° {recommendation}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  Censor Shield Mode
                  <button
                    type="button"
                    onClick={() => setHelpTopic('privacy-levels')}
                    className="p-0.5 rounded-full text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition"
                    title="What are the shield modes?"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400/80 animate-pulse" />
                  </button>
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {privacyOptions.map((opt) => {
                    const isActive = state.privacyLevel === opt.value;
                    return (
                      <button
                        id={`shield-option-${opt.value}`}
                        key={opt.value}
                        onClick={() => handleLevelChange(opt.value)}
                        disabled={!state.isBroadcasting}
                        className={`flex items-start gap-4 p-3.5 rounded-xl border text-left transition ${
                          isActive
                            ? `${opt.value === 'magic_removal' ? 'border-emerald-500 bg-emerald-950/20 text-white' : 'border-slate-300 bg-slate-850 text-white'}`
                            : 'border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 text-slate-400'
                        } ${!state.isBroadcasting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-850' : 'bg-slate-900'}`}>
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{opt.label}</span>
                            {isActive && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                                opt.value === 'magic_removal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'
                              }`}>
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-normal">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ethical Acoustic Shielding & Bystander Protection Panel */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      Ethical Acoustic Shielding &amp; Bystander Safety Core
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Ensures audio privacy without disrupting or jamming innocent bystander recordings and nearby conversations.
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 border border-blue-500/25 text-blue-400 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                    FCC Part 15 / CE RED Safe
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Explanation card */}
                  <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-lg text-xs leading-relaxed text-slate-300 font-sans">
                    üö´ <strong className="text-white">Anti-Intrusive Protocol:</strong> Broad-spectrum omnidirectional audio jamming is locked. Instead, BlurBubble utilizes <span className="text-emerald-400 font-semibold">Focused Acoustic Beamforming</span> and <span className="text-emerald-400 font-semibold">Real-Time Phase Cancellation</span>. This ensures that only the recording device pointed directly at you receives a blurred version of your voice, while your neighbors and friends can record their birthday parties, vlogs, and innocent street scenes completely interference-free.
                  </div>

                  {/* Mode Selector buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Beamforming Mode */}
                    <button
                      type="button"
                      onClick={() => setAcousticMode('beamforming')}
                      className={`p-3 rounded-lg border text-left transition flex flex-col gap-1.5 ${
                        acousticMode === 'beamforming'
                          ? 'bg-emerald-950/15 border-emerald-500/50 text-white'
                          : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <Volume2 className={`w-3.5 h-3.5 ${acousticMode === 'beamforming' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>Focused Beamforming</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Targets the recording lens directly (¬±{beamformingAngle}¬∞). Surrounding bystanders are 100% unaffected.
                      </p>
                    </button>

                    {/* Selective Voice Eraser */}
                    <button
                      type="button"
                      onClick={() => setAcousticMode('voice_isolation')}
                      className={`p-3 rounded-lg border text-left transition flex flex-col gap-1.5 ${
                        acousticMode === 'voice_isolation'
                          ? 'bg-emerald-950/15 border-emerald-500/50 text-white'
                          : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <User className={`w-3.5 h-3.5 ${acousticMode === 'voice_isolation' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>Personal Voice Eraser</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Calculates phase cancellation for your voice-print signature *only*. Ambient sounds pass clearly.
                      </p>
                    </button>

                    {/* Wide-Area Acoustic Jamming (RESTRICTED) */}
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                          detail: { 
                            title: 'Access Restricted',
                            body: 'Wide-Area Jamming requires an Enterprise Compliance License. Personal beacons are hard-locked to Ethical Beamforming to prevent illegal signal interference.',
                            type: 'restricted'
                          } 
                        }));
                      }}
                      className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/20 text-slate-500 cursor-not-allowed opacity-60 text-left flex flex-col gap-1.5 relative overflow-hidden group"
                    >
                      <div className="absolute top-1.5 right-1.5">
                        <Lock className="w-3 h-3 text-red-500" />
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-500">
                        <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                        <span>Wide-Area Jamming</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        Omnidirectional ultrasound. Hard-locked to avoid interfering with innocent public recordings.
                      </p>
                    </button>
                  </div>

                  {/* Beamforming angle control */}
                  {acousticMode === 'beamforming' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-slate-500" />
                          Acoustic Targeting Dispersion Angle
                        </span>
                        <span className="text-emerald-400 font-bold font-mono">¬±{beamformingAngle}¬∞ Directional Cone</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="45"
                        value={beamformingAngle}
                        onChange={(e) => setBeamformingAngle(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Narrow Beam (Pinpoint)</span>
                        <span>Wide Protection (Slight spill)</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Interactive Bystander Safeguards list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                    <label className="flex items-start gap-3 p-3 bg-slate-900/20 border border-slate-850 rounded-xl cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={bystanderPass}
                        onChange={(e) => setBystanderPass(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Bystander Ambient Bypass</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Detects and allows adjacent bystander voices (not facing you) to record perfectly without muffled interference.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-slate-900/20 border border-slate-850 rounded-xl cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={voicePrintOnly}
                        onChange={(e) => setVoicePrintOnly(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Biometric Voice-Print Only</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Strictly matches your own dynamic vocal frequency. Environmental sounds (birds, waves, street music) are preserved.</p>
                      </div>
                    </label>
                  </div>

                  {/* Real-time Waveform Simulator Visualizer */}
                  <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent opacity-50 pointer-events-none" />
                    
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <span>Live Acoustic Protection Beam Visualizer &amp; Phase Modulator</span>
                      <span className="text-emerald-400 flex items-center gap-1.5 font-mono animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Targeted Beam Active
                      </span>
                    </div>

                    {/* Simple geometric grid showing bystander separation */}
                    <div className="h-28 bg-slate-950 rounded border border-slate-900/50 relative flex items-center justify-between px-4 overflow-hidden">
                      {/* Left: Bystander */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <User className="w-5 h-5 text-slate-500" />
                        <span className="text-[9px] font-semibold text-slate-400 font-sans">Bystander</span>
                        <span className="text-[8px] font-mono bg-blue-950 text-blue-400 px-1 rounded border border-blue-900/30">100% Crisp Audio</span>
                        {/* Little pulsing ripples representing unaffected audio */}
                        <div className="absolute left-6 h-1 w-12 bg-blue-500/20 animate-pulse rounded-full" />
                      </div>

                      {/* Middle Beam */}
                      <div className="flex-1 flex flex-col items-center justify-center relative px-2">
                        {/* Directional beam effect */}
                        <div className="w-full relative flex items-center justify-center">
                          {/* Interactive Responsive SVG Wave Generator */}
                          <svg viewBox="0 0 120 40" className="w-full h-10 overflow-visible text-emerald-400">
                            <path
                              d={(() => {
                                const points = [];
                                const width = 120;
                                const height = 40;
                                const centerY = height / 2;
                                // Scale frequency visually
                                const freqFactor = (acousticFrequency / 500) * 2.5;
                                for (let x = 0; x <= width; x += 1.5) {
                                  let y = 0;
                                  const radians = (x / width) * Math.PI * 2 * freqFactor;
                                  if (acousticWaveType === 'sine') {
                                    y = Math.sin(radians) * 8;
                                  } else if (acousticWaveType === 'triangle') {
                                    y = (Math.abs((radians % (Math.PI * 2)) - Math.PI) / Math.PI - 0.5) * 16;
                                  } else if (acousticWaveType === 'square') {
                                    y = Math.sin(radians) >= 0 ? 8 : -8;
                                  } else { // noise
                                    y = (Math.random() - 0.5) * 14;
                                  }
                                  points.push(`${x},${centerY + y}`);
                                }
                                return `M ${points.join(' L ')}`;
                              })()}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              className={acousticWaveType !== 'noise' ? "animate-pulse" : ""}
                            />
                          </svg>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono mt-2 uppercase tracking-widest bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                          {acousticWaveType.toUpperCase()} MODE: {acousticFrequency}Hz
                        </span>
                      </div>

                      {/* Right: User */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div className="relative">
                          <User className="w-5 h-5 text-emerald-400" />
                          <div className="absolute -inset-1 rounded-full border border-emerald-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-400 font-sans">You (User)</span>
                        <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 px-1 rounded border border-emerald-900/30 uppercase tracking-wide">Blurred Vocal Wave</span>
                      </div>
                    </div>

                    {/* Interactive controls for waveform and frequency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                      {/* Waveform Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Encrypted Mask Waveform</span>
                        <div className="grid grid-cols-4 gap-1">
                          {(['sine', 'triangle', 'square', 'noise'] as const).map((wt) => (
                            <button
                              key={wt}
                              type="button"
                              onClick={() => setAcousticWaveType(wt)}
                              className={`py-1 text-[9px] rounded font-mono uppercase font-bold border transition ${
                                acousticWaveType === wt
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {wt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frequency Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                          <span>Modulation Frequency</span>
                          <span className="text-emerald-400">{acousticFrequency} Hz</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="2200"
                          step="50"
                          value={acousticFrequency}
                          onChange={(e) => setAcousticFrequency(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-sans text-center">
                      The acoustic beam dynamically tracks the facing camera lens, cancels your speech, and injects {acousticWaveType} waves modulated at {acousticFrequency}Hz to prevent forensic reconstruction.
                    </p>
                  </div>

                  {/* Dynamic Voice Signature Defense & Biometric Deception */}
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <MicOff className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Vocal Signature Defense &amp; Machine-Learning Countermeasures
                      </h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      If a nearby device (such as smart glasses, hidden recording apps, or directional spy microphone arrays) is blocked visually but manages to capture your acoustic raw waves, BlurBubble triggers multi-layered biometric defense countermeasures to neutralize your voice records for profile tracking, transcription, or synthetic AI voice-cloning:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Ultrasonic Microphone Saturation */}
                      <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                        state.ultrasonicMicSaturationEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850/80 text-slate-400'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold block text-white flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ultrasonic Mic Saturation
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-normal">
                            Emits a safe, inaudible 22kHz‚Äì25kHz pressure wave. This physically vibrates the capture mic's internal diaphragm on target devices, distorting the audio recording with non-destructive white noise.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, ultrasonicMicSaturationEnabled: !state.ultrasonicMicSaturationEnabled })}
                          className={`w-full py-1 rounded text-[9px] font-bold font-mono uppercase border transition ${
                            state.ultrasonicMicSaturationEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {state.ultrasonicMicSaturationEnabled ? 'ACTIVE (Saturating)' : 'STANDBY'}
                        </button>
                      </div>

                      {/* Inaudible Biometric Audio Watermarking */}
                      <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                        state.acousticWatermarkingEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850/80 text-slate-400'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold block text-white flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Biometric AI Watermarking
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-normal">
                            Injects near-ultrasonic cryptographic metadata into your spoken audio. If the voice clip is scraped by web crawlers or AI voice-cloners, the watermark triggers automated crawler reject policies.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, acousticWatermarkingEnabled: !state.acousticWatermarkingEnabled })}
                          className={`w-full py-1 rounded text-[9px] font-bold font-mono uppercase border transition ${
                            state.acousticWatermarkingEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {state.acousticWatermarkingEnabled ? 'ACTIVE (Watermarked)' : 'STANDBY'}
                        </button>
                      </div>

                      {/* Vocal Resonance Scrambler */}
                      <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                        state.vocalScramblerEnabled 
                          ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                          : 'bg-slate-950/20 border-slate-850/80 text-slate-400'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold block text-white flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Vocal Resonance Scrambler
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-normal">
                            Applies micro-pitch fluctuation filters to your voice signature. Nearby humans understand you flawlessly, but automatic speech-to-text algorithms and voice-print indexers receive scrambled data.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange({ ...state, vocalScramblerEnabled: !state.vocalScramblerEnabled })}
                          className={`w-full py-1 rounded text-[9px] font-bold font-mono uppercase border transition ${
                            state.vocalScramblerEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {state.vocalScramblerEnabled ? 'ACTIVE (Scrambling)' : 'STANDBY'}
                        </button>
                      </div>
                    </div>

                    {/* Simulation test button */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[11px] font-bold text-slate-200 block">Biometric Voice Harvester Repelled Test</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Simulates a nearby smart-assistant or directional laser spy microphone attempting to harvest your voice conversation.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!state.isBroadcasting) {
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', {
                              detail: {
                                title: 'Signal Offline',
                                body: 'You must activate your Signal Beacon before simulating an active acoustic harvest attempt.',
                                type: 'restricted'
                              }
                            }));
                            return;
                          }

                          window.dispatchEvent(new CustomEvent('trigger-test-alert', {
                            detail: {
                              title: 'Vocal Ingestion Blocked',
                              body: 'A dynamic voice harvesting attempt was detected. Your acoustic watermark and ultrasonic saturation tripped the harvester\'s ingestion engine, causing instant rejection.',
                              type: 'success'
                            }
                          }));

                          if (onAddLog) {
                            onAddLog({
                              deviceModel: 'ACOUSTIC_VOICE_HARVESTER',
                              action: 'censored',
                              shieldApplied: 'ACOUSTIC_WATERMARK_INJECT_&_ULTRASONIC_SATURATION',
                              distance: 2.5,
                              rotatedId: 'BLOCKLIST_SIGNAL_DEPLOYED_FOR_VOICE_INGEST'
                            });
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 rounded text-xs font-bold text-emerald-400 transition font-mono uppercase tracking-wide cursor-pointer shrink-0"
                      >
                        ‚ö° Simulate Voice Harvest
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Scheduling Engine Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      Autonomous Smart Scheduling Engine
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Automatically toggle broadcasting based on your location profiles, calendar routines, or time-of-day. Saves battery when safe.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mr-1">Status:</span>
                    <button
                      type="button"
                      onClick={() => onChange({ ...state, smartSchedulingEnabled: !state.smartSchedulingEnabled })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider transition ${
                        state.smartSchedulingEnabled 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {state.smartSchedulingEnabled ? 'AUTOMATION ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                {state.smartSchedulingEnabled && (
                  <div className="space-y-5">
                    {/* Simulated Clock & Event Matcher Panel */}
                    <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          Time-of-Day Simulator &amp; Router
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSimulationMode('real')}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                              simulationMode === 'real' ? 'bg-blue-500 text-white font-bold' : 'bg-slate-850 text-slate-400 hover:text-white'
                            }`}
                          >
                            Real Clock
                          </button>
                          <button
                            type="button"
                            onClick={() => setSimulationMode('simulated')}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                              simulationMode === 'simulated' ? 'bg-blue-500 text-white font-bold' : 'bg-slate-850 text-slate-400 hover:text-white'
                            }`}
                          >
                            Simulated Timeline
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {simulationMode === 'simulated' ? (
                          <div className="md:col-span-8 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-semibold">Simulated Time</span>
                              <span className="text-emerald-400 font-bold font-mono">{simulatedTime} ({simulatedDay})</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Day Selector */}
                              <select
                                value={simulatedDay}
                                onChange={(e) => setSimulatedDay(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans"
                              >
                                {daysOfWeek.map(d => (
                                  <option key={d} value={d} className="bg-slate-950 text-white">{d}</option>
                                ))}
                              </select>

                              {/* Time slider */}
                              <input
                                type="range"
                                min="0"
                                max="1439" // 24 * 60 - 1
                                value={(() => {
                                  const [h, m] = simulatedTime.split(':').map(Number);
                                  return h * 60 + m;
                                })()}
                                onChange={(e) => {
                                  const totalMin = Number(e.target.value);
                                  const h = String(Math.floor(totalMin / 60)).padStart(2, '0');
                                  const m = String(totalMin % 60).padStart(2, '0');
                                  setSimulatedTime(`${h}:${m}`);
                                }}
                                className="flex-1 accent-emerald-400 cursor-pointer"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="md:col-span-8 py-2 text-xs text-slate-400 space-y-1">
                            <div className="flex items-center gap-2 text-white">
                              <Clock className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '30s' }} />
                              <span className="font-bold">Syncing Live Clock...</span>
                            </div>
                            <p className="text-[10px]">
                              System triggers state changes as your device moves across calendar zones automatically.
                            </p>
                          </div>
                        )}

                        <div className="md:col-span-4 bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-center text-center">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Active Shield Profile</span>
                          <span className="text-xs font-bold text-white mt-1 truncate">{activeScheduledSlotName}</span>
                          <span className={`text-[10px] font-bold font-mono mt-0.5 ${state.isBroadcasting ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {state.isBroadcasting ? 'BROADCASTING ON' : 'BATTERY SAVING (OFF)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule slots list */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Configured Schedule Profiles ({state.scheduleSlots?.length || 0})
                        </span>
                        <button
                          type="button"
                          id="btn-create-new-schedule"
                          onClick={() => {
                            setNewSlotLabel('');
                            setNewSlotStartTime('09:00');
                            setNewSlotEndTime('17:00');
                            setNewSlotDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
                            setNewSlotBroadcastEnabled(true);
                            setNewSlotIcon('briefcase');
                            setNewSlotPrivacyLevel('default');
                            setIsScheduleModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] uppercase rounded-lg tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Create New Schedule
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {state.scheduleSlots?.map((slot) => {
                          const isCurrentlyMatching = activeScheduledSlotName === slot.label && state.smartSchedulingEnabled;
                          return (
                            <div 
                              key={slot.id} 
                              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                isCurrentlyMatching 
                                  ? 'border-emerald-500 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                  : 'border-slate-800 bg-slate-950/20'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-lg shrink-0 ${isCurrentlyMatching ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                                  {renderSlotIcon(slot.icon, "w-4 h-4")}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-white truncate">{slot.label}</h4>
                                    {isCurrentlyMatching && (
                                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                    <span className="text-slate-500">‚Ä¢</span>
                                    <span className="text-slate-300 font-semibold">{slot.days.join(', ')}</span>
                                    {slot.privacyLevel && (
                                      <>
                                        <span className="text-slate-500">‚Ä¢</span>
                                        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                                          Privacy Override: {slot.privacyLevel.replace('_', ' ')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-900 pt-2.5 sm:pt-0">
                                {/* Simulation quick-select */}
                                <button
                                  type="button"
                                  onClick={() => handleSimulateSlot(slot)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold uppercase rounded text-slate-300 transition"
                                >
                                  Simulate
                                </button>

                                {/* Broadcast state marker */}
                                <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  slot.broadcastEnabled 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}>
                                  {slot.broadcastEnabled ? 'Beacon ON' : 'Beacon OFF'}
                                </div>

                                {/* Active toggle switch */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleScheduleSlotActive(slot.id)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    slot.isActive ? 'bg-emerald-500' : 'bg-slate-800'
                                  }`}
                                >
                                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                                    slot.isActive ? 'translate-x-4' : 'translate-x-0'
                                  }`} />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScheduleSlot(slot.id)}
                                  className="p-1 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded text-slate-500 hover:text-rose-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Schedule slot form */}
                    <form onSubmit={handleAddScheduleSlot} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Configure New Auto-Rule</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {/* Name */}
                        <div className="sm:col-span-2 md:col-span-1">
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Rule Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Commute / Subway"
                            value={newSlotLabel}
                            onChange={(e) => setNewSlotLabel(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                          />
                        </div>

                        {/* Times */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Start Time (24h)</label>
                          <input
                            type="time"
                            required
                            value={newSlotStartTime}
                            onChange={(e) => setNewSlotStartTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">End Time (24h)</label>
                          <input
                            type="time"
                            required
                            value={newSlotEndTime}
                            onChange={(e) => setNewSlotEndTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans"
                          />
                        </div>

                        {/* Mode action */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Beacon Action</label>
                          <select
                            value={newSlotBroadcastEnabled ? 'on' : 'off'}
                            onChange={(e) => setNewSlotBroadcastEnabled(e.target.value === 'on')}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-sans"
                          >
                            <option value="on" className="bg-slate-950 text-white">Beacon ON (Broadcasting)</option>
                            <option value="off" className="bg-slate-950 text-white">Beacon OFF (Battery Saver)</option>
                          </select>
                        </div>

                        {/* Icon */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Visual Icon Profile</label>
                          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 overflow-x-auto">
                            {(['briefcase', 'baby', 'beer', 'home', 'school', 'car', 'users', 'shield'] as const).map(ic => {
                              const isSel = newSlotIcon === ic;
                              return (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => setNewSlotIcon(ic)}
                                  className={`p-1 rounded transition shrink-0 ${
                                    isSel ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                  }`}
                                  title={ic}
                                >
                                  {renderSlotIcon(ic, "w-3.5 h-3.5")}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Days */}
                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Select Days</label>
                          <div className="flex flex-wrap gap-1">
                            {daysOfWeek.map(day => {
                              const isSelected = newSlotDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setNewSlotDays(newSlotDays.filter(d => d !== day));
                                    } else {
                                      setNewSlotDays([...newSlotDays, day]);
                                    }
                                  }}
                                  className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition ${
                                    isSelected 
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' 
                                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 text-right">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase rounded-lg tracking-wider transition shadow-lg shadow-emerald-500/10"
                        >
                          Add Custom Schedule Rule
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Pocket Haptic & Notification Settings Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Haptic Alert &amp; Push Notification Core</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono">
                    ACTIVE SENSORS SYNCED
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go out without worrying! When someone points an AI device at you or scans your children, BlurBubble can buzz your phone in your pocket or trigger push alerts. No need to look back or keep checking your glasses.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900 text-xs">
                  <div className="space-y-3.5">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Pocket Phone Vibration Buzz</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Vibrates phone twice when active shielding triggers.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.enablePhoneBuzz ?? true}
                        onChange={(e) => onChange({ ...state, enablePhoneBuzz: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">In-App Push Notifications</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Displays pop-up banners for real-time compliance events.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.enablePushNotifications ?? true}
                        onChange={(e) => onChange({ ...state, enablePushNotifications: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Child &amp; Asset Protection Alerts</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Notifies you if your children or items are actively being blurred.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.notifyOnChildEngaged ?? true}
                        onChange={(e) => onChange({ ...state, notifyOnChildEngaged: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-slate-900 pt-3.5 md:pt-0 md:pl-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Online Video Discovery Alerts</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Alerts immediately if our web crawler indexes your face online.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.notifyOnVideoFound ?? true}
                        onChange={(e) => onChange({ ...state, notifyOnVideoFound: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-slate-300 font-semibold group-hover:text-white transition">Online Video Deletion/Blur Success</span>
                        <p className="text-[10px] text-slate-500 leading-snug">Confirms when a detected online video is successfully blurred.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.notifyOnVideoDeleted ?? true}
                        onChange={(e) => onChange({ ...state, notifyOnVideoDeleted: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>

                    {/* Quick Simulation Trigger Buttons */}
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Simulation Playground</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Trigger intercept test
                            const testModels = ['Meta Ray-Ban v3', 'Snap Spectacles Pro', 'Apple Vision Wear v2'];
                            const selectedModel = testModels[Math.floor(Math.random() * testModels.length)];
                            const distance = parseFloat((Math.random() * 5 + 1).toFixed(1));
                            
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                              detail: { 
                                title: 'Bystander Alert (Mock)',
                                body: `Intercepted scanning by ${selectedModel} at ${distance}m. Active blur filter enforced.`,
                                type: 'blocking'
                              } 
                            }));
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold py-1.5 rounded text-[10px] transition text-center"
                        >
                          Test Shield Alert
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Trigger child intercept test
                            const activeEntities = state.registeredEntities.filter(e => e.isActive);
                            const tagLabel = activeEntities.length > 0 ? activeEntities[0].name : "Lily's Backpack";
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                              detail: { 
                                title: 'Child Tag Security Event',
                                body: `Sensor detected nearby scan targeting "${tagLabel}". Active blurring engaged!`,
                                type: 'child_blocking'
                              } 
                            }));
                          }}
                          className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold py-1.5 rounded text-[10px] transition text-center"
                        >
                          Test Child Tag Alert
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Shield Sync & Battery Saver Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card 1: Battery Saver Mode */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${state.batterySaverActive ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Battery Saver Mode</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const active = !state.batterySaverActive;
                            const updatedMeters = active ? Math.min(state.rangeMeters, 8) : state.rangeMeters;
                            onChange({
                              ...state,
                              batterySaverActive: active,
                              rangeMeters: updatedMeters
                            });
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                              detail: { 
                                title: active ? 'Battery Saver Active' : 'Battery Saver Disengaged',
                                body: active 
                                  ? 'Signal transmission interval throttled to 1.2s. Range capped to 8m to conserve active battery.' 
                                  : 'High-fidelity real-time scans re-established. Full signal range active.',
                                type: 'schedule_update'
                              } 
                            }));
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            state.batterySaverActive ? 'bg-amber-450' : 'bg-slate-800'
                          }`}
                          title="Toggle eco-friendly power saving mode (caps signal range to 8m)"
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            state.batterySaverActive ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Optimizes beacon transmit parameters. Pulse interval is dynamically throttled and signal range is capped to extend operational lifetime on low-power tags by up to 45%.
                      </p>
                    </div>

                    {/* Battery Optimization Toggle */}
                    <div className="pt-3 border-t border-slate-850 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap" title="Adapts wireless pulse rate based on current simulated device level">
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-350 ${
                              state.intelligentBatteryOptimization ? 'text-emerald-400 font-extrabold shadow-emerald-500/20' : 'text-slate-300 font-bold'
                            }`}>
                              Battery Optimization
                            </span>
                            <AnimatePresence>
                              {state.intelligentBatteryOptimization && (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.8, x: -5 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, x: -5 }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse"
                                  style={{ animationDuration: '2.2s' }}
                                  title="Low power throttle mode currently scaling transmitter energy consumption"
                                >
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                                  ENERGY SAVING
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="text-[9px] text-slate-500">
                            Intelligently scales down BLE broadcast frequency as battery level drains to maximize device longevity.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const active = !state.intelligentBatteryOptimization;
                            onChange({
                              ...state,
                              intelligentBatteryOptimization: active
                            });
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', { 
                              detail: { 
                                title: active ? 'Battery Optimization Enabled' : 'Battery Optimization Disabled',
                                body: active 
                                  ? 'Adaptive BLE power saving active. Broadcast frequency will dynamically scale with device battery.' 
                                  : 'Fixed broadcast frequency restored.',
                                type: 'blocking'
                              } 
                            }));
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            state.intelligentBatteryOptimization ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                          title="Toggle adaptive BLE transmission power based on device charge level"
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            state.intelligentBatteryOptimization ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      {/* Intelligent Parameters Display */}
                      {(() => {
                        const activeEntities = state.registeredEntities?.filter(e => e.isActive) || [];
                        const trackedEntity = activeEntities.find(e => e.type === 'phone') || activeEntities[0] || state.registeredEntities?.[0];
                        const battery = trackedEntity ? trackedEntity.batteryPercent : 88;
                        const deviceName = trackedEntity ? trackedEntity.name : "Companion Device";
                        
                        // Calculate intelligent scaling
                        let frequency = "10.0 Hz";
                        let intervalMs = "100 ms";
                        let desc = "Standard broadcast rate. Absolute coverage fidelity.";
                        let colorClass = "text-slate-300";

                        if (state.intelligentBatteryOptimization && trackedEntity) {
                          if (battery >= 80) {
                            frequency = "10.0 Hz";
                            intervalMs = "100 ms";
                            desc = "Optimal level. Peak transmit fidelity active.";
                            colorClass = "text-emerald-400";
                          } else if (battery >= 60) {
                            frequency = "7.5 Hz";
                            intervalMs = "133 ms";
                            desc = "High level. Dynamic adaptive frequency control.";
                            colorClass = "text-emerald-400/90";
                          } else if (battery >= 35) {
                            frequency = "5.0 Hz";
                            intervalMs = "200 ms";
                            desc = "Moderate level. Throttling frequency to preserve battery.";
                            colorClass = "text-emerald-500/80";
                          } else if (battery >= 15) {
                            frequency = "2.5 Hz";
                            intervalMs = "400 ms";
                            desc = "Low battery. Extended sleep cycle active.";
                            colorClass = "text-amber-400";
                          } else if (battery >= 10) {
                            frequency = "1.0 Hz";
                            intervalMs = "1000 ms";
                            desc = "Battery warning. Emergency low pulse enabled.";
                            colorClass = "text-rose-400 animate-pulse";
                          } else {
                            frequency = "0.2 Hz";
                            intervalMs = "5000 ms";
                            desc = "Deep battery saver. Extreme standby preservation.";
                            colorClass = "text-rose-500 font-bold animate-pulse";
                          }
                        } else if (state.batterySaverActive) {
                          frequency = "1.2 Hz";
                          intervalMs = "830 ms";
                          desc = "Eco-Pulse mode active (fixed throttle).";
                          colorClass = "text-amber-400";
                        }

                        return (
                          <div className="p-3 bg-slate-950/70 border border-slate-900 rounded-lg space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-slate-500">TRACKED DEVICE</span>
                              <span className="text-white font-semibold truncate max-w-[150px]">{deviceName} ({battery}%)</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-slate-500">BLE TX FREQUENCY</span>
                              <span className={`font-bold ${colorClass}`}>{frequency} ({intervalMs} interval)</span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-900/40">
                              {desc}
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Interactive Device Battery Level Slider */}
                    <div className="pt-3 border-t border-slate-900 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 uppercase font-mono">SIMULATE ACTIVE DEVICE BATTERY</span>
                        <span className="text-white font-bold font-mono">
                          {(() => {
                            const activeEntities = state.registeredEntities?.filter(e => e.isActive) || [];
                            const tracked = activeEntities.find(e => e.type === 'phone') || activeEntities[0] || state.registeredEntities?.[0];
                            return tracked ? `${tracked.batteryPercent}%` : "No Active Device";
                          })()}
                        </span>
                      </div>
                      {(() => {
                        const activeEntities = state.registeredEntities?.filter(e => e.isActive) || [];
                        const tracked = activeEntities.find(e => e.type === 'phone') || activeEntities[0] || state.registeredEntities?.[0];
                        if (!tracked) {
                          return <p className="text-[9px] text-slate-500 italic">No devices found. Add a smart tag or active phone in the Directory below.</p>;
                        }

                        return (
                          <div className="space-y-1">
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={tracked.batteryPercent}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = state.registeredEntities.map(t => 
                                  t.id === tracked.id ? { ...t, batteryPercent: val } : t
                                );
                                onChange({
                                  ...state,
                                  registeredEntities: updated
                                });
                              }}
                              className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                              title="Slide to dynamically simulate change in device battery charge and test adaptive power throttles"
                            />
                            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                              <span className="text-rose-500">1%</span>
                              <span className="text-rose-400 font-bold">10% Crit Alert</span>
                              <span className="text-amber-400 font-bold">15% Low Alert</span>
                              <span>100%</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-950 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">TAG DISCHARGE RATE</span>
                      <span className={state.batterySaverActive ? "text-emerald-400" : "text-amber-400"}>
                        {state.batterySaverActive ? "0.38%/hr (Eco-Pulse)" : "1.25%/hr (High-Fidelity)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">ESTIMATED RUNTIME</span>
                      <span className="text-white font-bold">
                        {state.batterySaverActive ? "48.5 Hours (+18h Saved)" : "14.8 Hours (Peak power)"}
                      </span>
                    </div>
                    {state.batterySaverActive && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-300 font-sans flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </span>
                        Eco-Pulse Active. Signal range capped at 8 meters.
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Family Shield Sync */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${state.familyShieldSync ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Family Shield Sync</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const active = !state.familyShieldSync;
                          onChange({
                            ...state,
                            familyShieldSync: active,
                            familyShieldSyncStatus: active ? 'synchronized' : 'disabled'
                          });
                          if (active) {
                            setIsSyncingFamily(true);
                            setFamilySyncLogs([
                              "[INFO] Initiating Family Mesh Synchronization...",
                              "[SECURE] Exchanging public key signatures with Robert (Dad)...",
                              "[SECURE] Verifying Lily's smart backpack hardware tag signature...",
                              "[SUCCESS] Synchronized 3 active family shields successfully!"
                            ]);
                            setTimeout(() => setIsSyncingFamily(false), 2000);
                          }
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          state.familyShieldSync ? 'bg-blue-500' : 'bg-slate-800'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          state.familyShieldSync ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Coordinated mesh network. Encrypts and distributes custom privacy level rules and whitelists to ensure siblings and parents stand unified under the same security profile.
                    </p>
                  </div>

                  {state.familyShieldSync ? (
                    <div className="space-y-2.5 pt-3 border-t border-slate-950 text-[10px]">
                      {isSyncingFamily ? (
                        <div className="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-900/80">
                          <div className="w-full bg-slate-850 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-400 h-full w-2/3 animate-pulse" />
                          </div>
                          <span className="text-[9px] font-mono text-blue-400 block text-center animate-pulse">
                            EXCHANGING PUBLIC KEYS OVER DECENTRALIZED MESH NETWORK...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 uppercase font-bold text-[9px]">Mesh Sync Group</span>
                            <span className="text-blue-400 font-mono font-bold">3 Active Members</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5 font-sans">
                            {familyMembers.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-1.5 bg-slate-900/40 border border-slate-800 rounded">
                                <div className="flex items-center gap-1.5">
                                  <span>üë§</span>
                                  <span className="text-white font-semibold">{member.name} ({member.relation})</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                                  <span>{member.deviceName}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-emerald-400 uppercase font-bold">Synced</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-600 text-[10px] italic pt-3 border-t border-slate-950">
                      Family synchronization is disabled. Engage toggle above to synchronize.
                    </div>
                  )}

                  {/* Coercion Defense Panic Module */}
                  <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-4.5 space-y-3">
                    <div className="flex items-center gap-2 text-red-500">
                      <ShieldAlert className="w-4 h-4 animate-pulse text-red-500" />
                      <h4 className="text-xs font-black tracking-wider uppercase font-mono">Emergency Coercion Defense</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      If you are in a high-risk zone and are being forced or coerced to unlock your device, trigger a <strong>Zero-Delay Sanitization Purge</strong>. This instantly wipes all registered facial templates, automated SSID rules, synced tags, and encrypted audit logs, reverting the app to a clean state.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      {/* G-force shake simulation button */}
                      <button
                        type="button"
                        id="simulate-shake-btn"
                        onClick={handleCoercionPurge}
                        className="flex-1 bg-red-950/40 hover:bg-red-950/75 border border-red-900/40 hover:border-red-500 text-red-400 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        üì≥ Simulate Phone Shake (G-Force 4.5)
                      </button>

                      {/* Manual Hold Button */}
                      <button
                        type="button"
                        id="hold-purge-btn"
                        onMouseDown={() => setIsHoldingWipe(true)}
                        onMouseUp={() => setIsHoldingWipe(false)}
                        onMouseLeave={() => setIsHoldingWipe(false)}
                        onTouchStart={() => setIsHoldingWipe(true)}
                        onTouchEnd={() => setIsHoldingWipe(false)}
                        className={`flex-1 relative border font-extrabold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition overflow-hidden select-none ${
                          isHoldingWipe
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                        }`}
                      >
                        {isHoldingWipe ? (
                          <>
                            <div className="absolute left-0 top-0 h-full bg-red-800 transition-all duration-1000" style={{ width: `${(wipeHoldSeconds / 2) * 100}%`, zIndex: 0 }} />
                            <span className="relative z-10 animate-pulse">HOLDING... {2 - wipeHoldSeconds}s</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Hold 2s to Wipe Device</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Infrared (IR) & LiDAR Counter-Defense Enclave */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                          <EyeOff className="w-4 h-4 text-emerald-400" />
                          Advanced Optical &amp; Active Laser Countermeasures (IR/LiDAR)
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Mitigate near-infrared surveillance, sub-millimeter AI lip-reading, and active LiDAR point-cloud face scans.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold">
                        Spatial Cloaking Active
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Interactive Explanation Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Infrared Shield Toggle */}
                        <div className={`p-4 rounded-xl border transition-all ${
                          state.irDisruptionEnabled 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className="text-xs font-bold block text-white flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                940nm Infrared (IR) Pulse Jammer
                              </span>
                              <span className="text-[10px] text-slate-400 block leading-relaxed">
                                Emits randomized near-infrared optical noise. Blinds active IR cameras and spatial audio buds trying to track lip contours in low light.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onChange({ ...state, irDisruptionEnabled: !state.irDisruptionEnabled })}
                              className={`px-3 py-1 rounded text-[10px] font-bold font-mono uppercase border transition shrink-0 ${
                                state.irDisruptionEnabled
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {state.irDisruptionEnabled ? 'ACTIVE' : 'MUTED'}
                            </button>
                          </div>
                        </div>

                        {/* LiDAR Laser Point-Cloud Jammer */}
                        <div className={`p-4 rounded-xl border transition-all ${
                          state.lidarInterferenceEnabled 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-950/20 border-slate-850/80 text-slate-400'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className="text-xs font-bold block text-white flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                                LiDAR Time-of-Flight Scrambler
                              </span>
                              <span className="text-[10px] text-slate-400 block leading-relaxed">
                                Transmits specialized optical phase-cancellation pulses. Scatters 3D depth-laser beams, corrupting face-mesh tracking and spatial scans.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onChange({ ...state, lidarInterferenceEnabled: !state.lidarInterferenceEnabled })}
                              className={`px-3 py-1 rounded text-[10px] font-bold font-mono uppercase border transition shrink-0 ${
                                state.lidarInterferenceEnabled
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {state.lidarInterferenceEnabled ? 'ACTIVE' : 'MUTED'}
                            </button>
                          </div>
                        </div>

                        {/* Experimental Tech Lab Link */}
                        <div 
                          id="experimental-lab-link"
                          onClick={() => setActiveTab('experimental')}
                          className="p-4 rounded-xl border bg-slate-950/40 border-slate-900 hover:border-emerald-500/40 cursor-pointer transition flex flex-col justify-between group gap-3 col-span-1 md:col-span-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-bold block text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                                <FlaskConical className="w-4 h-4 text-emerald-400 animate-pulse" />
                                üß™ Speculative &amp; Experimental Shielding Lab
                              </span>
                              <span className="text-[10px] text-slate-400 block leading-relaxed">
                                Looking for next-generation defense systems? Access and test our simulated biothermal FLIR pulse masking, retroreflective laser lens flares, 3D mesh projects, and computer-vision anti-lip-reading shields.
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase transition group-hover:bg-emerald-500 group-hover:text-slate-950 shrink-0">
                              OPEN LAB ‚Üí
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Telemetry & Simulator Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {/* Telemetry Panel */}
                        <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg md:col-span-2 space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-500 uppercase">
                            <span>Optical Shield Telemetry</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Shielding Enclave Standard
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">IR PULSE SPEED</span>
                              <span className="font-bold text-slate-200">
                                {state.irDisruptionEnabled ? '142 Hz (RANDOMIZED)' : 'OFF / STANDBY'}
                              </span>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">LIDAR SCRAMBLE</span>
                              <span className="font-bold text-emerald-400">
                                {state.lidarInterferenceEnabled ? '98.7% (CRITICAL)' : '0.0% (DEFAULT)'}
                              </span>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">THERMAL BIOMASK</span>
                              <span className="font-bold text-emerald-400">
                                {state.thermalPulseEnabled ? '41.2¬∞C HEAT MASK' : 'OFF / STANDBY'}
                              </span>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">RETRO LENS SHIELD</span>
                              <span className="font-bold text-slate-200">
                                {state.retroScramblerEnabled ? 'ACTIVE SHIELDING' : 'OFF / STANDBY'}
                              </span>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">LIP DEFLECTOR</span>
                              <span className="font-bold text-emerald-400">
                                {state.antiLipReadingEnabled ? 'COORDINATED' : 'OFF / STANDBY'}
                              </span>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 space-y-0.5">
                              <span className="text-[9px] text-slate-500 block">3D MESH FLOOD</span>
                              <span className="font-bold text-slate-200">
                                {state.lidarMeshFloodEnabled ? '1024 pts/m¬≤' : 'OFF / STANDBY'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Active Probe Simulator Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!state.isBroadcasting) {
                              window.dispatchEvent(new CustomEvent('trigger-test-alert', {
                                detail: {
                                  title: 'Signal Offline',
                                  body: 'You must activate your Signal Beacon before simulating an active IR/LiDAR sensor probe.',
                                  type: 'restricted'
                                }
                              }));
                              return;
                            }

                            // Trigger sound / notification alerts
                            window.dispatchEvent(new CustomEvent('trigger-test-alert', {
                              detail: {
                                title: 'Active LiDAR & IR Sweep Repelled',
                                body: 'An active infrared optical scan and LiDAR depth probe was detected trying to map your lip movements. Dynamic counter-pulses have successfully jammed the scan.',
                                type: 'success'
                              }
                            }));

                            // If onAddLog is available, add a log entry
                            if (onAddLog) {
                              onAddLog({
                                deviceModel: 'IR_LIDAR_PROBE (Lip-Reading Target)',
                                action: 'censored',
                                shieldApplied: '940nm_IR_LED_PULSE_&_PHASE_DISTORTION_JAM',
                                distance: 1.2,
                                rotatedId: 'REPELLED_LIDAR_POINT_CLOUD_SCAN'
                              });
                            }
                          }}
                          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/50 p-3 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition cursor-pointer group"
                        >
                          <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">‚ö° Simulate IR/LiDAR Probe</span>
                          <span className="text-[9px] text-slate-400">Deploy a real-time anti-lip-reading test to check shield response.</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Universal Privacy Beacon Suite (The 5-Beacon Standard) */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Universal Privacy Beacon Suite (The 5-Beacon Standard)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Active multi-modal spatial privacy transmitters. Toggle individual channels to customize your protection envelope.
                      </p>
                    </div>
                    
                    {/* Master Switch */}
                    <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                        Master Switch
                      </span>
                      <button
                        id="btn-master-beacon-toggle"
                        type="button"
                        role="switch"
                        aria-checked={
                          state.isBroadcasting && 
                          state.wifiRulesEnabled && 
                          state.acousticWatermarkingEnabled && 
                          (state.registeredEntities.every(e => e.isActive)) && 
                          state.irDisruptionEnabled &&
                          state.wifi7MacOptOutEnabled &&
                          state.auracastSquelchEnabled &&
                          state.uwbDistanceScramblerEnabled
                        }
                        onClick={() => {
                          const allActive = 
                            state.isBroadcasting && 
                            state.wifiRulesEnabled && 
                            state.acousticWatermarkingEnabled && 
                            (state.registeredEntities.every(e => e.isActive)) && 
                            state.irDisruptionEnabled &&
                            state.wifi7MacOptOutEnabled &&
                            state.auracastSquelchEnabled &&
                            state.uwbDistanceScramblerEnabled;
                          const targetState = !allActive;
                          const updatedEntities = state.registeredEntities.map(e => ({ ...e, isActive: targetState }));
                          onChange({
                            ...state,
                            isBroadcasting: targetState,
                            wifiRulesEnabled: targetState,
                            acousticWatermarkingEnabled: targetState,
                            irDisruptionEnabled: targetState,
                            wifi7MacOptOutEnabled: targetState,
                            auracastSquelchEnabled: targetState,
                            uwbDistanceScramblerEnabled: targetState,
                            registeredEntities: updatedEntities
                          });
                          if (onAddLog) {
                            onAddLog({
                              deviceModel: 'COORDINATED_BEACON_SUITE',
                              action: targetState ? 'broadcast_changed' : 'muted',
                              shieldApplied: targetState ? 'ALL_BEACONS_ACTIVE_8_CHANNEL' : 'ALL_BEACONS_SUSPENDED',
                              distance: 0,
                              rotatedId: 'MASTER_SUITE_SWEEP'
                            });
                          }
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          (state.isBroadcasting && 
                           state.wifiRulesEnabled && 
                           state.acousticWatermarkingEnabled && 
                           (state.registeredEntities.every(e => e.isActive)) && 
                           state.irDisruptionEnabled &&
                           state.wifi7MacOptOutEnabled &&
                           state.auracastSquelchEnabled &&
                           state.uwbDistanceScramblerEnabled) 
                            ? 'bg-emerald-500' 
                            : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            (state.isBroadcasting && 
                             state.wifiRulesEnabled && 
                             state.acousticWatermarkingEnabled && 
                             (state.registeredEntities.every(e => e.isActive)) && 
                             state.irDisruptionEnabled &&
                             state.wifi7MacOptOutEnabled &&
                             state.auracastSquelchEnabled &&
                             state.uwbDistanceScramblerEnabled) 
                              ? 'translate-x-5' 
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Channel 1: BLE (RFC-9402) */}
                    <div className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-4 ${
                      state.isBroadcasting 
                        ? 'bg-emerald-950/10 border-emerald-500/30 text-white' 
                        : 'bg-slate-900/10 border-slate-850 text-slate-500'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Bluetooth className={`w-4.5 h-4.5 ${state.isBroadcasting ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span className="text-xs font-bold block text-slate-200">BLE (RFC-9402)</span>
                          </div>
                          
                          {/* Toggle Switch */}
                          <button
                            id="btn-beacon-toggle-ble"
                            type="button"
                            role="switch"
                            aria-checked={state.isBroadcasting}
                            onClick={() => {
                              onChange({ ...state, isBroadcasting: !state.isBroadcasting });
                              if (onAddLog) {
                                onAddLog({
                                  deviceModel: 'BLE_TRANSMITTER (RFC-9402)',
                                  action: state.isBroadcasting ? 'muted' : 'broadcast_changed',
                                  shieldApplied: state.isBroadcasting ? 'BEACON_SUSPENDED' : 'BEACON_ARMED_ROTATING_UUID',
                                  distance: 0,
                                  rotatedId: '0xFE69_ACTIVE'
                                });
                              }
                            }}
                            className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              state.isBroadcasting ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                                state.isBroadcasting ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Broadcasts 12-byte rotating ephemeral tokens on BLE UUID 0xFE69.
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5 mt-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Status</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          state.isBroadcasting ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-900 text-slate-600'
                        }`}>
                          {state.isBroadcasting ? 'TRANSMITTING' : 'OFF'}
                        </span>
                      </div>
                    </div>

                    {/* Channel 2: WiFi SSID (WIFI-OPT-OUT) */}
                    <div className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-4 ${
                      state.wifiRulesEnabled 
                        ? 'bg-emerald-950/10 border-emerald-500/30 text-white' 
                        : 'bg-slate-900/10 border-slate-850 text-slate-500'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Wifi className={`w-4.5 h-4.5 ${state.wifiRulesEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span className="text-xs font-bold block text-slate-200">WiFi SSID Opt-Out</span>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            id="btn-beacon-toggle-wifi"
                            type="button"
                            role="switch"
                            aria-checked={state.wifiRulesEnabled}
                            onClick={() => {
                              onChange({ ...state, wifiRulesEnabled: !state.wifiRulesEnabled });
                              if (onAddLog) {
                                onAddLog({
                                  deviceModel: 'WIFI_SSID_BEACON',
                                  action: state.wifiRulesEnabled ? 'muted' : 'broadcast_changed',
                                  shieldApplied: state.wifiRulesEnabled ? 'SSID_OPT_OUT_SUSPENDED' : 'SSID_OPT_OUT_BROADCASTING',
                                  distance: 0,
                                  rotatedId: 'WIFI-OPT-OUT_ACTIVE'
                                });
                              }
                            }}
                            className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              state.wifiRulesEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                                state.wifiRulesEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Broadcasts ad-hoc opt-out SSIDs for standard wireless hardware scanning.
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5 mt-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Status</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          state.wifiRulesEnabled ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-900 text-slate-600'
                        }`}>
                          {state.wifiRulesEnabled ? 'WIFI OPT-OUT ON' : 'OFF'}
                        </span>
                      </div>
                    </div>

                    {/* Channel 3: Acoustic Watermark (ACOUSTIC-9402) */}
                    <div className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-4 ${
                      state.acousticWatermarkingEnabled 
                        ? 'bg-emerald-950/10 border-emerald-500/30 text-white' 
                        : 'bg-slate-900/10 border-slate-850 text-slate-500'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Volume2 className={`w-4.5 h-4.5 ${state.acousticWatermarkingEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                          xúÏ}[sIvÊªE››«,ºI-iA
—º¿ ÿÚLGU®J 5*T’TH°eΩ˘…1û	_"v√/≥ˆ√ÓÏÆ_±·˝;ÛÏü∞Ádf]QóJÄ›	TeÂÂ\æìy.Ñº’"ö©zﬁï:¢/7|˙ﬁWﬁ{§o[æ“≥MùÙL[{GÿÁû©˙TŸ´V7^’4{Ï˘ÜFN®™Ÿ÷ãlË’üê‹Î≈én‹Ω˙ìÇ;>Ï¸îtÌ¡¿§§so¯⁄ê¸tÁcQãΩ±Ô€V¡Ñ˙Àçûo)=÷K≈gÕ+™Ë¸F·≥˛ƒÅ	·/)æ”µM∏”cù.æSuU—ÜT{Gıó<Ês;ËÕ¯√©Ó;√4,µgRΩh¯ÑÿV›4¥w/?T6…ÀW‰C·ÕÏˆ°jhÂŸﬁﬁfÔﬁ"/?&?)Ì ˘∏˘Á%Ø5˙§b[5]ø∞õ•ùƒnÚ{+Â∑¢”;C£ó∂NÕcÚ‰Ê¢€ÆuÆØöı€Z˝˙¶”Ö_NÎ’ì-â∆TÕ7lÎòîè˙g‰…hÏS˝	Å∑ˆ\[’5’Ûo56ø∫‘Àº°AMΩÊ8¶ÅS-ıŒpPoj›F˚≤÷˛ˆ∂s”i5ÆNß¨+7ú¥Økßı|zu.’1›ÄæX=&Uô€]{Æ7ıÿÎïÁ’=XÇnÛª∆ì“6 I®ò>	∑o]
Ã∏£ƒ∞L√¢Jﬂ§Ô…P9ÿ>$˜ ¸ÙÜÆaΩS™DªûÌ*émX∞0 ±•S]ÈèMìÙlWáœ¯?äÔ™?óZ>aøHEäfõ∂Î}Ï™ÏoêöÑ™UK±«>XmÏ√o¨#ñmQÚU≈KIo†–uUSW´UN°!∫è‡É‚π|[4ôEÚùp]R2Ç¯bàπUËLù«ß@¨◊9Ceü-˛d3€∑›Qj)Çë=?¨¬‚©∫}O`∞Ç—Z‰/BÈåKŒ9{Î«{ÂÄMy¸ìí9/õuBvä+WQ˘˜’õ˚µ3 æﬂ≠:Ôà+˝ò9ì™:Œ≠À†öEùjåﬂÉ’T«∫ìDÜ∆`®Ù]˙´1µ¥	©Ï>ﬂﬁ{˜˙«MÇ7ÿ‰>òVÚéNºÌÇë8yo-∆/‡À¯(„>yäFáˇ◊∑?§‡ﬂSjÖ‹¸"»¨Z›9™«WˆÄ(Gæ≤[0Ÿ‡Í˚Á8µ_çlÀéO2+;uAõ–çW Ω±W≠“o˘6˝„¢:Ôï]Ëº3Q™è`ßbVòCÏÏV˘–ÇœêÇTÀ·@ù±È—§hÇôçO≈”"I¸RD|Â∏
ªÅ¯ ˚r}vˆ$üã◊°Ä«ä(1/¢2ãö‰‡ò‘ÌÃñf®&È™èTÍ◊ó≠ZWÈ÷Œ;õπp8E‹ YïÉPLæıõ]ìˆ„jä0F¿®∞¶ò`†bSπ§¡ÁŸ•Ä‘•z√Ú°UÍm˜>®PÑ•t€jj›ÕmìZH^ë*…ùÁ$%Å\GJLßØ}A/˜C‡„'˘Ì•à,÷ö–âá’f^—••äFïâ≤W$fïHÖÚ∂º5\J`˚¬V† ª)›3pƒ!“W≤‡®&SÚÄk ‰‹√4Îª<π*a¥∆ÿÎRuê•“uπW-¿ròÆî[Òoæ…ó ˙‹…Ω,‘ﬁÖyÛ|¢ö&oúºúµ7ef	¡ÿ—— *j~§:ºqnzÉŸºlÏ®É7K_ôi√OøÒ8Ï’RŸÁ†Õ.Ìz≥v!ÃÚ€ÀZ´’hœdùGÛµx+<—v¨∑ÄÍﬂ6⁄∑◊≠ÓÌıM˜ˆÊäuú›˜ÒªK¯ë≠ÔV∏≠ˇº~±6ΩhzWG‡mÆ-ˆÖ[ÏèπTkC?uéÚ}S§î‘óY/™•ìÆx∆¿RM¯¿#6òŒ∏é „Ü¿§kS9M˝π!˛≤mÃ;ê∑s;	W˜oó`K·ò\;æ°Å¡”lìN8©\4Nï÷ÕEß±¥;
Ü{jxÓÿ¡ˆÇõı~¡RÓ¸BuJ˜≤ñs	v“ú±Z[Üª[ ã˚¯ß÷/O´≥®m©¨`0õu0õÌ€∆e≥€ù—˛-‰©G9ïŒy◊ÛÉ™5¬QÄBπe
•}{⁄` Ø÷∂q÷=ü∆µ‹˙˙ëŒ°s»bmÕ>¬˘sû
]õ£…ãü;3©Cò}°£z7ç¡ò¬@¿vâÊ¨	ò¶‘Úê?ú·ƒC4`N÷&Èrö§R‚ÊÛú9›Dê	⁄®yuæ$ßÕOè…C93»3rY´£ô®\ÉD™¿
 Â˙¶ª¥ˆ·Ω—7û]™t˙º∂≥üYÒD7u–ä~©•òΩ∞K`+∆XeµÃD6£Àa)f.Ó„€äôØ≠≈lä[*{ÒMÛ¨˘Ï(Ô∂]ª:Ωæl˛b.ã1ó∑≈fÃ}[r4∑ßÕNÌ‰BXã”#≠uõ◊W¬Çª}”Ïæ∆£UPMèm=¶z	*{m>.ÿ|Ã•êµ˘dæf]õê…Î$ÇÅâ–ÌëÒ#Ãb‰!4BÅ@ˇ	}ÚN3¸D”W<µÔÄ©º–É÷áúKjQJJ†œoSÊvî´In¿-ÖU˘ÏòÄ6'5êW»B§Û´15ﬁVj7ÌF!)ùø∏i\‘_/≠m©äÆãûØçÀÏgñƒ∏l´>RfVÊ¨ÈÿïiFY-„2ò◊Â∞/≥W˘Ñ–fæ7äûÕ&æ•21È|+§Û¢fsYÌqfs_75§Ñ•9ım`bænv∑W◊ÕŒ£PÊtamh.<^6óF÷ñÊcÑ Ê+€µ©ôºö÷/©v&µ4w‚`∏Cá®·QÀ÷Ci}õXTu{ O¢qÿΩ∂0ó‘¬î=üﬂƒÃÔ©PO¬´uåÃ£crÛÊÑú
›K:ö´é†ª.©¿ÁJßﬁÆ]Ç¶o/≠ç9æÔù˚æ64≥üYCÛµlôùY¥ÆK`l"”Ñ˝Z-Kfv9åÃÇ%~|K≥‡Â°πYDÉKes5¢M÷≠]’∑°Ãû√‰,·∫G±;Kﬁâcáî¥<Ò´nÛ≤q{}v{v—<›Ωm5⁄›õˆ	‹»&g≤[k{ÛqÏÕ⁄Xùè`tñiﬁµÂôºZ‘ı«nœ#cfBπ7täGïƒ7FT±˚¿xÃe÷E1ÈEû≥#Csm~eÀKh¿cì˝µ∂Aó”ùI}~C¥§ªB}a2√«∑D•ø»"„©[_Ïål∆(âœ7?∆càZÌìs€FXÕ¬´[Æqßj“Vu’MAÏïEü¬C^Ì˘(]aæ|IûX∑#h„÷≈gü`ÿ{%ŸÀ®O ‹A´ÊÀàñö·Oc¯	TÒÒc@âÔwŸ˜ÏÎCÔÈüΩ‡√qâaÒQAk∆è‘BÊ°kAÀ¡o–	Ü7Òé<ÒÆÆk‘≠©¯¯M¸Ô)s*{rÇá¥'÷°√·°bK∂l\´≥ç˜ `A9Y>ÊF£`j^¿Dßñ Z6Ì4ˆÃL9éÂ5s!"-˜±¶çÂ¥¬ã√ßùß’≤çDplÎ Q %ã>ÏìP£WRﬂ¥Ôï°°Îôõ&Èw´=œ6¡vºP õÌ¿œ{ÂÈ ?¯ë“á)‰gé]e;4#7≤S¶≤˜Ÿº—1˚› 	øÇ ‹“Ÿ&©7=[NOŸœ y˚Uyp·≈p
(x£ò˙é6‚HÓŒø›8öJ^ú¡Kﬁ’mã≈+«ﬁxØ‡Zî®ÏÃÈÊW«°⁄Xê»7Í»˘Û$£’aE1y"`Ú±@x.G_˜s¶(ºÓfÄ◊pBã¥˚ûÍπ≥“¿⁄≥ÅFlóXÿÿÄZîƒ¢öÔ–⁄6È#)%=√ˆáò“$#òV¯Sh˘ÆÌRX$û˛…§–=‰ŸbπLTò»√]!ì‘öDKNN6˛Õ¡æ˘ #}rº7°&rÒa|√6†ÿw{ñâèpÇ@ÓMHŒ´ q¨X:2êês÷ N=L&◊\™fé6áÂÃ¬‘(9ﬂ®ÆÖÓïu’M´^—ÿ¥ÏåM»a˛\ÌFÚ”1^Ë˙åUqÚ¶åØh~wûW”î[¬ŸŸKÚ#ÿ‰ÿxıá˙oˇÒÔøÕá±/Ú, €$&$⁄Ê"i‘CRÿx’±è‰îm–ëcd¯åè–åaÌdø§;§@):Ì∑ÄtP]ûË◊ú ´ Ç◊â«π€"v¯“ˆm‹´≈‰yu|¿æé´Íç`Æù!(‡=õX∂ √Éñ=vÚ©4€∫…ïº„Ç’T]Wù¿◊åÕ…6iCg\4XÅ≈ÅÅ’Åe≥2”∏h≥ÖF√õÄüAq‡©+/ó—`U‹±Oª `0‘ƒª∏Áƒvëz†Ñ‡ÂY_ld~òÅ∫˜6à^s<≤@‚Np#§*\C'¯’•ßÏsp˝π«Hxì‰0€ûyÒß5ÇazR,Ëœ)mõ ;í`ÁÄøïÙAÒaILÌäà€¯Æ™°z`€#nL6Bã¸√-ëZ∞#Ë¶≤oƒ÷WûZ=»Ÿ…õÍl`¨kWËΩ¶’wÅ[uR9ªhúìfûîÓ«‘GÏ¨4⁄ZUA•lLp;_®`ñy•ÙÏS˛ÙsØö:ˆ*8MùÅ≤ßß6éûVSP%oá£p£`+ã´òáújñ·‘πôNKpk…ª–ƒDzS)âX˜Ÿ±È~†Mc®µ ßWÛ‘Vó Á®[<•«û%,[˘|•ø„ûqÛãÁ*pU«–∑ƒŒ*(a£áy	Ù8Je ﬁã¨áë(>œ™ÁÙ`,j4«ev>>Lö'àÙë@F<Áq˛F≠‹ïlWÀÛ ü◊‚Å∞8¢åÿ:?ñ:oÕ<OÕêA·9jñ|˙Xí†8!'C∏ΩÓ÷ñlÒ¶L¸à$<¯í<Ñ Ë~ÈQ ‘npúÿÒ '%odatÏ3˛I∏ú<ÊÒ◊á¸ue•u$Ωõ|†S|‰ÅZ∫ù2F/–çúú>É≤fÊ±º´“Z]6∂§Í∫1°◊˝˛ïu1Øäö>•>s“µE∫¿>•z“wÌQÃfE€¥^Ô~ˆ#Œ€BB≠-v¡=t3†®⁄=µOâj˘ÜLs+T]~‘ä[µÙ=Xæ`$´éüø∑$?YüOe3…°x¡¢?\ggä¢Pkg™“€ôXkÓ¸µ]2›]C∂æ0~L÷êé£‚…à∆Íˆg—ﬂ(l†S¢Ok˝˝EÍÔ∫3^†Úû"‰∫KeXxÇ“Ú™Ë3–Ÿû∞±mO3Ã`KöÖ’∏lJÙ|B3Ÿ`*û€’=d<{œ~œus`^◊öƒ4Ë´„éµb(πÈ¯|ZöèÖMÏ√5t¶∞â¬a3E—
iËÃ¨5t˛⁄.ôÜæ0Nkm≤J.©7DBÀµ˘Ÿ4¥iË™ã=:3m[_kË/RC_®4ß§ÀiyU44ﬂ˜X÷©„	?‚’£QÒçp‘√ÅA…ΩãÕ¥«:ŒÉÿ‚ÜÔU~‡,BfyË…
€—L>(#XÊá+ËLY*ËlI¥B
:s kùø∂K¶†k17´ñÒû¬O€lÊ˝Û9lÁ®;Q?÷ä˘ãRÃ'∂øH”9üÄWEô)<á¢EÃR ≤Ó˙ˇ∞‘?Gx¶
–⁄0›Å9Õ∂ƒ…ù°Sõmñ3Ö≠Ÿ.˙R¢€◊∫˚¡ÏXtÏ≤¸{€}∑¬Í9&$`@gHú»~ŒG+§ù≥˙øVŒπ+ªd∫˘îjˆ¨_’U_%«∂˚üI/ÎÿïÃHí0gÎZ1Yä˘∆[¨¡ú¢_ÚÄKJ^R<r_,O17tYFXGùòpSø"4Çí—ÿÙåh±xﬁ`"¯Ÿ¥∑Ö˙π?ˆ∞QåÚ≈D˙rWÿ’’–L\<\7gJùP9gÀ§“ŒôX´Á¸µ˝˙y¶ØfàXfÉEˇ3∏ˇüÜA˘Ü\†#Ol @_¬%5gœ<O…d≈!dD"ﬁp™©º±]†˘∫=¬¬ûa¢W±ÎX6˛¯TÛ¶)ò5Ä‡BÊ—Õ/ÿ:x)ΩúâX®ìsó6Fsπ¨Ä°9ﬂÕë¡a„’Mß—&ßçÔöı©øn‘ø-“fEHyŒ|q†o ∆˛–àÍ8MÊ06âª†;Ã&¶—ß?ã´D¿í_b\∫Êãÿ&2ÑoÔ1lÀÂy¥Epœ6π†˛4Á—˛˜ì—Oah™£≤’2®wú3GŒå¡+{dá¢`@m@%Ú∆Ü': ^®ge£≠cK:sësÚÂ>ou»9µ˚‘“yÌê_‡b∂\€Á•…Dd≥‹E‰_ldv=Œ’Ø˛_
¬%ß`„’UUÁ≈œIÁ¶’∫nwß•C}ò˝z«¬+Ps≠ÂpJµƒx*#>nyƒHµäÓ≠§Süúå¸ÂEÖÂn6Á]j.sSπr¶ﬁ›©3wg®Å§"ﬂÖÎTk5D2&Ö¨A¡Ã	Ë¨¬§≠“ÉYRz~·#3•˝√Ï{ñzgQmsZ•Âi¯¶© ]U∑»!¸ø¸y≥˛˘ÜoR¿∆ëN'∏‡RπÓêr‡Q·Bç∂1ßœàç{åRÉhÇy8t¸…˛¯!äñ{'º”∞˙ˆ'»çG(ÆïÕ„ß^†3’0gY†ª¿'ªÌ ¥]‰lvü
Óﬁq@`Æ∏ô‰û' ¯kRma.√òÙC3ûÒ”˘µÜË‡ú˙|/#ÔVRu§ÓÙMh#3 Ç˜q)<Ω+ê/∏äD}∑—Èí÷ÎÎ´9π˘≈/
ƒr±±[Æ≠ytD•0å<#è5µL*[˜’4{Ã¯Ì˛Ôí‘∏>;Aî–˚ˆ#Ñ 5\Ù:_ÛR‡Ò@8xO¡7È™P÷ßÉohÔƒSﬂ∂˝!ìËë§â#F'ik»ò∞M560 ™>tÌ›"} ?mó\ÉlS
	ß≤/ñ%Z‰]?JÓ¡n™>ÈS¯ÌÚ§…%]“,&Û‘ƒsŒ‰&d«´,◊bQÁjﬂ’öò∞òı°“æ›¨#{Óê∆ÂÕE~}hŒ≈ñdAÉv™>√¡‚gÜ©zÆy4‚N≥M.–M≤4·ËÇÿ‰Ç{2Ó°–åVÍVä.ò%q≥â4;’U¯MÄõÿâ=OyF.\£˙ıe´v’ºæ"ÁçZõ\_]¸¸aƒ?”W˘ÉÃdÑ–Iõj,<g€úø‡yπ∞∫úHï∂ﬁ&ˇî€‰ÁzG’˜ºO>uﬁÇøbL”Ç7«{x≠gs\E¿p¯∑H+ó¡eYVI2'a˛h/ íZ∑[´õ;æ9wÊSf«TŸ>∑¬}÷9ÀÀhﬂ§SkñàqJR4ùc/l“T'3hø0[ßay≥u¬(æ«\Ì™´pw®∂‚€∑,ıŸ÷üV˜™Owü›Ó:Ô∑b˘ÒÒÔÕ≠åßz6r£¬«ı|Ô?“„›ßŒ˚[¸ÒCê,U™ëÕ ØÇÍ⁄;≠{ f÷âñ˚G»ª\¸H+¥WÌF˝˙Í∂^ªºmûìŒÂŸ≥™Tnpx≤ÉŸgè™-≤≥C˙éwLˆKï@W|§˜†À˚`a≤à«YÃü)2ÀüEÒg÷≤À©p…0«"
Œ¢ÁC<√±»M’≈†™S4¿åó~x;ÕL\
Lˇ˝aıÎ€ÉÍ◊?§ù÷¬B®VJ\.ÊÛ.«à§Pﬁ≠∆e˜a:c{I{«Û•dKw&ô~4ù~3Ïí‘ﬁqÿj‹N:®N%.jJ‘Rí°ÒÎë
ùPoãX∂÷Ê»˚√¢Ïxxï∞»{ë9ywG‰¯Ce‘Ñ˙Û®ÃÁ.MüÅ‹^*ÂrÓ~!8!'}UñN¶ò˚ÌÒz ˜’€ÍÌÓ!»Ù?Ì˜˚?0´P™N’*vª‘AmJ¿r@ {Çˆà/?Ç‹+ªòT;ò3{66$»CˆQÉœ-Û∏Æá^D˝ŒÍ/ä„˝ÑH¸!ÏÚŒºxÕô§Ø§,å9Ü˘h2ó÷ΩH˙†^–d$bñ¯yZËd&'m¢ç]ÚFΩÅs]
ıÿ£˘z*Ø}˙z∏GdáhP5#T®Æf“-w–S+{˚[ªœûomU∑w7o´_'‡·≥Í◊ eSí„ï,ê3Ÿí‡Òß£‹k9ı`ñß¿,#]â¨ $?Ø&¥§Ñ;sÓXÓqïËú(|e¸Ä)xÒS˘ÑÒ‚ΩeRRj≥£æÄ©T»<}w8⁄˝b…:X√º“€ò·´Ú3y¸!ÄÒß‰„ÊˆHu*ï€-b∞˝‚ÆÜ›}G'/?ST¡¥!˛L≠KbÕí$·˘ìï°‡ÉÄ=99&oø˙`êü‚ë˜«ë˜ãRîRœfâ_ÚbV9·>|ëæ¡IìªHî≈x-{„ æØUŒÍEﬁ˛Yõ ·ﬁ…·TïÜWıZ∑÷È∂Ø[ØõurYÎ∂õIZ◊ÕŒıUÛÍ\&ˆ ∑?G≈6ÏY≠ﬁ¨]êÊi„™€<k6⁄§~›nﬂ¥$¸±ÿK%ËdÆgÀÌŸV»ÎõSÇ€	àÌÌeöˇüÆpm¡… ;ÑÌ∂kıoÅ.H∑÷>otIß[Îﬁtf?G_)øÅ«¥]„, Åƒ*˘–ÁØ˛™0?i¯u6≤øŒ‘Cõ2ño∫∆F“Óñ±rßŒ˝äÊ¸ÅÑÂÎrq›ÈﬁrjZÒe9mú]4Í]‰év~”æælv∞ ´Ãí\\◊ømúﬁ^_·æ€’u˚≤vQ‘!uï˚=3dˆ3≥êe™ fµ*EBîJΩ¢pö‚≤c»_Äm∞áì Ú(–ß˜ ·◊Rk<gV„‰[c|p[ÍÕ≤åÛ8úë”ıË∫‘≥«Sa^∏P-yÌ‚Ç
PÍÁçÖ ∏y¶öudÔòtX*ÑÆ:¿–©Îœ©P©P∂ﬂêöP6ÊÊüﬁiL◊≥Û°ùyÍÿÂ∞ìØ8«	ÒQ˛	q÷	ÿÇÀøeWú)®◊î∫zH‡ÚXÈˆﬁXìÇ&“ÃÄJ,BôìNåT2â;ª[ë˚{π„{ ∂eÂâ£XÂÚIæèì5˚"Jñè˝•é}Ê£±œ¸dπw¯›dÛ}=J|Bg˛±€|…HèeÕFŒ¢GÆrŸqÍπ´}nch6Fü∑¯DbI 0siÊÍÊ9”Ê	µÈ(4òèú¥¢R{5ﬂW5z˚ bw{T≈ºß["’ %ÊößZ⁄–G~<ÎJ:óZOXƒö
ØŸ"w™9FÖEzgé≈Ω¬¢`–
¸Ó∏ıÒÏ~◊«öœ>5Ó0zﬁÜQo[§oò#$F˛^èj†ÀâK5√¡îÎ◊µœª≈L≠òé¡âë≠S”cµ¸"?&E°á–%>û¿£ÂTkÑ`du;ÑßΩ°˙;kXX®KÑaµK∂Ç–|ñUc¡
dîWiÌÕéÁêe\å…r@√oc¨Ò„¶Æ?aùsxî±ñ1TM„ùéΩœ(.ò_T¨¶Î‰äﬁ£d!gX®=£¶+‡n[ùqod¯/?‡XM
¬3sÂé˜‹¨Ú_ iáÀÂò{¬a˝‘Üá-D%Ãªêù∞0'ål≥ùcJÀ©çÙX9µ˝"%ìèKLµGı;c©2¶CDu≈SJj‘√LM )∞pƒ±…;Ï9Ô7,gúÕœbõ‘ÅbA+
ª1/:Ä+Ïhﬁé	Î<Ñ~R˜Â›lìÛ∞4'ê∞$@ á≠„˚ºvPT d±Ë= /œ2ä*Wh†ßÆ¬ß*Ä∂Y~ãm÷`ÓnTâaUF‰X<2¶Œ"W‡	[{«ˆÿ«:Ê
!> >ÌÀÏf¶.…GºüéÖã¯éÄµ]X◊bj d[BéH
øSäJµ2TrÇví$|Ùã"ï\”…fEm≈ƒmÑÍw„’˛Óˇï◊%‘a˛∫ì@IáÃ
+‹‚ä˘≈oHÚ=By„[~Û{l#TÙ5P∫;‰\mµ Ë®/©§Cg}Qol∞öø¯¶ﬂ˛KL\ÿZ`3¥ùædåø£äFÊôﬁ‡|ÀﬂˇÜááÖ„‘øCæS«&kúcìSX<,°9„K πF`≥ˆ˜q˜Î–∂$ï0–üYñ;gÍ»0'õ≥.è·ä˜¸ÌoD’˚ö·≤ˆ€T{0à˝∏ùµÒÅ
 s‰◊ø&u‰ç$ù≥/¯`‚Ôöı,"€˛á„çÒÑ0RÈbÏa(û:ò≥_'-¸~÷∑º£ì€æ›cåÚw¨¸qêÒ[:—Ü™a¥Í7˙báã≥eï„@¿¿0§:cƒÂJ  òùEö∑¯#s
tÒÙ£L©CªuÈ»Üê\ˇ◊_ìK¸å4\ñUªÕø"ï¶V<à¡∆»Î£É}VÆ‡9En—búÒHágAiÖ±cê⁄uØ?ˆ∏¯ùô∑1á*L76˛ª&G â·Ûƒ™(p+ˆ=9ÖÖôcfmf·óÎÙˇÑNj ∆U'Ï,Qç∑üª™34¥YõÔ~w€S],Â˝øG° ≈œ…	æ¶éTÎr¢ñÕÀÇ#Ô„‹-!‰UU◊‰◊úÃ˛{ÃDÃ˙>ìç$C†Û]˜3‚£S∂!0ﬁ^ÒNO @f„'sæ[Ê8//aŒ~⁄ﬂ—û–£®ø3V-{ØÁ≈⁄ÁŸ√qã˘L_âJ·a∂ù,+º0Ωc®)ÚÃáôVr"°‡<1%ß,7ëH∞zzq´ûÍ@•òqhõ˚‰|ú>ÙN„J-¸≤§C˘Ôf@¿!@EßhÃﬂ6Ù‹ìë¯[ ˘\Ï•§∑‡ß=ˆÁ=ñ√ç,¯h™©≥ìﬁŸÇCúüe˘K&ªxTM8ÊÓ0πeŒÉªO∑vè∑v˜ûsÔ¡ÿ˚1˝!˛ìîE'M«ºõû®≤u)JÛÎåÙz‰Wêïu6]\xî1“££¯ΩÙ(#/ú.˜MÒî∞˘€T9M†óˆsêcœ„b4ïä÷‡t%LA£Fñ<‹+;Œ°√|jãÁˆ›œXÓí4ëÂ˛ÿf≥Û∏–8{Ç]B˚_Y|îölÅ)‚È¯∑YüÊõx¸o3Î„ëM&ö¯ıØgmBÿC‚˘¸ªô«l*-¸ÎÃs¿7Ç¯˝¨œ{¢Åﬂ˛£¥ËK|> Úÿñ|/„/∆›Vô∞∏¸YÓµJu√œf	7’¢Õ·¯Uæ˝øÑ9ı¨h7~emÈ6≠»⁄u…V—&	N3˘˘Fõ‚û74Z·”µEíΩïl¯[:9µÔ≠∞ø2©óxf'∫|ƒ…±ÅˇdS∂geâé≤ﬂfp‹frFõz≈∞.’da§‡ 9. ¥£üEv4	R'UÛåhëî†‘ú÷&™%ºTò2RÅèîÔwèX2â‡	ı∂Xzoπ´5:˛îÛ†DÚk~…ß¿Ê◊LiËÇ+Mú%ânö]ÒqKñjg%±¸3}mÏÇ—≠à8TNJÿ$åPˆ7#4X@ÖŒˆRfVYÊ¥ólj	+$*˜dµ‡ï„ \‡≠¬˙Æ∞Q±§Ü6øJı	ø>Î&≥"r^ÍÏN§éTjÑ}Rñ⁄≠úuXQv≥r∂,Ú´H^•J†»Û>/è˘a˛∂"⁄KÒ‘
{©B+\b%CËZ:éE8¸Ÿ@e¥˘•ı&JVî$àüﬁØ-ôUâπ<a…&'«|R{¸ØnZ˛«Ø0ø•Éé:≤iEíE“Tó°/±{#fClÚ_–;jn˚ˆ6WáÊ*õ€.e~ï'∑O∂»íÁ56€TïÒí¥C%ŒŸr(}ü0ó6jÈh“≥ﬂ%b%lÑ¬Éï‡2t0€q«÷c+°|Ï.=¿K†ÛÙ¬ï=6ÖÕ9\çé\D·åµ&Ä:Q=“äΩ≠î2ëdáN#…›º√0û¸G˛PÊ† c&^•\]xH?ü);g»i1q;Ñô≥πË‡%8mô≥!qÃí8aô≥©ÿëJxä2gS<…ïq ¥Rt
›S,T‰ê>gk^Ωπ[ñ≠SX_&k8îGöX^æ0MúÖ≤ä‘ƒc¢D≥•±â-€RÖ#ï9±8mnŒ…ì\dP(}é‰‡öµ·≈GáèY©&Ω~“æÆù÷kÖb[ó7≈Ÿ„Ä∏‡¶πwö‰,\F˘ûzGÉs»T⁄,ñq&ß<x;('8Œ4”'üôtπ?ˇâhòÓ0b∆9e óÕô∞y;∞:Ã„ÙÅ±>§ √ß≠@ô‰bG‰Äbπ°WæK3˝ÚÕÄOK¡Â˚:sÔÈ<`?ßt/Géc"—;-Ss≈oV™«O¬ \å‡¡¸9DfüDÆ¯°»+«:∂0ñ)L!st¿T˛`Œ)k'ﬁ“ g#å¯è∂fbÑAr°‚ °ËD¿ªSF%´–ã`òïD¥d…Ω,Ûê‚1ä‰Ã €8ø	ì“í◊‘tÔ√Ã…˚£≠¢å#1«ÚÛ<Mï[-Làﬂ›é˙ªCZò~©√í±UòW(Q^·W≈âﬂWUf&b∏;óìﬂånÁU}ÿH+%OÏÏê6EGfqœèâ⁄«E¿›Ù°->Åßª∆àÇe]ëSNÈ°UD≈1ÓfîKÄM<±ù‹X2®è[t@µ.…ﬁ¶S¿0}˜çπVÃñ(mvœºJÀs&“V>√Æ :ûHßóÌµ≥ø˘CYy∫ögJÖ…od&]≥pqâèGÀr±-Íï◊ºÔªÙWcjaﬁXÁqÇ˜î:aYõ0
Úâ‘#Úm“G	ìÌ"…ØBŸ˝Vﬂ§{)œú®ˆÒW
ºc“ŸÓ‰22@P‘l˝u≥›¬§Xˆ•—ﬁﬁﬁŒˇ¯7q! ΩI%±õO>ñß»(5:QnÔmìñã¡(ÿ˛	{‰7S3u‰û
~¬õ˚ˆ/£¯∆∞YüXˆ=yI,zON±ZWâÿ‚œ¯ K;æãœŸ˜€æ›Â√RU6∑=«4¸
Ó©_˝°∏µ0Çßçïw+-Â#-˜:Ω¨bìœ≠~;"Õ“v7N±¸.WZÁzc#—)kQ}CD˛|√8îÕÜX‚cD∂}Ô}a”˜@À0Ì∫tÏk√&3Æ‡÷«ûoè¯ﬂO|˛vÖ’àSqnülëe[K:ıU√<.ø1,’µÒüø˚ßﬂ^wòºn\¥HÌ¢—ÓZ‰äR›cLÒìç≠Ú&{∂éŸ„19¥Ê ìÒ∫],Ç◊Úò|ùoìKªgÄ ‰Q6l®"˜ÑOıÌ∑ÂeΩDQ/÷¸-sfNXeñdÒãÄlÒÆYU;h1u‘ÉuO{∑Gü)	¯'” -qßT(I¡M ƒ˘"≤U”ù†ê»0È°BÛQ|bˆ»ÿ ä-ıÊúJ≠Õ´ÃfzÕßÁgñÑî\uÅ˙Ø”˙°í4GPOHTïíRGbüµ>4\LŒHÆ‚Ç¶H˘‰*Ÿí¥à36é„®x˙èx£„ë…sq‰ê}YrÍtü‚y-ãíè∆ÛZÇÏ`«o<^†l'#¬!¡ˆ6i^ëV˚˙º›Ët
-‚‚uœ›-ò'ŸPVvÕÃõÛS6ƒlû4HÑH¥m0«X¬w‚¿“5OYﬁà.c¿∫Ö9≠HKµ®)«Ê2	}ˆX¬aTÛ}9≤ ∫/.≠Ov1ò¿U¶WöìA¬◊V≤pÕΩrÙ}îÚêOŸ'r˛Òâ∫zyƒ«è'VÀ .$')ãH∏hhi9‚Ö§d\≥|CÈä{…•
*Á}aÌ… ÍØŒO[m¨âd¯†‚ˆèD•˙u´U#µOc’’1◊ÎÊ≈Èm∑v~€y›l¿ØùF˝¶›ÿÃ»¨R2çÖ°ª†=)ëüZéÑùãò‚Ì∏–A5·}lëóñA '›≈+áW≈B$!«≈Äß5&—Pr?z‰¢q÷ÕY“ºg «Ev(ô°#¨îOò-ŸÃ^A´È"v∆æ•Ä7nˆ+ãDæDô#&Ó•ÖQsQeπÏíπ	ù±&ºÎ¡øQ‚›¨ú≈©ÛœÃä∑q—É∂ÃıgÄı€ç´ÓÌÄãFª’n^ÂQLæ,ï/≤W\πWP{'…≥T`ëRπ¨’CØ¢ŸÙ¨'‰˜å¢-ìx≈\1+√}dÿñ¶Ôé-ç9Â%àÌ[éeößŸ ¨DMIÿ4|HH-©¨ÿE2Ìw£9&q!yJj4±/[ˆ=òà$L‹Q©˝dTºîÛïºÇQ˝1àÜp·C0\5˛≤{˚7çõ∆Áñ`ﬂÇ’Æâ™èlqœ`P‘u¿¶Ù*
bæM)Î _$@˘LB¿ÇWÆî‡öﬁ∂éI¨g¨≈†ëJÁuMŸ;|Z≤√¿hx˛1Ó?&pJp¥ˆIêÛq&^a5BC]Yêñ—Ô„ÊVôî¬0≥Àå‚|ÄÛ,Í\ıBK8§!ï9'≈5≥	ïÿsmØÃø#™{J˚&OuZU∏∂òOì)À,Vπ ã'õ,<>ë9:	èMÑ*ﬂm∫›¡∂º››X∆Îóè›à[ibHÂ…}>ºÕr_-1´bròì∂úìÎtˇ
vßD.s\ÔD÷Ë£Éjí&ä”!î∏NÌÓ$ù•ï!cïp¨ù7ç€≈k7Œõùn˚Á¡y‚˛Èü√súñk˜@>±„÷®ˆmékë√K>H ÀÇ&*ÜåA0a¢ôâH^ÏÊöæº∆≥Ü‡_ÖÖÉ¢rAÏ^ñ$dÕñÆ@ìP·S~•—WOì⁄=q #î»jÆ‰¢çY6>ImxáÒÄ%[ôÔÀÛ‹x%÷áùáÕ]|}æ¿C«ïä‚
ªƒ¬¸Zé]2;A4π9∑x¯÷’~^hõl@õò;^X¯!Â>ä◊:1É%Ø9[∑Ç/≥ã}à≈åΩ÷,´%H!nŸXŒ"ûÔ‰w˛·Øˇﬂ¸˚o……VIló·ô$«¡ûj7–¿4s'‰y5 ≈[$ÃµÆxàPÒ… [7Ä`≤&ñ8€egÍ<Û7Í’F™∏ˆﬁe{û‚R π‘“∞ùâ=v„	À1´˘6È¡tˆ(ÖÊ	¶D”vB∆≥p°-ñ›€D_ü¿√CTﬁoÊ$ÑπÀôÖâØ–ç€êÜï6ÂLgÙ&Y9ΩãœçíÕR†bˇãﬂbñ◊6ÃÔ¿‚pÊTı’"ù‚bX8˙À®FëôMJ¸Ö.aEÇå‡|oîm›tFË@!Ì’ãq:+VÏΩU¯ÔÄCæEtÑa~nVò«ÆpÚkÏYÌqÈI≥œπ)*ÄÈ◊πÅ;∂à=6È9Õ* äO]›"XÉæ7M∞ß0X`g`√Dg˚#ÂobeÃQ`Ë#,À›¡lr’4'€ËÊ€\xl"m¯®ù=≠Û‹∞¯<ﬁa!ˇ”3√Ï™÷Ñ¿¨P›£.|˜¿L¸◊ ¡Ó˜Ó_JŒñW™GréQ∑dz˛ù£,µùááÒDoˆ9ƒb≤˜Ûî∆Áb±„B	ßÏzÏÁ fÍ£¶Â˘ÓXÛ≥âi NM1⁄)."B;¸ì0ÉaÇÚaíæ»ﬁ∆åù¯
≈›9ˆ0öeußÉ Ó ñÛÔﬁ¬ŒÇ¿éÕ<L<Ã˚1˘	œÜòÛ=˘òâ.
‚G≥úrvmKÏÏ‚éÂ %nk«ÀÕHVñ…uQõ/<4À∆Œ≤Ø3œ˛äGCl\’N.ß§¬&6ôy}⁄Ï∞O3åË¸ƒ£ô¢¨¯˝ôæL/Ú1√¬®’ÚÍì∞Újî‡Éè]§Ñu`!¢≥¡™¨pJãÁ;AÃstúü ≤8≈¬Sã∑X]êâ••JÿÎÀ2“Ö¢Øºf	^râÎ¶kó\PõT.'‹´¿ı1ûªµ,”]N—í‡—Y“€≠DÍrºr˜∞ãÕ⁄OK¶ı°m√W-◊Ó#Dgÿ±úZKSµÑ‰Í`É%iÒJíÎ∆úÙƒû˝"	™p&ôÓcË˚éwº≥¶Á ŸÿÚÄ◊Ω·∂fèv¯íÏÄÆ>‹ﬂ›WûËzø∫wÙTÔÔ˝Ï˛ÂÓaıÅ/Q˚®˛7}P=ök;ﬂ¸Í%ÇËˇ¸›ﬂ˝·°…¶öÏ $ô£’ßœû<{v¥W›S4U?:–˙á˝]]™ãø'ój@œè’√ËﬁÛÍnıhˇŸ30Oûk{œ{{œ˜˜´R=¸ü‰åéΩèá’ΩÍ—”ΩΩ˝√ÍÆÚå™O©¶?{æˇÙH™èˇ=±–{Â],À3èsqŸ	 ö sπ¬ÑNN6º 2˙„ï)JÀ5Ê¿Ë˝4‹˛Dô¸Ò ]ÖŸ3˙„≈Ú`0◊¥8…dWÁ,;ù ÃÏèW'7Ä‰|yävπÿ˝ü*„0[¡¶ì˚≥œÂŒ§?6ŒÈ;∆Cé*<≈#•u¥Ÿ∂ST Øƒ…u˜ûª›sP‰zû(ë;C¢&ﬁO/Fá3ß◊/Œ{Tñ[(¸Â“Ûï≈∞§Z	˝◊∞æ56V£,ˆEÖ’Û¨¸Úó∆H¢ÿπÁjÇdò"ªqÕíx8ºT”±ì Ú¶%Ω(Ún≥2ì¿<0ËçÚvÿŸäK›ñm⁄≥≠)¡Ge)TJ3ô|–T”ËπÏËŸRDQ	v*£‚WÊVƒ‘ã–EäLb¬¡*;T"wÜ7f•ø‹¬HØÿÎÚúp∫RÕ»	%»h/}ﬁyPMë·,±r•˝¡‹»1ØÀ°Ú˝^*Î(Ñ«≥9Ôoˇt∑⁄{~¥˚I∆ûoœüòÏ†«∑ê’Øü‡AèTjﬁ≤{J≤ªÃë¶6Ã]Œ≤€@ã®%øb¸[~ÔX#˜˚YäÊJ¡ó·∫êÈsï§ÍWı⁄EÛ§]CGkŸ,”fÛÉç¬{$¬£ìÔëèá%Îzâ±‰ OlóOM9_tM„‘ho#Ø^íÍˆÛC–ø˘Ÿﬂ6@o§Äüa™„—∆«W*ô≠ˇîÏV´õ€æ}fºßz•∫˘Òk¢j⁄ ﬂD2qq^‡TtÉ\¬ﬁ+˝r÷˙0k$ÿC6Iˇl)˙Y¨Äu)7Ÿæ
ÒaiŒ∏∏S‰¥ ¯	 LïSﬁ u@{’”o¨àéK•˙è7`[-◊`w•8OOpaj#,Îj≤‹#]Í˘ï'X;›Ω’Ü∆à>Ÿ"GáRI‹¬q∞®,ù¯{ﬁIÊ8‚WŒà—SDæ^◊É=B˘V˙AyTu√æCí,Ì Ü0[vßƒ€ŸDé}h∏5¯í‰õ[}lÜÊ¡^AUW{?#Ïî≥øER"ÔÖp{dXê´œ∑P∫>%∆?˚H∑G0æü¬«’˝MÚkÜûÃ0°$v ;”X√√€ôûJÕÛqb5fh©,'KÚ î“egÇ+ãÁ}tOÇèn5î_»ˆrÚCå÷}Ü€]Íè]ãTeüê±bÌ2û˛3`iπˆÂñ Ü∏{(3Hâ +”Á˙œÉ|ùÈÿ·XñîYÁcÔ*Ç≥RÛ3ù5z/≤¶“Ωg•Œ@îZñÌå_≤9œ“^SôNß:;gÚ3~ï£		ã§ÿ ¯y{ŸËº∆úA⁄¥¢˚¯ı[úõ –7
ÛQ„%W§•ÃîO›+íÆœ
¬
Ø„âÃÎ4íOä˚ÿL6É%»[ŒÉF u&~Iπ—˚œƒØ≤E+›h ‹˘¸Æ—nû5ßí)’e	x
˘rB°<I-RË¥π‡ºπ•ÊeV2\ôsÒ∏ƒ:»å…˛2€…~Óÿmñ•÷$õyiÛP>ÚiÍËPéÂ⁄yAç ïÕ‹∂I≠áN¥ót37Ò{i ~˘ ∫Î?-»©˚¥Â˙ë„Œàçˆ2£ñèíYÖ“[Íb£ø
∂Â›ô§…ãÊK≤Öîk>ùIa÷$,Ö[Ì≥∫Ú¸†∫GÍˆ»1’ wC)	L."Óºs2 ‘◊T’w¬”+Éπ£r£uë$`∆Æ™@Ëäo+.ã⁄à—:–»%|^ƒ—t˜1ÄT6>I@ŒËƒÆÏ8*—üît(Áß3GïÂx≠⁄·~n)¬(Så©†JD}Z»ÒN°4TÑ4<aQ=≈âC_Ï˜KòÂ@æõŒãàÇ0J≈=IÓ˘û“>µt/Ê/Œ¢ë0D»ı®¬úV¢®•JÀ5&‘€"u‹Øπ3Ë=L¿&s;aE^ Yù5g÷ª0§)ÃÙÿé¶◊&∏¨≤∏Êï	ü®ö$Íg:´«'≥pá˜!Í≥<Â|»„2j.Ug7Å˙*Z§≈%f
ÆÇØX≥»Ó1©ÈH™ãK√™më+€–≠‰ó<¨¶‰úqz»π!!πÈí…˘“NâŒÍah]~÷6k@åƒŸK±ﬂã§<{–©∆Ä9™˚Œ§y~G≥J˙‡ö¶•–ímA∑%N]ÂŒ÷äÇ\KR $=p„aªëIﬂ8Ÿxu¶ﬁøÉY⁄›ﬁì=Ö*UiÚAC)Q/±≤úg1πÙù·a¬¯-¬JÈ)å‰â™#πéòÙo9=ÓÅm∆•4Fπ∫∑ÚŒu«‹áÒ±<“BqcqQwõ•õ◊‘1L¶i€å◊WsÏ“bAæà√∫yÇ’@U"mÉ¡±Whp<®2l^Rüx<8n»–„¿—Kçò&‰4ˆ˘@íçQèÍH≥˚√‹]±œ%∞é?÷‚ÜÿπäçÀÒ¡î∑ !ñ5MaxXÊf«Ü%ØÇÕÆT¶ñ˘≈íW~áÁ‹Tû’bæ=dπÙüh∏òqÆØíÅg◊gg⁄È]ÄA|Ì,◊Ï	··I*	s.‚@÷®ÎãC]7WãÖ\˘¥öà´·˘$êÊÈJ`Æp =¢~po¸Hı-rg∏˛∆!Ã\ƒJ"Ã[ªe¿•ÃbN”[‰O[≈òú&1Ç]	tºúDoµfÄZ:2ã‡ï(¡-®å∂X7úÛZHè)é6edH*ò†iëkÀúH=l¨≈£ÍZ∆ úüdeœﬁ2£¨ÃØaª§aV.”¨
Œ⁄?é*ƒâ÷7WŸÓi}yHÎ‹ƒÙçãEZibƒ≥ö Kdµ«g+≥∫»#P}‡I3¸≠dﬁ6ñ!”¢¡hﬂÍ6¥Ï+–\+üæ≈hñj«¿ö∞ÜE09¥=ˆ{¨r†À≤·ˆxqêæùgŸwL:`≠ÙÇxŒçcß‰†b∫†ÀÌk»6úk∏ƒÂ!NnÉeıY∂„ÛÀ±Oı•ÅZb¢»B†÷Ù¨Ñ8+c¬ñdMwwç∞ÿ%ç∞≤9dU‡’¡1∆âcÜd€ùê:JR¿úRN©á—‚‹ÉÕ-/N∑ÜZ+	µŒìv±ƒb—÷âaè®Ôπ@-º hÎ§Ÿ™ëRØ∑j+µZ&ãåâ\EÜ™7ƒúï*Ê√≈B@Ä◊∞&ÙΩfé=‰kìÍÍnG)n2‹¢Á@äÿÄL–MP≥G#ùQ bM;öl1/œ¶Íí{⁄¥¶”˜ò…|ç∫f@]°HfπfÈBÉfπ`´% à2›">aGãΩ…“‡.F7E]9≥aØºi[jñ”È5có<+‡ô%Fcà≈nÆ†gÌNÌÇ¥ıÎˆ)÷∑hµØªË2tùô,.Lüˆ¢.r…iwXÍóù›Æ,dZd DYì¸Ï (”i4KV˛rl˙ `ñﬁ9⁄4mπ∂o.-°árŸªòÍ®ππ≈RË«˙ ¸cá˚n,0‚`ÏﬁQ√4ÒååW#÷®„≥¬ñ%sWñW·±`S„ΩO∑DG{(õπüéK˚cîGztb#∂ô Úlöë∑,/+¿;IÉÍËï≈˘3äÚ»Ω·ëDV◊ ®åô√˘Ç∞DÊã•ùÅ´Ó∞ Âÿ•›√‘óuu‰IÌŒ.£ÒPﬁf|à’¯8v„rXé(Aêxz˛≈Zè$ $Óº{RñÃIíüz„æ√§·ÄoßH[ª2ˆ‰cZîk£‹BÒ]Ô¡ X<”ŸàØìêz™„pë7∆‘WÅ¥I«d⁄tF¸ëÍΩ€I$¬«ìG$–ÖÁQöºíÖÖ†T/µ$%lIY+˝ÛŸìã∂(˘J!ˇÑ[î	áµ6Ws¬sÇ˝z‹s(“±¨I)oTŒjV&K>®Œì5/ÂÃ‘$ÖvezÚdÃ…œaP&e™øRO~:[ÚÒ¨I{R∆¢$\3è))kL mrï¬;ÙTÔ~Gæ!‹ÙC◊3E¿ÂkXˆ√≤Ôò¶\8"[Üf8@;úÆ82ã—÷
„≤ìΩsfúí√z∑B∞Ï4ÿ°«\‚ãÒ·Ïçº°˙éo˛”∞B}Ä\ÚD{ìQ∏¶*7~Å.ÛÇu¿Œ.∞›wÃ‹•ò∞√ë8î£òﬁÙé≤zFkd62”4ˇ.‘.6ª»Xâm,Ï¬„Ü◊≈˝-˙∑.0√°,ëÖìb±h∫ñÖÖ=]„Øƒ5˛J∆  /^êÓµ=¢§iwI#<h]√Æ/v±Â^4ÍJQR•˝›π¢ûü]Á ’•ÂD[,#yc(g9aNõ+πbÒB&éÉÖ¯ë@æ¨‹ﬂﬂ*9πh0l≈GÀbàå¡ÿî:ÆÂ¡≈‹¬|ˆÿ◊m;®~ä{,ÎﬂÇ!c≥ü"a‚ëç·Dß
k–5Ëb≥å|	g–0∏S"º~cZ˘Æ+Dπ∂ñq±qaJËŒ≥(Ë5=E!ÀòΩec”]^£≤ƒ5*ÀfûïÅg5 Rúú∫∂¶Ò©·aÆå5<˚≤·Y›/ù1

2åq¢™ÛÓ\±∫≠}Ü9«Lñ&fÖ–YPí<:o®Ì·ëe¬›ïUñgtbŒ`.≥ﬁÿh∑E,È5˛HuX,7skç˚µË\|@+ˆ»˘	¶f3L# ‘∫£¶ÌîFxØ—YVR∆LåΩb‚tÃ9µ˚òÑ?Ó˝*‹^…%,˝í°3>E«∞(lñ9AQ>ùÃÈ[vÑñŸÎ/§~êñÀCÀÇ”ÊæA∆£∂÷$o'§ﬁÆΩπh¥…7§›Ë∂Ø˘∞…i≠[#¯Æ_≠ùk?≠s-¨ò”K˜ÑŸß= =ky∫ ¬Yﬂ⁄{ëUñcŸ#{Ï·‰’]ıﬁÑqÿÃ`dâΩ˜J&Òs9Ÿ∂xÓŸÿ…aœˆEÓY”ÚÜ9sX‹KdXÃsÏw VÓÿ∂!S.ök8¯Kh§°ncë°õ1±j9¸¥cLè;x`z∏”÷É”t>{I];ü/ ›ˆ⁄°Pƒy´ã∑∂^ø\Îu±Ö_IÍI%V◊dumî&€˛{üªûØêŸöpƒúäŒ≤ú
^î˜°Ÿ⁄=ÒÇ’CI[ÚìÉwÜÜp…rwo	ØZ!>y˙ÿ@xÆ≠’9¨’Å„√$u»fhÙLáÅX˚∆r8‘ÚÓY2õFå¥¯„Ñ‘,Ö∆jzˆñ›LMıwm†&Æ‘∂Y”¥yù€6Ú
^^cØ5ˆö{•ÈG¯eØ.˙:ß#0ÈqÍôeøB‡ÎîB”.;4 ì–l¬(Ó∞î®ö2µlû√∂4níSvƒ˜6ÙÚJµ°0eY’î P„C—¯ÖœRs∑∆`Û`0∂2¡¬Ñ.Ébj˘ﬂ±3É&‚dR3M˚~È¢õ¯P∞@Àb˝i3Ê)Bbs∏Ùhl∫œkDñ∏fAdŸL¥2®¨f˘C◊v¿ûôÙ÷AËkt63:ãË®n™cËÂ,÷ﬁí41¡+Öœ,ÉEëÉ∆F\≈ q2T.;8^`Å§Ì‡HI$B”çÅ·«Û¯≈‚û\ ÉŸ˘	?D`HÓ‚‚˝DÇÄ˝50õ«ï#X§PùƒyJ˚bı A∑®ãÒMK ¬a,é%g'r‡HN⁄≤É∞dw◊¯+qÕ‚≤1≈++ΩÍˆƒ?ú^„≠/o=Fn~í$üzAù¨,YRº8fpO‡¬[ùqè%Íá¡éTwΩ6ÆlQ6yÉ‹CÀπ˚å Â)˘çÒU≥–ˇ6U…qç;tâ≈ æm˚¡nÿÿ'v?,`â≥»”L3O‚R«fµ]c},9_\9„)∆R◊éè#|’cá˝Q<y √ÿ∑··•ÿ0[.$¶ix<i;>–œ¬¢Ã”SEõOM‚≤É±©ØÒX‚ö%˙<ãÉVí5[U˙òºCkçÕæ\lˆH…¸	iSﬂµU¶‚‘D:0C©t–C”ﬁ"'0_ﬂQ◊ËXAÒ÷Q‘[Â`uñ˚^$∆_©Hı≈$˝°ØmAΩ•XÖ≤qjì+ƒ ‘4…ÂÑ4≠æΩ¡∂… ìQ¶çt Ûˇ«s
ÌTˇå8∂3∆¨ˇµìè™Æ6∑1«⁄±-”∞(ÈÂÿú+⁄êÇµ´.L6‹πÜ{sU«æBû≥%¢=h≈∞∆Ãs<t∫>r5b®p\=>.≈√Å-
Ù•',™îôû…eá|ÈØ_‚öÒe1—  æ∆∆á W« Ôà,Ôk‘˜Â¢>æƒ5ì∫ã~˘$µ∫êÆÊ˙Ü¯‰êú®´Ëö÷&–‰aˇÌ>Òá4∂HQ 5|∫W›;ÿŸ}zÙ|3^”.Èƒ•#î+æ1¢±¿®ÄD∑ÇõDnn@⁄ê}éPø¬Wa.¢Åe¨œHÁÑnt\3`˘8c5,µg—ÇÊâV∫Êéƒ›#5:VTC3Q·•,‘≤¶'kôs∑ÏÄ-´”k–ñ∏f myÏ≥2¿≠iÇIl∑ƒ#˚,ÿuX√∑/æù´w‘\8p+#©’Öo®:«¨XmãZ™ÈOV¬u]c0¿]x/Ñ√ÅõcïØv∑™–.L±Ë¿4–ìmã|u~äæhÆ# ±;√Ê@oì‡,π©«∏ÇxŒHOS-ã7fò∆m<^ˆóUG6¯÷n◊35‡≤ò
bkÅLßú≤]”Ÿs√—(=,
∆eLQà‚≤¶oŸA\Fü◊.qÕÄ·r¯ge \˚¨Æ`xÙd
JÚ\˛0øk¯ˆÂ¬∑:^u~5V›≈{≈’Í∏VŸYW
¿qá)¿nÑQ≈ÖFP\EëùÃ›Mõƒ›„ÿπß®ü§Ûmh„˘æ£"°ﬁƒCrLï ”]€âÌœ!ú[ìŒUYΩØ!KE”6QÒï ÅË≤51%*\ª(¥ñ7O Ÿ˛?   ˇˇÏΩÎrŸï.¯*[ú≤⁄HÄ§D—%ï!í‡‚Õ XÍjµBJI"- âŒD±hFÙèÈâ'<}˜ƒƒq˚Ñè;&‚Ùœ>?NÑÁÔyîzÅˆ#ÃZkÔù7‰æ$ eªQ%»Àæ≠˚Zﬂ2,‰w]oS¸?î∑‘OÂMGSﬂnÈÙ†%u¿ŸSœŸÓ–˜ﬂœß¨Îçy√zvËú†Ó∫√¶ï];’0°J.áKyWÖM•<nY®Y˜ãÁh#~»dßfhıÓ|4ÁJÖ3Ò0Õ¶2ùè@¯ÿhzqdµ„b77∑í>»‡‡Ä)¡ÎhØY¨JœAïÒØÿƒuêççv‘=Ö∞(í¿"Ñå¿ßÿE˝jJÇ3É-ô†ñÅNCö/“º∏’RØBPHì cTxlÜï‡."¥Q`ÛIgP·+R	£Õ5›=B‚¶On‰=ìKd#]zêâófdΩYPÜÓ¨õÛûÚ,òªÎ?≤π=æÈ4/±üJy´Ëù7úèfÂ…|4*zÎ°ñ_ø±∏Õx˙Og†6∏”ê=aØm$"Ü◊iŒ˚¨∂µ¡∆·Â>[˚ˆWøe]<ﬁF…1Ø gt˝û}B+·¨c∑Ï2o˘ÙÇ”F¢˘9¸¡['a+¿u–‘÷ÿÌF¡!’wÂê~ˇõ_˛k}úë`ÇAΩÀae‡ç›I»Ã"‚ˇÅí7H)˙zπ◊Ó$_˚[F63’rG©ùÁõÿ+IIÁ‘äùK`ƒ∏£e∏‹&FOˇ'˚È‹ºˇœ¸®Û8•:¥Ï¿œ$OÑÀì©]Ù‘i†|Íç[◊xGÃ…‡ÉÁ^-π5{â˛Ûø˝˚Ô˛ûµ>8£9ë!œ›`±ñ/≤jA£‡∆e©õ13˘XåCy≥b!2©Ç’”∏\∆?7Äı}¥‰;D≈=80˙≤-≥∑Âp|}UÆÆ/Xx±~¬ëºÜuƒﬂ7ÿª◊ü›L‹+LÉwÀÎ’ôO4È‚¿ª Ò&óÂı€7`ê–˚a?oﬂŸp"P…7Xã˝ê’÷ŸÄblXÊ-\c√ã/k˛¢÷∂lFeqV€‹d.÷b28åŒ6úe§>LgB]ÊfÆMk·ë;„h/T«!ø^[≥+ﬁ8Ûf#óãÎ˚∏l‡„§ZU†·êN¿Î7(,,H j°ºVVÁ9¨ßFPùŒ√ay-Nã2à÷¨ˆ-~Wé?>˜U‡äC≤Úñ¢ØSYêπÔå‹¢“j˜∂Br®ä;ÿB·‘˜BAÓ`ÒÖÏ‘˚Ë¬ˇÂıK.B◊GaD/—Oˇd>;G”éΩ‰ºæË˚nﬂø>Â‡¿qÓ+J÷öπ##,.<EûüG•È©7&É7Ùo≈≥µIU)1HË°;∏¥›¯µcˇ‹πÿ§\Ω¨gÍ•ç~ÈHÂ‚EË≈ﬂµ≠Õ}µr>Ê-µe)n—7,∂`À}U¶®ÏoËûQn7ë‹Wæà[.âûX=ÁÚr	r»‡√Êøå√_ßãÌøhˆ,ˇe˘†ùÖó2ÖÚëB8DN”ÿSÖa∂zUqìH_Ê#ô¢â|>◊e◊l¥)pG†ñ«@kßãÅ:˝[TßE)ƒÅÁ\N¸‰bÙ0πﬁg%¨5¸ƒNSïcK¬X4ÀÓQ£”;}yr‹bÌ„^´”lùˆﬁ { ∑J≥¢>Ô,áZ(Ï"pPa
Á}∞√ã9’ÛÅi2F±Yµ€B?}.Sª√tâ˘Òû;o¢∏ÊåçÁØ:«HŒs¬˘#ò7S∏éM"M}‰ÙﬂWŒùÄaT{‰\ﬂÀtÛ8Ï]∑ôΩ<9jEõã≠…zÎêïÈ˚¡9V]Ú¡‰!πMõ˛ÜòÒ5HπóY+¯¸&ﬁhu⁄ç√hÀE◊Õãôﬂ∏Åh©¬ﬂ $∞∑Ò<s$—IÔ|~éÒUXëN´€Î¥õΩ÷¡ΩÃ=H˛Ûü´AF„/3†M—Á9Ï˜´¯Ï§«Z—<<Î∂Oéﬂà∂Y@bÓ°‡,ùcá‹(Çï%DªEèZAƒmÓc9≈¬]Êﬂ9˘≤’aç≥ﬁ…Q£Gk–≈sBˆG\ö{Ef>ÆZìdizÏÁ±ú∑’ƒçÜö›ÏÛß/,∫&HaÙb€Æ
rå∫ÑªQ?èÿOòvüp-DIèåëpO÷=-EÆyóï†?lºJëWÛOg¡	‹ÇÖ˙ı+o6\HƒΩfWN0°∂Í˜≥ jK˜.´g
ùù∂«M3-Dˆ¡ÓGbVzyª”Àª˛zÓ‹+3P†aÙ9	Q⁄âéfE›L
è¸"Á¸∆NSƒ’N©†#wr	õ˝îmŸ.s⁄#ÙNËéíˆˆŸg79/∏eáŒ5Ú\ûÂ˚ŒŒÎòÒZΩ˚z!Í%óŒ&HNRıÓ'xbÎ#0úá…‹ï§œ\åàM£F{å◊hÖpSŒ|~Ê{ìÚ⁄[[ø≠bÃ˜üdØ D¬öà±≈ÄﬁﬁS¸Ç.¬wéxp°3[’jAnô;
›•∂iÌ˜ø˘’ø≤WçŒq˚¯≈~Äs*ñØıqÍ√l≠‹{˚≤÷ ›å” åÇr8Zò2bR
9-,Œb 3°‡úo;˝æ?'p¥	kÉπ„\ÇFø¡˛ÇˆCZÍˆ§*~´Ωœ~<uÊ£∑·l*k’jz6\´(˝äò]bO¨≈ÍºÓ¬çåß91à[VÅíªiÎìWÖB/Äu⁄ƒBõÇuBCÌ¢£ÉÊÂE∂?Ñ±ó6ÿûïüÉ’Y¯ﬁoM€∫òu≈„ˇ”èòPr]©H∫
]Ï^ôêq:Z*Sﬂ£Ï
ã|¨ºX∂≈Ç~±LN‘ñﬂƒüU—Ù¡‚e<ãR;·"âZ|Ú0˝vL¿f;Ø*Ø∑ﬁnΩ≠’ßﬂóÁNy˜ÒFm{k£æÛpc´∫Ω˛∆ÙfSrñ)9#7M n≠€>:;çÈ¯E˜·ì•›f„òı¿∂Z3§©[$eôÛÂ1#JîÒ˙Ï¯¸Ÿ|ˇ˚¨ºT ëEÛ÷¬πÆ˘®∂iÆOª¢Nã9¿◊>≤f,&`”¨sOÈ≤õãÖﬁÌ˜Ï±TVU•Vj©åÔà•–∑HC@Åï°7X•˙ŒQ™6/a<û!cíÑì∫óK†ªÎo¨rp)ëcÙ‰ÊÏà¡l∏öêë˚‚è»K‹¯Ó≥‹çzg˜ºò!„#sU√©÷l`ÃO[EÜÂ∫÷@Ü–£@0ËF(ˇ±[7InZab›æÑö_úAL)óØP>%àH…VÍ†Í}¨+;{ÒøÆ`VFñ%p>!Kw‰|ç‘»”33;”r¨¢ÊQH_?◊hæÔ›Î'7ﬁmRÄáTΩ	AÒáÂ5©A≠≠£¿X»jé5eN?O˘√ˇH¬do≠≤äaL6)¬,j›êãnst˜*æ◊<Y˘ï˙âTbÊr˜Y\h3$Q¡
ôü≥ô2è8'Éx∑Í°∂:√ò/ú},–X,eeÊW2O9˚ä¬^ÚiDaõ;Y"„W¬ª∑SiÀòÍú.p«˚Ù{‡_-»c.¨¡x
fx›BﬁØ:˘y≠!/A9sR	›±óMRŒœEÆÎ≤øÚÆüñµ; hw“…«ÜtcL+¶|C0Œìgı™
†s¯˙ÕÅ◊•Á$≥%W»%Ø*„A!¯ Có;/–q9 –£WÓyr‡∞å@XòÂ_°ãoÄOlÃ˘É*˘¡ÿ¿	áÁæÄ˘Né8—…—xp⁄ÿ|qp⁄¡¨ ‹ÃO∆¡áàa)"_ÁXÑ‰oq…À&“Ω	ú!o0ß}ÿ¥
n¢4?Ü,ƒø‘oiròµÏ î∑åY»(FB§ÃW¢˝`÷◊·h€•9gíåaE∏ø©ÁúÉΩãØ*iiöÿõ[ô 8mπfl“d¿;+[™ô®O!6‹Lˆ@ˆÌˇÒ)7Jg*ô¿‚«Ÿœ2´˘˘f¨#'/M+^§hÅÑÿŸWê?(^Õë?∞g£y÷.˛Aºˇ…ì'LÏÍ¢ûï–÷ìJ≤ú‘õ]s59©G_†∫ö«{.QS¯É9we6q3Â^ép“à·,ÿ ûùX«ÀaRfcQöd™Dr§C8ŒeÇwc˝¥ëG◊ºÏà\≈'~óû∫òW©:Ä6º=√“≈ÅˆrÁıjË`V˜Ë*Dá}j'zíúV‘^≥˘t‰;Ë‡v8°ob”¡¿ˆ^àq⁄/ÿ	LR¿
Œ	,˚ïñü(>ë∏ƒ¬E-Bü0nÑ„êïGﬁ{ó}Ìœ{ÛswÉıº˜=ˇ=gÊëv]Œ˛zé1{ê?◊ô˙‹s\Ë(4'/Ú>ˆ0ıƒu¢‹eÜ≈øîV(ŒÆÜ˛à˘CÆ@X∞_PÌVîÙÏF'v#°H]ŒT£}‰ﬁ.ÿÚØ=˝ˆ◊ø)ÆØ]é¸ÛDIÙ»π
’Óµ¯ˆo˛≈pI—!u∞c.˘90;?∏ÙA¥OÄ¬1˚ÙÉ9π∏Ëûä5ëU!kLAM¯‡*Î·sâ3ﬂf@yp=q∆ÿ√#
≥xñÎlÀ§À¿0¸ÍŸ!*P°„?wËºl[∞¬∑}®‰∂õ{`2V∂ìLóñQ∞OΩÆ+Wûˇdi8qãÅ‡ÜEwSÚy€—¨Ì‘7ˆv∑∆Ö∂ˆètM·w–*aUª∞+Y‘Hl.¨Îúnÿ¡˛¨ ’¸ë.-fºt∏Z…¬:c0úÚWˆÂäß∞z·ç`nÂ™ˆ3¬ àî¿Åá©æ‚,≠KÔ€ôÕùÚö∑"^›kú‡ü–ÜræCZZ†>¡Ev4ÖA∞‘ûjvFœ&ä'éØ‰{·]
Ø5;u&n^˚¿%˜V•…Á9Är5˘ï∏õÚÑ%ü¬:\A≈˚⁄”DÎ°Ús˜1\¢ˆ„ÿà£ -uÌÿ3ä05ÛA—Ω%îxëﬁ ¥aÙä{Xµˇ•Á™¬˘°∂ò5NtxƒÆö
Ø%À7˝ÕnéEG;ƒúˆÆpïx©ø˛M ~õPObÿ§ª‡û§«¢Œ‰∏3ò…nI˝$~…^⁄}≥¯T˛˘£-:J~P<ˇﬂdfèH⁄Ñ@¬ G'«ÌﬁIß}¸Ç£ëú6Œ∫≠É\@µGÂ¶œæWÉ2(‹µ¥¬]Á<ƒÄ§§qœ+›Ö#Á<<ÀÂÖZÑ≈G0>ñ„sç"*ˇú‰IÃ*z∏Ú’<uDÎ©‰4KàßpÿØ+¸µk•Å®Ë∂∂ºKÌsîòG@œÓ>0¢kI’›‘ n¯˙•;´“ÛÌúòWQ‹9éäô$–z˙(Âbqø?˜˝˘ô9e›˜b~ÓS>øX¨5òÍ˚—5!dÒåA±èÂ,1w~ø˛˘&ø…˙©«√á‡?—_Çv\LãßÃ≈‚∆
ÙüØ=ÌDµ ›|:é^∆¨Ús¨c4=‘:R]¥∂>øÌ‘˛£ªqb~R|¨cSWtZÜÙˇ4O'\DÄ4´êpu§h!RËM*W]ã•º≥»BHÊ’üäU±ì\#5%´(ﬁº†≤lG⁄,òO02dN ü?·2'õ ïWÙ+Wz@ChéÂW([ÚÓ$“†£<üå¢$‹ò‹Â“·∆ƒﬁù5VÈF∏T‚"˘$/d09¸o–≈≠uãzá∏uˆ„n©6NÖ7VöÛÑöHeÂ·>;;}—i¥ØåfG‰¿mú∂	YÎRÿG>Æ˝™¬ ªÒÁ¬∆Cæù XÑåwÁ‰Oú∑,…@%ƒ3hYÇ µ´˝r~Æ;GˆÜƒë3q.1:ﬁwÙ‘^O·Ó»I’ƒ Àı§œΩÏC'∆!⁄‚∂CvŸ—G‘ÉsR8Ä_∆+%¿R´ªÈ@îÁ$Tå|+T˙îÒñª¶œÆ)≥F$€7Kπù;i≠ëæ®ªæ@E‘ø òy±œ˘XFVmˆﬁ L‚(âd&g:’Äì⁄_/|)Jêﬂ=¡“–îÎ"*x(Â'JÀßD>√úgÙÂwÜg4¶Sâr»‚Úø*º`BôßE+™‰ÿî∂ÖÔ6
ËÕ;ûÃñÑêÊG961Zü¶˝ 9GÕuôúlûÂ≥êK¸TDz+ ò˚È}÷^+_eEd”Î∂p3¥â…GYi†~Ñ:][£∑|bgì¸A*?Ù/}ˆCˆïPë´>√“N◊≠ÅÛ%=©Éá‰™≤:Ì^ ¢L¿N…“€ úTI$m 4gLÎÌ‰5VπKc"+ºÑkOi¶∏–Ωÿ
<[}ëÃûE( ¸åZ1@gÍâSi9Lª,u{Îd¡aﬁUÜ˝ ΩGy/AÌ∞:ñ»≥Çmà$S^Fò›#OÊJHwõ	o0ì+û∞úe9ç¸w√·§#>ºg‰>37?X9‹f∆UÀ˝æ\õâVÊÇ‘Rùíß“;ù‰§J´w“ö%-ˇ±∑¸'◊s´v‘nÁ∏u£ª‚‘Y◊Æ¬óõ%∞Ëçoo¸sÁb®î¶∆[b˝'q  8ê‘±/ÿ|¯y):ìå5§Gj¨_∞%ú¢ÚY‚·”·‘Õ…ñÜí‡µ)•Œ|cÜ¸ÍiÚì˙l^ÂU&∑.m€ç/¢äÚü¥Bö“F£ à4Ìê‡˜”˙ı¢9„È PŸûÕ{Ãàfù!Ω≈∏â?•EjLF(x; xÌAºæ;'ÍòòπO
d0*Òz‚¢–Ìu—∑∫‚{´Äî5‹››\ê∞®V›ºª¢‡Â0¬$’¬Hh≤L::ª·ÏfBqAúªíÇ\/	rI:˝Èáìˇ‘JõÀ’#cŸ1 £˙.˝öãKòßIX∞©ÖıKÎÂπ+òŒˇ°UÀ*≤ŸÇ),Æ=âÁõÏ‘AÙâ‹Ò≈$◊q/7J·˘îyÏ`›ÇõÿhÌ¶kåz}‚ÀXPÙg¿ÛUe§Ç◊Ã%Ÿû12ß"oÿ°æúŒé?˛2¨ Ø7åŒ%)sXOGŒı%1Á≥©"]ËN…`)∑?∫—§„õW5™\Û,5ì≤ØpùwßN1T˝&Ï:Lhc6>h^Ú|ƒ¡;±	©®sâ&eMÈuœpÁyK•°]πçÒöÕ∞¥@Ü*#˚Î¶|⁄È‘˝æ3ùÕ7â„—5D·ßn_ºÔ}"≈_∆™å¯≠á≈Ì„:≈°Á‘1^èÄX&ò¬âejP]1xae*]»Âé^»ësr87⁄a{:sı
kw¢ﬁˆ∞±8";C–≥0–œh˘úº*æï4+bà~≥Íû¥Æíqz,Vé…D–¥S-m÷8ÅÒ 
¨õΩïúh§˙‚å4Ã;◊⁄–¡PäÇ†BÑÁ¬Æn’ﬁK˘ŸVıÒc%ä Q	†ú˝á5QõŒükªP5öW&ﬁNΩâ°⁄6ÓÔ¡+∏û`+h1I´zﬁ:ÏÇzN%±.˝»µQ-∫¬|“€^πﬁƒ“˘(Tf¿—√§ndl{,‡öèÖ∑6›ƒ1ùtÛ–6ÈF8A5ZUzb*£”sYYY(ï˙9ËH ∫öº€7l?èŸøBÁˇ±í_¿îØúÎïJÆ Cb%Ø˙ßŒ•à¯®}*EvÉúÒÙG™M*ûVëß;≠=mp4∞òò~-ã7"0æÑËQPÔDòè®;a/[!0É#CRÓÂqáCô»çôﬂ¢IN¨…Z«s??Áµ+IŒ∞ˆv◊sº›ü(K£◊9ÎˆZ¨ı≠£SD'Ì≤÷qñ¯ wˆ≈≥4^z0'L‰ÔÛ"B?¿Ù≤ZäŒÌÜØºpÓåºoùß’‘.YÊv‰ô““|T≠Y,éŒ˚Ta¡M¯ú„uRü©;weÓb"P„Í∆+.˜·˙ûå´Óƒ=?2*‡"ØÔar Oû⁄`Wíµ†ã‰åˆ	Çœ6ÿ|RA=-xÛb˜£€üìû0î”⁄∑∑9¨ÚÅpü∞êhÊñÿ2f ∂i“˜à™ 0ía€YfÅ_pF°Œ∑Õxc
	iÌi≠ 8,yÑOTœ6ŸOŒ⁄MÑ>ˇÀì„ñ!ÈR„[$Ù∏∆yËèÊ≥ƒÒ˚ˆo˛Öùíè§àVz‹%ßŸ∏÷©\Á¢)∫ÿN/wΩ Oö∞¨ß/øÓ∂ÈóVß}‘Íµ:›;Æ2èÒ7◊ú¥ÏV/aw˚Cﬂ≠˜ñ< zZ8ﬂâd≈ÇkûÜ®‡Kæ]eMêj'GÏy„®}¯µP`ßßÏ’ÀvØuÿÓˆÓz¿πK∏ıëÇ¢ì¶|6!béXÒÅ;Y_j•ı†Z“¡(‚:œxEõÜ¶Ÿ’”ÂZ©∞§‰ÎIõ%±…\£’z8b∏‡”._"≈¡÷øK)G	F«"˛•Ú Ïãw
¿ÜCÚùqºoQùSôë|<¶êE¸ôˇD;•∆ßUıèT∆*T˙˛	¶oıﬂ˛˝wØ=wÔ¯Mﬁﬁ¡={‡#úªB&%
ãc´"&ü0zÄˆñâ€ËßˆÕ?ô8û≈ï1/fãı‹ÒSçy%v¯"ççB≤2–âÍÉæÅ÷Q51@K„U˚;Ñ˝@=—Ö*-ïA!¶°u•ÿúÒ’oS∞LñÙ”+Ôí~!O_áÑÑπüù#úyâB¬W∂ª@ÅÕ∑&Ü•Èkâ •À∑/ﬁ2ƒîs§í"·^b¥˘ªÏ÷ä∑!iÊRÃsÇn>ü–»ù—}->≠†7a/ØœÅ^6£"º±? í– SüàÊ¸öPÇ>»àgDDÁ.Íı]5Qp#’˝Tä–G†Ù•wBÂ#,
e¶∂lì\¢ç2íW$ÿÿ∞:å.Î–bÂ1Mﬁ©éJr‹Mπ1\E:‡nMòÃd:ç≈¿ÍtÎ·µ°˛ TVÅ∫F\ﬂ™-?‡‡∞p=ñ(w`FCÊmG.æºî]≤∫F=ÊöSÊÅÄîó‹$ˆ¥ñéÆ§¸§Á›∏”ú√àõIT]˚ÛŸ¸‹•Z¬ﬂˇÊóˇÂP,^6Ûﬁœ¸˜‚™ø˚üä´<	s&˜; ¥Ä_˛á11rEπÒEÚŸ%Úu)ê÷néâg≥⁄£¨p˘6èzä nY9Ω1’ôÜ‹£	‹£º~´µV‚ı≥KW_pÁSo.8∏˜m–9Z#xŒøê˚Î*ê•ù1_y2˛l;rßÏ≤(O4S˚ós
Cc15ëN™X]˝RS≈®+wF|˚´ˇ∂à·8ŸdK~ä˝lƒÇ(jÁÇˇJ‡!?pÄúÿ‡@Ç¥Lh›ã€Óƒ~K{(≈C‚!mw¥ø“@ﬁE∆ù≥Øw€øé˚¡Ø≤Ÿ˘OÅÆÜØ’¡Kttx!6£ëç†0ìÙ∞◊êwÅ
Ç6ãıÜ®±äêÒù2ßÔÁ?g	ﬁ8ª^∏b›îŒnJ◊J¢d(∫Ó≥mÚq/˙‡‚¬⁄
«¸∏hŒiSv£ŸãR˝í§ù:Ÿ–P¬∑≥õÒÌPá4IVÅ%ËQ¡3Õi•Lt˛˝øâeN¨AóD8ñ•≠«˚[[%Ï €ö–ë-’—wÊ•±“-å¨ÎFO#+Ÿ¶È<òé‹¸}J|'7J|ÙivÍ˜ø˘«ˇ7⁄™
àπxRån2(_†D∏@âDJaÕ»>nÌ¡˙§Ó—ˆ=w¿"Xπ„√3fÊ‹ﬂm‰]56Â„u©¥K‰é‰ZÿòpÏ^-X⁄ã;∂2¥≥mR∂rÇ⁄`Ò∂ÀÖ,uuz®6FÒÊ˘lËﬁ7.Õ^ÿËò ¡ÌÛ;òÁ)¨Æm}Œ‰}ÇqEz,‰zxÓd0∫f¯0ó7ôŒ’`\\ƒ∑´U!–,˙Ó^ÔO÷(fˆ®¡ÿ)Ö¨I–F‡Æâ{%tF≤póT6èS˜Æ≥Kë°ƒÏí)À¢v©Ú∏ıƒOu†"Äûá;¬ª-Ï∏|¯≤ª.Ôˇ#›yçbü@NüµßËÒëàı"ΩtS≤µ¬∞j‹GÑ˝ªˇ)–ÔŸ©Œ‡ëg°LàÉ|f‰Q¢±˛.“ãéÂ&U‘çä?óß©—Cˇè]¿JFYlúù≥≥≥ˆ¡Ω¬ø}*™ìíjSŒÁıÈô˘è/97˚1`Â§π-K’tÛ)IeÊK·€≠U¢≈^∞ÚÉ¥ ÆŒowÅ¶˝ ≥ü‚´uÅi§ÍIÀÅí‡^R0üh:{É}V]øRb?§ø’âU^ﬂPﬁÄ,iü•¨æZ˙gìwHâ°æ+vÙ&Ô£Pﬂ$
0ÔV3†\3}üQWa˝]dÿÓK≥V-òπ˚“»5M3«5ég¡8É∑ÅYW©)K;T'E·.åª?ãC§n⁄º®ñJvs&£ºZ—ASçó„7ŒÚ5ê\l–P%’$Â7≤JB‘s#*rÜõœä~»b£( ∫í:D.á*áúÈ íAJp arÓ\÷ﬁ¥√{èÏÕU§&ˇëîl d∂x’y:JUf_9#oÄÖõrVU¿YÀ+A»ù•,Mrÿœ-Ø∑d<áyÊÀÚ^(Èärd2â;πDdTı Ñ{L¶7ÕÖÛ/Â…±œﬁårìd÷&ö¸<õì}“;\WV⁄ûô‹}ê~Öµìz±Œ8J}\'xØ+£ê“tîèπ2ø/ Ø◊^c∑„ˆÒã7ëÇ•¨*4sr?K›˘Ï~vÍı'p"Î[ıá%Ãb˘1˜¸qM€ê´ô∫&∂	cÎÅàM¨lZ≈DÖÃ⁄ÎFõ5zÕóo8Ã◊òúYâãhÒŒ|ƒ∫≥9·ˇì’fÏÒ„jÌ{®\†8Ìª˙Y›n0†éuP‰˝MØ˘≤’¸Ú˚È‹Æ©≤ò%EdƒÄ18ÿSÓaœëì>`•‘~ï0AÏ*·;ƒ¨/\„Ñ˜V8·M4u±∞ª∆Q|‘˝ÿwπ¸Í'¬ZÓGú|¯.5âwöGsùUÏ¨–[ì)5‰®.;qBçìH‡πÈ”¨
WªÔZ◊ŒZ€ÛÉ¡>’rL._øÅAæé∂∑≈˘#n0∑¢≈!åãZÅ·∆eÜ∫øˆF7Xm¶¡¬\ÚCQ¶“ﬁærc ‚Pøﬂü’ÿœÄõÄRÀ {¯ˇ”£uSÃò÷M>s”ü¿3Ù≥ï˜Ω¶l£ó∏»Ã∆ô÷´·t‰Å:πøb˙’Ò⁄Cêxì;‰ø'±Zˆ-ÜØ£ÉUùŒ√a˘c‡ΩˆQã5OéªΩN£}‹ÉÛ≈∑≤*:‡¢Í)x?ª7U÷#ÛùΩ“ÒØˆŸg7π´à!∫≈Ø`‚∑’w∆ô··KÔÔÁåo.[˙õßóŸ|Û~xB8£ey’>>8y≈æjü6∞Êg_Æ?¨ò¥<üÖ®vP≥ Æ’¿π¶æ·»ü=0œÏñπ†1.=ÿ_ˇmj§]f˜yªuç‘„}ΩIbàCX¶–b’ıq2Àëg∆Ω¶8ußØ é}ô4>bó â¿`FQ¶˘öa‘∑z ø,”d4ò&∆iö˚Æxú(€ˆLæ|1˙âß9ıà◊[û≠"ÎˆAÎ∏◊Ó}Õæju⁄œ€M:ø	‚&ã‹∂\Og˛e‡Lá.eÍxx¥π'ñÚè'óº•)wr¬<5èï3ü"Üa{¨[ívÍÓ$V7"¡6Ï†¥<Iï4;_üˆN^tß/€M÷}Ÿ¯≤ı≤qt"≤:B∑è1Ëc>wÿ€X·%ñÃ˘‚P ÂÂƒ!Ñ,n‹Ãæu›çÚ9õ ›fˆºqvÿ€≈ç6RÃ8¡¿#Ùs¥î∞à€ø`∫hmx’˝Ò≈qçπB˜Ω7•'|‰§®/«]ôÇ•ÇøDÉ◊i√∫ÖMπV_°™<Ç• .„åærÉñs<akk&ï4Øh…D\ŸóºÜç:h7{0õ≠√÷¡ˆÌ˝–œIÛÀ÷{ˆ5;Å+:∞Ø@bÏg“Nó/›î≈Dy5D≤ŸU5TB`sfìü—Ÿ}†ù¢8àÒLıu@+ò˘ÔÛœˇòú˙Y∑’aG'8˜Dï’}$',@#‹»9U€T£≤E\†zŒ€.€Õ›∆Œ¯TF?§‰√Ï∏N”4ù—¬Ü” ¨ìÂmâOiM|*{‚æÙnñ9Ô≤Zµ¥ 	·†?Döëä6:CÁAH–‹@›CanÃ|ÖΩZâyÊ¶d3”˜qKNÛ˚ﬂg+R<ø;™ßZ{{∞îˆ∂p0∫ZYÈZyj◊GÒ∏\\`˜˛w⁄¬ﬁHÃ…ºiÛ.í6Bºê∞˘-™~	y”=jtz	s
ıÙƒ[oA…Ì”ÅC	¶¬Pùä+8%8àòH˙¢B)zL´i©*j„‰i†∞ü6∫]¥ceÜÑ∆≈ëX>LË|‰ˇJ∫©fåèØ5ñ,p«mà¶œQ•?rùÄ<dQ◊Z˜
+'¡<˙ôÕëé∆Óÿ<7‘À[˝Ò–}g©t&KØtjCÍ’{pÎ\/U|_ß1ır3\„Z!¸¡Du”É®2≠√P·a8òö‚$ºØT¥ÉÑ2à˙JŒ†$º/xïPÚDò‰+–ó÷L`|⁄A•SNsq¬oÇ∏`¬X“5ÿ¶¡€æ3˛ìâ%ÌUw≈ívøã±$!˚≥8åî‹*
#M‡€D(…8Õ⁄÷bû9‚ıWˇ Z«œO:M?«˛§íà.^S+∞>πó UgŒ{‘—	⁄:ò\ lq*∂Ù–¯¨7é1ö™_åªÛÚ⁄ﬁîó«˘ã˝`“ÈvﬂiNﬁG:…Œ±1ò≥§XyﬁwJ¨"'{^´#wr9Çaµ•Æ“÷eÎıUUu˘†mYÃ>sÌ]Œ¢ dﬁÛµ)åÇ¡«$>¡<†ÍM˙£˘¿À%ÆÇAÒ≈bGÉ¯HaÅ{˙>A‚â∞ﬁ‚.	—ºK⁄84]#^M*±™VyìY?˜√Ãßò¨u÷9$ò`D¿¢Ç†Wﬁ ù©cÌÚ≥¶@—À∆éÈl˚,/Â’Án[˜“Ââ€"Ë…!^q]A¯G˘˘öÓÏày¨‰É´q”Á{{É'k!˘WÊ¡®B◊V`«ﬂ®πóKŒf”psÛÍÍ™*J™}ºyÖ¢ÓãOêÖ*ÁéS„Å≥`T8o\ﬁ∏¢úqÛ1∆úÒQÂ1X…¢=úm⁄∏¯(ìöË<®±∫iªhõÆ√:çœm‘4r/fXëÁÛ|µe”÷-HO,/–ÌUe'èﬁÈ¶Uí ßΩ.Î}}¡íæ\)¶†®£øﬁLGô#m™rJûÍÿπû8⁄EÀúVp∫?<ÿ≈40˚Ú&c5è]IS¡«Ë´ò
>Ï =Î¡¬~ƒá˝‚ÿ+˜≥ÚwÇ* ∫˛â∫ä•Çµ¿SYÛÖ´∆„ÄD#¸Ö$xB–**Á≥	“L˛Yy-ãE´U:n˜¶'L∂?7÷ØÃﬁ[óØ§
RRî≠æV1æ¶•æ2vta‰¿I∂™{{0≤#g6¨bóèu=?ÄèkÍáÑ¢EYI∫]≈&p˝x
óˇd´xÏ_-S"W<aâÛ˝†ÿ:~f* âÄ;‘sp—
HQ÷±≠.Îê<t¡î’ö∞
Xr†)÷ïÌÜ@«Ãeß°-_é¸sg54úr!†•6sì7A ﬂK¢ÁëÙıÆ»Ó¢‹áõº,úüprPéOÿkù©ò`∫€ß˚í‘¨Û¥Í˜{ıG◊€è˜%v´¶“Ã0\ˆ¸cz˛èé·øΩÚÉ—`ìú[õè∑Í{€èvÍèãº.FòÀæ1˙Ü^:›l˙{è∑9ÉΩz}≥§	ëh¢è|Ì˚C‘û§6·5q¡ãëÔÂ,CL^'ú+Î∆∑,'1äÀå§‘‡3ã1¸úµE›Ω¥‰‚∂πNx‰äè«µ\Ò±µß{N	RLÜh§»ùÂ∫∂îŒ—"“#AYl«´oóùu~™ÑÜeß±D’†dø˚˛‘È{≥kWˆÚfëek í5»º+l≤’Ωr] ˙C]ZtŸr›Å¶…ñ
ﬂVá3¨õã÷Ï÷é]ñ¡Ω ÈJ3†Èx>2P·ZÕ≈ÕU¯îU»ªµ,
j>4~÷ªlŸ˚#kø&¡ÖËõ! ÈX˚UeHxÁjüŸÿ'Lj|áçkH™}+…_ó.ËT[ <gÙ‰ÊÜ]yÉŸK∑øWRáXò|pÚé⁄ñ·ûò¬Ò∂¡ú∑π‹guıMKÄÕò0Û“Í.≈ﬁ¡í“Î¶⁄ fÌcv⁄9y—iuª‘}£q‹8¸˙/ÒõØZÕﬁIáıZGßáç^ã[[]ˆ™›{…Z/ZÏ†’mv⁄ßpUWeN´|] 5µ'ù˜w2}¸àÇ}!e¶†⁄â˛íêQ2´ŸπÆ´d∂≈ÕÕsòÂCeëY—q√˘h&A¨˚E≤ïïodPS*Kjƒ[Âå5≤âGcÑhˆ^ä£B≥˜j‹ÍmÏQ	-Rô‹jj©˜“u…Ì…ÖØÅ—,‹Òe9xlkDk}Î\P3ÊÙ¬E9à”◊(Ò¶Ò%(g3†¥éYÂ‚<€PFrAnYàEπVPüé©o∏têAGø5]Ã]¿O÷ﬁûèú…˚5”ÂÅ;z≤6Ò1ø¶4’˛¬70ﬁò]EÆûf·ïc»e§• údˇ≤èy6éÃ˝˘ºª˘Î˙˝é˜≈@<Ü⁄¡QQ≈RÍ∑e”π;ÙÆÚÎÃAºy'⁄‚dÛZívë‘ÃK”7ò!°%À£$}Œ˚}7u]~e'a,Å‹Ö zn˝É˜≥„ä≥_lF5πzòı´Â‡©§Ù”∞J∞mÚÒqõñúÊEõT’`àˇ‹òˆg€q«@B∂I!Å;(ioëdOÂ4/zÃÌ@ÊÀëÓ°AG54Ó“BK£ <B"nxßéÁM≤g˛GQû#˙Qå˙&5ﬁc'kpÿ$≥¿.™Zxc◊^G"6cb'%n°2∞/p{¿Æ®Ô§√sâ…de‰.ø„FŒPôaR»NœEqãEyRˇ˝| Ü†Í∞¶ÕùÙÕª(|Öª8ƒˇ•üòQ=€g]⁄4îi§eÅ¯c$5√˝úÛ,0:ñ”èY∏π≈Sµ¥\`LQæ@6A£yà¢%ÕmÜVZ‡v{[i‰Ô]=?EhG6†–aì!¢∆N^Ÿè/˛—¥<h;QoæÔ⁄…⁄°¶:KÏ—ﬂ£"/±E∆m8§T‰<ÿ5¿∏zN¥ò\R„ô&Q◊bÖ0Vxá<Çø˚~,(5M)´d¥ ÛäZ(°∆ArI…~È÷°†mî›¥ÙB~!êµhw¿sg¢t0»àá ÃØÃ®~
∏B§¡GH8S{^%]œÓdêï4”s`xÖâ∂ß¬˘∆s≤ˆÙHdMS"≈>ª)œ0XïäX∞`Æ¯zuÊ?˜>∫Érm˝ˆ{ü¢èMÈ˚a=¥0µT•”EˆΩµÙÿw™7Ë{®%Ó≥ÔûëG·¬öÓ∏=w√ôp.E+≥Lœåå∫∏√±˚ò1w2π3/	—ß8≤˛mìâÌiãrÍ8€€aÅw9ƒádÎ•BAﬂ`0¶Ã«ŸùπSV€g\Ω_bÄÈììR
ìé⁄o*5sc≤<?˝E?v≤&mZwb&rô‚[…‹öç◊ƒurì≈±kc-b>ñΩ∆ämikIf∞>àkCæcª{ÛNπΩπ˚iøÅfIè?Ì˘Á?øõÛC˛§ıÖË§Fá“Ó)\£ài<ÕÕœ@≠¢æ‰âNyò‹~ó÷VSèaª∞À¨eLR˜Bª€˚ÅŸqAÍ#à«–mÍÁ;EôK˙"”√à,å»*`ã≈#∫;Øÿ˛ÉÚä? 7∏˚f*25Ôïù>Æì7πºv¥≥œæ"(Ñ>á€˛nî˙˘Nq£ª”˛Œü+Ì/EzÕë´ÌØˇ∂Â›È3ı"Â˛tÓÅ—9p√~‡M#àÜpÃƒ0&®2)€6°7y¸≥\U&pbJÿ⁄3œªàZ∆ﬂ¨y¨Å"`N^Ï{"œÑ€3Cª‘ªìd—˚µ;´* £ï£Hh§8éñxÃÿGòiMüÄk®Ù˛‘	fÎF›ÃY¿ÑVÄ8»¨]À‘∑ º¢›¢S«ÿÂ<àì∞¿ü¸U¡8d£CoèGF@vÀÃ«ƒ_å≠Qˆ5©ûM?<∞W©Î_dåˆ	wœ/ã&ªå‘È,Í·Zô-÷õKˆ{°ã’õ{`rÉ¿πòU8ÏU/|&ÖﬁÈV–∂˜Òbﬂ„.÷‹¡!ΩQFgÀ≥˜⁄∂í
≤M≈≥iƒªÍ
æLi~
GAv8*‘ÍX«0pÖŸ!ë>üµÊÏi1lGÀ|¥-Ñ-öZ”âpËWxMß’i(“{ÒD,¶£SlLlÛ\Ò©ÏûL3¶ÒÄÑº¡du¸b#ëJü‡Å∑ ©C∫°_i:.øåŒT:ü#s∞í_nÁ‰Ñ‰∑)Yˆ¨ô“z§1/éú\^-?4uÿ÷¨°A≠‰HrŸıÂë\|ÀÃï€}⁄√ÿ‰≤úQÊúF2ºÆÔÎ,Z ºÄ“àƒq˘ó˜-Û«È¬Å0X8Q‰â“≥&£¡-¢µD}„æ÷µªK:/{a»˝Kß˙^ùaØDvπ;¥ãDlLäiÍäÑ¡˝#êõÃÛyÉª≥N7ƒÍ‚ÿn¬\uGY;b*ºH‘Kà•}∂≈nπ∞âZâËÍöÚj˜£7≥|pRm≈r2JŒC‚è‡w¯w¯”
•›ÑcˆM≈&h5≠Ïÿ◊\YT™$ñ,Ï;#^∞∑ª¡p-v’ âµ∑’Ëû-ı-rãº&7ﬂ{¢Nπ¯Ev0¸!ÒC‡ÔaÂıﬁÓá·õ8-Ó∫‚Ã±uX'î;%IÊY*Ÿê:ﬂR76$j}√ù∆''S¨¡3¨ïÈË1JÃSNŒ"p»Q$º|æ9‹Y"Ò_õøˆÙ≈¡iá5:ΩvÛ∞≈jèDq»ŸóÏ‡¥¡Í[µ=ˆÏÎnØq|–Í∞Ê…—Èa–MéSVgß∫Ï(k#l'®êÃâSPrÜÔŒbùM¢Ï)Sw2M(®à,'}æ˝ıˇÕö#?tÔ*{,… ö≈n⁄ππÖ⁄MÕ‰Ûv,âA#äñk‰N^s3ê±Fô*Q∂∆B≤k8t`˜*¬í»›M%blâå-‡#ıù(Ÿ÷õºKü'7¬Ñf¥€†,¯≤Í
ı$Eí¨Èú¶|oâfIõ”òÇ¥¥/√ä˘dÂ\˛"æ™·&ú£f£ıÂù<ﬁn∂áÏ†ut…ûü eût⁄«çbC∑OéZΩNª…Nû=?ÎÚ∂ö„•q+-œã,\ñ%ıNˆµ£2<^jâíërév*N6˝Òt‰9†¯∞ì©‡¨!;π∏@f[V®>QÖPuÊü·67aõÀÎXgv ˝a±{ˆÏ'≠foôïîZvTÛOCÀpÊ◊Lfx!í6Å‡∆ŒYvr~1E|änf\∫ …Fn,]§hπ€Í•FéﬁG-’¥ô3fWÅ7„]çp¸cÍ|‰~™ıÄj«◊‹ ¶ig	≈,>gÅ?π|öùMπÉW·”Ñﬂk%˘•T*ÔÎ
∞ıùGÿyªúÅ~åÚKÃ¿#VÑ'4BeoÙg\ˆña©‚áV5©ho*◊J∑4=<õüc5Ë	¨Â…|∆≥1aˆËÍóP∆∞FÛâ'Ä" $¢∏¡E[yçx7Wo6D4Xgéå¬ícAè	…mË¬.Ãô ÿAÆ|@uZí∆í˚sS£%LË£∂Å‡ãædW0DÏf?„–ªÈ/ „pÏÕp‡”·uà›Æ¢Óÿ*8„j™d*1dâ|Æ≠Á†Ør38Æ∫OPÛ#ChˆVû3êÿèèaAÜVà[»¿µh 2¶≈∞Ñœ¯∫¯…‚  Êâ$0∑Ìü˜?©/ùph1VoP`®"òr #Vâ«'„X“vG∫˘Ã\	ﬁë#Í‡¿'|n2∫*uÅm¬Õ%xS?p±ót)î∏◊êﬁí(5[¿'Pó1†µ˘Ãa∑qºSÆ@ÇôƒYÔ∞√∆~ﬂ≈KOp8¨∂hD«£d∫(‹BºBD–0¯∆—‰yTöÇn8ıy…IC.MÒ©sü‰B≤Œ©œŒ~Óx#åo‚¥ßSò.é~¸i‡°ı"îª⁄¢^é‘'P€[ïÅs-;‚\y`FTﬂ+ƒ!ﬁòãf=º2πG	ÑEÓ¡ò_	*zƒ‡WOÅ‘ç⁄Õìå|„ë·>l∆åØ}ﬂ˚‡ç(≥OπÜ=ÄU[ü≈’çÌd~hû±o.öä=˝Ä`ìÖï<ÖøﬁÜÙó!˚§¢|ˆì9lqmÉeﬂ…d.f‰%¢≤´
ªZ˜ë¿üâÛ¡ªDRÌèºÈπÔÉ*™^n∂©¸nA)Lπ‹1û-Ó˛ÿˇ´I$‘ÿgÖŸ_MP©oC	ÙWí(©=ˇ´	g·˚I›Ùè{:Ω¿ôE 
r"cHg‰≥ÚZ”üzQëR!WY8è†p ÿh˘Ëªj`d4±¬≈@°∂ÒJÑXï€G/<,»µtyu˘,ÌY‚<Ø∆Ω¥TÑ˚]Vt-Åe·b∑£˚	oƒŒÏ|‘›˜9‡;⁄ËÑÍiÎ©é\TìÂú≥ùÍÓ>ÿ´ ∞x"˚
°Ú*Ñ'
L÷f>`GÛÖ¨~9>ÇÇ√Œ|‡˘o)ñNzÛïëeP#ßRÎ·£∆	µ'0è¡úÎñOS¿_ï£œ3®Ìj¢í–tn‰Y.Ú|‚#ÏAñ*>¬¨“ÃÛ“êS˘»W“UA€Œƒ∂ìÇ6˝dÇÏ÷.óõÜ'a≥cár÷öpÍÁåÔ’§«¥?∞a·8[a‰ùh≥ÉÑ≈Ï∞4Ö∏É∂1Û}'§^æ®ó£íà≠}©„7)o_∞P>Õí—∆ ıÅ u1D`:x,°DJW•ÒPÒ—HÚ@Î.èº˜∞ÑSïâ÷ ›ÿ
A∏ÅxÏì—”:)Ü“ƒ ÖÛ:£ﬂ·¯«∏§» W¬ÖámW@ûê
∑z™¿¬ãÄsõ∏Ó@∏o.ô.®—¢AH)ÉﬁtQ”Ã5®rÀ∫Vùå]oQıU‡Lu8⁄π¡òÖ‘ÿÿW˘ÌØ)|ì“m¬zôhdÀFŒU®A7£/æ˝õ1\RtHúvNiW§cËTXq@`pL?˝ò"Ø[N«Ñ\ê‹ß;SBï-Wo¬±&ÏôìáV`®X≠#ÓQ∂Ä5Ómπæ+êƒG˘8JÂÒÎ[˜-˜•”E88†‹°àØ>g—]>OC!%î#1ï`û{;uL!
î/QqÌ?∆•Öﬂ˝ÄrùÖe±í•çñ≤´ªÉ	O¢A|„¥˝g±∆àw ÙÉï¨n_*ªºπzÛ	‰(«J¶Uïgqèêô∂v3ı%	’(Yo]B7F3ÃUÃˇ‰7,ºi»ıæs]ë®˝.ß0”ÓgüU[â*Î‡Æ˚®y]lékÖi1/Pêñw56∫\ÙZ¥fç{1æ3öè…œ:‹dÓ√"\2XgQqE◊ùÕßπ%	ŸÒ¿Î#0ç›ËlÂ@Ä|∆oÂbåø˚ã}·Æ

k≈fñ≤o“ ÄEUò [⁄L[ZÖÃŒ_]£TÅ^ößñÃlÀ9Ò«"0/˙às-m#ÓîÊÊè`jx=Ω]ÎÉ58ï®ªÜy9r)q≠Bî_!+kTL}ŸL9∫ã´vàSß≈ïòÈQÆÓ¸≈™Gfã$èl≈
¥!ê–UÂ1á†˚øØl±˛<˝†"“ho24í@J@su˙†MGË\2qÅÕVºIÌªúñj⁄ÚEoq2•‹•l5¶ÍQÒù·¥Z˘oﬁÂ‰…Á¥ÉNtv–ÇÎÀb≠pJ©S£KÜ5m∞3…^ ™•5îÅ*VíûLK˜±≤√˚d&>—VgÍ““’Ô¥éH]‰&oöJée`íV”»îO3m8∏m◊¬'ıúú&ì˛µ∂≠]ﬁÿ3rx;r¡%ìsQIK§,™–4˜vıŸ7Â◊%˛˚—uiîRl&ÉøÆ3¬0kÈˆ-°&*Îº¨'ßihK≥(≠a¢[¨|¨©
ûWá%XqtgÂ≥ƒSu9E*sÚXu|.£mO¨åÈ›ãı›ôÑ√D]}\Éy$F,∑|ú¨é±)wGMJj4r„≤–Xî˜õSdS1æP/ûLÈçSV”ÔH'”;L«¬àAfyLÕ-uÎ`~ø9vú˚Ã¸># v’X*L∫\‰ô`]nªÙπ÷wPu∂QxóPwI…é·óÕhïb∫AÔ,Æıv›>&íúÄ‘A^ \V‘yI€EËÙ}4˙ò≈gPu‚µH˜
˛√ﬂvb`\8”©!ÉÄ∑‡Ú¬Óı§èSx¬B˛-jc:mÛFxR’®√‚º5§æñ3Í3¡ñä«°ﬂ"%AÌöMDöÑ±—D˛“ﬁ•ÑÌÕ]$ƒìîûëµß|…`≥,z;ƒ„2_ïÛVç¡)•∆õ[‡ê&pãıêä;ô8b)&≥}Â!eâ–kù©'>∏•¶6Õ°€è9@Ù-<~&>±_.{°ô¶,ºÚ∞ÃôDÇkÿ¿	Y)gB·äÏ`‘ª`HÉ†2£≤UL›ZP∏¯€%ª(Û∑µ,+£—çÆ*{ﬂi≥X˛‡º]Í3Xﬁ,ñ?ÊM≥d'/h6o”ûPGÙ?ÄÈ,2´ù4îah≈åg˘cC)önt¸«Fπ¥c$7…9`Ëôãqv4K”@dë±öõUª«√Ÿ|˘«’]‚¯V2gµ“ïûö+4í’7†±’xyYtÛ.ñ|±±W‡<&}©™ZÄ“Ûü@/Î{˜ﬁ?t&†ø˜6ç“ÔœO˙)0˛ò¿]3ˆ;ˇ±@ÄÁ?7Ò4Õ§™é÷,^gˇ∂òî'#e©‘e)èsÚób]»ä,h1¢}>Ù/ÕKb(´Y™B˘àFp˝£®íÈÇÕõ◊dUﬁ@îtóórˆL*u±ΩÊnë∂µ‚“‰«Q~p¢™<€é.
DªÊ∂5Ûj[∆ÿÇTw¥Mˇhz¬f.Ttª≠fΩH∑€Ùè1OªzI6ª∫ÔmfPVo—ıƒMˇ¨…f∂)WCt(mh¬‚ƒ⁄i'VQ˚6√˝Íﬁ—äß*üßwüΩB=îZÑvΩÒ\îÊtaM±/ŒüÉœ,áp¢◊ƒ;∫`3Ω«DPEkÈ‚©¡¸áSYº%Q•∏†´˚+g‰∞åEÈX]±OØı¡Õ±¥‰*∞‡4®©”4.Ê£;8ÙÚPEk9mZ2*Årõ$≥¿Üb2˛æ…≥éπÈÜ	õ!?ÛÿhÚärwer´;πƒ,eW,@Ø ê˛sG!+ª’À*œ¶ö9Ï™w·åΩ—µ|„:s.lD*∞CŸ¿Ω@¸¥˝<√"¬ÑbVg>WUó§ÈÒîı.5õ‹§‚º†¬Áuâ:ÎÅí
$cí◊—»ørgîå^ûsW[ä$É]¸z–√ÚÎµ◊≤˜ÛôCNÂ†Rd∫≥“+ä,≤Á|Oõ^Äb≠)´’KÏ¸ö˝ò/ €#x,à≈µ7⁄°ËGâΩi¿º/€¥ÂLJ&ZºÜq‡ÔlÌu£Õ;VøúÖ'≥G.xÈîÉ$QmVääÎù{ºW}Ù=˜>2MÒvÉë¬%ü|ÆÕó≠ÊóoÿOÁnpMËª|œbŒú”AO1‹√û£(z¿J©,!~oíŒ—'âc1ÈΩOö«ƒF¥	€é9¸‡¬‡™ﬁdP.;q“ûSÂ(<≤o”s3îz¨úx€∫axrÄ¯Ëûﬂˆ±Nñ˝ıËÎh7Ñ ¡˝Ëé±zµı±ÔNETNÚ=ZÁÃp˜◊ﬁËlhÒ∑0£*f4q–„Yã;çÃÛî3ïíbπ˝Vﬂ2çOﬁ˘ö‡º^‚¬,®ã_a˙liÎÒ˛÷ViΩbﬁcπ¥_‚È
«sÃ„5l^‚]Ódêˇ¶÷d@Ô©=∫€{åDG¢:ùá√Ú;∆*@®ΩˆQã5OéªΩN£}‹Éì¡7†*’N 7N‡‘£k÷∆… {¯ˇ”£ı*ÎQ#jˆäÍÀ±à6w-oY%Á+ò¸≠±–§w˙s∆∑/˝ÕSÜãmsÇÚ~æ˝’˚˜ﬂ˝=£•y’>>8y≈æjü<“æàÿ
A‰˜˚‘©krC”A±™jÜ´6Ñ±Ñl&wÀ@gqÔ0ﬁ_ˇmj∞]i˜yªuê¨!ƒ£8◊∏Võ`≤—¨Áëô≈ö‚(G	Åª Tå8†?Å, Ø 5O¿æÎKû˘»2%â¸r∆ƒ¥πHø@¯úãÚ?C.&.P>\Hò›‰ÎÖDë&mx-Û‘#^o±äÊ€≠„^ª˜5˚™’i?os‹ØÂS¸EC?∏ûŒ¸À¿ôEQﬁ‘!8èÅ˚’ñsw‰£>éÖvH˘…)Û*+g>Â—2rªnM˜©˚S◊ì˛0'ﬁ7Ó†tz˙ivæ>ÌùºË4N_∂õ¨˚≤ÒeÎe„)àõ!wm<;l¡¨AQõƒ:)∂ ÃNû/™ˇ∑»I/'0Í¿%`"‹“æΩ›ï/p>ñª›Ïy„Ï∞áh¥°bN¿!¸ã™—è1-ˇÇŒ‰“µcd˜À Á6f›˜ﬁîÚ9˘^»YıÒ<ØÇKXiºK4|Ωz™_0P^kıkØ#X`=ŒË+7x˝•µ5≥J›G™ËÂÄ1rä0”[ˆEØa€⁄M`Ïﬂ˛◊_ %ù4øD¬ØŸ	|—ÅÕbc?Éı%¸˘∂Õ+'@¿.<õ≤ÕGÏà9øF‹‹˚§!'⁄A“|`òõ8èÒÖó·–˝‡éèAÃ≤Ÿ[Ñ∞`1Í)ˇ˛7ˇ¸è…9üu[vtÇìÓ“+x5Ibí≠è ÒH#Á·;ì¿,“D˚†•√©¢n!ñìµ≥>ùÅ√%˘µ:Æ¬tÕgr	≥hÖv«],èOk{|:Î„˛4tñ9ÔŒö7°^9ÆD∫*+-ëôØ0E@'±ô™9VaæóÎArfﬂˇ>[ô˙]RA’:‹É%u∏Ö—]–Õ¬H„ SŒ∏fÎ:üj◊≠¨êƒ‹lñ##qﬁIâS≤Ü$œoQLüÓQ£”KòZ®ª'ﬁ{·O3ó5î%<E‹	¬Û›À1úç∆≈≥÷˙T“≥“8<<yÖsAM˝¥—Ì¢i€‰Œ~‹Gj†Ç√BHëê¸Y˝ànBB"¡ÍÒö*˚öCâ$’Ö1Üÿ|ÇP#*èELë™QÈw]ˇ≠ïBô\ìBiˆÀ_8∞&Øiù+û +‘≥J%7h∆aSpòlìÈ
É˘ÚU˚()ãTæõi}ïö%¡y‚ƒÉD—π*P¢ÊÃæ`kÿÀÎoêî∏k¶É±9åP∞}∂&]n¨t‡J¬ÔÜ◊ä8á,hMΩ¥Ee8c£≠‚Q&$&Ñ›˘å3EêD“h!⁄Ñ%9ˇ∑àC¸ßQz\›)Q⁄˝nFî0êtÏœ‚`RjÛ(öÑ∂âàí≈\k[ò…Ê»Û_˝+k??È4Q˚ìJ26FdÜ"«“¬†xåc‚ç„uEù8)>ˇàê€8mõVceb¶∂˜]3≈—ˇ»JWê@R™¿g.ÿﬁXz Ï#C°íˇ≠¶‰⁄IüsUf‡Vë ÎLöÍ∂©B˘q|:Oœf!Í—eì†"µëπ“Ú£±f9. É´ì’c7à™7ÈèÊ7,ó∏vñêæI2ln˙>¡7¶¢…õJÈôó…À8∏ª‰ )Ìñ,5U|º9&–q7	s÷9ÑÉ>ùœ»F†#/ÑÉü„∆áù\ÖAdYÄ»‡∫VÒ9VûºÚË§^"óO£¥Ëò(Ui<ÿßﬂˇJâIß~é>Uo%	l|éo!h°orFÎ] A÷rÈ!¿=<Gzß9Ëœºˇ"◊¢Á¡®BwÈsaπ˙å”÷_7¡Æa˛ndçR›Ü≥Ÿ4‹ﬂ‹ÙßÓ§ÚÃ©*H˛Móõ
õ(¥œƒÑ‡F˜äC‡ËœÇëﬁ~M~àbTyW"gûPv´‹˚R•Wÿ∑Õf•€4éQ0UÉ˙ÚìÀe“ßÑ`ïb|°PéîAH¿iF≠Mß˛ºÎ:A®ÕHçœx‘∂j‰^ à=vØ™Wwµ…©+ƒÉómˆ˚Wïœ†WIæıâZõõIñc¥kV<K|vΩ¬Ô‘ÌdH›πM“A…É|RäX=|,H
ÀàÓÛ`_¬5¡É÷û˛˛7˜_–˝(”9ÖÔ‚ÛM~}ÅG¢Ô—}+ªË…ˇ=0ºƒCC\®>Z?¯¿˙œIs®á›Ÿñ(¡ÄÀ¥F|ÓˇÛø„úÚ~FÚA|ΩÃò%ÚÚ[ÍºÑ/¯ÂíOÔF∞Ãm¸rÈ·#”"I¯˚ﬂ¸‚Ds…ë{Ég~ˆÁõúÊñ¬ã∑ôHk-·8≠µ‹-ŸZ‘Y%9bcb7Eã≤¢π
Có◊◊~ÖŒ÷Ê· x@«Ì≥'«Ñ7 ;¡ôUJÏáxJ›Íƒø*Øoò4—{#ówÍoÜEÕ‹≥”ﬂª©∫}?†v¥{aº†≈´`È|Xˆ¯∏∂≠R‘ \z˝J˙Î£ApÀOÊ∞™«˛ï··dÎÚÄ	‹∑U€ﬂ⁄eˇ÷wµÿh6éÕ≈˛€Ø˘NS.
~ˆFÔ∏⁄‹dç¡Ä®4TŸËR=_‰–'4à ª∏¨?ÅßÇ©l
c…Î ¶LlhŒiqÏLÊŒ®–1Mm,›X^ØŒ¸Cƒ~t{$∆|iÛìxäfm¿È}˜Yæ“ên4S\R›À•∑àÖ∆JÎ∑dæ3ΩÀmf‹∑è*„1e¢å•¡vpÎQ„¯¨q»:≠
˙æŸ´FØ’9jtæ|{–ÍµöòJe|$º}ÜéD 7”•ºùÍ†çonú¥Oﬁñ≤‰	k#÷z˚·z5úüÛLır}ÉÌ≠ßNb”ªu'üSQë‘¿é;Ê√öº⁄Tπ∆ùÒ‰[¿<5±wk¶’{wDgõ⁄0P≈Y¢πwÌG¿MTÂ$)¢#ˇ≥E#≥¥Eov—q¡Tçßnç⁄∫ΩΩ@çHo<.øycIó3§q
/¯XP.CƒÎ\πº∆$ÈF<Ö{®5%d†#ª}Ô"Rœ:á˜‡ìöo!QhW§‹§ÙËıíÏ&‚Ó∫ÅzGsûn,¨Qº…ËêÍÁ{tsà≈8ÍªI(U%aNÅ‘ e©dÙ˜3ÈÌ%{Ã{/FæîSl¯Ÿb∑&nêO⁄[ñ¸¢J◊—¿Ê°¸t”«S|D±!∑0ö¯+18Ù+ÚCV⁄§›•¢ãì≤ˇÜC_Œ´~pπImk6GÆÛﬁºG|H’+ÁC—e∆¸Òã*tEu‚Œ6˘õ}gäôTV„”˚ˆŸbúJ˙CrOR‰ÚZıbPÒì◊â»“∫’õ¯çGÊêiû_€-@›]≤Ø4O€±{ö•©∂ú±ñ4◊¯rGçî◊ô\õÓß„#nùõlµ\kÌÒVÆµ∂µgTk⁄kKYlã6(¯BYçéÕzuÍ(•T÷“(Û˚ôã‡4,^DÖpK=Îáı≠≈ÎﬁÈucc5&‰Ωë≈Ã»Ü‰Ç)…üã—–*m…Ek2Cóf;RË#F•~9cr—úl4OŒ∫Ωv36$Ÿ&Î6;ç£gá≠é≈ìü‘ú4î∆<ﬁ‚FeQ≥ry√LÀº[G‹ËÛSßºÅ2ü`ôö`Jˆb?Aƒ/z8´0–}"ÿl{±>ˆß±Ã™æµlRÆ≈É˝¿–“w|ÕöVËXıfÂbÆÏrŸH9&ê5ÀÄï•B»äC§Ö≤¢ñØ‹Ûdœ9=6ñÀÑÉeöü6˛kúèDÀTã≥¢).;ô{»ÓRúä%zj‘≤PÑıäPìÂ•ãSÁ∏STöBÄ¬ êjA{ø™Ω¡¿‘>—‘WØ◊/¶µ£WiHØ’Û∑D≥‡+o0b·{%}/oñÏ$,Ô+Õ|_Ã5V	vªœÍ˙óMP∞ ÷Nª‡(õ/ëm X^ÃK∑eëÊ“8n~›mwY˚òùvN^tZ›.ArS&u˚¯{ŸËùcA¯i´ŸÎ4Ÿó≠ØO;Ì„^WÛ\Æq‘=ÑõXxÚ¢|uZúOíW¶ ˚d}¢WY≤$\ß|%§—±r6…óéc&Vû ¢x)bZøùÀä∞˚ôhly_Â_ØııR6åX$ƒ¶¡Íºº6>^M
∂>˜:r a%Óâ6Lus./ó9≤©:!˘aÒR!cRw˛í(\(÷≥∑„/ƒë]»‹>Kj„…&À¸zE∫∂!@¿ìôc`…£∞P¨T
RJJ+˘Gí¢2IŸâgc˛uj»+N.VX8íéá8ÊôD·ë*Q∏x[ŒóóLGjƒ]!èœŸìbe"¯ 
7u‹p>öÖ≤—íI,Y9€ñTtÕ7°%W+$∂5"!˚v πüΩ∑ÍsÂ|pü9ÖZjª`ÂÌm∞ù:Z{XÃÉ≈'l>ﬂ≠#4|øo√ø;˘C¸wó_ª-æßg‡5{X¯ƒØ≠’˘sÍ˘≥Òy¯Ïz]<ˇﬁ’x£µûôΩœvû±Bx››UfÖˇâwû1ﬁ'5r~sƒj√B
ëºàïœbœ Ñ…ƒ#ˇ˚“œKπ¯≥˛È?/?∂tîä?èó^&Œƒü˘ÀˇDï'òGX≤ÅyæÁAYXÚXŸ≥◊‰©…s∆íå(–Œ¡±kQ0‹bÛ`tkwO4~≤ˆˆ|‰LﬁØŸ›∏£'kÉÀ0ÁâØuÉ¿,oœ.6Wÿ˜bÎó>CﬁËî0ÎÇ˘S^™∑∏˙0v>VÆ‡è=˙+Ôã∂Î¯Å⁄∏e«±–6∏È¨∂Mì·¢Öˆ|}ˆpA®ì„îL≠¥k#/_ãN!∞ÍÓ„Kƒ˚
I]OXõãΩ“π‰J(ÙõuÀèô∆EÆˆ££sôZ¶˘d*o(›cƒjà¯!HR/·ü$ﬁ¬?∞õªUˇëÌÊ·‰•bH ‘Aæ§]RºáÚµŒ—t˘È‹ùªƒ‰a	∏ ÿ)ÃÇCZµ¬æÙx‘QÁÓ5‹¥ªÜeΩáR›¸vÛï*—'7a%⁄ÙŒ·*:Y6ßK9—÷ûä}íP.˚òY‡#cÁb/«utÀSkπΩTΩfîA∞œn¿®fR
0Ock√|œΩèÓ†\[ø˝û›àÏ˙‚e˜lX©=‘Ñaƒ∆ë˚∫éSÀˆáú∆>Ü•⁄+Ûüi‰pÀhËbÕÎ;wÇ∂®I∂T⁄‹d/·∆Ã¢ÔJÃÜî∏òúXQÜ˜È‘ê≈hÒŸ®Û(uv¿0„eOü∞Z‚Ôœ·Ô«6òLGMÒö∏5àî,‹7B˜»G¿k_““¡¯í¯z≥ì≤Ö∞"P,W∂}[\Ä§Ù\0
ÿ*fê/h≠í∂Û#<@œa—Èpà°Ù¿Í9	¯Eµ§π√:DUúÈÿÄ›$ÄØÊæ<‚∂Ô≥∏  Ü?.Ö¯˘öÂ…¡	‘f¨¯ìjP«„„)ç4—⁄è∏±"b2|v/©].¸	g◊#
yq2¶TöË∞ﬁ~Ôù)¯%Ï:$Y ‚-'Ã¢'a®Ã\[Ω‚Èbæ€
x£≤is2ÛµÑ\,å%˙•ﬁt‰ıO..Ìπ¨;r}u“n∂0ˇÈÏŸ≥÷Åp©˛e´súúıuØq÷;9jÙ‡ÉÊ…—ÈaªqwútZ+”nımªvÒçç“Û5;ª7Z¯tËI€ˆß»¬
∂µ0è‰‚~¯`ã¡(ûç»„$aa3¡Ps∫@è©ö“∑-3lTB;øjM„rO<´X3E[îí[ÙQ‰.Î{n£3ÇçÉóË™h'Ó’i≥¯/È‚3Í—(ÅUiÄı›`:-(Ëqs¬§æEã{›
l∑p˝ }å=√ÿ≥ÓvµYwâkãu≥ºyóD<HfÕ•Éi2º'…YˆÀÕÍ™Ú∏Yn¿	7–Ó÷B:ä_Û+⁄µ°≈üLßÓ¨5-˙èO¸YE`˚Æ™±¥mú%w’Ï\ ∞hÇT»=Ö¯~^ﬂ∂µØ÷ìe˚˛‚»ßÅè«la†Î◊ß˝k≠…ÖÙ≠î±–/qÈ2Ï:Bº~ΩßïUæƒ†ß∞ª]ÇŸ˚˝˜ÑaÕàìÕÉQ4MÜ˙4Ì«‚/Æ#ÊèyîÏ¬Ö›≤„lQ˝é¿Œ∑ÂÀºêßh9ª¸AHÎ˝d@.ùìçÖcÏ•&˙|YdËÀÅItˇ˝x5moÊk˚“qmÔ…ÊﬂgThY‰T&≥/QÙã‹Ÿö‡fpL¸bÀîÿ^p‰∏Î0íg\©ŸâC¡è¸A- nÍê<*∞	T˛ ù∏#w& ◊gRπXÖ:u·çfX“i%§Vbßm‘÷Í√Í3˚4ê’Ù≥éª£ ≈1¶Î¨R)#‹çÍ™¨lP£≠¯©:[}úÛ·Áõq.yÚõıî€èlZÁúÌT ˆnGŒî}üΩtù+G^†®LùK˚>Îb7˙c=cÈﬁpçèL§ÖÄPZÃL&ª'í“ERÂ>€ZKÊùG_‘ãú‹ØE¥Lú^{2¸¡º/∆˛”9®∏˘,ƒI"ë-Îü†˜µ=V&7∏©˚	~nmGÒÂE€Èπ"mPYDQÍ3œ5∞ïÁ(àÓÿK§"éì‰´††œ;%A']k;l(ÛŒíØ∞Ì≈ùo8ÙTÁ√=mÒ˘&:Ä„[åts˚\K†<eèÎR$•l)„+/ú;#Ôó ]Fîœ·≥cwçC4œ$á∂±˘∆ü∏u∂à'Iı~Œ•À˙‘˙[ôp ò˘ƒIËO∞EUl¢•¬∫.Ô§}⁄>l|Ó°Jåùr¯£áÆÛ·öù;˝˜óDl‚{!%πéΩzó√ !«L˙◊ÿ*{$jyœÒb'\]ìÏ˚∞åüUj:P…xbjº
ÄÍ“-ùÀÚ¿Ø=˝ˆ◊ød'›ó8fÓÏö5§˙Lõ∆O_}˚7ˇbº®ËPŒ‚=>p˚q∆Á_˝∂%0îõŒ®ü.Ø8r±[YæªÙF„äímâ˚à{∏œ:TP˙9/—›`7¬Ä·ˇàaFbSÒ}6°.T?Çsˆ„kËÑú«_œÜê~R1úÎœo»§äÆN=?Æ=ñ7;ìÀQ‚œèÒØ◊ÒØ“ı%CP•ÚOv˚ÙGúéª@~&Z/ﬂ>UZÇ@†‘óAe'ÚÅØâ t5Î¯˛XYÎõ^º«;™Î¯rÆÅxu±8e‡˚àC–ﬁ±I,ªÚ}0A∞Ùåt”ê¯ƒÿC>=Jrä·|\Ué%⁄§Ì∫Ííh€‘Ä8|+K„ZiC¨Gâw≠ÓN]∞v‰ı·´xW∑´ıπ•òÉ€â)⁄∞ï¸7È¬§.zà#6≥‘m∂éõ≠-»äQ=3¢È±Ña8¨|‡÷SÉ™U˜¢A’1KFU©ÒaaπÌ®Éz£<©3˘˙MÓeäπg¬Ca<†g–"∞cÆŸ!º{oΩicyJ=4ú“CÃce.Vû√˘â7Ã@nÅÊŒÅax†¶ÿ'»˜Pä©¨ÙJHHÃû	-Ôéï§¿·›éè ©?ÊcˆåœÎÖ„˚0qRjuqR∞Ó pë£b>¿;â<õì£Ã;uC⁄©ÓFC⁄ﬁ‚C™ÛaÅD4†+ »ƒXNù^ªq»õèYh7P≥Ÿ˚*Q√ù&¶ZÇƒ1ÌÏ⁄Ih>·zPjâŒéª/€≠√ÉU–SÈÿf√J3ÒnÏ‘çúÄuIÉ+#8 †∑·_œÑ…1ë\p Éƒ˝•{,…mWy†πùLÅ˜;^¿‹…/'cÆ.Ç\ A>Û&s–[©]à ß≠ÊxIL†bâõzSRJ,hÏ—*ƒ√¯Ùƒ®∫Û‡Éã˚Åp≤ß˙qu':D{¸m9Q[È©~î$3ﬁâÖ≈#5¶zÇ“jèÒ#ÄQ≠îÙ˜‚1ªW!kÓúYv9ü,¨‘^µ”ˇ∂X*Nˇ)âzˇ‰FG≥ã∆.ü»∆^8”∞ ©Å2ˇ÷õ`ÛP#©=õá®ˆX—Ñ˚,ÈlO	>,Ë‘ØœÒB	Îù/i$≠»XDçãqÅŒ∞8t∆.)˘,IÜ,≤œV¬©BÍ{úêp']–Ò/±%’¢v∂ì8KµÌ]q¬ÔE?´m≈c:t¶3 ï≥’9Ó¨g¥∆≠XA{((O»∏≠O¶üïZ!&‹Ü>ôôÙ[ ú™ÛùÛÈmn´Äÿ√∆πìŸ°è s¬${-OÇW!AΩ¡vØ‚À*7RÚ•ò>À=àÚ‘√3„TìÙ†øøÉ\nÊù∏âGÇ±	*%§V◊ﬂ|å9˝fq∂ı˜=£µG∑ñâV´’‰–˚Ú&w91sUÆµ∫pLIÁûTÇ Ù’Ö5#,´±Û±åGç[!’ó3"Hﬁ£∫*ë^…Ëëıú'ÚãËq[˙«Òµ˝·0Rtó≈KYùŒ√ay-r’ΩBm†™zê‚ÿÂ∆hƒƒ˙ÆØÂ!ë!¨Yg03ÓeùÓÆtù˜è[X¿¶?ÈSïaéﬁ)’íïIÎ‹ΩÆ¯Zﬁe)ù˛[.˜≤ò{;ñß¨æShëaûG∆]ÇeJ»±Ú…x‚ºÄ{,ùëj}Ú\õK≠~¢ç;r«Óå;∏xÄ}™Œ1Ã˙=/Òr¸∆¬Jùç.˜„?w›∏ñÉy·`€…êàMcº‚%=‰Øç´y—g∆œ#Xx6ıI•~©±'ñÃ#æ·Ú üæCâ#xËæ¿ƒÛ4`ˆ9Gn“«£Û®AÁ0lÉ…oéøM¸`Ïå÷û ∞ÇM‹Uõ˜kzÄ)ò¸G~[.«Èí=ƒH‹«µyw;§4∫[∆.~NŸ+w{ç„Ég_ØkèÏü˝^7D8çã∞Áà˚|-ãëM{ùêß∑låuOUm¯Ó¸πÔ'SR,®KYX|ÛDæb˜$ë%tóD\ŸØ5.OWñG][≤™d,˚6ºÚùrL∑Ï/1‚L<‡¯‰∏≈ Õ√V£”:X	–~©Qßéo¬z8‰>(¡›È»õ±CÁ⁄ü´ òË±z•™ñV™juí˜˘\˘è⁄› C<t/f˚Ò#¶„@aó—sM∫æœ¨Mez6©%ù®íM@ë=O≥∞óÎ´+Øw8¨ÜÓ∏iæ‚%8≥¸»A'z‹ÿÿôjnä◊º}S©ô∏„2¿Ñ—Ω≈
’H2ÊÏô¯'7©-ä}vìÙx¿†Vπ∞ bî3CK‘¶r=1nÙÖÆ*Bwâ˛˛%†	í“≈¶1g:ãqµív˙>rˆEÛ=ùÓm®d3ã7c™ßH”ãöhGlès;∞y—Ï/Lﬁ¿ìçÿ÷j~ÖÄfÇi’ôñ@˜Ûg‹6;⁄ãñFM{Åµπ≥ ûÑ◊–É3™\‚ø0ÚˇVsÎè∑œﬂ÷¶7(„wÍ‡˘«ø◊ﬂ∞◊±üøzﬂ∏˚µá”èoÒode•Œ´QçS[Ä°D√¶
H”º¢ìu
∑ÿù6k—«h{ºò"˛vk‡^¶b{˜{¡ÂπSÆ=‹®ÌÌn‘Íè7∂™µΩuXû©O˝"*Ó∏2‰õ”∞‡Q·7ˇ‰AÑ\\⁄ÆÓbÅ⁄≠©òw›P`O)QÅÜC«äóåf÷Êc·ü_◊‡AnÀéè˛¬Æ4è6œ“ü π÷ÖìÄq%ˇ
èÿúöÃó◊â∆	£€€˝ﬁÊÑS∞ì+<‚ùFP·ÓlÁπj2L"Á¿Ô—`±∑LC|§¨®Gƒëßïá[ÉgñBV≥6.∑6;ÊµYMh©ïÿ±^	˝Zlo/∑ª+YãU≠FΩ»j¨)Œ∂FΩÊ<>ƒ`¶_”.Hù˜ÆØm÷YÖ¯;-¬G˙¿JÒ(	Ï∞ˆtkkÎ˝õïÊß—π?õ˘„U™∂wÁA—XÍ¸¯§GtΩÃàÍèÓ<¢ ’ˆiÎqbH∆Û˜‚‰¬ÌG»¸›FÔ¨”¿û¥ågé∞ggœû∂Ã*å¬—i•∆È2wÂR¨(æÙz´∫µÛ&√†nÑ‰ë˝ Î≠∑[o∑Ai}ª®m=(ÂZN Á'ï(˝Öˇ?   ˇˇÏΩ[s„Hñ&¯W<’U%*[§HÍí
MD§1(FÑ≤íFTDvvZXDB$*HÄÄR0£d÷3≥˚–ª5ª6;ΩΩV›Ωói€}ÿãŸöµÕÀöÕO…?–ıˆw‡ ¸ääKV“Ú"Ä√/«èüÎwËgk%LPÎá,0ú&6£≥à%Ç(àSD_©EªºT≈o~ÒæÏ[ŸæñÛ™naq>Ú%Åô"v76niQWààÿ@˜˜í,´èÊıNƒ4".LQ=ò«Vy•0…›â7#åÁ˛[ÇÊÆ‡äŒ.›∞ÑZRò8bŒ_t¶~cÓ,æt¬–£xnÇø◊ã¯ XÙc ù8sp]^xÎd˙Y0Yåø÷¸%i˛rìÏÓfˇﬂ¡?v‡è›‰óΩ‰¨_≤	7“?6Ï≥Ôë˙ÕÈ≥∆<Q´™_Ç>ìoäíÍ_Ê?FEJ#Ûà<ß%ÿèÅ˜4£+ΩàˆOn˘™±õ?
∂0±k€ª*s–ØXÀ•™1â$FÔêü/CU¡ª’ªËù´∑§#]DëìqŸçúŒPIôøe∑@Ï£
4é.•ŸbhVûæ[¶≠∂e'#Õ†…¨±[»»NŒÕ…»ä>~¸€øˇó˛A¿`R˜oí⁄…©(st∫GØz¶2Å´§√CÅ´3è`ßâm˝ä3u{[èäìﬂ≈ˆ√§…÷÷ó'∑1ˇd’œD™›WÆ˛N ˆñíxÕW°óì»Ω¥ìy$∫:+S	;éP s.¯ÕHTm+˙˝∂s|LûtŒœè,–‚>(YR·ÉEû	>Tr‰A(ƒØ‡ﬂîv)µÆÇ6óí—”Ï˜≠Ê/_S™˝~á˛%úJJ≥/=∆˚ '≤};vj√5€‘—–b\≥Y‚öV$˜‰¯Ë8‰ŸÈÈú˜:+¢:…ËÖZnﬂÔ1qBÈmô∆ÃSá läW=ñÉ—;¸†4OZ#–:t‘ßôP{‚Âºçc‹Ω–xbwﬁg|πÕòj—ã*£saAˆr"«»≈îÉ•eä¬.˙„~ˇO‰[$¡√£˛»mx0”?>Ì˜ó&6Ÿ[:ù7áΩnÁªÚÁ≠ù·ì≠È%ßN≤>âDÁq¯ò0#µ†27,¢vH˙RXÙ‘MˆCΩ›,Ñ à«hu≥x⁄2m—n§x∆ÜD=ÖDäŒ™:oúj;º“õ ‘Çáp‚$˚
ò√“ƒëéLÏC°<(mÒÌy6Lœ˛≠ˆnŒ∂”Jm;ªÌÕv´µŸ⁄›ﬁl6lº∂Ìù\˜2ÀèS0Eîp∑µ‰4ô¢…0;ß¯pß√≤Ùc‰p‹˚R{“˝ƒ$zØ≤pƒyZ€zÍ¬Äep≥≤9tö’w1ñÅßKÒJeÙã‹›÷9ä®eá=Dì-=fIp?Ä8_[4uU2ˆE(öZ∆_◊∏≈N¥)Õ4^¡Vx∑±	¸Ô‚Ω…†JL(Ô	Ï?ÕNËc≥è¯KÔ0Õﬁï<èB„Ä‰MPp@
Ø¥}«È<>ΩJ:x'ìÃ0Ë´`G∞m±üdâ•9MÂì¸ã¸‡ÿ/YWåU¨±ﬁ-qﬁYô96zOY¿S¸0,Iæ$uˆ(‚H¶mXaI∞!AJÈSa¬&°O¥¡Z⁄ÆÍ¥‹^o8òT.å…òâ@ıÙOZÚåa¿EhØ∑Z zÍ‚ßÇÅùP/—˘¥?®ÌÇ∏˚Á$ù◊w∑ø‹∞≤BîÙç,*4b0f[4bÅ¬gÖ#˚”6ga[CD√[(Ú óùl,ÆxV^è§DíÜ]{ëáô¢2ô¯¶>C	˛ ÁÙ¸*>ex7ˆŸÍNBﬁµΩo⁄ñ@XTπ˘]˚—˚z ìø$Ì∆æı{ÑG’≈íAo]Z88eí_ìµ?k5/Ï∑∞˛mû/‚5˜j>¥6Óü]Ì>põóä“∑™◊}ãû•GÔ#)caH◊	s¡"F:æ¨UÒ5áàA@Tﬁ6Ÿf-í∂uõq&Óéß±,aÇ‘ı»\ÿB@´ﬁç∂ök˛Sòªz%ö¨;ã.ﬂá¬Àa≠p(;f£x§Û[¨x-S>Zy«Úæ‘Ø\A˜H{nYcC≤á?á›¸ÍÓ}î’≈^T]ŸˆˆÉÕΩ}¸á.l—(yÀ¸9,kñ[ìÄˇõ°˛WZ⁄ÿ±ª˚õ≠÷=oZªRßA=ÏCÀ2NQ\åùë`#µŒTVL=µCÍh√Ãój‹zPtÄf˘TêØs‹f)Fs—F2À UI‹9ÇÖ/f€HƒD¡,
 «v≥Pı V\,“^ì5≠KÃDö	RÖH‰V£bíáh£∑Ï7V~»k”∑SÚ„_ˇ„˚ubUüE÷πÇ‰P éÀLRÎích]ÂΩS§›eº#k÷¢Êj:¸Bg3†I◊2ü}øÄõd=WU›æ@µM@™ÂmÃv}≈4ªÃî4_ÍÇôÒé|=¨ÁÈ$p–¯≤ıÑ:§I◊	M˘ÍWYyE1¡µP”…";M•ùÄdW5Éü∏ı2áì&ØÄ*¸»_jƒ÷G(ë/ÿ´6K‘íÔÃ⁄C—K›‹2I37„ X∏êdË∆é7IuM]∆LIáı©õ)Y'bfJª"k"ƒ:¸nÑXÁÃÔ"ªêˇäÿÍ•Á+lÉBYv*z„ú≥ØŸ¶H9Y%>ø¬¢p∫Òä\†8¬(¥≤8bHÊQ{_ÿ aP¯0ÊFíÎÙ€Ì˘ø6™íVGΩµ!K^äh0C8düúÙ`-s|M÷~¸ªK˙¨4*"íÇ÷ëÀE$&@·Ç I1,V∏'„åBÏzç∂epùÇ™y:>0Ç∆ö}óä¬Nï±¸Ò˚OB8 AN4c°pƒcáÔÇéÌGEÃﬂD	û:!ÑBﬂ◊oùÈˇéºëÔL∏oÜö‚D5»∑‘Òé„øûO|.aÚæ®4‚5uòâq‰–ΩˆòCŒı‡dìòn÷ëÑnAR¡c/+ê0dÍOzÏlü`Ù	rn;Ün√“∫®¿Ê/ﬂfS˜ÖﬁY‰ö„–Ûﬂ&1¨:D˛RK÷µÃ„≠q…†>ò†`[ï$√O’2f¯±vW˘∞ı¨¥j¸h‚k©~"Ê´R0•V`¡Iíy¶øöù¸YQ£ír\°>~ly[wÇTÈâfI≥v≈äÿΩPi©-Ïm[≈Ÿ$>€E∫`∞”?êD‘ˆ,DÄ~Ä^VMdC%v#ö¨ò˛€®iì ÌPôÒÄ‰bÛ_¨2‡jÈÁM¨é•w–‹°>E
ÄÉ(É…f¢ÅUJx+C≈F∏’:?F˙HÓÀnäè§Éß1±t«pG“À0ΩLHœ	Ω`i5x©K:B˙∫ÍX+kè[çÑº3¯@>:´à!£›ˆ^çîúﬁ¬‡â¨ÆÄ"¸„ˇﬂã%>‡ [wë›®C<.4ùnZˇ„˛Êˇ»gH€œÓÆÚä™>ˇíˇàBOñ>{ëLïWeP›πW˝Øˇã ùΩE∏]â«ú|^≥X-d√Ù4∑–R+VZM¢cÄHyôU|ôup Iû∞∏ˇÉf≈öçƒh:ÖË-qê.Ï+YÎ§'ªFfgÅ˝òPæ|·Fqm=Êò4o8< é]ªz”Ö¡ç≤rîÊçÕ>ø˘˛¯¥À”óøÌúΩ∆ãß‹î0`j‹:‰Ô¯ÌdÓ^3eŸ2._ux‘yvräYMØ9·’ÑñÚq#›[:vÿ OP∞Ã ä9IÈ>Ÿ√"®∑e:,~xqQ´ªÌ
èV.. SŸI¢rõ–≤übΩOv†ÂΩ5Ï–Aîmµ"Æ:µ&Si9q¨dx!ÀSí˚π]Æ›∑LÒp≤R“LjG°(*√õ˘†E∆Èº“„°Jim˝}F8-ª˙£Ÿ,g'>ÚÀ¸géoF‰¯–¢ŸáÖ–[{‹n	)HÆ‚î›Æ∫&XÈƒ°wE_ìkê'—ëëÎ≥ÍπäçB-«U≈©p…‘gUiRπÙÔ˛-ú-pFP„`ÑU3h˝íı”YLÎ¡— Lf∆«U$;öÏ$ätøˇ'Ú°9VŸ{˙.∞7±í	ïÖ*ΩãâºŸª˛”ˇ]Ã™ﬁ∏òNi≠√lY—≤XÂ}M_ò∆ˇÈﬂ∞,dä∏Cû”ã¸}©∆í/≠˜)…Ø,•‡ß(¬äú§∆˚˘âH±Zﬁ∆ﬁ7‰û≠ku÷Aô£—à<"kkv-£€7ô"Íœ§ºBU2BÚ“ÙÖﬂsd·◊æ~Â–ö ¿–?l ú$ R6SÆÍîÕ` xäÜ
“.ñB6,G!î√»F[¥E;ò£ìoz›ã◊,9îÅ˚Y§#@ÊÕ\`a1(I≥Ÿƒ√íÁuñrà–ÎÃ¬&dñﬁy8∫⁄(V√Idî!I eÜ;R|É±l—ﬂrÌ¶Ò:u!e#∫,ÑƒÒä£º√h∏	80VÍ7‚’Bíï‚Â&0πç◊a⁄îá≥ÄFpÀ…9è∆(ÆLAõÉ—¿&Éõ
Ùg„P—h¢llõâNı‘%éø¡—8*(Jz¯È1êU]™S¡iæí:ï∆b
 Tˆ[¢J•—_Räî<⁄ê;ı%´Bô"-UùÔO±˚ì∏F˙Nämè°¯I©w}7é)êjè9⁄£ƒwÅï;S¢ˆR
⁄vC¨IŒGà≈√ΩK€“=âß0´ÚM(~P’î¯4ä«FQïπÍäº+Á∫+ôñ™¯Ê4ë.©€W(ä‘Âp:%Kßº´cg◊ß/úY˙¶F<ıﬁπ√Zk„ñº}˛©˘Œ|àYrñq5vË¶û?õ«∆Ò†Î?’OxÏJùëáYo`Zπ0ﬂ<ı¸GkÌf√"˚jÍºÉ[˜lnçbwˆh≠ŸhõoΩv&s8ìekbf˙† Q4hHÆµäƒB·Ω BÕú0riÙlÕmx*⁄#+¡Ccƒ~◊†´Á∑∂»ôz¡h$Õ$aVêTá`
z·C“ll€ä¬w˜ t;«GOíÑŒ!e K
WA4@ãj	únπ≠Ê§º«Nghh¢ Tﬁ¥M‹Ω£ªÒ9S`A7I™LÀÆÑÇ zÇ™∆¸±¸äBÚ∂3@ﬁ,≤7”63f XùB:…ùÉ6êÂpË?Ô∞öÒ÷åºâΩ§âŒ;&ßÁ7\ø∂öŒD¬ƒ3Û!ne¨¬s Ω—Ö¯Ï<Ä∑ŸƒÇU17Ωçø√G≈j	&öØl£xETpÜk∂#ÌÔZ4s&ò1¿£”ì◊‰»Õê30`Ç^ù¡’äÒ&Lñe≈ﬁ
ÔH•#w0MÆÌNÇôK¶†πœ©%È,0$ñV2`÷	$≈A‡b≠x,NŸæ‹ñØ"OµôÈXò`[ÊyáäÙqÂL¢ 'Ú\nÊIˇe∑€Î˜_ìs˜j°}…Œ	d¿˜;öπ®ú«W<ªâú+ó›âFòÅƒ¢[¡˚¡~ayŒŸür6g‹Ì&i∑6ﬁi<Á ß\!w;’Ùì]-a1Y≤™xé`g¡w-ââæñôcÃ–ôI¯øv4FÁR±zåM∆∑URC†+4∑uoÚäIµ,¡6_∆*›µüî∆…B≈0∆1úOÅñ,¨FªÇUj¥›¯yÙÊ¯œˇÚœcor°#$ør¶≥ïºn6\¨z¥äqöÃ'f3LırS“‡ .®+¡§jŸ©e
Í%Üì«ınÒæˆ≤¢µ	AQ˚2ÀóL´V„åZäáñﬁD—®G'–@ïãÏbı´9ÀÒ˘π≥Ó˚◊1˘ÍŸ,ôkÀ˜ ò†Á™™œ"˘Õ ÕÆhœ4b37`±ˆ|áÂ}ÀÈ2a¿¨€8ógã√Œ§!W•ÌWÑ}¿¨∆)J”¢ÓÃ„ ´!ã…N¡dr	¥Ü zÊ∏G è|°T3œ=K]Ò@÷õ@ÓÔ,›Ò|ûòè|¯Ó6ÁÅI†j‚HñûËB√Ûì˘–çjÎÃ˚µæA~˜ª¬öUµnF:gür©⁄?±,»Ä>í|/0HR÷;.XVÓüˇfﬂßuaüo€9|åexìèéC£»7ôU˙˚˜æ{C·Á⁄F#®Á¢j–è±∞ÆMÚ8–<Ñ˛∂ÎCo‰≈†ŒM=ªπü@¡
¸°f÷øÆí˘¯√ƒ*œf√¥äñìa&§ä∑;ÆÔØ=N§w:ãr¡åƒa*'f‹9‘LáñNá:„#L}πˆ`=‚ÙXƒÀ2ÎÂæ˝J˙ÎöÊÂ2ùDŸ¡¨¶íüZ“√≠i@”Å
WÚ”J¿ŒÂµ‰≤hZiö‘˙†ØÚ+Ú<ò∫‰¨‰ç≥àäê«<_ö`°≥§I≠ÇáYáàGM¨Ä$AÕM,z¬ïÜ‹Ö^ê∏åˆR„ ∫GÂ#e≈n:ôd˘pº]¶˚iûãŒπjiﬁ_83–‹Ú÷<.ÚTÖÜ’è©aı˛lâ˚†ÁèÊN8å „ŸoKFYN¢Fm6Ô1/ûä©√X:¥^É>ÌEc2√,`É8«–•,%ò⁄*Xfm‘ ﬂéAwﬁîgƒﬂF51LaÇGÿ=†[4_QKê©∆,C‡‡D:·–Ñ¿ë‘Ø0XaòºŒC∫èÊÉ1ç2yÖÓ ¨∏â∆ÏMgÚÜó,†´4%Õz,2pcìg3Œq/Q$
±†ÕAs˝´ §	i¿∏∞:Ô⁄)0√”yºlrNÛ¶ß	8¿„≥Ç∞’tcï’`I ∞ú±öÌ3™`˜›êÊ<ß.p¨ÒÃpF∫©4∫vkÌ≠ƒnè;aá5¡˚rYÍ÷:ô]*B¨ÌpTJgÈ`§{ΩXíÆUúØ\˛@≥dI∑ΩÍ¥z¯l\∫Œ°4≈ËN–áösÒ·xGõ +ö¡°∫{•	∆èílƒÆ>µ5•î$µ¡•C+,iªô_™Ìíz)ﬁΩìã(–Ÿ\Ã,tØÄß∏C<¬‡öN=Ä1Ä—]G°ªC+û¡øF9dŒgA0bøD‰*Ω«√éÚöiCYúRè∏¡SF Tìt¥d 4‚‹ôfÑK+LvAÓ9b4!%!≠¿}-H§≤)*Qîú‚ÇJ4‰¥ê•S	‰¸	ô:¸π∑à∞∆
ìõŒ2d6Ëå8ICÌ=˚)mnq˘çh◊÷ïXb¢Ç=£d·¨H¬”¯E¡í^/ß“ö!∆Q©¥◊4{¥·d l√ÒoJBŒßâ·È∏-M€œ„L∂v•Ë∞≠›ç◊¥¯7¬H‡ˇƒ&v5Íq1rØŸTBMîÂØë«9™œ≈© ‡£§G∏˙∞ª”!M[(7ı}8-˜sñ04íÕ]˘ëù^±©ÑNÈò>ëG;,ùù⁄√‡ŸíL\ú”Î„›ÍG˙⁄cë˚ú± "?úª⁄WYï1,ûm˛¬√åØ_ëŒ⁄°í¸'|"æq¸:=_{Ò˝R‹A_ J&$}íWcœ6ÅÙ—À√Óÿº-¯Í–S«!“Îﬂoø÷zÈÙs™`Í:ãGeq°®a*«ãâu–‘‡ÄXên˜‚’&Èüù°ºò˚ﬁ¿õÅ÷≈UB^,¢•]@√s&ı-Ú‹Å&–•H~XÆa>aÇï1∞©É)
%Ña¥(‰	Ö4ëôÙı«z˚Ä§≤‹'w™syÛì?‘Ì‰ÊüOÒ?âS|∞@¯Ÿ)û^±>≈Èw9≈ˇÂ˛ˇ>µs\T…7˝˚9¬ªsPxcÆÙ± û‚^x·å»ì„®ÓqK-˙ÁSª|È˛NÌ˛ƒuﬂP“ﬂ÷1ë\3/taŒ®µó—O1]Ò≈"!Z‹åM~Fû¡„xVEnm“S˙ØÊp¥QS+=X"he0ÜÊñ<´sU˙ùñ·ù^∫C4c@á“LÖIGéÁ+ígT	3mÙ°•VÕXf’\“†Y‡⁄∂¶M+bPõ˝RNT	˜!fÓC?Tëhñæ¸ËW™∂å˝-"=åΩsãF∏‰Á€çÉÍˆXm|èM`é,áªÚjÇOÈ0µ[¯Ùt‚sËohEf≤*aÚ%/HÅÚ°®VÚ)2ŸWË)˛Òﬂ˝≈´cj‘é‹RM◊L†Mc_∆l{_È…Ö∑©%{bSùR)"±ùÖﬁµ3XúS#Ë dÏ\}É ò”∑‹
ŸH…_∑ƒèÉ˛“°·]‹Iﬂô¿ÈçWƒÔ∑™ç•#x»ˆƒß–K©j•µÏJî¯›†g‰h±Z)z⁄0ÍS‚U£5KÔ
¸˛¸rÍ≈⁄D1J(X‚‰–ΩrÊì∏&çî¶ı|˜˚ÅÙ€àaß◊hòOÚsä≈/%ed≠±d4˛úD¿G˘H2OÅX"∏ßæN˛ú÷4¸‡¶∂!+GÏµ"ÙY~[r¬ß∑&„êﬂé<2Ωıæ»oÛ"∆¶y»ÔI ⁄^– ï¥Q
¢*Ça4†!ÅCoê¶¸N$˚yDqk∞2ùÌV∂2¿œ´!§¿¸Õ§ßÚ{h‚$õÙ⁄˙∫·ÆrPzß$,uÓ„Ì‚— ‘P{)m}ìkè›Ÿ$X∞ùú˘˘˚ˇ˚	u˜À]d’=@”°•H≠>§Ä πyJŸ>HCX¶óXgÅçê`[∑h„äÎÖ1Êòn~‹ÿuzßJHaÇvQu«lÄòn¯hÕmå3F¯Ã	Ò >¶ ,bû∫+ï®S ”-ÏåBÓ≠ÖƒîÂùT ¨§hàÚ#Ñìy ´Ê1E‰°πóÏ'â°jO têœêÙåTjÜó.˚qË∫1≤àÉa9Ø\æ
ExÿïìËn≥MNù∑‰ÿÒ-…3·≠Kêh ñ&”•ΩÒü"/¶N∫ÿûwÂ8§áé‡YI)≈#A◊Ÿ≠v¥â¬ì]P‰∂<q‚≥ü0aV”8Ãa√¶gç≈Æ=¶ﬂ,@eÎ◊Íº#'å·tÍÒ»¬á[ÏAÀv«x®a´O®æÑ8âaÄ∆‘Ÿ"œÉyTµ≈Ö_{¸„ˇ¯ˇ$·‘é∂Ö^\›X±Iåb‚ı6ˇà†bÀxä9Ω.¥|N´ÖÅËÃÙM?‹bƒX]KˇPáì˛ÏÂÚ^T nß+8ÖhöÆB≈8Ö¬•(3J)BJkW	«êﬂılp’è#˙\ÌdéŸ*≈ù_aÎóQ$»Õ°6£ïJ.⁄ê™	uˇ´J¶cQÕ^v›îßåﬁ´R™2è=‘Üì™·ÖRÆXL`∂ÕV÷÷•ëN˚ŸdÆ≤€*Ã¥\Ù/Æñ†QE≤Är#ﬂ√-¥µ»m5,s‚E¥
Tjï9ﬂU÷yôx†áÒJπä“D^0•sú/…Òîf("µ˜≥ÇUÄg÷›ñÅîEÖ´åf¥ÙFöè—/öl<˙?†iy¨ØU›&FQ0 3BÚ— ˆ•1Ê∑1∆|Gå`–$&=Á∂%]P[®≥†îsôV@ﬂU≈®¿óπ3æZ÷ï7pSG∂Ñˇ…˚‹ÕÇöùøZ≥Úú&‰Å\ñYÀô<F}3(í·óÓAŸ*π„Ô•w0Yâﬁ‚]&îo¥’˙˙FKïµîô≥™ÁôrÂìIÙ5÷ﬁüb9ËﬂxKb˛t;Ôœ¸E!ã’3R1Ê◊Ún2c)˜ç0{©9”¥⁄≥'9"%'i€&èı@÷∑©É“âè≤øuYzØÿΩ,·∑î⁄∂Hîcâˆõ%¸”b ëæAãú€˜πâ0Âaöí9uâÙ∫M∆ö¬Ìhêê%Â±†åºﬁ`=I¶db∞Ó∞kC™ì•nBg∆6;n¡∏ﬁ“h:68§èEáú;C}1≈)Ú∑±Ÿd§yW	ÍFÏŸ«VEË-?˛ı?ZﬂlQ`◊å„¡ı;’r€≈$ü§‘jöπ®ôøíàŒb…íπ,9ën”ŸºÛÊ≤©»ßΩX]‹5 P˙ØÍÆ?D¡ã˛ÕØ[˛‘.!RX⁄≤”Œ\KÜcX˙¶4"0{CıÖ%∫≥=e±Df(VZ'Ç—J=Ÿwı_b≥ó⁄âUoV‡˜åÏ√Mrf°}≤2ñ™à£*∑FòÄ∆t.V¸?’s"j˝H†ˇ”πáCùWoñº«ÿ•[î6LıMı3be3[Ÿ∞è6Œ– å`$¢‰£—Õœîj≠âµå£˝∫ôhÉ)Ë⁄~!Æm0A"%·ÔxÏê‚Q™öûÊo1cœP:3ﬁïE:d2?ïƒ'É¯:æA∆ÆÆ–úníG•A¬e˝f–neÌV4!WíY∞ÑYiÚt

⁄ºa§“∫q
}CÆv®¨~F]¬J‰/I˛≈‘ÅØt
˙r6
ªh9=9>:ÈQ::}˙î˛≠”≥5˘4¸;.4t±p˝]πêëœ\y∏$y6¢≈™)ƒù´—–Bóî]¡ÿã'–‰π;–ÄH˚¢æ_+†\ÑN4nW †èpŒ¥:äK≤ô‘ÖÔÂ™ £Cv0öÕ!œ8¡·_ëﬁlÃv)9£qú¨µEK˚¯¨ê⁄˝£Ëî°7>ÿú„†ò4Q	4ÁypCéQ#{±`ÎÈE‰◊Ó¨,nØ-G:éÔÇ9#3"¿L‹QHãl≈∞≤·Xq‰†pÜ.b#D‰-Bh±ü#Ùcp,aK(⁄G“Bƒpa»•;	n ÒÈ÷ò3 ÏÈ“Ik! O_*£√πÉo≤£àÂµ˛~çS“πåÇ…<v',üxŒ'®ÜI£~üN1Ád∏°h-)F8•ˆq<Ñ∞Etâ†çKÆ‰_Ö¡îDŒ5≈#ÚÈ"`w WaFh∞R≤(É önêã±ª 7HÏ3ÜåM◊üÇyæê£äŸ-C/`6,≈∏@\≈‹É	´Òd—êFã ∆§üb`Y·bª√7g0vs‹KÓ|Ó«‰‘ü,ÙŸô çEÈL"q”'ë∂ß8o37¿\
N≥ÿsKÜ¡Tõd≠ï¿B·œHºNLZÌÉù›µ¥'®¸,õL∂-ËT'gh‡¯~√¿çÁa…4UàV5ùó\`ùo?”`¶¥ì‹Gû—‚¶Ê⁄CÄK’£˘©eN“„õ |+LÒà∑•Ì!ë'iõ°j%î qπêq:}6ú¿ì(p¶DÛ[ÎW°ªiÇœ3≈$ñ~„ı3ë)5:¶=•‚‚#û„;Ü}û<sÈôä-1Ω^¶GpUJ·à‘
çT`L˘Oﬂcˆ:µ»Hùò¬çä€lí≥Kc>Ãkf*s¥Û∑‰°xú[&nkî%)sÖ¬ >öDg¢‚ÅVÒ)˙Qã	8π0ä,µzß®} è´mñsæ\≥,◊-Á]„eÙ¨j5\âõ:ß©éƒØeøıûŒwdΩOﬂr∞ƒ”LG›*çZX]îñwÕÎÆ≠=f;ÿ¶ÚûﬁlÆÃ´-®v”ò˘R'ı›TÜÙÉpäÅv¨/º"ü¡J≠`I·FK/Vr^)∏¬.©C~ÄÉﬁ!rAZ¶\˘WÅç¯ü:ME¿Q~e™Å\rœŒ„Á	∞eèÅ?bM›É‘[Cû,¯Ò˙ò'ÛÀÀ	Ù('^Nƒµ°µ∂â3
]⁄ äŒt&dGÉ0yπ¿TX¸Ö·\Üsƒ»A,nP	ΩPÒ¥√ì˛
ÔÒ¬DeXß≈W'É;¡Ï|X,√5Q+ ˘ü*Å–;7‚ëBÜﬂêSéüi–ö]z˜œ¿≥+—†Ì.Œiπs’6J£:t∂ŸàÜLóØ3@eÊïh√nºOë$óŒêÇ÷TI{Luû”≠ƒZ–xm2%¿ôÕH4üÕÇT7ñÃâƒkÉÍ;‰Ü¬’Œ@ªÜnMÄÆ]ÅÆÅÄ¿S›‰pÿÊîò	-¡∂Éß@…ÎÏLËïúÃú9≠z‹C≠/}9ö)òCß"‰ùª#blüÆ<•HÍG-I#ÚH;5zk•∞:Z∆x8gÂ hπDvI&D-n2#<⁄Fs;í˛¬@x8>ÌÌõ{˚¯ÉÒëäû•ê¢∂*Ç®¥T≤tö€†=†¨XåœÀ‰}õ‡;Ö®XòÚl~E0‘ƒùpœŸ|1/ëŸ#"’U“#èŸ†ŸﬁyÜ£*∞XÓ©∂9À≥J-P.äRåÑ_≤ùßét ±HÓ€Jé ñü@•X≤ÚÍàÎ±û÷YÁ[#öK⁄˚Òoˇ˛_˛˘o»È´ﬁ˘˘—aèt∫GØz§N:««‰…ÒK¯ı‰πËΩ8;=ÔúGŒ:/˚ΩC@˘ﬂ˝ûﬁÿ~‘;>Ïìß/è·÷Ü¬„£j©ú˘%Z.çpI€¿8à”ì¥ß´¨S	∂cå.˜ú∂ûPåE˙D∂+3•ÿk6s“B9#‡·bZ Áëkå˜ΩÇs∑Ue?U4«FömVBÎÕ6(5≥¥ﬂS˘Jhu%2Ö‡∆ê!Ñe“e[?ïÃr,P©Îüª5˜Bﬂi⁄‚ŒwÊÒ8<ê“ Ú±J≠ËìI‹§Z:9s|w"ﬁQÿFR@-ËÖ{¡àùcxË®˝!˘++ÅH
üdá¿∑LDÃËΩvËNÉ’a`>˘Y∫CÓrÊî&ód‹Gá(wÒyù•4™híÎåar»†=@´:‘«N4÷Áz€d{ÀÚΩªÁ¿Ô⁄{ı˝Õùv˝€^ˇB˝4ÅKzı:•∂_…ÚÏéÑ'mSk?Å¨Ô,x›úÛçüê±FUµDeçFÂ ê∑amì¢MXU"ÆX¢·˚V´∞)≤ \*˝?¸√Ôˇ!5ıΩ)ú%'AÏ
#∆cVËÑÓ2üÓÊ6åÿs.1ai∑NÓÿ†*/+>2&òèK·l©&-"‘6—]sÉÌ£3}<ôŒÀ,L‰jÓ4(˙∫à@≥ÿît∏ä‰§N•ƒèî¬3™Ω b"Ea≈≥K€•4åîFâ%øì€mL)ï¯yÖváÖJ“`‚÷⁄8‹MeIK)ö≥DÃ¸ØÂWPëO–O˛Ÿ$c&î<Dqç<ßfb2{%ˇæÇ4ÃÂQ+
]°ÆWvÄ›%?ìµÄQsVjIu)Rµöy¯ V‹IK§Â≠
Zì∑V `Qÿv◊'sÌPmC…⁄˛êÈzºØ@#}!'.=^ﬁ8‘LÏM!√yﬁ^¡∆T0ËµãV'C„™n“ùb€π'Ì©:≈lñ} Ñ∫Çƒ^íi®§èÅ Fcs◊VñMhÃ%|_ú}ﬁ‹P§+¯eŸŒpáﬁ|*äyÔ$<H;Õ˛G·∆¥)}V/ŒeÜ‹¡y˜+ñ8=Â ≤æË_÷≤%j¨Kn¥å1∫u~vÂHÔö/Vd˘4√Qäú“<õ»;1ÚDP3KÙ¥=ãr‹b˛„2uñ\QˇÖpîr∂*%¬–TòûxÙóÛ`∆6Õ∞Lòq¬ûˆ6ÕÑõrYƒ\òÑ≥ë±í˘"+c1ñ‘~ú˛n~Mí4É¡S„Míæ‡@|µ!≈òéR%7´∞õ5uÃÉöTdüí…}N+Gc4's™Î9¨π4πÆ@WË˛¯ùÖÃbªâ∏…ùo¢?â›£&ÎT8¯TùàbÖlîÌ\6 ™®ö˘ÓD¶+ a‰ŸCU…Øú=§!.û:DÈKB9∂©C˜ì6ÑÍ˘
ìÜlåüF‚êÃY¬qøAıØ≥ïT¡~óﬁt®ﬂå¢:Tœ* ≥K$∏Ó˜ÛnìÅÒÒ·iAøaSXa~3EñBiã}ñﬂúâ‘¬j†pë9¶áû¢¢x+4û˛&yJ«-ﬂÕ9,ÓÁ: nqÙ`‹Ÿ¸î°∏œ›ë°(é€´ã©¡(tfco ö	WÖ∆m]èıO2ZX7?™ÿ¶[=‹1ÕBît¥0_!~ü≤¨HÓa&s;Â”ó]ﬁˇ•ã^˙»$…ç›Ë8‚¶è’—g¿\=Å&î˘MÉº&5Fë<ó@çòÛüi*~ñ2ci3´•V—vì??í ÑãqËFH)Ú’°j¥;H$-¥vëæ¶5-â•œ⁄—ŸgDe
.í†>©xãÃÒ¨˚,N;YYX5\{lwü¢ZˆÍmÀWõÓ´ÙÍæ7ÚYÊmìS∫d†˚¬[ç∑Tz·7àD^ÄÊ·’π<íﬂKy72«Ø=^‚!]ß‘·À°7;√a¢Ω≥cb•Œô•êu∏ØÇ`ŸÕπS∂?W¿fA*ó,TeîÊ.Ë†¡ƒ%«¡®J,Ä4ófµ± Àz>Ö&⁄2Ü&tI>Àho¿ôÜ≠4Ù‚d≤$Û.∑∫ÍòîÆ£ºs!ﬂÍ„˙Œ~VoQ«4¥bç@Ò‰ŒÅM_¢ç¿b&¡®áõƒ3Ö-–¯/ó€UL%¢áÎËÁEsÌÒ{ˆÜ€è5s@“ú¬cä˝à°Õ“D>rÊx4ë©∆ÆaΩIﬂ¡ ”˛¸≤~Ìπ7Ü\∫I“Ê'ëNác~ÎÉE$Ëâ`ﬁÓ˜ëq∑íËéïÂÌ]è;7àbL‡+ƒ¢´å¨YnÍèˇÊã‘óƒ„w≥¸QNr“ÛZñg∏/gU´qÄho,§e∑BHãbjØ€ç9Ô={y‹π8=ˇétOœ{r¡DŒ]˙–ÍSè|1•ó¶≥∏œÛßÏ‰üzQÑ;Ír1qn"R{⁄ÌbÌóò¥v7I∑É<deîè˙ΩCrﬁÔ◊€≠Ê∆&ôç&√ÓéÎ ‘”Ãd:‡Ö¶f:0wìô©ŒníÅ(Ë—d‰à	§„Ñ¢≤ƒc\J^Fáe ô!4Ir±ô∂ºIX•h˜F/„bR˛¿@X%¨˙&ô˚Ì2úS§ﬁy,¢√J_Jñ¨B dgxçÔ¶πìnD3”“Gm≥dHŒd¥\Äı–1øe”aríêDûœÒ®…swÑÒ (˙Ù˛ÄNõ´vﬂA£4é
9¶ˇ-‘oœ1
;6i∆å(ÂY—l°t ÷c&‹Àì£ã>ïg«GùìÕd(ì+iŒëFî√≤å√¿ßa¨ÈﬁO6;M[v&ﬁ–¡ÕDπÃ6ÿ¿õ¡MàMsI#‘)∫ïtíË €Zmü≠ÛÇı03O¬¿¬ì1Aù8ExDﬂùÕµj≈%hÛ9a öy˛â‚≈Ñ
qÏgË˜!œ‡; Î˚—:JtKmÑL¸ó"í$‘≠=Ó?Ô‘€ª{§ﬂÎæ<Ô—S˜cn∫îJóÆcÑexÚ0»1v¡˘C∑≠xíæ8Íí—Ha?oà~ÁúÙﬁÅ®Ä«ÛπÉ9-˜∂˛“ôiwÅ	‘biˆæˆ∏Ÿÿiìo∑ﬁÇR÷Ô<¡™sÚ¨∑Ò1…∑˜.aÛùÇnN‹Dú7(O›∏hÆBÙG}í£]\è¢õW§’ÿ££™J∆“%¢‘!≥ÏäB!aæ_ÏÌ>6rì9∫îÔ¢À≤"9ª¨¥uÓñhb>≥Yæmn÷¢l⁄jÔV^"ss%.˙öß°`PHSíã¢ßÆ¬"≤#¿4êó3*TêoP°8	n™´Y∆e◊ë‚R+¶äôúºÅ&V0Å(dπU∏eq’˛>b5†‡Çg»/l±Œ›h>âøg_3£L˙§"Œ5˜6Dêyd◊§ßåúe-¢B÷&ñ£
Ó!x∫± *IPΩ(Z$õ'πaª©ª!†y	bkö
M{®Ω‰0Iíˆ˘"ö∂‡¸ñ ñÏZ’å“4˚™€=bÌŒÊ·líüC˛ì–™pì≤—[∫ÿ∏|XgIlñi˝ıøí«8jQ0ı	_<Âã—ñMñÒ˚ﬂ(,tøx/∞rwWŒ”⁄€lÌÔn∂⁄6õç&EÁë†?ÆﬂÊ≠~≈$29îò_‘–C pNuîbv§
RáVÕä’i‘@J∑Ki[qÑ=`GòÆ“ﬂr9qÙπ|¿óTTJ°râŒ2—Çæ≠§ÎTˇŒ-4«”Öz˜JíYKØörÛ‡ÂIÉL}ÇmÂLl™gÈ#ˆ∑sGx.N@Ã‘'ÅÇò‡àˆã¡<X‰.s∂Ãë‹wU$íıC"∆Tù—»˜ƒéä@ÖÊ…U&ë´ÛπñŸÈ|+µeÁ≈Iã:}“3„6ë%ïà|dÀgú“ƒßêBœ›eN$SZ›˙o]íRqπ¯§·©;‘û‹∂*XÏñeûh≈‘⁄Ìä©µ˘dQc"Í*JOfq˜∫ì6•Ò¥ÁˇÖ;˚‘~öWjÃ|%a†‡1hÁ=;¢,√œÀÑEÉ’ü©äó∑ıàL)€öuwzI7©õó9t(Ø=:¥:¬tlÁ0π2+ÕG…'º ˙Å›∞I≤7Sü–,_∏Öì9v`˚Q_Ã
gô•E«·‹G8·≤ÉŒ$}3=u:ìâG„‘“’áÆEÎ?πyGŒ–‚FŒl≈t-Ã=ü‚©ÛÓ¸)}›·%Nr´yK¶ﬂí⁄ÁÈùüiÏëüÂ‰>ôA~Åµ√{üﬁ´‰uÁï˚b¸%‰ˆN≥MÍ§Ω≥ﬂ$/ûˇPÅÇ?ìY>õáÉ1>¥≈‹∑ò‹uÁπŒÎKÔÌ:%ÛÇŸôjÕ\éòÒ—‚(ÔYö¯¥ñπ˜nÊ1„,Ù1˙0™kôu~ˇ„ ÇÃ≠™SÙ⁄îN2¸⁄DBÕZádõˆ∞;)ïªë∏È\˝…ë	è›éâª¡	W«xq¡IﬁÉw3=’“bF 2–Óı¿ØÃ∑ıìé—ÈúZKªcwvµå7Õ¢8}Nı…Vgìi£-ÂA-ñ®§)Õb‡£BÜ-wôJﬂj˜VaÅÛGöº÷F‡±åAˆÕ]„a+m€i=éÌŒ\ˇ √⁄hBiË˜;˙-DU˚∆TWüL.Xì±ßD£ÿCˇmbîÂUÊ`™Ä(VÄ ••¬cÙ¶æúi¿‹∞¨ı™aæŸƒY„™-âû@)≤–+Sîı&Åˇ÷wï¡÷Ùz≥rù/À”¥J∂Õ&Ÿ.™‘ÔL∂˙áÁÓfÿuo¨™ı‰Cì±ãK˜hŒ‹‡«(j¿©L°§#Õ±8LB‹x4Úa|ûö+£ª—hÿ0Ky¸˛S∆Ã>¢ÎÏÓ‰5∆¢~±.û?ªgw˜zÅÿ“Õ?ˆÜCÿ°Ña3RÕ9˛Ùe±E`zÿµ˙µZüå<VÕÃ’Eú±G$)_AÈ®∞3hº˛˜ õLƒ˛lµlÑSí·ªÊçè)›$HÌîíèyA”‰ R#iÛéõÑ'Ÿå[a-X°*óN˜B∆   6”o1z_%9O`1%¡òî%⁄[û?èAV=‰˘.+ÛÖÑ‘ÇLÇ—¬<õ˘ CÃã˘AgVø[ƒ∏ßë¯TŸGß0Û	êó˝VsˇÅ,È”mÊpo—Z√!Kò=GÀg≠ﬂ9O7"ƒ∂F‰îî9&-LΩ8ç´#ı4°!˛|∆ﬂ˚´π7£•Æ∫¯p:`ûYBéÉnıº¿äÅ,'ÑÂˇãøX—Ìn≤≈ˆ,ƒ2◊7®mõ‰·≠≥üê˛—≥ìﬁ·õ'ﬂΩ…Råﬁ¸∫˜›ÜΩ¥w˜ﬁ¿&y”‹π8˚Z≠¡ŒWóÓ˛˛∞≈£o°K.jòƒW_ﬂ$ÎÎ∑ÓWÌÀùóßŸnπWúñq˛4–§VºiFwXﬁﬂií†SÕKñÖÃPï√"HNäÌ;Ëä+.‡†ÏOhr¥ŸnÅêhWf(˘@ÈX÷)æ45FuZƒ9¸ÄÇ‰\N‹·#Q	2=$öEx	Q5…%ÇÄ/hN†4;¯âVi¡8ø∂©h¶fÕNÙ≤Ωà'P∆P®z¶óôp3çåV)œ⁄a˚±O!0P0é$?£!XT±·ÆÙ®`‘NÃwTN˙’¬õú¿∏_œi
b÷∏˚…l›»ç˚„‡Üv–ôºÜŒ§~„ëø&>∆«À˝-jnÚùjWnC‰+K_…Œ◊O¢ëÆeˆZéõ∫~Òûf§ñBΩÅ,ES%KtRò∑@ëº<≈XAÛ~¿X9“∫uÓ¶Â]Cº˛¯˚√|∞`¯9KH èà./`ÇMZ∞	“Cé4(ÑÔdìD¢≤6Q9¡R`ﬂÉÙÁ‚D†!.»-n\„˚pø|ñ(ƒTçˆãyì«|êŒ ≠±IÜjŒ|˙3ßÕJß¸≤Å|§PÒ¥U(Ø(´ÇögmŸ]ˆGA¿HﬂX∞ã≠T∏´,†sÎÚèD@©˙‹≠ß¶÷’ù—áü˘ì9òW«x8(4Â=ìöﬂüˆN◊à∂‚≠hºLÍB}≥∏õ`¿HlUG≥·≤VÅ>¬aÒzÊ\‘£ @¥Êf≠?¡“íá¡çop\È$≈Oœ”†©ˇÅä}EGDŒ_∂Õß-  Æ‹acπ~ÍM‹†g3Íèï≥‡·x◊¶ Uö,%ö@y¬a)uóa&Úpkº{ÊºÂ™0füﬁªÿıád`â·	·s”‘Ñ˘Hld®vR;.»aÈù÷bƒ˘.R∑Ò&qiªÕ≠kíÙ2ÜπÉ∆pvºuI ·¡»∆ ¯ê
Ï-E5Fq.gÜC“h@c±ô©RoÀÍ ≈OïC?R„]Öºmjì¥åÍ+~2ïTo≥iB§·!O•b0πhjÅ¿U∞ëw÷ÄÒc„)Ph∫p4Ëm∫É#˚®‚òö]),Ä}∞Ë7ö7lñîsÄ˘ŒuBRÎVÒ∆òèx~Á'∞G⁄?Ôëü˜àYbè¥ÈëW§œıı≥⁄ªüŒ∆»Ÿ?%ˆ”|Mb	R∞t/‰ûˇy;»?Klá]∂@ÕJ≤ÉèTá9ùÆÓ∞çWÁ´≠‹æ‘Hp+˜˙æØ}!∑l`‰ù¸JWÉ“‹Pk¢Âÿ≤˝¬:—8ı€Oæ2‘•ÿk·)Ë'AM/áµ∑p„-"Öx˘é	ûqº∞°Ù—´—âÔ\Œ
ÅÖ…Ø“™VâÙ≠	±ÆÙ„0Ei(∂Çk¯†T◊J“‡÷yÊ∆$çƒ"Cûîã·ù∏ÑAÕ#f(ﬂ‘íVò¡.m$IÏUÅÁPËï–ße≠,rT∏20èWﬁªªäπ≥§›Ÿ?PÚD#ˇy}ÏÕ√`Ê:>yÈ£¶ﬂ|\ú≈TŸ7˜≤€´ÎÜ^6€{ï;…`~›<Ú˝‡ökŸ˝ÅGÒ˙P€Ó¡≤SoÄ -∞—x¸í„;C«‹mƒjÔo∑öï˚L·Ñ]~·˘∏+∏b=ÑèÏ\]¡nåhﬂdQ˚∆ô9˛Üπ€àEHi¢’™‹qXdË˘´`2˜c'ƒR?É	≠50ä*dcπrC∫÷ù∆S´“y•ÈµÏ‰˘û1Ñ.èÈñ#!±Ì{Â¡$„ç(üêÏπ£°¿`ä{º¡:I˛úºp‚q„ja≠’¶œ	aµ|¯KÚ ~ﬁ–tÄΩ2zOò≠∂¿ç˘≤(∞óÅ⁄ê"ï?!¢¥$œ$å5xâÅœ]‡ë™˜%ÓÃƒ›#øKÃ≠§Ô†„®m¿é˙ß˝#`·[x\[øXﬂ¯æ˘ZﬁR>Oh+õò•ÌΩ]Xàˆ¸gØô¸ókâ72R∞∏‡`Pè‹¡¨Ωª˜∂u–‹¡uÈÑ°≥h\Ö@ÔôõoÁvì05D†öπ|Ÿ⁄√.Ò˛¿óç∆oœ«˙~Úﬁ·
Dzñ?í$:ê¸&QóFLÉï ¡WíòLv∑E”Ÿì^øpﬁ—_‰Oî2¥ ˘Ÿ™^ß∏¸M«Œ•å≈HwtÊ\ì6û:‹§WÀN8¨YSÀﬂøﬁÿ‰ù|-ïø•}d≈£rú@_g2e ∆€ŸoK÷8¶˛Fò˙⁄˙ã–uJ¶‰ÂnÍ·Ÿ±(yiôe¢gS‡ãñÚT¬;[E5Œ ™„éeë§ï:”¢9óê7M°ƒg÷&õDÙ˘¡ $ä≥ıÑ*}…|a„ÀóJ\¶Ù°‡”ÇC_œ'Œà\óÍ∏&ü¨F]éUT,Éòg3üK%D1T∆\5YI5ÈÂOµäßHûÈéeåû'‰|`}RˇuÔª˙É≠v≥˛óVd…z[ù$˘qˆ9ì#Õ⁄ˇ©íc>î ±¿–™5X≠fì∏Ò†±°'OMΩŒ%pu:Jû,PèŒ¸ºJÕﬂîF–|âHXú5e-π¨skè—@U{ŸÔ§hö—ÜæeÈU›û›õ∫=RK≠Uôù™ÍÎ–‹d˜BZ=©∆åIÀÔ≈ëÂL¢YáôS»í{0ÕLpU_ä÷ª∑RªmŒ≤√M>Ü7´Àx~z|(Iò±§#XÂ”´Ôb‡C+<&è]ÁQıˇ-z0BÆ>r}ÃïsÀ5';´îilÀq>–Ù~ö'ËÁpD"îﬂ´Ï£Œ≈“lYRqm˙Ìùâ“ß†äÜ¶ûˇh≠•ºÍº{¥÷ﬁµ"¿ƒPùS+Vã¥¯S!∆üÄ8'‡®î·G?¨í!Gµ¢T∏±:ë¢Îsfí˜¢ı*~6⁄|hY{®òVnr¨ÄEÚ RÛ—ˇ˚ Ì"Ù8èZ&‘7|gp4vﬁRÄLvojC˙üQóÜ¸‚(îök‹8‚Ò÷…SPyÜ¡ç?	úaDº8ÇA±zd3ÜÜ1√B\&IDÇHå8ŒU€ÑsÙ{F, 9)Í	ıBcËc”kbi®M^^S_H≥jIˆ•™¨[¶FU´!{/e◊u˚…“ﬁk ¢>¢i1Zq∏V,ä#oõrñ%kVπ:{>Ôdƒ

˚@`¥ ı_’ip<Pˆ§RmgMÖ;Å∂ãˆz2çÎ{∂ı¿ñ*µ¢¨∂µœÍ¨0ú	•˙5Ó
Oﬂ‘˜Å6ˆuâÿF¢-dé(«s`íÅƒ°Æ¶ßé”a‘¨⁄eë®@ïáû3ÚòÜA§+Ïb[ç¥cŒK…‹Áuâá»U·ÿIÜ	Ë,ñ√Å9˜}')∂ó®mQıx/ı9.‰É¥@@pùÕßêîüê¥∏:øƒˆ¶§Üº∂ßtd0?¬:`\ëLÊ´Zˇçe¢„íCDãCrX-‰A°7·—&Àá´V∞YÁl¢‡6ÓU$7ôO˝É§Cp“_y#û§»…Sïa¬¿é)§ÖõîOËiD/Ôà'©ÛIß:¡ó˚fz—–0†—XÚ¬îgé!∑ç/CjdÉ≠_m˝e]/û≈âgBW~tèÂ≤‚Ky≤"ﬂë-Åí	Úù+H#Ü$˘Aa¿,á≠}*Ièœ;•ËÛ›˙áXÊm?©Ú÷ﬁŸ›lÌÓo∂ZõÕF´ºﬁù√…Ÿmñ}ÎÍ4‚4œD˜]Jº.Ï˙è¯Ø˛3¸˚œ‰eü∫0x4up∏9(¸√{ÔÂü ±√†&vÈ«@Ïˇ;<ÈΩ$µnèú˜ITé¡ƒ%€ü≈w;ÇÉ˛ô‚•≈ˇ¸˚øÒrR£N¿Û~ˇÛ°ˆoŒ˛©˝3µK?jˇ?·ﬂˇó0ˇo]–¿ﬂI{yj◊Y4–'*eG≠#ò6ï›ñÚÜè÷¬π_œ®™é¶-¥l’/cÕÉÈNdI®LÌÊvîzQñ⁄É:üB9Ì˙≥[)±t$»˙“J >ûY¥KQàæƒfZ‹¶ø(œ£àÿ7√˙Îr-WÛ“ ﬂ'o≥s“9˛Ó/èNûë˛YØ{q˛ÚÈvéèûúw.éNOƒ ?˛·ﬂˇ9ü˚rÎö0ÆÍÿ®!Ààç%Èù‘gπ:–Rªf—pö£
vÏÁÇBA&ã*è±¥9;˝∂wNéè^]ê˛∑Ωﬁôu°ú«¬¸úÖ¡(t£Ëˆó+*%$Ÿä„z+øskÔVUaúÓˆå‚U%Œ€3≈ã	cÇ3ìU~ÛÈl¸Ü‹ﬁ>∂≠Àº‘eÖ b2~*loÁà&ïﬂæ3•é:Z‘Â¬ßò-ciìú«Âc9ó;∞S(9_ÿ*+^Öj>&9}≤≤ﬂ©*Á ?¿ñ˛këı–ãÕÃñ]yZlf©ï^|/äct‘…˛ 3æ»(ÿÏË¨ÉïπR¨ï¨Ó§N&⁄Dó.Ó$Ä†ÍµE)˜6@¥¨åÙL]g—“2üÑÊv›”"]“:üÙ%∆hüœ&%`…1z¢ñûΩÏT—Œ†ÎÖ3ﬁı”ô¡ÁN8E‘∆YÌ˙•ÁQQih©2®•7‹¿ê«Ÿ∞KAb±-*ﬁœß±A‹ïc#9=}y|¸›õWΩÛ£ßGΩC≠L∞RdF}ÑØ”‘NjÔù;ùqDµ«LV	ïßwÒl]Ú+¢3®há™CY5¡ˆ§§2G´ ùˇ¸ÔY© jŒZìÃpËNúw⁄ÌÙ∞sÉâ9ö‹ö‹õˇ
öG$•≈Kå#wµÄ=L`?	»Ωå4¥ƒôΩxë∏Ôº(éÑj‹4Œjòâ0LM¬†&/âò	©ÍÕ‹AŒßb‡m{Äão®Ì¶[8©x©Ü3˛®Û…ÉÓ†|·\∞_@óÇrôózﬂ≥(∏ôô«(ﬁÂzYA4‚º*¡]`Æâ,Wé–aÅEWyÑ‰X%TH©`ÃÏïËò√sl§˘á„ÌÚY2-ƒÀäÚà,óBkËúâ´LæúÃ]-ÏYË];^vuB]hâá'ráb2vMJ”„Ì
Å(åù¿‚—ﬁÂL¨©÷í\IıíÅ–êòó|–	;„2Â††19E:˛„ﬁ≥Œ1yr¸≤wv~trAÆ[çÈµA(•ümÄ¢
¸‘∞‘¿Ã÷‘´µFí#ªŒ˚¡ıifö%´$ïáﬁ»ã·ˇ0¸–Ûc4/¶ë°	u£ëÿß&1üÛà÷™õ¡†Ä]l—bFÂäh	|™Ê˘É…ú˛âfåMP8öèmM—∞hD‘ô0¸2•âZ‡çsÌ÷Hs óå60xß(G√ÿ¥À·r◊:f	¢Îqì<;<;OêÌãwÌvœ:‰ø¸'“˙Í¡~£’nnB˜Éko»
Ô• aôÖn¬∂ÃeÑ¡ï¿—6·â@Zä"å›∫∫⁄ƒâ≥–«dû%HΩí/◊^$¨Ì3æår|<-S\Ó‡QãÀ  C†ÚPs`‰b´Ï¬.¶X¿Ddàú UÉ˙¸ã’¿$Ö”X.Ü¡É≈ï(Ô%É Ù ﬁTGû¶sú‹_nH2 ,t}ñD√Á ¥9"¶\ﬂ4çc»V–èY€Í¥7IBáŒ¡»`úÆ¿í‰s=t•"7>,v®OiÎ- æ+>¨(mR-˝xˇ˙Ü°÷«Ω¬]Ø≠2·Ö(öz«˙G6ı!?~∂ÀÿZ≥Ápï± Eπ%ûﬂœZ≠*¥Ö]¥‘ôÒHŸÎ“:“Tä∆B“ËzŸÔ†ìg©6∫=⁄DÔÂ“-`Dm£ª|/^¡H~˜;È5Ã¶ÌsF]Y8Z√K+°+P_”î"˘ËŸU© kìZ•Q|ÛY€∞ﬂÌí∂Uªò óZ∂ﬂ"ƒ:˜£ÄE≠çi„X%DS·î)«‘÷
·ÉxÎ.Òr¶∑	óNæ⁄JKB¥•åç‹í´I$∞É[RW◊!˜ößHù}ZZA∆≈-ÒËΩdãºÙ'òŒ3Ã†ñíÉ“êÛØ…Ω◊G[îOO∂ıÖCHiö“[ı¥F”˚<∏ƒÙ"¬åÄLº;∫tTˆ1'•≤è5Dìæô¢h#û§zkYŒ™¸@∂Ã_eüœãœ‚Gge4€§?ı.ÿƒ˚tØ$l·ƒ>r ’#:±èÂVxbüOèru† ¯Yñr*TUÈ÷ÊË›'áÊkJû‚jXhq€vë,uòwR¨y˜)íüûqj≥ˇï¥i
Ë¸®dÜ–’Œ &µﬁ‘Ò&[gcò#=ê Ωê}˚í4Gü˝©›ÁCS¢· NÁcÁF∆Y°-´h§XäjJñéjhvüYÎ÷/˚;µÛïA√PTß©Ω†®QO√Ÿâ«§3u}ı∫–ãﬁKªN™2$πW[©Ñ¥[’ﬂﬁµúÇbÓKΩ›j¬ªœéŒzáùÍØ˝ÊÃÓµBBÃ∂HÁÏÏàúÖAÏRr6√ÔïG]A'Áu¯NgöIÍMÌDn`ÚÛ}iÊâ≈¡ßXÔ°O~$ı¶àœ+fugÛpDÀ…c¬Û?38n<Ùﬁ¿V;JÔëßËÏﬂß…4.†?Ãñ ß≥∏~:è+Ô6[º7m°˚
õ≤‰x‚#‰Ö{#1^·UÄˆæ+w
W˘Õ`8o≠˚C$∞‰¯ôFîÙ—ï –x∞<NÌÖÁa¥ı<ò∫fxŒ;1ÑO ««Õñá†.–£àØPÜÛid¶	Ωƒ.8°Î®ıí‡&zÙ~[ΩôÀfT0˜iÙ»œç¿–+0¨¿C∞éÈävñ+g‡MÄ“\t˙á /MÎ*10è{\WtaÜò{5»QLÜ<‡1ÒºT≤Äëò#¨S¡–í∫–~√Va¿âc3|G^¥4s⁄¯
D˚#´ ^|`| êmŒ°M∆a!ÅWÌWÕ/Áa0¿RáΩ.-T®S§¨T‘lnh\sä#i@J-ÁjO≠“/'%üdQ≥ÙD˙À^≥ô'Y˙a>≈¯N	àI"/÷xg	Qjë≤5ı⁄5aÆ…Ïí”$dKúw»∂¥≠NΩ≠*è<VeÁ»0◊X∏JáJ‰‰â#Íî5Y®HÆc£Pk˘∏D¶Çi6G>Y*U√h[U∆q9Ö_±	ØúId…≠EÅ4Wwπê¸U"‰‰√”‡Ù–ÅÁd%òs	à’E◊ˇ›Cz‡ùƒ^^ÅJ)>ÈíŒ´àOüŒöü±HD¨õEŸÌ2m	òYJN1#hÊ¬ÏDúÅ∑™¢õóPe˙c€’ 2ŸáO#ı*DÉYGÌEp	,ö<y®r¸≥´Ôe›o<8ùo4>∑∂‘Çã°’˘U\Í4™⁄}˝ÅY~n⁄.3ÃŸ"}Õ?;|zF°º†8ÁíCôπ@vµ=Ô`mòx#Z1≠òaúÓ! !7NO‹DD¡Î|ÌvÚ96òS≈¶ê\.=î“¶ı&ˇã∑ë|ù’U	S8Ï§z-œ€¿3ÎP‘Ñ‰≤‡·\Ãp1óf Öiï'F1É√}%bTE‘™E]Óù6π¡àgÉXîyµögﬂÚ|ö¬û®Ã\ L´|≥Í∆≠Rœ`ª¬§∞ÌÃs%.A'~+ÎaLÛÁƒhJEauäÇ∆k=ni∆bÉ¡∫ßHäóÜxsŸE;åÓÈã≥„£Œ	µß?;Í_úGKÈäÍ7’µn±™tø◊}yﬁÉá‡?wΩΩªß≠Ë’‡æ∑$›TÑk)ÒÌåØ…4-6õ‘xQùË3hY¯:ô~&≥qSne÷≥åZñoi$o≈÷kinÈeRµäË˙Cã¥[I“mß∂2ÈvØòt´=ƒIRk…´ŒÒë:¡vÈ‹Dm–Ùì F;Í∫V÷i)w"5sú¢ÿ◊aM+∑af;a¯ÍE—°á}ä6vÖÔ¡˝Å^äÄ'¡m©ÀmxW4_x≤ Œ⁄Íú87â]èÚMñ‚ª≤ ÑÑOÍb4Vîºíı«c'¶ÈE‘∏∏)dE}˘e¬,π=aö,÷ÚÀ/qhÏ–kœá¶‡ákoÄ	òãr~Q≤≤3µ∞∫¬q¶(* P⁄M¶oıÍ§’Ê9«ó‰ı)éQ°¯H%±l∂~íπY|ÑaØ+D-˚&π¡ΩÙÓAÉñOÃÎ†·+,óÕÆ€Ç.|Ù%¢NRX {¥Ë;≠ë¶MBT°	rá∆:ØÁ}˛∞—;¿ﬂΩÅ£DÁ≤iS<∞Òº/ˇNMvys˙¨2›ù⁄∆ll[¬ã7›≠ÒnXæŒΩÍ[y_;ıÆiﬂq/ªo‘SL@%ø≥WWBCÖƒWL˝g!©n%t≈"<p,ªµ÷ºEå Y	u—pét €
$¥”ƒ	L^ë¡^≠8‚™J˜ÙÛ˘®É+`–ÖiµÔDp6»ä´(ã≤=@™Ú¸∑¿ÖTbôZ0KuÏXrÇ«πi UpÂõË≥Á§˝§0Ç:ÖÅ3ÑÁ)0a2T¢ üEV
¶Aj`≈¥3c⁄·ÚÏ'$!˘ï∆ƒıGÒò<&MCó£h√:µJ\.ªJ¶Ó6)“ã¡rﬂ⁄’iI¢Ûe«“2 ˆ“Ê>	õñÒÇàTH˛≤Å2RæLs&dq˙èYŒ¡ëdômmef<¿{¬´RÀ2UË§Å—j,ewÄ⁄ _Ù	|’î}7
<°iU^^jèπ∞ö&ª	µöŒ]J†ú)}èÃÇU¨HádÖÜ?o∞Ü G—¬åCô2‰ À∆%<¬f»Q ù¯∆CÛ∆∏1ª°±:ÒÅË8ÌLô&Ai£˙x¨»Ü	Uf?Fä3•S¬A!ÕÈ£·•è@UﬁV≤L¨ôu\Ä
˝•^l|-rM”¥XmØ%Ÿ©q
S~[y*yŒNÂì'ıgΩìﬁ˘Q∑~—y∂äÈ+r~„8\%—Æ¨r¬˙—aΩÛÚ‚T‹£ÌŸX¡ËJg÷
HƒÇ˚~é«òYMC@Ü^v†!tÇQÁ˙ö°9Tx
ı®Ø)~C˛!§"·˝Jﬁ[y™òµ]˜çYû|æöOÆ>≤≈cë	§5∆œπù#aÒBJÉ^+“ü≤¢yVi≈Mg+âW¢x2±EÔ1»ºÜÆjï"s∂lÒ'ãd˘·ƒ{ cd¨ÊπP`ë—.E%rò™…,¡πÆaœ}∂;‡^°±Œ<…Qˇú¶Å∏râï|I-ö∆ò(–nÏêgœÿ»¬/›IpC‡‹«êﬂ˛ãÇÏ∆„–ç0÷8j–ﬁÒ⁄∫Qƒk ≤e*ı∆àêQ„DÛ2Î5ÛipZ'pˇÜÛâmí‘`»m<£9–∆Ãrán˛û ìZNT~∫8z)qk€nppˆ8 ÁÓ¬ %o Ù+oB1‰ûx¡‘≈ôN<#¬zø§3bar˚Zbq´•oO|.0•}ÑPBÇ¡E¯~¯)ÊGD pÍ0À¶âÈrˆ^4¬	/Ω¸-ñIÑø@3¶‘±ìç◊l@ª‚ﬁQv=*§a|À¿õ¡˙Øﬂnfh!rFü8HÁC=WI(:æ,Ä±l¨s_ ÆÀtûØp„G<≈#-&çA#ù#Ò\FUI†;z2;˙ßò«}i:µ†,%‚—ˆÈ6Eo£t2ucÛ]gH±ìŒ≤˝q…uªANúÉMzÒòé∫ü"û0ÿEéQœ$S∆0ÙˇÀ/ON/æ¸í∏˛»!Ã2ñYpÎò» f¸÷ôN9ŸqüaÇHõœ"`ésœ˜TÅí{ùÈ•á_CÿÊ∏«G∞˘} ÊBŒÅ3¸≠C˛Cûπ_Ä°ï¡""c X<éÌ∏IX2 íâÄÕà0‰fc<¸P„Ñù–‹˜ô
ë?˛ıå»5Ê‰‘Èz∆X°˙À¿ü,æ§ãÙh√ Ë…~Àuè‹å1>ÔrAÀ‰¬ÆOX˚¿ô—ñF%Î®0å±Bﬂa8s»kà¶∆;êí"ÎB_HÖ—†$ÿI.É¥ﬁÒ‘`‘¥˝%y5EVN±òä;"\k$æ~B Ù_üìW†U•¬ü>°™sª≈º€{¯xæ@•h¥]∫DÚw˘Î·mi˛’æsXhCÎ§	§ê‰d1E.öÀ@F›p1ãÉ˘1VJ∑jn®€Sôu¿á`‚…∂∞Ω2ûª≠ÜYä,$·w@FÉ`Ë‚1xçÉY–ÀÁö YZ=H#EÚ±%p¿b<}òˆ¶rä°Û"Ã1º‘D7I<pm:˜°Èº»w„õ |Q¥XÑÍú¿AHdÒ'"Ù8Z?°‘_«ÛÃ“|±°ÑÉL:†‡mÆe÷~)dÔÃäFπ—Ωö“Ñ∏1˚àÅ≥#%–ª£.ÖF Œo•aèB]ñü…≤“‰p∑a7ë√`•ùJf¡{∑ø|ÔàÊ∑BÍÑEq∑Ÿ⁄"Ô}˜Ü¬#µçFıO1Ã◊¡∑7Æ≠_¨o|ﬂ|mÂÕ∞1˝|0¢:Áª9$=Ñepwô„$XﬁÉX&'MB°¯˘ÒÔ˛Ω'XOê——ƒc˜>â®XCJDŸÚ‹â∆™ﬁﬁ›{R‡õWˆ€√÷‡Å„¨Ñ\Ï
è©›…¥ ˇ<ˇNå.N‰Ä÷”H˙Cø∫ÆÀH¥sC?åÆs⁄ MΩΩèQß˚%DíO îøQyW∂W˚⁄soûÔ≠5Iì¥w·=>ƒ√âç{¥7ê√A»`É6;y¥ˆgOÈgMÊ
ÚÄ …—⁄xÛ¯´Î÷Û÷ıÓÛÊ´Ê”içw·KÎUã}Ÿæﬁ~ﬁ~’Ü/{ı6‹˚’∏◊∆ı=·Óq}W∏}\ﬂÜ˚°È÷>ﬁˇºy]ˇJh¯∫æ+¥|]ﬂÜo˚–tÎZÖ´º!Òk=˜µùø
KÆ{∏ù∏ôøYµæ_ﬂ∂ÔH·*Ùk'wSÛµæóüÇ‚›˘´ıÌbOrw7›6ıÛA˛≤f:S:£ÈÀM-ùóπÈÆõ¬⁄eº\&}Ks<ÿ◊o(&∑Lﬁ^hG¢„ó:N®æ¶∫"ˇ]ˆkC∞»T%ïh˙01NË‰b‘7W±‰Àj™,QdLWÂ@Æ·›-Ω‘PÂEYŸK]0Aß®Ø∏òBô
íıVR†Ω∞I˚ŸaµÌ0íL–†6πvá•Ü@`â9≠ÊdÏAg¬¡ÿcÒª y√Ù√ÏQ{(/g¢éñ0%J.Yã]›õRÜ&óºªyû$ÛbNáı‘î&‰=˝ÎóG)©∂NÈ˜˜1_Ì~ÏŒ®ô\ßN'ô©%#+É¬vπ‹éídÃ…[?∏¡?BNL÷uá⁄€9ßöÕb9±"˝]9St*T›—0!P‚◊‰¬yÎ2ÛÉ'lóàs»ˇ  ˇˇÏΩ[s#Iv&¯æø¬ìS*Ç]í…¨LNíµLYI5ì§fe∑“hÃ $B	 – ô,6ÕÊA3/ª;2©¥ª≤VØı¥^fM´á}Z”ºÃ√Ó?©?†˛	{Œq˜∏˙-@2´˙…™ô@D∏á_éüÀwæC¶jü˝b|ãáÁ}√^˝˛ÖOÃ∆dR–/?˘	ÍÛh
XLŸn¯…O‘Æ˝“/≤ü(Xî“x#G¸í§V #ÏjZ‘˙d 'ŒZj—˝Ó7ﬂ˝äΩ≈¥úHÇB¡‰G∂™´œg9$å÷˚AÛ;Ñ%òÙ[i¯X‹$œá¡6Ωn6≈4ïB◊åèXÌœg}ŒıqxÈGlPˆ˘≈Y∂!òG†¿bÉÈ€ó|!ΩEå›D˙§¿‹zg.√ï‰`O◊3/√Ñ•óT~}Ù…œb±¬E¿¬ﬁj.∂˙e8 ©Q§MÏ*LLÜÖ=Â˛¢îÎÉ],ÿ‰¥ç<<”PFô2ﬂ>)5œIF¯’VÕ;Ú⁄ùq|√]ªπuª^2êI&ßõ^˙~øBm<ÍÎª‹/ÖOÍKO∑0q@¡)∂û„ê‘#)øÄÉ¶°Ï™nÌº/ÇqVï£YOïuvï;˙∂∑ÿ*år_>ﬂbkö„Òcˆ3êÙ¯ˆﬂÄ}Æ∏§fZÅº‡ù^Ú›‰Ûb∂≈ﬁÈ"1⁄’Ù7ŸÍ≤~qâ√jì-$ö˝Œ¶h1ÖØ˝*=˙Ù¸ÖË-<Á »πöÏÅd‡ëD‘◊D∏îK…k,:
zio 38cJºîBw±√Àπ!e*Q;ﬁ9»C∏u}Ò:5Ï'ë…p‹`?«„Tú›<≈s1â;êì¨ãÊ¡ï≈–)ò.:Åy¨≤¡Z<"qÕ∫◊X>èº˛ŸG>ï‡<ìöJaL|∆WÜ¡·4ÇÒ¶vi.aŒ>n≤ïe⁄Q8é®ã$ùÂq∂lËïoxÂ]s°L'Q∆àa¨`˙&r‚∆¬2‚V°?hìë¸YfÁB∂@É{„ˇ±A7cì≈Afﬂ¬h∆≤·)ÍBr÷ñA´©ãÆ<`OÛ˚>nŸÄáz&rY•ß*ëÛ≈Ë|¸÷è¬˙4¬/xKfbÿ≠~xì±[M∆Ó \xüâ,WñD
‚S/•„ó∞XDÈ¯ÜÈ}r£'~yƒNí˜
dT
¬•‰dø4ÆÀôπCåÛ≈óÈ|nƒ”Ò§c9€[ßkÊW[nÁ`‰~úéå7æ¶~Âˆ@˜öouQñ1π–˝*KÓ-¡<¨^QÀ¯Ê±Ñå¬>‹©öÃåàÒ8.¢ûﬁy‘+i=‰áH;Bß∫CV7®fQ‹¨&ä_lfìŸÁ¨#Ìî?¯ì}Ô ]Gí-”ÎÖ3™ØÃkÄ‚X«CíCéƒTzNß`¬éÖù}âÚ'Å{¿s¢pƒr$±∂sC)›#áoóÿ^S”≈‡Åƒh◊Ôyà_¶Ò,‚ub.¸±#¡^x1”˚y∞¯ê§ °Ä[eo3¥W™H2ê7*ù%∆ëõìÈ.‹dÓhVÇ8ë.}ˇ<Û’üH/n åº¯A¡PÈÀä°b1÷¨ô1ó¨MñEfœÉ·T+†‡H¡öw'Öîõª–i∞˘»j/Æá*¬£çÅ9Xﬁ≈òP∫9€á’ËÕ¨2-8‚(òó€|§ıq·Í‚»ëLÜ√ÒS
èµj¬£µ…ä∂\
jlGMKn≤c'ÁöMÅ(@±Í9¶∞7&®FÌÅÎ]DﬁàìD?MK8⁄à[§•áàA˙Ih1Å-t{ô˙‰R«3Ö$=ºIﬂëz")ù•*QΩ»GòÔbÃ;˙@ÇÖ∫,∫≥òL“è´ë\Ó$âŒoRm‹W˘K–ìIÙP3I»<rÜ8w`;-C¬!ıàF9Ï@øé∏wãæE—/œqbƒÊì 8Mxj√K°ñ^9¯ŒzÿŒ—Œ`0&Ä-}’	HΩ
∆Ë7CÒ:ÙÆ1‡:ÖéAœ?¯˛DJ^>∆0¶ ˙Ú0›∑◊‹
 ÖﬁU∑íÊSƒdÿ=ü≈M%‘4q`H!'◊2ü	—≥t›ÒC∞Õ ˜ÕU0;xL¶ãÿC˛G¨]Ks"£∞ú<⁄HQ8úO‘(ø?˝˜Í»:7?±◊ˇ∆fŒÊ≠≥UµøA‹"çﬁ-çÒ˙zjzU¯˝ùqúo_∏Vﬁ…6A_◊ˇ»áÛz¨/o®sVWÄ⁄#M%N9kñúÜ≈Ñ\ÿæI∆C
ˇπ)líZ›€…·ëã ‹¢,]ª3EMŸÎØQe¸≥Èk ?nMlIêR
⁄!Éöπì6-û€ˇ∞öñãÑŒ å‹≈ıΩµÖÁ,ÊèÊ˙∫ÚA«†h{Cø_~ñìFuö‘?Û√å?Çb›È∏3Ω)∫≈‘ëÇLà†@@¸,ı"CªyßˇÇΩ4µ8{uÍLèi<•ò∑◊N˛ä^Qôêò˚vΩêâHËÎ”7ÈÈë_|≤¸F>ˇmì[fä/Ü&Y
üûÁJ£U|˘ó,Ãu{Oı[?-?6ä^˘!Ê±èl LWb_˘È1zØ˙[7Èê€€pé4§EÌj"πaçFˇµÃr'‡¶îÏ÷T@ŸHG¿GH5»·!Ü¢›Úì
ﬁõ˜YöÄ4Åëõ˙Á”<MÒ»Ô`Ûe¢ü›»≈z˚ﬁ÷∞qÑÃ¡ŸgÕT·πG——îb˘YXh!Î9áë8ê|≥≠ Ç5¢`¸°ûEs—Ôß7–}”x¬)kO6ÿr°Yä≤ä±q'F°iÔbù)Uú@ÃT—Úc\Ú∑ˆ§ÌÔE U˚#ò0cë~4¬SoLßª-y©∞ Û{0ìf!≈,	F:˜˙˛ﬁ8Eπ¬~4fIY"ûÇÖXHr
5û¸ª-}ï]ñ	u=´ãÁû¨ñGW=®MkÊ˝≠"ØÜEh∏ÿÌ‹wwŸÔ˝YbwÑCÇΩ ˆÊΩl.‡}ˇ¸œ,„É‡®∞ØgA›ïõ∂¸4{ˆ@Ÿ<H∆Ìƒëg◊≠ï«‹öì~QE_®|ÓWÏßTK≠5ªˆWhñ Î.?◊>Áy|Æõ_0ú"iÕrÖU1`Oã&ãÜ7±YäåàvõÍ6H>n•π_<d‘ö—∞Ó¡ò‡ìÒM¨{øºp;≥◊~À^ÓÏÏ≥ˆ7;˚ovNˆÿ˜ˇÈÔh¥v¬:≠ˆ¡ŒÒﬁ!}k€∫ˆ£Ùéå" {TÎ‰v©V¶ˆ“1Y=~Ãé˝x6ú∆î*QäÅ÷p‚M•ı¢ÕnCÈ•Z=•âX]‚7ÒÖ˚≠M~Î ∑Æï[ΩWY¶Ïõ_|»U}ı	Ëª%å6M€Mp≥’„—Gæ°®wM#ë5jW|JÂ^˘˛Wˇ€ø˝Îﬂ–∆¯›oæ˚µa/∏00W≠Ga°KRjÙÊ‰ßL–˘Hÿ«¢¿âÄú9∏	pÚ4Û≤P/†‰≤3äì‚ËØ4%;∞|«”LuP∂”«0Ë‘7J-H]?Í≤nV≤Ui$2SﬂbSºÕ-{/#}ß±‘•ÓÉ”;gfzÎWàó+~Bıurn:›y∂ëKØ–@Æ◊À9‹©µûœ±¢ãÁh¶b©‹∆îw˚ªﬂ¸ÁÔÿO˝kôu‡}=Që	ƒkX¡‘Ö…6Ê[JíÖcÃ!êµ,˘GìS†1ûue£S%$Â‘∞Èrä"ñY¸Ô ã038n∞É0Ê,ô£ü>Ω~ÃA@≤\Åç˘±~;2nù"#3/ô∆∑9ò#Ö5‰ÄHêfHP@4ëP¿à&·z.PÄ$ê )¯Àh~µwìDC"^ùyØ›l$ëá≈{ÄÃ8á!FXﬂ%%ô‰—…ÀÑ÷˜8O:;≈‹ °E6≈@H´3øãu{[MWÛ£íÈQT–W,yUês·w”∆®÷Á´¶=·˙à±¢≠iVVÅ,'“◊¢¿õ˘±OË=#|?6›˚~ÙÁR˛^˘©œèBr2~…Á¢€ÎƒÎn¶ÏÁG^@ò¿º√ÎÜÀ∏îSpM¯UãeÔ÷Û¥YÜT`∞∂nnXg»…M∂´Fz¨r?¨‚
m¨Ã√}uÁ°,ÖV1üQóA£œgT%⁄S!gu¬bûı0Wd#©˛ô›∫˙VmÓ˘–ë¶aàhMÇcT÷Â3¶®êÔˇ˙üÿã˝v≤ZZú(EıÜ6EÎ®CˆﬁZ1{/-¥•¶%≈PöWø.º ßy`ùÎqO˘r∆,Ω“◊ x∫Fùìﬁ]ÛƒÓÒ-Ü∏/¡'ÁXÜƒVe‰Z†£SrÏ{Q˜:?•ı^¢⁄'L;„∞èƒrr¢¡bÒ∫†y8ÍÙln‡›ﬁ 1z√e8r{T=fÌ÷ng'´√Dà+«NÀÑQQ• úfƒÏ∆u¬ÏdòÙ§∫Eå€SŒ=YN∞SúÒÍìùË∞f›:ºãaTz'iBõ–òù<˘®ıÎuà†'%Ê:h¥–©∫‡™wßJm¬¶m8i0êbra(@¿◊E´ãö≥±]˚8€‹`'∞"jãX	uÀ≥6∏∏Ã6‘JäRc»E?>Ê\y∏IrË◊û©i©ãö»$˚∆ÇZºµÊ‡˛ä-‰èŒÙ‘=a3yΩ»ƒCCπË'‡:QﬁóÆz†*¿™≥±o+ÛäO0Ê‚Í–
xΩæSi°˜Ô‚Ørlr¢I?ƒJÁ^øG2å≥≠qñ˘Ω~ZŒ$J
¥¥A"N1G9S—DÄ∑È(\”=ı› i#Ëk˙©V‚±˜àŸ‹/í*+¬◊iË’ë∏£¶«„.Ï&Ü;*5ArÜa⁄â˛∆c8)È(·g£úë‘`ù¬ò†Exç®œ.[:]ˇ¥¬P¸àEVv	[≈V&ÊZÊ≥¯ë
Ø¥:ºWÀÆ˘x90)q2 ∫ﬂt)∆l◊ã›‘gßQ*gã2ıπ™ìº:®tÀ•H™rüQ≠‰fè”?<_†∑CY∏y$ûÚbËã≤ N›#Ã¶7‚‰K{}/"bzÅoÇxF¢¿µ®∑;˚ˆ'Áy]≥{^±‰∑∂∞˜(◊ıwÕç=±ÇÚK|Ô#X°¬r"ntQoËÎy˜ãØû§cΩuS˘9!Ò^‘),&‹ìkµÓõ˜`+"¸'_~Wmú≠:tÁ≥õ ÜeòL>´‹&jÓE#D£∫Z√–¸«•ìM{'ÕûÛRÎM¥ßõÎN≠Ø›±ue‡$Ø+$´€_øs˚˝◊
äËçÇälòodqÈ•n.€|odÖï¥t¶W√t˜+ﬂü0ˇ¸Ò:∫˝\PÃ∫Û;ƒÄˇè‘8yòTÛYüÜp|S∫gÓøºtU¿§Öπ_sKI%A@ôΩí3è7åE€gú∏¶s-^DœûfBÀîfÍ7NÑ∑ı’ï\ ûRZuz<ûÚ,N~TƒXÀq›)ªíΩ¡¿J\/“€h4¨QQáBJµî7Ωèµç)M‹wì…˘Bœó◊øƒ.q¶÷¥¶@‹`?≈µù!_`Thõs2Pé⁄0å}k‘®$∫‡`I√ò´@⁄pnıIG~·$∂I…åK⁄"Œ‘bb_Ÿdw7qv¬‚_˘≥E;¯)„˜ΩˇÏ¶·Hhr∑ˆﬁ˛ê‘“¿ÁÙì˝∑“h⁄n6 Zª§≠ÄáHNYI2˜ñiëR0«Xœwâ=.Ø˚Õ\4Ôìnw‹T«î›L¬ª∞µ®bEˇ·vπáÍÄybÉ'i⁄1ùN‹êÓQƒï{Éë§F.#WpóJï≈HÆ˛¡øÓ<8}l€ºÇ»kÚÒhì˛∆™ %3y≠¢ö‰E∑Tåf4§‚T®≈∂ÁÁ¬õR˙Ç8í* #'Î¬®)cõ>îä,Pi(5çò™Ï¢/)u¡ÎÉÿÖ€t‘ö∆◊ôKõ¨§J?1ô)∏EØt…Bp_OTŒ‡·◊“14s«ıdc≥Âu+)]1‚Ø‘B‹–-"ï¡≤nK∞Æ≠øÙ&⁄UuÌQùXs¶vM?8ˆÏ≠ﬂeÈ⁄Ωóef£Ä^ÒioGàd{ëúÇº-±Ωz»TÄ—ç¶ lì≥EÍ_»,~Ø2^õ˛¥Ü%Úö•Ní–!\Õ°èé°ra˚˚_˝ó˚◊ø…L¡ŒîW	<ÀèîµÚÉÇÎTU–ÜfµRÂÂ¸"I|vËæ∞œ´ìì£/˝DeI8°R¬Tä,i{Á,ö%Æ>èAÀ˝nàa‚‡<Ç˛.3
K$`¨√	Ê∫èŸÅÖ8èãìxA5>Ñ
/É¨ÇI∆6D∂L´÷hL’“*søòÖ.X„y‹ ﬁÆ(x•qôˆì+ßiÆÚ<lΩGé∂ºs¨ØXThbMõ&UoVëØ∆ ûŸô°¶xZ
7‚Âoc≥
\≈ƒ(E5˜ÇaoŸŒ•1sÿ¬]k…N4¶ TÍ>Éﬂ•ﬂ¥&RÇµ†E˙∑j/æÅI∏Ë≈/Vÿ»jÊ∑Cπp≈ (ìèüÆdUÜlc=∞⁄Ùsa˜UwV„àœ=…BôÃU&°(·‰s2∆ÍCŒπ≥Üö	9+@ß±-–˘V%D*ÒaÛ	Ú,Ÿ‹iÔQIuÏΩ[ﬁØ≥∏Êû%]©”≥'∫ÆÄ5]Ω·™µ‘y⁄ÙÎù’ßûéºﬁ¸+`ﬁºS’√–SøJ·‘íØÌ3ŸŸ(é8Ê¿†hr.ßóï„5Ye–≈ïœ?«ùŒ^:>ÿ‰-Îø±Záñ2∂Ùf˜µ$Ìz˜'»E%ÔïƒÎu8º¡óá@5oΩd·°Üû7Úî•t!≥ç9å¿úø>a?–" 
Œùq)ÿ PŸOd)†à%∫/O˜Û“<Iò⁄üS^´vò~28¿<$ãﬂXè¥*;ÿ'S•ÔÆc("À¥`õE1ùu›$¬ŒI„≤æÔ‚3b÷–√ùŒ‹QNCPçıgåqÿªeZÇbPÑ∫X^k|”∂ÉqkµÜë;T#∑_ûñl’ˆy∂R"àäQBk]3àAi“†$q±kÚ”Ë#¢	ú‡}db√ãe§á¥©âÅ¸M9U‚≥xF#˜Ü3P≈jãÔ:Ì÷õ„ˆÈ‚*π”Ö4Ö¸ƒôq–gx¯úEëótQÊ™3£jÍf7ö„æ.x™çg¿±˘Ò†uU8ûp Ú´∏øπŒŸ˛ß—[Úî Qı>Ï‹©ƒb\”Èä¿%é,6_∞’€«_R⁄))V˝„˝∫lR·"ßÎ1#åÎ5Ã”Ÿ#È#ù«u¢¬≈ ƒ¶eÜYL+˙h´2ÎâÓ2‹d≠k˛å◊5O≥ï6™ïËPà*%ièÜªGÂ*(ítôúÂÇGÕ˝Q©7%/O¢Pö˙i‹Ñﬂˇ˙ª˘V˜º~à*Áo™EÎãå	≠4›º†8Xˆbµˆ£9ÕNUæúΩ‡ª¡9Ù™˛ Gp¥O<ÙYSÍèÃíEÜ¢.ÇH(j∞ì47ÎÅ$5≈â¯7ò∆HÂ<;ë7Gi¢–‘ª@x/Jé¬”ëD¢ﬁ7Éy\‡Ú‰>œ”å$…4Î˙p¥¢Á‹!C¯¨÷,sè°•πÀÑª¿—Êı:∆£ÕÙüMÓë≥ÏG„z09Åë®ù%ÖåªƒªÑ¸Ÿ•sú¸<>ˇ˘cj–ÿ•`<ôôÈ»∏)é˝2[ìóúØ[tT¯}Æ3⁄ãÖÉÌNkåwÓ¢…&Ÿ'‘¸à√⁄†&,F¸dRd c‰G[H[¿^Ñ›ÓıbÃ^¿∆ÛÅùxÊWQ÷é /∂Xl {â4ií)"'Q'R0ıfÒf8õb∫=ÁP‰_)ìl7c∑E4¨å¬O?&√∆Å†„Z›|I∑‡∂ã0∫≈fêù¿∫tY·<ç®Í“≈ßﬂmÈ‚
Kó»$∆◊ñ¸{π˙,éA~àÅ^àG†ﬁúÅ‘_–zƒçÚw¨É“l◊‰Ó}º3ApÌpÈ˘c˛–J-ÉıuvvçÌ˛˝ﬂ'ÀÀ∞Àj?`≠˘ZC˝ÂßπΩa/f1Lh÷GÚX‰¥ÍÁjÌ*å>òG˜ˇƒ∆‡ˆßXnláﬂÕæˆ˚Å7W≥¯?	4∂˚wˇôΩ¬‘≥ohCù˝òJoπ¥	mÁªâ±ú÷9⁄Ñ„Ωévö≠∏˝√	∏]ˇ‹õAƒ˘c41;ºP—?úà$Swìr‚!
A'~Ÿ˜/a≥˛±KºëwÙŒ"¬∆˝ÒœÕ^„≈DÑÖW;æ7¢:KG¡GX~{c¨*?ü<‚%ÃŒêD»ºGˇ+˚⁄õ≈q Ü¢Y°·˘îÌ˙ìÈ zGHsJD|$435ˇ∑ˇùΩc∆‡à_é®µ®~RÈd¢pæ÷a¯ˇ*06˝øfmºàäBΩkV{9É|BFÑwÓÙˆ]–M?úu=”Ëˇ/ˇà¨¥‚à·Í˙/b!V{íÿ_G^ﬂwÍá≥–4˛X≈_œÉ¿ñöF	ï&¨'ﬁkN»‰»πDçU¸À˚SJ•≤I™≤ÀπPüñ{5ç˚e£}R»4Î-"<3Lπ- ˆ ÛÉû“°/ç’Ï9rÁ©)∏∫í˘±‘w0xæ÷Tshõ+{Ê¶à‘Œ7©,É«π%v¢Q&Ûâ©π'€Uìa…è:>@Ò»˛%.¡>{D#B¨ù‡‡ı¸ ΩS-oty¶˚úΩÑ)∞∑¡∑Xo÷-bÈG}¶'¶ö?–ô≈YWo∂&3-î:[wDo™õÒ˚àO’`åTj'íVf2ﬂ4´æ>⁄oÅ.™\™ZDë’Ö*˚È«iZŒ4Û=TÊc*—6√)$ëx	KŒùﬂ¢◊ÎÕ`§ÆıﬁJÉØrﬁ‹ÿÛ+G¨=ã9)B–GFÑ
YØv¨Ï‹p2„†Ôâäû<ã™îÖ˚±Æ≠?¶"ÿ“ëPfÂïúD8QπM¨‘J≥•hA5≠~2Î;aπÓŒIöd	≤X/]•sMﬁÉá—l,˜
M±„!(l$	NzêìOQÎ^EÕ‚|‹1ÿ8†√÷EÙ|ß_9%Â3…g√[bºï∞ÖÙÃe	vÏ◊iB‚@’‘U˚\$,Ã∑’ÀŸÜÍIé’ˇ‹jÔî)˘d°mzwû”!∂ÏÃµÀüNbáP∫Û¢µã—NShÔ´W°é éT¥J:∂!‹ºûdZyìd:3/‰ñ–§Ÿ“•Åxo‡òc ¨Â'2JÊ8	\NsΩ…)I∞«œVò[–Xæd≤≥å}ÿNÚR*ËŒÇ<ßXlÿ^¿F¥{«2z|£õ-Ø|fπÛ–¯$óåW©Œ_∫¥÷ π|À=†è‹Ïúo®ôﬂ»ûÛ$IÙ#Ô\,[ISπ√.=~µ∞¬$_"{¢•0+πQﬂŒéÍ”å“]Edleﬁ∏ﬁC_Z)] eö PÉÉ7πÛ‚◊Õıï&{˝Í€€j‚(Ä·$z”Ó5´Ø6G∆Ùª˘qÎ¨zô›`5Æ‹ª˙™R]pµP¡¡Eeq¨Á#©ŒóWÂÓÍß:ˆ1$L=2ˇ‹MÔræ^ÔV¡¿1‡œÏçüõ⁄#ç%˚Â/µƒôéJ…œΩ ŸüV$ r•ÈrâU+Æì˙xûıÖA≤}ˇ´ﬂV_êÛ!‡ÓÉZea˚ îÈXFVZ„/qD+˚dt|*iÈ≥á`ÃDô∆Sw@Ü†Ω“~˜%Øc◊õ¬î]3,Í/£óÅçfò:DX(ƒ£ÉM◊1’Ì ƒABΩBîÔOÍ_ !ÿ$O‰‘Îﬁ∑ì«~à∏!⁄hGâÑZÜ|*›+Ëó√◊!.;3>¶Ò(–'Û†Ä6—Û‰	˘0«MnÈÖ'U†Ï„Û˙ç†ü+@ô%^2I‡w+ßjV]ﬁ"	Î¯S¬£o±È«£ÃÒª|_±^2∂µ»ã/™¨¸´¿â˝˜lö-∂⁄l<UﬂOÂ”˘‹ç`K„÷‹b\	‘ﬂ˘#∏˙›∫&∆Œ-∂ææQ°èDÆú4H¿J\‘≥+Áﬁ©πﬁ–¥«îoÙf+∫æ^±F_b÷Bâ≥§-Æx¡ßöízô:ÁÂWBÇf◊wZo4´ºpXk
à*Ωí<¨ K≠Í^JmFÚïÃa»Ø|o8¡ŸÑ¸x[ÖÕ÷]ñøoo±gò?˚Ï)l]Î•_“•pÈSÕ“Â=Pˆ	“≥•Ï∂ªÅU€⁄?kµ˜˜€'X¶MsÂS∫ÚÎ√√]™Â∂€˛˙xg∑Ωk¶}¸Õ^´Õé€≠√◊Ø€•nÌd;÷
ápHY:VY˙óÁ™°û“WQ˚¢⁄Ω≤gsVRTk©Í{J‡Î·E|Ω —◊¶	”0πèÖ›:†ˇl
“Y-å"êŸ
÷Ø©4ñ>EM˝–·I∂Ó†⁄™ü2WΩùucΩùBÉ¶‘@3~-SÃ.ì≈ø⁄ô£ßvÃ,◊,"âÌπ,…?ÀÌ«ó ∞ä£ûÁvæÊ?ñ˝Sßy˘	˙[7Ô©çuËbùê¡D¡Ø˛HÊº…Òñ*9˙ÚSπn¥¸Ë 6.;‘Yñüª¶–t-©›0â¸K|1}áÚÁ˝ªN{ø›:9ÕqÍ>ë≈É‡| Ω_ìdsmrÇ	ŒÜÚ^_ıAŸ‘…Œ…õŒ)˚ãõŸp∆X§MxÚ3ÆrbCô˝–òÜoP ¥@ ‘ñ™µO«±qæCWf¢¸±“ª Oû∫É«JíÇüì¥»5äÑMöè•h K®>%ùúî:æZ+[â5$SJ∏‡¯NÌ3]!
’á≥é(à˝≥l¬Ö2‚$[0˙3,*u¬UDπ0°‡ßBì≤,ù∏_‘èñÁ‘ä•HlÈ9∫Çº•ä±—låyv¬£ÚnUîKHwø+é≠ÒK_é©GtGY˛”\8˚L~£L\òéÙ›øyüÈø™Ñqñµ)Uÿ…åÔ⁄X»FÂé¨Ä≠hÆH™R∫≥êZx·Ó‰∫¶≤"å˙ca(~näÔÿ:<8Ä3©ΩKΩ››Î§_∏ [ÊH,î^]a%ÃâUP´π£i
Ë+ßà£>ôZKA˙ÁL=ıªﬂ¸˝ˇƒ«?oÃ⁄	ˆ6S%˝‰gõÃpñ?ÿLπ±Ûè√ëk•prß©2]Ú)M6õÖx◊ÉÁﬁæf5DŒ«˛2âﬂ“≤rffõ€y2ƒÊãscıÔ)≤•†råIñà¡8unÅZÉ&-„}tÑπ0›9pôYΩk	⁄€¡íu±n¿ﬁ€‰ÓŒeFâa/í ˚ÙUø;Ç/–]“1Zd∑.*∫x¶0g”«~ˇ´ﬂb2`Ú‘ïÍœ$f∂£ﬂ˝ñ≤ˇíg~ÒT<‘˙ÃSn–É]R—†‚÷,ä∏£±VÕuæDJ;4	?¸hÃ¸È«:g`‰ÛûU4Ú≈M?R#ˇ$?Aµ*zÿòÖ˘≠b°*÷¬¶ò{ë∑ÌÆ|›∑?‚…ßıG¥vˆ˜^ÔúÏú¶ËÿÒ;~ôÅÈÄl]¸Ï¶0jdï,VtJÏº>⁄ﬂ;y≥€>e; •«3.πáò: Faü£Å@ÃÛ%¢„ñ’¯ﬂ$Z
 ÃRUü»œ;'Ì◊ßÏÑ2XŸ0'I:æ˜Q8¶
õ¨˙ÂàÚóÙ0¬q‹èøœÓê"sê“˚ëÀw —ıÓA}uΩäâïàËáåîK]ﬁ∑ƒ‚	Q˚O~0ˇàï0U˙êPÓ±™&Ç∫ôßF˛¡l£∏…´4˘{ih8™¿:ü-N"WS/"Ô~∆Wå»¡ò}Nı4Í'¡»OjÅrA:Î©ÖwTˇî*∞Ôª[Dw§#µGÕÓÓ˝s˙edF—„¶"u$—∆œ>∫u‡ÙŒêËöM¶<¬]^»ywV±@3Öî∏4pz?Z˘S\˘*F†<√ØºK_déıs∏1–-∆¡4D∞—=æØ£wdﬁ 9πé	:œ72ﬂ˙‘“õÁÛNH†Ò”iÌ¥èŸI{ø˝∫}r¸sˆ≤›ﬁuÃ
‹‰w3÷WŸ®_âÔM˜\ßRw·´µ:@w“ôÉãØ√∑¢Ï£}SÈT7ı∆¡Øˆ˛+‚ŒÆ›õÍ9rñ~≈ﬁÏüÔ‘_Ót!¥pxt≤˜zg¡Mq´ FùV9]©?ª0I»ÇS\+ÆÀ„b`ÍI≈z·ÈQXXi¢à<›í≠“œM£Iå´m∑Jf∆˚œnjô9ˇÇ’^{”Al£~8™-±ü∞uVgÕ•%∞B_˝~muÈñç‚˜ï¨M+q0ÆÌ"¿e^A[èa¡≠¨`õ0ﬁwh—’FºùˇYcCqŒgº ¢‚&ò›]§gL©Xk«''K’å ˜¿Ñ™§[Dö∂U‚Ÿr]ãÌlˇyÄJ«¶=Eua{•Ò¶RºtÂêÿ∂§hF®ßS{∞†˛¨zkŒóŒ/≥@Òx¬!È»˙ß9F≥F“Ä¡©ùëu>Ë{≈#1©Ü]≠≤Æó•r‚–„w(_Ω(©^õÜg¥≤ñˇ› ˘ÍóMÔluÚq9S'ˇΩ¥¨∏´ÇI;2ﬁF«‡ª8¯÷ﬂƒ{∆ó≠H ™7W‘e«ùT6êõ;Q‰]7∞ÍyÌÜÒ4°M÷\Ûòª„œñYP……+—ıp
o±Dƒ’êx99∑ëä9˙ü5∏`•Ò•´LBiq‘SúÒúß¿Wº£∞X¬®F]ˇ	¬åø`≈É†πb/∂#?õäáÆ„CõÓæﬁ9É„≈©Èë˜±∂∫≤,˛≥ ¢`9?fKŒ]ë±åÓIä¬pS¯§π¶ó?ï‚'¯¡›X·òÂ	‹Ó¯Ö"f,k	Q÷ï!◊æƒÑÂÜÆ“çEWËzZk¯› Ÿ ŸS
—E◊´m4óõ´´À´kÀ+ç'KßãU€Ÿ,π\´ R‹]ô¸ìPI*R≤ÜùÍ∫ßGqÁ‰ƒè›;»?e“y\p…é0wˇ|*À^‹£OÚÂYˆÛï~@Ob\«®lM8^ˆ'#¯F·sJΩow±Å%‰≠ÿõ‘x¬çí$ëT@ÇΩjÔÏüº⁄d7ô‰òè[p◊4ùãM™ñ(ñM≠b˘xÉj.ó®ê
πÀw∑|]¢"ŸÕﬂ	[L–˜a†aEz≥›]≈ãü¢Gπl{ÎSï)û´Û	Eﬁë)ÛΩ¶ ïßÆäûS©»äëñƒ6PàÀÁ¸¢=!‘Iq_íˆUƒüR•…yÊîC»2ﬂƒ(tˇáuu{ıèOTæb<níBú9Q¡õù˜‘a≤vi.iÒA§ƒ'p[‰|^⁄âJòê¥E<~≤b„P6ıD•U[~€«2ÌóÌÁ>~µy'NZ)À»V»1æe"◊∏Ü≈>ïÛ√Ÿâ?ÇMà(Tˇ·Ül^ˇ˜Wl°˘¨—dˇÔˇ›¢ÄEÛÀ∆˙«C¯Öÿ…8Åìi‰OQ˘F‡/#˘\ƒ≈t˚äñj‚È^.såù:¢UÉ˛÷B4◊	™:°X,∫zwÍÄ≠Ü5Ì1ÈoÂ∑}	œOç˝È^∂ë⁄4ö˘Næ∆îÏä57Áû
ác/:ÎÇëø∏Ãû∫=»Ωás¿E)õÙ¯‰îùD¡≈Ö/9[∆INΩå˙Ê∞J¢$∑	>⁄h∏¢)›qîà†t∏)Jzåàs∆∂òÜÊ"ˇÓO‘ˆ.…√ä+F¸À»6SzP¶Ì/∂òéd£¯).≥Ãc‹ﬁõ´‰ﬁ}∑+zMÊÑøwt|¯¢ÕV1$Ê¥7˚l≠YÔ^O9®göHÚ_`Ó2Û«ó˛0ú¯Óã%◊˙ÃNŸNÔ√8º)rÅ^±^1Ì9ç≈fÉ¨£∏¡:¡EgâPHisËëº ì	ÍOVn˚/FU:YÏäŒ∞ÕÁy„ìœsÛTí0£‘êåêCNi!ˇä‹öOë˘f∫…:oZ≠vßs*\§l$Ë=ê±îˆ⁄˚Hƒ)‰Ωﬂd+çß8”',/Á˙&[olå*Aº?˘>˝ÑSà$mˆo⁄«??e/}ÿ´8â)AA≤#ré≈@•	Ã¥√é€ù7˚'òé π≠nÿ´áØYBŸºlp˚Ç¡≤¡ãJÊGÚEÉ¥˘M÷|⁄X-˘Gª∂Òº®∞‡5Ω(9•‰·ÂÚ+)EÁÙ ˘vßƒóßU∫sßE›:|}¥ﬂ>iÁi8b©Æ¿	O≈Ÿ˚,Œ‘Ü3#»3÷“)aaˇ—ø^Æ∫]fM'⁄á∞õí=7,◊(¿ñTË7%x!üZÅ8r≤¥‡´»„π˝◊ıf&$õ©UPµBASKj´'—¥ÉC∆g—*w	|?w4%è˝s<ΩZW∂Ç	1XiŒÄŸ◊”SF„Ø›L2JËÌü-·zv2gÌ≠´âuœ™T€˛˛Wø≠bü;ßÄ¢óoèsIt_olœ@qIyq±ÔÔ3y√ÓÆ¨ûº°xŒù˙Ó±Õ2ô•ìù:ìDÚÑsJÄsÆ/˙OË\Êî!úfnŒìÍ©∫
Yy~æ;u8Ë∂îóA Ù0>êì´)Éãù«yÉ@›Õ"§€µºå¸∏l¯ŒÉïí\~\–ÊÀU ô›L—êPVï6©≤÷B©≤F6˜¢p8Ï¬
úÇZÔB\0ÀFÚào≥«√,πS÷‰p≠«ë&U]éõ˜≤,>?V°¸Ån4ÆÏ≈µErq-{o˛©/.∫c˛æbãÍö4RTÄdmªìÊl´zÀ)ÊÊË+Ò?ó;Z°üãywπ€≠‚á&!èzÂ(¬3È›fl#∆¥Ü∏y≤<|ÃïÏL—q	"oô›Ä‹öE–„&Hﬂã`
»(œIù˘*ˆ¡ËgæB8ÿiµê÷ÅqE÷8∆ñÏsÎ¨CYF4S˜Zÿìi˝È¬∂ï¨Â)òFR]Úhüìá3ØèœÉãYD	â±`j Ü√p2√6r‹Ô∏å]«ˆGë≥;w˝ïÈuªTSñù–◊‰,\Æª4_Ì≥åOº.[]›doÉó;Ü5~1ÑŒàO%>ûaH6üP,x•ƒ\}∂∞¢4–'(ÇQ¯'æ÷+8`ÓçœCEÙΩP9mQãïµ]ÂëÎXñT0)ﬁ?ëıblt©é°Ø—Ò&<of¢ëπ°µ*Mï0Mõg∞¶.àî’3y=åÖÌÚ2ÊUsì•¸¸Ò`M€íc)ÃÖÌv<ı∫√ àóùŒﬁ.(ª$¯H®y¢A¯ΩBâÏ£≤ò!»Õp6e]I¿ì©Gıæë˘ˆ⁄’  öb¢æloÑŸ-ëïvàµ?(æ¬˝Û⁄£b|ù´`⁄8ñÊ’÷Ã≠jV~ƒ*‚◊-#P◊û=_ÃΩ∑ßw·˙©ãÉ-ﬁ‘Ω˛¥2Ç.à(`Î^≤íÎ”‚bËÎÓ(ÿyœÅ7æ‘JçFÉ<˜zø%ˆÄéÇˆò˚Ïò®<T¸AÛ=Ä>´¬'πZ¡ì£Í¥Æ@∞∞´˙3`C|®Ø=w˘Tuæ∫Rv«4{Jaí&˘MXá>,úz0¶˝IdÃõuS®LÊÑz$ å5ã9vôßz’Xó8°_∏ µ›Àˇîì√‰`s%kScçj,"Q(Rpπ+2N¿E1Uœµ◊´—$”è"=ö∆Ïc}ù1˚ç¡¿–'†h*ΩM_•tòZgDÒ⁄	F®Û‚0µ∏®¨¢§R+™U>ø7>ïüJı‹Ò*≈Ã<ˆ€¬[Àà‘1¯a§/zÂJTπ∞çû_~™ßíôE§.wØYLÁ'ôA_¢<XÃ;Ä˛´‘èäöŸìÏ∆«Wæ· ◊ıïŒsæßDÎ®µu‚†Ø/¯ÊñSòçr*Ôî
uÚ£`ŸU8ˆ¥ºπ&Ÿ7çâseŒtM√MÕê™≈å^1–ÊÛÕAnSπûÆ¸ „û∏„|ÚMöFX™™ pV€Ó˜«C2ù`	T¥.Í;™Ã∂Ë…s"aÀù©¶,ë÷ı¡çl E@Ft-‰HG˚˘cj“Õú‘h¸Ü’Bc§=©-7ñ"Zî7—{ˆ/Ω·TµàCRWqyK*O‰Òﬁ≠øGÍ—†W˚VÄ«RŸÛS¢öl–¶ê;a,Ú=≤cO?=~úÒ ç±RFO„ˇ¬Ú≈òWÄÍÎ√≤ÛÜ†Ö?2˜}©†‘9°l˛±["¸SòÔM>‘∆õl$≠™°∑#\nó9Eã˛~¢∞°@ÓT≤òë CXÃÕ	ë
Ö&yÒKñˇJAù˘$À∆¶@gTØÔ¯y∫ëìõˆÍ¬¬vΩépO°¸py_Ø?Ã/s~N∂Sw÷˚ü}=-Ïü≥∞˝˝?¸ØLı´ëÛD›9,n÷Ñì• Mæ˙ã≥VMBD¯úu|X>R˘ˇÕ?1≈/¨ñ|√œœa€Uok›g__èŒ^˚ò»áç˝›?≥¬∑Ú’^”1IÛ·¨Î–‘M¡÷˙™qAà◊"‹ èﬁ-™Üqqô-*ﬁø.ÙjÒ4DEçˆÁí†AıÿÌìAa>ºÈ´•∏ß„#oa@æ˚XÊV„ˇ‡Ù•√∞§uJÄíAßOuw¶+œ}0€”ûó$.—zH-Z ≥!ö¡.E„" 8=Ω·E”Á>L¸íà|X 8BlÖ”U5X«lyhî†+¡ÎöWQÜ\*K?+r ¶)—¢,≈IÄJZÅ!ºÌBîæ‹≥ïBO≠@5SIEÊãúÒz"I+ l^¶ ‘(…sVÍÌs…hAá$…vé@0«ˇL15∞´∆`shjíVØøm™û§™ù°´®¥∞-ãH™z÷∆nAπ©›hqÂérêòé≤pLÜƒq¯2|#[ìÁÙehLK$ΩÇ”†ôgqLí¨ÆÑfÆnà·hﬂ$
.Ωﬁı>ÚÕÁπ‰ë?¬¢®-û·¡∆L5µÁ^•?ÿºbZMR˚∑Úºﬁº◊ÿïàÃßq‚‰È‡ZÇø,!Çé¿aŒ œﬁiùÏ}”¶'æ|i∞ˆ~ˇ&Í%®‹ '”˙·Ï!fÍú»ÑK°)hÈ~ßÃ–»ŒÒkQjÏÅ¶ŒÑ⁄–§´H+u©˙∂a=Ø¯QË‰„>◊»πÕKÕ+ü˚˘Ápç,Á∂d„YI"≥	Œﬂˇ˙ªåî«‘9&ƒõÄJâ)ŸÄ∑∫cÉ$ô†HßÕu®Å^CQƒô4€$ﬁéã>ı8à)DoÔóÊs-¿©ÖmÈ‘ÃËÌâFﬂ¿v‹G5y‰çg∞ﬂ˚∞]¯¿⁄Rs,UET^ÌÙ/Ωq∆V∞<wzº÷üBXπ;Ó9Ñu‡É)~-‚WXCòm·ç‰ÿﬂG$≈öçıØﬂ>ﬁh<Öˇa]TÃ—-ÿGoMlÃ˚q%«|Ip,∞	âÜñ‚ÀZòä~y`vêÑcÇ?w·∞	´Ó ÷E}0;X±5uü§-œ´°ë°ΩÂNŸ¸<´˘Æâ∑âk¶$∏ìªt±¬Ir∆]bgoèv÷2e€Ë∑¨ª~À™ÃpIåµ”≥Óp…⁄nıç¶πV\“ˆ°˜·*˚gHÄ…Lô∆≈èT6˘ #˘/√±_Ó√»ªzgë?
/Ωa“ã'_:ˆ‚U8í>¨˛ŸŒœ2]¿_X$›tÊE◊ÂÜ«º;ºΩµßÜt;S¬ûv9⁄úŒÍπHªò=˛‘ƒ÷‰éÕÌÃd?√Ò≥®msıNmçC;S)øñ˙¶,BÒ#πt&◊
§¢%Å∞ƒRZÃ#LÆ,©:ÍjHZ$Y6ı–îr(À@*^Z#≠Uæ‰†]√Ù=–€ïÉä™t÷≠C5Òªi‹;˙«»ØŸNaLﬁ¶«—∫ßê¸M©±Î¡3:e\€ï∆UB¥^◊üVp¶%ê›,é›<õ∏âcpÄˇ±fôÍ†π eÍ“ÓUÄ∑O†;O,EcŒ>=a≠t_*‡u≈^Øsù.iìD‘Ëâ>‰oAﬂã£ÆÇœ2›Û˘¡€Nv©</|Éªv/•B˝Rôò¢‘;»[¸±òƒîq ÇFA~“£˝˝]F|=û|§Éè†KÏµÔ≈3CoÖ©Ï=üw˘û‡√h≈e›√û¶≈AhÍõ∏tÿïsÙîﬂ“Ï 5ew§ﬁÒ∏∂í≈,gOá˘Pˇ‚xÆ2∫äw∑å	]:Ø7+í?uZÌ≠∆ûU¶y¶√Ü>€çˇˇ˝Ô∂ÙHì_c‹⁄@;Òh≥XäYO+}£Zæ§˚Sã‚ç§Q¥µà˙ím±rùΩ˙Ü,–<dœA_›XR=+ao5<…Å>?Õóƒ&yò¥j‡≠hñØYÇmÈI+¥∂¢ëüjNk&« _hH•~ˇ…ÁÛ§ô´≥nu¥Å0 ≥q¡ìé46¶H∞õÃ–v˙ßs¬π⁄úÈ“≥ºÜõ†È©¨ÆX}Ë÷ΩkÛuW™∆VmÙ'¢<]ã>Qèy–ü}ˇ˛âÌ˙Áﬁl8•t]Iú5ó%sƒÂbCÂh–ΩçàÀ%N,Uh *S!¬9q‡_I?sMÆK⁄òÙN¢ïØ%ìTÈﬁ#>µ‚Ã∏=DqƒΩ?ä¸˙y0ƒ‘÷F?ÒgÈé{ƒhàÿB+Úqãfr!ínÅ¡[ÑWç˜ù∏ØjﬂVû2Í$y~ÖB]‚§îqV# úÚÎµƒL~¶≥í’f±∆…k^§∂≠ıÓãSˆö$e¸(
a.Õ∏?ûÀf‘;JÓ…Øã2(Ö¶L¡„*.Ys:¿“V8®uñ§tÃ•Q ÉP⁄ l,L˜	üDˇ °£¡‡pÒNS6?qÛÛ=âh'lë	7”W”p¬D%∑å√Ï zk4ÜR?5.õ™˛È“$õ"$}¢ãBdÏ%¶O˝0±ë{Bò'ÕÖm|k⁄èea©éOXÉ9f›ﬁ»◊Íå˙àÕ=CÌ9
ÖlpPj“ØÖ_2√ÏÉÒd¶C…ÛÉ{bÕ≈ì¨Nœ“]Jzr]˙—÷Çﬂ∏h∞◊◊g´z&˙´ªU 1«©^†;úJê˘Ç:ë«≈;§àfËÂ,Y.Jò¥®17HZ=BJwóècY∞Ìl¶9#•Ìì¨Uj¢ÚbEnwæ\âÒ·3/B∆Q∑5k,tdX¥\ì˝”™e?ûUãY¥»ù  ãdòó≠1)øNÑı1«JëvK~≠0/fGY+ÊdÌh}|˘îÜL–ò“˛+˚⁄õ¡Q
›¯é’:·˘Ã˜…tÄ4®ÄXQ¸Ö&r1al‰üˇﬂ±vÎ€ΩéÇè∞˜∆hVmfÇ˜zSJ˘€ˇŒ^á±MÒoâìÍN¿w«˛4
´>∫ˇW>˚~Õ⁄¯7;çLIV{9≥«îC˘0ès± ùu=òáÔˇÂY'Ç∫ıø¨ø@
<⁄SÒ òT|.õÖ~ˇ˝wÏ ◊Tå{cûÛsâ—Ø√æ-∆î|·.ê‘1Ÿ'‹”9ÖÀJGlR††‡˝Â•vµ#e:.ÂÅ	6SÔC7¸®7ëÈ
≤ïÄb+$.¶b*π;T¢Ó9ÕA≥3∂JN\Âº	IRG"üöF›„óä4∏ƒ˜*Ù"ñHq–F˙yí¸¡¨óópLsÓ\&Ω˝èh≈‡KÉ GR{ê`îÌ¥lT?ôÄòVª8W!	Àùk +zAw7∞ÍÌ^ø_'›=®z∫ZGo3ƒe¨…®	X_˚óødè≤
ª¯~IƒΩt>9ûz7¢ÈÌŒ·ã ßÃñ¡ÎM∏0z±≈\}r=ûåc… ù◊ﬂ!@fä”ﬂì«üÂïS˝]â”+·l*û˙{5–˝‰©–?C‚—71ﬁ•Û—ﬁÍ¶—8ª≥I‘àæ≈ﬁ5çZ?èÀÁ›È“≤\	ß∫ÜÓók3◊7≠€X[£ß‡!Y‘ÉÙäf©”•“.…8ÓKX∂|Pà;4∑\„~x’Ëã"@m$¶™!uk§\8‚ˇ^ô¨º∏ò7Ù#ÑåﬁËô˙˛‘`Ø.a<Óä7Ù“Iö;}8£M0“nÿøﬁdÔ0rDÎKD råÄ–èÛ`\™!!I7ê(dôgPj∆,>JêŸ¯ë8h.GÇY∆Ü-d‡∆“çÃÌ“º∏œ
B‹∫¡â≤§◊%]	ö≈Êòâxª¢_ºPOBOâ∞ÆT?‘:˙»…'\ WUÍ •ÚKE4Ç¬}–[¬˜ ij®^[¥(!sµÑ˛πêE<ÕÍo≠4)H5±.á‚Œò¬ÖÌÕ±$Är∑bä¯A©S)Áf1“#†nï:ˆ˘Á≈¥öOüSfQ‚yráÂ¢^˙JÀô®ó÷TíIVY"€œ§É]É•R-V´O˝*éSû€BßGàöÅ±»ç«”eÙaÆ_Bm°;n≠ 0[•Ú<≈Ü·B–˙oﬁß*ˇg…MZÜEz„,∑gæzHB6Ío“ﬂQxÖ%Ö˛≤⁄BÙ_p„µ¨@⁄âQı’§bsSu|<Yë\òÔVŒVŒV7&œ¢ãÆW[}≤º˙tcyµ˘ly•±ÚdÈ‘JˆüeµƒÇ»∫/·éßF∂}”d—ï—ÿÍ˚“9øäºI˙∞‰âJ‡ùí!Y>G‡ñI‰g©[ï3ÛÂ J1ÑëRÌ•D
‘±Ïk–üÂÁõ¬∫7@¶≠Ø/Kµî,ΩNµÆ–¿¥#aŒ∏…SâdÜÆ"_°Ò59#ÀfÒ”ú—∏€á‹i≤-ï¿Ñ∆•≤(Ï&6ı.ä§ˇäF+nÔèìù‡w’A?7&Í@IÃΩ&¨â‹ﬂˇá3%#éÒÙzh¡ó6ãeT“e.7¸=¡MÁímüf∏≤¥Â·*RUÕ¢Ëªr!¶Xƒ˙'§î #[`	q€;p‰áÿ†áÈ;◊jqÆaàÊúÏ†é“ﬂºnñ@Õ[&í¯–à£_íSXeÈıŒyV¡.—YÆ‹ÿ°á:úÖQ#kÃ ˙S£Âå¯QJ^¬na›D÷;@Øù9GÒ„ ;äü≤Ø◊zìç{¥¿˚ÊΩ⁄5¢…DZöª¡Ñ>[rN•TÏ Mr-z€4òÛí~ÈT-g3%–òåˇ@ü¡ñä4€‹ç\;d˝&?ö0T“Ÿºç¸>IJ˘M'b˘·æÅ	?©ã–*àv}$¯Cí@Ç¨T!í0èR	Û«,DôßºÀ<W‡*ŸkQ˚|ünh}o9/Cr√⁄ÜaS—UÎ˘$?€ö¢Ù∑±NqÔñ!Ú¸$Ú‚A3oﬂ≠ce´˝vπ"∆üuë˚îûŒ^˘ÂˇêˇÆR∏Ê&{Ñ»ﬁÙ–;> M(Ëy¢‹[øãﬂçë•”kK9∏Æ|‘è≤&‹U¿—Ö®ÍaJΩæ“’U+.Òä∆£‘+
€Ω¢ü∂í\*Aƒ)õÏ˝å¸±jÃœ_Ç]ËG`èß?∂örÈ¶Hñ˛7òZz?•‰hıa˛“,&íòäsDÕb'ª.ñ$qìYŒ”˙ˇöı¢Î…y¿&Ék™§QA'6ıF^7éñyÆÊ\?˛d5‰Ã€KŒ‘í„ñb4≈M‰lÀ}˙Jsìâ1Ç≤ˇPµÊÈ]GAµRsdbº∏:ó4¿uHEµdT?∆<œ—d "é¡„”y≈z|‰CK„.¡èò¡"¬m{ÏˇbDd	~8∫dÒhËSv≠(Ê±dÿD<ìrë·øÁa‰3}]≤ËTBÃâPFπÁæ7ùE~√⁄#ÈÇaˇÃ&¡è1~®ïè—«k⁄r∆ƒ7ﬁÏâ‚ƒ›&ºÉ˙¶ùlA’Ïf¶É˙ó◊Éßqı"}E\√£ ˜¢â˝ª÷·¡ÀΩØO3j—π
ùè÷ g7ô¡õµ}∞Ûb_êˆÓÓu¯?nÕh$ÏèˆäS”´=‘v‹æbÛÊ° §„åü¸¥ƒ}kﬁd|ègoèLˇœsLïy1Î"ÜΩvN7D› àŸµDÍ¬´ØìÂà]ñfUfNÛÎΩK	Ç√gR©G˛x÷∞˘D‡Ö3k⁄	£‡[æz∫◊(õêﬂvg|çY ò±M≠qÚ&"Â≈¸lDŒh6£¯1≠m˝SñT%vÑ∑N*™KjØK™∆?®⁄§ºpÀÁ¨=é¬·pƒÀUp÷jªyÏRCØl≠+NpÏJ¶-]ô˚ÊQ0”ZU"–fòU‡eòìç¡@F™›¶?Eì≤‰-ÀıﬂYb™J=∑Í‹D≥àut’ÍÀÀ∆t9Sß¿ô®}Mæ¶¯Ò”˜/ÉûøÁ/ÿ5ÄEvÂëÇ®ØùÑ30[˜vó•ˇ‡oI!âŸ+8óY¡◊èBLùî“!^Bs¸¬˚T¸Àc≥qãô/l˜«ÌáÔqê&^Í/)π—öP*U!8\7]2Qﬁ±^$=£Öâe≠ Í}ï7∑H≤∏wµô_ÜÇ∂0Jjƒ%c. !¿˙ª∂≤2Zº∆6÷ tπß$xrP”kc√&Xq¿„∑≤ŒàbôØaáy—ÙöJkææŒX =0»oÕ;uÉìnıµ=IœÃŒ∫«V˚∞√ìV’7ê$\√ÎãΩ¬˚—eÓ˜˙_5‚Y≥k∆µ‰—^∫MπbÔ;∞îΩ™∞˚Á†|î,bÛV‚ê¬œAò8,|öB4Ñ@Êõæd ·éK!öª◊‰E)ÚÙZ-5Õ#T±"òﬁ~DEÏß-AÔ√ûh$∞pL6qØ$<=≤§EÛ¯.’íÇ[≈€]πQTî.¡÷?óß-{fkÔE~`Ú$6$9ﬂ]F°é™YF±3e¥{≥Ô›A˘úL·L‘Á‡ôñ†œù}…âkÿãØ«=ÊPÀb/ñG+»Œ‰x±ï?Œ:¿:SR3ë)rß‡4°®MÿfáR¢om©1â©—«Ú.¿è∫oè‹g7I∑nO©é-Âˆí£•‡˝F ÜŸ˚V|Ëÿª.∞∂v#}jå”˚ÀúE8
)x‘Ó47ûÄ‘éºë%ÁN^>L©∑xˇì2Iâ°A}∆aËº!f)˘º£>r@∆Á?Ωâœˇõ`<}∫Eﬁum≠iÙSó$ø5@ŒCœ¬—7(Ï‚ZÚ\„3Ñc:ˆ£Ω~π´OÓ–˛P”hÀÊ£	5.«gc∆S<ÄP…[¿oá¯ÕÇ√9°Kº…R]®%&ÈêˇdÃº«∑ë@õ‹¥bÖíëﬁLˇ¥Ö4¢â˝πå·€o≤ÖåìU0KâöπvR‡ [.4ñ©¡NßKü±=>ıˆæâ˜√ºÔ≥^0æı«gÏLV4@®ÑQç˛åh]ÅT¯	’7_1∞»:ÍáÈ˘‹Óaê,-ﬁ§dX+∞Pp≠ëÄ⁄4JW˛πÓ‰Ö4êæ∞åì7Yãë¨·RØ÷nÌvvt5·‹Ÿ‹Äá‚#è˘#èÌ<µΩ∂óbs¬®C,2∞µ\÷Æèo‡d=1Ës$¢ë+:ÚcRæis.Ä∞?˜#ºÛÆ”8ÂïÆ6˘3áMæ£Ä*i´KˇÁeó|@HY;öò…sË¸Ùµhp&Ôç/√Ç¢ˆ*ˆ#≠C
kÜ∂#ﬂ~[éc⁄«>®Èa÷~¶¶z ÛÆº`jV7ƒy±DîxRßgáÈ4¸Ñ0É¥13¨@±0ö|aƒX›„‰`Ñ\fˆåÒaÈ0Ïı_Ä•˜d¢;ΩüÌ∆9¨30°¢Vÿ˜k0KÖÉ?Ì6»ﬁ+8≈ÕsKBó8Â˝\}j5◊Æ‚‚«*Î
ìU¯.9ALÖSoúˇE4√<QˆS97íw4m °tæ?Î⁄Ã-≥î3ÔM≈ö]kñå8ﬂ[Aêπä2A±ˇ+Èß~FaO∑T‰˜¸‡“Ô€‰∂∫wÚTàúæårâÓ:ˆŸMv`oùüñ)üXÔœ;á Z/ê1Çouä[/@_ôF…w(¶H5∞w€.Ä≠"¯!¡K‡Ke S[¯ÓY7Rñ!ßÏeZÄÛ-f]Æ&N?>»Yœ_rz„(êÇ»ë´M"
∫>ãΩsê˘‰≤™*Å
cƒ5YëMzµÂﬁëë5P•6·ØÕ«JÙpË7`@∆µÖ]P‹z”úA\8aŸ9L2»V–G°cÁVpﬁÓú≤W©™ímy„"ªÚ∞¿∏ÁsüÔ.-æ˜.t´1Å·]¯∂≠+7Óæ7É•ÄÍR ÉAi"óA4EtÀ∑~÷?¿¢Äf¿≤Uñ√Ë”hL2}g\ÍÁ†+,útbÌ¥3ØE	|Ó˚˝Æ◊˚`~ék›Xe≥B˜È.cÀdˇ3oä“Ö{[`˚>ÿ	”Ÿ{˝fÁ‰¯î}Õ√ßÿ2‡·8Î'ò òD√%EP1Ä ;9º∂œr°çNªu‚¸x5„8 “≈êå[u≠˝∫~Óı`&s
·˝¶ﬂm#^e⁄•f8Ÿ◊¢≥+éâ=tÊ˜z©3@z ‡∏á¸Íì•Lp´πV€\Ω@˜§lâ∂|¶{”M≠Úº‹≥ºÊV`ÔGÖeµé, ø‰r
ﬂQ°’™¥È
≤ùü6]ÁnJÌÑNA$ºÎºiµ⁄ùŒ)ï∑Gu$#˙hq–—&ÿG™FÓ˘ﬂàì*£ƒÓêbÉáa:úv5∂( ‰zH¶i¯ÒeHAõç˚e%âŸQÁ.ä6ï…Eå9hµ´◊V“lÀ∫≠ÄT‹_âû+4≤TgÂ`◊ FÁëm¬≥É1˙—XpéG
Bå26X;9Âí€3
]NEŒÕiÄ 4eÍÙXéJpòŒ :∞U∂Í¡TT|µ©-*û^£/<Œ˚qåÒƒ7t˙h¢≠∏∫N_w 
»)WsM2YÛ0≤*K∂ZÊÌzJüW§∆Ãó4‘%/©6î)7†zµ{kD¢ˇ5 ±å∂≈cøŒ≠â%$Hm;ˇïÆÊö1%ﬁ–Æ©ö∞%+ﬁ-æB&º£ ‚¶Æ(U⁄é˜ÂRU™‹X‘6pùÆ„˝y]£Í›yı*π€$xÃG◊‹≤Ã≥i}óö†yTÓ=ƒ“˜ßa‰g<í{ˆ¡çŸe⁄‹%Ë3ŒYs;√°∞]3i≤h8fÜzÄ!Ú?Mf—:&(∑ÜÁœÛj‡i(2˘è,ÅŒ¿ëßT^ÀN
2à™G“öâa%%É®pjÈƒ®\xÑSà∂ëŒR0”:(QjÎ4`ŒB+∑⁄@LÃì∫∞±Ú¯KGPÊ∆è&a¡t,13œKΩb è¶Œ∆6?Øºq?x|úêÿå“∂∞_fzÒë2ÀâÃ2a[)p d‡ùo€/vﬁúº:`óMs’ÃçP+/îù„O¿Üå¡ÑæÖA”˙XÚr÷π“á#©Á£+<„ÊΩÇ3G(’ÕöÔl{ã≠rÃÚ<ûãEÆ[dïìD0´÷í†É"y˜>ÆŒﬂ«fC¬⁄<>ˇ†mŒﬂ—5–!2nåéå√=h◊ t`∆NÆ7ÿK¥Íÿ7"‹fc˝pZ¯–’9À&± ‘OAï|ï÷öö‡=ïq∏‚ÀºO:bÇ ÂîiDLp∏ÎÅé4‘¬?7›¨^……ıÜ·Egäy˝è{aË#°∏º≤-∆Ôl∞&g kkãâOkëºâÂﬂÖÇ™Øí4å‘$é(˚3ﬁz—X˘
$ôÓ∑2ù€πŒ€9™≈óë]˙2∑lF#/…„"ìÒ0=övJΩtñ4õ
¢<‹/÷G“x Á|
©∞HN"ßg‚<ÀGz£.<(ÛL˛Ö[˜
º°•<Lã2l‰‹≥–oÚfz¿ß.¯Ó†äŸ’"MÇ	ŒÒdöI./´M£)=±2WüR∂/–Â¬ì±ÿç0
@-¢%hwXMá≠pvc ¶Íâ¸ÉCV{É!Ãù¥{˜.`'°g’»
{èŸ5ô´í∑ﬂﬂ-tÆckîE1ÃYÁ*ï‚è1xFÛQòºqc·‘•n´ﬁ*"o`5óπHÉµ∏æTøU0dÙπ·'~o0–®ÓL¸^çYxNƒy≠¡“Œâ„.ï@≤È:≈ºmØ⁄}‰YßÖÊ(fÛóG8â`g#?väIQeG[≠GsÊ˝ö¨òaH“”Vx(ÒGÚ\¿ÃThLUWV-Âîêødaª›j!ˇ¿§πÒ‰√j™∫%G9a<=Å≤dlŒI„Tµv6Ê∞£$qD`ß„$`ClY``
yí†‡ê≈õ".fN≈DÏ=ü@s›kÜXèdÑ'£⁄‡«Ü\q’◊ïwˇ†S}Rl[Ü%q´¯0~—'ùkr¶[<›Ãë(fπd—˘áa7â=
∆Ø6¡Ã≈≈ò≥&&aÉé·jîé I6®ƒÃøD^/“· ˙Cû‚ΩóÙlÒ†'€¡]3Ü◊˛§SåÍ…0Ä˝óL&}¿Vã„z'|êu…3ßÖ3†ﬂ?˙Ò2q™’œA
dﬂ√¨_Q/–rçWPﬂ¯√&!¨Ï.©Q#Ÿ„<ÛÓÙı=p√Æm íıÏk‘a∆àÂcØ`WxQo`„Ç»Î~.ÿ˘+œ—¶Ÿæ$'z◊H˛SQA—§Ãgâeö§°<a	oT‚'˝æ“3[l“ÎÇåôMâê´O.S¯ﬂ´˙§æÄˇ@ü.ÉÃjÚ¬´÷gQ}zQEu–®Í†ˇ√ˇ(Hñîé3+mÂZ]’4G⁄™Ñ"ˆZ~$∂Ú√ZäÜd~ìÅÒUæ¬Qa>Ït°Í™À”ÉdÚŸÂö6¬Q›±]‡o‡í4[`déß≠gŸ xﬁúìÇ˝	€˜Æ·45;¡ı¥æyÍ^j&C ¶Ïßº-È•'Úµ2≠óôáÿ»˚Xø¬Ìo8¬î´à%Î#ﬂ?™ñpÙÄ1E
E y!Í%«FÉΩ≈≥$-+Õ“ev·√—D≈í sLÎ2;˜Fûs8.C∞ocb.¬Ãªzñdü≈ΩÅﬂO %B3”eﬁ;lÚöEﬁ[D6cÙFBˇHú¬Íæ†ÅÕìw}vÁös…ñJ<æÂπ‰[—Ô≥—¬vzºq7¡Ê√ÛÓ&'e=¶&´1Ô¶∞ë¬íG“˛Kp≤ÙßÚg™§¿ARZgó;‚8¨VWƒÙàÆ£¿C©‰ˇ˝`KDr çÄ-±¬®fâ7~œ©O¬)hîóÇÒ≥◊aﬂwßNÑ	Em1£=ñjˆ‘¡‰P<Ì)∂.ß∂/ö	!Êhﬂr¬tAàø2◊+ÎÒhkñZãïÁÎä=∞*™¢ü4û/ú6^Ø≈*¶§^+I6≥fµàÈ<·ïßΩ4˘˘⁄L% OF*ƒòµè.T`z\,¬Ù¥TÑIΩ≥ïÛ/ôspÏ Œ,è8}Ç'Õº5"™’¥Ω;•° +èî
Ï¬∂B¢Ë…3Òs£[ñ Ø&‘KŒ0JñJ≥X1(˘e£∏à‘HáÚ	π’g)∑G‹∆`üôõQ´Êò˘¯Ê∑c{c‘˝—5Öb3BÃCaêU‡ßXË5&¸3—‡Iµ
øˇ—qíÖ;»≈∏P˝—CtaAøÇ—l¥Ã«áB¢säuºsübî›(-|D·1æ16{âN—`ò8;cÿ^Ñ«µ÷òßIi7K≠SΩIµ¬¸^4y⁄Å¿-x_4x÷‹ÿøJDBR–†¥Â]™ò¬˜©	a∏®‘ÍfÆwzÌÕ Û∏¯ÿ–’yl#vú}	,’wx≤≥œˆ[?›=|{¿vZ'{ﬂÏúà:Öw€Èœ.‰ˇN„≈?_q\sŒäó‚vÌ∏è
U˛¡$]œ‚âè≤v/Ì|YµòNÓ§u·¯?‡∏óã‘wíhˆáF˜éâaX°ÎaDc(2öå‹˛Ü≈t7j8üËtjÊ√ ÂÄ±ŒÍZWS≥QÔ\@¸ïÚà‰èOV≠}‘œiÌ\—3çkQu{öÅÑß‡ùª;“aﬂk˜gk5õØíJ$…‰•8ƒ.Løµ•©~ªª0„H"áŸë7ˆáÛêÈ/2!˝’äl˙kAﬂ"Ø¢YuÄÊí
~’æd-xÚíZ˙›®£RUˇ“à√òÂd∞≥Ù5›Ê©œÎé?J∑-t‹j5Ω¬ÓT'nÉc∑Vlƒå“ˆåhn)Öã∏ÄN◊amè∞/pÅ?ÙÖÆ&Œ6Ø2ﬂﬂüöˆ  .á¥8{J\zä%€rìΩ[îö(ã\M>£¡ƒ'éÙ3Æ”ó†çáWgx
„ø∞ÊÎôÙ¬”3F^4=KtÚ≈SùtÜëe1ôxSF‰äoë^Sˇ¡öa£]®«˛9ıÉ÷U!ŸS=0r∞9¸)Æ√]ˇã&Œ]´=‘ﬂ«§bPY·á_≤r:¸kØøÃ@”ı?ÇÊEF≈_êe‡MXΩtãΩ⁄kÔ∑^˝¸l∑}≤≥∑ﬂy«üxäØ°ﬂBπ≠k/m≤∑…B˙+
»ÄLÀD5\ëAèX%yàœp]◊Î_¯-tÂ√’EåE*¯2N™Ùªµù¿∏’ÈÅ∆Å‚}¬mÇ5º•u´}˛π8Ú`ßKeÆ&G∞ﬂ ı¥KÕDZ%•XY≤V…KLƒù(ÇÁøâÀÎ‘JáÌK&l∏Ôµh∏'wY·6P-Vo•K·vl‹…\MmR•o≠7.ı°È¥Ïr≥∫⁄ƒ¿78‡;˝>Ã“Ó≥Ù≈èfñ¨ ∂¸ ˛‡€ÿîêµÌê|÷ñ·sÆn|˛…» ª gØ%éÿåµ&PR -ÌÊΩj[9°Ü“Æ∫πöÌ†)∆¥fÌVŸ,Uƒî2¶j&nÙ#íJlUdûëã Ï`\ø™Ø∞I§ı5 ⁄g<´qv!ô>ˆ∆ÿﬁ∏œyûµôû∆Ó%A2SÿÈ™˛¥∏ßŸÙ8'”ﬂZ’;Èö	vU0tåERXöâ5ˆ∂qÑln}unﬁóÌ√Ï≥ÖΩeœËb,s8')S©zŒ#⁄π⁄MV™I},˝‹$íŸº*Ïq~ç>°2iñËúBÏsn˝Ñw¨BNû≠Ò [WÕÕÖ?≈Ö≤l(#„˙
:ÉgZlV˚Zæáöf‚IJ‹tÏèÇ‘]ë/A3çf„ûó∂YõÅÅîÜCÉÙ€Çq[2Ù‡¨‚l	0jﬂöÀÇß"Ω^œAëU·E\\UsÏ©ü'#^úW$ˇºûâ¸y(∫ºµ„àZπ5eQ\§Ú*¡"W‘§ ß∂:å@∫ò–6¥wW„6r~˚æ&÷òÃé9–°±6£Y&πmaJﬂv[6~(˛qcâ‚üƒÒ≈ÌD€0K^†≠õÏiÙÀ_fµJ€3ÚH§lÆ?ÍEï∂Í…òÔã√éA%≤®’f÷Óó+	òpb¸›ò}ªV…ıJ2•‡R+[R‚˚!n[úı‡5<öΩôòÑ]Ωπº–í∞ù√·÷«˘_˛’ã„÷¬
ÃIs˛ì`¬pì`•"ßåÀÒ5Ò¿ÿÂ7ÔcøÁM∂h…,dæ˝´0æ~ÙßÉ≠õfc„ñıa 6ÿÍ∆À˙ó˛œRºì⁄}/k*&¶ü‰™á›µËFògﬂÊ=	?¢MlÏÿüvt~G„ÏˇÔÈ’gÏŸ∑t˛Ô”mÍªTV’x£‘Òôyà¡DZEBÆN¶Tág≤⁄∆ú°Ws
º)d˙	¶G<â‰ÿ'XÂ¿Û˜÷DÉt”˚
óÚ¢YÃKr]úÜ™bÂ√G…qîL/˝4FLÉâ|oX«<ö{J€%í/	öc/h…«<vØ÷jç,rÎé,rÎ÷zﬁ7:íÀ™<∑àX_]\ñ1¶Ö]Øø≥oÜ·kƒ§vúˆÀ8Å"q4Ô¬≤å6µ±X,∑)∫ây^Äno1	#oå≤nz}Xà”∏±†Ø.ñÌW3”ØNoÇ•p$£y‘ßVMB*÷˛6x∞√ÛsE«í‘™¥cùŒﬁÆL√¬˜KÀ∏vm-”µ6“E]Q¸[8mΩÒî')È†;V—≠,”iù¶Û∏0˚›á…yG]Qˆ‰î#±·« ﬁ·”∞ç‡˛Ò˚r°í~Äèi}ùSﬂÓ∫∑Íc‰ºÕòcWù≠Ã”)ºXM¥f¥ÀÛ¿ŒåFiâ˛˘îà∆Ó¢É…Qw

øcﬁÎûOWÿ∞x‰Ä˚Ss≤Ëÿ@ù8ùÊvæ;8py÷”g7…Bus«Z˝≠|…Y}gvè´|=9¡ƒ;UÚ“Ó⁄º3∂ﬁ⁄‘≠y‘%Õqw‚G#"˛ÀhF»r‰~‡qÜøß+$π√nMná`<ˆu
ruäÆyôK]˝R¶Ïí‚ª"TÎ ámïÈ©d(dZòv]¶w/jµGtva˚∏›9‹ˇ¶}|÷:<nüµ÷nY2œç˘˜¿ﬁöW•ΩN¥_√‡Ô^èΩQ–√u¨Ìª5È›if9&ïâß*üÆ(*s¨î,/]ÖÕWêôù◊ §Ô`13˛Ìª”e·'@W9Ãõ∞1`à=≥÷!ı$gKüÜ`	;L‚>jªcªç…,‘ä%‘˜õøˇ∂w∞w≤∑≥ø˜ó{_≥£„ΩovZ?gr-c%™y ∆®§0ZÊäp˙^~ˇ´ˇÚoˇ˙7¨ÛÛŒI˚5€Ÿoül≤BÆ¬Î√›6€Î∞ù„◊Ì]cóÕ„Òèø≈¶ﬁ—Îø9Ÿ;<8eá`ä,Y>iÛY˙§ÿá;µ˘´ˇãŒ¶ΩMøÊôKINì?>£&>ºï÷D&¬‹¶PT±iSÖ„Úù¡1¬2ö{ˇ˙ø—4
çtìe+¥⁄#?∫ ´‰:oXÕ?Æﬂ˝ñ	˝	„ºõÚ±2{å¯˛j"ëD¨–;4ˆﬂÿa7&ñ/˘f-	PYÌ‰)lgóƒŒ∏√˝Åñ¶LZ:«Pz„‚Ö∂rÚ™AéŒ√ÛZ˜il-}$ıN˚ƒHtﬁﬁÖ—ˇ¬ZüŒ‘åü"•Ÿtû¸gù-*f|ë^sì˝ªœn“!¸ˇ  ˇˇ ôPWœxúÏ}€rIñÿ˚|E6∑=gRMqIÕ@$’‚,%j	JΩª
ÖT@%ÄPò™A4õéÿ'á«{⁄ÎÏÜ«„ó}∞üˆ´˝'˝ûO9ôY˜ºTÅPK=ÓäéQóºû<˜˘ÏËà‘[‰ƒ∑¶Ô{°ÔBÚs“"§}˜nÎ/BîóÎçÇ∆låkÔgùlv]◊[ês'…ÈÕÄŒB«õõ¨ÂÚüﬂ‚¸ùLØ¸Ôt◊–©Êë3$µ‘$ì∂∑»≠ÊªÃL^~:Ñ÷dv˜Ü|˜˚¯øˇÛﬂí>PõNî,ºÈŸ}\¬ã¯üßwM}ﬂ±i@c'§.¨C––OG◊˜ü˛Ìø'Ø/O{Á/ØŒ.ûø!'ñΩêÅ5°æEúÄŒ›%y|˛ÚÚÚÙ‰^ù˝„q¶Ûp‡MËLŸπ∂K2ÛœwBÁkj≥	í°5q†Km∞°”;B›ÄÆ}PKØ;_‚œ]zœïˇù~Â-ÏV§øúY¡˝∫˙wˇ2≥Ó_E†#⁄&# „ê⁄¶eV>Äß#–ÈôMé‡m‚ﬂıˆ¶˛hhˆÂÔˇª≠X ! /‘á«! »ﬂySJÆÉ˘ y‚êK‹ã“à§∞:ø˚-9˜⁄Ù6ˆ<óÃ‚Æjè©5Ä≥GNßCœ8”πòÖuXÃ≠{t˘?¯»Ø|g4¢˛9ˆ¸ôÁ[!Â˜kè}œ≤Vb«tx>π]j·BÜÆíU<"cÄÕåó]ﬂo8Sõﬁ\kõÒ‰ﬂÇkõ⁄^ì¶ørÜé≤’<|Ú	Z\qUø˝-9”¡{\≥xÄ]¢s}Pïÿd.OfíßRì‹Ê‰¶Sô∆1ËŒCo¬Ä2◊-[‰LèÏÔlÔ˛¥-ˇa‹˙˙©[aiõúÈµR6<„.Ò‡Ïzs¿|ÏT 5t⁄ª∫<;æzãTn≠$nºÏwDΩ˙êÕﬂßÀ|bMø¶á¥ ,Y˝x†Î•n1B#∂X}€µcÒΩû˘ﬁ–q)»aù§.3é ≈˚@¥Æ≥>Zw~⁄%Eó‰4¯¿Ö|e˘H£…Öÿß{êûñÚ7s∏´3ÔªŒÄºá~¨0ƒó‡sÔ˝|Fºœ’ªJ„c◊º∑Ω≈î`'Û†**æÚB8DÁQ#¿ÊæOß»ô^<ybÿÕ*Ä≠ttLa©¸%,Äê∫π‚z›£CÿÄÑù¡	ÄàC1ôª°SúﬁΩÅÁjªª˚âÚëO√π?e√Q}∑U®K¿ˇE–∑Õ6â6Fà¶‡Çß15˝ÊÚz3⁄ÃÕm |∆øe¸0˛.2pìÒ≤oëÂƒ_YN €òX~¯6å©Õöy≥M>˚åè!ƒçèˆ˝ôg”≠∆ƒö’j0•m‚ÿ7[‰Ë©)‡–vÆqøén·›;2p·?˚»pLÅm∏s¿áµÕÔ~ˇ_‡h¬…Ü©gü¸Èøˇo≤˚Ytªπ•Efø õ!Ω	Îæ–˙n≥IÜﬁ4¨t‚Ù=◊ﬁ‘~{P#?≤1•a‹0¢dLe◊NÜeílPﬂ˛÷ÿc“Áµ„π4¨wöMSGÿˇ&pTpîÍOÓiZªÖ´1˛· ëÍÛ≠-˘á‚#˘3 7˙ûoSøL	ˇÉOÁ!,:0+m2tÈâm‘·Ä"-˚ıÉ·≤ﬁß·Ç“)aã˙acovÛÜ§VdØŸ‹P¸0òY”G=éçI˜¯ÍÏ’)IÄ‰pá=◊}úûBzÎv±◊ú	Pö°O8÷∫ÊîÎ´ZC˘}I3á;èÈrO∂2(ÛvÁg‰…‹uÅ“‚b~»ärJÎZKÄ{˘ß VÈXË!ﬂ4f˙
‡ñ~∂ìﬁ˛√Ó‘éäÚ˜4;ö['H5Ù”ü–÷a2⁄"£ÓL°GÀ=∫Ω÷8·ÚÄ4…›]ÒMã"ÛfK˙&Ωq¬BÉÖ∑R€<tnÄFYÑmní˛(’ΩÊŒ√}Ú5 úZ≈œY}óÙ-@Ëæ7´˜›π_øq7rù°!fı!lôX7ıE=ò§∆«Fú£vÙGÑ«‡<ﬂõÉDj◊;7 Â◊ âÑœÄg,»T}ÏÿÄº˘Du ¿Ö#å-†Hı◊Õ∑Õ∑ªÕŸÕ[‘∑j≠€≠˝ΩÌV˚·v≥—⁄€zC∆ı◊⁄¸çÙ "ËªÄ˘…„yÎïÖßxÚ}ˆTzz¬ÂQ{!øå¸Ú¶«¿ÂΩ?∫≠1b	{wñƒ⁄–~VÅ≈Rnıœùá¿•{∏É@Ω«!Ód
ƒrg—ÿ>¨yIì1.ıª…¥òdvSÔêŸ⁄hwÿÊ≤7nÇÑÙ»Ê'«)|Q_ˇüˇ¯FäW¯rI—3n…Sj·< ‘Æ™M…A$ ∏≠/aM kÔ*n˛£‚iY≥z[çµ{ L“ÏAÿ €#yÇΩAv™aÔ◊≠fL>§ÑüÃg¿‹Åáíö≈ÿ˙˙e∆êø3Ò¶ﬁ∆£g^eπg‰ À~v≤ÍWh*î≥_πYøﬁQØ‚∏]òæ;3uaj$úíYá¸ÇQ≥¶Å≤´∏O(ÙÁsÒÍÿÚm’¿v∆Ìïv-ﬁÄ˘'}‰’Ssò ‚nÏiF‹}yıÙ‚ÚÏÔNO»≈ã´˙≈À+“;˚Úy˜\ ëØë¿ƒsÇ3AlZéõßµq c»pwÒ nûepªb1pèA˚ÎKâM›+étL7™úÌ<pè"ÙXÔ4ˆb‘ÿ¬%¿}WF‡eÇ∑ƒ_©á;∫ù?ÆGYÃ≤∏ˇóÇ©áàYÆ∫xÏ›m4ÅchÔ¡öf°aêáB®"m¿ªdLÒ ÒøáéÎm¸≈vm(qkgfÖcbm<É~«_\∑û∂Æ˜û6_5øû¥Hkº?ZØZ¸GÁ∫Û¥˝™?‘€Ó„:<◊§ﬁ¥ôz}\Ô¿˚–tkﬂ⁄ºÆëj¯∫æój˘∫ﬁÅ_˚–tÎZÖß¢°ÙœzÊg;˚6O˜q;˚q3˚≤˛i}øﬁ)?ê‹S◊nˆÌ¶Êg˝Av	Úogü÷;˘ëdﬁnÊÜmÁ√Ïc˝rÓ©_éÅ∞….öª)∞NP\ïË&ò]M~«_üÕÅï”≈≥ìrk'§ËƒúŸ*¡∑FW‚ÕgŒ¿˜31ñEõﬁn«l_Fºx–‰ÇÉå√‹K∏z¿z1YFZW€2¥ùÁÚÂ¸≈CŒ_¥¥∏T∂€)©¸‰Ù¯º{Ÿ}~u†ó¥UMq êp∆è¢}ùÜ¯÷ùA~◊BÍ«]ô_Ωº<Îùú£‚˛ã)““,j˙¸jÓ;ÅÕ˝+>Ù¢›gUûv/OæÍ^ûíﬁU˜Íeo≈Öë¢òçG›Ûsr|ÒÏ≈˘ ‰ ã∞"õ˜ƒÛ¬ïÖ≠Së©Ñ≠Yﬂ>å—≠‡…r¸≤¢b÷`:•aF±›^ÔÙÚ
xÂÀ≥/ü^ı»ÒÒã.˘ﬂˇLZ_<‹o¥⁄M≤Cæ<yqI∫~ÿ Ì¸|r|L^X~HZ{d‡MfÆÉÄ~dkêß÷‘÷Ì=%Å3öZ·‹ß$fgËPª°X˙Ÿ=§( ÉàlG>L•zu`ë}oíaõhõ»pö^ÊÖ»©ÄÈmï∆éÈÏ“Ø4m9Ö^M
âãyÊŸ çVR◊Q€AIó˚·ú#oP⁄ï÷ŸïVŸ}Pç›~seç›§†äëÏØfa2K†Jf“x∏∑Mp‚{≤9eI|“bÔKó Y™≤Õ´îã[¶\,j“ÚôV±(ƒ2|/Bc{EÕñÙ$ÂnF'◊:π&Y‘;m‹‡0pÿ/ Eø¨rçÌ#´Á‡.◊È5ÏvPüzS™8»
Œèñ–ôïCﬂ)êB<®ÂÿÉbGE$‘ÏH9u\K´09Ïπ¿Ö˚ANtF…ô∂zç\Ò j∆¨êÛK.º"I'Gˆhà/–I?+ÛG„›¬Ï&vj.∆MØXì`Á∆_µfm∑≤Rßw/£yóÈﬁO„ÆM·<*D¡J’Ë¸˘§ÄÂUkvSo7ˆ≤äwwî÷%Ç88Ú˘©∂Á5SøÀTÔiÂªÏôéQ|ÏŸÀX)XU(Ñ 
úb´ï≥¶Ó¶ÿ√©ÁO,ïÊêêS¿j}«Ëi≥9ôÉπF@Àl2ö[æÌ3’&æpÏ§ú∫#œ‹–CˇEƒÃƒ‡lOCÊƒFßuü`C—îøh«'ÛÈÇ9Û˝õyééQ)ø_9äK  u Wﬁh‰ñWÅf pWÄ{\¢OIÓ1S|]A‰∫ß)ÜµqÃ‘Î*ÃoM˙®•5†~>›s	yê"N¶ÏﬂxÑªWˇ ôóë⁄Dìƒ(Ì¶@ÖIâ£	@√Û…∆£ã©ª‰Î$ÅK√`ÿûÄ3 º5˜Ûh¥‰ƒ¸Xã∫Ò*ÉæÒ*Ö¬ıöçF£HÆ∂µü†œX≤wßSÊ2y@>ìê=È´ö∆Ôî¥Øîã‘ªòÖu¶Æ3•uvD–ÿ∏®∑––‡;”˜¿o`?=ø.…õô3≈3íà1ZB^–T‚Z¥Á\+SoÄQ`lÍŒîπÎΩ¡<8Äøÿ8êG%üÎ◊ºÏB°„‡+~TÆ7—´(F`˚z7§ªwÍ•‘¬6øv¯ÈmêpË—épÛ"D<lAá@ör{íÑ‰4ﬁG"÷LÌÄzÈÎ\m•YáleoÍ{l©”w._∫’&ZÊZ√sÁju∂ú’îOP¢Huí£7#ﬂ ˛á¿¿	Ar£’g%Ì∞∏kı©õ!»LÚ∞ó'ÇDBW&Lè€c‚Rî√÷¨°kg:õáÄ·òóPáwÒ∫∂@Ë9Rm €7ﬂêÕÊ√8®:Ë¿0˘ÿöé†¡]ó„µ>gÛé∆|@h˛—∞¡fh¯Rè∞Ò*Í.R*ã=£  \àÃ/Å,è}ıßgvÙÑ˚˚S‡ƒ?M∆ë!p∑æ¯° 7å¯G–^ëe]¡è%µ3	ùp˘£¥VBZ{ËÙt≥π?sÕö∫µãkÒæb6â b]æ/ëÕ+ëœ|:rXQ¥DCs‘C†ÀËèÇõFKVRxSæ˛£ Wa±Ñ'NèR‹z§8ÌrˇπHrÍIVíÊÃb€yVF(ñ§;¬≈ê<·È2ûQ‘aî‡cy¿üvá‘¨©»KQ≠3Œ§≠IΩe`R◊ƒ¢Æƒ†F]âQ5±©k`RSéo+≥ßzN·ñßU·`0 	˚q@¨È“I…ØCèõ
YH%ˇN–].…˝PÿpƒÀÃjGj—ON≤ºÈù)dpáèEﬂì*>/jÉΩ◊qIÓj¢•∏¨âà_œΩêê
L…å"}ıÍ¯Øp¯Ã‡ √®Qìê50ngÓÕ8Û3ì6¶Ü`–G|-7£$däÏ<ÂAÉúÒ‡˝||í)µ¸˛r;R◊cÍô9∫ —kÔΩ ·(Z>Ö€∏≤¥£|†∞ˆ¨kfÆ
}ØtúÄ\Ä`˙∑NÃÎé¨ ~¯iäE‰√Zb≥⁄3CÁ‹î òb;Ru’,≈«]ÓV6ÄWSÿ±	ò™ÜˆX¸ ˇeHÅo8úù`˘ §å∞Mü≤ˆ·ñ&¿_ÍèîÃ0ÿ∞‡^√¡¯Ÿ—⁄î.»1„ﬁÑˇﬁ·˘uÃ
Q∑\Íc‰æé2Û(ùC™†ΩËåµy|ÒºwuŸ={~’#/_útØNO6ı$ºÔŸÀÚé˚¨§,ÈÄ“ÜŒhé“j0`§ø<n˜s•óH„ù¡¸ √-jÖÂ≥;ıûJ–í‚»ÖKŒËŒÉÏÈ≈C˛a+C≥/‚•Ø|jïé†*üœµ¯ÉfzÕ“§'K g@z Ù-`ÖŒ¶Cèú{£Ä\\íû7p,WÁÎåÉ€mçß®∆ﬁ¢;@c3,ÓœxÏﬂ9|.OÉ¸€& ¸'Hß˘⁄⁄ JyÇÂé@»Æ£Ã	|§}{ê°HyèV2¬<©ÂÑ9 uª“ÉUÒE.q#`KXXæ$~WÍ!ªùÚŸ‹/Ì.U“q÷ÿãTE⁄d°(e}@Û^≥Ò∂ÌVèxWh<Q$l£•ÁØxÛΩ<|#†2·QLQ ,Ê √“eÎÕocÏê–4 ñl5ÉMÃ/ ˜˛w
¸s?j„åÑ„ÿxÑ˘ıŒ¶—Ÿ;qÇ‚ΩÂ·Œ∏S“ç\ µGíU—õeéjKÌÒRd¨B«E$ì
∂…“õ˚Q.1∏9ÅûÜŸ»~É≈yŒòm“=#_‚0ë'‹AB∆ò˚ÄRﬁÊµ„ásh†{Iê`ÕpÃ€dL]∆Ò√+H¯¶ ∫˘sπk◊
j=∑Vôë]Á¨&#ÁßäÍå, (Â•x%Y|Ñ+ó◊µ ≠ÒŒ±cL5fÌ◊Ÿ€*ÊQÿ¯`ö™7ÑDÁuÜfùo™L/rï˙Æñ’Tîë 
Zçê5ïu8Î˘íÊ%Ê*QÊÚ[≈pd¿ñÚ“Öä|Í∞¯JŒ«éGûGßsÄƒ°¡·∑Ã0Ÿw<=@˙ﬁ"8∫m´@#ç0Ë™Äü|20XÚ∞A¿¥iÙf?d(<C& ƒ≥ÄÏê+K·∂øåBÎkƒáÒ¿´¬a¸·U+ÿc@«∞”‘?⁄†çQÉúPå¸€&Wt0ﬁ∆ I€©ø’å¬®∂åL—«ﬁdb‰°|ç>‰∏ÒjÉØÊúh¥3Æ@í¨ã¥üı~hJ\ƒ)Ú˛>J°∆lE…nß˜†ï°”˜€yPH?Ï4ã·˘—©ŒHŸQËD¬”j√'‰;«dÏüZìŸ_¶R¶äôK∑@%n´6á…ºt‚±44òŸìyHu¶Z?ë/Ãßá…@ªç=ÉßHX’<±Eê,]\`¶üæ<IHv4˝È *¡ﬁÃ∆…%c‘ò!~åˇÀ{sÄ´Pcg)˘êçôNâÄ®tâ—ÖOUå‰™é°˚BÂ¬Ëí8øhÃ£Ã,ëøD˘È-GõwÍ∏Øí2"OòT∞Í»l⁄ù∆(¢N¥≠è5‘g≠à7πéùà2r≥^Ù”h”„áè'Hﬂ‹œ"≥Nß@RÍ(?‰¨Wg%mÒh≥fíÕ»`K•7‚i=í‘&¿{$3(u[£Ω$’5iò∆˜œEèVÇ˚B%ö&v∫zD:íæãëQWhä è-yÃ≤ö¯%˘%Û—…<⁄‡|ó1 Â´y<ﬁœ◊Q˙µcé]æÙia’∆£a¿éŸˇÛ¥ã%3F⁄¥ü‚∏ÿMf¥(∏çe–6‘˝Áåvë†PªEØÜ”˙¯¬Ú[¢á∫Ufï:⁄‡I#9x(«P>´¢nÅ‚p#X°*ôum¶yM´:§gL1ø}+°œ	ôT†ßX∂ôã0eDd;Ñv£|!yPR5nÄˆ[ñ¶›•”Q8&èHSÁÒerKE©f LÇ_gXZ)”‡UŒÅ5u¸FhVì¡r¸s¡∫_Ç°NY'~Ω•∞ö˛≤—+)∞Œ»ØÚY∑Ìø1´‘.qí˜"
,$ªMù!)ÎîÀè¶Ù2S™l$HO˙™jgø˚ßˇ†@0+òÄ’¬Íï’'¡¬	cñ>∑Õ^‰tb9.	ÊìâÂ/KqÜ'‘©ErÅr⁄l–l∞”ÔRõ˘NX}5"X%o3ŒºÀ<∫`QjõºõMcÓÊ€wI*‘ëßç-ëT$Z8‘Ö%‡kÒâΩé[{gÚtÆ-Ólg˛v”ì‰6i1Q%ÜAÔÔb"‘Çí£ë{Í‚3ÓÓJd o*k»›ùÂÁÍO¯›#‚»¶Mji:%uã‘û∏2 ãµN‹Ø¨óO\çöîòì^ñ˘"¸ áœAg∏◊Ê•R≤¶ ˚ˇLN,Ù`Ì	¥Œê¸⁄üIReôÇc Ÿf7ì	lß#'∑j&ÒüΩVWavÈ`r¿˛∆Qwn·w>´˜pU@‘ÈhÛ¶Wt´‡∫2ëFÌu{üùaø°L∆√ØKäÜ'ÃCsmπéU¶õNx®sH‚ŒÀÑU"#·R¡c:ÜK·*·G#OÃæcÕf.{A¯r®˝úµ^ŒUdÂ~jDƒ3C°WÜ•cø–=€†83G—·Ö¯”˘@°ÉkΩ–¬Ø≤±wxÂË◊»û≤Óê0‘6°O5HÆ2ŸŸíu∞E>+V¨óHÙ:Yò∆äi‹+>,*‚€€GÅpÈ…U%î`¡D∏˜0Ã+Mîå;…ŸæåP+ «ΩWÄÌ|8¿¡òR•1ó_¶è√o1u=Àñ–Ä*ı*‚ˆò¢@åFZ*<÷0&ﬁ™z\fˆ{?.–Áè«Â”:./Nû€Ã'∞æüYÅa~ƒ≥ÚÎ ˆÂ˚>,ÿÈèßÂ”:-9ΩëoÕ∆X∏|ts°6˘UÔ‚9·,Ú=Oëp>ƒ)Í%É]◊i2‰B0.K Ii‰º«ı◊ù=8±qm…XJ2Ûµô˚3¨.J5M•8#Gˆÿ4∏èÏÎrµ«Û21√]å_:v¸Aﬁ˜˝ ∆2π·ÛO5ˇ†xHe°çGœΩ(Ír%r0:äïX%K6¥Ö¢Â¢>ˇÅ∆ã#∫D&òH.BtÃäÒ òZ‘Î‘áÅäÒŒdŒÉo5“ü~&®ñÿæ”≥®»´!6/^ã+z7Œƒ	ólª…´Cj; ;a$Ã!iÎ´JãZπ∆hiu∆¸≈<*XT[cwågê“}e(…ﬁ^ˆ8tbòGbJ·Á*á‰ç*¨Zâo“J*üFˆFfˆ•‹7§µó©èÿäÎ#∂;∑Ï„¢<b¶rÕfπﬁçV¢πÿ/Q-Vüt/s–zÂîFiJm<ÆÂz0ß$œ¥ßØ,íqÆBÄMäUó!r—u[ $Éƒ<ƒ◊˚YïØÄ/·«ÕiThC3Ñ%z´Õ}é∏Ÿ,v”4ò<wö}¯n†´™îøx¡hÚ‚Ú‚oŒûù]˝-9æ<ª:;Óûó]é
În‰pyÉ∆ÑU‚≈‹F‹æìZπ«Å,=Ij„J°^k€‚ï_ò¢`∏QjóƒDd˛â0œÆ22=gÈÊ
#¥E RÂ1ÊºÁä:}•;›Ω∆Õ˜Î^È±ÚSWa¨ôM95≤°3î^?%´RÓƒî;Ç%OV©äZ_~I€ béÀmzÌË3‡˙‹
ÿºàr’E/˙yÈ«≈Ïiæhº§V{µÕãπFË=¡ö6µ÷÷»®k˘Ò˜Sö 7Ê–‰Æ83v°™¸^öUXë	HÁûbËZ≠:»I=f.©B£tH$I¥€mnîÈŒfÆCÌ*∞[ö‘}åµ{%äx™"G [¿Á{Ë¡düŸç`ﬁBÃWknì˝≠ªF£±ˆµ,ıZâó4πL0ó∆ J˘#Ÿ}µ`ä13E≥4˘íNÅÖ QáVü¸lGﬁóæ&âKá˘‹Íoô˘6g˙◊–‚VSñ∞Uß.Yg ÷˚:2«≠‰¡?Œj)“Y∂…¬ÿQ∫Û–ª§®ÃKöÖ•m^;»X≤Es\®+õáìÒ—"TMÂÕã\8€◊ø °ou:æ!ÕöÈW¨e∆ w*?WÈÀ§¸Y«–S∑‹¿R‘Ω”Ê§ƒ`,ÓÎØ
÷õ"ßøÿΩ&˜JaÃXˆAoÃ(.¶!Ö„Ω≥ˇjS…Ç®•˚û¡ yÛE Haÿ±Úπ‹Y˙Ωæwc2{∞˜®}$€ìUÚ∑üõI"üEgUl\Å_˜0Î3&ºGösY„>K_õÁX:CIàtÊÿ≤\áÏM1ük¢a,ïL6~1˜é†x\L‚∑‹≥´˛zsÛç∏„^—∞7´øn„©‰øë˛fnƒs`Yp“%Á6}[¸»ÃäﬂB£ˇkˇïS“ffï≈∫“ßî√à‹LïLπ`Mπ∏Àÿ!*îE√Î8 ◊ã 'mπŒ◊Ä±l∆^|ÃOfÔ…<@∫y˘‰∏˛p∑Ÿ&3‡i=Æ–lÅ∆LBƒmàXC◊qE⁄ú(Aæ/

èApÙÄeCßØÄ!E¯$b¿*>Kù ò–^Å∂Y+ñm√¯Vs	3d ∆lï¢Ã"a9ûUY˙KJôZgΩ ı0ŸW$ú
ïy‡Ê`AÌêÀ#≥/È¿ôaùa“ÂÀ\&c±WsLÕºkı®Õßøô;æ6¡zí˛õãºBv„Ã˜e≥V+ì#úIo¨…Ã•Äx˝◊êˆbπ>¥SÜ¶’R_§#à‘,°ôÇ6∏Ó|}™@ètº~"RníßÄd @}n*3¥>∆¶LëöRÁ%bêc¡™:+U≠…6QÌ‘¸ ˇ,2SÕo‰œÑ‡\≈Ù˝ı˚l∆rÕIÚS «je25êÉxtù⁄DÂ∑m˘ˆ&¡d˚ûO®&∑Oˆ(¨ûƒ>J@œó~#ZñçG˙√Ô˛Èâü§;µ‹%pàAπ,ÒπV£ı≈Vø˝Ô‰â¯	ÏhùeJ-”®9µ¸¢drEƒ∫”sxùÙ@*±Á®hàHZ	ΩÄt\Ÿ‡ë¨J$ìÃX@aπ§ÊËéíŒ §tÌÃ∆vôË™§ÿoáE„w¢≥Q≈ªP°∏ywÂŸH+X≤%OLﬂ°‚ÊÑ2w-‘kï5¶-π°`Rå–Ñ?Ã
Á¨ÇS*è‘^3Ô˘î£F(ìŒf≠ßLUX-ÆöIìdåõ‹Ï¢ﬂhÊ–6t\bÕEîÔ ]∂¢œ˚®◊§3·v*ôÁè÷ox„—1[pœí^R?–˙MaÀ+t[îVûØkõ“~ﬂ|ì{(ú,>¡<°B≤ÜM\◊ˆ∞Ùı’˜&e˜Rc∑`7ÊZ´YÉ¡60~
˛$?'Éÿa`õ4∑»Iµ∞ïÚ!@å⁄l47Ô&üŒñuØG‰yƒ«Í#Ü‘å2£4Ä,'‡jòºL:¿|6ßÿgZ9EÁSj±Ã®4¥l+¥4„”çêg π<’9 4JŒÑ3)…âU/igºA⁄I˝‘:™ÓÆ2⁄ﬁºˇk¿?ÒêªsˇÒºÃŒwˇ_#£:je± $O{pÏMfÆ√ú∂9ÔÛÅÑaç)
¡.:¬§¿˛µ@»ëÁã{,XÏw£®ã÷i‘EÊq_ìí§ôëIã%◊≠éÑR†\†äπ43	FíüvÜ˙®«(˛¸#:¿f∑: ˚ƒ˝á∞U\ﬁÍ^`+3Q¥rß∑SÃıüQ∆ËÁÛî∫Æ∑‡˙ﬁtÙ(wË kX€¸ÂÊ÷ÎÊtU‚Ø5»c j´¬¶¿ç–sﬁËı–˜&‚óë]»xmj¨Õ•yû◊Zp>&÷,ò˝∑\ùõ†Wgj;#è· Ú‰◊Œ+w9d‡TºŸ)·mJJDÁ≤‡Ò^LÌÏÊ%
ÿaÈüí¡rÄí◊Ì3+7‡`z~-ÕmÏêŒ≠;V·öŸü∞Úb⁄vB¿Y–!·Ÿå¬X∫ó›‡€
≥A_\n8÷≠fÛ_òÇk øuß›WîÕƒ†Ã”l&∞XàÚ•siò…0Áö/Xô8Kº’%&‘ùƒΩ2‘∆-HÉŒ¶ñ Bî}/„ ¬?ºbJ9r¬ºj+|X¿Pæ3.Ô2æº\,°ë:s9pahËÏ◊ŸäC®∂9ñ´Ôàª “¡¬7w⁄πïPØNº«+G§Ë⁄Ìd`'ÙÁS BtcuáÈ¢ªt≤«©û>øUá:‰‹¶gÈ≈.Î.ùÍƒúóx6é·l‘JDäîÈÆúÜŒr‚\ßL∞Py+1Ø	h¸yv\u“π#ÿ ¿› p¨Ï3pÁH±ú)2§ˇÙÍŸ9<fûT3kâÒ˚kXΩ{Ò˜	üPjc^›T((È[S=”{À†“„UÛ*P.∫∂ö≤ûò⁄|Ä|îN1Œ»Ø ∂S!÷Î=r≤Z‡]Ê¸g5ÿÔÿ!KVãÙ‚≤Öü	¡
¿≤}kfãé∏„1µôWKT y)Ø =æMÖZ5¬)·ÅÓUt¿qRb≠3≤1”À∫ÍÅHœÿç√âk 4Q6ÀDÈÚ†xÒdÏû≈õ√Ñ[°&gjñßºñ›ùmí”Ògo¿XµnÒÑL≠kgÑ.ËçÅÎÃ˙ûÂ€ç”Ù
@Gdh`gápÉ$;2$‰ú≤è¿ÑãÀKl˙ì¨-l ¨Bî•,”)`ß·„Âô]€îÏ◊¶aåŒê‘‡µ-√.DÄˆ"z~ ˜æl8à√[Î;"Ÿó·„wá¡ıàCÆﬁﬁìeﬁ 7w
üå√pv∞≥≥X,ãN√ÛG;Ì&`/htÉ,;m¥w7»ò"ª¿ˇF~˝±ws¥—$M“ﬁ%xÀÛm0ØVÇBÕ{ÙJù˚òÀÔÛ«FwÎQõÒ¥À¨Ÿ—Céô€øˆúitˇ—·Ãsóxó0WZzªIêá§ıŸ%≠6∫FØ†[ııË—±7CWÍ≥w¶Ö≈> ﬂﬁ<¨ï9Q≤ΩHÔ´©ªªmÇm ,•U÷h≈´XßïÎ”∫IòEòsπa∏ï˝√d~)ùÎ2óû]á]ERaDæµ‡“Ä•ù2OMTÏÖ±™É°&R[ãéÄÆ∞“*ôÃëà"uz:ÕPó‘X[äB≥ÔŸ¯_pŒŒLG£Ñ/˜§hÇ˘¢¿∑LmÅ*◊M’x∆$¡Ö–tƒIéËyLÓﬂé_ î]ÊXø’ŒL⁄I§P†	+D=dCì•Âè[”'ují9à˚Sk≥∫‘Q∂w˝ïeÉKú∏h'·°Ÿ+åôB¶oN©	ù≤<Lòz'.05#ìÔÆx‘‘‡`åØ2∆V^“°OÉÒÒBÂxë-T[2•S∫®q…†H}lì9Æ…<U\ƒ’0˚<-WPÇç≠aZKá!ø’*≈u$›U-¨c(.m6rP®aUÖÍãÅŒó\¿Ar≠%yÊŸ ˙◊^N1Ç Ä?Y…¨/ÁÄ9∂R"Pæw“˜-ñÒΩÊiÄ"Ú””ÛoØ.^ú˜^«ﬁ0·π»(q7dﬂ)>M≥<“§FÍBC“2BENHZ7®¯Z±VPÒù4Q@ì<‚/÷õ‰Îz\;À‰dÊπ˜LÖÅäy üFkWõÇxù¬Ïi 4À0Ìm∏’ñ,Ñ±˚R˙°æ&ìÆÀÑŒ·˜»DêÕ`Ü„õ€ƒ∂&Ω
C∏Ï√)Ç“Ÿì6VÙ6ÂâûÅ™ïbÇK÷}äΩ‡H6ñ{÷“í≥ 
÷à·¢¥àÑ∏gûp·wP.I¯É≤u%≤PÕ;ÀÚtÔñ*eÚD–Ü•J3¯§° Ã˘Î¿LÿﬂRÌ\¸Ñ'^jÀ≤)µ=∑ß5P?Ú¸Â«ß
Í°¶j≤jÛ ≤Ç
e DUG‰#Æê•‰:¿ÏrÂTJJ+&œX9E…õùqG
 IIcïRZ]ô—Jm}‰D„}ç˚ê∫òﬂ≈T|E‰N$üt∫‹K2B+_ôU^Ófµ:¡<ˆÏrukΩD'}/r'y–ººI‰	RÓ∫=)W’*3á™–ã§äg)+gÌCï_Íöù∆ÚJOû@)_‚ã’Y}YÒXÜ4°.°”Pù_i¿®⁄"É{ˆrjã’ßûg“[˜‘[ê≥ê|Â˘ÔÉ{lﬂnq˚LÀæ[·Yx‚QEq¥ïVßsÂ!cˇIØ˙≈år≈Ñ®˝2∞F(≥°?è|~øœΩ{ã+mç;ÒWtI”):° æ§⁄e	ÊµÓ0Úm{GùÎæ"»ƒ´€À¿;ƒØrŒ:∑i˘Í6ë#◊¶QŒµÀ∆…$ïNx•ÂR∫Ÿ[1{£ìÜﬁ∂©™/∏ZÌ_•‚yaiQbW·H%)QG2ôÈT~B?6/(§¡`r∞â∆oÍ{\˘õR—¶dãÑ?dw4Âöﬁ|y d⁄‘îÃRûﬂÎﬁOΩÀJ/–+„W·Û7U +’ìîÎn+b%Í≠îÎÿß®|NqºûÄ∆R:*'àæb©ôÊ:TöêRZ§R:$≥I£?úﬁ|Û!TH≈qV\¨+ö9πÕÆ¶Ö+ß“YQá¥™iç˙£è¨=™¨; üÍz£è§5™¶3Zè∆HS´PÎ’U]u‘µØ1Tƒ&]ëHJË4E¶?¨∆H4úRiHlê≠˜\O$#W©ò%ì`bVEá—ı©jç§–Ú7í≠îÓïä)ê3ãF•–!⁄°$Ôﬁº?A‹-–ñÃ©Ü6D¿¬	Zs7¨Iùb∏C@◊∂£≠C†™…›œ¥[\¸@o+H+∑‚X©/§ -£ÚﬁêkUjàãèÔk‰K≈·.d.IÁñ 0Ë§œÎ9ƒÁ˘ú5ª√•MU¢Mı#R¸`ÿò‚CjüL*⁄5 D˝)Êe;ˆ&ì9I?a˛Y"&I’çHì2•Ñ)69ïYYñÂyÍª≤…Ä÷ê˘$Ω_÷T"∆Q}ÚíbzΩZ‰ä≈"}âÂî"“\>rì>t›0œXú©µw«[ÜÃ<Ü‹Ve≤ZÛYe¡ïPü J¥Ò◊Â≥X˝†@Wô´JÁ˝Ò˝A◊È‘˛îaÜ∑2dâoÑ´Ïæå˝Ω¢Ïõõ÷'∫BVx8L^»}§Æ÷#õºOÀ9ëŸ}ëÒî¢T≈°_ oﬂ1®bïf˛E]≥T<W>õû≠”(åßÚ¡iæ»◊¿…≠ôªí*>˙™5Èä7…°K…3πP∂î‹´‡’=®ú©‰èyEÙãÁ§ñˆâTï[0:˝}œ ¶ñ*˘ı˝¿ÿg´ô5È dA,πøÛØ'O æ¨ñwIzÙ∫Ä≠à˝{3:¿l±°.àR0Ô0”GÕ’«¶qÇåhlbdzí†MSôe7D,Ö·
X˙Û?K9Lâ‘≤Ÿ!mÆF¡‘ZÏ Ú±uÌx>©ùM«‘R˛•Îı-óSÙ-S∂»BJKﬂÑo—ÚÄ‚˛`Ó˚§ˆÑ•ñáY.'Œ◊‹Ó?D˝æä*˜™=Õú‘ÜSÄ=Ò©=•÷ıíà'¯Æ7$˝%K≥â·‘î⁄A’nËƒ˚µº8˛;Q◊NñSkGr‡M0ë;aπ’*∑›w≠¡˚∑}ñÍ1˛I[∞P=œ∆Ë⁄	Êÿ0Oa7vfﬁ´⁄¡ƒ9É∑>Ã·≈tœ»3ºC.˘R;ıŸqÜ}‡ÒM4§Ó≤j/º\≈sÑﬂZcB0‡o[∫„”ë¡ˆ¬–™>„h©\˛H¥Óè«c˝Ácé1'Fò 7éùÄë˛*õ†?¡∞,©ç8>q~ûqè∆û3Pd¥Y…s‰	œ Ú—5{Ø8(æ£¡°›á—ﬂE[zÚsﬂ¿˜ﬂ÷^oˆ}áqtõ€¿$X˝%˚óRˇ{v6–Û\¸k`±òv>`OòÇkj<Åß¡(]$gTöπG1Wê!∂1ò√®£3KTc6”â:ÃŒ@üé¢lúÜ1≈9¡jîŒ«‹(À®,·DS‹'öõX®l≥9‰,pf¨¿ ˜≈RiiHìc¨DE–*¨´‘¢Så∂’Û ¶j–‹_ÿ ;Üî<>ñTÚS±Mbõë©Êî¶&≤ƒ7-ƒqÿÛ®Rÿ~ÏNıßP¶lì^∞”‘Áª[—çJÅ∑O¨ÂGÁ≈cÅ!Q”‡∞*·Ï‰Ù.|k∆è®E€–¸≈+Jﬂ3ƒä)†ÀbV ˘‘N–+¥!R’ÿê&~ùXz˙@h÷à«Ü§ñ¨Ñ9KI!n\≠ZzÂD`;∂…g@¶p	y‡Í(UÓ˙u£—HuèN3À7ÊﬁÙ®≠<Åÿ¿j÷ı◊ªÏú$¬ñ∆+VK∏rÑ(≠\)Gî8Hˇ(Su•
^zRd†1Üc˜∫‚v·˛jÓ±°÷?6À2óÃ˛ˆA†J9…
Øù4ØΩ¯ÕVsã…:I(<f™yíÍŒ1Üt±9ys∫Ök:rπR¿R±yìÊ"#ﬂ§K¨MN±´pMN%<W,¶~	WM2°O$±W~/_∏Û†j2‘Ï&^ióøJõ©ñFœßr~“Ú˚%˝•ôvÌ √É?%O®≤Ö'éƒÎVÚùfÌ<£”˘–o∫\‹}±+Û`E/} ^ôﬂ¥ﬁÉKÜ!3∑Íå#s⁄√WnOÎCù¯MßΩ©ı>‘Uª[!j}’¸ùõ∏‹4wÆﬁΩq#èªáÃ„.G?øÈúKuv#◊‚ÖaJ|°h•(˛6V&/Ì-˜ÍïGèáù÷‚¥“¢C¥&©• #Î‹ZzÛê9|eê2¢dBV3jj9z‹.(˙âåÃTÏ)N°˝2∏&0˝D◊ucù¿ƒ,Ê9Orà4QC†Wgh=ÿs€”ñlè ΩTµí€Ó˘˘€ógØ∫«˚ˆŸ≈…ÀÛ”^T&¶*J€ß&±¡Œ∏Ωz ßr¿\÷î∑$èQÌ>ÀZzpú&3b3ÚÁbs∏Ö1ò∞ò∂(DK¿ò©ªä‚^qªx≠ÆÈ&
]ŸS.Âª%¸uEÁs3´ú…[Ä√^ÕQ]ç'™;™˜®Â∆¿%ãl‰	∑·†Ò≠™ﬂÕbÛ›¶
ı√˙Í¢ySÉ9CﬂΩR§∂äÍ°hNØëà˘qYqV@úE∂ﬂ”⁄iìzRª|â7TÿYÌnhÚ‹f˝	@Ô_œ©*ÛÄÃ†ˇ,˚a9c~∆\,S»êt}√∑ôtõXs€Ò∂âoŸñøMBÎ=b∫MŒ–Ÿ&øô;_o5£4&ÿîô[
:Ûa˝Q4Ka‰RÚ/Sı®™Q›	RSLÌtŒΩ@ÎBÄLÓÏQÚT
˘MT'Õ÷+bÀ(Wãÿ0j≥Djob–g9Ó±4ÉÚ5™1Å	≈†j\⁄Øän…ì±Ë5Í‰rRƒ#∑éÎ -ïø¨‰§< Âµt2∑ƒ±»ÜÂ∫€ÑY‡W7íR·ﬁ ŒBx@‘,π€÷µl”!±/’zTªÁ∫ÑÓÖÂZxhªöÛ	¬÷$Œ‰ƒ,ΩqO[ÂfA7¿Ã2#˚7ˇ	GÜ5¢<†=]Ò
9·M÷C7∏∏∑í£ÛÅO
RC˚Ó˜ˇÄ#C}Íz3EOÚ%ıÜ®X}`º£í£[æΩ∞¸Ïn~˚Ø…SqFvNG0ÆK<µ˜XÆ∏£d`íqΩ·i*‡Sç'≤buy∂≈#Çÿêˇ8N˜	≠4[Æ®6ÿ∞Lˆ+fª‚Ì´ıË´∫≠>+Lß∆ªB?
`∫ÀzÆ
∏Vñ˛ï≥πºµÇ&VÒàˆBkt¯Ÿ( Q&ªKáÂ˙`
Ö◊Õ∑Õ∑(èΩıG}´÷z∞›⁄ﬂ€nµn7Ì≠7z„‡ë)=J±ﬂ¸f;Q‰¶?˝¢©…≥ªäÔ´HUÇŒ§9YI^pù∏lÀ∂∏§S*MçıƒŒÙ›ñAB÷Ö§!ô1H°ØUâLy·Öd_NN»ÀãÏï©h%4<9˜©V÷}™M&ˆAæ∞∞\˝#ìÓ•k!–⁄Dk¡FÀµÂ}∆®ê}‰SËÔ_ﬂäP ìeU÷<ÏÍ≥≥Ÿ}gR€ä¿Ä’˜UˇF‡ËL#ﬁπ∑à™©>7zL¯!…∂ñ¯1¸fã|ÛçÊcxg∞Í∑é≠˛RÒôbûwÚ˜9)DvPj»ì_Y}Ó.ﬂ+©`â6{rpo9ﬁçŒ®¸Aj® πÏFÛ≠âADd“\ê!ıÅaΩò¬Á\‚›"íõ’ZV*åÙüÅπdE {H¨Øh÷6B‹L∏ıvÄK‹◊ûæ8E…ÚËHÿ…´†S1-®ù»≥Y%AmMÕ*˙ñ‚Ú|Ê5ÈH„™‰8Ö=)ß–⁄€zC–Ô:˚'ßI7&√GNU∆Ûõ ±©Î:”πwh]ÚÃyçñå¸ÊN˙∆Bå*: ç:ü=3s’[hﬂH†ã˝âˆZt;dpZ…Jz¸∆ø0Bá<t¶‘.SŒ†ıO∏¶ÑWV©l;@â*rôâ‹Ò›0æ‘
K¯ÒûÉ–
Á¡:÷Pî2‰≈>ek®4ï›ºJèñIñ›„´≥Wß@≠ãœ.ª'›K˘£ﬁÒe˜Ÿ„Û≥Á_öŒ<ø§‚K5+]©~“¶(òò€([Ò1µ Î*ÚhÚN6W1îÂU  ™â0çW
˚êB/,uƒYIC^Fµ‘°puYG¢I…slßﬁ(C≥+bh‚añ*2ç˘X”0•6µ‰±Æ»#{#G5&®¬≈
Ω*ø∫=<g$.ö†¢2¶S66úÃiÜ€#Kï0ë¢˛4e ,÷Qﬂ0º%'_ﬂ˝ÁoÀ8ÕäqÍ}/ïBƒΩEmÉ[•§ˆ&f¡ŒyX(Ω,Àπ_î∂D∂/_köAîp–˜* áÔ˚∂‘'füìÚVéDr⁄ûˆéw†ëGƒÛ	„œ—Ë86EC∏Ì'(q|||sı7óµÊ≤˝"˚EDû≤vΩ€ß…x-€±oZî&ËÏ≠µ∫˛≈=¿Yº˚…O˛   ˇˇ ¸Gƒg