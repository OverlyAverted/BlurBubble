/*
 * BlurBubble Physical Wearable BLE Beacon Firmware
 * Target: ESP32 or nRF52 series microcontroller
 * Description: Implements low-power Bluetooth Low Energy (BLE) non-connectable 
 *              advertisements with a rolling 128-bit decoy hash and rotating MAC address
 *              to prevent device profiling and track physical protection signals.
 */

#include <stdio.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_gattc_api.h"
#include "esp_gatt_common_api.h"
#include "esp_bt_main.h"
#include "esp_bt_device.h"
#include "mbedtls/sha256.h"

// BlurBubble Constants
#define BLUR_BUBBLE_UUID_SERVICE   0xFD70  // Hypothetical registered safety service UUID
#define MAC_ROTATION_INTERVAL_SEC  180     // Rotate MAC address every 3 minutes to prevent tracking
#define ADV_INTERVAL_MS            100     // Fast advertising interval for responsive coverage

// Dynamic system state
static uint32_t message_sequence = 0;
static uint8_t shared_ecc_secret[32] = {0x01, 0x02, 0x03, 0x04}; // Initialized during initial sync pairing

// BLE advertising parameters
static esp_ble_adv_params_t ble_adv_params = {
    .adv_int_min        = ADV_INTERVAL_MS * 1.6, // in 0.625ms units
    .adv_int_max        = ADV_INTERVAL_MS * 1.6,
    .adv_type           = ADV_TYPE_NONCONN_IND,  // Non-connectable broadcast beacon
    .own_addr_type      = BLE_ADDR_TYPE_RANDOM,  // Rotate MAC address using Random Private Address space
    .channel_map        = ADV_CHNL_ALL,
    .adv_filter_policy  = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
};

// Generates a rolling 128-bit (16-byte) decoy privacy-hash for active shielding
void generate_rolling_decoy_hash(uint8_t *output_hash) {
    uint8_t input_buffer[36];
    uint8_t full_sha[32];
    
    // Salt with sequence number to ensure uniqueness
    message_sequence++;
    memcpy(input_buffer, shared_ecc_secret, 32);
    memcpy(input_buffer + 32, &message_sequence, sizeof(message_sequence));
    
    // Calculate SHA-256
    mbedtls_sha256_context ctx;
    mbedtls_sha256_init(&ctx);
    mbedtls_sha256_starts(&ctx, 0);
    mbedtls_sha256_update(&ctx, input_buffer, sizeof(input_buffer));
    mbedtls_sha256_finish(&ctx, full_sha);
    mbedtls_sha256_free(&ctx);
    
    // Truncate to first 16 bytes (128-bit decoy hash) to fit BLE payload overhead
    memcpy(output_hash, full_sha, 16);
}

// Generates a random cryptographic MAC address to prevent tracking
void rotate_device_mac_address() {
    uint8_t random_mac[6];
    esp_fill_random(random_mac, 6);
    
    // Set two MSB bits to 1 for BLE Random Static Address specifications
    random_mac[0] |= 0xC0; 
    
    printf("📡 Rotating MAC Address: %02X:%02X:%02X:%02X:%02X:%02X\n",
           random_mac[0], random_mac[1], random_mac[2],
           random_mac[3], random_mac[4], random_mac[5]);
           
    esp_ble_gap_set_rand_addr(random_mac);
}

// Configures and mounts the custom BLE privacy payload
void update_advertising_payload() {
    uint8_t active_decoy_hash[16];
    generate_rolling_decoy_hash(active_decoy_hash);
    
    // Build BLE AD fields
    // [Length] [Type] [Data]
    uint8_t adv_data[31] = {
        // Flags Field: General Discoverable Mode, BR/EDR Not Supported
        0x02, 0x01, 0x06,
        
        // 16-bit Service UUID
        0x03, 0x03, (uint8_t)(BLUR_BUBBLE_UUID_SERVICE & 0xFF), (uint8_t)((BLUR_BUBBLE_UUID_SERVICE >> 8) & 0xFF),
        
        // Custom Manufacturer Specific Data (Company ID & Shielding Decoy Hash)
        0x13, 0xFF,
        0xBB, 0x04, // Company Identifier: 0x04BB (BlurBubble Labs)
        0x10,       // Data Length for safety parameters (16 bytes payload)
    };
    
    // Copy the generated 16-byte active decoy security signature
    memcpy(adv_data + 9, active_decoy_hash, 16);
    
    // Set custom payload via BLE stack
    esp_ble_gap_config_adv_data_raw(adv_data, sizeof(adv_data));
}

// Hardware timer or task loop
void beacon_control_loop(void *pvParameters) {
    uint32_t last_mac_rotation = 0;
    
    while(1) {
        // 1. Check if it is time to cycle the MAC address for trackability protection
        uint32_t now = xTaskGetTickCount() * portTICK_PERIOD_MS / 1000;
        if (now - last_mac_rotation >= MAC_ROTATION_INTERVAL_SEC) {
            esp_ble_gap_stop_advertising();
            rotate_device_mac_address();
            last_mac_rotation = now;
            esp_ble_gap_start_advertising(&ble_adv_params);
        }
        
        // 2. Rotate the 128-bit rolling decoy hash to maintain active protection sync
        update_advertising_payload();
        
        // Yield execution for 5 seconds before updating the broadcast payload
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
}
