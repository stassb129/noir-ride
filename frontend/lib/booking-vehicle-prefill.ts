export type BookingService = 'intercity' | 'airport' | 'hourly';

const SERVICE_PATHS: Record<BookingService, string> = {
  intercity: 'routes',
  airport: 'airport',
  hourly: 'hourly',
};

export function buildBookingUrl(
  locale: string,
  service: BookingService,
  vehicleId: number,
): string {
  return `/${locale}/${SERVICE_PATHS[service]}?vehicleId=${vehicleId}`;
}

export function parseVehicleIdParam(value: string | null | undefined): number | null {
  if (!value) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function getVehicleIdFromSearch(
  params: URLSearchParams | { get: (key: string) => string | null },
): number | null {
  return parseVehicleIdParam(params.get('vehicleId'));
}
