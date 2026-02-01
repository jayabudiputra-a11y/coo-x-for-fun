import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Pastikan baris ini sesuai dengan lokasi file Anda
import { getLocalized } from '../../utils/langHelper';

const RecipeCard = ({ recipe }) => {
  const { i18n } = useTranslation();

  const title = getLocalized(recipe, 'title', i18n.language);
  const country = getLocalized(recipe, 'country', i18n.language);

  return (
    <Link to={`/resep/${recipe.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="recipe-card">
        <img 
          src={recipe.image_url || 'https://placehold.co/400?text=No+Image'} 
          alt={title} 
          className="recipe-img"
          loading="lazy" 
        />
        <div className="recipe-info">
          <h3 className="recipe-title">
            {title}
          </h3>
          
          <div className="recipe-meta">
            {country && <span>📍 {country} •</span>}
            <span>{recipe.author_name || 'Admin'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;