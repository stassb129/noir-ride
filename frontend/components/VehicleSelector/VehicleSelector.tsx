'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchVehicles, getVehiclePhotos, type Vehicle, type ServiceType } from '@/lib/api/vehicles';
import { getAirportPrice } from '@/lib/airport-pricing';
import VehicleCarousel from '@/components/VehicleCarousel/VehicleCarousel';
import styles from './VehicleSelector.module.scss';

export type { Vehicle, ServiceType };

const DRAG_THRESHOLD = 8;

interface VehicleSelectorProps {
  serviceType: ServiceType;
  value: number | null;
  onChange: (vehicleId: number, vehicleName: string, price: number, maxPassengers: number) => void;
  variant?: 'compact' | 'wide';
  airportCode?: string;
  hideLabel?: boolean;
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

function priceLabel(price: number | null, type: ServiceType): string {
  if (!price) return '—';
  if (type === 'hourly') return `от ${price.toLocaleString('ru-RU')} ₽/ч`;
  if (type === 'intercity') return `от ${price.toLocaleString('ru-RU')} ₽/км`;
  return `от ${price.toLocaleString('ru-RU')} ₽`;
}

function priceSuffix(type: ServiceType, ru: boolean): string {
  if (type === 'hourly') return ru ? '₽/ч' : '₽/h';
  if (type === 'intercity') return ru ? '₽/км' : '₽/km';
  return '₽';
}

function VehicleDetailsPanel({
  vehicle,
  serviceType,
  airportCode,
  ru,
}: {
  vehicle: Vehicle;
  serviceType: ServiceType;
  airportCode?: string;
  ru: boolean;
}) {
  const photos = getVehiclePhotos(vehicle);
  const currentPrice = getPrice(vehicle, serviceType, airportCode);

  const specs = [
    ru
      ? `Пассажиры: ${vehicle.passengers ?? 3} чел.`
      : `Passengers: ${vehicle.passengers ?? 3}`,
    ru
      ? `Багаж: ${vehicle.luggage || '2 больших или 3 маленьких'}`
      : `Luggage: ${vehicle.luggage || '2 large or 3 small'}`,
    ru ? 'Детское кресло или бустер: по запросу' : 'Child seat or booster: on request',
    ru ? 'Бутилированная вода: бесплатно' : 'Bottled water: complimentary',
  ];

  return (
    <motion.div
      className={styles.detailsPanel}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const }}
    >
      <div className={styles.detailsInner}>
        <div className={styles.detailsGallery}>
          <VehicleCarousel photos={photos} alt={`${vehicle.brand} ${vehicle.model}`} />
        </div>
        <div className={styles.detailsContent}>
          {vehicle.category && (
            <p className={styles.detailsCategory}>{vehicle.category}</p>
          )}
          <h3 className={styles.detailsTitle}>
            {vehicle.brand} {vehicle.model}
          </h3>
          {currentPrice != null && (
            <p className={styles.detailsPrice}>
              {ru ? 'от' : 'from'}{' '}
              {currentPrice.toLocaleString('ru-RU')}
              <span className={styles.detailsPriceSuffix}>
                {' '}{priceSuffix(serviceType, ru)}
              </span>
            </p>
          )}
          {vehicle.description && (
            <p className={styles.detailsDescription}>{vehicle.description}</p>
          )}
          <ul className={styles.detailsSpecs}>
            {specs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function VehicleSelector({
  serviceType,
  value,
  onChange,
  variant = 'compact',
  airportCode,
  hideLabel = false,
}: VehicleSelectorProps) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const inertiaRef = useRef<number | null>(null);
  const dragRef = useRef({
    active: false,
    dragging: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    suppressClick: false,
  });

  const cancelInertia = useCallback(() => {
    if (inertiaRef.current != null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const rootClass = `${styles.wrapper} ${variant === 'wide' ? styles.wide : ''}`;
  const isCarousel = variant === 'wide';

  const handleSelect = useCallback((
    vehicle: Vehicle,
  ) => {
    const price = getPrice(vehicle, serviceType, airportCode) ?? 0;
    onChange(
      vehicle.id,
      `${vehicle.brand} ${vehicle.model}`,
      price,
      vehicle.passengers ?? 3,
    );
  }, [onChange, serviceType, airportCode]);

  const scrollCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    cancelInertia();
    const card = track.querySelector<HTMLElement>(`.${styles.carouselCard}`);
    const step = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const startInertia = useCallback(() => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track) return;

    let velocity = drag.velocity * 16;
    const friction = 0.93;
    const minVelocity = 0.3;

    const tick = () => {
      if (Math.abs(velocity) < minVelocity) {
        inertiaRef.current = null;
        setIsDragging(false);
        drag.suppressClick = false;
        return;
      }
      track.scrollLeft -= velocity;
      velocity *= friction;
      inertiaRef.current = requestAnimationFrame(tick);
    };

    inertiaRef.current = requestAnimationFrame(tick);
  }, []);

  const releasePointer = (track: HTMLDivElement, pointerId: number) => {
    if (pointerId >= 0 && track.hasPointerCapture(pointerId)) {
      track.releasePointerCapture(pointerId);
    }
  };

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || e.button !== 0) return;

    cancelInertia();
    const drag = dragRef.current;
    drag.active = true;
    drag.dragging = false;
    drag.suppressClick = false;
    drag.pointerId = e.pointerId;
    drag.startX = e.clientX;
    drag.scrollLeft = track.scrollLeft;
    drag.lastX = e.clientX;
    drag.lastTime = performance.now();
    drag.velocity = 0;
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    const dx = e.clientX - drag.startX;

    if (!drag.dragging) {
      if (Math.abs(dx) <= DRAG_THRESHOLD) return;
      drag.dragging = true;
      drag.suppressClick = true;
      setIsDragging(true);
      track.setPointerCapture(e.pointerId);
    }

    e.preventDefault();
    const now = performance.now();
    const dt = now - drag.lastTime;
    if (dt > 0) {
      const instant = (e.clientX - drag.lastX) / dt;
      drag.velocity = drag.velocity * 0.35 + instant * 0.65;
    }
    drag.lastX = e.clientX;
    drag.lastTime = now;
    track.scrollLeft = drag.scrollLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    const wasDragging = drag.dragging;
    drag.active = false;
    drag.dragging = false;
    releasePointer(track, drag.pointerId);
    drag.pointerId = -1;

    if (wasDragging) {
      drag.suppressClick = true;
      setIsDragging(true);
      startInertia();
      window.setTimeout(() => {
        drag.suppressClick = false;
      }, 100);
      return;
    }

    setIsDragging(false);
  };

  const onCardClick = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation();
    if (dragRef.current.suppressClick) return;
    handleSelect(vehicle);
  };

  useEffect(() => () => cancelInertia(), [cancelInertia]);

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
  }, [ru]);

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

  const selectedVehicle = value ? vehicles.find((v) => v.id === value) ?? null : null;

  const renderCarousel = () => (
    <>
      <div className={styles.carouselOuter}>
        <button
          type="button"
          className={`${styles.carouselNav} ${styles.carouselNavPrev}`}
          onClick={() => scrollCarousel(-1)}
          aria-label={ru ? 'Назад' : 'Previous'}
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className={`${styles.carouselTrack} ${isDragging ? styles.carouselDragging : ''}`}
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {vehicles.map((v) => {
            const price = getPrice(v, serviceType, airportCode);
            const isSelected = value === v.id;
            const coverPhoto = getVehiclePhotos(v)[0];
            return (
              <button
                key={v.id}
                type="button"
                data-vehicle-id={v.id}
                className={`${styles.carouselCard} ${isSelected ? styles.carouselCardSelected : ''}`}
                onClick={(e) => onCardClick(e, v)}
              >
                {isSelected && <span className={styles.selectedBadge}>✓</span>}
                <div className={styles.carouselPhotoWrap}>
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt={`${v.brand} ${v.model}`}
                      className={styles.carouselPhoto}
                      draggable={false}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>🚗</div>
                  )}
                </div>
                <div className={styles.carouselCardBody}>
                  <h3 className={styles.cardTitle}>{v.brand} {v.model}</h3>
                  <p className={styles.cardPrice}>{priceLabel(price, serviceType)}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.carouselNav} ${styles.carouselNavNext}`}
          onClick={() => scrollCarousel(1)}
          aria-label={ru ? 'Вперёд' : 'Next'}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedVehicle && (
          <VehicleDetailsPanel
            key={selectedVehicle.id}
            vehicle={selectedVehicle}
            serviceType={serviceType}
            airportCode={airportCode}
            ru={ru}
          />
        )}
      </AnimatePresence>
    </>
  );

  const renderGrid = () => (
    <div className={styles.grid}>
      {vehicles.map((v) => {
        const price = getPrice(v, serviceType, airportCode);
        const isSelected = value === v.id;
        const coverPhoto = getVehiclePhotos(v)[0];
        return (
          <button
            key={v.id}
            type="button"
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={() => handleSelect(v)}
          >
            {isSelected && <span className={styles.selectedDot} />}
            {coverPhoto ? (
              <img src={coverPhoto} alt={v.model} className={styles.photo} draggable={false} />
            ) : (
              <div className={styles.photoPlaceholder}>🚗</div>
            )}
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{v.brand} {v.model}</h3>
              <p className={styles.cardPrice}>{priceLabel(price, serviceType)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={rootClass}>
      {!hideLabel && (
        <p className={styles.label}>
          {variant === 'wide'
            ? (ru ? 'Выберите автомобиль' : 'Choose a vehicle')
            : (ru ? 'Автомобиль' : 'Vehicle')}
        </p>
      )}

      {isCarousel ? renderCarousel() : renderGrid()}
    </div>
  );
}
