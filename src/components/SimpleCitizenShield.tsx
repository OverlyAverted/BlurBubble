import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Zap, 
  Battery, 
  Radio, 
  CheckCircle2, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  FileText, 
  Award, 
  Sparkles, 
  Coffee, 
  Train, 
  Footprints, 
  Ghost, 
  Home, 
  ChevronRight,
  Info,
  Check,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CitizenState, PrivacyLevel, RegisteredEntity } from '../types';
import PrivacyPassportModal from './PrivacyPassportModal';

interface SimpleCitizenShieldProps {
  state: CitizenState;
  onChange: (newState: CitizenState) => void;
  onAddLog: (log: any) => void;
  onTriggerAlert: (title: string, body: string, type: any) => void;
  onSwitchToProMode?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface LifestylePreset {
  id: 'commuter' | 'cafe' | 'street' | 'ghost' | 'home';
  label: string;
  icon: React.ReactNode;
  tagline: string;
  rangeMeters: number;
  privacyLevel: PrivacyLevel;
  ultrasonicMicSaturation: boolean;
  acousticWatermarking: boolean;
  hapticIntensity: 'low' | 'medium' | 'high';
  alertsMuted: boolean;
  badge: string;
}

const PRESETS: LifestylePreset[] = [
  {
    id: 'commuter',
    label: 'Transit / Commute',
    icon: <Train className="w-4 h-4 text-cyan-400" />,
    tagline: 'Subway & bus crowds: Close-range strict face blur & active haptics',
    rangeMeters: 6,
    privacyLevel: 'strict_blur',
    ultrasonicMicSaturation: true,
    acousticWatermarking: true,
    hapticIntensity: 'high',
    alertsMuted: false,
    badge: 'High Crowd'
  },
  {
    id: 'cafe',
    label: 'Public Cafe & Work',
    icon: <Coffee className="w-4 h-4 text-amber-400" />,
    tagline: 'Coffee shops & coworking: Silent alerts with background removal',
    rangeMeters: 10,
    privacyLevel: 'magic_removal',
    ultrasonicMicSaturation: false,
    acousticWatermarking: true,
    hapticIntensity: 'low',
    alertsMuted: true,
    badge: 'Discreet'
  },
  {
    id: 'street',
    label: 'Street & Park Walk',
    icon: <Footprints className="w-4 h-4 text-emerald-400" />,
    tagline: 'Outdoor spaces: Broad perimeter scan for drones & smart glasses',
    rangeMeters: 20,
    privacyLevel: 'strict_blur',
    ultrasonicMicSaturation: false,
    acousticWatermarking: true,
    hapticIntensity: 'medium',
    alertsMuted: false,
    badge: 'Everyday'
  },
  {
    id: 'ghost',
    label: 'Ghost Stealth Cloak',
    icon: <Ghost className="w-4 h-4 text-rose-400" />,
    tagline: 'High threat / Protests: Full perimeter, mic jamming & randomized IDs',
    rangeMeters: 40,
    privacyLevel: 'magic_removal',
    ultrasonicMicSaturation: true,
    acousticWatermarking: true,
    hapticIntensity: 'high',
    alertsMuted: false,
    badge: 'Max Defense'
  },
  {
    id: 'home',
    label: 'Home Safe Zone',
    icon: <Home className="w-4 h-4 text-blue-400" />,
    tagline: 'Private residence: Battery saver & trusted family whitelist',
    rangeMeters: 3,
    privacyLevel: 'pixelate',
    ultrasonicMicSaturation: false,
    acousticWatermarking: false,
    hapticIntensity: 'low',
    alertsMuted: true,
    badge: 'Safe Zone'
  }
];

export default function SimpleCitizenShield({
  state,
  onChange,
  onAddLog,
  onTriggerAlert,
  onSwitchToProMode,
  onNavigateToTab
}: SimpleCitizenShieldProps) {
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(state.activePreset || null);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  const toggleShieldBroadcast = () => {
    const nextState = !state.isBroadcasting;
    onChange({
      ...state,
      isBroadcasting: nextState
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(nextState ? [30, 50, 30] : [50]);
    }

    onAddLog({
      deviceModel: 'CITIZEN_SIMPLE_UI',
      action: nextState ? 'censored' : 'ignored',
      shieldApplied: nextState ? 'SHIELD_ACTIVATED_SIMPLE_MODE' : 'SHIELD_PAUSED_SIMPLE_MODE',
      distance: 0,
      rotatedId: state.anonymousId
    });

    triggerFeedback(nextState ? '🛡️ Privacy Shield is now ACTIVE' : '⏸️ Privacy Shield PAUSED');
  };

  const applyPreset = (preset: LifestylePreset) => {
    setSelectedPresetId(preset.id);
    onChange({
      ...state,
      activePreset: preset.id,
      rangeMeters: preset.rangeMeters,
      privacyLevel: preset.privacyLevel,
      ultrasonicMicSaturationEnabled: preset.ultrasonicMicSaturation,
      acousticWatermarkingEnabled: preset.acousticWatermarking,
      hapticIntensity: preset.hapticIntensity,
      isBroadcasting: true
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }

    onAddLog({
      deviceModel: 'LIFESTYLE_PRESET',
      action: 'censored',
      shieldApplied: `APPLIED_PRESET_${preset.id.toUpperCase()}`,
      distance: 0,
      rotatedId: `PRESET_${preset.label.toUpperCase()}`
    });

    triggerFeedback(`Applied "${preset.label}" Preset: ${preset.rangeMeters}m range, ${preset.privacyLevel.replace('_', ' ')}`);
  };

  const handleSetPrivacyLevel = (level: PrivacyLevel) => {
    onChange({
      ...state,
      privacyLevel: level
    });

    onAddLog({
      deviceModel: 'PRIVACY_STYLE_SELECTOR',
      action: 'censored',
      shieldApplied: `SET_STYLE_${level.toUpperCase()}`,
      distance: 0,
      rotatedId: state.anonymousId
    });

    triggerFeedback(`Masking style changed to: ${level.replace('_', ' ').toUpperCase()}`);
  };

  const handleSetRange = (range: number) => {
    onChange({
      ...state,
      rangeMeters: range
    });
  };

  const handleTriggerEmergencyCloak = () => {
    onChange({
      ...state,
      isBroadcasting: true,
      rangeMeters: 50,
      privacyLevel: 'magic_removal',
      ultrasonicMicSaturationEnabled: true,
      acousticWatermarkingEnabled: true,
      irDisruptionEnabled: true,
      emergencyPrivacyActive: true
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80, 50, 100]);
    }

    onAddLog({
      deviceModel: 'EMERGENCY_PANIC_CLOAK',
      action: 'censored',
      shieldApplied: 'FULL_CLOAK_ENGAGED_MAX_DEFENSE',
      distance: 0,
      rotatedId: 'PANIC_MAX_OVERRIDE'
    });

    onTriggerAlert(
      '🚨 Ghost Cloak Panic Engaged!',
      'Maximum protection activated: 50m broadcast range, Magic Removal, and active ultrasonic microphone saturation.',
      'blocking'
    );
  };

  const activeEntitiesCount = state.registeredEntities.filter(e => e.isActive).length;
  const avgBattery = Math.round(
    state.registeredEntities.reduce((sum, e) => sum + e.batteryPercent, 0) / (state.registeredEntities.length || 1)
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-10">
      {/* Top Banner Notice: Feedback Toast */}
      <AnimatePresence>
        {notificationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{notificationBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Switch Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                BlurBubble Protection Center
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Simple Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Clear, effective privacy controls designed for everyday citizens and families.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSwitchToProMode && (
            <button
              type="button"
              onClick={onSwitchToProMode}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer"
              title="Switch to Tactical Pro Engineer Mode with full RF telemetry, charts, and hex registers"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch to Pro Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPassportOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
            title="View and download your official RFC-9402 Compliance Passport"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Privacy Passport</span>
          </button>
        </div>
      </div>

      {/* Hero Master Shield Control Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        state.isBroadcasting
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
          : 'bg-slate-900/80 border-slate-800 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Status Text & Indicators */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border tracking-wider uppercase backdrop-blur-md shadow-sm">
              <span className={`w-2 h-2 rounded-full ${state.isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className={state.isBroadcasting ? 'text-emerald-400' : 'text-rose-400'}>
                {state.isBroadcasting ? 'SHIELD ARMED • PROTECTED' : 'SHIELD MUTED • EXPOSED'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {state.isBroadcasting 
                  ? 'Your Privacy Shield is Active' 
                  : 'Privacy Broadcast is Currently Paused'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                {state.isBroadcasting
                  ? `Broadcasting continuous RFC-9402 opt-out signal. Nearby smart glasses, drones, and AI cameras are requested to apply ${state.privacyLevel.replace('_', ' ')} within ${state.rangeMeters} meters.`
                  : 'Your device is silent. Smart cameras and facial recognition systems will not receive automated blur or opt-out requests.'}
              </p>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Radius: <strong className="text-cyan-400 font-mono">{state.rangeMeters}m</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Devices: <strong className="text-white font-mono">{activeEntitiesCount} active</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <Battery className="w-3.5 h-3.5 text-amber-400" />
                <span>Battery: <strong className="text-white font-mono">{avgBattery}% avg</strong></span>
              </div>
            </div>
          </div>

          {/* Master Toggle Button */}
          <div className="flex flex-col items-center md:items-end justify-center shrink-0">
            <button
              type="button"
              onClick={toggleShieldBroadcast}
              className={`w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider font-mono flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xl active:scale-95 ${
                state.isBroadcasting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <Shield className={`w-6 h-6 ${state.isBroadcasting ? 'fill-current animate-pulse' : ''}`} />
              <div className="text-left">
                <div className="text-xs opacity-75 font-medium leading-none">
                  {state.isBroadcasting ? 'Click to pause' : 'Click to arm'}
                </div>
                <div className="text-base font-black leading-tight">
                  {state.isBroadcasting ? 'TURN SHIELD OFF' : 'ACTIVATE SHIELD'}
                </div>
              </div>
            </button>
            <span className="text-[10px] text-slate-500 font-mono mt-2 text-center md:text-right">
              100% On-Device &bull; No Internet Required
            </span>
          </div>
        </div>
      </div>

      {/* 5 1-Click Lifestyle Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1-Click Privacy Presets
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Instant settings for your current environment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id || state.activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition">
                      {preset.icon}
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                    {preset.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    {preset.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold">{preset.rangeMeters}m range</span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-slate-500 group-hover:text-slate-300 transition">
                      Select &rarr;
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Masking Style & Protection Distance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Masking Style (Privacy Level) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Camouflage Masking Style
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Applied on third-party lenses
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                level: 'strict_blur' as PrivacyLevel,
                title: 'Strict Face Blur',
                desc: 'Standard compliant Gaussian blur over face & likeness.',
                badge: 'Recommended',
                icon: '🌫️'
              },
              {
                level: 'magic_removal' as PrivacyLevel,
                title: 'Magic Removal',
                desc: 'AI erases you and fills in background scenery.',
                badge: 'Invisible',
                icon: '🪄'
              },
              {
                level: 'pixelate' as PrivacyLevel,
                title: 'Pixelate Block',
                desc: 'Retro 8-bit sensor pixelation across body outline.',
                badge: 'Classic',
                icon: '👾'
              },
              {
                level: 'none' as PrivacyLevel,
                title: 'Opt-In / Whitelist',
                desc: 'Allows trusted recording for family or registered creators.',
                badge: 'Open',
                icon: '🤝'
              }
            ].map((opt) => {
              const isSelected = state.privacyLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => handleSetPrivacyLevel(opt.level)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{opt.icon}</span>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">
                      {opt.title}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {opt.desc}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-slate-500">Selection</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Protection Distance (Perimeter) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Protection Bubble Radius
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {state.rangeMeters} Meters
            </span>
          </div>

          <div className="space-y-4">
            {/* Quick Distance Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { m: 5, label: '5m', desc: 'Personal' },
                { m: 12, label: '12m', desc: 'Room' },
                { m: 25, label: '25m', desc: 'Street' },
                { m: 50, label: '50m', desc: 'Max' }
              ].map((item) => (
                <button
                  key={item.m}
                  type="button"
                  onClick={() => handleSetRange(item.m)}
                  className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer ${
                    state.rangeMeters === item.m
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{item.label}</div>
                  <div className="text-[9px] text-slate-500">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>1 meter (Tactical Close)</span>
                <span>50 meters (Max Transceiver Power)</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={state.rangeMeters}
                onChange={(e) => handleSetRange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
              />
            </div>

            {/* Range Explanation Note */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                BLE beacons transmit a localized radio envelope. Any complying camera entering this {state.rangeMeters}m radius receives your anonymous signature and auto-censors your profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Protected Belongings & Devices Quick Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Protected Family &amp; Belongings ({activeEntitiesCount} Online)
            </h3>
          </div>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('tags')}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1"
            >
              <span>Manage All Tags</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {state.registeredEntities.map((entity) => (
            <div
              key={entity.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                entity.isActive
                  ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                  : 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="overflow-hidden">
                <span className="font-bold text-xs truncate block text-white">
                  {entity.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {entity.batteryPercent}% &bull; {entity.privacyLevel.replace('_', ' ')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...state,
                    registeredEntities: state.registeredEntities.map(e =>
                      e.id === entity.id ? { ...e, isActive: !e.isActive } : e
                    )
                  });
                }}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                  entity.isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {entity.isActive ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Emergency Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              Emergency Ghost Cloak Panic
            </h4>
            <p className="text-xs text-slate-400">
              Instantly expands shield to maximum 50 meters, engages full AI removal and ultrasonic jamming.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerEmergencyCloak}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition cursor-pointer flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Engage Max Lockdown</span>
        </button>
      </div>

      {/* Official Passport Modal */}
      <PrivacyPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        state={state}
        onAddLog={onAddLog}
      />
    </div>
  );
}
