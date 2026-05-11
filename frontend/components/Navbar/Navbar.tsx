'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './Navbar.module.scss';

const navbarVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

const mobileMenuVariants: Variants = {
  hidden: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  visible: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 }
  })
};

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <motion.nav 
      className={`${styles.navbar} ${scrolled || isMenuOpen ? styles.scrolled : ''}`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
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
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href={`/${locale}#booking`} className={styles.ctaButton}>
              {locale === 'ru' ? 'Забронировать' : 'Book'}
            </Link>
          </motion.div>

          <button onClick={switchLocale} className={styles.langSwitch}>
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={styles.menuButton}
          aria-label="Toggle menu"
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className={styles.mobileMenuContent}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={link.href}
                    className={styles.navLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                custom={navLinks.length}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={`/${locale}#booking`}
                  className={styles.ctaButton}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {locale === 'ru' ? 'Забронировать' : 'Book'}
                </Link>
              </motion.div>
              <motion.button 
                onClick={switchLocale} 
                className={styles.langSwitch}
                custom={navLinks.length + 1}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                {locale === 'ru' ? 'EN' : 'RU'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}