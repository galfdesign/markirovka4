import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppStateProvider } from './context/AppStateContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: () => {
    if (window.confirm('Доступна новая версия приложения. Обновить?')) {
      window.location.reload();
    }
  }
});
