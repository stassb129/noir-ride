'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { apiClient, Route, AvailableSeats } from '@/lib/api/client';
import styles from './routes.module.scss';

export default function RoutesPage() {
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [routes, setRoutes] = useState<Route[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailableSeats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await apiClient.getAllRoutes();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (routes.length === 0) return;

      const availabilityData: Record<string, AvailableSeats> = {};
      
      for (const route of routes) {
        try {
          const seats = await apiClient.getAvailableSeats(route.id, selectedDate);
          availabilityData[route.id] = seats;
        } catch (error) {
          console.error(`Error fetching availability for route ${route.id}:`, error);
        }
      }

      setAvailability(availabilityData);
    };

    fetchAvailability();
  }, [routes, selectedDate]);

  if (loading) {
    return (
      <div className={styles.routesPage}>
        <div className={styles.container}>
          <p className={styles.loading}>
            {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.routesPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Маршруты' : 'Routes'}
        </h1>

        <div className={styles.dateSelector}>
          <label className={styles.dateLabel}>
            {locale === 'ru' ? 'Выберите дату' : 'Select date'}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.routesList}>
          {routes.map((route) => {
            const seats = availability[route.id];
            
            return (
              <div key={route.id} className={styles.route}>
                <div className={styles.routeHeader}>
                  <div className={styles.routeDirection}>
                    <span className={styles.routeCity}>{route.from}</span>
                    <span className={styles.routeArrow}>→</span>
                    <span className={styles.routeCity}>{route.to}</span>
                  </div>
                  <div className={styles.routePrice}>
                    {route.pricePerSeat.toLocaleString()}₽ {locale === 'ru' ? 'за место' : 'per seat'}
                  </div>
                </div>

                {seats ? (
                  <div className={styles.seatsInfo}>
                    <div className={styles.seatIndicators}>
                      {[...Array(seats.totalSeats)].map((_, i) => (
                        <div
                          key={i}
                          className={`${styles.seatDot} ${
                            i < seats.availableSeats ? styles.seatAvailable : styles.seatTaken
                          }`}
                        />
                      ))}
                    </div>
                    <span className={styles.seatStatus}>
                      {seats.availableSeats === 0
                        ? (locale === 'ru' ? 'Нет мест' : 'Sold out')
                        : `${seats.availableSeats} / ${seats.totalSeats} ${locale === 'ru' ? 'мест' : 'seats'}`}
                    </span>
                  </div>
                ) : (
                  <p className={styles.loadingSeats}>
                    {locale === 'ru' ? 'Загрузка мест...' : 'Loading seats...'}
                  </p>
                )}

                <button
                  disabled={!seats || seats.availableSeats === 0}
                  className={styles.selectButton}
                >
                  {locale === 'ru' ? 'Забронировать' : 'Book now'}
                </button>
              </div>
            );
          })}
        </div>

        {routes.length === 0 && (
          <p className={styles.noRoutes}>
            {locale === 'ru' ? 'Маршруты не найдены' : 'No routes available'}
          </p>
        )}
      </div>
    </div>
  );
}