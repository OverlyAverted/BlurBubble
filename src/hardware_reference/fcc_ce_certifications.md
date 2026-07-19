# BlurBubble Hardware Regulatory Strategy - FCC & CE Radio Certifications
**Product Class**: Intentional Radiator (BLE v5.3 Tracker / Keychain Shield)  
**Applicable Jurisdictions**: United States (FCC), European Union (CE), Canada (ISED)  

To legally distribute the BlurBubble physical privacy hardware beacon, the system must undergo laboratory testing and achieve formal regulatory authorization. This document outlines the testing protocols, applicable harmonized standards, SAR limits, and mitigation strategies to guarantee zero-failure certification runs.

---

## 📻 1. European Union (CE RED) Compliance Framework

Under the **Radio Equipment Directive (RED) 2014/53/EU**, the device falls under Class 1 radio equipment. It must satisfy the following harmonized standards:

### Core Standards Requirements
1.  **RF Performance (Article 3.2)**: **EN 300 328 v2.2.2**
    *   *Test Scenario*: Wideband transmission systems operating in the 2.4 GHz ISM band.
    *   *Limit*: Maximum equivalent isotropically radiated power (e.i.r.p.) must not exceed **20 dBm (100 mW)**. (BlurBubble is capped at **+4 dBm / 2.5 mW** to maximize battery life, offering an 16dB safety margin).
2.  **Electromagnetic Compatibility (Article 3.1b)**: **EN 301 489-1 v2.2.3** & **EN 301 489-17 v3.2.4**
    *   *Test Scenario*: Radiated and conducted immunity, electrostatic discharge (ESD) immunity.
    *   *ESD Requirements*: ±4 kV contact discharge, ±8 kV air discharge without degradation of internal cryptographic state or loop execution.
3.  **Safety & Health (Article 3.1a)**: **EN 62368-1:2020** & **EN 62479:2010**
    *   *Test Scenario*: Low-power electronic equipment safety and human exposure to electromagnetic fields.

---

## 🇺🇸 2. United States (FCC) Certification Framework

The device is classified as an **Intentional Radiator** under **FCC Title 47 CFR Part 15, Subpart C (Section 15.247)**.

### Testing Parameters & FCC Thresholds
*   **FCC ID Acquisition**: Requires filing a certified test report to an FCC-recognized Telecommunication Certification Body (TCB).
*   **Conducted Output Power (15.247(b)(3))**: Peak conducted output power must not exceed **30 dBm (1 Watt)**.
*   **Spurious Radiated Emissions (15.209)**: Emissions originating from the digital circuitry and crystal harmonic overtones must not exceed:
    *   *30 MHz – 88 MHz*: 40 dBµV/m at 3 meters
    *   *88 MHz – 216 MHz*: 43.5 dBµV/m at 3 meters
    *   *216 MHz – 960 MHz*: 46 dBµV/m at 3 meters
    *   *Above 960 MHz*: 54 dBµV/m at 3 meters (with an absolute notch filter targeting 2.40–2.4835 GHz harmonics).
*   **Power Spectral Density (15.247(e))**: Must not be greater than **8 dBm** in any 3 kHz band during active transmissions.

---

## 👤 3. Specific Absorption Rate (SAR) & Human Exposure

Because the BlurBubble hardware is designed as a body-worn accessory (worn as a pendant, keychain, or integrated into action cameras), it must pass strict human RF exposure testing.

### Exposure Limits
*   **FCC General Population/Uncontrolled Exposure**: Limit is **1.6 W/kg** averaged over **1 gram** of actual tissue.
*   **CE RED European Council Recommendation 1999/519/EC**: Limit is **2.0 W/kg** averaged over **10 grams** of head and trunk tissue.
*   **BlurBubble Exemption Analysis**: 
    *   Under **FCC KDB 447498 D01**, the 1-g SAR exclusion threshold is calculated as:
        $$\text{SAR Factor} = \frac{\text{Power (mW)}}{\text{Min Distance (mm)}} \times \sqrt{\text{Frequency (GHz)}}$$
    *   For BlurBubble: Power is 2.5mW (+4dBm), minimum distance is 5mm, frequency is 2.44GHz.
        $$\text{SAR Factor} = \frac{2.5}{5} \times \sqrt{2.44} = 0.5 \times 1.56 = 0.78$$
    *   Since **0.78 is far below the FCC Exclusion Threshold of 3.0**, the device is **exempt from physical SAR head/body testing** inside the United States, saving upwards of $15,000 in testing costs.
    *   Similarly, under **EN 62479**, the low power output (<20mW) qualifies the device for automatic exposure exemption in the European Union.

---

## 🛡️ 4. EMI Mitigation & Antenna Coexistence Strategies

To prevent costly re-testing cycles due to high-frequency harmonic leakage, several physical board mitigations are embedded directly into the layout:

```
        +-----------------------------------------------------------+
        |                 SHIELDING CAN ENCLOSURE                   |
        |  +---------------+    +-------------------+   +--------+  |
        |  |  ESP32-C3     |--->|  Pi Filter        |-->| Notched|<=== (Grounded Shield Core)
        |  |  BLE SoC      |    |  C1 - L1 - C2     |   | Ferrite|  |
        |  +---------------+    +-------------------+   +--------+  |
        +---------------------------------------------------|-------+
                                                            |
                                                            v
                                                  [Johanson Antenna]
```

1.  **Metal Shielding Can**: A stamped-tin/copper shielding enclosure (Laird Technologies 97-0550-02) covers the ESP32-C3 core, crystal oscillators, and LDO buck converters. This contains electromagnetic noise and keeps radiated emissions within limits.
2.  **Solder Mask Multi-Via Fencing**: Via fencing (via spacing of 20 mil) is routed along the edge of the RF microstrip trace to isolate the high-speed feed lines and ground returns from interfering with the analog sensors on the board.
3.  **Low-Pass Filter (LPF)**: A high-attenuation multilayer ferrite chip bead (Murata BLM15GG221SN1D) is placed in series with the VDD line of the RF amplifier stages to suppress third and fifth-order harmonics (7.2 GHz and 12.0 GHz) generated by rapid BLE switching.

---

## 📋 5. Pre-Compliance Testing Checklists

Prior to booking official accredited laboratory sessions, developers must verify the device performance using near-field probes, a spectrum analyzer, and an ESD simulator:

- [ ] **Checklist 1: Conducted Power Verification**
  * Use a calibrated RF coaxial pigtail soldered to the output matching pad.
  * Confirm peak power does not exceed +4.5dBm across BLE channels 37, 38, and 39.
- [ ] **Checklist 2: Frequency Stability Testing**
  * Place the device inside a thermal chamber.
  * Verify carrier drift stays within ±10ppm across the operational temperature range (-20°C to +70°C).
- [ ] **Checklist 3: ESD Stress Resilience**
  * Apply 10 contact pulses of 4kV to the metal keychain retention ring and plastic buttons.
  * Confirm the internal memory registers do not experience state corruptions or watchdog reboots.
- [ ] **Checklist 4: Harmonic Attenuation**
  * Sweep up to 26GHz using a low-noise amplifier (LNA) connected to the analyzer.
  * Confirm all spurious emissions at 4.88GHz and 7.32GHz remain below -41.3dBm (FCC restricted band limit).
