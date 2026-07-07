import { getAuthHeaders } from '@/lib/user-auth';
import { isBookingPayable } from '@/lib/bookings';

export type BookingPaymentType = 'route' | 'airport' | 'hourly';

export { isBookingPayable };

export async function createBookingPayment(params: {
  bookingId: number;
  bookingType: BookingPaymentType;
  amount: number;
  locale?: string;
}): Promise<string> {
  const locale = params.locale ?? (typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'ru'
    : 'ru');

  const returnUrl = `${window.location.origin}/${locale}/booking/success?paymentId=__PAYMENT_ID__&bookingId=${params.bookingId}&bookingType=${params.bookingType}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      bookingId: params.bookingId,
      bookingType: params.bookingType,
      amount: params.amount,
      returnUrl,
    }),
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

  const { confirmationUrl } = await res.json() as { confirmationUrl: string };
  if (!confirmationUrl) throw new Error('No confirmation URL');
  return confirmationUrl;
}
