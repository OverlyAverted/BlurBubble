import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Radio, 
  Play, 
  Pause, 
  RefreshCw, 
  Navigation, 
  Compass, 
  Eye, 
  Info, 
  Sliders, 
  Tv, 
  Activity, 
  Zap, 
  Signal,
  MapPin,
  Lock,
  Unlock,
  AlertTriangle,
  X
} from 'lucide-react';
import { CitizenState } from '../types';

interface D3SignalMapProps {
  state: CitizenState;
  onChange: (updated: CitizenState) => void;
  onAddLog?: (log: any) => void;
}

interface VisualNode {
  id: string;
  name: string;
  type: string;
  batteryPercent: number;
  isActive: boolean;
  x: number;
  y: number;
  initialDistance: number; // in meters
  angle: number; // in radians
}

export default function D3SignalMap({ state, onChange, onAddLog }: D3SignalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });
  const [isDrifting, setIsDrifting] = useState(true);
  const [noiseFloor, setNoiseFloor] = useState(-95); // dBm
  const [radarSpin, setRadarSpin] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);
  const [lastPing, setLastPing] = useState<{ x: number; y: number } | null>(null);

  // Maintain internal local coordinates for the tags
  const [nodes, setNodes] = useState<VisualNode[]>([]);

  // Initialize nodes based on state.registeredEntities
  useEffect(() => {
    const entities = state.registeredEntities || [];
    setNodes(prev => {
      // Keep existing positions if possible, update names/batteries/status
      return entities.map((entity, idx) => {
        const existing = prev.find(n => n.id === entity.id);
        if (existing) {
          return {
            ...existing,
            name: entity.name,
            batteryPercent: entity.batteryPercent,
            isActive: entity.isActive
          };
        }

        // Generate coordinates around center
        const angle = (idx * (2 * Math.PI)) / Math.max(entities.length, 1) + 0.5;
        // Map distance randomly between 4 and 18 meters
        const initialDistance = 5 + idx * 3 + Math.random() * 2;
        return {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          batteryPercent: entity.batteryPercent,
          isActive: entity.isActive,
          x: 0, // Will be set relative to center
          y: 0,
          initialDistance,
          angle
        };
      });
    });
  }, [state.registeredEntities]);

  // Handle ResizeObserver to dynamically resize the canvas container
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Ensure height is reasonable
      const targetHeight = Math.max(height, 350);
      setDimensions({ width: Math.max(width, 300), height: targetHeight });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Live drift simulation loop
  useEffect(() => {
    if (!isDrifting) return;

    const timer = setInterval(() => {
      setNodes(prev => 
        prev.map(node => {
          if (!node.isActive) return node;
          // Slowly drift angle and distance slightly
          const dAngle = (Math.random() - 0.5) * 0.04;
          const dDistance = (Math.random() - 0.5) * 0.2;
          
          let newDist = node.initialDistance + dDistance;
          // Constrain distance to 2m - 22m
          if (newDist < 2) newDist = 2;
          if (newDist > 22) newDist = 22;

          return {
            ...node,
            angle: node.angle + dAngle,
            initialDistance: newDist
          };
        })
      );
    }, 150);

    return () => clearInterval(timer);
  }, [isDrifting]);

  // D3 Render & Interaction Loop
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear all old drawings

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Grid Scale mapping meters to pixels (e.g. 24 meters is our max radius)
    const maxRadiusMeters = 24;
    const radiusScale = d3.scaleLinear()
      .domain([0, maxRadiusMeters])
      .range([0, Math.min(centerX, centerY) - 25]);

    // 1. Defs for gradients & filters
    const defs = svg.append('defs');

    // Radar Sweep Gradient
    const sweepGrad = defs.append('linearGradient')
      .attr('id', 'radar-sweep-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    sweepGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(16, 185, 129, 0.15)');
    sweepGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(16, 185, 129, 0.0)');

    // Active protection zone radial gradient
    const shieldGrad = defs.append('radialGradient')
      .attr('id', 'shield-protection-grad')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    shieldGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', state.isBroadcasting ? 'rgba(16, 185, 129, 0.28)' : 'rgba(30, 41, 59, 0.3)');
    shieldGrad.append('stop')
      .attr('offset', '60%')
      .attr('stop-color', state.isBroadcasting ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.08)');
    shieldGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(15, 23, 42, 0)');

    // Glowing filter for text and markers
    const glowFilter = defs.append('filter')
      .attr('id', 'emerald-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 2. Draw radar base grids & ticks
    const gridGroup = svg.append('g').attr('id', 'radar-grid');

    // Compass axes
    gridGroup.append('line')
      .attr('x1', 20)
      .attr('y1', centerY)
      .attr('x2', width - 20)
      .attr('y2', centerY)
      .attr('stroke', 'rgba(51, 65, 85, 0.3)')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '3,3');

    gridGroup.append('line')
      .attr('x1', centerX)
      .attr('y1', 20)
      .attr('x2', centerX)
      .attr('y2', height - 20)
      .attr('stroke', 'rgba(51, 65, 85, 0.3)')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '3,3');

    // Concentric Rings for distances (5m, 10m, 15m, 20m)
    const distanceRings = [5, 10, 15, 20];
    distanceRings.forEach(dist => {
      const pxRad = radiusScale(dist);
      // Main circle outline
      gridGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', pxRad)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(51, 65, 85, 0.4)')
        .attr('stroke-width', '1');

      // Distance tag labels
      gridGroup.append('text')
        .attr('x', centerX + 5)
        .attr('y', centerY - pxRad + 12)
        .attr('fill', '#64748b')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${dist}M`);
    });

    // 3. Draw active privacy shield protection overlay
    const shieldRadiusMeters = state.rangeMeters || 12;
    const shieldRadiusPx = radiusScale(shieldRadiusMeters);

    const shieldZone = svg.append('g').attr('id', 'shield-protection-overlay');
    shieldZone.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', shieldRadiusPx)
      .attr('fill', 'url(#shield-protection-grad)')
      .attr('stroke', state.isBroadcasting ? 'rgba(16, 185, 129, 0.35)' : 'rgba(71, 85, 105, 0.35)')
      .attr('stroke-width', state.isBroadcasting ? '1.5' : '1')
      .attr('stroke-dasharray', state.isBroadcasting ? 'none' : '4,4')
      .attr('class', state.isBroadcasting ? 'transition-all duration-300' : '');

    // Outer protection label
    if (state.isBroadcasting) {
      shieldZone.append('text')
        .attr('x', centerX)
        .attr('y', centerY - shieldRadiusPx - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#34d399')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'extrabold')
        .attr('filter', 'url(#emerald-glow)')
        .text(`ACTIVE SHIELD BOUNDARY (${shieldRadiusMeters}M)`);
    }

    // 4. Radar sweep line & wedge animation
    if (radarSpin && state.isBroadcasting) {
      const sweepGroup = svg.append('g')
        .attr('id', 'radar-sweeper')
        .attr('transform', `translate(${centerX}, ${centerY})`);

      // Draw a pie-wedge arc for the radar sweep fade-out
      const arc = d3.arc<any, d3.DefaultArcObject>()
        .innerRadius(0)
        .outerRadius(radiusScale(maxRadiusMeters))
        .startAngle(0)
        .endAngle(Math.PI / 4); // 45 degree wedge

      sweepGroup.append('path')
        .attr('d', arc as any)
        .attr('fill', 'url(#radar-sweep-gradient)')
        .attr('transform', 'rotate(-45)');

      // Leading beam line
      sweepGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -radiusScale(maxRadiusMeters))
        .attr('stroke', '#34d399')
        .attr('stroke-width', '1.5')
        .attr('opacity', '0.8')
        .attr('filter', 'url(#emerald-glow)');

      // Rotate infinite transition
      let angleDegrees = 0;
      const spinTimer = d3.timer(() => {
        if (!radarSpin) {
          spinTimer.stop();
          return;
        }
        angleDegrees = (angleDegrees + 1.2) % 360;
        sweepGroup.attr('transform', `translate(${centerX}, ${centerY}) rotate(${angleDegrees})`);
      });
    }

    // 5. User (Main Phone/Beacon Center) Node
    const centerNodeGroup = svg.append('g')
      .attr('id', 'user-center-node')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Outer radar waves
    if (state.isBroadcasting) {
      centerNodeGroup.append('circle')
        .attr('r', 25)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(16, 185, 129, 0.4)')
        .attr('stroke-width', '1')
        .attr('class', 'animate-pulse')
        .style('animation-duration', '2s');
    }

    centerNodeGroup.append('circle')
      .attr('r', 12)
      .attr('fill', state.isBroadcasting ? '#064e3b' : '#1e293b')
      .attr('stroke', state.isBroadcasting ? '#34d399' : '#475569')
      .attr('stroke-width', '2')
      .attr('filter', state.isBroadcasting ? 'url(#emerald-glow)' : 'none');

    // Small glowing core
    centerNodeGroup.append('circle')
      .attr('r', 4)
      .attr('fill', state.isBroadcasting ? '#10b981' : '#64748b')
      .attr('class', state.isBroadcasting ? 'animate-ping' : '');

    // Label for center
    centerNodeGroup.append('text')
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8fafc')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'extrabold')
      .text('SHIELD HUB (YOU)');

    // 6. Draw companion device nodes & paths connecting to center
    const calculatedNodes = nodes.map(node => {
      // Calculate (x, y) relative to center using polar coordinates
      const x = centerX + radiusScale(node.initialDistance) * Math.cos(node.angle);
      const y = centerY + radiusScale(node.initialDistance) * Math.sin(node.angle);
      return { ...node, x, y };
    });

    const nodesGroup = svg.append('g').attr('id', 'companion-nodes');

    calculatedNodes.forEach(node => {
      const isWithinShield = node.initialDistance <= shieldRadiusMeters;
      const isLowBattery = node.batteryPercent <= (state.lowBatteryThreshold || 10);

      // Path connecting device to Center
      const link = nodesGroup.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', node.x)
        .attr('y2', node.y)
        .attr('stroke', !node.isActive 
          ? 'rgba(100, 116, 139, 0.15)' 
          : isWithinShield 
            ? 'rgba(52, 211, 153, 0.35)' 
            : 'rgba(230, 140, 10, 0.25)'
        )
        .attr('stroke-width', isWithinShield ? '1.5' : '1')
        .attr('stroke-dasharray', isWithinShield ? 'none' : '4,4');

      const nodeElem = nodesGroup.append('g')
        .attr('id', `node-${node.id}`)
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .attr('class', 'cursor-grab active:cursor-grabbing');

      // Node background anchor area (invisible for easier hover/click target)
      nodeElem.append('circle')
        .attr('r', 20)
        .attr('fill', 'transparent')
        .on('mouseover', () => {
          setHoveredNode(node);
        })
        .on('mouseleave', () => {
          setHoveredNode(null);
        })
        .on('click', (event) => {
          event.stopPropagation();
          setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
        });

      // Battery ring/glow representation
      let ringColor = 'rgba(71, 85, 105, 0.6)';
      if (node.isActive) {
        ringColor = isLowBattery 
          ? 'rgba(244, 63, 94, 0.8)' // Rose red
          : isWithinShield 
            ? 'rgba(52, 211, 153, 0.8)' // Emerald
            : 'rgba(245, 158, 11, 0.8)'; // Amber
      }

      nodeElem.append('circle')
        .attr('r', 10)
        .attr('fill', '#020617')
        .attr('stroke', ringColor)
        .attr('stroke-width', node.isActive ? '2.5' : '1.5')
        .attr('filter', node.isActive && !isLowBattery ? 'url(#emerald-glow)' : 'none')
        .style('stroke-dasharray', isLowBattery ? '3,3' : 'none');

      // Inner icon symbol or text representation based on device type
      let symbolText = '🏷️';
      if (node.type === 'phone') symbolText = '📱';
      else if (node.type === 'smart_tag' || node.type === 'airtag' || node.type === 'galaxy_tag') symbolText = '🏷️';
      else if (node.type === 'key_fob') symbolText = '🔑';

      nodeElem.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 3)
        .attr('font-size', '9px')
        .text(symbolText);

      // Warning circle if critical battery
      if (isLowBattery && node.isActive) {
        nodeElem.append('circle')
          .attr('cx', 8)
          .attr('cy', -8)
          .attr('r', 4.5)
          .attr('fill', '#f43f5e')
          .attr('stroke', '#020617')
          .attr('stroke-width', '1');

        nodeElem.append('text')
          .attr('cx', 8)
          .attr('y', -5.5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '6px')
          .attr('font-weight', 'extrabold')
          .text('!');
      }

      // Floating Name Label next to node
      const isSelected = selectedNodeId === node.id;
      const labelColor = isSelected ? '#34d399' : '#e2e8f0';
      nodeElem.append('text')
        .attr('x', 14)
        .attr('y', 3)
        .attr('fill', labelColor)
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', isSelected ? 'extrabold' : 'bold')
        .text(node.name.length > 15 ? `${node.name.slice(0, 13)}...` : node.name);

      // Show real-time distance and computed dBm value
      const computedDbm = Math.round(-35 - (20 * Math.log10(node.initialDistance)));
      nodeElem.append('text')
        .attr('x', 14)
        .attr('y', 12)
        .attr('fill', '#64748b')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .text(`${node.initialDistance.toFixed(1)}m | ${computedDbm} dBm`);

      // D3 Drag Event Attachment
      const dragBehavior = d3.drag<any, any>()
        .on('start', function() {
          d3.select(this).raise().attr('cursor', 'grabbing');
          setIsDrifting(false); // Stop live drift temporarily while dragging
        })
        .on('drag', function(event) {
          // Compute new polar coordinates relative to center
          const mouseX = event.x;
          const mouseY = event.y;
          const dx = mouseX - centerX;
          const dy = mouseY - centerY;
          const distPx = Math.sqrt(dx*dx + dy*dy);
          
          // Reverse scaling from pixels to meters
          let distanceMeters = radiusScale.invert(distPx);
          if (distanceMeters < 1) distanceMeters = 1;
          if (distanceMeters > maxRadiusMeters) distanceMeters = maxRadiusMeters;

          const angle = Math.atan2(dy, dx);

          // Update this node's coordinate in the array
          setNodes(prev => prev.map(n => {
            if (n.id === node.id) {
              return {
                ...n,
                initialDistance: distanceMeters,
                angle: angle
              };
            }
            return n;
          }));
        })
        .on('end', function() {
          d3.select(this).attr('cursor', 'grab');
          // Dispatch a telemetry log update on drag finish!
          if (onAddLog) {
            onAddLog({
              deviceModel: node.name,
              action: 'discovered',
              shieldApplied: `COORDINATE_RECALIBRATED: ${node.initialDistance.toFixed(1)}M`,
              distance: Math.round(node.initialDistance),
              rotatedId: 'D3_SPATIAL_GPS'
            });
          }
        });

      // Attach dragging behavior to node anchor circle
      nodeElem.call(dragBehavior as any);
    });

  }, [dimensions, nodes, state.isBroadcasting, state.rangeMeters, radarSpin, selectedNodeId, state.lowBatteryThreshold]);

  // Handle map click to emit an interactive "sonar ping pulse ripple" at that spot!
  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setLastPing({ x, y });

    // Render ripple on the SVG directly
    const svg = d3.select(svgRef.current);
    const ripple = svg.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 1)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', '2')
      .attr('opacity', '1')
      .style('pointer-events', 'none');

    ripple.transition()
      .duration(900)
      .ease(d3.easeQuadOut)
      .attr('r', 80)
      .attr('opacity', '0')
      .attr('stroke-width', '0.5')
      .remove();

    if (onAddLog) {
      onAddLog({
        deviceModel: 'SONAR_PING_EMITTER',
        action: 'censored',
        shieldApplied: `LOCALIZED_GEOLOCATION_PING_ABSORBED_XY(${Math.round(x)},${Math.round(y)})`,
        distance: 0,
        rotatedId: 'SONAR_PULSE'
      });
    }
  };

  // Find currently selected node details
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div id="d3-realtime-signal-map-widget" className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Title Bar */}
      <div className="bg-slate-900 border-b border-slate-850/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 shrink-0">
            <span 
              onClick={() => onChange({ ...state, showSignalMap: false })}
              className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors cursor-pointer" 
              title="Close" 
            />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono uppercase pl-2">D3.js Spatial Signal & Compliant Node Map</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNodes(prev => prev.map(n => ({ ...n, initialDistance: 5 + Math.random() * 12 })))}
            className="text-slate-400 hover:text-white transition-colors text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/65 border border-slate-800 flex items-center gap-1 cursor-pointer"
            title="Recalibrate and disperse all devices"
          >
            <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
            Disperse Nodes
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, showSignalMap: false })}
            className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/65 border border-slate-800"
            title="Close Window"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-900">
        {/* Left Column: Interactive D3 Canvas (8/12 width) */}
        <div className="lg:col-span-8 p-4 relative" ref={containerRef}>
          {/* Instructions banner */}
          <div className="absolute top-6 left-6 z-10 pointer-events-none bg-slate-950/80 backdrop-blur-sm border border-slate-900 px-3 py-1.5 rounded-xl space-y-0.5 text-left">
            <div className="text-[9px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
              D3 Spatial Coordinates
            </div>
            <p className="text-[8px] text-slate-400 font-sans">
              Drag node badges to recalibrate distances. Click empty canvas to pulse sonar ping.
            </p>
          </div>

          {/* D3 Canvas container */}
          <div className="w-full h-[350px] bg-slate-950/30 rounded-xl border border-slate-900/50 relative overflow-hidden">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              onClick={handleMapClick}
              className="w-full h-full block"
            />
          </div>
        </div>

        {/* Right Column: Signal Telemetry, Status & Drag Logs (4/12 width) */}
        <div className="lg:col-span-4 p-5 bg-slate-900/10 border-t lg:border-t-0 lg:border-l border-slate-900 text-left flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-850 pb-3 space-y-1">
              <span className="text-[9px] font-extrabold text-emerald-400 font-mono uppercase tracking-widest block">
                SIGNAL SPECTROMETER
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Live Protection Matrix
              </h4>
              <p className="text-[10px] text-slate-400 font-sans leading-normal">
                Visualizing physical proximity boundaries. When broadcasting is active, devices within the emerald glow inherit optimal anonymized compliance masks.
              </p>
            </div>

            {/* Selection HUD details */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider">
                  Target Inspection
                </span>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-extrabold tracking-widest ${
                  selectedNode 
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' 
                    : 'text-slate-600 bg-slate-900/40 border-slate-850'
                }`}>
                  {selectedNode ? 'SELECTED' : 'SELECT NODE'}
                </span>
              </div>

              {selectedNode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-extrabold truncate max-w-[170px]" title={selectedNode.name}>
                      {selectedNode.name}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono uppercase">
                      ({selectedNode.type})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 border-t border-slate-900/80 pt-2">
                    <div>
                      <span className="block text-slate-550 uppercase text-[8px]">Distance:</span>
                      <span className="text-white font-bold">{selectedNode.initialDistance.toFixed(2)}m</span>
                    </div>
                    <div>
                      <span className="block text-slate-550 uppercase text-[8px]">Battery Life:</span>
                      <span className={`font-bold ${selectedNode.batteryPercent <= (state.lowBatteryThreshold || 10) ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                        {selectedNode.batteryPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-550 uppercase text-[8px]">Signal Power:</span>
                      <span className="text-emerald-400 font-bold">
                        {Math.round(-35 - (20 * Math.log10(selectedNode.initialDistance)))} dBm
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-550 uppercase text-[8px]">Shield Status:</span>
                      <span className={`font-extrabold uppercase ${
                        selectedNode.initialDistance <= (state.rangeMeters || 12) && state.isBroadcasting
                          ? 'text-emerald-400'
                          : 'text-rose-500'
                      }`}>
                        {selectedNode.initialDistance <= (state.rangeMeters || 12) && state.isBroadcasting
                          ? '🛡️ SHIELDED'
                          : '⚠️ EXPOSED'
                      }
                      </span>
                    </div>
                  </div>
                </div>
              ) : hoveredNode ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-white font-bold truncate">
                    {hoveredNode.name}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Distance: {hoveredNode.initialDistance.toFixed(1)}m | Battery: {hoveredNode.batteryPercent}%
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  Hover or click on any smart tag on the spatial radar to inspect its signal telemetry details.
                </p>
              )}
            </div>
          </div>

          {/* Spectrometer Controls */}
          <div className="space-y-3 pt-3 border-t border-slate-900">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-500" />
                Live drift simulation:
              </span>
              <button
                type="button"
                onClick={() => setIsDrifting(!isDrifting)}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border transition cursor-pointer ${
                  isDrifting 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {isDrifting ? 'SIMULATE' : 'PAUSED'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-500" />
                Radar sweep hand:
              </span>
              <button
                type="button"
                onClick={() => setRadarSpin(!radarSpin)}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border transition cursor-pointer ${
                  radarSpin 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {radarSpin ? 'SPINNING' : 'STOPPED'}
              </button>
            </div>

            {/* Legend guide */}
            <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60 flex flex-wrap gap-x-3 gap-y-1.5 text-[8px] font-mono">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Shielded
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Exposed/Passive
              </div>
              <div className="flex items-center gap-1 text-rose-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Battery Alert
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Inactive tag
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
