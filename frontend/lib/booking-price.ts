import { getAirportPrice } from '@/lib/airport-pricing';

export function formatBookingPrice(price: number | null | undefined): string {
  if (price == null || Number(price) <= 0) return '—';
  return `${Math.round(Number(price)).toLocaleString('ru-RU')} ₽`;
}

export function calcHourlyPrice(
  hours: number,
  priceHourly: number | null | undefined,
): number | null {
  if (priceHourly == null || hours < 1) return null;
  return Math.round(Number(priceHourly) * hours);
}

export function calcAirportBookingPrice(
  priceAirport: number | null | undefined,
  airportCode?: string,
): number | null {
  return getAirportPrice(priceAirport, airportCode);
}
