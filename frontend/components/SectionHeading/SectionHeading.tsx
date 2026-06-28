'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './SectionHeading.module.scss';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  size?: 'page' | 'section';
  className?: string;
  animate?: boolean;
  showDecor?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  as: Tag = 'h2',
  align = 'left',
  size = 'page',
  className,
  animate = false,
  showDecor = true,
}: SectionHeadingProps) {
  const rootClass = [
    styles.root,
    styles[size],
    styles[align],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const titleClass = `${styles.title} ${styles[size]}`;

  const inner = (
    <div className={rootClass}>
      {showDecor && size === 'page' && <div className={styles.decor} aria-hidden />}
      <div className={styles.eyebrow}>
        {Icon && <Icon size={14} strokeWidth={2.25} aria-hidden />}
        <span>{eyebrow}</span>
      </div>
      <div className={styles.accentLine} aria-hidden />
      <Tag className={titleClass}>{title}</Tag>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
    >
      {inner}
    </motion.div>
  );
}
