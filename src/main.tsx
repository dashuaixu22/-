import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Intercept and handle benign ResizeObserver loop notices that browsers treat as unhandled Script errors in iframes
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    const messageStr = typeof msg === 'string' ? msg : '';
    if (
      messageStr.includes('ResizeObserver') ||
      (messageStr === 'Script error.' && !url && lineNo === 0)
    ) {
      return true;
    }
    if (originalOnError) {
      return originalOnError(msg, url, lineNo, columnNo, error);
    }
    return false;
  };

  window.addEventListener(
    'error',
    (event) => {
      if (
        event.message?.includes('ResizeObserver') ||
        (event.message === 'Script error.' && !event.filename)
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && typeof reason.message === 'string' && reason.message.includes('ResizeObserver')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

