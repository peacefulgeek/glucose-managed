import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';

const ssrData = (window as any).__SSR_DATA__ || {};
const container = document.getElementById('root')!;

if (container.hasChildNodes()) {
  // SSR hydration
  hydrateRoot(
    container,
    <HelmetProvider>
      <BrowserRouter>
        <App ssrData={ssrData} />
      </BrowserRouter>
    </HelmetProvider>
  );
} else {
  // CSR fallback
  createRoot(container).render(
    <HelmetProvider>
      <BrowserRouter>
        <App ssrData={ssrData} />
      </BrowserRouter>
    </HelmetProvider>
  );
}
