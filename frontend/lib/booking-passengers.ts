/** Ограничить число пассажиров вместимостью автомобиля */
export function clampPassengers(value: number, maxSeats: number | null | undefined): number {
  const max = Math.max(1, Number(maxSeats) || 1);
  if (Number.isNaN(value) || value < 1) return 1;
  return Math.min(Math.floor(value), max);
}

export function parsePassengersInput(raw: string, maxSeats: number | null | undefined): number {
  if (raw.trim() === '') return 1;
  const n = Number(raw);
  return clampPassengers(n, maxSeats);
}

export function getPassengerSelectOptions(maxSeats: number | null | undefined, ru = true) {
  const max = Math.max(1, Number(maxSeats) || 1);
  return Array.from({ length: max }, (_, index) => {
    const count = index + 1;
    return {
      value: String(count),
      label: ru
        ? `${count} ${count === 1 ? 'пассажир' : count < 5 ? 'пассажира' : 'пассажиров'}`
        : `${count} ${count === 1 ? 'passenger' : 'passengers'}`,
    };
  });
}
