# 🔬 BlurBubble Technical Compliance & Regulatory Standards
**Document Reference: BB-COMP-2026-v2**

This document establishes the technical, wireless, biometric, and safety standards followed by the BlurBubble protocol and dashboard dashboard.

---

## 1. RF & Wireless Spectrum Compliance

To prevent radio interference and guarantee legal operation across global jurisdictions, all BlurBubble hardware transmitters must adhere to unlicensed spectrum constraints:

### 1.1 Frequency & Modulation Guidelines
*   **Operating Band**: 2400.0 MHz to 2483.5 MHz (Industrial, Scientific, and Medical [ISM] Band).
*   **Modulation**: Gaussian Frequency Shift Keying (GFSK) with Frequency Hopping Spread Spectrum (FHSS) across 40 dedicated channels (Bluetooth Low Energy physical layer mapping).
*   **Advertised Services**: UUID `0xFD23` (Reserved Opt-Out Compliance Identifier) broadcasting custom localized privacy headers.

### 1.2 Transmit Power & Range Calibration (EIRP Limits)
The hardware controller restricts maximum RF power output to prevent spatial radio pollution:

| Dashboard Range setting | Target Output Power | Typical Radius | Global Status |
| :--- | :--- | :--- | :--- |
| **Stealth (1-5m)** | $-12\text{ dBm}$ | $1\text{ to }5\text{ meters}$ | Approved (Worldwide) |
| **Standard (5-15m)**| $0\text{ dBm}$ | $5\text{ to }15\text{ meters}$ | Approved (Worldwide) |
| **Max Shield (15-50m)**| $+4\text{ dBm}$ | $15\text{ to }50\text{ meters}$ | Approved (Subject to local RSSI limits) |
| **Emergency (50m+)** | $+10\text{ dBm}$ (Boost) | Up to $100\text{ meters}$ | Restricted to Emergency / Short-Burst |

### 1.3 Telecommunications Certification Registry
BlurBubble reference hardware supports the following unlicensed certifications:
*   **FCC Part 15.247** (United States, Federal Communications Commission)
*   **CE RED Article 3.1(b) & 3.2** (European Union, Radio Equipment Directive)
*   **ISED RSS-247** (Canada, Innovation, Science and Economic Development)
*   **MIC Article 2, Paragraph 1, Item 19** (Japan, Ministry of Internal Affairs and Communications)

---

## 2. Biometric Security & Cryptographic Disclosures

The BlurBubble biometric facial registration system represents a breakthrough in **Zero-Knowledge privacy architecture**. 

### 2.1 Cryptographic Face Hashing (No Raw Photos)
*   The application does **NOT** capture, store, or transmit raw photograph images of users.
*   Upon uploading/scanning a face profile in the secure console, a localized machine-learning model (running purely on client-side WebGL assembly) extracts **128 unique floating-point biometric facial landmarks**.
*   These landmarks are passed through a salt-keyed cryptographic hashing function (SHA-256 + Local User-Salt) to create a **Zero-Knowledge Biometric Signature Token**.
*   This signature is stored securely in the device's **Hardware Secure Enclave** (e.g. Apple T2/M-series Secure Enclave or Android Keystore / StrongBox).
*   During active scans, camera arrays verify opt-out matching purely through **Zero-Knowledge Proofs (ZKPs)** of these tokens, making it mathematically impossible for intercepting cameras to reconstruct the user's original photograph.

### 2.2 WebAuthn & Hardware Biometric Enrollment
*   Any administrative overrides or toggle updates to emergency shields require local biometrically-backed WebAuthn authorization.
*   Symmetric keys for payload encryption are wrapped utilizing standard ECC (Elliptic Curve Cryptography) P-256 parameters.

---

## 3. Child Safety Protocols & COPPA / GDPR-K Compliance

BlurBubble provides specialized defensive configurations for children, minors, and family members. 

### 3.1 Non-Identifiable Child Beacons (Preventing Stalking)
Traditional tracking or beaconing tags introduce significant security risks by allowing third-party scanners to follow minor children. BlurBubble actively prevents this through:
*   **Rotated Cryptographic IDs**: Child tag identifiers rotate every **90 seconds** using a synchronized pseudo-random sequence generator (`CHILD_TAG_SHIELD_SECURE` protocol).
*   **Passive-Only Broadcasts**: Child tags only broadcast visual censorship requests. They do **not** reveal the child's name, age, physical coordinates, or school affiliations.

### 3.2 Legislative Compliance
*   **Children’s Online Privacy Protection Act (COPPA)**: BlurBubble is completely exempt from COPPA registration because no children's personal identifiable information (PII) is gathered or sent to cloud nodes.
*   **GDPR Recital 38 (Protection of Children's Personal Data)**: In compliance with EU GDPR-K, visual scanning systems that detect the rotated child tag MUST instantly wipe all recorded telemetry within the detection zone. Neglecting a Child Shield triggers immediate maximum penalty under Part II of the CCL-v1.

---

## 4. Multi-Sided Liability Reduction Standard (Safe Harbor Protocol)

BlurBubble bridges the regulatory gap by serving as a **bi-directional defensive shield** and legal safe harbor. Implementing this protocol reduces liabilities for all participants in spatial environments:

### 4.1 Complying Hardware Operators (Safe Harbor)
By native incorporation of the BlurBubble API, smart glasses, drones, and security camera companies qualify for the **BlurBubble Privacy Safe Harbor**:
*   **Consent-by-Default Compliance**: When a device owner records a public scene, the complying hardware scans and filters any nearby individuals broadcasting the opt-out beacon. 
*   **Exemption from Liability**: Because unconsented biometric face-hashes are redacted at the local hardware capture level (before permanent storage or transmission), operators and manufacturers are fully shielded from:
    1.  **CCPA/CPRA Statutory Fines** (regarding unauthorized gathering of personal biometric identifiers).
    2.  **GDPR Article 21 Class-Actions** (violating the absolute right to object to automated public processing).
    3.  **COPPA/GDPR-K Child Privacy Litigations** (accidental storage of minor identities).

### 4.2 Recording Device Owners (Social Compliance Shield)
Bystander hostility and legal vulnerability are resolved:
*   Because the wearable's lens natively respects opt-out boundaries, the recording device wearer cannot be sued or prosecuted for digital trespassing, non-consensual surveillance, or civil privacy violations. 
*   The hardware automatically complies on behalf of the owner, maintaining perfect social harmony and safety.

### 4.3 General Public (Personal Sovereign Agency)
*   Individuals retain the active, sovereign authority to express their privacy boundaries on-demand.
*   By downloading the dashboard or activating a passive RF beacon, the citizen receives absolute protection. If they choose not to utilize the app, they remain exposed, but are always equipped with the tools to defend themselves at any moment.

---

## 5. AI Crawler & Data Broker Opt-Out Compliance (BIPA / CCPA Automated Directives)

BlurBubble incorporates automated compliance protocols that interface with the web's foundational scraping rules and major US state privacy laws (CCPA, CPRA, BIPA).

### 5.1 Dynamic Robots.txt and LLM Dataset Refusal
BlurBubble's agent continuously broadcasts Standardized LLM Dataset Exclusions mapped to modern robots.txt policies:
*   **GPTBot (OpenAI)**: Block directives prevent OpenAI's dynamic spiders from using private media assets, social profiles, and voice transcripts in future GPT foundation training runs.
*   **Google-Extended**: Explicit opt-out tokens reject the crawling of personal web folders and audio directories by Google's Gemini training indexers.
*   **Anthropic (Claude-Bot)**: Block configurations stop crawl runs by Claude's index nodes.
*   **CCBot (Common Crawl)**: Pre-emptive metadata exclusions prevent CCBot from bundling user media footprints into open-source public training corpora.

### 5.2 Automated People Search & Data Broker Sweep
To defend against retroactive lookup networks (such as PimEyes, BeenVerified, Spokeo, and Whitepages), BlurBubble's client-side core packages cryptographically-signed CCPA "Do Not Sell My Info" and BIPA deletion directives:
*   **On-Demand Takedowns**: Upon scanning or detecting unconsented profile lookups, the dashboard automatically generates a signed CCPA Article 4 deletion request.
*   **Direct API Handshakes**: Direct compliance headers are delivered to matching database brokers, requiring automated removal within the legally mandated grace window.

