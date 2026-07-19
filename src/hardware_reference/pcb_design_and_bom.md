# BlurBubble Physical Wearable Privacy Beacon - PCB Design, Schematic & BOM
**Hardware Revision**: v2.1.0-Tactical  
**Target Platform**: Ultra-low power BLE 5.3 Badge / Keychain Tracker  
**Standards Compliance**: RFC-9402 Compliance Broadcasting  

This reference document outlines the physical hardware architecture, electrical schematics, PCB layout routing constraints, and the Bill of Materials (BOM) required to manufacture the physical BlurBubble hardware token.

---

## 📐 1. PCB Stackup & Routing Specifications

To ensure robust RF performance and maximize battery life, a **4-layer PCB** stackup is specified. This minimizes parasitic capacitance, isolates high-frequency BLE matching networks, and optimizes heat dissipation.

```
          [ Layer 1: Top Signal / RF Microstrip ] (1.6 mil Copper)
          ---------------------------------------------------------
          === Dielectric: Prepreg (FR4, Dielectric Constant 4.2) ===
          ---------------------------------------------------------
          [ Layer 2: Solid Ground Plane ]         (1.2 mil Copper)
          ---------------------------------------------------------
          === Dielectric: Core (FR4, Dielectric Constant 4.2) ======
          ---------------------------------------------------------
          [ Layer 3: Solid Power Plane (3.3V/VBAT) ] (1.2 mil Copper)
          ---------------------------------------------------------
          === Dielectric: Prepreg (FR4, Dielectric Constant 4.2) ===
          ---------------------------------------------------------
          [ Layer 4: Bottom Signal / GPIO Lines ]  (1.6 mil Copper)
```

### RF Trace Layout & Impedance Matching
*   **Trace Width**: 18.2 mil trace width on Layer 1 over the Solid Ground Plane (Layer 2) with a 6.0 mil gap to adjacent copper pours to achieve exactly **50-Ohm characteristic impedance** at 2.44 GHz.
*   **Antenna Selection**: Ceramic chip antenna (2.45 GHz, Johanson Technology 2450AT18A100E) with a dedicated Pi-matching filter network:
    *   **C1 (Shunt)**: 1.2 pF (Murata GRM1555C1H1R2WA01D)
    *   **L1 (Series)**: 2.7 nH (Murata LQP15MN2N7B02D)
    *   **C2 (Shunt)**: 1.5 pF (Murata GRM1555C1H1R5WA01D)
*   **Vias**: Standard 8 mil drill / 16 mil pad vias. Micro-vias are bypassed to minimize manufacturing costs. No vias are placed on the RF trace itself to prevent impedance discontinuities.

---

## ⚡ 2. Power Management & Battery Optimization

To operate for 12+ months on a single small lithium coin-cell battery (CR2032, 220mAh), the system utilizes aggressive power gating and highly efficient low-dropout regulators (LDOs).

### Active Power States & Duty Cycling
1.  **Deep Sleep State (98.2% of lifecycle)**:
    *   RF transceiver disabled. High-frequency 32MHz crystal oscillator powered down.
    *   System runs on a low-speed internal 32.768kHz RC oscillator.
    *   Current consumption: **1.8 µA**.
2.  **Broadcast Burst State (1.8% of lifecycle)**:
    *   Processor wakes up via internal hardware timer every 5000ms.
    *   Computes the dynamic 16-byte cryptographic decoy signature block.
    *   Transmits three BLE non-connectable advertisement packets on channels 37, 38, and 39 at +4dBm output power.
    *   Active period: **2.4 milliseconds**.
    *   Peak Current consumption during TX: **18.5 mA**.
3.  **Average System Consumption**:
    *   Formula: $I_{avg} = (I_{sleep} \times T_{sleep} + I_{tx} \times T_{tx}) / (T_{sleep} + T_{tx})$
    *   Calculated Average Current: **20.6 µA**.
    *   Battery Lifespan: $220\text{ mAh} / 0.0206\text{ mA} = 10,679\text{ hours} \approx 444\text{ days}$.

### Power Delivery Network (PDN) Schematic Blueprint
```
        [CR2032 3.0V Battery] ---+---> [C_in: 10uF MLCC] ---> [TPS62740 Buck Converter]
                                 |                                  |
                                [D1: Schottky Protection]          [C_out: 22uF MLCC]
                                 |                                  |
                                 v                                  v
                            [TP4056 PMIC] ---> (Optional LiPo) ---> [3.3V System Rail]
```
*   **DC-DC Regulator**: TI **TPS62740** ultra-low Iq buck converter. It offers a static quiescent current of 360nA, preserving battery efficiency even at micro-amp loads.
*   **Optional LiPo Charger**: integrated **TP4056** circuit on the board's edge to support rechargeable lanyard badges with Micro-USB/USB-C charging terminals.

---

## 📦 3. Bill of Materials (BOM)

| Ref Des | Qty | Value | Package | Description | Manufacturer | Part Number |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **U1** | 1 | ESP32-C3FN4 | QFN-32 | Single-Core RISC-V SoC with BLE 5.3 and 4MB Flash | Espressif | ESP32-C3FN4 |
| **U2** | 1 | TPS62740DSSR | WSON-12 | 360nA Iq Step-Down Buck Regulator | Texas Instruments | TPS62740DSSR |
| **ANT1** | 1 | 2.45 GHz | SMD-1206 | High-Gain Ceramic Chip RF Antenna | Johanson Tech | 2450AT18A100E |
| **X1** | 1 | 32.000 MHz | SMD-2016 | 10pF, 10ppm Quartz Crystal Oscillator | Epson | NX2016SA |
| **X2** | 1 | 32.768 kHz | SMD-2012 | 12.5pF, 20ppm RTC Oscillator (Low Power Keep-Alive) | Abracon | ABS07-120-32.768KHZ-T |
| **U3** | 1 | TP4056 | SOP-8 | Li-Ion Linear Battery Charger PMIC (Optional) | Nanorad | TP4056 |
| **BT1** | 1 | CR2032 Retainer| SMD-COIN | Gold-plated stainless steel coin-cell holder | Keystone | 1058 |
| **C1** | 1 | 1.2 pF | 0402 | RF Shunt Ceramic Capacitor, High-Q | Murata | GRM1555C1H1R2WA01D |
| **L1** | 1 | 2.7 nH | 0402 | RF Series High-Q Chip Inductor | Murata | LQP15MN2N7B02D |
| **C2** | 1 | 1.5 pF | 0402 | RF Shunt Ceramic Capacitor, High-Q | Murata | GRM1555C1H1R5WA01D |
| **C3, C4**| 2 | 10 µF | 0603 | Input/Output Filter Capacitor, X5R 6.3V | TDK | C1608X5R0J106M080AB |
| **C5** | 1 | 22 µF | 0603 | Regulator Reservoir Capacitor, X5R 6.3V | Samsung | CL10A226MQ8NRNC |
| **R1** | 1 | 100 kΩ | 0402 | CHIP_PU Reset Pull-Up Resistor, 1% | Yageo | RC0402FR-07100KL |
| **LED1** | 1 | RGB Status | SMD-0606 | Ultra-bright low current RGB indicator | Wurth Elektronik | 150066SV74000 |

---

## 🛠️ 4. Mechanical Enclosure & Plastic Casing Design

The physical casing is engineered for rugged tactical use, utilizing a double-shot injection molding process to bond rigid **Acrylonitrile Butadiene Styrene (ABS)** with high-elasticity **Thermoplastic Polyurethane (TPU)**.

### Enclosure Dimensional Architecture (CAD Specifications)
*   **External Form Factor**: Circular coin shape, optimized for pocket carrying or lanyard attachments.
    *   **Diameter**: 22.4 mm
    *   **Max Thickness**: 5.2 mm
    *   **Internal Clearance**: 1.2 mm buffer on all PCB dimensions to protect component solder joints during drops.
*   **Material Composition**:
    *   **Core Shell**: Injection-molded ABS-Black (SABIC CYCOLAC GP500). High mechanical rigidity and radio transparency for the 2.4GHz spectrum.
    *   **Protective Ring**: TPU-Green (BASF Elastollan 1185A). Shore hardness 85A to absorb impacts up to 5 meters.
*   **Waterproofing**: Ultrasonic sonic-welding along the seam line or a custom synthetic silicone rubber O-ring to enforce **IP67 dust and water resistance**.
*   **Apertures & Interfaces**:
    *   **Tactile Shutter Trigger Button**: Soft TPU membrane button to activate the system's "Emergency Redact State" via immediate physical interrupt pin routing.
    *   **RGB Light Pipe**: Transparent Polycarbonate (PC) cylinder to project status LEDs outward without breaking structural waterproofing seals.
