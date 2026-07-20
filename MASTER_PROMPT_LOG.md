# 🛡️ BlurBubble (Stop Recording Me) - Master Prompt & Evolution Log

Welcome to the **BlurBubble Master Registry**. This document holds the continuous historical record of master prompts, product visions, architectural milestones, and core specifications that define the evolution of the **BlurBubble Universal Privacy-Protection and Opt-Out Signal Manager**.

---

## 🌌 1. The BlurBubble Vision

**BlurBubble** is built on a single, uncompromising premise: **individual visual and biometric privacy is a fundamental civil liberty**. 

In an era of ubiquitous AI scanning, smart spectacles, municipal CCTV grids, and autonomous drones, citizens are continuously recorded, indexed, and analyzed without explicit or real-time consent. BlurBubble addresses this power asymmetry by providing an interactive local dashboard for simulated **RFC-9402 Localized Opt-Out Boundary Standard** beacon hardware.

### Core Ecosystem Pillars:
1. **Dynamic Local Transmitters**: Simulated wearable RF/BLE beacons broadcasting cryptographically-signed privacy preferences.
2. **Selective Censorship Protocol**: Translating beacon signatures into real-time visual redactions (Gaussian Blur, Pixelate, Emoji-mask, Generative Inpainting) applied at the camera level.
3. **ZKP Biometric Vault**: Storing locally hashed facial signatures that compliant cameras can match and obscure without exposing raw biometric data to cloud servers.
4. **Audit and Verification Ledger**: Real-time logging of compliance handshakes, intercepted surveillance sweeps, and audio fingerprint watermarks.

---

## 📜 2. Evolution Registry (Prompts & Milestones Log)

This registry catalogs the developmental history of the BlurBubble codebase, preserving the exact prompts, feature parameters, and code implementations across key architectural epochs.

### 📍 Milestone 1: The Core Signal Shield & Interactive HUD
* **Focus**: Bootstrapping the initial dashboard interface and real-time simulators.
* **Core Capabilities Added**:
  * **Interactive Signal Shield Simulator**: Adjusting RF power, frequency modulation (ISM-band), and effective radius (1m–50m) with full circular field visualization.
  * **Glasses Feed Overlay**: Simulating real-time spectator eyewear with dynamic bounding boxes and face detection overlays. Supports multiple active censorship modes (Pixelate, Emoji, Magic Removal).
  * **Active Handshake Audit Log**: Real-time ticker showing active handshakes, signal deflections, and localized BLE beacon collisions.
  * **Cyberpunk Tactical Slate Theme**: Deep off-whites, dark slate backgrounds (`slate-950`), custom double borders, and emerald glows.

### 📍 Milestone 2: Audio Watermark & Fingerprint Crawler
* **Focus**: Extending the spatial signal protections into the sonic spectrum to prevent unauthorized voice recording.
* **Core Capabilities Added**:
  * **Acoustic Watermark Crawlers**: Decentralized indexers parsing Spotify, Apple Podcasts, and SoundCloud tracks.
  * **Decentralized Integrations**: Expanded platform crawler integrations with **Public Audio Database Indexer** and **Global Streaming Audio Indexer**.
  * **Real-Time Scan & Flagging**: Crawler simulations that discover unconsented vocal recordings, dispatch automated scrambling/takedown requests, log events to the central audit timeline, and trigger system alerts.

### 📍 Milestone 3: OS-Style Alert Customizer & Vibration API
* **Focus**: Implementing physical haptic notification feedback for mobile and badge companion hardware.
* **Core Capabilities Added**:
  * **Haptic Vibration Customizer**: Dedicated OS-style window letting users define custom vibration sequences (e.g., Long-Short-Long pulses for critical battery events).
  * **Browser Vibration API Integration**: Direct interfacing with `navigator.vibrate` to emit physical buzz patterns.
  * **Live Waveform Sequence Visualizer**: Interactive dynamic progress bar mapping vibration and pause duration blocks (even/odd sequence indexes).
  * **Interactive Buzz Canvas**: A Framer Motion-animated simulated smartphone that vibrates and pulsates in synchronization with the haptic sequence.
  * **Persistent Storage**: Save/load functionality connected to browser `localStorage` and a library of tactical presets (SOS urgent beacon, rhythmic heartbeat, double fast tap).

### 📍 Milestone 4: Wearable Hardware, Compliance OS Integrations & Acoustic Shields
* **Focus**: Delivering physical reference specifications, PCB schematics, manufacturing data, regulatory certifications, native system-level camera hooks, and active acoustic/optical shields.
* **Core Capabilities Added**:
  * **Physical 4-Layer PCB Design & BOM (`pcb_design_and_bom.md`)**: Full electrical schematics, matched 50-Ohm ceramic antenna microstrips, 360nA ultra-low-current LDO configurations, CR2032 battery optimization states (12+ month calculations), Bill of Materials with supplier part numbers, and mechanical TPU/ABS injection-molded casings.
  * **Regulatory Radio Certification Manual (`fcc_ce_certifications.md`)**: Compliance strategies covering FCC Part 15 Subpart C and CE RED EN 300 328 standards. Formulates RF isolation shielding-cans, multi-via microstrip fences, harmonic suppressing ferrite filters, and body-worn SAR general exposure exclusions saving substantial testing costs.
  * **Android Camera HALv3 C++ Binder Hook (`android_camera_hal3_hook.cpp`)**: A native system-level C++ module that intercepts raw YUV/NV12 frame buffers inside the Android camera service, applying downsampled face pixelation before the frames reach user-space. This prevents bypass across all camera apps.
  * **Active Ultrasonic Speech Privacy Jammer (`ultrasonic_speech_jammer.c`)**: Highly optimized C microcontroller firmware utilizing high-frequency PWM timers to drive piezoelectric transducer arrays at 24kHz - 25.5kHz with frequency sweeps and AM white noise envelopes to silent-jam recording devices.
  * **Smart Glass Liquid Crystal Lens Shutter (`liquid_crystal_shutter.ino`)**: Arduino microcontroller sketch that listens to active NIR structured lasers (such as LIDAR or FaceID vcsel grids) and toggles ±12V AC square-wave lens shutters to blind the rolling camera sensors.

### 📍 Milestone 5: No Data About Me - Universal Surveillance Intercept Grid & Dataset Exclusions
* **Focus**: Extending localized boundary shields to universal physical devices (smartphones, municipal CCTV, smart home IoT, drones) and establishing proactive defense against web crawler scrapers, AI training datasets, and background search brokers.
* **Core Capabilities Added**:
  * **Universal Surveillance Intercept Grid**: Advanced on/off toggles for smartphone cameras, municipal CCTV systems, smart home IoT doorbells (Nest/Ring), and aerial drone camera shields.
  * **AI Dataset Exclusion Hub**: Standardized crawler refusal headers targeting OpenAI (GPTBot), Google (Google-Extended), Anthropic (Claude crawler), and Common Crawl (CCBot).
  * **Automated Data Broker Sweep**: Cryptographically signed BIPA/CCPA deletion requests sent automatically to popular people search websites and background check services.
  * **Consolidated Shield Outcomes**: Integrated all 13 active shields into the Interactive Face Lookup Simulator's logic, dynamically rendering protective handshakes and generating real-time audit logs upon mock scans.

### 📍 Milestone 6: Syntactic Compilation and Depth Calibration Alignment
* **Focus**: Securing 100% linter and TypeScript compiler compliance for the advanced 3D perspective-warping face mesh, depth calibration controls, and nested state wrappers.
* **Core Capabilities Verified**:
  * **Syntactic Bracket Alignment**: Resolved syntax constraints around nested IIFEs within the GlassesHUD visual simulation core.
  * **Depth Heatmap Synchronization**: Validated the `showDepthHeatmap` state variables, connecting dynamic color-ramp generators with interactive canvas overlay matrices.
  * **Complete Build Validation**: Verified 100% build success across all thirty-three thousand (33,000+) lines of React/TS codebase.

---

## 🛠️ 3. Current Live Architecture

The application is structured as an interactive React single-page application optimized for rapid local simulation, zero-latency feedback, and precise tactical styling:

* **Entrypoint**: `/src/main.tsx` bootstrapping `/src/App.tsx`.
* **State Management**: Client-side state engines with local persistence (`localStorage`) representing hardware state and active beacon profiles.
* **Styling & Motion**: Tailwind CSS v4 paired with custom Framer Motion (`motion/react`) visual sequences representing physical device operations.
* **Core Sub-Windows**:
  * **Signal Shield Gauge**: Calibrates transmitter frequencies and signal power limits.
  * **Biometric Face Vault**: Encrypts and matches face templates locally.
  * **Glasses HUD Feed**: Renders live camera overlays showing automated blurring.
  * **Haptic Alert Customizer**: Fine-tunes mobile and wearable vibration alerts.
  * **Compliance Ledger**: Aggregates BLE handshakes, beacon registration indexes, and security alerts.

---

## 🎯 4. The Unified Master Prompt (Project Directive)

*Below is the consolidated, continuous master prompt that future AI Coding Agents must read to maintain, expand, and scale BlurBubble.*

```text
================================================================================
          BLURBUBBLE CONTINUOUS DEVELOPMENT DIRECTIVE (MASTER PROMPT)
================================================================================

You are the Lead Privacy Systems Engineer for BlurBubble. Your objective is to 
expand, refine, and maintain the BlurBubble Privacy & Opt-Out Signal Manager.

CORE STYLING & BRAND IDENTITY MANDATES:
1. Color Palette: Slate Cyberpunk/Tactical. Dark slate backgrounds (#020617 / slate-950),
   dark borders (#0f172a / slate-900), and sharp high-contrast emerald green highlights 
   (#34d399 / emerald-400) to signify active, safe, encrypted status.
2. Typography: Inter (Sans) for primary interfaces; JetBrains Mono / Fira Code (Mono) 
   for coordinates, telemetry lines, timestamps, port numbers, and compliance statistics.
3. Component Style: Double borders, glowing container drop-shadows, and elegant nested 
   collapsible menus. Do not clutter outer headers or footers with tech-larping noise. 
   Keep all secondary customizer tabs cleanly nested within collapsible option boxes.
4. Icons: Exclusively utilize lucide-react. Do not write raw SVGs.
5. Animation: Framer Motion (motion/react) is required for all transitions, alert ripples,
   simulated device vibrations, and sub-window state toggles to represent high-tech hardware.

CORE SIMULATION STATE RULES:
1. No Backend Dependencies: Keep state local, robust, and interactive.
2. Local Storage Persistence: Settings such as vibration patterns, registered beacons, 
   active shield power, and biometric face hashes must persist via localStorage.
3. Real-Time Telemetry: Ensure active tickers, crawlers, and trackers push alerts 
   directly to the central audit ledger (logs) to preserve visual responsiveness.
4. Active Safeguards: When triggers occur (e.g., unauthorized scanning, critical battery,
   voice matches, custom overrides), dispatch corresponding vibration pulses and 
   browser notifications to alert the user.

TASK PROTOCOLS:
1. Read AGENTS.md, GEMINI.md, and MASTER_PROMPT_LOG.md before editing code.
2. Ensure 100% compilation and linter compliance by running 'compile_applet' 
   and 'lint_applet' iteratively.
3. Keep layout boundaries intact. Never break the cohesive tactical-slate grid.
================================================================================
```
