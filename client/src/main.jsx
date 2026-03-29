import * as R from 'react';
import * as D from 'react-dom/client';

import X from './App';
import './index.css';

const _r = document.getElementById('root');

if (_r) {
  const _m = D.createRoot(_r);

  _m.render(
    R.createElement(
      R.StrictMode,
      null,
      R.createElement(X, null)
    )
  );
} else {
  console.error("Fatal Error: Element with id 'root' not found.");
}