import _R, { useState as _s, useMemo as _m, useEffect as _e, useRef as _r } from 'react';
import { useParams as _pP } from 'react-router-dom';
import { supabase as _sb } from '../supabaseClient';
import { Trash2 as _T2, Send as _Sd } from 'lucide-react';
import _SH from '../components/SEO/SEOHelper';
import _RH from '../components/Recipe/RecipeHeader';
import _IL from '../components/Recipe/IngredientsList';
import _SL from '../components/Recipe/StepsList';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { queueAction as _qA, flushQueue as _fQ } from '../utils/indexedDbQueue';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { registerSW as _rSW } from '../registerSW';

let _gL = false;

// ─── IndexNow Configuration ────────────────────────────────────────────────────
const _IN_KEY      = import.meta.env.VITE_INDEXNOW_KEY          || '';
const _IN_HOST     = import.meta.env.VITE_SITE_HOST             || 'www.coo-x-for.fun';
const _IN_KEY_LOC  = import.meta.env.VITE_INDEXNOW_KEY_LOCATION || `https://${_IN_HOST}/${_IN_KEY}.txt`;
const _IN_ENDPOINT = 'https://api.indexnow.org/IndexNow';

/**
 * _submitIndexNow
 * Submit URL halaman resep ke Bing IndexNow setelah data berhasil dimuat.
 * - Skip di localhost/dev.
 * - Dedup via sessionStorage per slug.
 * @param {string} slug
 */
const _submitIndexNow = async (slug) => {
  try {
    const _hn = window.location.hostname;
    if (_hn === 'localhost' || _hn === '127.0.0.1') return;
    if (!_IN_KEY) {
      console.warn('[IndexNow] VITE_INDEXNOW_KEY tidak di-set. Submission dilewati.');
      return;
    }
    const _dk = `indexnow_rd_${slug}`;
    if (sessionStorage.getItem(_dk)) return;

    const _url = `https://${_IN_HOST}/resep/${slug}`;
    const _res = await fetch(_IN_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body:    JSON.stringify({
        host:        _IN_HOST,
        key:         _IN_KEY,
        keyLocation: _IN_KEY_LOC,
        urlList:     [_url],
      }),
    });
    if (_res.ok) {
      sessionStorage.setItem(_dk, '1');
      console.info(`[IndexNow] Submitted: ${_url} → HTTP ${_res.status}`);
    } else {
      const _map = { 400: 'Bad Request', 403: 'Forbidden — key tidak valid', 422: 'Unprocessable Entity', 429: 'Too Many Requests' };
      console.warn(`[IndexNow] Gagal: ${_url} HTTP ${_res.status} — ${_map[_res.status] || 'Error tidak diketahui.'}`);
    }
  } catch (_err) {
    console.error('[IndexNow] Exception:', _err);
  }
};

// ─── On-Page SEO Helpers ───────────────────────────────────────────────────────

/**
 * _injectRecipeJsonLd
 * Inject / update <script type="application/ld+json"> dengan schema Recipe
 * di <head> untuk structured data Bing & Google.
 * @param {object} rcp        - data resep dari Supabase
 * @param {string[]} ingr     - daftar bahan (string)
 * @param {object[]} stps     - langkah dari tabel steps  [{step_number, description}]
 */
const _injectRecipeJsonLd = (rcp, ingr, stps) => {
  try {
    const _id = 'rd-recipe-jsonld';
    let _el = document.getElementById(_id);
    if (!_el) {
      _el = document.createElement('script');
      _el.type = 'application/ld+json';
      _el.id   = _id;
      document.head.appendChild(_el);
    }

    const _instructions = (() => {
      const _src = (rcp.steps_data && rcp.steps_data.length > 0)
        ? rcp.steps_data
        : stps;
      return _src.map((st, i) => ({
        '@type':     'HowToStep',
        position:    st.step_number ?? i + 1,
        text:        st.description || st.text || '',
      }));
    })();

    const _schema = {
      '@context':       'https://schema.org',
      '@type':          'Recipe',
      name:             rcp.title,
      description:      rcp.description || '',
      image:            rcp.image_url   || '',
      author: {
        '@type': 'Person',
        name:    rcp.author_name || 'Chef Coo-X-For.Fun',
      },
      datePublished:    rcp.created_at ? rcp.created_at.split('T')[0] : undefined,
      recipeCategory:   rcp.category   || undefined,
      recipeCuisine:    rcp.country    || undefined,
      recipeIngredient: ingr || [],
      recipeInstructions: _instructions,
      url:              `https://${_IN_HOST}/resep/${rcp.slug}`,
    };

    // Buang key undefined agar output JSON bersih
    _el.textContent = JSON.stringify(_schema, (_k, v) => v === undefined ? undefined : v);
  } catch (_err) {
    console.error('[SEO] Gagal inject Recipe JSON-LD:', _err);
  }
};

/**
 * _injectBreadcrumbJsonLd
 * Inject BreadcrumbList schema untuk navigasi Beranda → Resep → Judul.
 * @param {object} rcp
 */
const _injectBreadcrumbJsonLd = (rcp) => {
  try {
    const _id = 'rd-breadcrumb-jsonld';
    let _el = document.getElementById(_id);
    if (!_el) {
      _el = document.createElement('script');
      _el.type = 'application/ld+json';
      _el.id   = _id;
      document.head.appendChild(_el);
    }
    _el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `https://${_IN_HOST}/` },
        { '@type': 'ListItem', position: 2, name: 'Resep',   item: `https://${_IN_HOST}/search` },
        { '@type': 'ListItem', position: 3, name: rcp.title, item: `https://${_IN_HOST}/resep/${rcp.slug}` },
      ],
    });
  } catch (_err) {
    console.error('[SEO] Gagal inject Breadcrumb JSON-LD:', _err);
  }
};

/**
 * _syncMetaTags
 * Upsert <meta> & <link> on-page SEO tags yang tidak ditangani SEOHelper:
 * - og:type = article
 * - article:published_time
 * - article:author
 * - robots (index,follow)
 * - alternate hreflang id
 * @param {object} rcp
 */
const _syncMetaTags = (rcp) => {
  try {
    const _setMeta = (sel, attr, val) => {
      let _el = document.querySelector(sel);
      if (!_el) {
        _el = document.createElement('meta');
        const [_a, _v] = sel.replace('meta[', '').replace(']', '').split('=');
        _el.setAttribute(_a.trim(), _v.replace(/"/g, ''));
        document.head.appendChild(_el);
      }
      _el.setAttribute(attr, val);
    };
    const _setLink = (rel, href, extra = {}) => {
      let _el = document.querySelector(`link[rel="${rel}"]`);
      if (!_el) { _el = document.createElement('link'); _el.rel = rel; document.head.appendChild(_el); }
      _el.href = href;
      Object.entries(extra).forEach(([k, v]) => _el.setAttribute(k, v));
    };

    _setMeta('meta[property="og:type"]',               'content', 'article');
    _setMeta('meta[property="article:published_time"]', 'content', rcp.created_at || '');
    _setMeta('meta[property="article:author"]',         'content', rcp.author_name || 'Chef');
    _setMeta('meta[name="robots"]',                     'content', 'index, follow, max-image-preview:large');
    _setLink('alternate', `https://${_IN_HOST}/resep/${rcp.slug}`, { hreflang: 'id' });
  } catch (_err) {
    console.error('[SEO] Gagal sync meta tags:', _err);
  }
};

/**
 * _cleanupSeoNodes
 * Hapus semua JSON-LD & link yang diinjeksikan saat komponen di-unmount.
 */
const _cleanupSeoNodes = () => {
  ['rd-recipe-jsonld', 'rd-breadcrumb-jsonld'].forEach(id => {
    const _el = document.getElementById(id);
    if (_el) _el.remove();
  });
};

// ─── NEW: _fillSeoNode ─────────────────────────────────────────────────────────
/**
 * _fillSeoNode
 * Isi #_s0 (SEO hidden div) dengan konten resep yang sudah di-resolve:
 * judul H1, deskripsi, bahan-bahan, dan langkah-langkah memasak.
 * Ini memastikan konten muncul di page source / raw HTML untuk crawler
 * yang tidak mengeksekusi JavaScript (Bing, dll).
 *
 * @param {object}   rcp   - data resep
 * @param {string[]} ingr  - array bahan (sudah di-normalize)
 * @param {object[]} stps  - array langkah [{step_number, description}]
 */
const _fillSeoNode = (rcp, ingr, stps) => {
  try {
    const _nd = document.getElementById('_s0');
    if (!_nd) return;

    // Resolve steps dari steps_data (inline) atau tabel steps (async)
    const _stpSrc = (rcp.steps_data && rcp.steps_data.length > 0)
      ? rcp.steps_data
      : (stps || []);

    // Build ingredients HTML
    const _ingrHtml = (ingr && ingr.length > 0)
      ? `<h2>Bahan-Bahan</h2><ul>${ingr.map(i => `<li>${i}</li>`).join('')}</ul>`
      : '';

    // Build steps HTML
    const _stpHtml = (_stpSrc.length > 0)
      ? `<h2>Cara Membuat</h2><ol>${_stpSrc
          .slice()
          .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
          .map(st => `<li>${st.description || st.text || ''}</li>`)
          .join('')}</ol>`
      : '';

    // Meta info
    const _author  = rcp.author_name || 'Chef Coo-X-For.Fun';
    const _country = rcp.country     || '';
    const _cat     = rcp.category    || '';
    const _date    = rcp.created_at  ? rcp.created_at.split('T')[0] : '';

    // Image (plain <img> agar crawler tahu ada gambar)
    const _imgHtml = rcp.image_url
      ? `<img src="${rcp.image_url}" alt="${rcp.title}" width="800" height="450" />`
      : '';

    _nd.innerHTML = `
      <h1>${rcp.title}</h1>
      ${_imgHtml}
      <p>${rcp.description || ''}</p>
      <p>Oleh: <strong>${_author}</strong>${_country ? ` | Masakan: <strong>${_country}</strong>` : ''}${_cat ? ` | Kategori: <strong>${_cat}</strong>` : ''}${_date ? ` | Diterbitkan: <time datetime="${_date}">${_date}</time>` : ''}</p>
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
  } catch (_err) {
    console.error('[SEO] Gagal fill _s0 node:', _err);
  }
};

/**
 * _resetSeoNode
 * Reset #_s0 ke konten generik saat komponen unmount / pindah halaman.
 * Supaya tidak ada sisa konten resep lama saat navigasi ke halaman lain.
 */
const _resetSeoNode = () => {
  try {
    const _nd = document.getElementById('_s0');
    if (!_nd) return;
    _nd.innerHTML = `
      <h1>Coo-X-For.Fun — Resep Masakan Harian &amp; Inspirasi Kuliner Dunia</h1>
      <h2>Resep Terbaru</h2>
      <p>Temukan resep masakan harian, inspirasi kuliner dunia, dan review makanan jujur. Dari masakan Indonesia seperti rendang, nasi goreng, soto, hingga hidangan internasional seperti sushi, pasta, dan dim sum.</p>
      <nav>
        <a href="/">Beranda</a> |
        <a href="/search">Cari Resep</a> |
        <a href="/blog">Jurnal Kuliner</a> |
        <a href="/privacy">Kebijakan Privasi</a> |
        <a href="/terms">Syarat Layanan</a>
      </nav>
    `.trim();
  } catch (_err) {
    console.error('[SEO] Gagal reset _s0 node:', _err);
  }
};

// ─── Ad Component (source asli dipertahankan penuh) ───────────────────────────
const _SAC = _R.memo(() => {
  const _cR = _r(null);
  const [_rD, _sRD] = _s(false);
  const [_vS, _sVS] = _s(true);
  const _cfG = _m(() => ({ k: '00a1391f38d87ff5d574caa89f0d2959', h: 250, w: 300, s: 'https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js' }), []);
  _e(() => { if (_gL) return; _gL = true; _sRD(true); return () => { _gL = false; }; }, []);
  const _ctN = _m(() => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body,html{margin:0;padding:0;height:250px;overflow:hidden;background:transparent;display:flex;justify-content:center}#c{width:300px;height:250px;position:relative}</style></head><body><div id="c"><script type="text/javascript">var atOptions={'key':'${_cfG.k}','format':'iframe','height':${_cfG.h},'width':${_cfG.w},'params':{}};</script><script type="text/javascript" async src="${_cfG.s}"></script></div></body></html>`, [_cfG]);
  if (!_vS) return null;
  if (!_rD) return <div style={{ height: '250px' }} />;
  const _st = { cn: { position: 'relative', width: '100%', maxWidth: '350px', margin: '25px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px', backgroundImage: 'url("https://i.gifer.com/Vbat.gif")', backgroundRepeat: 'repeat', backgroundSize: '120px', border: '4px dashed #ff00ff', boxShadow: '10px 10px 0px #00ffff', borderRadius: '12px', padding: '15px', overflow: 'visible' }, cl: { position: 'absolute', top: '-10px', right: '-10px', width: '26px', height: '26px', borderRadius: '50%', background: '#000', color: '#fff', border: '2px solid #fff', cursor: 'pointer', zIndex: 100, fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', boxShadow: '3px 3px 0px #ff0000' }, lb: { position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 'bold', color: '#000', backgroundColor: '#fff700', padding: '2px 10px', fontFamily: 'monospace', border: '1px solid #000', zIndex: 5 }, if: { width: '300px', height: '250px', border: '3px solid #000', backgroundColor: '#fff', overflow: 'hidden', zIndex: 1 } };
  return (<div ref={_cR} className="sys-ad-node" style={_st.cn}><button onClick={() => _sVS(false)} style={_st.cl}> × </button><div style={_st.lb}>[ ADVERTISEMENT ]</div><iframe title="Ads" srcDoc={_ctN} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" scrolling="no" frameBorder="0" loading="lazy" style={_st.if} /></div>);
}, () => true);

// ─── Utility (source asli dipertahankan penuh) ────────────────────────────────
const _oI = (u, w = 800) => {
  if (!u) return '';
  if (u.includes('supabase.co')) return u.includes('?') ? u.split('?')[0] : u;
  const _p = u.includes('?') ? '&' : '?';
  if (u.includes('pexels.com')) return `${u}${_p}auto=compress&cs=tinysrgb&w=${w}&dpr=1`;
  if (u.includes('unsplash.com')) return `${u}${_p}w=${w}&q=75&fm=webp`;
  if (u.includes('img-global.cpcdn.com')) return u;
  const _xd = ['blogger.googleusercontent.com','cdn.medcom.id','lh3.googleusercontent.com','img.youtube.com','static.instagram.com','pbs.twimg.com'];
  try { if (_xd.some(d => new URL(u).hostname.endsWith(d))) return `/api/proxy?url=${encodeURIComponent(u)}`; } catch {}
  return u;
};

const _aV = (url, name) => {
  if (url && url.trim() !== '') return url;
  const _n = encodeURIComponent((name || 'U').trim().substring(0, 2));
  return `https://ui-avatars.com/api/?name=${_n}&background=d35400&color=fff&size=40`;
};

const _normIngredients = (rows) => {
  if (!rows || rows.length === 0) return [];
  const _seen = new Set();
  return rows
    .filter(r => {
      const _key = `${r.item}__${r.quantity}`;
      if (_seen.has(_key)) return false;
      _seen.add(_key);
      return true;
    })
    .map(r => r.quantity ? `${r.quantity} ${r.item}` : r.item);
};

// ─── Main Page Component (source asli dipertahankan penuh) ────────────────────
const _RD = () => {
  const { slug: _sl } = _pP();
  const [_rcp, _sRcp] = _s(null);
  const [_ld, _sLd] = _s(true);
  const [_usr, _sUsr] = _s(null);
  const [_dI, _sDI] = _s('');
  const [_stps, _sStps] = _s([]);
  const [_ingr, _sIngr] = _s(null);
  const [_reac, _sReac] = _s({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [_myR, _sMyR] = _s(null);
  const [_cmm, _sCmm] = _s([]);
  const [_nC, _sNC] = _s('');
  const [_sub, _sSub] = _s(false);

  const _rIc = { like: { e: '👍', l: 'Suka', c: '#2078f4' }, love: { e: '❤️', l: 'Super', c: '#f33e58' }, haha: { e: '😆', l: 'Haha', c: '#f7b125' }, wow: { e: '😮', l: 'Wow', c: '#f7b125' }, sad: { e: '😢', l: 'Sedih', c: '#f7b125' }, angry: { e: '😡', l: 'Marah', c: '#e9710f' } };

  const _fR = async (id, uid) => {
    const { data: _d } = await _sb.from('recipe_reactions').select('reaction_type, user_id').eq('recipe_id', id);
    if (_d) {
      const _ct = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      let _mR = null;
      _d.forEach(_v => { if (_ct.hasOwnProperty(_v.reaction_type)) _ct[_v.reaction_type]++; if (uid && _v.user_id === uid) _mR = _v.reaction_type; });
      _sReac(_ct); _sMyR(_mR);
    }
  };

  const _hR = async (t) => {
    if (!_usr) return alert("Silakan Login di pojok kanan atas dulu ya! 😊");
    if (!navigator.onLine) await _qA({ type: 'REACTION', reactionType: t, recipeId: _rcp.id });
    const _pR = _myR; const _iR = _pR === t;
    _sMyR(_iR ? null : t);
    _sReac(_v => ({ ..._v, [t]: _iR ? Math.max(0, _v[t] - 1) : _v[t] + 1, ...(_pR && !_iR ? { [_pR]: Math.max(0, _v[_pR] - 1) } : {}) }));
    try { if (_iR) { await _sb.from('recipe_reactions').delete().eq('recipe_id', _rcp.id).eq('user_id', _usr.id); } else { await _sb.from('recipe_reactions').upsert({ recipe_id: _rcp.id, user_id: _usr.id, reaction_type: t }, { onConflict: 'recipe_id, user_id' }); } } catch (_e) { if (navigator.onLine) _fR(_rcp.id, _usr.id); }
  };

  const _fC = async (id) => {
    const { data: _d } = await _sb.from('recipe_comments').select('*').eq('recipe_id', id).order('created_at', { ascending: false });
    if (_d) _sCmm(_d);
  };

  const _fSt = async (title) => {
    const { data: _d } = await _sb.from('steps').select('*').ilike('recipe_title', `%${title.trim()}%`).order('step_number', { ascending: true });
    if (_d && _d.length > 0) _sStps(_d);
    return _d || [];
  };

  const _fIn = async (id) => {
    const { data: _d } = await _sb.from('ingredients').select('item, quantity').eq('recipe_id', id).order('id', { ascending: true });
    if (_d && _d.length > 0) _sIngr(_normIngredients(_d));
    return _d ? _normIngredients(_d) : [];
  };

  const _hPC = async (e) => {
    e.preventDefault(); if (!_usr || !_nC.trim()) return;
    const _p = { recipe_id: _rcp.id, user_id: _usr.id, content: _nC, user_name: _usr.user_metadata.full_name, avatar_url: _usr.user_metadata.avatar_url };
    if (!navigator.onLine) { await _qA({ type: 'COMMENT', payload: _p }); _sCmm([{ id: Date.now(), ..._p, created_at: new Date().toISOString() }, ..._cmm]); _sNC(''); return; }
    _sSub(true); try { const { error: _err } = await _sb.from('recipe_comments').insert(_p); if (_err) throw _err; _sNC(''); _fC(_rcp.id); } catch (_err) { alert(_err.message); } finally { _sSub(false); }
  };

  _e(() => {
    _rSW();
    if (navigator.onLine) _fQ(async (a) => {
      if (a.type === 'REACTION') await _hR(a.reactionType);
      if (a.type === 'COMMENT') await _sb.from('recipe_comments').insert(a.payload);
    });

    let _m = true;
    const _iP = async () => {
      _sLd(true);
      const { data: { session: _ss } } = await _sb.auth.getSession();
      if (_m) { _sUsr(_ss?.user ?? null); if (_ss?.user) _sSH({ uid: _ss.user.id, ts: Date.now() }); }

      let _rD = _gC(`recipe_${_sl}`);
      if (!_rD) {
        const { data: _d } = await _sb.from('recipes').select('*').eq('slug', _sl).single();
        _rD = _d;
        if (_rD) _sC(`recipe_${_sl}`, _rD);
      }

      if (_rD && _m) {
        _sRcp(_rD);
        const _oU = _oI(_rD.image_url, 800);
        _sDI(_oU);

        // ── Resolve ingredients ──
        let _resolvedIngr = null;
        if (_rD.ingredients && Array.isArray(_rD.ingredients) && _rD.ingredients.length > 0) {
          _sIngr(_rD.ingredients);
          _resolvedIngr = _rD.ingredients;
        } else {
          _resolvedIngr = await _fIn(_rD.id);
        }

        // ── Resolve steps ──
        let _resolvedStps = [];
        if (!_rD.steps_data || _rD.steps_data.length === 0) {
          _resolvedStps = await _fSt(_rD.title);
        }

        await Promise.all([_fR(_rD.id, _ss?.user?.id), _fC(_rD.id)]);

        // ── SEO: inject structured data & meta tags ──
        _sIngr(prev => {
          const _finalIngr = prev ?? _resolvedIngr ?? [];
          _sStps(prevSt => {
            const _finalStps = prevSt.length > 0 ? prevSt : _resolvedStps;
            _injectRecipeJsonLd(_rD, _finalIngr, _finalStps);
            // ── NEW: isi #_s0 dengan konten resep lengkap ──
            _fillSeoNode(_rD, _finalIngr, _finalStps);
            return prevSt;
          });
          return prev;
        });
        _injectBreadcrumbJsonLd(_rD);
        _syncMetaTags(_rD);

        // ── IndexNow: submit URL resep ──
        _submitIndexNow(_sl);
      }
      if (_m) _sLd(false);
    };

    _iP();
    window.scrollTo(0, 0);
    return () => {
      _m = false;
      // Cleanup SEO nodes saat pindah halaman
      _cleanupSeoNodes();
      // ── NEW: reset #_s0 ke konten generik saat unmount ──
      _resetSeoNode();
    };
  }, [_sl]);

  // Re-inject JSON-LD & _s0 saat steps atau ingredients selesai di-resolve async
  _e(() => {
    if (!_rcp || !_ingr) return;
    _injectRecipeJsonLd(_rcp, _ingr, _stps);
    // ── NEW: update #_s0 saat ingr/stps selesai resolve async ──
    _fillSeoNode(_rcp, _ingr, _stps);
  }, [_rcp, _ingr, _stps]);

  _e(() => {
    let _cl = document.querySelector("link[rel='canonical']");
    if (!_cl) {
      _cl = document.createElement("link");
      _cl.setAttribute("rel", "canonical");
      document.head.appendChild(_cl);
    }
    _cl.setAttribute("href", `https://www.coo-x-for.fun${window.location.pathname}`);
  }, [_sl]);

  if (_ld) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'monospace' }}>🍲 Menyiapkan Bahan...</div>;
  if (!_rcp) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Resep Tidak Ditemukan</h2></div>;

  const _tR = Object.values(_reac).reduce((a, b) => a + b, 0);
  const _hasSteps = (_rcp.steps_data && _rcp.steps_data.length > 0) || _stps.length > 0;
  const _hasIngr = _ingr && _ingr.length > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px', background: '#fff' }}>
      <_SH title={_rcp.title} description={_rcp.description} image={_rcp.image_url} slug={_rcp.slug} />
      <_RH author={`Oleh ${_rcp.author_name || 'Chef'}`} date={_rcp.created_at} country={_rcp.country || 'Inter'} />
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', marginTop: '20px', textAlign: 'center' }}>{_rcp.title}</h1>
      <div style={{ margin: '25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <img
          src={_dI || _oI(_rcp.image_url, 800)}
          alt={_rcp.title}
          style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
          loading="eager"
          fetchpriority="high"
          decoding="async"
          onError={(e) => { e.target.src = 'https://placehold.co/400?text=Error+Load'; }}
        />
      </div>
      <div style={{ borderTop: '2px solid #f0f2f5', borderBottom: '2px solid #f0f2f5', padding: '20px 0', margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <div style={{ display: 'flex' }}>
            {Object.entries(_reac).map(([k, v]) => v > 0 && (<span key={k} style={{ fontSize: '20px', marginLeft: '-6px', zIndex: 5 }}>{_rIc[k].e}</span>))}
          </div>
          <span style={{ fontSize: '0.95rem', color: '#65676b', fontWeight: '600' }}>{_tR > 0 ? `${_tR.toLocaleString()} reaksi` : 'Ayo bereaksi!'}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(_rIc).map(([k, v]) => (
            <button key={k} onClick={() => _hR(k)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: _myR === k ? `${v.c}20` : '#f0f2f5', borderRadius: '50px', border: _myR === k ? `1.5px solid ${v.c}` : '1.5px solid transparent' }}>
              <span style={{ fontSize: '20px' }}>{v.e}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: _myR === k ? v.c : '#65676b' }}>{v.l} {_reac[k] > 0 && `(${_reac[k]})`}</span>
            </button>
          ))}
        </div>
      </div>
      <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', marginBottom: '40px', fontStyle: 'italic', borderLeft: '5px solid #d35400', paddingLeft: '15px' }}>{_rcp.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {_hasIngr && <_IL ingredients={_ingr} />}
        {_hasSteps && <_SL steps={_stps} steps_data={_rcp.steps_data} />}
      </div>
      <_SAC />
      <div style={{ marginTop: '50px', borderTop: '4px double #eee', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Diskusi ({_cmm.length})</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <img
            src={_aV(_usr?.user_metadata?.avatar_url, _usr?.user_metadata?.full_name)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            alt="u"
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=d35400&color=fff&size=40'; }}
          />
          <form onSubmit={_hPC} style={{ flex: 1 }}>
            <textarea value={_nC} onChange={(e) => _sNC(e.target.value)} placeholder={_usr ? "Tulis..." : "Login dulu..."} disabled={!_usr || _sub} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', height: '80px' }} />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button type="submit" disabled={_sub || !_nC.trim()} style={{ background: '#d35400', color: '#fff', padding: '8px 20px', borderRadius: '20px', border: 'none', fontWeight: 'bold' }}>{_sub ? '...' : 'Kirim'}</button>
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {_cmm.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
              <img
                src={_aV(c.avatar_url, c.user_name)}
                alt="a"
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((c.user_name||'U').substring(0,2))}&background=d35400&color=fff&size=36`; }}
              />
              <div style={{ flex: 1, background: '#f0f2f5', padding: '10px 15px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: '0.9rem' }}>{c.user_name}</strong></div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default _RD;