/**
 * submit-indexnow.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Script khusus untuk submit URL ke IndexNow SETELAH deploy selesai.
 *
 * Kenapa dipisah dari generate-seo.js?
 *   IndexNow memverifikasi key dengan fetch ke:
 *   https://www.coo-x-for.fun/{key}.txt
 *   File ini hanya tersedia SETELAH deploy. Jika disubmit saat build
 *   (sebelum deploy live), server masih melayani versi lama → HTTP 403.
 *
 * Cara pakai:
 *   1. Build seperti biasa  → npm run build
 *   2. Deploy ke Vercel     → git push / vercel deploy
 *   3. Setelah deploy live  → node submit-indexnow.mjs
 *                             atau: npm run submit
 *
 * Tambahkan ke package.json (root):
 *   "scripts": {
 *     "build":  "cd client && npm install && npm run build",
 *     "submit": "cd client && node submit-indexnow.mjs"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// ─── Config ──────────────────────────────────────────────────────────────────
const _IN_KEY      = process.env.VITE_INDEXNOW_KEY          || '';
const _IN_HOST     = process.env.VITE_SITE_HOST             || 'www.coo-x-for.fun';
const _IN_KEY_LOC  = process.env.VITE_INDEXNOW_KEY_LOCATION || `https://${_IN_HOST}/${_IN_KEY}.txt`;
const _IN_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const BASE_URL     = `https://${_IN_HOST}`;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// ─── Validasi env ─────────────────────────────────────────────────────────────
if (!_IN_KEY) {
  console.error('[IndexNow] ❌ VITE_INDEXNOW_KEY tidak di-set di .env');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('[IndexNow] ❌ Env Supabase tidak lengkap di .env');
  process.exit(1);
}

// ─── Verifikasi key.txt live di server ───────────────────────────────────────
async function _verifyKeyLive() {
  const _keyUrl = `${BASE_URL}/${_IN_KEY}.txt`;
  console.log(`[IndexNow] 🔍 Verifikasi key live: ${_keyUrl}`);
  try {
    const _res = await fetch(_keyUrl);
    if (!_res.ok) {
      console.error(`[IndexNow] ❌ Key file tidak ditemukan (HTTP ${_res.status})`);
      console.error(`[IndexNow]    Pastikan deploy sudah selesai sebelum submit.`);
      return false;
    }
    const _text = (await _res.text()).trim();
    if (_text !== _IN_KEY) {
      console.error(`[IndexNow] ❌ Isi key file tidak cocok.`);
      console.error(`[IndexNow]    Expected: ${_IN_KEY}`);
      console.error(`[IndexNow]    Got:      ${_text}`);
      return false;
    }
    console.log(`[IndexNow] ✅ Key file live dan valid.`);
    return true;
  } catch (_err) {
    console.error(`[IndexNow] ❌ Gagal fetch key file:`, _err.message);
    return false;
  }
}

// ─── Bulk submission ─────────────────────────────────────────────────────────
async function _submitIndexNowBulk(urls) {
  if (!urls || urls.length === 0) {
    console.warn('[IndexNow] ⚠️ Tidak ada URL untuk disubmit.');
    return;
  }

  // IndexNow spec: max 10.000 URL per request
  const _CHUNK = 10_000;
  const _chunks = [];
  for (let i = 0; i < urls.length; i += _CHUNK) {
    _chunks.push(urls.slice(i, i + _CHUNK));
  }

  console.log(`[IndexNow] 📤 Submitting ${urls.length} URL(s) in ${_chunks.length} chunk(s)...`);

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
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 IndexNow Submission Tool');
  console.log(`   Host      : ${_IN_HOST}`);
  console.log(`   Key       : ${_IN_KEY}`);
  console.log(`   Key URL   : ${_IN_KEY_LOC}`);
  console.log(`   Endpoint  : ${_IN_ENDPOINT}`);
  console.log('');

  // 1. Verifikasi key.txt sudah live dulu
  const _isLive = await _verifyKeyLive();
  if (!_isLive) {
    console.error('\n[IndexNow] ❌ Submission dibatalkan. Deploy dulu, baru submit.');
    process.exit(1);
  }

  // 2. Fetch semua URL dari Supabase (sama dengan generate-seo.js)
  console.log('\n[IndexNow] 📡 Fetching URL dari Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('slug')
    .order('created_at', { ascending: false });

  if (recipesError) {
    console.error('[IndexNow] ❌ Gagal fetch recipes:', recipesError.message);
  }

  const { data: blogs, error: blogsError } = await supabase
    .from('blog_posts')
    .select('slug')
    .order('created_at', { ascending: false });

  if (blogsError) {
    console.error('[IndexNow] ❌ Gagal fetch blog_posts:', blogsError.message);
  }

  // 3. Susun daftar URL
  const _allUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/search`,
    `${BASE_URL}/blog`,
    ...(recipes?.map(r => `${BASE_URL}/resep/${r.slug}`) || []),
    ...(blogs?.map(b => `${BASE_URL}/blog/${b.slug}`)    || []),
  ];

  console.log(`[IndexNow] 📋 Total URL: ${_allUrls.length}`);
  console.log(`           Resep : ${recipes?.length ?? 0}`);
  console.log(`           Blog  : ${blogs?.length ?? 0}`);
  console.log(`           Statis: 3 (/, /search, /blog)\n`);

  // 4. Submit
  await _submitIndexNowBulk(_allUrls);

  console.log('\n✅ Selesai.');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

