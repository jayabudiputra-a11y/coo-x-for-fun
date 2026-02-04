import React from 'react';
import { HashRouter as HR, Routes as RS, Route as RE } from 'react-router-dom';
import { HelmetProvider as HP } from 'react-helmet-async';

// Import Tema Myspace dari folder styles
import MyspaceTheme from './styles/MyspaceTheme';

// N0 sekarang sudah berisi logika Jurnal & Music Player (Lagu)
import N0 from './components/Layout/Navbar';
import F0 from './components/Layout/Footer';

import P0 from './pages/Home';
import P1 from './pages/RecipeDetail';
import P2 from './pages/Search';
import P3 from './pages/NotFound';
import P4 from './pages/DatasetWidget';
import P5 from './pages/CountryPage'; 
import P6 from './pages/BlogList'; 
import P7 from './pages/BlogPost';
import P8 from './pages/addRecipe'; 

function App() {
  return (
    <HP>
      {/* Tema Global: Memberikan BG Glitter, Kursor, dan Font Retro */}
      <MyspaceTheme />
      
      <HR>
        {/* Navbar (N0) otomatis menampilkan menu Jurnal & Lagu */}
        <N0 />
        
        {/* Kontainer Utama: Pastikan z-index aman agar dropdown lagu tidak tertutup */}
        <main style={{ position: 'relative', zIndex: 1 }}>
          <RS>
            <RE path="/" element={<P0 />} />
            <RE path="/search" element={<P2 />} />
            <RE path="/resep/:slug" element={<P1 />} />
            <RE path="/db-widget" element={<P4 />} />
            <RE path="/country/:name" element={<P5 />} />
            <RE path="/blog" element={<P6 />} />
            <RE path="/blog/:slug" element={<P7 />} />
            <RE path="/add-recipe" element={<P8 />} />
            <RE path="*" element={<P3 />} />
          </RS>
        </main>
        
        <F0 />
      </HR>
    </HP>
  );
}

export default App;