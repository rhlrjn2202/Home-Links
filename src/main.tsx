import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { App } from './App';
import './index.css'; // Import the global CSS
import { Toaster } from '@/components/ui/sonner';
import { SessionContextProvider } from '@/components/auth/SessionContextProvider';
import { SeoProvider } from '@/components/seo/SeoProvider'; // Import SeoProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SeoProvider> {/* Wrap with SeoProvider */}
      <Router> {/* BrowserRouter moved here */}
        <SessionContextProvider>
          <App />
        </SessionContextProvider>
      </Router>
    </SeoProvider>
    <Toaster />
  </React.StrictMode>,
);