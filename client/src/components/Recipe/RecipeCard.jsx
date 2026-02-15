import React, { useState as _s, useEffect as _e } from 'react';
import { Link as _Lk } from 'react-router-dom';
import { getCache as _gC, setCache as _sC } from '../../utils/localCache';
import { detectBestImageFormat as _dB } from '../../utils/imageFormatSupport';
import { transcodeImage as _tI } from '../../utils/transcodeImage';
import { setSessionHash as _sSH } from '../../utils/cookieHash';
import { cx as _cx } from '../../utils/randomClass';

const RecipeCard = ({ recipe }) => {
  const [_iU, _sIU] = _s(recipe.image_url || 'https://placehold.co/400?text=No+Image');
  const _t = recipe.title;
  const _sl = recipe.slug;
  const _c = recipe.country;
  const _a = recipe.author_name || 'Admin';

  _e(() => {
    let _m = true;
    const _pI = async () => {
      const _ck = `rcp_img_${recipe.id}`;
      const _cached = _gC(_ck);
      
      // Validasi Cache: Jika cache berisi 'blob:', abaikan karena pasti sudah mati (ERR_FILE_NOT_FOUND)
      if (_cached && !_cached.startsWith('blob:')) {
        if (_m) _sIU(_cached);
        return;
      }

      const _isCookpad = recipe.image_url?.includes('img-global.cpcdn.com');
      if (_isCookpad) {
        if (_m) _sIU(recipe.image_url);
        return;
      }

      try {
        const _fmt = await _dB();
        const _res = await fetch(recipe.image_url, { mode: 'cors' }).catch(() => null);
        
        if (!_res || !_res.ok) throw new Error();
        
        const _blob = await _res.blob();
        const _tB = await _tI(URL.createObjectURL(_blob), _fmt);
        const _fU = URL.createObjectURL(_tB);
        
        if (_m) {
          _sIU(_fU);
          // JANGAN simpan _fU (blob) ke setCache karena blob akan mati saat refresh
          // Cukup biarkan di state memori saja
          _sSH({ lastView: recipe.id, ts: Date.now() });
        }
      } catch (_err) {
        if (_m) _sIU(recipe.image_url);
      }
    };

    if (recipe.id) _pI();
    return () => { _m = false; };
  }, [recipe.id, recipe.image_url]);

  const _st = {
    ca: { overflow: 'hidden', transition: 'transform 0.2s', borderRadius: '12px', background: '#fff' },
    im: { width: '100%', height: '180px', objectFit: 'cover' },
    in: { padding: '12px' },
    ti: { margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' },
    me: { fontSize: '0.85rem', color: '#666' }
  };

  return (
    <_Lk to={`/resep/${_sl}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={_cx('recipe-card')} style={_st.ca}>
        <img 
          src={_iU} 
          alt={_t} 
          className="recipe-img"
          loading="lazy" 
          crossOrigin={recipe.image_url?.includes('img-global.cpcdn.com') ? undefined : "anonymous"}
          style={_st.im}
          onError={(e) => { 
            e.target.crossOrigin = undefined;
            e.target.src = 'https://placehold.co/400?text=Error+Load'; 
          }}
        />
        <div className="recipe-info" style={_st.in}>
          <h3 className="recipe-title" style={_st.ti}>{_t}</h3>
          <div className="recipe-meta" style={_st.me}>
            {_c && <span>📍 {_c} • </span>}
            <span>{_a}</span>
          </div>
        </div>
      </div>
    </_Lk>
  );
};

export default React.memo(RecipeCard);