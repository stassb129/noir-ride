'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import HourlyBookingForm from '@/components/HourlyBookingForm/HourlyBookingForm';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import { getVehicleIdFromSearch } from '@/lib/booking-vehicle-prefill';
import { MapPin, Clock, BriefcaseBusiness, CalendarCheck, Heart, Cake, Sparkles } from 'lucide-react';
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
          eyebrow={ru ? 'Почасовая' : 'Hourly'}
          title={ru ? 'Аренда автомобиля с водителем' : 'Chauffeured car rental'}
          description={
            ru
              ? 'Премиальный автомобиль с профессиональным водителем на 3 часа и более — для деловых поездок, торжеств и особых случаев в Москве и области.'
              : 'Premium car with a professional chauffeur for 3+ hours — business trips, celebrations and special occasions in Moscow and the region.'
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
            <h3>{locale === 'ru' ? 'Водитель с вами' : 'Driver stays with you'}</h3>
            <p>{locale === 'ru' ? 'Автомобиль и водитель в вашем распоряжении всё время аренды' : 'Your car and chauffeur are at your service for the full rental'}</p>
          </div>
          <div className={styles.feature}>
            <Sparkles className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Для любого повода' : 'For any occasion'}</h3>
            <p>{locale === 'ru' ? 'Свадьбы, юбилеи, выпускные и торжественные мероприятия' : 'Weddings, anniversaries, graduations and celebrations'}</p>
          </div>
          <div className={styles.feature}>
            <BriefcaseBusiness className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Деловой формат' : 'Business ready'}</h3>
            <p>{locale === 'ru' ? 'Встречи, переговоры и поездки с несколькими остановками' : 'Meetings, negotiations and multi-stop itineraries'}</p>
          </div>
        </div>

        <section className={styles.seoSection} aria-labelledby="hourly-seo-title">
          <h2 id="hourly-seo-title" className={styles.seoTitle}>
            {ru ? 'Почасовая аренда Mercedes с водителем в Москве' : 'Hourly Mercedes chauffeur service in Moscow'}
          </h2>
          <p className={styles.seoLead}>
            {ru
              ? 'NOIR RIDE — это премиальная почасовая аренда автомобиля с водителем для тех, кому важны комфорт, пунктуальность и безупречный сервис. Вы выбираете автомобиль из парка, а мы обеспечиваем спокойную поездку без забот о парковке, маршруте и пробках.'
              : 'NOIR RIDE offers premium hourly chauffeur service for guests who value comfort, punctuality and impeccable service. Choose a vehicle from our fleet — we handle parking, routing and traffic so you can focus on what matters.'}
          </p>
          <div className={styles.eventTags} aria-label={ru ? 'Поводы для аренды' : 'Occasions'}>
            {[
              { icon: Heart, label: ru ? 'Свадьбы' : 'Weddings' },
              { icon: Cake, label: ru ? 'Дни рождения' : 'Birthdays' },
              { icon: Sparkles, label: ru ? 'Юбилеи и выпускные' : 'Anniversaries & graduations' },
              { icon: BriefcaseBusiness, label: ru ? 'Корпоративы' : 'Corporate events' },
              { icon: MapPin, label: ru ? 'Экскурсии по городу' : 'City tours' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className={styles.eventTag}>
                <Icon className={styles.eventTagIcon} aria-hidden />
                {label}
              </span>
            ))}
          </div>
          <p className={styles.seoText}>
            {ru
              ? 'Закажите Mercedes с водителем на свадьбу — гости и молодожёны приедут вовремя и с комфортом. Аренда на день рождения или юбилей избавит от организационных хлопот: водитель подаст машину к нужному адресу и будет ждать между остановками. Для корпоративных мероприятий, деловых встреч и фотосессий мы подберём автомобиль нужного класса — от бизнес-седана до представительского Maybach. Минимальный заказ — 3 часа, тариф фиксируется при бронировании.'
              : 'Book a Mercedes with chauffeur for your wedding — guests and the couple arrive on time in comfort. Hourly rental for birthdays and anniversaries means no logistics stress: your driver meets you at each stop and waits between locations. For corporate events, business meetings and photo shoots we match the right vehicle class — from business sedan to flagship Maybach. Minimum booking is 3 hours with a confirmed rate at reservation.'}
          </p>
        </section>

        <div ref={bookingRef} className={styles.bookingSection}>
          <SectionHeading
            as="h2"
            size="section"
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