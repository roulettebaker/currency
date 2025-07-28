// Chrome Extension Popup Entry Point
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../client/App';
import '../client/global.css';
import '../client/chrome-extension.css';

// Initialize the React app in the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  // Render the app with Chrome Extension optimizations
  root.render(<App />);

  // Chrome Extension specific initialization
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // Extension-specific setup can go here
    console.log('Safepal Wallet Extension loaded');
  }
}
