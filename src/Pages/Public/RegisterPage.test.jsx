import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import { i18nReady } from '../../i18n';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  it('renders the patient registration title', async () => {
    await i18nReady;
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await waitFor(() => {
      expect(screen.getByText('إنشاء حساب مريض')).toBeInTheDocument();
    });
  });
});
