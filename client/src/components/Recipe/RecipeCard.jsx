import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const _0x1 = recipe.image_url || 'https://placehold.co/400?text=No+Image';
  const _0x2 = recipe.title;
  const _0x3 = recipe.slug;
  const _0x4 = recipe.country;
  const _0x5 = recipe.author_name || 'Admin';

  return (
    <Link to={`/resep/${_0x3}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="recipe-card" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}>
        <img 
          src={_0x1} 
          alt={_0x2} 
          className="recipe-img"
          loading="lazy" 
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
        <div className="recipe-info" style={{ padding: '12px' }}>
          <h3 className="recipe-title" style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {_0x2}
          </h3>
          
          <div className="recipe-meta" style={{ fontSize: '0.85rem', color: '#666' }}>
            {_0x4 && <span>📍 {_0x4} • </span>}
            <span>{_0x5}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(RecipeCard);