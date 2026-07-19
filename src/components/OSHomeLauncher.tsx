import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Camera, 
  Radio, 
  Map, 
  Tv, 
  Lock, 
  User, 
  HelpCircle, 
  Settings, 
  Cpu, 
  Smartphone, 
  Battery, 
  Wifi, 
  Volume2, 
  FileCode, 
  Bell, 
  Sparkles,
  Search,
  Check,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { CitizenState, PrivacyLevel } from '../types';

interface OSHomeLauncherProps {
  citizenState: CitizenState;
  setCitizenState: React.Dispatch<React.SetStateAction<CitizenState>>;
  onLaunchApp: (view: 'citizen' | 'glasses' | 'tech' | 'audit', tab?: string) => void;
  logs: any[];
}

export default function OSHomeLauncher({ citizenState, setCitizenState, onLaunchApp, logs }: OSHomeLauncherProps) {
  // Wallpaper selection: 'cyber_grid' | 'neon_flow' | 'stealth_black' | 'cosmic_blur'
  const [wallpaper, setWallpaper] = useState<'cyber_grid' | 'neon_flow' | 'stealth_black' | 'cosmic_blur'>('cyber_grid');
  
  // Simulated Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Simulated live clock state
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Wallpaper backgrounds styling
  const getWallpaperStyle = () => {
    switch (wallpaper) {
      case 'cyber_grid':
        return {
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundColor: '#020617',
          border: '1px solid rgba(16, 185, 129, 0.15)'
        };
      case 'neon_flow':
        return {
          background: 'linear-gradient(135deg, #090d16 0%, #0d1e25 40%, #170d24 100%)',
          border: '1px solid rgba(168, 85, 247, 0.15)'
        };
      case 'stealth_black':
        return {
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 0)',
          backgroundSize: '16px 16px',
          backgroundColor: '#090d16',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        };
      case 'cosmic_blur':
        return {
          background: 'radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.18) 0%, transparent 50%)',
          backgroundColor: '#020617',
          border: '1px solid rgba(99, 102, 241, 0.15)'
        };
      default:
        return { backgroundColor: '#020617' };
    }
  };

  // Toggle broadcasting
  const toggleBroadcasting = () => {
    setCitizenState(prev => ({
      ...prev,
      isBroadcasting: !prev.isBroadcasting
    }));
  };

  // Applications grid configuration
  const apps = [
    {
      id: 'shield',
      name: 'Shield Dashboard',
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      bg: 'bg-emerald-950/40 border border-emerald-500/20',
      view: 'citizen' as const,
      tab: 'overview',
      desc: 'Main Shield overview'
    },
    {
      id: 'camera',
      name: 'Live Camera HUD',
      icon: <Camera className="w-6 h-6 text-cyan-400" />,
      bg: 'bg-cyan-950/40 border border-cyan-500/20',
      view: 'glasses' as const,
      tab: 'webcam',
      desc: 'Verify face blurs'
    },
    {
      id: 'scanner',
      name: 'BLE Signal Radar',
      icon: <Radio className="w-6 h-6 text-blue-400" />,
      bg: 'bg-blue-950/40 border border-blue-500/20',
      view: 'glasses' as const,
      tab: 'scanner',
      desc: 'Scan active devices'
    },
    {
      id: 'heatmap',
      name: 'Privacy Map',
      icon: <Map className="w-6 h-6 text-indigo-400" />,
      bg: 'bg-indigo-950/40 border border-indigo-500/20',
      view: 'glasses' as const,
      tab: 'heatmap',
      desc: 'Heatmap of camera nodes'
    },
    {
      id: 'street',
      name: 'Walk Simulator',
      icon: <Tv className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-950/40 border border-amber-500/20',
      view: 'glasses' as const,
      tab: 'street',
      desc: 'Street sandbox testing'
    },
    {
      id: 'audit',
      name: 'Official Audit',
      icon: <HelpCircle className="w-6 h-6 text-purple-400" />,
      bg: 'bg-purple-950/40 border border-purple-500/20',
      view: 'audit' as const,
      tab: 'main',
      desc: 'Compliance certificates'
    },
    {
      id: 'faces',
      name: 'Faces Registry',
      icon: <User className="w-6 h-6 text-pink-400" />,
      bg: 'bg-pink-950/40 border border-pink-500/20',
      view: 'citizen' as const,
      tab: 'faces',
      desc: 'Manage your blurred photos'
    },
    {
      id: 'tags',
      name: 'Protected Gear',
      icon: <Smartphone className="w-6 h-6 text-orange-400" />,
      bg: 'bg-orange-950/40 border border-orange-500/20',
      view: 'citizen' as const,
      tab: 'tags',
      desc: 'Manage tags and battery'
    },
    {
      id: 'settings',
      name: 'Alert Settings',
      icon: <Settings className="w-6 h-6 text-slate-300" />,
      bg: 'bg-slate-800/40 border border-slate-700/20',
      view: 'citizen' as const,
      tab: 'settings',
      desc: 'Audio and alerts config'
    },
    {
      id: 'wifi',
      name: 'Home WiFi Rules',
      icon: <Wifi className="w-6 h-6 text-teal-400" />,
      bg: 'bg-teal-950/40 border border-teal-500/20',
      view: 'citizen' as const,
      tab: 'wifi',
      desc: 'Automatic trigger SSIDs'
    },
    {
      id: 'lock',
      name: 'Biometric Lock',
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      bg: 'bg-rose-950/40 border border-rose-500/20',
      view: 'citizen' as const,
      tab: 'biometric',
      desc: 'Set passcodes & finger-scans'
    },
    {
      id: 'sdk_code',
      name: 'SDK Dev Code',
      icon: <FileCode className="w-6 h-6 text-sky-400" />,
      bg: 'bg-sky-950/40 border border-sky-500/20',
      view: 'tech' as const,
      tab: 'sdk_code',
      desc: 'Core implementation code'
    }
  ];

  // Filter apps by search query
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="rounded-3xl border border-slate-800 p-6 md:p-8 overflow-hidden relative shadow-2xl transition-all duration-500 select-none min-h-[640px] flex flex-col justify-between"
      style={getWallpaperStyle()}
    >
      {/* Decorative Mobile Bezel Overlay (Inner Glow) */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] z-10" />

      {/* Top Section: Date, Time & Search Widget */}
      <div className="space-y-6 relative z-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 block font-mono">
              BlurBubble Home Screen OS
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none mt-1 font-sans">
              {currentTime}
            </h2>
            <p className="text-xs font-semibold text-slate-400 font-mono mt-1">
              {currentDate}
            </p>
          </div>

          {/* Wallpaper Selection Circles */}
          <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-2xl flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider pl-1 pr-2 border-r border-slate-900">
              Wallpaper
            </span>
            {[
              { id: 'cyber_grid', color: 'bg-emerald-500 border-emerald-400', title: 'Cyber Grid' },
              { id: 'neon_flow', color: 'bg-purple-500 border-purple-400', title: 'Neon Gradient' },
              { id: 'stealth_black', color: 'bg-slate-900 border-slate-700', title: 'Carbon Stealth' },
              { id: 'cosmic_blur', color: 'bg-indigo-500 border-indigo-400', title: 'Cosmic Blur' }
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setWallpaper(w.id as any)}
                className={`w-4 h-4 rounded-full border transition-all ${w.color} ${
                  wallpaper === w.id ? 'scale-125 ring-2 ring-white/30' : 'opacity-60 hover:opacity-100'
                }`}
                title={w.title}
              />
            ))}
          </div>
        </div>

        {/* Interactive App Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value !== '');
            }}
            placeholder="Type to search smart apps or settings..."
            className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-sans shadow-lg"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Middle Section: Widgets or Filtered Apps */}
      <div className="my-6 relative z-20 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {showSearchResults ? (
            /* SEARCH RESULTS VIEW */
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              {filteredApps.length > 0 ? (
                filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => onLaunchApp(app.view, app.tab)}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
                  >
                    <div className={`p-3 rounded-xl ${app.bg} group-hover:scale-110 transition-transform`}>
                      {app.icon}
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{app.desc}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-500 space-y-1">
                  <p className="text-xs font-bold text-slate-400">No applications matched your search</p>
                  <p className="text-[10px]">Try searching "shield", "camera", "scanner", or "lock"</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* DEFAULT HOME WORKSPACE (BENTO WIDGETS + APPS LIST) */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Dynamic Live iOS/Android Bento Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Shield Control & Status Widget */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-4 backdrop-blur shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-950/40 rounded-lg border border-emerald-500/20 text-emerald-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Privacy Core</span>
                        <span className="text-xs font-bold text-white">Stop Recording Shield</span>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider ${
                      citizenState.isBroadcasting 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {citizenState.isBroadcasting ? 'Broadcasting' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-slate-900 font-mono text-[10px] text-slate-400">
                    <div>
                      ID: <span className="text-slate-200">{citizenState.anonymousId.substring(0, 8)}...</span>
                    </div>
                    <div>
                      Range: <span className="text-emerald-400 font-bold">{citizenState.rangeMeters}m</span>
                    </div>
                    <div>
                      Mode: <span className="text-white font-bold">{citizenState.privacyLevel.toUpperCase().replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={toggleBroadcasting}
                      className={`flex-1 font-sans text-xs font-bold py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        citizenState.isBroadcasting
                          ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/30 text-rose-400'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {citizenState.isBroadcasting ? (
                        <>
                          <Moon className="w-3.5 h-3.5" />
                          Pause Broadcast Shield
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5" />
                          Activate Broadcast Shield
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onLaunchApp('citizen', 'overview')}
                      className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center"
                      title="Manage settings"
                    >
                      Open Options
                    </button>
                  </div>
                </div>

                {/* 2. System Hardware & Signal Pulse Widget */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3 backdrop-blur shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-cyan-950/40 rounded-lg border border-cyan-500/20 text-cyan-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Hardware Gear</span>
                        <span className="text-xs font-bold text-white">Smart Glass Sync</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase">
                      Connected v2
                    </span>
                  </div>

                  {/* Glass Diagnostics */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Gear Temperature</span>
                      <span className="text-xs font-bold text-slate-200">36.8°C (Normal)</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">NPU Load Status</span>
                      <span className="text-xs font-bold text-slate-200">14% Utilization</span>
                    </div>
                    <div className="space-y-0.5 col-span-2 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Current WiFi Node</span>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono truncate max-w-[120px]">
                        {citizenState.currentWifiSsid || 'Cellular LTE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pl-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Radar actively scanning
                    </span>
                    <button 
                      onClick={() => onLaunchApp('glasses', 'scanner')}
                      className="text-cyan-400 font-bold hover:underline text-[9px] font-mono flex items-center"
                    >
                      Signal Scanner <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main App Icons Grid (12 Apps) */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-2">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onLaunchApp(app.view, app.tab)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                  >
                    <div className={`p-4 rounded-2xl ${app.bg} bg-slate-950/80 backdrop-blur-md shadow-md group-hover:scale-110 group-active:scale-95 transition-all duration-200 flex items-center justify-center relative`}>
                      {app.icon}
                      {/* Active status indicator dot on the Shield Dashboard app icon */}
                      {app.id === 'shield' && citizenState.isBroadcasting && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-ping"></span>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-200 text-center tracking-tight truncate max-w-[80px] group-hover:text-white transition">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section: Floating Glass App Dock */}
      <div className="relative z-20 mt-4 flex justify-center">
        <div className="bg-white/10 dark:bg-slate-900/40 border border-white/10 dark:border-slate-800/60 rounded-3xl p-3 max-w-sm w-full backdrop-blur-xl flex justify-around items-center gap-3 shadow-2xl">
          {[
            { id: 'dock-shield', title: 'Main Shield', icon: <Shield className="w-5.5 h-5.5 text-emerald-400" />, view: 'citizen' as const, tab: 'overview' },
            { id: 'dock-cam', title: 'Live HUD', icon: <Camera className="w-5.5 h-5.5 text-cyan-400" />, view: 'glasses' as const, tab: 'webcam' },
            { id: 'dock-scan', title: 'Radar BLE', icon: <Radio className="w-5.5 h-5.5 text-blue-400" />, view: 'glasses' as const, tab: 'scanner' },
            { id: 'dock-street', title: 'Walk Sandbox', icon: <Tv className="w-5.5 h-5.5 text-amber-400" />, view: 'glasses' as const, tab: 'street' }
          ].map((dockItem) => (
            <button
              key={dockItem.id}
              onClick={() => onLaunchApp(dockItem.view, dockItem.tab)}
              className="p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 hover:scale-115 transition-all duration-200 flex items-center justify-center relative cursor-pointer"
              title={dockItem.title}
            >
              {dockItem.icon}
              {/* Highlight standard tabs when they match current launcher state */}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-slate-800/80 self-center"></div>
          {/* Dashboard Close / Exit OS View Launcher Button */}
          <button
            onClick={() => {
              setCitizenState(prev => ({ ...prev, disguiseUiActive: false }));
            }}
            className="p-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/70 hover:scale-115 text-rose-400 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Exit Home Launcher / Back to Dashboard"
          >
            <Lock className="w-5.5 h-5.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
