// Polyfill window.storage using localStorage (simulates Claude artifact shared storage)
window.storage = {
  async get(key, _shared) {
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  async set(key, value, _shared) {
    localStorage.setItem(key, value);
  },
};

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
