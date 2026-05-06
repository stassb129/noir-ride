'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = path;
  };

  const navLinks = [
    { href: `/${locale}/routes`, label: locale === 'ru' ? 'Маршруты' : 'Routes' },
    { href: `/${locale}/airport`, label: locale === 'ru' ? 'Аэропорт' : 'Airport' },
    { href: `/${locale}/hourly`, label: locale === 'ru' ? 'Почасовая' : 'Hourly' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled || isMenuOpen ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href={`/${locale}`} className={styles.logo}>
          <span className={styles.logoNoir}>NOIR</span>
          <span className={styles.logoRide}>RIDE</span>
        </Link>

        <div className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
          
          <Link href={`/${locale}#booking`} className={styles.ctaButton}>
            {locale === 'ru' ? 'Забронировать' : 'Book'}
          </Link>

          <button onClick={switchLocale} className={styles.langSwitch}>
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={styles.menuButton}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.container} style={{ flexDirection: 'column', height: 'auto', alignItems: 'flex-start' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}#booking`}
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {locale === 'ru' ? 'Забронировать' : 'Book'}
            </Link>
            <button onClick={switchLocale} className={styles.langSwitch}>
              {locale === 'ru' ? 'EN' : 'RU'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}