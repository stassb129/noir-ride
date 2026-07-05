'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import PhoneInput from '@/components/ui/PhoneInput/PhoneInput';
import FormLabel from '@/components/ui/FormLabel/FormLabel';
import VehicleSelector from '@/components/VehicleSelector/VehicleSelector';
import { getMinBookingDate, getBookingDateError, isBookingDateValid } from '@/lib/booking-date';
import { clampPassengers, getPassengerSelectOptions } from '@/lib/booking-passengers';
import { fetchVehicles, type Vehicle } from '@/lib/api/vehicles';
import { getPrefilledPassengers, useVehiclePrefill } from '@/lib/use-vehicle-prefill';
import {
  DEFAULT_DRIVER_PREFERENCE,
  getDriverPreferenceOptions,
  type DriverPreference,
} from '@/lib/driver-preference';
import { getPhoneValidationError } from '@/lib/phone';
import styles from '../RouteBookingForm/RouteBookingForm.module.scss';

export default function HourlyBookingForm({ initialVehicleId }: { initialVehicleId?: number | null }) {
  const locale = useLocale();
  const minDate = getMinBookingDate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pickupAddress: '',
    date: '',
    time: '',
    hours: 3,
    vehicleId: null as number | null,
    vehicleName: '',
    passengers: 1,
    notes: '',
    driverPreference: DEFAULT_DRIVER_PREFERENCE as DriverPreference,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dateError, setDateError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [vehicleMaxPassengers, setVehicleMaxPassengers] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchVehicles().then(setVehicles);
  }, []);

  const applyVehiclePrefill = useCallback((vehicle: Vehicle) => {
    setVehicleMaxPassengers(vehicle.passengers);
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      passengers: getPrefilledPassengers(prev.passengers, vehicle),
    }));
    setVehicleError(null);
  }, []);

  useVehiclePrefill(vehicles, initialVehicleId, applyVehiclePrefill);

  const selectedVehicle = formData.vehicleId
    ? vehicles.find((v) => v.id === formData.vehicleId)
    : null;
  const maxPassengers = vehicleMaxPassengers
    ?? (selectedVehicle ? (selectedVehicle.passengers ?? 3) : null);

  const ru = locale === 'ru';
  const hourOptions = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
    value: String(h),
    label: ru
      ? (h >= 5 ? `${h} часов` : `${h} часа`)
      : `${h} hours`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateValidationError = getBookingDateError(formData.date, locale, minDate);
    if (!isBookingDateValid(formData.date, minDate)) {
      setDateError(dateValidationError);
      return;
    }

    if (!formData.vehicleId) {
      setVehicleError(locale === 'ru' ? 'Выберите автомобиль' : 'Please choose a vehicle');
      return;
    }

    const phoneValidationError = getPhoneValidationError(formData.phone, locale);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setVehicleError(null);
    setPhoneError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/hourly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      setDateError(null);
      setVehicleError(null);
      setVehicleMaxPassengers(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        pickupAddress: '',
        date: '',
        time: '',
        hours: 3,
        vehicleId: null,
        vehicleName: '',
        passengers: 1,
        notes: '',
        driverPreference: DEFAULT_DRIVER_PREFERENCE,
      });

      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'passengers') return;
    const nextValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (name === 'date') setDateError(getBookingDateError(value, locale, minDate));
  };

  const validateDate = (e: React.FocusEvent<HTMLInputElement>) => {
    setDateError(getBookingDateError(e.target.value, locale, minDate));
  };

  return (
    <div className={styles.bookingWrapper}>
      <section className={styles.vehicleSection}>
        <VehicleSelector
          serviceType="hourly"
          variant="wide"
          value={formData.vehicleId}
          onChange={(id, name, _price, maxPassengers) => {
            setVehicleError(null);
            setVehicleMaxPassengers(maxPassengers);
            setFormData((prev) => ({
              ...prev,
              vehicleId: id,
              vehicleName: name,
              passengers: clampPassengers(prev.passengers, maxPassengers),
            }));
          }}
        />
        {vehicleError && <p className={styles.fieldError}>{vehicleError}</p>}
      </section>

      <motion.div
        id="booking-details"
        className={styles.form}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={styles.title}>
          {ru ? 'Почасовая аренда' : 'Hourly rental'}
        </h3>
        <p className={styles.formHint}>
          {ru ? 'Поля, отмеченные *, обязательны для заполнения' : 'Fields marked with * are required'}
        </p>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Ваше имя' : 'Your name'}
              </FormLabel>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={ru ? 'Иван Иванов' : 'John Doe'}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Телефон' : 'Phone'}
              </FormLabel>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, phone: value }));
                  setPhoneError(null);
                }}
                onBlur={(phone) => setPhoneError(getPhoneValidationError(phone, locale))}
                error={phoneError}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <FormLabel optional>Email</FormLabel>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Адрес подачи' : 'Pickup address'}
              </FormLabel>
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder={ru ? 'Откуда подать автомобиль' : 'Where to pick you up'}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Дата' : 'Date'}
              </FormLabel>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={validateDate}
                min={minDate}
                className={styles.input}
                required
              />
              {dateError && <p className={styles.fieldError}>{dateError}</p>}
            </div>

            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Время' : 'Time'}
              </FormLabel>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <FormLabel required>
                {ru ? 'Количество часов' : 'Hours'}
              </FormLabel>
              <CustomSelect
                variant="boxed"
                name="hours"
                value={String(formData.hours)}
                onChange={(value) => setFormData((prev) => ({ ...prev, hours: Number(value) }))}
                options={hourOptions}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <FormLabel required>
                {maxPassengers
                  ? (ru ? `Пассажиров (макс. ${maxPassengers})` : `Passengers (max ${maxPassengers})`)
                  : (ru ? 'Пассажиров (выберите авто)' : 'Passengers (select vehicle)')}
              </FormLabel>
              <CustomSelect
                variant="boxed"
                name="passengers"
                value={String(formData.passengers)}
                disabled={!maxPassengers}
                required
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    passengers: clampPassengers(Number(value), maxPassengers),
                  }))
                }
                options={getPassengerSelectOptions(maxPassengers, ru)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ru ? 'Водитель' : 'Driver'}
            </label>
            <CustomSelect
              variant="boxed"
              name="driverPreference"
              value={formData.driverPreference}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  driverPreference: value as DriverPreference,
                }))
              }
              options={getDriverPreferenceOptions(ru)}
            />
          </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Комментарий (необязательно)' : 'Comment (optional)'}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={ru ? 'Дополнительные пожелания...' : 'Additional requests...'}
            className={styles.textarea}
            rows={3}
          />
        </div>

        {status === 'success' && (
          <motion.p
            className={styles.success}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ru
              ? 'Заявка отправлена! Мы свяжемся с вами для подтверждения.'
              : 'Request sent! We will contact you for confirmation.'}
          </motion.p>
        )}

        {status === 'error' && (
          <motion.p
            className={styles.error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ru ? 'Ошибка отправки. Попробуйте позже.' : 'Submission error. Try later.'}
          </motion.p>
        )}

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting
            ? (ru ? 'Отправка...' : 'Sending...')
            : (ru ? 'Забронировать' : 'Book now')}
        </motion.button>

        <p className={styles.notice}>
          {ru
            ? 'Минимальная аренда — 3 часа. Мы свяжемся с вами для уточнения маршрута.'
            : 'Minimum rental — 3 hours. We will contact you to clarify the route.'}
        </p>
      </form>
      </motion.div>
    </div>
  );
}
