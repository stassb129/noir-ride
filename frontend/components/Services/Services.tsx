'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './Services.module.scss';

export default function Services() {
  const locale = useLocale();

  const services = [
    {
      id: 'intercity',
      title: locale === 'ru' ? 'Междугород' : 'Intercity rides',
      description: locale === 'ru' ? 'Москва — Санкт-Петербург' : 'Moscow — Saint Petersburg',
      link: `/${locale}/routes`
    },
    {
      id: 'airport',
      title: locale === 'ru' ? 'Аэропорт' : 'Airport transfer',
      description: locale === 'ru' ? 'Встреча и трансфер' : 'Meet & transfer',
      link: `/${locale}/airport`
    },
    {
      id: 'hourly',
      title: locale === 'ru' ? 'Почасовая' : 'Hourly rental',
      description: locale === 'ru' ? 'От 3 часов' : 'From 3 hours',
      link: `/${locale}/hourly`
    }
  ];

  return (
    <section className={styles.services}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {services.map((service) => (
            <Link key={service.id} href={service.link}>
              <div className={styles.service}>
                <h3 className={styles.title}>{service.title}</h3>
                <p className={styles.description}>{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}