import React, { useEffect as _e, useState as _s } from 'react';
import { supabase as _q } from '../supabaseClient';

const DatabaseWidget = () => {
  const [_t, _st] = _s('recipes');
  const [_d, _sd] = _s([]);
  const [_l, _sl] = _s(false);
  const [_u, _su] = _s(null);

  _e(() => {
    _q.auth.getSession().then(({ data: { session } }) => {
      _su(session?.user);
    });
  }, []);

  _e(() => {
    if (_u?.email === 'bbudi6621@gmail.com') {
      _fD(_t);
    }
  }, [_t, _u]);

  const _fD = async (table) => {
    _sl(true);
    const { data: result, error } = await _q.from(table).select('*').limit(50);
    if (error) console.error(error);
    else _sd(result);
    _sl(false);
  };

  if (!_u || _u.email !== 'bbudi6621@gmail.com') {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'monospace' }}>ACCESS DENIED. ADMIN ONLY.</div>;
  }

  const _tabs = ['recipes', 'ingredients', 'steps', 'profiles'];

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '100%', overflowX: 'auto', background: '#fff' }}>
      <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '10px' }}>Database Viewer Widget</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {_tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => _st(tab)}
            style={{ 
              padding: '10px 20px', 
              background: _t === tab ? '#d35400' : '#eee', 
              color: _t === tab ? 'white' : 'black',
              border: '2px solid #000', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            TABEL: {tab.toUpperCase()}
          </button>
        ))}
      </div>
      {_l ? (
        <p>Loading data...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#333', color: '#fff' }}>
              {_d.length > 0 && Object.keys(_d[0]).map(key => (
                <th key={key} style={{ textAlign: 'left', textTransform: 'uppercase' }}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {_d.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                {Object.values(row).map((val, j) => (
                  <td key={j} style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #ccc' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {_d.length === 0 && !_l && <p>Tidak ada data di tabel ini.</p>}
    </div>
  );
};

export default DatabaseWidget;