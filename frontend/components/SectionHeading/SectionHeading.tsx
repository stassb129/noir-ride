'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './SectionHeading.module.scss';

export type SectionEyebrowStyle = 'rail' | 'ghost';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  size?: 'page' | 'section';
  eyebrowStyle?: SectionEyebrowStyle;
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
  eyebrowStyle,
  className,
  animate = false,
  showDecor = true,
}: SectionHeadingProps) {
  const style = eyebrowStyle ?? (size === 'page' ? 'rail' : 'ghost');

  const rootClass = [
    styles.root,
    styles[size],
    styles[align],
    styles[style],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const titleClass = `${styles.title} ${styles[size]}`;

  const inner = (
    <div className={rootClass}>
      {showDecor && size === 'page' && style === 'rail' && (
        <div className={styles.decor} aria-hidden />
      )}
      <div className={styles.eyebrow}>
        {Icon && style === 'rail' && (
          <span className={styles.iconMark} aria-hidden>
            <Icon size={15} strokeWidth={1.75} />
          </span>
        )}
        {Icon && style === 'ghost' && (
          <Icon className={styles.ghostIcon} size={14} strokeWidth={1.75} aria-hidden />
        )}
        <span className={styles.eyebrowLabel}>{eyebrow}</span>
      </div>
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
