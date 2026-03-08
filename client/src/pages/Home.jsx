import React, { useEffect as _e, useState as _s, useMemo as _m } from 'react';
import { Link as _L, useNavigate as _uN } from 'react-router-dom';
import { Analytics as _An } from "@vercel/analytics/react";
import { supabase as _q } from '../supabaseClient';
import _C0 from '../components/Recipe/RecipeCard';
import _C2 from '../components/SEO/SEOHelper';
import _FW from '../components/FerrisWheel';
import _I0 from '../assets/121x121-icon-coo-x-for-fun--.png';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { queueAction as _qA, flushQueue as _fQ } from '../utils/indexedDbQueue';
import { registerSW as _rSW } from '../registerSW';

const _px = (u) => u ? `/api/proxy?url=${encodeURIComponent(u)}` : '';

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

const optimizeImage = (url, width = 400) => {
  if (!url) return '';
  if (url.includes('blob:')) return url;
  if (_isCors(url)) return _px(url);
  if (url.includes('supabase.co')) {
    const s = url.includes('?') ? '&' : '?';
    return `${url}${s}width=${width}&format=webp&quality=75`;
  }
  if (url.includes('pexels.com')) {
    const s = url.includes('?') ? '&' : '?';
    return `${url}${s}auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
  }
  if (url.includes('unsplash.com')) {
    const s = url.includes('?') ? '&' : '?';
    return `${url}${s}w=${width}&q=75&fm=webp`;
  }
  return url;
};

const _A0 = React.memo(({ k }) => {
  const [_v, _sV] = _s(true);
  const _src = window.__adSlotUrl || '/ad-slot.html';

  if (!_v) return null;

  return (
    <div className="sys-ad-node" style={{ 
      position: 'relative', width: '100%', maxWidth: '728px', margin: '20px auto', 
      display: 'flex', justifyContent: 'center', minHeight: '90px', 
      background: '#fafafa', borderRadius: '12px', zIndex: 1, overflow: 'hidden' 
    }}>
      <button 
        onClick={() => _sV(false)} 
        style={{ 
          position: 'absolute', top: '0px', right: '0px', width: '24px', height: '24px', 
          borderRadius: '0 12px 0 12px', background: 'rgba(0,0,0,0.6)', color: '#fff', 
          border: 'none', cursor: 'pointer', zIndex: 10, fontSize: '12px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
        }}
      > × </button>
      <iframe 
        key={k} 
        title="Ads" 
        src={_src}
        style={{ width: '100%', maxWidth: '300px', height: '250px', border: 'none', overflow: 'hidden' }} 
        loading="lazy"
      />
    </div>
  );
});

const Home = () => {
  const _n = _uN();
  const [_r, _sr] = _s([]);
  const [_b, _sb] = _s([]);
  const [_l, _sl] = _s(false);

  _e(() => {
    _rSW();
    _fQ(async (p) => console.log('Syncing:', p));
    
    const _fD = async () => {
      _sl(true);
      
      const _cachedRecipes = _gC('home_recipes');
      const _cachedBlogs = _gC('home_blogs');
      
      if (_cachedRecipes) {
        const _sanitized = _cachedRecipes.map(item => ({
          ...item,
          image_url: (item.image_url?.startsWith('blob:') || !item.image_url) ? '' : item.image_url
        }));
        _sr(_sanitized);
      }
      
      if (_cachedBlogs) {
        const _sanitizedBlogs = _cachedBlogs.map(item => {
          let url = (item.image_url?.startsWith('blob:') || !item.image_url) ? '' : item.image_url;
          if (item.slug === 'resep-umur-panjang-kayu-manis') {
            url = 'https://zlwhvkexgjisyhakxyoe.supabase.co/storage/v1/object/public/self/ilustrasi-teh-kayu-manis_169.jpeg';
          }
          return { ...item, image_url: url };
        });
        _sb(_sanitizedBlogs);
      }

      const { data: _rD } = await _q
        .from('recipes')
        .select('*')
        .order('id', { ascending: false })
        .limit(10); 
      
      if (_rD) {
        _sr(_rD);
        _sC('home_recipes', _rD);
      }

      const { data: _bD } = await _q
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (_bD) {
        const _fixedBD = _bD.map(item => {
          if (item.slug === 'resep-umur-panjang-kayu-manis') {
            return { ...item, image_url: 'https://zlwhvkexgjisyhakxyoe.supabase.co/storage/v1/object/public/self/ilustrasi-teh-kayu-manis_169.jpeg' };
          }
          return item;
        });
        _sb(_fixedBD);
        _sC('home_blogs', _fixedBD);
      }

      _sSH({ home_view: Date.now() });
      _qA({ type: 'HOME_VISIT', timestamp: Date.now() });
      _sl(false);
    };
    _fD();
  }, []);

  const _rR = _m(() => {
    return _r.map((_i) => (
      <div key={`rcp-${_i.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <_C0 recipe={{ 
            ..._i, 
            image_url: optimizeImage(_i.image_url, 400) 
        }} />
        <div style={{ 
          marginTop: 'auto', paddingTop: '10px' 
        }}>
          <div style={{ padding: '6px', borderRadius: '8px', textAlign: 'center', backgroundColor: _i.steps_data ? '#fff4e6' : '#f9f9f9', border: _i.steps_data ? '1px solid #ffd8a8' : '1px solid #eee' }}>
            <span style={{ fontSize: '0.85rem', color: _i.steps_data ? '#d35400' : '#ccc', fontWeight: 'bold' }}>
              {_i.steps_data ? "Resep Sempurna" : "Lihat Cepat"}
            </span>
          </div>
        </div>
      </div>
    ));
  }, [_r]);

  return (
    <div style={{ 
      width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px', 
      minHeight: '100vh', overflowX: 'hidden', position: 'relative', zIndex: 1, 
      boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif'
    }}>
      <_An />
      <_C2 title="Inspirasi Masak Harian" description="Jelajahi resep masakan jadi & lagu memasak untukmu." />
      
      <header style={{ 
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', 
        gap: '15px', padding: '20px 0', borderBottom: '1px solid #eee', marginBottom: '25px'
      }}>
        <img src="/Og-Icon-Coo-X-For-Fun.svg" alt="L0" loading="lazy" style={{ width: '100%', maxWidth: '200px', height: 'auto', objectFit: 'contain' }} />
        <img src={_I0} alt="L1" loading="lazy" style={{ width: '100%', maxWidth: '140px', height: 'auto', objectFit: 'contain' }} />
      </header>

      <section style={{ width: '100%', maxWidth: '800px', margin: '0 auto 40px' }}>
        <_FW />
      </section>

      <_A0 k="idx-t" />

      <section style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontWeight: '900', margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#222' }}>Resep Terbaru</h3>
          <_L to="/search" style={{ color: '#d35400', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem', padding: '5px 10px', background: '#fff4e6', borderRadius: '20px' }}>Lihat Semua →</_L>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', 
          gap: '20px', 
          alignItems: 'stretch' 
        }}>
          {_rR}
        </div>
        
        {_l && <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontWeight: 'bold' }}>🍲 Memuat Resep...</div>}
      </section>

      <_A0 k="idx-m" />

      {_b.length > 0 && (
        <section style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontWeight: '900', margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#222' }}>Postingan Saya</h3>
            <_L to="/blog" style={{ color: '#d35400', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem', padding: '5px 10px', background: '#fff4e6', borderRadius: '20px' }}>Semua →</_L>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
            gap: '24px', 
            alignItems: 'stretch' 
          }}>
            {_b.map(_p => (
              <_L key={`blg-${_p.id}`} to={`/blog/${_p.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                <article style={{ 
                  background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eaeaea', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s'
                }}>
                  <img 
                    src={optimizeImage(_p.image_url, 400)} 
                    alt="B" 
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderBottom: '1px solid #eee' }} 
                    onError={(e) => { e.target.src = 'https://placehold.co/400?text=Error+Load'; }}
                  />
                  <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: '800', fontSize: '1.1rem', color: '#111', lineHeight: '1.4' }}>{_p.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>
                      {_p.content?.substring(0, 90)}...
                    </p>
                  </div>
                </article>
              </_L>
            ))}
          </div>
          
          <_A0 k="idx-b" />
        </section>
      )}

      <button onClick={() => _n('/add-recipe')} style={{ 
        position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px',
        backgroundColor: '#d35400', color: 'white', borderRadius: '50%', border: 'none',
        fontSize: '32px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 6px 20px rgba(211,84,0,0.4)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.2s'
      }}> + </button>
    </div>
  );
};

export default Home;