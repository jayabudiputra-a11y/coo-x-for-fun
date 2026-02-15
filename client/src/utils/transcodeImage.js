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
      if (e.data?.error) reject(e.data.error);
      else resolve(new Blob([e.data], {
        type: prefer === "avif" ? "image/avif" : "image/webp"
      }));
    };

    worker.postMessage({
      imageBuffer: buffer,
      type: prefer
    }, [buffer]);

  });
}
