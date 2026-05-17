import { deepMerge } from '../utils/deepMerge';

const localeModules = {
  ar: () =>
    Promise.all([
      import('../locales/ar/common.js'),
      import('../locales/ar/home.js'),
      import('../locales/ar/auth.js'),
      import('../locales/ar/patientDashboard.js'),
      import('../locales/ar/admin.js'),
      import('../locales/ar/doctor.js'),
      import('../locales/ar/publicPages.js'),
      import('../locales/ar/components.js'),
    ]),
  en: () =>
    Promise.all([
      import('../locales/en/common.js'),
      import('../locales/en/home.js'),
      import('../locales/en/auth.js'),
      import('../locales/en/patientDashboard.js'),
      import('../locales/en/admin.js'),
      import('../locales/en/doctor.js'),
      import('../locales/en/publicPages.js'),
      import('../locales/en/components.js'),
    ]),
};

export function normalizeLocaleCode(lng) {
  const code = (lng || 'ar').split('-')[0];
  return code === 'en' ? 'en' : 'ar';
}

export async function loadLocaleBundle(lng) {
  const code = normalizeLocaleCode(lng);
  const loader = localeModules[code] || localeModules.ar;
  const modules = await loader();
  return modules.reduce((acc, mod) => deepMerge(acc, mod.default), {});
}

export function detectInitialLocale() {
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return normalizeLocaleCode(stored);
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : 'ar';
  return nav === 'en' ? 'en' : 'ar';
}
