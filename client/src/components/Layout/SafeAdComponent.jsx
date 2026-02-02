import React, { useState, useMemo, useEffect, useRef } from 'react';

let _gLock = false;

const SafeAdComponent = () => {
  const containerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);

  const _encodedConfig = useMemo(() => {
    return {
      k: '00a1391f38d87ff5d574caa89f0d2959',
      h: 250,
      w: 300,
      s: 'https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js'
    };
  }, []);

  useEffect(() => {
    if (_gLock) return;
    _gLock = true;
    setIsRendered(true);

    return () => {
      _gLock = false;
    };
  }, []);

  const adContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body, html { margin: 0; padding: 0; height: 250px; overflow: hidden; background: transparent; display: flex; justify-content: center; }
            #container { width: 300px; height: 250px; position: relative; }
          </style>
        </head>
        <body>
          <div id="container">
            <script type="text/javascript">
              var atOptions = {
                'key' : '${_encodedConfig.k}',
                'format' : 'iframe',
                'height' : ${_encodedConfig.h},
                'width' : ${_encodedConfig.w},
                'params' : {}
              };
            </script>
            <script async src="${_encodedConfig.s}"></script>
          </div>
        </body>
      </html>
    `;
  }, [_encodedConfig]);

  if (!isRendered) return <div style={{ height: '250px' }} />;

  return (
    <div
      ref={containerRef}
      className="sys-module-viewer" 
      style={{
        width: '100%',
        height: '250px',
        margin: '15px 0',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        position: 'relative'
      }}
    >
      <iframe
        title="Content Frame"
        srcDoc={adContent}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        scrolling="no"
        frameBorder="0"
        loading="lazy"
        style={{
          width: '300px',
          height: '250px',
          border: 'none',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default React.memo(SafeAdComponent, () => true);