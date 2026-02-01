import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DatabaseWidget = () => {
  const [activeTab, setActiveTab] = useState('recipes');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (table) => {
    setLoading(true);
    const { data: result, error } = await supabase.from(table).select('*').limit(50);
    if (error) console.error(error);
    else setData(result);
    setLoading(false);
  };

  const tabs = ['recipes', 'ingredients', 'steps', 'profiles'];

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '100%', overflowX: 'auto' }}>
      <h1>Database Viewer Widget</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '10px 20px', 
              background: activeTab === tab ? '#333' : '#eee', 
              color: activeTab === tab ? 'white' : 'black',
              border: 'none', cursor: 'pointer'
            }}
          >
            Tabel: {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              {data.length > 0 && Object.keys(data[0]).map(key => (
                <th key={key} style={{ textAlign: 'left' }}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.length === 0 && !loading && <p>Tidak ada data di tabel ini.</p>}
    </div>
  );
};
export default DatabaseWidget;