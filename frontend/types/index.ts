export interface BookingRequest {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  serviceType: 'intercity' | 'airport' | 'hourly';
  vehicleClass?: 'business' | 'premium' | 'luxury';
  hours?: number;
  name?: string;
  phone?: string;
  email?: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  pricePerSeat: number;
  duration: number;
  distance: number;
}

export interface Vehicle {
  id: string;
  name: string;
  class: 'business' | 'premium' | 'luxury';
  capacity: number;
  hourlyRate: number;
  airportRate: number;
}

export interface Booking {
  id: string;
  userId?: string;
  bookingRequest: BookingRequest;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  createdAt: string;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  method: 'card' | 'cash' | 'transfer';
}
