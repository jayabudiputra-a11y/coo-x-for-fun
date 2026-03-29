import React, { useEffect as _e, useRef as _uR, useState as _uS, useMemo as _uM } from 'react';
import { supabase as _sb } from '../supabaseClient';
import { useNavigate as _uN } from 'react-router-dom';
import _g from 'gsap';

const _FW = () => {
  const [_i, _sI] = _uS([]);
  const [_s, _sS] = _uS(false);
  const [_w, _sW] = _uS(null);
  const [_bgLoaded, _setBgLoaded] = _uS(false);
  const _wr = _uR(null);
  const _ir = _uR([]);
  const _nv = _uN();
  const _auRef = _uR(null);

  // GIF background di-load hanya setelah komponen mount (tidak blocking render awal)
  _e(() => {
    const img = new Image();
    img.onload = () => _setBgLoaded(true);
    img.src = 'https://i.gifer.com/33Hn.gif';
  }, []);

  // Audio dibuat lazy — hanya saat user klik Play, bukan saat mount
  const _getAudio = () => {
    if (!_auRef.current) {
      const a = new Audio('https://tough-maroon-oa8tgcstic.edgeone.app/Glenn%20Miller%20-%20In%20The%20Mood%20[HQ]%20-%20symir547.mp3');
      a.volume = 1.0;
      _auRef.current = a;
    }
    return _auRef.current;
  };

  _e(() => {
    const _f = async () => {
      const { data: _d } = await _sb
        .from('recipes')
        .select('id, title, slug')
        .not('slug', 'is', null)
        .neq('slug', '');

      if (_d && _d.length > 0) {
        let _shuffled = _d.sort(() => 0.5 - Math.random());
        let _selected = _shuffled.slice(0, 8);
        while (_selected.length < 8) {
          _selected = [..._selected, ..._selected].slice(0, 8);
        }
        _sI(_selected);
      }
    };
    _f();
  }, []);

  _e(() => {
    if (_i.length > 0) {
      const _r = 110, _t = _i.length, _st = 360 / _t;
      _i.forEach((_, x) => {
        const _a = (x * _st) * (Math.PI / 180);
        if (_ir.current[x]) {
          _g.set(_ir.current[x], { x: Math.cos(_a) * _r, y: Math.sin(_a) * _r });
        }
      });
    }
  }, [_i]);

  const _hS = () => {
    if (_s || _i.length === 0) return;
    _sS(true); _sW(null);

    const _au = _getAudio();
    _au.pause();
    _au.currentTime = 3;

    const _wi = Math.floor(Math.random() * _i.length);
    const _wItem = _i[_wi];
    const _step = 360 / _i.length;
    const _tr = 2160 + 270 - (_wi * _step);

    _g.to(_wr.current, {
      rotation: _tr,
      duration: 6,
      ease: "power4.inOut",
      onComplete: () => {
        _sS(false); _sW(_wItem);
        _au.play().catch(e => console.log("Audio Err", e));
      }
    });

    _ir.current.forEach((t) => {
      if (t) _g.to(t, { rotation: -_tr, duration: 6, ease: "power4.inOut" });
    });
  };

  const _go = () => {
    if (_auRef.current) _auRef.current.pause();
    if (_w && _w.slug) {
      _nv(`/resep/${_w.slug}`);
    }
  };

  return (
    <div style={{
      ..._st.c,
      backgroundImage: _bgLoaded ? 'url("https://i.gifer.com/33Hn.gif")' : 'none',
      backgroundColor: _bgLoaded ? undefined : '#fff8f0'
    }}>
      <h3 style={_st.h}>Putar Menu Hari Ini!</h3>

      <div style={_st.ww}>
        <div ref={_wr} style={_st.wh}>
          {_i.map((x, k) => (
            <div key={k} ref={e => _ir.current[k] = e} style={_st.bc}>
              <div style={_st.b}>
                <span style={_st.bt}>{x.title}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={_st.p}></div>
        <div style={_st.cp}></div>
      </div>

      <button onClick={_hS} disabled={_s} style={{ ..._st.sb, opacity: _s ? 0.6 : 1 }}>
        {_s ? "MENGUNDI..." : "PLAY NOW"}
      </button>

      {_w && (
        <div style={_st.mo}>
          <div style={_st.mc}>
            <h2 style={_st.mTitle}>CONGRATULATIONS!</h2>
            <p style={{ fontSize: '1rem', margin: '10px 0' }}>Menu masakan hari ini:</p>
            <div style={_st.wb}>{_w.title}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => { _sW(null); if (_auRef.current) _auRef.current.pause(); }} style={_st.cb}>Tutup</button>
              <button onClick={_go} style={_st.vb}>Lihat Resep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const _st = {
  c: {
    width: '100%', maxWidth: '500px', margin: '20px auto', padding: '20px 10px',
    backgroundRepeat: 'repeat', backgroundSize: '100px',
    border: '4px dashed #ff0000', borderRadius: '30px',
    textAlign: 'center', position: 'relative', boxSizing: 'border-box',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden'
  },
  h: {
    color: '#600', fontWeight: '900', textTransform: 'uppercase',
    marginBottom: '20px', fontSize: 'clamp(1.2rem, 5vw, 1.7rem)', textShadow: '2px 2px 0px #fff'
  },
  ww: {
    position: 'relative',
    width: 'min(280px, 80vw)',
    aspectRatio: '1 / 1',
    margin: '0 auto 20px',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  p: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -100%)',
    width: '14px', height: '80px',
    background: '#d35400', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
    zIndex: 50, transformOrigin: 'bottom center'
  },
  cp: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35px', height: '35px', background: '#600',
    borderRadius: '50%', zIndex: 60, border: '3px solid #fff'
  },
  wh: {
    width: '100%', height: '100%', position: 'relative', borderRadius: '50%',
    border: '6px solid #600', background: 'rgba(255,255,255,0.9)', zIndex: 10
  },
  bc: { position: 'absolute', top: '50%', left: '50%', width: '0', height: '0' },
  b: {
    position: 'absolute', width: '75px', padding: '6px 3px', background: '#fff',
    border: '2px solid #600', borderRadius: '6px', textAlign: 'center',
    transform: 'translate(-50%, -50%)', minHeight: '35px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  bt: { fontSize: '0.65rem', fontWeight: 'bold', color: '#333', lineHeight: '1' },
  sb: {
    padding: '12px 30px', fontSize: '1rem', fontWeight: 'bold',
    color: '#fff', backgroundColor: '#d35400', border: '2px solid #fff',
    borderRadius: '50px', cursor: 'pointer', transition: '0.3s'
  },
  mo: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.85)', zIndex: 10000,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px'
  },
  mc: {
    background: 'white', padding: '25px', borderRadius: '15px',
    textAlign: 'center', width: '100%', maxWidth: '320px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '4px solid #febf04'
  },
  mTitle: { color: '#d35400', margin: '0', fontSize: '1.4rem', fontWeight: '900' },
  wb: {
    background: '#fff4e6', color: '#d35400', padding: '12px',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem',
    margin: '15px 0', border: '2px dashed #d35400'
  },
  cb: { padding: '8px 16px', border: 'none', background: '#ccc', borderRadius: '6px', fontWeight: 'bold' },
  vb: { padding: '8px 16px', border: 'none', background: '#d35400', color: 'white', borderRadius: '6px', fontWeight: 'bold' }
};

export default _FW;