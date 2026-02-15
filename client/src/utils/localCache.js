const CACHE_PREFIX = "coox_cache_v1";
const DEFAULT_TTL = 1000 * 60 * 60; // 1 jam

function hashMini(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const payload = {
      d: data,
      e: Date.now() + ttl,
      h: hashMini(JSON.stringify(data)).slice(0, 8) // 1/4 memory feel
    };
    localStorage.setItem(`${CACHE_PREFIX}_${key}`, JSON.stringify(payload));
  } catch {}
}

export function getCache(key) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.e) {
      localStorage.removeItem(`${CACHE_PREFIX}_${key}`);
      return null;
    }
    return parsed.d;
  } catch {
    return null;
  }
}
