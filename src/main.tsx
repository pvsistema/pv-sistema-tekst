import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

/* без этого браузер откроет брошенный файл сам, вместо нашего редактора */
['dragover', 'drop'].forEach((type) =>
  window.addEventListener(type, (e) => e.preventDefault(), false),
);

createRoot(document.getElementById("root")!).render(<App />);