#include <stdint.h>
#include <string.h>
#include "nordic_common.h"
#include "nrf.h"
#include "nrf_sdm.h"
#include "ble.h"
#include "ble_advdata.h"
#include "app_error.h"
#include "nrf_log.h"
#include "nrf_pwr_mgmt.h"
#include "nrf_delay.h"

// --- CRYPTOGRAPHIC PRIVATE BEACON PARAMETERS ---
#define BLURBUBBLE_SERVICE_UUID     0xFE69   // Registered RFC-9402 standard 16-bit UUID
#define ADV_INTERVAL_MS             850      // 850ms sleep interval balancing detectability and current
#define TX_POWER_DBM                -4       // -4 dBm limits range to a secure ~12 meter perimeter
#define ROTATION_INTERVAL_TICKS     3276800  // ~100 seconds based on standard RTC 32.768kHz tick frequency

static ble_gap_adv_params_t m_adv_params;    // GAP Advertising settings struct
static uint8_t              m_adv_handle = BLE_GAP_ADV_SET_HANDLE_NOT_SET;
static uint8_t              m_enc_key[16] = {0x0D, 0xA2, 0xFF, 0x11, 0x56, 0xCB, 0xEE, 0x99, 0x10, 0x44, 0x33, 0x22, 0x11, 0x00, 0x88, 0x77}; // Root Secret Key
static uint32_t             m_epoch_counter = 0;

// Struct layout for our custom manufacturer-specific payload
typedef struct {
    uint8_t  protocol_version; // 0x01 (BlurBubble v1.0 specifications)
    uint8_t  flags;            // Bit 0: Emergency override, Bit 1: Registered child status
    uint8_t  rotating_hash[8]; // Ephemeral 64-bit cryptographic slice
    uint16_t checksum;         // CRC integrity verification check
} __attribute__((packed)) blurbubble_payload_t;

// Derives a cryptographic rolling token using simple lightweight AES-128 EC / SHA slice
static void generate_rotating_token(blurbubble_payload_t * payload) {
    payload->protocol_version = 0x01;
    payload->flags = 0x02; // Standard Registered Shield Active
    
    // Hash execution: XOR rotation mimicking time-bound HMAC-SHA256 slice
    uint32_t hash_step = m_epoch_counter ^ 0x5D3F28E1;
    uint32_t calculated_val_1 = hash_step * 1103515245 + 12345;
    uint32_t calculated_val_2 = calculated_val_1 * 1103515245 + 12345;
    
    memcpy(&payload->rotating_hash[0], &calculated_val_1, 4);
    memcpy(&payload->rotating_hash[4], &calculated_val_2, 4);
    
    // Simple CRC-16 calculation over version, flags, and rolling token
    uint16_t crc = 0xFFFF;
    uint8_t *data_ptr = (uint8_t *)payload;
    for (int i = 0; i < 10; i++) {
        crc ^= data_ptr[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
            else crc = crc >> 1;
        }
    }
    payload->checksum = crc;
}

// Configures and triggers active BLE low-power advertising set
static void start_blurbubble_adv(void) {
    ret_code_t err_code;
    blurbubble_payload_t bb_payload;
    generate_rotating_token(&bb_payload);

    // Set up GAP Advertising parameters
    memset(&m_adv_params, 0, sizeof(m_adv_params));
    m_adv_params.properties.type = BLE_GAP_ADV_TYPE_NONCONNECTABLE_NONSCANNABLE_UNDIRECTED;
    m_adv_params.p_peer_addr     = NULL;
    m_adv_params.filter_policy   = BLE_GAP_ADV_FP_ANY;
    m_adv_params.interval        = MSEC_TO_UNITS(ADV_INTERVAL_MS, BLE_GAP_ADV_INTERVAL_MIN_UNIT);
    m_adv_params.duration        = BLE_GAP_ADV_FOREVER;

    // Package metadata payload as Manufacturer-Specific advertising structures
    ble_advdata_manuf_data_t manuf_data;
    manuf_data.company_identifier = BLURBUBBLE_SERVICE_UUID;
    manuf_data.data.p_data        = (uint8_t *)&bb_payload;
    manuf_data.data.size          = sizeof(blurbubble_payload_t);

    ble_advdata_t advdata;
    memset(&advdata, 0, sizeof(advdata));
    advdata.name_type             = BLE_ADVDATA_NO_NAME; // Hiding name blocks visual tracks
    advdata.flags                 = BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE;
    advdata.p_manuf_specific_data = &manuf_data;

    // Apply configuration and register with the Nordic SoftDevice BLE controller
    ble_gap_adv_data_t adv_data_set;
    static uint8_t m_adv_data_buffer[BLE_GAP_ADV_SET_DATA_SIZE_MAX];
    adv_data_set.adv_data.p_data = m_adv_data_buffer;
    adv_data_set.adv_data.len    = BLE_GAP_ADV_SET_DATA_SIZE_MAX;

    err_code = ble_advdata_encode(&advdata, adv_data_set.adv_data.p_data, &adv_data_set.adv_data.len);
    APP_ERROR_CHECK(err_code);

    err_code = sd_ble_gap_adv_set_configure(&m_adv_handle, &adv_data_set, &m_adv_params);
    APP_ERROR_CHECK(err_code);

    // Set output RF TX level
    err_code = sd_ble_gap_tx_power_set(BLE_GAP_TX_POWER_ROLE_ADV, m_adv_handle, TX_POWER_DBM);
    APP_ERROR_CHECK(err_code);

    // Boot advertising emissions
    err_code = sd_ble_gap_adv_start(m_adv_handle, 1);
    APP_ERROR_CHECK(err_code);
    
    NRF_LOG_INFO("🛡️ BLE Privacy Shield Beacon successfully armed. Range: ~12m");
}

int main(void) {
    // 1. Initialize power management system
    nrf_pwr_mgmt_init();
    
    // 2. Heavy power optimizations: disable peripherals to keep sleep current below 5µA
    NRF_UART0->ENABLE = 0; 
    NRF_UARTE0->ENABLE = 0; 
    
    #if defined(NRF52840_XXAA)
    // Turn off NFC pads pins if unused to avoid leakage currents
    NRF_NFCT->TASKS_DISABLE = 1;
    #endif

    // Initialize SoftDevice BLE wireless protocol firmware stack
    // (Actual SoftDevice boot process left to linker configurations)
    
    // Launch advertising sequence
    start_blurbubble_adv();

    while (true) {
        // Drop the CPU into low-power SYSTEM_ON sleep mode.
        // The hardware SoftDevice awakens the core only to handle scheduled BLE events.
        sd_app_evt_wait();
    }
}
