import React, { useState as S, useRef as UR, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';
import { useNavigate as UN } from 'react-router-dom';
import SEO from '../components/SEO/SEOHelper';

const AddRecipe = () => {
  const n0 = UN();
  const [l, sL] = S(false);
  const [user, setUser] = S(null);
  const [f0, sF] = S({ t: '', d: '', i: '', s: '', c: 'Indonesia' });
  const [imgFile, sImgFile] = S(null);

  // Cek sesi login saat halaman dimuat
  E(() => {
    const checkUser = async () => {
      const { data: { session } } = await Q.auth.getSession();
      if (!session) {
        alert("Silakan Login terlebih dahulu untuk menambah resep!");
        n0('/');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [n0]);

  const gS = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);

  const x0 = async (e) => {
    e.preventDefault();
    
    if (!user) return alert("Sesi anda berakhir, silakan login ulang.");
    if (!imgFile) return alert("Harap upload foto masakan terlebih dahulu!");

    sL(true);

    try {
      // 1. Upload Gambar
      const fileExt = imgFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await Q.storage
        .from('recipe-images')
        .upload(filePath, imgFile);

      if (uploadError) throw new Error("Gagal upload gambar: " + uploadError.message);

      const { data: urlData } = Q.storage.from('recipe-images').getPublicUrl(filePath);
      const finalImageUrl = urlData.publicUrl;

      const cleanTitle = f0.t.trim();
      
      // OTOMATIS: Ambil nama dan ID dari metadata Google Login
      const authorName = user.user_metadata.full_name || 'Chef Anonymous';
      const authorId = user.id;

      // 2. Insert ke Tabel Recipes
      const { data: rD, error: rE } = await Q.from('recipes').insert([{
        title: cleanTitle,
        slug: gS(cleanTitle),
        description: f0.d,
        ingredients: f0.i.split('\n').filter(x => x.trim() !== ""),
        country: f0.c,
        image_url: finalImageUrl,
        author_name: authorName, // Nama otomatis dari Google
        user_id: authorId       // ID unik user untuk relasi
      }]).select().single();

      if (rE) throw rE;

      // 3. Insert ke Tabel Steps
      const sA = f0.s.split('\n')
        .map(line => line.replace(/^[\d\s.)\]-]+/g, '').trim())
        .filter(line => line !== "")
        .map((st, idx) => ({
          recipe_title: cleanTitle,
          step_number: idx + 1,
          langkah_langkah_nya: st,
          author: authorName,
          image_url: null
        }));

      if (sA.length > 0) {
        const { error: sE } = await Q.from('steps').insert(sA);
        if (sE) throw sE;
      }

      alert("Resep Berhasil Terbit!");
      n0(`/resep/${rD.slug}`);

    } catch (err) {
      console.error(err);
      alert("Gagal: " + err.message);
    } finally {
      sL(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '40px 20px', margin: '0 auto' }}>
      <SEO title="Bagikan Resep" description="Kirim resep masakan Anda secara otomatis" />
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#d35400', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px' }}>Bagikan Resep</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Posting sebagai: <strong>{user.user_metadata.full_name}</strong>
        </p>
      </div>
      
      <form onSubmit={x0} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
            style={iS} 
            placeholder="Nama Masakan" 
            onChange={e => sF({...f0, t: e.target.value})} 
            required 
        />
        
        <textarea 
            style={tS} 
            placeholder="Deskripsi Singkat" 
            onChange={e => sF({...f0, d: e.target.value})} 
        />
        
        <textarea 
            style={tS} 
            placeholder="Bahan-bahan (Tulis daftar ke bawah, Enter untuk baris baru)" 
            onChange={e => sF({...f0, i: e.target.value})} 
            required 
        />
        
        <textarea 
            style={tS} 
            placeholder="Langkah-langkah (Tulis daftar ke bawah, Enter untuk baris baru)" 
            onChange={e => sF({...f0, s: e.target.value})} 
            required 
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Foto Masakan:</label>
          <input 
              type="file"
              accept="image/*"
              style={{ ...iS, padding: '10px' }} 
              onChange={e => sImgFile(e.target.files[0])} 
              required 
          />
        </div>

        <button type="submit" disabled={l} style={!l ? bS : bSDisabled}>
          {l ? 'SEDANG MENGUPLOAD...' : 'TERBITKAN RESEP'}
        </button>
      </form>
    </div>
  );
};

const iS = { padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' };
const tS = { ...iS, minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' };
const bS = { padding: '18px', background: '#d35400', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', width: '100%', marginTop: '10px' };
const bSDisabled = { ...bS, background: '#ccc', cursor: 'not-allowed' };

export default AddRecipe;