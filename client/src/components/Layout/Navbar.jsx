import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{ 
      background: '#fff', 
      borderBottom: '1px solid #eee', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      padding: '0 16px' 
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '60px'
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: '#d35400', 
          fontWeight: '800', 
          fontSize: '1.4rem',
          fontFamily: 'cursive'
        }}>
          coo-x-for.fun
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/blog" style={{ 
            textDecoration: 'none', 
            color: '#555', 
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            Jurnal
          </Link>

          <Link to="/search" style={{ color: '#555', display: 'flex', alignItems: 'center' }}>
            <Search size={20} />
          </Link>

          <div style={{ borderLeft: '1px solid #eee', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                </div>
                <img 
                  src={user.user_metadata?.avatar_url} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #d35400' }} 
                />
                <button 
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                style={{ 
                  background: '#d35400', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;