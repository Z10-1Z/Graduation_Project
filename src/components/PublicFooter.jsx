import { createElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { Phone, Mail, MapPin, Instagram, Twitter } from 'lucide-react';
import { PUBLIC_DOCTORS } from '../data/publicDoctors';
import { getSpecialtyOptionsFromDoctors } from '../utils/specialtyFilter';
import { mapSpecialtyOptions } from '../utils/specialtyI18n';
import { useResponsiveSpecLimit } from '../hooks/useResponsiveSpecLimit';

const QUICK_LINK_DEFS = [
  { to: '/', labelKey: 'publicNav.home' },
  { to: '/doctors', labelKey: 'publicNav.doctors' },
  { to: '/#services', labelKey: 'home.footer.linkServices' },
  { to: '/about', labelKey: 'publicNav.about' },
  { to: '/contact', labelKey: 'publicNav.contact' },
];

export default function PublicFooter({ variant = 'full' }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage || i18n.language || 'ar';
  const specLimit = useResponsiveSpecLimit();
  const isCompact = variant === 'compact';

  const quickLinks = useMemo(
    () => QUICK_LINK_DEFS.map(({ to, labelKey }) => ({ to, label: t(labelKey) })),
    [t, lng]
  );

  const specLinks = useMemo(
    () => mapSpecialtyOptions(getSpecialtyOptionsFromDoctors(PUBLIC_DOCTORS, false), t),
    [t, lng]
  );

  const visibleSpecLinks = useMemo(() => specLinks.slice(0, specLimit), [specLinks, specLimit]);
  const specialtyHref = (name) => `/doctors?specialty=${encodeURIComponent(name)}`;

  if (isCompact) {
    return (
      <footer key={lng} className="text-white font-black py-4 px-4 md:px-8" style={{ backgroundColor: '#779ef2' }}>
        <div className="page-shell flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
          <p className="text-blue-200 text-xs">{t('home.footer.copyright')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-blue-200 text-xs">
            <Link to="/" className="hover:text-white transition-colors">{t('publicNav.home')}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{t('publicNav.contact')}</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      key={lng}
      className="text-white font-black pt-8 md:pt-10 pb-6 px-4 md:px-8"
      style={{ backgroundColor: '#779ef2' }}
    >
      <div className="page-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8 items-start text-start">
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center">
                <BrandLogo className="h-14 w-14 sm:h-16 sm:w-16 object-contain" />
              </div>
              <span className="font-bold text-lg">{t('home.footer.brand')}</span>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed">{t('home.footer.tagline')}</p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:bg-blue-400"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:bg-blue-400"
                aria-label="Twitter"
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">{t('home.footer.quickLinksTitle')}</h4>
            <ul className="space-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-blue-100 text-xs transition-all duration-200 hover:text-white ltr:hover:translate-x-0.5 rtl:hover:-translate-x-0.5 motion-reduce:hover:translate-x-0 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">{t('home.footer.specialtiesTitle')}</h4>
            <ul className="space-y-2 max-h-64 sm:max-h-none overflow-y-auto sm:overflow-visible pr-1 sm:pr-0 [scrollbar-width:thin]">
              {visibleSpecLinks.map((link) => (
                <li key={link.value}>
                  <Link
                    to={specialtyHref(link.value)}
                    className="text-blue-100 text-xs transition-all duration-200 hover:text-white ltr:hover:translate-x-0.5 rtl:hover:-translate-x-0.5 motion-reduce:hover:translate-x-0 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {specLinks.length > visibleSpecLinks.length ? (
                <li>
                  <Link
                    to="/doctors"
                    className="text-white text-xs font-semibold underline underline-offset-4"
                  >
                    {t('home.footer.viewAllSpecialties')}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">{t('home.footer.contactTitle')}</h4>
            <div className="space-y-2">
              {[{ icon: Phone, val: '01234567890' }, { icon: Mail, val: 'contact@lesahtak.com' }, { icon: MapPin, val: t('home.footer.location') }].map(({ icon, val }) => (
                <div key={val} className="flex items-center gap-2 text-blue-100 text-xs">
                  {createElement(icon, { size: 12 })}
                  <span>{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold mb-2">{t('home.footer.newsletter')}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder={t('home.footer.emailPh')}
                  className="w-full bg-blue-500 text-white placeholder-blue-200 text-xs px-3 py-2 rounded-lg outline-none min-w-0"
                />
                <button
                  type="button"
                  className="w-full sm:w-auto shrink-0 bg-white text-blue-600 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                >
                  {t('home.footer.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-500 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
          <p className="text-blue-200 text-xs order-2 sm:order-1">{t('home.footer.copyright')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-blue-200 text-xs order-1 sm:order-2">
            <a href="#" className="transition-all duration-200 hover:text-white hover:underline underline-offset-4">
              {t('home.footer.privacy')}
            </a>
            <a href="#" className="transition-all duration-200 hover:text-white hover:underline underline-offset-4">
              {t('home.footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
