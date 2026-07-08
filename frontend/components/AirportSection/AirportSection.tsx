'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Plane, UserCheck, Tag, Clock, Building2 } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import styles from './AirportSection.module.scss';

const AIRPORTS = [
  { code: 'SVO', name: 'Sheremetyevo', nameRu: 'Шереметьево' },
  { code: 'DME', name: 'Domodedovo', nameRu: 'Домодедово' },
  { code: 'VKO', name: 'Vnukovo', nameRu: 'Внуково' },
] as const;

export default function AirportSection() {
  const locale = useLocale();
  const ru = locale === 'ru';

  return (
    <section id="airport" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          as="h2"
          eyebrow={ru ? 'Аэропорт' : 'Airport'}
          title={ru ? 'Трансферы в аэропорт' : 'Airport transfers'}
          description={
            ru
              ? 'Комфортные трансферы в аэропорты Москвы: отслеживание рейса, встреча с табличкой, помощь с багажом и 1 час бесплатного ожидания после прилёта'
              : 'Comfortable Moscow airport transfers: flight tracking, meet & greet, luggage assistance and 1 hour of free waiting after landing'
          }
          icon={Plane}
          animate
        />

        <div className={styles.features}>
          <div className={styles.feature}>
            <Plane className={styles.featureIcon} />
            <h3>{ru ? 'Отслеживание рейса' : 'Flight tracking'}</h3>
            <p>{ru ? 'Следим за изменениями и задержками — подаём машину к фактическому времени прилёта' : 'We monitor changes and delays — car arrives at actual landing time'}</p>
          </div>
          <div className={styles.feature}>
            <UserCheck className={styles.featureIcon} />
            <h3>{ru ? 'Встреча в зале прилёта' : 'Meet & greet'}</h3>
            <p>{ru ? 'С именной табличкой и помощью с багажом — водитель встретит у выхода' : 'With name sign and luggage help — your driver meets you at arrivals'}</p>
          </div>
          <div className={styles.feature}>
            <Clock className={styles.featureIcon} />
            <h3>{ru ? '1 час ожидания бесплатно' : '1 hour free waiting'}</h3>
            <p>{ru ? 'После прибытия рейса — без доплат за первый час ожидания водителя' : 'After landing — no extra charge for the first hour of waiting'}</p>
          </div>
          <div className={styles.feature}>
            <Tag className={styles.featureIcon} />
            <h3>{ru ? 'Фиксированная цена' : 'Fixed price'}</h3>
            <p>{ru ? 'Стоимость не зависит от пробок и времени в пути — вы знаете сумму заранее' : 'Price is not affected by traffic or travel time — you know the cost upfront'}</p>
          </div>
        </div>

        <p className={styles.seoNote}>
          {ru
            ? 'При заказе встречи из аэропорта мы отслеживаем ваш рейс и подаём автомобиль к фактическому времени прилёта. Первый час ожидания после посадки самолёта включён в стоимость — удобно, если вы проходите паспортный контроль, получаете багаж или задерживаетесь в терминале.'
            : 'For airport pickups we track your flight and dispatch the car to your actual arrival time. The first hour of waiting after landing is included — ideal for passport control, baggage claim or a stop in the terminal.'}
        </p>

        <div className={styles.seoBlock}>
          <div className={styles.seoImageWrap}>
            <Image
              src="/main-page-photo/airport-meet.png"
              alt={ru ? 'Водитель встречает пассажира в аэропорту' : 'Chauffeur meeting a passenger at the airport'}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className={styles.seoImage}
            />
          </div>
          <div className={styles.seoText}>
            <h3 className={styles.seoTitle}>
              {ru ? 'Трансфер в аэропорт Шереметьево, Домодедово и Внуково' : 'Transfer to Sheremetyevo, Domodedovo and Vnukovo'}
            </h3>
            <p>
              {ru
                ? 'Закажите трансфер в аэропорт на Mercedes с водителем — вылетите без стресса, а встреча из аэропорта пройдёт так же комфортно. Мы работаем со всеми терминалами SVO, DME и VKO. Укажите номер рейса — водитель будет в курсе задержек. Для встречи с табличкой напишите имя или текст, который должен быть написан. Багаж, детское кресло и платные дороги — по запросу, всё согласуем заранее.'
                : 'Book a Mercedes airport transfer — depart stress-free, and arrivals are just as comfortable. We serve all SVO, DME and VKO terminals. Provide your flight number — your driver tracks delays. For meet & greet, specify the name or text on the sign. Luggage, child seats and toll roads on request — we agree everything in advance.'}
            </p>
          </div>
        </div>

        <SectionHeading
          as="h3"
          size="section"
          eyebrow={ru ? 'Аэропорты' : 'Airports'}
          title={ru ? 'Все аэропорты Москвы' : 'All Moscow airports'}
          icon={Building2}
          showDecor={false}
        />

        <div className={styles.airportGrid}>
          {AIRPORTS.map((airport) => (
            <Link
              key={airport.code}
              href={`/${locale}/booking?type=airport&airport=${airport.code}`}
              className={styles.airportCard}
            >
              <div className={styles.airportCode}>{airport.code}</div>
              <div className={styles.airportName}>
                {ru ? airport.nameRu : airport.name}
              </div>
              <span className={styles.airportCta}>
                {ru ? 'Забронировать →' : 'Book →'}
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link href={`/${locale}/booking?type=airport`} className={styles.ctaBtn}>
            {ru ? 'Заказать трансфер' : 'Book transfer'}
          </Link>
        </div>
      </div>
    </section>
  );
}
