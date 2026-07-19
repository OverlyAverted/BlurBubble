# AI Agent Guidelines - BlurBubble Dashboard

Welcome, Agent! This file outlines key architectural decisions, styling rules, and development practices for maintaining the BlurBubble (Stop Recording Me) application. Please adhere strictly to these guidelines during edits.

---

## 🌌 Core Vision & Product Identity

**BlurBubble** is a tactical privacy shield and decentralized compliance manager designed to defend citizens, localized spaces, and physical/digital assets from unauthorized video, biometric, and audio recordings. By establishing an interactive local dashboard for wearable RF/BLE signal beacons, it implements opt-out standards (such as **RFC-9402**) in high-risk real-time simulations.

All historical master prompts, milestone parameters, and developmental registers are securely logged in [MASTER_PROMPT_LOG.md](./MASTER_PROMPT_LOG.md).

---

## 🎨 Visual System & Identity

*   **Theme**: Dark Cyberpunk / Tactical Tech. Uses a slate-colored dark canvas (`slate-950`), custom borders (`slate-900/80`), and high-contrast glowing accents in emerald (`emerald-400`, `emerald-500/10`) to signal active, clean encryption/protection status.
*   **Typography**:
    *   **Primary Headings / Display**: UI utilizes standard Inter (sans-serif) or clean Display typography with tracking-tight styles for headers.
    *   **Status & Numbers**: `font-mono text-xs` (specifically JetBrains Mono or Fira Code) for coordinates, logs, port, or compliance metrics.
*   **Icons**: All icons are exclusively imported from `lucide-react`. Never use raw SVGs or external icon sets.
*   **Animations**: Framer Motion transitions (specifically `motion/react`) must be used for layout changes, view switching, and status ripples to convey physical hardware operations.

---

## 📁 Application Structure

*   `/src/App.tsx`: Main dashboard and application shell containing tab routing and simulation engines.
*   `/src/types.ts`: Holds shared TypeScript types, interface contracts, and schema declarations.
*   `/index.html`: Entry point. Do not modify unless adding a public stylesheet or external font-import.
*   `metadata.json`: Defines name, frame permissions, and major capabilities.

---

## 🔒 Engineering Decisions

1.  **Client-Side Only State**: The application runs completely offline using local state and simulated sensors to represent wearable BLE/RF beacon controller interactions. Do not implement unrequested server-side databases or real Bluetooth/RF browser integrations unless specifically requested.
2.  **App Customization Options**: Customization menus, top bar toggles, and UI panel selections (including **Language Selection**) are cleanly nested inside the **Collapsible App Interface Options** panel under the "Choose What Boxes to Show" area. Keep this nested structure clean and unified.
3.  **Real-Time Simulators**:
    *   **Signal Shield**: Real-time signal radius simulator showing physical boundaries.
    *   **Glasses Feed**: Interactive camera overlay showing mock face recognition and selective censorship (Pixelate, Emoji, Magic Removal).
    *   **Timeline / compliance audit**: Feed tracking active handshakes, signal deflections, and compliance handshakes.
    *   **Acoustic crawler**: Simulates automated platform-indexing scanning on decentralized and streaming indexes (Spotify, Apple Podcasts, SoundCloud, Public Audio DB, Streaming Index).
    *   **Vibration Engine (Alert Customizer)**: Direct integration with browser Vibration API (`navigator.vibrate`) using custom millisecond patterns, backed by an interactive animated haptic visualizer.

---

## 🎯 Continuous Master Prompt & Evolution Directive

When carrying out future evolutionary tasks, keep this master system-wide prompt in mind:

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

