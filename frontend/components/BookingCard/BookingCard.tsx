'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient, Booking } from '@/lib/api/client';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import styles from './BookingCard.module.scss';

export default function BookingCard() {
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [serviceType, setServiceType] = useState<Booking['serviceType']>('intercity');
  const [vehicleType, setVehicleType] = useState('business');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const booking: Partial<Booking> = {
        serviceType: formData.get('serviceType') as Booking['serviceType'],
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
        price: 0,
      };

      await apiClient.createBooking(booking);
      
      alert(locale === 'ru' ? 'Бронирование создано! Мы свяжемся с вами в ближайшее время.' : 'Booking created! We will contact you shortly.');
      e.currentTarget.reset();
      setServiceType('intercity');
      setVehicleType('business');
    } catch (err: any) {
      setError(err.message || (locale === 'ru' ? 'Ошибка при создании бронирования' : 'Error creating booking'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
    >
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
          <CustomSelect
            name="serviceType"
            value={serviceType}
            onChange={(value) => setServiceType(value as Booking['serviceType'])}
            options={[
              { value: 'intercity', label: locale === 'ru' ? 'Междугород' : 'Intercity' },
              { value: 'airport', label: locale === 'ru' ? 'Аэропорт' : 'Airport' },
              { value: 'hourly', label: locale === 'ru' ? 'Почасовая' : 'Hourly' },
            ]}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Класс автомобиля' : 'Car type'}
          </label>
          <CustomSelect
            name="vehicleType"
            value={vehicleType}
            onChange={setVehicleType}
            options={[
              { value: 'business', label: locale === 'ru' ? 'Бизнес' : 'Business' },
              { value: 'minivan', label: locale === 'ru' ? 'Минивэн' : 'Minivan' },
              { value: 'luxury', label: 'Luxury' },
            ]}
            required
          />
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
          <motion.p 
            className={styles.error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        <p className={styles.notice}>
          {locale === 'ru' 
            ? 'Мы свяжемся с вами для подтверждения бронирования'
            : 'We will contact you to confirm the booking'}
        </p>

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting 
            ? (locale === 'ru' ? 'Отправка...' : 'Sending...') 
            : (locale === 'ru' ? 'Забронировать' : 'Book now')}
        </motion.button>
      </form>
    </motion.div>
  );
}