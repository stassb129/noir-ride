'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, type Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import styles from './Experience.module.scss';

const cardVariants: Variants = {
  initial: { opacity: 0, y: 48 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const container: Variants = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function Experience() {
  const locale = useLocale();
  const ru = locale.startsWith('ru');

  const tiles = [
    {
      src: '/main-page-photo/business-ride.png',
      title: ru ? 'Мобильный офис на колёсах' : 'A mobile office on wheels',
      text: ru
        ? 'Тишина, Wi-Fi и простор бизнес-салона — работайте или отдыхайте, пока водитель везёт вас по городу.'
        : 'Quiet, Wi-Fi and a spacious cabin — work or relax while your chauffeur handles the road.',
    },
    {
      src: '/main-page-photo/hotel-evening.png',
      title: ru ? 'Забота о каждой детали' : 'Care in every detail',
      text: ru
        ? 'Помощь с багажом, подача к самому входу и встреча с улыбкой — сервис уровня пятизвёздочного отеля.'
        : 'Luggage assistance, door-to-door pickup and a warm welcome — five-star hotel service.',
    },
  ];

  return (
    <section className={styles.experience}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow={ru ? 'Впечатления' : 'Experience'}
          title={ru ? 'Комфорт, который чувствуется с первой секунды' : 'Comfort you feel from the first second'}
          description={
            ru
              ? 'Мы создаём атмосферу, в которой каждая поездка становится частью впечатления, а не просто перемещением'
              : 'We craft an atmosphere where every ride becomes part of the experience, not just a transfer'
          }
          icon={Sparkles}
          animate
        />

        <motion.div
          className={styles.grid}
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {tiles.map((tile) => (
            <motion.figure key={tile.src} className={styles.tile} variants={cardVariants}>
              <div className={styles.imageWrap}>
                <Image
                  src={tile.src}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.image}
                />
                <div className={styles.overlay} />
              </div>
              <figcaption className={styles.caption}>
                <h3 className={styles.tileTitle}>{tile.title}</h3>
                <p className={styles.tileText}>{tile.text}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
