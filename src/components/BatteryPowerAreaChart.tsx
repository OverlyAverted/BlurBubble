import React, { useState, useMemo } from 'react';
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
import { Zap, Activity, Clock, Battery, BatteryCharging, ShieldAlert, Cpu } from 'lucide-react';
import { CitizenState, RegisteredEntity } from '../types';

interface BatteryPowerAreaChartProps {
  state: CitizenState;
}

// Tactical color palette for distinct beacon layers
const BEACON_PALETTE = [
  { stroke: '#10b981', fill: '#10b981', name: 'Emerald' },   // Emerald 500
  { stroke: '#06b6d4', fill: '#06b6d4', name: 'Cyan' },      // Cyan 500
  { stroke: '#8b5cf6', fill: '#8b5cf6', name: 'Violet' },    // Violet 500
  { stroke: '#f59e0b', fill: '#f59e0b', name: 'Amber' },     // Amber 500
  { stroke: '#ec4899', fill: '#ec4899', name: 'Pink' },      // Pink 500
  { stroke: '#3b82f6', fill: '#3b82f6', name: 'Blue' },      // Blue 500
];

export const BatteryPowerAreaChart: React.FC<BatteryPowerAreaChartProps> = ({ state }) => {
  const [viewMode, setViewMode] = useState<'total' | 'breakdown'>('total');

  const registeredEntities: RegisteredEntity[] = state.registeredEntities || [];
  const activeEntities = useMemo(() => {
    return registeredEntities.filter(e => e.isActive);
  }, [registeredEntities]);

  // Generate historical hourly power consumption data over the last 6 hours
  const { chartData, metrics } = useMemo(() => {
    const points = [];
    const now = new Date();
    const range = state.rangeMeters || 12;
    const isBroadcasting = state.isBroadcasting !== false;
    const isEmergency = !!state.emergencyPrivacyActive;
    const isOptimizing = !!state.intelligentBatteryOptimization;
    const isSaver = !!state.batterySaverActive;

    // Power scaling factors
    const rangeFactor = Math.min(1.8, Math.max(0.6, range / 15));
    const emergencyMultiplier = isEmergency ? 1.85 : 1.0;

    let peakPower = 0;
    let sumPower = 0;
    let currentPower = 0;

    // 6 hours ago to Now (7 discrete hourly checkpoints: -6h, -5h, -4h, -3h, -2h, -1h, Now)
    for (let h = 6; h >= 0; h--) {
      const timePoint = new Date(now.getTime() - h * 60 * 60 * 1000);
      const label = h === 0 ? 'Now' : `-${h}h`;
      const timeStr = timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Progressive optimization factor: if optimizer or saver is active, power dropped in recent 2-3 hours
      const recencyOptimization = (isOptimizing || isSaver) 
        ? Math.max(0.55, 1 - ((6 - h) * 0.07)) 
        : 1.0;

      let totalForHour = 0;
      const pointRecord: Record<string, any> = {
        time: label,
        timestamp: timeStr,
        hourOffset: h,
      };

      if (!isBroadcasting || activeEntities.length === 0) {
        // Deep sleep / standby baseline (approx 0.08 mW - 0.15 mW quiescent current)
        const standby = parseFloat((0.08 + Math.sin(h * 1.3) * 0.02).toFixed(2));
        pointRecord['totalPower'] = standby;
        totalForHour = standby;
      } else {
        // Compute per-beacon realistic power draw in mW
        activeEntities.forEach((entity, idx) => {
          // Hardware base power: phones ~4.5mW, tags ~1.8mW, fobs ~2.2mW
          let baseDraw = 2.4;
          if (entity.type === 'phone') baseDraw = 4.2;
          else if (entity.type === 'airtag' || entity.type === 'smart_tag') baseDraw = 1.9;
          else if (entity.type === 'key_fob') baseDraw = 2.3;

          // Battery state impact: low battery triggers hardware throttle if optimizer is on
          const entityBattery = entity.batteryPercent ?? 100;
          const batteryThrottle = (isOptimizing && entityBattery < 30) ? 0.65 : 1.0;

          // Organic diurnal/advertising duty cycle variation
          const variation = Math.sin((h + idx * 2.1) * 0.8) * 0.35 + Math.cos(h * 1.1) * 0.2;
          
          let beaconPower = (baseDraw * rangeFactor * emergencyMultiplier * recencyOptimization * batteryThrottle) + variation;
          beaconPower = Math.max(0.4, parseFloat(beaconPower.toFixed(2)));

          // Key for breakdown charting
          const safeKey = `beacon_${entity.id}`;
          pointRecord[safeKey] = beaconPower;
          pointRecord[`${safeKey}_name`] = entity.name;
          totalForHour += beaconPower;
        });

        const roundedTotal = parseFloat(totalForHour.toFixed(2));
        pointRecord['totalPower'] = roundedTotal;
      }

      if (h === 0) {
        currentPower = pointRecord['totalPower'];
      }
      if (pointRecord['totalPower'] > peakPower) {
        peakPower = pointRecord['totalPower'];
      }
      sumPower += pointRecord['totalPower'];
      points.push(pointRecord);
    }

    const avgPower = parseFloat((sumPower / points.length).toFixed(2));
    // Estimate total energy expended over 6h: trapezoidal integration approximation (mWh)
    const energyExpendedMwh = parseFloat((avgPower * 6).toFixed(1));

    return {
      chartData: points,
      metrics: {
        currentPower,
        peakPower,
        avgPower,
        energyExpendedMwh,
        activeCount: activeEntities.length
      }
    };
  }, [state.rangeMeters, state.isBroadcasting, state.emergencyPrivacyActive, state.intelligentBatteryOptimization, state.batterySaverActive, activeEntities]);

  return (
    <div id="battery-power-consumption-widget" className="rounded-xl border border-slate-850 bg-slate-950/70 p-4.5 space-y-4 text-left backdrop-blur-md">
      {/* Widget Header & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Historical BLE Beacon Power Consumption
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-normal">
                Last 6 Hours
              </span>
            </h5>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Continuous RF power dissipation telemetry (mW) across active companion tags and keyfobs under RFC-9402 broadcast.
          </p>
        </div>

        {/* View Mode & Live Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aggregate Draw
            </button>
            <button
              type="button"
              onClick={() => setViewMode('breakdown')}
              disabled={activeEntities.length <= 1}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'breakdown'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title={activeEntities.length <= 1 ? 'Requires at least 2 active beacons for breakdown' : 'View per-beacon area breakdown'}
            >
              Per-Beacon ({activeEntities.length})
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Current Total Draw */}
        <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-900/40 space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
            <span>Current Draw</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white font-mono">
              {metrics.currentPower}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">mW</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 block">
            {metrics.activeCount} active beacon{metrics.activeCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Metric 2: 6h Peak Consumption */}
        <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-900/40 space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
            <span>6h Peak Draw</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-200 font-mono">
              {metrics.peakPower}
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">mW</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 block">
            {state.emergencyPrivacyActive ? 'Peak during emergency' : 'Standard peak'}
          </span>
        </div>

        {/* Metric 3: 6h Average */}
        <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-900/40 space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
            <span>6h Average</span>
            <Clock className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-200 font-mono">
              {metrics.avgPower}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">mW</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 block">
            Avg across active interval
          </span>
        </div>

        {/* Metric 4: Total Energy Expended */}
        <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-900/40 space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
            <span>Total Expended</span>
            <BatteryCharging className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-200 font-mono">
              {metrics.energyExpendedMwh}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">mWh</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 block">
            Integrated 6h consumption
          </span>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="w-full h-[220px] bg-slate-950/80 rounded-xl border border-slate-850 p-2 relative overflow-hidden">
        {/* Subtle tactical corner grid marks */}
        <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-700 select-none pointer-events-none">
          RF_POWER_MW // 6H_LOG
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-mono text-slate-500 select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          SAMPLING: 1-HR CADENCE
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 22, right: 12, left: -22, bottom: 4 }}
          >
            <defs>
              {/* Gradient for aggregate total power */}
              <linearGradient id="totalPowerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Per-beacon gradients */}
              {activeEntities.map((entity, i) => {
                const palette = BEACON_PALETTE[i % BEACON_PALETTE.length];
                return (
                  <linearGradient key={`grad_${entity.id}`} id={`grad_${entity.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.fill} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={palette.fill} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.65} />

            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={{ stroke: '#1e293b' }}
              tick={{ fill: '#64748b', fontFamily: 'monospace' }}
            />

            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              unit=" mW"
              tick={{ fill: '#64748b', fontFamily: 'monospace' }}
              domain={[0, 'auto']}
            />

            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const dataPoint = payload[0].payload;
                return (
                  <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs space-y-2 min-w-[170px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {label} ({dataPoint.timestamp})
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {dataPoint.totalPower} mW
                      </span>
                    </div>

                    <div className="space-y-1">
                      {viewMode === 'total' ? (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Aggregate Beacon Draw:
                          </span>
                          <span className="font-bold text-emerald-300">{dataPoint.totalPower} mW</span>
                        </div>
                      ) : (
                        activeEntities.map((entity, i) => {
                          const palette = BEACON_PALETTE[i % BEACON_PALETTE.length];
                          const beaconVal = dataPoint[`beacon_${entity.id}`] || 0;
                          return (
                            <div key={entity.id} className="flex items-center justify-between text-[10px] gap-2">
                              <span className="text-slate-400 flex items-center gap-1.5 truncate max-w-[120px]">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: palette.stroke }}></span>
                                {entity.name}:
                              </span>
                              <span className="font-bold text-slate-200 shrink-0">{beaconVal} mW</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="text-[8px] text-slate-500 border-t border-slate-900 pt-1 flex justify-between">
                      <span>Status: {state.isBroadcasting ? 'Broadcasting' : 'Standby'}</span>
                      <span>Range: {state.rangeMeters || 12}m</span>
                    </div>
                  </div>
                );
              }}
            />

            {viewMode === 'total' ? (
              <Area 
                type="monotone" 
                dataKey="totalPower" 
                name="Total Power (mW)"
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#totalPowerGradient)" 
                activeDot={{ r: 4, fill: '#10b981', stroke: '#020617', strokeWidth: 2 }}
              />
            ) : (
              activeEntities.map((entity, i) => {
                const palette = BEACON_PALETTE[i % BEACON_PALETTE.length];
                const dataKey = `beacon_${entity.id}`;
                return (
                  <Area
                    key={entity.id}
                    type="monotone"
                    stackId="beacons"
                    dataKey={dataKey}
                    name={entity.name}
                    stroke={palette.stroke}
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill={`url(#grad_${entity.id})`}
                    activeDot={{ r: 3.5, fill: palette.stroke, stroke: '#020617', strokeWidth: 1.5 }}
                  />
                );
              })
            )}

            {viewMode === 'breakdown' && (
              <Legend 
                verticalAlign="bottom"
                height={26}
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '4px' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Informative Footer Bar */}
      <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>PMIC: TPS62740 Synchronous Step-Down Buck Converter (95% η)</span>
        </div>
        <div className="flex items-center gap-2">
          {state.intelligentBatteryOptimization && (
            <span className="text-emerald-400 font-bold">
              ✓ Dynamic Throttle Applied (-35% peak draw)
            </span>
          )}
          {state.emergencyPrivacyActive && (
            <span className="text-rose-400 font-bold animate-pulse">
              ⚠️ Emergency RF Boost Engaged
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryPowerAreaChart;
