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
      errorString.includes('auth/unauthorized-domain') ||
      errorString.includes('Missing or insufficient permissions') ||
      errorString.includes('permission-denied') ||
      errorString.includes("GrpcConnection RPC 'Listen' stream") ||
      errorString.includes("Disconnecting idle stream") ||
      errorString.includes("Firestore read notice")) {
    return;
  }
  originalConsoleError(...args);
};

window.addEventListener('error', (event) => {
  const msg = event.message || event.error?.message || '';
  if (msg.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') || 
      msg.includes('unauthorized-domain') ||
      msg.includes('Missing or insufficient permissions') ||
      msg.includes('permission-denied') ||
      msg.includes("GrpcConnection RPC 'Listen' stream") ||
      msg.includes("Disconnecting idle stream")) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (msg.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
      msg.includes('unauthorized-domain') ||
      msg.includes('Missing or insufficient permissions') ||
      msg.includes('permission-denied') ||
      msg.includes("GrpcConnection RPC 'Listen' stream") ||
      msg.includes("Disconnecting idle stream") ||
      event.reason?.code === 'auth/unauthorized-domain' ||
      event.reason?.code === 'permission-denied') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
