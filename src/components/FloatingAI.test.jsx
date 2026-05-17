import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { i18nReady } from '../i18n';
import FloatingAIPanel from './FloatingAIPanel';

const store = configureStore({
  reducer: {
    auth: () => ({ token: null }),
  },
});

function wrap(ui) {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </Provider>
  );
}

describe('FloatingAI', () => {
  it('renders the floating action button', async () => {
    await i18nReady;
    render(wrap(<FloatingAIPanel role="patient" />));
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
