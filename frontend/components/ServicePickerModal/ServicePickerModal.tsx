'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { MapPin, Plane, Clock } from 'lucide-react';
import { buildBookingUrl, type BookingService } from '@/lib/booking-vehicle-prefill';
import type { Vehicle } from '@/lib/api/vehicles';
import styles from './ServicePickerModal.module.scss';

interface ServicePickerModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function ServicePickerModal({ vehicle, onClose }: ServicePickerModalProps) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const vehicleName = `${vehicle.brand} ${vehicle.model}`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const services: {
    id: BookingService;
    icon: typeof MapPin;
    title: string;
    description: string;
  }[] = [
    {
      id: 'intercity',
      icon: MapPin,
      title: ru ? 'Межгород' : 'Intercity',
      description: ru
        ? 'Поездки между городами на выбранном автомобиле'
        : 'Intercity trips in your chosen vehicle',
    },
    {
      id: 'airport',
      icon: Plane,
      title: ru ? 'Аэропорт' : 'Airport',
      description: ru
        ? 'Трансфер в аэропорт или встреча с табличкой'
        : 'Airport transfer or meet & greet',
    },
    {
      id: 'hourly',
      icon: Clock,
      title: ru ? 'Почасовая аренда' : 'Hourly rental',
      description: ru
        ? 'Автомобиль с водителем от 3 часов'
        : 'Car with driver from 3 hours',
    },
  ];

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <h2 className={styles.title}>{ru ? 'Выберите услугу' : 'Choose a service'}</h2>
        <p className={styles.subtitle}>
          {ru ? 'Забронировать ' : 'Book '}
          <span className={styles.vehicleName}>{vehicleName}</span>
          {ru ? ' для:' : ' for:'}
        </p>

        <div className={styles.list}>
          {services.map(({ id, icon: Icon, title, description }) => (
            <Link
              key={id}
              href={buildBookingUrl(locale, id, vehicle.id)}
              className={styles.option}
              onClick={onClose}
            >
              <span className={styles.iconWrap}>
                <Icon className={styles.icon} />
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{title}</span>
                <span className={styles.optionDesc}>{description}</span>
              </span>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
