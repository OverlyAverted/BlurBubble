# 📘 BlurBubble Technical White Paper & Engineering Specifications
**Document Reference: BB-WP-2026-v1.0**  
**Author / Inventor / Sole Owner: Paul Gordon Stuart (licensing@blurbubble.org)**  
**Status: Complete (MVP / Launch-Ready Architecture)**

---

## Executive Summary

BlurBubble (Stop Recording Me) is an active, localized, privacy-enforcing protocol designed to restore spatial anonymity and personal sovereignty in an era of ubiquitous computer vision, high-density smart eyewear, and autonomous drone surveillance. This document provides a comprehensive technical overview of the BlurBubble ecosystem, outlining the exact physical hardware blueprints, mathematical and cryptographic algorithms, client-side software architectures, and active signal methodologies that make this utility unique and patentable.

---

## 1. The Core Architecture & Data Flow

The BlurBubble ecosystem operates as a zero-trust, closed-loop cyber-physical system. It bridges the physical gap between a person (broadcasting an opt-out preference) and a recording lens (processing spatial visual data).

```
   ┌──────────────────────────────────────────────┐
   │         Wearable Citizen Beacon              │
   │   - Dual-core Microcontroller (ESP32-S3/C6)  │
   │   - Unlicensed BLE ISM Transmitter           │
   │   - Tactile Haptic Vibration Module          │
   └──────────────────────┬───────────────────────┘
                          │
            Physical Wireless Signal (2.4 GHz BLE)
            Contains Rotating Temporal Opt-Out UUIDs
                          │
                          ▼
   ┌──────────────────────────────────────────────┐
   │          Complying Camera System             │
   │   - Smart Spectacles (e.g. Apple Glass)      │
   │   - Autonomous Surveillance Grid             │
   │   - Onboard Edge Neural Processing Unit (NPU)│
   └──────────────────────┬───────────────────────┘
                          │
       Real-Time Frame Intercept & Censorship
       (Gaussian Blur / Pixelation / Inpainting)
                          │
                          ▼
   ┌──────────────────────────────────────────────┐
   │         Compliant and Redacted Output        │
   │   - Visual identities secured from leak      │
   │   - Cryptographic handshake logged locally   │
   └──────────────────────────────────────────────┘
```

---

## 2. Advanced Patentable Methods & Technical Innovations

### Method A: Client-Side Zero-Knowledge Biometric Face Vault
Unlike existing opt-out databases that require uploading raw photos to centralized corporate servers, BlurBubble implements a **WebGL/WASM-based local facial vector isolation engine**:
1. **Biometric Landmark Isolation**: The local dashboard accesses the camera sensor and uses a lightweight convolutional neural network to locate exactly 128 multi-dimensional facial landmarks (coordinates corresponding to pupils, jaw contours, brow points, and lip margins).
2. **Euclidean Metric Vectorization**: These 128 points are translated into a static, scale-invariant distance matrix representing the unique relative proportions of the face.
3. **Key-Stretched Salt-Keyed Hashing**: This biometric coordinate array is combined with a local cryptographic salt (generated randomly on device initialization) and processed using PBKDF2 stretching:
   $$\text{Hash} = \text{PBKDF2}(\text{Landmark\_Array}, \text{Local\_Salt}, 10000, \text{SHA-256})$$
4. **Zero-Knowledge Matching (ZKM)**: The resulting hash is stored strictly inside the device's **Hardware Secure Enclave**. Complying camera systems perform verification via Short-Range Secure Handshakes. They match facial hashes locally without ever gaining access to the raw visual images, preventing databases from leaking real photographs.

### Method B: Rotating Child-Safe Cryptographic Identity Beacons (Anti-Tracking)
Continuous broadcasting of a static Bluetooth MAC address or unique identifier creates a severe safety risk, allowing malicious actors to track minors. BlurBubble introduces a **temporal rotating token sequence**:
1. **Dynamic Identifier Rotation**: The wearable beacon derives a one-time privacy token every 90 seconds using a Hash-based One-time Token (HOTT) algorithm:
   $$\text{Token}_t = \text{SHA-256}(\text{Private\_Device\_Seed} \mathbin{\Vert} \text{Interval\_Timestamp})$$
2. **Temporal Windowing**: The timestamp is rounded to the nearest 90-second boundary to allow for minor time drift.
3. **Asymmetric Compliance Resolution**: Complying camera systems decode and decrypt these tokens using a public verification key, enabling them to verify the minor's "high-priority redaction" instruction without learning the child's identity, real name, or historical path.

### Method C: Dynamic Active Haptic Deflection Feedback
To provide immediate verification of successful privacy enforcement:
1. The wearable beacon continuously monitors nearby RSSI signal profiles and BLE advertising handshakes.
2. If a nearby camera system performs a "handshake log check" to match visual pixels with a received beacon, it transmits a 1-byte compliance confirmation packet back to the beacon.
3. Upon receiving this confirmation, the beacon's micro-controller fires a low-latency haptic vibration pattern (e.g., a short double-buzz), giving the user tangible, physical confidence that their privacy is actively protected.

### Method D: SSID-Based Automatic Zone Suspensions
To conserve device battery and avoid visual distortion of family photos inside trusted zones:
1. The dashboard monitors connected Wi-Fi SSID properties.
2. Upon connecting to a user-defined trusted network (e.g., `Home_Secure_Wi-Fi`), the app automatically puts the active BLE broadcasting beacon into suspended sleep mode.
3. The instant the mobile client disconnects from the trusted SSID (such as stepping outside the front door), the app fires an automated background trigger to re-arm the shield at its default public level.

### Method E: Active Optical Disruption (Rolling-Shutter Jamming)
For extreme environments where cameras are non-compliant, physical display screens can utilize **Temporal Visual Watermarking**:
1. High-frequency pixel modulation is emitted by a compliant screen or wearable LED matrix at frequencies matching typical rolling-shutter cameras (e.g., 50Hz or 60Hz intervals).
2. While completely imperceptible to the human eye, this modulation induces heavy horizontal dark bars or color bands across camera sensors, rendering captured photos of proprietary hardware or fine art illegible while preserving native viewing for visitors.

---

## 3. Hardware Reference Architecture

To bring the BlurBubble protocol to the physical market, we have designed three primary hardware reference form factors:

### 1. The Wearable "Pebble" Beacon
*   **Form Factor**: Low-profile, sleek coin-sized clip-on or keychain.
*   **System on Chip (SoC)**: ESP32-C6 (combines ultra-low power RISC-V CPU, BLE 5.3, Zigbee, and Wi-Fi 6).
*   **Power Source**: Re-chargeable 150mAh LiPo pouch battery, supporting up to 7 days of continuous background broadcasting.
*   **Actuator**: Miniature pancake eccentric rotating mass (ERM) haptic motor.
*   **Antenna**: Integrated high-efficiency PCB trace antenna, optimized for spatial propagation up to 15 meters.

### 2. The Heavy-Duty Room Anchor
*   **Form Factor**: Wall-mountable disk for art galleries, design offices, and studios.
*   **SoC**: Nordic Semiconductor nRF5340 Dual-Processor Bluetooth SoC with directional antenna arrays.
*   **Power Source**: persistent USB-C or Power-over-Ethernet (PoE) connection.
*   **Antenna**: Directional patch antenna array, supporting phased BLE beamforming to target specific entryways up to 50 meters.

### 3. The Child-Safety Smart Tag
*   **Form Factor**: Ruggedized, waterproof silicone badge designed to slide onto school backpack straps.
*   **SoC**: Ultra-low-power BLE beacon chip with custom rotation logic.
*   **Power Source**: CR2032 coin-cell battery, optimized for up to 12 months of daily maintenance-free operation.

---

## 4. Software Implementation Details

The control console is engineered as an interactive, zero-latency dashboard built on modern web-engineering patterns:
*   **React 19 & TypeScript**: Provides type-safe states and modular rendering.
*   **Dynamic SVG Facial-Mesh Math**: The Glasses HUD translates 3D spatial points into real-time visual grids, adjusting to yaw, pitch, and roll simulations.
*   **Custom Polygon Blur Masking**: Rather than utilizing generic circular overlays, BlurBubble utilizes a twelve-point custom polygon clip-path matching the human face structure:
    `polygon(50% 5%, 68% 13%, 82% 28%, 86% 48%, 80% 70%, 68% 86%, 50% 95%, 32% 86%, 20% 70%, 14% 48%, 18% 28%, 32% 13%)`
*   **Low-Pass Filter (LPF) Stabilization**: Coordinates of tracking frames are filtered to prevent jitter:
    $$P_{\text{new}} = P_{\text{old}} + (P_{\text{target}} - P_{\text{old}}) \times \alpha$$
    Where $\alpha = 0.85$ during locked tracking for immediate and firm response.

---

---

## 5. Multi-Platform BLE Implementations, Web Bluetooth APIs & W3C DID Whitelists

To achieve near-universal mobile and peripheral interoperability, the BlurBubble protocol leverages existing consumer tracking standards, native mobile Bluetooth frameworks, and decentralized public-key registries:

### A. Multi-Platform Adaptive BLE Advertisement Formats
Because modern smartphones and smart wearables enforce strict, platform-specific background execution rules, the BlurBubble client dynamically structures its advertising frames to match the requirements of the host device:
1. **Apple iOS (CoreBluetooth & iBeacon Overrides)**: Due to iOS background constraints that strip manufacturer-specific data, the iOS app compiles its payload into standard **iBeacon** (Proximity UUID `0xFE69` + Major/Minor key fragments representing the rotating 32-bit ephemeral token) and **AltBeacon** advertising frames. This ensures that background transmissions are grouped into iOS solicitation headers, preserving power while broadcasting the opt-out intent.
2. **Google Android (BluetoothLeAdvertiser & Eddystone-EID)**: On Android, the foreground service offloads token rotations directly to the system's Bluetooth chip using **Eddystone-EID** (Ephemeral Identifier) frames. A 300-second token is hashed on-device using a pre-shared key (PSK) and registered with the Android Knox Secure Enclave, keeping the device's true MAC address hidden from malicious passive trackers.
3. **Cross-Brand Wearables (SmartTags & AirTags Mapping)**: Users can link commercial smart tags (Airtags, Galaxy Tags, Tile beacons) directly. BlurBubble maintains a localized mapping index. When a compliant smart camera reads a public beacon advertisement associated with a registered MAC hash, its optical pipeline automatically cross-references and applies the redaction rules.

### B. Interactive Browser-Side Web Bluetooth Synchronization
For modern browser contexts (without needing heavy app installs), BlurBubble integrates the standard **Web Bluetooth API** (`navigator.bluetooth`). This allows the web-based control console to directly discover, pair, and synchronize keys with localized physical beacons:
- **Service Discovery**: The browser initiates an interactive spectrum scan filtering for Service UUID `0xFE69`.
- **GATT Connection**: Once a connection is established, the client securely writes the rotated Epoch seed to the beacon's Secure GATT Characteristic (UUID `0xFE69-CH1`), aligning time clocks and pairing the keychain button with 100% security.

### C. Decentralized Consent Whitelisting (W3C DIDs & Verifiable Credentials)
To reconcile visual privacy with legitimate recording (such as authorized family video logs or trusted school photography), BlurBubble avoids simple plaintext whitelists which are vulnerable to spoofing. We establish an immutable, zero-knowledge decentralized consent registry:
1. **Decentralized Identifier (DID)**: Every registered family member and authorized creator possesses a W3C-compliant DID (e.g., `did:blur:creator-1d90a72f`).
2. **Cryptographic Verifiable Credentials (VC)**: Trusted creators hold a Verifiable Credential signed by the guardian's private key. When their smart camera captures video near a family beacon, the camera broadcasts its DID signature.
3. **Zero-Knowledge Handshake**: The user's beacon verifies the DID signature against its local secure ledger. If valid, the camera is temporarily exempt from facial blurring, maintaining pristine family captures while remaining fully locked against third-party lenses.

---

## 6. Security & Technical Certifications
The reference hardware designs are structured to pass critical compliance checks on first submission:
*   **FCC Title 47 Part 15 Subpart C**: Fully compliant with radiated emission limits.
*   **CE EN 300 328 v2.2.2**: Standard harmonized certification for wideband transmission systems operating in the 2.4GHz ISM band.
*   **UL 2056**: Safety certification for lithium-ion battery configurations inside wearable devices.
