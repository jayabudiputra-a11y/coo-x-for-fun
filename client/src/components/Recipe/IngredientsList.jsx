import R from 'react';
import { useTranslation as T } from 'react-i18next';

const IngredientsList = ({ ingredients: i0 }) => {
  const { t: t0, i18n: i } = T();
  
  const l = typeof i0 === 'string' ? i0.split('\n') : (i0 || []);

  const renderItem = (v) => {
    if (typeof v === 'object' && v !== null) {
      const isEn = i.language === 'en';
      const itemName = isEn ? (v.item_en || v.item) : v.item;
      
      return (
        <span>
          <span style={{ color: '#f3a133', fontWeight: 'bold' }}>
            {v.quantity || ''}
          </span>
          {' '}
          {itemName}
        </span>
      );
    }
    return v;
  };

  return (
    <div style={{ 
      background: '#000000',      
      color: '#ffffff',           
      padding: '20px', 
      borderRadius: '0px',         
      border: '4px solid #d35400',
      margin: '20px 0',
      fontFamily: '"Courier New", Courier, monospace',
      boxShadow: '4px 4px 0px #333'
    }}>
      <h3 style={{ 
        color: '#f3a133', 
        borderBottom: '2px dashed #ffffff', 
        paddingBottom: '10px', 
        marginTop: 0,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontSize: '1.2rem'
      }}>
        {i.language === 'en' ? 'INGREDIENTS' : 'BAHAN-BAHAN'}
      </h3>
      
      <ul style={{ 
        paddingLeft: '20px', 
        margin: '15px 0 0', 
        lineHeight: '1.6',
        listStyleType: 'square' 
      }}>
        {Array.isArray(l) && l.length > 0 ? (
          l.map((v, k) => (
            <li key={v.id || k} style={{ marginBottom: '8px' }}>
              {renderItem(v)}
            </li>
          ))
        ) : (
          <li style={{ fontStyle: 'italic', color: '#888' }}>
            {i.language === 'en' ? 'Ingredients data unavailable.' : 'Data bahan tidak tersedia.'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default IngredientsList;