import React, { useEffect as E, useState as S, useMemo as M } from 'react';
import { Link as L, useNavigate as UN } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { supabase as Q } from '../supabaseClient';
import C0 from '../components/Recipe/RecipeCard';
import C1 from '../components/Layout/CountryWidget';
import C2 from '../components/SEO/SEOHelper';
import I0 from '../assets/121x121-icon-coo-x-for-fun--.png';

const A0 = React.memo(({ k }) => {
  const adDoc = `<html><body style="margin:0;display:flex;justify-content:center;"><script>atOptions={'key':'00a1391f38d87ff5d574caa89f0d2959','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script></body></html>`;
  return (
    <div style={{ position: 'relative', width: '100%', margin: '15px 0', display: 'flex', justifyContent: 'center', minHeight: '250px' }}>
      <iframe 
        key={k} 
        title="Ad" 
        srcDoc={adDoc} 
        style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }} 
        loading="lazy" 
        sandbox="allow-scripts allow-same-origin allow-forms" 
      />
    </div>
  );
});

const Home = () => {
  const n0 = UN();
  const [recipes, setRecipes] = S([]);
  const [blogs, setBlogs] = S([]);
  const [loading, setLoading] = S(false);

  E(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: rData } = await Q.from('recipes').select('*').limit(6).order('id', { ascending: false });
      if (rData) setRecipes(rData);
      const { data: bData } = await Q.from('blog_posts').select('*').limit(2).order('created_at', { ascending: false });
      if (bData) setBlogs(bData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderedRecipes = M(() => {
    return recipes.map((item) => {
      const recipeItem = { ...item, country: item.country };
      return (
        <div key={`recipe-${item.id}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <C0 recipe={recipeItem} />
          <div style={{ 
            marginTop: '10px', padding: '3px', borderRadius: '8px', textAlign: 'center',
            backgroundColor: item.steps_data ? '#fff4e6' : '#f9f9f9',
            border: item.steps_data ? '1px solid #ffd8a8' : '1px solid #eee'
          }}>
            <span style={{ fontSize: '0.85rem', color: item.steps_data ? '#d35400' : '#ccc', fontWeight: 'bold' }}>
              {item.steps_data ? "Resep Sempurna" : "Lihat Cepat"}
            </span>
          </div>
        </div>
      );
    });
  }, [recipes]);

  return (
    <div className="container" style={{ paddingBottom: '50px', minHeight: '100vh', overflowX: 'hidden' }}>
      <Analytics />
      <C2 
        title="Inspirasi Masak Harian" 
        description="Jelajahi rasa otentik dari berbagai negara & cerita kuliner terbaik." 
      />
      
      {/* HEADER BRANDING: Diperbesar dan Dirapatkan ke Navbar */}
      <header className="header-branding-container" style={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'nowrap', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '0px 0 10px', /* Padding 0 agar menempel ke Navbar */
        marginTop: '-5px'      /* Menarik header sedikit ke atas */
      }}>
        <img 
          src="/Og-Icon-Coo-X-For-Fun.svg" 
          alt="Logo SVG" 
          style={{ width: 'clamp(230px, 50vw, 320px)', height: 'auto', objectFit: 'contain' }} 
        />
        <img 
          src={I0} 
          alt="Logo PNG" 
          style={{ width: 'clamp(220px, 47vw, 310px)', height: 'auto', objectFit: 'contain' }} 
        />
      </header>

      <C1 />
      <A0 k="home-ad" />

      <section style={{ marginTop: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
          <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Resep Masakan Jadi</h3>
          <L to="/search" style={{ color: '#d35400', textDecoration: 'none', fontWeight: 'bold' }}>Lihat Semua →</L>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {renderedRecipes}
        </div>
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>🍲</div>}
      </section>

      {blogs.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '800', margin: 0, fontSize: '1.4rem' }}>Postingan Saya</h3>
            <L to="/blog" style={{ color: '#d35400', fontWeight: 'bold', textDecoration: 'none' }}>Semua →</L>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {blogs.map(post => (
              <L key={`blog-${post.id}`} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={post.image_url} alt="blog" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: '700' }}>{post.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#777', lineHeight: '1.5', margin: 0 }}>
                      {post.content?.substring(0, 80)}...
                    </p>
                  </div>
                </article>
              </L>
            ))}
          </div>
        </section>
      )}

      <button onClick={() => n0('/add-recipe')} style={fabStyle}> + </button>
    </div>
  );
};

const fabStyle = {
  position: 'fixed', bottom: '100px', right: '25px', width: '60px', height: '60px',
  backgroundColor: '#f3a133', color: 'white', borderRadius: '50%', border: 'none',
  fontSize: '30px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

export default Home;