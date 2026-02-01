import R, { useState as S } from 'react';
import { useParams as UP } from 'react-router-dom';
import { useTranslation as T } from 'react-i18next';
import { useRecipe as UR } from '../hooks/useRecipe';
import { getLocalized as G } from '../utils/langHelper';
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
  const { i18n: i, t: t0 } = T();

  if (l0) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AdSection k="loading" />
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#888' }}>
        {t0('common.loading')}
      </div>
    </div>
  );
  
  if (!r0) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2 style={{ color: '#d35400' }}>{t0('common.not_found')}</h2>
      <p>{i.language === 'en' ? 'Maybe the recipe was deleted or the URL is wrong.' : 'Mungkin resep telah dihapus atau URL salah.'}</p>
    </div>
  );

  const title = G(r0, 'title', i.language);
  const description = G(r0, 'description', i.language);
  const country_localized = G(r0, 'country', i.language);
  
  const steps_data_final = i.language === 'en' && r0.steps_data_en 
    ? r0.steps_data_en 
    : r0.steps_data;

  const authorDisplay = `${t0('common.by')} ${r0.author_name || 'Chef Anonymous'}`;

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
            steps_data={steps_data_final} 
        />
        
      </div>
    </div>
  );
};

export default RecipeDetail;