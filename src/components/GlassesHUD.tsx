import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initWasmEngine, applyWasmInvert, fastBoxBlur, fastPixelate, getWasmStatus } from '../lib/wasmBlur';
import { 
  Camera, 
  Tv, 
  Sparkles, 
  Scan, 
  RefreshCcw, 
  Maximize2, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Shield,
  ShieldX, 
  ShieldAlert, 
  UserCheck, 
  Info,
  Radio,
  Sparkle,
  Lock,
  Battery,
  AlertTriangle,
  Smile,
  Wifi,
  Cpu,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  Zap,
  Smartphone,
  Laptop,
  Server,
  Map,
  MapPin,
  Flame,
  Compass,
  Activity,
  Globe,
  QrCode,
  Check,
  X,
  Mic,
  Volume2,
  Sliders
} from 'lucide-react';
import { CitizenState, Pedestrian, PrivacyLevel, DetectionLog, RegisteredEntity } from '../types';
import AudioLab from './AudioLab';
import GpuShaderCore from './GpuShaderCore';
import PrivacyThreatMap from './PrivacyThreatMap';

interface GlassesHUDProps {
  citizenState: CitizenState;
  onChange?: (state: CitizenState | ((prev: CitizenState) => CitizenState)) => void;
  addLog: (log: Omit<DetectionLog, 'id' | 'timestamp'>) => void;
  logs: DetectionLog[];
  activeTab?: 'webcam' | 'street' | 'scanner' | 'heatmap' | 'audio-lab';
  onTabChange?: (tab: 'webcam' | 'street' | 'scanner' | 'heatmap' | 'audio-lab') => void;
}

export default function GlassesHUD({ citizenState, onChange, addLog, logs = [], activeTab: externalActiveTab, onTabChange: externalOnTabChange }: GlassesHUDProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'webcam' | 'street' | 'scanner' | 'heatmap' | 'audio-lab'>('street');
  
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  // Emergency Coercion Hard Shutdown States
  const [hardShutdownInProgress, setHardShutdownInProgress] = useState(false);
  const [hardShutdownComplete, setHardShutdownComplete] = useState(false);
  const [confirmShutdown, setConfirmShutdown] = useState(false);
  const [wipingKeys, setWipingKeys] = useState<string[]>([]);

  // Secure GATT Time & Key Syncer key purge logic
  useEffect(() => {
    if (!hardShutdownInProgress) return;
    
    const keysToWipe = [
      "Face Biometric Coordinate Hash Map (128-Landmark Vault)",
      "Rotating Pseudo-random Child Tag Sequence (IETF RFC-6238)",
      "W3C Decentralized Identifier (did:blur) Private Consents",
      "Web Bluetooth GATT Active Authorization Keys",
      "Apple iBeacon Background-Safe Solicitations",
      "Google Eddystone-EID Ephemeral Local Signatures"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < keysToWipe.length) {
        setWipingKeys(prev => [...prev, keysToWipe[currentStep]]);
        addLog({
          deviceModel: 'SECURE_ENCLAVE_v2',
          action: 'erased',
          shieldApplied: 'SHRED_KEY_' + (currentStep + 1),
          distance: 0,
          rotatedId: keysToWipe[currentStep].substring(0, 16) + '...'
        });
        currentStep++;
      } else {
        clearInterval(interval);
        setHardShutdownComplete(true);
        setHardShutdownInProgress(false);
        if (onChange) {
          onChange(prev => ({
            ...prev,
            isBroadcasting: false,
            registeredEntities: prev.registeredEntities.map(e => ({ ...e, isActive: false })),
            anonymousId: "0000000000000000",
            emergencyPrivacyActive: false
          }));
        }
        addLog({
          deviceModel: 'BLE_BROADCASTER',
          action: 'erased',
          shieldApplied: 'BROADCAST_WIPED',
          distance: 0,
          rotatedId: 'SHUTDOWN_OK'
        });
      }
    }, 450);

    return () => clearInterval(interval);
  }, [hardShutdownInProgress, onChange, addLog]);

  // Confirmation auto-reset timeout
  useEffect(() => {
    if (!confirmShutdown) return;
    const t = setTimeout(() => {
      setConfirmShutdown(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [confirmShutdown]);
  
  // HIGH-IMPACT EXTENSION STATES
  const [lidarModeActive, setLidarModeActive] = useState(false);
  const [rfInterference, setRfInterference] = useState(0); // 0 to 100
  const [geofenceZone, setGeofenceZone] = useState<'commercial' | 'court' | 'sanctuary'>('commercial');
  const [whitelistRegistry, setWhitelistRegistry] = useState<string[]>([]); // whitelisted IDs

  // Web Audio Synth for Sci-Fi feedback
  const playHudSound = (type: 'beep' | 'success' | 'sweep' | 'shutdown' | 'alarm' | 'static') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'sweep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'shutdown') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.7);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'static') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90 + Math.random() * 20, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio context block
    }
  };

  // Webcam States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamSessionRef = useRef<number>(0);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [useVirtualWebcam, setUseVirtualWebcam] = useState(false);
  const [blurPosition, setBlurPosition] = useState({ x: 50, y: 40, scale: 1.0 }); // percentage coords
  
  // Camera selection option to use front or back camera
  const [webcamFacingMode, setWebcamFacingMode] = useState<'user' | 'environment'>('user');
  const [qrFacingMode, setQrFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedWebcamId, setSelectedWebcamId] = useState<string>('');
  const [selectedQrCameraId, setSelectedQrCameraId] = useState<string>('');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setAvailableCameras(videoDevices);
        })
        .catch(err => console.warn("enumerateDevices failed: ", err));
    }
  }, [webcamActive]);
  
  // Kalman Filter Configuration & State Refs
  const [kalmanEnabled, setKalmanEnabled] = useState(true);
  const [kalmanQ, setKalmanQ] = useState(0.08); // Process noise covariance
  const [kalmanR, setKalmanR] = useState(1.8);  // Measurement noise covariance
  const kalmanXStateRef = useRef({ x: 50, p: 1.0 });
  const kalmanYStateRef = useRef({ y: 40, p: 1.0 });
  const [trackingFpsLimit, setTrackingFpsLimit] = useState<number | 'auto'>('auto');
  const [detectedCameraFps, setDetectedCameraFps] = useState<number>(60);

  // Manual Lens Calibration Offsets
  const [calibrationXOffset, setCalibrationXOffset] = useState<number>(0);
  const [calibrationYOffset, setCalibrationYOffset] = useState<number>(7); // default shifts down by 7% from forehead block to center on eyes/nose

  // Aspect-ratio crop mapping to perfectly align coordinates on object-cover webcams
  const mapCoordsWithAspectCrop = (cx: number, cy: number, vWidth: number, vHeight: number) => {
    const r_video = vWidth / vHeight;
    const r_container = 16 / 9; // Since container is aspect-video

    let screenX = (cx / vWidth) * 100;
    let screenY = (cy / vHeight) * 100;

    if (r_video > r_container) {
      // Video is wider than container - horizontal crop
      const crop_fraction_x = (1 - r_container / r_video) / 2;
      screenX = ((cx / vWidth) - crop_fraction_x) / (r_container / r_video) * 100;
    } else if (r_video < r_container) {
      // Video is taller than container - vertical crop
      const crop_fraction_y = (1 - r_video / r_container) / 2;
      screenY = ((cy / vHeight) - crop_fraction_y) / (r_video / r_container) * 100;
    }

    return { x: screenX, y: screenY };
  };
  
  // Edge AI TensorFlow.js BlazeFace States
  const [useEdgeAiModel, setUseEdgeAiModel] = useState(false);
  const [edgeAiModel, setEdgeAiModel] = useState<any>(null);
  const [edgeAiModelLoading, setEdgeAiModelLoading] = useState(false);
  const [edgeAiModelError, setEdgeAiModelError] = useState<string | null>(null);
  const [isDraggingBlur, setIsDraggingBlur] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFaceDetectedPosRef = useRef<{ x: number; y: number } | null>(null);
  const framesSinceLastFaceRef = useRef<number>(100);
  const manualLockRef = useRef<{ x: number; y: number; framesLeft: number } | null>(null);

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we are dragging, do not handle the click
    if (isDraggingBlur) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Set manual lock coordinates (framesLeft is 450 frames = ~15 seconds)
    manualLockRef.current = {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
      framesLeft: 450,
    };
    
    playHudSound('beep');
    addLog({
      deviceModel: 'SHIELD_MANUAL_LOCK',
      action: 'censored',
      shieldApplied: 'COORDINATE_LOCK_ENFORCED',
      distance: 0.5,
      rotatedId: `LOCK_${Math.floor(x)}_${Math.floor(y)}`
    });
  };

  // WebAssembly Co-Processor and Vectorized Pipeline Stats
  const wasmCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wasmStats, setWasmStats] = useState({ wasmLatency: 0, jsLatency: 0, fps: 60, wasmActive: false });
  const workerRef = useRef<Worker | null>(null);
  const isWorkerBusy = useRef<boolean>(false);

  // AI-Controlled Vision System Tracking States
  const [aiTrackingMode, setAiTrackingMode] = useState<'static' | 'face' | 'body'>('face');
  const [aiTrackingActive, setAiTrackingActive] = useState(true);
  const [aiScanLineY, setAiScanLineY] = useState(0);
  const [aiSwaySpeed, setAiSwaySpeed] = useState(1); // speed factor for simulated motion
  const [showDiagnostics, setShowDiagnostics] = useState(false); // Default to false to hide background tracking/mesh info
  const [showFaceMeshMask, setShowFaceMeshMask] = useState(false); // Default to false for optimal performance (only blur by default)
  const [showCensorOverlay, setShowCensorOverlay] = useState(true); // Keep censor cover active by default
  const [showGuidanceOverlay, setShowGuidanceOverlay] = useState(false); // Default to false (turn toggles off apart from blur)
  const [hideAllOverlays, setHideAllOverlays] = useState(false); // Master toggle to hide ALL overlays on top of raw stream
  const [showStatusBanners, setShowStatusBanners] = useState(false); // Default to false
  const [showLeftTelemetry, setShowLeftTelemetry] = useState(false); // Default to false
  const [showRightTelemetry, setShowRightTelemetry] = useState(false); // Default to false
  const [showCalibrationRings, setShowCalibrationRings] = useState(false); // Default to false
  const [showHolographicAvatar, setShowHolographicAvatar] = useState(false); // Default to false
  const [showTargetTagLabel, setShowTargetTagLabel] = useState(false); // Default to false
  const [showCameraErrorAlert, setShowCameraErrorAlert] = useState(false); // Default to false

  // Virtual Street Sandbox Viewport Display Toggles
  const [sandboxShowBlur, setSandboxShowBlur] = useState(true); // Enforce only blur active by default
  const [sandboxShowMesh, setSandboxShowMesh] = useState(false); // Default toggles off
  const [sandboxShowLabels, setSandboxShowLabels] = useState(false); // Default toggles off
  const [sandboxShowTargetBrackets, setSandboxShowTargetBrackets] = useState(false); // Default toggles off
  const [sandboxShowGlow, setSandboxShowGlow] = useState(false); // Default toggles off
  const [sandboxShowSkyline, setSandboxShowSkyline] = useState(false); // Default toggles off
  const [sandboxShowSidewalk, setSandboxShowSidewalk] = useState(false); // Default toggles off
  const [sandboxShowBackgroundGrid, setSandboxShowBackgroundGrid] = useState(false); // Default toggles off
  const [glassClarityMode, setGlassClarityMode] = useState(true); // Default to true so all windows are clear/transparent by default

  // 3D Perspective Rotation Simulation States
  const [sandboxHeadYaw, setSandboxHeadYaw] = useState<number>(0);
  const [sandboxHeadPitch, setSandboxHeadPitch] = useState<number>(0);
  const [sandboxAutoOscillateHead, setSandboxAutoOscillateHead] = useState<boolean>(true);
  const [sandboxShow3DBoundingCage, setSandboxShow3DBoundingCage] = useState<boolean>(true);

  // Network Scanner States
  const [scannedDevices, setScannedDevices] = useState<Array<{
    id: string;
    name: string;
    mac: string;
    type: 'glasses' | 'smartphone' | 'drone' | 'camera' | 'smart_tv';
    signalStrength: number;
    channel: string;
    complianceStatus: 'unrestricted' | 'handshaking' | 'secured';
    complianceType: PrivacyLevel | 'none';
  }>>([
    { id: 'dev-1', name: 'Meta Ray-Ban Smart Glasses v2', mac: '00:1A:7D:DA:71:11', type: 'glasses', signalStrength: -48, channel: 'BLE Ch 37', complianceStatus: 'unrestricted', complianceType: 'none' },
    { id: 'dev-2', name: 'Sony Alpha AI Smart Cam (Set A)', mac: 'FC:FB:FB:01:2C:90', type: 'camera', signalStrength: -65, channel: 'Wi-Fi 5GHz (Ch 44)', complianceStatus: 'unrestricted', complianceType: 'none' },
    { id: 'dev-3', name: 'DJI Inspire Privacy-Censor Drone', mac: '24:0A:64:EE:A4:5C', type: 'drone', signalStrength: -78, channel: 'Wi-Fi 2.4GHz (Ch 6)', complianceStatus: 'unrestricted', complianceType: 'none' },
    { id: 'dev-4', name: 'Samsung Smart-Camera QLED', mac: 'E0:F8:47:8E:B3:AA', type: 'smart_tv', signalStrength: -85, channel: 'Wi-Fi 5GHz (Ch 149)', complianceStatus: 'unrestricted', complianceType: 'none' },
    { id: 'dev-5', name: 'Nearby Bystander iPhone 16 Pro', mac: 'F4:F5:D8:33:10:9F', type: 'smartphone', signalStrength: -54, channel: 'BLE Ch 38', complianceStatus: 'unrestricted', complianceType: 'none' }
  ]);
  const [selectedScannerDevice, setSelectedScannerDevice] = useState<string | null>('dev-1');
  const [handshakeProgress, setHandshakeProgress] = useState<number | null>(null);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);
  const [isScannerServiceRunning, setIsScannerServiceRunning] = useState(true);

  // QR Code Scanner and Linker States
  const [scannerSubTab, setScannerSubTab] = useState<'radar' | 'qr'>('radar');
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [selectedQrHardwareId, setSelectedQrHardwareId] = useState<string>('h1');
  const [qrScanMessage, setQrScanMessage] = useState<string>('');
  const [qrScanProgress, setQrScanProgress] = useState<number | null>(null);
  const [qrScanResult, setQrScanResult] = useState<{
    id: string;
    name: string;
    mac: string;
    type: 'glasses' | 'smartphone' | 'drone' | 'camera' | 'smart_tv';
    channel: string;
    code: string;
  } | null>(null);
  const [isRealCameraActive, setIsRealCameraActive] = useState(false);
  const [linkedQrDevices, setLinkedQrDevices] = useState<Array<{
    id: string;
    name: string;
    mac: string;
    type: 'glasses' | 'smartphone' | 'drone' | 'camera' | 'smart_tv';
    channel: string;
    code: string;
    timestamp: string;
  }>>([]);

  const qrVideoRef = useRef<HTMLVideoElement | null>(null);
  const [qrStream, setQrStream] = useState<MediaStream | null>(null);

  const COMPATIBLE_HARDWARES = [
    { id: 'h1', name: 'Meta Ray-Ban Wayfarer v3 (Opt-Out Tag ID: MRB-883)', type: 'glasses' as const, mac: '00:1A:7D:DA:88:C3', channel: 'BLE Ch 39', code: 'BB-MRB-883' },
    { id: 'h2', name: 'Apple Vision Pro Compliance Module (Opt-Out Tag ID: AVP-401)', type: 'glasses' as const, mac: '88:E2:4C:1F:D5:A2', channel: 'BLE Ch 41', code: 'BB-AVP-401' },
    { id: 'h3', name: 'Sony AI Sentinel Cam 4K (Opt-Out Tag ID: SNY-112)', type: 'camera' as const, mac: 'FC:FB:FB:11:22:90', channel: 'Wi-Fi 5GHz (Ch 48)', code: 'BB-SNY-112' },
    { id: 'h4', name: 'Stealth Drone Signal Tag v2 (Opt-Out Tag ID: DRN-502)', type: 'drone' as const, mac: '24:0A:64:EE:50:D2', channel: 'Wi-Fi 2.4GHz (Ch 11)', code: 'BB-DRN-502' }
  ];

  // Stop/Start camera on change of scan states
  useEffect(() => {
    if (isQrScanning && isRealCameraActive) {
      const videoConstraints: any = {};
      if (selectedQrCameraId) {
        videoConstraints.deviceId = { exact: selectedQrCameraId };
      } else {
        videoConstraints.facingMode = qrFacingMode;
      }

      navigator.mediaDevices.getUserMedia({ video: videoConstraints })
        .then(stream => {
          setQrStream(stream);
          if (qrVideoRef.current) {
            qrVideoRef.current.srcObject = stream;
            // Handle browser play restrictions
            qrVideoRef.current.play().catch(err => console.error("Video play restricted", err));
          }
        })
        .catch(err => {
          console.error("Camera access error, falling back to simulated high-fidelity scanner:", err);
          setIsRealCameraActive(false);
        });
    } else {
      if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        setQrStream(null);
      }
    }
    return () => {
      if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isQrScanning, isRealCameraActive, qrFacingMode, selectedQrCameraId]);

  // QR Linking Simulation Function
  const handleStartQrLink = (hardwareId: string) => {
    const targetHardware = COMPATIBLE_HARDWARES.find(h => h.id === hardwareId);
    if (!targetHardware) return;

    setIsQrScanning(true);
    setQrScanResult(null);
    setQrScanProgress(0);
    setQrScanMessage('Aligning viewfinder with target hardware tag...');

    const steps = [
      { progress: 20, msg: 'Locking onto dynamic QR matrix...' },
      { progress: 45, msg: 'Decrypting RFC-9402 compliance headers...' },
      { progress: 75, msg: 'Synchronizing symmetric opt-out shielding keys...' },
      { progress: 100, msg: 'Establishing encrypted spatial sandbox...' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setQrScanProgress(step.progress);
        setQrScanMessage(step.msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        
        // Successfully scanned
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const finalLinked = {
          ...targetHardware,
          timestamp: timeString
        };

        setQrScanProgress(null);
        setIsQrScanning(false);
        setQrScanResult(targetHardware);

        // Add to active scanned devices
        setScannedDevices(prev => {
          if (prev.some(d => d.mac === targetHardware.mac)) return prev;
          return [
            {
              id: `qr-dev-${targetHardware.id}`,
              name: targetHardware.name.split(' (')[0],
              mac: targetHardware.mac,
              type: targetHardware.type,
              signalStrength: -32, // Very strong signal as it's linked
              channel: targetHardware.channel,
              complianceStatus: 'secured',
              complianceType: 'strict_blur'
            },
            ...prev
          ];
        });

        // Add to linked historical log
        setLinkedQrDevices(prev => [
          {
            ...targetHardware,
            timestamp: timeString
          },
          ...prev
        ]);

        // Dispatch audit ledger log
        addLog({
          deviceModel: targetHardware.name.split(' (')[0],
          action: 'discovered',
          shieldApplied: `SECURE QR COMPLIANT LINK COMPLETED [ID: ${targetHardware.code}]`,
          distance: 1.2,
          rotatedId: `QR-${targetHardware.code}`
        });
      }
    }, 700);
  };

  // Bluetooth Low Energy (BLE) 'Scanner' service that automatically identifies nearby smart devices
  useEffect(() => {
    if (!isScannerServiceRunning) return;

    const interval = setInterval(() => {
      const deviceNames = [
        { name: 'Meta Ray-Ban Wayfarer v3', type: 'glasses' as const },
        { name: 'Vuzix Shield Enterprise Glasses', type: 'glasses' as const },
        { name: 'Snap Spectacles NextGen Pro', type: 'glasses' as const },
        { name: 'Ring Spotlight Cam Pro v4', type: 'camera' as const },
        { name: 'Wyze Outdoor Smartcam Pro', type: 'camera' as const },
        { name: 'GoPro Hero 14 AI Vision', type: 'camera' as const },
        { name: 'Sony Spatial Capture Node v2', type: 'camera' as const }
      ];

      // Pick a random model
      const model = deviceNames[Math.floor(Math.random() * deviceNames.length)];

      setScannedDevices(prev => {
        // Prevent adding duplicate active scanners
        if (prev.some(d => d.name === model.name)) return prev;

        // Generate dynamic device parameters
        const macBytes = Array.from({ length: 6 }, () => 
          Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
        );
        const mac = macBytes.join(':');
        const signalStrength = -52 - Math.floor(Math.random() * 32); // -52 to -84 dBm
        const channel = `BLE Ch ${37 + Math.floor(Math.random() * 3)}`;
        const newId = `discovered-ble-${Math.random().toString(36).substring(2, 7)}`;

        const newDev = {
          id: newId,
          name: model.name,
          mac,
          type: model.type,
          signalStrength,
          channel,
          complianceStatus: 'unrestricted' as const,
          complianceType: 'none' as const
        };

        // Notify user about newly identified nearby smart camera/glasses
        const distance = parseFloat((Math.abs(signalStrength + 30) * 0.12).toFixed(1));
        
        // Add alert
        addLog({
          deviceModel: `${model.name} (BLE Auto-Detected)`,
          action: 'discovered',
          shieldApplied: 'NONE',
          distance,
          rotatedId: 'BLE_DETECTION'
        });

        // Add corresponding blip in simulatedThreats
        const angle = Math.random() * Math.PI * 2;
        const limitRange = citizenState.rangeMeters || 12;
        const factor = (distance / limitRange) * 45;
        const x = Math.round(Math.cos(angle) * factor);
        const y = Math.round(Math.sin(angle) * factor);
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const newThreat = {
          id: `t-dis-${newId}`,
          name: model.name,
          type: model.type,
          x,
          y,
          distance,
          timestamp: timeStr,
          status: 'discovered' as const
        };

        setSimulatedThreats(oldThreats => [newThreat, ...oldThreats].slice(0, 15));

        return [newDev, ...prev].slice(0, 12);
      });
    }, 15000); // scans every 15 seconds

    return () => clearInterval(interval);
  }, [isScannerServiceRunning, citizenState.rangeMeters, addLog]);

  // One-tap Broadcast Shield to trigger immediate blurring for that specific device
  const handleBroadcastShield = (deviceId: string) => {
    const targetDev = scannedDevices.find(d => d.id === deviceId);
    if (!targetDev) return;

    setSelectedScannerDevice(deviceId);

    const timestamp = new Date().toLocaleTimeString();
    setHandshakeProgress(100);
    setHandshakeLogs([
      `[${timestamp}] 📡 ONE-TAP BROADCAST SHIELD ACTIVATED`,
      `[${timestamp}] ⚡ High-priority Decentralized Opt-out frame dispatched...`,
      `[${timestamp}] 🔒 Local firmware censor overlay injected successfully!`,
      `[${timestamp}] ✅ SHIELD COMPLIANCE ENFORCED: ${targetDev.name} is now actively blurred.`
    ]);

    // Mark as secured instantly
    setScannedDevices(prev => prev.map(d => d.id === deviceId ? { 
      ...d, 
      complianceStatus: 'secured',
      complianceType: citizenState.privacyLevel === 'none' ? 'strict_blur' : citizenState.privacyLevel
    } : d));

    // Update heatmap simulatedThreat state to censored (green)
    setSimulatedThreats(prev => prev.map(t => {
      if (t.id === `t-dis-${deviceId}` || t.name === targetDev.name) {
        return { ...t, status: 'censored' };
      }
      return t;
    }));

    // Alert toast & logger trigger
    const distance = parseFloat((Math.abs(targetDev.signalStrength + 30) * 0.12).toFixed(1));
    const shieldPref = citizenState.privacyLevel === 'none' ? 'STRICT BLUR' : citizenState.privacyLevel.toUpperCase().replace('_', ' ');

    addLog({
      deviceModel: targetDev.name,
      action: 'censored',
      shieldApplied: shieldPref,
      distance,
      rotatedId: `BLE-SHIELD-${targetDev.mac.replace(/:/g, '').substring(0, 6)}`,
    });

    // Provide immediate small physical device haptic/vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Heatmap States
  const [selectedHeatmapLocation, setSelectedHeatmapLocation] = useState<string>('cafe');
  const [heatmapPinging, setHeatmapPinging] = useState(false);
  const [simulatedThreats, setSimulatedThreats] = useState<Array<{
    id: string;
    name: string;
    type: 'glasses' | 'drone' | 'camera';
    x: number; // percentage from center
    y: number; // percentage from center
    distance: number;
    timestamp: string;
    status: 'censored' | 'discovered';
  }>>([
    { id: 't1', name: 'Meta Ray-Ban v2', type: 'glasses', x: 25, y: -20, distance: 5.4, timestamp: '15:42:10', status: 'censored' },
    { id: 't2', name: 'Apple Vision Wear v2', type: 'glasses', x: -45, y: 35, distance: 12.1, timestamp: '15:39:45', status: 'censored' },
    { id: 't3', name: 'SpyCam Spectator v1', type: 'camera', x: 15, y: 40, distance: 8.2, timestamp: '15:15:30', status: 'censored' }
  ]);

  const handleInjectThreat = () => {
    const devices = [
      { name: 'Snap Spectacles v4', type: 'glasses' as const },
      { name: 'DJI Mini Privacy Drone', type: 'drone' as const },
      { name: 'Samsung SmartCam v3', type: 'camera' as const },
      { name: 'Meta Ray-Ban v3 (Nearby)', type: 'glasses' as const }
    ];
    const base = devices[Math.floor(Math.random() * devices.length)];
    // Random angle and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = parseFloat((Math.random() * 14 + 2).toFixed(1));
    // Factor converts distance relative to rangeMeters
    const limitRange = citizenState.rangeMeters || 12;
    const factor = (distance / limitRange) * 45; // scale to fit canvas gracefully
    const x = Math.round(Math.cos(angle) * factor);
    const y = Math.round(Math.sin(angle) * factor);
    
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    
    const status = citizenState.privacyLevel === 'none' ? 'discovered' : 'censored';

    const newThreat = {
      id: `threat-${Math.random().toString(36).substring(2, 7)}`,
      name: base.name,
      type: base.type,
      x,
      y,
      distance,
      timestamp: timeStr,
      status: status as any
    };

    setSimulatedThreats(prev => [newThreat, ...prev].slice(0, 15)); // Keep last 15
    
    // Add to logs
    addLog({
      deviceModel: base.name,
      action: status,
      shieldApplied: citizenState.privacyLevel === 'none' ? 'SOCIAL OVERLAY' : citizenState.privacyLevel.toUpperCase().replace('_', ' '),
      distance: distance,
      rotatedId: citizenState.anonymousId,
    });
  };

  // Triggering the opt-out handshake simulation
  const triggerHandshakeSimulation = (deviceId: string) => {
    const targetDev = scannedDevices.find(d => d.id === deviceId);
    if (!targetDev) return;

    // Start handshake
    setSelectedScannerDevice(deviceId);
    setHandshakeProgress(0);
    setHandshakeLogs([
      `[${new Date().toLocaleTimeString()}] 🔍 Initiating BlurBubble security handshake with ${targetDev.name}...`,
      `[${new Date().toLocaleTimeString()}] 📡 Querying local hardware broadcast range...`
    ]);

    // Update state to handshaking
    setScannedDevices(prev => prev.map(d => d.id === deviceId ? { ...d, complianceStatus: 'handshaking' } : d));

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setHandshakeProgress(currentProgress);

      const timestamp = new Date().toLocaleTimeString();

      if (currentProgress === 20) {
        setHandshakeLogs(prev => [
          ...prev,
          `[${timestamp}] ⚙️ Establishing localized BLE-NAN connection (MAC: ${targetDev.mac})`
        ]);
      } else if (currentProgress === 40) {
        setHandshakeLogs(prev => [
          ...prev,
          `[${timestamp}] 🔑 Exchanging dynamic ECDH-P256 cryptographic session tokens`
        ]);
      } else if (currentProgress === 60) {
        setHandshakeLogs(prev => [
          ...prev,
          `[${timestamp}] 📦 Broadcasting BlurBubble registered opt-out payload (Signal Type: BLE)`
        ]);
      } else if (currentProgress === 80) {
        const shieldPref = citizenState.privacyLevel.toUpperCase().replace('_', ' ');
        setHandshakeLogs(prev => [
          ...prev,
          `[${timestamp}] 🛡️ Censor instruction dispatched: Apply shield [${shieldPref}]`
        ]);
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setHandshakeProgress(100);
        setHandshakeLogs(prev => [
          ...prev,
          `[${timestamp}] ✅ HANDSHAKE COMPLETED • Opt-out acknowledged by smart lens`,
          `[${timestamp}] 🔒 Censor Shield verified successfully.`
        ]);

        // Mark as secured
        setScannedDevices(prev => prev.map(d => d.id === deviceId ? { 
          ...d, 
          complianceStatus: 'secured',
          complianceType: citizenState.privacyLevel
        } : d));

        // Add to main application logs
        addLog({
          deviceModel: targetDev.name,
          action: citizenState.privacyLevel === 'magic_removal' ? 'erased' : 'censored',
          shieldApplied: citizenState.privacyLevel.toUpperCase().replace('_', ' '),
          distance: parseFloat((Math.abs(targetDev.signalStrength + 30) * 0.12).toFixed(1)),
          rotatedId: `BLE-SEC-${targetDev.mac.replace(/:/g, '').substring(0, 6)}`,
        });
      }
    }, 400);
  };

  // Default simulated pedestrians
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>([
    {
      id: 'ped-1',
      name: 'Elena Rostova',
      avatarSeed: 'elena',
      isBroadcasting: true,
      privacyLevel: 'strict_blur',
      posX: 15,
      posY: 55,
      speed: 0.12,
      direction: 'right',
      signalStrength: -68,
    },
    {
      id: 'ped-2',
      name: 'Dr. Hiroshi Tanaka',
      avatarSeed: 'hiroshi',
      isBroadcasting: true,
      privacyLevel: 'black_bar',
      posX: 38,
      posY: 52,
      speed: 0.08,
      direction: 'left',
      signalStrength: -54,
    },
    {
      id: 'ped-3',
      name: 'Sarah Jenkins',
      avatarSeed: 'sarah',
      isBroadcasting: true,
      privacyLevel: 'none', // Opt-In Social Discovery
      socialProfile: {
        username: '@sarah_creates',
        bio: 'AR/VR Product Designer. Looking for tech co-founders! 🚀',
        interests: ['AR Tech', 'UX Design', 'Climbing'],
        link: '#'
      },
      posX: 72,
      posY: 58,
      speed: 0.15,
      direction: 'right',
      signalStrength: -42,
    },
    {
      id: 'ped-4',
      name: 'Bystander (Unregistered)',
      avatarSeed: 'unregistered',
      isBroadcasting: false,
      privacyLevel: 'none',
      posX: 88,
      posY: 50,
      speed: 0.09,
      direction: 'left',
      signalStrength: -95,
    }
  ]);

  // Merge citizen phone and registered children smart tags into active pedestrians dynamically
  const getDynamicPedestrians = (): Pedestrian[] => {
    const list = [...pedestrians];

    // If citizen themselves is broadcasting, inject Paul
    if (citizenState.isBroadcasting) {
      const citizenPed: Pedestrian = {
        id: 'citizen-alex',
        name: 'Paul (Myself)',
        avatarSeed: 'alexander',
        isBroadcasting: true,
        privacyLevel: citizenState.privacyLevel,
        posX: 52,
        posY: 56,
        speed: 0.04,
        direction: 'right',
        signalStrength: -44,
        socialProfile: citizenState.privacyLevel === 'none'
          ? (citizenState.decoyPersonaBroadcast 
              ? {
                  username: '@anon_citizen_842',
                  bio: 'Decoy Identity Profile. Enforced by BlurBubble Privacy Shield.',
                  interests: ['Privacy', 'Stealth', 'Tactical'],
                  link: '#'
                }
              : ((citizenState.adversarialPoisoning || citizenState.rfc9402SocialBlock || citizenState.regulatoryCeaseAndDesist) ? undefined : citizenState.socialProfile)
            )
          : undefined
      };
      // Keep alex near the center
      list.push(citizenPed);
    }

    // Inject any active registered smart tags (e.g., child backpacks, jackets)
    citizenState.registeredEntities.forEach((entity, index) => {
      if (entity.isActive) {
        // Distribute them evenly
        const xOffset = 25 + index * 18;
        const tagPed: Pedestrian = {
          id: entity.id,
          name: entity.name,
          avatarSeed: entity.type === 'smart_tag' ? 'child' : 'wearer',
          isBroadcasting: true,
          privacyLevel: entity.privacyLevel,
          isChildTag: entity.type === 'smart_tag',
          parentName: 'Paul Gordon Stuart',
          posX: (xOffset % 80) + 10,
          posY: 54,
          speed: 0.06,
          direction: index % 2 === 0 ? 'right' : 'left',
          signalStrength: -50 - Math.round(Math.random() * 15)
        };
        list.push(tagPed);
      }
    });

    return list;
  };

  const activePedestriansList = getDynamicPedestrians();

  const [selectedPedestrian, setSelectedPedestrian] = useState<string | null>(null);
  const [recordActive, setRecordActive] = useState(true);
  const [glassesTemp, setGlassesTemp] = useState(36.8); // Celsius

  // Web camera activation
  const startWebcam = async () => {
    const session = ++webcamSessionRef.current;
    try {
      setWebcamError(null);
      setUseVirtualWebcam(false);
      
      const videoConstraints: any = {
        width: 640,
        height: 480,
        frameRate: { ideal: 240, max: 240 }
      };

      if (selectedWebcamId) {
        videoConstraints.deviceId = { exact: selectedWebcamId };
      } else {
        videoConstraints.facingMode = webcamFacingMode;
      }

      // Request up to 240Hz/FPS recording device stream constraints
      const constraints: MediaStreamConstraints = {
        video: videoConstraints
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (session !== webcamSessionRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Query native track configuration to match physical recording device FPS
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.frameRate) {
          const fps = Math.round(settings.frameRate);
          setDetectedCameraFps(fps > 0 ? fps : 60);
          addLog({
            deviceModel: 'CAMERA_HARDWARE',
            action: 'discovered',
            shieldApplied: `DYNAMIC_FPS_SYNC_INITIALIZED`,
            distance: 0,
            rotatedId: `${fps}HZ_CAP`
          });
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
          if (e.name !== 'AbortError' && !e.message?.includes('interrupted')) {
            console.warn("Video play safely ignored: ", e);
          }
        });
        setWebcamActive(true);
      }
    } catch (err: any) {
      if (session !== webcamSessionRef.current) {
        return;
      }
      console.error(err);
      setWebcamError(
        err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access in metadata / frame options to test the webcam live-blur overlay!' 
          : 'Could not access the web camera. Ensure no other apps are using it, or use the interactive Street Sim instead.'
      );
      setWebcamActive(false);
      setUseVirtualWebcam(true); // Failover to Virtual NPU Sandbox instead of empty/error screen
    }
  };

  const stopWebcam = () => {
    webcamSessionRef.current++;
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [activeTab, webcamFacingMode, selectedWebcamId]);

  // Dynamic Loader for Google TensorFlow.js and BlazeFace Edge AI Models
  useEffect(() => {
    if (!useEdgeAiModel || edgeAiModel || edgeAiModelLoading) return;

    const loadScriptsAndModel = async () => {
      setEdgeAiModelLoading(true);
      setEdgeAiModelError(null);
      try {
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
          });
        };

        addLog({
          deviceModel: 'EDGE_AI_ENGINE',
          action: 'discovered',
          shieldApplied: 'LOADING_TENSORFLOW_JS',
          distance: 0,
          rotatedId: 'TFJS_LOAD'
        });

        // Load TensorFlow.js
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');

        addLog({
          deviceModel: 'EDGE_AI_ENGINE',
          action: 'discovered',
          shieldApplied: 'LOADING_BLAZEFACE_MODEL',
          distance: 0,
          rotatedId: 'BLAZEFACE_LOAD'
        });

        // Load BlazeFace model
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js');

        // Allow global variables a slight binding tick
        await new Promise(r => setTimeout(r, 600));

        if (!(window as any).blazeface) {
          throw new Error('BlazeFace core library global not found after loading scripts.');
        }

        const model = await (window as any).blazeface.load();
        setEdgeAiModel(model);
        setEdgeAiModelLoading(false);
        addLog({
          deviceModel: 'EDGE_AI_ENGINE',
          action: 'censored',
          shieldApplied: 'EDGE_AI_MODEL_ARMED',
          distance: 0,
          rotatedId: 'BLAZE_OK'
        });
        playHudSound('success');
      } catch (err: any) {
        console.error("Failed to load BlazeFace:", err);
        setEdgeAiModelError(err.message || 'Error loading TensorFlow/BlazeFace scripts.');
        setEdgeAiModelLoading(false);
        setUseEdgeAiModel(false);
      }
    };

    loadScriptsAndModel();
  }, [useEdgeAiModel]);

  // Initialize Web Worker for high-frequency background image processing
  useEffect(() => {
    // Dynamically instantiate the worker in a standard Vite & browser compliant fashion
    const worker = new Worker(new URL('../lib/blur.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { pixels, duration, wasmActive } = e.data;
      isWorkerBusy.current = false;

      const canvas = wasmCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Draw the processed image buffer back instantly
      const imgData = new ImageData(new Uint8ClampedArray(pixels), w, h);
      ctx.putImageData(imgData, 0, 0);

      // Draw active emoji decoration on top of the blurred viewport if selected
      const currentPrivacyLevel = citizenState.privacyLevel;
      if (currentPrivacyLevel === 'emoji') {
        ctx.font = `${Math.round(w * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const emojis = ['🤫', '🕶️', '🔒', '🛡️', '👽', '👁️'];
        const charCode = citizenState.anonymousId ? citizenState.anonymousId.charCodeAt(0) : 65;
        ctx.fillText(emojis[charCode % 6], w / 2, h / 2);
      }

      // Update benchmarking statistics
      setWasmStats((prev) => ({
        ...prev,
        wasmLatency: wasmActive ? parseFloat(duration.toFixed(2)) : 0,
        jsLatency: !wasmActive ? parseFloat(duration.toFixed(2)) : 0,
        wasmActive: wasmActive,
      }));
    };

    return () => {
      worker.terminate();
    };
  }, [citizenState.privacyLevel, citizenState.anonymousId]);

  // WebAssembly & High-Performance Vectorized Image Processing Frame Loop
  useEffect(() => {
    let scheduleId: any;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsVal = 60;

    // Create persistent offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    const scheduleNextFrame = (callback: () => void) => {
      const video = videoRef.current;
      if (trackingFpsLimit === 'auto') {
        if (!useVirtualWebcam && video && (video as any).requestVideoFrameCallback) {
          return (video as any).requestVideoFrameCallback(callback);
        } else {
          return requestAnimationFrame(callback);
        }
      } else {
        const delay = 1000 / (trackingFpsLimit as number);
        return setTimeout(callback, delay);
      }
    };

    const cancelScheduledFrame = (id: any) => {
      const video = videoRef.current;
      if (trackingFpsLimit === 'auto') {
        if (!useVirtualWebcam && video && (video as any).cancelVideoFrameCallback) {
          (video as any).cancelVideoFrameCallback(id);
        } else {
          cancelAnimationFrame(id);
        }
      } else {
        clearTimeout(id);
      }
    };

    const renderLoop = () => {
      const canvas = wasmCanvasRef.current;
      if (!canvas || !offscreenCtx) {
        scheduleId = scheduleNextFrame(renderLoop);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Track FPS
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsVal = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        setWasmStats((prev) => ({ ...prev, fps: fpsVal }));
      }

      let sourceLoaded = false;
      const isMirrored = webcamFacingMode === 'user' && !selectedWebcamId;
      
      // Capture from real video or virtual stream
      if (!useVirtualWebcam && videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const vW = video.videoWidth || 640;
        const vH = video.videoHeight || 480;

        // Bounding box for face/body based on percentage
        // In real webcam, the video is scale-x-[-1] (mirrored in UI) when mirrored, so let's adjust the x center.
        const centerPercentX = isMirrored ? (1 - (blurPosition.x / 100)) : (blurPosition.x / 100); 
        const centerPercentY = blurPosition.y / 100;

        const cropW = aiTrackingMode === 'body' ? Math.round(vW * 0.22) : Math.round(vW * 0.25);
        const cropH = aiTrackingMode === 'body' ? Math.round(vH * 0.5) : Math.round(vW * 0.25);

        const cropX = Math.max(0, Math.min(vW - cropW, Math.round(centerPercentX * vW - cropW / 2)));
        const cropY = Math.max(0, Math.min(vH - cropH, Math.round(centerPercentY * vH - cropH / 2)));

        offscreenCanvas.width = w;
        offscreenCanvas.height = h;

        offscreenCtx.clearRect(0, 0, w, h);
        offscreenCtx.save();
        if (isMirrored) {
          offscreenCtx.scale(-1, 1); // Unmirror the sub-image to match viewport
          offscreenCtx.drawImage(video, cropX, cropY, cropW, cropH, -w, 0, w, h);
        } else {
          offscreenCtx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, w, h);
        }
        offscreenCtx.restore();
        sourceLoaded = true;
      } else {
        // Virtual webcam simulator stream
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
        offscreenCtx.fillStyle = '#090d16';
        offscreenCtx.fillRect(0, 0, w, h);

        // Tech grid lines on offscreen
        offscreenCtx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
        offscreenCtx.lineWidth = 1;
        for (let i = 0; i < w; i += 16) {
          offscreenCtx.beginPath();
          offscreenCtx.moveTo(i, 0);
          offscreenCtx.lineTo(i, h);
          offscreenCtx.stroke();
        }
        for (let i = 0; i < h; i += 16) {
          offscreenCtx.beginPath();
          offscreenCtx.moveTo(0, i);
          offscreenCtx.lineTo(w, i);
          offscreenCtx.stroke();
        }

        // Animated target face silhouette
        offscreenCtx.strokeStyle = '#34d399';
        offscreenCtx.fillStyle = 'rgba(52, 211, 153, 0.05)';
        offscreenCtx.lineWidth = 1.5;

        const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.05;
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.35 * pulse;

        // Draw face contour
        offscreenCtx.beginPath();
        offscreenCtx.arc(cx, cy, r, 0, Math.PI * 2);
        offscreenCtx.fill();
        offscreenCtx.stroke();

        // Eyes
        offscreenCtx.fillStyle = '#34d399';
        offscreenCtx.beginPath();
        offscreenCtx.arc(cx - r * 0.4, cy - r * 0.2, r * 0.08, 0, Math.PI * 2);
        offscreenCtx.arc(cx + r * 0.4, cy - r * 0.2, r * 0.08, 0, Math.PI * 2);
        offscreenCtx.fill();

        // Warning scan lines
        offscreenCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        offscreenCtx.strokeRect(cx - r, cy - r, r * 2, r * 2);

        sourceLoaded = true;
      }

      if (sourceLoaded) {
        const currentPrivacyLevel = citizenState.privacyLevel;
        const isPrivacyActive = currentPrivacyLevel === 'strict_blur' || currentPrivacyLevel === 'pixelate' || currentPrivacyLevel === 'emoji' || citizenState.emergencyPrivacyActive;

        if (isPrivacyActive && workerRef.current && !isWorkerBusy.current) {
          const imgData = offscreenCtx.getImageData(0, 0, w, h);
          isWorkerBusy.current = true;
          // Dispatch to worker thread using a zero-copy transferable ArrayBuffer!
          workerRef.current.postMessage({
            pixels: imgData.data.buffer,
            width: w,
            height: h,
            privacyLevel: currentPrivacyLevel,
            rangeMeters: citizenState.rangeMeters,
            emergencyPrivacyActive: citizenState.emergencyPrivacyActive,
          }, [imgData.data.buffer]);
        } else if (!isPrivacyActive) {
          // If privacy filters are inactive, copy directly to the main canvas instantly
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(offscreenCanvas, 0, 0);
          }
        }
      }

      scheduleId = scheduleNextFrame(renderLoop);
    };

    scheduleId = scheduleNextFrame(renderLoop);
    return () => cancelScheduledFrame(scheduleId);
  }, [useVirtualWebcam, citizenState.privacyLevel, citizenState.rangeMeters, citizenState.emergencyPrivacyActive, blurPosition, aiTrackingMode, trackingFpsLimit, detectedCameraFps]);

  // Handle Dragging of the Blur calibration target in Webcam view
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingBlur(true);
    setAiTrackingActive(false); // Disable AI tracking if user decides to manually place overlay
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBlur || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const finalX = Math.max(10, Math.min(90, x));
    const finalY = Math.max(10, Math.min(90, y));
    setBlurPosition((prev) => ({
      x: finalX,
      y: finalY,
      scale: prev.scale ?? 1.0,
    }));
    // Sync Kalman state to prevent jumps upon re-enabling tracking
    kalmanXStateRef.current = { x: finalX, p: 1.0 };
    kalmanYStateRef.current = { y: finalY, p: 1.0 };
  };

  const handleMouseUp = () => {
    setIsDraggingBlur(false);
  };

  // Real or Simulated AI Face and Body tracking movement
  useEffect(() => {
    if (!aiTrackingActive || activeTab !== 'webcam' || (!webcamActive && !useVirtualWebcam)) return;

    let tick = 0;
    let scheduleId: any;
    let isProcessing = false;
    
    // Create a tiny offscreen canvas for high-performance pixel analysis
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 30;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scheduleNextFrame = (callback: () => void) => {
      const video = videoRef.current;
      if (trackingFpsLimit === 'auto') {
        if (!useVirtualWebcam && video && (video as any).requestVideoFrameCallback) {
          return (video as any).requestVideoFrameCallback(callback);
        } else {
          return requestAnimationFrame(callback);
        }
      } else {
        const delay = 1000 / (trackingFpsLimit as number);
        return setTimeout(callback, delay);
      }
    };

    const cancelScheduledFrame = (id: any) => {
      const video = videoRef.current;
      if (trackingFpsLimit === 'auto') {
        if (!useVirtualWebcam && video && (video as any).cancelVideoFrameCallback) {
          (video as any).cancelVideoFrameCallback(id);
        } else {
          cancelAnimationFrame(id);
        }
      } else {
        clearTimeout(id);
      }
    };
    
    // Use async tracker for high-performance FaceDetector compatibility
    const runTrackerFrame = async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        tick += 0.04 * aiSwaySpeed;

        let targetX = 50;
        let targetY = 40;
        let targetScale = 1.0;
        let detectedRealFace = false;
        const isMirrored = webcamFacingMode === 'user' && !selectedWebcamId;

        // Try actual real-time image analysis of the live webcam stream
        if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
          try {
            ctx.drawImage(videoRef.current, 0, 0, 40, 30);
            const imgData = ctx.getImageData(0, 0, 40, 30);
            const data = imgData.data;

            // Layer 0: High-Fidelity Edge AI TensorFlow.js BlazeFace Engine
            let faceDetectorSuccess = false;
            if (useEdgeAiModel && edgeAiModel) {
              try {
                const predictions = await edgeAiModel.estimateFaces(videoRef.current, false);
                if (predictions && predictions.length > 0) {
                  const prediction = predictions[0];
                  const start = prediction.topLeft;
                  const end = prediction.bottomRight;
                  const width = end[0] - start[0];
                  const height = end[1] - start[1];
                  const vWidth = videoRef.current.videoWidth || 640;
                  const vHeight = videoRef.current.videoHeight || 480;
                  
                  // Align coordinates with center of the face rather than the forehead.
                  // If high-resolution landmarks are available, average the eyes, nose tip, and mouth center.
                  let cx = start[0] + width / 2;
                  let cy = start[1] + height * 0.58; // Default to 58% down the bounding box (eyes/nose level) instead of 50%
                  
                  if (prediction.landmarks && prediction.landmarks.length >= 4) {
                    const lms = prediction.landmarks;
                    const eyeRight = lms[0];
                    const eyeLeft = lms[1];
                    const nose = lms[2];
                    const mouth = lms[3];
                    if (eyeRight && eyeLeft && nose && mouth) {
                      cx = (eyeRight[0] + eyeLeft[0] + nose[0] + mouth[0]) / 4;
                      cy = (eyeRight[1] + eyeLeft[1] + nose[1] + mouth[1]) / 4;
                    }
                  }
                  
                  const mapped = mapCoordsWithAspectCrop(cx, cy, vWidth, vHeight);
                  targetX = mapped.x;
                  targetY = mapped.y;
                  
                  // Calculate face size relative to frame width to determine depth/scale
                  targetScale = Math.max(0.4, Math.min(2.4, (width / vWidth) / 0.18));
                  
                  // Mirror coordinate since camera view is flipped scale-x-[-1] ONLY when mirrored in UI
                  if (isMirrored) {
                    targetX = 100 - targetX;
                  }
                  
                  // Keep inside comfortable visual bounds
                  targetX = Math.max(12, Math.min(88, targetX));
                  targetY = Math.max(12, Math.min(88, targetY));
                  
                  detectedRealFace = true;
                  faceDetectorSuccess = true;
                }
              } catch (blazeErr) {
                console.warn("BlazeFace inference skipped: ", blazeErr);
              }
            }

            // Layer 1: Native hardware-accelerated FaceDetector API (Shape Detection API)
            if (!faceDetectorSuccess && 'FaceDetector' in window) {
              try {
                const FaceDetectorConstructor = (window as any).FaceDetector;
                const faceDetector = new FaceDetectorConstructor({ fastMode: true });
                const faces = await faceDetector.detect(videoRef.current);
                if (faces && faces.length > 0) {
                  const face = faces[0];
                  const { x, y, width, height } = face.boundingBox;
                  const vWidth = videoRef.current.videoWidth || 640;
                  const vHeight = videoRef.current.videoHeight || 480;
                  
                  // Calculate face size relative to frame width to determine depth/scale
                  targetScale = Math.max(0.4, Math.min(2.4, (width / vWidth) / 0.18));
                  
                  // Get centroid of face and map to 100% viewport space taking webcam aspect-crop into account.
                  // Shift down from the forehead (50% level) to eyes/nose center (58% level).
                  const cx = x + width / 2;
                  const cy = y + height * 0.58;
                  const mapped = mapCoordsWithAspectCrop(cx, cy, vWidth, vHeight);
                  targetX = mapped.x;
                  targetY = mapped.y;
                  
                  // Mirror coordinate since camera view is flipped scale-x-[-1] ONLY when mirrored in UI
                  if (isMirrored) {
                    targetX = 100 - targetX;
                  }
                  
                  // Keep inside comfortable visual bounds
                  targetX = Math.max(12, Math.min(88, targetX));
                  targetY = Math.max(12, Math.min(88, targetY));
                  
                  detectedRealFace = true;
                  faceDetectorSuccess = true;
                }
              } catch (detectorErr) {
                // Fail silently and let chrominance fallback take over
              }
            }

            // Layer 2: Optimized Integral-Image Chrominance HSL Density Cluster Tracker
            if (!faceDetectorSuccess) {
              const skinGrid = new Uint8Array(40 * 30);
              for (let y = 0; y < 30; y++) {
                for (let x = 0; x < 40; x++) {
                  const idx = (y * 40 + x) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];

                  // Convert RGB to HSL to ignore shadow, shine and glare variations (lighting-invariant)
                  const rf = r / 255;
                  const gf = g / 255;
                  const bf = b / 255;
                  const maxVal = Math.max(rf, gf, bf);
                  const minVal = Math.min(rf, gf, bf);
                  let h = 0;
                  let s = 0;
                  const l = (maxVal + minVal) / 2;

                  if (maxVal !== minVal) {
                    const d = maxVal - minVal;
                    s = l > 0.5 ? d / (2 - maxVal - minVal) : d / (maxVal + minVal);
                    if (maxVal === rf) {
                      h = (gf - bf) / d + (gf < bf ? 6 : 0);
                    } else if (maxVal === gf) {
                      h = (bf - rf) / d + 2;
                    } else {
                      h = (rf - gf) / d + 4;
                    }
                    h /= 6;
                  }

                  // Robust skin color rules combining lighting-invariant HSL with RGB thresholding
                  const isSkinRGB = r > 45 && g > 30 && b > 15 && (r - g > 6) && (r > g) && (r > b) && (Math.max(r, g, b) - Math.min(r, g, b) > 10);
                  const isSkinHSL = ((h >= 0 && h <= 0.18) || (h >= 0.82 && h <= 1.0)) && (s >= 0.06 && s <= 0.85) && (l >= 0.05 && l <= 0.95);
                  skinGrid[y * 40 + x] = (isSkinHSL || isSkinRGB) ? 1 : 0;
                }
              }

              // Build Summed-Area Table (Integral Image) for high-speed density window querying
              const integral = new Int32Array(40 * 30);
              for (let y = 0; y < 30; y++) {
                let rowSum = 0;
                for (let x = 0; x < 40; x++) {
                  rowSum += skinGrid[y * 40 + x];
                  integral[y * 40 + x] = rowSum + (y > 0 ? integral[(y - 1) * 40 + x] : 0);
                }
              }

              // Dynamic sliding window size based on active tracking mode (Face vs Body)
              const winW = aiTrackingMode === 'body' ? 16 : 12;
              const winH = aiTrackingMode === 'body' ? 20 : 12;
              const minMatches = aiTrackingMode === 'body' ? 20 : 8; // Lowered to 8 matches to make face detection highly sensitive and avoid lag

              let maxSkinCount = 0;
              let bestWinX = 14;
              let bestWinY = 9;

              for (let wy = 0; wy <= 30 - winH; wy++) {
                for (let wx = 0; wx <= 40 - winW; wx++) {
                  const x1 = wx;
                  const y1 = wy;
                  const x2 = wx + winW - 1;
                  const y2 = wy + winH - 1;

                  let count = integral[y2 * 40 + x2];
                  if (x1 > 0) count -= integral[y2 * 40 + (x1 - 1)];
                  if (y1 > 0) count -= integral[(y1 - 1) * 40 + x2];
                  if (x1 > 0 && y1 > 0) count += integral[(y1 - 1) * 40 + (x1 - 1)];

                  if (count > maxSkinCount) {
                    maxSkinCount = count;
                    bestWinX = wx;
                    bestWinY = wy;
                  }
                }
              }

              // If we found a dense skin cluster
              if (maxSkinCount >= minMatches) {
                let sumX = 0;
                let sumY = 0;
                let weightSum = 0;
                for (let dy = 0; dy < winH; dy++) {
                  for (let dx = 0; dx < winW; dx++) {
                    const px = bestWinX + dx;
                    const py = bestWinY + dy;
                    if (skinGrid[py * 40 + px]) {
                      sumX += px;
                      sumY += py;
                      weightSum += 1;
                    }
                  }
                }

                if (weightSum > 0) {
                  const rawX = sumX / weightSum;
                  const rawY = sumY / weightSum;
                  
                  // Calculate scale based on density of matching skin cluster pixels to estimate size/depth
                  targetScale = Math.max(0.4, Math.min(2.4, weightSum / (aiTrackingMode === 'body' ? 70 : 45)));

                  // Convert to mirrored visual percentages (0-100) taking aspect crop into account.
                  // Shift rawY down slightly (+1.8 out of 30 pixels) to center on eyes/nose instead of forehead.
                  const mapped = mapCoordsWithAspectCrop(rawX, rawY + 1.8, 40, 30);
                  targetX = mapped.x;
                  targetY = mapped.y;

                  // Mirror coordinate since camera view is flipped scale-x-[-1] ONLY when mirrored in UI
                  if (isMirrored) {
                    targetX = 100 - targetX;
                  }

                  // Constrain to responsive viewport limits
                  targetX = Math.max(12, Math.min(88, targetX));
                  targetY = Math.max(12, Math.min(88, targetY));
                  detectedRealFace = true;
                }
              }
            }
          } catch (e) {
            console.warn("Real-time vision tracking fallback active:", e);
          }
        }

        // Apply manual calibration offsets to automatically tracked targets
        if (detectedRealFace && (!manualLockRef.current || manualLockRef.current.framesLeft <= 0)) {
          targetX = Math.max(5, Math.min(95, targetX + calibrationXOffset));
          targetY = Math.max(5, Math.min(95, targetY + calibrationYOffset));
        }

        // Apply manual lock coordinate override with frame count countdown
        if (manualLockRef.current && manualLockRef.current.framesLeft > 0) {
          targetX = manualLockRef.current.x;
          targetY = manualLockRef.current.y;
          detectedRealFace = true;
          manualLockRef.current.framesLeft--;
          if (manualLockRef.current.framesLeft <= 0) {
            manualLockRef.current = null;
          }
        }

        // Frame hysteresis: preserve lock on fast motion dropouts
        if (detectedRealFace) {
          framesSinceLastFaceRef.current = 0;
          lastFaceDetectedPosRef.current = { x: targetX, y: targetY };
        } else {
          framesSinceLastFaceRef.current += 1;
          if (framesSinceLastFaceRef.current < 150 && lastFaceDetectedPosRef.current) {
            targetX = lastFaceDetectedPosRef.current.x;
            targetY = lastFaceDetectedPosRef.current.y;
            detectedRealFace = true; // treat as locked for snappy interpolation
          }
        }

        // If we completely lost tracking (cooldown elapsed), float gracefully via dynamic drift
        if (!detectedRealFace) {
          if (aiTrackingMode === 'face') {
            targetX = 50 + Math.sin(tick * 0.8) * 8 + Math.cos(tick * 1.5) * 2;
            targetY = 38 + Math.cos(tick * 0.6) * 5 + Math.sin(tick * 1.1) * 1.5;
          } else if (aiTrackingMode === 'body') {
            targetX = 50 + Math.sin(tick * 0.4) * 16 + Math.cos(tick * 0.9) * 4;
            targetY = 56 + Math.cos(tick * 0.5) * 10 + Math.sin(tick * 0.8) * 2.5;
          }
          
          // Beautiful drift simulating moving closer and further (z-axis depth motion)
          targetScale = 1.0 + Math.sin(tick * 0.4) * 0.35;
        }

        let finalX = targetX;
        let finalY = targetY;

        if (kalmanEnabled) {
          // 1. Time Update / Prediction: P_k|k-1 = P_k-1|k-1 + Q
          const pX_predicted = kalmanXStateRef.current.p + kalmanQ;
          const pY_predicted = kalmanYStateRef.current.p + kalmanQ;

          // 2. Kalman Gain Calculation: K_k = P_k|k-1 / (P_k|k-1 + R)
          const kX = pX_predicted / (pX_predicted + kalmanR);
          const kY = pY_predicted / (pY_predicted + kalmanR);

          // 3. Measurement Update / Correction: x̂_k = x̂_k|k-1 + K_k * (z_k - x̂_k|k-1)
          const estX = kalmanXStateRef.current.x + kX * (targetX - kalmanXStateRef.current.x);
          const estY = kalmanYStateRef.current.y + kY * (targetY - kalmanYStateRef.current.y);

          // 4. Covariance Update: P_k = (1 - K_k) * P_k|k-1
          const pX_updated = (1 - kX) * pX_predicted;
          const pY_updated = (1 - kY) * pY_predicted;

          // Save state for recursive loop on subsequent frames
          kalmanXStateRef.current = { x: estX, p: pX_updated };
          kalmanYStateRef.current = { y: estY, p: pY_updated };

          finalX = estX;
          finalY = estY;
        } else {
          // Maintain system state parity when filtering is disabled
          kalmanXStateRef.current.x = targetX;
          kalmanYStateRef.current.y = targetY;
        }

        // Apply final coordinates to target mask position state
        setBlurPosition((prev) => {
          const prevScale = prev.scale ?? 1.0;
          const nextScale = parseFloat((prevScale + (targetScale - prevScale) * (detectedRealFace ? 0.12 : 0.08)).toFixed(3));
          
          if (kalmanEnabled) {
            return {
              x: parseFloat(finalX.toFixed(2)),
              y: parseFloat(finalY.toFixed(2)),
              scale: nextScale,
            };
          } else {
            const easeFactor = (detectedRealFace || useVirtualWebcam) ? 0.95 : 0.15;
            return {
              x: parseFloat((prev.x + (targetX - prev.x) * easeFactor).toFixed(2)),
              y: parseFloat((prev.y + (targetY - prev.y) * easeFactor).toFixed(2)),
              scale: nextScale,
            };
          }
        });

        // Holographic green scanning line
        setAiScanLineY((prev) => (prev + 2.5 * aiSwaySpeed) % 100);

      } finally {
        isProcessing = false;
        if (aiTrackingActive && activeTab === 'webcam' && (webcamActive || useVirtualWebcam)) {
          scheduleId = scheduleNextFrame(runTrackerFrame);
        }
      }
    };

    scheduleId = scheduleNextFrame(runTrackerFrame);
    return () => cancelScheduledFrame(scheduleId);
  }, [aiTrackingActive, aiTrackingMode, aiSwaySpeed, activeTab, webcamActive, useVirtualWebcam, useEdgeAiModel, edgeAiModel, trackingFpsLimit, detectedCameraFps, kalmanEnabled, kalmanQ, kalmanR, webcamFacingMode, selectedWebcamId]);

  // Log generation triggers when variables change
  useEffect(() => {
    if (activeTab === 'webcam' && (webcamActive || useVirtualWebcam) && citizenState.isBroadcasting) {
      const interval = setInterval(() => {
        if (citizenState.privacyLevel !== 'none') {
          addLog({
            deviceModel: 'BlurBubble AR Glasses v1.2',
            action: citizenState.privacyLevel === 'magic_removal' ? 'erased' : 'censored',
            shieldApplied: citizenState.privacyLevel.toUpperCase().replace('_', ' '),
            distance: Math.random() * 4 + 1.5,
            rotatedId: citizenState.anonymousId,
          });
        } else if (citizenState.socialProfile) {
          addLog({
            deviceModel: 'BlurBubble AR Glasses v1.2',
            action: 'discovered',
            shieldApplied: 'SOCIAL DISCOVERY',
            distance: Math.random() * 2 + 1,
            rotatedId: 'PUBLIC-HANDSHAKE',
          });
        }
      }, 12000); // add log every 12 seconds to not spam

      return () => clearInterval(interval);
    }
  }, [activeTab, webcamActive, citizenState, addLog]);

  // Street Pedestrians movement loop
  useEffect(() => {
    if (activeTab !== 'street') return;

    const interval = setInterval(() => {
      setPedestrians((prev) =>
        prev.map((ped) => {
          let nextX = ped.posX + (ped.direction === 'right' ? ped.speed : -ped.speed);
          let nextDir = ped.direction;
          
          if (nextX > 90) {
            nextX = 90;
            nextDir = 'left';
          } else if (nextX < 10) {
            nextX = 10;
            nextDir = 'right';
          }

          const signalFluctuation = Math.floor(Math.random() * 5) - 2;
          const distFromCenter = Math.abs(50 - nextX);
          const baseSignal = -30 - Math.round(distFromCenter * 0.9);

          return {
            ...ped,
            posX: nextX,
            direction: nextDir,
            signalStrength: Math.max(-95, Math.min(-30, baseSignal + signalFluctuation)),
          };
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle manual pedestrian edit
  const togglePedestrianBroadcast = (id: string) => {
    // Prevent overriding if it's a child smart tag or the user Paul (crypto lock)
    if (id.startsWith('tag-') || id === 'citizen-alex') return;

    setPedestrians((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextBroadcast = !p.isBroadcasting;
        
        if (nextBroadcast) {
          addLog({
            deviceModel: 'HUD Frame Speculator v2',
            action: p.privacyLevel === 'none' ? 'discovered' : 'censored',
            shieldApplied: p.privacyLevel.toUpperCase().replace('_', ' '),
            distance: Math.abs(50 - p.posX) * 0.3 + 1,
            rotatedId: Math.random().toString(36).substring(2, 10).toUpperCase(),
          });
        }

        return { ...p, isBroadcasting: nextBroadcast };
      })
    );
  };

  const changePedestrianShield = (id: string, level: PrivacyLevel) => {
    // Prevent overriding if it's a child smart tag or the user Paul (crypto lock)
    if (id.startsWith('tag-') || id === 'citizen-alex') return;

    setPedestrians((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        
        if (p.isBroadcasting) {
          addLog({
            deviceModel: 'HUD Frame Speculator v2',
            action: level === 'none' ? 'discovered' : 'censored',
            shieldApplied: level.toUpperCase().replace('_', ' '),
            distance: Math.abs(50 - p.posX) * 0.3 + 1,
            rotatedId: Math.random().toString(36).substring(2, 10).toUpperCase(),
          });
        }

        return { ...p, privacyLevel: level };
      })
    );
  };

  // Rendering Helpers for dynamic face blur overlays
  const getOverlayStyles = (level: PrivacyLevel) => {
    switch (level) {
      case 'magic_removal':
        return {
          backgroundImage: 'conic-gradient(from 0deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.4))',
          backdropFilter: 'blur(35px) saturate(0.2)',
          WebkitBackdropFilter: 'blur(35px) saturate(0.2)',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
          border: '1.5px solid rgba(16, 185, 129, 0.6)',
        };
      case 'strict_blur':
        return {
          backdropFilter: 'blur(80px) saturate(1.3) contrast(1.4) brightness(0.65)',
          WebkitBackdropFilter: 'blur(80px) saturate(1.3) contrast(1.4) brightness(0.65)',
          background: 'rgba(15, 23, 42, 0.85)', // Strong 85% slate opacity ensures perfect obscuration of facial features
          boxShadow: '0 0 45px rgba(16, 185, 129, 0.6)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
        };
      case 'pixelate':
        return {
          backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.98) 4px, transparent 0)',
          backgroundSize: '10px 10px',
          backdropFilter: 'blur(15px) saturate(0.3) brightness(0.7)',
          WebkitBackdropFilter: 'blur(15px) saturate(0.3) brightness(0.7)',
          background: 'rgba(15, 23, 42, 0.9)', // Extremely opaque 90% slate backing
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.5)',
          border: '2px solid rgba(245, 158, 11, 0.45)',
        };
      case 'emoji':
        return {
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px dashed #3b82f6',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
        };
      case 'black_bar':
        return {
          // Handled individually
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation & HUD info bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto">
          <button
            id="tab-network-scanner"
            onClick={() => {
              setActiveTab('scanner');
              playHudSound('beep');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scanner' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            BLE &amp; Wi-Fi Scanner
          </button>
          <button
            id="tab-live-webcam"
            onClick={() => {
              setActiveTab('webcam');
              playHudSound('beep');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'webcam' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Webcam HUD
          </button>
          <button
            id="tab-privacy-heatmap"
            onClick={() => {
              setActiveTab('heatmap');
              playHudSound('beep');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4 text-emerald-400" />
            Privacy Threat Map
          </button>
          <button
            id="tab-street-sim"
            onClick={() => {
              setActiveTab('street');
              playHudSound('beep');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'street' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            Virtual Street Sandbox
          </button>
          <button
            id="tab-audio-lab"
            onClick={() => {
              setActiveTab('audio-lab');
              playHudSound('beep');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audio-lab' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
            Vocal Scrambler Lab
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6 font-mono text-[10px] text-slate-400 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${recordActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <button id="toggle-rec-btn" onClick={() => {
              setRecordActive(!recordActive);
              playHudSound('beep');
            }} className="uppercase tracking-wider hover:text-white">
              {recordActive ? 'REC ● AR_STREAM' : 'REC_PAUSED'}
            </button>
          </div>
          <div className="hidden sm:block">
            GLS_TEMP: <span className="text-white">{glassesTemp.toFixed(1)}°C</span>
          </div>
          <div className="hidden sm:block">
            DECENTRAL_NET: <span className="text-emerald-400 uppercase">SYNCHRONIZED</span>
          </div>

          <button
            id="hud-hard-shutdown-btn"
            onClick={() => {
              if (confirmShutdown) {
                setHardShutdownInProgress(true);
                setConfirmShutdown(false);
                playHudSound('shutdown');
              } else {
                setConfirmShutdown(true);
                playHudSound('alarm');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 border ${
              confirmShutdown 
                ? 'bg-red-650 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]' 
                : 'bg-red-950/45 border-red-900/50 text-red-400 hover:bg-red-900 hover:text-white hover:border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
            }`}
          >
            <ShieldX className={`w-3.5 h-3.5 ${confirmShutdown ? 'animate-bounce text-white' : 'text-red-500'}`} />
            {confirmShutdown ? 'CONFIRM WIPE ⚠️' : 'Hard Shutdown'}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      {activeTab === 'audio-lab' ? (
        <AudioLab
          citizenState={citizenState}
          addLog={addLog}
          isActive={activeTab === 'audio-lab'}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Viewfinder Sandbox */}
        <div className="xl:col-span-8 bg-black rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
          {/* Hard Shutdown Shredding Animation Overlay */}
          {hardShutdownInProgress && (
            <div className="absolute inset-0 bg-red-950/95 border-2 border-red-500 z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center mb-4 animate-spin border-t-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]" style={{ animationDuration: '1.5s' }}>
                <ShieldX className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-red-500 tracking-widest uppercase mb-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-bounce" />
                COERCION THREAT / EMERGENCY SEIZURE DETECTED
              </h2>
              <div className="bg-red-900/20 border border-red-500/40 rounded-lg px-4 py-2 text-xs text-red-400 font-mono font-bold uppercase tracking-wider mb-4 max-w-lg">
                ⚠️ WIPING ALL VOLATILE ENCLAVE PROTOCOLS & CRYPTOGRAPHIC KEYS
              </div>
              
              <div className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-lg p-4 text-left text-[10px] text-red-400 space-y-1 h-36 overflow-y-auto">
                <p className="text-white font-bold">&gt; [CORE_INIT] DESTROY_LOCAL_CRYPTO_STACK()...</p>
                {wipingKeys.map((key, i) => (
                  <p key={i} className="text-red-400">&gt; ZERO_OUT: {key} ... [WIPED]</p>
                ))}
                <p className="text-red-500 animate-pulse">&gt; DELETING SECURE ENCLAVE CERTIFICATES...</p>
              </div>
            </div>
          )}

          {/* Hard Shutdown Complete Locked Overlay */}
          {hardShutdownComplete && (
            <div className="absolute inset-0 bg-black border-2 border-red-900 z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
              <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-950/60 flex items-center justify-center mb-4 text-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.3)]">
                <ShieldX className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-red-700 tracking-widest uppercase mb-1">
                SYSTEM ZEROED
              </h2>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest max-w-md leading-relaxed mb-6 font-mono">
                All secure hardware drivers disabled. Cryptographic key enclaves wiped. Local compliance handshakes revoked. No identifying data remains in volatile RAM.
              </div>
              <button
                id="hard-shutdown-restore-btn"
                onClick={() => {
                  setHardShutdownComplete(false);
                  setWipingKeys([]);
                  if (onChange) {
                    onChange(prev => ({
                      ...prev,
                      isBroadcasting: true,
                      registeredEntities: prev.registeredEntities.map(e => ({ ...e, isActive: true })),
                      anonymousId: "BB-" + Math.floor(10000000 + Math.random() * 90000000)
                    }));
                  }
                  addLog({
                    deviceModel: 'BLE_BROADCASTER',
                    action: 'discovered',
                    shieldApplied: 'KEYS_RESTORED',
                    distance: 1.0,
                    rotatedId: 'RECONSTRUCTED'
                  });
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[10px] rounded font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                Re-Authorize & Re-Generate Keys
              </button>
            </div>
          )}

          {/* Warrant Override Warning Bar */}
          {citizenState.overrideActive && !citizenState.emergencyPrivacyActive && showStatusBanners && !hideAllOverlays && (
            <div className="absolute top-0 inset-x-0 bg-red-950/90 border-b border-red-500/50 text-red-400 font-mono text-[9px] font-bold px-4 py-2 z-30 flex items-center justify-between gap-4 animate-pulse">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ⚠️ EMERGENCY COURT ORDER: MULTI-SIG OVERRIDE ACTIVE
              </span>
              <span>HARDWARE OPTICAL BLURRING PAUSED</span>
            </div>
          )}

          {/* Emergency Privacy Mode Bar */}
          {citizenState.emergencyPrivacyActive && showStatusBanners && !hideAllOverlays && (
            <div className="absolute top-0 inset-x-0 bg-red-600 border-b border-red-400 text-white font-mono text-[10px] font-extrabold px-4 py-2.5 z-40 flex items-center justify-between gap-4 animate-pulse">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-white shrink-0 animate-bounce" />
                🛑 BROADCAST INTERCEPT: HIGH-PRIORITY 'HARD OPT-OUT' SIGNAL RECEIVED
              </span>
              <span className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[8px] font-extrabold">EMERGENCY SHIELD ACTIVE</span>
            </div>
          )}

          {/* AR HUD static overlays */}
          {showLeftTelemetry && !hideAllOverlays && (
            <div className={`absolute ${citizenState.emergencyPrivacyActive ? 'top-14' : citizenState.overrideActive ? 'top-12' : 'top-4'} left-4 z-10 font-mono text-[10px] text-emerald-400 space-y-1 bg-black/40 p-2.5 rounded border border-emerald-500/15 backdrop-blur-sm pointer-events-none transition-all`}>
              <div className="flex items-center gap-1.5 font-bold">
                <Scan className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
                BLUR_BUBBLE HUD v2.0
              </div>
              <div>FPS: 60 / LATENCY: 4.1ms</div>
              <div>SHIELD_PROTOCOL: {citizenState.emergencyPrivacyActive ? 'EMERGENCY_FORCE_OPT_OUT' : citizenState.overrideActive ? 'BYPASS_ENFORCED' : 'compliance_strict'}</div>
              {citizenState.facialRecognitionOptOut && (
                <div className="text-blue-400 font-semibold animate-pulse">LOCAL_AI_FACE_SCAN: ACTIVE</div>
              )}
              {citizenState.overrideActive && !citizenState.emergencyPrivacyActive && (
                <div className="text-red-500 font-bold animate-pulse">WARRANT_BYPASS: ACTIVE</div>
              )}
              {citizenState.emergencyPrivacyActive && (
                <div className="text-red-500 font-bold animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  HARD_BLOCKOUT: ENFORCED
                </div>
              )}
            </div>
          )}

          {/********* Right side preference info label overlay *********/}
          {showRightTelemetry && !hideAllOverlays && (
            <div className="absolute top-4 right-4 z-10 pointer-events-none flex flex-col items-end">
              <div className="bg-black/50 border border-slate-800/80 p-2 rounded-lg backdrop-blur-sm text-right">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono">My Shield Pref</span>
                <div className="text-[11px] font-mono text-white flex items-center gap-1 mt-0.5 font-bold">
                  {citizenState.isBroadcasting ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {citizenState.privacyLevel.toUpperCase().replace('_', ' ')}
                    </>
                  ) : (
                    'STEALTH / OFF'
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webcam' ? (
            /* WEBCAM HUDFEED */
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleViewportClick}
              className="relative w-full aspect-video flex items-center justify-center bg-slate-950 select-none cursor-crosshair overflow-hidden"
            >
              {/* LiDAR Mode Scanner Overlay */}
              {lidarModeActive && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-emerald-950/20 mix-blend-screen overflow-hidden flex flex-col justify-between p-3 font-mono border-2 border-emerald-500/80 animate-pulse">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(52,211,153,0.3)_10%,transparent_80%)]" />
                  
                  <div className="absolute top-4 left-4 space-y-1 text-emerald-400 text-[10px] uppercase font-bold tracking-widest drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>[ ACTIVE LIDAR DEPTH RANGE ]</span>
                    </div>
                    <div>RANGE LIMIT: 45m SPATIAL RESOLUTION</div>
                    <div>FREQUENCY: 940nm INFRARED PULSED</div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 text-right space-y-0.5 text-emerald-400 text-[8px] drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]">
                    <div>REFRESH: 120 Hz</div>
                    <div>LATENCY: 1.2 ms NPU_PASS</div>
                    <div>DENSITY: 2.4 MILLION POINTS/SEC</div>
                  </div>

                  {/* Rotating targeting rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div 
                      className="w-48 h-48 border-2 border-dashed border-emerald-400/60 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="w-24 h-24 border border-dotted border-emerald-300/40 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* RF Static Noise Glitch Overlay */}
              {rfInterference > 0 && (
                <div 
                  className="absolute inset-0 z-40 pointer-events-none overflow-hidden mix-blend-screen bg-slate-950/20 flex items-center justify-center font-mono"
                  style={{ opacity: rfInterference / 100 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_10%,transparent_90%)] bg-[size:3px_3px] opacity-80 animate-pulse" />
                  <div className="absolute inset-y-0 w-full bg-[linear-gradient(rgba(255,255,255,0.08)_50%,transparent_50%)] bg-[size:100%_8px] opacity-70 animate-bounce" />
                  
                  <div 
                    className="absolute h-1 bg-white/40 w-full left-0 animate-ping"
                    style={{
                      top: `${Math.random() * 100}%`,
                      animationDuration: '0.15s',
                    }}
                  />

                  <div className="px-3 py-1 bg-black/90 border border-amber-500/80 rounded text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>[ ⚠️ SIGNAL INTERFERENCE DETECTED: {rfInterference}% ]</span>
                  </div>
                </div>
              )}
              {useVirtualWebcam ? (
                /* VIRTUAL WEBCAM NPU EMULATOR STREAM */
                <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {/* High-tech grid background */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 1.5px, transparent 1.5px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85 pointer-events-none" />

                  {/* Calibration concentric rings */}
                  {showCalibrationRings && !hideAllOverlays && (
                    <>
                      <div className="absolute w-[80%] aspect-square border border-slate-900/40 rounded-full pointer-events-none animate-pulse" />
                      <div className="absolute w-[50%] aspect-square border border-slate-900/20 rounded-full pointer-events-none" />
                      <div className="absolute w-[20%] aspect-square border border-slate-900/10 rounded-full pointer-events-none" style={{ strokeDasharray: '4 4' }} />
                    </>
                  )}

                  {/* Warning banner about camera permission being blocked */}
                  {webcamError && showCameraErrorAlert && !hideAllOverlays && (
                    <div className="absolute top-16 inset-x-4 bg-slate-900/95 border border-amber-500/40 text-amber-400 font-mono text-[10px] p-3 rounded-xl z-30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
                      <div className="flex items-start gap-2.5 leading-normal">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5 text-left">
                          <p className="font-bold">WEBCAM PERMISSION DENIED (IFRAME BLOCK)</p>
                          <p className="text-[9px] text-slate-400">Running in high-fidelity <strong>Virtual NPU Emulator Mode</strong>. Open in a New Tab to grant real webcam permissions!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={startWebcam}
                          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider cursor-pointer"
                        >
                          Retry Cam
                        </button>
                        <a 
                          href={window.location.href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          Open in New Tab ↗
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Stylized Glowing Wireframe Human Container (Moving dynamically at blurPosition) */}
                  {(showHolographicAvatar || showTargetTagLabel) && !hideAllOverlays && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${blurPosition.x}%`,
                        top: `${blurPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: aiTrackingMode === 'body' ? '140px' : '110px',
                        height: aiTrackingMode === 'body' ? '220px' : '110px',
                      }}
                      className="absolute pointer-events-none flex items-center justify-center transition-transform duration-100 ease-out"
                    >
                      {/* Glowing outer aura behind the simulated face/body */}
                      {showHolographicAvatar && (
                        <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
                      )}

                      {/* Vector outline representation of human */}
                      {showHolographicAvatar && (
                        <svg className="w-full h-full text-cyan-400/20 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]" viewBox="0 0 100 100" fill="none">
                          {aiTrackingMode === 'face' ? (
                            <g>
                              {/* Face outline */}
                              <ellipse cx="50" cy="50" rx="32" ry="40" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M 35,62 Q 50,74 65,62" stroke="currentColor" strokeWidth="1.5" /> {/* Smile */}
                              <ellipse cx="36" cy="44" rx="4" ry="6" stroke="currentColor" strokeWidth="1.5" /> {/* Left Eye */}
                              <ellipse cx="64" cy="44" rx="4" ry="6" stroke="currentColor" strokeWidth="1.5" /> {/* Right Eye */}
                              <circle cx="36" cy="44" r="2" fill="currentColor" />
                              <circle cx="64" cy="44" r="2" fill="currentColor" />
                              <path d="M 50,44 L 46,55 L 50,55" stroke="currentColor" strokeWidth="1.5" /> {/* Nose */}
                              <ellipse cx="50" cy="25" rx="18" ry="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" /> {/* Hair line */}
                            </g>
                          ) : (
                            <g>
                              {/* Body torso and limbs outline */}
                              <circle cx="50" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" /> {/* Head */}
                              <path d="M 50,32 L 50,72" stroke="currentColor" strokeWidth="2.5" /> {/* Spine */}
                              <path d="M 25,38 L 75,38" stroke="currentColor" strokeWidth="2" /> {/* Shoulders */}
                              <path d="M 25,38 L 20,58 L 15,75" stroke="currentColor" strokeWidth="1.5" /> {/* Left Arm */}
                              <path d="M 75,38 L 80,58 L 85,75" stroke="currentColor" strokeWidth="1.5" /> {/* Right Arm */}
                              <path d="M 50,72 L 35,95" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" /> {/* Left Leg */}
                              <path d="M 50,72 L 65,95" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" /> {/* Right Leg */}
                            </g>
                          )}
                        </svg>
                      )}

                      {/* Target tag text */}
                      {showTargetTagLabel && (
                        <div className="absolute -bottom-8 font-mono text-[7px] text-cyan-400 font-bold tracking-widest uppercase bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-950">
                          VIRTUAL_NPU_TARGET
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${webcamFacingMode === 'user' && !selectedWebcamId ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Floating Camera Selector */}
                  {webcamActive && !hideAllOverlays && (
                    <div className="absolute top-4 left-4 z-30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[80%] select-none">
                      {/* Facing Mode Toggle */}
                      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setWebcamFacingMode('user');
                            setSelectedWebcamId('');
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${
                            webcamFacingMode === 'user' && !selectedWebcamId
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Front Cam
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWebcamFacingMode('environment');
                            setSelectedWebcamId('');
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${
                            webcamFacingMode === 'environment' && !selectedWebcamId
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Back Cam
                        </button>
                      </div>

                      {/* Explicit Camera Select dropdown if multiple cameras exist */}
                      {availableCameras.length > 0 && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-1 shadow-xl flex items-center">
                          <select
                            id="webcam-device-select"
                            value={selectedWebcamId}
                            onChange={(e) => {
                              setSelectedWebcamId(e.target.value);
                            }}
                            className="bg-transparent text-slate-300 font-mono text-[9px] font-bold border-none outline-none focus:ring-0 max-w-[150px] cursor-pointer"
                          >
                            <option value="" className="bg-slate-950 text-slate-300">
                              Auto ({webcamFacingMode === 'user' ? 'Front' : 'Back'})
                            </option>
                            {availableCameras.map((device, i) => (
                              <option key={device.deviceId} value={device.deviceId} className="bg-slate-950 text-slate-300">
                                {device.label || `Camera ${i + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Floating Clean View Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setHideAllOverlays(!hideAllOverlays)}
                    className="absolute bottom-4 right-4 z-30 px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5 shadow-xl select-none cursor-pointer"
                    title={hideAllOverlays ? "Show all HUD and Censor overlays" : "Hide all overlays for a clean video feed"}
                  >
                    {hideAllOverlays ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>SHOW ALL OVERLAYS</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CLEAN VIEW (PURE STREAM)</span>
                      </>
                    )}
                  </button>
                  
                  {/* Floating Calibration Handshake Guide */}
                  {!citizenState.isBroadcasting && showGuidanceOverlay && !hideAllOverlays && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 p-6 text-center">
                      <div className="w-16 h-16 rounded-full border border-dashed border-slate-400/50 animate-spin flex items-center justify-center mb-3" style={{ animationDuration: '20s' }}>
                        <Info className="w-6 h-6 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-sm font-semibold text-white">Citizen Beacon is Off</p>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Turn your Citizen Beacon <strong className="text-emerald-400">ON</strong> in the left panel to test how smart glasses will immediately censor your webcam feed!
                      </p>
                    </div>
                  )}

                  {(citizenState.emergencyPrivacyActive || (citizenState.isBroadcasting && !citizenState.overrideActive)) && !hideAllOverlays && (
                    <>
                      {/* Interactive Holographic AI Grid HUD Overlay (Moves with the blur target) */}
                      {showDiagnostics && aiTrackingActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${blurPosition.x}%`,
                            top: `${blurPosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: aiTrackingMode === 'body' ? '180px' : '160px',
                            height: aiTrackingMode === 'body' ? '280px' : '160px',
                          }}
                          className="absolute pointer-events-none z-20 flex items-center justify-center font-mono"
                        >
                          {/* Corner Brackets */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                          {/* Scanner text on top */}
                          <div className="absolute -top-6 bg-slate-950/85 px-1.5 py-0.5 rounded border border-cyan-500/30 text-[7px] text-cyan-400 font-bold tracking-wider uppercase whitespace-nowrap">
                            {aiTrackingMode === 'face' ? '👁️ AI_LOCKED: FACE_MESH' : '🧍 AI_LOCKED: BODY_CONTOUR'} (99.4%)
                          </div>

                          {/* Active Scan Laser Line running down the box */}
                          <div 
                            className="absolute inset-x-0 h-[2px] bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                            style={{ top: `${aiScanLineY}%` }}
                          ></div>

                          {/* SVG Face Mesh / Body Silhouette drawing with high-fidelity triangulation */}
                          <svg className="w-full h-full text-cyan-400/40" viewBox="0 0 100 100" fill="none">
                            {aiTrackingMode === 'face' ? (
                              // High-Fidelity 3D Spatial Triangulation Mesh representing Nvidia MediaPipe / Hugging Face face-mesh tracking
                              <g className="text-cyan-400">
                                {/* Outer head boundary */}
                                <ellipse cx="50" cy="50" rx="32" ry="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                                
                                {/* 3D Triangulation Polygon Paths */}
                                <path 
                                  d="
                                    M 50,15 L 35,28 L 50,38 Z 
                                    M 50,15 L 65,28 L 50,38 Z 
                                    M 35,28 L 22,42 L 36,44 L 50,38 Z 
                                    M 65,28 L 78,42 L 64,44 L 50,38 Z 
                                    M 36,44 L 50,52 L 64,44 L 50,38 Z 
                                    M 22,42 L 20,58 L 35,62 L 36,44 Z 
                                    M 78,42 L 80,58 L 65,62 L 64,44 Z 
                                    M 35,62 L 50,72 L 65,62 L 50,52 Z 
                                    M 20,58 L 26,76 L 40,84 L 50,72 L 35,62 Z 
                                    M 80,58 L 74,76 L 60,84 L 50,72 L 65,62 Z 
                                    M 40,84 L 50,88 L 60,84 L 50,72 Z
                                  " 
                                  stroke="currentColor" 
                                  strokeWidth="0.75" 
                                  fill="rgba(34, 211, 238, 0.08)" 
                                />

                                {/* Concentric target circle */}
                                <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="animate-pulse" />
                                <circle cx="50" cy="50" r="4" stroke="currentColor" strokeWidth="1" />

                                {/* Key facial tracking coordinate nodes */}
                                <g className="text-cyan-300">
                                  <circle cx="50" cy="15" r="2" fill="currentColor" /> {/* Top scalp */}
                                  <circle cx="50" cy="38" r="2" fill="currentColor" /> {/* Forehead center */}
                                  <circle cx="35" cy="28" r="2" fill="currentColor" /> {/* L Temple */}
                                  <circle cx="65" cy="28" r="2" fill="currentColor" /> {/* R Temple */}
                                  <circle cx="22" cy="42" r="2" fill="currentColor" /> {/* L Outer Brow */}
                                  <circle cx="78" cy="42" r="2" fill="currentColor" /> {/* R Outer Brow */}
                                  <circle cx="36" cy="44" r="2" fill="currentColor" /> {/* L Pupil */}
                                  <circle cx="64" cy="44" r="2" fill="currentColor" /> {/* R Pupil */}
                                  <circle cx="50" cy="52" r="2.5" fill="currentColor" className="animate-ping" style={{ animationDuration: '2s' }} /> {/* Nose Tip */}
                                  <circle cx="50" cy="52" r="1.5" fill="currentColor" />
                                  <circle cx="35" cy="62" r="2" fill="currentColor" /> {/* L Cheekbone */}
                                  <circle cx="65" cy="62" r="2" fill="currentColor" /> {/* R Cheekbone */}
                                  <circle cx="20" cy="58" r="2" fill="currentColor" /> {/* L Jaw corner */}
                                  <circle cx="80" cy="58" r="2" fill="currentColor" /> {/* R Jaw corner */}
                                  <circle cx="50" cy="72" r="2" fill="currentColor" /> {/* Mouth Center */}
                                  <circle cx="26" cy="76" r="2" fill="currentColor" /> {/* L Jaw mid */}
                                  <circle cx="74" cy="76" r="2" fill="currentColor" /> {/* R Jaw mid */}
                                  <circle cx="40" cy="84" r="2" fill="currentColor" /> {/* L Chin mid */}
                                  <circle cx="60" cy="84" r="2" fill="currentColor" /> {/* R Chin mid */}
                                  <circle cx="50" cy="88" r="2" fill="currentColor" /> {/* Chin tip */}
                                </g>

                                {/* Dynamic vector projection coordinate labels */}
                                <g className="text-[5px] fill-cyan-400 font-mono font-bold select-none opacity-90">
                                  <text x="54" y="14">N:01</text>
                                  <text x="54" y="37">V_CTR</text>
                                  <text x="24" y="40">E_LT</text>
                                  <text x="68" y="40">E_RT</text>
                                  <text x="54" y="54">POSE_T0</text>
                                  <text x="54" y="74">M_0</text>
                                  <text x="54" y="92">YAW: +1.2°</text>
                                </g>
                              </g>
                            ) : (
                              // High-Fidelity 3D Body Mesh with Joint Vectors representing Nvidia TensorRT Body Pose Estimation
                              <g className="text-emerald-400">
                                {/* Outer bounding capsule */}
                                <rect x="10" y="8" width="80" height="84" rx="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                                
                                {/* Structural body contour triangles */}
                                <path 
                                  d="
                                    M 50,14 L 38,24 L 50,30 Z 
                                    M 50,14 L 62,24 L 50,30 Z 
                                    M 38,24 L 25,32 L 35,48 L 50,30 Z 
                                    M 62,24 L 75,32 L 65,48 L 50,30 Z 
                                    M 35,48 L 50,56 L 65,48 L 50,30 Z 
                                    M 25,32 L 18,52 L 28,54 L 35,48 Z 
                                    M 75,32 L 82,52 L 72,54 L 65,48 Z 
                                    M 28,54 L 40,70 L 50,56 L 35,48 Z 
                                    M 72,54 L 60,70 L 50,56 L 65,48 Z 
                                    M 40,70 L 50,78 L 60,70 L 50,56 Z 
                                    M 28,54 L 20,84 L 38,88 L 40,70 Z 
                                    M 72,54 L 80,84 L 62,88 L 60,70 Z 
                                    M 38,88 L 50,92 L 62,88 L 50,78 Z
                                  " 
                                  stroke="currentColor" 
                                  strokeWidth="0.75" 
                                  fill="rgba(16, 185, 129, 0.08)" 
                                />

                                {/* Joint nodes */}
                                <g className="text-emerald-300">
                                  <circle cx="50" cy="14" r="2.5" fill="currentColor" /> {/* Skull Crown */}
                                  <circle cx="50" cy="30" r="2" fill="currentColor" /> {/* Cervical C7 */}
                                  <circle cx="38" cy="24" r="2" fill="currentColor" /> {/* L Shoulder */}
                                  <circle cx="62" cy="24" r="2" fill="currentColor" /> {/* R Shoulder */}
                                  <circle cx="25" cy="32" r="2" fill="currentColor" /> {/* L Elbow */}
                                  <circle cx="75" cy="32" r="2" fill="currentColor" /> {/* R Elbow */}
                                  <circle cx="18" cy="52" r="2" fill="currentColor" /> {/* L Wrist */}
                                  <circle cx="82" cy="52" r="2" fill="currentColor" /> {/* R Wrist */}
                                  <circle cx="35" cy="48" r="2" fill="currentColor" /> {/* L Hip */}
                                  <circle cx="65" cy="48" r="2" fill="currentColor" /> {/* R Hip */}
                                  <circle cx="50" cy="56" r="2" fill="currentColor" /> {/* Pelvis Base */}
                                  <circle cx="28" cy="54" r="2" fill="currentColor" /> {/* L Knee */}
                                  <circle cx="72" cy="54" r="2" fill="currentColor" /> {/* R Knee */}
                                  <circle cx="40" cy="70" r="2" fill="currentColor" /> {/* L Ankle */}
                                  <circle cx="60" cy="70" r="2" fill="currentColor" /> {/* R Ankle */}
                                  <circle cx="20" cy="84" r="2" fill="currentColor" /> {/* L Toe */}
                                  <circle cx="80" cy="84" r="2" fill="currentColor" /> {/* R Toe */}
                                  <circle cx="38" cy="88" r="2" fill="currentColor" /> {/* L Heel */}
                                  <circle cx="62" cy="88" r="2" fill="currentColor" /> {/* R Heel */}
                                  <circle cx="50" cy="92" r="2" fill="currentColor" /> {/* Base center */}
                                </g>

                                {/* Telemetry tags */}
                                <g className="text-[5px] fill-emerald-400 font-mono font-bold select-none opacity-90">
                                  <text x="54" y="13">C7_AXIS</text>
                                  <text x="41" y="23">L_SHLD</text>
                                  <text x="65" y="23">R_SHLD</text>
                                  <text x="21" y="55">WRST_L</text>
                                  <text x="84" y="55">WRST_R</text>
                                  <text x="54" y="59">COF: 0.92</text>
                                  <text x="54" y="94">MESH: COMPLIANT</text>
                                </g>
                              </g>
                            )}
                          </svg>
                        </div>
                      )}
                      
                      {/* REAL-TIME FACE-MESH TRACKING MASK SIMULATION OVERLAY WITH 3D STABILIZATION */}
                      {showFaceMeshMask && aiTrackingActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${blurPosition.x}%`,
                            top: `${blurPosition.y}%`,
                            transform: `translate(-50%, -50%) rotateX(${(blurPosition.y - 40) * 0.4}deg) rotateY(${-(blurPosition.x - 50) * 0.4}deg) rotateZ(${(blurPosition.x - 50) * 0.15}deg) scale(${aiTrackingMode === 'body' ? 0.8 : 1.1 - (Math.abs(blurPosition.x - 50) + Math.abs(blurPosition.y - 40)) * 0.002})`,
                            transformStyle: 'preserve-3d',
                            perspective: '1000px',
                            width: '180px',
                            height: '180px',
                          }}
                          className="absolute pointer-events-none z-25 flex items-center justify-center transition-transform duration-75 ease-out"
                        >
                          {/* SVG for the face mesh tracking mask */}
                          <svg className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.65)]" viewBox="0 0 100 100" fill="none">
                            <defs>
                              <radialGradient id="meshGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
                                <stop offset="70%" stopColor="rgba(6, 182, 212, 0.05)" />
                                <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                              </radialGradient>
                            </defs>
                            
                            {/* 3D-like depth spheres / grid mesh */}
                            <ellipse cx="50" cy="50" rx="35" ry="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-45" />
                            <ellipse cx="50" cy="50" rx="28" ry="34" stroke="currentColor" strokeWidth="0.75" className="opacity-30" />
                            <ellipse cx="50" cy="50" rx="20" ry="26" stroke="currentColor" strokeWidth="0.5" className="opacity-20" />
                            
                            {/* Vertical center contour line */}
                            <path d="M 50,8 Q 45,50 50,92" stroke="currentColor" strokeWidth="1" className="opacity-60" />
                            {/* Horizontal eye contour line */}
                            <path d="M 15,44 Q 50,50 85,44" stroke="currentColor" strokeWidth="1" className="opacity-60" />
                            {/* Cheek contour arcs */}
                            <path d="M 22,58 Q 50,68 78,58" stroke="currentColor" strokeWidth="0.75" className="opacity-40" />
                            <path d="M 28,70 Q 50,78 72,70" stroke="currentColor" strokeWidth="0.75" className="opacity-40" />

                            {/* Triangulated Face-Mesh Surface representation */}
                            <path 
                              d="
                                M 50,8 L 35,18 L 50,28 Z 
                                M 50,8 L 65,18 L 50,28 Z 
                                M 35,18 L 22,34 L 35,36 L 50,28 Z 
                                M 65,18 L 78,34 L 65,36 L 50,28 Z 
                                M 35,36 L 50,44 L 65,36 L 50,28 Z 
                                M 22,34 L 18,50 L 32,54 L 35,36 Z 
                                M 78,34 L 82,50 L 68,54 L 65,36 Z 
                                M 32,54 L 50,62 L 68,54 L 50,44 Z 
                                M 18,50 L 22,68 L 36,74 L 50,62 L 32,54 Z 
                                M 82,50 L 78,68 L 64,74 L 50,62 L 68,54 Z 
                                M 36,74 L 50,80 L 64,74 L 50,62 Z 
                                M 36,74 L 50,92 L 64,74 Z
                              " 
                              stroke="currentColor" 
                              strokeWidth="0.5" 
                              fill="url(#meshGrad)"
                              className="opacity-75 animate-pulse"
                            />

                            {/* Nodes - Glowing intersection points */}
                            <g className="text-cyan-300">
                              <circle cx="50" cy="8" r="1.5" fill="currentColor" />
                              <circle cx="35" cy="18" r="1.5" fill="currentColor" />
                              <circle cx="65" cy="18" r="1.5" fill="currentColor" />
                              <circle cx="22" cy="34" r="1.5" fill="currentColor" />
                              <circle cx="78" cy="34" r="1.5" fill="currentColor" />
                              <circle cx="35" cy="36" r="1.5" fill="currentColor" />
                              <circle cx="65" cy="36" r="1.5" fill="currentColor" />
                              <circle cx="50" cy="28" r="1.5" fill="currentColor" />
                              <circle cx="18" cy="50" r="1.5" fill="currentColor" />
                              <circle cx="82" cy="50" r="1.5" fill="currentColor" />
                              <circle cx="32" cy="54" r="1.5" fill="currentColor" />
                              <circle cx="68" cy="54" r="1.5" fill="currentColor" />
                              <circle cx="50" cy="44" r="2" fill="currentColor" className="animate-ping" style={{ animationDuration: '3s' }} /> {/* nose tip */}
                              <circle cx="50" cy="44" r="1.5" fill="currentColor" />
                              <circle cx="22" cy="68" r="1.5" fill="currentColor" />
                              <circle cx="78" cy="68" r="1.5" fill="currentColor" />
                              <circle cx="36" cy="74" r="1.5" fill="currentColor" />
                              <circle cx="64" cy="74" r="1.5" fill="currentColor" />
                              <circle cx="50" cy="62" r="1.5" fill="currentColor" /> {/* mouth */}
                              <circle cx="50" cy="80" r="1.5" fill="currentColor" />
                              <circle cx="50" cy="92" r="1.5" fill="currentColor" />
                            </g>

                            {/* Aesthetic crosshairs on eyes */}
                            <g stroke="currentColor" strokeWidth="0.5" className="opacity-80">
                              {/* Left eye target */}
                              <circle cx="35" cy="36" r="3" strokeDasharray="1 1" />
                              <line x1="31" y1="36" x2="39" y2="36" />
                              <line x1="35" y1="32" x2="35" y2="40" />

                              {/* Right eye target */}
                              <circle cx="65" cy="36" r="3" strokeDasharray="1 1" />
                              <line x1="61" y1="36" x2="69" y2="36" />
                              <line x1="65" y1="32" x2="65" y2="40" />
                            </g>

                            {/* Floating HUD Telemetry Metrics on the side of the mesh mask */}
                            <g className="text-[3.5px] fill-cyan-400/90 font-mono font-bold select-none">
                              <text x="86" y="24">M_MESH: 468v</text>
                              <text x="86" y="30">STABIL: 99.7%</text>
                              <text x="86" y="36">T_ST: OK</text>
                              <text x="86" y="42">{`R_Z: ${( (blurPosition.x - 50) * 0.15 ).toFixed(1)}°`}</text>

                              <text x="2" y="24">P_X: {blurPosition.x.toFixed(0)}%</text>
                              <text x="2" y="30">P_Y: {blurPosition.y.toFixed(0)}%</text>
                              <text x="2" y="36">LAT: 12ms</text>
                              <text x="2" y="42">FREQ: 60Hz</text>
                            </g>
                          </svg>
                          
                          {/* Inner scan sweep line */}
                          <div className="absolute inset-x-2 h-0.5 bg-cyan-400/60 shadow-[0_0_4px_rgba(6,182,212,0.8)] rounded-full animate-bounce" style={{ top: '35%', animationDuration: '4s' }} />
                        </div>
                      )}

                      {/* The dynamic backdrop filter blur card simulating smart-glasses software blurring */}
                      {showCensorOverlay && (() => {
                        const scaleFactor = (blurPosition as any).scale !== undefined ? (blurPosition as any).scale : 1.0;
                        const isBody = aiTrackingMode === 'body';
                        const baseWidth = isBody ? 176 : 192;
                        const baseHeight = isBody ? 288 : 192;

                        const dynamicWidth = baseWidth * scaleFactor;
                        const dynamicHeight = baseHeight * scaleFactor;

                        const renderTick = performance.now() * 0.003;
                        const wave = Math.sin(renderTick * 2.0) * 1.5;
                        const wave2 = Math.cos(renderTick * 1.6) * 1.5;
                        const wave3 = Math.sin(renderTick * 1.1) * 2.0;

                        const dynamicClipPath = isBody 
                          ? 'none' 
                          : `polygon(
                              ${50 + wave}% ${5 + wave2}%, 
                              ${68 + wave2}% ${13 - wave}%, 
                              ${82 + wave3}% ${28 + wave2}%, 
                              ${86 - wave}% ${48 + wave3}%, 
                              ${80 + wave2}% ${70 - wave}%, 
                              ${68 - wave3}% ${86 + wave2}%, 
                              ${50 - wave}% ${95 - wave3}%, 
                              ${32 + wave2}% ${86 - wave}%, 
                              ${20 - wave3}% ${70 + wave2}%, 
                              ${14 + wave}% ${48 - wave3}%, 
                              ${18 - wave2}% ${28 - wave}%, 
                              ${32 + wave3}% ${13 + wave2}%
                            )`;

                        const rotX = (blurPosition.y - 40) * 0.45 + Math.sin(renderTick * 0.6) * 3;
                        const rotY = -(blurPosition.x - 50) * 0.45 + Math.cos(renderTick * 0.6) * 3;
                        const rotZ = (blurPosition.x - 50) * 0.12;

                        return (
                          <motion.div
                            style={{
                              position: 'absolute',
                              left: `${blurPosition.x}%`,
                              top: `${blurPosition.y}%`,
                              width: `${dynamicWidth}px`,
                              height: `${dynamicHeight}px`,
                              transform: `translate(-50%, -50%) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
                              clipPath: dynamicClipPath,
                              WebkitClipPath: dynamicClipPath,
                            }}
                            className={`absolute flex items-center justify-center cursor-move z-10 overflow-hidden ${
                              isBody ? 'rounded-t-[5rem] rounded-b-[4rem]' : ''
                            }`}
                          >
                          {/* Live WebAssembly/Vectorized dynamic pixel-processing canvas */}
                          <canvas
                            ref={wasmCanvasRef}
                            width={aiTrackingMode === 'body' ? 140 : 180}
                            height={aiTrackingMode === 'body' ? 220 : 180}
                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0 rounded-full"
                            style={{
                              opacity: (citizenState.privacyLevel === 'none' || citizenState.privacyLevel === 'black_bar' || citizenState.privacyLevel === 'magic_removal') ? 0 : 0.95,
                            }}
                          />

                          {/* Drag Area Marker */}
                          <div 
                            onMouseDown={handleMouseDown}
                            className={`absolute inset-0 flex items-center justify-center group z-20 ${
                              aiTrackingMode === 'body' ? 'rounded-t-[5rem] rounded-b-[4rem]' : ''
                            } ${
                              showDiagnostics
                                ? (citizenState.emergencyPrivacyActive ? 'border-2 border-red-500 bg-red-950/20' : 'border-2 border-emerald-400/80')
                                : 'border-0 bg-transparent'
                            }`}
                          >
                            {showDiagnostics && (
                              <>
                                <div className={`w-3 h-3 rounded-full animate-ping opacity-75 ${citizenState.emergencyPrivacyActive ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
                                <div className="absolute inset-x-0 bottom-1 bg-black/60 py-0.5 text-center text-[8px] font-mono text-emerald-300 select-none uppercase tracking-widest font-bold">
                                  {citizenState.emergencyPrivacyActive ? '🚨 EMERGENCY LOCK' : aiTrackingActive ? 'AI TRACKING ACTIVE' : 'DRAG TO MANUAL'}
                                </div>

                                {/* Real-time WebAssembly NPU Co-Processor performance comparison telemetry */}
                                <div className="absolute -bottom-16 bg-slate-950/95 border border-emerald-500/30 p-1.5 rounded-lg text-[7px] font-mono text-emerald-400/90 space-y-0.5 select-none text-left leading-tight w-[110px] shadow-2xl backdrop-blur">
                                  <p className="font-bold border-b border-emerald-500/20 pb-0.5 text-white uppercase tracking-wider">🔬 WASM ENGINE</p>
                                  <p>CORE: <span className="text-cyan-400 font-extrabold">{wasmStats.wasmActive ? 'NPU_ACTIVE' : 'FALLBACK_JS'}</span></p>
                                  <p>WASM: <span className="text-white font-extrabold">{wasmStats.wasmLatency} ms</span></p>
                                  <p>JS_LP: <span className="text-white">{wasmStats.jsLatency} ms</span></p>
                                  <p>FREQ: <span className="text-white">{wasmStats.fps} FPS</span></p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Apply blur effect strictly inside the shape */}
                          {citizenState.privacyLevel !== 'none' && citizenState.privacyLevel !== 'black_bar' && citizenState.privacyLevel !== 'magic_removal' && (
                            <div 
                              className={`w-full h-full relative z-10 ${
                                aiTrackingMode === 'body' ? 'rounded-t-[5rem] rounded-b-[4rem]' : ''
                              }`}
                              style={getOverlayStyles(citizenState.privacyLevel)}
                            >
                              {/* 100% Secure Visual Blur obscuration layer inside the strict blur container */}
                              {citizenState.privacyLevel === 'strict_blur' && (
                                <div className="absolute inset-0 overflow-hidden rounded-full flex items-center justify-center pointer-events-none">
                                  {/* Heavy concentric layered shapes to guarantee absolutely zero facial detail leak */}
                                  <div className="absolute w-[130%] h-[130%] bg-slate-950/40 rounded-full filter blur-[12px]" />
                                  <div className="absolute w-[90%] h-[90%] bg-emerald-950/20 rounded-full filter blur-[8px] mix-blend-screen opacity-80 animate-pulse" />
                                  <div className="absolute w-[60%] h-[60%] bg-slate-900/30 rounded-full filter blur-[6px]" />
                                  
                                  {/* Real-time 3D Polygonal Mesh Draped Overlay */}
                                  <svg className="absolute inset-0 w-full h-full text-emerald-400/25 mix-blend-screen animate-pulse" viewBox="0 0 100 100" fill="none">
                                    <path 
                                      d="
                                        M 50,5 L 30,15 L 50,30 L 70,15 Z
                                        M 30,15 L 10,40 L 30,45 L 50,30 Z
                                        M 70,15 L 90,40 L 70,45 L 50,30 Z
                                        M 30,45 L 50,60 L 70,45 Z
                                        M 10,40 L 20,70 L 40,80 L 50,60 L 30,45 Z
                                        M 90,40 L 80,70 L 60,80 L 50,60 L 70,45 Z
                                        M 40,80 L 50,95 L 60,80 Z
                                      " 
                                      stroke="currentColor" 
                                      strokeWidth="0.5" 
                                    />
                                    <g className="text-emerald-400/50">
                                      <circle cx="50" cy="5" r="1.2" fill="currentColor" />
                                      <circle cx="30" cy="15" r="1.2" fill="currentColor" />
                                      <circle cx="70" cy="15" r="1.2" fill="currentColor" />
                                      <circle cx="50" cy="30" r="1.2" fill="currentColor" />
                                      <circle cx="10" cy="40" r="1.2" fill="currentColor" />
                                      <circle cx="90" cy="40" r="1.2" fill="currentColor" />
                                      <circle cx="30" cy="45" r="1.2" fill="currentColor" />
                                      <circle cx="70" cy="45" r="1.2" fill="currentColor" />
                                      <circle cx="50" cy="60" r="1.2" fill="currentColor" />
                                      <circle cx="20" cy="70" r="1.2" fill="currentColor" />
                                      <circle cx="80" cy="70" r="1.2" fill="currentColor" />
                                      <circle cx="40" cy="80" r="1.2" fill="currentColor" />
                                      <circle cx="60" cy="80" r="1.2" fill="currentColor" />
                                      <circle cx="50" cy="95" r="1.2" fill="currentColor" />
                                    </g>
                                  </svg>

                                  <div className="absolute text-center select-none">
                                    <span className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest block bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/30">
                                      🛡️ OBSCURED
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 100% Secure Pixelated mosaic representation */}
                              {citizenState.privacyLevel === 'pixelate' && (
                                <div className="absolute inset-0 overflow-hidden rounded-full flex flex-wrap items-center justify-center p-1 pointer-events-none">
                                  {/* Simulated actual macro pixel block grid to eliminate camera details */}
                                  <div className="absolute inset-0 bg-slate-950/90 filter blur-[4px]" />
                                  <div className="grid grid-cols-6 grid-rows-6 w-full h-full opacity-95 gap-[1.5px]">
                                    {Array.from({ length: 36 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className="bg-slate-950 border border-slate-900/40"
                                        style={{
                                          backgroundColor: i % 3 === 0 ? '#022c22' : i % 2 === 0 ? '#0b1329' : '#042f2e',
                                          opacity: 0.9 + (i % 3) * 0.05
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <div className="absolute text-center bg-slate-950/95 px-2 py-0.5 rounded border border-amber-500/30 select-none">
                                    <span className="text-[7px] font-mono text-amber-400 font-extrabold uppercase tracking-widest block">
                                      MOSAIC_LOCK
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 100% Secure Badged Emoji Shield */}
                              {citizenState.privacyLevel === 'emoji' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 border border-blue-500/30 rounded-full p-2 text-center pointer-events-none">
                                  <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-bounce" style={{ animationDuration: '2.5s' }}>
                                    {['🤫', '🕶️', '🔒', '🛡️', '👽', '👁️'][citizenState.anonymousId.charCodeAt(0) % 6]}
                                  </span>
                                  <span className="text-[7px] font-mono text-blue-400 tracking-wider font-extrabold mt-2 uppercase select-none">
                                    MASK ACTIVE
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Magic Eraser Real-time inpainting view */}
                          {citizenState.privacyLevel === 'magic_removal' && (
                            <div 
                              className={`w-full h-full relative flex items-center justify-center ${
                                aiTrackingMode === 'body' ? 'rounded-t-[5rem] rounded-b-[4rem]' : ''
                              }`}
                              style={getOverlayStyles('magic_removal')}
                            >
                              {/* Classic checkered transparency overlay */}
                              <div className="absolute inset-0 opacity-15" style={{
                                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                backgroundSize: '12px 12px',
                                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                              }} />
                              <div className="z-10 text-center p-2 text-emerald-400">
                                <Sparkle className="w-6 h-6 mx-auto animate-spin" style={{ animationDuration: '4s' }} />
                                <span className="text-[8px] font-mono tracking-widest font-bold block mt-1">GENERATIVE FILL</span>
                                <span className="text-[6px] text-slate-400 block">INPAINTED_BUFFER</span>
                              </div>
                            </div>
                          )}

                        {/* Black Bar specific render */}
                        {citizenState.privacyLevel === 'black_bar' && (
                          <div className="absolute w-full h-10 bg-black border border-slate-800 flex items-center justify-center font-mono text-[9px] text-red-500 font-bold uppercase tracking-widest">
                            [ CENSORED ]
                          </div>
                        )}

                        {/* Social discovery view */}
                        {citizenState.privacyLevel === 'none' && (
                          <>
                            {citizenState.decoyPersonaBroadcast ? (
                              <div className="absolute top-2 w-max bg-slate-900/95 border border-cyan-500/40 p-3 rounded-xl backdrop-blur shadow-xl text-left pointer-events-none animate-bounce">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                  <span className="font-mono text-xs text-white font-bold">@anon_citizen_842</span>
                                </div>
                                <p className="text-[10px] text-slate-300 max-w-[160px] leading-snug">Decoy Identity Profile. Enforced by BlurBubble Privacy Shield.</p>
                                <div className="flex gap-1 mt-1.5">
                                  <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-900/80 px-1 py-0.2 rounded font-semibold">Privacy</span>
                                  <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-900/80 px-1 py-0.2 rounded font-semibold">Stealth</span>
                                </div>
                              </div>
                            ) : (citizenState.adversarialPoisoning || citizenState.rfc9402SocialBlock || citizenState.regulatoryCeaseAndDesist) ? (
                              <div className="absolute top-2 w-max bg-slate-950/95 border-2 border-red-500/60 p-3 rounded-xl backdrop-blur shadow-xl text-left pointer-events-none animate-pulse">
                                <div className="flex items-center gap-2 mb-1">
                                  <Shield className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
                                  <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-widest">[ IDENTITY LOCKED ]</span>
                                </div>
                                <p className="text-[8px] text-slate-400 max-w-[150px] leading-snug">
                                  {citizenState.adversarialPoisoning ? "Fawkes Poisoning signature corrupted the facial lookup matrix." :
                                   citizenState.rfc9402SocialBlock ? "Social linkage blocked under global RFC-9402 headers." :
                                   "Biometric database search denied under legal CCPA mandate."}
                                </p>
                              </div>
                            ) : citizenState.socialProfile ? (
                              <div className="absolute top-2 w-max bg-slate-900/95 border border-emerald-500/40 p-3 rounded-xl backdrop-blur shadow-xl text-left pointer-events-none animate-bounce">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  <span className="font-mono text-xs text-white font-bold">{citizenState.socialProfile.username}</span>
                                </div>
                                <p className="text-[10px] text-slate-300 max-w-[160px] leading-snug">{citizenState.socialProfile.bio}</p>
                                <div className="flex gap-1 mt-1.5">
                                  {citizenState.socialProfile.interests.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-900/80 px-1 py-0.2 rounded font-semibold">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}

                        {citizenState.emergencyPrivacyActive && (
                          <div className="absolute inset-0 w-full h-full rounded-full bg-red-950/90 border-2 border-red-500 flex flex-col items-center justify-center p-3 text-center text-red-400 z-20 animate-pulse">
                            <ShieldAlert className="w-8 h-8 mb-1.5 text-red-500 animate-bounce" />
                            <span className="text-[10px] font-mono tracking-widest font-extrabold text-white">HARD OPT-OUT</span>
                            <span className="text-[7px] font-mono text-red-300">EMERGENCY FORCE SHIELD</span>
                          </div>
                        )}
                          </motion.div>
                        );
                      })()}
                  </>
                )}
              </>
            )}
          </div>
          ) : activeTab === 'scanner' ? (
            /* BLE & WI-FI RADAR NETWORK SCANNER */
            <div className="relative w-full min-h-[720px] lg:min-h-[600px] bg-slate-950 p-4 rounded-2xl border border-slate-900/80 flex flex-col justify-between overflow-y-auto lg:overflow-hidden select-none font-sans">
              {/* Scan Overlay Lines */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.1)_0%,rgba(2,6,23,0.9)_100%)]"></div>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,24,38,0.06)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px]"></div>

              {/* Local Devices Finder View Switcher */}
              <div className="z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2 mb-2 relative shrink-0 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">📡 Local Devices Finder</span>
                </div>
                <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScannerSubTab('radar')}
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                      scannerSubTab === 'radar'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    📡 BLE Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannerSubTab('qr')}
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      scannerSubTab === 'qr'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    📷 QR Linker
                  </button>
                </div>
              </div>

              {scannerSubTab === 'radar' ? (
                <div className="z-10 flex flex-col lg:flex-row gap-5 flex-1 items-stretch lg:overflow-hidden min-h-0">
                  {/* Visual Scanner Radar */}
                  <div className="w-full lg:max-w-sm bg-slate-900/10 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[260px] lg:min-h-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      {/* Concentric Circles */}
                      <div className="w-56 h-56 rounded-full border border-blue-500/20 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border border-blue-500/30 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border border-blue-500/40 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border border-blue-500/50"></div>
                          </div>
                        </div>
                      </div>
                      {/* Crosshair lines */}
                      <div className="absolute w-60 h-[1px] bg-blue-500/20"></div>
                      <div className="absolute h-60 w-[1px] bg-blue-500/20"></div>
                      {/* Sweeper animation */}
                      <motion.div 
                        className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/20"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>

                    {/* Dynamic Device Blips on Radar */}
                    {scannedDevices.map((dev, idx) => {
                      const angle = (idx * 72 * Math.PI) / 180;
                      const distanceRatio = (dev.signalStrength + 100) / 70;
                      const radius = 30 + (1 - distanceRatio) * 60;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      const isSelected = selectedScannerDevice === dev.id;

                      return (
                        <button
                          key={dev.id}
                          onClick={() => setSelectedScannerDevice(dev.id)}
                          className="absolute z-20 focus:outline-none transition group"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px - 10px)`
                          }}
                        >
                          <span className="relative flex h-3 w-3">
                            {isSelected && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${
                              dev.complianceStatus === 'secured' 
                                ? 'bg-emerald-400' 
                                : dev.complianceStatus === 'handshaking' 
                                  ? 'bg-amber-400 animate-pulse' 
                                  : 'bg-red-400'
                            }`}></span>
                          </span>
                          
                          <div className="absolute left-4 -top-2 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-950/95 border border-slate-800 text-[9px] font-mono p-1 rounded whitespace-nowrap text-white z-30 shadow-xl">
                            {dev.name} ({dev.signalStrength} dBm)
                          </div>
                        </button>
                      );
                    })}

                    <div className="mt-auto z-10 text-center space-y-1">
                      <p className="font-mono text-[10px] uppercase text-blue-400 tracking-wider flex items-center justify-center gap-1.5 font-bold">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                        BlurBubble Radar
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        Scanning nearby hardware nodes...
                      </p>
                    </div>
                  </div>

                  {/* Scanned Devices List & Details Split-View */}
                  <div className="flex-1 bg-slate-900/10 border border-slate-800/60 rounded-xl p-4 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nearby Broadcast Modules ({scannedDevices.length})
                      </span>
                      <button
                        id="toggle-ble-scanner-service"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsScannerServiceRunning(!isScannerServiceRunning);
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border tracking-wider transition-all flex items-center gap-1 ${
                          isScannerServiceRunning
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 animate-pulse'
                            : 'bg-slate-850 border-slate-800 text-slate-500 hover:text-slate-400 hover:bg-slate-800'
                        }`}
                        title={isScannerServiceRunning ? "Pause Bluetooth scanner service" : "Start Bluetooth scanner service"}
                      >
                        <span className={`w-1 h-1 rounded-full ${isScannerServiceRunning ? 'bg-blue-400 animate-ping' : 'bg-slate-500'}`}></span>
                        Scanner Service: {isScannerServiceRunning ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>

                    {/* Scanned Items Scroll-Box */}
                    <div className="space-y-2 overflow-y-auto max-h-[220px] lg:max-h-[180px] flex-1 pr-1 border-b border-slate-900/65 pb-3 mb-3">
                      {scannedDevices.map((dev) => {
                        const isSelected = selectedScannerDevice === dev.id;
                        return (
                          <div
                            key={dev.id}
                            onClick={() => setSelectedScannerDevice(dev.id)}
                            className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-950/20 border-blue-500/40 text-white shadow-lg' 
                                : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:bg-slate-900/20 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs shrink-0">
                                {dev.type === 'glasses' ? '🕶️' : dev.type === 'camera' ? '📷' : dev.type === 'drone' ? '🚁' : dev.type === 'smart_tv' ? '📺' : '📱'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold truncate text-white">{dev.name}</h4>
                                <p className="text-[9px] text-slate-500 font-mono truncate">{dev.mac} • {dev.channel}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="text-right font-mono text-[9px] hidden sm:block">
                                <span className={`${dev.signalStrength > -60 ? 'text-emerald-400 font-bold' : dev.signalStrength > -75 ? 'text-amber-400' : 'text-slate-500'}`}>
                                  {dev.signalStrength} dBm
                                </span>
                              </div>

                              {dev.complianceStatus === 'unrestricted' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBroadcastShield(dev.id);
                                  }}
                                  className="px-2.5 py-1 bg-red-500 hover:bg-emerald-500 text-white font-extrabold text-[9px] rounded border border-red-400 hover:border-emerald-400 transition flex items-center gap-1 shadow-md shadow-red-500/10"
                                  title="Enforce immediate face-blurring opt-out on this device stream"
                                >
                                  <Shield className="w-2.5 h-2.5" />
                                  Broadcast Shield
                                </button>
                              ) : dev.complianceStatus === 'handshaking' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded animate-pulse">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></div>
                                  Connecting...
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded">
                                  <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                                  Shield Active
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Highly Polished Device Signal Inspector Panel */}
                    <div className="flex-1 min-h-0">
                      {selectedScannerDevice ? (() => {
                        const dev = scannedDevices.find(d => d.id === selectedScannerDevice);
                        if (!dev) return null;
                        const distance = parseFloat((Math.abs(dev.signalStrength + 30) * 0.12).toFixed(1));
                        return (
                          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 h-full flex flex-col justify-between font-mono text-[10px]">
                            {/* Header details */}
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2">
                              <span className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-blue-400" />
                                Signal Decryption Inspector
                              </span>
                              <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-850">
                                {dev.mac}
                              </span>
                            </div>

                            {/* Signal details grids */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                              <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                <span className="text-slate-500 block text-[8px] uppercase">Bystander Dist.</span>
                                <span className="text-slate-200 font-bold block mt-0.5">{distance} Meters</span>
                              </div>
                              <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                <span className="text-slate-500 block text-[8px] uppercase">Radio Band</span>
                                <span className="text-slate-200 font-bold block mt-0.5">{dev.channel}</span>
                              </div>
                              <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                <span className="text-slate-500 block text-[8px] uppercase">Signal Power</span>
                                <span className={`font-bold block mt-0.5 ${dev.signalStrength > -60 ? 'text-emerald-400' : dev.signalStrength > -75 ? 'text-amber-400' : 'text-slate-500'}`}>
                                  {dev.signalStrength} dBm
                                </span>
                              </div>
                              <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                <span className="text-slate-500 block text-[8px] uppercase">Handshake RFC</span>
                                <span className="text-blue-400 font-bold block mt-0.5">RFC-9402 Compliant</span>
                              </div>
                            </div>

                            {/* Attenuation bar and simulated waveform */}
                            <div className="bg-slate-900/30 border border-slate-900 p-2 rounded-lg space-y-1.5 mb-2 flex-1 flex flex-col justify-center">
                              <div className="flex justify-between text-[8px] text-slate-500">
                                <span>Signal Attenuation Gauge</span>
                                <span className="font-semibold text-slate-300">
                                  {dev.signalStrength > -60 ? 'Excellent Coverage (Highly Secure)' : dev.signalStrength > -75 ? 'Average Penetration' : 'Fading Boundary Edge'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    dev.signalStrength > -60 ? 'bg-emerald-500' : dev.signalStrength > -75 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(10, (dev.signalStrength + 100) * 1.5))}%` }}
                                />
                              </div>
                            </div>

                            {/* Actions panel */}
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-900/85">
                              <span className="text-[8px] text-slate-500">
                                STATUS: {dev.complianceStatus === 'secured' ? '🔒 SECURE CRYPTO SYNCED' : '⚠️ UNPROTECTED FEED'}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScannedDevices(prev => prev.map(d => d.id === dev.id ? { ...d, signalStrength: Math.min(-30, d.signalStrength + 8) } : d));
                                    playHudSound('beep');
                                  }}
                                  className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded text-[8px] font-bold uppercase transition"
                                  title="Amplify broadcast energy to align coverage boundaries"
                                >
                                  ⚡ Boost Power
                                </button>
                                {dev.complianceStatus === 'unrestricted' && (
                                  <button
                                    type="button"
                                    onClick={() => handleBroadcastShield(dev.id)}
                                    className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/30 text-blue-400 rounded text-[8px] font-bold uppercase transition"
                                  >
                                    🔒 Send Opt-Out
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="h-full border border-dashed border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-[9px] leading-normal">
                          <Radio className="w-6 h-6 text-slate-600 mb-1 animate-pulse" />
                          <span>Select a broadcast module on the radar or the list to audit encryption packet streams and coverage coordinates.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* QR COMPATIBLE HARDWARE SECURE LINKER */
                <div className="z-10 flex flex-col md:flex-row gap-5 flex-1 items-stretch md:overflow-hidden min-h-0">
                  {/* Left Column: Cam Viewfinder / Scanner Overlay */}
                  <div className="flex-1 w-full md:max-w-sm bg-slate-900/20 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                    {/* Viewfinder Target Framing Corner brackets */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/60 rounded-tl pointer-events-none" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500/60 rounded-tr pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500/60 rounded-bl pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/60 rounded-br pointer-events-none" />

                    {isQrScanning ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-4">
                        {/* Red Scanning Laser Line Overlay */}
                        <motion.div 
                          className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444] z-20 pointer-events-none"
                          animate={{ top: ['15%', '85%', '15%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />

                        {isRealCameraActive && (
                          <div className="absolute top-4 left-4 z-30 flex flex-col items-start gap-1 select-none">
                            <div className="bg-slate-950/90 border border-slate-800 rounded-md p-0.5 flex items-center gap-0.5 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setQrFacingMode('user');
                                  setSelectedQrCameraId('');
                                }}
                                className={`px-1 py-0.5 rounded text-[7px] font-mono font-bold transition-all uppercase cursor-pointer ${
                                  qrFacingMode === 'user' && !selectedQrCameraId
                                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Front
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQrFacingMode('environment');
                                  setSelectedQrCameraId('');
                                }}
                                className={`px-1 py-0.5 rounded text-[7px] font-mono font-bold transition-all uppercase cursor-pointer ${
                                  qrFacingMode === 'environment' && !selectedQrCameraId
                                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Back
                              </button>
                            </div>
                          </div>
                        )}

                        {isRealCameraActive ? (
                          <video 
                            ref={qrVideoRef} 
                            className={`w-full h-full object-cover rounded-lg opacity-85 ${qrFacingMode === 'user' && !selectedQrCameraId ? 'scale-x-[-1]' : ''}`}
                            playsInline 
                            muted 
                          />
                        ) : (
                          /* Visual simulated QR tracker */
                          <div className="relative w-44 h-44 border border-dashed border-emerald-500/40 rounded-xl flex flex-col items-center justify-center overflow-hidden bg-slate-900/60">
                            <div className="absolute inset-3 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                              {/* Glowing digital matrix matrix mockup */}
                              <div className="w-28 h-28 opacity-40 flex flex-wrap p-2 gap-1 bg-slate-950 rounded">
                                {Array.from({ length: 36 }).map((_, i) => {
                                  const isCorner = i === 0 || i === 5 || i === 30 || i === 35;
                                  return (
                                    <div 
                                      key={i} 
                                      className={`w-3.5 h-3.5 rounded-sm ${
                                        isCorner 
                                          ? 'bg-emerald-400 border-2 border-slate-950' 
                                          : Math.random() > 0.4 ? 'bg-slate-800' : 'bg-transparent'
                                      }`} 
                                    />
                                  );
                                })}
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-pulse pointer-events-none" />
                          </div>
                        )}

                        {qrScanProgress !== null && (
                          <div className="absolute inset-x-4 bottom-4 bg-slate-950/95 border border-slate-850 p-3 rounded-xl space-y-1.5 z-30 shadow-2xl">
                            <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                                {qrScanMessage}
                              </span>
                              <span className="text-emerald-400 font-mono text-xs">{qrScanProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150" 
                                style={{ width: `${qrScanProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : qrScanResult ? (
                      /* QR Decryption Success Result Card */
                      <div className="z-10 flex flex-col items-center justify-center p-4 text-center space-y-3.5 w-full">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                            Accessory Registered
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1">
                            {qrScanResult.name.split(' (')[0]}
                          </h4>
                          <p className="text-[8px] font-mono text-slate-400">
                            MAC: <span className="text-slate-200">{qrScanResult.mac}</span>
                          </p>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl w-full text-left font-mono space-y-1 text-[8px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">ENCRYPTION:</span>
                            <span className="text-emerald-400 font-bold">AES-GCM 256</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">DYNAMIC PASS:</span>
                            <span className="text-slate-300">0x{qrScanResult.code.replace('BB-', '')}FF9D</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">SIGNAL CH:</span>
                            <span className="text-slate-300">{qrScanResult.channel}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQrScanResult(null)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
                        >
                          Scan Next Label
                        </button>
                      </div>
                    ) : (
                      /* Standby Viewfinder layout */
                      <div className="z-10 flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-center text-slate-500 relative">
                          <QrCode className="w-8 h-8 text-slate-400/80" />
                          <div className="absolute inset-1.5 border border-dashed border-slate-800 rounded-lg pointer-events-none" />
                        </div>
                        <div className="space-y-1 max-w-[200px]">
                          <p className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            Compliance QR Scanner
                          </p>
                          <p className="text-[8px] text-slate-400 leading-normal">
                            Aim your camera at the companion QR label on any compliant third-party accessory to initiate secure hardware linking.
                          </p>
                        </div>
                        <div className="space-y-2 pt-1 w-full">
                          <button
                            type="button"
                            onClick={() => handleStartQrLink(selectedQrHardwareId)}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                          >
                            <Scan className="w-3.5 h-3.5" />
                            Scan Device Label
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsRealCameraActive(!isRealCameraActive);
                              if (!isRealCameraActive) {
                                const videoConstraints: any = {};
                                if (selectedQrCameraId) {
                                  videoConstraints.deviceId = { exact: selectedQrCameraId };
                                } else {
                                  videoConstraints.facingMode = qrFacingMode;
                                }
                                navigator.mediaDevices.getUserMedia({ video: videoConstraints }).catch(() => {});
                              }
                            }}
                            className={`w-full py-1 border rounded-lg text-[8px] font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                              isRealCameraActive
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${isRealCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                            Webcam: {isRealCameraActive ? 'CONNECTED' : 'DISCONNECTED (MOCK MODE)'}
                          </button>

                          {/* Dynamic Camera Selector for QR Scanner */}
                          {isRealCameraActive && (
                            <div className="space-y-1.5 border border-slate-850 rounded-lg p-2 bg-slate-950/40 font-mono text-[8px] w-full text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 uppercase font-bold tracking-wider">Lens Direction:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQrFacingMode('user');
                                      setSelectedQrCameraId('');
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition cursor-pointer ${
                                      qrFacingMode === 'user' && !selectedQrCameraId
                                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                        : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    Front
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQrFacingMode('environment');
                                      setSelectedQrCameraId('');
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition cursor-pointer ${
                                      qrFacingMode === 'environment' && !selectedQrCameraId
                                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                        : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    Back
                                  </button>
                                </div>
                              </div>

                              {availableCameras.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 justify-between">
                                  <span className="text-slate-400 uppercase font-bold tracking-wider">Device:</span>
                                  <select
                                    id="qr-device-select"
                                    value={selectedQrCameraId}
                                    onChange={(e) => {
                                      setSelectedQrCameraId(e.target.value);
                                    }}
                                    className="bg-slate-900 border border-slate-850 text-slate-300 rounded font-mono text-[8px] font-bold py-0.5 px-1 outline-none focus:ring-0 max-w-[130px] cursor-pointer"
                                  >
                                    <option value="" className="bg-slate-900 text-slate-300">
                                      Auto ({qrFacingMode === 'user' ? 'Front' : 'Back'})
                                    </option>
                                    {availableCameras.map((device, i) => (
                                      <option key={device.deviceId} value={device.deviceId} className="bg-slate-950 text-slate-300">
                                        {device.label || `Camera ${i + 1}`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Smart Hardware list selector and list of linked gear */}
                  <div className="flex-1 bg-slate-900/10 border border-slate-800/60 rounded-xl p-4 flex flex-col overflow-hidden justify-between h-full min-h-0">
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Select Third-Party Hardware to Scan
                      </span>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {COMPATIBLE_HARDWARES.map(hw => {
                          const isSelected = selectedQrHardwareId === hw.id;
                          return (
                            <div
                              key={hw.id}
                              onClick={() => {
                                setSelectedQrHardwareId(hw.id);
                                setQrScanResult(null);
                              }}
                              className={`w-full p-2 rounded-lg border transition flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-950/15 border-emerald-500/40 text-white'
                                  : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:bg-slate-900/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs shrink-0">
                                  {hw.type === 'glasses' ? '🕶️' : hw.type === 'camera' ? '📷' : '🚁'}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-[10px] font-bold truncate text-white">{hw.name.split(' (')[0]}</h5>
                                  <p className="text-[7.5px] text-slate-500 font-mono truncate">{hw.mac} • Code: {hw.code}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQrHardwareId(hw.id);
                                  handleStartQrLink(hw.id);
                                }}
                                className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[8px] font-extrabold uppercase rounded transition shrink-0 cursor-pointer"
                              >
                                Link
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Historical ledger of linked hardware devices */}
                    <div className="pt-2.5 border-t border-slate-900/80 flex-1 flex flex-col justify-between min-h-0">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Active QR Secured Accessory Registry ({linkedQrDevices.length})
                      </span>
                      <div className="space-y-1 overflow-y-auto flex-1 pr-1 min-h-[50px]">
                        {linkedQrDevices.length === 0 ? (
                          <div className="border border-dashed border-slate-800 rounded-lg p-2.5 text-center text-slate-500 text-[8px] font-mono leading-normal flex items-center justify-center h-full">
                            ℹ️ Connect smart tag identifiers via the QR viewfinder to add them to your compliant opt-out group.
                          </div>
                        ) : (
                          linkedQrDevices.map((dev, i) => (
                            <div key={i} className="bg-slate-950/80 border border-slate-900/50 p-2 rounded-lg flex items-center justify-between gap-2 text-[8px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span>{dev.type === 'glasses' ? '🕶️' : dev.type === 'camera' ? '📷' : '🚁'}</span>
                                <div className="truncate min-w-0">
                                  <span className="text-white font-semibold block leading-tight truncate">{dev.name.split(' (')[0]}</span>
                                  <span className="text-[7px] text-slate-500 font-mono">{dev.mac} • ID: {dev.code}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 border border-emerald-500/10 rounded">
                                <CheckCircle className="w-2 h-2 text-emerald-400" />
                                <span>SECURED</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'heatmap' ? (
            /* PRIVACY HEATMAP VISUALIZATION WITH D3 REAL-TIME PRIVACY THREAT MAP */
            <div className="relative w-full bg-slate-950 p-5 flex flex-col justify-between select-none font-sans">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 z-10 shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-emerald-400" />
                    Real-Time Privacy Threat Map
                  </h3>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Live D3.js sector simulation mapping geofenced safe-zones and unauthorized camera arrays around your location
                  </p>
                </div>
              </div>

              <div className="my-3 flex-1 min-h-0 font-sans">
                <PrivacyThreatMap
                  citizenState={citizenState}
                  onChange={onChange || (() => {})}
                  addLog={addLog}
                />
              </div>

              {/* Bottom Row Information */}
              <div className="border-t border-slate-900 pt-3 z-10 shrink-0 flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>D3 CLOUD FORCE ENGINE v3.1</span>
                <span className="text-emerald-400 font-bold uppercase animate-pulse">● SHIELD GEOMESH BROADCAST: LOCKED</span>
                <span>BLURBUBBLE COOPERATIVE CORE</span>
              </div>
            </div>
          ) : (
            /* STREET SIMULATION HUDFEED */
            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
              {/* LiDAR Mode Scanner Overlay */}
              {lidarModeActive && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-emerald-950/20 mix-blend-screen overflow-hidden flex flex-col justify-between p-3 font-mono border-2 border-emerald-500/80 animate-pulse">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(52,211,153,0.3)_10%,transparent_80%)]" />
                  
                  <div className="absolute top-4 left-4 space-y-1 text-emerald-400 text-[10px] uppercase font-bold tracking-widest drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>[ ACTIVE LIDAR DEPTH RANGE ]</span>
                    </div>
                    <div>RANGE LIMIT: 45m SPATIAL RESOLUTION</div>
                    <div>FREQUENCY: 940nm INFRARED PULSED</div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 text-right space-y-0.5 text-emerald-400 text-[8px] drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]">
                    <div>REFRESH: 120 Hz</div>
                    <div>LATENCY: 1.2 ms NPU_PASS</div>
                    <div>DENSITY: 2.4 MILLION POINTS/SEC</div>
                  </div>

                  {/* Rotating targeting rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div 
                      className="w-48 h-48 border-2 border-dashed border-emerald-400/60 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="w-24 h-24 border border-dotted border-emerald-300/40 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* RF Static Noise Glitch Overlay */}
              {rfInterference > 0 && (
                <div 
                  className="absolute inset-0 z-40 pointer-events-none overflow-hidden mix-blend-screen bg-slate-950/20 flex items-center justify-center font-mono"
                  style={{ opacity: rfInterference / 100 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_10%,transparent_90%)] bg-[size:3px_3px] opacity-80 animate-pulse" />
                  <div className="absolute inset-y-0 w-full bg-[linear-gradient(rgba(255,255,255,0.08)_50%,transparent_50%)] bg-[size:100%_8px] opacity-70 animate-bounce" />
                  
                  <div 
                    className="absolute h-1 bg-white/40 w-full left-0 animate-ping"
                    style={{
                      top: `${Math.random() * 100}%`,
                      animationDuration: '0.15s',
                    }}
                  />

                  <div className="px-3 py-1 bg-black/90 border border-amber-500/80 rounded text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>[ ⚠️ SIGNAL INTERFERENCE DETECTED: {rfInterference}% ]</span>
                  </div>
                </div>
              )}
              {/* Virtual background scene representing a city walk */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {/* Glowing stars/particles in background */}
                {sandboxShowBackgroundGrid && (
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff,transparent_1px)] bg-[size:32px_32px] opacity-10" />
                )}
              </div>
              
              {/* Grid perspectives line simulating depth */}
              {sandboxShowBackgroundGrid && (
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-slate-900/10 border-t border-slate-800/40 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none transform origin-bottom perspective-1000 rotate-x-45"></div>
              )}

              {/* Distant skyline silhouettes (Elegant & Cyberpunk) */}
              {sandboxShowSkyline && (
                <div className="absolute bottom-1/3 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent opacity-50 flex items-end justify-around px-8 border-b border-slate-800/30 pointer-events-none select-none overflow-hidden">
                  {/* Building 1 */}
                  <div className="w-20 h-24 bg-slate-900/60 border-t border-x border-slate-800/80 rounded-t-lg relative flex flex-wrap content-start gap-1 p-2">
                    <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-800">
                      <div className="w-1 h-1 bg-red-500 rounded-full -mt-0.5 -ml-0.5 animate-pulse" />
                    </div>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1 bg-slate-700/20 rounded-xs" />
                    ))}
                  </div>
                  {/* Building 2 */}
                  <div className="w-16 h-36 bg-slate-900/40 border-t border-x border-slate-800/60 rounded-t-lg relative flex flex-wrap content-start gap-1 p-1">
                    <div className="absolute -top-8 left-1/3 w-px h-8 bg-slate-700">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full -mt-0.5 -ml-0.5 animate-ping" />
                    </div>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-2 h-1 bg-emerald-500/10 rounded-xs" />
                    ))}
                  </div>
                  {/* Building 3 (Tall Spire) */}
                  <div className="w-24 h-44 bg-slate-900/50 border-t border-x border-slate-800/80 rounded-t-xl relative flex flex-col justify-between p-2">
                    <div className="absolute -top-12 left-1/2 w-px h-12 bg-emerald-500/30">
                      <div className="w-1 h-1 bg-red-500 rounded-full -mt-0.5 -ml-0.5 animate-pulse" />
                    </div>
                    <div className="w-full h-1/2 border-b border-slate-800/40" />
                    <div className="flex justify-between text-[6px] font-mono text-slate-700">
                      <span>SYS_01</span>
                      <span>MESH_09</span>
                    </div>
                  </div>
                  {/* Building 4 */}
                  <div className="w-12 h-28 bg-slate-900/35 border-t border-x border-slate-800/50 rounded-t-lg relative flex flex-wrap content-start gap-1.5 p-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-2 h-1 bg-slate-700/15 rounded-xs" />
                    ))}
                  </div>
                  {/* Building 5 */}
                  <div className="w-28 h-18 bg-slate-900/70 border-t border-x border-slate-800/80 rounded-t-md relative flex justify-center items-center">
                    <div className="text-[7px] font-mono text-slate-600 select-none uppercase tracking-widest">[ BLURBUBBLE_HQ ]</div>
                  </div>
                </div>
              )}

              {/* Simulated Horizon line / Street sidewalk (Polished & Glowing) */}
              {sandboxShowSidewalk && (
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-slate-950 border-t border-slate-800/60 overflow-hidden flex flex-col justify-between py-2 pointer-events-none select-none">
                  {/* Scanning line sliding across sidewalk */}
                  <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent top-1/4 animate-pulse" />
                  
                  {/* Perspective crosswalk markings */}
                  <div className="absolute inset-0 opacity-15 flex justify-center gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-4 h-full bg-slate-700 transform"
                        style={{
                          transform: `skewX(${(i - 4.5) * 6}deg) scaleY(1.5)`,
                          opacity: 0.15 + (1 - Math.abs(i - 4.5) / 5) * 0.3
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-full text-center text-[8px] text-slate-500 font-mono tracking-widest uppercase flex items-center justify-center gap-2 relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SIMULATED CROSSWALK STAGE • ACTIVE COHERENCE MATRIX</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Micro tech metrics at the bottom of the street view */}
                  <div className="flex justify-between items-center px-4 text-[7px] font-mono text-slate-600 relative z-10 border-t border-slate-900/60 pt-1">
                    <span>LATENCY: 1.4ms</span>
                    <span>BEACON REGISTRY: 4 NODE_OK</span>
                    <span>BANDWIDTH: BLE ADV BROADCAST</span>
                  </div>
                </div>
              )}

              {/* Interactive Pedestrians (Merged defaults + user smart tags) */}
              {activePedestriansList.map((ped) => {
                const isSelected = selectedPedestrian === ped.id;

                // 3D perspective rotation yaw & pitch calculations for hard-mapping demonstration
                const timeSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
                let headYaw = 0;
                let headPitch = 0;
                let headRoll = 0;

                if (sandboxAutoOscillateHead) {
                  // Standard walking head sway and target tracking rotation
                  const baseDirYaw = ped.direction === 'right' ? 25 : -25;
                  const sweep = Math.sin(timeSec * 1.5 + (ped.posX % 9)) * 30; // Scans left/right up to 30 degrees
                  headYaw = baseDirYaw + sweep;
                  headPitch = Math.cos(timeSec * 3.0 + (ped.posX % 5)) * 6; // Slight nod
                  headRoll = Math.sin(timeSec * 2.0 + (ped.posX % 3)) * 4; // Slight roll
                } else {
                  // Manual control active
                  if (isSelected) {
                    headYaw = sandboxHeadYaw;
                    headPitch = sandboxHeadPitch;
                  } else {
                    headYaw = ped.direction === 'right' ? 25 : -25;
                  }
                }
                
                return (
                  <motion.div
                    key={ped.id}
                    onClick={() => setSelectedPedestrian(ped.id)}
                    style={{
                      position: 'absolute',
                      left: `${ped.posX}%`,
                      top: `${ped.posY}%`,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isSelected ? 1.05 : 1, 
                      opacity: 1,
                      y: [0, -4, 0],
                      x: "-50%",
                      translateY: "-50%"
                    }}
                    transition={{
                      y: {
                        repeat: Infinity,
                        duration: 1.6 + (ped.id === 'citizen-alex' ? 0.2 : (ped.posX % 4) * 0.1),
                        ease: "easeInOut"
                      },
                      scale: { duration: 0.2 }
                    }}
                    className="cursor-pointer z-20 group"
                  >
                    {/* Character Avatar Capsule */}
                    <div className="relative flex flex-col items-center select-none font-sans">
                      {/* Dynamic ambient glow behind characters */}
                      {sandboxShowGlow && (
                        <div className={`absolute inset-0 -m-4 bg-gradient-to-b rounded-full blur-xl opacity-20 pointer-events-none transition-all ${
                          ped.isChildTag 
                            ? 'from-indigo-500/20 to-transparent' 
                            : ped.isBroadcasting 
                              ? 'from-emerald-500/20 to-transparent' 
                              : 'from-slate-500/10 to-transparent'
                        }`} />
                      )}

                      {/* NVIDIA-Style Spatial 3D skeletal mesh overlay representing real-time world-mapping */}
                      {sandboxShowMesh && ped.isBroadcasting && !citizenState.overrideActive && (
                        <div className="absolute -top-3 w-16 h-28 pointer-events-none z-30 animate-pulse" style={{ animationDuration: '4s' }}>
                          <svg className="w-full h-full text-emerald-400/80 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]" viewBox="0 0 60 100" fill="none">
                            {/* Triangulation vectors tracking joints */}
                            <path 
                              d="
                                M 30,12 L 20,24 L 30,32 Z 
                                M 30,12 L 40,24 L 30,32 Z 
                                M 20,24 L 12,38 L 22,46 L 30,32 Z 
                                M 40,24 L 48,38 L 38,46 L 30,32 Z 
                                M 22,46 L 30,52 L 38,46 L 30,32 Z 
                                M 12,38 L 10,64 L 20,68 L 22,46 Z 
                                M 48,38 L 50,64 L 40,68 L 38,46 Z 
                                M 20,68 L 30,82 L 40,68 L 30,52 Z 
                                M 20,68 L 16,98 M 40,68 L 44,98
                              " 
                              stroke="currentColor" 
                              strokeWidth="0.6" 
                              className="opacity-70"
                            />
                            
                            {/* Tracking Node Circles */}
                            <circle cx="30" cy="12" r="1.5" fill="currentColor" /> {/* Head */}
                            <circle cx="30" cy="32" r="1" fill="currentColor" /> {/* Chest */}
                            <circle cx="20" cy="24" r="1" fill="currentColor" /> {/* L Shoulder */}
                            <circle cx="40" cy="24" r="1" fill="currentColor" /> {/* R Shoulder */}
                            <circle cx="12" cy="38" r="1" fill="currentColor" /> {/* L Elbow */}
                            <circle cx="48" cy="38" r="1" fill="currentColor" /> {/* R Elbow */}
                            <circle cx="10" cy="64" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '1.5s' }} /> {/* L Wrist */}
                            <circle cx="50" cy="64" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '1.5s' }} /> {/* R Wrist */}
                            <circle cx="20" cy="68" r="1" fill="currentColor" /> {/* L Hip */}
                            <circle cx="40" cy="68" r="1" fill="currentColor" /> {/* R Hip */}
                            
                            {/* Coordinate dynamic tracking lines */}
                            <line x1="30" x2="52" y1="32" y2="32" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" className="opacity-55" />
                            <text x="54" y="34" className="fill-emerald-300 font-mono text-[4px] font-bold">NODE_TRK</text>
                          </svg>
                        </div>
                      )}

                      {/* Bounding vector box if face match detection is active */}
                      {sandboxShowMesh && citizenState.facialRecognitionOptOut && (ped.id === 'citizen-alex' || ped.isChildTag) && (
                        <div className="absolute -top-10 bg-blue-500/90 text-slate-950 border border-blue-400 font-mono text-[7px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg animate-pulse whitespace-nowrap">
                          <Smile className="w-2.5 h-2.5" />
                          AI FACE MATCH 98%
                        </div>
                      )}

                      {/* 3D Holographic Projected Bounding Cage */}
                      {sandboxShow3DBoundingCage && (ped.isBroadcasting || (citizenState.targetedShieldingEnabled === false && ped.id !== 'citizen-alex')) && !citizenState.overrideActive && !whitelistRegistry.includes(ped.id) && (
                        <div 
                          className="absolute w-18 h-18 pointer-events-none z-30 transition-all duration-100 flex items-center justify-center"
                          style={{
                            transform: `perspective(180px) rotateY(${headYaw}deg) rotateX(${headPitch}deg) rotateZ(${headRoll}deg) translateZ(12px)`,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Outer transparent green cube cage */}
                          <div className={`absolute inset-0 border border-dashed rounded-lg transition-all ${
                            isSelected ? 'border-emerald-400/80 bg-emerald-500/10' : 'border-emerald-500/30 bg-transparent'
                          }`}>
                            {/* Inner brackets */}
                            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
                            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />
                          </div>
                        </div>
                      )}

                      {/* Head/Face Area with Compliance Shields (Polished Avatar Sphere) */}
                      <div 
                        style={{
                          transform: `perspective(180px) rotateY(${headYaw}deg) rotateX(${headPitch}deg) rotateZ(${headRoll}deg)`,
                          transformStyle: 'preserve-3d',
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden transition-all shadow-lg group-hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] ${
                          ped.isChildTag 
                            ? 'bg-slate-900 border-2 border-indigo-400' 
                            : isSelected 
                              ? 'bg-slate-900 border-2 border-emerald-400' 
                              : 'bg-slate-900 border-2 border-slate-700'
                        }`}
                      >
                        {/* Inner elegant initial label */}
                        <span className="text-xs font-mono font-bold select-none text-slate-400 uppercase tracking-widest">
                          {ped.isChildTag ? '👶' : ped.avatarSeed.substring(0, 3)}
                        </span>

                        {/* EMERGENCY PRIVACY ACTIVE (HARD OPT-OUT) OVERRIDE */}
                        {citizenState.emergencyPrivacyActive && (ped.id === 'citizen-alex' || ped.isChildTag) ? (
                          <div className="absolute inset-0 w-full h-full rounded-full border-2 border-red-500 bg-red-950/95 flex flex-col items-center justify-center text-white z-10 animate-pulse">
                            <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
                            <span className="text-[5px] font-mono text-red-400 font-bold tracking-widest uppercase">HALT_CAM</span>
                          </div>
                        ) : (
                          <>
                            {/* LIVE HANDSHAKE CENSOR BLURS (The Blur Bubble Shield) */}
                            {sandboxShowBlur && ((ped.isBroadcasting || (citizenState.targetedShieldingEnabled === false && ped.id !== 'citizen-alex')) && !citizenState.overrideActive && !whitelistRegistry.includes(ped.id)) && (
                              <div className="absolute inset-0 w-full h-full rounded-full transition-all z-10">
                                {/* Computed dynamic privacy level (falls back to strict_blur for collateral blanket jam) */}
                                {(() => {
                                  const activePrivacyLevel = ped.isBroadcasting ? ped.privacyLevel : 'strict_blur';
                                  
                                  if (activePrivacyLevel === 'magic_removal') {
                                    return (
                                      <div className="w-full h-full rounded-full relative overflow-hidden bg-slate-950/90 flex flex-col items-center justify-center border border-emerald-500/40">
                                        {/* Digital Camouflage Grid pattern */}
                                        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,#34d399_25%,transparent_25%),linear-gradient(-45deg,#34d399_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#34d399_75%),linear-gradient(-45deg,transparent_75%,#34d399_75%)] bg-[size:6px_6px] animate-pulse" />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-emerald-500/10 animate-spin" style={{ animationDuration: '6s' }} />
                                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-400/30 pointer-events-none" />
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-400/30 pointer-events-none" />
                                        <Sparkles className="w-5 h-5 text-emerald-400 relative z-10 animate-pulse" />
                                        <span className="text-[5.5px] font-mono text-emerald-300 uppercase font-bold tracking-widest mt-0.5 relative z-10 bg-slate-950/80 px-1 py-0.2 rounded border border-emerald-500/20">LOCKED_MAGIC</span>
                                      </div>
                                    );
                                  }

                                  if (activePrivacyLevel === 'strict_blur') {
                                    return (
                                      <div 
                                        className="w-full h-full rounded-full bg-slate-950/40 border border-emerald-400/50 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.25)] relative"
                                        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                                      >
                                        {/* Subpixel Tracking Target Reticle to show Hard-Mapping */}
                                        <div className="absolute inset-1 border border-emerald-500/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-400/30 pointer-events-none" />
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-400/30 pointer-events-none" />
                                        <EyeOff className="w-4 h-4 text-emerald-400 animate-pulse relative z-10" />
                                        <span className="text-[5.5px] font-mono text-emerald-300 uppercase font-bold tracking-widest mt-0.5 relative z-10 bg-slate-950/80 px-1 py-0.2 rounded border border-emerald-500/20">LOCKED_BLUR</span>
                                      </div>
                                    );
                                  }

                                  if (activePrivacyLevel === 'pixelate') {
                                    return (
                                      <div className="w-full h-full rounded-full bg-slate-950/85 border border-amber-500/40 flex flex-col items-center justify-center relative overflow-hidden">
                                        {/* Cyber mosaic pixels */}
                                        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-[size:4px_4px] opacity-40 animate-pulse" />
                                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-400/30 pointer-events-none" />
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber-400/30 pointer-events-none" />
                                        <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/20 animate-ping left-1/2" />
                                        <Scan className="w-4 h-4 text-amber-400 animate-pulse relative z-10" />
                                        <span className="text-[5.5px] font-mono text-amber-300 uppercase font-bold tracking-widest mt-0.5 relative z-10 bg-slate-950/80 px-1 py-0.2 rounded border border-amber-500/20">LOCKED_PXL</span>
                                      </div>
                                    );
                                  }

                                  if (activePrivacyLevel === 'emoji') {
                                    return (
                                      <div className="w-full h-full rounded-full bg-slate-950/95 border border-cyan-400/50 flex flex-col items-center justify-center">
                                        <Smile className="w-5 h-5 text-cyan-400 animate-pulse" />
                                        <span className="text-[6px] font-mono text-cyan-400 uppercase font-bold tracking-widest mt-0.5">MASKED</span>
                                      </div>
                                    );
                                  }

                                  if (activePrivacyLevel === 'black_bar') {
                                    return (
                                      <div className="w-full h-full rounded-full bg-slate-950/80 border border-red-500/40 flex flex-col items-center justify-center overflow-hidden">
                                        <div className="w-full py-0.5 bg-black border-y border-red-500/60 flex items-center justify-center text-[7px] text-red-500 font-bold uppercase tracking-wider font-mono">
                                          REDACTED
                                        </div>
                                      </div>
                                    );
                                  }

                                  return null;
                                })()}
                              </div>
                            )}

                            {/* WARRANT OVERRIDE BYPASS INDICATOR */}
                            {ped.isBroadcasting && citizenState.overrideActive && (
                              <div className="absolute inset-0 w-full h-full rounded-full border border-red-500/60 animate-pulse flex items-center justify-center bg-red-950/40 z-10">
                                <span className="text-[7px] text-red-400 uppercase tracking-wider font-bold font-mono">RAW_VFP</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Torso (Polished Holographic Body Capsule) */}
                      <div className={`w-8 h-12 border rounded-b-xl -mt-1 shadow-md relative overflow-hidden transition-all group-hover:border-slate-600 ${
                        ped.isChildTag 
                          ? 'bg-gradient-to-b from-indigo-950 to-indigo-900/60 border-indigo-500/40' 
                          : isSelected
                            ? 'bg-gradient-to-b from-slate-900 to-emerald-950/30 border-emerald-500/30'
                            : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
                      }`}>
                        {/* Vertical scanning line */}
                        <div className="absolute inset-x-0 h-0.5 bg-emerald-500/20 top-0 animate-bounce" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/5"></div>
                        {ped.isChildTag && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]">🎒</div>
                        )}
                        
                        {/* Active heartbeat node indicator */}
                        {ped.isBroadcasting && !citizenState.overrideActive && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          </div>
                        )}
                      </div>

                      {/* Selection Box / HUD telemetry cursor */}
                      {isSelected && sandboxShowTargetBrackets && (
                        <div className="absolute -inset-5 border border-dashed border-emerald-500/50 rounded-xl animate-pulse pointer-events-none">
                          {/* Corner brackets */}
                          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />
                          
                          {/* Targeting coordinates indicator */}
                          <div className="absolute -top-4 -left-6 bg-black/80 border border-slate-800 px-1 py-0.2 rounded text-[5px] text-emerald-400 font-mono scale-90">
                            TRK_X: {ped.posX.toFixed(1)}%
                          </div>
                          <div className="absolute -bottom-4 -right-6 bg-black/80 border border-slate-800 px-1 py-0.2 rounded text-[5px] text-emerald-400 font-mono scale-90">
                            TRK_Y: {ped.posY.toFixed(1)}%
                          </div>
                        </div>
                      )}

                      {/* Distance / Name label (Clean Capsule Tag) */}
                      {sandboxShowLabels && (
                        <div className={`mt-3 bg-slate-950/90 border rounded-full px-2.5 py-0.5 text-[8px] font-mono flex items-center gap-1.5 shadow-xl transition-all ${
                          isSelected 
                            ? 'border-emerald-500/50 text-emerald-300' 
                            : 'border-slate-850 text-slate-400 group-hover:border-slate-700'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${ped.isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span className="text-slate-200 font-bold">{ped.isChildTag ? 'CHILD' : ped.name.split(' ')[0].toUpperCase()}</span>
                          <span className="text-slate-600">|</span>
                          <span className="font-semibold">{ped.signalStrength} dBm</span>
                          {whitelistRegistry.includes(ped.id) && (
                            <span className="text-[7px] text-cyan-400 font-bold px-1 bg-cyan-950/50 rounded-full">OK</span>
                          )}
                        </div>
                      )}

                      {/* SOCIAL DISCOVERY BUBBLE (OPT-IN) */}
                      {sandboxShowLabels && ped.isBroadcasting && ped.privacyLevel === 'none' && ped.socialProfile && (
                        <div className="absolute bottom-20 w-44 bg-slate-900/95 border-2 border-emerald-400/80 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-auto transform transition duration-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="font-mono text-[10px] text-white font-bold tracking-tight">
                              {ped.socialProfile.username}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-300 font-sans leading-relaxed line-clamp-2">
                             {ped.socialProfile.bio}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {ped.socialProfile.interests.map(tag => (
                              <span key={tag} className="text-[7px] bg-emerald-950/60 text-emerald-300 border border-emerald-900/50 px-1 py-0.1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Dynamic HUD Shield Status Indicator Overlay */}
              <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-800 rounded-lg p-2.5 space-y-1 z-20 font-mono text-[9px] shadow-2xl max-w-[210px] pointer-events-none">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-slate-400 font-bold uppercase">Shield Status</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    citizenState.isBroadcasting 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {citizenState.isBroadcasting ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-slate-500 font-semibold">Audio Shield:</span>
                  <span className="text-slate-200">
                    {citizenState.targetedShieldingEnabled !== false ? '🔊 Targeted' : '⚠️ Blanket'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-slate-500 font-semibold">Signal Cone:</span>
                  <span className="text-emerald-400 font-bold">{(citizenState.targetedSoundAngle || 45)}° Beam</span>
                </div>
                <p className="text-[8px] text-slate-400 leading-normal border-t border-slate-900 pt-1.5 mt-1.5 font-sans">
                  {citizenState.targetedShieldingEnabled !== false 
                    ? "Surgical Targeted Protection: Paul Stuart's face is blurred, voice is scrambled. Nearby bystanders remain 100% clear and untouched."
                    : "Blanket Protection Mode: Omnidirectional audio scrambling active. Innocent bystanders collateral-blurred."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* HUD Controls Sandbox */}
        <div className={`xl:col-span-4 border rounded-2xl p-5 backdrop-blur-md space-y-5 transition-all duration-300 ${
          glassClarityMode 
            ? 'bg-slate-950/15 border-slate-800/40 shadow-xl' 
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-white">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold">Active HUD Inspector</h3>
          </div>

          <p className="text-xs text-slate-400 leading-normal">
            {activeTab === 'street' 
              ? "Select any pedestrian strolling in the Street Sandbox to view, edit, or override their BlurBubble compliance settings in real-time."
              : activeTab === 'scanner'
                ? "Select a nearby AI device from the directory or radar scanning blips, then trigger an Opt-Out Handshake to test localized signal protection."
                : "Calibrate your own wearable options in the main panel. If your webcam is active, drag the tracking focus overlay directly over your face."}
          </p>

          <AnimatePresence mode="wait">
            {activeTab === 'scanner' ? (
              (() => {
                const dev = scannedDevices.find(d => d.id === selectedScannerDevice);
                if (!dev) return (
                  <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-2">
                    <HelpCircle className="w-6 h-6 mx-auto text-slate-600" />
                    <p className="text-xs">No Device Selected</p>
                    <p className="text-[10px] text-slate-600">
                      Select any recording device on the scan list or radar sweep to inspect.
                    </p>
                  </div>
                );

                const signalPower = dev.signalStrength;
                let efficacyPercentage = Math.round(100 - (Math.abs(signalPower) - 30) * 1.2);
                efficacyPercentage = Math.max(12, Math.min(efficacyPercentage, 99));

                let efficacyLabel = 'Stable Shield';
                let efficacyColor = 'text-emerald-400';
                if (signalPower < -75) {
                  efficacyLabel = 'Weak / Path Attenuation';
                  efficacyColor = 'text-amber-500';
                } else if (signalPower < -60) {
                  efficacyLabel = 'Good / Standard Range';
                  efficacyColor = 'text-blue-400';
                } else {
                  efficacyLabel = 'Excellent / Line of Sight';
                  efficacyColor = 'text-emerald-400';
                }

                return (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4 font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Node Inspector</h4>
                        <p className="text-sm font-bold text-white mt-0.5">{dev.name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        dev.complianceStatus === 'secured' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : dev.complianceStatus === 'handshaking'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {dev.complianceStatus.toUpperCase()}
                      </span>
                    </div>

                    {/* Signal Quality & Efficacy Card */}
                    <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Transmission Efficacy:</span>
                        <span className={`${efficacyColor} font-mono`}>{efficacyPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            signalPower > -60 ? 'bg-emerald-400' : signalPower > -75 ? 'bg-blue-400' : 'bg-amber-500'
                          }`}
                          style={{ width: `${efficacyPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Quality: {efficacyLabel} ({dev.signalStrength} dBm)</span>
                      </p>
                    </div>

                    {/* Handshake simulator status */}
                    <div className="space-y-2">
                      {dev.complianceStatus === 'unrestricted' && (
                        <div className="flex flex-col gap-2">
                          <button
                            id="broadcast-shield-btn-inspector"
                            onClick={() => handleBroadcastShield(dev.id)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition uppercase tracking-wide shadow-md shadow-red-500/15 border border-red-400/50"
                          >
                            <Shield className="w-3.5 h-3.5 text-white" />
                            Broadcast Shield (One-Tap Blur)
                          </button>
                          <button
                            id="init-handshake-btn"
                            onClick={() => triggerHandshakeSimulation(dev.id)}
                            className="w-full bg-slate-900 hover:bg-slate-850 text-blue-400 border border-slate-850 hover:border-slate-800 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition uppercase tracking-wide"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
                            Run Handshake Check
                          </button>
                        </div>
                      )}

                      {dev.complianceStatus === 'handshaking' && handshakeProgress !== null && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              Negotiating...
                            </span>
                            <span>{handshakeProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${handshakeProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      {dev.complianceStatus === 'secured' && (
                        <div className="space-y-2">
                          <div className="bg-emerald-950/10 border border-emerald-900/50 rounded-lg p-3 text-center space-y-1">
                            <CheckCircle className="w-5 h-5 mx-auto text-emerald-400" />
                            <p className="text-xs font-bold text-white uppercase tracking-wide">Optical Compliance Active</p>
                            <p className="text-[10px] text-slate-400 leading-normal">
                              Censor mask is being enforced on this node's live video stream buffer.
                            </p>
                          </div>
                          <button
                            id="reset-handshake-btn"
                            onClick={() => {
                              setScannedDevices(prev => prev.map(d => d.id === dev.id ? { ...d, complianceStatus: 'unrestricted', complianceType: 'none' } : d));
                              setHandshakeProgress(null);
                              setHandshakeLogs([]);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] py-1.5 rounded transition font-semibold"
                          >
                            Reset Device Connection
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive Log Console terminal */}
                    {handshakeLogs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">Packet Console Logs</span>
                        <div className="bg-black/80 border border-slate-900 rounded-lg p-2.5 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
                          {handshakeLogs.map((logStr, i) => (
                            <p key={i} className={logStr.includes('✅') ? 'text-emerald-400' : logStr.includes('🛡️') ? 'text-blue-400' : 'text-slate-400'}>{logStr}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()
            ) : activeTab === 'heatmap' ? (
              <motion.div
                key="heatmap-inspector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-mono">Heatmap Analytics</h4>
                    <p className="text-xs font-bold text-white mt-0.5">Perimeter Guard</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-mono font-bold uppercase tracking-wider animate-pulse">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400 font-sans pt-1">
                  <div className="flex items-center justify-between">
                    <span>Total Historical Logs:</span>
                    <span className="font-mono text-white font-semibold">{logs.length} events</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Clearance Zone Range:</span>
                    <span className="text-emerald-400 font-mono font-bold">{citizenState.isBroadcasting ? `${citizenState.rangeMeters} Meters` : '0 Meters'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Threat Blips:</span>
                    <span className="text-amber-400 font-mono font-bold">{simulatedThreats.length} devices</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                    Latest Intercept Incident
                  </span>
                  {logs.length > 0 ? (
                    <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-[10px] space-y-1 font-mono text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-white truncate font-bold">{logs[logs.length - 1].deviceModel}</span>
                        <span className="text-slate-500 shrink-0">{logs[logs.length - 1].timestamp || 'Just now'}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Distance: {logs[logs.length - 1].distance}m</span>
                        <span className="text-emerald-400 font-bold uppercase">{logs[logs.length - 1].action}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No events recorded yet. Use the 'INJECT THREAT' button to test compliance.</p>
                  )}
                </div>

                <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-[10px] text-emerald-300 leading-relaxed font-sans flex gap-2">
                  <Activity className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400 animate-pulse" />
                  <p>
                    <strong>Automatic Attenuation:</strong> Wearables within your {citizenState.rangeMeters}m boundary receive the opt-out payload in-buffer, blurring any facial/item details automatically.
                  </p>
                </div>
              </motion.div>
            ) : activeTab === 'street' && selectedPedestrian ? (
              (() => {
                const ped = activePedestriansList.find((p) => p.id === selectedPedestrian);
                if (!ped) return null;
                const isCryptoLocked = ped.isChildTag || ped.id === 'citizen-alex';

                return (
                  <motion.div
                    key={ped.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`border rounded-xl p-4 space-y-4 transition-all duration-300 ${
                      glassClarityMode 
                        ? 'bg-slate-950/15 border-slate-800/40 backdrop-blur-md' 
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Target Identified</h4>
                        <p className="text-sm font-bold text-white mt-0.5">{ped.name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        ped.isBroadcasting ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ped.isBroadcasting ? 'BROADCASTING' : 'OFFLINE'}
                      </span>
                    </div>

                    {isCryptoLocked && (
                      <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                          <Lock className="w-3.5 h-3.5" />
                          Crypto Privacy Lock Active
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          This user is broadcasting a legally binding privacy denial. Hardware firmware blocks the camera operator from disabling or bypassing the censor filter.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Simulated Distance:</span>
                        <span className="font-mono text-white">{(Math.abs(50 - ped.posX) * 0.3 + 1).toFixed(1)} meters</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Signal strength:</span>
                        <span className="font-mono text-white">{ped.signalStrength} dBm</span>
                      </div>
                      {ped.isChildTag && (
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Device Type:</span>
                          <span className="text-indigo-400 font-semibold uppercase font-mono">Child Smart Tag</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Handshake Control</span>
                        <button
                          id="toggle-ped-broadcast-btn"
                          onClick={() => togglePedestrianBroadcast(ped.id)}
                          disabled={isCryptoLocked}
                          className={`text-[10px] px-2.5 py-1 rounded font-semibold transition ${
                            isCryptoLocked
                              ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                              : ped.isBroadcasting 
                              ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25' 
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          }`}
                        >
                          {isCryptoLocked ? 'Locked by Broadcast' : ped.isBroadcasting ? 'Revoke Beacon' : 'Grant Beacon'}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Censor Technique</span>
                        {isCryptoLocked ? (
                          <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-xs text-slate-400 font-mono">
                            ENFORCED: <strong className="text-emerald-400">{ped.privacyLevel.toUpperCase().replace('_', ' ')}</strong>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5">
                            {(['magic_removal', 'strict_blur', 'pixelate', 'emoji', 'black_bar', 'none'] as PrivacyLevel[]).map((level) => {
                              const active = ped.privacyLevel === level;
                              return (
                                <button
                                  id={`override-shield-${level}`}
                                  key={level}
                                  onClick={() => changePedestrianShield(ped.id, level)}
                                  className={`text-[10px] py-1.5 px-2 rounded-lg border font-semibold text-center transition ${
                                    active 
                                      ? 'bg-slate-800 border-slate-500 text-white shadow-sm' 
                                      : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  {level === 'none' ? 'Social Opt-In' : level.toUpperCase().replace('_', ' ')}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 3D Head perspective lock simulation controls */}
                      <div className="pt-2.5 border-t border-slate-900/60 space-y-2 font-mono text-[9px]">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">3D Perspective Matrix Anchor</span>
                        
                        {/* 1. Toggle automatic scan oscillation */}
                        <div className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded border border-slate-900">
                          <span className="text-slate-400 font-sans">Head Sweeping Oscillation:</span>
                          <button
                            id="btn-toggle-oscillate-head"
                            onClick={() => {
                              setSandboxAutoOscillateHead(!sandboxAutoOscillateHead);
                              playHudSound('beep');
                            }}
                            className={`px-1.5 py-0.5 rounded font-extrabold text-[8px] uppercase transition ${
                              sandboxAutoOscillateHead 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {sandboxAutoOscillateHead ? 'AUTO' : 'MANUAL'}
                          </button>
                        </div>

                        {/* 2. Toggle 3D holographic projection cube */}
                        <div className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded border border-slate-900">
                          <span className="text-slate-400 font-sans">Holographic 3D Cage:</span>
                          <button
                            id="btn-toggle-bounding-cage"
                            onClick={() => {
                              setSandboxShow3DBoundingCage(!sandboxShow3DBoundingCage);
                              playHudSound('beep');
                            }}
                            className={`px-1.5 py-0.5 rounded font-extrabold text-[8px] uppercase transition ${
                              sandboxShow3DBoundingCage 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {sandboxShow3DBoundingCage ? 'ENABLED' : 'MUTED'}
                          </button>
                        </div>

                        {/* 3. Sliders if in MANUAL mode */}
                        {!sandboxAutoOscillateHead && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2 pt-1 border-t border-slate-900/40"
                          >
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-slate-400 text-[8px]">
                                <span>3D Head Yaw (Rotate Y)</span>
                                <span className="text-emerald-400 font-bold">{sandboxHeadYaw}°</span>
                              </div>
                              <input
                                id="slider-head-yaw"
                                type="range"
                                min="-80"
                                max="80"
                                value={sandboxHeadYaw}
                                onChange={(e) => setSandboxHeadYaw(parseInt(e.target.value))}
                                className="w-full accent-emerald-400 bg-slate-950 rounded h-1 cursor-pointer"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex justify-between text-slate-400 text-[8px]">
                                <span>3D Head Pitch (Tilt X)</span>
                                <span className="text-emerald-400 font-bold">{sandboxHeadPitch}°</span>
                              </div>
                              <input
                                id="slider-head-pitch"
                                type="range"
                                min="-30"
                                max="30"
                                value={sandboxHeadPitch}
                                onChange={(e) => setSandboxHeadPitch(parseInt(e.target.value))}
                                className="w-full accent-emerald-400 bg-slate-950 rounded h-1 cursor-pointer"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : activeTab === 'webcam' ? (
              <motion.div
                key="webcam-ai-tracking-inspector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4 font-sans"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-mono">Neural Vision Engine</h4>
                    <p className="text-xs font-bold text-white mt-0.5">AI Spatial Tracker v3.4</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    aiTrackingActive && webcamActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse' : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                  }`}>
                    {aiTrackingActive && webcamActive ? 'LOCK ON' : 'MANUAL'}
                  </span>
                </div>

                {/* Tracking Activation Toggle */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Vision Tracking</span>
                    <button
                      id="toggle-ai-tracking-active"
                      onClick={() => setAiTrackingActive(!aiTrackingActive)}
                      className={`text-[10px] px-2.5 py-1 rounded font-bold transition ${
                        aiTrackingActive 
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {aiTrackingActive ? '🔴 PAUSE TRACKER' : '🟢 RUN AI AUTO-LOCK'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Onboard glasses cameras continuously scan video frames using a lightweight MobileNet-V4 face/body parsing pipeline, localizing privacy targets in 18ms.
                  </p>
                </div>

                {/* Edge AI / TensorFlow.js BlazeFace Accelerator */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-2.5 border-t-2 border-cyan-500/10">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edge AI Engine</span>
                    </div>
                    <button
                      id="toggle-edge-ai-model"
                      onClick={() => {
                        setUseEdgeAiModel(!useEdgeAiModel);
                        playHudSound('beep');
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded font-bold transition uppercase ${
                        useEdgeAiModel 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 animate-pulse' 
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      disabled={edgeAiModelLoading}
                    >
                      {edgeAiModelLoading ? '⏳ LOADING...' : useEdgeAiModel ? '⚡ ARMED' : '🔌 OFFLINE'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Loads Google's <strong>TensorFlow.js BlazeFace</strong> neural network directly in your browser. Runs Edge AI inference to localize facial features on your camera feed.
                  </p>

                  {edgeAiModelError && (
                    <div className="text-[8px] font-mono text-rose-400 leading-tight bg-rose-950/20 p-1.5 rounded border border-rose-900/50">
                      ⚠️ Error loading scripts: {edgeAiModelError}
                    </div>
                  )}
                  {edgeAiModel && useEdgeAiModel && (
                    <div className="text-[8px] font-mono text-emerald-400 leading-tight flex items-center gap-1.5 bg-emerald-950/20 p-1.5 rounded border border-emerald-900/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>ACTIVE: 132k Neural Params (0.4ms)</span>
                    </div>
                  )}
                </div>

                {/* Dynamic FPS Tracker Customizer */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-2.5 border-t-2 border-emerald-500/10">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tracking Speed Cap</span>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">
                      {trackingFpsLimit === 'auto' ? `AUTO (${detectedCameraFps}Hz)` : `${trackingFpsLimit}Hz CAPPED`}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Configure the computer vision and AI sensor loops. Select <strong>240Hz Extreme Mode</strong> to match physical high-speed 240Hz filming/recording inputs dynamically.
                  </p>

                  <div className="grid grid-cols-5 gap-1 font-mono">
                    {([30, 60, 120, 240, 'auto'] as const).map((rate) => (
                      <button
                        key={rate}
                        id={`fps-limit-${rate}`}
                        onClick={() => {
                          setTrackingFpsLimit(rate);
                          playHudSound('beep');
                        }}
                        className={`text-[8px] py-1 rounded border transition font-bold ${
                          trackingFpsLimit === rate
                            ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-400'
                            : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {rate === 'auto' ? 'AUTO 🔄' : `${rate}Hz`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kalman Filter Coordinate Stabilizer */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-2.5 border-t-2 border-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.03)]">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Kalman Coords Stabilizer</span>
                    </div>
                    <button
                      id="toggle-kalman-filter"
                      onClick={() => {
                        setKalmanEnabled(!kalmanEnabled);
                        playHudSound('beep');
                      }}
                      className={`text-[8px] px-2 py-0.5 rounded border transition font-bold ${
                        kalmanEnabled
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/25'
                          : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {kalmanEnabled ? 'FILTERING_ON' : 'FILTERING_OFF'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Real-time <strong>2D Kalman Filter</strong> with discrete-time recursive state estimation. Solves tracking jitter, pixel-searching noise, and "floating mask" drift dynamically.
                  </p>

                  {kalmanEnabled && (
                    <div className="space-y-3 pt-2.5 border-t border-slate-900/40 font-mono text-[9px]">
                      {/* Process Noise Slider (Q) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Process Noise (Q):</span>
                          <span className="text-cyan-400 font-bold">{kalmanQ.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.5"
                          step="0.005"
                          value={kalmanQ}
                          onChange={(e) => setKalmanQ(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[7px] text-slate-600">
                          <span>Smooth/Highly Damped</span>
                          <span>Responsive/Fast Dynamic</span>
                        </div>
                      </div>

                      {/* Measurement Noise Slider (R) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Measurement Noise (R):</span>
                          <span className="text-cyan-400 font-bold">{kalmanR.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="10.0"
                          step="0.1"
                          value={kalmanR}
                          onChange={(e) => setKalmanR(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[7px] text-slate-600">
                          <span>Trust Camera Direct</span>
                          <span>Filter Jitter/Static lock</span>
                        </div>
                      </div>

                      {/* State equations and realtime Kalman Gain indicator */}
                      <div className="bg-slate-950/80 rounded border border-slate-900 p-2 text-[7px] text-slate-500 space-y-1 font-mono">
                        <div className="text-cyan-400 font-semibold tracking-wider text-[8px]">RECURSIVE ESTIMATION:</div>
                        <div className="grid grid-cols-2 gap-2 border-b border-slate-900/45 pb-1">
                          <div>
                            <span className="text-slate-500 font-bold">1. PREDICT:</span><br />
                            P_k|k-1 = P_k-1 + Q
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold">2. GAIN:</span><br />
                            K_k = P / (P + R)
                          </div>
                        </div>
                        <div className="pt-0.5 flex justify-between items-center text-slate-400">
                          <span>Computed Gain K_x:</span>
                          <span className="text-cyan-400 font-bold">{(kalmanXStateRef.current.p / (kalmanXStateRef.current.p + kalmanR)).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- GRANULAR HUD CONTROLS --- */}
                <div className="space-y-4 pt-2 border-t border-slate-900">
                  <h5 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Live Viewport Layers</h5>

                  {/* Category 1: Target Identity & Censor Overlays */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Target Identity & Censors</span>
                    
                    {/* Censor Blur/Mask Cover Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Censor Mask Blur</span>
                        <span className="text-[7px] text-slate-500 block">Censor blur / pixelate cover over target</span>
                      </div>
                      <button
                        id="toggle-censor-overlay"
                        onClick={() => setShowCensorOverlay(!showCensorOverlay)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showCensorOverlay 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showCensorOverlay ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* 3D Face-Mesh Tracking Mask Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">3D Face Mesh</span>
                        <span className="text-[7px] text-slate-500 block">3D-stabilized SVG tracking polygon mesh</span>
                      </div>
                      <button
                        id="toggle-face-mesh-mask"
                        onClick={() => setShowFaceMeshMask(!showFaceMeshMask)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showFaceMeshMask 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showFaceMeshMask ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* AI Diagnostics Overlay Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Joint Skeletons</span>
                        <span className="text-[7px] text-slate-500 block">Nvidia TensorRT skeletal & laser scanlines</span>
                      </div>
                      <button
                        id="toggle-ai-diagnostics-active"
                        onClick={() => setShowDiagnostics(!showDiagnostics)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showDiagnostics 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showDiagnostics ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Holographic Avatar Silhouette */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Holo Silhouette</span>
                        <span className="text-[7px] text-slate-500 block">Glowing vector model overlay</span>
                      </div>
                      <button
                        id="toggle-holo-avatar"
                        onClick={() => setShowHolographicAvatar(!showHolographicAvatar)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showHolographicAvatar 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showHolographicAvatar ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Target Tag Text Label */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Target Anchor Text</span>
                        <span className="text-[7px] text-slate-500 block">VIRTUAL_NPU_TARGET tracking label</span>
                      </div>
                      <button
                        id="toggle-target-tag-label"
                        onClick={() => setShowTargetTagLabel(!showTargetTagLabel)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showTargetTagLabel 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showTargetTagLabel ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>
                  </div>

                  {/* Category 1B: Advanced Headset Sensors */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Advanced Headset Sensors</span>
                    
                    {/* LiDAR Depth-Sensor Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">LiDAR Depth-Sensor</span>
                        <span className="text-[7px] text-slate-500 block">Simulate 3D wireframe mesh & scanning matrix</span>
                      </div>
                      <button
                        id="toggle-lidar-sensor"
                        onClick={() => {
                          setLidarModeActive(!lidarModeActive);
                          playHudSound('success');
                        }}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          lidarModeActive 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {lidarModeActive ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* RF Signal Interference Slider */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[9px] text-slate-300 font-bold block uppercase">RF Noise Interference</span>
                          <span className="text-[7px] text-slate-500 block">Degrade AR stream with custom video static</span>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-bold">{rfInterference}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={rfInterference}
                        onChange={(e) => {
                          setRfInterference(Number(e.target.value));
                          playHudSound('static');
                        }}
                        className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-805"
                      />
                    </div>

                    {/* GPS Spatial Geofence Zone Selector */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 font-mono space-y-2">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">GPS Spatial Geofence</span>
                        <span className="text-[7px] text-slate-500 block">Enforce specific spatial zones over the headset</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {(['commercial', 'court', 'sanctuary'] as const).map((zone) => (
                          <button
                            key={zone}
                            onClick={() => {
                              setGeofenceZone(zone);
                              playHudSound('beep');
                              addLog({
                                deviceModel: 'GPS_GEOFENCE',
                                action: 'discovered',
                                shieldApplied: zone === 'court' ? 'SILENCE_MODE' : zone === 'sanctuary' ? 'SANCTUARY_SHIELD' : 'STANDARD_SHIELD',
                                distance: 0,
                                rotatedId: `ZONE_${zone.toUpperCase()}`
                              });
                            }}
                            className={`text-[8px] py-1 rounded font-bold uppercase transition ${
                              geofenceZone === zone
                                ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-950 border border-slate-850 text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            {zone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category 2: HUD Data & Telemetry Overlays */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Data & Telemetry Layers</span>

                    {/* Left Telemetry Stats HUD Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Left Telemetry HUD</span>
                        <span className="text-[7px] text-slate-500 block">System protocols, FPS, & signal metrics</span>
                      </div>
                      <button
                        id="toggle-left-telemetry"
                        onClick={() => setShowLeftTelemetry(!showLeftTelemetry)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showLeftTelemetry 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showLeftTelemetry ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Right Pref Status Indicator Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Right Shield Pref</span>
                        <span className="text-[7px] text-slate-500 block">"My Shield Pref" box in top-right corner</span>
                      </div>
                      <button
                        id="toggle-right-telemetry"
                        onClick={() => setShowRightTelemetry(!showRightTelemetry)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showRightTelemetry 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showRightTelemetry ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Calibration concentric Rings Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Calibration Rings</span>
                        <span className="text-[7px] text-slate-500 block">Circular target patterns in background</span>
                      </div>
                      <button
                        id="toggle-calibration-rings"
                        onClick={() => setShowCalibrationRings(!showCalibrationRings)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showCalibrationRings 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showCalibrationRings ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>
                  </div>

                  {/* Category 3: System Notifications & Alerts */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Alerts & System Prompts</span>

                    {/* Warning Status Banners Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Emergency Banners</span>
                        <span className="text-[7px] text-slate-500 block">Top court-order & hard opt-out alert bars</span>
                      </div>
                      <button
                        id="toggle-status-banners"
                        onClick={() => setShowStatusBanners(!showStatusBanners)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showStatusBanners 
                            ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showStatusBanners ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Calibration Guidance Notice Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Guidance Prompts</span>
                        <span className="text-[7px] text-slate-500 block">"Citizen Beacon Off" info cards in stream</span>
                      </div>
                      <button
                        id="toggle-guidance-overlay"
                        onClick={() => setShowGuidanceOverlay(!showGuidanceOverlay)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showGuidanceOverlay 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showGuidanceOverlay ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* Camera Blocked Error Alert Toggle */}
                    <div className="bg-slate-900/30 border border-slate-900/60 rounded-lg p-2.5 flex items-center justify-between font-mono gap-4">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Webcam Error Banner</span>
                        <span className="text-[7px] text-slate-500 block">Warning bar on iframe camera blocking</span>
                      </div>
                      <button
                        id="toggle-camera-error-alert"
                        onClick={() => setShowCameraErrorAlert(!showCameraErrorAlert)}
                        className={`text-[9px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                          showCameraErrorAlert 
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {showCameraErrorAlert ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>
                  </div>

                  {/* Master Override Switch */}
                  <div className="bg-cyan-950/10 border border-cyan-950 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between font-mono gap-4">
                      <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Master Override</span>
                      <button
                        id="toggle-master-overlays"
                        onClick={() => setHideAllOverlays(!hideAllOverlays)}
                        className={`text-[9px] px-2.5 py-1 rounded font-extrabold transition ${
                          !hideAllOverlays 
                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30' 
                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {!hideAllOverlays ? '🟢 ALL SHOW' : '⚪ HIDE ALL'}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-sans leading-normal">
                      Quickly toggles ALL visual overlays at once for testing between a pure, unaltered camera feed and the fully HUD-equipped feed.
                    </p>
                  </div>
                </div>

                {/* Mode Selectors */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">Target Mapping Architecture</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      id="set-ai-tracking-face"
                      onClick={() => {
                        setAiTrackingMode('face');
                        setAiTrackingActive(true);
                      }}
                      className={`text-[10px] py-2 px-2.5 rounded-lg border font-bold text-center transition flex flex-col items-center gap-1 ${
                        aiTrackingMode === 'face' 
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]' 
                          : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Smile className="w-4 h-4 shrink-0" />
                      <span>FACE MESH</span>
                    </button>

                    <button
                      id="set-ai-tracking-body"
                      onClick={() => {
                        setAiTrackingMode('body');
                        setAiTrackingActive(true);
                      }}
                      className={`text-[10px] py-2 px-2.5 rounded-lg border font-bold text-center transition flex flex-col items-center gap-1 ${
                        aiTrackingMode === 'body' 
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>BODY CONTOUR</span>
                    </button>
                  </div>
                </div>

                {/* Tracking stats / parameters */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 space-y-1.5 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Frame Parse Speed:</span>
                    <span className="text-slate-200">18.4 ms (55 FPS)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sway & Path Speed:</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setAiSwaySpeed(s => Math.max(0.5, s - 0.5))}
                        className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] rounded hover:text-white"
                      >-</button>
                      <span className="text-slate-200 font-bold">{aiSwaySpeed}x</span>
                      <button 
                        onClick={() => setAiSwaySpeed(s => Math.min(3, s + 0.5))}
                        className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] rounded hover:text-white"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Censor Centroid:</span>
                    <span className="text-cyan-400 font-bold">X: {blurPosition.x}% | Y: {blurPosition.y}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mask Shape:</span>
                    <span className="text-white font-bold">{aiTrackingMode === 'body' ? 'SILHOUETTE CAPSULE' : 'CONCENTRIC CIRCLE'}</span>
                  </div>

                  {/* Calibration offsets for Y and X */}
                  <div className="pt-2.5 border-t border-slate-900/60 space-y-3.5 font-sans">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-300 font-bold text-[10px]">
                        <span>Lens Calibration Y-Offset (Vertical):</span>
                        <span className="text-emerald-400 font-bold font-mono">{calibrationYOffset >= 0 ? `+${calibrationYOffset}` : calibrationYOffset}%</span>
                      </div>
                      <input 
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={calibrationYOffset}
                        onChange={(e) => setCalibrationYOffset(parseInt(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                      />
                      <span className="text-[9px] text-slate-500 leading-tight">
                        Compensates for cameras locking to the forehead. Slide right to shift the bubble DOWN over eyes/nose.
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-300 font-bold text-[10px]">
                        <span>Lens Calibration X-Offset (Horizontal):</span>
                        <span className="text-emerald-400 font-bold font-mono">{calibrationXOffset >= 0 ? `+${calibrationXOffset}` : calibrationXOffset}%</span>
                      </div>
                      <input 
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={calibrationXOffset}
                        onChange={(e) => setCalibrationXOffset(parseInt(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                      />
                      <span className="text-[9px] text-slate-500 leading-tight">
                        Slide left or right to align the bubble horizontally with your face.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reset helper */}
                <button
                  id="reset-ai-target-btn"
                  onClick={() => {
                    setBlurPosition({ x: 50, y: 40, scale: 1.0 });
                    setAiTrackingActive(true);
                    kalmanXStateRef.current = { x: 50, p: 1.0 };
                    kalmanYStateRef.current = { y: 40, p: 1.0 };
                  }}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] py-2 rounded transition font-semibold font-mono"
                >
                  Recenter AI Tracking Origin
                </button>
              </motion.div>
            ) : (
              <div className={`border border-dashed text-center space-y-2 rounded-xl p-8 transition-all duration-300 ${
                glassClarityMode 
                  ? 'border-slate-800/40 bg-slate-950/10 text-slate-400 backdrop-blur-sm' 
                  : 'border-slate-850 text-slate-500 bg-transparent'
              }`}>
                <HelpCircle className="w-6 h-6 mx-auto text-slate-600" />
                <p className="text-xs">No Target Selected</p>
                <p className="text-[10px] text-slate-600">
                  Select a walking pedestrian or calibrate your webcam overlay to inspect digital boundaries.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Street View Sandbox Layer & Scenery Toggles */}
          {activeTab === 'street' && (
            <div className={`border rounded-xl p-4.5 space-y-3.5 shadow-xl transition-all duration-300 font-mono text-[9px] ${
              glassClarityMode 
                ? 'bg-slate-950/20 border-slate-800/40 backdrop-blur-md' 
                : 'bg-slate-950/80 border-slate-900'
            }`}>
              <div className="flex items-center gap-1.5 border-b border-slate-900/60 pb-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Sandbox Display Toggles</span>
              </div>
              
              <p className="text-[8.5px] text-slate-400 leading-normal font-sans">
                Quickly enable or disable individual elements to clean up your Street Sandbox simulation. Set <strong className="text-emerald-400">Glass Clarity</strong> to true to frosted-transparentize windows.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* 1. Blur Censor */}
                <button
                  id="sandbox-toggle-blur"
                  onClick={() => {
                    setSandboxShowBlur(!sandboxShowBlur);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowBlur
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">1. Censor Blur</span>
                  <span className="text-[10px] font-black">{sandboxShowBlur ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 2. Joint Mesh */}
                <button
                  id="sandbox-toggle-mesh"
                  onClick={() => {
                    setSandboxShowMesh(!sandboxShowMesh);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowMesh
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">2. Joint Mesh</span>
                  <span className="text-[10px] font-black">{sandboxShowMesh ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 3. Social Labels */}
                <button
                  id="sandbox-toggle-labels"
                  onClick={() => {
                    setSandboxShowLabels(!sandboxShowLabels);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowLabels
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">3. Social Labels</span>
                  <span className="text-[10px] font-black">{sandboxShowLabels ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 4. Target Brackets */}
                <button
                  id="sandbox-toggle-brackets"
                  onClick={() => {
                    setSandboxShowTargetBrackets(!sandboxShowTargetBrackets);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowTargetBrackets
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">4. Target Brackets</span>
                  <span className="text-[10px] font-black">{sandboxShowTargetBrackets ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 5. Character Glow */}
                <button
                  id="sandbox-toggle-glow"
                  onClick={() => {
                    setSandboxShowGlow(!sandboxShowGlow);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowGlow
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">5. Ambient Glow</span>
                  <span className="text-[10px] font-black">{sandboxShowGlow ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 6. City Skyline */}
                <button
                  id="sandbox-toggle-skyline"
                  onClick={() => {
                    setSandboxShowSkyline(!sandboxShowSkyline);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowSkyline
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">6. City Skyline</span>
                  <span className="text-[10px] font-black">{sandboxShowSkyline ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 7. Sidewalk Stage */}
                <button
                  id="sandbox-toggle-sidewalk"
                  onClick={() => {
                    setSandboxShowSidewalk(!sandboxShowSidewalk);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowSidewalk
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">7. Sidewalk Stage</span>
                  <span className="text-[10px] font-black">{sandboxShowSidewalk ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>

                {/* 8. Star Perspective Grid */}
                <button
                  id="sandbox-toggle-grid"
                  onClick={() => {
                    setSandboxShowBackgroundGrid(!sandboxShowBackgroundGrid);
                    playHudSound('beep');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between h-14 transition-all duration-200 ${
                    sandboxShowBackgroundGrid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block text-[7.5px] text-slate-400">8. Perspective Grid</span>
                  <span className="text-[10px] font-black">{sandboxShowBackgroundGrid ? '[🟢 ACTIVE]' : '[⚪ MUTED]'}</span>
                </button>
              </div>

              {/* 9. Glass Clarity Window Mode */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-lg p-2.5 flex items-center justify-between font-mono mt-1">
                <div className="text-left">
                  <span className="text-[8px] text-slate-300 font-bold block uppercase">Glass Clarity Windows</span>
                  <span className="text-[7px] text-slate-500 block">Frosted transparent HUD windows</span>
                </div>
                <button
                  id="sandbox-toggle-glass-clarity"
                  onClick={() => {
                    setGlassClarityMode(!glassClarityMode);
                    playHudSound('success');
                  }}
                  className={`text-[8px] px-2 py-1 rounded font-extrabold transition shrink-0 ${
                    glassClarityMode 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                      : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {glassClarityMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* GPU Fragment Shader Core Module */}
          {activeTab === 'street' && (
            <GpuShaderCore 
              glassClarityMode={glassClarityMode} 
              playHudSound={playHudSound} 
            />
          )}

          {/* Advanced Tech Stack Bento Grid */}
          <div className={`border rounded-xl p-5 space-y-4 shadow-2xl transition-all duration-300 ${
            glassClarityMode 
              ? 'bg-slate-950/15 border-slate-800/40 shadow-xl' 
              : 'bg-slate-950/80 border-slate-900'
          }`}>
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
              <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase font-bold">Onboard Hardware Architecture</span>
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Self-Driving-Grade Vision & Interception Stack
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal font-mono">
                BlurBubble operates at the physical hardware interception layer. When a recording device captures video, raw frames are parsed locally in real-time inside onboard NPUs/GPUs before any storage write-out.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1 */}
              <div className={`border rounded-lg p-3.5 space-y-2 transition-all duration-300 ${
                glassClarityMode 
                  ? 'bg-slate-950/10 border-slate-900/40 backdrop-blur-sm' 
                  : 'bg-slate-900/30 border-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-950/50 rounded border border-cyan-500/20 text-cyan-400">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide font-mono">1. Optical Flow Compensation</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Tracks high-frequency motion vectors using predictive Lucas-Kanade optical flow. When you move, or the recording glasses/phone move, the tracking loops compensate in microseconds to lock the blur envelope on-target without lagging drift.
                </p>
              </div>

              {/* Box 2 */}
              <div className={`border rounded-lg p-3.5 space-y-2 transition-all duration-300 ${
                glassClarityMode 
                  ? 'bg-slate-950/10 border-slate-900/40 backdrop-blur-sm' 
                  : 'bg-slate-900/30 border-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-950/50 rounded border border-emerald-500/20 text-emerald-400">
                    <Scan className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide font-mono">2. Edge Neural 3D Mesh</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Runs lightweight edge computer vision pipelines directly on neural processing units (NPUs). It maps a dense 3D facial mesh (468 nodes) and 33 body skeleton joints, distinguishing you from background clutter, furniture, or bystanders.
                </p>
              </div>

              {/* Box 3 */}
              <div className={`border rounded-lg p-3.5 space-y-2 transition-all duration-300 ${
                glassClarityMode 
                  ? 'bg-slate-950/10 border-slate-900/40 backdrop-blur-sm' 
                  : 'bg-slate-900/30 border-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-950/50 rounded border border-purple-500/20 text-purple-400">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide font-mono">3. Decentralized Beacons</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Your mobile app acts as an active cryptographic local beacon, broadcasting rotating anonymous public keys over Bluetooth Low Energy (BLE) and Wi-Fi. Recording devices intercept these and lookup opt-out choices over the air.
                </p>
              </div>

              {/* Box 4 */}
              <div className={`border rounded-lg p-3.5 space-y-2 transition-all duration-300 ${
                glassClarityMode 
                  ? 'bg-slate-950/10 border-slate-900/40 backdrop-blur-sm' 
                  : 'bg-slate-900/30 border-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-950/50 rounded border border-amber-500/20 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide font-mono">4. Direct GPU Shaders</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Before the camera stream is compressed or committed to physical memory, the recording device's graphics pipeline intercepts raw pixel layers and processes localized Gaussian blur, pixelation, or black-bar shaders dynamically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
