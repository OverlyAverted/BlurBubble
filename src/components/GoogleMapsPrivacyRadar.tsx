import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  MapPin, ShieldCheck, ShieldAlert, Camera, Radio, Search, Navigation, 
  Eye, Zap, AlertTriangle, Layers, Crosshair, CheckCircle2, Lock, Info, Sparkles, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenState, DetectionLog } from '../types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim().length > 10;

interface ThreatMarker {
  id: string;
  name: string;
  type: 'cctv' | 'alpr' | 'glasses' | 'drone' | 'ble_beacon';
  lat: number;
  lng: number;
  threatLevel: 'HIGH' | 'MED' | 'LOW';
  distanceMeters: number;
  status: 'MASKED' | 'EXPOSED' | 'BLOCKING';
  lastSeen: string;
}

const INITIAL_USER_POS = { lat: 37.7749, lng: -122.4194 }; // San Francisco downtown default

const DEFAULT_THREATS: ThreatMarker[] = [
  { id: 'cam-801', name: 'Ring City-Cam #801 (Facial Rec)', type: 'cctv', lat: 37.7758, lng: -122.4180, threatLevel: 'HIGH', distanceMeters: 110, status: 'MASKED', lastSeen: '12s ago' },
  { id: 'alpr-94', name: 'Traffic ALPR License Reader', type: 'alpr', lat: 37.7735, lng: -122.4210, threatLevel: 'MED', distanceMeters: 210, status: 'MASKED', lastSeen: '4s ago' },
  { id: 'glasses-03', name: 'Ray-Ban Meta Smart Glasses', type: 'glasses', lat: 37.7752, lng: -122.4202, threatLevel: 'HIGH', distanceMeters: 45, status: 'MASKED', lastSeen: '1s ago' },
  { id: 'drone-77', name: 'Commercial Aerial Drone (4K)', type: 'drone', lat: 37.7765, lng: -122.4225, threatLevel: 'MED', distanceMeters: 340, status: 'EXPOSED', lastSeen: '18s ago' },
  { id: 'ble-beacon-12', name: 'Unidentified BLE Tracking Beacon', type: 'ble_beacon', lat: 37.7741, lng: -122.4178, threatLevel: 'LOW', distanceMeters: 160, status: 'MASKED', lastSeen: '2m ago' }
];

// Inner component for Places Search & Map Controls using Places API (New)
function PlaceSearchAndOverlay({ 
  onSelectPlace, 
  userPos 
}: { 
  onSelectPlace: (pos: { lat: number; lng: number }, name: string) => void;
  userPos: { lat: number; lng: number };
}) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; name: string; location: google.maps.LatLngLiteral; address?: string }>>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placesLib || !query.trim() || !map) return;
    setIsSearching(true);
    try {
      const response = await placesLib.Place.searchByText({
        textQuery: query,
        fields: ['displayName', 'location', 'formattedAddress'],
        locationBias: map.getCenter() || userPos,
        maxResultCount: 5,
      });
      if (response.places) {
        const parsed = response.places.map(p => ({
          id: p.id || Math.random().toString(),
          name: p.displayName || 'Selected Location',
          location: p.location ? { lat: p.location.lat(), lng: p.location.lng() } : userPos,
          address: p.formattedAddress || ''
        }));
        setResults(parsed);
      }
    } catch (err) {
      console.error('Places Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-10 max-w-md bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 rounded-xl p-2.5 shadow-2xl">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <Search className="w-4 h-4 text-emerald-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location or venue for Privacy Shield..."
          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-500 w-full focus:outline-none focus:border-emerald-500/60"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1"
        >
          {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onSelectPlace(r.location, r.name);
                map?.panTo(r.location);
                map?.setZoom(15);
                setResults([]);
                setQuery('');
              }}
              className="w-full text-left p-1.5 hover:bg-slate-900/80 rounded border border-transparent hover:border-slate-800 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-slate-200 block truncate">{r.name}</span>
                {r.address && <span className="text-[10px] font-mono text-slate-500 block truncate">{r.address}</span>}
              </div>
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Draw Circle on Map Effect
function MapShieldCircle({ center, radiusMeters }: { center: { lat: number; lng: number }; radiusMeters: number }) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: '#10b981',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.15,
        map,
        center,
        radius: radiusMeters,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMeters);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center, radiusMeters]);

  return null;
}

export function GoogleMapsPrivacyRadar({ 
  citizenState, 
  addLog 
}: { 
  citizenState: CitizenState; 
  addLog?: (log: any) => void; 
}) {
  const [userPos, setUserPos] = useState(INITIAL_USER_POS);
  const [threats, setThreats] = useState<ThreatMarker[]>(DEFAULT_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [activeZoneName, setActiveZoneName] = useState('San Francisco Tech Hub Privacy Perimeter');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);

  // Recalculate threat distances relative to userPos
  const calculateDistanceMeters = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
    const R = 6371e3; // metres
    const φ1 = p1.lat * Math.PI / 180;
    const φ2 = p2.lat * Math.PI / 180;
    const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
    const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  };

  const handleCenterOnUserGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(newPos);
          addLog({
            deviceModel: 'GEOSPATIAL_GPS',
            action: 'censored',
            shieldApplied: 'LIVE_GPS_LOCK',
            distance: 0,
            rotatedId: `GPS_${newPos.lat.toFixed(4)}_${newPos.lng.toFixed(4)}`
          });
        },
        (err) => {
          console.warn('Geolocation blocked or unavailable, keeping default position', err);
        }
      );
    }
  };

  const handleMaskThreat = (threatId: string) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: 'MASKED' } : t));
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      addLog({
        deviceModel: threat.name,
        action: 'censored',
        shieldApplied: citizenState.privacyLevel.toUpperCase(),
        distance: threat.distanceMeters,
        rotatedId: threat.id
      });
    }
  };

  return (
    <div id="google-maps-privacy-radar-container" className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.1)] space-y-4 relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                Geospatial Privacy Radar (Google Maps)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-bold uppercase">
                  {hasValidKey ? 'GMP LIVE API' : 'SIMULATION MODE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time geospatial zoning, surveillance camera detection, and RF shield perimeter mapping
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCenterOnUserGPS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono transition cursor-pointer"
            title="Lock map onto real browser GPS location"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            Lock GPS
          </button>

          {!hasValidKey && (
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Configure Maps Key
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={userPos}
              defaultZoom={mapZoom}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              <PlaceSearchAndOverlay
                userPos={userPos}
                onSelectPlace={(pos, name) => {
                  setUserPos(pos);
                  setActiveZoneName(name);
                }}
              />

              {/* Active Protection Radius Circle */}
              <MapShieldCircle center={userPos} radiusMeters={citizenState.rangeMeters} />

              {/* User Center Location Marker */}
              <AdvancedMarker position={userPos} title="BlurBubble Shield Beacon Center">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
                  <div className="relative p-2 bg-emerald-500 border-2 border-white rounded-full text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                    <Radio className="w-4 h-4 text-slate-950" />
                  </div>
                </div>
              </AdvancedMarker>

              {/* Surveillance Threat Markers */}
              {threats.map((threat) => {
                const isMasked = threat.status === 'MASKED';
                return (
                  <AdvancedMarker
                    key={threat.id}
                    position={{ lat: threat.lat, lng: threat.lng }}
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <div className={`p-1.5 rounded-full border shadow-lg transition-transform hover:scale-110 ${
                      isMasked 
                        ? 'bg-slate-900/90 border-emerald-500 text-emerald-400' 
                        : 'bg-rose-950/90 border-rose-500 text-rose-400 animate-bounce'
                    }`}>
                      {threat.type === 'cctv' && <Camera className="w-4 h-4" />}
                      {threat.type === 'alpr' && <Eye className="w-4 h-4" />}
                      {threat.type === 'glasses' && <Eye className="w-4 h-4 text-amber-400" />}
                      {threat.type === 'drone' && <Radio className="w-4 h-4" />}
                      {threat.type === 'ble_beacon' && <AlertTriangle className="w-4 h-4" />}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Info Window for Selected Threat */}
              {selectedThreat && (
                <InfoWindow
                  position={{ lat: selectedThreat.lat, lng: selectedThreat.lng }}
                  onCloseClick={() => setSelectedThreat(null)}
                >
                  <div className="p-2 text-slate-950 font-mono space-y-2 max-w-xs">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-xs uppercase">{selectedThreat.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        selectedThreat.status === 'MASKED' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {selectedThreat.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-700">
                      Type: <strong>{selectedThreat.type.toUpperCase()}</strong> | Distance: <strong>{selectedThreat.distanceMeters}m</strong>
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {selectedThreat.status === 'EXPOSED' ? (
                        <button
                          type="button"
                          onClick={() => handleMaskThreat(selectedThreat.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1 px-2 rounded transition"
                        >
                          Dispatch Shield Obfuscation
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Shield Intercepted
                        </span>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Tech Interactive Simulated Radar Map Fallback */
          <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden">
            {/* Background Tactical Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#052e16_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            
            {/* Simulated Radar Sweep Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[380px] h-[380px] rounded-full border border-emerald-500/20 relative flex items-center justify-center">
                <div className="w-[260px] h-[260px] rounded-full border border-emerald-500/30" />
                <div className="w-[140px] h-[140px] rounded-full border border-emerald-500/40" />
                {/* Rotating Sweep Line */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full origin-center bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.25)_60deg,transparent_60deg)]"
                />
              </div>
            </div>

            {/* Top Interactive Search Simulation */}
            <div className="relative z-10 flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 max-w-md backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 w-full px-2">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{activeZoneName}</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 shrink-0">
                GPS: {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}
              </span>
            </div>

            {/* Center User Shield Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-60"></span>
                <div className="relative p-3 bg-emerald-500 border-2 border-white rounded-full text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.9)]">
                  <Radio className="w-5 h-5 text-slate-950 animate-pulse" />
                </div>
              </div>
              <span className="mt-1 block text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow">
                BlurBubble Active Beacon ({citizenState.rangeMeters}m)
              </span>
            </div>

            {/* Simulated Threat Pins on Radar */}
            <div className="absolute top-1/4 left-1/3 z-10">
              <button
                type="button"
                onClick={() => handleMaskThreat('cam-801')}
                className="p-1.5 bg-slate-900 border border-emerald-500 text-emerald-400 rounded-full shadow hover:scale-110 transition cursor-pointer flex items-center gap-1 group"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden group-hover:inline text-[9px] font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                  Ring City-Cam (Masked)
                </span>
              </button>
            </div>

            <div className="absolute bottom-1/3 right-1/4 z-10">
              <button
                type="button"
                onClick={() => handleMaskThreat('drone-77')}
                className="p-1.5 bg-rose-950/90 border border-rose-500 text-rose-400 rounded-full shadow animate-pulse hover:scale-110 transition cursor-pointer flex items-center gap-1 group"
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden group-hover:inline text-[9px] font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800 text-rose-300">
                  4K Drone [EXPOSED - Click to Mask]
                </span>
              </button>
            </div>

            {/* Bottom Status Controls */}
            <div className="relative z-10 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {threats.filter(t => t.status === 'MASKED').length} / {threats.length} Threats Disrupted
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Enable Live Google Map Tiles ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Geospatial Threat Telemetry & Zone Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Geospatial Zone</span>
          <span className="text-xs font-mono font-bold text-emerald-400 block truncate">{activeZoneName}</span>
          <span className="text-[9px] font-mono text-slate-500 block">Radius: {citizenState.rangeMeters}m | Mode: {citizenState.privacyLevel}</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Detected Optical Devices</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">5 Smart Cameras/Beacons</span>
            <span className="text-emerald-400 font-bold">100% Deflected</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 block">RFC-9402 Compliance Handshakes Verified</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Privacy Route Optimization</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Surveillance Bypass</span>
            <span className="text-cyan-400 font-bold">89% Low-Cam Density</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 block">Routes API Camera Density Filter Active</span>
        </div>
      </div>

      {/* Setup Instructions Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Google Maps API Setup Instructions
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>To enable live Google Maps satellite & roadmap tiles with real-world Places search:</p>
                
                <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <li>
                    Get an API key from the{' '}
                    <a 
                      href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline font-bold"
                    >
                      Google Maps Platform Console
                    </a>
                  </li>
                  <li>Open <strong>Settings</strong> (⚙️ gear icon in the top-right corner)</li>
                  <li>Select <strong>Secrets</strong></li>
                  <li>Type secret name: <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">GOOGLE_MAPS_PLATFORM_KEY</code></li>
                  <li>Paste your key as the secret value and press <strong>Enter</strong></li>
                </ol>

                <p className="text-[10px] text-slate-400">
                  The application rebuilds automatically upon secret injection to render live maps!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl transition cursor-pointer text-xs"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GoogleMapsPrivacyRadar;
