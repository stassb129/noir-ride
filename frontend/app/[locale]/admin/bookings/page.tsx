'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import styles from './bookings.module.scss';

type BookingType = 'contacts' | 'routes' | 'airport' | 'hourly';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BaseBooking {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  createdAt: string;
  notes?: string;
}

interface Contact extends BaseBooking {
  source: string;
}

interface RouteBooking extends BaseBooking {
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleClass?: string;
  vehicleName?: string;
  passengers: number;
}

interface AirportBooking extends BaseBooking {
  serviceType: string;
  airport: string;
  address: string;
  date: string;
  time: string;
  flightNumber?: string;
  vehicleClass?: string;
  vehicleName?: string;
  passengers: number;
  luggage: number;
  meetSign?: boolean;
  meetSignText?: string | null;
}

interface HourlyBooking extends BaseBooking {
  pickupAddress: string;
  date: string;
  time: string;
  hours: number;
  vehicleClass?: string;
  vehicleName?: string;
  passengers: number;
}

type AnyBooking = Contact | RouteBooking | AirportBooking | HourlyBooking;
const FIXED_ROUTE_TIME = '09:00';

export default function AllBookingsPage() {
  const [bookingType, setBookingType] = useState<BookingType>('contacts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [bookings, setBookings] = useState<AnyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState<any>({});

  useEffect(() => {
    fetchBookings();
  }, [bookingType]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoints: Record<BookingType, string> = {
        contacts: '/contacts',
        routes: '/bookings/route',
        airport: '/bookings/airport',
        hourly: '/bookings/hourly'
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const endpoints: Record<BookingType, string> = {
        contacts: `/contacts/${id}`,
        routes: `/bookings/route/${id}`,
        airport: `/bookings/airport/${id}`,
        hourly: `/bookings/hourly/${id}`
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error('Failed to update');
      fetchBookings();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm('Удалить эту заявку?')) return;

    try {
      const endpoints: Record<BookingType, string> = {
        contacts: `/contacts/${id}`,
        routes: `/bookings/route/${id}`,
        airport: `/bookings/airport/${id}`,
        hourly: `/bookings/hourly/${id}`
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const createBooking = async () => {
    try {
      const endpoints: Record<BookingType, string> = {
        contacts: '/contacts',
        routes: '/bookings/route',
        airport: '/bookings/airport',
        hourly: '/bookings/hourly',
      };

      const defaultByType: Record<BookingType, any> = {
        contacts: {
          name: '',
          phone: '',
          source: 'admin',
          notes: '',
        },
        routes: {
          name: '',
          phone: '',
          email: '',
          from: 'Москва',
          to: 'Санкт-Петербург',
          date: '',
          time: FIXED_ROUTE_TIME,
          vehicleClass: 'business',
          passengers: 1,
          notes: '',
        },
        airport: {
          name: '',
          phone: '',
          email: '',
          serviceType: 'pickup',
          airport: 'SVO',
          address: '',
          date: '',
          time: '',
          flightNumber: '',
          vehicleClass: 'business',
          passengers: 1,
          luggage: 1,
          meetSign: false,
          meetSignText: '',
          notes: '',
        },
        hourly: {
          name: '',
          phone: '',
          email: '',
          pickupAddress: '',
          date: '',
          time: '',
          hours: 3,
          vehicleClass: 'business',
          passengers: 1,
          notes: '',
        },
      };

      const payload = { ...defaultByType[bookingType], ...createData };
      if (bookingType === 'contacts') {
        payload.source = payload.source || 'admin';
      }

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error('Failed to create');
      await fetchBookings();
      setCreating(false);
      setCreateData({});
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const getTypeLabel = (type: BookingType) => {
    const labels = {
      contacts: 'Заявки',
      routes: 'Маршруты',
      airport: 'Аэропорт',
      hourly: 'Почасовая'
    };
    return labels[type];
  };

  const getStatusCounts = () => {
    const counts = {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Все заявки</h1>
        
        <div className={styles.typeFilters}>
          <button
            className={bookingType === 'contacts' ? styles.active : ''}
            onClick={() => setBookingType('contacts')}
          >
            📞 Заявки
          </button>
          <button
            className={bookingType === 'routes' ? styles.active : ''}
            onClick={() => setBookingType('routes')}
          >
            🛣️ Маршруты
          </button>
          <button
            className={bookingType === 'airport' ? styles.active : ''}
            onClick={() => setBookingType('airport')}
          >
            ✈️ Аэропорт
          </button>
          <button
            className={bookingType === 'hourly' ? styles.active : ''}
            onClick={() => setBookingType('hourly')}
          >
            ⏱️ Почасовая
          </button>
        </div>

        <div className={styles.statusFilters}>
          <button
            className={statusFilter === 'all' ? styles.active : ''}
            onClick={() => setStatusFilter('all')}
          >
            Все ({counts.all})
          </button>
          <button
            className={statusFilter === 'pending' ? styles.active : ''}
            onClick={() => setStatusFilter('pending')}
          >
            Новые ({counts.pending})
          </button>
          <button
            className={statusFilter === 'confirmed' ? styles.active : ''}
            onClick={() => setStatusFilter('confirmed')}
          >
            Подтверждённые ({counts.confirmed})
          </button>
          <button
            className={statusFilter === 'completed' ? styles.active : ''}
            onClick={() => setStatusFilter('completed')}
          >
            Завершённые ({counts.completed})
          </button>
          {bookingType !== 'contacts' && (
            <button
              className={statusFilter === 'cancelled' ? styles.active : ''}
              onClick={() => setStatusFilter('cancelled')}
            >
              Отменённые ({counts.cancelled})
            </button>
          )}
        </div>

        <button
          className={creating ? styles.cancelBtn : styles.editBtn}
          onClick={() => {
            setCreating(!creating);
            setCreateData({});
          }}
        >
          {creating ? 'Отмена' : '+ Добавить запись'}
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : (
        <div className={styles.tableContainer}>
          {creating && (
            <div style={{ padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
                <input
                  placeholder="Имя"
                  value={createData.name || ''}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  className={styles.statusSelect}
                />
                <input
                  placeholder="Телефон"
                  value={createData.phone || ''}
                  onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
                  className={styles.statusSelect}
                />
                {bookingType !== 'contacts' ? (
                  <input
                    placeholder="Email"
                    value={createData.email || ''}
                    onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                    className={styles.statusSelect}
                  />
                ) : (
                  <input
                    placeholder="Источник"
                    value={createData.source || 'admin'}
                    onChange={(e) => setCreateData({ ...createData, source: e.target.value })}
                    className={styles.statusSelect}
                  />
                )}
                {bookingType === 'contacts' && (
                  <input
                    placeholder="Комментарий"
                    value={createData.notes || ''}
                    onChange={(e) => setCreateData({ ...createData, notes: e.target.value })}
                    className={styles.statusSelect}
                  />
                )}
              </div>

              {bookingType === 'routes' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
                  <input placeholder="Откуда" value={createData.from || ''} onChange={(e) => setCreateData({ ...createData, from: e.target.value })} className={styles.statusSelect} />
                  <input placeholder="Куда" value={createData.to || ''} onChange={(e) => setCreateData({ ...createData, to: e.target.value })} className={styles.statusSelect} />
                  <input type="date" value={createData.date || ''} onChange={(e) => setCreateData({ ...createData, date: e.target.value })} className={styles.statusSelect} />
                  <input type="number" min={1} placeholder="Пассажиры" value={createData.passengers || 1} onChange={(e) => setCreateData({ ...createData, passengers: Number(e.target.value) })} className={styles.statusSelect} />
                </div>
              )}

              {bookingType === 'airport' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
                  <CustomSelect
                    value={createData.serviceType || 'pickup'}
                    onChange={(value) => setCreateData({ ...createData, serviceType: value })}
                    options={[
                      { value: 'pickup', label: 'Встреча' },
                      { value: 'dropoff', label: 'Проводы' },
                    ]}
                    variant="boxed"
                  />
                  <CustomSelect
                    value={createData.airport || 'SVO'}
                    onChange={(value) => setCreateData({ ...createData, airport: value })}
                    options={[
                      { value: 'SVO', label: 'SVO' },
                      { value: 'DME', label: 'DME' },
                      { value: 'VKO', label: 'VKO' },
                    ]}
                    variant="boxed"
                  />
                  <input placeholder="Адрес" value={createData.address || ''} onChange={(e) => setCreateData({ ...createData, address: e.target.value })} className={styles.statusSelect} />
                  <input type="date" value={createData.date || ''} onChange={(e) => setCreateData({ ...createData, date: e.target.value })} className={styles.statusSelect} />
                  <input type="time" value={createData.time || ''} onChange={(e) => setCreateData({ ...createData, time: e.target.value })} className={styles.statusSelect} />
                  <input placeholder="Рейс *" value={createData.flightNumber || ''} onChange={(e) => setCreateData({ ...createData, flightNumber: e.target.value })} className={styles.statusSelect} required />
                </div>
              )}

              {bookingType === 'hourly' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
                  <input placeholder="Адрес подачи" value={createData.pickupAddress || ''} onChange={(e) => setCreateData({ ...createData, pickupAddress: e.target.value })} className={styles.statusSelect} />
                  <input type="date" value={createData.date || ''} onChange={(e) => setCreateData({ ...createData, date: e.target.value })} className={styles.statusSelect} />
                  <input type="time" value={createData.time || ''} onChange={(e) => setCreateData({ ...createData, time: e.target.value })} className={styles.statusSelect} />
                  <input type="number" min={1} placeholder="Часы" value={createData.hours || 3} onChange={(e) => setCreateData({ ...createData, hours: Number(e.target.value) })} className={styles.statusSelect} />
                  <input type="number" min={1} placeholder="Пассажиры" value={createData.passengers || 1} onChange={(e) => setCreateData({ ...createData, passengers: Number(e.target.value) })} className={styles.statusSelect} />
                </div>
              )}

              {bookingType !== 'contacts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  <input placeholder="Автомобиль (напр. MB E-Class 213)" value={createData.vehicleName || ''} onChange={(e) => setCreateData({ ...createData, vehicleName: e.target.value })} className={styles.statusSelect} />
                  {bookingType === 'airport' && (
                    <input type="number" min={0} placeholder="Багаж" value={createData.luggage || 1} onChange={(e) => setCreateData({ ...createData, luggage: Number(e.target.value) })} className={styles.statusSelect} />
                  )}
                  <input placeholder="Заметки" value={createData.notes || ''} onChange={(e) => setCreateData({ ...createData, notes: e.target.value })} className={styles.statusSelect} />
                </div>
              )}

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button className={styles.saveBtn} onClick={createBooking}>Создать</button>
                <button className={styles.cancelBtn} onClick={() => setCreating(false)}>Отмена</button>
              </div>
            </div>
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                {bookingType === 'contacts' && <th>Источник</th>}
                {bookingType === 'routes' && <th>Маршрут</th>}
                {bookingType === 'routes' && <th>Дата/Время</th>}
                {bookingType === 'routes' && <th>Автомобиль</th>}
                {bookingType === 'routes' && <th>Пасс.</th>}
                {bookingType === 'airport' && <th>Тип/Аэропорт</th>}
                {bookingType === 'airport' && <th>Адрес</th>}
                {bookingType === 'airport' && <th>Дата/Время</th>}
                {bookingType === 'airport' && <th>Рейс</th>}
                {bookingType === 'airport' && <th>Табличка</th>}
                {bookingType === 'hourly' && <th>Адрес подачи</th>}
                {bookingType === 'hourly' && <th>Дата/Время</th>}
                {bookingType === 'hourly' && <th>Часов</th>}
                <th>Статус</th>
                <th>Создано</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientName}>{booking.name}</div>
                      <div className={styles.clientContact}>{booking.phone}</div>
                      {booking.email && <div className={styles.clientContact}>{booking.email}</div>}
                    </div>
                  </td>
                  
                  {bookingType === 'contacts' && (
                    <td>{(booking as Contact).source}</td>
                  )}
                  
                  {bookingType === 'routes' && (
                    <>
                      <td>
                        <strong>{(booking as RouteBooking).from}</strong> → <strong>{(booking as RouteBooking).to}</strong>
                      </td>
                      <td>
                        {(booking as RouteBooking).date}<br />{(booking as RouteBooking).time}
                      </td>
                      <td>{(booking as RouteBooking).vehicleName || (booking as RouteBooking).vehicleClass || '—'}</td>
                      <td>{(booking as RouteBooking).passengers}</td>
                    </>
                  )}
                  
                  {bookingType === 'airport' && (
                    <>
                      <td>
                        <div>{(booking as AirportBooking).serviceType === 'pickup' ? 'Встреча' : 'Проводы'}</div>
                        <strong>{(booking as AirportBooking).airport}</strong>
                      </td>
                      <td>{(booking as AirportBooking).address}</td>
                      <td>
                        {(booking as AirportBooking).date}<br />{(booking as AirportBooking).time}
                      </td>
                      <td>{(booking as AirportBooking).flightNumber || '—'}</td>
                      <td>
                        {(booking as AirportBooking).meetSign
                          ? ((booking as AirportBooking).meetSignText || '—')
                          : '—'}
                      </td>
                    </>
                  )}
                  
                  {bookingType === 'hourly' && (
                    <>
                      <td>{(booking as HourlyBooking).pickupAddress}</td>
                      <td>
                        {(booking as HourlyBooking).date}<br />{(booking as HourlyBooking).time}
                      </td>
                      <td><strong>{(booking as HourlyBooking).hours}ч</strong></td>
                    </>
                  )}
                  
                  <td>
                    {editingId === booking.id ? (
                      <CustomSelect
                        value={editStatus}
                        onChange={setEditStatus}
                        options={[
                          { value: 'pending', label: 'Новая' },
                          ...(bookingType !== 'contacts'
                            ? [
                                { value: 'confirmed', label: 'Подтверждена' },
                                { value: 'completed', label: 'Завершена' },
                                { value: 'cancelled', label: 'Отменена' },
                              ]
                            : [{ value: 'contacted', label: 'Связались' }]),
                        ]}
                        variant="boxed"
                      />
                    ) : (
                      <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                        {booking.status}
                      </span>
                    )}
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      {editingId === booking.id ? (
                        <>
                          <button
                            className={styles.saveBtn}
                            onClick={() => updateStatus(booking.id, editStatus)}
                          >
                            ✓
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.editBtn}
                            onClick={() => {
                              setEditingId(booking.id);
                              setEditStatus(booking.status);
                            }}
                          >
                            Изменить
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => deleteBooking(booking.id)}
                          >
                            Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <p className={styles.noData}>Нет заявок</p>
          )}
        </div>
      )}
    </div>
  );
}
