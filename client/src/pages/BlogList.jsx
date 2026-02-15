import React, { useEffect as _e, useState as _s } from 'react';
import { Link as _L } from 'react-router-dom';
import { supabase as _q } from '../supabaseClient';
import _S2 from '../components/SEO/SEOHelper';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { detectBestImageFormat as _dB } from '../utils/imageFormatSupport';
import { transcodeImage as _tI } from '../utils/transcodeImage';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { registerSW as _rSW } from '../registerSW';

const BlogList = () => {
  const [_p, _sp] = _s([]);
  const [_f, _sf] = _s('webp');

  _e(() => {
    _rSW();
    _dB().then(_res => _sf(_res));
    
    const _cC = _gC('blog_list_main');
    if (_cC) {
      _sp(_cC);
    }

    _q.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          _sp(data);
          _sC('blog_list_main', data);
          _sSH({ list_view: Date.now() });
        }
      });
  }, []);

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
      <_S2 title="Postingan Saya" description="Temukan review makanan jujur dan tempat makan terbaik." />
      
      <header style={{ textAlign: 'center', margin: '30px 0' }}>
        <h1 style={{ color: '#d35400', fontSize: '1.8rem', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          Postingan Saya
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
          Review Jujur Makanan & Tempat
        </p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        {_p.map((_item, _idx) => (
          <_L to={`/blog/${_item.slug}`} key={_item.id} style={{ textDecoration: 'none', display: 'block' }}>
            <article style={{ 
              background: 'white', borderRadius: '16px', overflow: 'hidden', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
              transition: 'transform 0.2s ease-in-out'
            }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <BlogImage url={_item.image_url} alt={_item.title} format={_f} priority={_idx === 0} />
              </div>
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 12px 0', color: '#222', lineHeight: '1.4' }}>
                  {_item.title}
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6', margin: 0 }}>
                  {_item.content?.substring(0, 120)}... 
                  <span style={{ color: '#d35400', fontWeight: 'bold', marginLeft: '5px', display: 'inline-block' }}>
                    Baca Review Lengkap →
                  </span>
                </p>
              </div>
            </article>
          </_L>
        ))}
      </main>
    </div>
  );
};

const BlogImage = ({ url, alt, format, priority }) => {
  const [_src, _set] = _s(url);
  _e(() => {
    let _active = true;
    const _cK = `img_thmb_${btoa(url).slice(0,16)}`;
    const _cached = _gC(_cK);
    if (_cached) { _set(_cached); return; }

    fetch(url, { mode: 'cors' })
      .then(_r => _r.blob())
      .then(_b => _tI(URL.createObjectURL(_b), format))
      .then(_res => {
        const _u = URL.createObjectURL(_res);
        if (_active) { _set(_u); _sC(_cK, _u); }
      })
      .catch(() => { if (_active) _set(url); });
    return () => { _active = false; };
  }, [url, format]);

  return (
    <img 
      src={_src} alt={alt} 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      loading={priority ? "eager" : "lazy"}
    />
  );
};

export default BlogList;