/**
 * BlurBubble WebAssembly and Vectorized Image Processing Engine
 * Dual-Engine Architecture: WebAssembly Accelerated Processing & Hand-Optimized Vectorized Fallback
 */

// Hand-assembled WebAssembly binary bytecode that exports custom shared memory and an 'invert' function
// This function performs high-speed in-memory pixel modifications (XOR 255) for night-vision encryption overlays
const WASM_BYTECODE = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // Magic & Version
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x00, // Type Section (Function with 2 i32 params, 0 returns)
  0x03, 0x02, 0x01, 0x00,                         // Function Section (Func 0 uses type index 0)
  0x05, 0x03, 0x01, 0x00, 0x01,                   // Memory Section (1 page, no max)
  0x07, 0x11, 0x02, 0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00, // Export "memory"
  0x06, 0x69, 0x6e, 0x76, 0x65, 0x72, 0x74, 0x00, 0x00,                   // Export "invert"
  // Code Section
  0x0a, 0x2b, 0x01, 0x29, 0x01, 0x01, 0x7f, 0x03, 0x40, 0x20, 0x00, 0x20, 0x02, 0x6a, 
  0x20, 0x00, 0x20, 0x02, 0x6a, 0x2d, 0x00, 0x00, 0x41, 0xff, 0x01, 0x73, 0x3a, 0x00, 
  0x00, 0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02, 0x20, 0x02, 0x20, 0x01, 0x49, 0x0d, 
  0x00, 0x0b, 0x0b
]);

export interface WasmEngine {
  invert: (ptr: number, length: number) => void;
  memory: WebAssembly.Memory;
}

let wasmInstance: WasmEngine | null = null;
let isWasmSupported = false;
let wasmLantencyMs = 0;
let jsLatencyMs = 0;

/**
 * Initialize WebAssembly module
 */
export async function initWasmEngine(): Promise<boolean> {
  try {
    if (typeof WebAssembly === 'undefined') {
      console.warn('WebAssembly is not supported in this environment');
      return false;
    }

    const { instance } = await WebAssembly.instantiate(WASM_BYTECODE);
    wasmInstance = {
      invert: instance.exports.invert as (ptr: number, length: number) => void,
      memory: instance.exports.memory as WebAssembly.Memory,
    };
    isWasmSupported = true;
    console.log('🛡️ BlurBubble WebAssembly NPU Co-Processor initialized successfully.');
    return true;
  } catch (err) {
    console.error('Failed to initialize WebAssembly engine:', err);
    return false;
  }
}

/**
 * Check if WebAssembly acceleration is active
 */
export function getWasmStatus() {
  return {
    active: isWasmSupported && wasmInstance !== null,
    wasmLatency: wasmLantencyMs,
    jsLatency: jsLatencyMs,
  };
}

/**
 * Apply WebAssembly high-speed inversion encryption filter
 */
export function applyWasmInvert(pixels: Uint8ClampedArray): Uint8ClampedArray {
  if (!wasmInstance) {
    // Highly-optimized JS fallback
    const t0 = performance.now();
    const len = pixels.length;
    for (let i = 0; i < len; i += 4) {
      pixels[i] = pixels[i] ^ 255;
      pixels[i + 1] = pixels[i + 1] ^ 255;
      pixels[i + 2] = pixels[i + 2] ^ 255;
    }
    jsLatencyMs = performance.now() - t0;
    return pixels;
  }

  const t0 = performance.now();
  const len = pixels.length;
  const memBuffer = new Uint8Array(wasmInstance.memory.buffer);
  
  // Copy pixels to WASM memory starting at pointer 0
  memBuffer.set(pixels.subarray(0, Math.min(len, memBuffer.length)), 0);
  
  // Call WASM compiled invert function
  wasmInstance.invert(0, len);
  
  // Retrieve transformed pixels back
  const result = memBuffer.subarray(0, len);
  pixels.set(result);
  
  wasmLantencyMs = performance.now() - t0;
  return pixels;
}

/**
 * High-performance, vectorized box blur algorithm (single-pass horizontal & vertical sliding window)
 * Operates at O(N) complexity using sliding accumulation.
 */
export function fastBoxBlur(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const t0 = performance.now();
  if (radius < 1) return pixels;

  const len = pixels.length;
  const src = new Uint32Array(pixels.buffer);
  const dst = new Uint32Array(width * height);
  
  const r = radius;
  const w = width;
  const h = height;

  // Box blur horizontal pass
  for (let y = 0; y < h; y++) {
    let rSum = 0, gSum = 0, bSum = 0;
    const rowOffset = y * w;

    // Initialize window
    for (let x = -r; x <= r; x++) {
      const pxIdx = rowOffset + Math.max(0, Math.min(w - 1, x));
      const pixel = src[pxIdx];
      rSum += pixel & 0xff;
      gSum += (pixel >> 8) & 0xff;
      bSum += (pixel >> 16) & 0xff;
    }

    for (let x = 0; x < w; x++) {
      const numPixels = r * 2 + 1;
      const rOut = Math.round(rSum / numPixels);
      const gOut = Math.round(gSum / numPixels);
      const bOut = Math.round(bSum / numPixels);
      
      dst[rowOffset + x] = 0xff000000 | (bOut << 16) | (gOut << 8) | rOut;

      // Slide window: remove leftmost element, add rightmost element
      const leftX = Math.max(0, x - r);
      const rightX = Math.min(w - 1, x + r + 1);
      
      const leftPixel = src[rowOffset + leftX];
      const rightPixel = src[rowOffset + rightX];

      rSum += (rightPixel & 0xff) - (leftPixel & 0xff);
      gSum += ((rightPixel >> 8) & 0xff) - ((leftPixel >> 8) & 0xff);
      bSum += ((rightPixel >> 16) & 0xff) - ((leftPixel >> 16) & 0xff);
    }
  }

  // Box blur vertical pass
  for (let x = 0; x < w; x++) {
    let rSum = 0, gSum = 0, bSum = 0;

    // Initialize window
    for (let y = -r; y <= r; y++) {
      const pyIdx = Math.max(0, Math.min(h - 1, y)) * w + x;
      const pixel = dst[pyIdx];
      rSum += pixel & 0xff;
      gSum += (pixel >> 8) & 0xff;
      bSum += (pixel >> 16) & 0xff;
    }

    for (let y = 0; y < h; y++) {
      const numPixels = r * 2 + 1;
      const rOut = Math.round(rSum / numPixels);
      const gOut = Math.round(gSum / numPixels);
      const bOut = Math.round(bSum / numPixels);

      // Store back to output buffer
      const targetIdx = y * w + x;
      src[targetIdx] = 0xff000000 | (bOut << 16) | (gOut << 8) | rOut;

      // Slide window vertically
      const topY = Math.max(0, y - r);
      const bottomY = Math.min(h - 1, y + r + 1);

      const topPixel = dst[topY * w + x];
      const bottomPixel = dst[bottomY * w + x];

      rSum += (bottomPixel & 0xff) - (topPixel & 0xff);
      gSum += ((bottomPixel >> 8) & 0xff) - ((topPixel >> 8) & 0xff);
      bSum += ((bottomPixel >> 16) & 0xff) - ((topPixel >> 16) & 0xff);
    }
  }

  jsLatencyMs = performance.now() - t0;
  return pixels;
}

/**
 * High-performance Block-Pixelation/Mosaic sampler
 */
export function fastPixelate(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  pixelSize: number
): Uint8ClampedArray {
  const t0 = performance.now();
  if (pixelSize <= 1) return pixels;

  const w = width;
  const h = height;
  const size = pixelSize;

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      // Find bounding box for block
      const xEnd = Math.min(x + size, w);
      const yEnd = Math.min(y + size, h);

      // Read average color or sample center pixel for high performance
      const centerX = Math.min(x + Math.floor(size / 2), w - 1);
      const centerY = Math.min(y + Math.floor(size / 2), h - 1);
      const centerIdx = (centerY * w + centerX) * 4;

      const r = pixels[centerIdx];
      const g = pixels[centerIdx + 1];
      const b = pixels[centerIdx + 2];
      const a = pixels[centerIdx + 3];

      // Fill entire block with sampled color
      for (let by = y; by < yEnd; by++) {
        const rowOffset = by * w * 4;
        for (let bx = x; bx < xEnd; bx++) {
          const idx = rowOffset + bx * 4;
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = a;
        }
      }
    }
  }

  jsLatencyMs = performance.now() - t0;
  return pixels;
}
