# BlurBubble Physical Wearable BLE Beacon Firmware - MicroPython Script
# Target Platform: ESP32 or Raspberry Pi Pico W running MicroPython v1.19+
# Description: Custom implementation of the RFC-9402 safety broadcast protocol.
#              Packages and loops raw BLE advertisement payloads using local state vectors.

import ubluetooth
import utime
import ustruct
import urandom

# Configuration
BLUR_BUBBLE_UUID_SERVICE = 0xFD70  # Safety Service UUID
COMPANY_ID_BLURBUBBLE = 0x04BB      # Little Endian: 0xBB, 0x04 (BlurBubble Labs)
ROTATION_INTERVAL_SEC = 5          # Rotate hashes every 5 seconds

class BlurBubbleBeacon:
    def __init__(self):
        self._ble = ubluetooth.BLE()
        self._ble.active(True)
        self.sequence_number = 0
        self.psk = bytearray([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10])
        print("📡 BlurBubble MicroPython Beacon Engine loaded.")

    def generate_rolling_decoy_hash(self, seq):
        # High speed rolling XOR mask matching seed arrays
        seed1 = seq ^ 0x55AA55AA
        seed2 = (seq << 8) ^ 0x12345678
        
        decoy_hash = bytearray(16)
        for i in range(16):
            decoy_hash[i] = self.psk[i] ^ ((seed1 >> (i % 4)) & 0xFF) ^ ((seed2 >> ((i + 2) % 4)) & 0xFF)
        return decoy_hash

    def build_adv_payload(self):
        self.sequence_number += 1
        decoy_hash = self.generate_rolling_decoy_hash(self.sequence_number)

        # Assemble the raw advertising payload according to specifications:
        # [0-2]   Flags Field (General Discoverable, BR/EDR Not Supported)
        # [3-6]   16-bit Service UUID (0xFD70)
        # [7-11]  Manufacturer Specific Data Header
        # [12-27] Dynamic 16-byte Decoy Security Token Hash
        
        payload = bytearray([
            # Flags Field
            0x02, 0x01, 0x06,
            # 16-bit Service UUID length and type
            0x03, 0x03, 
            BLUR_BUBBLE_UUID_SERVICE & 0xFF, (BLUR_BUBBLE_UUID_SERVICE >> 8) & 0xFF,
            # Manufacturer specifics length and type
            0x13, 0xFF,
            # Company ID (0x04BB)
            COMPANY_ID_BLURBUBBLE & 0xFF, (COMPANY_ID_BLURBUBBLE >> 8) & 0xFF,
            # Data length within manufacturer packet
            0x10
        ])
        
        # Append our calculated decoy hash
        payload.extend(decoy_hash)
        return payload

    def start_broadcast(self):
        print("🟢 Initializing continuous safety broadcast loop...")
        while True:
            payload = self.build_adv_payload()
            
            # Start advertising with 100ms interval (100000us)
            self._ble.gap_advertise(100000, adv_data=payload, connectable=False)
            print("[BlurBubble] Broadcast refresh sequence: #{}".format(self.sequence_number))
            
            # Sleep for rotation interval, then halt advertising to update the signature payload
            utime.sleep(ROTATION_INTERVAL_SEC)
            self._ble.gap_advertise(None)

if __name__ == '__main__':
    try:
        beacon = BlurBubbleBeacon()
        beacon.start_broadcast()
    except KeyboardInterrupt:
        print("🛑 Broadcaster manually halted by hardware supervisor.")
