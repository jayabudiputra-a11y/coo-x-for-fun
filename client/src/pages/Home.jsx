import React, { useEffect as E, useState as S, useMemo as M, useRef as UR, useCallback as CB } from 'react';
import { Link as L, useNavigate as UN } from 'react-router-dom';
import { supabase as Q } from '../supabaseClient';
import C0 from '../components/Recipe/RecipeCard';
import C1 from '../components/Layout/CountryWidget';
import C2 from '../components/SEO/SEOHelper';
import { useTranslation as T } from 'react-i18next';
import { getLocalized as G } from '../utils/langHelper';
import I0 from '../assets/121x121-icon-coo-x-for-fun--.png';

const A0 = React.memo(({ k }) => {
  const adDoc = `<html><body style="margin:0;display:flex;justify-content:center;"><script>atOptions={'key':'00a1391f38d87ff5d574caa89f0d2959','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js" onerror="console.warn('Iklan tidak dapat dimuat atau diblokir')"></script></body></html>`;
  
  return (
    <div style={{ position: 'relative', width: '100%', margin: '15px 0', display: 'flex', justifyContent: 'center', minHeight: '250px', contain: 'layout style' }}>
      <iframe 
        key={k} 
        title="Ad" 
        srcDoc={adDoc} 
        style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden', background: '#fafafa' }} 
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
});

const Home = () => {
  const { t, i18n } = T();
  const n0 = UN();

  const [recipes, setRecipes] = S([]);
  const [blogs, setBlogs] = S([]);
  const [loading, setLoading] = S(false);

  E(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      const { data } = await Q
        .from('recipes')
        .select('id, title, title_en, slug, image_url, country, country_en, author_name, steps_data')
        .limit(6)
        .order('id', { ascending: false });

      if (data) setRecipes(data);
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  E(() => {
    const fetchBlogs = async () => {
      const { data } = await Q
        .from('blog_posts')
        .select('*')
        .limit(2)
        .order('created_at', { ascending: false });
      if (data) setBlogs(data);
    };
    fetchBlogs();
  }, []);

  const renderedRecipes = M(() => {
    return recipes.map((item, index) => {
      const recipeLabel = i18n.language === 'en' ? 'Perfect Recipe' : 'Resep Sempurna';
      const quickViewLabel = i18n.language === 'en' ? 'Quick View' : 'Lihat Cepat';

      // Pastikan 'country' diterjemahkan menggunakan helper G
      const translatedItem = {
        ...item,
        title: G(item, 'title', i18n.language),
        country: G(item, 'country', i18n.language) // Ini akan mencari country_en jika lang === 'en'
      };

      return (
        <div 
          key={`recipe-${item.id}-${index}`} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            contentVisibility: 'auto', 
            containIntrinsicSize: '276.89px',
            willChange: 'transform'
          }}
        >
          <C0 recipe={translatedItem} />
          
          <div style={{ 
            marginTop: '10px', padding: '5px', borderRadius: '8px', textAlign: 'center',
            backgroundColor: item.steps_data ? '#fff4e6' : '#f9f9f9',
            border: item.steps_data ? '1px solid #ffd8a8' : '1px solid #eee'
          }}>
            <span style={{ fontSize: '0.85rem', color: item.steps_data ? '#d35400' : '#ccc', fontWeight: item.steps_data ? 'bold' : 'normal' }}>
              {item.steps_data ? recipeLabel : quickViewLabel}
            </span>
          </div>
        </div>
      );
    });
  }, [recipes, i18n.language]);

  return (
    <div className="container" style={{ paddingBottom: '109.89px', minHeight: '100vh', scrollBehavior: 'smooth', overflowX: 'hidden' }}>
      <C2 title={t('home.welcome')} description={t('home.subtitle')} />

      <header className="header-branding-container">
        <img 
          src="/Og-Icon-Coo-X-For-Fun.svg" 
          alt="Coo-X SVG" 
          className="logo-svg-main"
          style={{ 
            width: 'clamp(149.89px, 59.78vw, 199.78px)', 
            height: 'auto', 
            objectFit: 'contain' 
          }} 
        />
        <img 
          src={I0} 
          alt="Coo-X PNG" 
          className="logo-png-main"
          style={{ 
            width: 'clamp(138.67px, 21.89vw, 198.56px)', 
            height: 'auto', 
            objectFit: 'contain' 
          }} 
        />
      </header>

      <C1 />
      
      <A0 k="smart-home-ad" />

      <section style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>
              {t('home.trending_title')}
            </h3>
            <L to="/search" style={{ color: '#d35400', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}>
              {t('home.view_all_recipes')}
            </L>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {renderedRecipes}
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '2rem' }}>
            <div className="animate-spin">🍲</div>
          </div>
        )}
      </section>

      {blogs.length > 0 && (
        <section style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '800' }}>
              {t('home.journal_title')}
            </h3>
            <L to="/blog" style={{ color: '#d35400', fontWeight: 'bold', textDecoration: 'none' }}>
              {t('home.view_all_journal')} →
            </L>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {blogs.map(post => (
              <L key={`blog-${post.id}`} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={post.image_url} alt="blog" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: '700' }}>{G(post, 'title', i18n.language)}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#777', lineHeight: '1.5' }}>
                      {G(post, 'content', i18n.language)?.substring(0, 70)}...
                    </p>
                  </div>
                </article>
              </L>
            ))}
          </div>
        </section>
      )}

      <button onClick={() => n0('/add-recipe')} style={fabStyle}> + </button>
      
      <style>{`
        .header-branding-container {
          padding: 1px 0 1.79px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1px;
          flex-wrap: nowrap;
        }

        @media (min-width: 1024px) {
          .header-branding-container {
            gap: 40px;
            padding: 40px 0;
          }
          .logo-svg-main, .logo-png-main {
            width: clamp(300px, 30vw, 450px) !important; 
          }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d35400; border-radius: 10px; }
        .animate-spin { animation: spin 2s linear infinite; display: inline-block; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const fabStyle = {
  position: 'fixed', bottom: '100px', right: '25px', width: '60px', height: '60px',
  backgroundColor: '#f3a133', color: 'white', border: 'none', borderRadius: '50%',
  fontSize: '30px', fontWeight: 'bold', cursor: 'pointer', zIndex: 1000,
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.2s active'
};

export default Home;