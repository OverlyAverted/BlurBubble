# Gemini Agent Workspace Instructions - BlurBubble Continuous Evolution

Welcome, Gemini AI Agent! This file defines the **Continuous Autonomous Lifecycle (CAL)** protocol. It provides you with clear, executable instructions to maintain, test, and expand the BlurBubble (Stop Recording Me) application on every single turn.

These instructions are automatically loaded into your context. Use them to maintain a highly professional, fully verified development loop.

---

## 🔁 Continuous Autonomous Development Loop (CAL)

Every time you are initialized or receive a prompt in this workspace, you must adhere to this **4-Stage Cycle**:

```
      +-------------------------------------------------+
      |                                                 |
      |   STAGE 1: Workspace Diagnostics & Checkups     |
      |   (Run TypeScript linter, inspect health)       |
      |                                                 |
      +------------------------+------------------------+
                               |
                               v
      +-------------------------------------------------+
      |                                                 |
      |   STAGE 2: Architectural Consistency Validation |
      |   (Ensure state, design, and file bounds match)|
      |                                                 |
      +------------------------+------------------------+
                               |
                               v
      +-------------------------------------------------+
      |                                                 |
      |   STAGE 3: Non-Disruptive Feature Iteration     |
      |   (Apply requested features without breakage)   |
      |                                                 |
      +------------------------+------------------------+
                               |
                               v
      +-------------------------------------------------+
      |                                                 |
      |   STAGE 4: Verification & Integration Run       |
      |   (Compile applet, check logs, present summary) |
      |                                                 |
      +-------------------------------------------------+
```

---

## 🛠️ Stage-by-Stage Implementation Protocols

### Stage 1: Diagnostics
1. Prior to editing, always perform a health check of the codebase using `lint_applet` or a quick verification step.
2. Inspect `src/App.tsx` and `src/types.ts` to understand existing structures before adding new files or features.

### Stage 2: Architectural Bounds (Anti-Regression Checklist)
Ensure that:
*   The application continues to operate with **100% Client-Side Simulation** unless external backend APIs are explicitly requested.
*   **Framer Motion (`motion/react`)** is imported and used correctly for layout transitions, keeping transitions smooth, responsive, and tactile.
*   The **Cyberpunk / Tactical Tech Slate Theme** maintains dark off-whites, slate backgrounds (`slate-950`), custom borders, and emerald glows (`emerald-400`).
*   No unrequested layout-shattering elements are created. All customization and top-level options are housed neatly within the expandable collapsible menus.

### Stage 3: Incremental Feature Delivery
*   Use precise, targeted surgical edits (`edit_file` or `multi_edit_file`). Avoid full-file rewrites unless necessary, preventing context loss.
*   Keep helper classes and static lists modularized.
*   Keep ID attributes unique and present on all new buttons, cards, and interactive sliders to guarantee scriptability and clear styling.

### Stage 4: Compiling & Deployment Verification
*   Run `compile_applet` after every single feature implementation.
*   If compilation fails, look up the typescript compiler messages, fix the issue immediately, and run `compile_applet` again.
*   Confirm zero-error lints before marking tasks as complete.

---

## 🎯 Active Simulation Guidelines

When designing and simulating smart camera interfaces, wearable BLE trackers, or face obfuscations:
1.  **Optical Overlay**: Ensure the interactive Glasses HUD supports multiple options (Pixelate, Emoji, Magic Removal) and maintains stable request animations.
2.  **Sound Controls**: Respect the quick Mute state (`alertsMuted`) for any played alerts and make sure notification sound context matches.
3.  **Audit Logs**: Ensure that user triggers (e.g. emergency shield, mute changes, reconnect) post clean, readable telemetry logs to the audit timeline.
