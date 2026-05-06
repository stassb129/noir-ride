'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import styles from './BookingCard.module.scss';

export default function BookingCard() {
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const booking = {
        serviceType: formData.get('serviceType') as string,
        from: formData.get('from') as string,
        to: formData.get('to') as string,
        departureDate: formData.get('date') as string,
        departureTime: formData.get('time') as string,
        vehicleType: formData.get('vehicleType') as string,
        passengers: parseInt(formData.get('passengers') as string, 10),
        customerName: formData.get('name') as string,
        customerEmail: formData.get('email') as string,
        customerPhone: formData.get('phone') as string,
        notes: formData.get('notes') as string,
        price: 0, // Will be calculated on backend
      };

      await apiClient.createBooking(booking);
      
      alert(locale === 'ru' ? 'Бронирование создано! Мы свяжемся с вами в ближайшее время.' : 'Booking created! We will contact you shortly.');
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message || (locale === 'ru' ? 'Ошибка при создании бронирования' : 'Error creating booking'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        {locale === 'ru' ? 'Забронировать' : 'Book a ride'}
      </h3>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Ваше имя' : 'Your name'}
          </label>
          <input
            type="text"
            name="name"
            placeholder={locale === 'ru' ? 'Иван Иванов' : 'John Doe'}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Телефон' : 'Phone'}
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+7 999 123 45 67"
            pattern="^\+?[1-9]\d{1,14}$"
            className={styles.input}
            required
            title={locale === 'ru' ? 'Введите корректный номер телефона' : 'Enter a valid phone number'}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Откуда' : 'From'}
          </label>
          <input
            type="text"
            name="from"
            placeholder="Moscow"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Куда' : 'To'}
          </label>
          <input
            type="text"
            name="to"
            placeholder="Saint Petersburg"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.dateTimeGroup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Дата' : 'Date'}
            </label>
            <input
              type="date"
              name="date"
              className={styles.input}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Время' : 'Time'}
            </label>
            <input
              type="time"
              name="time"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Тип услуги' : 'Service type'}
          </label>
          <select name="serviceType" className={styles.select} required>
            <option value="intercity">{locale === 'ru' ? 'Междугород' : 'Intercity'}</option>
            <option value="airport">{locale === 'ru' ? 'Аэропорт' : 'Airport'}</option>
            <option value="hourly">{locale === 'ru' ? 'Почасовая' : 'Hourly'}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Класс автомобиля' : 'Car type'}
          </label>
          <select name="vehicleType" className={styles.select} required>
            <option value="business">{locale === 'ru' ? 'Бизнес' : 'Business'}</option>
            <option value="minivan">{locale === 'ru' ? 'Минивэн' : 'Minivan'}</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Количество пассажиров' : 'Passengers'}
          </label>
          <input
            type="number"
            name="passengers"
            min="1"
            max="10"
            defaultValue="1"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Примечания (необязательно)' : 'Notes (optional)'}
          </label>
          <textarea
            name="notes"
            className={styles.textarea}
            rows={3}
            placeholder={locale === 'ru' ? 'Дополнительная информация...' : 'Additional information...'}
          />
        </div>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <p className={styles.notice}>
          {locale === 'ru' 
            ? 'Мы свяжемся с вами для подтверждения бронирования'
            : 'We will contact you to confirm the booking'}
        </p>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (locale === 'ru' ? 'Отправка...' : 'Sending...') 
            : (locale === 'ru' ? 'Забронировать' : 'Book now')}
        </button>
      </form>
    </div>
  );
}