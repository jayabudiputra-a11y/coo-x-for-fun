import React, { useEffect as _e, useState as _s } from 'react';
import { Link as _L } from 'react-router-dom';
import { Search as _Sh, LogIn as _Li, LogOut as _Lo } from 'lucide-react';
import { supabase as _q } from '../../supabaseClient';

const Navbar = () => {
  const [_u, _su] = _s(null);

  _e(() => {
    const _gs = async () => {
      const { data: { session: _sn } } = await _q.auth.getSession();
      _su(_sn?.user ?? null);
    };
    _gs();

    const { data: { subscription: _sb } } = _q.auth.onAuthStateChange((_ev, _sn) => {
      _su(_sn?.user ?? null);
    });

    return () => _sb.unsubscribe();
  }, []);

  const _hLi = async () => {
    await _q.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const _hLo = async () => {
    await _q.auth.signOut();
  };

  return (
    <nav style={{ 
      background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', 
      top: 0, zIndex: 100, padding: '0 16px' 
    }}>
      <div style={{ 
        maxWidth: '1000px', margin: '0 auto', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', height: '60px'
      }}>
        <_L to="/" style={{ 
          textDecoration: 'none', color: '#d35400', fontWeight: '800', 
          fontSize: '1.4rem', fontFamily: 'cursive'
        }}>
          coo-x-for.fun
        </_L>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <_L to="/blog" style={{ 
            textDecoration: 'none', color: '#555', fontWeight: '600', fontSize: '0.95rem'
          }}>
            Jurnal
          </_L>

          <_L to="/search" style={{ color: '#555', display: 'flex', alignItems: 'center' }}>
            <_Sh size={20} />
          </_L>

          <div style={{ borderLeft: '1px solid #eee', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {_u ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                    {_u.user_metadata?.full_name || 'User'}
                  </p>
                </div>
                <img 
                  src={_u.user_metadata?.avatar_url} 
                  alt="Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #d35400' }} 
                />
                <button 
                  onClick={_hLo}
                  style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Logout"
                >
                  <_Lo size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={_hLi}
                style={{ 
                  background: '#d35400', color: '#fff', border: 'none', padding: '6px 12px', 
                  borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <_Li size={16} /> Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;