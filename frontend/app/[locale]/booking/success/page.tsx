'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './page.module.scss';

type PaymentStatus = 'pending' | 'checking' | 'succeeded' | 'cancelled' | 'unknown';

function usePaymentStatus(paymentId: string | null): PaymentStatus {
  const [status, setStatus] = useState<PaymentStatus>('checking');

  useEffect(() => {
    if (!paymentId || paymentId === '__PAYMENT_ID__') {
      setStatus('succeeded');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
    let attempts = 0;
    const maxAttempts = 6;

    const check = async () => {
      try {
        const res = await fetch(`${apiUrl}/payment/${paymentId}`);
        if (res.ok) {
          const data = await res.json() as { status: string };
          if (data.status === 'succeeded') { setStatus('succeeded'); return; }
          if (data.status === 'cancelled') { setStatus('cancelled'); return; }
        }
      } catch { /* ignore */ }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(check, 2500);
      } else {
        setStatus('unknown');
      }
    };

    check();
  }, [paymentId]);

  return status;
}

export default function PaymentSuccessPage() {
  const locale = useLocale();
  const ru = locale === 'ru';

  const paymentId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('paymentId')
    : null;

  const status = usePaymentStatus(paymentId);

  if (status === 'checking') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.checking}>
            {ru ? 'Проверяем статус оплаты...' : 'Checking payment status…'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} ${styles.cardFailed}`}>
          <div className={styles.iconFailed}>✕</div>
          <h1 className={styles.title}>{ru ? 'Оплата отменена' : 'Payment cancelled'}</h1>
          <p className={styles.desc}>
            {ru
              ? 'Платёж был отменён. Вы можете попробовать снова.'
              : 'The payment was cancelled. You can try again.'}
          </p>
          <Link href={`/${locale}/booking`} className={styles.btn}>
            {ru ? 'Попробовать ещё раз' : 'Try again'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>✓</div>

        <h1 className={styles.title}>
          {ru ? 'Оплата принята!' : 'Payment accepted!'}
        </h1>

        <p className={styles.desc}>
          {ru
            ? 'Ваш заказ подтверждён. Мы свяжемся с вами по телефону или email, чтобы уточнить детали поездки.'
            : 'Your booking is confirmed. We will contact you by phone or email to clarify the trip details.'}
        </p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{ru ? 'Статус' : 'Status'}</span>
            <span className={styles.detailValue} data-ok>
              {ru ? 'Оплачено ✓' : 'Paid ✓'}
            </span>
          </div>
          {paymentId && paymentId !== '__PAYMENT_ID__' && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{ru ? 'ID платежа' : 'Payment ID'}</span>
              <span className={styles.detailValue}>{paymentId}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Link href={`/${locale}`} className={styles.btnSecondary}>
            {ru ? 'На главную' : 'Home'}
          </Link>
          <Link href={`/${locale}/account`} className={styles.btn}>
            {ru ? 'Мои заказы' : 'My bookings'}
          </Link>
        </div>

        <p className={styles.note}>
          {ru
            ? 'Чек об оплате будет направлен на вашу почту ЮKassa.'
            : 'A payment receipt will be sent to your email by YooKassa.'}
        </p>
      </div>
    </div>
  );
}
