'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { fetchWithAuth } from '@/lib/auth/api';
import styles from './dashboard.module.scss';

interface Statistics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const locale = useLocale();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics`);
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Дашборд' : 'Dashboard'}
      </h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>
              {locale === 'ru' ? 'Всего бронирований' : 'Total Bookings'}
            </div>
            <div className={styles.statValue}>{stats?.totalBookings || 0}</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardPending}`}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>
              {locale === 'ru' ? 'В обработке' : 'Pending'}
            </div>
            <div className={styles.statValue}>{stats?.pendingBookings || 0}</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardConfirmed}`}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>
              {locale === 'ru' ? 'Подтверждено' : 'Confirmed'}
            </div>
            <div className={styles.statValue}>{stats?.confirmedBookings || 0}</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardCompleted}`}>
          <div className={styles.statIcon}>🎉</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>
              {locale === 'ru' ? 'Завершено' : 'Completed'}
            </div>
            <div className={styles.statValue}>{stats?.completedBookings || 0}</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardRevenue}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>
              {locale === 'ru' ? 'Общая выручка' : 'Total Revenue'}
            </div>
            <div className={styles.statValue}>
              {(stats?.totalRevenue || 0).toLocaleString()}₽
            </div>
          </div>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>
          {locale === 'ru' ? 'Быстрые действия' : 'Quick Actions'}
        </h2>
        <div className={styles.linksGrid}>
          <a href={`/${locale}/admin/bookings`} className={styles.quickLink}>
            <div className={styles.quickLinkIcon}>📋</div>
            <div className={styles.quickLinkTitle}>
              {locale === 'ru' ? 'Управление бронированиями' : 'Manage Bookings'}
            </div>
          </a>
          <a href={`/${locale}/admin/routes`} className={styles.quickLink}>
            <div className={styles.quickLinkIcon}>🚗</div>
            <div className={styles.quickLinkTitle}>
              {locale === 'ru' ? 'Управление маршрутами' : 'Manage Routes'}
            </div>
          </a>
          <a href={`/${locale}/admin/pricing`} className={styles.quickLink}>
            <div className={styles.quickLinkIcon}>💰</div>
            <div className={styles.quickLinkTitle}>
              {locale === 'ru' ? 'Управление ценами' : 'Manage Pricing'}
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
