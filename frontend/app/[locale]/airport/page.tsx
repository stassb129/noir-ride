'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { apiClient, AirportPricing } from '@/lib/api/client';
import styles from './airport.module.scss';

export default function AirportPage() {
  const locale = useLocale();
  const [pricing, setPricing] = useState<AirportPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirport, setSelectedAirport] = useState('SVO');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await apiClient.getAirportPricing(selectedAirport);
        setPricing(data);
      } catch (error) {
        console.error('Error fetching airport pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [selectedAirport]);

  const airports = [
    { code: 'SVO', name: 'Sheremetyevo', nameRu: 'Шереметьево' },
    { code: 'DME', name: 'Domodedovo', nameRu: 'Домодедово' },
    { code: 'VKO', name: 'Vnukovo', nameRu: 'Внуково' },
  ];

  // Group pricing by direction
  const toAirport = pricing.filter(p => p.direction === 'to_airport');
  const fromAirport = pricing.filter(p => p.direction === 'from_airport');

  return (
    <div className={styles.airportPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Аэропорт' : 'Airport transfer'}
        </h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Выберите аэропорт' : 'Select airport'}
          </h2>
          <div className={styles.airportGrid}>
            {airports.map((airport) => (
              <button
                key={airport.code}
                className={`${styles.airportCard} ${selectedAirport === airport.code ? styles.active : ''}`}
                onClick={() => setSelectedAirport(airport.code)}
              >
                <div className={styles.airportCode}>{airport.code}</div>
                <div className={styles.airportName}>
                  {locale === 'ru' ? airport.nameRu : airport.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>
            {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
          </p>
        ) : (
          <>
            {toAirport.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ru' ? 'Москва → Аэропорт' : 'Moscow → Airport'}
                </h2>
                <div className={styles.pricingList}>
                  {toAirport.map((item) => (
                    <div key={item.id} className={styles.pricingItem}>
                      <div className={styles.pricingInfo}>
                        <div className={styles.pricingType}>{item.vehicleName}</div>
                      </div>
                      <div className={styles.pricingPrice}>
                        {item.price.toLocaleString()}₽
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fromAirport.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ru' ? 'Аэропорт → Москва' : 'Airport → Moscow'}
                </h2>
                <div className={styles.pricingList}>
                  {fromAirport.map((item) => (
                    <div key={item.id} className={styles.pricingItem}>
                      <div className={styles.pricingInfo}>
                        <div className={styles.pricingType}>{item.vehicleName}</div>
                      </div>
                      <div className={styles.pricingPrice}>
                        {item.price.toLocaleString()}₽
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}