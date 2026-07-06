'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import VehicleSelector, { type Vehicle } from '@/components/VehicleSelector/VehicleSelector';
import PhoneInput from '@/components/ui/PhoneInput/PhoneInput';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import {
  fetchDestinations,
  fetchDistance,
  calcPrice,
  formatPrice,
  MAX_CUSTOM_DISTANCE_KM,
  type InterCityDestination,
} from '@/lib/api/intercity';
import { fetchVehicles } from '@/lib/api/vehicles';
import { getMinBookingDate, getBookingDateError, isBookingDateValid } from '@/lib/booking-date';
import { clampPassengers, getPassengerSelectOptions } from '@/lib/booking-passengers';
import {
  DEFAULT_DRIVER_PREFERENCE,
  getDriverPreferenceOptions,
  type DriverPreference,
} from '@/lib/driver-preference';
import { getPhoneValidationError } from '@/lib/phone';
import { calcAirportBookingPrice, calcHourlyPrice, formatBookingPrice } from '@/lib/booking-price';
import { useUser } from '@/lib/hooks/useUser';
import { getAuthHeaders, setToken } from '@/lib/user-auth';
import styles from './BookingWizard.module.scss';

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceType = 'route' | 'airport' | 'hourly';
type WizardStep = 1 | 2 | 3 | 4;

interface WizardState {
  serviceType: ServiceType | null;
  // Route
  from: string;
  to: string;
  // Airport
  airport: string;
  airportDirection: 'pickup' | 'dropoff';
  address: string;
  flightNumber: string;
  luggage: number;
  meetSign: boolean;
  meetSignText: string;
  // Hourly
  pickupAddress: string;
  hours: number;
  // Shared
  date: string;
  time: string;
  passengers: number;
  notes: string;
  driverPreference: DriverPreference;
  vehicleId: number | null;
  vehicleName: string;
  vehicleMaxPassengers: number | null;
  // Contact
  name: string;
  phone: string;
  email: string;
}

const AIRPORTS = [
  { code: 'SVO', ru: 'Шереметьево', en: 'Sheremetyevo' },
  { code: 'DME', ru: 'Домодедово', en: 'Domodedovo' },
  { code: 'VKO', ru: 'Внуково', en: 'Vnukovo' },
] as const;

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }),
};

// ─── Inline auth ─────────────────────────────────────────────────────────────

function InlineAuth({ onSuccess }: { onSuccess: () => void }) {
  const ru = useLocale() === 'ru';
  const { setUser } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const endpoint =
      mode === 'register'
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/user/register`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/user/login`;
    const body = mode === 'register' ? { phone, password, name: name || undefined } : { phone, password };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? (ru ? 'Произошла ошибка' : 'An error occurred'));
        return;
      }
      setToken(data.access_token);
      setUser(data.user);
      onSuccess();
    } catch {
      setError(ru ? 'Ошибка соединения' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.authGate}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.authGateIcon}>🔒</div>
      <h3 className={styles.authGateTitle}>
        {ru ? 'Войдите для оформления' : 'Sign in to complete booking'}
      </h3>
      <p className={styles.authGateDesc}>
        {ru
          ? 'Необходима авторизация для подтверждения бронирования и сохранения истории поездок'
          : 'Authorization is required to confirm booking and save your trip history'}
      </p>

      <div className={styles.inlineAuthTabs}>
        <button
          type="button"
          className={`${styles.inlineAuthTab} ${mode === 'login' ? styles.active : ''}`}
          onClick={() => setMode('login')}
        >
          {ru ? 'Войти' : 'Sign in'}
        </button>
        <button
          type="button"
          className={`${styles.inlineAuthTab} ${mode === 'register' ? styles.active : ''}`}
          onClick={() => setMode('register')}
        >
          {ru ? 'Регистрация' : 'Register'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.inlineAuthForm}>
        {mode === 'register' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>{ru ? 'Имя (необязательно)' : 'Name (optional)'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ru ? 'Иван Иванов' : 'John Doe'}
              className={styles.input}
              autoComplete="name"
            />
          </div>
        )}
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Телефон' : 'Phone'}</label>
          <PhoneInput value={phone} onChange={setPhone} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Пароль' : 'Password'}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? (ru ? 'Минимум 6 символов' : 'At least 6 characters') : '••••••••'}
            className={styles.input}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>
        {error && <p className={styles.fieldError}>{error}</p>}
        <motion.button
          type="submit"
          className={styles.btnNext}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading
            ? (ru ? 'Загрузка...' : 'Loading...')
            : mode === 'login'
              ? (ru ? 'Войти' : 'Sign in')
              : (ru ? 'Зарегистрироваться' : 'Create account')}
        </motion.button>
      </form>
    </motion.div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  serviceType,
  ru,
}: {
  currentStep: WizardStep;
  serviceType: ServiceType | null;
  ru: boolean;
}) {
  const step2Label = serviceType === 'route'
    ? (ru ? 'Маршрут' : 'Route')
    : serviceType === 'airport'
      ? (ru ? 'Аэропорт' : 'Airport')
      : (ru ? 'Аренда' : 'Rental');

  const steps = [
    { n: 1, label: ru ? 'Услуга' : 'Service' },
    { n: 2, label: step2Label },
    { n: 3, label: ru ? 'Автомобиль' : 'Vehicle' },
    { n: 4, label: ru ? 'Контакты' : 'Contacts' },
  ];

  return (
    <div className={styles.stepIndicator}>
      {steps.map((s, i) => {
        const done = currentStep > s.n;
        const active = currentStep === s.n;
        return (
          <div key={s.n} className={`${styles.stepItem} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
            <div className={styles.stepCircle}>
              {done ? '✓' : s.n}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

interface BookingWizardProps {
  initialType?: ServiceType;
  initialVehicleId?: number;
  initialFrom?: string;
  initialTo?: string;
  initialAirport?: string;
}

export default function BookingWizard({
  initialType,
  initialVehicleId,
  initialFrom,
  initialTo,
  initialAirport,
}: BookingWizardProps) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const minDate = getMinBookingDate();
  const { user, isLoggedIn, isLoading } = useUser();

  // Pre-selected vehicle only pre-fills state — user still goes through route/details first
  const startStep: WizardStep = initialType ? 2 : 1;
  const [step, setStep] = useState<WizardStep>(startStep);
  const [direction, setDirection] = useState(1);

  const [state, setState] = useState<WizardState>({
    serviceType: initialType ?? null,
    from: initialFrom ?? 'Москва', to: initialTo ?? '',
    airport: initialAirport ?? 'SVO', airportDirection: 'pickup',
    address: '', flightNumber: '',
    luggage: 2, meetSign: false, meetSignText: '',
    pickupAddress: '', hours: 3,
    date: '', time: '',
    passengers: 1, notes: '',
    driverPreference: DEFAULT_DRIVER_PREFERENCE,
    vehicleId: null, vehicleName: '',
    vehicleMaxPassengers: null,
    name: '', phone: '', email: '',
  });

  // Prefill from user profile
  useEffect(() => {
    if (user) {
      setState((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const set = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Distance calculation (route)
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const calcRequestRef = useRef(0);
  const lastCalcKeyRef = useRef('');

  useEffect(() => {
    if (!state.from.trim() || !state.to.trim()) {
      setDistanceKm(null);
      setDistanceError(null);
      setDistanceLoading(false);
      lastCalcKeyRef.current = '';
      return;
    }
    const calcKey = `${state.from}|${state.to}`;
    if (calcKey === lastCalcKeyRef.current) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const reqId = ++calcRequestRef.current;
      setDistanceLoading(true);
      setDistanceError(null);

      const result = await fetchDistance(state.from, state.to);
      if (cancelled || reqId !== calcRequestRef.current) return;

      lastCalcKeyRef.current = calcKey;
      setDistanceLoading(false);

      if (!result.found || result.distanceKm === 0) {
        setDistanceKm(null);
        setDistanceError(
          ru
            ? 'Не удалось определить расстояние. Проверьте названия городов.'
            : 'Could not calculate distance. Check city names.',
        );
        return;
      }
      if (result.distanceKm > MAX_CUSTOM_DISTANCE_KM) {
        setDistanceKm(result.distanceKm);
        setDistanceError(
          ru
            ? `Расстояние ${result.distanceKm.toLocaleString('ru-RU')} км превышает максимум ${MAX_CUSTOM_DISTANCE_KM} км.`
            : `Distance ${result.distanceKm.toLocaleString()} km exceeds maximum ${MAX_CUSTOM_DISTANCE_KM} km.`,
        );
        return;
      }
      setDistanceError(null);
      setDistanceKm(result.distanceKm);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state.from, state.to, ru]);

  // Destinations
  const [destinations, setDestinations] = useState<InterCityDestination[]>([]);
  useEffect(() => {
    fetchDestinations().then(setDestinations).catch(() => {});
  }, []);

  const fromCities = useMemo(() => [...new Set(destinations.map((d) => d.from))], [destinations]);
  const toCities = useMemo(
    () => destinations.filter((d) => d.from === state.from).map((d) => d.to),
    [destinations, state.from],
  );

  // Vehicles (preload)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    fetchVehicles().then((data) => {
      setVehicles(data);
      if (initialVehicleId) {
        const v = data.find((x) => x.id === initialVehicleId);
        if (v) {
          setState((prev) => ({
            ...prev,
            vehicleId: v.id,
            vehicleName: `${v.brand} ${v.model}`,
            vehicleMaxPassengers: v.passengers ?? 3,
          }));
        }
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === state.vehicleId) ?? null;
  const maxPassengers = state.vehicleMaxPassengers ?? (selectedVehicle?.passengers ?? null);

  // Pricing
  const totalPrice = useMemo(() => {
    if (!selectedVehicle) return null;
    if (state.serviceType === 'route' && distanceKm) {
      return calcPrice(distanceKm, Number(selectedVehicle.pricePerKm ?? 100));
    }
    if (state.serviceType === 'airport') {
      return calcAirportBookingPrice(selectedVehicle.priceAirport, state.airport);
    }
    if (state.serviceType === 'hourly') {
      return calcHourlyPrice(state.hours, selectedVehicle.priceHourly);
    }
    return null;
  }, [selectedVehicle, state.serviceType, state.airport, state.hours, distanceKm]);

  // ── Validation ──────────────────────────────────────────────────────────────

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (state.serviceType === 'route') {
      if (!state.from.trim()) errs.from = ru ? 'Укажите откуда' : 'Enter departure city';
      if (!state.to.trim()) errs.to = ru ? 'Укажите куда' : 'Enter destination city';
      if (distanceError) errs.distance = distanceError;
      if (distanceLoading) errs.distance = ru ? 'Идёт расчёт маршрута...' : 'Calculating route...';
      if (!state.date) errs.date = ru ? 'Укажите дату' : 'Choose a date';
      else if (!isBookingDateValid(state.date, minDate)) {
        errs.date = getBookingDateError(state.date, locale, minDate) ?? (ru ? 'Некорректная дата' : 'Invalid date');
      }
      if (!state.time) errs.time = ru ? 'Укажите время' : 'Choose a time';
    } else if (state.serviceType === 'airport') {
      if (!state.address.trim()) errs.address = ru ? 'Укажите адрес' : 'Enter address';
      if (!state.flightNumber.trim()) errs.flightNumber = ru ? 'Укажите рейс' : 'Enter flight number';
      if (!state.date) errs.date = ru ? 'Укажите дату' : 'Choose a date';
      else if (!isBookingDateValid(state.date, minDate)) {
        errs.date = getBookingDateError(state.date, locale, minDate) ?? (ru ? 'Некорректная дата' : 'Invalid date');
      }
      if (!state.time) errs.time = ru ? 'Укажите время' : 'Choose a time';
    } else if (state.serviceType === 'hourly') {
      if (!state.pickupAddress.trim()) errs.pickupAddress = ru ? 'Укажите адрес' : 'Enter pickup address';
      if (!state.date) errs.date = ru ? 'Укажите дату' : 'Choose a date';
      else if (!isBookingDateValid(state.date, minDate)) {
        errs.date = getBookingDateError(state.date, locale, minDate) ?? (ru ? 'Некорректная дата' : 'Invalid date');
      }
      if (!state.time) errs.time = ru ? 'Укажите время' : 'Choose a time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!state.name.trim()) errs.name = ru ? 'Укажите имя' : 'Enter your name';
    const phoneErr = getPhoneValidationError(state.phone, locale);
    if (phoneErr) errs.phone = phoneErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goTo = (next: WizardStep) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!state.serviceType) return;
      goTo(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      goTo(3);
    } else if (step === 3) {
      if (!state.vehicleId) {
        setErrors({ vehicle: ru ? 'Выберите автомобиль' : 'Choose a vehicle' });
        return;
      }
      goTo(4);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!validateStep4()) return;
    setSubmitting(true);
    setSubmitStatus('idle');

    const baseBody = {
      name: state.name,
      phone: state.phone,
      email: state.email || undefined,
      date: state.date,
      time: state.time,
      passengers: state.passengers,
      notes: state.notes || undefined,
      driverPreference: state.driverPreference,
      vehicleId: state.vehicleId,
      vehicleName: state.vehicleName,
      price: totalPrice ?? 0,
      userId: user?.id ?? undefined,
    };

    try {
      let url = '';
      let body: object = {};

      if (state.serviceType === 'route') {
        url = `${process.env.NEXT_PUBLIC_API_URL}/bookings/route`;
        body = { ...baseBody, from: state.from, to: state.to, distanceKm };
      } else if (state.serviceType === 'airport') {
        url = `${process.env.NEXT_PUBLIC_API_URL}/bookings/airport`;
        body = {
          ...baseBody,
          airport: state.airport,
          serviceType: state.airportDirection,
          address: state.address,
          flightNumber: state.flightNumber,
          luggage: state.luggage,
          meetSign: state.meetSign,
          meetSignText: state.meetSign ? state.meetSignText : null,
        };
      } else if (state.serviceType === 'hourly') {
        url = `${process.env.NEXT_PUBLIC_API_URL}/bookings/hourly`;
        body = { ...baseBody, pickupAddress: state.pickupAddress, hours: state.hours };
      }

      const bookingRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (!bookingRes.ok) throw new Error('booking_failed');
      const booking = await bookingRes.json() as { id: number };

      // If price is known — redirect to YooKassa payment
      const price = totalPrice ?? 0;
      if (price > 0 && booking.id) {
        const locale = typeof window !== 'undefined'
          ? window.location.pathname.split('/')[1] || 'ru'
          : 'ru';
        const returnUrl = `${window.location.origin}/${locale}/booking/success?paymentId=__PAYMENT_ID__&bookingId=${booking.id}&bookingType=${state.serviceType}`;

        const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            bookingId: booking.id,
            bookingType: state.serviceType,
            amount: price,
            returnUrl,
          }),
        });

        if (payRes.ok) {
          const { confirmationUrl } = await payRes.json() as { confirmationUrl: string };
          if (confirmationUrl) {
            window.location.href = confirmationUrl;
            return;
          }
        }
      }

      // Fallback: no price configured — show inline success
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Hour options ────────────────────────────────────────────────────────────

  const hourOptions = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
    value: String(h),
    label: ru ? (h >= 5 ? `${h} часов` : `${h} часа`) : `${h} hours`,
  }));

  // ── Render steps ────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className={styles.stepBody}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{ru ? 'Выберите тип услуги' : 'Choose service type'}</h2>
        <p className={styles.stepSubtitle}>
          {ru ? 'Расскажите нам, куда вы хотите поехать' : 'Tell us where you want to go'}
        </p>
      </div>
      <div className={styles.serviceGrid}>
        {[
          {
            type: 'route' as ServiceType,
            icon: '🛣️',
            title: ru ? 'Межгород' : 'Intercity',
            desc: ru
              ? 'Москва — Санкт-Петербург, Нижний Новгород, Ярославль и другие направления'
              : 'Moscow to St Petersburg, Nizhny Novgorod, Yaroslavl and beyond',
          },
          {
            type: 'airport' as ServiceType,
            icon: '✈️',
            title: ru ? 'Аэропорт' : 'Airport',
            desc: ru
              ? 'Трансфер в Шереметьево, Домодедово или Внуково — встреча, проводы'
              : 'Transfer to Sheremetyevo, Domodedovo or Vnukovo — arrivals & departures',
          },
          {
            type: 'hourly' as ServiceType,
            icon: '⏱️',
            title: ru ? 'Почасовая' : 'Hourly',
            desc: ru
              ? 'Аренда автомобиля с водителем на 3–12 часов для деловых поездок'
              : 'Chauffeur-driven car rental from 3 to 12 hours for business trips',
          },
        ].map((svc) => (
          <motion.button
            key={svc.type}
            type="button"
            className={`${styles.serviceCard} ${state.serviceType === svc.type ? styles.serviceCardSelected : ''}`}
            onClick={() => { set('serviceType', svc.type); }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {state.serviceType === svc.type && <span className={styles.serviceCheck}>✓</span>}
            <span className={styles.serviceIcon}>{svc.icon}</span>
            <span className={styles.serviceTitle}>{svc.title}</span>
            <span className={styles.serviceDesc}>{svc.desc}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep2Route = () => (
    <div className={styles.stepBody}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{ru ? 'Детали маршрута' : 'Trip details'}</h2>
        <p className={styles.stepSubtitle}>{ru ? 'Укажите откуда, куда и когда' : 'Where from, where to and when'}</p>
      </div>

      <div className={styles.routeRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Откуда *' : 'From *'}</label>
          <input
            list="from-list"
            className={`${styles.input} ${errors.from ? styles.inputError : ''}`}
            value={state.from}
            onChange={(e) => { set('from', e.target.value); setDistanceKm(null); lastCalcKeyRef.current = ''; }}
            placeholder={ru ? 'Город отправления' : 'Departure city'}
          />
          <datalist id="from-list">{fromCities.map((c) => <option key={c} value={c} />)}</datalist>
          {errors.from && <p className={styles.fieldError}>{errors.from}</p>}
        </div>
        <div className={styles.routeArrow}>→</div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Куда *' : 'To *'}</label>
          <input
            list="to-list"
            className={`${styles.input} ${errors.to ? styles.inputError : ''}`}
            value={state.to}
            onChange={(e) => { set('to', e.target.value); setDistanceKm(null); lastCalcKeyRef.current = ''; }}
            placeholder={ru ? 'Город назначения' : 'Destination city'}
          />
          <datalist id="to-list">{toCities.map((c) => <option key={c} value={c} />)}</datalist>
          {errors.to && <p className={styles.fieldError}>{errors.to}</p>}
        </div>
      </div>

      {(distanceLoading || distanceKm !== null || distanceError) && (
        <div className={`${styles.distanceBlock} ${distanceError ? styles.distanceBlockError : ''}`}>
          {distanceLoading && (
            <div className={styles.distanceLoading}>
              <span className={styles.spinner} />
              <span>{ru ? 'Рассчитываем маршрут...' : 'Calculating route...'}</span>
            </div>
          )}
          {!distanceLoading && distanceError && (
            <p className={styles.distanceErrorText}>{distanceError}</p>
          )}
          {!distanceLoading && distanceKm !== null && !distanceError && (
            <div className={styles.distanceInfo}>
              <span className={styles.distanceLabel}>{ru ? 'Расстояние:' : 'Distance:'}</span>
              <span className={styles.distanceValue}>{distanceKm.toLocaleString('ru-RU')} км</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Дата *' : 'Date *'}</label>
          <input
            type="date"
            className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
            value={state.date}
            min={minDate}
            onChange={(e) => { set('date', e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
          />
          {errors.date && <p className={styles.fieldError}>{errors.date}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Время *' : 'Time *'}</label>
          <input
            type="time"
            className={styles.input}
            value={state.time}
            onChange={(e) => set('time', e.target.value)}
          />
          {errors.time && <p className={styles.fieldError}>{errors.time}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2Airport = () => (
    <div className={styles.stepBody}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{ru ? 'Детали трансфера' : 'Transfer details'}</h2>
        <p className={styles.stepSubtitle}>{ru ? 'Аэропорт, направление и время' : 'Airport, direction and time'}</p>
      </div>

      <div className={styles.formGroup} style={{ marginBottom: 20 }}>
        <label className={styles.label}>{ru ? 'Аэропорт *' : 'Airport *'}</label>
        <div className={styles.optionGrid}>
          {AIRPORTS.map((a) => (
            <button
              key={a.code}
              type="button"
              className={`${styles.optionBtn} ${state.airport === a.code ? styles.optionBtnSelected : ''}`}
              onClick={() => set('airport', a.code)}
            >
              <span className={styles.airportCode}>{a.code}</span>
              <span className={styles.airportName}>{ru ? a.ru : a.en}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup} style={{ marginBottom: 20 }}>
        <label className={styles.label}>{ru ? 'Тип услуги *' : 'Service type *'}</label>
        <div className={styles.directionGrid}>
          <button
            type="button"
            className={`${styles.directionBtn} ${state.airportDirection === 'pickup' ? styles.directionBtnSelected : ''}`}
            onClick={() => set('airportDirection', 'pickup')}
          >
            <span className={styles.directionIcon}>🛬</span>
            <span className={styles.directionLabel}>{ru ? 'Встреча из аэропорта' : 'Pickup from airport'}</span>
          </button>
          <button
            type="button"
            className={`${styles.directionBtn} ${state.airportDirection === 'dropoff' ? styles.directionBtnSelected : ''}`}
            onClick={() => set('airportDirection', 'dropoff')}
          >
            <span className={styles.directionIcon}>🛫</span>
            <span className={styles.directionLabel}>{ru ? 'Проводы в аэропорт' : 'Drop-off to airport'}</span>
          </button>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.label}>
            {state.airportDirection === 'pickup'
              ? (ru ? 'Адрес назначения *' : 'Destination address *')
              : (ru ? 'Адрес подачи *' : 'Pickup address *')}
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
            value={state.address}
            onChange={(e) => { set('address', e.target.value); setErrors((p) => ({ ...p, address: undefined })); }}
            placeholder={
              state.airportDirection === 'pickup'
                ? (ru ? 'Адрес куда доставить' : 'Delivery address in Moscow')
                : (ru ? 'Откуда забрать' : 'Pickup address in Moscow')
            }
          />
          {errors.address && <p className={styles.fieldError}>{errors.address}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Номер рейса *' : 'Flight number *'}</label>
          <input
            type="text"
            className={`${styles.input} ${errors.flightNumber ? styles.inputError : ''}`}
            value={state.flightNumber}
            onChange={(e) => { set('flightNumber', e.target.value.toUpperCase()); setErrors((p) => ({ ...p, flightNumber: undefined })); }}
            placeholder="SU1234"
            maxLength={15}
          />
          {errors.flightNumber && <p className={styles.fieldError}>{errors.flightNumber}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Количество багажа' : 'Luggage pieces'}</label>
          <input
            type="number"
            className={styles.input}
            value={state.luggage}
            onChange={(e) => set('luggage', Number(e.target.value))}
            min={0}
            max={10}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Дата *' : 'Date *'}</label>
          <input
            type="date"
            className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
            value={state.date}
            min={minDate}
            onChange={(e) => { set('date', e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
          />
          {errors.date && <p className={styles.fieldError}>{errors.date}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Время *' : 'Time *'}</label>
          <input
            type="time"
            className={styles.input}
            value={state.time}
            onChange={(e) => set('time', e.target.value)}
          />
          {errors.time && <p className={styles.fieldError}>{errors.time}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2Hourly = () => (
    <div className={styles.stepBody}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{ru ? 'Детали аренды' : 'Rental details'}</h2>
        <p className={styles.stepSubtitle}>{ru ? 'Адрес подачи, дата и продолжительность' : 'Pickup address, date and duration'}</p>
      </div>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.label}>{ru ? 'Адрес подачи *' : 'Pickup address *'}</label>
          <input
            type="text"
            className={`${styles.input} ${errors.pickupAddress ? styles.inputError : ''}`}
            value={state.pickupAddress}
            onChange={(e) => { set('pickupAddress', e.target.value); setErrors((p) => ({ ...p, pickupAddress: undefined })); }}
            placeholder={ru ? 'Откуда подать автомобиль' : 'Where to pick you up'}
          />
          {errors.pickupAddress && <p className={styles.fieldError}>{errors.pickupAddress}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Дата *' : 'Date *'}</label>
          <input
            type="date"
            className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
            value={state.date}
            min={minDate}
            onChange={(e) => { set('date', e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
          />
          {errors.date && <p className={styles.fieldError}>{errors.date}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Время *' : 'Time *'}</label>
          <input
            type="time"
            className={styles.input}
            value={state.time}
            onChange={(e) => set('time', e.target.value)}
          />
          {errors.time && <p className={styles.fieldError}>{errors.time}</p>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{ru ? 'Количество часов *' : 'Hours *'}</label>
          <CustomSelect
            variant="boxed"
            name="hours"
            value={String(state.hours)}
            onChange={(v) => set('hours', Number(v))}
            options={hourOptions}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepBody}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{ru ? 'Выберите автомобиль' : 'Choose your vehicle'}</h2>
        <p className={styles.stepSubtitle}>
          {ru ? 'Все автомобили оснащены кожаным салоном, кондиционером и водой' : 'All vehicles have leather interior, A/C and bottled water'}
        </p>
      </div>
      {errors.vehicle && (
        <p className={styles.fieldError} style={{ marginBottom: 16 }}>{errors.vehicle}</p>
      )}
      <VehicleSelector
        serviceType={state.serviceType === 'route' ? 'intercity' : (state.serviceType as 'airport' | 'hourly')}
        variant="wide"
        hideLabel
        value={state.vehicleId}
        airportCode={state.serviceType === 'airport' ? state.airport : undefined}
        onChange={(id, name, _price, maxP) => {
          setState((prev) => ({
            ...prev,
            vehicleId: id,
            vehicleName: name,
            vehicleMaxPassengers: maxP,
            passengers: clampPassengers(prev.passengers, maxP),
          }));
          setErrors((p) => ({ ...p, vehicle: undefined }));
        }}
      />
    </div>
  );

  const renderSummary = () => {
    if (!state.serviceType) return null;
    const airportInfo = AIRPORTS.find((a) => a.code === state.airport);
    const rows: { label: string; value: string }[] = [];

    if (state.serviceType === 'route') {
      rows.push({ label: ru ? 'Маршрут' : 'Route', value: `${state.from} → ${state.to}` });
      if (distanceKm) rows.push({ label: ru ? 'Расстояние' : 'Distance', value: `${distanceKm.toLocaleString('ru-RU')} км` });
    } else if (state.serviceType === 'airport') {
      rows.push({
        label: ru ? 'Аэропорт' : 'Airport',
        value: `${ru ? airportInfo?.ru : airportInfo?.en} (${state.airport})`,
      });
      rows.push({
        label: ru ? 'Тип' : 'Type',
        value: state.airportDirection === 'pickup'
          ? (ru ? 'Встреча' : 'Pickup')
          : (ru ? 'Проводы' : 'Drop-off'),
      });
      if (state.address) rows.push({ label: ru ? 'Адрес' : 'Address', value: state.address });
      if (state.flightNumber) rows.push({ label: ru ? 'Рейс' : 'Flight', value: state.flightNumber });
    } else if (state.serviceType === 'hourly') {
      if (state.pickupAddress) rows.push({ label: ru ? 'Адрес' : 'Address', value: state.pickupAddress });
      rows.push({ label: ru ? 'Длительность' : 'Duration', value: `${state.hours} ${ru ? 'ч' : 'h'}` });
    }

    if (state.date) rows.push({ label: ru ? 'Дата' : 'Date', value: new Date(state.date).toLocaleDateString(ru ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }) });
    if (state.time) rows.push({ label: ru ? 'Время' : 'Time', value: state.time });
    if (state.vehicleName) rows.push({ label: ru ? 'Автомобиль' : 'Vehicle', value: state.vehicleName });

    return (
      <div className={styles.summaryPanel}>
        <p className={styles.summaryTitle}>{ru ? 'Итог бронирования' : 'Booking summary'}</p>
        {rows.map((r) => (
          <div key={r.label} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{r.label}</span>
            <span className={styles.summaryValue}>{r.value}</span>
          </div>
        ))}
        {totalPrice !== null && (
          <div className={styles.summaryPriceRow}>
            <span className={styles.summaryLabel}>{ru ? 'Предварительно' : 'Estimated'}</span>
            <span className={styles.summaryPrice}>{formatBookingPrice(totalPrice)}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => {
    if (submitStatus === 'success') {
      return (
        <motion.div
          className={styles.successBlock}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>
            {ru ? 'Заявка принята!' : 'Request received!'}
          </h3>
          <p className={styles.successDesc}>
            {ru
              ? 'Мы свяжемся с вами в течение 30 минут для подтверждения деталей.'
              : 'We will contact you within 30 minutes to confirm the details.'}
          </p>
          <Link href={`/${locale}/account`} className={styles.btnNext} style={{ marginTop: 24, display: 'inline-flex', textDecoration: 'none' }}>
            {ru ? 'Мои бронирования' : 'My bookings'}
          </Link>
        </motion.div>
      );
    }

    return (
      <div className={styles.reviewLayout}>
        <div className={styles.contactSection}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>{ru ? 'Контактные данные' : 'Contact details'}</h2>
            <p className={styles.stepSubtitle}>
              {ru ? 'Проверьте данные и подтвердите бронирование' : 'Review and confirm your booking'}
            </p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Имя *' : 'Name *'}</label>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                value={state.name}
                onChange={(e) => { set('name', e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder={ru ? 'Ваше имя' : 'Your name'}
              />
              {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Телефон *' : 'Phone *'}</label>
              <PhoneInput
                value={state.phone}
                onChange={(v) => { set('phone', v); setErrors((p) => ({ ...p, phone: undefined })); }}
                onBlur={(v) => {
                  const err = getPhoneValidationError(v, locale);
                  if (err) setErrors((p) => ({ ...p, phone: err }));
                }}
                error={errors.phone}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={state.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {maxPassengers
                  ? (ru ? `Пассажиров (макс. ${maxPassengers})` : `Passengers (max ${maxPassengers})`)
                  : (ru ? 'Пассажиров' : 'Passengers')}
              </label>
              <CustomSelect
                variant="boxed"
                name="passengers"
                value={String(state.passengers)}
                disabled={!maxPassengers}
                onChange={(v) => set('passengers', clampPassengers(Number(v), maxPassengers))}
                options={getPassengerSelectOptions(maxPassengers, ru)}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>{ru ? 'Водитель' : 'Driver'}</label>
              <CustomSelect
                variant="boxed"
                name="driverPreference"
                value={state.driverPreference}
                onChange={(v) => set('driverPreference', v as DriverPreference)}
                options={getDriverPreferenceOptions(ru)}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>{ru ? 'Комментарий' : 'Notes'}</label>
              <textarea
                className={styles.textarea}
                value={state.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={ru ? 'Дополнительные пожелания...' : 'Additional requests...'}
                rows={3}
              />
            </div>
          </div>

          {submitStatus === 'error' && (
            <p className={styles.errorMsg}>
              {ru ? 'Ошибка отправки. Попробуйте ещё раз или позвоните нам.' : 'Submission error. Please try again or call us.'}
            </p>
          )}

          <motion.button
            type="button"
            className={styles.btnSubmit}
            onClick={handleSubmit}
            disabled={submitting}
            whileTap={{ scale: 0.98 }}
          >
            {submitting
              ? (ru ? 'Подождите...' : 'Please wait...')
              : totalPrice && totalPrice > 0
                ? (ru ? '💳 Перейти к оплате' : '💳 Proceed to payment')
                : (ru ? '✓ Подтвердить бронирование' : '✓ Confirm booking')}
          </motion.button>

          <p className={styles.priceNotice}>
            {totalPrice && totalPrice > 0
              ? (ru
                ? 'Вы будете перенаправлены на защищённую страницу оплаты ЮKassa.'
                : 'You will be redirected to the secure YooKassa payment page.')
              : (ru
                ? 'Цена будет подтверждена менеджером. Нажимая кнопку, вы соглашаетесь с условиями бронирования.'
                : 'Price will be confirmed by our manager. By clicking, you agree to the booking terms.')}
          </p>
        </div>

        <div className={styles.summaryWrap}>
          {renderSummary()}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (step === 1) return renderStep1();
    if (step === 2) {
      if (state.serviceType === 'route') return renderStep2Route();
      if (state.serviceType === 'airport') return renderStep2Airport();
      if (state.serviceType === 'hourly') return renderStep2Hourly();
    }
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return null;
  };

  const canGoNext =
    step === 1 ? !!state.serviceType
    : step === 3 ? true
    : true;

  const showNavButtons = !(step === 4 && submitStatus === 'success');
  const showNextBtn = step < 4;

  if (isLoading) {
    return (
      <div className={styles.wizard}>
        <div className={styles.container}>
          <div className={styles.wizardLoading}>
            <span className={styles.spinner} />
            <span>{ru ? 'Загрузка...' : 'Loading...'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.wizard}>
        <div className={styles.container}>
          <InlineAuth onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.container}>
        <StepIndicator currentStep={step} serviceType={state.serviceType} ru={ru} />

        <div className={styles.contentWrap}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.stepContent}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {showNavButtons && (
          <div className={styles.navRow}>
            {step > 1 && (
              <motion.button
                type="button"
                className={styles.btnBack}
                onClick={() => goTo((step - 1) as WizardStep)}
                whileTap={{ scale: 0.97 }}
              >
                ← {ru ? 'Назад' : 'Back'}
              </motion.button>
            )}
            {showNextBtn && (
              <motion.button
                type="button"
                className={styles.btnNext}
                onClick={handleNext}
                disabled={!canGoNext}
                whileTap={{ scale: 0.98 }}
              >
                {ru ? 'Далее' : 'Next'} →
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
