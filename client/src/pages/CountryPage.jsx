import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/Recipe/RecipeCard';
import SEOHelper from '../components/SEO/SEOHelper';

const CountryPage = () => {
  const { name } = useParams(); 
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .or(`country.ilike.%${name}%,country_en.ilike.%${name}%`);

        if (error) {
          const { data: fallbackData } = await supabase
            .from('recipes')
            .select('*')
            .ilike('country', `%${name}%`);
          
          setRecipes(fallbackData || []);
        } else {
          setRecipes(data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchRecipes();
  }, [name]);

  return (
    <div className="container">
      <SEOHelper title={`${name} - Coo-X-For.Fun`} description={`Kumpulan resep terbaik dari ${name}`} />
      
      <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#d35400', fontWeight: 'bold', fontSize: '0.9rem' }}>
          ← Kembali
        </Link>
        <span style={{ color: '#eee' }}>|</span>
        <h1 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'capitalize', color: '#333' }}>
           {name}
        </h1>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: '#999', marginTop: '10px' }}>Memuat...</p>
        </div>
      ) : (
        <>
          {recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          ) : (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              background: '#fff', 
              borderRadius: '16px', 
              border: '1px solid #eee',
              marginTop: '20px' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🥗</div>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>
                Resep Tidak Ditemukan
              </h3>
              <p style={{ color: '#888', marginBottom: '25px', maxWidth: '300px', margin: '0 auto 25px' }}>
                Belum ada resep untuk negara {name}.
              </p>
              <Link to="/" style={{ 
                background: '#d35400', 
                color: 'white', 
                padding: '12px 30px', 
                borderRadius: '50px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(211, 84, 0, 0.3)'
              }}>
                Kembali Ke Beranda
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CountryPage;