'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getVehiclePhotos, type Vehicle, type ServiceType } from '@/lib/api/vehicles';
import { getAirportPrice } from '@/lib/airport-pricing';
import VehicleCarousel from '@/components/VehicleCarousel/VehicleCarousel';
import styles from './VehicleModal.module.scss';

interface VehicleModalProps {
  vehicle: Vehicle;
  serviceType?: ServiceType;
  airportCode?: string;
  onClose: () => void;
  onSelect?: (id: number, name: string, price: number) => void;
  onOrder?: () => void;
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

function fmt(n: number | null): string {
  if (!n) return '—';
  return n.toLocaleString('ru-RU');
}

export default function VehicleModal({
  vehicle,
  serviceType,
  airportCode,
  onClose,
  onSelect,
  onOrder,
}: VehicleModalProps) {
  const locale = useLocale();
  const ru = locale === 'ru';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    };

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const priceAirport = getAirportPrice(vehicle.priceAirport, airportCode);
  const pricePerKm = vehicle.pricePerKm ? Number(vehicle.pricePerKm) : null;
  const priceHourly = vehicle.priceHourly ? Number(vehicle.priceHourly) : null;
  const currentPrice = serviceType ? getPrice(vehicle, serviceType, airportCode) : null;

  const handleSelect = () => {
    if (!onSelect) return;
    onSelect(vehicle.id, `${vehicle.brand} ${vehicle.model}`, currentPrice ?? 0);
    onClose();
  };

  const suffix = serviceType
    ? serviceType === 'hourly'
      ? (ru ? '₽/ч' : '₽/h')
      : serviceType === 'intercity'
        ? (ru ? '₽/км' : '₽/km')
        : '₽'
    : '';

  const photos = getVehiclePhotos(vehicle);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">✕</button>

        <div className={styles.layout}>
          {/* ── Left: carousel ── */}
          <div className={styles.photoCol}>
            <VehicleCarousel photos={photos} alt={`${vehicle.brand} ${vehicle.model}`} />
          </div>

          {/* ── Right: content + footer ── */}
          <div className={styles.infoCol}>
            <div className={styles.contentCol}>
              {vehicle.category && (
                <p className={styles.category}>{vehicle.category}</p>
              )}

              <h2 className={styles.title}>{vehicle.brand} {vehicle.model}</h2>

              {currentPrice && (
                <div className={styles.priceBlock}>
                  <span className={styles.mainPrice}>
                    от {fmt(currentPrice)}
                    <span className={styles.priceSuffix}> {suffix}</span>
                  </span>
                </div>
              )}

              {vehicle.description && (
                <div className={styles.descriptionBlock}>
                  <p className={styles.descriptionTitle}>
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className={styles.descriptionText}>{vehicle.description}</p>
                </div>
              )}

              <div className={styles.specsBlock}>
                <p className={styles.specsTitle}>{ru ? 'Дополнительно' : 'Additional'}</p>
                <ul className={styles.specsList}>
                  <li>
                    {ru
                      ? `Пассажиры: ${vehicle.passengers ?? 3} чел.`
                      : `Passengers: ${vehicle.passengers ?? 3}`}
                  </li>
                  <li>
                    {ru
                      ? `Багаж: ${vehicle.luggage || '2 больших или 3 маленьких'}`
                      : `Luggage: ${vehicle.luggage || '2 large or 3 small'}`}
                  </li>
                  <li>
                    {ru
                      ? 'Детское автокресло или бустер: по запросу'
                      : 'Child seat or booster: on request'}
                  </li>
                  <li>
                    {ru ? 'Бутилированная вода: бесплатно' : 'Bottled water: complimentary'}
                  </li>
                </ul>
              </div>

              <div className={styles.pricesGrid}>
                {priceAirport && (
                  <div className={styles.priceGridItem}>
                    <span className={styles.priceGridLabel}>{ru ? 'Аэропорт' : 'Airport'}</span>
                    <span className={styles.priceGridValue}>
                      {fmt(priceAirport)}
                      <span className={styles.priceGridSuffix}> ₽</span>
                    </span>
                  </div>
                )}
                {pricePerKm && (
                  <div className={styles.priceGridItem}>
                    <span className={styles.priceGridLabel}>{ru ? 'Межгород' : 'Intercity'}</span>
                    <span className={styles.priceGridValue}>
                      {fmt(pricePerKm)}
                      <span className={styles.priceGridSuffix}> {ru ? '₽/км' : '₽/km'}</span>
                    </span>
                  </div>
                )}
                {priceHourly && (
                  <div className={styles.priceGridItem}>
                    <span className={styles.priceGridLabel}>{ru ? 'Почасовая' : 'Hourly'}</span>
                    <span className={styles.priceGridValue}>
                      {fmt(priceHourly)}
                      <span className={styles.priceGridSuffix}> {ru ? '₽/ч' : '₽/h'}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              {onSelect && (
                <button className={styles.selectBtn} onClick={handleSelect}>
                  {ru ? 'Выбрать этот автомобиль' : 'Select this vehicle'}
                </button>
              )}
              {!onSelect && onOrder && (
                <button type="button" className={styles.selectBtn} onClick={onOrder}>
                  {ru ? 'Заказать' : 'Book now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
