import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Pastikan path ini benar
import SEOHelper from '../components/SEO/SEOHelper';
import RecipeHeader from '../components/Recipe/RecipeHeader';
import IngredientsList from '../components/Recipe/IngredientsList';
import StepsList from '../components/Recipe/StepsList';

// Komponen Iklan (Sama seperti sebelumnya)
const AdSection = React.memo(({ k }) => {
  const [visible, setVisible] = useState(true);
  
  const adContent = useMemo(() => `
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
            atOptions = { 'key' : '00a1391f38d87ff5d574caa89f0d2959', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
          </script>
          <script async src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script>
        </div>
      </body>
    </html>
  `, []);

  if (!visible) return null;

  return (
    <div className="sys-ad-wrap" style={{ 
      position: 'relative', width: '100%', margin: '25px 0', display: 'flex', 
      justifyContent: 'center', minHeight: '250px', backgroundColor: '#fafafa',
      borderRadius: '8px', overflow: 'hidden'
    }}>
      <button 
        onClick={() => setVisible(false)} 
        style={{ 
          position: 'absolute', top: '5px', right: '5px', width: '28px', height: '28px', 
          borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', 
          border: '2px solid #fff', cursor: 'pointer', zIndex: 10, fontSize: '14px',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      > × </button>
      <iframe 
        key={k} 
        title="Content Module" 
        srcDoc={adContent} 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        scrolling="no"
        frameBorder="0"
        loading="eager"
        style={{ width: '300px', height: '250px', border: 'none' }} 
      />
    </div>
  );
});

const RecipeDetail = () => {
  const { slug } = useParams(); // Mengambil slug dari URL
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mengambil Data Resep Berdasarkan Slug
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        // Query ke Supabase: Cari resep yang slug-nya cocok
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('slug', slug)
          .single(); // Ambil satu data saja

        if (error) {
            console.error('Error fetching recipe:', error);
            setRecipe(null);
        } else {
            setRecipe(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
        fetchRecipe();
        window.scrollTo(0, 0); // Scroll ke atas saat halaman dimuat
    }
  }, [slug]);

  // Tampilan Loading
  if (loading) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AdSection k="loading-ad" />
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#888' }}>
        🍲 Menyiapkan Bahan...
      </div>
    </div>
  );
  
  // Tampilan Jika Resep Tidak Ditemukan
  if (!recipe) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2 style={{ color: '#d35400' }}>Resep Tidak Ditemukan</h2>
      <p>Mungkin resep telah dihapus atau URL salah.</p>
    </div>
  );

  const title = recipe.title;
  const description = recipe.description;
  const country_localized = recipe.country || 'International';
  const authorDisplay = `Oleh ${recipe.author_name || 'Chef Anonymous'}`;

  return (
    <div className="container-detail" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '0 20px 100px', 
      background: '#fff',
      lineHeight: '1.6'
    }}>
      {/* SEO Helper untuk Meta Tags */}
      <SEOHelper title={title} description={description} image={recipe.image_url} slug={recipe.slug} />
      
      {/* Header Kecil (Penulis, Tanggal, Negara) */}
      <RecipeHeader 
        author={authorDisplay} 
        date={recipe.created_at} 
        country={country_localized} 
      />

      {/* Judul Utama */}
      <h1 className="detail-title" style={{ 
        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
        color: '#333', 
        marginTop: '20px', 
        fontWeight: '900', 
        lineHeight: '1.2' 
      }}>
        {title}
      </h1>

      {/* Gambar Utama */}
      <div style={{ margin: '25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <img src={recipe.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
      </div>

      {/* Iklan Tengah */}
      <AdSection k={`mid-${slug}`} />

      {/* Deskripsi */}
      <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.15rem', marginBottom: '40px', fontStyle: 'italic', borderLeft: '4px solid #eee', paddingLeft: '15px' }}>
        {description}
      </p>

      {/* Konten Utama Resep */}
      <div className="recipe-sections" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {/* Daftar Bahan (Jika ada komponen IngredientsList) */}
        {recipe.ingredients && <IngredientsList ingredients={recipe.ingredients} />}
        
        {/* Daftar Langkah Memasak */}
        {/* Mengirimkan 'steps' (teks biasa) atau 'steps_data' (JSON array) */}
        <StepsList 
          steps={recipe.steps} 
          steps_data={recipe.steps_data} 
        />
      </div>

      {/* Iklan Bawah */}
      <AdSection k={`bot-${slug}`} />
    </div>
  );
};

export default RecipeDetail;