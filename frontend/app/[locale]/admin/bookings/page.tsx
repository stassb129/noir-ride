'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { fetchWithAuth } from '@/lib/auth/api';
import styles from './bookings.module.scss';

interface Booking {
  id: string;
  serviceType: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime?: string;
  vehicleType: string;
  passengers: number;
  price: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const locale = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      const url = filterStatus === 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings?status=${filterStatus}`;
      
      const data = await fetchWithAuth(url);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(locale === 'ru' ? 'Ошибка обновления' : 'Error updating booking');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm(locale === 'ru' ? 'Удалить бронирование?' : 'Delete booking?')) {
      return;
    }

    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}`, {
        method: 'DELETE',
      });
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert(locale === 'ru' ? 'Ошибка удаления' : 'Error deleting booking');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    const map: any = {
      pending: { ru: 'В обработке', en: 'Pending' },
      confirmed: { ru: 'Подтверждено', en: 'Confirmed' },
      cancelled: { ru: 'Отменено', en: 'Cancelled' },
      completed: { ru: 'Завершено', en: 'Completed' },
    };
    return locale === 'ru' ? map[status]?.ru : map[status]?.en;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className={styles.bookingsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {locale === 'ru' ? 'Управление бронированиями' : 'Manage Bookings'}
        </h1>
        
        <div className={styles.filters}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{locale === 'ru' ? 'Все' : 'All'}</option>
            <option value="pending">{locale === 'ru' ? 'В обработке' : 'Pending'}</option>
            <option value="confirmed">{locale === 'ru' ? 'Подтверждено' : 'Confirmed'}</option>
            <option value="completed">{locale === 'ru' ? 'Завершено' : 'Completed'}</option>
            <option value="cancelled">{locale === 'ru' ? 'Отменено' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.empty}>
          {locale === 'ru' ? 'Бронирований не найдено' : 'No bookings found'}
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div className={styles.bookingRoute}>
                  <span className={styles.from}>{booking.from}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.to}>{booking.to}</span>
                </div>
                <div className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusText(booking.status)}
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Дата' : 'Date'}:
                  </span>
                  <span className={styles.detailValue}>
                    {new Date(booking.departureDate).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')}
                    {booking.departureTime && ` ${booking.departureTime}`}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Клиент' : 'Customer'}:
                  </span>
                  <span className={styles.detailValue}>
                    {booking.customerName}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{booking.customerEmail}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Телефон' : 'Phone'}:
                  </span>
                  <span className={styles.detailValue}>{booking.customerPhone}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Автомобиль' : 'Vehicle'}:
                  </span>
                  <span className={styles.detailValue}>{booking.vehicleType}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Пассажиры' : 'Passengers'}:
                  </span>
                  <span className={styles.detailValue}>{booking.passengers}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {locale === 'ru' ? 'Цена' : 'Price'}:
                  </span>
                  <span className={styles.price}>{booking.price.toLocaleString()}₽</span>
                </div>

                {booking.notes && (
                  <div className={styles.notes}>
                    <span className={styles.detailLabel}>
                      {locale === 'ru' ? 'Примечания' : 'Notes'}:
                    </span>
                    <p>{booking.notes}</p>
                  </div>
                )}
              </div>

              <div className={styles.bookingActions}>
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">{locale === 'ru' ? 'В обработке' : 'Pending'}</option>
                  <option value="confirmed">{locale === 'ru' ? 'Подтверждено' : 'Confirmed'}</option>
                  <option value="completed">{locale === 'ru' ? 'Завершено' : 'Completed'}</option>
                  <option value="cancelled">{locale === 'ru' ? 'Отменено' : 'Cancelled'}</option>
                </select>

                <button
                  onClick={() => deleteBooking(booking.id)}
                  className={styles.deleteButton}
                >
                  {locale === 'ru' ? 'Удалить' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
