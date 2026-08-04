import { REGIONAL_CITIES } from './regional-cities';

const CITY_ALIASES: Record<string, string> = {
  питер: 'Санкт-Петербург',
  spb: 'Санкт-Петербург',
  спб: 'Санкт-Петербург',
  'saint petersburg': 'Санкт-Петербург',
  'st petersburg': 'Санкт-Петербург',
  'st. petersburg': 'Санкт-Петербург',
  petersburg: 'Санкт-Петербург',
  leningrad: 'Санкт-Петербург',
  ленинград: 'Санкт-Петербург',
  'санкт пербург': 'Санкт-Петербург',
  мск: 'Москва',
  moscow: 'Москва',
  kazan: 'Казань',
  minsk: 'Минск',
  vladimir: 'Владимир',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');
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

/**
 * Порог опечатки. Строго ограничен: «Рязань» и «Казань» отличаются всего на две
 * замены, поэтому свободный порог в 2 приводил к подмене одного реального города
 * другим и к расчёту цены по чужому маршруту.
 */
function typoThreshold(length: number): number {
  if (length <= 4) return 0;
  if (length <= 9) return 1;
  return 2;
}

/** Разные города чаще отличаются первой буквой, чем опечатки внутри слова. */
function isTypoOf(key: string, cityKey: string): number | null {
  if (!key || !cityKey) return null;
  if (key[0] !== cityKey[0]) return null;

  const distance = levenshtein(key, cityKey);
  const threshold = typoThreshold(Math.max(key.length, cityKey.length));

  return distance <= threshold ? distance : null;
}

function findClosest(key: string, candidates: string[]): { match: string; distance: number } | null {
  let best: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = isTypoOf(key, normalizeKey(candidate));
    if (distance !== null && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best === null ? null : { match: best, distance: bestDistance };
}

export function resolveCityName(input: string, knownCities: string[]): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const key = normalizeKey(trimmed);

  const exact = knownCities.find((city) => normalizeKey(city) === key);
  if (exact) return exact;

  const alias = CITY_ALIASES[key];
  if (alias && knownCities.includes(alias)) return alias;

  // Существующий город не считаем опечаткой другого города.
  if (REGIONAL_CITIES.some((city) => normalizeKey(city) === key)) return trimmed;

  return findClosest(key, knownCities)?.match ?? trimmed;
}

export function pickBestCityMatch(query: string, candidates: string[]): string | null {
  const key = normalizeKey(query);
  if (!key || candidates.length === 0) return null;

  const closest = findClosest(key, candidates);
  if (!closest || closest.distance === 0) return null;

  return closest.match;
}
