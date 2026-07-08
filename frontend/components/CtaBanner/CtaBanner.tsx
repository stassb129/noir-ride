'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './CtaBanner.module.scss';

export default function CtaBanner() {
  const locale = useLocale();
  const ru = locale.startsWith('ru');

  return (
    <section className={styles.banner}>
      <div className={styles.media}>
        <Image
          src="/main-page-photo/hotel-entrance.png"
          alt={ru ? 'Премиальный трансфер к вечернему выходу' : 'Premium transfer for an evening arrival'}
          fill
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.scrim} />
      </div>

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <span className={styles.eyebrow}>
            {ru ? 'Особый случай' : 'Special occasion'}
          </span>
          <h2 className={styles.title}>
            {ru
              ? 'Прибудьте так, как этого заслуживает вечер'
              : 'Arrive the way the evening deserves'}
          </h2>
          <p className={styles.text}>
            {ru
              ? 'Свадьба, деловой ужин, театр или встреча гостей — водитель в костюме, безупречный автомобиль и внимание к каждой детали.'
              : 'A wedding, a business dinner, the theatre or greeting guests — a suited chauffeur, a flawless car and attention to every detail.'}
          </p>
          <div className={styles.actions}>
            <Link href={`/${locale}/booking`} className={styles.primaryBtn}>
              {ru ? 'Забронировать' : 'Book now'}
            </Link>
            <a href="#contacts" className={styles.secondaryBtn}>
              {ru ? 'Связаться с нами' : 'Contact us'}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
