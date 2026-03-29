/**
 * vite-prerender-plugin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom Vite plugin — prerender halaman /resep/:slug menjadi HTML statis
 * saat `vite build`. Tidak butuh Puppeteer / headless browser.
 *
 * Cara kerja:
 *  1. Setelah build selesai (hook `closeBundle`), plugin fetch semua slug
 *     dari Supabase (tabel `recipes`).
 *  2. Untuk setiap slug, fetch ingredients + steps dari Supabase.
 *  3. Baca `dist/index.html` sebagai template.
 *  4. Inject konten resep ke dalam `#_s0` + inject JSON-LD Recipe schema
 *     + update <title>, <meta description>, <meta og:*>, <link canonical>.
 *  5. Tulis `dist/resep/<slug>/index.html` — siap di-serve sebagai static file.
 *
 * Pola & konvensi:
 *  - Semua identifier internal diawali `_` (konsisten dengan codebase)
 *  - Semua env dibaca dari process.env (sudah di-load Vite saat build)
 *  - Tidak ada dependency tambahan selain `node:fs`, `node:path`, `node:url`
 *
 * Setup:
 *  - Import plugin ini di vite.config.js (lihat instruksi di bawah)
 *  - Pastikan VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ada di .env
 *
 * @module vite-prerender-plugin
 */

import _fs   from 'node:fs';
import _path from 'node:path';

// ─── Konstanta ────────────────────────────────────────────────────────────────
const _PLUGIN_NAME = 'coo-x-prerender';
const _HOST        = 'www.coo-x-for.fun';
const _BATCH_SIZE  = 10; // fetch slug paralel per batch (hindari rate-limit Supabase)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * _sbFetch
 * Wrapper fetch ke Supabase REST API.
 * @param {string} _url     - full URL endpoint Supabase
 * @param {string} _anonKey - anon/publishable key
 * @returns {Promise<any[]>}
 */
const _sbFetch = async (_url, _anonKey) => {
  const _res = await fetch(_url, {
    headers: {
      apikey:        _anonKey,
      Authorization: `Bearer ${_anonKey}`,
      Accept:        'application/json',
    },
  });
  if (!_res.ok) throw new Error(`[${_PLUGIN_NAME}] Supabase error ${_res.status}: ${_url}`);
  return _res.json();
};

/**
 * _normIngr
 * Normalize rows dari tabel ingredients → array string.
 * Konsisten dengan _normIngredients di RecipeDetail.jsx.
 * @param {object[]} _rows
 * @returns {string[]}
 */
const _normIngr = (_rows) => {
  if (!_rows || _rows.length === 0) return [];
  const _seen = new Set();
  return _rows
    .filter(_r => {
      const _k = `${_r.item}__${_r.quantity}`;
      if (_seen.has(_k)) return false;
      _seen.add(_k);
      return true;
    })
    .map(_r => _r.quantity ? `${_r.quantity} ${_r.item}` : _r.item);
};

/**
 * _escHtml
 * Escape karakter HTML untuk mencegah XSS di innerHTML statis.
 * @param {string} _s
 * @returns {string}
 */
const _escHtml = (_s) =>
  String(_s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * _resolveStepText
 * Resolve teks langkah dari satu step object.
 * Mendukung field: langkah_langkah_nya (kolom DB utama), description, text.
 * @param {object} _st
 * @returns {string}
 */
const _resolveStepText = (_st) =>
  _st.langkah_langkah_nya || _st.description || _st.text || '';

/**
 * _buildSeoNodeHtml
 * Bangun innerHTML untuk #_s0 — konten resep lengkap yang terbaca crawler.
 * @param {object}   _rcp
 * @param {string[]} _ingr
 * @param {object[]} _stps
 * @returns {string}
 */
const _buildSeoNodeHtml = (_rcp, _ingr, _stps) => {
  const _author  = _escHtml(_rcp.author_name || 'Chef Coo-X-For.Fun');
  const _title   = _escHtml(_rcp.title);
  const _desc    = _escHtml(_rcp.description || '');
  const _country = _escHtml(_rcp.country  || '');
  const _date    = _rcp.created_at ? _rcp.created_at.split('T')[0] : '';
  const _imgUrl  = _escHtml(_rcp.image_url || '');

  const _imgHtml = _imgUrl
    ? `<img src="${_imgUrl}" alt="${_title}" width="800" height="450" />`
    : '';

  const _ingrHtml = (_ingr && _ingr.length > 0)
    ? `<h2>Bahan-Bahan</h2><ul>${_ingr.map(_i => `<li>${_escHtml(_i)}</li>`).join('')}</ul>`
    : '';

  const _stpSrc = (_rcp.steps_data && _rcp.steps_data.length > 0)
    ? _rcp.steps_data
    : (_stps || []);

  const _stpHtml = (_stpSrc.length > 0)
    ? `<h2>Cara Membuat</h2><ol>${_stpSrc
        .slice()
        .sort((_a, _b) => (_a.step_number ?? 0) - (_b.step_number ?? 0))
        .map(_st => `<li>${_escHtml(_resolveStepText(_st))}</li>`)
        .join('')}</ol>`
    : '';

  const _metaLine = [
    `Oleh: <strong>${_author}</strong>`,
    _country ? `Masakan: <strong>${_country}</strong>` : '',
    _date    ? `Diterbitkan: <time datetime="${_date}">${_date}</time>` : '',
  ].filter(Boolean).join(' | ');

  return `
    <h1>${_title}</h1>
    ${_imgHtml}
    <p>${_desc}</p>
    <p>${_metaLine}</p>
    ${_ingrHtml}
    ${_stpHtml}
    <nav>
      <a href="/">Beranda</a> |
      <a href="/search">Cari Resep</a> |
      <a href="/blog">Jurnal Kuliner</a> |
      <a href="/privacy">Kebijakan Privasi</a> |
      <a href="/terms">Syarat Layanan</a>
    </nav>
  `.trim();
};

/**
 * _buildRecipeJsonLd
 * Bangun string JSON-LD schema Recipe.
 * Konsisten dengan _injectRecipeJsonLd di RecipeDetail.jsx.
 * @param {object}   _rcp
 * @param {string[]} _ingr
 * @param {object[]} _stps
 * @returns {string}  — isi <script type="application/ld+json">
 */
const _buildRecipeJsonLd = (_rcp, _ingr, _stps) => {
  const _stpSrc = (_rcp.steps_data && _rcp.steps_data.length > 0)
    ? _rcp.steps_data
    : (_stps || []);

  const _instructions = _stpSrc.map((_st, _i) => ({
    '@type':  'HowToStep',
    position: _st.step_number ?? _i + 1,
    text:     _resolveStepText(_st),
  }));

  const _schema = {
    '@context':           'https://schema.org',
    '@type':              'Recipe',
    name:                 _rcp.title,
    description:          _rcp.description || '',
    image:                _rcp.image_url   || '',
    author: { '@type': 'Person', name: _rcp.author_name || 'Chef Coo-X-For.Fun' },
    datePublished:        _rcp.created_at ? _rcp.created_at.split('T')[0] : undefined,
    recipeCuisine:        _rcp.country    || undefined,
    recipeIngredient:     _ingr || [],
    recipeInstructions:   _instructions,
    url:                  `https://${_HOST}/resep/${_rcp.slug}`,
  };

  return JSON.stringify(_schema, (_k, _v) => _v === undefined ? undefined : _v);
};

/**
 * _buildBreadcrumbJsonLd
 * Bangun string JSON-LD BreadcrumbList.
 * @param {object} _rcp
 * @returns {string}
 */
const _buildBreadcrumbJsonLd = (_rcp) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type':    'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: `https://${_HOST}/` },
    { '@type': 'ListItem', position: 2, name: 'Resep',   item: `https://${_HOST}/search` },
    { '@type': 'ListItem', position: 3, name: _rcp.title, item: `https://${_HOST}/resep/${_rcp.slug}` },
  ],
});

/**
 * _injectIntoTemplate
 * Ambil `dist/index.html` sebagai template lalu inject semua konten resep:
 *  - <title>
 *  - <meta name="description">
 *  - <meta property="og:title|description|image|url">
 *  - <meta property="article:published_time|author">
 *  - <link rel="canonical">
 *  - <link rel="alternate" hreflang="id">
 *  - JSON-LD Recipe + BreadcrumbList (replace homepage BreadcrumbList)
 *  - innerHTML #_s0
 *
 * Semua manipulasi pakai regex replace pada string HTML — tidak butuh DOM parser.
 *
 * @param {string}   _tpl  - isi index.html
 * @param {object}   _rcp
 * @param {string[]} _ingr
 * @param {object[]} _stps
 * @returns {string}       - HTML final siap tulis ke disk
 */
const _injectIntoTemplate = (_tpl, _rcp, _ingr, _stps) => {
  const _titleEsc   = _escHtml(_rcp.title);
  const _descEsc    = _escHtml(_rcp.description || '');
  const _imageUrl   = _escHtml(_rcp.image_url   || `https://${_HOST}/Og-Icon-Coo-X-For-Fun.svg`);
  const _canonUrl   = `https://${_HOST}/resep/${_rcp.slug}`;
  const _pubDate    = _rcp.created_at || '';
  const _author     = _escHtml(_rcp.author_name || 'Chef');
  const _pageTitle  = `${_titleEsc} | Coo-X-For.Fun`;

  let _html = _tpl;

  // ── <title> ──────────────────────────────────────────────────────────────
  _html = _html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${_pageTitle}</title>`,
  );

  // ── <meta name="description"> ────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${_descEsc}$2`,
  );

  // ── og:title ─────────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${_pageTitle}$2`,
  );

  // ── og:description ───────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${_descEsc}$2`,
  );

  // ── og:image ─────────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
    `$1${_imageUrl}$2`,
  );

  // ── og:url ───────────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${_canonUrl}$2`,
  );

  // ── og:type → article ────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+property="og:type"\s+content=")[^"]*(")/,
    `$1article$2`,
  );

  // ── twitter:title ────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    `$1${_pageTitle}$2`,
  );

  // ── twitter:description ──────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${_descEsc}$2`,
  );

  // ── twitter:image ────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
    `$1${_imageUrl}$2`,
  );

  // ── canonical ────────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${_canonUrl}$2`,
  );

  // ── hreflang id ──────────────────────────────────────────────────────────
  _html = _html.replace(
    /(<link\s+rel="alternate"\s+hreflang="id"\s+href=")[^"]*(")/,
    `$1${_canonUrl}$2`,
  );

  // ── article:published_time — inject setelah og:type (upsert) ─────────────
  if (!_html.includes('article:published_time')) {
    _html = _html.replace(
      /(<meta\s+property="og:type"[^>]*>)/,
      `$1\n  <meta property="article:published_time" content="${_pubDate}" />\n  <meta property="article:author" content="${_author}" />`,
    );
  } else {
    _html = _html.replace(
      /(<meta\s+property="article:published_time"\s+content=")[^"]*(")/,
      `$1${_pubDate}$2`,
    );
    _html = _html.replace(
      /(<meta\s+property="article:author"\s+content=")[^"]*(")/,
      `$1${_author}$2`,
    );
  }

  // ── JSON-LD: ganti homepage BreadcrumbList dengan BreadcrumbList resep ───
  // Pola: {"@context":"https://schema.org","@type":"BreadcrumbList",...}
  _html = _html.replace(
    /<script type="application\/ld\+json">{"@context":"https:\/\/schema\.org","@type":"BreadcrumbList"[^<]*<\/script>/,
    `<script type="application/ld+json">${_buildBreadcrumbJsonLd(_rcp)}</script>`,
  );

  // ── JSON-LD: inject Recipe schema sebelum </head> ─────────────────────────
  // Hapus dulu kalau sudah ada (re-build), lalu inject fresh
  _html = _html.replace(
    /<script type="application\/ld\+json" id="rd-recipe-jsonld">[^<]*<\/script>\s*/g,
    '',
  );
  _html = _html.replace(
    '</head>',
    `  <script type="application/ld+json" id="rd-recipe-jsonld">${_buildRecipeJsonLd(_rcp, _ingr, _stps)}</script>\n</head>`,
  );

  // ── #_s0 innerHTML ────────────────────────────────────────────────────────
  // Regex ganti seluruh konten di dalam <div id="_s0" ...>...</div>
  // Pola source: <div id="_s0" aria-hidden="true">...\n  </div>
  _html = _html.replace(
    /(<div\s+id="_s0"[^>]*>)[\s\S]*?(<\/div>)/,
    `$1\n    ${_buildSeoNodeHtml(_rcp, _ingr, _stps)}\n  $2`,
  );

  return _html;
};

/**
 * _chunk
 * Split array menjadi sub-array berukuran n.
 * @param {any[]} _arr
 * @param {number} _n
 * @returns {any[][]}
 */
const _chunk = (_arr, _n) => {
  const _res = [];
  for (let _i = 0; _i < _arr.length; _i += _n) _res.push(_arr.slice(_i, _i + _n));
  return _res;
};

// ─── Plugin Export ────────────────────────────────────────────────────────────

/**
 * cooXPrerenderPlugin
 * Vite plugin — prerender semua halaman /resep/:slug menjadi static HTML.
 *
 * @param {object} [opts]
 * @param {number} [opts.batchSize=10]  - jumlah slug yang di-fetch paralel
 * @param {boolean} [opts.verbose=true] - log progress ke console
 * @returns {import('vite').Plugin}
 */
export const cooXPrerenderPlugin = (_opts = {}) => {
  const { batchSize: _bs = _BATCH_SIZE, verbose: _vb = true } = _opts;
  const _log  = (..._a) => _vb && console.log(`[${_PLUGIN_NAME}]`, ..._a);
  const _warn = (..._a) => console.warn(`[${_PLUGIN_NAME}]`, ..._a);

  let _outDir      = 'dist';
  let _supabaseUrl = '';
  let _anonKey     = '';

  return {
    name: _PLUGIN_NAME,
    apply: 'build', // hanya aktif saat `vite build`

    // ── configResolved: ambil outDir & env vars ──────────────────────────────
    configResolved(_cfg) {
      _outDir      = _cfg.build.outDir || 'dist';
      _supabaseUrl = _cfg.env.VITE_SUPABASE_URL                     || process.env.VITE_SUPABASE_URL                     || '';
      _anonKey     = _cfg.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY  || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY  || '';

      if (!_supabaseUrl || !_anonKey) {
        _warn('VITE_SUPABASE_URL atau VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY tidak ditemukan. Prerender dilewati.');
      }
    },

    // ── closeBundle: jalankan prerender setelah build selesai ────────────────
    async closeBundle() {
      if (!_supabaseUrl || !_anonKey) return;

      const _tplPath = _path.join(_outDir, 'index.html');
      if (!_fs.existsSync(_tplPath)) {
        _warn(`${_tplPath} tidak ditemukan. Pastikan build selesai lebih dulu.`);
        return;
      }

      const _tpl = _fs.readFileSync(_tplPath, 'utf-8');
      _log('Template index.html dibaca:', _tpl.length, 'bytes');

      // ── 1. Fetch semua slug dari tabel recipes ─────────────────────────────
      _log('Fetching semua slug dari Supabase...');
      let _slugRows;
      try {
        _slugRows = await _sbFetch(
          `${_supabaseUrl}/rest/v1/recipes?select=id,slug,title,description,image_url,author_name,country,created_at,steps_data,ingredients&order=created_at.desc`,
          _anonKey,
        );
      } catch (_err) {
        _warn('Gagal fetch slug:', _err.message);
        return;
      }

      if (!_slugRows || _slugRows.length === 0) {
        _warn('Tidak ada resep ditemukan di Supabase. Prerender dilewati.');
        return;
      }

      _log(`Total resep ditemukan: ${_slugRows.length}`);

      // ── 2. Proses per batch ────────────────────────────────────────────────
      let _ok = 0, _fail = 0;
      const _batches = _chunk(_slugRows, _bs);

      for (const _batch of _batches) {
        await Promise.all(_batch.map(async (_rcp) => {
          try {
            if (!_rcp.slug) { _warn(`Recipe id=${_rcp.id} tidak punya slug. Skip.`); return; }

            // ── Resolve ingredients ────────────────────────────────────────
            let _ingr = [];
            if (_rcp.ingredients && Array.isArray(_rcp.ingredients) && _rcp.ingredients.length > 0) {
              // inline ingredients (JSON column)
              _ingr = _rcp.ingredients;
            } else {
              // fetch dari tabel ingredients
              try {
                const _ingrRows = await _sbFetch(
                  `${_supabaseUrl}/rest/v1/ingredients?recipe_id=eq.${_rcp.id}&select=item,quantity&order=id.asc`,
                  _anonKey,
                );
                _ingr = _normIngr(_ingrRows);
              } catch (_e) {
                _warn(`Gagal fetch ingredients untuk ${_rcp.slug}:`, _e.message);
              }
            }

            // ── Resolve steps ──────────────────────────────────────────────
            let _stps = [];
            if (!_rcp.steps_data || _rcp.steps_data.length === 0) {
              try {
                _stps = await _sbFetch(
                  `${_supabaseUrl}/rest/v1/steps?recipe_title=ilike.*${encodeURIComponent(_rcp.title.trim())}*&select=step_number,langkah_langkah_nya&order=step_number.asc`,
                  _anonKey,
                );
              } catch (_e) {
                _warn(`Gagal fetch steps untuk ${_rcp.slug}:`, _e.message);
              }
            }

            // ── Inject ke template ─────────────────────────────────────────
            const _injected = _injectIntoTemplate(_tpl, _rcp, _ingr, _stps);

            // ── Tulis ke dist/resep/<slug>/index.html ──────────────────────
            const _dir = _path.join(_outDir, 'resep', _rcp.slug);
            _fs.mkdirSync(_dir, { recursive: true });
            _fs.writeFileSync(_path.join(_dir, 'index.html'), _injected, 'utf-8');

            _ok++;
            _log(`✓ ${_rcp.slug}`);
          } catch (_err) {
            _fail++;
            _warn(`✗ ${_rcp?.slug || _rcp?.id}:`, _err.message);
          }
        }));
      }

      _log(`Prerender selesai. Berhasil: ${_ok}, Gagal: ${_fail}`);
    },
  };
};

export default cooXPrerenderPlugin;