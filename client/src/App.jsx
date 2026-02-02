import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import SearchPage from './pages/Search';
import NotFound from './pages/NotFound';
import DatabaseWidget from './pages/DatasetWidget';
import CountryPage from './pages/CountryPage'; 
import BlogList from './pages/BlogList'; 
import BlogPost from './pages/BlogPost';

import AddRecipe from './pages/addRecipe'; 

function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/resep/:slug" element={<RecipeDetail />} />
            <Route path="/db-widget" element={<DatabaseWidget />} />
            <Route path="/country/:name" element={<CountryPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            <Route path="/add-recipe" element={<AddRecipe />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;