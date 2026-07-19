import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Map, 
  MapPin, 
  Navigation, 
  Compass, 
  AlertTriangle, 
  Radio, 
  Shield, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Plus, 
  Locate, 
  Maximize2, 
  Sliders, 
  Eye, 
  Info,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { CitizenState } from '../types';

interface PrivacyThreatMapProps {
  citizenState: CitizenState;
  onChange: (updated: CitizenState) => void;
  addLog?: (log: any) => void;
}

interface MapNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'user' | 'community' | 'camera' | 'drone' | 'sensor';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  radius: number;
  strength?: number;
  isCompliant: boolean;
  battery?: number;
  details?: string;
  ipAddress?: string;
}

interface MapLink extends d3.SimulationLinkDatum<MapNode> {
  source: string | MapNode;
  target: string | MapNode;
  type: 'compliance' | 'threat';
}

export default function PrivacyThreatMap({ citizenState, onChange, addLog }: PrivacyThreatMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<MapNode, MapLink> | null>(null);

  // Map Controls & States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 55.9486, lng: -3.1999 }); // Edinburgh Waverley reference
  const [usingRealGPS, setUsingRealGPS] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [mapScale, setMapScale] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'community' | 'threat'>('all');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  
  // Interactive Placement state
  const [placementMode, setPlacementMode] = useState<'none' | 'beacon' | 'threat'>('none');

  // Core Map Node Datastore
  const [nodes, setNodes] = useState<MapNode[]>([
    {
      id: 'node-user',
      name: 'My BlurBubble Beacon (You)',
      type: 'user',
      x: 250,
      y: 180,
      radius: 16,
      isCompliant: true,
      battery: 92,
      details: 'Active primary opt-out cell. Emitting compliant ZKP hashes.',
      ipAddress: '10.0.8.2'
    },
    {
      id: 'node-com-1',
      name: 'Community Beacon #140',
      type: 'community',
      x: 120,
      y: 100,
      radius: 12,
      isCompliant: true,
      battery: 84,
      details: 'Active wearable pocket tag. Sharing common compliance data.',
      ipAddress: '10.0.8.45'
    },
    {
      id: 'node-com-2',
      name: 'Community Beacon #281',
      type: 'community',
      x: 380,
      y: 220,
      radius: 12,
      isCompliant: true,
      battery: 71,
      details: 'Fixed retail window badge. Broadcasting RFC-9402 opt-out.',
      ipAddress: '10.0.8.109'
    },
    {
      id: 'node-com-3',
      name: 'Community Beacon #094',
      type: 'community',
      x: 210,
      y: 280,
      radius: 12,
      isCompliant: true,
      battery: 59,
      details: 'Tactical backpack shield. Actively deflecting local CCTV scan.',
      ipAddress: '10.0.8.34'
    },
    {
      id: 'node-cam-1',
      name: 'Street Dome CCTV #09',
      type: 'camera',
      x: 100,
      y: 130,
      radius: 10,
      isCompliant: true, // within Community 1 range
      details: 'Corporate dome hardware. Redacting biometrics on fly via ZKP.',
      ipAddress: '192.168.1.55'
    },
    {
      id: 'node-cam-2',
      name: 'Retail AI Facerec Rig',
      type: 'camera',
      x: 350,
      y: 80,
      radius: 10,
      isCompliant: false, // out of range
      details: 'Unregulated store window biometric scanner. Capturing raw facial feeds.',
      ipAddress: '192.168.1.12'
    },
    {
      id: 'node-drone-1',
      name: 'Autonomous Traffic Drone',
      type: 'drone',
      x: 440,
      y: 140,
      radius: 10,
      isCompliant: false, // out of range
      details: 'Quadcopter tracker. Analyzing dense crowd movement metrics.',
      ipAddress: '192.168.4.11'
    },
    {
      id: 'node-sensor-1',
      name: 'Decentralized Audio Crawler',
      type: 'sensor',
      x: 290,
      y: 190,
      radius: 8,
      isCompliant: true, // within User range
      details: 'Smart mic array auditing high frequency compliance bounds.',
      ipAddress: '10.0.12.89'
    }
  ]);

  // Request live geolocation
  const triggerGPSLocate = () => {
    if (!navigator.geolocation) {
      if (addLog) addLog({ id: `gps-err-${Date.now()}`, type: 'system', name: 'GPS Unavailable', message: 'Geolocation not supported by this browser.', timestamp: new Date().toLocaleTimeString() });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: parseFloat(latitude.toFixed(5)), lng: parseFloat(longitude.toFixed(5)) });
        setUsingRealGPS(true);
        setGpsLoading(false);
        if (addLog) {
          addLog({
            id: `gps-sync-${Date.now()}`,
            type: 'shield',
            name: 'GPS Telemetry Synced',
            message: `Locked onto coordinates: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°W. Setting tactical map origin.`,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      },
      (err) => {
        setGpsLoading(false);
        setUsingRealGPS(false);
        if (addLog) {
          addLog({
            id: `gps-fail-${Date.now()}`,
            type: 'system',
            name: 'GPS Link Failed',
            message: `Could not acquire lock: ${err.message}. Using backup tactical coordinates.`,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Seed coordinates once on start or if they want real GPS
  useEffect(() => {
    // Initial locate trigger
    if (navigator.geolocation) {
      triggerGPSLocate();
    }
  }, []);

  // Recalculate which cameras / threat sensors are "compliant" based on their proximity to beacons
  useEffect(() => {
    const shieldRange = citizenState.rangeMeters || 12;
    // Conversion factor from meters to map coordinate points (let's say 1m = 8.5 points)
    const pointsPerMeter = 8.5;
    const userRangePoints = shieldRange * pointsPerMeter;
    const communityRangePoints = 15 * pointsPerMeter; // Community beacons default to 15m range

    setNodes(prevNodes => {
      const userNode = prevNodes.find(n => n.id === 'node-user');
      const communityBeacons = prevNodes.filter(n => n.type === 'community' || n.type === 'user');

      return prevNodes.map(node => {
        // user and community nodes are always compliant
        if (node.type === 'user' || node.type === 'community') {
          return node;
        }

        // Check if this threat node is close to ANY active beacon
        let isSafe = false;
        for (const beacon of communityBeacons) {
          if (!beacon.x || !beacon.y || !node.x || !node.y) continue;
          const dx = node.x - beacon.x;
          const dy = node.y - beacon.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxRange = beacon.type === 'user' ? userRangePoints : communityRangePoints;
          if (dist <= maxRange) {
            isSafe = true;
            break;
          }
        }

        if (node.isCompliant !== isSafe) {
          return { ...node, isCompliant: isSafe };
        }
        return node;
      });
    });
  }, [citizenState.rangeMeters, nodes.map(n => `${n.id}:${n.x}:${n.y}`).join(',')]);

  // Main D3 force simulation loop
  useEffect(() => {
    if (!svgRef.current) return;

    // Filter nodes according to the UI selection
    let filteredNodes = [...nodes];
    if (filterType === 'community') {
      filteredNodes = nodes.filter(n => n.type === 'user' || n.type === 'community');
    } else if (filterType === 'threat') {
      filteredNodes = nodes.filter(n => n.type !== 'user' && n.type !== 'community');
    }

    // Build lists of automatic compliance link connections
    const links: MapLink[] = [];
    const beacons = filteredNodes.filter(n => n.type === 'user' || n.type === 'community');
    const targets = filteredNodes.filter(n => n.type !== 'user' && n.type !== 'community');

    const pointsPerMeter = 8.5;
    targets.forEach(tgt => {
      beacons.forEach(b => {
        if (!b.x || !b.y || !tgt.x || !tgt.y) return;
        const dx = tgt.x - b.x;
        const dy = tgt.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRange = (b.type === 'user' ? (citizenState.rangeMeters || 12) : 15) * pointsPerMeter;

        if (dist <= maxRange) {
          links.push({
            source: b.id,
            target: tgt.id,
            type: 'compliance'
          });
        }
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a responsive container group that supports zoom and pan
    const mapGroup = svg.append('g').attr('id', 'd3-map-contents');

    // Create standard D3 zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
        setMapScale(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Grid lines pattern (background grid)
    if (showGridLines) {
      const defs = svg.append('defs');
      const pattern = defs.append('pattern')
        .attr('id', 'threat-grid-pattern')
        .attr('width', '40')
        .attr('height', '40')
        .attr('patternUnits', 'userSpaceOnUse');

      pattern.append('path')
        .attr('d', 'M 40 0 L 0 0 0 40')
        .attr('fill', 'none')
        .attr('stroke', 'rgba(51, 65, 85, 0.15)')
        .attr('stroke-width', '1');

      mapGroup.append('rect')
        .attr('width', '2000')
        .attr('height', '2000')
        .attr('x', '-1000')
        .attr('y', '-1000')
        .attr('fill', 'url(#threat-grid-pattern)')
        .lower();
    }

    // Set up D3 Force Simulation
    const simulation = d3.forceSimulation<MapNode>(filteredNodes)
      .force('charge', d3.forceManyBody().strength(-140))
      .force('center', d3.forceCenter(250, 180))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius * 2.2))
      .velocityDecay(0.4)
      .alphaMin(0.01);

    simulationRef.current = simulation;

    // Draw connection links
    const linkSelection = mapGroup.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#34d399')
      .attr('stroke-width', '1.5')
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', '0.65')
      .attr('class', 'compliance-line');

    // Draw beacon active geofence bubble circles
    const bubblesGroup = mapGroup.append('g').attr('class', 'geofence-bubbles-group');

    const updateBubbles = () => {
      const activeBeacons = filteredNodes.filter(n => n.type === 'user' || n.type === 'community');
      
      const bubbles = bubblesGroup.selectAll('g.geofence-bubble')
        .data(activeBeacons, (d: any) => d.id);

      bubbles.exit().remove();

      const bubbleEnter = bubbles.enter()
        .append('g')
        .attr('class', 'geofence-bubble');

      // Core outer pulsing range bubble
      bubbleEnter.append('circle')
        .attr('r', (d: any) => {
          const limitRange = d.type === 'user' ? (citizenState.rangeMeters || 12) : 15;
          return limitRange * pointsPerMeter;
        })
        .attr('fill', 'rgba(16, 185, 129, 0.035)')
        .attr('stroke', '#10b981')
        .attr('stroke-width', '1.5')
        .attr('stroke-dasharray', (d: any) => d.type === 'user' ? '4 3' : '2 2')
        .attr('class', 'outer-boundary')
        .style('transform-origin', 'center');

      // Inner safe core
      bubbleEnter.append('circle')
        .attr('r', '24')
        .attr('fill', 'rgba(16, 185, 129, 0.045)')
        .attr('stroke', 'rgba(16, 185, 129, 0.15)')
        .attr('stroke-width', '1');

      // Merge & Update positions
      const bubbleMerge = bubbles.merge(bubbleEnter as any);
      bubbleMerge.select('circle.outer-boundary')
        .attr('r', (d: any) => {
          const limitRange = d.type === 'user' ? (citizenState.rangeMeters || 12) : 15;
          return limitRange * pointsPerMeter;
        });
    };

    updateBubbles();

    // Draw Node Groups
    const nodesGroup = mapGroup.append('g').attr('class', 'nodes-group');

    const nodeSelection = nodesGroup.selectAll('g.node')
      .data(filteredNodes, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .call(d3.drag<SVGGElement, MapNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any);

    // Append beautiful tactical rings around nodes
    nodeSelection.append('circle')
      .attr('r', (d) => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.type === 'user') return 'rgba(52, 211, 153, 0.2)';
        if (d.type === 'community') return 'rgba(16, 185, 129, 0.15)';
        return d.isCompliant ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.15)';
      })
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '2 2')
      .attr('class', 'tactical-ring');

    // Draw main colored node circles
    nodeSelection.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'user') return '#10b981';
        if (d.type === 'community') return '#059669';
        return d.isCompliant ? '#10b981' : '#ef4444';
      })
      .attr('stroke', '#020617')
      .attr('stroke-width', '2')
      .attr('class', 'node-core');

    // Add small status dots on top (e.g. flashing beacon emitters)
    nodeSelection.filter(d => d.type === 'user' || d.type === 'community')
      .append('circle')
      .attr('r', '3.5')
      .attr('fill', '#ffffff')
      .attr('class', 'emitter-dot animate-pulse');

    // For raw threats, draw a subtle warning cross or inner core
    nodeSelection.filter(d => d.type !== 'user' && d.type !== 'community' && !d.isCompliant)
      .append('circle')
      .attr('r', '3')
      .attr('fill', '#ffffff')
      .attr('class', 'uncompliant-dot');

    // Add labels under the nodes
    nodeSelection.append('text')
      .attr('dy', (d) => d.radius + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => {
        if (d.type === 'user') return '#34d399';
        if (d.type === 'community') return '#a7f3d0';
        return d.isCompliant ? '#34d399' : '#fca5a5';
      })
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .attr('font-size', '8.5px')
      .attr('font-weight', 'bold')
      .text((d) => {
        if (d.type === 'user') return 'MY_BEACON';
        if (d.type === 'community') return d.name.replace('Community ', 'COM_');
        return d.isCompliant ? `${d.name} [MUTED]` : `${d.name} [ACTIVE]`;
      });

    // Handle force simulation ticks
    simulation.on('tick', () => {
      // Limit bounds to keep nodes inside reasonable map area
      filteredNodes.forEach(node => {
        if (node.id === 'node-user') {
          // keep center node locked or very close to center
          node.x = 250;
          node.y = 180;
        }
        if (node.x !== undefined && node.y !== undefined) {
          node.x = Math.max(40, Math.min(460, node.x));
          node.y = Math.max(40, Math.min(320, node.y));
        }
      });

      // Update node positions
      nodeSelection.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

      // Update link lines
      linkSelection
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      // Update background geofence bubbles positions
      bubblesGroup.selectAll('g.geofence-bubble')
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // Drag helper callbacks
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      
      // Update state coordinates of nodes to trigger proximity calculations
      setNodes(prev => prev.map(n => n.id === d.id ? { ...n, x: d.x, y: d.y } : n));
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, filterType, citizenState.rangeMeters, showGridLines]);

  // Click on map to place items in placement modes
  const handleMapClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (placementMode === 'none') return;

    const svg = svgRef.current;
    if (!svg) return;

    // Get actual local coordinates inside SVG
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 500;
    const y = ((event.clientY - rect.top) / rect.height) * 350;

    const newId = `node-custom-${Date.now()}`;
    const name = placementMode === 'beacon' ? `Community Beacon #${Math.floor(Math.random() * 800) + 100}` : `Unlisted Camera Node`;
    const newNode: MapNode = {
      id: newId,
      name,
      type: placementMode === 'beacon' ? 'community' : 'camera',
      x,
      y,
      radius: placementMode === 'beacon' ? 12 : 10,
      isCompliant: false,
      details: placementMode === 'beacon' 
        ? 'User placed community beacon. Sharing regional opt-out envelope.' 
        : 'Discovered third-party recording array reported by regional scout.',
      ipAddress: placementMode === 'beacon' ? `10.0.8.${Math.floor(Math.random() * 250) + 10}` : `192.168.1.${Math.floor(Math.random() * 250) + 10}`,
      battery: placementMode === 'beacon' ? 100 : undefined
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setPlacementMode('none');

    if (addLog) {
      addLog({
        id: `map-placed-${Date.now()}`,
        type: placementMode === 'beacon' ? 'pairing' : 'danger',
        name: placementMode === 'beacon' ? 'Opt-Out Node Deployed' : 'Threat Zone Flagged',
        message: `Manually reported node "${name}" at grid offset X:${Math.round(x)}, Y:${Math.round(y)}.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Radar sweep scan animation
  const triggerRadarSweep = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select('#d3-map-contents');

    // Append an expanding radar sweep ring centered at user location
    const sweepCircle = mapGroup.append('circle')
      .attr('cx', 250)
      .attr('cy', 180)
      .attr('r', 10)
      .attr('fill', 'none')
      .attr('stroke', '#34d399')
      .attr('stroke-width', '3')
      .attr('opacity', '0.8');

    sweepCircle.transition()
      .duration(2000)
      .ease(d3.easeQuadOut)
      .attr('r', 380)
      .attr('opacity', '0')
      .remove();

    if (addLog) {
      addLog({
        id: `radar-sweep-${Date.now()}`,
        type: 'shield',
        name: 'Map Radar Sweeped',
        message: 'Broadcasting telemetry handshake check across active sector grid.',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Temporarily trigger flash on all compliant nodes to signify response
    const nodesG = svg.select('.nodes-group');
    nodesG.selectAll('circle.node-core')
      .transition()
      .duration(300)
      .attr('r', (d: any) => d.radius + 5)
      .transition()
      .duration(500)
      .attr('r', (d: any) => d.radius);
  };

  // Reset the nodes list to default
  const resetMap = () => {
    setNodes([
      {
        id: 'node-user',
        name: 'My BlurBubble Beacon (You)',
        type: 'user',
        x: 250,
        y: 180,
        radius: 16,
        isCompliant: true,
        battery: 92,
        details: 'Active primary opt-out cell. Emitting compliant ZKP hashes.',
        ipAddress: '10.0.8.2'
      },
      {
        id: 'node-com-1',
        name: 'Community Beacon #140',
        type: 'community',
        x: 120,
        y: 100,
        radius: 12,
        isCompliant: true,
        battery: 84,
        details: 'Active wearable pocket tag. Sharing common compliance data.',
        ipAddress: '10.0.8.45'
      },
      {
        id: 'node-com-2',
        name: 'Community Beacon #281',
        type: 'community',
        x: 380,
        y: 220,
        radius: 12,
        isCompliant: true,
        battery: 71,
        details: 'Fixed retail window badge. Broadcasting RFC-9402 opt-out.',
        ipAddress: '10.0.8.109'
      },
      {
        id: 'node-com-3',
        name: 'Community Beacon #094',
        type: 'community',
        x: 210,
        y: 280,
        radius: 12,
        isCompliant: true,
        battery: 59,
        details: 'Tactical backpack shield. Actively deflecting local CCTV scan.',
        ipAddress: '10.0.8.34'
      },
      {
        id: 'node-cam-1',
        name: 'Street Dome CCTV #09',
        type: 'camera',
        x: 100,
        y: 130,
        radius: 10,
        isCompliant: true,
        details: 'Corporate dome hardware. Redacting biometrics on fly via ZKP.',
        ipAddress: '192.168.1.55'
      },
      {
        id: 'node-cam-2',
        name: 'Retail AI Facerec Rig',
        type: 'camera',
        x: 350,
        y: 80,
        radius: 10,
        isCompliant: false,
        details: 'Unregulated store window biometric scanner. Capturing raw facial feeds.',
        ipAddress: '192.168.1.12'
      },
      {
        id: 'node-drone-1',
        name: 'Autonomous Traffic Drone',
        type: 'drone',
        x: 440,
        y: 140,
        radius: 10,
        isCompliant: false,
        details: 'Quadcopter tracker. Analyzing dense crowd movement metrics.',
        ipAddress: '192.168.4.11'
      },
      {
        id: 'node-sensor-1',
        name: 'Decentralized Audio Crawler',
        type: 'sensor',
        x: 290,
        y: 190,
        radius: 8,
        isCompliant: true,
        details: 'Smart mic array auditing high frequency compliance bounds.',
        ipAddress: '10.0.12.89'
      }
    ]);
    setSelectedNode(null);
    if (addLog) {
      addLog({
        id: `map-reset-${Date.now()}`,
        type: 'system',
        name: 'Threat Map Reset',
        message: 'Re-seeded 8 standard regional nodes & compliance linkages.',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Telemetry Header */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10.5px] font-black text-slate-300">
            D3_DASHBOARD: OK_ZONE_SECURE
          </span>
        </div>

        {/* GPS location locked indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={triggerGPSLocate}
            disabled={gpsLoading}
            className={`flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border text-[9.5px] font-mono hover:bg-slate-900 cursor-pointer ${
              usingRealGPS ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-800 text-slate-400'
            }`}
            title="Attempt to read real-world location via navigator.geolocation"
          >
            <Locate className={`w-3 h-3 ${gpsLoading ? 'animate-spin text-cyan-400' : ''}`} />
            {gpsLoading ? 'SYNCING GPS...' : usingRealGPS ? `GPS LOCKED` : 'MOCK GPS'}
          </button>
          
          <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-900 font-mono text-[9px] text-slate-400">
            LOC: <span className="text-cyan-400 font-bold">{userCoords.lat.toFixed(4)}°N</span>, <span className="text-cyan-400 font-bold">{userCoords.lng.toFixed(4)}°W</span>
          </div>
        </div>
      </div>

      {/* Main Grid: D3 Canvas Left, Console Info Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side: Interactive Map Frame */}
        <div className="xl:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-2 flex flex-col relative overflow-hidden min-h-[420px]">
          
          {/* Overlay Map controls / Quick tools */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-850 p-1.5 rounded-xl shadow-lg">
              <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase px-1">Filters:</span>
              {(['all', 'community', 'threat'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase transition ${
                    filterType === type 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGridLines(!showGridLines)}
              className={`p-1.5 rounded-xl border font-mono text-[8.5px] uppercase flex items-center gap-1 transition shadow-lg ${
                showGridLines 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-950 border-slate-850 text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Grid
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              type="button"
              onClick={triggerRadarSweep}
              className="px-2.5 py-1.5 bg-slate-950/95 border border-slate-850 text-white hover:text-emerald-400 hover:border-emerald-500/20 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Radar Sweep
            </button>

            <button
              type="button"
              onClick={resetMap}
              className="p-1.5 bg-slate-950/95 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg cursor-pointer transition-all"
              title="Reset community beacons and camera positions"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
            </button>
          </div>

          {/* D3 Map Viewport */}
          <div className="flex-1 w-full bg-slate-950 rounded-xl relative overflow-hidden" style={{ minHeight: '340px' }}>
            <svg
              ref={svgRef}
              onClick={handleMapClick}
              viewBox="0 0 500 350"
              className={`w-full h-full bg-slate-950/90 select-none ${
                placementMode !== 'none' ? 'cursor-crosshair border border-dashed border-cyan-500/40' : ''
              }`}
            />

            {/* Placement Mode Banner Overlay */}
            {placementMode !== 'none' && (
              <div className="absolute inset-x-0 bottom-4 mx-auto w-11/12 sm:w-2/3 bg-slate-950/95 border border-cyan-500/35 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-bounce">
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-mono font-black text-cyan-400 uppercase flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    PLACEMENT_MODE: {placementMode === 'beacon' ? 'BROADCAST_BEACON' : 'FLAG_THREAT'}
                  </span>
                  <span className="text-[9.5px] text-slate-400 block font-sans">
                    Click anywhere on the grid map to drop the selected node entity.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlacementMode('none')}
                  className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Empty Watermark HUD */}
            <div className="absolute bottom-4 left-4 pointer-events-none font-mono text-[7px] text-slate-600/80 uppercase tracking-widest text-left">
              BLURBUBBLE TACTICAL INTERACTIVE MAP<br />
              D3-SIMULATION LAYER • 1:1 SCALE METRICS
            </div>
          </div>

          {/* Quick node placement buttons */}
          <div className="border-t border-slate-900/80 p-3 flex flex-wrap gap-2 justify-between items-center bg-slate-950/60 shrink-0">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black">
              Grid Interaction Console:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlacementMode(placementMode === 'beacon' ? 'none' : 'beacon')}
                className={`px-3 py-1.5 rounded-xl border text-[9.5px] font-mono font-bold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                  placementMode === 'beacon'
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                + Place Beacon
              </button>

              <button
                type="button"
                onClick={() => setPlacementMode(placementMode === 'threat' ? 'none' : 'threat')}
                className={`px-3 py-1.5 rounded-xl border text-[9.5px] font-mono font-bold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                  placementMode === 'threat'
                    ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                + Report Threat Node
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Map Inspector & Compliance Details (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Selected Node Details Block */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 text-left flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-widest flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  MAP_ENTITY_INSPECTOR
                </span>
                {selectedNode && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${
                    selectedNode.isCompliant 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {selectedNode.isCompliant ? 'COMPLIANT' : 'UNSHIELDED_THREAT'}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {selectedNode.type === 'user' ? (
                        <Shield className="w-4 h-4 text-emerald-400" />
                      ) : selectedNode.type === 'community' ? (
                        <Radio className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {selectedNode.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">
                      Type: {selectedNode.type} • IP: {selectedNode.ipAddress}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                    {selectedNode.details || 'No additional telemetry description available for this selected entity. Signal status stable.'}
                  </p>

                  <div className="space-y-2 font-mono text-[10px] pt-1">
                    {selectedNode.battery !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Hardware Battery:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.battery}%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Signal Encryption:</span>
                      <span className="text-slate-300">ZKP-ECDSA (RFC-9402)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Grid Coordinates:</span>
                      <span className="text-cyan-400 font-semibold">
                        X: {Math.round(selectedNode.x || 0)}, Y: {Math.round(selectedNode.y || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-600 space-y-2 font-sans flex-1 flex flex-col justify-center items-center">
                  <Compass className="w-10 h-10 stroke-1 text-slate-800 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500">NO OBJECT SELECTED</p>
                    <p className="text-[10.5px] text-slate-600 max-w-[200px] leading-relaxed mx-auto">
                      Click any beacon or camera sensor on the D3 grid to inspect live signal attenuation and compliance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedNode && (
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase transition cursor-pointer text-center"
              >
                Close Inspector
              </button>
            )}
          </div>

          {/* Regional Safety Index Widget */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3.5 text-left font-sans">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold tracking-widest">
              REGIONAL PRIVACY HEALTH
            </span>

            {(() => {
              const totalNodes = nodes.length;
              const communityBeacons = nodes.filter(n => n.type === 'community' || n.type === 'user').length;
              const activeThreats = nodes.filter(n => n.type !== 'community' && n.type !== 'user' && !n.isCompliant).length;
              const secureDevices = nodes.filter(n => n.type !== 'community' && n.type !== 'user' && n.isCompliant).length;
              const safetyIndex = Math.round((secureDevices / Math.max(activeThreats + secureDevices, 1)) * 100);

              return (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {safetyIndex}% SECURE
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      {communityBeacons} Active Emitters
                    </span>
                  </div>

                  {/* Visual health bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-500" 
                      style={{ width: `${safetyIndex}%` }} 
                    />
                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Your regional coverage index is determined by active ZKP opt-out signals masking camera biometrics. Higher density of BlurBubble tags forces compliance from surrounding corporate sensors.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[9.5px] font-mono">
                    <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900">
                      <span className="text-slate-500 block">PROTECTED ZONE</span>
                      <span className="text-slate-300 font-bold">{(citizenState.rangeMeters || 12) * 2}m Dia.</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900">
                      <span className="text-slate-500 block">BLOCKED CAMERAS</span>
                      <span className="text-emerald-400 font-bold">{secureDevices} Devices</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}
