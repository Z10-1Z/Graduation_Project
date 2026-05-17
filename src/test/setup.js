import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';
import i18n, { ensureLocaleLoaded, i18nReady } from '../i18n';

beforeAll(async () => {
  await i18nReady;
});

if (typeof Element !== 'undefined') {
  // jsdom: scrollIntoView may be undefined; some components call it in useLayoutEffect
  Element.prototype.scrollIntoView = vi.fn();
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(async () => {
  try {
    localStorage.removeItem('i18nextLng');
  } catch {
    /* ignore */
  }
  await ensureLocaleLoaded('ar');
  await i18n.changeLanguage('ar');
});
