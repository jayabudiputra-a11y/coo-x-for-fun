import { encode as encodeAvif } from "@jsquash/avif";
import { encode as encodeWebp } from "@jsquash/webp";

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
        result = await encodeWebp(new Uint8Array(imageBuffer), {
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