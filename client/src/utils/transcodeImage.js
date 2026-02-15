export async function transcodeImage(url, prefer = "avif") {
  const res = await fetch(url);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/imageTranscode.worker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e) => {
      if (e.data?.error) {
        reject(e.data.error);
      } else {
        // Logika tambahan: Jika worker mengirim balik buffer asli (fallback), 
        // gunakan tipe asli dari fetch awal agar gambar tidak rusak.
        const contentType = e.data instanceof ArrayBuffer && e.data.byteLength === buffer.byteLength
          ? blob.type 
          : (prefer === "avif" ? "image/avif" : "image/webp");

        resolve(new Blob([e.data], { type: contentType }));
      }
      worker.terminate();
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };

    worker.postMessage({
      imageBuffer: buffer,
      type: prefer
    }, [buffer]);
  });
}