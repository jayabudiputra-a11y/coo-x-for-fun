import React from 'react';
import { Link as _Lk } from 'react-router-dom';
import { cx as _cx } from '../../utils/randomClass';

const RecipeCard = ({ recipe }) => {
  const _src = recipe.image_url || 'https://placehold.co/400x180?text=No+Image';

  const _st = {
    ca: { overflow: 'hidden', transition: 'transform 0.2s', borderRadius: '12px', background: '#fff' },
    im: { width: '100%', height: '180px', objectFit: 'cover' },
    in: { padding: '12px' },
    ti: { margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' },
    me: { fontSize: '0.85rem', color: '#666' }
  };

  return (
    <_Lk to={`/resep/${recipe.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={_cx('recipe-card')} style={_st.ca}>
        <img
          src={_src}
          alt={recipe.title}
          className="recipe-img"
          data-cmp-noscan="1"
          loading="lazy"
          decoding="async"
          width="400"
          height="180"
          style={_st.im}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x180?text=Error+Load';
          }}
        />
        <div className="recipe-info" style={_st.in}>
          <h3 className="recipe-title" style={_st.ti}>{recipe.title}</h3>
          <div className="recipe-meta" style={_st.me}>
            {recipe.country && <span>📍 {recipe.country} • </span>}
            <span>{recipe.author_name || 'Admin'}</span>
          </div>
        </div>
      </div>
    </_Lk>
  );
};

export default React.memo(RecipeCard);