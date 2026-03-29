import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// ── NEW: import prerender plugin ──────────────────────────────────────────────
import { cooXPrerenderPlugin } from './vite-prerender-plugin.js';

const _localProxyPlugin = () => ({
  name: 'local-api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/proxy', async (req, res) => {
      const _allowed = [
        'blogger.googleusercontent.com',
        'cdn.medcom.id',
        'lh3.googleusercontent.com',
        'img.youtube.com',
        'static.instagram.com',
        'pbs.twimg.com',
      ];
      try {
        const _qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?') + 1) : '';
        const _params = new URLSearchParams(_qs);
        const _rawUrl = _params.get('url');
        if (!_rawUrl) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing url parameter' }));
        }
        const _decoded = decodeURIComponent(_rawUrl);
        const _hostname = new URL(_decoded).hostname;
        const _ok = _allowed.some(d => _hostname === d || _hostname.endsWith('.' + d));
        if (!_ok) {
          res.statusCode = 403;
          return res.end(JSON.stringify({ error: 'Domain not allowed' }));
        }
        const _upstream = await fetch(_decoded, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CooXProxy/1.0)',
            'Referer': 'https://www.coo-x-for.fun/',
          },
        });
        if (!_upstream.ok) {
          res.statusCode = _upstream.status;
          return res.end(JSON.stringify({ error: 'Upstream error' }));
        }
        const _ct = _upstream.headers.get('content-type') || 'application/octet-stream';
        const _buf = await _upstream.arrayBuffer();
        res.setHeader('Content-Type', _ct);
        res.setHeader('Cache-Control', 'public, max-age=604800');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 200;
        res.end(Buffer.from(_buf));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Proxy fetch failed', detail: err.message }));
      }
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    _localProxyPlugin(),
    // ── NEW: prerender plugin — harus sebelum VitePWA ──────────────────────
    // Jalankan otomatis saat `vite build`.
    // batchSize: jumlah slug yang di-fetch paralel (default 10)
    // verbose:   log progress ke console (default true)
    cooXPrerenderPlugin({ batchSize: 10, verbose: true }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        '121x121-icon-coo-x-for-fun--.png',
        'logo.svg',
        'Og-Icon-Coo-X-For-Fun.svg',
        'robots.txt',
        // ✅ IndexNow key file — wajib ada di dist/ agar verifiable oleh search engine
        '6b44359f0a0b4023851f06ee900053b6.txt',
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/ads/,
          /^\/sitemap\.xml/,
          /^\/robots\.txt/,
          /^\/rss/,
        ],
        // SW hanya handle request dari origin sendiri dan domain yang diizinkan
        // Semua request eksternal (ad network, tracker, dll) dilewatkan langsung
        // tanpa dicache agar tidak menyebabkan crash
        additionalManifestEntries: [],
        runtimeCaching: [
          // Navigasi halaman — NetworkFirst agar index.html selalu fresh
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'navigation-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Ad network dan tracker — NetworkOnly, TIDAK dicache sama sekali
          // Mencegah SW crash saat intercept request dari highperformanceformat, dll
          {
            urlPattern: ({ url }) => {
              const _adHosts = [
                'highperformanceformat.com',
                'wayfarerorthodox.com',
                'realizationnewestfangs.com',
                'kettledroopingcontinuation.com',
                'consentmanager.net',
                'delivery.consentmanager.net',
                'googletagmanager.com',
                'google-analytics.com',
                'doubleclick.net',
                'googlesyndication.com',
              ];
              return _adHosts.some(h => url.hostname.includes(h));
            },
            handler: 'NetworkOnly',
          },
          // Google Fonts CSS
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Google Fonts file statis
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-static',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Gambar dari domain yang diizinkan (Supabase, Pexels, Unsplash, cpcdn)
          {
            urlPattern: ({ url }) => {
              const _imgHosts = [
                'supabase.co',
                'pexels.com',
                'unsplash.com',
                'cpcdn.com',
                'ftcdn.net',
                'cloudinary.com',
                'akamaized.net',
                'i.gifer.com',
              ];
              return _imgHosts.some(h => url.hostname.includes(h));
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'remote-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // File gambar lokal dari assets
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'local-images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // WASM files
          {
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Sitemap, robots, RSS — selalu dari network
          {
            urlPattern: /\/sitemap\.xml$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/robots\.txt$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/rss\//,
            handler: 'NetworkOnly',
          },
          // Semua domain eksternal lain yang tidak dikenali — NetworkOnly
          // Mencegah SW crash pada request tak terduga
          {
            urlPattern: ({ url }) => url.origin !== self.location.origin,
            handler: 'NetworkOnly',
          },
        ]
      },
      manifest: {
        name: 'Coo-X-For.Fun',
        short_name: 'CooX',
        description: 'Resep Masakan Harian & Inspirasi Kuliner Dunia',
        theme_color: '#d35400',
        background_color: '#fdfdfd',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.ico',                      sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' },
          { src: '121x121-icon-coo-x-for-fun--.png', sizes: '121x121',                  type: 'image/png' },
          { src: 'logo.svg',                         sizes: '192x192',                  type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'logo.svg',                         sizes: '512x512',                  type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'Og-Icon-Coo-X-For-Fun.svg',        sizes: 'any',                      type: 'image/svg+xml' }
        ]
      }
    })
  ],

  base: '/',

  assetsInclude: ['**/*.wasm'],

  optimizeDeps: {
    exclude: ['@jsquash/avif', '@jsquash/webp']
  },

  worker: {
    format: 'es',
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    emptyOutDir: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('@jsquash') || id.includes('imageTranscode') || id.includes('.wasm')) {
            return 'vendor-wasm';
          }
          if (id.includes('framer-motion') || id.includes('gsap')) {
            return 'vendor-animation';
          }
          if (id.includes('styled-components') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('axios') || id.includes('date-fns') || id.includes('react-helmet-async') || id.includes('react-google-recaptcha')) {
            return 'vendor-misc';
          }
        }
      }
    }
  }
});