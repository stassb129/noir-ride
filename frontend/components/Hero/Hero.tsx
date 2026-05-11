'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import ContactForm from '../ContactForm/ContactForm';
import styles from './Hero.module.scss';

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

  useEffect(() => {
    const handleScroll = () => {
      if (!videoRef.current) return;
      
      const scrollY = window.scrollY;
      const parallaxSpeed = 0.5;
      
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
      <div ref={videoRef} className={styles.videoContainer}>
        <div className={styles.overlay} />
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
        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className={styles.content} variants={fadeInUp}>
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
          </motion.div>

          <motion.div className={styles.bookingCardWrapper} variants={fadeInUp}>
            <ContactForm />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}