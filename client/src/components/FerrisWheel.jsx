import React, { useEffect as _e, useRef as _uR, useState as _uS, useMemo as _uM } from 'react';
import { supabase as _sb } from '../supabaseClient';
import { useNavigate as _uN } from 'react-router-dom';
import _g from 'gsap';

const _FW = () => {
  const [_i, _sI] = _uS([]);
  const [_s, _sS] = _uS(false);
  const [_w, _sW] = _uS(null);
  const _wr = _uR(null);
  const _ir = _uR([]);
  const _nv = _uN();

  // Audio: Start 3s, Vol 1.0
  const _au = _uM(() => {
    const a = new Audio('https://tough-maroon-oa8tgcstic.edgeone.app/Glenn%20Miller%20-%20In%20The%20Mood%20[HQ]%20-%20symir547.mp3');
    a.volume = 1.0;
    return a;
  }, []);

  // 1. FETCH DATA
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

  // 2. POSISI ITEM (Awal)
  _e(() => {
    if (_i.length > 0) {
      const _r = 130, _t = _i.length, _st = 360 / _t;
      _i.forEach((_, x) => {
        const _a = (x * _st) * (Math.PI / 180);
        if (_ir.current[x]) {
            _g.set(_ir.current[x], { x: Math.cos(_a) * _r, y: Math.sin(_a) * _r });
        }
      });
    }
  }, [_i]);

  // 3. LOGIKA PUTARAN (HASIL AKHIR DI JAM 12 / ATAS)
  const _hS = () => {
    if (_s || _i.length === 0) return;
    _sS(true); _sW(null);
    
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
      if(t) _g.to(t, { rotation: -_tr, duration: 6, ease: "power4.inOut" });
    });
  };

  const _go = () => {
    _au.pause();
    if (_w && _w.slug) {
        _nv(`/resep/${_w.slug}`);
    } else {
        alert("Error slug");
    }
  };

  return (
    <div style={_st.c}>
      <h3 style={_st.h}>Putar Menu Hari Ini!</h3>
      
      <div style={_st.ww}>
        
        {/* LINGKARAN RODA (BERPUTAR) */}
        <div ref={_wr} style={_st.wh}>
           {_i.map((x, k) => (
             <div key={k} ref={e => _ir.current[k] = e} style={_st.bc}>
                {/* GARIS RUJI DIHAPUS SESUAI PERMINTAAN */}
                <div style={_st.b}>
                  <span style={_st.bt}>
                    {x.title}
                  </span>
                </div>
             </div>
           ))}
        </div>

        {/* JARUM JAM (DIAM DI TENGAH, MENUNJUK KE ATAS) */}
        <div style={_st.p}></div> 

        {/* TUTUP TENGAH (DIAM, MENUTUPI PANGKAL JARUM) */}
        <div style={_st.cp}></div>

      </div>

      <button onClick={_hS} disabled={_s} style={{..._st.sb, opacity: _s ? 0.6 : 1, transform: _s ? 'scale(0.95)' : 'scale(1)'}}>
        {_s ? "Sedang Mengundi..." : "PLAY NOW"}
      </button>

      {_w && (
        <div style={_st.mo}>
          <div style={_st.mc}>
            <h2 style={{color: '#d35400', margin: '0 0 1px'}}>CONGRATULATIONS!</h2>
            <p style={{fontSize: '1.1rem'}}>Menu masakan hari ini:</p>
            <div style={_st.wb}>{_w.title}</div>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
                <button onClick={() => {_sW(null); _au.pause();}} style={_st.cb}>Tutup</button>
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
    margin: '20px 0', padding: '10px 30px', 
    backgroundImage: 'url("https://i.gifer.com/33Hn.gif")', 
    backgroundRepeat: 'repeat', 
    backgroundSize: '132.08px', 
    border: '4px dashed #ff0000', 
    borderRadius: '50px', textAlign: 'center', position: 'relative', 
    overflow: 'visible',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
  },
  h: { 
    color: '#600', fontWeight: '900', textTransform: 'uppercase', 
    marginBottom: '32.89px', fontSize: '1.7rem', textShadow: '2px 2px 0px #fff' 
  },
  ww: { 
    position: 'relative', width: '280.25px', height: '320px', margin: '0 auto 20px',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  p: { 
    position: 'absolute', 
    top: '50%',      
    left: '50%',     
    transform: 'translate(-50%, -100%)', 
    width: '18px',   
    height: '95px',  
    background: '#d35400',
    clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', 
    zIndex: 50,      
    filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.4))',
    transformOrigin: 'bottom center'
  },
  cp: { 
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40px', height: '40px', 
    background: '#600', 
    borderRadius: '50%', 
    zIndex: 60, 
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    border: '4px solid #fff'
  },
  wh: { 
    width: '100%', height: '100%', position: 'relative', borderRadius: '80%', 
    border: '8px solid #600', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', background: 'rgba(255,255,255,0.9)', 
    zIndex: 10 
  },
  bc: { position: 'absolute', top: '50%', left: '50%', width: '0', height: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  b: { 
    position: 'absolute', width: '90px', padding: '8px 4px', background: '#fff', 
    border: '3px solid #600', borderRadius: '8px', textAlign: 'center', 
    zIndex: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.2)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' 
  },
  bt: { fontSize: '0.71rem', fontWeight: 'bold', color: '#333', lineHeight: '1.1' },
  sb: { padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', backgroundColor: '#d35400', border: '3px solid #fff', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(211, 84, 0, 0.4)', transition: 'all 0.3s ease' },
  mo: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' },
  mc: { background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '90%', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '4px solid #febf04', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  wb: { background: '#fff4e6', color: '#d35400', padding: '15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.3rem', margin: '20px 0', border: '2px dashed #d35400' },
  cb: { padding: '10px 20px', border: 'none', background: '#ccc', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
  vb: { padding: '10px 20px', border: 'none', background: '#d35400', color: 'white', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }
};

export default _FW;