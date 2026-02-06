import React from 'react';

const PrivacyPolicy = () => (
  <div style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <h1 style={{ borderBottom: '2px solid #d35400', paddingBottom: '10px' }}>Kebijakan Privasi Coo-X-For.Fun</h1>
    <p><em>Terakhir diperbarui: 6 Februari 2026</em></p>

    <section style={{ marginTop: '30px' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>1. Data yang Saya Akses</h2>
      <p>
        Melalui layanan Google OAuth, saya mengakses informasi profil terbatas Anda yaitu <strong>Alamat Email, Nama Lengkap, dan Foto Profil</strong>. Saya hanya mengambil data yang Anda izinkan saat melakukan proses login.
      </p>
    </section>

    <section style={{ marginTop: '20px' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>2. Penggunaan Data</h2>
      <p>
        Saya menggunakan data tersebut semata-mata untuk keperluan identitas di dalam aplikasi Coo-X-For.Fun. Hal ini memungkinkan Anda untuk:
      </p>
      <ul>
        <li>Memberikan komentar pada resep.</li>
        <li>Memberikan reaksi (like, love, dll) pada konten masakan.</li>
        <li>Menampilkan identitas Anda di kolom diskusi agar interaksi antar pengguna lebih terpercaya.</li>
      </ul>
      <p>Saya menjamin bahwa saya tidak akan membagikan, menjual, atau menyewakan data pribadi Anda kepada pihak ketiga mana pun.</p>
    </section>

    <section style={{ marginTop: '20px' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>3. Penyimpanan dan Keamanan Data</h2>
      <p>
        Saya menyimpan data interaksi Anda (komentar dan reaksi) secara aman di database Supabase saya. Saya tidak menyimpan kata sandi (password) Google Anda. Jika Anda ingin saya menghapus data yang tersimpan, Anda dapat menghubungi saya kapan saja melalui email di bawah.
      </p>
    </section>

    <section style={{ marginTop: '20px' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#d35400' }}>4. Kontak</h2>
      <p>
        Jika Anda memiliki pertanyaan tentang kebijakan ini, Anda bisa menghubungi saya langsung di: <strong>bbudi6621@gmail.com</strong>
      </p>
    </section>
  </div>
);

export default PrivacyPolicy;