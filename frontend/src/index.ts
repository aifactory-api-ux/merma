/**
 * Merma Project - Frontend Entry Point
 * 
 * Main entry point for the React application.
 * Renders the root App component.
 * 
 * Version: 1.0.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/dashboard.css';

// Get root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find root element');
}

// Create React root
const root = createRoot(container);

// Render App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
