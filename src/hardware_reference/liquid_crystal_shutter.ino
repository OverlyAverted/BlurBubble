/*
 * BlurBubble Smart Privacy Glasses - Liquid Crystal Shutter Controller
 * Platform: Arduino / ATmega328P / ATTiny85
 * Core Technology: High-Voltage Liquid Crystal Lens AC Driver with Infrared Laser Interrupt
 * 
 * Description: Wearable glasses equipped with Liquid Crystal (LC) optical shutters.
 *              A high-sensitivity photodiode detects near-infrared (NIR) structured lasers
 *              (such as LIDAR autofocus, Apple FaceID 940nm VCSEL grids, or CCTV IR illuminators).
 *              Upon detection, the MCU triggers high-frequency ±12V AC square waves
 *              to cycle the LC shutter state, blinding the camera sensor's rolling shutter
 *              while remaining fully transparent to the human eye.
 * 
 * Circuit Schematic Outline:
 * 
 *                    [940nm Photodiode] ---> [Op-Amp Comparator] ---> [MCU Interrupt Pin]
 *                                                                             |
 *                                                                             v
 *    [+12V Charge Pump Boost] ---> [H-Bridge Driver (TC4424)] <------- [MCU Phase Out]
 *                                             |
 *                                    [LC Shutter Terminals]
 */

#include <Arduino.h>

// Pin Mappings
const int IR_SENSE_PIN = 2;       // Hardware Interrupt Pin (INT0 on ATmega328P)
const int PHASE_A_PIN = 5;        // Gate control A for LC H-Bridge
const int PHASE_B_PIN = 6;        // Gate control B for LC H-Bridge
const int COMPACT_STATUS_LED = 13;// Local status indicator

// State Flags
volatile bool ir_laser_detected = false;
unsigned long last_trigger_time = 0;
const unsigned long RECOVERY_DELAY_MS = 250; // Keep dark phase active for 250ms after scanner sweep

// Interrupt Service Routine (ISR) triggered by the high-speed Op-Amp comparator
void IRAM_ATTR handleIRScannerInterrupt() {
    ir_laser_detected = true;
    last_trigger_time = millis();
}

void setup() {
    pinMode(IR_SENSE_PIN, INPUT_PULLUP);
    pinMode(PHASE_A_PIN, OUTPUT);
    pinMode(PHASE_B_PIN, OUTPUT);
    pinMode(COMPACT_STATUS_LED, OUTPUT);

    // Attach hardware interrupt on the falling edge (comparator output pulled low on NIR light peak)
    attachInterrupt(digitalPinToInterrupt(IR_SENSE_PIN), handleIRScannerInterrupt, FALLING);

    // Initialize state
    digitalWrite(PHASE_A_PIN, LOW);
    digitalWrite(PHASE_B_PIN, LOW);
    digitalWrite(COMPACT_STATUS_LED, LOW);
}

/**
 * Generates an alternating AC voltage across the Liquid Crystal shutter terminals.
 * Note: LC material must NEVER be driven with permanent DC voltage, as DC currents
 * trigger electrolytic polarization, permanently destroying the LC organic molecules.
 */
void driveLiquidCrystalAC(bool active, int frequencyHz) {
    if (!active) {
        // Transparent State: Bring both terminals to GND
        digitalWrite(PHASE_A_PIN, LOW);
        digitalWrite(PHASE_B_PIN, LOW);
        digitalWrite(COMPACT_STATUS_LED, LOW);
        return;
    }

    // Active Dark/Strobe State: Generate AC square wave
    int halfPeriodUs = 1000000 / (frequencyHz * 2);
    
    // Phase 1: Terminal A High (+12V), Terminal B Low (GND) -> +12V Differential
    digitalWrite(PHASE_A_PIN, HIGH);
    digitalWrite(PHASE_B_PIN, LOW);
    digitalWrite(COMPACT_STATUS_LED, HIGH);
    delayMicroseconds(halfPeriodUs);

    // Phase 2: Terminal A Low (GND), Terminal B High (+12V) -> -12V Differential
    digitalWrite(PHASE_A_PIN, LOW);
    digitalWrite(PHASE_B_PIN, HIGH);
    delayMicroseconds(halfPeriodUs);
}

void loop() {
    // Check if the recovery timer has expired
    if (ir_laser_detected) {
        if (millis() - last_trigger_time > RECOVERY_DELAY_MS) {
            ir_laser_detected = false; // Reset protection shield
        }
    }

    if (ir_laser_detected) {
        // Blinds active camera sensors by cycling the shutter at 120Hz (harmonized to rolling sensor frequencies)
        driveLiquidCrystalAC(true, 120);
    } else {
        // Keep lenses fully transparent when no threat is present
        driveLiquidCrystalAC(false, 0);
    }
}
