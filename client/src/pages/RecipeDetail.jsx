import _R, { useState as _s, useMemo as _m, useEffect as _e, useRef as _r } from 'react';
import { useParams as _pP } from 'react-router-dom';
import { supabase as _sb } from '../supabaseClient';
import { Trash2 as _T2, Send as _Sd } from 'lucide-react';
import _SH from '../components/SEO/SEOHelper';
import _RH from '../components/Recipe/RecipeHeader';
import _IL from '../components/Recipe/IngredientsList';
import _SL from '../components/Recipe/StepsList';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { detectBestImageFormat as _dBIF } from '../utils/imageFormatSupport';
import { queueAction as _qA, flushQueue as _fQ } from '../utils/indexedDbQueue';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { transcodeImage as _tI } from '../utils/transcodeImage';
import { registerSW as _rSW } from '../registerSW';

let _gL = false;

const _SAC = _R.memo(() => {
  const _cR = _r(null);
  const [_rD, _sRD] = _s(false);
  const [_vS, _sVS] = _s(true);
  const _cfG = _m(() => ({ k: '00a1391f38d87ff5d574caa89f0d2959', h: 250, w: 300, s: 'https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js' }), []);
  _e(() => { if (_gL) return; _gL = true; _sRD(true); return () => { _gL = false; }; }, []);
  const _ctN = _m(() => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body,html{margin:0;padding:0;height:250px;overflow:hidden;background:transparent;display:flex;justify-content:center}#c{width:300px;height:250px;position:relative}</style></head><body><div id="c"><script type="text/javascript">var atOptions={'key':'${_cfG.k}','format':'iframe','height':${_cfG.h},'width':${_cfG.w},'params':{}};</script><script type="text/javascript" async src="${_cfG.s}"></script></div></body></html>`, [_cfG]);
  if (!_vS) return null;
  if (!_rD) return <div style={{ height: '250px' }} />;
  const _st = { cn: { position: 'relative', width: '100%', maxWidth: '350px', margin: '25px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px', backgroundImage: 'url("https://i.gifer.com/Vbat.gif")', backgroundRepeat: 'repeat', backgroundSize: '120px', border: '4px dashed #ff00ff', boxShadow: '10px 10px 0px #00ffff', borderRadius: '12px', padding: '15px', overflow: 'visible' }, cl: { position: 'absolute', top: '-10px', right: '-10px', width: '26px', height: '26px', borderRadius: '50%', background: '#000', color: '#fff', border: '2px solid #fff', cursor: 'pointer', zIndex: 100, fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', boxShadow: '3px 3px 0px #ff0000' }, lb: { position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 'bold', color: '#000', backgroundColor: '#fff700', padding: '2px 10px', fontFamily: 'monospace', border: '1px solid #000', zIndex: 5 }, if: { width: '300px', height: '250px', border: '3px solid #000', backgroundColor: '#fff', overflow: 'hidden', zIndex: 1 } };
  return (<div ref={_cR} className="sys-ad-node" style={_st.cn}><button onClick={() => _sVS(false)} style={_st.cl}> × </button><div style={_st.lb}>[ ADVERTISEMENT ]</div><iframe title="Ads" srcDoc={_ctN} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" scrolling="no" frameBorder="0" loading="lazy" style={_st.if} /></div>);
}, () => true);

const _oI = (u, w = 800) => {
  if (!u) return '';
  const _p = u.includes('?') ? '&' : '?';
  if (u.includes('supabase.co')) return `${u}${_p}width=${w}&format=webp&quality=80`;
  if (u.includes('pexels.com')) return `${u}${_p}auto=compress&cs=tinysrgb&w=${w}&dpr=1`;
  if (u.includes('unsplash.com')) return `${u}${_p}w=${w}&q=75&fm=webp`;
  return u;
};

const _RD = () => {
  const { slug: _sl } = _pP();
  const [_rcp, _sRcp] = _s(null);
  const [_ld, _sLd] = _s(true);
  const [_usr, _sUsr] = _s(null);
  const [_dI, _sDI] = _s('');
  const [_reac, _sReac] = _s({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [_myR, _sMyR] = _s(null);
  const [_cmm, _sCmm] = _s([]);
  const [_nC, _sNC] = _s('');
  const [_sub, _sSub] = _s(false);

  const _rIc = { like: { e: '👍', l: 'Suka', c: '#2078f4' }, love: { e: '❤️', l: 'Super', c: '#f33e58' }, haha: { e: '😆', l: 'Haha', c: '#f7b125' }, wow: { e: '😮', l: 'Wow', c: '#f7b125' }, sad: { e: '😢', l: 'Sedih', c: '#f7b125' }, angry: { e: '😡', l: 'Marah', c: '#e9710f' } };

  const _fR = async (id, uid) => {
    const { data: _d } = await _sb.from('recipe_reactions').select('reaction_type, user_id').eq('recipe_id', id);
    if (_d) {
      const _ct = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      let _mR = null;
      _d.forEach(_v => { if (_ct.hasOwnProperty(_v.reaction_type)) _ct[_v.reaction_type]++; if (uid && _v.user_id === uid) _mR = _v.reaction_type; });
      _sReac(_ct); _sMyR(_mR);
    }
  };

  const _hR = async (t) => {
    if (!_usr) return alert("Silakan Login di pojok kanan atas dulu ya! 😊");
    if (!navigator.onLine) await _qA({ type: 'REACTION', reactionType: t, recipeId: _rcp.id });
    const _pR = _myR; const _iR = _pR === t;
    _sMyR(_iR ? null : t);
    _sReac(_v => ({ ..._v, [t]: _iR ? Math.max(0, _v[t] - 1) : _v[t] + 1, ...(_pR && !_iR ? { [_pR]: Math.max(0, _v[_pR] - 1) } : {}) }));
    try { if (_iR) { await _sb.from('recipe_reactions').delete().eq('recipe_id', _rcp.id).eq('user_id', _usr.id); } else { await _sb.from('recipe_reactions').upsert({ recipe_id: _rcp.id, user_id: _usr.id, reaction_type: t }, { onConflict: 'recipe_id, user_id' }); } } catch (_e) { if (navigator.onLine) _fR(_rcp.id, _usr.id); }
  };

  const _fC = async (id) => { const { data: _d } = await _sb.from('recipe_comments').select('*').eq('recipe_id', id).order('created_at', { ascending: false }); if (_d) _sCmm(_d); };

  const _hPC = async (e) => {
    e.preventDefault(); if (!_usr || !_nC.trim()) return;
    const _p = { recipe_id: _rcp.id, user_id: _usr.id, content: _nC, user_name: _usr.user_metadata.full_name, avatar_url: _usr.user_metadata.avatar_url };
    if (!navigator.onLine) { await _qA({ type: 'COMMENT', payload: _p }); _sCmm([{ id: Date.now(), ..._p, created_at: new Date().toISOString() }, ..._cmm]); _sNC(''); return; }
    _sSub(true); try { const { error: _err } = await _sb.from('recipe_comments').insert(_p); if (_err) throw _err; _sNC(''); _fC(_rcp.id); } catch (_err) { alert(_err.message); } finally { _sSub(false); }
  };

  _e(() => {
    _rSW();
    if (navigator.onLine) _fQ(async (a) => {
      if (a.type === 'REACTION') await _hR(a.reactionType);
      if (a.type === 'COMMENT') await _sb.from('recipe_comments').insert(a.payload);
    });

    let _m = true;
    const _iP = async () => {
      _sLd(true);
      const { data: { session: _s } } = await _sb.auth.getSession();
      if (_m) { _sUsr(_s?.user ?? null); if (_s?.user) _sSH({ uid: _s.user.id, ts: Date.now() }); }

      let _rD = _gC(`recipe_${_sl}`);
      if (!_rD) {
        const { data: _d } = await _sb.from('recipes').select('*').eq('slug', _sl).single();
        _rD = _d;
        if (_rD) _sC(`recipe_${_sl}`, _rD);
      }

      if (_rD && _m) {
        _sRcp(_rD);
        const _oU = _oI(_rD.image_url, 800);

        const _isCookpad = _oU.includes('img-global.cpcdn.com');

        if (_isCookpad) {
          _sDI(_oU);
        } else {
          try {
            const _bF = await _dBIF();
            const _r = await fetch(_oU, { mode: 'cors' });
            if (!_r.ok) throw 0;
            const _b = await _r.blob();
            const _tB = await _tI(URL.createObjectURL(_b), _bF);
            _sDI(URL.createObjectURL(_tB));
          } catch {
            _sDI(_oU);
          }
        }
        await Promise.all([_fR(_rD.id, _s?.user?.id), _fC(_rD.id)]);
      }
      if (_m) _sLd(false);
    };

    _iP();
    window.scrollTo(0, 0);
    return () => { _m = false; };
  }, [_sl]);

  if (_ld) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'monospace' }}>🍲 Menyiapkan Bahan...</div>;
  if (!_rcp) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Resep Tidak Ditemukan</h2></div>;

  const _tR = Object.values(_reac).reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px', background: '#fff' }}>
      <_SH title={_rcp.title} description={_rcp.description} image={_rcp.image_url} slug={_rcp.slug} />
      <_RH author={`Oleh ${_rcp.author_name || 'Chef'}`} date={_rcp.created_at} country={_rcp.country || 'Inter'} />
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', marginTop: '20px', textAlign: 'center' }}>{_rcp.title}</h1>
      <div style={{ margin: '25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <img
          src={_dI || _oI(_rcp.image_url, 800)}
          alt={_rcp.title}
          style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
          loading="lazy"
          crossOrigin={_rcp.image_url?.includes('img-global.cpcdn.com') ? undefined : "anonymous"}
        />
      </div>
      <div style={{ borderTop: '2px solid #f0f2f5', borderBottom: '2px solid #f0f2f5', padding: '20px 0', margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <div style={{ display: 'flex' }}>
            {Object.entries(_reac).map(([k, v]) => v > 0 && (<span key={k} style={{ fontSize: '20px', marginLeft: '-6px', zIndex: 5 }}>{_rIc[k].e}</span>))}
          </div>
          <span style={{ fontSize: '0.95rem', color: '#65676b', fontWeight: '600' }}>{_tR > 0 ? `${_tR.toLocaleString()} reaksi` : 'Ayo bereaksi!'}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(_rIc).map(([k, v]) => (
            <button key={k} onClick={() => _hR(k)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: _myR === k ? `${v.c}20` : '#f0f2f5', borderRadius: '50px', border: _myR === k ? `1.5px solid ${v.c}` : '1.5px solid transparent' }}>
              <span style={{ fontSize: '20px' }}>{v.e}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: _myR === k ? v.c : '#65676b' }}>{v.l} {_reac[k] > 0 && `(${_reac[k]})`}</span>
            </button>
          ))}
        </div>
      </div>
      <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', marginBottom: '40px', fontStyle: 'italic', borderLeft: '5px solid #d35400', paddingLeft: '15px' }}>{_rcp.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {_rcp.ingredients && <_IL ingredients={_rcp.ingredients} />}
        <_SL steps={_rcp.steps} steps_data={_rcp.steps_data} />
      </div>
      <_SAC />
      <div style={{ marginTop: '50px', borderTop: '4px double #eee', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Diskusi ({_cmm.length})</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <img src={_usr?.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=Guest`} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="u" />
          <form onSubmit={_hPC} style={{ flex: 1 }}>
            <textarea value={_nC} onChange={(e) => _sNC(e.target.value)} placeholder={_usr ? "Tulis..." : "Login dulu..."} disabled={!_usr || _sub} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', height: '80px' }} />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button type="submit" disabled={_sub || !_nC.trim()} style={{ background: '#d35400', color: '#fff', padding: '8px 20px', borderRadius: '20px', border: 'none', fontWeight: 'bold' }}>{_sub ? '...' : 'Kirim'}</button>
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {_cmm.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
              <img src={c.avatar_url} alt="a" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <div style={{ flex: 1, background: '#f0f2f5', padding: '10px 15px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: '0.9rem' }}>{c.user_name}</strong></div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default _RD;