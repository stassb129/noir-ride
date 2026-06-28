'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import HourlyBookingForm from '@/components/HourlyBookingForm/HourlyBookingForm';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import { getVehicleIdFromSearch } from '@/lib/booking-vehicle-prefill';
import { MapPin, Clock, BriefcaseBusiness, CalendarCheck } from 'lucide-react';
import styles from './hourly.module.scss';

export default function HourlyPage() {
  return (
    <Suspense fallback={null}>
      <HourlyPageContent />
    </Suspense>
  );
}

function HourlyPageContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialVehicleId = getVehicleIdFromSearch(searchParams);
  const bookingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialVehicleId) return;
    const timer = setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(timer);
  }, [initialVehicleId]);

  const ru = locale === 'ru';

  return (
    <div className={styles.hourlyPage}>
      <div className={styles.container}>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow={ru ? 'Почасовая' : 'Hourly'}
          title={ru ? 'Аренда автомобиля с водителем' : 'Chauffeured car rental'}
          description={
            ru
              ? 'Возьмите автомобиль с водителем на несколько часов для деловых встреч, поездок по городу или личных дел. Минимум — 3 часа.'
              : 'Rent a car with a driver for business meetings, city trips or personal errands. Minimum — 3 hours.'
          }
          icon={Clock}
          animate
        />

        <div className={styles.features}>
          <div className={styles.feature}>
            <MapPin className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Гибкие маршруты' : 'Flexible routes'}</h3>
            <p>{locale === 'ru' ? 'Планируйте маршрут по своему усмотрению' : 'Plan your route as you wish'}</p>
          </div>
          <div className={styles.feature}>
            <Clock className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Без ожидания' : 'No waiting'}</h3>
            <p>{locale === 'ru' ? 'Водитель ждёт вас в течение всей аренды' : 'Driver waits for you during entire rental'}</p>
          </div>
          <div className={styles.feature}>
            <BriefcaseBusiness className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Оптимальный выбор' : 'Best choice'}</h3>
            <p>{locale === 'ru' ? 'Для деловых встреч и многочисленных остановок' : 'For business meetings and multiple stops'}</p>
          </div>
        </div>

        <div ref={bookingRef} className={styles.bookingSection}>
          <SectionHeading
            as="h2"
            size="section"
            align="center"
            eyebrow={ru ? 'Бронирование' : 'Booking'}
            title={ru ? 'Забронировать аренду' : 'Book rental'}
            icon={CalendarCheck}
            showDecor={false}
          />
          <HourlyBookingForm initialVehicleId={initialVehicleId} />
        </div>
      </div>
    </div>
  );
}