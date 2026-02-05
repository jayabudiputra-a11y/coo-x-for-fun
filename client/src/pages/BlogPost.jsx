import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase as S } from '../supabaseClient'
import SEOHelper from '../components/SEO/SEOHelper'

const A = () => {
  const { slug: x } = useParams()
  const [p, y] = useState(null)
  const [l, z] = useState(true)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    (async () => {
      z(true);
      const { data: d, error: err } = await S.from('blog_posts').select('*').eq('slug', x).single();
      if (err) console.error("Error fetching post:", err);
      y(d);
      z(false);
    })();

    return () => window.removeEventListener('resize', handleResize);
  }, [x])

  if (l) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#fff', fontFamily: 'monospace' }}>Memuat...</motion.div>
  if (!p) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#fff', fontFamily: 'monospace' }}>Artikel Tidak Ditemukan</motion.div>

  const judulData = p.title;
  const kontenData = p.content;

  const s = {
    w: { maxWidth: '800px', margin: '0 auto', padding: '15px 10px 100px', boxSizing: 'border-box' },
    
    // REVISI TOMBOL BACK: Teks putih solid, tanpa bayangan ungu pada font
    b: { 
      display: 'inline-block !important', 
      background: '#000000 !important', 
      color: '#ffffff !important', // Putih solid
      padding: '10px 20px', 
      fontSize: '12px', 
      fontWeight: '900', 
      textDecoration: 'none !important', 
      border: '2px solid #ffffff', 
      boxShadow: '4px 4px 0 #00ffff', // Shadow tetap cyan agar retro
      marginBottom: '25px', 
      textTransform: 'uppercase',
      fontFamily: "'Open Sans', sans-serif",
      letterSpacing: '1px',
      textShadow: 'none !important' // Pastikan tidak ada bayangan ungu pada font
    },
    
    k: { 
      background: '#fff', 
      border: '4px solid #000', 
      boxShadow: '8px 8px 0px #ff00ff', 
      overflow: 'hidden', 
      maxWidth: '500px', 
      width: '100%', 
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    t: { 
      background: '#fff', 
      color: '#000', 
      padding: '20px 15px', 
      textAlign: 'center', 
      fontSize: 'clamp(18px, 5vw, 24px)', 
      fontWeight: '900',
      textTransform: 'uppercase', 
      letterSpacing: '1px', 
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      borderBottom: '5px solid #000',
      fontFamily: "'Open Sans', sans-serif"
    },
    logo: { width: '28px', height: '28px', objectFit: 'contain' },
    i: { width: '100%', display: 'block', borderBottom: '5px solid #000', objectFit: 'cover', height: 'auto' },
    c: { padding: '20px', fontFamily: "'Open Sans', sans-serif", boxSizing: 'border-box' },
    bd: { display: 'inline-block', background: '#ffff00', color: '#000', padding: '5px 10px', fontSize: '10px', fontWeight: 900, border: '2px solid #000', marginBottom: '15px' },
    d: { fontSize: '14px', lineHeight: 1.6, color: '#444', marginBottom: '20px', textAlign: 'justify', whiteSpace: 'pre-line', fontWeight: '600' },
    hl: { background: '#00ffff', border: '2px solid #000', padding: '12px', margin: '15px 0', fontStyle: 'italic', fontSize: '13px', boxShadow: '4px 4px 0 #ff00ff' },
    dl: { margin: '0 0 20px', padding: 0 },
    dlg: { padding: '10px 0', borderBottom: '1px solid #eee' },
    dt: { color: '#ff00ff', display: 'block', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900' },
    dd: { margin: 0, fontSize: '13px', color: '#555' },
    
    fb: { 
      display: 'block !important', 
      background: '#0026ff !important', 
      color: '#ffffff !important', 
      textAlign: 'center', 
      padding: '15px', 
      border: '2px solid #000', 
      textDecoration: 'none !important', 
      fontWeight: '900', 
      fontSize: '13px', 
      boxShadow: '4px 4px 0 #ff00ff',
      textTransform: 'uppercase',
      marginTop: '15px'
    }
  }

  const BannerAd = () => {
    const scale = windowWidth < 728 ? (windowWidth - 20) / 728 : 1;
    const height = 90 * scale;

    return (
      <div style={{
        width: '100%',
        height: `${height}px`,
        margin: '20px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible'
      }}>
        <div style={{
          width: '728px',
          height: '90px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0
        }}>
          <iframe
            title="banner-ad"
            srcDoc={`
              <html>
                <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;">
                  <script type="text/javascript">
                    atOptions = { 'key' : '91c8fb5f0a628b5ce0d9941ec5de7c59', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
                  </script>
                  <script type="text/javascript" src="https://www.highperformanceformat.com/91c8fb5f0a628b5ce0d9941ec5de7c59/invoke.js"></script>
                </body>
              </html>
            `}
            style={{ width: '728px', height: '90px', border: 'none' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', overflowX: 'hidden' }}>
      <meta name="monetag" content="23efc5a7bff5e4fcf3e21e3fb407b3cd" />
      <SEOHelper title={judulData} description={kontenData.substring(0, 150)} image={p.image_url} />
      
      <div style={s.w}>
        <BannerAd />

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Link to="/blog" style={s.b}>&lt;-- BACK</Link>
        </motion.div>
        
        <motion.article initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={s.k}>
          <div style={s.t}>
            <img src="/logo.svg" alt="logo" style={s.logo} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{judulData}</span>
          </div>

          <img src={p.image_url} alt={judulData} style={s.i} />
          
          <div style={s.c}>
            <span style={s.bd}>[ VERIFIED ]</span>
            <p style={s.d}>{kontenData}</p>
            {p.quote && <blockquote style={s.hl}>"{p.quote}"</blockquote>}
            {p.content_secondary && <p style={s.d}>{p.content_secondary}</p>}
            
            <dl style={s.dl}>
              <div style={s.dlg}><dt style={s.dt}>LOCATION</dt><dd style={s.dd}>{p.location || '-'}</dd></div>
              <div style={s.dlg}><dt style={s.dt}>OPENING HOURS</dt><dd style={s.dd}>{p.opening_hours || '-'}</dd></div>
              <div style={s.dlg}><dt style={s.dt}>PRICE RANGE</dt><dd style={s.dd}>{p.price_range || '-'}</dd></div>
            </dl>

            <div style={{ marginTop: '20px', borderTop: '4px double #000', paddingTop: '10px' }}>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noreferrer" 
                style={s.fb}
              >
                SHARE ON FACEBOOK
              </a>
            </div>
          </div>
        </motion.article>

        <BannerAd />
      </div>
    </div>
  )
}

export default A;