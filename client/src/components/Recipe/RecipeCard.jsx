import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <Link to={`/resep/${recipe.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="recipe-card">
        <img 
          src={recipe.image_url || 'https://placehold.co/400?text=No+Image'} 
          alt={recipe.title} 
          className="recipe-img"
          loading="lazy" 
        />
        <div className="recipe-info">
          <h3 className="recipe-title">
            {recipe.title}
          </h3>
          
          <div className="recipe-meta">
            {recipe.country && <span>📍 {recipe.country} •</span>}
            <span>{recipe.author_name || 'Admin'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;