'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './CustomSelect.module.scss';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  variant?: 'underlined' | 'boxed';
}

export default function CustomSelect({
  value,
  options,
  onChange,
  name,
  placeholder,
  disabled = false,
  required = false,
  className,
  variant = 'underlined',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label || '';
  }, [options, value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const rootClassName = [
    styles.selectRoot,
    styles[variant],
    className || '',
    disabled ? styles.disabled : '',
  ]
    .join(' ')
    .trim();

  return (
    <div className={rootClassName} ref={rootRef}>
      {name && <input type="hidden" name={name} value={value} required={required} />}

      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={selectedLabel ? styles.value : styles.placeholder}>
          {selectedLabel || placeholder || ''}
        </span>
        <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${value === option.value ? styles.optionActive : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
