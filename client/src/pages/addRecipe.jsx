import React, { useState as S, useRef as UR, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';
import { useNavigate as UN } from 'react-router-dom';
import SEO from '../components/SEO/SEOHelper';

// ─── IndexNow Configuration ───────────────────────────────────────────────────
const _IN_KEY      = import.meta.env.VITE_INDEXNOW_KEY          || '';
const _IN_HOST     = import.meta.env.VITE_SITE_HOST             || 'www.coo-x-for.fun';
const _IN_KEY_LOC  = import.meta.env.VITE_INDEXNOW_KEY_LOCATION || `https://${_IN_HOST}/${_IN_KEY}.txt`;
const _IN_ENDPOINT = 'https://api.indexnow.org/IndexNow';

/**
 * _submitNewRecipeIndexNow
 * Submit URL resep yang baru saja dipublish ke Bing IndexNow API.
 * Ini adalah momen paling kritis — URL baru = harus segera di-index.
 * - Skip di localhost / dev.
 * - Dedup via sessionStorage (prefix indexnow_add_ agar tidak konflik
 *   dengan useRecipe "indexnow_submitted_" atau App.jsx "indexnow_app_").
 *
 * @param {string} slug  - slug resep yang baru dibuat
 */
const _submitNewRecipeIndexNow = async (slug) => {
  try {
    const _hn = window.location.hostname;
    if (_hn === 'localhost' || _hn === '127.0.0.1') return;

    if (!_IN_KEY) {
      console.warn('[IndexNow] VITE_INDEXNOW_KEY tidak di-set. Submission dilewati.');
      return;
    }

    // Prefix berbeda agar tidak bentrok dengan dedup di file lain
    const _dedup = `indexnow_add_${slug}`;
    if (sessionStorage.getItem(_dedup)) return;

    const _targetUrl = `https://${_IN_HOST}/resep/${slug}`;

    const _res = await fetch(_IN_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body:    JSON.stringify({
        host:        _IN_HOST,
        key:         _IN_KEY,
        keyLocation: _IN_KEY_LOC,
        urlList:     [_targetUrl],
      }),
    });

    if (_res.ok) {
      sessionStorage.setItem(_dedup, '1');
      console.info(`[IndexNow] New recipe submitted: ${_targetUrl} → HTTP ${_res.status}`);
    } else {
      const _map = {
        400: 'Bad Request — format tidak valid.',
        403: 'Forbidden — key tidak valid atau tidak ditemukan.',
        422: 'Unprocessable Entity — URL tidak sesuai host atau key.',
        429: 'Too Many Requests — terlalu banyak submission.',
      };
      console.warn(
        `[IndexNow] Gagal submit new recipe ${_targetUrl}: HTTP ${_res.status} — ` +
        (_map[_res.status] || 'Error tidak diketahui.')
      );
    }
  } catch (_err) {
    // Jangan crash flow utama jika IndexNow gagal
    console.error('[IndexNow] Exception saat submit new recipe:', _err);
  }
};

// ─── Component Utama (source asli dipertahankan penuh) ────────────────────────
const AddRecipe = () => {
  const n0 = UN();
  const [l, sL] = S(false);
  const [user, setUser] = S(null);
  const [f0, sF] = S({ t: '', d: '', i: '', s: '', c: 'Indonesia' });
  const [imgFile, sImgFile] = S(null);

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
      const authorName = user.user_metadata.full_name || 'Chef Anonymous';
      const authorId = user.id;

      // Siapkan steps_data sekaligus untuk disimpan di kolom recipes
      const sA = f0.s.split('\n')
        .map(line => line.replace(/^[\d\s.)\]-]+/g, '').trim())
        .filter(line => line !== "")
        .map((st, idx) => ({
          step_number: idx + 1,
          langkah_langkah_nya: st,
          image_url: null
        }));

      const { data: rD, error: rE } = await Q.from('recipes').insert([{
        title: cleanTitle,
        slug: gS(cleanTitle),
        description: f0.d,
        ingredients: f0.i.split('\n').filter(x => x.trim() !== ""),
        steps_data: sA.length > 0 ? sA : null,
        country: f0.c,
        image_url: finalImageUrl,
        author_name: authorName,
        user_id: authorId
      }]).select().single();

      if (rE) throw rE;

      // Tetap simpan ke tabel steps untuk kompatibilitas
      if (sA.length > 0) {
        const stepsForTable = sA.map(s => ({
          recipe_title: cleanTitle,
          step_number: s.step_number,
          langkah_langkah_nya: s.langkah_langkah_nya,
          author: authorName,
          image_url: null
        }));
        const { error: sE } = await Q.from('steps').insert(stepsForTable);
        if (sE) console.warn("steps table insert warn:", sE.message);
      }

      // ── IndexNow: submit URL resep baru ke Bing sebelum navigasi ──
      // Ini fire-and-forget — tidak await agar UX tidak tertahan.
      // Resep baru adalah URL fresh yang paling butuh segera di-index.
      _submitNewRecipeIndexNow(rD.slug);

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