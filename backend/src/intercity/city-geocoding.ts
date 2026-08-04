import { resolveCityName, pickBestCityMatch } from './city-names';
import { REGIONAL_CITIES } from './regional-cities';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');
}

function citiesMatch(a: string, b: string): boolean {
  return normalizeKey(a) === normalizeKey(b);
}

type NominatimPlace = {
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  importance?: number;
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
};

const SETTLEMENT_TYPES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'borough',
]);

/** Бизнес работает по РФ и РБ, поэтому при близкой значимости выбираем местный город. */
const DOMESTIC_COUNTRIES = new Set(['ru', 'by']);
const DOMESTIC_BONUS = 0.12;

function isSettlement(item: NominatimPlace): boolean {
  if (item.class === 'place') return SETTLEMENT_TYPES.has(item.type ?? '');
  if (item.class === 'boundary') return item.type === 'administrative';
  return false;
}

function scorePlace(item: NominatimPlace): number {
  let score = item.importance ?? 0;

  const country = item.address?.country_code?.toLowerCase();
  if (country && DOMESTIC_COUNTRIES.has(country)) score += DOMESTIC_BONUS;

  // Точка населённого пункта точнее центроида административной границы.
  if (item.class === 'place') score += 0.01;

  return score;
}

function extractCityLabel(item: NominatimPlace): string | null {
  const address = item.address;
  if (address?.city) return address.city;
  if (address?.town) return address.town;
  if (address?.village) return address.village;
  if (address?.municipality) return address.municipality;

  if (item.name) return item.name;

  return item.display_name?.split(',')[0]?.trim() ?? null;
}

/**
 * Ищем населённые пункты без привязки к стране: запрос вида «Краков, Россия»
 * с countrycodes=ru,by находил мебельный магазин в Барнауле вместо города в Польше.
 */
async function queryNominatim(query: string): Promise<NominatimPlace[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=8&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'noir-ride-app/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];

    const data = await res.json() as NominatimPlace[];
    if (!Array.isArray(data)) return [];

    return data
      .filter(isSettlement)
      .sort((a, b) => scorePlace(b) - scorePlace(a));
  } catch {
    return [];
  }
}

/** Страны, по которым выполняются заказы. */
export const SERVICE_COUNTRIES = new Set(['ru', 'by']);

export function isServiceCountry(countryCode: string | null): boolean {
  return countryCode !== null && SERVICE_COUNTRIES.has(countryCode);
}

export type GeocodedCity = {
  lat: string;
  lon: string;
  countryCode: string | null;
};

/** Координаты города для построения маршрута. */
export async function geocodeCity(city: string): Promise<GeocodedCity | null> {
  const trimmed = city.trim();
  if (!trimmed) return null;

  const [best] = await queryNominatim(trimmed);
  if (!best?.lat || !best?.lon) return null;

  return {
    lat: best.lat,
    lon: best.lon,
    countryCode: best.address?.country_code?.toLowerCase() ?? null,
  };
}

async function searchNominatim(query: string): Promise<string[]> {
  const places = await queryNominatim(query);
  return places
    .map((item) => extractCityLabel(item))
    .filter((name): name is string => Boolean(name));
}

async function searchPhoton(query: string): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://photon.komoot.io/api/?q=${encoded}&lang=default&limit=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'noir-ride-app/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json() as {
      features?: Array<{ properties?: Record<string, string> }>;
    };

    return (data.features ?? [])
      .map((feature) => {
        const props = feature.properties ?? {};
        return props.city || props.name || props.locality || props.county || null;
      })
      .filter((name): name is string => Boolean(name));
  } catch {
    return [];
  }
}

export async function searchCityCandidates(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const [nominatim, photon] = await Promise.all([
    searchNominatim(trimmed),
    searchPhoton(trimmed),
  ]);

  const unique = new Set<string>();
  for (const name of [...nominatim, ...photon]) {
    if (name) unique.add(name);
  }
  return [...unique];
}

export async function suggestCityName(
  query: string,
  knownCities: string[],
): Promise<{ suggestion: string | null }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { suggestion: null };

  const localResolved = resolveCityName(trimmed, knownCities);
  if (
    normalizeKey(localResolved) !== normalizeKey(trimmed) &&
    knownCities.includes(localResolved)
  ) {
    return { suggestion: localResolved };
  }

  if (knownCities.some((city) => citiesMatch(city, trimmed))) {
    return { suggestion: null };
  }

  if (REGIONAL_CITIES.some((city) => citiesMatch(city, trimmed))) {
    return { suggestion: null };
  }

  const regional = pickBestCityMatch(trimmed, REGIONAL_CITIES);
  if (regional && normalizeKey(regional) !== normalizeKey(trimmed)) {
    return { suggestion: regional };
  }

  const candidates = await searchCityCandidates(trimmed);
  const best = pickBestCityMatch(trimmed, candidates);

  if (best && normalizeKey(best) !== normalizeKey(trimmed)) {
    return { suggestion: best };
  }

  return { suggestion: null };
}
