'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import HeroAccessCard from './HeroAccessCard';
import styles from './Hero.module.scss';

const DESKTOP_VIDEO = '/luxury-car-desktop.mp4';
const MOBILE_VIDEO = '/luxury-car-mobile.mp4';
const VIDEO_POSTER = '/luxury-car-poster.jpg';
const MOBILE_QUERY = '(max-width: 767px)';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function Hero() {
  const locale = useLocale();
  const videoRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);

    const applySource = () => {
      setIsMobile(query.matches);
      setVideoSrc(query.matches ? MOBILE_VIDEO : DESKTOP_VIDEO);
    };

    applySource();
    query.addEventListener('change', applySource);
    return () => query.removeEventListener('change', applySource);
  }, []);

  // Параллакс только на десктопе: на телефоне он даёт заметный джанк при скролле.
  useEffect(() => {
    if (!videoSrc || isMobile) return;

    const handleScroll = () => {
      if (!videoRef.current) return;
      const scrollY = window.scrollY;
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.style.transform = `translate3d(0, ${scrollY * 0.5}px, 0)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (videoRef.current) videoRef.current.style.transform = '';
    };
  }, [videoSrc, isMobile]);

  return (
    <section className={styles.hero}>
      <div ref={videoRef} className={styles.videoContainer}>
        <div className={styles.overlay} />
        {videoSrc && (
          <video
            key={videoSrc}
            src={videoSrc}
            poster={VIDEO_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            className={styles.videoBackground}
          />
        )}
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className={styles.content} variants={fadeInUp}>
            <h1 className={styles.headline}>
              {locale === 'ru'
                ? 'Премиальный трансфер без компромиссов'
                : 'Premium transfer, uncompromised'}
            </h1>

            <p className={styles.subtext}>
              {locale === 'ru'
                ? 'Межгород · аэропорты · почасовая — выберите автомобиль из парка'
                : 'Intercity · airports · hourly — choose your car from the fleet'}
            </p>
          </motion.div>

          <motion.div id="booking-form" className={styles.bookingCardWrapper} variants={fadeInUp}>
            <HeroAccessCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}