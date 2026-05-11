'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, Luggage, Zap } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './Fleet.module.scss';

const vehicleVariants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  hover: {
    transition: { duration: 0.3 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function Fleet() {
  const locale = useLocale();

  const vehicles = [
    {
      id: 'business',
      name: 'Mercedes E-Class',
      description: locale === 'ru' ? 'Бизнес класс для комфортных поездок' : 'Business class for comfortable trips',
      specs: [
        { icon: Users, value: locale === 'ru' ? '4 места' : '4 seats' },
        { icon: Luggage, value: locale === 'ru' ? '3 чемодана' : '3 bags' },
        { icon: Zap, value: locale === 'ru' ? 'Премиум' : 'Premium' }
      ],
      image: '/car-eclass.jpg'
    },
    {
      id: 'minivan',
      name: 'Mercedes V-Class',
      description: locale === 'ru' ? 'Просторный минивэн для групп' : 'Spacious minivan for groups',
      specs: [
        { icon: Users, value: locale === 'ru' ? '6 мест' : '6 seats' },
        { icon: Luggage, value: locale === 'ru' ? '8 чемоданов' : '8 bags' },
        { icon: Zap, value: locale === 'ru' ? 'Комфорт' : 'Comfort' }
      ],
      image: '/car-vclass.jpg'
    },
    {
      id: 'luxury',
      name: 'Mercedes G-Class',
      description: locale === 'ru' ? 'Премиум внедорожник' : 'Premium SUV',
      specs: [
        { icon: Users, value: locale === 'ru' ? '4 места' : '4 seats' },
        { icon: Luggage, value: locale === 'ru' ? '4 чемодана' : '4 bags' },
        { icon: Zap, value: locale === 'ru' ? 'Люкс' : 'Luxury' }
      ],
      image: '/car-gclass.jpg'
    }
  ];

  return (
    <section className={styles.fleet}>
      <div className={styles.container}>
        <motion.h2 
          className={styles.heading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          {locale === 'ru' ? 'Автопарк' : 'Our fleet'}
        </motion.h2>

        <motion.div 
          className={styles.vehicleList}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {vehicles.map((vehicle) => (
            <motion.div 
              key={vehicle.id} 
              className={styles.vehicle}
              variants={vehicleVariants}
              whileHover="hover"
            >
              <motion.div 
                className={styles.vehicleImage}
                style={{
                  background: `linear-gradient(135deg, rgba(10, 10, 10, 0.4), rgba(10, 10, 10, 0.7)), url(${vehicle.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              />
              <div className={styles.vehicleOverlay} />
              
              <motion.div 
                className={styles.vehicleContent}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className={styles.vehicleName}>{vehicle.name}</h3>
                <p className={styles.vehicleDescription}>{vehicle.description}</p>
                
                <div className={styles.specs}>
                  {vehicle.specs.map((spec, index) => {
                    const Icon = spec.icon;
                    return (
                      <div key={index} className={styles.spec}>
                        <Icon className={styles.specIcon} />
                        <span className={styles.specValue}>{spec.value}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}