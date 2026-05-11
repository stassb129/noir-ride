'use client';

import { motion, type Variants } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './Guarantees.module.scss';

const listVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

export default function Guarantees() {
  const locale = useLocale();

  const guarantees = locale === 'ru' ? [
    'Автомобили премиум-класса не старше 3 лет',
    'Все водители имеют опыт работы от 5 лет',
    'Автомобили проходят ежедневную предрейсовую подготовку',
    'Бутилированная вода и зарядные устройства в каждом автомобиле',
    'Детские кресла предоставляются бесплатно по запросу',
    'Возможность изменить или отменить заказ за 3 часа без штрафа',
    'Конфиденциальность переговоров гарантирована',
    'Возврат 100% стоимости при опоздании водителя более 15 минут'
  ] : [
    'Premium cars no older than 3 years',
    'All drivers have 5+ years of experience',
    'Daily pre-trip vehicle preparation',
    'Bottled water and charging devices in every car',
    'Child seats provided free upon request',
    'Change or cancel order 3 hours before without penalty',
    'Confidentiality of negotiations guaranteed',
    '100% refund if driver is more than 15 minutes late'
  ];

  return (
    <section className={styles.guarantees}>
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            className={styles.textBlock}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            <h2 className={styles.title}>
              {locale === 'ru' ? 'Наши гарантии' : 'Our guarantees'}
            </h2>
            <p className={styles.description}>
              {locale === 'ru'
                ? 'Мы несем полную ответственность за качество предоставляемых услуг и гарантируем соблюдение всех обязательств перед клиентом.'
                : 'We take full responsibility for the quality of services provided and guarantee compliance with all obligations to the client.'}
            </p>

            <motion.ul
              className={styles.list}
              variants={listVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {guarantees.map((guarantee, index) => (
                <motion.li
                  key={index}
                  className={styles.listItem}
                  variants={itemVariants}
                >
                  <CheckCircle className={styles.checkIcon} />
                  <span>{guarantee}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className={styles.imageBlock}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>3</div>
                <div className={styles.statLabel}>
                  {locale === 'ru' ? 'года макс. возраст авто' : 'years max car age'}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>5+</div>
                <div className={styles.statLabel}>
                  {locale === 'ru' ? 'лет опыт водителей' : 'years driver experience'}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>
                  {locale === 'ru' ? 'поддержка клиентов' : 'customer support'}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>
                  {locale === 'ru' ? 'гарантия возврата' : 'refund guarantee'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
