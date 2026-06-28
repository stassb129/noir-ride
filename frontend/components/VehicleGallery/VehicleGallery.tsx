'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './VehicleGallery.module.scss';

interface VehicleGalleryProps {
  photos: string[];
  alt: string;
}

export default function VehicleGallery({ photos, alt }: VehicleGalleryProps) {
  const [active, setActive] = useState(0);
  const hasMultiple = photos.length > 1;
  const current = photos[active];

  const prev = () => setActive((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setActive((i) => (i === photos.length - 1 ? 0 : i + 1));

  if (photos.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainFrame}>
          <div className={styles.placeholder}>🚗</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainFrame}>
        <img
          key={current}
          src={current}
          alt={`${alt} — фото ${active + 1}`}
          className={styles.mainImage}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={prev}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={next}
              aria-label="Следующее фото"
            >
              <ChevronRight size={20} />
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
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
            >
              <img src={url} alt="" className={styles.thumbImage} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
