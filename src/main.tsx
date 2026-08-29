import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CatalogProvider } from './contexts/CatalogContext';
import { UserProvider } from './contexts/UserContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={(import.meta as any).env.VITE_GOOGLE_CLIENT_ID || ""}>
      <CurrencyProvider>
        <CatalogProvider>
          <UserProvider>
            <BrowserRouter><App /></BrowserRouter>
          </UserProvider>
        </CatalogProvider>
      </CurrencyProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
