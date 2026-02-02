import React from 'react';
import { Link as L } from 'react-router-dom';

const _0xData = [
  { id: 'id', n: 'Indonesia', f: '🇮🇩' }, 
  { id: 'jp', n: 'Jepang', f: '🇯🇵' },
  { id: 'it', n: 'Italia', f: '🇮🇹' }, 
  { id: 'kr', n: 'Korea', f: '🇰🇷' },
  { id: 'th', n: 'Thailand', f: '🇹🇭' }, 
  { id: 'us', n: 'Amerika', f: '🇺🇸' },
  { id: 'cn', n: 'China', f: '🇨🇳' }, 
  { id: 'in', n: 'India', f: '🇮🇳' },
  { id: 'mx', n: 'Meksiko', f: '🇲🇽' }, 
  { id: 'fr', n: 'Prancis', f: '🇫🇷' },
  { id: 'tr', n: 'Turki', f: '🇹🇷' }, 
  { id: 'vn', n: 'Vietnam', f: '🇻🇳' },
  { id: 'uk', n: 'Inggris', f: '🇬🇧' }, 
  { id: 'es', n: 'Spanyol', f: '🇪🇸' },
  { id: 'my', n: 'Malaysia', f: '🇲🇾' }, 
  { id: 'de', n: 'Jerman', f: '🇩🇪' },
  { id: 'br', n: 'Brasil', f: '🇧🇷' }, 
  { id: 'ph', n: 'Filipina', f: '🇵🇭' },
  { id: 'ru', n: 'Rusia', f: '🇷🇺' }, 
  { id: 'gr', n: 'Yunani', f: '🇬🇷' }
];

const CountryWidget = () => {
  return (
    <div className="country-section" style={{ margin: '20px 0' }}>
      <h3 className="country-title" style={{ fontWeight: '800', marginBottom: '15px', color: '#333' }}>
        Jelajah Resep Negara
      </h3>
      <div className="country-scroll" style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '12px', 
        paddingBottom: '10px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {_0xData.map((_0x) => (
          <L 
            key={_0x.id} 
            to={`/country/${_0x.n}`} 
            className="country-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#444',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
              border: '1px solid #f0f0f0'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{_0x.f}</span>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {_0x.n}
            </span>
          </L>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CountryWidget);