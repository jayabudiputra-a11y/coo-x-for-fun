import React, { useEffect as _e, useRef as _r } from 'react';

const PrivacyPolicy = () => {
  const _hR = _r(null);

  _e(() => {
    const _t = setTimeout(() => {
      if (_hR.current) {
        const _y = _hR.current.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: _y, behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(_t);
  }, []);

  return (
    <div style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 ref={_hR} style={{ borderBottom: '2px solid #d35400', paddingBottom: '10px' }}>Kebijakan Privasi Coo-X-For.Fun</h1>
      <p><em>Terakhir diperbarui: 6 Februari 2026</em></p>
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>1. Data yang Saya Akses</h2>
        <p>Melalui layanan Google OAuth, saya mengakses informasi profil terbatas Anda yaitu <strong>Alamat Email, Nama Lengkap, dan Foto Profil</strong>.</p>
      </section>
      <section style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>2. Penggunaan Data</h2>
        <p>Saya menggunakan data tersebut semata-mata untuk keperluan identitas di dalam aplikasi Coo-X-For.Fun.</p>
      </section>
      <section style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>3. Penyimpanan dan Keamanan Data</h2>
        <p>Saya menyimpan data interaksi Anda secara aman di database Supabase saya.</p>
      </section>
      <section style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>4. Kontak</h2>
        <p>Jika Anda memiliki pertanyaan tentang kebijakan ini, hubungi: <strong>bbudi6621@gmail.com</strong></p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;