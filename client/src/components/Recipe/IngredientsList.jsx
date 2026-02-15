import React, { useEffect as _e } from 'react';
import { setCache as _sC, getCache as _gC } from '../../utils/localCache';
import { setSessionHash as _sSH } from '../../utils/cookieHash';
import { queueAction as _qA } from '../../utils/indexedDbQueue';
import { cx as _cx } from '../../utils/randomClass';

const IngredientsList = ({ ingredients: i0 }) => {
  const l = typeof i0 === 'string' ? i0.split('\n') : (i0 || []);

  _e(() => {
    if (l.length > 0) {
      const _k = `ing_view_${l.length}`;
      if (!_gC(_k)) {
        _sC(_k, { ts: Date.now(), count: l.length });
        _sSH({ last_component: 'IngredientsList', items: l.length });
        _qA({ type: 'LOG_VIEW', component: 'IngredientsList', timestamp: Date.now() });
      }
    }
  }, [l]);

  const renderItem = (v) => {
    if (typeof v === 'object' && v !== null) {
      return (
        <span>
          <span style={{ color: '#f3a133', fontWeight: 'bold' }}>
            {v.quantity || ''}
          </span>
          {' '}
          {v.item}
        </span>
      );
    }
    return v;
  };

  return (
    <div 
      className={_cx('ing-container')}
      style={{ 
        background: '#000000',      
        color: '#ffffff',           
        padding: '20px', 
        borderRadius: '0px',         
        border: '4px solid #d35400',
        margin: '20px 0',
        fontFamily: '"Courier New", Courier, monospace',
        boxShadow: '4px 4px 0px #333'
      }}
    >
      <h3 style={{ 
        color: '#f3a133', 
        borderBottom: '2px dashed #ffffff', 
        paddingBottom: '10px', 
        marginTop: 0,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontSize: '1.2rem'
      }}>
        BAHAN-BAHAN
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
            Data bahan tidak tersedia.
          </li>
        )}
      </ul>
    </div>
  );
};

export default IngredientsList;