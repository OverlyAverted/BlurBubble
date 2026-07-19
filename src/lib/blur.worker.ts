/**
 * BlurBubble Web Worker Image Processing Thread
 * Offloads high-frequency pixel transforms to a background thread.
 * Utilizes transferable ArrayBuffers to completely bypass message copying overhead.
 */

// Hand-assembled WebAssembly bytecode for high-speed bitwise inversion (XOR 255)
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

let wasmInstance: any = null;

// Self-initializing WebAssembly
async function getWasmInstance() {
  if (wasmInstance) return wasmInstance;
  try {
    const { instance } = await WebAssembly.instantiate(WASM_BYTECODE);
    wasmInstance = {
      invert: instance.exports.invert as (ptr: number, length: number) => void,
      memory: instance.exports.memory as WebAssembly.Memory,
    };
    return wasmInstance;
  } catch (e) {
    return null;
  }
}

/**
 * Single-pass high-performance vertical/horizontal sliding box blur
 */
function workerBoxBlur(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
) {
  if (radius < 1) return;
  const w = width;
  const h = height;
  const r = radius;

  const src = new Uint32Array(pixels.buffer);
  const dst = new Uint32Array(w * h);

  // Horizontal blur pass
  for (let y = 0; y < h; y++) {
    let rSum = 0, gSum = 0, bSum = 0;
    const rowOffset = y * w;

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

      const leftX = Math.max(0, x - r);
      const rightX = Math.min(w - 1, x + r + 1);

      const leftPixel = src[rowOffset + leftX];
      const rightPixel = src[rowOffset + rightX];

      rSum += (rightPixel & 0xff) - (leftPixel & 0xff);
      gSum += ((rightPixel >> 8) & 0xff) - ((leftPixel >> 8) & 0xff);
      bSum += ((rightPixel >> 16) & 0xff) - ((leftPixel >> 16) & 0xff);
    }
  }

  // Vertical blur pass
  for (let x = 0; x < w; x++) {
    let rSum = 0, gSum = 0, bSum = 0;

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

      src[y * w + x] = 0xff000000 | (bOut << 16) | (gOut << 8) | rOut;

      const topY = Math.max(0, y - r);
      const bottomY = Math.min(h - 1, y + r + 1);

      const topPixel = dst[topY * w + x];
      const bottomPixel = dst[bottomY * w + x];

      rSum += (bottomPixel & 0xff) - (topPixel & 0xff);
      gSum += ((bottomPixel >> 8) & 0xff) - ((topPixel >> 8) & 0xff);
      bSum += ((bottomPixel >> 16) & 0xff) - ((topPixel >> 16) & 0xff);
    }
  }
}

/**
 * Pixelate / mosaic effect
 */
function workerPixelate(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  pixelSize: number
) {
  if (pixelSize <= 1) return;
  const w = width;
  const h = height;
  const size = pixelSize;

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      const xEnd = Math.min(x + size, w);
      const yEnd = Math.min(y + size, h);

      const centerX = Math.min(x + Math.floor(size / 2), w - 1);
      const centerY = Math.min(y + Math.floor(size / 2), h - 1);
      const centerIdx = (centerY * w + centerX) * 4;

      const r = pixels[centerIdx];
      const g = pixels[centerIdx + 1];
      const b = pixels[centerIdx + 2];
      const a = pixels[centerIdx + 3];

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
}

// In-Worker Message Handler
self.onmessage = async (e: MessageEvent) => {
  const { id, pixels, width, height, privacyLevel, rangeMeters, emergencyPrivacyActive } = e.data;
  const t0 = performance.now();

  const dataArray = new Uint8ClampedArray(pixels);

  if (emergencyPrivacyActive) {
    // Run WebAssembly Color Inversion
    const inst = await getWasmInstance();
    if (inst) {
      const memBuffer = new Uint8Array(inst.memory.buffer);
      memBuffer.set(dataArray.subarray(0, Math.min(dataArray.length, memBuffer.length)), 0);
      inst.invert(0, dataArray.length);
      dataArray.set(memBuffer.subarray(0, dataArray.length));
    } else {
      // In-worker fallback
      for (let i = 0; i < dataArray.length; i += 4) {
        dataArray[i] = dataArray[i] ^ 255;
        dataArray[i + 1] = dataArray[i + 1] ^ 255;
        dataArray[i + 2] = dataArray[i + 2] ^ 255;
      }
    }
  } else if (privacyLevel === 'strict_blur') {
    const blurRad = Math.max(1, Math.min(24, Math.round(rangeMeters / 12) + 12));
    workerBoxBlur(dataArray, width, height, blurRad);
  } else if (privacyLevel === 'pixelate') {
    workerPixelate(dataArray, width, height, 14);
  }

  const duration = performance.now() - t0;

  // Post back with transferable buffer to eliminate copying latency completely!
  (self as any).postMessage({
    id,
    pixels: dataArray.buffer,
    duration,
    wasmActive: !!wasmInstance,
  }, [dataArray.buffer]);
};
