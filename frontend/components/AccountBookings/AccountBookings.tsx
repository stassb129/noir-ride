'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getToken } from '@/lib/user-auth';
import { formatBookingPrice } from '@/lib/booking-price';
import { createBookingPayment } from '@/lib/payment';
import {
  cancelUserBooking,
  getBookingDisplayStatus,
  isBookingCancellable,
  isBookingPayable,
} from '@/lib/bookings';
import styles from './AccountBookings.module.scss';

interface BookingBase {
  id: number;
  date: string;
  time: string;
  vehicleName?: string;
  passengers: number;
  price?: number | string | null;
  status: string;
  paymentStatus?: string | null;
  createdAt: string;
}

interface RouteBooking extends BookingBase {
  type: 'route';
  from: string;
  to: string;
  distanceKm?: number | null;
}

interface AirportBooking extends BookingBase {
  type: 'airport';
  serviceType: string;
  airport: string;
  address: string;
  flightNumber?: string;
}

interface HourlyBooking extends BookingBase {
  type: 'hourly';
  pickupAddress: string;
  hours: number;
}

type AnyBooking = RouteBooking | AirportBooking | HourlyBooking;

function StatusBadge({ booking, ru }: { booking: AnyBooking; ru: boolean }) {
  const display = getBookingDisplayStatus(booking, ru);
  return (
    <div className={styles.statusWrap}>
      <span className={`${styles.statusBadge} ${styles[display.tone] ?? ''}`}>
        {display.label}
      </span>
      {display.hint && <p className={styles.statusHint}>{display.hint}</p>}
    </div>
  );
}

function BookingCard({
  booking,
  ru,
  locale,
  onChanged,
}: {
  booking: AnyBooking;
  ru: boolean;
  locale: string;
  onChanged: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const canPay = isBookingPayable(booking);
  const canCancel = isBookingCancellable(booking);

  const routeLabel = (() => {
    if (booking.type === 'route') return `${booking.from} → ${booking.to}`;
    if (booking.type === 'airport') {
      const dir = booking.serviceType === 'pickup'
        ? (ru ? 'Встреча из аэропорта' : 'Airport pickup')
        : (ru ? 'Проводы в аэропорт' : 'Drop-off to airport');
      return `${booking.airport} — ${dir}`;
    }
    return booking.pickupAddress;
  })();

  const typeLabel = (() => {
    if (booking.type === 'route') return ru ? 'Межгород' : 'Intercity';
    if (booking.type === 'airport') return ru ? 'Аэропорт' : 'Airport';
    return ru ? `Почасовая · ${booking.hours}ч` : `Hourly · ${booking.hours}h`;
  })();

  const dateStr = new Date(booking.date).toLocaleDateString(ru ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handlePay = async () => {
    if (!canPay || paying) return;
    setPaying(true);
    setActionError(null);
    try {
      const url = await createBookingPayment({
        bookingId: booking.id,
        bookingType: booking.type,
        amount: Number(booking.price),
        locale,
      });
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!canCancel || cancelling) return;
    const confirmed = window.confirm(
      ru
        ? 'Отменить этот заказ? Это действие нельзя отменить.'
        : 'Cancel this booking? This cannot be undone.',
    );
    if (!confirmed) return;

    setCancelling(true);
    setActionError(null);
    try {
      await cancelUserBooking(booking.type, booking.id);
      onChanged();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setCancelling(false);
    }
  };

  return (
    <div className={`${styles.card} ${canPay ? styles.cardPayable : ''}`}>
      <div className={styles.cardMain}>
        <p className={styles.cardRoute}>{routeLabel}</p>
        <div className={styles.cardMeta}>
          <span>{typeLabel}</span>
          <span className={styles.cardMetaDot}>·</span>
          <span>{dateStr}, {booking.time}</span>
          {booking.vehicleName && (
            <>
              <span className={styles.cardMetaDot}>·</span>
              <span>{booking.vehicleName}</span>
            </>
          )}
        </div>
        {actionError && <p className={styles.payError}>{actionError}</p>}
      </div>
      <div className={styles.cardRight}>
        {booking.price && Number(booking.price) > 0 && (
          <span className={styles.price}>{formatBookingPrice(Number(booking.price))}</span>
        )}
        <StatusBadge booking={booking} ru={ru} />
        <div className={styles.cardActions}>
          {canPay && (
            <button
              type="button"
              className={styles.payBtn}
              onClick={handlePay}
              disabled={paying || cancelling}
            >
              {paying
                ? (ru ? 'Переход...' : 'Redirecting...')
                : (ru ? '💳 Оплатить' : '💳 Pay')}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={paying || cancelling}
            >
              {cancelling
                ? (ru ? 'Отмена...' : 'Cancelling...')
                : (ru ? 'Отменить' : 'Cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountBookings({ embedded = false }: { embedded?: boolean }) {
  const locale = useLocale();
  const ru = locale === 'ru';

  const [bookings, setBookings] = useState<{
    routes: RouteBooking[];
    airports: AirportBooking[];
    hourly: HourlyBooking[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = () => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }

    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setBookings(data))
      .catch(() => setError(ru ? 'Не удалось загрузить заказы' : 'Failed to load bookings'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [ru]);

  if (isLoading) return <p className={styles.loading}>{ru ? 'Загрузка заказов...' : 'Loading bookings...'}</p>;
  if (error) return <p className={styles.loadError}>{error}</p>;
  if (!bookings) return null;

  const all: AnyBooking[] = [
    ...bookings.routes,
    ...bookings.airports,
    ...bookings.hourly,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className={embedded ? styles.embedded : styles.section}>
      {embedded ? (
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>
            {ru ? 'Мои заказы' : 'My bookings'}
          </h3>
          {all.length > 0 && (
            <span className={styles.countBadge}>{all.length}</span>
          )}
        </div>
      ) : (
        <h3 className={styles.sectionTitle}>
          {ru ? 'Мои заказы' : 'My bookings'}
        </h3>
      )}

      {all.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.empty}>
            {ru ? 'У вас ещё нет заказов' : "You don't have any bookings yet"}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {all.map((b) => (
            <BookingCard
              key={`${b.type}-${b.id}`}
              booking={b}
              ru={ru}
              locale={locale}
              onChanged={loadBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
