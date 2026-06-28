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
