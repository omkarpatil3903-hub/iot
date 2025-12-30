import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { FirebaseProvider } from './context/FirebaseContext';
import { ThemeProvider } from './context/ThemeContext';
import { FieldProvider } from './context/FieldContext';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <FieldProvider>
          <FirebaseProvider>
            <App />
          </FirebaseProvider>
        </FieldProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
