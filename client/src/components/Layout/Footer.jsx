import R from 'react';
import { Link as _L } from 'react-router-dom';

const Z = () => (
  <footer
    style={{
      marginTop: '50px',
      padding: '40px 20px',
      textAlign: 'center',
      fontSize: '12px',
      letterSpacing: '.5px',
      color: '#e0e0e0',

      backgroundImage:
        'linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.75)),url(https://images.unsplash.com/photo-1519681393784-d120267933ba)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',

      borderTop: '1px solid rgba(255,255,255,.15)',
      textShadow: '0 1px 3px rgba(0,0,0,.8)',
      boxShadow: 'inset 0 8px 20px rgba(0,0,0,.6)',

      fontFamily: 'Tahoma,Verdana,Arial,sans-serif'
    }}
  >
    <div style={{ marginBottom: '15px' }}>
      © 2026 CooX For Fun — Resep Masakan Harian
    </div>

    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', opacity: 0.8 }}>
      <_L to="/privacy" style={{ color: '#00ffff', textDecoration: 'underline', fontWeight: 'bold' }}>
        Privacy Policy
      </_L>
      <span style={{ color: '#fff' }}>|</span>
      <_L to="/terms" style={{ color: '#00ffff', textDecoration: 'underline', fontWeight: 'bold' }}>
        Terms of Service
      </_L>
    </div>

    <div style={{ marginTop: '15px', fontSize: '10px', color: '#aaa' }}>
      Medan, North Sumatra, Indonesia
    </div>
  </footer>
);

export default Z;