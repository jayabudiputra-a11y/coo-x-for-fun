// ─── Allowed CORS proxy domains ───────────────────────────────────────────────
// Harus sinkron dengan _xd di: Home.jsx · BlogList.jsx · BlogPost.jsx
const _ALLOWED_DOMAINS = [
  'blogger.googleusercontent.com',
  'cdn.medcom.id',
  'lh3.googleusercontent.com',
  'img.youtube.com',
  'static.instagram.com',
  'pbs.twimg.com',
];

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let decoded;
  try {
    decoded = decodeURIComponent(url);
    new URL(decoded);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  const hostname = new URL(decoded).hostname;
  const isAllowed = _ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));

  if (!isAllowed) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  try {
    const response = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CooXProxy/1.0)',
        'Referer': 'https://www.coo-x-for.fun/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream error' });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed', detail: err.message });
  }
}