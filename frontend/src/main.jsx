import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider, } from './context/NotificationContext.jsx';
import { DialogProvider } from './context/DialogContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);