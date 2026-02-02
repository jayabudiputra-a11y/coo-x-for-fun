import React, { useEffect as _e, useState as _s, useMemo as _m } from 'react';
import { Link as _L, useNavigate as _uN } from 'react-router-dom';
import { Analytics as _An } from "@vercel/analytics/react";
import { supabase as _q } from '../supabaseClient';
import _C0 from '../components/Recipe/RecipeCard';
import _C1 from '../components/Layout/CountryWidget';
import _C2 from '../components/SEO/SEOHelper';
import _I0 from '../assets/121x121-icon-coo-x-for-fun--.png';

const _A0 = React.memo(({ k }) => {
  const [_v, _sV] = _s(true);
  
  const _adC = _m(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, html { margin: 0; padding: 0; background: transparent; overflow: hidden; height: 250px; display: flex; justify-content: center; }
          #ad-wrapper { width: 300px; height: 250px; position: relative; }
        </style>
      </head>
      <body>
        <div id="ad-wrapper">
          <script type="text/javascript">
            atOptions = {
              'key' : '00a1391f38d87ff5d574caa89f0d2959',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          </script>
          <script async src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script>
        </div>
      </body>
    </html>
  `, []);

  if (!_v) return null;

  return (
    <div className="sys-ad-node" style={{ 
      position: 'relative', width: '100%', margin: '20px 0', display: 'flex', 
      justifyContent: 'center', minHeight: '250px', backgroundColor: '#fafafa', 
      borderRadius: '12px', overflow: 'hidden' 
    }}>
      <button 
        onClick={() => _sV(false)} 
        style={{ 
          position: 'absolute', top: '5px', right: '5px', width: '28px', height: '28px', 
          borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', 
          border: '2px solid #fff', cursor: 'pointer', zIndex: 10, fontSize: '14px',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      > × </button>
      <iframe 
        key={k} 
        title="Content Service" 
        srcDoc={_adC} 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        scrolling="no"
        frameBorder="0"
        loading="eager" 
        style={{ width: '300px', height: '250px', border: 'none' }} 
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
    const _fD = async () => {
      _sl(true);
      const { data: _rD } = await _q.from('recipes').select('*').limit(6).order('id', { ascending: false });
      if (_rD) _sr(_rD);
      const { data: _bD } = await _q.from('blog_posts').select('*').limit(2).order('created_at', { ascending: false });
      if (_bD) _sb(_bD);
      _sl(false);
    };
    _fD();
  }, []);

  const _rR = _m(() => {
    return _r.map((_item) => (
      <div key={`rcp-${_item.id}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <_C0 recipe={{ ..._item }} />
        <div style={{ 
          marginTop: '9.7px', padding: '3px', borderRadius: '8px', textAlign: 'center',
          backgroundColor: _item.steps_data ? '#fff4e6' : '#f9f9f9',
          border: _item.steps_data ? '1px solid #ffd8a8' : '1px solid #eee'
        }}>
          <span style={{ fontSize: '0.85rem', color: _item.steps_data ? '#d35400' : '#ccc', fontWeight: 'bold' }}>
            {_item.steps_data ? "Resep Sempurna" : "Lihat Cepat"}
          </span>
        </div>
      </div>
    ));
  }, [_r]);

  return (
    <div className="home-main-container" style={{ paddingBottom: '100px', minHeight: '100vh', overflowX: 'hidden' }}>
      <_An />
      <_C2 title="Inspirasi Masak Harian" description="Temukan resep terbaik dari seluruh dunia." />
      
      <header style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0 0 10px', marginTop: '-5px' }}>
        <img src="/Og-Icon-Coo-X-For-Fun.svg" alt="Branding" style={{ width: 'clamp(189.96px, 72vw, 189.98px)', height: 'auto' }} />
        <img src={_I0} alt="Icon" style={{ width: 'clamp(132.89px, 56.89vw, 259.86px)', height: 'auto' }} />
      </header>

      <_C1 />
      
      <_A0 k="home-top-ad" />

      <section style={{ marginTop: '3.2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
          <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Resep Masakan Jadi</h3>
          <_L to="/search" style={{ color: '#d35400', textDecoration: 'none', fontWeight: 'bold' }}>Lihat Semua →</_L>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {_rR}
        </div>
        {_l && <div style={{ textAlign: 'center', padding: '14.9px' }}>🍲</div>}
      </section>

      {_b.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Postingan Saya</h3>
            <_L to="/blog" style={{ color: '#d35400', fontWeight: 'bold', textDecoration: 'none' }}>Semua →</_L>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {_b.map(_p => (
              <_L key={`blg-${_p.id}`} to={`/blog/${_p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={_p.image_url} alt="Cover" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: '700' }}>{_p.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#777', margin: 0 }}>{_p.content?.substring(0, 80)}...</p>
                  </div>
                </article>
              </_L>
            ))}
          </div>
        </section>
      )}

      <_A0 k="home-bot-0" />

      <button onClick={() => _n('/add-recipe')} style={_fS}> + </button>
    </div>
  );
};

const _fS = {
  position: 'fixed', bottom: '100px', right: '25px', width: '60px', height: '60px',
  backgroundColor: '#f3a133', color: 'white', borderRadius: '50%', border: 'none',
  fontSize: '30px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

export default Home;