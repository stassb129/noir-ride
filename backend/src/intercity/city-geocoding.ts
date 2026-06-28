import { resolveCityName, pickBestCityMatch } from './city-names';
import { REGIONAL_CITIES } from './regional-cities';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');
}

function citiesMatch(a: string, b: string): boolean {
  return normalizeKey(a) === normalizeKey(b);
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

function pickBestRegionalMatch(query: string, candidates: string[]): string | null {
  const key = normalizeKey(query);
  if (!key || candidates.length === 0) return null;

  let best: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const candidateKey = normalizeKey(candidate);
    if (!candidateKey) continue;

    const distance = levenshtein(key, candidateKey);
    const threshold = key.length >= 5 ? 1 : 2;

    if (distance <= threshold && distance > 0 && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}

function extractCityLabel(item: Record<string, unknown>): string | null {
  const address = item.address as Record<string, string> | undefined;
  if (address?.city) return address.city;
  if (address?.town) return address.town;
  if (address?.village) return address.village;
  if (address?.municipality) return address.municipality;

  const name = typeof item.name === 'string' ? item.name : null;
  if (name) return name;

  const displayName = typeof item.display_name === 'string' ? item.display_name : null;
  return displayName?.split(',')[0]?.trim() ?? null;
}

async function searchNominatim(query: string): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(`${query}, Россия`);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1&countrycodes=ru,by`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'noir-ride-app/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json() as Record<string, unknown>[];
    return data
      .map((item) => extractCityLabel(item))
      .filter((name): name is string => Boolean(name));
  } catch {
    return [];
  }
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

  const regional = pickBestRegionalMatch(trimmed, REGIONAL_CITIES);
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
