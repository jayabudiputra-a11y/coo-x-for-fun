export function setSessionHash(data) {
  const hash = btoa(JSON.stringify(data)).slice(0, 32);
  document.cookie = `coox_s=${hash}; path=/; max-age=86400`;
}
