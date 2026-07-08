'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useUser } from '@/lib/hooks/useUser';
import { getToken } from '@/lib/user-auth';
import styles from './HeroAccessCard.module.scss';

interface BookingStat {
  routes: Array<{ id: number }>;
  airports: Array<{ id: number }>;
  hourly: Array<{ id: number }>;
}

export default function HeroAccessCard() {
  const locale = useLocale();
  const ru = locale.startsWith('ru');
  const { user, isLoading } = useUser();
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BookingStat | null) => {
        if (!data) return;
        const total = (data.routes?.length ?? 0) + (data.airports?.length ?? 0) + (data.hourly?.length ?? 0);
        setBookingCount(total);
      })
      .catch(() => setBookingCount(null));
  }, [user]);

  if (isLoading) return null;

  if (!user) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          {ru ? 'Войдите в личный кабинет' : 'Sign in to your account'}
        </h3>
        <p className={styles.text}>
          {ru
            ? 'Сохраняйте историю поездок, быстро повторяйте заказ и оплачивайте незавершённые бронирования.'
            : 'Keep ride history, repeat bookings quickly and finish pending payments.'}
        </p>
        <div className={styles.actions}>
          <Link href={`/${locale}/account/login`} className={styles.primaryBtn}>
            {ru ? 'Войти' : 'Sign in'}
          </Link>
          <Link href={`/${locale}/account/register`} className={styles.secondaryBtn}>
            {ru ? 'Регистрация' : 'Register'}
          </Link>
        </div>
      </div>
    );
  }

  const name = user.name?.trim() || (ru ? 'Гость' : 'Guest');

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        {ru ? `Здравствуйте, ${name}` : `Welcome back, ${name}`}
      </h3>
      <p className={styles.text}>
        {bookingCount != null
          ? (ru ? `У вас ${bookingCount} заказ(ов) в кабинете.` : `You have ${bookingCount} booking(s) in your account.`)
          : (ru ? 'Откройте кабинет, чтобы управлять заказами и оплатой.' : 'Open your account to manage bookings and payments.')}
      </p>
      <div className={styles.actions}>
        <Link href={`/${locale}/account`} className={styles.primaryBtn}>
          {ru ? 'Личный кабинет' : 'Open account'}
        </Link>
        <Link href={`/${locale}/booking`} className={styles.secondaryBtn}>
          {ru ? 'Новый заказ' : 'New booking'}
        </Link>
      </div>
    </div>
  );
}

