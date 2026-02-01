import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';

// Import Layout
import Navbar from './components/Layout/Navbar';
import LanguageSwitcher from './components/Layout/LanguageSwitcher';
import Footer from './components/Layout/Footer';

// Import Pages
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import SearchPage from './pages/Search';
import NotFound from './pages/NotFound';
import DatabaseWidget from './pages/DatasetWidget';
import CountryPage from './pages/CountryPage'; 
import BlogList from './pages/BlogList'; 
import BlogPost from './pages/BlogPost';

// PASTIKAN NAMA FILE DAN IMPORT COCOK
import AddRecipe from './pages/addRecipe'; 

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Navbar />
        <LanguageSwitcher />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/resep/:slug" element={<RecipeDetail />} />
            <Route path="/db-widget" element={<DatabaseWidget />} />
            <Route path="/country/:name" element={<CountryPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Rute Tambah Resep */}
            <Route path="/add-recipe" element={<AddRecipe />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;