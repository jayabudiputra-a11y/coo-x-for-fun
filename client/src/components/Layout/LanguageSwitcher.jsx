import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, display: 'flex', gap: '5px' }}>
      <button 
        onClick={() => changeLanguage('id')} 
        style={{ cursor: 'pointer', padding: '5px 10px', border: '1px solid #eee', borderRadius: '4px', background: i18n.language === 'id' ? '#d35400' : '#fff', color: i18n.language === 'id' ? '#fff' : '#333' }}>
        🇮🇩 ID
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        style={{ cursor: 'pointer', padding: '5px 10px', border: '1px solid #eee', borderRadius: '4px', background: i18n.language === 'en' ? '#d35400' : '#fff', color: i18n.language === 'en' ? '#fff' : '#333' }}>
        🇺🇸 EN
      </button>
    </div>
  );
};
export default LanguageSwitcher;