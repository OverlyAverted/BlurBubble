import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, CheckCircle2, Radio, Sliders, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface RadarSweepOverlayProps {
  isBroadcasting: boolean;
  rangeMeters: number;
  onToggleBroadcast: () => void;
  onChangeRange: (newRange: number) => void;
  onClose: () => void;
  addLog?: (log: any) => void;
}

export default function RadarSweepOverlay({
  isBroadcasting,
  rangeMeters,
  onToggleBroadcast,
  onChangeRange,
  onClose,
  addLog
}: RadarSweepOverlayProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [hoveredBlip, setHoveredBlip] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Play a retro synth sound when pulsing if sound is enabled
  const triggerPulseSynth = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // low frequency pulse
      oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context blocked or not supported", e);
    }
  };

  const handleTriggerPulse = () => {
    setIsPulsing(true);
    setPulseCount(prev => prev + 1);
    triggerPulseSynth();
    
    if (addLog) {
      addLog({
        deviceModel: 'WEARABLE_SHIELD',
        action: 'censored',
        shieldApplied: `MANUAL RADAR BURST EMITTED (${rangeMeters}m Broadcast)`,
        distance: 0,
        rotatedId: 'RADAR_BURST_EMIT'
      });
    }

    // Reset pulsing animation after it finishes
    setTimeout(() => {
      setIsPulsing(false);
    }, 1200);
  };

  // Simulated nearby nodes on the radar screen
  // Angles and distances are fixed for predictability, but their state (shielded or not) is dynamic
  const radarBlips = [
    { id: 'b1', name: 'Traffic Cam (Facial Scan)', distanceMeters: 7, angleDeg: 35, type: 'cam', icon: '📹' },
    { id: 'b2', name: 'Patrol Drone Stream #4', distanceMeters: 14, angleDeg: 125, type: 'drone', icon: '🚁' },
    { id: 'b3', name: 'Smart TV Beacon (BLE)', distanceMeters: 19, angleDeg: 245, type: 'tv', icon: '📺' },
    { id: 'b4', name: 'Rooftop Security Rig', distanceMeters: 22, angleDeg: 315, type: 'cam', icon: '📷' },
    { id: 'b5', name: 'Passerby Smart Glasses', distanceMeters: 5, angleDeg: 190, type: 'glasses', icon: '🕶️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="absolute right-0 mt-2 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md p-4 text-slate-200 z-50 flex flex-col font-sans"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Radio className={`w-4 h-4 text-emerald-400 ${isBroadcasting ? 'animate-pulse' : 'opacity-60'}`} />
            {isBroadcasting && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">
            Shield Broadcast Status
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Retro audio feedback toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-1 rounded hover:bg-slate-900 transition-colors ${isSoundEnabled ? 'text-emerald-400' : 'text-slate-600'}`}
            title={isSoundEnabled ? "Mute pulse sound feedback" : "Enable pulse sound feedback"}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Radar Screen Visualizer */}
      <div className="relative w-full aspect-square bg-slate-950 rounded-xl border border-slate-900 overflow-hidden flex items-center justify-center p-2 mb-3">
        {/* Radar Sweeping Overlay Canvas (Grid & Scanning Area) */}
        <svg className="w-full h-full select-none" viewBox="0 0 200 200">
          <defs>
            {/* Dark radial center gradient */}
            <radialGradient id="radarGridGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#022c22" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#090d16" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>
            
            {/* Sweep sweep gradient line tail */}
            <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Gradient */}
          <rect width="200" height="200" fill="url(#radarGridGrad)" />

          {/* Grid lines: Concentric circles */}
          <circle cx="100" cy="100" r="25" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="100" fill="none" stroke="#1e293b" strokeWidth="0.5" />

          {/* Crosshairs */}
          <line x1="100" y1="0" x2="100" y2="200" stroke="#0f172a" strokeWidth="0.75" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="#0f172a" strokeWidth="0.75" />

          {/* Grid Labels (Distance markers) */}
          <text x="100" y="72" fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle">10m</text>
          <text x="100" y="47" fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle">15m</text>
          <text x="100" y="22" fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle">20m</text>
          <text x="100" y="7" fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle">25m</text>

          {/* Active Broadcast Shield Coverage (Filled Green Pulse Circle) */}
          {isBroadcasting ? (
            <motion.circle
              cx="100"
              cy="100"
              // 1 meter = 4 pixels. Map rangeMeters strictly.
              animate={{ r: rangeMeters * 4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 80 }}
              fill="rgba(16, 185, 129, 0.12)"
              stroke="rgba(16, 185, 129, 0.45)"
              strokeWidth="1.25"
              className="shadow-inner"
            />
          ) : (
            <motion.circle
              cx="100"
              cy="100"
              animate={{ r: rangeMeters * 4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 80 }}
              fill="rgba(148, 163, 184, 0.03)"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
          )}

          {/* Radar Sweep Line Rotator */}
          {isBroadcasting && (
            <g className="origin-center animate-[spin_4s_linear_infinite]">
              {/* Fade trail pie slice */}
              <path d="M 100,100 L 100,0 A 100,100 0 0,1 170.7,29.3 Z" fill="url(#sweepGrad)" opacity="0.6" />
              {/* Highlighting bright sweeper line */}
              <line x1="100" y1="100" x2="100" y2="0" stroke="#34d399" strokeWidth="1.5" />
            </g>
          )}

          {/* Instantaneous deflection wave pulse triggered on demand */}
          <AnimatePresence>
            {isPulsing && (
              <motion.circle
                key={`pulse-${pulseCount}`}
                cx="100"
                cy="100"
                initial={{ r: 0, opacity: 0.9, strokeWidth: 3 }}
                animate={{ r: 100, opacity: 0, strokeWidth: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                fill="none"
                stroke="#10b981"
              />
            )}
          </AnimatePresence>

          {/* Live Device Blips plotted on coordinate system */}
          {radarBlips.map((blip) => {
            const angleRad = (blip.angleDeg * Math.PI) / 180;
            const distancePx = blip.distanceMeters * 4;
            const x = 100 + Math.cos(angleRad) * distancePx;
            const y = 100 - Math.sin(angleRad) * distancePx;

            // Device is secure if shield is broadcasting and device is within range boundary
            const isProtected = isBroadcasting && (rangeMeters >= blip.distanceMeters);

            return (
              <g
                key={blip.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredBlip(blip.id)}
                onMouseLeave={() => setHoveredBlip(null)}
              >
                {/* Blip Outer Ring/Pulsing Warning */}
                {!isProtected && isBroadcasting ? (
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="0.5"
                    className="animate-ping"
                    style={{ animationDuration: '1.5s' }}
                  />
                ) : null}

                {/* Blip Dot itself */}
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="transition-colors duration-300"
                  fill={isProtected ? '#34d399' : '#f87171'}
                  stroke="#020617"
                  strokeWidth="0.75"
                />

                {/* Mini shielded shield emblem overlay if protected */}
                {isProtected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="6.5"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeWidth="0.75"
                  />
                )}
              </g>
            );
          })}

          {/* Central Beacon (Wearable Hub) */}
          <circle cx="100" cy="100" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
          <circle cx="100" cy="100" r="8" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: '2s' }} />
        </svg>

        {/* Hover Blip Detail Card Overlay on Canvas */}
        {hoveredBlip && (() => {
          const blip = radarBlips.find(b => b.id === hoveredBlip);
          if (!blip) return null;
          const isProtected = isBroadcasting && (rangeMeters >= blip.distanceMeters);
          return (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-slate-800 p-2 rounded-lg flex items-center justify-between gap-1.5 shadow-xl font-mono text-[9px]">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span>{blip.icon}</span>
                  <span className="font-bold text-white truncate">{blip.name}</span>
                </div>
                <div className="text-slate-400 text-[8px]">
                  Distance: {blip.distanceMeters}m • Shield: {isProtected ? 'ACTIVE' : 'EXPOSED'}
                </div>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                isProtected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {isProtected ? 'SECURED' : 'EXPOSED'}
              </span>
            </div>
          );
        })()}

        {/* Big Standby Text when Broadcast is Muted */}
        {!isBroadcasting && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
            <ShieldAlert className="w-8 h-8 text-slate-500 animate-pulse mb-1.5" />
            <p className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              Transmitter Offline
            </p>
            <p className="text-[9px] text-slate-500 max-w-[180px] leading-normal mt-0.5">
              Activate the Wearable Shield to begin dynamic opt-out signal broadcasting.
            </p>
          </div>
        )}
      </div>

      {/* Control panel & range slider adjustment */}
      <div className="space-y-3 font-sans">
        {/* Toggle switch */}
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900/60 p-2 rounded-xl">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
              {isBroadcasting ? 'Broadcasting Active' : 'Shield Silent'}
            </span>
          </div>
          <button
            onClick={onToggleBroadcast}
            className={`px-3 py-1 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              isBroadcasting
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isBroadcasting ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        {/* Dynamic Slider controls */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-500" />
              Radius Threshold:
            </span>
            <span className="text-emerald-400 font-extrabold">{rangeMeters} Meters</span>
          </div>
          <input
            type="range"
            min="2"
            max="25"
            value={rangeMeters}
            onChange={(e) => onChangeRange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            title="Adjust Shield Broadcast Radius"
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-600">
            <span>2m</span>
            <span>12m</span>
            <span>25m</span>
          </div>
        </div>

        {/* Actions bar (Pulse wave button) */}
        <div className="pt-1 flex gap-2">
          <button
            type="button"
            onClick={handleTriggerPulse}
            disabled={!isBroadcasting || isPulsing}
            className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isBroadcasting && !isPulsing
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isPulsing ? 'animate-spin' : ''}`} />
            Trigger Pulse Burst
          </button>
        </div>
      </div>
    </motion.div>
  );
}
