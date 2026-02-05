import React, { useEffect as E, useState as S, useCallback as CB, useRef as UR, useMemo as M } from 'react';
import { useSearchParams as U } from 'react-router-dom';
import { supabase as Q } from '../supabaseClient';
import C0 from '../components/Recipe/RecipeCard';
import C1 from '../components/SEO/SEOHelper';

// --- HELPER: OPTIMASI GAMBAR (Konsisten dengan Home) ---
const optimizeImage = (url, width = 400) => {
  if (!url) return '';
  // 1. Supabase
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=75`;
  }
  // 2. Pexels
  if (url.includes('pexels.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
  }
  // 3. Unsplash
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75&fm=webp`;
  }
  return url;
};

// --- KOMPONEN IKLAN (Optimized) ---
const A0 = React.memo(({ k }) => {
  const adDoc = M(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>body, html { margin: 0; padding: 0; background: transparent; overflow: hidden; height: 250px; display: flex; justify-content: center; }</style>
      </head>
      <body>
        <div id="w">
          <script type="text/javascript">atOptions = { 'key' : '00a1391f38d87ff5d574caa89f0d2959', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };</script>
          <script async src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script>
        </div>
      </body>
    </html>
  `, []);

  return (
    <div style={{ 
      position: 'relative', width: '100%', margin: '15px 0', display: 'flex', 
      justifyContent: 'center', minHeight: '250px', background: '#fafafa', borderRadius: '12px',
      // Optimasi Layout Shift
      contentVisibility: 'auto', 
      containIntrinsicSize: '300px 250px'
    }}>
      <iframe
        key={k}
        title="Iklan Sponsor"
        srcDoc={adDoc}
        style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
});

const SearchPage = () => {
  const [p0, p1] = U();
  const k0 = p0.get('q') || '';

  const [q, sQ] = S(k0);
  const [r, sR] = S([]);
  const [l, sL] = S(false);
  const [h, sH] = S(!!k0);
  const [adv, sAdv] = S(true);
  
  const [page, setPage] = S(0);
  const [hasMore, setHasMore] = S(true);
  const observer = UR();

  const lastRecipeRef = CB((node) => {
    if (l) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [l, hasMore]);

  const x0 = CB(async (k, p, isNewSearch = false) => {
    if (!k || !k.trim()) return;
    sL(true);
    sH(true);

    const from = p * 8;
    const to = from + 7;

    try {
      const { data: d, error: e } = await Q
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${k}%,title_en.ilike.%${k}%,description.ilike.%${k}%,description_en.ilike.%${k}%,country.ilike.%${k}%,country_en.ilike.%${k}%`)
        .range(from, to)
        .order('id', { ascending: false });

      if (!e && d) {
        sR(prev => {
          if (isNewSearch) return d;
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNew = d.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNew];
        });
        if (d.length < 8) setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      sL(false);
    }
  }, []);

  E(() => {
    if (k0) {
      sQ(k0);
      setPage(0);
      setHasMore(true);
      x0(k0, 0, true);
    } else {
      sR([]);
      sH(false);
    }
  }, [k0, x0]);

  E(() => {
    if (page > 0 && k0) {
      x0(k0, page, false);
    }
  }, [page, k0, x0]);

  const f0 = (e) => {
    e.preventDefault();
    if (q.trim() === k0) return;
    p1({ q });
  };

  return (
    <div className="container" style={{ paddingBottom: '120px', contain: 'public cache' }}>
      <C1
        title={q ? `Cari: ${q}` : "Inspirasi Masak Harian"}
        description="Jelajahi rasa otentik dari berbagai negara & cerita kuliner terbaik."
      />

      <div style={{ maxWidth: '600px', margin: '20px auto 30px', textAlign: 'center', minHeight: '120px' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#d35400', fontWeight: '800', textTransform: 'uppercase' }}>
          TEMUKAN RESEP
        </h1>

        <form onSubmit={f0} style={{ position: 'relative' }} role="search">
          <input
            type="text"
            value={q}
            onChange={(e) => sQ(e.target.value)}
            placeholder="Cari menu..."
            // FIX ACCESSIBILITY: Label untuk screen reader
            aria-label="Kata kunci pencarian resep"
            name="q"
            style={{
              width: '100%', padding: '16px 22px', borderRadius: '50px',
              border: '2px solid #eee', outline: 'none', fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            // FIX ACCESSIBILITY: Label eksplisit
            aria-label="Mulai Pencarian"
            style={{
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              background: '#d35400', color: 'white', border: 'none',
              borderRadius: '50px', padding: '0 25px', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            CARI
          </button>
        </form>
      </div>

      {adv && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '323px', margin: '0 auto 20px', minHeight: '250px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => sAdv(false)}
            // FIX ACCESSIBILITY: Tombol "X" harus punya label
            aria-label="Tutup Iklan"
            style={{ position: 'absolute', top: '-10px', right: '0px', width: '30px', height: '30px', background: '#000', color: '#fff', border: '2px solid #fff', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', zIndex: 10, fontWeight: 'bold' }}
          > × </button>
          <A0 k={k0} />
        </div>
      )}

      {h && (
        <div style={{ transition: 'opacity 0.2s' }}>
          <div style={{ marginBottom: '20px', padding: '8px 15px', background: '#fff9f4', borderRadius: '8px', borderLeft: '4px solid #d35400', display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Menampilkan <strong>{r.length}</strong> resep untuk <strong>"{k0}"</strong>
            </p>
          </div>

          {r.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
              {r.map((item, index) => {
                const isLast = r.length === index + 1;
                // MENERAPKAN OPTIMASI GAMBAR KE RECIPE CARD
                const optimizedItem = {
                    ...item,
                    image_url: optimizeImage(item.image_url, 400)
                };

                return (
                  <div ref={isLast ? lastRecipeRef : null} key={`search-${item.id}-${index}`}>
                    <C0 recipe={optimizedItem} />
                  </div>
                );
              })}
            </div>
          ) : !l && (
            <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ color: '#999' }}>
                Resep "{k0}" tidak ditemukan.
              </p>
            </div>
          )}
        </div>
      )}

      {l && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '2rem' }}>🍲</div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;