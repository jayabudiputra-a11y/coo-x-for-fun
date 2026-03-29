import React, { useEffect as _e, useState as _s } from 'react';
import { useParams as _uP, Link as _L } from 'react-router-dom';
import { motion as _m } from 'framer-motion';
import { supabase as _S } from '../supabaseClient';
import _SH from '../components/SEO/SEOHelper';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { queueAction as _qA, flushQueue as _fQ } from '../utils/indexedDbQueue';
import { registerSW as _rSW } from '../registerSW';

const _xd = [
  'blogger.googleusercontent.com',
  'cdn.medcom.id',
  'lh3.googleusercontent.com',
  'img.youtube.com',
  'static.instagram.com',
  'pbs.twimg.com',
];

const _isCors = (u) => {
  if (!u) return false;
  try { return _xd.some(d => new URL(u).hostname.endsWith(d)); }
  catch { return false; }
};

const _px = (u) => u ? `/api/proxy?url=${encodeURIComponent(u)}` : '';

const _resolveUrl = (u) => {
  if (!u) return '';
  if (_isCors(u)) return _px(u);
  if (u.includes('supabase.co')) {
    const s = u.includes('?') ? '&' : '?';
    return `${u}${s}width=800&format=webp&quality=80`;
  }
  return u;
};

const A = () => {
  const { slug: _x } = _uP();
  const [_p, _y] = _s(null);
  const [_l, _z] = _s(true);
  const [_wW, _sW] = _s(window.innerWidth);

  _e(() => {
    _rSW();
    _fQ(async (_act) => console.log("Syncing:", _act));
    const _hR = () => _sW(window.innerWidth);
    window.addEventListener('resize', _hR);

    (async () => {
      _z(true);

      if (!_x || _x === 'undefined' || _x === '') {
        _z(false);
        return;
      }

      const _cached = _gC(`post_${_x}`);
      let _data = _cached;

      if (!_data) {
        const { data: _d, error: _err } = await _S
          .rpc('get_post_by_slug_safe', { requested_slug: String(_x) });
        _data = _d?.[0] ?? null;
      }

      if (_data) {
        if (_x === 'resep-umur-panjang-kayu-manis') {
          _data.image_url = 'https://zlwhvkexgjisyhakxyoe.supabase.co/storage/v1/object/public/self/ilustrasi-teh-kayu-manis_169.jpeg';
        }
        _sC(`post_${_x}`, _data);
        _y(_data);
        _sSH({ post_id: _data.id, slug: _x });
        await _qA({ type: 'view', target: _x, ts: Date.now() });
      }
      _z(false);
    })();

    return () => window.removeEventListener('resize', _hR);
  }, [_x]);

  if (_l) return <_m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#000', fontFamily: 'monospace' }}>Memuat...</_m.div>
  if (!_p) return <_m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#000', fontFamily: 'monospace' }}>Artikel Tidak Ditemukan</_m.div>

  const _sT = {
    w: { maxWidth: '1000px', margin: '0 auto', padding: _wW > 768 ? '40px 20px 100px' : '15px 10px 100px', boxSizing: 'border-box' },
    b: { display: 'inline-block !important', background: '#000000 !important', color: '#ffffff !important', padding: '10px 20px', fontSize: '12px', fontWeight: '900', textDecoration: 'none !important', border: '2px solid #000', boxShadow: '4px 4px 0 #00ffff', marginBottom: '25px', textTransform: 'uppercase', fontFamily: "'Open Sans', sans-serif", letterSpacing: '1px' },
    k: { background: '#fff', border: _wW > 768 ? '6px solid #000' : '4px solid #000', boxShadow: _wW > 768 ? '12px 12px 0px #ff00ff' : '8px 8px 0px #ff00ff', overflow: 'hidden', maxWidth: '800px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
    t: { background: '#fff', color: '#000', padding: _wW > 768 ? '40px 30px' : '25px 15px', textAlign: 'center', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', borderBottom: _wW > 768 ? '6px solid #000' : '5px solid #000', fontFamily: "'Open Sans', sans-serif", lineHeight: 1.3 },
    logo: { width: '60px', height: '60px', objectFit: 'contain' },
    i: { width: '100%', display: 'block', borderBottom: _wW > 768 ? '6px solid #000' : '5px solid #000', objectFit: 'cover', height: 'auto', maxHeight: '500px' },
    c: { padding: _wW > 768 ? '40px' : '25px', fontFamily: "'Open Sans', sans-serif", boxSizing: 'border-box' },
    bd: { display: 'inline-block', background: '#ffff00', color: '#000', padding: '5px 10px', fontSize: '10px', fontWeight: 900, border: '2px solid #000', marginBottom: '15px' },
    d: { fontSize: _wW > 768 ? '18px' : '15px', lineHeight: 1.8, color: '#111', marginBottom: '30px', textAlign: 'justify', whiteSpace: 'pre-line', fontWeight: '500' },
    hl: { background: '#00ffff', border: '2px solid #000', padding: '15px', margin: '20px 0', fontStyle: 'italic', fontSize: _wW > 768 ? '16px' : '14px', boxShadow: '4px 4px 0 #ff00ff' },
    dl: { margin: '0 0 20px', padding: 0 },
    dlg: { padding: '10px 0', borderBottom: '1px solid #ddd' },
    dt: { color: '#ff00ff', display: 'block', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900' },
    dd: { margin: 0, fontSize: _wW > 768 ? '16px' : '14px', color: '#000', fontWeight: 'bold' },
    fb: { display: 'block !important', background: '#0026ff !important', color: '#ffffff !important', textAlign: 'center', padding: '15px', border: '2px solid #000', textDecoration: 'none !important', fontWeight: '900', fontSize: '14px', boxShadow: '4px 4px 0 #ff00ff', textTransform: 'uppercase', marginTop: '20px' }
  };

  const BannerAd = () => {
    const _sc = _wW < 728 ? (_wW - 20) / 728 : 1;
    return (
      <div style={{ width: '100%', height: `${90 * _sc}px`, margin: '25px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
        <div style={{ width: '728px', height: '90px', transform: `scale(${_sc})`, transformOrigin: 'center center', flexShrink: 0 }}>
          <iframe title="banner-ad" loading="lazy" srcDoc={`<html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;"><script type="text/javascript">atOptions={'key':'91c8fb5f0a628b5ce0d9941ec5de7c59','format':'iframe','height':90,'width':728,'params':{}};</script><script async src="https://www.highperformanceformat.com/91c8fb5f0a628b5ce0d9941ec5de7c59/invoke.js"></script></body></html>`} style={{ width: '728px', height: '90px', border: 'none' }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      <_SH title={_p.title} description={_p.content.substring(0, 150)} image={_p.image_url} slug={`blog/${_p.slug}`} />
      <div style={_sT.w}>
        <BannerAd />
        <_m.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <_L to="/blog" style={_sT.b}>&lt;-- BACK</_L>
        </_m.div>
        <_m.article initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={_sT.k}>
          <div style={_sT.t}>
            <img
              src="/logo.svg"
              alt="logo"
              data-cmp-noscan="1"
              style={_sT.logo}
            />
            <span>{_p.title}</span>
          </div>
          <img
            src={_resolveUrl(_p.image_url)}
            alt={_p.title}
            data-cmp-noscan="1"
            style={_sT.i}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Gambar+Tidak+Tersedia'; }}
          />
          <div style={_sT.c}>
            <span style={_sT.bd}>[ VERIFIED ]</span>
            <p style={_sT.d}>{_p.content}</p>
            {_p.quote && <blockquote style={_sT.hl}>"{_p.quote}"</blockquote>}
            <dl style={_sT.dl}>
              <div style={_sT.dlg}><dt style={_sT.dt}>LOCATION</dt><dd style={_sT.dd}>{_p.location || '-'}</dd></div>
              <div style={_sT.dlg}><dt style={_sT.dt}>OPENING HOURS</dt><dd style={_sT.dd}>{_p.opening_hours || '-'}</dd></div>
              <div style={_sT.dlg}><dt style={_sT.dt}>PRICE RANGE</dt><dd style={_sT.dd}>{_p.price_range || '-'}</dd></div>
            </dl>
            <div style={{ marginTop: '20px', borderTop: '4px double #000', paddingTop: '10px' }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={_sT.fb}>SHARE ON FACEBOOK</a>
            </div>
          </div>
        </_m.article>
        <BannerAd />
      </div>
    </div>
  );
};

export default A;