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
    <div className="country-section">
      <h3 className="country-title">{t('home.widget_title')}</h3>
      <div className="country-scroll">
        {countries.map((c) => {
          const countryName = t(`countries.${c.id}`);
          return (
            <Link key={c.id} to={`/country/${countryName}`} className="country-card">
              <span className="country-flag">{c.flag}</span>
              <span className="country-name">{countryName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CountryWidget;