import React from 'react';

const MyspaceTheme = () => {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Global Reset & Background Myspace */
      body {
        margin: 0;
        padding: 0;
        /* GIF Glitter/Stars yang tiling (berulang) ke seluruh layar */
        background-image: url("https://i.gifer.com/NRI0.gif");
        background-repeat: repeat;
        background-attachment: fixed;
        font-family: "Courier New", Courier, monospace;
        color: #000;
        cursor: url('https://cur.cursors-4u.net/ani/ani-1/ani1.ani'), auto !important;
      }

      /* Wrapper utama agar konten tetap terbaca di atas GIF yang ramai */
      .home-container, .recipe-container, .blog-container {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border: 3px double #ff00ff !important;
        box-shadow: 15px 15px 0px #00ffff !important;
        max-width: 900px !important;
        margin: 20px auto !important;
        padding: 20px !important;
        border-radius: 0px !important; /* Myspace jarang pakai rounded corner */
      }

      /* Link ala tahun 2000an */
      a {
        color: #0000ff !important;
        text-decoration: underline !important;
        font-weight: bold;
      }
      a:hover {
        color: #ff00ff !important;
        background: #ffff00;
      }

      /* Header & Title Retro */
      h1, h2, h3 {
        background: linear-gradient(to right, #ff00ff, #00ffff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase;
        letter-spacing: 2px;
        filter: drop-shadow(2px 2px 0px #000);
      }

      /* Card Resep agar ikut tema */
      .recipe-card, article {
        border: 2px solid #000 !important;
        box-shadow: 5px 5px 0px #ff00ff !important;
        border-radius: 0px !important;
      }

      /* Scrollbar ala Windows XP/Myspace */
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
  );
};

export default MyspaceTheme;