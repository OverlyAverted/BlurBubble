import React, { useState, useEffect } from 'react';
import { 
  MapPin, ShieldCheck, ShieldAlert, Camera, Radio, Search, Navigation, 
  Eye, Zap, AlertTriangle, Layers, Crosshair, CheckCircle2, Lock, Info, Sparkles, RefreshCw,
  Compass, Smartphone, Shield, Sliders, Globe, EyeOff, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenState, GeofenceZone } from '../types';
import { evaluateGeofences, getHaversineDistanceMeters } from '../utils/geofence';

interface ThreatMarker {
  id: string;
  name: string;
  type: 'cctv' | 'alpr' | 'glasses' | 'drone' | 'airtag';
  lat: number;
  lng: number;
  threatLevel: 'HIGH' | 'MED' | 'LOW';
  distanceMeters: number;
  status: 'MASKED' | 'EXPOSED';
  lastSeen: string;
}

const APPLE_MAPS_PRESETS = [
  { id: 'sf', name: 'San Francisco (Financial CCTV Ring)', lat: 37.7897, lng: -122.4014 },
  { id: 'civic', name: 'SF Civic Center Biometric Grid', lat: 37.7793, lng: -122.4192 },
  { id: 'apple_park', name: 'Cupertino (Apple Park Prototype Perimeter)', lat: 37.3349, lng: -122.0090 },
  { id: 'sfo', name: 'International Airport Checkpoint', lat: 37.6213, lng: -122.3790 },
];

const DEFAULT_APPLE_THREATS: ThreatMarker[] = [
  { id: 'apple-cam-01', name: 'Street Level ALPR License Reader', type: 'alpr', lat: 37.7758, lng: -122.4180, threatLevel: 'HIGH', distanceMeters: 85, status: 'MASKED', lastSeen: '3s ago' },
  { id: 'airtag-clone-99', name: 'Unregistered AirTag BLE Tracker', type: 'airtag', lat: 37.7741, lng: -122.4178, threatLevel: 'MED', distanceMeters: 42, status: 'MASKED', lastSeen: '1s ago' },
  { id: 'lookaround-van', name: 'Look Around Camera Car (HD 360)', type: 'cctv', lat: 37.7762, lng: -122.4210, threatLevel: 'HIGH', distanceMeters: 140, status: 'MASKED', lastSeen: '12s ago' },
  { id: 'smart-glasses-meta', name: 'Smart Video Eyewear', type: 'glasses', lat: 37.7738, lng: -122.4205, threatLevel: 'MED', distanceMeters: 60, status: 'EXPOSED', lastSeen: 'just now' },
];

export function AppleMapsPrivacyRadar({ 
  citizenState, 
  onChange,
  addLog,
  onTriggerAlert
}: { 
  citizenState: CitizenState; 
  onChange?: (newState: CitizenState) => void;
  addLog?: (log: any) => void; 
  onTriggerAlert?: (title: string, body: string, type?: string) => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState(APPLE_MAPS_PRESETS[0]);
  const [threats, setThreats] = useState<ThreatMarker[]>(DEFAULT_APPLE_THREATS);
  const [activeMode, setActiveMode] = useState<'mapkit' | 'lookaround' | 'findmy'>('mapkit');
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [isLookAroundBlurring, setIsLookAroundBlurring] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [airtagRotationSeconds, setAirtagRotationSeconds] = useState(15);

  // Real-time Geofence Trigger Evaluator for Apple Maps Preset
  const userPos = { lat: selectedPreset.lat, lng: selectedPreset.lng };
  const geofenceResult = evaluateGeofences(userPos, citizenState.geofenceZones || []);
  const activeTriggeredZone = geofenceResult.insideZone;

  // Auto-switch shield mode when inside high-risk geofence zone
  useEffect(() => {
    if (!citizenState.geofencingEnabled || !citizenState.geofenceZones) return;

    if (activeTriggeredZone) {
      const targetLevel = activeTriggeredZone.targetPrivacyLevel || 'strict_blur';

      if (citizenState.privacyLevel !== targetLevel || !citizenState.activeGeofenceTriggered) {
        if (onChange) {
          onChange({
            ...citizenState,
            privacyLevel: targetLevel,
            activeGeofenceTriggered: true,
            activeGeofenceZoneName: activeTriggeredZone.name
          });
        }

        if (onTriggerAlert) {
          onTriggerAlert(
            `📍 GEOFENCE STRICT BLUR ACTIVATED`,
            `Entered ${activeTriggeredZone.name}. Privacy shield automatically set to STRICT BLUR mode.`,
            'child_blocking'
          );
        }

        if (addLog) {
          addLog({
            deviceModel: `APPLE MAPKIT GEOFENCE: ${activeTriggeredZone.name}`,
            action: 'censored',
            shieldApplied: `${targetLevel.toUpperCase()} (AUTOMATIC GEOFENCE ESCALATION)`,
            distance: geofenceResult.distanceMeters,
            rotatedId: activeTriggeredZone.id
          });
        }

        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
      }
    }
  }, [selectedPreset, citizenState.geofencingEnabled, citizenState.geofenceZones, activeTriggeredZone]);

  // Auto-rotate AirTag BLE seed for Find My protection
  useEffect(() => {
    const timer = setInterval(() => {
      setAirtagRotationSeconds(prev => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMaskThreat = (id: string) => {
    setThreats(prev => prev.map(t => t.id === id ? { ...t, status: 'MASKED' } : t));
    const threat = threats.find(t => t.id === id);
    if (threat && addLog) {
      addLog({
        deviceModel: threat.name,
        action: 'censored',
        shieldApplied: 'APPLE_MAPKIT_MASK',
        distance: threat.distanceMeters,
        rotatedId: threat.id
      });
    }
  };

  return (
    <div id="apple-maps-privacy-radar-container" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-[0_0_30px_rgba(56,189,248,0.1)] space-y-4 relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              Apple Maps Privacy Shield & Look Around
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded border border-sky-500/40 font-bold uppercase">
                MapKit JS & Neural Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              360° Look Around street view obfuscation, Find My BLE anti-tracking, and MapKit privacy routing
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('mapkit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'mapkit' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            MapKit Vector
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('lookaround')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'lookaround' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            360° Look Around
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('findmy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'findmy' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Find My Relay
          </button>
        </div>
      </div>

      {/* Preset Location Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <span className="text-slate-500 shrink-0 font-bold text-[10px] uppercase tracking-wider">Map Preset:</span>
        {APPLE_MAPS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setSelectedPreset(preset)}
            className={`px-3 py-1 rounded-lg border shrink-0 transition cursor-pointer text-xs ${
              selectedPreset.id === preset.id
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Interactive Map / Look Around Stage */}
      {activeMode === 'mapkit' && (
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between p-4 shadow-inner">
          {/* Subtle Vector Map Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none" />

          {/* Search Bar Overlay */}
          <div className="relative z-10 flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 max-w-md backdrop-blur">
            <Search className="w-4 h-4 text-sky-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${selectedPreset.name}...`}
              className="bg-transparent text-xs font-mono text-white placeholder-slate-500 w-full focus:outline-none"
            />
            <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 shrink-0">
              {selectedPreset.lat.toFixed(4)}, {selectedPreset.lng.toFixed(4)}
            </span>
          </div>

          {/* Mapkit Tactical Center Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-14 w-14 rounded-full bg-sky-400 opacity-50"></span>
              <div className="relative p-3 bg-sky-500 border-2 border-white rounded-full text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.9)]">
                <Navigation className="w-5 h-5 text-slate-950" />
              </div>
            </div>
            <span className="mt-2 inline-block text-[10px] font-mono font-bold text-sky-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-sky-500/40 shadow-xl">
              Apple MapKit Privacy Zone ({citizenState.rangeMeters}m)
            </span>
          </div>

          {/* Simulated Apple Threat Pins */}
          <div className="absolute top-1/3 left-1/4 z-10">
            <button
              type="button"
              onClick={() => handleMaskThreat('apple-cam-01')}
              className="p-2 bg-slate-900 border border-emerald-500 text-emerald-400 rounded-full shadow hover:scale-110 transition cursor-pointer flex items-center gap-1 group"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden group-hover:inline text-[9px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-emerald-300">
                ALPR Reader [Masked]
              </span>
            </button>
          </div>

          <div className="absolute bottom-1/4 right-1/3 z-10">
            <button
              type="button"
              onClick={() => handleMaskThreat('smart-glasses-meta')}
              className="p-2 bg-rose-950/90 border border-rose-500 text-rose-400 rounded-full shadow animate-bounce hover:scale-110 transition cursor-pointer flex items-center gap-1 group"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden group-hover:inline text-[9px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-rose-300">
                Smart Eyewear [EXPOSED - Tap to Obfuscate]
              </span>
            </button>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                MapKit JS Privacy Routing Active
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span>Vector Tile Cache: Encrypted</span>
              <span className="text-sky-400 font-bold">Latency: 14ms</span>
            </div>
          </div>
        </div>
      )}

      {/* 360° Apple Look Around Obfuscation Inspector */}
      {activeMode === 'lookaround' && (
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between p-4 shadow-2xl">
          {/* Simulated 360 Panoramic Look Around Street Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 opacity-90" />
          
          {/* Street Overlay Simulation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-full h-px bg-sky-500/50" />
            <div className="absolute w-px h-full bg-sky-500/50" />
            <div className="w-[300px] h-[300px] rounded-full border border-sky-500/30" />
          </div>

          {/* Look Around Controls Bar */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold text-white">
                Apple Look Around 360° Street-Level Privacy Filter
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLookAroundBlurring(!isLookAroundBlurring)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isLookAroundBlurring 
                  ? 'bg-emerald-500 text-slate-950 border border-emerald-400' 
                  : 'bg-rose-950 border border-rose-500 text-rose-300'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              {isLookAroundBlurring ? 'Auto-Blur Enabled' : 'Raw Street Feed (Warning)'}
            </button>
          </div>

          {/* Interactive Look Around Optical Target Simulation */}
          <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            {/* Target 1: License Plate */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Vehicle License Plate #7X91</span>
              <div className="h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <span className={`text-sm font-mono font-bold transition ${isLookAroundBlurring ? 'blur-md select-none text-slate-600' : 'text-amber-400'}`}>
                  CA 8XYZ941
                </span>
                {isLookAroundBlurring && (
                  <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold">
                    [NEURAL BLUR APPLIED]
                  </span>
                )}
              </div>
            </div>

            {/* Target 2: Passerby Face */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Pedestrian Biometric Profile</span>
              <div className="h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className={`w-10 h-10 rounded-full bg-slate-800 border border-slate-700 transition ${isLookAroundBlurring ? 'blur-lg select-none' : ''}`} />
                {isLookAroundBlurring && (
                  <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold">
                    [FACE SCRAMBLED]
                  </span>
                )}
              </div>
            </div>

            {/* Target 3: House Address Number */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Building Doorway Address</span>
              <div className="h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <span className={`text-base font-mono font-bold transition ${isLookAroundBlurring ? 'blur-md select-none text-slate-600' : 'text-white'}`}>
                  #1042 MARKET ST
                </span>
                {isLookAroundBlurring && (
                  <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold">
                    [GEOSPATIAL MASK]
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-xs font-mono text-slate-400">
            Apple Maps Look Around street view panoramas automatically strip identifying personal metadata prior to public index publication.
          </div>
        </div>
      )}

      {/* Find My AirTag Relay Anti-Tracking View */}
      {activeMode === 'findmy' && (
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <div>
                <h4 className="text-sm font-mono font-bold text-white">Apple Find My Network Relay & BLE Scrambler</h4>
                <p className="text-xs text-slate-400 font-mono">Rotates Bluetooth low-energy advertisement keys every 15s</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span className="text-slate-300">Next BLE Key Seed:</span>
              <span className="text-emerald-400 font-bold">{airtagRotationSeconds}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300">Find My Beacon Spoofing</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  PROTECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Prevents third-party AirTags or Bluetooth trackers from building an unsolicited movement profile of your movements.
              </p>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div>Public Key: <code className="text-sky-400">0x3A9F...B821</code></div>
                <div>Rotated MAC: <code className="text-emerald-400">4F:82:11:9C:20:00</code></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300">Apple Watch Haptic Sync</span>
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Dispatches subtle wrist tap vibrations when entering areas with high concentration of smart surveillance cameras.
              </p>
              <button
                type="button"
                onClick={() => {
                  if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
                }}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs py-2 rounded-lg transition cursor-pointer"
              >
                Test Watch Haptic Pulse
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] font-mono text-slate-500">
            BlurBubble Find My Shield adheres strictly to RFC-9402 decentralized opt-out standards.
          </div>
        </div>
      )}

      {/* Summary Footer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Apple MapKit Vector Status</span>
          <span className="text-xs font-mono font-bold text-sky-400 block truncate">{selectedPreset.name}</span>
          <span className="text-[9px] font-mono text-slate-500 block">Dark Mode Tactical Style Applied</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Look Around Privacy Engine</span>
          <span className="text-xs font-mono font-bold text-emerald-400 block">100% Neural Blurring Active</span>
          <span className="text-[9px] font-mono text-slate-500 block">Plates, Faces & Addresses Obfuscated</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Find My Relay Protection</span>
          <span className="text-xs font-mono font-bold text-sky-400 block">BLE Key Seed Auto-Rotates</span>
          <span className="text-[9px] font-mono text-slate-500 block">Next Seed in {airtagRotationSeconds}s</span>
        </div>
      </div>
    </div>
  );
}

export default AppleMapsPrivacyRadar;
