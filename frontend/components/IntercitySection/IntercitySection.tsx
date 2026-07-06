'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPinned, Route, Shield, Car, AlertTriangle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import {
  fetchDestinations,
  getFromCities,
  getDestinationsFrom,
  calcPrice,
  formatPrice,
  MAX_CUSTOM_DISTANCE_KM,
  type InterCityDestination,
} from '@/lib/api/intercity';
import { fetchVehicles, getMinPricePerKm } from '@/lib/api/vehicles';
import styles from './IntercitySection.module.scss';

function bookingUrl(locale: string, params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams({ type: 'route' });
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  return `/${locale}/booking?${qs}`;
}

export default function IntercitySection() {
  const locale = useLocale();
  const ru = locale === 'ru';

  const [destinations, setDestinations] = useState<InterCityDestination[]>([]);
  const [minPricePerKm, setMinPricePerKm] = useState(100);
  const [loading, setLoading] = useState(true);
  const [selectedFrom, setSelectedFrom] = useState('Москва');

  useEffect(() => {
    Promise.all([fetchDestinations(), fetchVehicles().catch(() => [])])
      .then(([destData, vehicles]) => {
        setDestinations(destData);
        setMinPricePerKm(getMinPricePerKm(vehicles));
        if (destData.length > 0) setSelectedFrom(destData[0].from);
      })
      .finally(() => setLoading(false));
  }, []);

  const fromCities = getFromCities(destinations);
  const toDestinations = getDestinationsFrom(destinations, selectedFrom);

  return (
    <section id="routes" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          as="h2"
          eyebrow={ru ? 'Межгород' : 'Intercity'}
          title={ru ? 'Поездки между городами с водителем' : 'Chauffeured intercity travel'}
          description={
            ru
              ? 'Фиксированные тарифы на популярные направления и индивидуальный расчёт под ваш маршрут — без сюрпризов и скрытых доплат'
              : 'Fixed rates on popular routes and a tailored quote for your itinerary — no surprises or hidden fees'
          }
          icon={MapPinned}
          animate
        />

        <div className={styles.features}>
          {[
            {
              icon: Route,
              title: ru ? 'Любое направление' : 'Any destination',
              text: ru
                ? `Москва — Санкт-Петербург, Нижний Новгород, Ярославль и сотни других городов. Маршруты до ${MAX_CUSTOM_DISTANCE_KM} км.`
                : `Moscow to St Petersburg, Nizhny Novgorod, Yaroslavl and hundreds more. Routes up to ${MAX_CUSTOM_DISTANCE_KM} km.`,
            },
            {
              icon: Shield,
              title: ru ? 'Фиксированный тариф' : 'Fixed rate',
              text: ru
                ? 'Стоимость рассчитывается при бронировании и не меняется в пути — вы знаете цену заранее'
                : 'Price is calculated at booking and does not change en route — you know the cost upfront',
            },
            {
              icon: Car,
              title: ru ? 'Премиальный комфорт' : 'Premium comfort',
              text: ru
                ? 'Mercedes E/S-Class, Maybach и другие автомобили бизнес-класса с профессиональным водителем'
                : 'Mercedes E/S-Class, Maybach and other business-class vehicles with a professional chauffeur',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.feature}>
              <Icon className={styles.featureIcon} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className={styles.destinationsBlock}>
          <SectionHeading
            as="h3"
            size="section"
            eyebrow={ru ? 'Направления' : 'Routes'}
            title={ru ? 'Популярные маршруты' : 'Popular destinations'}
            icon={Route}
            showDecor={false}
          />

          {fromCities.length > 1 && (
            <div className={styles.fromSelector}>
              <span className={styles.fromLabel}>{ru ? 'Из города:' : 'From:'}</span>
              <div className={styles.fromTabs}>
                {fromCities.map((city) => (
                  <button
                    key={city}
                    type="button"
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
          ) : (
            <div className={styles.destinationGrid}>
              {toDestinations.map((dest) => (
                <motion.div
                  key={dest.id}
                  className={styles.destinationCard}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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
                      {ru ? 'от' : 'from'} {formatPrice(calcPrice(dest.distanceKm, minPricePerKm))}
                    </span>
                  </div>
                  <p className={styles.destNote}>
                    {ru ? 'Цена для самого доступного автомобиля' : 'Price for the most affordable vehicle'}
                  </p>
                  <Link href={bookingUrl(locale, { from: dest.from, to: dest.to })} className={styles.bookBtn}>
                    {ru ? 'Забронировать' : 'Book now'}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className={`${styles.destinationCard} ${styles.destinationCardCustom}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.customCardIcon}>✦</div>
                <div className={styles.destRoute}>
                  <span className={styles.destCity}>{selectedFrom}</span>
                  <span className={styles.destArrow}>→</span>
                  <span className={`${styles.destCity} ${styles.destCityCustom}`}>
                    {ru ? 'Другой город' : 'Custom city'}
                  </span>
                </div>
                <p className={styles.destNote}>
                  {ru
                    ? `Введите любой город — рассчитаем стоимость автоматически (до ${MAX_CUSTOM_DISTANCE_KM} км)`
                    : `Enter any city — we'll calculate automatically (up to ${MAX_CUSTOM_DISTANCE_KM} km)`}
                </p>
                <Link
                  href={bookingUrl(locale, { from: selectedFrom })}
                  className={`${styles.bookBtn} ${styles.bookBtnCustom}`}
                >
                  {ru ? 'Указать город' : 'Enter city'}
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <div className={styles.seoBlock}>
          <h3 className={styles.seoTitle}>
            {ru ? 'Межгородский трансфер из Москвы на Mercedes с водителем' : 'Intercity chauffeur service from Moscow'}
          </h3>
          <p className={styles.seoLead}>
            {ru
              ? 'NOIR RIDE — премиальный межгородской трансфер для деловых поездок, отпуска и особых случаев. Вы выбираете автомобиль и маршрут, мы берём на себя всё остальное: пунктуальная подача, комфорт в пути, бутилированная вода и помощь с багажом.'
              : 'NOIR RIDE offers premium intercity chauffeur service for business trips, holidays and special occasions. Choose your vehicle and route — we handle punctual pickup, in-trip comfort, bottled water and luggage assistance.'}
          </p>
          <p className={styles.seoText}>
            {ru
              ? 'Поездка в Санкт-Петербург, Нижний Новгород, Ярославль, Тверь или любой другой город — в одном стиле: тихий салон, опытный водитель, без спешки и компромиссов. Для корпоративных клиентов доступны регулярные маршруты и единый счёт. Стоимость фиксируется при бронировании — менеджер подтверждает детали в течение 30 минут.'
              : 'Trips to St Petersburg, Nizhny Novgorod, Yaroslavl, Tver or any other city — same standard: quiet cabin, experienced driver, no rush or compromise. Corporate clients get regular routes and consolidated billing. Price is locked at booking — our manager confirms details within 30 minutes.'}
          </p>
        </div>

        <div className={styles.notice}>
          <AlertTriangle className={styles.noticeIcon} aria-hidden />
          <p>
            {ru
              ? 'По маршруту возможны платные участки (М-11, М-4, ЦКАД и др.). Стоимость проезда по ним не включена в расчёт и оплачивается отдельно. Итоговая цена подтверждается менеджером после оформления заявки.'
              : 'Routes may include toll roads (M-11, M-4, CKAD, etc.). Toll fees are not included in the estimate and are paid separately. Final price is confirmed by our manager after booking.'}
          </p>
        </div>

        <div className={styles.ctaRow}>
          <Link href={bookingUrl(locale)} className={styles.ctaBtn}>
            {ru ? 'Оформить поездку' : 'Book a trip'}
          </Link>
        </div>
      </div>
    </section>
  );
}
