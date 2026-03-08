import avifWasmUrl from "@jsquash/avif/codec/enc/avif_enc.wasm?url";
import webpWasmUrl from "@jsquash/webp/codec/enc/webp_enc.wasm?url";

// PERBAIKAN: Import langsung dari sub-path /encode
import encodeAvif, { init as initAvif } from "@jsquash/avif/encode";
import encodeWebp, { init as initWebp } from "@jsquash/webp/encode";

let _avifReady = false;
let _webpReady = false;

const _initAvif = async () => {
  if (_avifReady) return true;
  try {
    const wasmRes = await fetch(avifWasmUrl);
    if (!wasmRes.ok) throw new Error("avif wasm fetch failed");
    const wasmBuf = await wasmRes.arrayBuffer();
    // Inisialisasi dengan buffer WASM
    await initAvif(wasmBuf);
    _avifReady = true;
    return true;
  } catch (err) {
    console.error("AVIF Init Error:", err);
    return false;
  }
};

const _initWebp = async () => {
  if (_webpReady) return true;
  try {
    const wasmRes = await fetch(webpWasmUrl);
    if (!wasmRes.ok) throw new Error("webp wasm fetch failed");
    const wasmBuf = await wasmRes.arrayBuffer();
    await initWebp(wasmBuf);
    _webpReady = true;
    return true;
  } catch (err) {
    console.error("WebP Init Error:", err);
    return false;
  }
};

self.onmessage = async (e) => {
  try {
    // Pastikan e.data berisi ImageData (yang punya property .data, .width, .height)
    // Jika imageBuffer masih berupa ArrayBuffer mentah, Anda perlu me-decode-nya dulu
    const { imageBuffer, type, quality = 0.8 } = e.data;
    let result;

    if (type === "avif") {
      const ok = await _initAvif();
      if (!ok) {
        self.postMessage(imageBuffer, [imageBuffer]);
        return;
      }
      // jSquash encode biasanya menerima ImageData object
      result = await encodeAvif(imageBuffer, {
        quality: Math.round(quality * 100)
      });
    } else {
      try {
        const ok = await _initWebp();
        if (!ok) throw new Error("webp init failed");
        result = await encodeWebp(imageBuffer, {
          quality: Math.round(quality * 100)
        });
      } catch (webpErr) {
        self.postMessage(imageBuffer, [imageBuffer]);
        return;
      }
    }

    self.postMessage(result, [result.buffer]);

  } catch (err) {
    self.postMessage({ error: err.message });
  }
};