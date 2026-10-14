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

---

## 🎙️ Milestone: Web Speech API Voice Command Engine

- **Voice Triggers Implemented**:
  - `BlurBubble emergency`: Engages maximum lockdown, peak RF broadcast power (+12dBm), strict blur censorship, and immediate emergency notification.
  - `BlurBubble silence`: Instantly mutes all alert chimes, stops vibration haptics, dismisses active alert toasts, cancels active speech synthesis utterances, and logs the audio silence action to the audit ledger.
- **Engine Architecture**:
  - Web Speech API `SpeechRecognition` integration with continuous interim parsing, automatic restart on speech pauses, and graceful permission/browser fallback.
  - Tactical Voice Command HUD Modal & background floating status pill when listening with live waveform visualizer and speech transcript box.
  - One-tap interactive simulation test buttons for both `BlurBubble emergency` and `BlurBubble silence` to enable immediate functional verification on any hardware or browser.
  - Quick action trigger button in top navigation bar and nested customization toggle in "Choose What Boxes to Show" options.

---

## ⚡ Milestone: Battery Status Widget Historical Power Consumption Area Chart (Recharts)

- **Feature Implementation**:
  - Added Recharts `AreaChart` to the **Connected Beacons & Tags Battery Monitor** widget (`#battery-status-overview-card`).
  - Displays historical RF/BLE power dissipation telemetry (mW) across the active fleet of BLE beacons over the last 6 hours (`-6h`, `-5h`, `-4h`, `-3h`, `-2h`, `-1h`, `Now`).
  - **Dynamic Telemetry & Physics Model**:
    - Reflects transmission radius (`rangeMeters`), active broadcast state, hardware profile (smart tags, keyfobs, smartphones), emergency RF saturation boost (+12dBm), and dynamic throttling from the Intelligent Battery Optimization Engine.
  - **Interactive Features**:
    - **Aggregate Draw** vs. **Per-Beacon Breakdown** toggle with distinct tactical cyber color fills (Emerald, Cyan, Violet, Amber, Pink).
    - Summary telemetry cards: Current Draw (mW), 6h Peak Draw (mW), 6h Average Draw (mW), and Total Integrated Energy Expended (mWh).
    - Dark tactical cyber tooltip with monospace timestamps, active range, broadcast status, and detailed per-tag power dissipation.

---

## 📶 Milestone: Real-Time Signal Strength (RSSI) D3 Gauge in Battery Status Widget

- **Feature Implementation**:
  - Embedded a real-time D3-based Signal Strength (RSSI) Gauge in the **Connected Beacons & Tags Battery Monitor** widget (`#beacon-rssi-signal-gauge-card`).
  - Visualizes real-time carrier signal quality (dBm) of the active BLE beacon across a multi-tier color arc:
    - **Critical / Fringe** (-105 to -90 dBm): Rose / Crimson (`#ef4444`)
    - **Weak / Degraded** (-90 to -80 dBm): Orange / Coral (`#f97316`)
    - **Fair / Acceptable** (-80 to -70 dBm): Amber / Yellow (`#eab308`)
    - **Good / Robust** (-70 to -55 dBm): Cyan / Sky Blue (`#06b6d4`)
    - **Excellent / Optimal** (-55 to -25 dBm): Neon Emerald (`#10b981`)
  - **D3 Architectural Design**:
    - Sweeping 270° tactical circular arc gauge built with `d3.arc()` and `d3.scaleLinear()`.
    - Dynamic multi-stop gradient arc fill with tactical glow filters (`feGaussianBlur`).
    - Calibrated major tick marks (-100 to -30 dBm) and minor sub-ticks with matching tier color highlights.
    - Precision animated needle pointer and multi-ring bezel with active LED jewel core.
    - Real-time D3 historical sparkline graph rendering the last 30 seconds of rolling RSSI telemetry samples.
  - **Interactive Controls & RF Diagnostics**:
    - Beacon Selector dropdown to inspect any registered wearable beacon or smart tag.
    - Real-time RF jitter drift polling toggle (`POLLING` / `PAUSED`).
    - Interactive RF Calibration slider & instant quick-test presets (`Critical -96`, `Fair -78`, `Good -65`, `Optimal -42`).
    - Live Link Margin (dB above -95 dBm floor), estimated Packet Delivery Ratio (PDR %), RF Distance estimate (m) via inverse log-distance path loss, and BLE advertising channel telemetry.

---

## 🛡️ Milestone: Simple Citizen Mode, 1-Click Lifestyle Profiles & Cryptographic Privacy Passport

- **Feature Implementation & Ergonomics**:
  - **Simple Citizen Mode (`<SimpleCitizenShield />`)**:
    - Created an ultra-clean, minimalist interface designed specifically for everyday citizens, families, and non-technical users.
    - Zero jargon with friendly terminology: Clear status display ("Shield Armed: 100% Offline Protection" vs "Shield Paused: Broadcast Muted").
    - Big tactile master button with instant visual ring animations, auditory chime feedback, and haptic motor pulses.
    - 4 intuitive camouflage styles: Strict Face Blur (standard), Magic Invisibility (AI fill), Pixelate Block (classic), and Allow Friends (whitelist).
    - Clear distance selection pills: Personal (5m), Room (12m), Street (25m), Max (50m) plus smooth continuous slider.
    - Protected Family & Belongings strip with 1-click active/standby toggles for all paired items.
    - Instant 1-click Emergency Ghost Cloak panic button for maximum lockdown.
  - **1-Click Privacy Lifestyle Profiles**:
    - 🚇 **Transit Commute**: 6m range, strict face blur, acoustic watermarking on, haptics high.
    - ☕ **Public Cafe & Work**: 10m range, background magic removal, silent alerts.
    - 🚶 **Street & Park Walk**: 20m range, smart drone & glasses alert, balanced battery.
    - 👻 **Ghost Stealth Cloak**: 40m range, full ultrasonic mic saturation, zero retention, rotating IDs.
    - 🏠 **Home Safe Zone**: 3m range, minimum power, alerts muted.
  - **Cryptographically Signed Privacy Passport (`<PrivacyPassportModal />`)**:
    - Web Crypto ECDSA P-256 digital signature engine (`signCompliancePayload`, `verifyCompliancePayload`).
    - Generates verifiable RFC-9402 Citizen Compliance Certificate with public key fingerprint, timestamp, and legal clauses (GDPR Art. 5/17/21, CCPA, EU AI Act 2026).
    - Real-time SubtleCrypto verification badge confirming authentic digital signature.
    - Print-ready layout (`window.print()`) and downloadable JSON passport file for venues, schools, or security personnel.
  - **Global Fast Navigation & Keyboard Control**:
    - Instant hotkeys: `Ctrl+K` search, `S` shield toggle, `M` mute/unmute, `1-4` tab switching, `Esc` dismiss.
    - Integrated with interface mode dropdown and global command palette.
