/** Ограничить число пассажиров вместимостью автомобиля */
export function clampPassengers(value: number, maxSeats: number): number {
  const max = Math.max(1, maxSeats);
  if (Number.isNaN(value) || value < 1) return 1;
  return Math.min(Math.floor(value), max);
}

export function parsePassengersInput(raw: string, maxSeats: number): number {
  if (raw.trim() === '') return 1;
  const n = Number(raw);
  return clampPassengers(n, maxSeats);
}
