import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Trash2, Send } from 'lucide-react';
import SEOHelper from '../components/SEO/SEOHelper';
import RecipeHeader from '../components/Recipe/RecipeHeader';
import IngredientsList from '../components/Recipe/IngredientsList';
import StepsList from '../components/Recipe/StepsList';

// --- HELPER: OPTIMASI GAMBAR (Penting untuk Performa) ---
const optimizeImage = (url, width = 800) => {
  if (!url) return '';
  // 1. Optimasi Supabase
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=80`;
  }
  // 2. Optimasi Pexels
  if (url.includes('pexels.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
  }
  // 3. Optimasi Unsplash
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75&fm=webp`;
  }
  return url;
};

// --- KOMPONEN IKLAN (Optimized & Aman) ---
const AdSection = React.memo(({ k }) => {
  const [visible, setVisible] = useState(true);
  
  // Placeholder aman agar tidak error 500 saat loading script iklan
  const adContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>body, html { margin: 0; padding: 0; background: #fafafa; display: flex; justify-content: center; align-items: center; height: 250px; color: #ccc; font-family: sans-serif; }</style>
      </head>
      <body>
        <div style="border: 2px dashed #ddd; padding: 10px 20px; border-radius: 8px;">
            <strong>Space Iklan</strong>
        </div>
      </body>
    </html>
  `, []);

  if (!visible) return null;

  return (
    <div style={{ 
      position: 'relative', width: '100%', margin: '25px 0', 
      display: 'flex', justifyContent: 'center', minHeight: '250px', 
      backgroundColor: '#fafafa', borderRadius: '8px',
      contentVisibility: 'auto', 
      containIntrinsicSize: '300px 250px' 
    }}>
      <button 
        onClick={() => setVisible(false)} 
        style={{ position: 'absolute', top: '5px', right: '5px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 10 }}
      >
        ×
      </button>
      <iframe 
        key={k} 
        srcDoc={adContent} 
        style={{ width: '300px', height: '250px', border: 'none' }} 
        loading="lazy"
        title="Ads"
      />
    </div>
  );
});

// --- KOMPONEN UTAMA ---
const RecipeDetail = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // States Reaksi
  const [reactions, setReactions] = useState({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [myReaction, setMyReaction] = useState(null);

  // States Komentar
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reactionIcons = {
    like: { emoji: '👍', label: 'Suka', color: '#2078f4' },
    love: { emoji: '❤️', label: 'Super', color: '#f33e58' },
    haha: { emoji: '😆', label: 'Haha', color: '#f7b125' },
    wow: { emoji: '😮', label: 'Wow', color: '#f7b125' },
    sad: { emoji: '😢', label: 'Sedih', color: '#f7b125' },
    angry: { emoji: '😡', label: 'Marah', color: '#e9710f' }
  };

  useEffect(() => {
    let mounted = true;
    const initPage = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setUser(session?.user ?? null);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });

      const { data: recipeData } = await supabase.from('recipes').select('*').eq('slug', slug).single();
      
      if (recipeData && mounted) {
        setRecipe(recipeData);
        await Promise.all([
          fetchReactions(recipeData.id, session?.user?.id),
          fetchComments(recipeData.id)
        ]);
      }
      if (mounted) setLoading(false);

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    initPage();
    window.scrollTo(0, 0);
  }, [slug]);

  // --- LOGIC REAKSI ---
  const fetchReactions = async (recipeId, userId) => {
    const { data } = await supabase.from('recipe_reactions').select('reaction_type, user_id').eq('recipe_id', recipeId);
    if (data) {
      const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      let currentMyReaction = null;
      data.forEach(r => {
        if (counts.hasOwnProperty(r.reaction_type)) counts[r.reaction_type]++;
        if (userId && r.user_id === userId) currentMyReaction = r.reaction_type;
      });
      setReactions(counts);
      setMyReaction(currentMyReaction);
    }
  };

  const handleReaction = async (type) => {
    if (!user) return alert("Silakan Login di pojok kanan atas dulu ya! 😊");
    const prevReaction = myReaction;
    const isRemoving = prevReaction === type;
    
    setMyReaction(isRemoving ? null : type);
    setReactions(prev => ({
        ...prev,
        [type]: isRemoving ? Math.max(0, prev[type] - 1) : prev[type] + 1,
        ...(prevReaction && !isRemoving ? { [prevReaction]: Math.max(0, prev[prevReaction] - 1) } : {})
    }));

    try {
      if (isRemoving) {
        await supabase.from('recipe_reactions').delete().eq('recipe_id', recipe.id).eq('user_id', user.id);
      } else {
        await supabase.from('recipe_reactions').upsert({
          recipe_id: recipe.id,
          user_id: user.id,
          reaction_type: type
        }, { onConflict: 'recipe_id, user_id' });
      }
    } catch (err) {
      fetchReactions(recipe.id, user.id);
    }
  };

  // --- LOGIC KOMENTAR ---
  const fetchComments = async (recipeId) => {
    const { data } = await supabase.from('recipe_comments').select('*').eq('recipe_id', recipeId).order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login dulu untuk berkomentar!");
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('recipe_comments').insert({
        recipe_id: recipe.id,
        user_id: user.id,
        content: newComment,
        user_name: user.user_metadata.full_name,
        avatar_url: user.user_metadata.avatar_url
      });
      if (error) throw error;
      setNewComment('');
      fetchComments(recipe.id);
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if(!window.confirm("Hapus komentar ini?")) return;
    try {
      await supabase.from('recipe_comments').delete().eq('id', commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) { alert("Gagal menghapus."); }
  };

  // --- RENDER ---
  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'monospace' }}>🍲 Menyiapkan Bahan...</div>;
  if (!recipe) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Resep Tidak Ditemukan</h2></div>;

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 100px', background: '#fff' }}>
      <SEOHelper title={recipe.title} description={recipe.description} image={recipe.image_url} />
      
      {/* HEADER TANPA LOGO */}
      <RecipeHeader author={`Oleh ${recipe.author_name || 'Chef'}`} date={recipe.created_at} country={recipe.country || 'Inter'} />
      
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', marginTop: '20px' }}>{recipe.title}</h1>

      <div style={{ margin: '25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        {/* IMAGE DENGAN OPTIMASI */}
        <img 
          src={optimizeImage(recipe.image_url, 800)} 
          alt={recipe.title} 
          style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }} 
          loading="lazy"
          decoding="async"
        />
      </div>

      <div style={{ borderTop: '2px solid #f0f2f5', borderBottom: '2px solid #f0f2f5', padding: '20px 0', margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <div style={{ display: 'flex' }}>
            {Object.entries(reactions).map(([type, count]) => count > 0 && (
              <span key={type} style={{ fontSize: '20px', marginLeft: '-6px', zIndex: 5, filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}>{reactionIcons[type].emoji}</span>
            ))}
          </div>
          <span style={{ fontSize: '0.95rem', color: '#65676b', fontWeight: '600' }}>
            {totalReactions > 0 ? `${totalReactions.toLocaleString()} orang bereaksi` : 'Jadilah yang pertama bereaksi!'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(reactionIcons).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                background: myReaction === key ? `${value.color}20` : '#f0f2f5',
                borderRadius: '50px', cursor: 'pointer', transition: '0.2s',
                border: myReaction === key ? `1.5px solid ${value.color}` : '1.5px solid transparent',
                transform: myReaction === key ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '20px' }}>{value.emoji}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: myReaction === key ? value.color : '#65676b' }}>
                {value.label} {reactions[key] > 0 && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({reactions[key]})</span>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', marginBottom: '40px', fontStyle: 'italic', borderLeft: '5px solid #d35400', paddingLeft: '15px' }}>
        {recipe.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {recipe.ingredients && <IngredientsList ingredients={recipe.ingredients} />}
        <StepsList steps={recipe.steps} steps_data={recipe.steps_data} />
      </div>

      <AdSection k="bot-recipe" />

      <div style={{ marginTop: '50px', borderTop: '4px double #eee', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Diskusi & Ulasan ({comments.length})</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          {user ? (
            <img src={user.user_metadata.avatar_url} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ddd' }} alt="Me" />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
          )}
          <form onSubmit={handlePostComment} style={{ flex: 1 }}>
            <textarea 
              value={newComment} onChange={(e) => setNewComment(e.target.value)} 
              placeholder={user ? "Tulis komentar..." : "Login untuk menulis komentar..."}
              disabled={!user || submitting}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'none', height: '80px', background: user ? '#fff' : '#f9f9f9' }}
            />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              {user ? (
                <button type="submit" disabled={submitting || !newComment.trim()} style={{ background: '#d35400', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', opacity: submitting ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {submitting ? 'Mengirim...' : <>Kirim <Send size={14} /></>}
                </button>
              ) : (
                <small style={{ color: '#d35400', fontWeight: 'bold' }}>* Login Google di atas untuk gabung diskusi</small>
              )}
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Belum ada komentar. Jadilah yang pertama!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                <img src={c.avatar_url || `https://ui-avatars.com/api/?name=${c.user_name}&background=random`} alt={c.user_name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div style={{ flex: 1, background: '#f0f2f5', padding: '10px 15px', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#050505' }}>{c.user_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#65676b' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#111', lineHeight: '1.4' }}>{c.content}</p>
                  {user && user.id === c.user_id && (
                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#d35400', fontSize: '0.75rem', cursor: 'pointer', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                      <Trash2 size={12} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;