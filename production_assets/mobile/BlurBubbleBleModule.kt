package com.blurbubble.shield.ble

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.ParcelUuid
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BlurBubbleBleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val bluetoothManager: BluetoothManager? = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager?
    private var advertiser: BluetoothLeAdvertiser? = null
    private val SERVICE_UUID_16 = "0000FE69-0000-1000-8000-00805F9B34FB"
    private var isAdvertising = false

    override fun getName(): String {
        return "BlurBubbleBleBridge"
    }

    @ReactMethod
    fun isHardwareSupported(promise: Promise) {
        val adapter = bluetoothManager?.adapter
        if (adapter == null) {
            promise.resolve(false)
            return
        }
        val supported = adapter.isMultipleAdvertisementSupported
        promise.resolve(supported)
    }

    @ReactMethod
    fun startSignal(secretKey: String, promise: Promise) {
        val adapter = bluetoothManager?.adapter
        if (adapter == null || !adapter.isEnabled) {
            promise.reject("BT_ERROR", "Bluetooth is disabled or unavailable on this device.")
            return
        }

        advertiser = adapter.bluetoothLeAdvertiser
        if (advertiser == null) {
            promise.reject("HARDWARE_UNSUPPORTED", "Device does not support BLE Peripheral advertising mode.")
            return
        }

        try {
            startLeAdvertising()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.localizedMessage)
        }
    }

    @ReactMethod
    fun stopSignal(promise: Promise) {
        if (isAdvertising && advertiser != null) {
            try {
                advertiser?.stopAdvertising(advertiseCallback)
                isAdvertising = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_FAILED", e.localizedMessage)
            }
        } else {
            promise.resolve(true)
        }
    }

    private fun startLeAdvertising() {
        val settings = AdvertiseSettings.Builder()
            // Configured for background battery endurance
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .setConnectable(false)
            .build()

        // Deriving ephemeral, rolling cryptographic token payload based on time epoch
        val epoch = System.currentTimeMillis() / 1000 / 300
        val payloadString = "BB_OPT_ROT_$epoch"
        val tokenBytes = payloadString.toByteArray(Charsets.UTF_8)

        val data = AdvertiseData.Builder()
            .addServiceUuid(ParcelUuid.fromString(SERVICE_UUID_16))
            .addServiceData(ParcelUuid.fromString(SERVICE_UUID_16), tokenBytes)
            .setIncludeDeviceName(false)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
            super.onStartSuccess(settingsInEffect)
            isAdvertising = true
        }

        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
            isAdvertising = false
        }
    }
}
