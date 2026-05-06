'use client';

import { useLocale } from 'next-intl';
import Image from 'next/image';
import styles from './Fleet.module.scss';

export default function Fleet() {
  const locale = useLocale();

  const vehicles = [
    {
      id: 'business',
      name: 'Mercedes E-Class',
      description: locale === 'ru' ? 'Бизнес класс для комфортных поездок' : 'Business class for comfortable trips',
      image: '/car-eclass.jpg'
    },
    {
      id: 'minivan',
      name: 'Mercedes V-Class',
      description: locale === 'ru' ? 'Просторный минивэн для групп' : 'Spacious minivan for groups',
      image: '/car-vclass.jpg'
    },
    {
      id: 'luxury',
      name: 'Mercedes G-Class',
      description: locale === 'ru' ? 'Премиум внедорожник' : 'Premium SUV',
      image: '/car-gclass.jpg'
    }
  ];

  return (
    <section className={styles.fleet}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          {locale === 'ru' ? 'Автопарк' : 'Our fleet'}
        </h2>

        <div className={styles.vehicleList}>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={styles.vehicle}>
              <div className={styles.vehicleImage} style={{
                background: `linear-gradient(135deg, rgba(26, 26, 26, 0.6), rgba(11, 11, 11, 0.8)), url(${vehicle.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div className={styles.vehicleOverlay} />
              
              <div className={styles.vehicleContent}>
                <h3 className={styles.vehicleName}>{vehicle.name}</h3>
                <p className={styles.vehicleDescription}>{vehicle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}