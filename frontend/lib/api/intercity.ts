export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MAX_CUSTOM_DISTANCE_KM = 300;

export interface InterCityDestination {
  id: number;
  from: string;
  to: string;
  distanceKm: number;
  basePrice: number;
  isPredefined: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface DistanceResult {
  distanceKm: number;
  found: boolean;
}

export interface CitySuggestionResult {
  suggestion: string | null;
}

/** Подсказка корректного названия города */
export async function fetchCitySuggestion(query: string): Promise<CitySuggestionResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { suggestion: null };

  try {
    const res = await fetch(
      `${API_URL}/intercity/suggest-city?q=${encodeURIComponent(trimmed)}`,
    );
    if (!res.ok) return { suggestion: null };
    return await res.json();
  } catch {
    return { suggestion: null };
  }
}

/** Получить предустановленные направления */
export async function fetchDestinations(): Promise<InterCityDestination[]> {
  const res = await fetch(`${API_URL}/intercity/destinations`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Рассчитать расстояние между городами через бэкенд (OSRM/Nominatim) */
export async function fetchDistance(from: string, to: string): Promise<DistanceResult> {
  try {
    const res = await fetch(
      `${API_URL}/intercity/distance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    if (!res.ok) return { distanceKm: 0, found: false };
    return await res.json();
  } catch {
    return { distanceKm: 0, found: false };
  }
}

/** Рассчитать стоимость поездки (только pricePerKm × distanceKm) */
export function calcPrice(
  distanceKm: number,
  pricePerKm: number,
): number {
  return Math.round(pricePerKm * distanceKm);
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU') + ' ₽';
}

/** Уникальные города «откуда» из списка направлений */
export function getFromCities(destinations: InterCityDestination[]): string[] {
  return [...new Set(destinations.map((d) => d.from))].sort();
}

/** Получить направления из конкретного города */
export function getDestinationsFrom(
  destinations: InterCityDestination[],
  from: string,
): InterCityDestination[] {
  return destinations.filter((d) => d.from === from);
}
