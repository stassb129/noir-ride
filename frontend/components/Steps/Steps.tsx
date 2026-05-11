'use client';

import { motion, type Variants } from 'framer-motion';
import { MapPin, CreditCard, Car } from 'lucide-react';
import { useLocale } from 'next-intl';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './Steps.module.scss';

const Steps = () => {
  const locale = useLocale();

  const steps = [
    {
      icon: MapPin,
      title: locale === 'ru' ? 'Выберите маршрут' : 'Choose route',
      description: locale === 'ru' ? 'Укажите точки отправления и назначения, выберите класс автомобиля' : 'Specify pickup and destination points, choose car class',
      number: '01',
    },
    {
      icon: CreditCard,
      title: locale === 'ru' ? 'Подтвердите бронирование' : 'Confirm booking',
      description: locale === 'ru' ? 'Мы свяжемся с вами для уточнения деталей и подтверждения заказа' : 'We will contact you to clarify details and confirm the order',
      number: '02',
    },
    {
      icon: Car,
      title: locale === 'ru' ? 'Наслаждайтесь поездкой' : 'Enjoy your ride',
      description: locale === 'ru' ? 'Водитель встретит вас в назначенное время, комфорт гарантирован' : 'Driver will meet you at the appointed time, comfort guaranteed',
      number: '03',
    },
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section className={styles.steps}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>
            {locale === 'ru' ? 'Как это работает' : 'How it works'}
          </h2>
          <p className={styles.subtitle}>
            {locale === 'ru' ? 'Простой процесс бронирования в три шага' : 'Simple booking process in three steps'}
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className={styles.stepCard}
                variants={item}
              >
                <div className={styles.number}>{step.number}</div>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                {index < steps.length - 1 && (
                  <div className={styles.connector} />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Steps;
