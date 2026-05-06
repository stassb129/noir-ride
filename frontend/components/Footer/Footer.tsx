'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
  const locale = useLocale();

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
              {locale === 'ru' ? 'Премиум трансфер' : 'Premium transfer service'}
            </p>
          </div>

          <div className={styles.column}>
            <h4>{locale === 'ru' ? 'Услуги' : 'Services'}</h4>
            <div className={styles.links}>
              <Link href={`/${locale}/routes`} className={styles.link}>
                {locale === 'ru' ? 'Маршруты' : 'Routes'}
              </Link>
              <Link href={`/${locale}/airport`} className={styles.link}>
                {locale === 'ru' ? 'Аэропорт' : 'Airport'}
              </Link>
              <Link href={`/${locale}/hourly`} className={styles.link}>
                {locale === 'ru' ? 'Почасовая' : 'Hourly'}
              </Link>
            </div>
          </div>

          <div className={styles.column}>
            <h4>{locale === 'ru' ? 'Контакты' : 'Contact'}</h4>
            <div className={styles.links}>
              <span className={styles.link}>+7 (495) 123-45-67</span>
              <span className={styles.link}>info@noirride.ru</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 NOIR RIDE. {locale === 'ru' ? 'Все права защищены' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  );
}