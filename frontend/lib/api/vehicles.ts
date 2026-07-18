export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ServiceType = 'airport' | 'intercity' | 'hourly';

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  photoUrl: string | null;
  photos: string[] | null;
  description: string | null;
  category: string | null;
  passengers: number;
  luggage: string | null;
  childSeat: boolean;
  priceAirport: number | null;
  priceIntercity: number | null;
  priceHourly: number | null;
  pricePerKm: number;
  isActive: boolean;
  sortOrder?: number;
}

export function resolveVehiclePhotoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const lastSlash = path.lastIndexOf('/');
  const dir = path.slice(0, lastSlash + 1);
  const file = path.slice(lastSlash + 1);
  return dir + encodeURIComponent(file);
}

/** Cover for cards/lists: prefers photoUrl (fleet studio shot), then first gallery photo. */
export function getVehicleCover(vehicle: Pick<Vehicle, 'photoUrl' | 'photos'>): string | null {
  if (vehicle.photoUrl?.trim()) {
    return resolveVehiclePhotoUrl(vehicle.photoUrl.trim());
  }
  return getVehiclePhotos(vehicle)[0] ?? null;
}

export function getVehiclePhotos(vehicle: Pick<Vehicle, 'photoUrl' | 'photos'>): string[] {
  const fromArray = Array.isArray(vehicle.photos)
    ? vehicle.photos.map((url) => url?.trim()).filter(Boolean)
    : [];
  const urls = fromArray.length > 0
    ? fromArray
    : vehicle.photoUrl?.trim()
      ? [vehicle.photoUrl.trim()]
      : [];

  return urls.map(resolveVehiclePhotoUrl);
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_URL}/vehicles`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Минимальный тариф ₽/км среди активного автопарка */
export function getMinPricePerKm(vehicles: Vehicle[]): number {
  const rates = vehicles
    .map((v) => Number(v.pricePerKm))
    .filter((n) => !Number.isNaN(n) && n > 0);
  return rates.length > 0 ? Math.min(...rates) : 100;
}
