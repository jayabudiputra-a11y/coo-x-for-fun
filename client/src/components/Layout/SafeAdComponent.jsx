import React, { useState, useMemo, useEffect } from 'react';

let adLock = false;

const SafeAdComponent = () => {
  if (adLock) return null;

  const [isVisible] = useState(true);

  useEffect(() => {
    adLock = true;
    return () => {
      adLock = false;
    };
  }, []);

  const adSource = useMemo(() => `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
    height: 250px;
  }
  #ad-display {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 250px;
  }
</style>
</head>
<body>
<div id="ad-display">
  <script type="text/javascript">
    atOptions = {
      'key' : '00a1391f38d87ff5d574caa89f0d2959',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script async src="https://www.highperformanceformat.com/00a1391f38d87ff5d574caa89f0d2959/invoke.js"></script>
</div>
</body>
</html>
  `, []);

  if (!isVisible) return null;

  return (
    <div
      className="ad-safe-container"
      style={{
        width: '100%',
        margin: '0',
        padding: '0',
        position: 'relative',
        display: 'block',
        height: '250px',
        overflow: 'hidden',
        minHeight: '250px',
        backgroundColor: 'transparent'
      }}
    >
      <iframe
        title="AdSlot"
        srcDoc={adSource}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        loading="lazy"
        scrolling="no"
        frameBorder="0"
        style={{
          width: '100%',
          height: '250px',
          display: 'block',
          margin: '0',
          padding: '0',
          border: 'none',
          pointerEvents: 'auto'
        }}
      />
    </div>
  );
};

export default React.memo(SafeAdComponent);