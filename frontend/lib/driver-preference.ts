export type DriverPreference = 'male' | 'female' | 'any';

export const DEFAULT_DRIVER_PREFERENCE: DriverPreference = 'any';

export function getDriverPreferenceOptions(ru: boolean) {
  return [
    { value: 'any' as const, label: ru ? 'Без предпочтений' : 'No preference' },
    { value: 'male' as const, label: ru ? 'Мужчина' : 'Male driver' },
    { value: 'female' as const, label: ru ? 'Женщина' : 'Female driver' },
  ];
}

export function getDriverPreferenceLabel(
  value: string | null | undefined,
  ru = true,
): string {
  switch (value) {
    case 'male':
      return ru ? 'Мужчина' : 'Male';
    case 'female':
      return ru ? 'Женщина' : 'Female';
    default:
      return ru ? 'Без предпочтений' : 'No preference';
  }
}
