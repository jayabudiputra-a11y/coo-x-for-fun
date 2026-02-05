import React, { useEffect as _e, useState as _s, useRef as _uR } from 'react';
import { Link as _L } from 'react-router-dom';
import { Search as _Sh, LogIn as _Li, LogOut as _Lo, Music as _Ms, ChevronDown as _Cd, Play as _Pl, Pause as _Ps, SkipForward as _Sf, SkipBack as _SbIcon, Loader2 as _Ld } from 'lucide-react';
import { supabase as _q } from '../../supabaseClient';

const Navbar = () => {
  const [_u, _su] = _s(null);
  const [_mL, _smL] = _s([]); 
  const [_cL, _scL] = _s(0); 
  const [_iP, _siP] = _s(false); 
  const [_oM, _soM] = _s(false); 
  const [_fL, _sfL] = _s(true);
  
  // STATE: Lazy Load (Cookie Youtube tidak akan diload sebelum user klik Play)
  const [_playerReady, _setPlayerReady] = _s(false);

  const _aR = _uR(null); 
  const _mR = _uR(null);

  _e(() => {
    const _gs = async () => {
      const { data: { session: _sn } } = await _q.auth.getSession();
      _su(_sn?.user ?? null);
    };
    _gs();

    const { data: { subscription: _sb } } = _q.auth.onAuthStateChange((_ev, _sn) => {
      _su(_sn?.user ?? null);
    });

    const _fetchLagu = async () => {
      _sfL(true);
      const { data: _dL } = await _q.from('lagu').select('*').order('id', { ascending: true });
      if (_dL && _dL.length > 0) _smL(_dL);
      _sfL(false);
    };
    _fetchLagu();

    const _handleClickOutside = (event) => {
      if (_mR.current && !_mR.current.contains(event.target)) {
        _soM(false);
      }
    };

    document.addEventListener('mousedown', _handleClickOutside);
    return () => {
      _sb.unsubscribe();
      document.removeEventListener('mousedown', _handleClickOutside);
    };
  }, []);

  const _gYid = (url) => {
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(reg);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const _hQuickPlay = () => {
    if (_mL.length === 0) return;
    
    // 1. Aktifkan Iframe (Render ke DOM)
    if (!_playerReady) _setPlayerReady(true);
    
    _siP(true);
    _soM(false);

    // 2. Kirim perintah Play
    // Timeout sedikit lebih lama (500ms) untuk memastikan Iframe selesai loading di background
    setTimeout(() => {
        const msg = '{"event":"command","func":"playVideo","args":""}';
        _aR.current?.contentWindow?.postMessage(msg, '*');
    }, 500);
  };

  const _hP = (e) => {
    e.stopPropagation(); 
    
    // Jika player belum siap (user langsung klik play kecil tanpa buka menu)
    if (!_playerReady) {
        _setPlayerReady(true);
        _siP(true);
        // Timeout agar iframe sempat load
        setTimeout(() => {
             const msg = '{"event":"command","func":"playVideo","args":""}';
             _aR.current?.contentWindow?.postMessage(msg, '*');
        }, 500);
    } else {
        _siP(!_iP);
        const msg = _iP ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
        _aR.current?.contentWindow?.postMessage(msg, '*');
    }
  };

  const _hN = (e, dir) => {
    e.stopPropagation(); 
    
    if (!_playerReady) _setPlayerReady(true);

    let next = dir === 'next' ? _cL + 1 : _cL - 1;
    if (next >= _mL.length) next = 0;
    if (next < 0) next = _mL.length - 1;
    _scL(next);
    _siP(true);
    
    // Auto play saat ganti lagu
    setTimeout(() => {
        const msg = '{"event":"command","func":"playVideo","args":""}';
        _aR.current?.contentWindow?.postMessage(msg, '*');
    }, 300);
  };

  const _hLi = async () => {
    await _q.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const _hLo = async () => { await _q.auth.signOut(); };

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 9999, padding: '0 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <_L to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#d35400' }} aria-label="Beranda">
            <img src="/favicon.ico" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', fontFamily: 'cursive', lineHeight: '1' }}>coox for fun</span>
          </_L>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <_L to="/blog" style={{ textDecoration: 'none', color: '#555', fontWeight: '600', fontSize: '0.9rem' }}>Jurnal</_L>

            <div style={{ position: 'relative' }} ref={_mR}>
              <button 
                onClick={() => _soM(!_oM)}
                aria-label="Pemutar Lagu"
                style={{ background: 'none', border: 'none', color: _iP ? '#d35400' : '#555', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 0' }}
              >
                {_iP ? '🎵' : 'Lagu'} <_Cd size={14} style={{ transform: _oM ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
              </button>

              {_oM && (
                <div style={{ 
                    position: 'fixed', 
                    top: '70px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: '#fff', 
                    padding: '12px', 
                    borderRadius: '0px', 
                    boxShadow: '6px 6px 0px #00ffff', 
                    width: '220px', 
                    border: '3px dashed #ff00ff', 
                    zIndex: 10001 
                }}>
                   <div style={{ textAlign: 'center' }}>
                      {_fL ? (
                        <div style={{ padding: '10px' }}><_Ld className="animate-spin" size={20} style={{ margin: '0 auto' }} /></div>
                      ) : _mL.length > 0 ? (
                        <>
                          <div onClick={_hQuickPlay} style={{ cursor: 'pointer' }}>
                            <div style={{ 
                              width: '100px', 
                              height: '100px', 
                              margin: '0 auto 8px', 
                              border: '2px solid #000',
                              position: 'relative',
                              backgroundColor: '#eee'
                            }}>
                              <img 
                                src={_mL[_cL].thumbnail_url} 
                                alt="Cover" 
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              {!_iP && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                  <_Pl size={25} fill="currentColor" />
                                </div>
                              )}
                            </div>
                            <h4 style={{ margin: '0 0 3px', fontSize: '0.8rem', color: '#333', fontFamily: 'Courier New', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sambil Masak</h4>
                            <p className="blink" style={{ margin: '0 0 8px', fontSize: '0.65rem', color: '#ff00ff', fontWeight: 'bold' }}>[ TAP TO PLAY ]</p>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            <button onClick={(e) => _hN(e, 'prev')} style={_btnS} aria-label="Lagu Sebelumnya"><_SbIcon size={16} fill="currentColor"/></button>
                            <button onClick={(e) => _hP(e)} style={_btnP} aria-label={_iP ? "Jeda" : "Putar"}>
                              {_iP ? <_Ps size={18} fill="currentColor"/> : <_Pl size={18} fill="currentColor" style={{marginLeft: '2px'}}/>}
                            </button>
                            <button onClick={(e) => _hN(e, 'next')} style={_btnS} aria-label="Lagu Selanjutnya"><_Sf size={16} fill="currentColor"/></button>
                          </div>
                        </>
                      ) : (
                        <p style={{ fontSize: '0.7rem', color: '#999' }}>Kosong.</p>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SOLUSI FINAL: 
            1. Kembali ke 'youtube.com' agar API play/pause berfungsi.
            2. Gunakan teknik 'width:0; height:0' (Bukan display:none) agar browser tidak mematikan background audio.
            3. _playerReady memastikan ini TIDAK diload saat awal buka web (Lazy Load).
        */}
        {_mL.length > 0 && _playerReady && (
          <iframe
            ref={_aR}
            key={_cL}
            style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, border: 0, visibility: 'hidden' }}
            src={`https://www.youtube.com/embed/${_gYid(_mL[_cL].url)}?enablejsapi=1&autoplay=1&origin=${window.location.origin}`}
            allow="autoplay; encrypted-media"
            loading="lazy"
            title="Music Player"
          ></iframe>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <_L to="/search" style={{ color: '#555' }} aria-label="Cari Resep">
            <_Sh size={18} />
          </_L>
          
          <div style={{ borderLeft: '1px solid #eee', paddingLeft: '10px' }}>
            {_u ? (
              <img src={_u.user_metadata?.avatar_url} alt="Profil Saya" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d35400', cursor: 'pointer' }} onClick={_hLo} />
            ) : (
              <button onClick={_hLi} style={_btnLogin}>Login</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const _btnP = {
  width: '35px', height: '35px', borderRadius: '50%', border: '2px solid #000',
  background: '#ff00ff', color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '2px 2px 0px #00ffff'
};

const _btnS = { background: 'none', border: 'none', color: '#000', cursor: 'pointer', padding: '3px' };
const _btnLogin = { background: '#d35400', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' };

export default Navbar;