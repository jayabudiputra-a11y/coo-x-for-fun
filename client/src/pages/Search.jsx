import React, { useState as S, useEffect as E, useCallback as CB, useRef as UR } from 'react';
import { useSearchParams as U } from 'react-router-dom';
import { useTranslation as T } from 'react-i18next';
import { supabase as Q } from '../supabaseClient';
import C0 from '../components/Recipe/RecipeCard';
import C1 from '../components/SEO/SEOHelper';

const A0 = React.memo(({ k }) => {
  const adDoc = `<html><body style="margin:0;display:flex;justify-content:center;"><script>atOptions={'key':'00a1391f38d87ff5d574caa89f0d2959','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js" onerror="console.warn('Ad blocked')"></script></body></html>`;
  return (
    <div style={{ position: 'relative', width: '100%', margin: '15px 0', display: 'flex', justifyContent: 'center', minHeight: '250px' }}>
      <iframe
        key={k}
        title="Ad"
        srcDoc={adDoc}
        style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden', background: '#fafafa' }}
      />
    </div>
  );
});

const SearchPage = () => {
  const [p0, p1] = U();
  const k0 = p0.get('q') || '';
  const { t, i18n } = T();

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
        title={q ? `${t('nav.search')}: ${q}` : t('home.welcome')}
        description={t('home.subtitle')}
      />

      <div style={{ maxWidth: '600px', margin: '20px auto 30px', textAlign: 'center', minHeight: '120px' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#d35400', fontWeight: '800', textTransform: 'uppercase' }}>
          {i18n.language === 'en' ? 'FIND RECIPES' : 'TEMUKAN RESEP'}
        </h1>

        <form onSubmit={f0} style={{ position: 'relative' }}>
          <input
            type="text"
            value={q}
            onChange={(e) => sQ(e.target.value)}
            placeholder={i18n.language === 'en' ? 'Search menu...' : 'Cari menu...'}
            style={{
              width: '100%', padding: '16px 22px', borderRadius: '50px',
              border: '2px solid #eee', outline: 'none', fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              background: '#d35400', color: 'white', border: 'none',
              borderRadius: '50px', padding: '0 25px', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {t('nav.search')}
          </button>
        </form>
      </div>

      {adv && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '323px', margin: '0 auto 20px', minHeight: '250px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => sAdv(false)}
            style={{ position: 'absolute', top: '-10px', right: '0px', width: '30px', height: '30px', background: '#000', color: '#fff', border: '2px solid #fff', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', zIndex: 10, fontWeight: 'bold' }}
          > × </button>
          <A0 k={k0} />
        </div>
      )}

      {h && (
        <div style={{ transition: 'opacity 0.2s' }}>
          <div style={{ marginBottom: '20px', padding: '8px 15px', background: '#fff9f4', borderRadius: '8px', borderLeft: '4px solid #d35400', display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              {i18n.language === 'en' ? (
                <>Showing <strong>{r.length}</strong> recipes for <strong>"{k0}"</strong></>
              ) : (
                <>Menampilkan <strong>{r.length}</strong> resep untuk <strong>"{k0}"</strong></>
              )}
            </p>
          </div>

          {r.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
              {r.map((item, index) => {
                const isLast = r.length === index + 1;
                return (
                  <div ref={isLast ? lastRecipeRef : null} key={`search-${item.id}-${index}`}>
                    <C0 recipe={item} />
                  </div>
                );
              })}
            </div>
          ) : !l && (
            <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ color: '#999' }}>
                {i18n.language === 'en' 
                  ? `Recipe "${k0}" not found.` 
                  : `Resep "${k0}" tidak ditemukan.`}
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