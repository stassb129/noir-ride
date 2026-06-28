import type { InterCityDestination } from '@/lib/api/intercity';
import { REGIONAL_CITIES } from '@/lib/regional-cities';

/** Популярные синонимы и сокращения → каноническое название */
export const CITY_ALIASES: Record<string, string> = {
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

export function collectKnownCities(destinations: InterCityDestination[]): string[] {
  const cities = new Set<string>();
  for (const d of destinations) {
    cities.add(d.from);
    cities.add(d.to);
  }
  return [...cities];
}

/** Каноническое название для расчёта маршрута */
export function resolveCityName(input: string, knownCities: string[]): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const key = normalizeKey(trimmed);

  const exact = knownCities.find((city) => normalizeKey(city) === key);
  if (exact) return exact;

  const alias = CITY_ALIASES[key];
  if (alias && knownCities.includes(alias)) return alias;

  let best: string | null = null;
  let bestDistance = Infinity;

  for (const city of knownCities) {
    const cityKey = normalizeKey(city);
    const distance = levenshtein(key, cityKey);
    const threshold = Math.max(2, Math.floor(cityKey.length / 5));

    if (distance <= threshold && distance < bestDistance) {
      bestDistance = distance;
      best = city;
    }
  }

  return best ?? trimmed;
}

/** Подсказка, если введённое название отличается от канонического */
export function getCitySuggestion(input: string, knownCities: string[]): string | null {
  const trimmed = input.trim();
  if (!trimmed || knownCities.length === 0) return null;

  const resolved = resolveCityName(trimmed, knownCities);
  if (normalizeKey(resolved) === normalizeKey(trimmed)) return null;
  if (!knownCities.includes(resolved)) return null;

  return resolved;
}

export function citiesMatch(a: string, b: string): boolean {
  return normalizeKey(a) === normalizeKey(b);
}

/** Кандидаты на опечатку (без показа — нужна проверка расстоянием) */
export function collectTypoCandidates(input: string, knownCities: string[] = []): string[] {
  const trimmed = input.trim();
  if (trimmed.length < 3) return [];

  const seen = new Set<string>();
  const add = (name: string | null) => {
    if (name && !citiesMatch(name, trimmed)) seen.add(name);
  };

  add(getRegionalCitySuggestion(trimmed, knownCities));

  return [...seen];
}

export function isAliasInput(input: string): boolean {
  return Boolean(CITY_ALIASES[normalizeKey(input.trim())]);
}

/** Город введён как существующий (известный, региональный или алиас) — не предлагать переименование */
export function isExistingCityInput(input: string, knownCities: string[] = []): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (knownCities.some((city) => citiesMatch(city, trimmed))) return true;
  if (REGIONAL_CITIES.some((city) => citiesMatch(city, trimmed))) return true;
  if (isAliasInput(trimmed)) return true;
  return false;
}

/** Региональный fuzzy — только для опечаток, не для известных городов */
export function getRegionalCitySuggestion(
  input: string,
  knownCities: string[] = [],
): string | null {
  const trimmed = input.trim();
  if (trimmed.length < 3) return null;

  if (knownCities.some((city) => citiesMatch(city, trimmed))) return null;
  if (REGIONAL_CITIES.some((city) => citiesMatch(city, trimmed))) return null;

  return pickBestRegionalMatch(trimmed, REGIONAL_CITIES);
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

/** Итоговое название после принятия подсказки (алиасы + совпадения) */
export function getEffectiveCityName(
  input: string,
  knownCities: string[],
): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return resolveCityName(trimmed, knownCities);
}

/**
 * Название для расчёта расстояния.
 * Алиасы (Питер → СПб) — сразу.
 * Fuzzy-подсказка (Калга → Калуга) — только после «Использовать».
 */
export function getCityForCalculation(
  input: string,
  knownCities: string[],
  pendingSuggestion: string | null,
): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const resolved = resolveCityName(trimmed, knownCities);
  if (!citiesMatch(resolved, trimmed) && knownCities.includes(resolved)) {
    return resolved;
  }
  if (knownCities.some((city) => citiesMatch(city, trimmed))) {
    return resolved;
  }

  if (pendingSuggestion && !citiesMatch(trimmed, pendingSuggestion)) {
    return trimmed;
  }

  return trimmed;
}

export function hasPendingSuggestion(input: string, suggestion: string | null): boolean {
  return Boolean(suggestion && !citiesMatch(input, suggestion));
}

export function pickBestCityMatch(query: string, candidates: string[]): string | null {
  const key = normalizeKey(query);
  if (!key || candidates.length === 0) return null;

  let best: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const candidateKey = normalizeKey(candidate);
    if (!candidateKey) continue;

    const distance = levenshtein(key, candidateKey);
    const threshold = Math.max(2, Math.floor(candidateKey.length / 4));

    if (distance <= threshold && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return bestDistance === 0 ? null : best;
}
