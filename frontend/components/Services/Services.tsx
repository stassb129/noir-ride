'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { MapPin, Clock, Car, LayoutGrid } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import styles from './Services.module.scss';

const cardVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: EASE_OUT_EXPO },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function Services() {
  const locale = useLocale();

  const services = [
    {
      id: 'intercity',
      icon: MapPin,
      title: locale === 'ru' ? 'Межгород' : 'Intercity rides',
      description: locale === 'ru' 
        ? 'Комфортные поездки между городами. Москва — Санкт-Петербург и другие направления.'
        : 'Comfortable intercity trips. Moscow — Saint Petersburg and other destinations.',
      link: `/${locale}/routes`
    },
    {
      id: 'airport',
      icon: Clock,
      title: locale === 'ru' ? 'Аэропорт' : 'Airport transfer',
      description: locale === 'ru' 
        ? 'Встреча в аэропорту с табличкой. Помощь с багажом. Отслеживание рейса.'
        : 'Airport meet & greet with signage. Baggage assistance. Flight tracking.',
      link: `/${locale}/airport`
    },
    {
      id: 'hourly',
      icon: Car,
      title: locale === 'ru' ? 'Почасовая аренда' : 'Hourly rental',
      description: locale === 'ru' 
        ? 'Автомобиль с водителем на несколько часов. Минимум 3 часа.'
        : 'Car with driver for several hours. Minimum 3 hours.',
      link: `/${locale}/hourly`
    }
  ];

  return (
    <section className={styles.services}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow={locale === 'ru' ? 'Услуги' : 'Services'}
          title={
            locale === 'ru'
              ? 'Аренда авто с водителем в Москве и области'
              : 'Chauffeured car rental in Moscow & region'
          }
          description={
            locale === 'ru'
              ? 'Межгород, аэропорты и почасовая — выберите формат поездки'
              : 'Intercity, airport & hourly — choose the format that fits'
          }
          icon={LayoutGrid}
          align="center"
          animate
        />

        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.id} href={service.link}>
                <motion.div 
                  className={styles.serviceCard}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.title}>{service.title}</h3>
                  <p className={styles.description}>{service.description}</p>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}