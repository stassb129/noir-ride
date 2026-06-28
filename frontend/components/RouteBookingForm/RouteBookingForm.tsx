'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import VehicleSelector from '@/components/VehicleSelector/VehicleSelector';
import { fetchVehicles, type Vehicle } from '@/lib/api/vehicles';
import {
  fetchDestinations,
  fetchDistance,
  fetchCitySuggestion,
  calcPrice,
  formatPrice,
  MAX_CUSTOM_DISTANCE_KM,
  type InterCityDestination,
} from '@/lib/api/intercity';
import { clampPassengers, parsePassengersInput } from '@/lib/booking-passengers';
import { getPrefilledPassengers, useVehiclePrefill } from '@/lib/use-vehicle-prefill';
import { getMinBookingDate, getBookingDateError, isBookingDateValid } from '@/lib/booking-date';
import {
  collectKnownCities,
  collectTypoCandidates,
  getCityForCalculation,
  hasPendingSuggestion,
  isExistingCityInput,
  citiesMatch,
} from '@/lib/city-names';
import styles from './RouteBookingForm.module.scss';

interface Props {
  prefilledData?: { from?: string; to?: string; date?: string };
  initialVehicleId?: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function resolveTypoSuggestion(
  input: string,
  origin: string,
  knownCities: string[],
  literalResult: { found: boolean; distanceKm: number },
): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed || !origin.trim() || isExistingCityInput(trimmed, knownCities)) return null;

  const needsHelp = !literalResult.found || literalResult.distanceKm > MAX_CUSTOM_DISTANCE_KM;
  if (!needsHelp) return null;

  const candidates = collectTypoCandidates(trimmed, knownCities);
  const { suggestion: geoSuggestion } = await fetchCitySuggestion(trimmed);
  if (
    geoSuggestion
    && !citiesMatch(geoSuggestion, trimmed)
    && !candidates.some((c) => citiesMatch(c, geoSuggestion))
  ) {
    candidates.push(geoSuggestion);
  }

  for (const candidate of candidates) {
    const candidateResult = await fetchDistance(origin, candidate);
    if (
      candidateResult.found
      && candidateResult.distanceKm <= MAX_CUSTOM_DISTANCE_KM
      && (!literalResult.found || literalResult.distanceKm > MAX_CUSTOM_DISTANCE_KM)
    ) {
      return candidate;
    }
  }

  return null;
}

export default function RouteBookingForm({ prefilledData, initialVehicleId }: Props) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const minDate = getMinBookingDate();

  /* ── state ─────────────────────────────────── */
  const [destinations, setDestinations] = useState<InterCityDestination[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    from: 'Москва', to: '',
    date: '', time: '10:00',
    passengers: 1,
    notes: '',
    vehicleId: null as number | null,
    vehicleName: '',
  });

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  const [dateError, setDateError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [typoSuggestions, setTypoSuggestions] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  const calcRequestRef = useRef(0);
  const lastCalcKeyRef = useRef('');

  /* ── load ───────────────────────────────────── */
  useEffect(() => {
    fetchDestinations().then(setDestinations);
    fetchVehicles().then(setVehicles);
  }, []);

  const applyVehiclePrefill = useCallback((vehicle: Vehicle) => {
    setForm((prev) => ({
      ...prev,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      passengers: getPrefilledPassengers(prev.passengers, vehicle),
    }));
    setVehicleError(null);
  }, []);

  useVehiclePrefill(vehicles, initialVehicleId, applyVehiclePrefill);

  /* ── prefill ────────────────────────────────── */
  useEffect(() => {
    if (prefilledData) {
      setForm((p) => ({
        ...p,
        from: prefilledData.from ?? p.from,
        to: prefilledData.to ?? p.to,
        date: prefilledData.date ?? p.date,
      }));
    }
  }, [prefilledData]);

  const knownCities = useMemo(() => collectKnownCities(destinations), [destinations]);

  const calcFrom = getCityForCalculation(form.from, knownCities, typoSuggestions.from);
  const calcTo = getCityForCalculation(form.to, knownCities, typoSuggestions.to);

  useEffect(() => {
    lastCalcKeyRef.current = '';
    setTypoSuggestions({ from: null, to: null });
  }, [form.from, form.to]);

  /* ── distance calculation ───────────────────── */
  useEffect(() => {
    if (!form.from.trim() || !form.to.trim()) {
      setDistanceKm(null);
      setDistanceError(null);
      setDistanceLoading(false);
      lastCalcKeyRef.current = '';
      return;
    }

    const calcKey = `${calcFrom}|${calcTo}`;
    if (calcKey === lastCalcKeyRef.current) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      const requestId = ++calcRequestRef.current;
      setDistanceLoading(true);

      const result = await fetchDistance(calcFrom, calcTo);
      if (cancelled || requestId !== calcRequestRef.current) return;

      lastCalcKeyRef.current = calcKey;
      setDistanceLoading(false);

      if (!result.found || result.distanceKm === 0) {
        setDistanceKm(null);
        const [fromTypo, toTypo] = await Promise.all([
          resolveTypoSuggestion(form.from, calcTo, knownCities, result),
          resolveTypoSuggestion(form.to, calcFrom, knownCities, result),
        ]);
        if (cancelled || requestId !== calcRequestRef.current) return;
        setTypoSuggestions({ from: fromTypo, to: toTypo });
        setDistanceError(
          ru
            ? 'Не удалось определить расстояние. Проверьте названия городов или выберите подсказку.'
            : 'Could not calculate distance. Check city names or use a suggestion.',
        );
        return;
      }

      const isPredefined = destinations.some(
        (d) => d.from === calcFrom && d.to === calcTo,
      );

      if (!isPredefined && result.distanceKm > MAX_CUSTOM_DISTANCE_KM) {
        setDistanceKm(result.distanceKm);
        const [fromTypo, toTypo] = await Promise.all([
          resolveTypoSuggestion(form.from, calcTo, knownCities, result),
          resolveTypoSuggestion(form.to, calcFrom, knownCities, result),
        ]);
        if (cancelled || requestId !== calcRequestRef.current) return;
        setTypoSuggestions({ from: fromTypo, to: toTypo });

        const farCity = hasPendingSuggestion(form.to, toTypo)
          ? form.to
          : hasPendingSuggestion(form.from, fromTypo)
            ? form.from
            : form.to;

        setDistanceError(
          ru
            ? `Расстояние до «${farCity}» — ${result.distanceKm.toLocaleString('ru-RU')} км. Максимум для заказа — ${MAX_CUSTOM_DISTANCE_KM} км.`
            : `Distance to «${farCity}» is ${result.distanceKm.toLocaleString()} km. Maximum is ${MAX_CUSTOM_DISTANCE_KM} km.`,
        );
        return;
      }

      setTypoSuggestions({ from: null, to: null });
      setDistanceError(null);
      setDistanceKm(result.distanceKm);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.from, form.to, calcFrom, calcTo, knownCities, destinations, ru]);

  /* ── helpers ────────────────────────────────── */
  const selectedVehicle = form.vehicleId
    ? vehicles.find((v) => v.id === form.vehicleId)
    : null;
  const maxPassengers = selectedVehicle?.passengers ?? 1;

  const totalPrice =
    selectedVehicle && distanceKm
      ? calcPrice(distanceKm, Number(selectedVehicle.pricePerKm ?? 100))
      : null;

  const isDistanceOk = distanceKm !== null && !distanceError;

  /* ── unique cities ──────────────────────────── */
  const fromCities = [...new Set(destinations.map((d) => d.from))];
  const toCities = destinations.filter((d) => d.from === form.from).map((d) => d.to);

  /* ── submit ─────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBookingDateValid(form.date, minDate)) {
      setDateError(getBookingDateError(form.date, ru ? 'ru' : 'en', minDate));
      return;
    }
    if (!form.vehicleId) {
      setVehicleError(ru ? 'Выберите автомобиль' : 'Please choose a vehicle');
      return;
    }
    if (!isDistanceOk) {
      return;
    }

    const resolvedFrom = getCityForCalculation(form.from, knownCities, typoSuggestions.from);
    const resolvedTo = getCityForCalculation(form.to, knownCities, typoSuggestions.to);

    setIsSubmitting(true);
    setStatus('idle');
    setVehicleError(null);

    try {
      const res = await fetch(`${API_URL}/bookings/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          from: resolvedFrom,
          to: resolvedTo,
          distanceKm,
          price: totalPrice ?? 0,
        }),
      });

      if (!res.ok) throw new Error();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 6000);
      setForm({
        name: '', phone: '', email: '',
        from: 'Москва', to: '',
        date: '', time: '10:00',
        passengers: 1, notes: '',
        vehicleId: null, vehicleName: '',
      });
      setDistanceKm(null);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: unknown) =>
    setForm((p) => ({ ...p, [field]: value }));

  const applyCitySuggestion = (field: 'from' | 'to', city: string) => {
    set(field, city);
    setTypoSuggestions((prev) => ({ ...prev, [field]: null }));
    lastCalcKeyRef.current = '';
  };

  const renderCitySuggestion = (field: 'from' | 'to', suggestion: string | null) => {
    if (!suggestion || !hasPendingSuggestion(form[field], suggestion)) return null;

    return (
      <div className={styles.citySuggestion}>
        <span>
          {ru ? 'Возможно, вы имели в виду: ' : 'Did you mean: '}
          <strong>{suggestion}</strong>
          {ru ? ' (в радиусе 300 км)' : ' (within 300 km)'}
          ?
        </span>
        <button
          type="button"
          className={styles.citySuggestionBtn}
          onClick={() => applyCitySuggestion(field, suggestion)}
        >
          {ru ? 'Использовать' : 'Use this'}
        </button>
      </div>
    );
  };

  /* ── render ─────────────────────────────────── */
  return (
    <div className={styles.bookingWrapper}>
      {/* Vehicle selector */}
      <section className={styles.vehicleSection}>
        <VehicleSelector
          serviceType="intercity"
          variant="wide"
          value={form.vehicleId}
          onChange={(id, name, _price, vehicleMaxPassengers) => {
            setVehicleError(null);
            setForm((prev) => ({
              ...prev,
              vehicleId: id,
              vehicleName: name,
              passengers: clampPassengers(prev.passengers, vehicleMaxPassengers),
            }));
          }}
        />
        {vehicleError && <p className={styles.fieldError}>{vehicleError}</p>}
      </section>

      <motion.div
        className={styles.form}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className={styles.title}>
          {ru ? 'Детали поездки' : 'Trip details'}
        </h3>

        <form onSubmit={handleSubmit} className={styles.formContent}>

          {/* From / To */}
          <div className={styles.routeRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Откуда *' : 'From *'}</label>
              <input
                list="from-list"
                className={styles.input}
                value={form.from}
                onChange={(e) => set('from', e.target.value)}
                placeholder={ru ? 'Город отправления' : 'Departure city'}
                required
              />
              <datalist id="from-list">
                {fromCities.map((c) => <option key={c} value={c} />)}
              </datalist>
              {renderCitySuggestion('from', typoSuggestions.from)}
            </div>

            <div className={styles.routeArrowDivider}>→</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Куда *' : 'To *'}</label>
              <input
                list="to-list"
                className={styles.input}
                value={form.to}
                onChange={(e) => set('to', e.target.value)}
                placeholder={ru ? 'Город назначения' : 'Destination city'}
                required
              />
              <datalist id="to-list">
                {toCities.map((c) => <option key={c} value={c} />)}
              </datalist>
              {renderCitySuggestion('to', typoSuggestions.to)}
            </div>
          </div>

          {/* Distance / Price block */}
          {(distanceLoading || distanceKm !== null || distanceError) && (
            <div className={`${styles.priceBlock} ${distanceLoading ? styles.priceBlockLoading : ''}`}>
              {distanceLoading && (
                <div className={styles.priceLoader} aria-live="polite">
                  <span className={styles.spinner} />
                  <span>{ru ? 'Рассчитываем маршрут…' : 'Calculating route…'}</span>
                </div>
              )}
              {!distanceLoading && distanceError && (
                <p className={styles.priceError}>{distanceError}</p>
              )}
              {!distanceLoading && distanceKm !== null && !distanceError && (
                <div className={styles.priceDetails}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceRowLabel}>{ru ? 'Расстояние:' : 'Distance:'}</span>
                    <span className={styles.priceRowValue}>{distanceKm} км</span>
                  </div>
                  {selectedVehicle && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceRowLabel}>{ru ? 'Стоимость авто:' : 'Vehicle rate:'}</span>
                      <span className={styles.priceRowValue}>{Number(selectedVehicle.pricePerKm ?? 70)} ₽/км × {distanceKm} = {formatPrice(Number(selectedVehicle.pricePerKm ?? 70) * distanceKm)}</span>
                    </div>
                  )}
                  {totalPrice !== null && (
                    <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                      <span className={styles.priceRowLabel}>{ru ? 'Итого:' : 'Total:'}</span>
                      <span className={styles.priceTotalValue}>{formatPrice(totalPrice)}</span>
                    </div>
                  )}
                  {!selectedVehicle && (
                    <p className={styles.priceHint}>
                      {ru ? '↑ Выберите автомобиль для расчёта итоговой стоимости' : '↑ Select a vehicle to see total price'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Date / Time */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Дата *' : 'Date *'}</label>
              <input
                type="date"
                className={styles.input}
                value={form.date}
                min={minDate}
                onChange={(e) => {
                  set('date', e.target.value);
                  setDateError(getBookingDateError(e.target.value, locale, minDate));
                }}
                onBlur={(e) => setDateError(getBookingDateError(e.target.value, locale, minDate))}
                required
              />
              {dateError && <p className={styles.fieldError}>{dateError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Время' : 'Time'}</label>
              <input
                type="time"
                className={styles.input}
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>
          </div>

          {/* Name / Phone / Email */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Имя *' : 'Name *'}</label>
              <input className={styles.input} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Телефон *' : 'Phone *'}</label>
              <input className={styles.input} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Email *' : 'Email *'}</label>
              <input className={styles.input} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {selectedVehicle
                  ? (ru ? `Пассажиров (макс. ${maxPassengers})` : `Passengers (max ${maxPassengers})`)
                  : (ru ? 'Пассажиров' : 'Passengers')}
              </label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={maxPassengers}
                value={form.passengers}
                disabled={!selectedVehicle}
                onChange={(e) => set('passengers', parsePassengersInput(e.target.value, maxPassengers))}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{ru ? 'Примечания' : 'Notes'}</label>
            <textarea className={styles.textarea} rows={3} value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder={ru ? 'Дополнительные пожелания...' : 'Additional requests...'} />
          </div>

          <motion.button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !!distanceError}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isSubmitting
              ? (ru ? 'Отправка...' : 'Sending...')
              : (ru ? 'Оформить поездку' : 'Book trip')}
          </motion.button>

          {status === 'success' && (
            <p className={styles.success}>
              {ru ? '✓ Заявка принята! Мы свяжемся с вами в течение часа.' : '✓ Request received! We will contact you within an hour.'}
            </p>
          )}
          {status === 'error' && (
            <p className={styles.error}>
              {ru ? 'Ошибка отправки. Попробуйте ещё раз или позвоните нам.' : 'Submission error. Please try again or call us.'}
            </p>
          )}

          <p className={styles.notice}>
            {ru
              ? 'Стоимость будет подтверждена менеджером. Окончательная цена зависит от выбранного автомобиля и маршрута.'
              : 'Final price will be confirmed by a manager depending on the vehicle and route.'}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
