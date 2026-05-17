import { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FloatingAIPanel = lazy(() => import('./FloatingAIPanel'));

export default function FloatingAI(props) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [deferReady, setDeferReady] = useState(
    () => import.meta.env.MODE === 'test' || import.meta.env.VITEST === true
  );

  useEffect(() => {
    if (deferReady) return undefined;
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setDeferReady(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const timer = window.setTimeout(enable, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!deferReady) return null;

  return (
    <Suspense fallback={null}>
      <FloatingAIPanel key={`${props.role ?? 'patient'}-${lang}`} {...props} />
    </Suspense>
  );
}
