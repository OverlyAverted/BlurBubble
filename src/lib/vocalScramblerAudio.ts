/**
 * BlurBubble Web Audio API Vocal Scrambler & Mic Jammer Engine
 * Implements real-time browser-native audio synthesis for privacy protection.
 * Supports Bandpass-Filtered Pink Noise, Ultrasonic High-Frequency Swings, and Ring-Modulated Spectral Inversion.
 */

class VocalScramblerAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Node references for dynamic adjustments
  private noiseSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private modulator: OscillatorNode | null = null;
  private modGain: GainNode | null = null;

  private currentMode: 'white_noise' | 'ultrasonic' | 'spectral_inversion' = 'white_noise';
  private currentLevel: number = 65; // %
  private isActive: boolean = false;

  constructor() {}

  /**
   * Lazily initialize AudioContext on user gesture to comply with browser safety rules
   */
  private initContext() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    
    // Default safe extremely quiet volume (e.g., max 0.05 master volume) to protect users' ears while demonstrating real sound waves
    this.masterGain.gain.setValueAtTime(0.005, this.audioCtx.currentTime);
  }

  /**
   * Generate an AudioBuffer containing Pink/Brown noise (more comfortable than pure white noise)
   */
  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioCtx) throw new Error('AudioContext not initialized');
    
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normalise
      b6 = white * 0.115926;
    }
    
    return noiseBuffer;
  }

  /**
   * Starts synthesizing real privacy audio depending on active configuration
   */
  public start(mode: 'white_noise' | 'ultrasonic' | 'spectral_inversion', level: number) {
    this.currentMode = mode;
    this.currentLevel = level;
    this.isActive = true;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.stopNodes();

      // Calculate localized gain based on power level setting
      const targetGain = (level / 100) * 0.03; // Limit maximum volume safely
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
      }

      if (mode === 'white_noise') {
        // Create filtered pink noise stream (hissing bubble sound)
        this.noiseSource = this.audioCtx.createBufferSource();
        this.noiseSource.buffer = this.createNoiseBuffer();
        this.noiseSource.loop = true;

        this.filterNode = this.audioCtx.createBiquadFilter();
        this.filterNode.type = 'bandpass';
        // Map level to filter Q-factor and frequency
        this.filterNode.frequency.setValueAtTime(800 + (level * 4), this.audioCtx.currentTime);
        this.filterNode.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

        this.noiseSource.connect(this.filterNode);
        this.filterNode.connect(this.masterGain!);
        this.noiseSource.start();

      } else if (mode === 'ultrasonic') {
        // High frequency oscillating sweep (15 kHz - 19 kHz depending on level)
        const baseFreq = 14000 + (level * 50); // Up to 19,000 Hz

        this.osc1 = this.audioCtx.createOscillator();
        this.osc1.type = 'sine';
        this.osc1.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

        // LFO frequency modulator to swing pitch rapidly
        this.modulator = this.audioCtx.createOscillator();
        this.modulator.type = 'sine';
        this.modulator.frequency.setValueAtTime(35, this.audioCtx.currentTime); // 35 Hz flutter

        this.modGain = this.audioCtx.createGain();
        this.modGain.gain.setValueAtTime(200, this.audioCtx.currentTime); // Freq swing range

        this.modulator.connect(this.modGain);
        this.modGain.connect(this.osc1.frequency);

        this.osc1.connect(this.masterGain!);
        
        this.modulator.start();
        this.osc1.start();

      } else if (mode === 'spectral_inversion') {
        // Sci-Fi futuristic voice encryption hum
        this.osc1 = this.audioCtx.createOscillator();
        this.osc1.type = 'triangle';
        this.osc1.frequency.setValueAtTime(120, this.audioCtx.currentTime); // low hum

        this.osc2 = this.audioCtx.createOscillator();
        this.osc2.type = 'sawtooth';
        this.osc2.frequency.setValueAtTime(440, this.audioCtx.currentTime); // high buzz

        // Modulate amplitude for ring-modulation effect
        this.modGain = this.audioCtx.createGain();
        this.modGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);

        this.modulator = this.audioCtx.createOscillator();
        this.modulator.type = 'sine';
        this.modulator.frequency.setValueAtTime(8, this.audioCtx.currentTime); // 8 Hz tremolo

        this.modulator.connect(this.modGain.gain);
        
        this.osc1.connect(this.modGain);
        this.osc2.connect(this.modGain);
        this.modGain.connect(this.masterGain!);

        this.modulator.start();
        this.osc1.start();
        this.osc2.start();
      }

      console.log(`🔊 Web Audio Vocal Scrambler started successfully in [${mode}] mode.`);
    } catch (e) {
      console.error('Failed to run Web Audio Synthesis Engine:', e);
    }
  }

  /**
   * Stops active nodes immediately
   */
  private stopNodes() {
    try {
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
        this.noiseSource = null;
      }
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
        this.osc1 = null;
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
        this.osc2 = null;
      }
      if (this.modulator) {
        this.modulator.stop();
        this.modulator.disconnect();
        this.modulator = null;
      }
      if (this.modGain) {
        this.modGain.disconnect();
        this.modGain = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
    } catch (e) {
      // Swallowing stop errors on unstarted nodes
    }
  }

  /**
   * Adjust parameters in real-time without restarting oscillators
   */
  public setParams(mode: 'white_noise' | 'ultrasonic' | 'spectral_inversion', level: number) {
    if (!this.isActive) return;
    
    // If mode changed, do a clean restart
    if (this.currentMode !== mode) {
      this.start(mode, level);
      return;
    }

    this.currentLevel = level;
    
    if (!this.audioCtx) return;

    // Smoothly adjust master volume gain
    const targetGain = (level / 100) * 0.03;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
    }

    // Adjust internal parameters based on mode
    if (mode === 'white_noise' && this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(800 + (level * 4), this.audioCtx.currentTime, 0.1);
    } else if (mode === 'ultrasonic' && this.osc1) {
      this.osc1.frequency.setTargetAtTime(14000 + (level * 50), this.audioCtx.currentTime, 0.1);
    } else if (mode === 'spectral_inversion' && this.osc1 && this.osc2) {
      this.osc1.frequency.setTargetAtTime(100 + (level * 0.5), this.audioCtx.currentTime, 0.1);
      this.osc2.frequency.setTargetAtTime(300 + (level * 2), this.audioCtx.currentTime, 0.1);
    }
  }

  /**
   * Shuts down synthesizers immediately
   */
  public stop() {
    this.isActive = false;
    this.stopNodes();
    console.log('🔇 Web Audio Vocal Scrambler stopped.');
  }
}

// Export singleton instance
export const vocalScramblerAudio = new VocalScramblerAudioEngine();
