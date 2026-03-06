const IMG_CACHE = "coox-img-v2";

self.addEventListener("fetch", event => {
  if (event.request.url.includes('img-global.cpcdn.com')) {
    return;
  }

  if (event.request.destination === "image") {
    event.respondWith(handleImage(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.redirected) {
        return Response.redirect(response.url, 302);
      }
      return response;
    }).catch((error) => {
      console.error('Fetch error:', error);
    })
  );
});

async function handleImage(request) {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const net = await fetch(request);
    if (!net.ok) throw new Error();
    
    cache.put(request, net.clone());
    return net;
  } catch (err) {
    return fetch(request);
  }
}