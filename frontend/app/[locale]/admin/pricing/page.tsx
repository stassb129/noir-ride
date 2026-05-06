'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { fetchWithAuth } from '@/lib/auth/api';
import styles from '../bookings/bookings.module.scss';

export default function AdminPricingPage() {
  const locale = useLocale();
  const [hourlyPricing, setHourlyPricing] = useState<any[]>([]);
  const [airportPricing, setAirportPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const [hourly, airport] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing/hourly`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing/airport`).then(r => r.json()),
      ]);
      setHourlyPricing(hourly);
      setAirportPricing(airport);
    } catch (error) {
      console.error('Error fetching pricing:', error);
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
        {locale === 'ru' ? 'Управление ценами' : 'Manage Pricing'}
      </h1>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px', color: '#eaeaea' }}>
        {locale === 'ru' ? 'Почасовая аренда' : 'Hourly Rental'}
      </h2>
      <div className={styles.bookingsList}>
        {hourlyPricing.map((item) => (
          <div key={item.id} className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <div className={styles.bookingRoute}>{item.vehicleName}</div>
            </div>
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{locale === 'ru' ? 'Цена/час' : 'Price/hour'}:</span>
                <span className={styles.price}>{item.pricePerHour.toLocaleString()}₽</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{locale === 'ru' ? 'Минимум' : 'Minimum'}:</span>
                <span className={styles.detailValue}>{item.minimumHours} {locale === 'ru' ? 'ч' : 'h'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px', color: '#eaeaea' }}>
        {locale === 'ru' ? 'Аэропорт' : 'Airport Transfer'}
      </h2>
      <div className={styles.bookingsList}>
        {airportPricing.slice(0, 4).map((item) => (
          <div key={item.id} className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <div className={styles.bookingRoute}>{item.vehicleName}</div>
            </div>
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{locale === 'ru' ? 'Аэропорт' : 'Airport'}:</span>
                <span className={styles.detailValue}>{item.airportCode}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{locale === 'ru' ? 'Цена' : 'Price'}:</span>
                <span className={styles.price}>{item.price.toLocaleString()}₽</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
