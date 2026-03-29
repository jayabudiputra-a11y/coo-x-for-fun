import { createClient } from '@supabase/supabase-js';
import RSS from 'rss';
import fs from 'fs';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// ─── IndexNow Configuration ───────────────────────────────────────────────────
const _IN_KEY      = process.env.VITE_INDEXNOW_KEY          || '';
const _IN_HOST     = process.env.VITE_SITE_HOST             || 'www.coo-x-for.fun';
const _IN_KEY_LOC  = process.env.VITE_INDEXNOW_KEY_LOCATION || `https://${_IN_HOST}/${_IN_KEY}.txt`;
const _IN_ENDPOINT = 'https://api.indexnow.org/IndexNow';

/**
 * _submitIndexNowBulk
 * Submit semua URL baru (recipes + blogs) ke Bing IndexNow dalam satu
 * request POST bulk. Spec IndexNow mengizinkan array urlList hingga 10.000 URL.
 *
 * Dipanggil HANYA jika env INDEXNOW_SUBMIT=true (setelah deploy live).
 * Jalankan: INDEXNOW_SUBMIT=true node generate-seo.js
 * Atau gunakan script terpisah: node submit-indexnow.mjs
 *
 * @param {string[]} urls - Array URL lengkap yang akan disubmit
 */
const _submitIndexNowBulk = async (urls) => {
  if (!urls || urls.length === 0) return;

  if (!_IN_KEY) {
    console.warn('[IndexNow] VITE_INDEXNOW_KEY tidak di-set. Bulk submission dilewati.');
    return;
  }

  // IndexNow spec: max 10.000 URL per request
  const _CHUNK = 10_000;
  const _chunks = [];
  for (let i = 0; i < urls.length; i += _CHUNK) {
    _chunks.push(urls.slice(i, i + _CHUNK));
  }

  console.log(`[IndexNow] Submitting ${urls.length} URL(s) in ${_chunks.length} chunk(s)...`);

  for (let ci = 0; ci < _chunks.length; ci++) {
    const _batch = _chunks[ci];
    try {
      const _res = await fetch(_IN_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body:    JSON.stringify({
          host:        _IN_HOST,
          key:         _IN_KEY,
          keyLocation: _IN_KEY_LOC,
          urlList:     _batch,
        }),
      });

      if (_res.ok) {
        console.log(`[IndexNow] ✅ Chunk ${ci + 1}/${_chunks.length}: ${_batch.length} URL(s) submitted → HTTP ${_res.status}`);
      } else {
        const _map = {
          400: 'Bad Request — format tidak valid.',
          403: 'Forbidden — key tidak valid atau tidak ditemukan.',
          422: 'Unprocessable Entity — URL tidak sesuai host atau key.',
          429: 'Too Many Requests — terlalu banyak submission.',
        };
        console.warn(
          `[IndexNow] ⚠️ Chunk ${ci + 1}/${_chunks.length}: HTTP ${_res.status} — ` +
          (_map[_res.status] || 'Error tidak diketahui.')
        );
      }
    } catch (_err) {
      console.error(`[IndexNow] ❌ Exception chunk ${ci + 1}:`, _err.message);
    }
  }
};

// ─── HTML Escape Utilities ────────────────────────────────────────────────────

/**
 * Escape string untuk dipakai di dalam nilai atribut HTML (double-quoted).
 * @param {*} s
 * @returns {string}
 */
const _escAttr = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Escape string untuk dipakai sebagai text content HTML.
 * @param {*} s
 * @returns {string}
 */
const _escText = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// ─── Normalize helpers ────────────────────────────────────────────────────────

/**
 * _normIngr
 * Normalize rows dari tabel ingredients → array string.
 * Konsisten dengan _normIngredients di RecipeDetail.jsx.
 * @param {object[]} rows
 * @returns {string[]}
 */
const _normIngr = (rows) => {
  if (!rows || rows.length === 0) return [];
  const _seen = new Set();
  return rows
    .filter(r => {
      const _k = `${r.item}__${r.quantity}`;
      if (_seen.has(_k)) return false;
      _seen.add(_k);
      return true;
    })
    .map(r => r.quantity ? `${r.quantity} ${r.item}` : r.item);
};

/**
 * _normSteps
 * Normalize rows dari tabel steps → array string langkah.
 * FIXED: pakai kolom langkah_langkah_nya (sesuai schema tabel steps).
 * Schema tabel steps: id, recipe_title, step_number, langkah_langkah_nya, author, image_url
 * @param {object[]} rows
 * @returns {string[]}
 */
const _normSteps = (rows) => {
  if (!rows || rows.length === 0) return [];
  return rows
    .slice()
    .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
    .map(r => r.langkah_langkah_nya || ''); // FIXED: tidak ada kolom description/text
};

// ─── Fetch ingredients & steps per resep ─────────────────────────────────────

/**
 * _fetchIngredientsMap
 * Fetch semua bahan dari tabel `ingredients` untuk semua recipe_id sekaligus,
 * lalu kelompokkan per recipe_id → Map<id, string[]>.
 *
 * Lebih efisien daripada fetch per resep (N+1 query).
 *
 * @param {object} supabase
 * @param {number[]} recipeIds
 * @returns {Promise<Map<number, string[]>>}
 */
const _fetchIngredientsMap = async (supabase, recipeIds) => {
  const _map = new Map();
  if (!recipeIds || recipeIds.length === 0) return _map;

  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('recipe_id, item, quantity')
      .in('recipe_id', recipeIds)
      .order('id', { ascending: true });

    if (error) {
      console.warn('[StaticHTML] ⚠️ Gagal fetch ingredients:', error.message);
      return _map;
    }

    // Kelompokkan per recipe_id
    for (const row of (data || [])) {
      if (!_map.has(row.recipe_id)) _map.set(row.recipe_id, []);
      _map.get(row.recipe_id).push(row);
    }

    // Normalize setiap group
    for (const [id, rows] of _map.entries()) {
      _map.set(id, _normIngr(rows));
    }
  } catch (_e) {
    console.warn('[StaticHTML] ⚠️ Exception fetch ingredients:', _e.message);
  }

  return _map;
};

/**
 * _fetchStepsMap
 * Fetch semua langkah dari tabel `steps` untuk semua recipe title sekaligus.
 * Tabel steps tidak punya recipe_id — di-join via recipe_title (ilike).
 *
 * Karena tidak ada foreign key langsung, fetch semua steps lalu match
 * ke recipe berdasarkan recipe_title.
 *
 * FIXED: select hanya kolom yang ada di tabel:
 *   recipe_title, step_number, langkah_langkah_nya
 * (kolom 'description' dan 'text' TIDAK ADA di tabel steps)
 *
 * @param {object} supabase
 * @param {object[]} recipes - array resep [{id, title, slug, steps_data}]
 * @returns {Promise<Map<number, string[]>>}  Map<recipe.id, string[]>
 */
const _fetchStepsMap = async (supabase, recipes) => {
  const _map = new Map();
  if (!recipes || recipes.length === 0) return _map;

  // Resep yang steps_data-nya kosong — perlu fetch dari tabel steps
  const _needFetch = recipes.filter(
    r => !r.steps_data || !Array.isArray(r.steps_data) || r.steps_data.length === 0
  );

  if (_needFetch.length === 0) {
    // Semua resep pakai steps_data inline
    for (const r of recipes) {
      _map.set(r.id, _normSteps(r.steps_data));
    }
    return _map;
  }

  // Set steps_data inline dulu untuk yang sudah ada
  for (const r of recipes) {
    if (r.steps_data && Array.isArray(r.steps_data) && r.steps_data.length > 0) {
      _map.set(r.id, _normSteps(r.steps_data));
    }
  }

  // FIXED: select hanya kolom yang benar-benar ada di tabel steps
  // Tidak ada kolom 'description' atau 'text' — hanya langkah_langkah_nya
  try {
    const { data, error } = await supabase
      .from('steps')
      .select('recipe_title, step_number, langkah_langkah_nya')
      .order('step_number', { ascending: true });

    if (error) {
      console.warn('[StaticHTML] ⚠️ Gagal fetch steps:', error.message);
      return _map;
    }

    // Build lookup: lowercase title → rows
    const _titleLookup = new Map();
    for (const row of (data || [])) {
      const _key = (row.recipe_title || '').toLowerCase().trim();
      if (!_titleLookup.has(_key)) _titleLookup.set(_key, []);
      _titleLookup.get(_key).push(row);
    }

    // Match ke setiap resep yang belum punya steps
    for (const r of _needFetch) {
      const _key = (r.title || '').toLowerCase().trim();
      // Cari exact match dulu
      let _rows = _titleLookup.get(_key) || [];

      // Fallback: partial match (recipe_title contains recipe.title)
      if (_rows.length === 0) {
        for (const [_tKey, _tRows] of _titleLookup.entries()) {
          if (_tKey.includes(_key) || _key.includes(_tKey)) {
            _rows = _tRows;
            break;
          }
        }
      }

      if (_rows.length > 0) {
        _map.set(r.id, _normSteps(_rows));
      } else {
        _map.set(r.id, []);
      }
    }
  } catch (_e) {
    console.warn('[StaticHTML] ⚠️ Exception fetch steps:', _e.message);
  }

  return _map;
};

// ─── Inject page-specific meta ke base HTML template ─────────────────────────

/**
 * Mengambil konten dist/index.html sebagai template, lalu meng-inject
 * meta tag, JSON-LD structured data, canonical link, dan blok #_s0 statis
 * yang spesifik per halaman.
 *
 * Semua penggantian dilakukan dengan string operation agar tidak tergantung
 * pada parser HTML eksternal.
 *
 * @param {string} html              - Konten dist/index.html
 * @param {object} opts
 * @param {string} opts.title        - Judul halaman (plain text, akan di-escape)
 * @param {string} opts.desc         - Meta description (plain text, akan di-escape)
 * @param {string} opts.url          - Canonical / OG URL
 * @param {string} opts.img          - OG image URL
 * @param {string} opts.type         - OG type, misal 'article' atau 'website'
 * @param {object} opts.jsonLd       - Objek structured data (akan di-JSON.stringify)
 * @param {string} opts.staticBlock  - String HTML lengkap untuk div#_s0
 * @returns {string} HTML yang sudah dimodifikasi
 */
function _injectMeta(html, { title, desc, url, img, type, jsonLd, staticBlock }) {
  const _tEsc  = _escText(title);
  const _tAttr = _escAttr(title);
  const _dAttr = _escAttr(desc);
  const _uAttr = _escAttr(url);
  const _iAttr = _escAttr(img);

  // ── <title> ───────────────────────────────────────────────────────────────
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${_tEsc}</title>`);

  // ── <meta name="description"> ────────────────────────────────────────────
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${_dAttr}" />`
  );

  // ── Open Graph ────────────────────────────────────────────────────────────
  html = html
    .replace(/<meta\s+property="og:type"[^>]*>/i,
      `<meta property="og:type" content="${_escAttr(type)}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${_tAttr}" />`)
    .replace(/<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${_dAttr}" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${_uAttr}" />`)
    .replace(/<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${_iAttr}" />`);

  // ── Twitter Card ──────────────────────────────────────────────────────────
  html = html
    .replace(/<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${_tAttr}" />`)
    .replace(/<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${_dAttr}" />`)
    .replace(/<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" content="${_iAttr}" />`);

  // ── Canonical ─────────────────────────────────────────────────────────────
  const _canonical = `<link rel="canonical" href="${_uAttr}" />`;
  if (/<link\s+rel="canonical"/i.test(html)) {
    html = html.replace(/<link\s+rel="canonical"[^>]*>/i, _canonical);
  } else {
    html = html.replace('</head>', `  ${_canonical}\n</head>`);
  }

  // ── JSON-LD ───────────────────────────────────────────────────────────────
  // Ganti blok application/ld+json yang sudah ada (WebSite schema di index.html)
  // dengan schema yang spesifik per halaman.
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  );

  // ── Blok #_s0 (static SEO content) ───────────────────────────────────────
  // Ganti seluruh konten dari awal <div id="_s0"> sampai tepat sebelum
  // <div id="root"> untuk menghindari masalah dengan nested div.
  const _s0Idx   = html.indexOf('<div id="_s0"');
  const _rootIdx = html.indexOf('<div id="root">');
  if (_s0Idx !== -1 && _rootIdx !== -1 && _s0Idx < _rootIdx) {
    html = html.slice(0, _s0Idx) + staticBlock + '\n    ' + html.slice(_rootIdx);
  }

  return html;
}

// ─── Build static HTML untuk halaman Resep ───────────────────────────────────

/**
 * Membuat string HTML lengkap untuk satu halaman resep.
 *
 * @param {string}   baseHtml - Konten dist/index.html
 * @param {object}   recipe   - Baris resep dari Supabase
 * @param {string[]} ingr     - Array bahan dari tabel ingredients (sudah normalized)
 * @param {string[]} stps     - Array langkah dari tabel steps (sudah normalized)
 * @param {string}   BASE_URL - Misal 'https://www.coo-x-for.fun'
 * @returns {string}
 */
function _buildRecipeHtml(baseHtml, recipe, ingr, stps, BASE_URL) {
  const _title = `${recipe.title || 'Resep'} | Coo-X-For.Fun`;
  const _desc  =
    recipe.description ||
    `Resep ${recipe.title} — temukan bahan dan langkah memasaknya di Coo-X-For.Fun.`;
  const _url = `${BASE_URL}/resep/${recipe.slug}`;
  const _img = recipe.image_url || `${BASE_URL}/Og-Icon-Coo-X-For-Fun.svg`;

  // ── Resolve ingredients: pakai ingr dari tabel, fallback ke kolom inline ──
  const _resolvedIngr = (() => {
    if (ingr && ingr.length > 0) return ingr;
    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      return recipe.ingredients.map(i =>
        typeof i === 'string' ? i : (i.text || i.name || String(i))
      );
    }
    return [];
  })();

  // ── Resolve steps: pakai stps dari tabel, fallback ke kolom inline ────────
  // FIXED: steps dari tabel sudah normalized via _normSteps (pakai langkah_langkah_nya)
  // Fallback ke steps_data inline jika tabel kosong
  const _resolvedStps = (() => {
    if (stps && stps.length > 0) return stps;
    if (Array.isArray(recipe.steps_data) && recipe.steps_data.length > 0) {
      return recipe.steps_data
        .slice()
        .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
        .map(s => s.langkah_langkah_nya || s.text || s.description || '');
    }
    if (Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
      return recipe.instructions.map(s =>
        typeof s === 'string' ? s : (s.langkah_langkah_nya || s.text || s.description || s.step || '')
      );
    }
    return [];
  })();

  // ── JSON-LD: Recipe schema (schema.org) ───────────────────────────────────
  const _jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Recipe',
    name:        recipe.title       || '',
    description: recipe.description || '',
    image:       _img,
    url:         _url,
    author: {
      '@type': 'Person',
      name: recipe.author_name || 'Chef Anonymous',
    },
    datePublished: recipe.created_at
      ? new Date(recipe.created_at).toISOString()
      : new Date().toISOString(),
    ...(recipe.prep_time  ? { prepTime:       recipe.prep_time }           : {}),
    ...(recipe.cook_time  ? { cookTime:       recipe.cook_time }           : {}),
    ...(recipe.total_time ? { totalTime:      recipe.total_time }          : {}),
    ...(recipe.servings   ? { recipeYield:    String(recipe.servings) }    : {}),
    ...(recipe.category   ? { recipeCategory: recipe.category }            : {}),
    ...(recipe.cuisine    ? { recipeCuisine:  recipe.cuisine }             : {}),
    ...(recipe.country    ? { recipeCuisine:  recipe.country }             : {}),
    ...(recipe.keywords   ? { keywords:       recipe.keywords }            : {}),
    ...(recipe.calories
      ? { nutrition: { '@type': 'NutritionInformation', calories: String(recipe.calories) } }
      : {}),
    ...(_resolvedIngr.length
      ? { recipeIngredient: _resolvedIngr }
      : {}),
    ...(_resolvedStps.length
      ? {
          recipeInstructions: _resolvedStps.map((text, idx) => ({
            '@type':  'HowToStep',
            position: idx + 1,
            text,
          })),
        }
      : {}),
  };

  // ── Konten statis untuk div#_s0 ───────────────────────────────────────────
  const _metaLines = [
    recipe.prep_time  ? `Waktu Persiapan: ${_escText(recipe.prep_time)}`    : '',
    recipe.cook_time  ? `Waktu Memasak: ${_escText(recipe.cook_time)}`      : '',
    recipe.total_time ? `Total Waktu: ${_escText(recipe.total_time)}`       : '',
    recipe.servings   ? `Porsi: ${_escText(String(recipe.servings))}`       : '',
    recipe.category   ? `Kategori: ${_escText(recipe.category)}`            : '',
    recipe.cuisine    ? `Jenis Masakan: ${_escText(recipe.cuisine)}`        : '',
    recipe.country    ? `Asal: ${_escText(recipe.country)}`                 : '',
    recipe.difficulty ? `Tingkat Kesulitan: ${_escText(recipe.difficulty)}` : '',
  ].filter(Boolean);

  const _metaHtml = _metaLines.length
    ? `<ul>${_metaLines.map(l => `<li>${l}</li>`).join('')}</ul>`
    : '';

  let _ingredientsHtml = '';
  if (_resolvedIngr.length > 0) {
    const _items = _resolvedIngr.map(i => `<li>${_escText(i)}</li>`).join('');
    _ingredientsHtml = `<h2>Bahan-Bahan</h2><ul>${_items}</ul>`;
  }

  let _stepsHtml = '';
  if (_resolvedStps.length > 0) {
    const _steps = _resolvedStps.map(s => `<li>${_escText(s)}</li>`).join('');
    _stepsHtml = `<h2>Cara Memasak</h2><ol>${_steps}</ol>`;
  }

  const _staticBlock =
    `<div id="_s0" aria-hidden="true">` +
    `<h1>${_escText(recipe.title || '')}</h1>` +
    `<p>${_escText(_desc)}</p>` +
    (recipe.author_name ? `<p>Oleh: ${_escText(recipe.author_name)}</p>` : '') +
    _metaHtml +
    _ingredientsHtml +
    _stepsHtml +
    `<nav>` +
    `<a href="/">Beranda</a> | ` +
    `<a href="/search">Cari Resep</a> | ` +
    `<a href="/blog">Jurnal Kuliner</a>` +
    `</nav>` +
    `</div>`;

  return _injectMeta(baseHtml, {
    title:       _title,
    desc:        _desc,
    url:         _url,
    img:         _img,
    type:        'article',
    jsonLd:      _jsonLd,
    staticBlock: _staticBlock,
  });
}

// ─── Build static HTML untuk halaman Blog ────────────────────────────────────

/**
 * Membuat string HTML lengkap untuk satu halaman blog post.
 *
 * @param {string} baseHtml - Konten dist/index.html
 * @param {object} blog     - Baris blog dari Supabase (semua kolom via select('*'))
 * @param {string} BASE_URL - Misal 'https://www.coo-x-for.fun'
 * @returns {string}
 */
function _buildBlogHtml(baseHtml, blog, BASE_URL) {
  const _title = `${blog.title || 'Artikel'} | Coo-X-For.Fun`;
  const _desc  =
    blog.description ||
    (blog.content
      ? String(blog.content)
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 160)
      : null) ||
    `Baca artikel ${blog.title} di blog kuliner Coo-X-For.Fun.`;
  const _url = `${BASE_URL}/blog/${blog.slug}`;
  const _img = blog.image_url || `${BASE_URL}/Og-Icon-Coo-X-For-Fun.svg`;

  // ── JSON-LD: BlogPosting schema (schema.org) ──────────────────────────────
  const _jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'BlogPosting',
    headline:    blog.title || '',
    description: _desc,
    image:       _img,
    url:         _url,
    author: {
      '@type': 'Person',
      name: blog.author_name || 'Coo-X Team',
    },
    publisher: {
      '@type': 'Organization',
      name:    'Coo-X-For.Fun',
      logo:    { '@type': 'ImageObject', url: `${BASE_URL}/logo.svg` },
    },
    datePublished: blog.created_at
      ? new Date(blog.created_at).toISOString()
      : new Date().toISOString(),
    dateModified: (blog.updated_at || blog.created_at)
      ? new Date(blog.updated_at || blog.created_at).toISOString()
      : new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   _url,
    },
    ...(blog.tags || blog.keywords
      ? { keywords: blog.tags || blog.keywords }
      : {}),
    ...(blog.category
      ? { articleSection: blog.category }
      : {}),
  };

  // ── Konten statis untuk div#_s0 ───────────────────────────────────────────
  let _contentPreview = '';
  if (blog.content) {
    const _plain = String(blog.content)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
    _contentPreview = `<p>${_escText(_plain)}${_plain.length >= 500 ? '…' : ''}</p>`;
  }

  const _staticBlock =
    `<div id="_s0" aria-hidden="true">` +
    `<h1>${_escText(blog.title || '')}</h1>` +
    `<p>${_escText(_desc)}</p>` +
    (blog.author_name ? `<p>Oleh: ${_escText(blog.author_name)}</p>`  : '') +
    (blog.category    ? `<p>Kategori: ${_escText(blog.category)}</p>` : '') +
    _contentPreview +
    `<nav>` +
    `<a href="/">Beranda</a> | ` +
    `<a href="/search">Cari Resep</a> | ` +
    `<a href="/blog">Jurnal Kuliner</a>` +
    `</nav>` +
    `</div>`;

  return _injectMeta(baseHtml, {
    title:       _title,
    desc:        _desc,
    url:         _url,
    img:         _img,
    type:        'article',
    jsonLd:      _jsonLd,
    staticBlock: _staticBlock,
  });
}

// ─── generateSEO ─────────────────────────────────────────────────────────────
async function generateSEO() {
  console.log('🚀 Memulai proses SEO...');

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Env Supabase tidak lengkap. Melewati SEO.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const BASE_URL = 'https://www.coo-x-for.fun';
    const TODAY = new Date().toISOString().split('T')[0];

    // ── Fetch recipes ─────────────────────────────────────────────────────────
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error('❌ Gagal fetch recipes:', recipesError.message);
    }

    // ── Fetch blog_posts ──────────────────────────────────────────────────────
    const { data: blogsRaw, error: blogsError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (blogsError) {
      console.error('❌ Gagal fetch blog_posts:', blogsError.message);
    }

    // Normalisasi blog description
    const blogs = (blogsRaw || []).map(b => ({
      ...b,
      description: b.description
        || (b.content ? String(b.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160) : null)
        || `Baca artikel ${b.title} di blog kuliner Coo-X For Fun.`,
    }));

    // ── Fetch ingredients & steps untuk semua resep sekaligus ─────────────────
    // Dilakukan SEBELUM loop generate HTML agar tidak N+1 query.
    let _ingrMap = new Map();
    let _stpsMap = new Map();

    if (recipes && recipes.length > 0) {
      const _recipeIds = recipes.map(r => r.id).filter(Boolean);

      console.log('[StaticHTML] Fetching ingredients dari tabel ingredients...');
      _ingrMap = await _fetchIngredientsMap(supabase, _recipeIds);
      console.log(`[StaticHTML] ✓ ${_ingrMap.size} resep punya ingredients`);

      console.log('[StaticHTML] Fetching steps dari tabel steps...');
      _stpsMap = await _fetchStepsMap(supabase, recipes);
      console.log(`[StaticHTML] ✓ ${[..._stpsMap.values()].filter(v => v.length > 0).length} resep punya steps`);
    }

    // ── RSS Feed ─────────────────────────────────────────────────────────────
    const feed = new RSS({
      title:       'Coo-X For Fun',
      description: 'Resep & Blog Kuliner',
      feed_url:    `${BASE_URL}/rss`,
      site_url:    BASE_URL,
      language:    'id',
      pubDate:     new Date(),
      image_url:   `${BASE_URL}/og-image.jpg`,
    });

    if (recipes) {
      recipes.forEach(r => {
        feed.item({
          title:       r.title || 'Resep Tanpa Judul',
          url:         `${BASE_URL}/resep/${r.slug}`,
          description: r.description || `Resep ${r.title} — temukan bahan dan langkah memasaknya di Coo-X For Fun.`,
          author:      r.author_name || 'Chef Anonymous',
          date:        r.created_at ? new Date(r.created_at) : new Date(),
          enclosure:   r.image_url ? { url: r.image_url, type: 'image/jpeg' } : undefined,
          categories:  ['Resep', 'Kuliner', 'Masakan'],
        });
      });
    }

    if (blogs.length > 0) {
      blogs.forEach(b => {
        feed.item({
          title:       b.title || 'Artikel Tanpa Judul',
          url:         `${BASE_URL}/blog/${b.slug}`,
          description: b.description,
          author:      b.author_name || 'Coo-X Team',
          date:        b.created_at ? new Date(b.created_at) : new Date(),
          enclosure:   b.image_url ? { url: b.image_url, type: 'image/jpeg' } : undefined,
          categories:  ['Blog', 'Kuliner', 'Tips Memasak'],
        });
      });
    }

    // ── Sitemap: recipe-sitemap.xml ───────────────────────────────────────────
    let recipeSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    if (recipes) {
      recipes.forEach(r => {
        const _lastmod = r.created_at
          ? new Date(r.created_at).toISOString().split('T')[0]
          : TODAY;
        recipeSitemapXml +=
          `  <url>\n` +
          `    <loc>${BASE_URL}/resep/${r.slug}</loc>\n` +
          `    <lastmod>${_lastmod}</lastmod>\n` +
          `    <changefreq>monthly</changefreq>\n` +
          `    <priority>0.8</priority>\n` +
          (r.image_url
            ? `    <image:image><image:loc>${r.image_url}</image:loc><image:title>${(r.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</image:title></image:image>\n`
            : '') +
          `  </url>\n`;
      });
    }
    recipeSitemapXml += `</urlset>`;

    // ── Sitemap: blog-sitemap.xml ─────────────────────────────────────────────
    let blogSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    if (blogs.length > 0) {
      blogs.forEach(b => {
        const _lastmod = b.created_at
          ? new Date(b.created_at).toISOString().split('T')[0]
          : TODAY;
        blogSitemapXml +=
          `  <url>\n` +
          `    <loc>${BASE_URL}/blog/${b.slug}</loc>\n` +
          `    <lastmod>${_lastmod}</lastmod>\n` +
          `    <changefreq>monthly</changefreq>\n` +
          `    <priority>0.7</priority>\n` +
          (b.image_url
            ? `    <image:image><image:loc>${b.image_url}</image:loc><image:title>${(b.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</image:title></image:image>\n`
            : '') +
          `  </url>\n`;
      });
    }
    blogSitemapXml += `</urlset>`;

    // ── Sitemap: sitemap.xml ──────────────────────────────────────────────────
    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addUrl = (url, prio, changefreq = 'weekly') => {
      sitemapXml += `  <url><loc>${BASE_URL}${url}</loc><lastmod>${TODAY}</lastmod><changefreq>${changefreq}</changefreq><priority>${prio}</priority></url>\n`;
    };

    addUrl('',         '1.0', 'daily');
    addUrl('/search',  '0.6', 'weekly');
    addUrl('/blog',    '0.7', 'daily');
    addUrl('/privacy', '0.3', 'yearly');
    addUrl('/terms',   '0.3', 'yearly');

    if (recipes) recipes.forEach(r => addUrl(`/resep/${r.slug}`, '0.8'));
    if (blogs.length > 0) blogs.forEach(b => addUrl(`/blog/${b.slug}`, '0.7'));

    sitemapXml += `</urlset>`;

    // ── Sitemap Index ─────────────────────────────────────────────────────────
    const sitemapIndexXml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n` +
      `  <sitemap><loc>${BASE_URL}/recipe-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n` +
      `  <sitemap><loc>${BASE_URL}/blog-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n` +
      `</sitemapindex>`;

    // ── robots.txt ────────────────────────────────────────────────────────────
    const robotsTxt =
      `User-agent: *\n` +
      `Allow: /\n` +
      `Disallow: /admin/\n` +
      `Disallow: /add-recipe\n` +
      `\n` +
      `# Google\n` +
      `User-agent: Googlebot\nAllow: /\n\n` +
      `User-agent: Googlebot-Image\nAllow: /\n\n` +
      `User-agent: Googlebot-Video\nAllow: /\n\n` +
      `# Bing / Microsoft\n` +
      `User-agent: Bingbot\nAllow: /\n\n` +
      `User-agent: msnbot\nAllow: /\n\n` +
      `# IndexNow (Bing)\n` +
      `User-agent: IndexNow\nAllow: /\n\n` +
      `# Yahoo\n` +
      `User-agent: Slurp\nAllow: /\n\n` +
      `# DuckDuckGo\n` +
      `User-agent: DuckDuckBot\nAllow: /\n\n` +
      `# Baidu\n` +
      `User-agent: Baiduspider\nAllow: /\n\n` +
      `# Yandex\n` +
      `User-agent: YandexBot\nAllow: /\n\n` +
      `# Facebook\n` +
      `User-agent: facebookexternalhit\nAllow: /\n\n` +
      `# Twitter / X\n` +
      `User-agent: Twitterbot\nAllow: /\n\n` +
      `# LinkedIn\n` +
      `User-agent: LinkedInBot\nAllow: /\n\n` +
      `# WhatsApp\n` +
      `User-agent: WhatsApp\nAllow: /\n\n` +
      `# Telegram\n` +
      `User-agent: TelegramBot\nAllow: /\n\n` +
      `# Apple\n` +
      `User-agent: Applebot\nAllow: /\n\n` +
      `# SEO Tools\n` +
      `User-agent: AhrefsBot\nAllow: /\n\n` +
      `User-agent: SemrushBot\nAllow: /\n\n` +
      `User-agent: MJ12bot\nAllow: /\n\n` +
      `User-agent: DotBot\nAllow: /\n\n` +
      `Sitemap: ${BASE_URL}/sitemap-index.xml\n` +
      `Sitemap: ${BASE_URL}/sitemap.xml\n`;

    // ── Buat direktori output ─────────────────────────────────────────────────
    const paths = ['./dist', './dist/rss', './public', './public/rss'];
    paths.forEach(p => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); });

    // ── Tulis semua file output ───────────────────────────────────────────────
    fs.writeFileSync('./dist/sitemap.xml',         sitemapXml);
    fs.writeFileSync('./dist/recipe-sitemap.xml',  recipeSitemapXml);
    fs.writeFileSync('./dist/blog-sitemap.xml',    blogSitemapXml);
    fs.writeFileSync('./dist/sitemap-index.xml',   sitemapIndexXml);
    fs.writeFileSync('./dist/robots.txt',          robotsTxt);
    fs.writeFileSync('./dist/rss/index.xml',       feed.xml());

    fs.writeFileSync('./public/sitemap.xml',        sitemapXml);
    fs.writeFileSync('./public/recipe-sitemap.xml', recipeSitemapXml);
    fs.writeFileSync('./public/blog-sitemap.xml',   blogSitemapXml);
    fs.writeFileSync('./public/sitemap-index.xml',  sitemapIndexXml);
    fs.writeFileSync('./public/robots.txt',         robotsTxt);
    fs.writeFileSync('./public/rss/index.xml',      feed.xml());

    console.log('✅ SEO Berhasil dibuat.');
    console.log(`   sitemap.xml          → ${recipes?.length ?? 0} resep + ${blogs.length} blog + 5 halaman statis`);
    console.log(`   recipe-sitemap.xml   → ${recipes?.length ?? 0} resep`);
    console.log(`   blog-sitemap.xml     → ${blogs.length} blog`);
    console.log(`   sitemap-index.xml    → 3 sitemap terdaftar`);
    console.log(`   robots.txt           → Allow all, Disallow admin`);
    console.log(`   rss/index.xml        → ${(recipes?.length ?? 0) + blogs.length} item`);

    // ── Generate Static HTML per halaman resep & blog ─────────────────────────
    let _baseHtml = '';
    try {
      _baseHtml = fs.readFileSync('./dist/index.html', 'utf-8');
    } catch (_e) {
      console.warn('[StaticHTML] ⚠️ Tidak bisa baca dist/index.html:', _e.message);
      console.warn('[StaticHTML]    Pastikan generate-seo.js dijalankan SETELAH vite build.');
    }

    if (_baseHtml) {
      let _recipeCount = 0;
      let _blogCount   = 0;
      let _recipeErr   = 0;
      let _blogErr     = 0;

      // ── Static HTML: halaman resep ─────────────────────────────────────────
      for (const r of (recipes || [])) {
        if (!r.slug) continue;
        try {
          const _ingr = _ingrMap.get(r.id) || [];
          const _stps = _stpsMap.get(r.id) || [];

          const _dir = `./dist/resep/${r.slug}`;
          fs.mkdirSync(_dir, { recursive: true });
          fs.writeFileSync(
            `${_dir}/index.html`,
            _buildRecipeHtml(_baseHtml, r, _ingr, _stps, BASE_URL)
          );
          _recipeCount++;
        } catch (_e) {
          console.warn(`[StaticHTML] ⚠️ Gagal generate resep/${r.slug}:`, _e.message);
          _recipeErr++;
        }
      }

      // ── Static HTML: halaman blog ──────────────────────────────────────────
      for (const b of blogs) {
        if (!b.slug) continue;
        try {
          const _dir = `./dist/blog/${b.slug}`;
          fs.mkdirSync(_dir, { recursive: true });
          fs.writeFileSync(
            `${_dir}/index.html`,
            _buildBlogHtml(_baseHtml, b, BASE_URL)
          );
          _blogCount++;
        } catch (_e) {
          console.warn(`[StaticHTML] ⚠️ Gagal generate blog/${b.slug}:`, _e.message);
          _blogErr++;
        }
      }

      console.log(`   static HTML resep    → ${_recipeCount} halaman` + (_recipeErr ? ` (${_recipeErr} gagal)` : ''));
      console.log(`   static HTML blog     → ${_blogCount} halaman`   + (_blogErr   ? ` (${_blogErr} gagal)`   : ''));
    }

    // ── IndexNow Bulk Submission ──────────────────────────────────────────────
    const _allUrls = [
      `${BASE_URL}/`,
      `${BASE_URL}/search`,
      `${BASE_URL}/blog`,
      ...(recipes?.map(r => `${BASE_URL}/resep/${r.slug}`) || []),
      ...(blogs.map(b => `${BASE_URL}/blog/${b.slug}`)),
    ];

    if (process.env.INDEXNOW_SUBMIT === 'true') {
      await _submitIndexNowBulk(_allUrls);
    } else {
      console.log('[IndexNow] ⏭️  Dilewati saat build. Jalankan setelah deploy:');
      console.log('[IndexNow]    node submit-indexnow.mjs   (atau: npm run submit)');
    }

  } catch (err) {
    console.error('❌ SEO Gagal (tapi build tetap lanjut):', err.message);
  }
}

generateSEO();