import React, { useMemo, useEffect as _e } from 'react';
import { generateHash, cx as _cx } from '../../utils/randomClass';
import { setCache as _sC, getCache as _gC } from '../../utils/localCache';
import { setSessionHash as _sSH } from '../../utils/cookieHash';
import { queueAction as _qA } from '../../utils/indexedDbQueue';

const RecipeHeader = ({ author, date, country }) => {
  const _0x1 = useMemo(() => generateHash(), []);
  const _0x2 = useMemo(() => generateHash(), []);
  const _0x3 = author || 'Chef Anonymous';
  const _0x4 = date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  _e(() => {
    if (author) {
      const _k = `hdr_view_${_0x1}`;
      if (!_gC(_k)) {
        _sC(_k, { ts: Date.now(), a: _0x3 });
        _sSH({ last_auth: _0x3, country: country || 'N/A' });
        _qA({ type: 'HEADER_LOAD', author: _0x3, timestamp: Date.now() });
      }
    }
  }, [author, country, _0x1]);

  return (
    <div className={`${_cx('ContentHeaderAccreditation')}-${_0x1} bhgqZY`} style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#666', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
      {country && (
        <span style={{ background: '#fff4e6', color: '#d35400', padding: '3px 10px', borderRadius: '6px', fontWeight: '700', border: '1px solid #ffd8a8', fontSize: '0.75rem', letterSpacing: '0.3px' }}>
          📍 {country.toUpperCase()}
        </span>
      )}
      
      <div className={`${_cx('ContentHeaderByline')}-${_0x2} jgXynP`} style={{ display: 'flex', alignItems: 'center' }}>
         <span style={{ marginRight: '5px' }}>
           <b style={{ color: '#d35400', fontWeight: '800' }}>{_0x3}</b>
         </span>
      </div>
      
      <span style={{ color: '#ccc' }}>•</span>
      
      <time className="ContentHeaderPublishDate" style={{ color: '#999', fontSize: '0.8rem' }}>
        {_0x4}
      </time>
    </div>
  );
};

export default React.memo(RecipeHeader);