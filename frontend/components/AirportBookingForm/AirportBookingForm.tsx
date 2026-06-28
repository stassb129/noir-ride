'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import VehicleSelector from '@/components/VehicleSelector/VehicleSelector';
import { getMinBookingDate, getBookingDateError, isBookingDateValid } from '@/lib/booking-date';
import { clampPassengers, parsePassengersInput } from '@/lib/booking-passengers';
import { fetchVehicles, type Vehicle } from '@/lib/api/vehicles';
import { getPrefilledPassengers, useVehiclePrefill } from '@/lib/use-vehicle-prefill';
import styles from '../RouteBookingForm/RouteBookingForm.module.scss';

interface Props {
  initialVehicleId?: number | null;
  selectedAirport: string;
}

export default function AirportBookingForm({ initialVehicleId, selectedAirport }: Props) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const minDate = getMinBookingDate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: 'pickup',
    airport: selectedAirport,
    address: '',
    date: '',
    time: '',
    flightNumber: '',
    vehicleId: null as number | null,
    vehicleName: '',
    passengers: 1,
    luggage: 2,
    meetSign: false,
    meetSignText: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dateError, setDateError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [meetSignError, setMeetSignError] = useState<string | null>(null);
  const [vehicleMaxPassengers, setVehicleMaxPassengers] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchVehicles().then(setVehicles);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, airport: selectedAirport }));
  }, [selectedAirport]);

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

  const resetForm = () => ({
    name: '',
    phone: '',
    email: '',
    serviceType: 'pickup',
    airport: selectedAirport,
    address: '',
    date: '',
    time: '',
    flightNumber: '',
    vehicleId: null as number | null,
    vehicleName: '',
    passengers: 1,
    luggage: 2,
    meetSign: false,
    meetSignText: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateValidationError = getBookingDateError(formData.date, locale, minDate);
    if (!isBookingDateValid(formData.date, minDate)) {
      setDateError(dateValidationError);
      return;
    }

    if (!formData.vehicleId) {
      setVehicleError(ru ? 'Выберите автомобиль' : 'Please choose a vehicle');
      return;
    }

    if (formData.serviceType === 'pickup' && formData.meetSign && !formData.meetSignText.trim()) {
      setMeetSignError(ru ? 'Укажите текст на табличке' : 'Please enter the sign text');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setVehicleError(null);
    setMeetSignError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/airport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          airport: selectedAirport,
          passengers: Number(formData.passengers),
          luggage: Number(formData.luggage),
          meetSign: formData.serviceType === 'pickup' ? formData.meetSign : false,
          meetSignText:
            formData.serviceType === 'pickup' && formData.meetSign
              ? formData.meetSignText.trim()
              : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      setDateError(null);
      setVehicleError(null);
      setMeetSignError(null);
      setVehicleMaxPassengers(null);
      setFormData(resetForm());

      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'passengers') {
      if (!maxPassengers) return;
      setFormData((prev) => ({
        ...prev,
        passengers: parsePassengersInput(value, maxPassengers),
      }));
      return;
    }
    const nextValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (name === 'date') setDateError(getBookingDateError(value, locale, minDate));
    if (name === 'meetSignText') setMeetSignError(null);
  };

  const validateDate = (e: React.FocusEvent<HTMLInputElement>) => {
    setDateError(getBookingDateError(e.target.value, locale, minDate));
  };

  return (
    <div className={styles.bookingWrapper}>
      <section className={styles.vehicleSection}>
        <VehicleSelector
          serviceType="airport"
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
        className={styles.form}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={styles.title}>
          {ru ? 'Заказать трансфер' : 'Book airport transfer'}
        </h3>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {ru ? 'Ваше имя' : 'Your name'}
              </label>
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
              <label className={styles.label}>
                {ru ? 'Телефон' : 'Phone'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 999 123 45 67"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {ru ? 'Тип услуги' : 'Service type'}
              </label>
              <CustomSelect
                variant="boxed"
                name="serviceType"
                value={formData.serviceType}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceType: value,
                    meetSign: value === 'pickup' ? prev.meetSign : false,
                    meetSignText: value === 'pickup' ? prev.meetSignText : '',
                  }))
                }
                options={[
                  { value: 'pickup', label: ru ? 'Встреча из аэропорта' : 'Airport pickup' },
                  { value: 'dropoff', label: ru ? 'Проводы в аэропорт' : 'Airport drop-off' },
                ]}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ru ? 'Адрес' : 'Address'}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={
                formData.serviceType === 'pickup'
                  ? (ru ? 'Адрес назначения в Москве' : 'Destination address in Moscow')
                  : (ru ? 'Адрес подачи в Москве' : 'Pickup address in Moscow')
              }
              className={styles.input}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {ru ? 'Дата' : 'Date'}
              </label>
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
              <label className={styles.label}>
                {ru ? 'Время' : 'Time'}
              </label>
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
              <label className={styles.label}>
                {ru ? 'Номер рейса' : 'Flight number'}
              </label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                placeholder="SU1234"
                className={styles.input}
                required
                minLength={2}
                maxLength={15}
              />
            </div>

            {formData.serviceType === 'pickup' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {ru ? 'Встреча с табличкой' : 'Meet & greet sign'}
                </label>
                <CustomSelect
                  variant="boxed"
                  name="meetSign"
                  value={formData.meetSign ? 'yes' : 'no'}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      meetSign: value === 'yes',
                      meetSignText:
                        value === 'yes' ? (prev.meetSignText || prev.name) : '',
                    }))
                  }
                  options={[
                    { value: 'no', label: ru ? 'Без таблички' : 'No sign' },
                    { value: 'yes', label: ru ? 'С табличкой' : 'With sign' },
                  ]}
                />
              </div>
            )}
          </div>

          {formData.serviceType === 'pickup' && formData.meetSign && (
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {ru ? 'Текст на табличке *' : 'Sign text *'}
                </label>
                <input
                  type="text"
                  name="meetSignText"
                  value={formData.meetSignText}
                  onChange={handleChange}
                  placeholder={ru ? 'Имя или текст для водителя' : 'Name or text for the driver'}
                  className={styles.input}
                  required
                  maxLength={80}
                />
                {meetSignError && <p className={styles.fieldError}>{meetSignError}</p>}
              </div>
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {maxPassengers
                  ? (ru ? `Пассажиров (макс. ${maxPassengers})` : `Passengers (max ${maxPassengers})`)
                  : (ru ? 'Пассажиров (выберите авто)' : 'Passengers (select vehicle)')}
              </label>
              <input
                type="number"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                min="1"
                max={maxPassengers ?? 1}
                disabled={!maxPassengers}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {ru ? 'Количество багажа' : 'Luggage pieces'}
              </label>
              <input
                type="number"
                name="luggage"
                value={formData.luggage}
                onChange={handleChange}
                min="0"
                max="10"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ru ? 'Комментарий (необязательно)' : 'Comment (optional)'}
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
              : (ru ? 'Заказать трансфер' : 'Book transfer')}
          </motion.button>

          <p className={styles.notice}>
            {ru
              ? 'Мы свяжемся с вами для подтверждения деталей и расчёта итоговой стоимости'
              : 'We will contact you to confirm details and calculate the final cost'}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
