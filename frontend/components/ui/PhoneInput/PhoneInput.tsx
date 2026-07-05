'use client';

import { useRef } from 'react';
import PhoneInputLib from 'react-phone-number-input';
import ruLabels from 'react-phone-number-input/locale/ru.json';
import enLabels from 'react-phone-number-input/locale/en.json';
import 'react-phone-number-input/style.css';
import { useLocale } from 'next-intl';
import { getDefaultPhoneCountry } from '@/lib/phone';
import styles from './PhoneInput.module.scss';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  onBlur?: (value: string) => void;
  error?: string | null;
}

export default function PhoneInput({
  value,
  onChange,
  required,
  disabled,
  id,
  name,
  className,
  onBlur,
  error,
}: PhoneInputProps) {
  const locale = useLocale();
  const labels = locale === 'ru' ? ruLabels : enLabels;
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    onBlur?.(valueRef.current);
  };

  return (
    <div
      className={`${styles.wrap} ${className ?? ''}`}
      onBlur={handleContainerBlur}
    >
      <PhoneInputLib
        international
        countryCallingCodeEditable={false}
        limitMaxLength
        defaultCountry={getDefaultPhoneCountry(locale)}
        labels={labels}
        value={value}
        onChange={(next: string | undefined) => {
          const normalized = next ?? '';
          valueRef.current = normalized;
          onChange(normalized);
        }}
        className={`${styles.phoneInput} ${error ? styles.phoneInputError : ''}`}
        numberInputProps={{
          className: styles.numberInput,
          required,
          disabled,
          id,
          name,
        }}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
