import { isValidPhoneNumber } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';

export function getDefaultPhoneCountry(locale: string): Country {
  return locale === 'ru' ? 'RU' : 'US';
}

export function getPhoneValidationError(value: string, locale: string): string | null {
  if (!value?.trim()) {
    return locale === 'ru' ? 'Укажите номер телефона' : 'Enter your phone number';
  }
  if (!isValidPhoneNumber(value)) {
    return locale === 'ru' ? 'Введите корректный номер телефона' : 'Enter a valid phone number';
  }
  return null;
}
