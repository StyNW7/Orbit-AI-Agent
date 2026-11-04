import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { applyTheme, useUi } from './store/ui';
import { getLocale } from './lib/i18n';
import './index.css';

applyTheme(useUi.getState().theme);
document.documentElement.lang = getLocale();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (useUi.getState().theme === 'system') applyTheme('system');
});

if (import.meta.env.PROD) registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
