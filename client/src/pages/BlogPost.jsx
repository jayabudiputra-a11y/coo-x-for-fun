import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase as S } from '../supabaseClient'
import SEOHelper from '../components/SEO/SEOHelper'

const A = () => {
  const { slug: x } = useParams()
  const [p, y] = useState(null)
  const [l, z] = useState(true)

  useEffect(() => {
    (async () => {
      z(true);
      const { data: d, error: err } = await S.from('blog_posts').select('*').eq('slug', x).single();
      if (err) console.error("Error fetching post:", err);
      y(d);
      z(false);
    })()
  }, [x])

  if (l) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#fff', fontFamily: 'monospace' }}>Memuat...</motion.div>
  if (!p) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '50px', textAlign: 'center', color: '#fff', fontFamily: 'monospace' }}>Artikel Tidak Ditemukan</motion.div>

  const judulData = p.title;
  const kontenData = p.content;

  const s = {
    w: { maxWidth: '500px', margin: '0 auto', padding: '20px 15px 100px' },
    
    // Tombol Back - DIPAKSA SOLID (Warna tetap putih saat ditekan)
    b: { 
      display: 'inline-block !important', 
      background: '#ff00ff !important', 
      color: '#ffffff !important', 
      padding: '10px 15px', 
      fontSize: '12px', 
      fontWeight: '900', 
      textDecoration: 'none !important', 
      border: '3px solid #000', 
      boxShadow: '5px 5px 0 #00ffff', 
      marginBottom: '25px', 
      textTransform: 'uppercase',
      fontFamily: "'Open Sans', sans-serif"
    },
    
    k: { background: '#fff', border: '4px solid #000', boxShadow: '12px 12px 0px #ff00ff', overflow: 'hidden' },
    
    t: { 
      background: '#fff', 
      color: '#000', 
      padding: '30px 20px', 
      textAlign: 'center', 
      fontSize: '24px', 
      fontWeight: '900',
      textTransform: 'uppercase', 
      letterSpacing: '1px', 
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      borderBottom: '5px solid #000',
      fontFamily: "'Open Sans', sans-serif"
    },
    
    logo: { width: '35px', height: '35px', objectFit: 'contain' },
    i: { width: '100%', display: 'block', borderBottom: '5px solid #000', objectFit: 'cover' },
    c: { padding: '25px', fontFamily: "'Open Sans', sans-serif" },
    bd: { display: 'inline-block', background: '#ffff00', color: '#000', padding: '5px 10px', fontSize: '11px', fontWeight: '900', border: '2px solid #000', marginBottom: '20px' },
    d: { fontSize: '16px', lineHeight: 1.6, color: '#000', marginBottom: '25px', textAlign: 'left', whiteSpace: 'pre-line', fontWeight: '600' },
    hl: { background: '#00ffff', border: '2px solid #000', padding: '15px', margin: '20px 0', fontWeight: 'bold', fontSize: '14px', boxShadow: '4px 4px 0 #ff00ff' },
    dl: { margin: '0 0 25px', padding: 0 },
    dlg: { padding: '12px 0', borderBottom: '2px solid #eee' },
    dt: { color: '#ff00ff', display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', fontWeight: '900' },
    dd: { margin: 0, fontSize: '15px', color: '#000', fontWeight: 'bold' },
    
    // Tombol Share - DIPAKSA SOLID (Teks tetap putih)
    fb: { 
      display: 'block !important', 
      background: '#0000ff !important', 
      color: '#ffffff !important', 
      textAlign: 'center', 
      padding: '18px', 
      border: '3px solid #000', 
      textDecoration: 'none !important', 
      fontWeight: '900', 
      fontSize: '14px', 
      boxShadow: '6px 6px 0 #ff00ff',
      textTransform: 'uppercase',
      marginTop: '20px'
    }
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh' }}>
      <SEOHelper title={judulData} description={kontenData.substring(0, 150)} image={p.image_url} />
      <div style={s.w}>
        
        {/* Navigasi Kembali */}
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Link to="/blog" style={s.b}>&lt;-- BACK TO BLOG</Link>
        </motion.div>
        
        <motion.article initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={s.k}>
          
          <div style={s.t}>
            <img src="/logo.svg" alt="logo" style={s.logo} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>{judulData}</h1>
          </div>

          <img src={p.image_url} alt={judulData} style={s.i} />
          
          <div style={s.c}>
            <span style={s.bd}>[ VERIFIED REVIEW ]</span>
            
            <p style={s.d}>{kontenData}</p>
            
            {p.quote && <blockquote style={s.hl}>"{p.quote}"</blockquote>}
            
            {p.content_secondary && <p style={s.d}>{p.content_secondary}</p>}
            
            <dl style={s.dl}>
              <div style={s.dlg}><dt style={s.dt}>LOCATION /</dt><dd style={s.dd}>{p.location || '-'}</dd></div>
              <div style={s.dlg}><dt style={s.dt}>OPENING HOURS /</dt><dd style={s.dd}>{p.opening_hours || '-'}</dd></div>
              <div style={s.dlg}><dt style={s.dt}>PRICE RANGE /</dt><dd style={s.dd}>{p.price_range || '-'}</dd></div>
            </dl>

            <div style={{ marginTop: '30px', borderTop: '4px double #000', paddingTop: '10px' }}>
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
      </div>
    </div>
  )
}

export default A;