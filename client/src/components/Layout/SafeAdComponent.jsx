import React, { useState as _uS, useMemo as _uM, useEffect as _e, useRef as _uR } from 'react';

let _gL = false;

const _SAC = () => {
  const _cR = _uR(null);
  const [_rD, _sR] = _uS(false);
  const [_vS, _sV] = _uS(true); // State untuk kontrol tombol Close (X)

  const _cfG = _uM(() => ({
    k: '00a1391f38d87ff5d574caa89f0d2959',
    h: 250,
    w: 300,
    s: 'https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js'
  }), []);

  _e(() => {
    if (_gL) return;
    _gL = true;
    _sR(true);
    return () => { _gL = false; };
  }, []);

  const _ctN = _uM(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, html { margin: 0; padding: 0; height: 250px; overflow: hidden; background: transparent; display: flex; justify-content: center; }
          #c { width: 300px; height: 250px; position: relative; }
        </style>
      </head>
      <body>
        <div id="c">
          <script type="text/javascript">
            var atOptions = { 'key' : '${_cfG.k}', 'format' : 'iframe', 'height' : ${_cfG.h}, 'width' : ${_cfG.w}, 'params' : {} };
          </script>
          <script type="text/javascript" async src="${_cfG.s}"></script>
        </div>
      </body>
    </html>
  `, [_cfG]);

  if (!_vS) return null; // Hilangkan komponen jika tombol X diklik
  if (!_rD) return <div style={{ height: '250px' }} />;

  return (
    <div ref={_cR} className="sys-ad-node" style={_st.cn}>
      {/* Tombol Close (X) dengan posisi retro */}
      <button onClick={() => _sV(false)} style={_st.cl}> × </button>
      
      {/* Label Advertisement */}
      <div style={_st.lb}>[ ADVERTISEMENT ]</div>
      
      <iframe
        title="Content Framework"
        srcDoc={_ctN}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        scrolling="no"
        frameBorder="0"
        loading="lazy"
        style={_st.if}
      />
    </div>
  );
};

const _st = {
  cn: {
    position: 'relative',
    width: '100%',
    maxWidth: '350px',
    margin: '25px auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '280px',
    backgroundImage: 'url("https://i.gifer.com/Vbat.gif")', // Tema Myspace Kuning Glitter
    backgroundRepeat: 'repeat',
    backgroundSize: '120px',
    border: '4px dashed #ff00ff', // Pink Dashed
    boxShadow: '10px 10px 0px #00ffff', // Hard Shadow Cyan
    borderRadius: '12px',
    padding: '15px',
    overflow: 'visible'
  },
  cl: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#000',
    color: '#fff',
    border: '2px solid #fff',
    cursor: 'pointer',
    zIndex: 100,
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    boxShadow: '3px 3px 0px #ff0000' // Shadow merah pada tombol X
  },
  lb: {
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#fff700',
    padding: '2px 10px',
    fontFamily: 'monospace',
    border: '1px solid #000',
    zIndex: 5
  },
  if: {
    width: '300px',
    height: '250px',
    border: '3px solid #000',
    backgroundColor: '#fff',
    overflow: 'hidden',
    zIndex: 1
  }
};

export default React.memo(_SAC, () => true);