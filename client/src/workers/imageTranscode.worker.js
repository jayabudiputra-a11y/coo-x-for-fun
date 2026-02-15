import { encode as encodeAvif } from "@jsquash/avif";
import { encode as encodeWebp, init as initWebp } from "@jsquash/webp";

let webpInitialized = false;

self.onmessage = async (e) => {
  try {
    const { imageBuffer, type, quality = 0.8 } = e.data;
    let result;

    if (type === "avif") {
      result = await encodeAvif(new Uint8Array(imageBuffer), {
        quality: Math.round(quality * 100)
      });
    } else {
      try {
        // Inisialisasi manual dengan path yang absolut ke folder public
        if (!webpInitialized) {
          await initWebp(fetch('/webp_enc_simd.wasm'));
          webpInitialized = true;
        }

        result = await encodeWebp(new Uint8Array(imageBuffer), {
          quality: Math.round(quality * 100)
        });
      } catch (wasmErr) {
        // Fallback jika init atau encode gagal
        self.postMessage(imageBuffer, [imageBuffer]);
        return;
      }
    }

    self.postMessage(result, [result.buffer]);

  } catch (err) {
    self.postMessage({ error: err.message });
  }
};