import Foundation
import CoreBluetooth

@objc(BlurBubbleBleBridge)
class BlurBubbleBleBridge: NSObject, CBPeripheralManagerDelegate {
    private var peripheralManager: CBPeripheralManager?
    private var isAdvertising = false
    private var serviceUUID = CBUUID(string: "FE69")
    private var tokenTimer: Timer?
    
    // Core root secret shared key used to sync rolling keys
    private var userSecretKey: String = ""

    // Check if Bluetooth is authorized and enabled
    @objc
    func isHardwareSupported(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let state = CBPeripheralManager.authorizationStatus()
        if state == .restricted || state == .denied {
            resolve(false)
        } else {
            resolve(true)
        }
    }

    // Initialize and boot localized privacy signals
    @objc
    func startSignal(_ secretKey: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        self.userSecretKey = secretKey
        
        if peripheralManager == nil {
            peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
        }
        
        startBroadcastingProcess()
        resolve(true)
    }

    // Stop all background emissions immediately
    @objc
    func stopSignal(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        tokenTimer?.invalidate()
        tokenTimer = nil
        
        if let manager = peripheralManager, isAdvertising {
            manager.stopAdvertising()
            isAdvertising = false
        }
        resolve(true)
    }

    private func startBroadcastingProcess() {
        tokenTimer?.invalidate()
        advertiseCurrentToken()
        
        // Setup background 300s token rotation
        tokenTimer = Timer.scheduledTimer(withTimeInterval: 300.0, repeats: true) { [weak self] _ in
            self?.rotateAdvertisingToken()
        }
    }

    private func rotateAdvertisingToken() {
        if let manager = peripheralManager, isAdvertising {
            manager.stopAdvertising()
        }
        advertiseCurrentToken()
    }

    private func advertiseCurrentToken() {
        guard let manager = peripheralManager, manager.state == .poweredOn else { return }
        
        let epoch = Int(Date().timeIntervalSince1970) / 300
        let payloadString = "BB_OPT_ROT_\(epoch)"
        let manufacturerData = payloadString.data(using: .utf8)!
        
        // iOS background overflow mode utilizes service UUIDs to preserve energy
        let adData: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: [serviceUUID],
            CBAdvertisementDataLocalNameKey: "BlurBubble_Shield",
            CBAdvertisementDataManufacturerDataKey: manufacturerData
        ]
        
        manager.startAdvertising(adData)
        isAdvertising = true
    }

    // --- CBPeripheralManagerDelegate Protocol Implementation ---
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            if !isAdvertising && !userSecretKey.isEmpty {
                startBroadcastingProcess()
            }
        } else {
            isAdvertising = false
        }
    }

    // Required React Native NativeModule thread declarations
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
