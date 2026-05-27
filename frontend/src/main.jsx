/**
 * Entry Point — Where React mounts to the DOM.
 * 
 * CONCEPT: React DOM
 * React creates a "virtual DOM" (JavaScript representation of the UI).
 * ReactDOM.createRoot() bridges React's virtual DOM with the browser's actual DOM.
 * <StrictMode> enables additional development checks and warnings.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);