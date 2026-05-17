import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { detectInitialLocale, loadLocaleBundle, normalizeLocaleCode } from './i18n/loadLocale';

function syncDocumentLanguage(lng) {
  const code = normalizeLocaleCode(lng);
  const isEn = code === 'en';
  document.documentElement.lang = isEn ? 'en' : 'ar';
  document.documentElement.dir = isEn ? 'ltr' : 'rtl';
}

const loadedLocales = new Set();

async function ensureLocaleLoaded(lng) {
  const code = normalizeLocaleCode(lng);
  if (loadedLocales.has(code)) return code;
  const bundle = await loadLocaleBundle(code);
  i18n.addResourceBundle(code, 'translation', bundle, true, true);
  loadedLocales.add(code);
  return code;
}

const initialLng = detectInitialLocale();

export const i18nReady = (async () => {
  const bundle = await loadLocaleBundle(initialLng);
  loadedLocales.add(normalizeLocaleCode(initialLng));

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        [normalizeLocaleCode(initialLng)]: { translation: bundle },
      },
      lng: initialLng,
      fallbackLng: 'ar',
      supportedLngs: ['ar', 'en'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      partialBundledLanguages: true,
    });

  syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
})();

i18n.on('languageChanged', (lng) => {
  syncDocumentLanguage(lng);
  void ensureLocaleLoaded(lng);
});

export { ensureLocaleLoaded };
export default i18n;
