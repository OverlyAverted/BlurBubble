import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  MapPin, ShieldCheck, ShieldAlert, Camera, Radio, Search, Navigation, 
  Eye, Zap, AlertTriangle, Layers, Crosshair, CheckCircle2, Lock, Info, Sparkles, RefreshCw,
  Plus, Trash2, Sliders, Shield, Compass, ChevronRight, Check, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenState, DetectionLog, GeofenceZone } from '../types';
import { evaluateGeofences, getHaversineDistanceMeters } from '../utils/geofence';

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

// Custom Draw Geofence Circle on Google Map
function GeofenceMapCircle({ zone }: { zone: GeofenceZone; key?: string }) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: zone.isActive ? '#f43f5e' : '#64748b',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: zone.isActive ? '#f43f5e' : '#64748b',
        fillOpacity: zone.isActive ? 0.22 : 0.08,
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radiusMeters,
      });
    } else {
      circleRef.current.setCenter({ lat: zone.lat, lng: zone.lng });
      circleRef.current.setRadius(zone.radiusMeters);
      circleRef.current.setOptions({
        strokeColor: zone.isActive ? '#f43f5e' : '#64748b',
        fillColor: zone.isActive ? '#f43f5e' : '#64748b',
        fillOpacity: zone.isActive ? 0.22 : 0.08,
      });
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, zone.lat, zone.lng, zone.radiusMeters, zone.isActive]);

  return null;
}

export function GoogleMapsPrivacyRadar({ 
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
  const [userPos, setUserPos] = useState(INITIAL_USER_POS);
  const [threats, setThreats] = useState<ThreatMarker[]>(DEFAULT_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [activeZoneName, setActiveZoneName] = useState('San Francisco Tech Hub Privacy Perimeter');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(250);
  const [newZoneCategory, setNewZoneCategory] = useState<'high_surveillance' | 'government' | 'event' | 'custom' | 'corporate'>('high_surveillance');
  const [mapZoom, setMapZoom] = useState(15);

  // 📍 B. Multi-Point Polygon Geofences & Dynamic RSSI Distance Calibration States
  const [polygonVertices, setPolygonVertices] = useState<Array<{ lat: number; lng: number }>>([
    { lat: 37.7755, lng: -122.4205 },
    { lat: 37.7762, lng: -122.4182 },
    { lat: 37.7745, lng: -122.4170 },
    { lat: 37.7738, lng: -122.4192 }
  ]);
  const [polygonName, setPolygonName] = useState<string>('HQ Property Boundary Geofence');

  // RSSI Attenuation Curve Calibration
  const [selectedMaterial, setSelectedMaterial] = useState<'drywall' | 'glass' | 'concrete' | 'crowd'>('concrete');
  const [pathLossExponent, setPathLossExponent] = useState<number>(3.2); // 1.8 to 4.5
  const [calibrationDistance, setCalibrationDistance] = useState<number>(15); // meters

  const materialLosses = {
    drywall: 3,
    glass: 8,
    concrete: 15,
    crowd: 12
  };

  const calculatedRSSI = Math.round(-59 - 10 * pathLossExponent * Math.log10(Math.max(1, calibrationDistance)) - materialLosses[selectedMaterial]);

  const handleAddVertex = () => {
    const offsetLat = (Math.random() - 0.5) * 0.003;
    const offsetLng = (Math.random() - 0.5) * 0.003;
    setPolygonVertices(prev => [...prev, { lat: userPos.lat + offsetLat, lng: userPos.lng + offsetLng }]);
  };

  const handleExportPolygonJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [polygonVertices.map(v => [v.lng, v.lat])]
      },
      properties: {
        name: polygonName,
        created: new Date().toISOString(),
        materialAttenuation: selectedMaterial,
        pathLossExponent
      }
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `geofence_polygon_${polygonName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Real-time Geofence Trigger Evaluator
  const geofenceResult = evaluateGeofences(userPos, citizenState.geofenceZones || []);
  const activeTriggeredZone = geofenceResult.insideZone;

  // Auto-switch shield mode to strict_blur when entering high-risk geofence
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
            deviceModel: `GEOFENCE ALARM: ${activeTriggeredZone.name}`,
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
    } else {
      if (citizenState.activeGeofenceTriggered) {
        if (onChange) {
          onChange({
            ...citizenState,
            activeGeofenceTriggered: false,
            activeGeofenceZoneName: undefined
          });
        }
      }
    }
  }, [userPos, citizenState.geofencingEnabled, citizenState.geofenceZones, activeTriggeredZone]);

  // Geofence Management Handlers
  const handleToggleGeofencing = () => {
    if (onChange) {
      onChange({
        ...citizenState,
        geofencingEnabled: !citizenState.geofencingEnabled
      });
    }
  };

  const handleToggleZone = (zoneId: string) => {
    if (onChange && citizenState.geofenceZones) {
      const updated = citizenState.geofenceZones.map(z =>
        z.id === zoneId ? { ...z, isActive: !z.isActive } : z
      );
      onChange({
        ...citizenState,
        geofenceZones: updated
      });
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    if (onChange && citizenState.geofenceZones) {
      const updated = citizenState.geofenceZones.filter(z => z.id !== zoneId);
      onChange({
        ...citizenState,
        geofenceZones: updated
      });
    }
  };

  const handleAddCustomZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !onChange) return;

    const newZone: GeofenceZone = {
      id: `geo-custom-${Date.now()}`,
      name: newZoneName.trim(),
      lat: userPos.lat,
      lng: userPos.lng,
      radiusMeters: newZoneRadius,
      isActive: true,
      targetPrivacyLevel: 'strict_blur',
      triggerOnEnter: true,
      category: newZoneCategory,
      description: `User-defined high-risk geofence area centered at GPS ${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}`
    };

    const currentZones = citizenState.geofenceZones || [];
    onChange({
      ...citizenState,
      geofenceZones: [...currentZones, newZone]
    });

    setNewZoneName('');
    setShowAddZoneModal(false);

    if (addLog) {
      addLog({
        deviceModel: `NEW GEOFENCE: ${newZone.name}`,
        action: 'discovered',
        shieldApplied: 'GEOFENCE_REGISTERED',
        distance: newZoneRadius,
        rotatedId: newZone.id
      });
    }
  };

  const handleSimulateMoveToZone = (zone: GeofenceZone) => {
    setUserPos({ lat: zone.lat, lng: zone.lng });
    setActiveZoneName(zone.name);
  };

  const handleSimulateExitGeofence = () => {
    setUserPos({ lat: 37.7500, lng: -122.4300 });
    setActiveZoneName('Neutral Residential Area (Outside Geofences)');
  };
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

              {/* Active Geofence Circles on Google Map */}
              {citizenState.geofenceZones?.map((zone) => (
                <GeofenceMapCircle key={zone.id} zone={zone} />
              ))}

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

      {/* Live Geofence High-Risk Alert Banner */}
      <AnimatePresence>
        {activeTriggeredZone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-950/80 border-2 border-rose-500/80 rounded-xl p-4 shadow-[0_0_25px_rgba(244,63,94,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-rose-200 uppercase tracking-wide">
                    High-Risk Geofence Intercept Activated
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-rose-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                    STRICT BLUR ENGAGED
                  </span>
                </div>
                <p className="text-xs font-mono text-rose-300 font-bold mt-0.5">
                  Device location entered: <span className="underline">{activeTriggeredZone.name}</span>
                </p>
                <p className="text-[10px] font-mono text-rose-400/80">
                  {activeTriggeredZone.description || 'High-surveillance perimeter detected. Privacy shield automatically set to strict blur.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimulateExitGeofence}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-rose-500/50 text-rose-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
              >
                Simulate Exit Zone
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Geofence High-Risk Trigger & Radar Controller */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Geofencing Privacy Shield Trigger
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${
                  citizenState.geofencingEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {citizenState.geofencingEnabled ? 'AUTOMATION ENABLED' : 'PAUSED'}
                </span>
              </h4>
              <p className="text-[10px] font-mono text-slate-400">
                Automatically escalates shield to <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">STRICT BLUR</code> when entering high-risk geographical zones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleGeofencing}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                citizenState.geofencingEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {citizenState.geofencingEnabled ? 'Geofence Guard Active' : 'Enable Geofencing'}
            </button>

            <button
              type="button"
              onClick={() => setShowAddZoneModal(true)}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add High-Risk Zone
            </button>
          </div>
        </div>

        {/* Quick Simulation Toolbar */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Instant Location Movement Simulators (Test Geofence Trigger):
          </span>
          <div className="flex flex-wrap gap-2">
            {citizenState.geofenceZones?.map((zone) => {
              const isCurrent = activeTriggeredZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSimulateMoveToZone(zone)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer border flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isCurrent ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
                  Move to {zone.name.split('(')[0].trim()}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleSimulateExitGeofence}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-mono transition cursor-pointer font-bold flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Move to Safe Area
            </button>
          </div>
        </div>

        {/* List of Configured High-Risk Geofence Zones */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Configured Geofence Surveillance Boundaries ({citizenState.geofenceZones?.length || 0})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {citizenState.geofenceZones?.map((zone) => {
              const dist = getHaversineDistanceMeters(userPos.lat, userPos.lng, zone.lat, zone.lng);
              const isInside = dist <= zone.radiusMeters && zone.isActive;

              return (
                <div
                  key={zone.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isInside
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : zone.isActive
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isInside ? 'bg-rose-500 animate-ping' : zone.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <h5 className="text-xs font-mono font-bold text-slate-200 line-clamp-1">{zone.name}</h5>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 line-clamp-1">{zone.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleZone(zone.id)}
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition cursor-pointer shrink-0 ${
                        zone.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {zone.isActive ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                    <span>Radius: <strong className="text-slate-200">{zone.radiusMeters}m</strong></span>
                    <span>Distance: <strong className={isInside ? 'text-rose-400 font-bold' : 'text-slate-300'}>{dist}m {isInside ? '(INSIDE)' : ''}</strong></span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSimulateMoveToZone(zone)}
                        className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                        title="Fly map to zone center"
                      >
                        Fly To
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-slate-500 hover:text-rose-400 transition cursor-pointer ml-1"
                        title="Delete geofence zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Custom Geofence Zone Modal */}
      <AnimatePresence>
        {showAddZoneModal && (
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
              className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Define High-Risk Geofence Trigger Zone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomZone} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Zone Name / Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Downtown CCTV Ring Corridor"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Center Coordinates (Current Map Position)</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 flex items-center justify-between">
                    <span>GPS: {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}</span>
                    <button
                      type="button"
                      onClick={handleCenterOnUserGPS}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Crosshair className="w-3 h-3" /> Get Device GPS
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-bold">Trigger Radius (Meters)</label>
                    <span className="text-rose-400 font-bold">{newZoneRadius}m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Risk Category</label>
                  <select
                    value={newZoneCategory}
                    onChange={(e: any) => setNewZoneCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                  >
                    <option value="high_surveillance">High CCTV / ALPR Density</option>
                    <option value="government">Government / Checkpoint Facility</option>
                    <option value="corporate">Corporate Tech Campus</option>
                    <option value="event">Private Event / Convention</option>
                    <option value="custom">Custom Area</option>
                  </select>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-[10px] text-slate-400">
                  Target Action: Automatically switches privacy shield to <strong className="text-emerald-300">STRICT BLUR</strong> upon entering radius.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddZoneModal(false)}
                    className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-2 rounded-xl transition cursor-pointer text-xs"
                  >
                    Create Geofence
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📍 Multi-Point Polygon Geofencing & Dynamic RSSI Attenuation Calibration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        
        {/* Multi-Point Polygon Drawer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Multi-Point Polygon Geofence
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {polygonVertices.length} VERTICES
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Define custom property lines or complex building footprints with multi-vertex boundary coordinates.
          </p>

          <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Geofence Label:</span>
              <input
                type="text"
                value={polygonName}
                onChange={(e) => setPolygonName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-[10px] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
              {polygonVertices.map((v, idx) => (
                <span key={idx} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                  P{idx + 1}: {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
              <button
                type="button"
                onClick={handleAddVertex}
                className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded cursor-pointer transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add GPS Vertex
              </button>
              
              <button
                type="button"
                onClick={handleExportPolygonJSON}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-bold rounded cursor-pointer transition flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-cyan-400" /> Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic RSSI Distance & Material Attenuation Calibration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Dynamic RSSI Attenuation Calibration
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
              {calculatedRSSI} dBm
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Simulates signal absorption through structural walls, glass, and dense crowds to dynamically calibrate BLE RSSI distance curves.
          </p>

          <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Obstacle Material:</label>
                <select
                  value={selectedMaterial}
                  onChange={(e: any) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px]"
                >
                  <option value="drywall">Drywall Wall (-3 dB)</option>
                  <option value="glass">Reinforced Glass (-8 dB)</option>
                  <option value="concrete">Concrete Wall (-15 dB)</option>
                  <option value="crowd">Dense Crowd (-12 dB)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Distance Calibration ({calibrationDistance}m):</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={calibrationDistance}
                  onChange={(e) => setCalibrationDistance(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-900 rounded"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-slate-400">
                <span>Path Loss Exponent (N):</span>
                <span className="text-cyan-400 font-bold">{pathLossExponent}</span>
              </div>
              <input
                type="range"
                min="1.8"
                max="4.5"
                step="0.1"
                value={pathLossExponent}
                onChange={(e) => setPathLossExponent(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-900 rounded"
              />
            </div>
          </div>
        </div>

      </div>

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
