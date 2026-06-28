'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPinned, Route, ClipboardList } from 'lucide-react';
import {
  fetchDestinations,
  getFromCities,
  getDestinationsFrom,
  calcPrice,
  formatPrice,
  type InterCityDestination,
} from '@/lib/api/intercity';
import { fetchVehicles, getMinPricePerKm } from '@/lib/api/vehicles';
import { getVehicleIdFromSearch } from '@/lib/booking-vehicle-prefill';
import RouteBookingForm from '@/components/RouteBookingForm/RouteBookingForm';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import styles from './routes.module.scss';

export default function RoutesPage() {
  return (
    <Suspense fallback={null}>
      <RoutesPageContent />
    </Suspense>
  );
}

function RoutesPageContent() {
  const locale = useLocale();
  const ru = locale === 'ru';
  const formRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const initialVehicleId = getVehicleIdFromSearch(searchParams);

  const [destinations, setDestinations] = useState<InterCityDestination[]>([]);
  const [minPricePerKm, setMinPricePerKm] = useState(100);
  const [loading, setLoading] = useState(true);
  const [selectedFrom, setSelectedFrom] = useState<string>('Москва');

  const [prefilledData, setPrefilledData] = useState<{
    from: string;
    to: string;
  } | undefined>();

  useEffect(() => {
    Promise.all([
      fetchDestinations(),
      fetchVehicles().catch(() => []),
    ])
      .then(([destData, vehicles]) => {
        setDestinations(destData);
        setMinPricePerKm(getMinPricePerKm(vehicles));
        if (destData.length > 0) setSelectedFrom(destData[0].from);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!initialVehicleId) return;
    const timer = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(timer);
  }, [initialVehicleId]);

  const fromCities = getFromCities(destinations);
  const toDestinations = getDestinationsFrom(destinations, selectedFrom);

  const handleBook = (dest: InterCityDestination) => {
    setPrefilledData({ from: dest.from, to: dest.to });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className={styles.routesPage}>
      <div className={styles.container}>
        <SectionHeading
          as="h1"
          eyebrow={ru ? 'Межгород' : 'Intercity'}
          title={ru ? 'Поездки между городами с водителем' : 'Chauffeured intercity travel'}
          description={
            ru
              ? 'Фиксированные тарифы на популярные направления и индивидуальный расчёт под ваш маршрут'
              : 'Fixed rates on popular routes and a tailored quote for your itinerary'
          }
          icon={MapPinned}
          animate
        />

        {/* ─── Predefined destinations ─── */}
        <div className={styles.destinationsSection}>
          <SectionHeading
            as="h2"
            size="section"
            eyebrow={ru ? 'Направления' : 'Routes'}
            title={ru ? 'Популярные направления' : 'Popular destinations'}
            icon={Route}
            showDecor={false}
          />

          {/* From selector */}
          {fromCities.length > 1 && (
            <div className={styles.fromSelector}>
              <span className={styles.fromLabel}>{ru ? 'Из города:' : 'From:'}</span>
              <div className={styles.fromTabs}>
                {fromCities.map((city) => (
                  <button
                    key={city}
                    className={`${styles.fromTab} ${selectedFrom === city ? styles.fromTabActive : ''}`}
                    onClick={() => setSelectedFrom(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <p className={styles.loadingText}>{ru ? 'Загрузка...' : 'Loading...'}</p>
          ) : toDestinations.length === 0 ? (
            <p className={styles.emptyText}>{ru ? 'Направления не найдены' : 'No destinations found'}</p>
          ) : (
            <div className={styles.destinationGrid}>
              {toDestinations.map((dest) => (
                <motion.div
                  key={dest.id}
                  className={styles.destinationCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.destRoute}>
                    <span className={styles.destCity}>{dest.from}</span>
                    <span className={styles.destArrow}>→</span>
                    <span className={styles.destCity}>{dest.to}</span>
                  </div>
                  <div className={styles.destMeta}>
                    <span className={styles.destDistance}>{dest.distanceKm} км</span>
                    <span className={styles.destPrice}>
                      {ru ? 'от' : 'from'}{' '}
                      {formatPrice(calcPrice(dest.distanceKm, minPricePerKm))}
                    </span>
                  </div>
                  <p className={styles.destNote}>
                    {ru
                      ? 'Цена указана для самого доступного автомобиля'
                      : 'Price shown for the most affordable vehicle'}
                  </p>
                  <button className={styles.destBookBtn} onClick={() => handleBook(dest)}>
                    {ru ? 'Забронировать' : 'Book now'}
                  </button>
                </motion.div>
              ))}

              {/* ─── Custom city card ─── */}
              <motion.div
                className={`${styles.destinationCard} ${styles.destinationCardCustom}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <div className={styles.customCardIcon}>✦</div>
                <div className={styles.destRoute}>
                  <span className={styles.destCity}>{selectedFrom}</span>
                  <span className={styles.destArrow}>→</span>
                  <span className={`${styles.destCity} ${styles.destCityCustom}`}>
                    {ru ? 'Другой город' : 'Custom city'}
                  </span>
                </div>
                <p className={styles.destNote} style={{ marginTop: 8 }}>
                  {ru
                    ? 'Введите любой город — рассчитаем стоимость автоматически. Маршруты до 300 км.'
                    : 'Enter any city — we\'ll calculate the price automatically. Routes up to 300 km.'}
                </p>
                <button
                  className={`${styles.destBookBtn} ${styles.destBookBtnCustom}`}
                  onClick={() => {
                    setPrefilledData({ from: selectedFrom, to: '' });
                    setTimeout(() => {
                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                >
                  {ru ? 'Указать город' : 'Enter city'}
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* ─── Booking form ─── */}
        <div id="booking-form" ref={formRef} className={styles.bookingSection}>
          <SectionHeading
            as="h2"
            size="section"
            eyebrow={ru ? 'Бронирование' : 'Booking'}
            title={ru ? 'Оформить поездку' : 'Book a trip'}
            icon={ClipboardList}
            showDecor={false}
          />
          <p className={styles.bookingNote}>
            {ru
              ? 'Выберите один из популярных маршрутов выше или введите любой город назначения — рассчитаем стоимость автоматически (маршруты до 300 км).'
              : 'Choose a popular route above or type any destination city — we\'ll calculate the price automatically (routes up to 300 km).'}
          </p>
          <RouteBookingForm prefilledData={prefilledData} initialVehicleId={initialVehicleId} />
        </div>
      </div>
    </div>
  );
}
