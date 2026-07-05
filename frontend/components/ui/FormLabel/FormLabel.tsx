'use client';

import { useLocale } from 'next-intl';
import styles from './FormLabel.module.scss';

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

export default function FormLabel({
  children,
  required,
  optional,
  className,
}: FormLabelProps) {
  const ru = useLocale() === 'ru';

  return (
    <label className={`${styles.label} ${className ?? ''}`}>
      {children}
      {required && (
        <span className={styles.requiredMark} aria-hidden>
          {' *'}
        </span>
      )}
      {optional && (
        <span className={styles.optionalHint}>
          {ru ? ' (необязательно)' : ' (optional)'}
        </span>
      )}
    </label>
  );
}
