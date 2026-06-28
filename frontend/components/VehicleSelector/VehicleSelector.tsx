'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { fetchVehicles, getVehiclePhotos, type Vehicle, type ServiceType } from '@/lib/api/vehicles';
import VehicleModal from '@/components/VehicleModal/VehicleModal';
import styles from './VehicleSelector.module.scss';

export type { Vehicle, ServiceType };

interface VehicleSelectorProps {
  serviceType: ServiceType;
  value: number | null;
  onChange: (vehicleId: number, vehicleName: string, price: number, maxPassengers: number) => void;
  variant?: 'compact' | 'wide';
}

function getPrice(v: Vehicle, type: ServiceType): number | null {
  if (type === 'intercity') {
    return v.pricePerKm != null ? Number(v.pricePerKm) : null;
  }
  const raw = type === 'airport' ? v.priceAirport : v.priceHourly;
  return raw != null ? Number(raw) : null;
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
}: VehicleSelectorProps) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null);

  const rootClass = `${styles.wrapper} ${variant === 'wide' ? styles.wide : ''}`;

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
            const price = getPrice(v, serviceType);
            const isSelected = value === v.id;
            const coverPhoto = getVehiclePhotos(v)[0];
            return (
              <div
                key={v.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => onChange(v.id, `${v.brand} ${v.model}`, price ?? 0, v.passengers ?? 3)}
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
                    onClick={(e) => { e.stopPropagation(); onChange(v.id, `${v.brand} ${v.model}`, price ?? 0, v.passengers); }}
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
          onClose={() => setModalVehicle(null)}
          onSelect={(id, name, price) => {
            onChange(id, name, price, modalVehicle.passengers);
            setModalVehicle(null);
          }}
        />
      )}
    </>
  );
}
