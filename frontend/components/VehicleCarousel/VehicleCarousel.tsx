'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './VehicleCarousel.module.scss';

interface VehicleCarouselProps {
  photos: string[];
  alt: string;
}

const SWIPE_THRESHOLD = 48;

export default function VehicleCarousel({ photos, alt }: VehicleCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = photos.length > 1;
  const current = photos[index];
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null) return;
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) prev();
    else next();
  };

  if (photos.length === 0) {
    return (
      <div className={styles.carousel}>
        <div className={styles.frame}>
          <div className={styles.media}>
            <div className={styles.placeholder}>🚗</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <div
        className={styles.frame}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className={styles.media}>
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
        </div>
      </div>

      {hasMultiple && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={prev}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={20} />
          </button>

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

          <button
            type="button"
            className={styles.navBtn}
            onClick={next}
            aria-label="Следующее фото"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
