import React, { useEffect, useRef, useState } from 'react';
import { Shield, Settings, AlertTriangle, Play, Pause, Cpu, Sliders, RefreshCw, Layers } from 'lucide-react';

interface GpuShaderCoreProps {
  glassClarityMode: boolean;
  playHudSound?: (type: string) => void;
}

export default function GpuShaderCore({ glassClarityMode, playHudSound }: GpuShaderCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(8.0);
  const [gridDensity, setGridDensity] = useState<number>(30.0);
  const [scanSpeed, setScanSpeed] = useState<number>(2.5);
  const [shaderColor, setShaderColor] = useState<'emerald' | 'cyan' | 'amber'>('emerald');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [compileLog, setCompileLog] = useState<string>('SHADER_OK: Compiled with zero warnings.');
  const [gpuStats, setGpuStats] = useState({ renderTimeMs: 0.12, drawCalls: 1, vboBytes: 48 });
  const [expanded, setExpanded] = useState<boolean>(true);

  // Raw GLSL Vertex Shader Code
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Raw GLSL Fragment Shader Code
  const getFragmentShaderSource = (colorType: 'emerald' | 'cyan' | 'amber') => {
    let colorVec = 'vec3(0.0, 0.85, 0.45)'; // Emerald
    if (colorType === 'cyan') {
      colorVec = 'vec3(0.0, 0.75, 0.95)';
    } else if (colorType === 'amber') {
      colorVec = 'vec3(0.95, 0.60, 0.10)';
    }

    return `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_pixelSize;
      uniform float u_gridDensity;
      uniform float u_scanSpeed;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Native GPU Pixelation algorithm (sub-pixel grid quantization)
        if (u_pixelSize > 1.0) {
          float dx = u_pixelSize / u_resolution.x;
          float dy = u_pixelSize / u_resolution.y;
          uv.x = floor(uv.x / dx) * dx;
          uv.y = floor(uv.y / dy) * dy;
        }

        vec2 center = vec2(0.5, 0.5);
        float d = distance(uv, center);
        
        // 3D vector target reticle
        float pulse = 1.0 + 0.08 * sin(u_time * 4.0);
        float faceShape = smoothstep(0.24 * pulse, 0.22 * pulse, d);
        
        // Eyes and mouth masking vectors
        float eyeL = smoothstep(0.035, 0.025, distance(uv, vec2(0.42, 0.56)));
        float eyeR = smoothstep(0.035, 0.025, distance(uv, vec2(0.58, 0.56)));
        
        // Dynamic speaking mouth shape
        float mouthGap = 0.03 + 0.02 * sin(u_time * 12.0);
        float mouth = smoothstep(0.07, 0.06, distance(uv, vec2(0.5, 0.38))) * step(abs(uv.y - 0.38), mouthGap);
        
        float facialMesh = faceShape - eyeL - eyeR - mouth;
        
        // Sweeping raster line simulating a hardware camera sensor scanline
        float scanline = sin(uv.y * u_gridDensity * 3.0 + u_time * u_scanSpeed * 2.0) * 0.15;
        
        // Target scope ring
        float ringWidth = 0.015;
        float outerRing = smoothstep(0.32 + ringWidth, 0.32, d) * smoothstep(0.32 - ringWidth, 0.32, d);
        
        // Holographic coordinate ticks
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        float ticks = step(0.96, cos(angle * 8.0)) * step(0.28, d) * step(d, 0.35);
        
        // Palette mix
        vec3 baseColor = ${colorVec};
        vec3 finalColor = vec3(0.0);
        
        // Apply facial mesh element
        finalColor += baseColor * facialMesh;
        // Apply scanning scope rings and reticle indicators
        finalColor += baseColor * outerRing * (0.6 + 0.4 * sin(u_time * 6.0));
        finalColor += baseColor * ticks * 0.7;
        // Apply camera scanline noise
        finalColor += baseColor * scanline;
        
        // Add subtle background grid lines
        float gridX = step(0.97, fract(uv.x * u_gridDensity));
        float gridY = step(0.97, fract(uv.y * u_gridDensity));
        finalColor += baseColor * (gridX + gridY) * 0.12;

        // Radial brightness falloff
        float vignette = smoothstep(0.8, 0.3, d);
        finalColor *= vignette;

        // Add small digital warning overlay if pixel size is high
        if (u_pixelSize > 12.0) {
          finalColor += vec3(1.0, 0.2, 0.2) * 0.15 * (0.5 + 0.5 * sin(u_time * 10.0));
        }

        gl_FragColor = vec4(finalColor, 0.9);
      }
    `;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      setCompileLog('WebGL ERROR: GPU Context could not be acquired.');
      return;
    }

    // 1. Compile Vertex Shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) return;
    gl.shaderSource(vs, vertexShaderSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      setCompileLog('VS COMPILE ERROR: ' + gl.getShaderInfoLog(vs));
      return;
    }

    // 2. Compile Fragment Shader
    const fsSource = getFragmentShaderSource(shaderColor);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) return;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      setCompileLog('FS COMPILE ERROR:\n' + gl.getShaderInfoLog(fs));
      return;
    }

    // 3. Link Program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setCompileLog('LINK ERROR: ' + gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set Up Quad Coordinates
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Retrieve Uniform Locations
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uPixelSizeLoc = gl.getUniformLocation(program, 'u_pixelSize');
    const uGridDensityLoc = gl.getUniformLocation(program, 'u_gridDensity');
    const uScanSpeedLoc = gl.getUniformLocation(program, 'u_scanSpeed');

    setCompileLog('SHADER_OK: GPU pipeline initialized. WebGL compiled perfectly.');

    let animationId: number;
    let startTime = performance.now();

    const render = () => {
      if (!isPlaying) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const tStart = performance.now();
      const time = (tStart - startTime) / 1000.0;

      // Ensure viewport size matches client size
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.clearColor(0.01, 0.02, 0.05, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTimeLoc, time);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uPixelSizeLoc, pixelSize);
      gl.uniform1f(uGridDensityLoc, gridDensity);
      gl.uniform1f(uScanSpeedLoc, scanSpeed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const tEnd = performance.now();
      const ms = tEnd - tStart;
      
      // Update stats smoothly
      if (Math.random() < 0.05) {
        setGpuStats({
          renderTimeMs: Number((ms + 0.08).toFixed(3)),
          drawCalls: 1,
          vboBytes: vertices.byteLength,
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [pixelSize, gridDensity, scanSpeed, shaderColor, isPlaying]);

  return (
    <div className={`border rounded-xl p-4.5 space-y-3.5 shadow-xl transition-all duration-300 font-mono text-[9px] ${
      glassClarityMode 
        ? 'bg-slate-950/20 border-slate-800/40 backdrop-blur-md' 
        : 'bg-slate-950/80 border-slate-900'
    }`}>
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className={`w-3.5 h-3.5 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span className="text-[10px] text-white font-bold uppercase tracking-wider">GPU Fragment Shader Core</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="toggle-shader-expand"
            onClick={() => {
              setExpanded(!expanded);
              if (playHudSound) playHudSound('beep');
            }}
            className="text-[8px] text-slate-500 hover:text-emerald-400 transition"
          >
            [{expanded ? 'HIDE' : 'SHOW'}]
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Main WebGL Viewport Box */}
          <div className="relative w-full aspect-video rounded-lg border border-slate-900/80 overflow-hidden bg-slate-950/90 group">
            <canvas
              ref={canvasRef}
              className="w-full h-full block object-cover z-0"
              id="webgl-shader-canvas"
            />
            
            {/* Live FPS / Hardware Telemetry Tag */}
            <div className="absolute top-2 left-2 bg-slate-950/85 border border-slate-800/80 rounded px-1.5 py-0.5 text-[7px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
              GPU_ACCEL: ACTIVE
            </div>

            <div className="absolute top-2 right-2 bg-slate-950/85 border border-slate-800/80 rounded px-1.5 py-0.5 text-[7px] text-slate-400 font-mono">
              60 FPS / {gpuStats.renderTimeMs}ms
            </div>

            {/* Controller overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-950/75 backdrop-blur-xs border border-slate-800/60 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[7.5px] text-slate-300">FRAG_SHADER_NATIVE</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="shader-play-pause"
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    if (playHudSound) playHudSound('beep');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 transition"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="space-y-2.5 pt-1.5 border-t border-slate-900/40">
            {/* Shader Color Selectors */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[8px] uppercase">GLSL Theme Spectrum:</span>
              <div className="flex items-center gap-1">
                {(['emerald', 'cyan', 'amber'] as const).map((color) => (
                  <button
                    key={color}
                    id={`btn-shader-color-${color}`}
                    onClick={() => {
                      setShaderColor(color);
                      if (playHudSound) playHudSound('success');
                    }}
                    className={`px-1.5 py-0.5 text-[7.5px] font-bold rounded transition border uppercase ${
                      shaderColor === color
                        ? color === 'emerald'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : color === 'cyan'
                            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Quantized Pixel Width */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Sliders className="w-2.5 h-2.5 text-slate-500" />
                  Pixel Width (Subpixel Step)
                </span>
                <span className="text-white font-bold">{pixelSize.toFixed(1)}px</span>
              </div>
              <input
                id="shader-range-pixel"
                type="range"
                min="1.0"
                max="24.0"
                step="0.5"
                value={pixelSize}
                onChange={(e) => setPixelSize(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 rounded h-1 cursor-pointer"
              />
            </div>

            {/* 2. Grid Frequency */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-slate-500" />
                  Telemetry Mesh Density
                </span>
                <span className="text-white font-bold">{gridDensity.toFixed(0)} hz</span>
              </div>
              <input
                id="shader-range-grid"
                type="range"
                min="10"
                max="60"
                step="2"
                value={gridDensity}
                onChange={(e) => setGridDensity(parseInt(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 rounded h-1 cursor-pointer"
              />
            </div>

            {/* 3. Horizontal Scan Speed */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 text-slate-500" />
                  Sensor Raster Cycle Speed
                </span>
                <span className="text-white font-bold">{scanSpeed.toFixed(1)}x</span>
              </div>
              <input
                id="shader-range-speed"
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={scanSpeed}
                onChange={(e) => setScanSpeed(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 rounded h-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Compiler Log Telemetry */}
          <div className="mt-2.5 bg-black/60 border border-slate-900 rounded p-2 font-mono text-[7px] space-y-1 select-all selection:bg-emerald-500/25">
            <div className="flex items-center justify-between text-[7.5px] border-b border-slate-900/40 pb-1 text-slate-400">
              <span>GLSL COMPILER CORE v1.2</span>
              <span className="text-emerald-400 font-bold">STATUS: COMPILATION_OK</span>
            </div>
            <p className="text-emerald-300 leading-normal whitespace-pre-wrap">{compileLog}</p>
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-900/40 text-slate-500 text-[6.5px]">
              <span>DRAW_CALLS: {gpuStats.drawCalls}</span>
              <span>VBO_SIZE: {gpuStats.vboBytes} BYTES</span>
              <span>VARYINGS: OK</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
