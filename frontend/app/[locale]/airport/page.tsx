'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import AirportBookingForm from '@/components/AirportBookingForm/AirportBookingForm';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import { getVehicleIdFromSearch } from '@/lib/booking-vehicle-prefill';
import { Plane, UserCheck, Tag, Building2, CalendarCheck } from 'lucide-react';
import styles from './airport.module.scss';

export default function AirportPage() {
  return (
    <Suspense fallback={null}>
      <AirportPageContent />
    </Suspense>
  );
}

const AIRPORTS = [
  { code: 'SVO', name: 'Sheremetyevo', nameRu: 'Шереметьево' },
  { code: 'DME', name: 'Domodedovo', nameRu: 'Домодедово' },
  { code: 'VKO', name: 'Vnukovo', nameRu: 'Внуково' },
] as const;

function AirportPageContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialVehicleId = getVehicleIdFromSearch(searchParams);
  const bookingRef = useRef<HTMLDivElement>(null);
  const [selectedAirport, setSelectedAirport] = useState('SVO');

  useEffect(() => {
    if (!initialVehicleId) return;
    const timer = setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(timer);
  }, [initialVehicleId]);

  const selectedAirportInfo = AIRPORTS.find((a) => a.code === selectedAirport);
  const ru = locale === 'ru';

  return (
    <div className={styles.airportPage}>
      <div className={styles.container}>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow={ru ? 'Аэропорт' : 'Airport'}
          title={ru ? 'Трансферы в аэропорт' : 'Airport transfers'}
          description={
            ru
              ? 'Комфортные трансферы в аэропорты Москвы. Отслеживание рейса, встреча с табличкой, помощь с багажом.'
              : 'Comfortable transfers to Moscow airports. Flight tracking, meet & greet service, luggage assistance.'
          }
          icon={Plane}
          animate
        />

        <div className={styles.features}>
          <div className={styles.feature}>
            <Plane className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Отслеживание рейса' : 'Flight tracking'}</h3>
            <p>{locale === 'ru' ? 'Следим за изменениями и задержками' : 'We monitor changes and delays'}</p>
          </div>
          <div className={styles.feature}>
            <UserCheck className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Встреча в зале прилёта' : 'Meet & greet'}</h3>
            <p>{locale === 'ru' ? 'С именной табличкой и помощью с багажом' : 'With name sign and luggage assistance'}</p>
          </div>
          <div className={styles.feature}>
            <Tag className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Фиксированная цена' : 'Fixed price'}</h3>
            <p>{locale === 'ru' ? 'Без учёта времени в пробках' : 'Not affected by traffic'}</p>
          </div>
        </div>

        <div className={styles.pricingSection}>
          <SectionHeading
            as="h2"
            size="section"
            align="center"
            eyebrow={ru ? 'Выбор' : 'Select'}
            title={ru ? 'Выберите аэропорт' : 'Select airport'}
            description={
              ru
                ? 'Автомобиль и оформление заказа — в форме бронирования ниже'
                : 'Choose your vehicle and complete the booking form below'
            }
            icon={Building2}
            showDecor={false}
          />
          <div className={styles.airportGrid}>
            {AIRPORTS.map((airport) => (
              <button
                key={airport.code}
                type="button"
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

        <div id="booking-form" ref={bookingRef} className={styles.bookingSection}>
          <SectionHeading
            as="h2"
            size="section"
            align="center"
            eyebrow={ru ? 'Бронирование' : 'Booking'}
            title={ru ? 'Забронировать трансфер' : 'Book transfer'}
            icon={CalendarCheck}
            showDecor={false}
          />
          {selectedAirportInfo && (
            <p className={styles.selectedAirportHint}>
              {locale === 'ru' ? 'Аэропорт: ' : 'Airport: '}
              <strong>
                {locale === 'ru' ? selectedAirportInfo.nameRu : selectedAirportInfo.name}
                {' '}({selectedAirportInfo.code})
              </strong>
            </p>
          )}
          <AirportBookingForm
            initialVehicleId={initialVehicleId}
            selectedAirport={selectedAirport}
          />
        </div>
      </div>
    </div>
  );
}
