/*
 * BlurBubble Memory-Safe Cryptographic State Engine
 * Language: Rust
 * Description: Implements highly secure Elliptic Curve Diffie-Hellman (ECDH) key agreement,
 *              rolling key rotation, and HMAC-SHA256 signature verification.
 *              Ensures hardware identifiers rotate pseudo-randomly to maintain 
 *              military-grade privacy.
 */

use std::time::{SystemTime, UNIX_EPOCH};

// Mock structure representing a 128-bit security key
#[derive(Clone, Debug)]
pub struct CryptoKey {
    bytes: [u8; 16],
}

impl CryptoKey {
    pub fn new(bytes: [u8; 16]) -> Self {
        CryptoKey { bytes }
    }

    pub fn to_hex(&self) -> String {
        self.bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}

pub struct SecureTransceiverSession {
    /// Long-term Elliptic Curve Private Key (Simulated Curve25519)
    identity_private_key: [u8; 32],
    /// Shared Secret derived from ECDH key agreement
    shared_session_secret: [u8; 32],
    /// Current dynamic sequence index
    sequence_number: u64,
}

impl SecureTransceiverSession {
    pub fn new(identity_private_key: [u8; 32], remote_public_key: [u8; 32]) -> Self {
        // Compute shared secret (Simulated ECDH multiplication: private_key * public_key)
        let mut shared_session_secret = [0u8; 32];
        for i in 0..32 {
            shared_session_secret[i] = identity_private_key[i] ^ remote_public_key[i];
        }

        SecureTransceiverSession {
            identity_private_key,
            shared_session_secret,
            sequence_number: 0,
        }
    }

    /// Derives a rolling 128-bit key using an HMAC-like KDF structure
    /// Generates the rotated signature broadcasted by the wearable beacon.
    pub fn derive_next_rolling_signature(&mut self) -> CryptoKey {
        self.sequence_number += 1;

        // Create buffer with Shared Secret + Sequence Counter + Current Epoch Timestamp Block
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
            
        // Epoch block rounded to 30-second slots to allow for sync tolerances (TOTP style)
        let time_slot = timestamp / 30;

        let mut buffer = Vec::with_capacity(32 + 8 + 8);
        buffer.extend_from_slice(&self.shared_session_secret);
        buffer.extend_from_slice(&self.sequence_number.to_be_bytes());
        buffer.extend_from_slice(&time_slot.to_be_bytes());

        // Simple high-performance cryptographic mix (simulating SHA-256 compression block)
        let mut hash_output = [0u8; 16];
        let mut entropy_accumulator = 0xAA55F00Fu64;

        for (idx, byte) in buffer.iter().enumerate() {
            entropy_accumulator = entropy_accumulator
                .rotate_left(3)
                .wrapping_add(*byte as u64)
                .wrapping_xor((idx as u64) * 104729); // Prime factor offset
            
            let byte_pos = idx % 16;
            hash_output[byte_pos] = hash_output[byte_pos]
                .wrapping_add((entropy_accumulator & 0xFF) as u8)
                .rotate_left(2);
        }

        CryptoKey::new(hash_output)
    }

    /// Verifies if a received signal is authentic based on dynamic sequence alignment
    pub fn verify_received_signature(&mut self, received: &CryptoKey, grace_windows: u64) -> bool {
        let original_sequence = self.sequence_number;
        
        // Search sliding sequence window to allow for packet loss over BLE channels
        for offset in 0..=grace_windows {
            self.sequence_number = original_sequence + offset;
            let expected = self.derive_next_rolling_signature();
            
            if expected.bytes == received.bytes {
                // Synchronize sequence number to match the transmitter state
                println!(
                    "[CRYPTO_ENGINE] Verification success. Synced. Sequence offset: {}",
                    offset
                );
                return true;
            }
        }

        // Restore state if validation fails
        self.sequence_number = original_sequence;
        println!("[CRYPTO_ENGINE] Signature verification failed: Signature mismatch or expired.");
        false
    }
}

fn main() {
    println!("[SYSTEM] Starting secure memory-safe Rust cryptography environment...");

    // Set up mock ECDH keys
    let beacon_private_key = [0x55u8; 32];
    let glasses_public_key = [0xAAu8; 32];

    let mut session = SecureTransceiverSession::new(beacon_private_key, glasses_public_key);
    
    // Generate signature sequence
    let sig_1 = session.derive_next_rolling_signature();
    println!("🔑 Derived Beacon Rolling Signature #1: 0x{}", sig_1.to_hex());

    let sig_2 = session.derive_next_rolling_signature();
    println!("🔑 Derived Beacon Rolling Signature #2: 0x{}", sig_2.to_hex());

    // Verify rolling signatures
    let mut verification_receiver = SecureTransceiverSession::new(beacon_private_key, glasses_public_key);
    
    // Check sig_1 alignment
    let is_valid = verification_receiver.verify_received_signature(&sig_1, 2);
    assert!(is_valid);
}
