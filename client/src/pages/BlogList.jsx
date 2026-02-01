import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SEOHelper from '../components/SEO/SEOHelper';

const BlogList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, []);

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
      <SEOHelper 
        title="Postingan Saya" 
        description="Temukan review makanan jujur dan tempat makan terbaik." 
      />
      
      <header style={{ textAlign: 'center', margin: '30px 0' }}>
        <h1 style={{ color: '#d35400', fontSize: '1.8rem', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          Postingan Saya
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
          Review Jujur Makanan & Tempat
        </p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        {posts.map((post, index) => {
          const displayTitle = post.title;
          const displayContent = post.content;

          return (
            <Link 
              to={`/blog/${post.slug}`} 
              key={post.id} 
              style={{ textDecoration: 'none', display: 'block' }}
              aria-label={`Baca selengkapnya ${displayTitle}`}
            >
              <article style={{ 
                background: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'transform 0.2s ease-in-out'
              }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                  <img 
                    src={post.image_url} 
                    alt={displayTitle} 
                    fetchpriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                </div>
                
                <div style={{ padding: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 12px 0', color: '#222', lineHeight: '1.4' }}>
                    {displayTitle}
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6', margin: 0 }}>
                    {displayContent?.substring(0, 120)}... 
                    <span style={{ 
                      color: '#d35400', 
                      fontWeight: 'bold', 
                      marginLeft: '5px',
                      display: 'inline-block'
                    }}>
                      Baca Review Lengkap →
                    </span>
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </main>
    </div>
  );
};

export default BlogList;