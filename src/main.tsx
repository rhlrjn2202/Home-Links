import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css'; // Import the global CSS
import { Toaster } from '@/components/ui/sonner';
import { SessionContextProvider } from '@/components/auth/SessionContextProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider>
      <App />
    </SessionContextProvider>
    <Toaster />
  </React.StrictMode>,
);