import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Radio, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { CitizenState, RegisteredEntity } from '../types';

interface BeaconRssiGaugeProps {
  state: CitizenState;
  onChange?: (updated: CitizenState) => void;
  onAddLog?: (log: any) => void;
}

interface RssiTier {
  min: number;
  max: number;
  label: string;
  sublabel: string;
  color: string;
  glowColor: string;
  textColor: string;
  bgBadge: string;
  borderBadge: string;
}

const RSSI_TIERS: RssiTier[] = [
  {
    min: -105,
    max: -90,
    label: 'CRITICAL / FRINGE',
    sublabel: 'Packet Drop Risk High',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    textColor: 'text-rose-400',
    bgBadge: 'bg-rose-950/50',
    borderBadge: 'border-rose-500/30'
  },
  {
    min: -90,
    max: -80,
    label: 'WEAK / DEGRADED',
    sublabel: 'Multipath Attenuation',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    textColor: 'text-orange-400',
    bgBadge: 'bg-orange-950/50',
    borderBadge: 'border-orange-500/30'
  },
  {
    min: -80,
    max: -70,
    label: 'FAIR / ACCEPTABLE',
    sublabel: 'Standard Compliance Range',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    textColor: 'text-amber-400',
    bgBadge: 'bg-amber-950/50',
    borderBadge: 'border-amber-500/30'
  },
  {
    min: -70,
    max: -55,
    label: 'GOOD / ROBUST',
    sublabel: 'Strong RF Line-of-Sight',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    textColor: 'text-cyan-400',
    bgBadge: 'bg-cyan-950/50',
    borderBadge: 'border-cyan-500/30'
  },
  {
    min: -55,
    max: -25,
    label: 'EXCELLENT / OPTIMAL',
    sublabel: 'Maximum Beacon Coupling',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    textColor: 'text-emerald-400',
    bgBadge: 'bg-emerald-950/50',
    borderBadge: 'border-emerald-500/30'
  }
];

function getRssiTier(rssi: number): RssiTier {
  for (const tier of RSSI_TIERS) {
    if (rssi >= tier.min && rssi <= tier.max) {
      return tier;
    }
  }
  return rssi > -25 ? RSSI_TIERS[4] : RSSI_TIERS[0];
}

export const BeaconRssiGauge: React.FC<BeaconRssiGaugeProps> = ({ state, onAddLog }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const sparklineRef = useRef<SVGSVGElement>(null);

  // Entities from state
  const entities = useMemo(() => state.registeredEntities || [], [state.registeredEntities]);
  const activeEntities = useMemo(() => entities.filter(e => e.isActive), [entities]);

  // Selected Beacon ID
  const [selectedBeaconId, setSelectedBeaconId] = useState<string>(() => {
    return activeEntities[0]?.id || entities[0]?.id || 'primary_beacon';
  });

  // Ensure selected beacon stays valid if list changes
  useEffect(() => {
    if (entities.length > 0 && !entities.some(e => e.id === selectedBeaconId)) {
      setSelectedBeaconId(activeEntities[0]?.id || entities[0]?.id);
    }
  }, [entities, activeEntities, selectedBeaconId]);

  const activeBeacon = useMemo(() => {
    return entities.find(e => e.id === selectedBeaconId) || activeEntities[0] || entities[0];
  }, [entities, activeEntities, selectedBeaconId]);

  // Real-time live drift simulation toggle
  const [isLiveDriftActive, setIsLiveDriftActive] = useState<boolean>(true);
  const [showCalibrationControls, setShowCalibrationControls] = useState<boolean>(false);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0); // manual tweak in dBm

  // Compute baseline realistic RSSI based on range, battery, and emergency broadcast
  const baseRssi = useMemo(() => {
    if (!activeBeacon) return -75;
    if (!activeBeacon.isActive) return -98;

    // Standard BLE path loss formula at distance d (meters):
    // RSSI = RSSI_1m - 10 * n * log10(d)
    const range = state.rangeMeters || 12;
    // Estimated beacon distance within protected perimeter (approx 20% to 70% of max range)
    const estDistance = Math.max(0.8, range * 0.35);
    const pathLossExponent = 2.4; // typical indoor/human body shadowing
    const txPower1m = -58; // dBm at 1m

    let calculated = txPower1m - (10 * pathLossExponent * Math.log10(estDistance));

    // Power boosts or throttles
    if (state.emergencyPrivacyActive) calculated += 6; // high-gain RF strobe
    if (state.batterySaverActive) calculated -= 7; // power throttled
    if (state.intelligentBatteryOptimization && activeBeacon.batteryPercent < 30) calculated -= 5;

    // Hardware variance
    if (activeBeacon.type === 'phone') calculated += 3;
    if (activeBeacon.type === 'airtag' || activeBeacon.type === 'smart_tag') calculated -= 2;

    return Math.round(Math.max(-98, Math.min(-32, calculated)));
  }, [activeBeacon, state.rangeMeters, state.emergencyPrivacyActive, state.batterySaverActive, state.intelligentBatteryOptimization]);

  // Dynamic live RSSI value
  const [currentRssi, setCurrentRssi] = useState<number>(baseRssi);
  // Rolling historical RSSI samples for real-time sparkline (last 20 readings)
  const [rssiHistory, setRssiHistory] = useState<Array<{ timestamp: number; value: number }>>(() => {
    const init = [];
    const now = Date.now();
    for (let i = 19; i >= 0; i--) {
      init.push({
        timestamp: now - i * 1500,
        value: Math.max(-100, Math.min(-30, baseRssi + (Math.sin(i * 0.8) * 2)))
      });
    }
    return init;
  });

  // Noise floor reference (dBm)
  const noiseFloor = -95;
  const currentTier = useMemo(() => getRssiTier(currentRssi), [currentRssi]);

  // Live Jitter Simulation Interval
  useEffect(() => {
    if (!isLiveDriftActive) return;

    const interval = setInterval(() => {
      setCurrentRssi(prev => {
        // Multi-frequency simulated multipath RF flutter (+/- 1.8 dBm)
        const jitter = (Math.random() - 0.5) * 3.2;
        const target = baseRssi + calibrationOffset + jitter;
        const bounded = Math.round(Math.max(-102, Math.min(-28, target)));

        // Append to history
        setRssiHistory(old => {
          const updated = [...old.slice(1), { timestamp: Date.now(), value: bounded }];
          return updated;
        });

        return bounded;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveDriftActive, baseRssi, calibrationOffset]);

  // Sync current RSSI when active beacon or base configuration changes
  useEffect(() => {
    const updated = Math.max(-102, Math.min(-28, baseRssi + calibrationOffset));
    setCurrentRssi(updated);
  }, [baseRssi, calibrationOffset]);

  // D3 Gauge Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 360;
    const height = 210;
    const cx = width / 2;
    const cy = 165;
    const radius = 130;
    const innerRadius = 100;

    // Angle scale: -135 deg to +135 deg (-0.75 PI to +0.75 PI)
    const minRssi = -100;
    const maxRssi = -30;
    const angleScale = d3.scaleLinear()
      .domain([minRssi, maxRssi])
      .range([-0.75 * Math.PI, 0.75 * Math.PI])
      .clamp(true);

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${cx}, ${cy})`);

    // SVG Defs (Gradients & Filters)
    const defs = svg.append('defs');

    // Drop shadow glow filter
    const filter = defs.append('filter')
      .attr('id', 'gauge-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Multi-stop tactical rainbow gradient along arc
    const arcGradient = defs.append('linearGradient')
      .attr('id', 'rssi-arc-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    arcGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
    arcGradient.append('stop').attr('offset', '25%').attr('stop-color', '#f97316');
    arcGradient.append('stop').attr('offset', '50%').attr('stop-color', '#eab308');
    arcGradient.append('stop').attr('offset', '75%').attr('stop-color', '#06b6d4');
    arcGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    // 1. Background Arc Track (slate-850)
    const backgroundArc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(-0.75 * Math.PI)
      .endAngle(0.75 * Math.PI)
      .cornerRadius(5);

    mainGroup.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#0f172a')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.95);

    // 2. Colored Zone Background Segment Highlights
    RSSI_TIERS.forEach(tier => {
      const segStart = Math.max(minRssi, tier.min);
      const segEnd = Math.min(maxRssi, tier.max);
      if (segStart >= segEnd) return;

      const segArc = d3.arc<any>()
        .innerRadius(innerRadius + 2)
        .outerRadius(radius - 2)
        .startAngle(angleScale(segStart))
        .endAngle(angleScale(segEnd))
        .cornerRadius(2);

      mainGroup.append('path')
        .attr('d', segArc as any)
        .attr('fill', tier.color)
        .attr('opacity', 0.14);
    });

    // 3. Active Filled Arc (sweeping up to current RSSI)
    const activeEndAngle = angleScale(currentRssi);
    const activeArc = d3.arc<any>()
      .innerRadius(innerRadius + 4)
      .outerRadius(radius - 4)
      .startAngle(-0.75 * Math.PI)
      .endAngle(activeEndAngle)
      .cornerRadius(4);

    mainGroup.append('path')
      .attr('d', activeArc as any)
      .attr('fill', 'url(#rssi-arc-gradient)')
      .attr('filter', 'url(#gauge-glow)')
      .attr('opacity', 0.88);

    // 4. Tick Marks and Labels
    const tickValues = [-100, -90, -80, -70, -60, -50, -40, -30];
    tickValues.forEach(val => {
      const angle = angleScale(val) - Math.PI / 2; // convert to standard trig angle
      const tickTier = getRssiTier(val);

      // Major tick lines
      const x1 = Math.cos(angle) * (radius + 2);
      const y1 = Math.sin(angle) * (radius + 2);
      const x2 = Math.cos(angle) * (radius + 9);
      const y2 = Math.sin(angle) * (radius + 9);

      mainGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', val <= currentRssi ? tickTier.color : '#475569')
        .attr('stroke-width', val % 20 === 0 ? 2 : 1.2)
        .attr('opacity', val <= currentRssi ? 0.95 : 0.6);

      // Label text
      const lx = Math.cos(angle) * (radius + 21);
      const ly = Math.sin(angle) * (radius + 21);

      mainGroup.append('text')
        .attr('x', lx)
        .attr('y', ly + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', val <= currentRssi ? '#cbd5e1' : '#64748b')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', val <= currentRssi ? 'bold' : 'normal')
        .text(`${val}`);
    });

    // 5. Minor Sub-Ticks
    for (let val = -95; val <= -35; val += 5) {
      if (val % 10 === 0) continue;
      const angle = angleScale(val) - Math.PI / 2;
      const x1 = Math.cos(angle) * (radius + 2);
      const y1 = Math.sin(angle) * (radius + 2);
      const x2 = Math.cos(angle) * (radius + 6);
      const y2 = Math.sin(angle) * (radius + 6);

      mainGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#334155')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    }

    // 6. Center Hub Outer Rings
    mainGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 24)
      .attr('fill', '#020617')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2);

    mainGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 16)
      .attr('fill', '#0f172a')
      .attr('stroke', currentTier.color)
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#gauge-glow)');

    mainGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', currentTier.color);

    // 7. Tactical Needle Pointer
    const needleAngle = activeEndAngle - Math.PI / 2;
    const needleLength = radius - 8;
    const tipX = Math.cos(needleAngle) * needleLength;
    const tipY = Math.sin(needleAngle) * needleLength;
    const baseAngle1 = needleAngle + Math.PI / 2;
    const baseAngle2 = needleAngle - Math.PI / 2;
    const baseWidth = 5;
    const b1x = Math.cos(baseAngle1) * baseWidth;
    const b1y = Math.sin(baseAngle1) * baseWidth;
    const b2x = Math.cos(baseAngle2) * baseWidth;
    const b2y = Math.sin(baseAngle2) * baseWidth;

    // Needle path polygon
    mainGroup.append('polygon')
      .attr('points', `${tipX},${tipY} ${b1x},${b1y} ${-tipX * 0.15},${-tipY * 0.15} ${b2x},${b2y}`)
      .attr('fill', currentTier.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.6)
      .attr('filter', 'url(#gauge-glow)')
      .attr('opacity', 0.95);

  }, [currentRssi, currentTier]);

  // D3 Real-Time Historical Sparkline Rendering
  useEffect(() => {
    if (!sparklineRef.current || rssiHistory.length < 2) return;

    const svg = d3.select(sparklineRef.current);
    svg.selectAll('*').remove();

    const width = 310;
    const height = 44;
    const margin = { top: 6, right: 6, bottom: 6, left: 6 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const minVal = -100;
    const maxVal = -30;

    const xScale = d3.scaleLinear()
      .domain([0, rssiHistory.length - 1])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([innerH, 0])
      .clamp(true);

    // Area generator for soft gradient under line
    const areaGen = d3.area<{ timestamp: number; value: number }>()
      .x((_, i) => xScale(i))
      .y0(innerH)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Line generator
    const lineGen = d3.line<{ timestamp: number; value: number }>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Sparkline gradient
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'spark-fill-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    grad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', currentTier.color)
      .attr('stop-opacity', 0.35);

    grad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', currentTier.color)
      .attr('stop-opacity', 0.0);

    // Draw Area
    g.append('path')
      .datum(rssiHistory)
      .attr('d', areaGen as any)
      .attr('fill', 'url(#spark-fill-gradient)');

    // Draw Line
    g.append('path')
      .datum(rssiHistory)
      .attr('d', lineGen as any)
      .attr('fill', 'none')
      .attr('stroke', currentTier.color)
      .attr('stroke-width', 1.8)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    // Latest dot ping
    const latestIndex = rssiHistory.length - 1;
    const latestPt = rssiHistory[latestIndex];
    g.append('circle')
      .attr('cx', xScale(latestIndex))
      .attr('cy', yScale(latestPt.value))
      .attr('r', 3)
      .attr('fill', '#ffffff')
      .attr('stroke', currentTier.color)
      .attr('stroke-width', 2);

  }, [rssiHistory, currentTier]);

  // Derived telemetry metrics
  const signalQualityPercent = useMemo(() => {
    // Map -100 dBm (0%) to -30 dBm (100%)
    const pct = Math.round(((currentRssi - (-100)) / ((-30) - (-100))) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [currentRssi]);

  const linkMarginDb = useMemo(() => {
    // Distance in dB above sensitivity noise floor (-95 dBm)
    return Math.max(0, currentRssi - noiseFloor);
  }, [currentRssi]);

  const estimatedPdr = useMemo(() => {
    // Packet Delivery Ratio % approximation
    if (currentRssi >= -70) return 99.8;
    if (currentRssi >= -80) return 97.4;
    if (currentRssi >= -88) return 89.2;
    if (currentRssi >= -94) return 68.5;
    return 34.0;
  }, [currentRssi]);

  const estimatedDistanceMeters = useMemo(() => {
    // Inverse log-distance path loss estimate: d = 10 ^ ((Tx1m - RSSI) / (10 * n))
    const tx1m = -58;
    const n = 2.4;
    const ratio = (tx1m - currentRssi) / (10 * n);
    const dist = Math.pow(10, ratio);
    return parseFloat(Math.max(0.4, Math.min(45, dist)).toFixed(1));
  }, [currentRssi]);

  return (
    <div 
      id="beacon-rssi-signal-gauge-card" 
      className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-md space-y-5 text-left relative overflow-hidden transition-all duration-300"
    >
      {/* Background radial glow matching current signal tier */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-15 transition-all duration-700"
        style={{ backgroundColor: currentTier.color }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Real-Time Signal Strength (RSSI) Quality Gauge
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-sans">
            Real-time RF carrier signal quality, path loss decay, and BLE packet link margin visualized with D3.
          </p>
        </div>

        {/* Beacon Selector & Live Drift Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Beacon Selector Dropdown */}
          <div className="relative inline-block">
            <select
              value={selectedBeaconId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedBeaconId(nextId);
                const tgt = entities.find(x => x.id === nextId);
                if (onAddLog && tgt) {
                  onAddLog({
                    deviceModel: 'RSSI_TELEMETRY',
                    action: 'discovered',
                    shieldApplied: `LINKED_BEACON_SWITCHED: ${tgt.name.toUpperCase()}`,
                    distance: 0,
                    rotatedId: 'RSSI_GAUGE'
                  });
                }
              }}
              className="bg-slate-900 border border-slate-750 text-slate-200 text-[10px] font-mono rounded-lg px-2.5 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 hover:bg-slate-850 transition-colors"
            >
              {entities.map(e => (
                <option key={e.id} value={e.id}>
                  {e.isActive ? '●' : '○'} {e.name} ({e.batteryPercent}%)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Live Flutter / Drift Ticker Button */}
          <button
            type="button"
            onClick={() => setIsLiveDriftActive(!isLiveDriftActive)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isLiveDriftActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isLiveDriftActive ? 'Pause real-time RF jitter polling' : 'Resume real-time RF jitter polling'}
          >
            {isLiveDriftActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span>POLLING</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Quick Calibration Slider Toggle */}
          <button
            type="button"
            onClick={() => setShowCalibrationControls(!showCalibrationControls)}
            className={`p-1.5 rounded-lg border text-[10px] font-mono transition-colors cursor-pointer ${
              showCalibrationControls
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle RF Calibration and Zone Testing Presets"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Gauge and Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Left Column: D3 Colorful Circular Arc Gauge */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-3 rounded-xl border border-slate-850/80 bg-slate-950/50 relative">
          
          {/* Target Beacon Tag Pill */}
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${activeBeacon?.isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300">
              {activeBeacon?.name || 'Primary Beacon'}
            </span>
          </div>

          <div className="absolute top-2.5 right-3">
            <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentTier.bgBadge} ${currentTier.borderBadge} ${currentTier.textColor}`}>
              {currentTier.label.split('/')[0].trim()}
            </span>
          </div>

          {/* D3 Rendered SVG Gauge */}
          <div className="w-full flex items-center justify-center mt-3">
            <svg 
              ref={svgRef} 
              viewBox="0 0 360 210" 
              className="w-full max-w-[340px] h-auto overflow-visible select-none"
            />
          </div>

          {/* Central Digital HUD Readout */}
          <div className="flex flex-col items-center -mt-8 mb-2 z-10 text-center">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black font-mono tracking-tight ${currentTier.textColor}`}>
                {currentRssi}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                dBm
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-slate-400">
                Link Quality: <strong className="text-white font-extrabold">{signalQualityPercent}%</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                Sensitivity: <strong className="text-slate-300 font-bold">{noiseFloor} dBm</strong>
              </span>
            </div>

            <p className="text-[9px] font-mono text-slate-400 mt-1 max-w-[260px] truncate">
              {currentTier.sublabel}
            </p>
          </div>

          {/* Live History Track (Last 20 Samples) */}
          <div className="w-full pt-2 border-t border-slate-900/80 mt-1 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-2 mb-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-cyan-400" />
                Live RSSI Trend (Last 30s)
              </span>
              <span className="text-[8px] font-mono text-slate-400">
                Range: -100 to -30 dBm
              </span>
            </div>
            <div className="w-full flex items-center justify-center">
              <svg 
                ref={sparklineRef} 
                viewBox="0 0 310 44" 
                className="w-full max-w-[310px] h-11 overflow-visible"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Cards & Active RF Parameters */}
        <div className="lg:col-span-6 space-y-3.5">
          
          {/* Signal Quality Tier Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Metric 1: Link Margin */}
            <div className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/40 text-left space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                Link Margin
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  +{linkMarginDb}
                </span>
                <span className="text-[9px] font-mono text-slate-400">dB</span>
              </div>
              <span className="text-[8px] text-slate-400 font-sans block leading-tight">
                Above -95 dBm floor
              </span>
            </div>

            {/* Metric 2: Estimated PDR */}
            <div className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/40 text-left space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                Packet Delivery
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold font-mono text-cyan-400">
                  {estimatedPdr}%
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-sans block leading-tight">
                Est. BLE link success
              </span>
            </div>

            {/* Metric 3: Est. Distance */}
            <div className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/40 text-left space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                RF Distance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold font-mono text-amber-400">
                  {estimatedDistanceMeters}
                </span>
                <span className="text-[9px] font-mono text-slate-400">m</span>
              </div>
              <span className="text-[8px] text-slate-400 font-sans block leading-tight">
                Path loss inverse
              </span>
            </div>

            {/* Metric 4: Battery & Channel */}
            <div className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/40 text-left space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                BLE Channel
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold font-mono text-purple-400">
                  CH 38
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-sans block leading-tight">
                2426 MHz Adv
              </span>
            </div>
          </div>

          {/* Color Signal Quality Legend */}
          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/30 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-emerald-400" />
                RSSI Signal Quality Zones
              </span>
              <span className="text-[8px] font-mono text-slate-400">
                RFC-9402 Compliance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
              {RSSI_TIERS.map(tier => {
                const isCurrent = currentRssi >= tier.min && currentRssi <= tier.max;
                return (
                  <div 
                    key={tier.label}
                    className={`p-1.5 rounded border text-left transition-all ${
                      isCurrent 
                        ? `${tier.bgBadge} ${tier.borderBadge} ring-1 ring-white/10 scale-[1.02]` 
                        : 'bg-slate-950/40 border-slate-850/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                      <span className={`text-[8px] font-mono font-bold truncate ${isCurrent ? tier.textColor : 'text-slate-400'}`}>
                        {tier.label.split('/')[0]}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 block">
                      {tier.min} to {tier.max} dBm
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Calibration / Simulation Controls Panel */}
          {showCalibrationControls && (
            <div className="p-3.5 rounded-lg border border-cyan-500/25 bg-slate-900/60 space-y-3 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                    Interactive RF Calibration & Signal Simulation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalibrationOffset(0)}
                  className="text-[8px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Reset Offset
                </button>
              </div>

              {/* Manual RSSI Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400">Manual RSSI Offset:</span>
                  <span className="text-white font-bold">{calibrationOffset > 0 ? `+${calibrationOffset}` : calibrationOffset} dBm</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={calibrationOffset}
                  onChange={(e) => setCalibrationOffset(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Preset Buttons for Quick Testing */}
              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 block">
                  Quick Testing Zone Presets:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCalibrationOffset(-96 - baseRssi);
                    }}
                    className="px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[8px] font-mono hover:bg-rose-950/70 transition-colors cursor-pointer"
                  >
                    Critical (-96)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalibrationOffset(-78 - baseRssi);
                    }}
                    className="px-2 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[8px] font-mono hover:bg-amber-950/70 transition-colors cursor-pointer"
                  >
                    Fair (-78)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalibrationOffset(-65 - baseRssi);
                    }}
                    className="px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[8px] font-mono hover:bg-cyan-950/70 transition-colors cursor-pointer"
                  >
                    Good (-65)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalibrationOffset(-42 - baseRssi);
                    }}
                    className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[8px] font-mono hover:bg-emerald-950/70 transition-colors cursor-pointer"
                  >
                    Optimal (-42)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Hardware & Optimization Insights */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400" />
              Beacon Model: <strong className="text-slate-200">{activeBeacon?.type.toUpperCase() || 'BLE_TAG'}</strong>
            </span>
            <span className="flex items-center gap-1">
              Battery: <strong className={activeBeacon?.batteryPercent && activeBeacon.batteryPercent <= 20 ? 'text-rose-400' : 'text-emerald-400'}>{activeBeacon?.batteryPercent ?? 100}%</strong>
            </span>
            <span className="flex items-center gap-1">
              Status: <strong className={activeBeacon?.isActive ? 'text-emerald-400' : 'text-slate-400'}>{activeBeacon?.isActive ? 'ACTIVE LINK' : 'STANDBY'}</strong>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BeaconRssiGauge;
