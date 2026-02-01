import React from 'react';
import { Link } from 'react-router-dom';

const countries = [
  { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩' }, 
  { id: 'japan', name: 'Jepang', flag: '🇯🇵' },
  { id: 'italy', name: 'Italia', flag: '🇮🇹' }, 
  { id: 'korea', name: 'Korea', flag: '🇰🇷' },
  { id: 'thailand', name: 'Thailand', flag: '🇹🇭' }, 
  { id: 'usa', name: 'Amerika', flag: '🇺🇸' },
  { id: 'china', name: 'China', flag: '🇨🇳' }, 
  { id: 'india', name: 'India', flag: '🇮🇳' },
  { id: 'mexico', name: 'Meksiko', flag: '🇲🇽' }, 
  { id: 'france', name: 'Prancis', flag: '🇫🇷' },
  { id: 'turkey', name: 'Turki', flag: '🇹🇷' }, 
  { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳' },
  { id: 'uk', name: 'Inggris', flag: '🇬🇧' }, 
  { id: 'spain', name: 'Spanyol', flag: '🇪🇸' },
  { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾' }, 
  { id: 'germany', name: 'Jerman', flag: '🇩🇪' },
  { id: 'brazil', name: 'Brasil', flag: '🇧🇷' }, 
  { id: 'philippines', name: 'Filipina', flag: '🇵🇭' },
  { id: 'russia', name: 'Rusia', flag: '🇷🇺' }, 
  { id: 'greece', name: 'Yunani', flag: '🇬🇷' }
];

const CountryWidget = () => {
  return (
    <div className="country-section" style={{ margin: '20px 0' }}>
      <h3 className="country-title" style={{ fontWeight: '800', marginBottom: '15px' }}>
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
        {countries.map((c) => (
          <Link 
            key={c.id} 
            to={`/country/${c.name}`} 
            className="country-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
              border: '1px solid #eee'
            }}
          >
            <span className="country-flag" style={{ fontSize: '1.2rem' }}>{c.flag}</span>
            <span className="country-name" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CountryWidget;