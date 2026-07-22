import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Volume2, 
  Settings, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  Radio, 
  VolumeX, 
  Sliders, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { CitizenState, DetectionLog } from '../types';
import { AiAcousticClassifier } from './AiAcousticClassifier';

interface AudioLabProps {
  citizenState: CitizenState;
  addLog: (log: Omit<DetectionLog, 'id' | 'timestamp'>) => void;
  isActive: boolean;
}

type ScrambleAlgo = 'tactical_deep' | 'helium_rf' | 'spectral_blur' | 'military_anon';

export default function AudioLab({ citizenState, addLog, isActive }: AudioLabProps) {
  // Sound controls
  const [scrambleAlgo, setScrambleAlgo] = useState<ScrambleAlgo>('tactical_deep');
  const [pitchShift, setPitchShift] = useState<number>(-6); // semitones (-12 to 12)
  const [noiseLevel, setNoiseLevel] = useState<number>(35); // 0 to 100
  const [scrambleIntensity, setScrambleIntensity] = useState<number>(50); // 0 to 100
  
  // Recording State
  const [inputMode, setInputMode] = useState<'mic' | 'simulated'>('simulated');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioRecorded, setAudioRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState<'none' | 'original' | 'scrambled'>('none');
  const [micStatus, setMicStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Web Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize Audio Context and request permissions if mic mode is clicked
  const initAudio = async () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    // Canvas animation loop
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Neon grid line background
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      const analyser = analyserRef.current;
      if (analyser && isPlaying !== 'none') {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        if (isPlaying === 'scrambled') {
          analyser.getByteFrequencyData(dataArray);
          // Scrambled mode shows spiky military-like encrypted spectrum blocks
          const barWidth = (w / bufferLength) * 1.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            
            // Emerald tactical color with a bit of noise spike variation
            const r = 16 + Math.floor(Math.random() * 20);
            const g = 185 + Math.floor(Math.random() * 40);
            const b = 129 + Math.floor(Math.random() * 20);
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${barHeight / 255})`;
            ctx.fillRect(x, h - barHeight * 0.45, barWidth - 1, barHeight * 0.45);
            
            // Draw a second mirroring glowing line on top
            ctx.strokeStyle = `rgba(52, 211, 153, ${barHeight / 255 + 0.15})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, h - barHeight * 0.45);
            ctx.lineTo(x + barWidth - 1, h - barHeight * 0.45);
            ctx.stroke();

            x += barWidth;
          }
        } else {
          analyser.getByteTimeDomainData(dataArray);
          // Original mode shows smooth sine-wave-like voice waveforms
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)'; // clean blue voice wave
          ctx.beginPath();

          const sliceWidth = w / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * h) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(w, h / 2);
          ctx.stroke();
        }
      } else if (isRecording) {
        // Recording feedback
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // pulsing red
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const halfY = h / 2;
        const segments = 40;
        ctx.moveTo(0, halfY);
        for (let i = 0; i <= segments; i++) {
          const x = (w / segments) * i;
          const amp = Math.sin(i * 0.6 + Date.now() * 0.015) * (15 + Math.random() * 20);
          ctx.lineTo(x, halfY + amp);
        }
        ctx.stroke();

        // Pulsing indicator text
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = '10px monospace';
        ctx.fillText('REC ● ANALYZING VOCAL SIGNATURE', 15, 25);
      } else {
        // Idle ambient scan lines
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const scanY = (Date.now() * 0.1) % h;
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText('STANDBY // SCRAMBLER COPROCESSOR ENGAGED', 15, 25);
      }
    };

    render();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isPlaying, isRecording]);

  // Handle Input Mode Switch
  const handleInputModeChange = async (mode: 'mic' | 'simulated') => {
    setInputMode(mode);
    setAudioRecorded(false);
    recordedAudioBufferRef.current = null;
    await initAudio();

    if (mode === 'mic') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStatus('granted');
        // Stop it immediately, just verifying access
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.warn('Microphone permission blocked or unavailable:', err);
        setMicStatus('denied');
        setInputMode('simulated'); // Force simulated mode
      }
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    await initAudio();
    stopPlayback();
    
    audioChunksRef.current = [];
    setIsRecording(true);
    setAudioRecorded(false);
    setRecordingDuration(0);

    // Dynamic timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 10) {
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);

    if (inputMode === 'mic') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          if (audioContextRef.current) {
            audioContextRef.current.decodeAudioData(arrayBuffer, (decodedBuffer) => {
              recordedAudioBufferRef.current = decodedBuffer;
              setAudioRecorded(true);
            }, (decodeErr) => {
              console.error('Failed to decode recording buffer:', decodeErr);
            });
          }
          // Stop stream tracks
          stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.error('Microphone recording error:', err);
        setIsRecording(false);
        clearInterval(timerIntervalRef.current);
      }
    } else {
      // Simulated mode - we just count down, then synthesize on playback
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 5000); // Record a 5s simulated clip
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (inputMode === 'mic') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      setAudioRecorded(true);
      addLog({
        deviceModel: 'BlurBubble Vocal Calibrator',
        action: 'censored',
        shieldApplied: 'VOICE SCRAMBLER',
        distance: 1.0,
        rotatedId: 'SIMULATED_VOICE_SAMPLE_CALIBRATED'
      });
    }
  };

  // Stop active sources
  const stopPlayback = () => {
    activeSourcesRef.current.forEach(src => {
      try { src.stop(); } catch(e) {}
    });
    activeSourcesRef.current = [];
    
    activeOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    activeOscillatorsRef.current = [];

    setIsPlaying('none');
  };

  // Play Original Audio
  const playOriginal = async () => {
    await initAudio();
    stopPlayback();

    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    setIsPlaying('original');

    if (inputMode === 'mic' && recordedAudioBufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = recordedAudioBufferRef.current;
      
      source.connect(analyser);
      analyser.connect(ctx.destination);

      source.onended = () => setIsPlaying('none');
      activeSourcesRef.current.push(source);
      source.start();
    } else {
      // Simulate/synthesize clear male/female vowel drones
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(140, ctx.currentTime); // male voice fundamental
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(280, ctx.currentTime); // overtone

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 3);
      osc2.stop(ctx.currentTime + 3);

      activeOscillatorsRef.current.push(osc1, osc2);
      setTimeout(() => setIsPlaying('none'), 3000);
    }
  };

  // Play Scrambled Audio with DSP Effects!
  const playScrambled = async () => {
    await initAudio();
    stopPlayback();

    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    setIsPlaying('scrambled');

    // Create a White Noise Node
    const bufferSize = ctx.sampleRate * 4; // 4 seconds of noise
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime((noiseLevel / 100) * 0.15, ctx.currentTime); // scale noise level

    noiseSource.connect(noiseGain);
    noiseGain.connect(analyser);
    
    // Add custom filter sweeps (vocal scrambling ring modulator)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600 + (scrambleIntensity * 12), ctx.currentTime);
    filter.Q.setValueAtTime(4 + (scrambleIntensity / 15), ctx.currentTime);

    // Apply pitch shifting (for mic buffer source or oscillators)
    if (inputMode === 'mic' && recordedAudioBufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = recordedAudioBufferRef.current;

      // Adjust PlaybackRate (pitch-shift) based on semitones
      // semitone to playbackRate formula: rate = 2 ^ (semitones / 12)
      const playbackRate = Math.pow(2, pitchShift / 12);
      source.playbackRate.setValueAtTime(playbackRate, ctx.currentTime);

      source.connect(filter);
      filter.connect(analyser);
      analyser.connect(ctx.destination);

      source.onended = () => {
        stopPlayback();
      };
      activeSourcesRef.current.push(source, noiseSource);
      
      source.start();
      noiseSource.start();
    } else {
      // Synthesis-based voice scrambler
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const gain = ctx.createGain();

      // Scrambled mode shifts frequency dramatically
      const baseFreq = 140 * Math.pow(2, pitchShift / 12);
      osc1.type = scrambleAlgo === 'military_anon' ? 'sawtooth' : 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      // Ring modulation / robot voice
      modulator.frequency.setValueAtTime(scrambleIntensity * 2, ctx.currentTime);
      modGain.gain.setValueAtTime(baseFreq * (scrambleIntensity / 100), ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      modulator.connect(modGain);
      modGain.connect(osc1.frequency);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      osc1.start();
      osc2.start();
      modulator.start();
      noiseSource.start();

      osc1.stop(ctx.currentTime + 3.5);
      osc2.stop(ctx.currentTime + 3.5);
      modulator.stop(ctx.currentTime + 3.5);
      noiseSource.stop(ctx.currentTime + 3.5);

      activeOscillatorsRef.current.push(osc1, osc2, modulator);
      activeSourcesRef.current.push(noiseSource);

      setTimeout(() => {
        stopPlayback();
      }, 3500);
    }
  };

  // Preset loading helpers
  const applyPreset = (algo: ScrambleAlgo) => {
    setScrambleAlgo(algo);
    switch (algo) {
      case 'tactical_deep':
        setPitchShift(-8);
        setNoiseLevel(20);
        setScrambleIntensity(45);
        break;
      case 'helium_rf':
        setPitchShift(8);
        setNoiseLevel(15);
        setScrambleIntensity(30);
        break;
      case 'spectral_blur':
        setPitchShift(-2);
        setNoiseLevel(75);
        setScrambleIntensity(85);
        break;
      case 'military_anon':
        setPitchShift(-12);
        setNoiseLevel(90);
        setScrambleIntensity(95);
        break;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Compute un-identifiability / Compliance Score
  const computeCompliance = () => {
    // Pitch shift extreme distance + high noise level + extreme modulation = high unidentifiability
    const pShiftImpact = Math.abs(pitchShift) * 4;
    const noiseImpact = noiseLevel * 0.5;
    const modImpact = scrambleIntensity * 0.3;
    const base = 25;
    return Math.min(99.8, Math.round(base + pShiftImpact + noiseImpact + modImpact));
  };

  const complianceScore = computeCompliance();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full min-h-[580px] font-sans text-slate-300">
      
      {/* Viewport Visualization Waveform (8 columns) */}
      <div className="xl:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.1)_0%,rgba(2,6,23,0.95)_100%)]"></div>
        
        {/* Upper metadata status bar */}
        <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              RF Acoustic Scrambler Calibration Lab
            </h4>
            <p className="text-[10px] text-slate-500 font-sans">
              Test BlurBubble's localized sub-harmonic vocal shield. Capture voice snippets to verify non-identifiable compliance metrics.
            </p>
          </div>

          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
            <button
              id="input-mode-simulated"
              onClick={() => handleInputModeChange('simulated')}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded transition-all cursor-pointer ${
                inputMode === 'simulated'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              🌌 NPU Synth (Sim)
            </button>
            <button
              id="input-mode-mic"
              onClick={() => handleInputModeChange('mic')}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded transition-all cursor-pointer flex items-center gap-1 ${
                inputMode === 'mic'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 font-extrabold'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Mic className="w-3 h-3 text-blue-400" />
              🎤 Live Mic Input
            </button>
          </div>
        </div>

        {/* Real-Time Waveform Display Stage */}
        <div className="flex-1 min-h-[220px] my-5 flex items-center justify-center relative overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40">
          <canvas 
            ref={canvasRef} 
            width={640} 
            height={280} 
            className="w-full h-full object-cover rounded-xl"
          />

          {/* Central status notification box */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1 text-[9px] font-mono">
            <div className="bg-slate-950/90 border border-slate-900 px-2 py-1 rounded text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <span className={`w-1.5 h-1.5 rounded-full ${inputMode === 'mic' ? 'bg-blue-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
              Input source: <strong className={inputMode === 'mic' ? 'text-blue-400' : 'text-emerald-400'}>{inputMode.toUpperCase()}</strong>
            </div>

            {inputMode === 'mic' && micStatus === 'denied' && (
              <div className="bg-red-950/90 border border-red-500/30 px-2.5 py-1.5 rounded text-red-400 max-w-xs leading-normal flex items-start gap-1.5 shadow-xl font-sans mt-1">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5 animate-bounce" />
                <div>
                  <strong className="block text-[9px] font-mono text-red-400 uppercase">Mic Access Blocked</strong>
                  Microphone blocked by security sandboxing. Initialized <strong>Virtual NPU Speech Synthesizer</strong> instead!
                </div>
              </div>
            )}
          </div>

          {/* Glowing center indicator when playing back scrambled */}
          {isPlaying === 'scrambled' && (
            <div className="absolute inset-0 bg-emerald-500/[0.02] border border-dashed border-emerald-500/20 rounded-xl pointer-events-none flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <span className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest bg-slate-950 border border-emerald-900 px-2 py-0.5 rounded shadow-xl">
                🔒 PITCH_SHIFT &amp; NOISE_BLUR CO-PROCESSOR IN USE
              </span>
            </div>
          )}

          {/* Playback Progress Overlay */}
          {isPlaying === 'original' && (
            <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-blue-400 animate-bounce" />
              </div>
              <span className="text-[8px] font-mono text-blue-400 font-bold uppercase tracking-widest bg-slate-950 border border-blue-900 px-2 py-0.5 rounded shadow-xl">
                🔊 PLAYING RAW RECORDING
              </span>
            </div>
          )}
        </div>

        {/* Lower guidelines card info */}
        <div className="border-t border-slate-900 pt-3 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[9px] text-slate-500 leading-normal">
          <div className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-600" />
            <span>CALIBRATION CODE: BB-ACS-9402</span>
          </div>
          <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Vocal Cryptographic opt-out standard (RFC-9402) satisfied
          </span>
          <span>AUDIO ENGINE: WEB_AUDIO_API</span>
        </div>
      </div>

      {/* Control Console Sidebar Panels (4 columns) */}
      <div className="xl:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-5 relative backdrop-blur-md">
        
        {/* Group 1: Record & Snippet Panel */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Mic className="w-4 h-4 text-blue-400" />
              Snippet Manager
            </h4>
            {audioRecorded && (
              <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-black uppercase tracking-wider">
                READY
              </span>
            )}
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-center space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Capture snippet:</span>
              <span className={`font-bold ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
                {isRecording ? `${recordingDuration}s / 10s max` : audioRecorded ? 'Snippet saved' : '0.0s'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  id="record-start-btn"
                  onClick={startRecording}
                  className="px-4 py-2.5 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-400 hover:text-red-300 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  {audioRecorded ? 'Re-Record' : 'Record'}
                </button>
              ) : (
                <button
                  id="record-stop-btn"
                  onClick={stopRecording}
                  className="px-4 py-2.5 bg-slate-900 border border-red-500/50 hover:bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop Rec
                </button>
              )}

              <button
                id="listen-raw-btn"
                onClick={playOriginal}
                disabled={!audioRecorded || isRecording || isPlaying !== 'none'}
                className={`px-3 py-2 border text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  audioRecorded && isPlaying === 'none'
                    ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-900/30 border-slate-900/50 text-slate-600 cursor-not-allowed'
                }`}
                title="Listen to original unaltered snippet"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Raw Play
              </button>
            </div>

            <button
              id="scrambled-playback-btn"
              onClick={playScrambled}
              disabled={!audioRecorded || isRecording || isPlaying !== 'none'}
              className={`w-full py-2.5 font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                audioRecorded && isPlaying === 'none'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10 border border-emerald-400'
                  : 'bg-slate-900 border border-slate-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Radio className="w-4 h-4 text-current animate-pulse" />
              Listen to Scrambled Audio
            </button>
          </div>
        </div>

        {/* Group 2: Vocal Scrambler Parameters Customizer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Settings className="w-4 h-4 text-emerald-400" />
              Scrambler Engine
            </h4>
            <span className="text-[8px] text-slate-500 font-mono">Algorithm presets</span>
          </div>

          {/* Selector pills */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'tactical_deep', label: 'Tactical Deep' },
              { id: 'helium_rf', label: 'Helium RF' },
              { id: 'spectral_blur', label: 'Spectral Blur' },
              { id: 'military_anon', label: 'Military Anon' }
            ].map((algo) => (
              <button
                id={`algo-preset-${algo.id}`}
                key={algo.id}
                onClick={() => applyPreset(algo.id as ScrambleAlgo)}
                className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold text-center transition-all cursor-pointer ${
                  scrambleAlgo === algo.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-extrabold shadow-md'
                    : 'bg-slate-950/80 border-slate-900 hover:bg-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                {algo.label}
              </button>
            ))}
          </div>

          {/* Granular Sliders */}
          <div className="space-y-3.5 bg-slate-950/30 p-3 rounded-xl border border-slate-900/60">
            {/* Pitch Shift Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate-400">Sub-Harmonic Pitch-Shift</span>
                <span className={`font-bold ${pitchShift > 0 ? 'text-cyan-400' : 'text-blue-400'}`}>
                  {pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones
                </span>
              </div>
              <input
                id="scrambler-pitch-slider"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchShift}
                onChange={(e) => setPitchShift(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Noise Injection Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate-400">White/Pink Noise Level</span>
                <span className="text-emerald-400 font-bold">{noiseLevel}%</span>
              </div>
              <input
                id="scrambler-noise-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Modulation Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate-400">Ring Mod Carrier Rate</span>
                <span className="text-emerald-400 font-bold">{scrambleIntensity} Hz</span>
              </div>
              <input
                id="scrambler-intensity-slider"
                type="range"
                min="10"
                max="150"
                step="5"
                value={scrambleIntensity}
                onChange={(e) => setScrambleIntensity(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Group 3: Compliance & Transmission score card */}
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold border-b border-slate-900 pb-1.5">
            <span className="text-slate-400">Compliance Security Indicator</span>
            <span className={`px-1.5 py-0.5 rounded uppercase ${
              complianceScore >= 80 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : complianceScore >= 50 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {complianceScore >= 80 ? '🔒 CLASSIFIED' : complianceScore >= 50 ? '⚠️ DEFLECTED' : '❌ RECOGNIZABLE'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-2xl font-black font-mono text-white tracking-tighter shrink-0">
              {complianceScore}%
            </div>
            <div className="text-[9px] text-slate-400 leading-normal font-sans">
              <strong>Un-identifiability Efficacy:</strong> Voice biometric hashes will fail spectral match indexing on scraping platforms.
            </div>
          </div>

          <button
            id="sync-scrambler-profile-btn"
            onClick={() => {
              addLog({
                deviceModel: 'Decentralized Audio Node',
                action: 'censored',
                shieldApplied: `VOCAL_SHIELD: ${scrambleAlgo.toUpperCase()}`,
                distance: 1.0,
                rotatedId: `COMPLIANCE_${complianceScore}%_APPLIED`
              });
              alert(`Secure Compliance Profile (${scrambleAlgo.toUpperCase()}) synced to your family beacons!`);
            }}
            className="w-full mt-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            Deploy Scrambler Parameters
          </button>
        </div>

        {/* Gemini 3.6 Acoustic Classifier & Voice Crawler Shield */}
        <AiAcousticClassifier citizenState={citizenState} addLog={addLog} />

      </div>

    </div>
  );
}
