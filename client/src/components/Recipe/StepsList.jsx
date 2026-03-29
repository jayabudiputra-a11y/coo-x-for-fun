import React from 'react';

// Normalisasi berbagai format steps_data yang mungkin datang dari mobile / web
const _normalizeSteps = (raw) => {
  if (!raw) return [];

  // Jika object (bukan array), coba ambil value pertama yang array
  if (!Array.isArray(raw) && typeof raw === 'object') {
    const _found = Object.values(raw).find(v => Array.isArray(v));
    if (_found) return _normalizeSteps(_found);
    // Kalau object tunggal, bungkus jadi array
    return _normalizeSteps([raw]);
  }

  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((item, idx) => {
    // Sudah sesuai format standar
    if (item.langkah_langkah_nya !== undefined) return item;

    // Normalisasi field name alternatif dari mobile
    const _instrField =
      item.instruction  ??
      item.instructions ??
      item.description  ??
      item.text         ??
      item.content      ??
      item.step         ??
      item.detail       ??
      (typeof item === 'string' ? item : null);

    return {
      step_number       : item.step_number ?? item.stepNumber ?? item.order ?? item.no ?? (idx + 1),
      langkah_langkah_nya: _instrField ?? JSON.stringify(item),
      image_url         : item.image_url ?? item.imageUrl ?? item.image ?? null,
    };
  });
};

const StepsList = ({ steps, steps_data }) => {
  let sList = [];

  if (Array.isArray(steps_data) && steps_data.length > 0) {
    sList = _normalizeSteps(steps_data);
  } else if (steps_data && !Array.isArray(steps_data)) {
    // steps_data ada tapi bukan array (object / string JSON)
    const _parsed = typeof steps_data === 'string'
      ? (() => { try { return JSON.parse(steps_data); } catch { return null; } })()
      : steps_data;
    sList = _normalizeSteps(_parsed);
  }

  // Fallback ke kolom steps
  if (sList.length === 0 && Array.isArray(steps) && steps.length > 0) {
    sList = _normalizeSteps(steps);
  }

  return (
    <div className="steps-wrapper" style={{ marginTop: '20px' }}>
      <h3 style={{
        color: '#d35400',
        borderBottom: '3px solid #f3a133',
        display: 'inline-block',
        marginBottom: '15px',
        paddingBottom: '5px',
        fontWeight: '800',
        textTransform: 'uppercase'
      }}>
        TAHAP BUATNYA
      </h3>

      {sList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[...sList]
            .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
            .map((st, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '15px',
                padding: '15px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #eee',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  minWidth: '35px',
                  height: '35px',
                  background: '#f3a133',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {st.step_number}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    color: '#333',
                    lineHeight: '1.6',
                    fontSize: '1.05rem'
                  }}>
                    {st.langkah_langkah_nya}
                  </p>

                  {st.image_url && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img
                        src={st.image_url}
                        alt={`Step ${st.step_number}`}
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          background: '#fafafa',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px dashed #ccc'
        }}>
          <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>
            Langkah-langkah tidak tersedia.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepsList;