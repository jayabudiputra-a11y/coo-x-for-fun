import React, { useMemo } from 'react';
import { generateHash } from '../../utils/randomClass';

const RecipeHeader = ({ author, date, country }) => {
  const h1 = useMemo(() => generateHash(), []);
  const h2 = useMemo(() => generateHash(), []);
  
  return (
    <div className={`ContentHeaderAccreditation-${h1} bhgqZY`} style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#666', marginBottom: '15px', flexWrap: 'wrap', gap: '5px' }}>
      {country && (
        <span style={{ background: '#fff4e6', color: '#d35400', padding: '2px 8px', borderRadius: '4px', marginRight: '5px', fontWeight: 'bold', border: '1px solid #ffd8a8' }}>
          📍 {country}
        </span>
      )}
      
      <div className={`ContentHeaderByline-${h2} jgXynP`}>
         <span style={{marginRight: '10px'}}>
           {/* Kata "Oleh" dihapus dari sini karena sudah dikirim dari RecipeDetail via i18n */}
           <b style={{color:'#d35400'}}>{author || 'Chef Anonymous'}</b>
         </span>
      </div>
      
      <time className="ContentHeaderPublishDate" style={{ color: '#999' }}>
        {date ? new Date(date).toLocaleDateString() : ''}
      </time>
    </div>
  );
};

export default RecipeHeader;