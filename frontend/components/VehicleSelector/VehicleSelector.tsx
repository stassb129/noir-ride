'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { fetchVehicles, getVehiclePhotos, type Vehicle, type ServiceType } from '@/lib/api/vehicles';
import { getAirportPrice } from '@/lib/airport-pricing';
import { scrollToBookingDetails } from '@/lib/scroll-to-hash';
import VehicleModal from '@/components/VehicleModal/VehicleModal';
import styles from './VehicleSelector.module.scss';

export type { Vehicle, ServiceType };

interface VehicleSelectorProps {
  serviceType: ServiceType;
  value: number | null;
  onChange: (vehicleId: number, vehicleName: string, price: number, maxPassengers: number) => void;
  variant?: 'compact' | 'wide';
  airportCode?: string;
}

function getPrice(v: Vehicle, type: ServiceType, airportCode?: string): number | null {
  if (type === 'intercity') {
    return v.pricePerKm != null ? Number(v.pricePerKm) : null;
  }
  if (type === 'airport') {
    return getAirportPrice(v.priceAirport, airportCode);
  }
  return v.priceHourly != null ? Number(v.priceHourly) : null;
}

function priceLabel(price: number | null, type: ServiceType, locale: string): string {
  if (!price) return '—';
  if (type === 'hourly') return `от ${price.toLocaleString()} ₽/ч`;
  if (type === 'intercity') return `от ${price.toLocaleString()} ₽/км`;
  return `от ${price.toLocaleString()} ₽`;
}

export default function VehicleSelector({
  serviceType,
  value,
  onChange,
  variant = 'compact',
  airportCode,
}: VehicleSelectorProps) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null);

  const rootClass = `${styles.wrapper} ${variant === 'wide' ? styles.wide : ''}`;

  const handleSelect = (
    id: number,
    name: string,
    price: number,
    maxPassengers: number | null | undefined,
  ) => {
    const seats = maxPassengers ?? 3;
    const isNewSelection = value !== id;

    if (isNewSelection) {
      onChange(id, name, price, seats);
    }

    if (variant === 'wide' && isNewSelection) {
      scrollToBookingDetails();
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchVehicles()
      .then((data) => {
        if (cancelled) return;
        setVehicles(data);
        if (data.length === 0) setError(ru ? 'Автопарк пуст' : 'Fleet is empty');
      })
      .catch(() => {
        if (cancelled) return;
        setError(ru ? 'Не удалось загрузить автопарк' : 'Failed to load fleet');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [locale]);

  if (loading) {
    return (
      <div className={rootClass}>
        <p className={styles.loading}>{ru ? 'Загрузка автопарка...' : 'Loading fleet...'}</p>
      </div>
    );
  }

  if (error || vehicles.length === 0) {
    return (
      <div className={rootClass}>
        <p className={styles.error}>{error || (ru ? 'Автопарк пуст' : 'Fleet is empty')}</p>
      </div>
    );
  }

  return (
    <>
      <div className={rootClass}>
        <p className={styles.label}>
          {variant === 'wide'
            ? ru ? 'Выберите автомобиль' : 'Choose a vehicle'
            : ru ? 'Автомобиль' : 'Vehicle'}
        </p>
        <div className={styles.grid}>
          {vehicles.map((v) => {
            const price = getPrice(v, serviceType, airportCode);
            const isSelected = value === v.id;
            const coverPhoto = getVehiclePhotos(v)[0];
            return (
              <div
                key={v.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelect(v.id, `${v.brand} ${v.model}`, price ?? 0, v.passengers ?? 3)}
              >
                {isSelected && <span className={styles.selectedDot} />}

                {coverPhoto ? (
                  <img src={coverPhoto} alt={v.model} className={styles.photo} />
                ) : (
                  <div className={styles.photoPlaceholder}>🚗</div>
                )}

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{v.brand} {v.model}</h3>
                  <p className={styles.cardPrice}>{priceLabel(price, serviceType, locale)}</p>

                  <ul className={styles.specsList}>
                    <li>Пассажиры: {v.passengers ?? 3} чел.</li>
                    <li>Багаж: {v.luggage || '2 больших или 3 маленьких'}</li>
                    <li>Детское кресло или бустер: по запросу</li>
                    <li>Бутилированная вода: бесплатно</li>
                  </ul>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.aboutBtn}
                    onClick={(e) => { e.stopPropagation(); setModalVehicle(v); }}
                  >
                    {ru ? 'Подробнее' : 'Details'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSelect(v.id, `${v.brand} ${v.model}`, price ?? 0, v.passengers ?? 3); }}
                  >
                    {isSelected ? (ru ? 'Выбрано ✓' : 'Selected ✓') : (ru ? 'Забронировать' : 'Book')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalVehicle && (
        <VehicleModal
          vehicle={modalVehicle}
          serviceType={serviceType}
          airportCode={airportCode}
          onClose={() => setModalVehicle(null)}
          onSelect={(id, name, price) => {
            handleSelect(id, name, price, modalVehicle.passengers ?? 3);
            setModalVehicle(null);
          }}
        />
      )}
    </>
  );
}
