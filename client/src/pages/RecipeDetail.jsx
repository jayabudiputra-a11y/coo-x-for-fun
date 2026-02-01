import R, { useState as S } from 'react';
import { useParams as UP } from 'react-router-dom';
import { useRecipe as UR } from '../hooks/useRecipe';
import C0 from '../components/SEO/SEOHelper';
import C1 from '../components/Recipe/RecipeHeader';
import C2 from '../components/Recipe/IngredientsList';
import StepsList from '../components/Recipe/StepsList';

const AdSection = ({ k }) => {
  const [v, sV] = S(true);
  if (!v) return null;
  const adDoc = `<html><body style="margin:0;display:flex;justify-content:center;"><script>atOptions={'key':'00a1391f38d87ff5d574caa89f0d2959','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script></body></html>`;
  return (
    <div style={{ position: 'relative', width: '100%', margin: '20px 0', display: 'flex', justifyContent: 'center', minHeight: '250px' }}>
      <button 
        onClick={() => sV(false)} 
        style={{ position: 'absolute', top: '-10px', right: '10px', width: '30px', height: '30px', borderRadius: '50%', background: '#000', color: '#fff', border: '2px solid #fff', cursor: 'pointer', zIndex: 10, fontWeight: 'bold' }}
      > × </button>
      <iframe key={k} title="Ad" srcDoc={adDoc} style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }} />
    </div>
  );
};

const RecipeDetail = () => {
  const { slug: s0 } = UP();
  const { recipe: r0, loading: l0 } = UR(s0);

  if (l0) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AdSection k="loading" />
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#888' }}>
        Memuat...
      </div>
    </div>
  );
  
  if (!r0) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2 style={{ color: '#d35400' }}>Resep Tidak Ditemukan</h2>
      <p>Mungkin resep telah dihapus atau URL salah.</p>
    </div>
  );

  const title = r0.title;
  const description = r0.description;
  const country_localized = r0.country;
  const authorDisplay = `Oleh ${r0.author_name || 'Chef Anonymous'}`;

  return (
    <div className="container-detail" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 100px', background: '#fff' }}>
      <C0 title={title} description={description} image={r0.image_url} slug={r0.slug} />
      
      <C1 
        author={authorDisplay} 
        date={r0.created_at} 
        country={country_localized} 
      />

      <h1 className="detail-title" style={{ fontSize: '2.5rem', color: '#333', marginTop: '20px', fontWeight: '900', lineHeight: '1.2' }}>
        {title}
      </h1>

      <div style={{ margin: '25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <img src={r0.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
      </div>

      <AdSection k={s0} />

      <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.15rem', marginBottom: '40px', fontStyle: 'italic' }}>
        {description}
      </p>

      <div className="recipe-sections" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        
        <C2 ingredients={r0.ingredients} />

        <StepsList 
            steps={r0.steps} 
            steps_data={r0.steps_data} 
        />
        
      </div>
    </div>
  );
};

export default RecipeDetail;