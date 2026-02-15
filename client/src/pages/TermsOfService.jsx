import React, { useEffect as _e, useRef as _r } from 'react';

const TermsOfService = () => {
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
      <h1 ref={_hR} style={{ color: '#d35400' }}>Ketentuan Layanan (Terms of Service)</h1>
      <p>Terakhir Diperbarui: 5 Februari 2026</p>
      <p>Selamat datang di <strong>Coo-X-For.Fun</strong>. Dengan mengakses atau menggunakan situs kami, Anda menyetujui untuk terikat oleh ketentuan berikut:</p>
      <h2 style={{ fontSize: '1.2rem' }}>1. Penggunaan Layanan</h2>
      <p>Layanan saya disediakan untuk memberikan inspirasi resep masakan. Anda setuju untuk menggunakan situs ini hanya untuk tujuan yang sah dan tidak melanggar hak orang lain.</p>
      <h2 style={{ fontSize: '1.2rem' }}>2. Akun Pengguna & Login Google</h2>
      <p>Saya menggunakan layanan Google OAuth untuk memudahkan Anda masuk (login). Dengan masuk menggunakan akun Google, Anda bertanggung jawab untuk menjaga keamanan identitas akses Anda.</p>
      <h2 style={{ fontSize: '1.2rem' }}>3. Konten Pengguna</h2>
      <p>Saat Anda menulis komentar atau memberikan reaksi pada resep, Anda dilarang mengirimkan konten yang bersifat SARA, kasar, atau melanggar hukum.</p>
      <h2 style={{ fontSize: '1.2rem' }}>4. Hak Kekayaan Intelektual</h2>
      <p>Seluruh konten berupa teks, desain, dan struktur di situs ini adalah milik Coo-X-For.Fun.</p>
      <h2 style={{ fontSize: '1.2rem' }}>5. Batasan Tanggung Jawab</h2>
      <p>Coo-X-For.Fun tidak bertanggung jawab atas hasil masakan Anda. Resep disediakan "apa adanya".</p>
      <h2 style={{ fontSize: '1.2rem' }}>6. Perubahan Ketentuan</h2>
      <p>Saya dapat mengubah ketentuan ini sewaktu-waktu.</p>
      <footer style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>Kontak: <strong>bbudi6621@gmail.com</strong></p>
      </footer>
    </div>
  );
};

export default TermsOfService;