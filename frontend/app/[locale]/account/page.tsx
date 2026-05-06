'use client';

import { useLocale } from 'next-intl';
import styles from './account.module.scss';

export default function AccountPage() {
  const locale = useLocale();

  const bookings = [
    {
      id: '1',
      date: '2026-05-15',
      from: locale === 'ru' ? 'Москва' : 'Moscow',
      to: locale === 'ru' ? 'Санкт-Петербург' : 'Saint Petersburg',
      status: 'confirmed',
      price: 10000
    },
    {
      id: '2',
      date: '2026-05-20',
      from: 'SVO Airport',
      to: locale === 'ru' ? 'Центр' : 'Center',
      status: 'pending',
      price: 6000
    },
    {
      id: '3',
      date: '2026-04-10',
      from: locale === 'ru' ? 'Москва' : 'Moscow',
      to: locale === 'ru' ? 'Санкт-Петербург' : 'Saint Petersburg',
      status: 'cancelled',
      price: 10000
    }
  ];

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { ru: string; en: string } } = {
      confirmed: { ru: 'Подтверждено', en: 'Confirmed' },
      pending: { ru: 'В обработке', en: 'Pending' },
      cancelled: { ru: 'Отменено', en: 'Cancelled' }
    };
    return locale === 'ru' ? statusMap[status]?.ru : statusMap[status]?.en;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.accountPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Аккаунт' : 'Account'}
        </h1>

        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingInfo}>
                <div className={styles.bookingRoute}>
                  <span className={styles.bookingCity}>{booking.from}</span>
                  <span className={styles.bookingArrow}>→</span>
                  <span className={styles.bookingCity}>{booking.to}</span>
                </div>
                <div className={styles.bookingDate}>
                  {new Date(booking.date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className={styles.bookingMeta}>
                <div className={`${styles.bookingStatus} ${getStatusClass(booking.status)}`}>
                  {getStatusText(booking.status)}
                </div>
                <div className={styles.bookingPrice}>
                  {booking.price.toLocaleString()}₽
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}