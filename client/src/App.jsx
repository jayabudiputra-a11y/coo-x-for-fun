import React from 'react';
import { BrowserRouter as BR, Routes as RS, Route as RE } from 'react-router-dom';
import { HelmetProvider as HP } from 'react-helmet-async';

import MyspaceTheme from './styles/MyspaceTheme';
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
import P9 from './pages/PrivacyPolicy';
import P10 from './pages/TermsOfService';

function App() {
  return (
    <HP>
      <MyspaceTheme />
      <BR>
        <N0 />
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
            <RE path="/privacy" element={<P9 />} />
            <RE path="/terms" element={<P10 />} />
            <RE path="*" element={<P3 />} />
          </RS>
        </main>
        <F0 />
      </BR>
    </HP>
  );
}

export default App;// Trigger deploy
