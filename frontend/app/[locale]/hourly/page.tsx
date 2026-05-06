'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { apiClient, HourlyPricing } from '@/lib/api/client';
import styles from './hourly.module.scss';

export default function HourlyPage() {
  const locale = useLocale();
  const [pricing, setPricing] = useState<HourlyPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await apiClient.getHourlyPricing();
        setPricing(data);
      } catch (error) {
        console.error('Error fetching hourly pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  if (loading) {
    return (
      <div className={styles.hourlyPage}>
        <div className={styles.container}>
          <p className={styles.loading}>
            {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.hourlyPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Почасовая аренда' : 'Hourly rental'}
        </h1>

        <p className={styles.subheading}>
          {locale === 'ru' 
            ? 'Минимальная аренда — 3 часа'
            : 'Minimum rental — 3 hours'}
        </p>

        <div className={styles.pricingGrid}>
          {pricing.map((item) => (
            <div key={item.id} className={styles.priceCard}>
              <h3 className={styles.vehicleName}>{item.vehicleName}</h3>
              <div className={styles.priceAmount}>
                {item.pricePerHour.toLocaleString()}₽
                <span className={styles.perHour}>
                  {locale === 'ru' ? '/час' : '/hour'}
                </span>
              </div>
              <p className={styles.minimum}>
                {locale === 'ru' ? 'Минимум ' : 'Minimum '}
                {item.minimumHours}
                {locale === 'ru' ? ' часа' : ' hours'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}