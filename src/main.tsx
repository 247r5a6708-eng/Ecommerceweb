import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CatalogProvider } from './contexts/CatalogContext';
import { UserProvider } from './contexts/UserContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CurrencyProvider>
      <CatalogProvider>
        <UserProvider>
        <App />
      </UserProvider>
      </CatalogProvider>
    </CurrencyProvider>
  </StrictMode>,
);
