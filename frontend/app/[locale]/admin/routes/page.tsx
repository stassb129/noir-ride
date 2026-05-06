'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { fetchWithAuth } from '@/lib/auth/api';
import styles from '../bookings/bookings.module.scss';

interface Route {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  pricePerSeat: number;
  totalSeats: number;
  isActive: boolean;
}

export default function AdminRoutesPage() {
  const locale = useLocale();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/routes`);
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>{locale === 'ru' ? 'Загрузка...' : 'Loading...'}</div>;
  }

  return (
    <div className={styles.bookingsPage}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Управление маршрутами' : 'Manage Routes'}
      </h1>

      {routes.length === 0 ? (
        <div className={styles.empty}>
          {locale === 'ru' ? 'Маршрутов не найдено' : 'No routes found'}
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {routes.map((route) => (
            <div key={route.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div className={styles.bookingRoute}>
                  <span>{route.from}</span>
                  <span className={styles.arrow}>→</span>
                  <span>{route.to}</span>
                </div>
              </div>
              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{locale === 'ru' ? 'Расстояние' : 'Distance'}:</span>
                  <span className={styles.detailValue}>{route.distanceKm} км</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{locale === 'ru' ? 'Цена за место' : 'Price per seat'}:</span>
                  <span className={styles.price}>{route.pricePerSeat.toLocaleString()}₽</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{locale === 'ru' ? 'Мест' : 'Seats'}:</span>
                  <span className={styles.detailValue}>{route.totalSeats}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{locale === 'ru' ? 'Статус' : 'Status'}:</span>
                  <span className={styles.detailValue}>{route.isActive ? (locale === 'ru' ? 'Активен' : 'Active') : (locale === 'ru' ? 'Неактивен' : 'Inactive')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
