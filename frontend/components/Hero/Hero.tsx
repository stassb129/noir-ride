'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';
import BookingCard from '../BookingCard/BookingCard';
import styles from './Hero.module.scss';

export default function Hero() {
  const locale = useLocale();
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!videoRef.current) return;
      
      const scrollY = window.scrollY;
      const parallaxSpeed = 0.5; // Video moves 50% slower than scroll
      
      // Apply parallax transform
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.style.transform = `translate3d(0, ${scrollY * parallaxSpeed}px, 0)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Video Container with Parallax */}
      <div ref={videoRef} className={styles.videoContainer}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className={styles.videoBackground}
        >
          <source src="/luxury-car-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.content}>
            <h1 className={styles.headline}>
              {locale === 'ru' 
                ? 'Премиум-поездки без компромиссов'
                : 'Premium rides without compromise'}
            </h1>
            
            <p className={styles.subtext}>
              {locale === 'ru' 
                ? 'Москва — Санкт-Петербург от 10,000₽'
                : 'Moscow — Saint Petersburg from 10,000₽'}
            </p>
          </div>

          <div className={styles.bookingCardWrapper}>
            <BookingCard />
          </div>
        </div>
      </div>
    </section>
  );
}