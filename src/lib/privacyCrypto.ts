/**
 * BlurBubble Web Crypto Core
 * Implements real browser-native Web Crypto API operations.
 * Generates ECDSA P-256 tactical key pairs, derives fingerprints, and signs/verifies compliance tokens.
 */

export interface CryptoShieldState {
  publicKeyBase64: string;
  privateKeyRaw: CryptoKey | null;
  publicKeyRaw: CryptoKey | null;
  signatureBase64: string;
  fingerprint: string;
  signDurationMs: number;
  verifyDurationMs: number;
  verificationSuccess: boolean;
  lastRotated: number;
}

/**
 * Generates a standard ECDSA P-256 key pair for physical broadcast protection
 */
export async function generateECDSAKeyPair(): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true, // Extractable
    ['sign', 'verify']
  );
  return keyPair;
}

/**
 * Helper to convert an ArrayBuffer to a Hexadecimal string
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(
    new Uint8Array(buffer),
    (x: number) => ('00' + x.toString(16)).slice(-2)
  ).join('');
}

/**
 * Helper to convert a Hexadecimal string to an ArrayBuffer
 */
export function hexToBuffer(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Exports a public key to SPKI format, hashes it with SHA-256, and returns a 16-character tracking id
 */
export async function deriveKeyFingerprint(publicKey: CryptoKey): Promise<{ fullFingerprint: string; shortId: string; spkiBase64: string }> {
  const spki = await window.crypto.subtle.exportKey('spki', publicKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', spki);
  
  const fullFingerprint = bufferToHex(hashBuffer).toUpperCase();
  // Standard BlurBubble ID format is 16 characters (e.g. A8F90C12E345D8B6)
  const shortId = fullFingerprint.slice(0, 16);
  
  // Convert SPKI to Base64 for display
  const spkiBytes = new Uint8Array(spki);
  let binary = '';
  for (let i = 0; i < spkiBytes.byteLength; i++) {
    binary += String.fromCharCode(spkiBytes[i]);
  }
  const spkiBase64 = window.btoa(binary);

  return {
    fullFingerprint,
    shortId,
    spkiBase64,
  };
}

/**
 * Signs a compliance opt-out payload with the private key and measures the performance
 */
export async function signCompliancePayload(
  privateKey: CryptoKey,
  payloadText: string
): Promise<{ signatureBase64: string; durationMs: number }> {
  const t0 = performance.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadText);
  
  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    data
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signatureBase64 = window.btoa(binary);
  const durationMs = performance.now() - t0;

  return {
    signatureBase64,
    durationMs,
  };
}

/**
 * Verifies a compliance opt-out signature with the public key and measures performance
 */
export async function verifyCompliancePayload(
  publicKey: CryptoKey,
  payloadText: string,
  signatureBase64: string
): Promise<{ verified: boolean; durationMs: number }> {
  const t0 = performance.now();
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadText);
    
    // Decode Base64 back to binary
    const binaryString = window.atob(signatureBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const verified = await window.crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      bytes.buffer,
      data
    );
    
    const durationMs = performance.now() - t0;
    return {
      verified,
      durationMs,
    };
  } catch (err) {
    console.error('SubtleCrypto verification error:', err);
    return {
      verified: false,
      durationMs: performance.now() - t0,
    };
  }
}
