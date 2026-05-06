import { Route, Vehicle } from '@/types';

export const ROUTES: Route[] = [
  {
    id: 'msc-spb',
    from: 'Moscow',
    to: 'Saint Petersburg',
    pricePerSeat: 10000,
    duration: 8,
    distance: 700
  },
  {
    id: 'spb-msc',
    from: 'Saint Petersburg',
    to: 'Moscow',
    pricePerSeat: 10000,
    duration: 8,
    distance: 700
  }
];

export const VEHICLES: Vehicle[] = [
  {
    id: 'business-1',
    name: 'Mercedes E-Class',
    class: 'business',
    capacity: 3,
    hourlyRate: 3000,
    airportRate: 4000
  },
  {
    id: 'premium-1',
    name: 'Mercedes S-Class',
    class: 'premium',
    capacity: 3,
    hourlyRate: 5000,
    airportRate: 6000
  },
  {
    id: 'luxury-1',
    name: 'Mercedes Maybach',
    class: 'luxury',
    capacity: 3,
    hourlyRate: 8000,
    airportRate: 10000
  }
];

export const AIRPORTS = [
  { code: 'SVO', name: 'Sheremetyevo', city: 'Moscow' },
  { code: 'DME', name: 'Domodedovo', city: 'Moscow' },
  { code: 'VKO', name: 'Vnukovo', city: 'Moscow' },
  { code: 'LED', name: 'Pulkovo', city: 'Saint Petersburg' }
];

export function calculateAirportPrice(
  airportCode: string,
  destination: string,
  vehicleClass: 'business' | 'premium' | 'luxury'
): number {
  const vehicle = VEHICLES.find(v => v.class === vehicleClass);
  if (!vehicle) return 0;
  
  return vehicle.airportRate;
}

export function calculateHourlyPrice(
  hours: number,
  vehicleClass: 'business' | 'premium' | 'luxury'
): number {
  const vehicle = VEHICLES.find(v => v.class === vehicleClass);
  if (!vehicle) return 0;
  
  const minimumHours = 3;
  const actualHours = Math.max(hours, minimumHours);
  
  return vehicle.hourlyRate * actualHours;
}

export function calculateIntercityPrice(
  routeId: string,
  passengers: number
): number {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return 0;
  
  return route.pricePerSeat * passengers;
}
