'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './VehicleCarousel.module.scss';

interface VehicleCarouselProps {
  photos: string[];
  alt: string;
}

export default function VehicleCarousel({ photos, alt }: VehicleCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = photos.length > 1;
  const current = photos[index];

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  if (photos.length === 0) {
    return (
      <div className={styles.carousel}>
        <div className={styles.frame}>
          <div className={styles.placeholder}>🚗</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.frame}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current}
            src={current}
            alt={alt}
            className={styles.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            draggable={false}
          />
        </AnimatePresence>

        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={prev}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={next}
              aria-label="Следующее фото"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className={styles.thumbs}>
          {photos.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Фото ${i + 1}`}
            >
              <img src={url} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
