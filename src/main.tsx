import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalConsoleError = console.error;
console.error = (...args) => {
  const errorString = args.map(arg => typeof arg === 'string' ? arg : (arg?.message || '')).join(' ');
  if (errorString.includes('computeBoundingSphere') ||
      errorString.includes('Computed radius is NaN') ||
      errorString.includes('ExtrudeGeometry') ||
      errorString.includes('Reviewer account Firestore sync warning') ||
      errorString.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') || 
      errorString.includes('cancelled-popup-request') || 
      errorString.includes('popup-closed-by-user') ||
      errorString.includes('unauthorized-domain') ||
      errorString.includes('auth/unauthorized-domain')) {
    return;
  }
  originalConsoleError(...args);
};

window.addEventListener('error', (event) => {
  if (event.message?.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') || 
      event.message?.includes('unauthorized-domain') ||
      event.error?.message?.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
      event.error?.message?.includes('unauthorized-domain')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
      event.reason?.message?.includes('unauthorized-domain') ||
      event.reason?.code === 'auth/unauthorized-domain') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
