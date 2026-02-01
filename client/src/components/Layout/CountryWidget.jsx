import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const countries = [
  { id: 'indonesia', flag: '🇮🇩' }, { id: 'japan', flag: '🇯🇵' },
  { id: 'italy', flag: '🇮🇹' }, { id: 'korea', flag: '🇰🇷' },
  { id: 'thailand', flag: '🇹🇭' }, { id: 'usa', flag: '🇺🇸' },
  { id: 'china', flag: '🇨🇳' }, { id: 'india', flag: '🇮🇳' },
  { id: 'mexico', flag: '🇲🇽' }, { id: 'france', flag: '🇫🇷' },
  { id: 'turkey', flag: '🇹🇷' }, { id: 'vietnam', flag: '🇻🇳' },
  { id: 'uk', flag: '🇬🇧' }, { id: 'spain', flag: '🇪🇸' },
  { id: 'malaysia', flag: '🇲🇾' }, { id: 'germany', flag: '🇩🇪' },
  { id: 'brazil', flag: '🇧🇷' }, { id: 'philippines', flag: '🇵🇭' },
  { id: 'russia', flag: '🇷🇺' }, { id: 'greece', flag: '🇬🇷' }
];

const CountryWidget = () => {
  const { t } = useTranslation();

  return (
    <div className="country-section" style={{ margin: '20px 0' }}>
      <h3 className="country-title" style={{ fontWeight: '800', marginBottom: '15px' }}>
        {t('home.widget_title')}
      </h3>
      <div className="country-scroll" style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '12px', 
        paddingBottom: '10px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {countries.map((c) => {
          // Mengambil nama negara dari i18n
          const countryName = t(`countries.${c.id}`);

          return (
            <Link 
              key={c.id} 
              to={`/country/${countryName}`} 
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
                {countryName}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CountryWidget;