'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import styles from './ScrollProgress.module.scss';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25,
    restDelta: 0.001,
  });

  return <motion.div className={styles.bar} style={{ scaleX }} aria-hidden />;
}
