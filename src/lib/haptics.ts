// Universal Haptic Feedback Engine for BlurBubble
// Provides physical device vibration via navigator.vibrate AND WebAudio micro-click simulation on desktop

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'toggle' | 'success' | 'alert' | 'danger';

class HapticManager {
  private audioCtx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentIntensity: 'low' | 'medium' | 'high' = 'medium';

  constructor() {
    this.initGlobalListeners();
  }

  public setIntensity(intensity: 'low' | 'medium' | 'high') {
    this.currentIntensity = intensity;
  }

  public trigger(type: HapticType | number | number[] = 'light') {
    if (!this.enabled) return;

    // Determine vibration duration or pattern based on intensity setting
    const intensityMultiplier = this.currentIntensity === 'low' ? 0.6 : this.currentIntensity === 'high' ? 1.5 : 1.0;

    let pattern: number[];

    if (typeof type === 'number') {
      pattern = [Math.max(1, Math.round(type * intensityMultiplier))];
    } else if (Array.isArray(type)) {
      pattern = type.map(d => Math.max(1, Math.round(d * intensityMultiplier)));
    } else {
      switch (type) {
        case 'light':
        case 'selection':
          pattern = [Math.round(8 * intensityMultiplier)];
          break;
        case 'medium':
          pattern = [Math.round(18 * intensityMultiplier)];
          break;
        case 'heavy':
          pattern = [Math.round(35 * intensityMultiplier)];
          break;
        case 'toggle':
          pattern = [Math.round(12 * intensityMultiplier), 10, Math.round(16 * intensityMultiplier)];
          break;
        case 'success':
          pattern = [Math.round(15 * intensityMultiplier), 40, Math.round(25 * intensityMultiplier)];
          break;
        case 'alert':
        case 'danger':
          pattern = [Math.round(60 * intensityMultiplier), 30, Math.round(80 * intensityMultiplier)];
          break;
        default:
          pattern = [Math.round(10 * intensityMultiplier)];
      }
    }

    // 1. Hardware Vibration API (Mobile devices, Android, iOS browsers with haptic)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Fallthrough if vibration fails
      }
    }

    // 2. WebAudio Subtle Micro-Click (Desktop & non-vibrating devices)
    this.playMicroAudioFeedback(type);
  }

  private playMicroAudioFeedback(type: HapticType | number | number[]) {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      
      let freq = 180;
      let duration = 0.015;
      let vol = 0.015;

      if (type === 'heavy' || type === 'danger') {
        freq = 90;
        duration = 0.035;
        vol = 0.03;
      } else if (type === 'toggle' || type === 'selection') {
        freq = 240;
        duration = 0.012;
        vol = 0.012;
      } else if (type === 'success') {
        freq = 320;
        duration = 0.025;
        vol = 0.02;
      }

      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      // Audio fallback silent catch
    }
  }

  private initGlobalListeners() {
    if (typeof window === 'undefined') return;

    // Attach capture-phase listener to catch ALL button clicks, selections, toggles, tabs, inputs, and links
    const handleGlobalInteraction = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive element
      const interactiveEl = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], [role="option"], label, .cursor-pointer, [data-haptic]'
      );

      if (interactiveEl) {
        // Custom haptic type if specified on element
        const customType = interactiveEl.getAttribute('data-haptic') as HapticType | null;
        
        if (interactiveEl.tagName === 'INPUT') {
          const inputType = (interactiveEl as HTMLInputElement).type;
          if (inputType === 'checkbox' || inputType === 'radio' || inputType === 'range') {
            this.trigger(customType || 'toggle');
            return;
          }
        }

        if (interactiveEl.tagName === 'SELECT') {
          this.trigger(customType || 'selection');
          return;
        }

        this.trigger(customType || 'light');
      }
    };

    window.addEventListener('click', handleGlobalInteraction, { capture: true, passive: true });
    window.addEventListener('change', handleGlobalInteraction, { capture: true, passive: true });
  }
}

export const haptics = new HapticManager();

export function triggerHaptic(type: HapticType | number | number[] = 'light') {
  haptics.trigger(type);
}
