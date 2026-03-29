import { useState as S, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { queueAction as _qA } from '../utils/indexedDbQueue';

// ─── IndexNow Configuration ───────────────────────────────────────────────────
const _INDEXNOW_KEY      = import.meta.env.VITE_INDEXNOW_KEY   || '';
const _INDEXNOW_HOST     = import.meta.env.VITE_SITE_HOST      || 'www.coo-x-for.fun';
const _INDEXNOW_KEY_LOC  = import.meta.env.VITE_INDEXNOW_KEY_LOCATION
                            || `https://${_INDEXNOW_HOST}/${_INDEXNOW_KEY}.txt`;
const _INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

// Cache key prefix agar tidak duplikat submit dalam satu sesi
const _IN_CACHE_PREFIX = 'indexnow_submitted_';

/**
 * _submitIndexNow
 * Submit satu URL ke Bing IndexNow API.
 * - Hanya berjalan di production (bukan localhost / dev).
 * - Mengecek sessionStorage agar URL yang sama tidak disubmit ulang
 *   dalam satu sesi browser.
 *
 * @param {string} slug   - slug resep (dipakai untuk membangun URL)
 */
const _submitIndexNow = async (slug) => {
  try {
    // Jangan submit di lingkungan development
    const _hostname = window.location.hostname;
    if (_hostname === 'localhost' || _hostname === '127.0.0.1') return;

    // Cek apakah URL ini sudah pernah disubmit di sesi ini
    const _inCacheKey = `${_IN_CACHE_PREFIX}${slug}`;
    if (sessionStorage.getItem(_inCacheKey)) return;

    const _targetUrl = `https://${_INDEXNOW_HOST}/resep/${slug}`;

    // Validasi key tersedia
    if (!_INDEXNOW_KEY) {
      console.warn('[IndexNow] VITE_INDEXNOW_KEY tidak di-set. Submission dilewati.');
      return;
    }

    const _payload = {
      host:        _INDEXNOW_HOST,
      key:         _INDEXNOW_KEY,
      keyLocation: _INDEXNOW_KEY_LOC,
      urlList:     [_targetUrl],
    };

    const _res = await fetch(_INDEXNOW_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body:    JSON.stringify(_payload),
    });

    if (_res.ok) {
      // Tandai sudah disubmit agar tidak spam
      sessionStorage.setItem(_inCacheKey, '1');
      console.info(`[IndexNow] Submitted: ${_targetUrl} → HTTP ${_res.status}`);
    } else {
      // Tangani response error sesuai spec IndexNow
      const _statusMap = {
        400: 'Bad Request — format tidak valid.',
        403: 'Forbidden — key tidak valid atau tidak ditemukan.',
        422: 'Unprocessable Entity — URL tidak sesuai host atau key.',
        429: 'Too Many Requests — terlalu banyak submission.',
      };
      console.warn(
        `[IndexNow] Gagal submit ${_targetUrl}: HTTP ${_res.status} — ` +
        (_statusMap[_res.status] || 'Error tidak diketahui.')
      );
    }
  } catch (_err) {
    // Jangan crash hook utama jika IndexNow gagal
    console.error('[IndexNow] Exception saat submit:', _err);
  }
};

// ─── Hook Utama (source asli dipertahankan penuh) ─────────────────────────────
export const useRecipe = (_0x1) => {
  const [_0x2, _0x3] = S(null);
  const [_0x4, _0x5] = S(true);

  E(() => {
    let _m = true;
    const _0x6 = async () => {
      _0x5(true);

      const _cacheKey = `recipe_full_${_0x1}`;
      const _cachedData = _gC(_cacheKey);
      if (_cachedData) {
        if (_m) {
          _0x3(_cachedData);
          _0x5(false);
        }
        return;
      }

      try {
        const { data: _0x7, error: _0x8 } = await Q
          .from('recipes')
          .select('*')
          .eq('slug', _0x1)
          .single();

        if (_0x8) throw _0x8;

        if (_0x7) {
          const { data: _0x9 } = await Q
            .from('steps')
            .select('*')
            .ilike('recipe_title', `%${_0x7.title.trim()}%`)
            .order('step_number', { ascending: true });

          const { data: _0xa } = await Q
            .from('ingredients')
            .select('*')
            .eq('recipe_id', _0x7.id);

          const _0xb = (_0xa && _0xa.length > 0) ? _0xa : _0x7.ingredients;

          const _finalRecipe = {
            ..._0x7,
            steps:       _0x9 || [],
            ingredients: _0xb || [],
          };

          if (_m) {
            _0x3(_finalRecipe);
            _sC(_cacheKey, _finalRecipe);
            _sSH({ last_slug: _0x1, ts: Date.now() });
            _qA({ type: 'RECIPE_LOAD', slug: _0x1 });

            // ── IndexNow: submit URL resep ke Bing setelah data berhasil dimuat ──
            _submitIndexNow(_0x1);
          }
        }
      } catch (_0xc) {
        if (_m) _0x3(null);
      } finally {
        if (_m) _0x5(false);
      }
    };

    if (_0x1) _0x6();
    return () => { _m = false; };
  }, [_0x1]);

  return { recipe: _0x2, loading: _0x4 };
};