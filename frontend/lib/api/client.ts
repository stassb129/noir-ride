const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface HourlyPricing {
  id: string;
  vehicleClass: string;
  vehicleName: string;
  pricePerHour: number;
  minimumHours: number;
  isActive: boolean;
}

export interface AirportPricing {
  id: string;
  airportCode: string;
  airportName: string;
  vehicleClass: string;
  vehicleName: string;
  price: number;
  direction: string;
  isActive: boolean;
}

export interface IntercityPricing {
  id: string;
  vehicleClass: string;
  vehicleName: string;
  pricePerKm: number;
  isActive: boolean;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  pricePerSeat: number;
  totalSeats: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  serviceType: 'intercity' | 'airport' | 'hourly';
  from: string;
  to: string;
  departureDate: string;
  departureTime?: string;
  vehicleType: string;
  passengers: number;
  price: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  routeId?: string;
}

export interface AvailableSeats {
  routeId: string;
  date: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

// API Functions
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Pricing
  async getHourlyPricing(): Promise<HourlyPricing[]> {
    return this.request('/pricing/hourly');
  }

  async getAirportPricing(airportCode?: string): Promise<AirportPricing[]> {
    const endpoint = airportCode ? `/pricing/airport/${airportCode}` : '/pricing/airport';
    return this.request(endpoint);
  }

  async getIntercityPricing(): Promise<IntercityPricing[]> {
    return this.request('/pricing/intercity');
  }

  // Routes
  async getAllRoutes(): Promise<Route[]> {
    return this.request('/bookings/routes');
  }

  async getAvailableSeats(routeId: string, date: string): Promise<AvailableSeats> {
    return this.request(`/bookings/availability?routeId=${routeId}&date=${date}`);
  }

  // Bookings
  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.request('/bookings');
  }

  async getBookingById(id: string): Promise<Booking> {
    return this.request(`/bookings/${id}`);
  }
}

export const apiClient = new ApiClient();
