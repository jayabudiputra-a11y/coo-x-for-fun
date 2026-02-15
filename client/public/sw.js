const IMG_CACHE = "coox-img-v2";

self.addEventListener("fetch", event => {
  if (event.request.destination !== "image") return;
  
  // LOGIKA BARU: Jika domain Cookpad, biarkan browser ambil langsung (bypass SW logic)
  if (event.request.url.includes('img-global.cpcdn.com')) {
    return; 
  }

  event.respondWith(handleImage(event.request));
});

async function handleImage(request) {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const net = await fetch(request);
    if (!net.ok) throw new Error();
    
    // Simpan ke cache
    cache.put(request, net.clone());
    return net;
  } catch (err) {
    return fetch(request);
  }
}