export const AIRPORT_MAP_LABELS: Record<string, { ru: string; en: string }> = {
  SVO: { ru: 'аэропорт Шереметьево, Москва', en: 'Sheremetyevo Airport, Moscow' },
  DME: { ru: 'аэропорт Домодедово, Москва', en: 'Domodedovo Airport, Moscow' },
  VKO: { ru: 'аэропорт Внуково, Москва', en: 'Vnukovo Airport, Moscow' },
};

export function getAirportMapLabel(code: string, ru: boolean): string {
  const entry = AIRPORT_MAP_LABELS[code];
  if (!entry) return code;
  return ru ? entry.ru : entry.en;
}

export function getAirportRoutePoints(params: {
  airportCode: string;
  address: string;
  serviceType: 'pickup' | 'dropoff';
  ru: boolean;
}): { from: string; to: string } | null {
  const address = params.address.trim();
  if (!address) return null;

  const airport = getAirportMapLabel(params.airportCode, params.ru);
  if (params.serviceType === 'pickup') {
    return { from: airport, to: address };
  }
  return { from: address, to: airport };
}

export function buildYandexRouteMapUrl(from: string, to: string, ru: boolean): string {
  return `https://yandex.ru/map-widget/v1/?rtext=${encodeURIComponent(from)}~${encodeURIComponent(to)}&rtt=auto&lang=${ru ? 'ru_RU' : 'en_RU'}`;
}
