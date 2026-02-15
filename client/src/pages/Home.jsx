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

const optimizeImage = (url, width = 400) => {
  if (!url) return '';
  if (url.includes('blob:')) return url;
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=75`;
  }
  if (url.includes('pexels.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
  }
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75&fm=webp`;
  }
  return url;
};

const _A0 = React.memo(({ k }) => {
  const [_v, _sV] = _s(true);
  const _adC = _m(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, html { margin: 0; padding: 0; background: transparent; overflow: hidden; height: 250px; display: flex; justify-content: center; }
          #w { width: 300px; height: 250px; position: relative; }
        </style>
      </head>
      <body>
        <div id="w">
          <script type="text/javascript">
            atOptions = { 'key' : '00a1391f38d87ff5d574caa89f0d2959', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
          </script>
          <script async src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script>
        </div>
      </body>
    </html>
  `, []);

  if (!_v) return null;

  return (
    <div className="sys-ad-node" style={{ 
      position: 'relative', width: '100%', margin: '15px 0', display: 'flex', 
      justifyContent: 'center', minHeight: '250px', background: '#fafafa', borderRadius: '12px',
      zIndex: 1,
      contentVisibility: 'auto', 
      containIntrinsicSize: '300px 250px' 
    }}>
      <button 
        onClick={() => _sV(false)} 
        style={{ 
          position: 'absolute', top: '0px', right: 'calc(50% - 150px)', width: '22px', height: '22px', 
          borderRadius: '0 12px 0 12px', background: 'rgba(0,0,0,0.8)', color: '#fff', 
          border: 'none', cursor: 'pointer', zIndex: 10, fontSize: '14px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
        }}
      > × </button>
      <iframe 
        key={k} 
        title="Ads" 
        srcDoc={_adC} 
        style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }} 
        loading="lazy" 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups" 
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
      
      if (_cachedBlogs) _sb(_cachedBlogs);

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
        _sb(_bD);
        _sC('home_blogs', _bD);
      }

      _sSH({ home_view: Date.now() });
      _qA({ type: 'HOME_VISIT', timestamp: Date.now() });
      _sl(false);
    };
    _fD();
  }, []);

  const _rR = _m(() => {
    return _r.map((_i) => (
      <div key={`rcp-${_i.id}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <_C0 recipe={{ 
            ..._i, 
            image_url: optimizeImage(_i.image_url, 400) 
        }} />
        <div style={{ 
          marginTop: '9.7px', padding: '3px', borderRadius: '8px', textAlign: 'center',
          backgroundColor: _i.steps_data ? '#fff4e6' : '#f9f9f9',
          border: _i.steps_data ? '1px solid #ffd8a8' : '1px solid #eee'
        }}>
          <span style={{ fontSize: '0.85rem', color: _i.steps_data ? '#d35400' : '#ccc', fontWeight: 'bold' }}>
            {_i.steps_data ? "Resep Sempurna" : "Lihat Cepat"}
          </span>
        </div>
      </div>
    ));
  }, [_r]);

  return (
    <div className="home-container" style={{ 
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px 100px',
      minHeight: '100vh', 
      overflowX: 'hidden', 
      position: 'relative', 
      zIndex: 1,
      textAlign: 'center'
    }}>
      <_An />
      <_C2 title="Inspirasi Masak Harian" description="Jelajahi resep masakan jadi & lagu memasak untukmu." />
      
      <header style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0 0 10px', marginTop: '-5px' }}>
        <img src="/Og-Icon-Coo-X-For-Fun.svg" alt="L0" loading="lazy" style={{ width: 'clamp(189.96px, 72vw, 189.98px)', height: 'auto' }} />
        <img src={_I0} alt="L1" loading="lazy" style={{ width: 'clamp(132.89px, 56.89vw, 259.86px)', height: 'auto' }} />
      </header>

      <section style={{ maxWidth: '800px', margin: '20px auto 10px' }}>
        <_FW />
      </section>

      <_A0 k="idx-t" />

      <section style={{ marginTop: '3.2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
          <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Resep Terbaru</h3>
          <_L to="/search" style={{ color: '#d35400', textDecoration: 'none', fontWeight: 'bold' }}>Lihat Semua →</_L>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {_rR}
        </div>
        
        {_l && <div style={{ textAlign: 'center', padding: '14.9px' }}>🍲 Memuat...</div>}
      </section>

      <_A0 k="idx-m" />

      {_b.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Postingan Saya (6)</h3>
            <_L to="/blog" style={{ color: '#d35400', fontWeight: 'bold', textDecoration: 'none' }}>Semua →</_L>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {_b.map(_p => (
              <_L key={`blg-${_p.id}`} to={`/blog/${_p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img 
                    src={optimizeImage(_p.image_url, 400)} 
                    alt="B" 
                    loading="lazy"
                    decoding="async"
                    style={{ 
                      width: '100%', 
                      height: '180px', 
                      objectFit: 'cover',
                      contentVisibility: 'auto'
                    }} 
                  />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: '700' }}>{_p.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#777', lineHeight: '1.5', margin: 0, textAlign: 'left' }}>
                      {_p.content?.substring(0, 80)}...
                    </p>
                  </div>
                </article>
              </_L>
            ))}
          </div>
          
          <_A0 k="idx-b" />
        </section>
      )}

      <button onClick={() => _n('/add-recipe')} style={_fB}> + </button>
    </div>
  );
};

const _fB = {
  position: 'fixed', bottom: '100px', right: '25px', width: '60px', height: '60px',
  backgroundColor: '#f3a133', color: 'white', borderRadius: '50%', border: 'none',
  fontSize: '30px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

export default Home;