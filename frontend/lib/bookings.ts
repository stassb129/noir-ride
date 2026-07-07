import { getAuthHeaders, getToken } from '@/lib/user-auth';

export type BookingType = 'route' | 'airport' | 'hourly';

export interface UserBooking {
  id: number;
  status: string;
  paymentStatus?: string | null;
  price?: number | string | null;
  type: BookingType;
}

export function getBookingDisplayStatus(
  booking: Pick<UserBooking, 'status' | 'paymentStatus'>,
  ru: boolean,
): { label: string; hint?: string; tone: 'pending' | 'confirmed' | 'completed' | 'cancelled' } {
  if (booking.status === 'cancelled') {
    return { label: ru ? 'Отменена' : 'Cancelled', tone: 'cancelled' };
  }
  if (booking.status === 'completed') {
    return { label: ru ? 'Завершена' : 'Completed', tone: 'completed' };
  }
  if (booking.status === 'confirmed' || booking.paymentStatus === 'succeeded') {
    return { label: ru ? 'Подтверждена' : 'Confirmed', tone: 'confirmed' };
  }
  if (booking.status === 'pending') {
    if (booking.paymentStatus === 'canceled' || booking.paymentStatus === 'cancelled') {
      return {
        label: ru ? 'Оплата не завершена' : 'Payment not completed',
        hint: ru
          ? 'Срок оплаты истёк или платёж отменён — можно оплатить снова'
          : 'Payment expired or was cancelled — you can pay again',
        tone: 'pending',
      };
    }
    if (booking.paymentStatus === 'pending') {
      return {
        label: ru ? 'Ожидает оплаты' : 'Awaiting payment',
        hint: ru ? 'Завершите оплату в течение 15 минут' : 'Complete payment within 15 minutes',
        tone: 'pending',
      };
    }
    return {
      label: ru ? 'Ожидает оплаты' : 'Awaiting payment',
      tone: 'pending',
    };
  }
  return { label: booking.status, tone: 'pending' };
}

export function isBookingPayable(booking: Pick<UserBooking, 'status' | 'paymentStatus' | 'price'>): boolean {
  const price = Number(booking.price);
  if (!Number.isFinite(price) || price <= 0) return false;
  if (booking.status !== 'pending') return false;
  if (booking.paymentStatus === 'succeeded') return false;
  return true;
}

export function isBookingCancellable(booking: Pick<UserBooking, 'status' | 'paymentStatus'>): boolean {
  if (booking.status !== 'pending') return false;
  if (booking.paymentStatus === 'succeeded') return false;
  return true;
}

export async function cancelUserBooking(type: BookingType, id: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/bookings/${type}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let message = String(res.status);
    try {
      const body = await res.json() as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}
