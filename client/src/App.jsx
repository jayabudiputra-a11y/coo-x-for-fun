import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as BR, Routes as RS, Route as RE, useLocation } from 'react-router-dom';
import { HelmetProvider as HP } from 'react-helmet-async';
import MyspaceTheme from './styles/MyspaceTheme';
import N0 from './components/Layout/Navbar';
import F0 from './components/Layout/Footer';
import ScrollToTop from './components/ScrollToTop';

const P0  = lazy(() => import('./pages/Home'));
const P1  = lazy(() => import('./pages/RecipeDetail'));
const P2  = lazy(() => import('./pages/Search'));
const P3  = lazy(() => import('./pages/NotFound'));
const P4  = lazy(() => import('./pages/DatasetWidget'));
const P5  = lazy(() => import('./pages/CountryPage'));
const P6  = lazy(() => import('./pages/BlogList'));
const P7  = lazy(() => import('./pages/BlogPost'));
const P8  = lazy(() => import('./pages/addRecipe'));
const P9  = lazy(() => import('./pages/PrivacyPolicy'));
const P10 = lazy(() => import('./pages/TermsOfService'));

const _FB = (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '60vh', flexDirection: 'column'
  }}>
    <div style={{
      width: '48px', height: '48px',
      border: '5px solid rgba(211,84,0,0.15)',
      borderTop: '5px solid #d35400',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── IndexNow Configuration ────────────────────────────────────────────────────
const _IN_KEY      = import.meta.env.VITE_INDEXNOW_KEY          || '';
const _IN_HOST     = import.meta.env.VITE_SITE_HOST             || 'www.coo-x-for.fun';
const _IN_KEY_LOC  = import.meta.env.VITE_INDEXNOW_KEY_LOCATION || `https://${_IN_HOST}/${_IN_KEY}.txt`;
const _IN_ENDPOINT = 'https://api.indexnow.org/IndexNow';

// Rute yang layak di-index (exclude: admin, wildcard, utility)
const _INDEXABLE_PATTERNS = [
  { pattern: /^\/$/, buildUrl: () => `https://${_IN_HOST}/` },
  { pattern: /^\/resep\/(.+)$/, buildUrl: (m) => `https://${_IN_HOST}/resep/${m[1]}` },
  { pattern: /^\/blog$/, buildUrl: () => `https://${_IN_HOST}/blog` },
  { pattern: /^\/blog\/(.+)$/, buildUrl: (m) => `https://${_IN_HOST}/blog/${m[1]}` },
  { pattern: /^\/search$/, buildUrl: () => `https://${_IN_HOST}/search` },
  { pattern: /^\/country\/(.+)$/, buildUrl: (m) => `https://${_IN_HOST}/country/${m[1]}` },
  { pattern: /^\/privacy$/, buildUrl: () => `https://${_IN_HOST}/privacy` },
  { pattern: /^\/terms$/, buildUrl: () => `https://${_IN_HOST}/terms` },
];

/**
 * _resolveIndexNowUrl
 * Cocokkan pathname ke pola yang layak di-index.
 * Kembalikan URL lengkap atau null jika tidak cocok.
 * @param {string} pathname
 * @returns {string|null}
 */
const _resolveIndexNowUrl = (pathname) => {
  for (const { pattern, buildUrl } of _INDEXABLE_PATTERNS) {
    const _m = pathname.match(pattern);
    if (_m) return buildUrl(_m);
  }
  return null;
};

/**
 * _submitIndexNowUrl
 * Submit satu URL ke Bing IndexNow API.
 * - Skip di localhost / dev.
 * - Dedup via sessionStorage agar tidak spam per sesi.
 * @param {string} url  - URL lengkap yang akan disubmit
 */
const _submitIndexNowUrl = async (url) => {
  try {
    const _hn = window.location.hostname;
    if (_hn === 'localhost' || _hn === '127.0.0.1') return;
    if (!_IN_KEY) {
      console.warn('[IndexNow] VITE_INDEXNOW_KEY tidak di-set. Submission dilewati.');
      return;
    }

    const _dedup = `indexnow_app_${url}`;
    if (sessionStorage.getItem(_dedup)) return;

    const _res = await fetch(_IN_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body:    JSON.stringify({
        host:        _IN_HOST,
        key:         _IN_KEY,
        keyLocation: _IN_KEY_LOC,
        urlList:     [url],
      }),
    });

    if (_res.ok) {
      sessionStorage.setItem(_dedup, '1');
      console.info(`[IndexNow] Submitted: ${url} → HTTP ${_res.status}`);
    } else {
      const _map = {
        400: 'Bad Request — format tidak valid.',
        403: 'Forbidden — key tidak valid atau tidak ditemukan.',
        422: 'Unprocessable Entity — URL tidak sesuai host atau key.',
        429: 'Too Many Requests — terlalu banyak submission.',
      };
      console.warn(`[IndexNow] Gagal: ${url} HTTP ${_res.status} — ${_map[_res.status] || 'Error tidak diketahui.'}`);
    }
  } catch (_e) {
    console.error('[IndexNow] Exception:', _e);
  }
};

// ─── IndexNow Route Watcher ────────────────────────────────────────────────────
// Komponen ini wajib berada di dalam <BrowserRouter> agar bisa pakai useLocation.
// Setiap navigasi (SPA route change) akan otomatis submit URL yang relevan.
function _IndexNowWatcher() {
  const _loc     = useLocation();
  const _prevRef = useRef(null);

  useEffect(() => {
    const _path = _loc.pathname;

    // Hanya submit jika pathname benar-benar berubah
    if (_path === _prevRef.current) return;
    _prevRef.current = _path;

    const _url = _resolveIndexNowUrl(_path);
    if (_url) _submitIndexNowUrl(_url);
  }, [_loc.pathname]);

  return null;
}

// ─── App (source asli dipertahankan penuh) ────────────────────────────────────
function App() {
  return (
    <HP>
      <MyspaceTheme />
      <BR>
        <ScrollToTop />
        {/* IndexNow watcher — tidak render apapun ke DOM */}
        <_IndexNowWatcher />
        <N0 />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Suspense fallback={_FB}>
            <RS>
              <RE path="/"                        element={<P0  />} />
              <RE path="/search"                  element={<P2  />} />
              <RE path="/resep/:slug"             element={<P1  />} />
              <RE path="/admin/view-db-secret"    element={<P4  />} />
              <RE path="/country/:name"           element={<P5  />} />
              <RE path="/blog"                    element={<P6  />} />
              <RE path="/blog/:slug"              element={<P7  />} />
              <RE path="/add-recipe"              element={<P8  />} />
              <RE path="/privacy"                 element={<P9  />} />
              <RE path="/terms"                   element={<P10 />} />
              <RE path="*"                        element={<P3  />} />
            </RS>
          </Suspense>
        </main>
        <F0 />
      </BR>
    </HP>
  );
}

export default App;