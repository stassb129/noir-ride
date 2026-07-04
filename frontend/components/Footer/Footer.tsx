'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import HashLink from '@/components/HashLink/HashLink';
import { SITE_CONTACTS, emailHref, phoneHref } from '@/lib/site-contacts';
import styles from './Footer.module.scss';

export default function Footer() {
  const locale = useLocale();
  const ru = locale === 'ru';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoNoir}>NOIR</span>
              <span className={styles.logoRide}>RIDE</span>
            </div>
            <p className={styles.tagline}>
              {ru ? 'Премиум трансфер' : 'Premium transfer service'}
            </p>
          </div>

          <div className={styles.column}>
            <h4>{ru ? 'Услуги' : 'Services'}</h4>
            <div className={styles.links}>
              <Link href={`/${locale}/routes`} className={styles.link}>
                {ru ? 'Маршруты' : 'Routes'}
              </Link>
              <Link href={`/${locale}/airport`} className={styles.link}>
                {ru ? 'Аэропорт' : 'Airport'}
              </Link>
              <Link href={`/${locale}/hourly`} className={styles.link}>
                {ru ? 'Почасовая' : 'Hourly'}
              </Link>
            </div>
          </div>

          <div className={styles.column}>
            <h4>{ru ? 'Контакты' : 'Contact'}</h4>
            <div className={styles.links}>
              <a href={phoneHref()} className={styles.link}>
                {SITE_CONTACTS.phoneDisplay}
              </a>
              <a href={emailHref()} className={styles.link}>
                {SITE_CONTACTS.email}
              </a>
              <HashLink href={`/${locale}#contacts`} className={styles.link}>
                {ru ? 'Все способы связи' : 'All contact options'}
              </HashLink>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 NOIR RIDE. {ru ? 'Все права защищены' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  );
}
