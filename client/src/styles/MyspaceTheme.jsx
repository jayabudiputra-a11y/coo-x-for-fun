import React from 'react';

const MyspaceTheme = () => {
  return (
    <>
      <link rel="stylesheet" href="https://cdn.cursors-4u.net/cursors/animated/oth3-11-51736d03-32.css" />
      <style dangerouslySetInnerHTML={{ __html: `

        body {
          margin: 0;
          padding: 0;
          background-image: url("https://i.gifer.com/NRI0.gif");
          background-repeat: repeat;
          background-attachment: fixed;
          font-family: 'Open Sans', sans-serif !important;
          color: #000;
        }

        * {
          cursor: url('https://cdn.cursors-4u.net/css-previews/cigarette-1b09ff6c-css.webp') 6 7, auto !important;
        }

        .home-container, .recipe-container, .blog-container {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border: 3px double #ff00ff !important;
          box-shadow: 15px 15px 0px #00ffff !important;
          max-width: 900px !important;
          margin: 20px auto !important;
          padding: 20px !important;
          border-radius: 0px !important;
          font-family: 'Open Sans', sans-serif !important;
        }

        a {
          color: #0000ff !important;
          text-decoration: underline !important;
          font-weight: bold;
          font-family: 'Open Sans', sans-serif !important;
        }

        a:hover {
          color: #ff00ff !important;
          background: #ffff00;
        }

        h1, h2, h3 {
          background: linear-gradient(to right, #ff00ff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          letter-spacing: 2px;
          filter: drop-shadow(2px 2px 0px #000);
          font-family: 'Open Sans', sans-serif !important;
          font-weight: 800 !important;
        }

        .recipe-card, article {
          border: 2px solid #000 !important;
          box-shadow: 5px 5px 0px #ff00ff !important;
          border-radius: 0px !important;
          font-family: 'Open Sans', sans-serif !important;
        }

        p, span, div, li, dt, dd {
          font-family: 'Open Sans', sans-serif !important;
        }

        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #ffff00;
        }

        ::-webkit-scrollbar-thumb {
          background: #ff00ff;
          border: 2px solid #00ffff;
        }
      `}} />
    </>
  );
};

export default MyspaceTheme;