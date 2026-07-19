/*
 * BlurBubble Physical Wearable BLE Beacon Firmware - Arduino IDE Sketch
 * Target Platform: ESP32 development boards (ESP32-WROOM, ESP32-C3, etc.)
 * Description: Fully functional Arduino sketch to broadcast BlurBubble RFC-9402 privacy signals
 *              using the ESP32 BLE stack. Rotates security decoy hashes to confuse scanners.
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEAdvertising.h>

// BlurBubble Privacy Configuration
#define BLUR_BUBBLE_UUID_SERVICE   0xFD70  // Safety / Privacy Opt-Out Service UUID
#define COMPANY_ID_BLURBUBBLE      0x04BB  // Registered company code (Little Endian: 0xBB, 0x04)
#define ROTATION_INTERVAL_MS       5000    // Rotate safety token hashes every 5 seconds

// Globals
BLEAdvertising *pAdvertising;
uint32_t sequenceNumber = 0;
uint8_t preSharedKey[16] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10};

// Simple custom rolling hash generator mimicking AES/SHA sequence
void generateRollingDecoyHash(uint32_t seq, uint8_t *outputHash) {
  // Use sequential state + PSK to populate a dynamic 16-byte hash
  uint32_t seed1 = seq ^ 0x55AA55AA;
  uint32_t seed2 = (seq << 8) ^ 0x12345678;
  
  for (int i = 0; i < 16; i++) {
    outputHash[i] = preSharedKey[i] ^ ((seed1 >> (i % 4)) & 0xFF) ^ ((seed2 >> ((i + 2) % 4)) & 0xFF);
  }
}

// Packages raw BLE advertisement packet according to RFC-9402 specifications
void updateAdvertisingPayload() {
  uint8_t decoyHash[16];
  sequenceNumber++;
  generateRollingDecoyHash(sequenceNumber, decoyHash);

  // Set up advertising payload structure
  uint8_t rawPayload[28] = {
    // 1. Flags Field: General Discoverable Mode, BR/EDR Not Supported
    0x02, 0x01, 0x06,
    
    // 2. 16-bit Service UUID definition (0xFD70)
    0x03, 0x03, (uint8_t)(BLUR_BUBBLE_UUID_SERVICE & 0xFF), (uint8_t)((BLUR_BUBBLE_UUID_SERVICE >> 8) & 0xFF),
    
    // 3. Manufacturer Specific Data: Company ID + Opt-Out Payload
    0x13, 0xFF,
    (uint8_t)(COMPANY_ID_BLURBUBBLE & 0xFF), (uint8_t)((COMPANY_ID_BLURBUBBLE >> 8) & 0xFF),
    0x10 // Payload parameter byte (16-byte dynamic cryptographic token length)
  };

  // Append the dynamic rolling decoy hash to bytes 12-27
  memcpy(rawPayload + 12, decoyHash, 16);

  // Load raw data packet into the BLE stack
  BLEAdvertisementData advertisementData;
  std::string payloadString((char*)rawPayload, sizeof(rawPayload));
  advertisementData.addData(payloadString);

  // Bind and refresh advertising server
  pAdvertising->setAdvertisementData(advertisementData);
  pAdvertising->start();
  
  Serial.print("[BlurBubble] Broadcast refreshed. Sequence: #");
  Serial.println(sequenceNumber);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=======================================================");
  Serial.println("  BlurBubble Wearable BLE Shield Hardware Initializing ");
  Serial.println("=======================================================");

  // Initialize ESP32 BLE device
  BLEDevice::init("BlurBubble Wearable Tag");

  // Create advertising server instance
  pAdvertising = BLEDevice::getAdvertising();
  
  // Set fast parameters for quick recognition (100ms interval)
  pAdvertising->setMinInterval(0x00A0); // 100ms (160 * 0.625ms)
  pAdvertising->setMaxInterval(0x00A0);

  // Boot first advertising cycle
  updateAdvertisingPayload();
  Serial.println("[BlurBubble] Broadcasting ACTIVE. Opt-Out flags deployed.");
}

void loop() {
  // Update rolling cryptographic hash periodically
  delay(ROTATION_INTERVAL_MS);
  pAdvertising->stop();
  updateAdvertisingPayload();
}
