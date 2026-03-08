export async function detectBestImageFormat() {

  const avif = await createImageBitmap(
    await fetch("data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaWEAAAAgbWRoZAAAAABWaWRlAAAAAAABAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA").then(r=>r.blob())
  ).then(()=>true).catch(()=>false);

  if (avif) return "avif";
  return "webp";
}