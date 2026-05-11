'use client';

import { motion, type Variants } from 'framer-motion';
import { Shield, Award, Headphones, CreditCard, MapPin, Clock } from 'lucide-react';
import { useLocale } from 'next-intl';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './Benefits.module.scss';

const cardVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  hover: {
    y: -6,
    transition: { duration: 0.3, ease: EASE_OUT_EXPO },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

export default function Benefits() {
  const locale = useLocale();

  const benefits = [
    {
      icon: Shield,
      title: locale === 'ru' ? 'Безопасность' : 'Safety',
      description: locale === 'ru' 
        ? 'Все водители проходят строгий отбор. Автомобили застрахованы и регулярно проходят техосмотр.'
        : 'All drivers undergo strict selection. Cars are insured and regularly inspected.'
    },
    {
      icon: Award,
      title: locale === 'ru' ? 'Профессионализм' : 'Professionalism',
      description: locale === 'ru' 
        ? 'Опытные водители со стажем от 5 лет. Знание маршрутов и правил делового этикета.'
        : 'Experienced drivers with 5+ years experience. Route knowledge and business etiquette.'
    },
    {
      icon: Headphones,
      title: locale === 'ru' ? 'Поддержка 24/7' : '24/7 Support',
      description: locale === 'ru' 
        ? 'Круглосуточная диспетчерская служба. Оперативное решение любых вопросов в пути.'
        : '24/7 dispatch service. Quick resolution of any issues on the road.'
    },
    {
      icon: CreditCard,
      title: locale === 'ru' ? 'Прозрачное ценообразование' : 'Transparent pricing',
      description: locale === 'ru' 
        ? 'Фиксированная стоимость без дополнительных сборов. Оплата наличными или картой.'
        : 'Fixed price with no hidden fees. Cash or card payment accepted.'
    },
    {
      icon: MapPin,
      title: locale === 'ru' ? 'Встреча с табличкой' : 'Meet & greet',
      description: locale === 'ru' 
        ? 'Водитель встречает в аэропорту с именной табличкой. Помощь с багажом.'
        : 'Driver meets at airport with name sign. Baggage assistance included.'
    },
    {
      icon: Clock,
      title: locale === 'ru' ? 'Точность' : 'Punctuality',
      description: locale === 'ru' 
        ? 'Прибытие строго ко времени с учетом пробок. Мониторинг рейсов для встреч в аэропорту.'
        : 'Arrival strictly on time considering traffic. Flight monitoring for airport pickups.'
    }
  ];

  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <h2 className={styles.title}>
            {locale === 'ru' ? 'Почему выбирают нас' : 'Why choose us'}
          </h2>
          <p className={styles.subtitle}>
            {locale === 'ru' 
              ? 'Премиальный сервис с вниманием к каждой детали'
              : 'Premium service with attention to every detail'}
          </p>
        </motion.div>

        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                className={styles.card}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{benefit.title}</h3>
                <p className={styles.cardDescription}>{benefit.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
