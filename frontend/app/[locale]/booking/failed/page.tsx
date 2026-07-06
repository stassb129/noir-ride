'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './page.module.scss';

export default function PaymentFailedPage() {
  const locale = useLocale();
  const ru = locale === 'ru';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✕</div>

        <h1 className={styles.title}>
          {ru ? 'Оплата не прошла' : 'Payment failed'}
        </h1>

        <p className={styles.desc}>
          {ru
            ? 'К сожалению, платёж не удалось обработать. Попробуйте ещё раз или свяжитесь с нами.'
            : 'Unfortunately, the payment could not be processed. Please try again or contact us.'}
        </p>

        <div className={styles.actions}>
          <Link href={`/${locale}/booking`} className={styles.btn}>
            {ru ? 'Попробовать снова' : 'Try again'}
          </Link>
          <Link href={`/${locale}#contacts`} className={styles.btnSecondary}>
            {ru ? 'Связаться с нами' : 'Contact us'}
          </Link>
        </div>
      </div>
    </div>
  );
}
