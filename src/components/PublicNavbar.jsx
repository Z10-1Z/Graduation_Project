import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import { useDirection } from '../hooks/useDirection';

/**
 * @param {'home'|'doctors'|'about'|'contact'|null} active
 * @param {{ to: string, labelKey: string }} [cta] labelKey is a translation key e.g. publicNav.login
 */
const SCROLL_BG_THRESHOLD = 12;

export default function PublicNavbar({ active = null, cta = { to: '/login', labelKey: 'publicNav.login' } }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage || i18n.language || 'ar';
  const { isLtr } = useDirection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_BG_THRESHOLD);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const linkClass = (key) => (active === key ? 'nav-link-active' : 'nav-link-inactive');
  const mobileAlign = isLtr ? 'text-start' : 'text-end';

  return (
    <nav key={lng} className={`navbar-public${scrolled ? ' navbar-public--scrolled' : ''}`}>
      <div className="navbar-public__inner">
        <Link to="/" className="nav-logo-hit shrink-0">
          <BrandLogo className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain" />
        </Link>
        <div className="hidden md:flex items-center gap-4 min-w-0">
          <Link to="/" className={linkClass('home')}>{t('publicNav.home')}</Link>
          <Link to="/doctors" className={linkClass('doctors')}>{t('publicNav.doctors')}</Link>
          <Link to="/about" className={linkClass('about')}>{t('publicNav.about')}</Link>
          <Link to="/contact" className={linkClass('contact')}>{t('publicNav.contact')}</Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <LanguageSwitcher />
          <Link to={cta.to} className="nav-cta-link hidden md:inline-flex">
            {t(cta.labelKey)}
          </Link>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="nav-icon-toggle md:hidden" aria-label={t('common.menu')} aria-expanded={menuOpen}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden mt-3 mx-4 sm:mx-auto sm:max-w-6xl flex flex-col gap-2 pb-4 border-t border-gray-100 pt-4 max-h-[min(70dvh,28rem)] overflow-y-auto overscroll-contain">
          <Link to="/" className={`${linkClass('home')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.home')}</Link>
          <Link to="/doctors" className={`${linkClass('doctors')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.doctors')}</Link>
          <Link to="/about" className={`${linkClass('about')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.about')}</Link>
          <Link to="/contact" className={`${linkClass('contact')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.contact')}</Link>
          <Link to={cta.to} className="nav-cta-link w-full text-center mt-1" onClick={() => setMenuOpen(false)}>{t(cta.labelKey)}</Link>
        </div>
      )}
    </nav>
  );
}
