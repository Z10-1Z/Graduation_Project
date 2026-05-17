import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { store } from './app/store';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

async function bootstrap() {
  const [{ default: i18n, i18nReady }, { default: AppRouter }] = await Promise.all([
    import('./i18n'),
    import('./routes/AppRouter'),
  ]);

  await i18nReady;

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Provider store={store}>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </Provider>
        </ErrorBoundary>
      </I18nextProvider>
    </React.StrictMode>
  );
}

bootstrap();
